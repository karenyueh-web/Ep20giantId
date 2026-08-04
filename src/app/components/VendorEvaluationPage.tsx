'use client';

/**
 * VendorEvaluationPage — 廠商評價
 *
 * TAB 1：交貨準時率
 *   - 公式：準時交貨數量 / 計算週期內的需交總量
 *   - 準時定義：國內廠商比較「到貨日」差異；國外廠商比較「交貨日」差異
 *   - 容許天數依採購組織（DTE/GEM/GHM）與廠商類型（國內/國外）不同
 *   - 點擊準時率百分比 → 彈窗顯示交貨準時率明細
 *
 * TAB 2：答交準時率
 *   - 公式：準時答交數量 / 區間訂購量
 *   - 準時定義：依廠別/貿易條件判斷；GTM/DTC 看 INCO1，GEM/GHM/DTE 看 IsForeign
 *   - 計算基準：下單日(add_date) 到 確認交期(agr_date_fst/agr_date) 的工作天數
 *   - 點擊準時率百分比 → 彈窗顯示答交準時率明細
 *
 * TAB 3：廠商評價表（建置中）
 *
 * 排程：每月 5 日上午 8 點自動計算
 */

import { useState, useMemo, useCallback } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { UpdateTimeLabel } from './UpdateTimeLabel';
import { BaseOverlay } from './BaseOverlay';

// ─────────────────────────────────────────────────────────────────────────────
// 型別定義
// ─────────────────────────────────────────────────────────────────────────────

type EvalTab = 'delivery-ontime' | 'arrival-ontime' | 'evaluation-sheet';

/** 交貨準時率清單列 */
interface DeliveryOntimeRow {
  id: number;
  vendorDisplay: string;  // 廠商名稱(編號)
  vendorCode: string;
  period: string;         // 計算週期，如 202506
  ontimeRate: string;     // 交貨準時率，如 "100%" / "80%"
  ontimeQty: number;      // 準時交貨數量
  totalQty: number;       // 區間應交貨量
}

/** 交貨準時率明細列 */
interface DeliveryDetailRow {
  id: number;
  orderDate: string;      // 訂單日期
  orderNo: string;        // 訂單號碼
  orderSeq: string;       // 訂單序號
  deliveryQty: number;    // 交貨量
  receiveQty: number;     // 收貨量
  ontimeDeliveryQty: number; // 準時交貨數量
  vendorCanDeliverDate: string; // 廠商可交貨日
  receiptDate: string;    // 收料日
  isOntime: '是' | '否';  // 是否準時
}

/** 答交準時率清單列 */
interface ArrivalOntimeRow {
  id: number;
  vendorDisplay: string;  // 廠商名稱(編號)
  vendorCode: string;
  period: string;         // 計算週期，如 202506
  ontimeRate: string;     // 答交準時率，如 "100%"
  ontimeQty: number;      // 準時答交數量
  totalQty: number;       // 區間訂購量（SUM of ord_qty）
  avgDaysDiff: number;    // 平均答交天數（工作天數差）
}

/** 答交準時率明細列 */
interface ArrivalDetailRow {
  id: number;
  orderDate: string;    // 下單日 (add_date)
  confirmDate: string;  // 確認交期 (agr_date_fst 優先 / agr_date 次之)
  orderNo: string;      // 訂單號碼
  orderSeq: string;     // 訂單序號
  ordQty: number;       // 訂單數量 (ord_qty)
  ontimeQty: number;    // 準時確認數量
  daysDiff: number;     // 工作天數差
  isOntime: '是' | '否';
}

/** 廠商評價表清單列 */
interface EvaluationSheetRow {
  id: number;
  purchaseOrg: string;
  vendorDisplay: string;
  vendorCode: string;
  period: string;
  totalScore: number;
  materialRate: string;
  qualityScore: number;
  qualityAbnormal: number;
  freeInspect: number;
  leadtimeScore: number;
  remark: string;
  deliveryScore: number;
  deliveryRate: string;
  arrivalScore: number;
  arrivalRate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 靜態選項
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'GTM', label: 'GTM' },
  { value: 'DTC', label: 'DTC' },
  { value: 'GEM', label: 'GEM' },
  { value: 'GHM', label: 'GHM' },
  { value: 'DTE', label: 'DTE' },
  { value: 'GVM', label: 'GVM' },
];

// 答交準時率廠別選項（依 MD 規格，無 GVM）
const ARRIVAL_COMPANY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'GTM', label: 'GTM' },
  { value: 'DTC', label: 'DTC' },
  { value: 'GEM', label: 'GEM' },
  { value: 'GHM', label: 'GHM' },
  { value: 'DTE', label: 'DTE' },
];

const PERIOD_OPTIONS = [
  { value: '月', label: '月' },
  { value: '季', label: '季' },
  { value: '年', label: '年' },
];

const IS_ONTIME_OPTIONS = [
  { value: '', label: '全部' },
  { value: '是', label: '是' },
  { value: '否', label: '否' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 共用工具：期間字串 → 日期範圍 label
// 支援三種格式：
//   月："202506"  → "2025/06/01-2025/06/30"
//   季："2025Q2" → "2025/04/01-2025/06/30"
//   年："2025"   → "2025/01/01-2025/12/31"
// ─────────────────────────────────────────────────────────────────────────────

function getPeriodDateRange(period: string): string {
  // 月：6 碼數字 YYYYMM
  if (/^\d{6}$/.test(period)) {
    const year  = parseInt(period.slice(0, 4));
    const month = parseInt(period.slice(4, 6));
    const lastDay = new Date(year, month, 0).getDate();
    const mm = String(month).padStart(2, '0');
    const dd = String(lastDay).padStart(2, '0');
    return `${year}/${mm}/01-${year}/${mm}/${dd}`;
  }
  // 季：YYYYQn
  const qMatch = period.match(/^(\d{4})Q([1-4])$/);
  if (qMatch) {
    const year      = qMatch[1];
    const q         = parseInt(qMatch[2]);
    const startMonth = (q - 1) * 3 + 1;
    const endMonth   = q * 3;
    const lastDay    = new Date(parseInt(year), endMonth, 0).getDate();
    const sm = String(startMonth).padStart(2, '0');
    const em = String(endMonth).padStart(2, '0');
    const dd = String(lastDay).padStart(2, '0');
    return `${year}/${sm}/01-${year}/${em}/${dd}`;
  }
  // 年：4 碼數字 YYYY
  if (/^\d{4}$/.test(period)) {
    return `${period}/01/01-${period}/12/31`;
  }
  return period;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料：交貨準時率清單（月 / 季 / 年）
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_DELIVERY_ROWS: DeliveryOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202506', ontimeRate: '100%', ontimeQty: 52,  totalQty: 52  },
  { id: 2,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202507', ontimeRate: '100%', ontimeQty: 100, totalQty: 100 },
  { id: 3,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202508', ontimeRate: '80%',  ontimeQty: 80,  totalQty: 100 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202506', ontimeRate: '95%',  ontimeQty: 95,  totalQty: 100 },
  { id: 5,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202507', ontimeRate: '88%',  ontimeQty: 44,  totalQty: 50  },
  { id: 6,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202508', ontimeRate: '100%', ontimeQty: 60,  totalQty: 60  },
  { id: 7,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202506', ontimeRate: '75%',  ontimeQty: 75,  totalQty: 100 },
  { id: 8,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202507', ontimeRate: '90%',  ontimeQty: 90,  totalQty: 100 },
  { id: 9,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202508', ontimeRate: '85%',  ontimeQty: 85,  totalQty: 100 },
  { id: 10, vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '202506', ontimeRate: '92%',  ontimeQty: 46,  totalQty: 50  },
  { id: 11, vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '202507', ontimeRate: '100%', ontimeQty: 200, totalQty: 200 },
];

const MOCK_DELIVERY_ROWS_QUARTER: DeliveryOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2025Q1', ontimeRate: '97%',  ontimeQty: 291, totalQty: 300 },
  { id: 2,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2025Q2', ontimeRate: '100%', ontimeQty: 232, totalQty: 232 },
  { id: 3,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2025Q1', ontimeRate: '88%',  ontimeQty: 220, totalQty: 250 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2025Q2', ontimeRate: '95%',  ontimeQty: 199, totalQty: 210 },
  { id: 5,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '2025Q1', ontimeRate: '80%',  ontimeQty: 240, totalQty: 300 },
  { id: 6,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '2025Q2', ontimeRate: '85%',  ontimeQty: 255, totalQty: 300 },
  { id: 7,  vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '2025Q1', ontimeRate: '92%',  ontimeQty: 184, totalQty: 200 },
  { id: 8,  vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '2025Q2', ontimeRate: '100%', ontimeQty: 246, totalQty: 246 },
];

const MOCK_DELIVERY_ROWS_YEAR: DeliveryOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2025', ontimeRate: '98%',  ontimeQty: 980, totalQty: 1000 },
  { id: 2,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2024', ontimeRate: '95%',  ontimeQty: 950, totalQty: 1000 },
  { id: 3,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2025', ontimeRate: '91%',  ontimeQty: 910, totalQty: 1000 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2024', ontimeRate: '87%',  ontimeQty: 870, totalQty: 1000 },
  { id: 5,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '2025', ontimeRate: '83%',  ontimeQty: 830, totalQty: 1000 },
  { id: 6,  vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '2025', ontimeRate: '96%',  ontimeQty: 960, totalQty: 1000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料：交貨準時率明細（依 row 帶不同資料）
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_DETAIL_MAP: Record<number, DeliveryDetailRow[]> = {
  1: [
    { id: 1, orderDate: '2025/06/25', orderNo: '5000273356', orderSeq: '10', deliveryQty: 50, receiveQty: 50, ontimeDeliveryQty: 50, vendorCanDeliverDate: '2025/06/25', receiptDate: '2025/07/01', isOntime: '是' },
    { id: 2, orderDate: '2025/06/25', orderNo: '5000273356', orderSeq: '10', deliveryQty: 63, receiveQty: 63, ontimeDeliveryQty: 63, vendorCanDeliverDate: '2025/06/25', receiptDate: '2025/07/01', isOntime: '是' },
  ],
  2: [
    { id: 1, orderDate: '2025/07/03', orderNo: '5000281100', orderSeq: '10', deliveryQty: 100, receiveQty: 100, ontimeDeliveryQty: 100, vendorCanDeliverDate: '2025/07/03', receiptDate: '2025/07/10', isOntime: '是' },
  ],
  3: [
    { id: 1, orderDate: '2025/08/01', orderNo: '5000289200', orderSeq: '10', deliveryQty: 50, receiveQty: 50, ontimeDeliveryQty: 50, vendorCanDeliverDate: '2025/08/01', receiptDate: '2025/08/05', isOntime: '是' },
    { id: 2, orderDate: '2025/08/10', orderNo: '5000289201', orderSeq: '20', deliveryQty: 50, receiveQty: 50, ontimeDeliveryQty: 30, vendorCanDeliverDate: '2025/08/08', receiptDate: '2025/08/15', isOntime: '否' },
  ],
  4: [
    { id: 1, orderDate: '2025/06/10', orderNo: '5000290100', orderSeq: '10', deliveryQty: 100, receiveQty: 100, ontimeDeliveryQty: 95, vendorCanDeliverDate: '2025/06/10', receiptDate: '2025/06/12', isOntime: '是' },
  ],
};

// 其他 rows 的 fallback 明細
const DEFAULT_DETAIL: DeliveryDetailRow[] = [
  { id: 1, orderDate: '2025/06/01', orderNo: '5000299999', orderSeq: '10', deliveryQty: 100, receiveQty: 100, ontimeDeliveryQty: 100, vendorCanDeliverDate: '2025/06/01', receiptDate: '2025/06/05', isOntime: '是' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料：答交準時率清單
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ARRIVAL_ROWS: ArrivalOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202506', ontimeRate: '100%', ontimeQty: 60,  totalQty: 60,  avgDaysDiff: 1 },
  { id: 2,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202507', ontimeRate: '100%', ontimeQty: 100, totalQty: 100, avgDaysDiff: 0 },
  { id: 3,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202508', ontimeRate: '80%',  ontimeQty: 80,  totalQty: 100, avgDaysDiff: 2 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202506', ontimeRate: '95%',  ontimeQty: 95,  totalQty: 100, avgDaysDiff: 1 },
  { id: 5,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202507', ontimeRate: '88%',  ontimeQty: 44,  totalQty: 50,  avgDaysDiff: 3 },
  { id: 6,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202508', ontimeRate: '100%', ontimeQty: 60,  totalQty: 60,  avgDaysDiff: 2 },
  { id: 7,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202506', ontimeRate: '75%',  ontimeQty: 75,  totalQty: 100, avgDaysDiff: 5 },
  { id: 8,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202507', ontimeRate: '90%',  ontimeQty: 90,  totalQty: 100, avgDaysDiff: 2 },
  { id: 9,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202508', ontimeRate: '85%',  ontimeQty: 85,  totalQty: 100, avgDaysDiff: 4 },
  { id: 10, vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '202506', ontimeRate: '92%',  ontimeQty: 46,  totalQty: 50,  avgDaysDiff: 1 },
  { id: 11, vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '202507', ontimeRate: '100%', ontimeQty: 200, totalQty: 200, avgDaysDiff: 0 },
];

const MOCK_ARRIVAL_ROWS_QUARTER: ArrivalOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2025Q1', ontimeRate: '96%',  ontimeQty: 288, totalQty: 300, avgDaysDiff: 1 },
  { id: 2,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2025Q2', ontimeRate: '100%', ontimeQty: 240, totalQty: 240, avgDaysDiff: 1 },
  { id: 3,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2025Q1', ontimeRate: '90%',  ontimeQty: 225, totalQty: 250, avgDaysDiff: 2 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2025Q2', ontimeRate: '93%',  ontimeQty: 195, totalQty: 210, avgDaysDiff: 3 },
  { id: 5,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '2025Q1', ontimeRate: '78%',  ontimeQty: 234, totalQty: 300, avgDaysDiff: 4 },
  { id: 6,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '2025Q2', ontimeRate: '83%',  ontimeQty: 249, totalQty: 300, avgDaysDiff: 5 },
  { id: 7,  vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '2025Q1', ontimeRate: '93%',  ontimeQty: 186, totalQty: 200, avgDaysDiff: 1 },
  { id: 8,  vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '2025Q2', ontimeRate: '100%', ontimeQty: 246, totalQty: 246, avgDaysDiff: 0 },
];

const MOCK_ARRIVAL_ROWS_YEAR: ArrivalOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2025', ontimeRate: '97%',  ontimeQty: 970,  totalQty: 1000, avgDaysDiff: 1 },
  { id: 2,  vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '2024', ontimeRate: '94%',  ontimeQty: 940,  totalQty: 1000, avgDaysDiff: 2 },
  { id: 3,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2025', ontimeRate: '90%',  ontimeQty: 900,  totalQty: 1000, avgDaysDiff: 2 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '2024', ontimeRate: '85%',  ontimeQty: 850,  totalQty: 1000, avgDaysDiff: 3 },
  { id: 5,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '2025', ontimeRate: '81%',  ontimeQty: 810,  totalQty: 1000, avgDaysDiff: 5 },
  { id: 6,  vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '2025', ontimeRate: '95%',  ontimeQty: 950,  totalQty: 1000, avgDaysDiff: 1 },
];

// Mock 資料：答交準時率明細
const MOCK_ARRIVAL_DETAIL_MAP: Record<number, ArrivalDetailRow[]> = {
  1: [
    { id: 1, orderDate: '2025/06/05', confirmDate: '2025/06/06', orderNo: '5000273356', orderSeq: '10', ordQty: 30, ontimeQty: 30, daysDiff: 1, isOntime: '是' },
    { id: 2, orderDate: '2025/06/10', confirmDate: '2025/06/11', orderNo: '5000273357', orderSeq: '10', ordQty: 30, ontimeQty: 30, daysDiff: 1, isOntime: '是' },
  ],
  3: [
    { id: 1, orderDate: '2025/08/01', confirmDate: '2025/08/02', orderNo: '5000289200', orderSeq: '10', ordQty: 50, ontimeQty: 50, daysDiff: 1, isOntime: '是' },
    { id: 2, orderDate: '2025/08/05', confirmDate: '2025/08/15', orderNo: '5000289201', orderSeq: '20', ordQty: 50, ontimeQty: 0,  daysDiff: 8, isOntime: '否' },
  ],
  5: [
    { id: 1, orderDate: '2025/07/01', confirmDate: '2025/07/04', orderNo: '5000281100', orderSeq: '10', ordQty: 30, ontimeQty: 30, daysDiff: 3, isOntime: '是' },
    { id: 2, orderDate: '2025/07/10', confirmDate: '2025/07/22', orderNo: '5000281101', orderSeq: '20', ordQty: 20, ontimeQty: 0,  daysDiff: 9, isOntime: '否' },
  ],
};

const DEFAULT_ARRIVAL_DETAIL: ArrivalDetailRow[] = [
  { id: 1, orderDate: '2025/06/01', confirmDate: '2025/06/02', orderNo: '5000299999', orderSeq: '10', ordQty: 100, ontimeQty: 100, daysDiff: 1, isOntime: '是' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料：廠商評價表
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_EVALUATION_ROWS: EvaluationSheetRow[] = [
  { id: 1,  purchaseOrg: '1101', vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202506', totalScore: 88, materialRate: '99.99%', qualityScore: 30, qualityAbnormal: 18, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 17, deliveryRate: '85.7%', arrivalScore: 13, arrivalRate: '91.2%' },
  { id: 2,  purchaseOrg: '1101', vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202507', totalScore: 95, materialRate: '99.99%', qualityScore: 30, qualityAbnormal: 20, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 20, deliveryRate: '100%',  arrivalScore: 15, arrivalRate: '100%'  },
  { id: 3,  purchaseOrg: '1101', vendorDisplay: '速聯(000100463)',      vendorCode: '000100463', period: '202508', totalScore: 72, materialRate: '99.99%', qualityScore: 30, qualityAbnormal: 10, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 19, deliveryRate: '85.7%', arrivalScore: 3,  arrivalRate: '68.4%' },
  { id: 4,  purchaseOrg: '1101', vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202506', totalScore: 80, materialRate: '99.94%', qualityScore: 25, qualityAbnormal: 15, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 18, deliveryRate: '95%',   arrivalScore: 12, arrivalRate: '85.0%' },
  { id: 5,  purchaseOrg: '1101', vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202507', totalScore: 75, materialRate: '99.90%', qualityScore: 22, qualityAbnormal: 13, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 16, deliveryRate: '88%',   arrivalScore: 14, arrivalRate: '93.0%' },
  { id: 6,  purchaseOrg: '1101', vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202508', totalScore: 90, materialRate: '99.99%', qualityScore: 30, qualityAbnormal: 20, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 20, deliveryRate: '100%',  arrivalScore: 10, arrivalRate: '78.0%' },
  { id: 7,  purchaseOrg: '1102', vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202506', totalScore: 68, materialRate: '99.70%', qualityScore: 20, qualityAbnormal: 8,  freeInspect: 5,  leadtimeScore: 0, remark: '', deliveryScore: 14, deliveryRate: '75%',   arrivalScore: 21, arrivalRate: '75.0%' },
  { id: 8,  purchaseOrg: '1102', vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202507', totalScore: 78, materialRate: '99.94%', qualityScore: 25, qualityAbnormal: 13, freeInspect: 5,  leadtimeScore: 0, remark: '', deliveryScore: 18, deliveryRate: '90%',   arrivalScore: 17, arrivalRate: '90.0%' },
  { id: 9,  purchaseOrg: '1102', vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202508', totalScore: 73, materialRate: '99.90%', qualityScore: 22, qualityAbnormal: 11, freeInspect: 5,  leadtimeScore: 0, remark: '', deliveryScore: 16, deliveryRate: '85%',   arrivalScore: 19, arrivalRate: '85.0%' },
  { id: 10, purchaseOrg: '1102', vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '202506', totalScore: 85, materialRate: '99.97%', qualityScore: 28, qualityAbnormal: 17, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 17, deliveryRate: '92%',   arrivalScore: 13, arrivalRate: '92.0%' },
  { id: 11, purchaseOrg: '1102', vendorDisplay: '台達電(000400055)',   vendorCode: '000400055', period: '202507', totalScore: 98, materialRate: '99.99%', qualityScore: 30, qualityAbnormal: 20, freeInspect: 10, leadtimeScore: 0, remark: '', deliveryScore: 20, deliveryRate: '100%',  arrivalScore: 18, arrivalRate: '100%'  },
];

const EVAL_SHEET_ORG_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1101', label: '1101' },
  { value: '1102', label: '1102' },
  { value: '1103', label: '1103' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 設定
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: EvalTab; label: string }[] = [
  { key: 'delivery-ontime', label: '交貨準時率' },
  { key: 'arrival-ontime',  label: '答交準時率' },
  { key: 'evaluation-sheet', label: '廠商評價表' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 交貨準時率明細彈窗
// ─────────────────────────────────────────────────────────────────────────────

interface DeliveryDetailDialogProps {
  row: DeliveryOntimeRow;
  onClose: () => void;
}

function DeliveryDetailDialog({ row, onClose }: DeliveryDetailDialogProps) {
  const [filterOrderNo, setFilterOrderNo]   = useState('');
  const [filterOrderSeq, setFilterOrderSeq] = useState('');
  const [filterIsOntime, setFilterIsOntime] = useState('是');

  const allDetails = MOCK_DETAIL_MAP[row.id] ?? DEFAULT_DETAIL;

  const filteredDetails = useMemo(() => {
    let data = allDetails;
    if (filterOrderNo.trim()) {
      const kw = filterOrderNo.trim().toLowerCase();
      data = data.filter(d => d.orderNo.toLowerCase().includes(kw));
    }
    if (filterOrderSeq.trim()) {
      const kw = filterOrderSeq.trim().toLowerCase();
      data = data.filter(d => d.orderSeq.toLowerCase().includes(kw));
    }
    if (filterIsOntime) {
      data = data.filter(d => d.isOntime === filterIsOntime);
    }
    return data;
  }, [allDetails, filterOrderNo, filterOrderSeq, filterIsOntime]);

  const detailColumns: StandardColumn<DeliveryDetailRow>[] = [
    { key: 'orderDate',           label: '訂單日期',      width: 120, minWidth: 100 },
    { key: 'orderNo',             label: '訂單號碼',      width: 130, minWidth: 110 },
    { key: 'orderSeq',            label: '訂單序號',      width: 100, minWidth: 80  },
    { key: 'deliveryQty',         label: '交貨量',        width: 90,  minWidth: 70  },
    { key: 'receiveQty',          label: '收貨量',        width: 90,  minWidth: 70  },
    { key: 'ontimeDeliveryQty',   label: '準時交貨數量',  width: 120, minWidth: 100 },
    { key: 'vendorCanDeliverDate',label: '廠商可交貨日',  width: 130, minWidth: 110 },
    { key: 'receiptDate',         label: '收料日',        width: 120, minWidth: 100 },
    {
      key: 'isOntime',
      label: '是否準時',
      width: 100,
      minWidth: 80,
      renderCell: (val) => (
        <span className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] ${val === '是' ? 'text-[#118d57]' : 'text-[#ff5630]'}`}>
          {val as string}
        </span>
      ),
    },
  ];

  // 標題子標題：廠商名 + 週期範圍
  // 使用 new Date(year, month, 0) 動態計算月底（等效 SQL: dateadd(day,-1, dateadd(m,...,0))），大小月/閏年自動正確
  // 標題子標題：廠商名 + 週期範圍（支援月/季/年三種格式）
  const periodLabel = getPeriodDateRange(row.period);

  return (
    <BaseOverlay onClose={onClose} maxWidth="1300px" maxHeight="760px">
      <div className="relative w-full h-full flex flex-col">

        {/* ── 頂部標題列 ── */}
        <div className="shrink-0 flex items-center gap-[16px] px-[24px] pt-[24px] pb-[16px] border-b border-[rgba(145,158,171,0.12)]">
          {/* 返回 / 關閉按鈕 */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 頁面標題 */}
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] leading-[28px] text-[#1c252e] shrink-0">
            交貨準時率明細
          </p>

          {/* 廠商名稱 Tag */}
          <div className="flex items-center gap-[8px] h-[28px] px-[10px] rounded-[6px] bg-[rgba(0,94,184,0.08)]">
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] leading-none whitespace-nowrap">
              {row.vendorDisplay}
            </span>
          </div>

          {/* 週期 Tag */}
          <div className="flex items-center gap-[8px] h-[28px] px-[10px] rounded-[6px] bg-[rgba(145,158,171,0.08)]">
            <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381] leading-none whitespace-nowrap">
              {periodLabel}
            </span>
          </div>

          {/* 右側篩選器 */}
          <div className="flex-1 flex items-center gap-[12px] justify-end">
            <div className="flex-1 min-w-0">
              <SearchField
                label="訂單號碼"
                value={filterOrderNo}
                onChange={setFilterOrderNo}
                type="search"
              />
            </div>
            <div className="flex-1 min-w-0">
              <SearchField
                label="訂單序號"
                value={filterOrderSeq}
                onChange={setFilterOrderSeq}
                type="search"
              />
            </div>
            <div className="flex-1 min-w-0">
              <DropdownSelect
                label="是否準時"
                value={filterIsOntime}
                onChange={setFilterIsOntime}
                options={IS_ONTIME_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* ── 表格（含 Toolbar：results count + Columns + Filters + Export） ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <StandardDataTable<DeliveryDetailRow>
            columns={detailColumns}
            data={filteredDetails}
            storageKey="delivery-ontime-detail-v1"
            showCheckbox={false}
            externalFilteredData={filteredDetails}
            onExportCsv={() => {}}
            className="rounded-none shadow-none"
          />
        </div>

      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 建置中佔位元件
// ─────────────────────────────────────────────────────────────────────────────

function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[16px] py-[80px]">
      <div className="flex items-center justify-center w-[64px] h-[64px] rounded-[16px] bg-[rgba(145,158,171,0.08)]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#919eab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] text-[#1c252e]">
        {title}
      </p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381]">
        此功能正在建置中，敬請期待。
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 交貨準時率 TAB 主內容
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryOntimeTab() {
  // ── 篩選 state ──────────────────────────────────────────────────────────
  const [filterCompany,    setFilterCompany]    = useState('GTM');
  const [filterDateFrom,   setFilterDateFrom]   = useState('');
  const [filterDateTo,     setFilterDateTo]     = useState('');
  const [filterPeriodType, setFilterPeriodType] = useState('月');
  const [filterVendor,     setFilterVendor]     = useState('');

  // ── 明細彈窗 state ──────────────────────────────────────────────────────
  const [detailRow, setDetailRow] = useState<DeliveryOntimeRow | null>(null);

  // ── 篩選邏輯 ────────────────────────────────────────────────────────────
  // 依計算週期切換基礎資料集
  const baseRows = useMemo(() => {
    switch (filterPeriodType) {
      case '季': return MOCK_DELIVERY_ROWS_QUARTER;
      case '年': return MOCK_DELIVERY_ROWS_YEAR;
      default:   return MOCK_DELIVERY_ROWS;  // '月'
    }
  }, [filterPeriodType]);

  const filteredRows = useMemo(() => {
    let data = baseRows;
    if (filterVendor.trim()) {
      // 支援逗號分隔多選廠商，各 token 以 OR 聯集比對廠商名稱或代碼
      const tokens = filterVendor
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      data = data.filter(r =>
        tokens.some(t =>
          r.vendorDisplay.toLowerCase().includes(t) ||
          r.vendorCode.toLowerCase().includes(t)
        )
      );
    }
    return data;
  }, [baseRows, filterVendor]);

  // ── 欄位定義 ────────────────────────────────────────────────────────────
  const columns: StandardColumn<DeliveryOntimeRow>[] = useMemo(() => [
    {
      key: 'vendorDisplay',
      label: '廠商（編號）',
      width: 200,
      minWidth: 150,
    },
    {
      key: 'period',
      label: '計算週期',
      width: 120,
      minWidth: 100,
    },
    {
      key: 'ontimeRate',
      label: '交貨準時率',
      width: 130,
      minWidth: 100,
      renderCell: (val, row) => (
        <button
          onClick={() => setDetailRow(row)}
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
        >
          {val as string}
        </button>
      ),
    },
    {
      key: 'ontimeQty',
      label: '準時交貨數量',
      width: 130,
      minWidth: 110,
    },
    {
      key: 'totalQty',
      label: '區間應交貨量',
      width: 130,
      minWidth: 110,
    },
  ], []);

  return (
    <>
      {/* ── 搜尋列 第一排（4 欄） ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] pt-[20px] pb-[12px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="下單公司"
            value={filterCompany}
            onChange={setFilterCompany}
            options={COMPANY_OPTIONS}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商可交貨日(起)"
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            type="date"
            allowPastDates
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商可交貨日(迄)"
            value={filterDateTo}
            onChange={setFilterDateTo}
            type="date"
            allowPastDates
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="計算週期"
            value={filterPeriodType}
            onChange={setFilterPeriodType}
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>

      {/* ── 搜尋列 第二排（廠商搜尋）── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] pb-[20px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商"
            value={filterVendor}
            onChange={setFilterVendor}
            type="search"
            placeholder="廠商名稱或代碼，多選請用逗號分隔"
          />
        </div>
      </div>

      {/* ── 表格 ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <StandardDataTable<DeliveryOntimeRow>
          columns={columns}
          data={filteredRows}
          storageKey="vendor-eval-delivery-ontime-v1"
          showCheckbox={false}
          externalFilteredData={filteredRows}
          onExportCsv={() => {}}
          className="rounded-none shadow-none"
          updateTime="2025/05/05 12:30"
          refreshInterval="每月5日一次"
        />
      </div>

      {/* ── 明細彈窗 ── */}
      {detailRow && (
        <DeliveryDetailDialog
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 答交準時率明細彈窗
// ─────────────────────────────────────────────────────────────────────────────

interface ArrivalDetailDialogProps {
  row: ArrivalOntimeRow;
  onClose: () => void;
}

function ArrivalDetailDialog({ row, onClose }: ArrivalDetailDialogProps) {
  const [filterOrderNo,  setFilterOrderNo]  = useState('');
  const [filterOrderSeq, setFilterOrderSeq] = useState('');

  const allDetails = MOCK_ARRIVAL_DETAIL_MAP[row.id] ?? DEFAULT_ARRIVAL_DETAIL;

  const filteredDetails = useMemo(() => {
    let data = allDetails;
    if (filterOrderNo.trim()) {
      const kw = filterOrderNo.trim().toLowerCase();
      data = data.filter(d => d.orderNo.toLowerCase().includes(kw));
    }
    if (filterOrderSeq.trim()) {
      const kw = filterOrderSeq.trim().toLowerCase();
      data = data.filter(d => d.orderSeq.toLowerCase().includes(kw));
    }
    return data;
  }, [allDetails, filterOrderNo, filterOrderSeq]);

  // 欄位順序依示意圖：訂單日期、同意日期、差異天數、訂單號碼、訂單序號、訂單數量、準時答交數量
  const detailColumns: StandardColumn<ArrivalDetailRow>[] = [
    { key: 'orderDate',   label: '訂單日期',     width: 120, minWidth: 100 },
    { key: 'confirmDate', label: '同意日期',     width: 120, minWidth: 100 },
    { key: 'daysDiff',   label: '差異天數',     width: 110, minWidth: 90  },
    { key: 'orderNo',     label: '訂單號碼',     width: 130, minWidth: 110 },
    { key: 'orderSeq',   label: '訂單序號',     width: 100, minWidth: 80  },
    { key: 'ordQty',     label: '訂單數量',     width: 100, minWidth: 80  },
    { key: 'ontimeQty',  label: '準時答交數量', width: 130, minWidth: 110 },
  ];

  // 期間標籤：支援月/季/年三種格式
  const periodLabel = getPeriodDateRange(row.period);

  return (
    <BaseOverlay onClose={onClose} maxWidth="1200px" maxHeight="760px">
      <div className="relative w-full h-full flex flex-col">

        {/* ── 頂部標題列 ── */}
        <div className="shrink-0 flex items-center gap-[16px] px-[24px] pt-[24px] pb-[16px] border-b border-[rgba(145,158,171,0.12)]">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] leading-[28px] text-[#1c252e] shrink-0">
            答交準時率明細
          </p>

          {/* 廠商名稱 Tag */}
          <div className="flex items-center gap-[8px] h-[28px] px-[10px] rounded-[6px] bg-[rgba(0,94,184,0.08)]">
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] leading-none whitespace-nowrap">
              {row.vendorDisplay}
            </span>
          </div>

          {/* 期間 Tag（與交貨準時率明細對齊） */}
          <div className="flex items-center gap-[8px] h-[28px] px-[10px] rounded-[6px] bg-[rgba(145,158,171,0.08)]">
            <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381] leading-none whitespace-nowrap">
              {periodLabel}
            </span>
          </div>

          {/* 右側篩選器：僅訂單號碼 + 訂單序號（無是否準時） */}
          <div className="flex-1 flex items-center gap-[12px] justify-end">
            <div className="flex-1 min-w-0" style={{ maxWidth: 200 }}>
              <SearchField label="訂單號碼" value={filterOrderNo} onChange={setFilterOrderNo} type="search" />
            </div>
            <div className="flex-1 min-w-0" style={{ maxWidth: 200 }}>
              <SearchField label="訂單序號" value={filterOrderSeq} onChange={setFilterOrderSeq} type="search" />
            </div>
          </div>
        </div>

        {/* ── 表格（含 Toolbar） ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <StandardDataTable<ArrivalDetailRow>
            columns={detailColumns}
            data={filteredDetails}
            storageKey="arrival-ontime-detail-v1"
            showCheckbox={false}
            externalFilteredData={filteredDetails}
            onExportCsv={() => {}}
            className="rounded-none shadow-none"
          />
        </div>

      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 答交準時率 TAB 主內容
// ─────────────────────────────────────────────────────────────────────────────

function ArrivalOntimeTab() {
  const [filterCompany,    setFilterCompany]    = useState('GTM');
  const [filterDateFrom,   setFilterDateFrom]   = useState('');
  const [filterDateTo,     setFilterDateTo]     = useState('');
  const [filterPeriodType, setFilterPeriodType] = useState('月');
  const [filterVendor,     setFilterVendor]     = useState('');
  const [detailRow, setDetailRow] = useState<ArrivalOntimeRow | null>(null);

  // 依計算週期切換基礎資料集
  const baseRows = useMemo(() => {
    switch (filterPeriodType) {
      case '季': return MOCK_ARRIVAL_ROWS_QUARTER;
      case '年': return MOCK_ARRIVAL_ROWS_YEAR;
      default:   return MOCK_ARRIVAL_ROWS;  // '月'
    }
  }, [filterPeriodType]);

  const filteredRows = useMemo(() => {
    let data = baseRows;
    if (filterVendor.trim()) {
      // 支援逗號分隔多選廠商，OR 聯集
      const tokens = filterVendor
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      data = data.filter(r =>
        tokens.some(t =>
          r.vendorDisplay.toLowerCase().includes(t) ||
          r.vendorCode.toLowerCase().includes(t)
        )
      );
    }
    return data;
  }, [baseRows, filterVendor]);

  const columns: StandardColumn<ArrivalOntimeRow>[] = useMemo(() => [
    { key: 'vendorDisplay', label: '廠商（編號）',   width: 200, minWidth: 150 },
    { key: 'period',        label: '計算週期',       width: 120, minWidth: 100 },
    {
      key: 'ontimeRate',
      label: '答交準時率',
      width: 130,
      minWidth: 100,
      renderCell: (val, row) => (
        <button
          onClick={() => setDetailRow(row)}
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
        >
          {val as string}
        </button>
      ),
    },
    { key: 'ontimeQty',   label: '準時答交數量', width: 130, minWidth: 110 },
    { key: 'totalQty',   label: '區間訂購量',   width: 120, minWidth: 100 },
    { key: 'avgDaysDiff', label: '平均答交天數', width: 130, minWidth: 110 },
  ], []);

  return (
    <>
      {/* ── 搜尋列 第一排（4 欄） ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] pt-[20px] pb-[12px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="下單公司"
            value={filterCompany}
            onChange={setFilterCompany}
            options={ARRIVAL_COMPANY_OPTIONS}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="下單日(起)"
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            type="date"
            allowPastDates
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="下單日(迄)"
            value={filterDateTo}
            onChange={setFilterDateTo}
            type="date"
            allowPastDates
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="計算週期"
            value={filterPeriodType}
            onChange={setFilterPeriodType}
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>

      {/* ── 搜尋列 第二排（廠商搜尋） ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] pb-[20px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商"
            value={filterVendor}
            onChange={setFilterVendor}
            type="search"
            placeholder="廠商名稱或代碼，多選請用逗號分隔"
          />
        </div>
      </div>

      {/* ── 表格 ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <StandardDataTable<ArrivalOntimeRow>
          columns={columns}
          data={filteredRows}
          storageKey="vendor-eval-arrival-ontime-v1"
          showCheckbox={false}
          externalFilteredData={filteredRows}
          onExportCsv={() => {}}
          className="rounded-none shadow-none"
          updateTime="2025/05/05 12:30"
          refreshInterval="每月5日一次"
        />
      </div>

      {/* ── 明細彈窗 ── */}
      {detailRow && (
        <ArrivalDetailDialog
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 廠商評價彈窗：共用欄位元件（必須定義在元件外部，避免 re-render 時重新建立）
// ─────────────────────────────────────────────────────────────────────────────

const evalInputCls = "flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] bg-transparent border-none outline-none";
const evalInputReadonlyCls = "flex-1 font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px] bg-transparent border-none outline-none";

function EvalEditableField({ value, onChange, inputMode }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <div className="flex-1 rounded-[8px] relative">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
        <input type="text" inputMode={inputMode ?? 'text'} value={value} onChange={onChange} className={evalInputCls} />
      </div>
    </div>
  );
}

function EvalReadonlyField({ value }: { value: string | number }) {
  return (
    <div className="flex-1 rounded-[8px] relative bg-[rgba(145,158,171,0.08)]">
      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.12)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex gap-[12px] items-center pl-[12px] pr-[8px] py-[6px] w-full">
        <span className={evalInputReadonlyCls}>{value}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 計分函式（廠商評價表）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 交貨準時率 → 得分（最高 25）
 * null / 空值 = 當月無交貨 → 依舊系統邏輯給滿分 25
 */
function calcDeliveryScore(rateStr: string | null | undefined): number {
  if (!rateStr || rateStr.trim() === '' || rateStr === '-') return 25;
  const r = parseFloat(rateStr.replace('%', ''));
  if (isNaN(r)) return 25;
  if (r >= 100)   return 25;
  if (r >= 95)    return 23;
  if (r >= 90)    return 21;
  if (r >= 85)    return 19;
  if (r >= 80)    return 17;
  if (r >= 75)    return 15;
  if (r >= 70)    return 13;
  if (r >= 65)    return 11;
  if (r >= 60)    return 9;
  if (r >= 55)    return 7;
  if (r >= 50)    return 5;
  if (r >= 45)    return 3;
  return 2;
}

/**
 * 預答交滿足率 → 得分（最高 10）
 * null / 空值 = 當月無下單 → 依舊系統邏輯給滿分 10
 */
function calcArrivalScore(rateStr: string | null | undefined): number {
  if (!rateStr || rateStr.trim() === '' || rateStr === '-') return 10;
  const r = parseFloat(rateStr.replace('%', ''));
  if (isNaN(r)) return 10;
  if (r >= 100) return 10;
  if (r >= 95)  return 9;
  if (r >= 90)  return 8;
  if (r >= 85)  return 7;
  if (r >= 80)  return 6;
  if (r >= 75)  return 5;
  if (r >= 70)  return 4;
  if (r >= 60)  return 3;
  return 2;
}

/**
 * 物料良品率 → 得分（最高 30）
 * 特殊值（對應舊系統 mat_yield_rateT）：
 *   null / ''（無收料也無退換貨）→ 視為 100%，給滿分 30
 *   '#NA'（有退換貨但無收料量）→ 無法計算，得 0 分
 */
function calcMaterialScore(rateStr: string | null | undefined): number {
  if (!rateStr || rateStr.trim() === '') return 30;
  if (rateStr === '#NA') return 0;
  const r = parseFloat(rateStr.replace('%', ''));
  if (isNaN(r) || r >= 99.99) return 30;
  if (r >= 99.97) return 28;
  if (r >= 99.94) return 26;
  if (r >= 99.90) return 24;
  if (r >= 99.70) return 22;
  if (r >= 99.50) return 20;
  if (r >= 99.30) return 18;
  if (r >= 99.00) return 16;
  if (r >= 96.00) return 14;
  if (r >= 85.00) return 12;
  return 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// 廠商評價分數彈窗
// ─────────────────────────────────────────────────────────────────────────────

interface EvaluationSheetDetailDialogProps {
  row: EvaluationSheetRow;
  onClose: () => void;
  onSave: (updated: EvaluationSheetRow) => void;
}

function EvaluationSheetDetailDialog({ row, onClose, onSave }: EvaluationSheetDetailDialogProps) {
  const [materialScore,   setMaterialScore]   = useState(String(row.qualityScore));
  const [qualityAbnormal, setQualityAbnormal] = useState(String(row.qualityAbnormal));
  const [freeInspect,     setFreeInspect]     = useState(String(row.freeInspect));
  const [leadtimeScore,   setLeadtimeScore]   = useState(String(row.leadtimeScore));
  const [remark,          setRemark]          = useState(row.remark);

  const autoDeliveryScore = calcDeliveryScore(row.deliveryRate);
  const autoArrivalScore  = calcArrivalScore(row.arrivalRate);

  // 即時合計總分（對應舊系統 vVend_Score.score_TTL）
  const liveTotal =
    (parseInt(materialScore)   || 0) +
    autoDeliveryScore +
    autoArrivalScore +
    (parseInt(qualityAbnormal) || 0) +
    (parseInt(freeInspect)     || 0) +
    (parseInt(leadtimeScore)   || 0);

  function handleNumericChange(val: string, setter: (v: string) => void) {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned === '') { setter(''); return; }
    setter(String(Math.min(100, Math.max(0, parseInt(cleaned, 10)))));
  }

  const labelCls = "font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap";

  return (
    <BaseOverlay onClose={onClose} maxWidth="560px" maxHeight="640px">
      <div className="relative w-full h-full">
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="#637381" fillRule="evenodd" />
          </svg>
        </button>

        <div className="flex flex-col h-full px-[50px] pt-[56px] pb-[32px] gap-[24px] overflow-y-auto custom-scrollbar">

          {/* Header */}
          <div className="flex items-center gap-[12px] shrink-0 flex-wrap">
            <div className="bg-[rgba(0,94,184,0.16)] h-[26px] min-w-[26px] rounded-[6px] flex items-center justify-center px-[6px]">
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[13px] text-center whitespace-nowrap text-[#005eb8]">{row.period}</p>
            </div>
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] leading-[28px] text-[#1c252e]">廠商評價分數</p>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">{row.vendorDisplay}</p>
            {/* 即時總分 */}
            <div className="ml-auto flex items-center gap-[8px]">
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">總分</p>
              <div className="flex items-center justify-center rounded-[10px] px-[14px] py-[4px] bg-[rgba(0,94,184,0.08)]">
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[20px] leading-none text-[#005eb8]">{liveTotal}</p>
              </div>
            </div>
          </div>

          {/* 欄位 */}
          <div className="flex flex-col gap-[12px]">

            {/* 物料良品率 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>物料良品率</p></div>
              <div className="w-[64px] shrink-0">
                {row.materialRate === '#NA' ? (
                  <span
                    title="有退換貨但無收料量，無法計算良品率"
                    className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#ff5630] text-[13px] cursor-help"
                  >
                    #NA ⚠
                  </span>
                ) : (
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px]">
                    {row.materialRate || '—'}
                  </p>
                )}
              </div>
              <EvalEditableField value={materialScore} onChange={e => handleNumericChange(e.target.value, setMaterialScore)} inputMode="numeric" />
            </div>

            {/* 交貨準時率 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>交貨準時率</p></div>
              <div className="w-[64px] shrink-0"><p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px]">{row.deliveryRate}</p></div>
              <EvalReadonlyField value={autoDeliveryScore} />
            </div>

            {/* 預答交滿足率 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>預答交滿足率</p></div>
              <div className="w-[64px] shrink-0"><p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px]">{row.arrivalRate}</p></div>
              <EvalReadonlyField value={autoArrivalScore} />
            </div>

            {/* 品質異常 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>品質異常</p></div>
              <div className="w-[64px] shrink-0" />
              <EvalEditableField value={qualityAbnormal} onChange={e => handleNumericChange(e.target.value, setQualityAbnormal)} inputMode="numeric" />
            </div>

            {/* 免檢 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>免檢</p></div>
              <div className="w-[64px] shrink-0" />
              <EvalEditableField value={freeInspect} onChange={e => handleNumericChange(e.target.value, setFreeInspect)} inputMode="numeric" />
            </div>

            {/* Leadtime > 6天 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>Leadtime &gt; 6天</p></div>
              <div className="w-[64px] shrink-0" />
              <EvalEditableField value={leadtimeScore} onChange={e => handleNumericChange(e.target.value, setLeadtimeScore)} inputMode="numeric" />
            </div>

            {/* 備註 */}
            <div className="flex gap-[10px] items-center">
              <div className="w-[110px] shrink-0"><p className={labelCls}>備註</p></div>
              <div className="w-[64px] shrink-0" />
              <EvalEditableField value={remark} onChange={e => setRemark(e.target.value)} />
            </div>

          </div>

          {/* 儲存按鈕 */}
          <button
            className="shrink-0 w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors mt-auto"
            style={{ backgroundColor: '#00559c' }}
            onClick={() => {
              onSave({
                ...row,
                qualityScore:    parseInt(materialScore)   || 0,
                qualityAbnormal: parseInt(qualityAbnormal) || 0,
                freeInspect:     parseInt(freeInspect)     || 0,
                leadtimeScore:   parseInt(leadtimeScore)   || 0,
                deliveryScore:   autoDeliveryScore,
                arrivalScore:    autoArrivalScore,
                totalScore:      liveTotal,
                remark,
              });
              onClose();
            }}
          >
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">儲存</p>
          </button>

        </div>
      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 廠商評價表 TAB
// ─────────────────────────────────────────────────────────────────────────────

function EvaluationSheetTab() {
  const [orgFilter,    setOrgFilter]    = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [detailRow,    setDetailRow]    = useState<EvaluationSheetRow | null>(null);
  const [rows,         setRows]         = useState<EvaluationSheetRow[]>(MOCK_EVALUATION_ROWS);

  function handleSave(updated: EvaluationSheetRow) {
    setRows(prev => prev.map(r => r.id === updated.id ? updated : r));
  }

  const filtered = rows.filter(r => {
    if (orgFilter    && r.purchaseOrg   !== orgFilter)                              return false;
    if (vendorFilter && !r.vendorDisplay.toLowerCase().includes(vendorFilter.toLowerCase())) return false;
    if (periodFilter && !r.period.includes(periodFilter))                           return false;
    return true;
  });

  const columns: StandardColumn<EvaluationSheetRow>[] = [
    { key: 'purchaseOrg',    label: '採購組織', width: 100, minWidth: 80 },
    { key: 'vendorDisplay',  label: '廠商',     width: 200, minWidth: 120 },
    {
      key: 'period', label: '期別', width: 120, minWidth: 90,
      renderCell: (_val, row) => (
        <button
          onClick={() => setDetailRow(row)}
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
        >
          {row.period}
        </button>
      ),
    },
    { key: 'totalScore',      label: '總分',             width: 80,  minWidth: 60 },
    { key: 'materialRate',    label: '物料良品率',       width: 110, minWidth: 90 },
    { key: 'qualityScore',    label: '物料良品分數',     width: 110, minWidth: 90 },
    { key: 'deliveryRate',    label: '交貨準時率',       width: 110, minWidth: 90 },
    { key: 'deliveryScore',   label: '交貨準時分數',     width: 110, minWidth: 90 },
    { key: 'arrivalRate',     label: '預答交滿足率',     width: 110, minWidth: 90 },
    { key: 'arrivalScore',    label: '預答交分數',       width: 110, minWidth: 90 },
    { key: 'qualityAbnormal', label: '品質異常分數',     width: 110, minWidth: 90 },
    { key: 'freeInspect',     label: '免驗率分數',       width: 110, minWidth: 90 },
    {
      key: 'leadtimeScore',
      label: 'Leadtime>6天分數',
      width: 130,
      minWidth: 110,
      renderCell: (val) => (
        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
          {val as number}
        </span>
      ),
    },
    {
      key: 'remark',
      label: '備註',
      width: 160,
      minWidth: 120,
      renderCell: (val) => (
        <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1c252e]">
          {(val as string) || '—'}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect label="採購組織" value={orgFilter} onChange={setOrgFilter} options={EVAL_SHEET_ORG_OPTIONS} />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="廠商" value={vendorFilter} onChange={setVendorFilter} />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="期別" value={periodFilter} onChange={setPeriodFilter} />
        </div>
      </div>

      {/* 表格 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<EvaluationSheetRow>
          columns={columns}
          data={filtered}
          storageKey="vendor-eval-sheet-v1"
          showCheckbox={false}
          className="rounded-none shadow-none"
        />
      </div>

      {detailRow && (
        <EvaluationSheetDetailDialog
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 主頁面元件
// ─────────────────────────────────────────────────────────────────────────────

export function VendorEvaluationPage() {
  const [activeTab, setActiveTab] = useState<EvalTab>('delivery-ontime');

  const handleTabChange = useCallback((tab: EvalTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── TAB 列 ── */}
      <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
          >
            {activeTab === tab.key && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
              activeTab === tab.key ? 'text-[#1c252e]' : 'text-[#637381]'
            }`}>
              {tab.label}
            </p>
          </div>
        ))}
        {/* 底部共用灰色底線 */}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* ── TAB 內容 ── */}
      {activeTab === 'delivery-ontime' && <DeliveryOntimeTab />}

      {activeTab === 'arrival-ontime' && <ArrivalOntimeTab />}

      {activeTab === 'evaluation-sheet' && <EvaluationSheetTab />}

    </div>
  );
}

export default VendorEvaluationPage;
