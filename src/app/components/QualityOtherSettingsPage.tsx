/**
 * QualityOtherSettingsPage — 品保作業 • 其他設定
 *
 * 三個 Tab 分頁：
 *  1. 入廠需檢驗的物料
 *  2. 需付檢測報告的物料群組
 *  3. 危害物質法規維護
 *
 * 使用標準表格系統（StandardDataTable）
 */

import { localDateToDisplay } from '../utils/dateTime';
import React, { useState, useMemo, useRef } from 'react';
import { QUALITY_OTHER_TABS, type QualityOtherTabKey } from '@/app/config/qualityOtherConfig';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { DeleteButton } from './ActionButtons';
import { PaginationControls } from './PaginationControls';

import { BaseOverlay } from './BaseOverlay';
import { ToggleSwitch } from './ToggleSwitch';
import { OrderHistory } from './OrderHistory';
import type { HistoryEntry } from './OrderStoreContext';



// ─────────────────────────────────────────────────────────────────────────────
// 共用 CSV 匯出工具
// ─────────────────────────────────────────────────────────────────────────────
function exportRowsToCsv<T>(
  rows: T[],
  filename: string,
  fields: { key: keyof T & string; label: string }[]
) {
  const header = fields.map(f => `"${f.label}"`).join(',');
  const body = rows.map(row =>
    fields.map(f => `"${String((row[f.key] as unknown) ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csv = `\uFEFF${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// 型別定義
// ─────────────────────────────────────────────────────────────────────────────

/** Tab1：入廠需檢驗的物料 */
interface IncomingInspectionRow {
  id: number;
  factory: string;           // 工廠
  vendor: string;            // 廠商
  partNo: string;            // 料號
  longSpec: string;          // 長規格描述
  updatedInfo: string;       // 最後修改資訊
  _action?: never;           // 虛擬欄，供刪除按鈕欄位使用
}

/** Tab2：需付檢測報告的物料群組 */
interface MaterialGroupReportRow {
  id: number;
  factory: string;           // 工廠
  materialGroup: string;     // 物料群組
  descZh: string;            // 物料群組說明
  descEn: string;            // 物料群組說明2
  needInspReport: boolean;   // 需繳交檢驗報告
  needFuncReport: boolean;   // 需繳交功能測試報告
}

/** Tab2 排除料號 */
interface ExcludedPartRow {
  id: number;
  factory: string;           // 工廠
  partNo: string;            // 料號
  updatedInfo: string;       // 最後修改資訊
}

/** Tab3：危害物質法規維護 */
interface HazardRegRow {
  id: number;
  regCode: string;           // 法規代號
  enabled: boolean;          // 啟用
  descZh: string;            // 法規說明
  descEn: string;            // 法規說明(En)
  regMaker: string;          // 法規制定者
  regScope: string;          // 法規管理範圍
  remark: string;            // 備註
  createdInfo: string;       // 建檔資訊
}


type ActiveTab = QualityOtherTabKey;

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料
// ─────────────────────────────────────────────────────────────────────────────

export const INCOMING_INSPECTION_DATA: IncomingInspectionRow[] = [
  // ── 協立 0001003621 ─────────────────────────────────────────────────────────
  { id:  1, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-001', longSpec: 'XCE26 SOFT COIL 27.5" 90 1.125 265 AL PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  2, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-002', longSpec: 'XCE26 SOFT COIL 27.5" 90 1.125 265 AL PM 9 100 W/O RMT A/L OOD CROWN&LEG: YS 727 MATTE W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  3, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-003', longSpec: 'XCE26 SOFT COIL 29" 100 1.125 265 PM 9 100 W/O RMT A/L OOD CROWN&LEG: YS 727 MATTE W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  4, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-004', longSpec: 'XCE26 SOFT COIL 29" 100 1.125 265 PM 9 100 W/O RMT W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  5, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-005', longSpec: 'XCE26 SOFT COIL 27.5" 90 1.125 265 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  6, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-006', longSpec: 'XCE26 STD COIL 27.5" 90 1.125 265 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  7, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-007', longSpec: 'XCE26 STD COIL 27.5" 100 1.125 265 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  8, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-008', longSpec: 'XCE26 STD COIL 29" 100 1.125 260 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  9, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMHD80-009', longSpec: 'XCM HARD COIL 29" 100 1.125 265 POST MOUNT 9 100 WITHOUT REMOTE ALLOY OOD CROWN&LEG: YS 727 MATTE W/YS 728', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 10, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMSD0-001', longSpec: 'XCM DS COIL HARD 29" 100 1.125 265 STEEL 46 PM 160 9 100 W/O RMT W/O LOCKOUT AL STD OOD BLK M BLK DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 11, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMSD0-002', longSpec: 'XCM DS COIL STD 29" 100 1.125 265 STEEL 46 PM 160 9 100 W/O RMT W/O LOCKOUT AL STD M BLK M BLK DECAL MY21 TALON 3-GE', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 12, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMSD0-003', longSpec: 'SF20 XCM DS COIL SOFT 27.5" 060 80 1.125 265 STEEL 42 PM 160 9 100 W/O RMT W/O LOCKOUT AL C: YS727 MATTE BLACKIF: YS727', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 13, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMTS0-004', longSpec: 'SF20 XCM DS COIL SOFT 29" 080 100 1.125 265 STEEL 51 PM 160 9 100 W/O RMT W/O LOCKOUT AL C: YS727 MATTE BLACKIF: YS727 M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 14, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMTS0-005', longSpec: 'SF20 XCM DS COIL SOFT 27.5" 060 80 1.125 265 STEEL 51 PM 160 9 100 W/O RMT W/O LOCKOUT AL C: YS727 MATTE BLACKIF: YS727 M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 15, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMTS0-006', longSpec: 'SF20 XCM DS COIL HARD 27.5" 080 90 1.125 265MM PM OD0 9 100 W/O RMT W/OMMMQR W/O REMOTE W/O LOCKOUT ALLOY G/F: YS 727 BLK MATTE W/TA 2', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 帝盟 0001003650 ─────────────────────────────────────────────────────────
  { id: 16, factory: 'GVM1', vendor: '帝盟(0001003650)', partNo: '1710-DDKGP2-0001', longSpec: 'DDK GP2000 TEM99 BLACK STEEL BLACK WITH BUMPER BLACK BA417541A PRO ACTIVE', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 信友 0001005224 ─────────────────────────────────────────────────────────
  { id: 17, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', longSpec: 'CONNECT(ATB) TCHL XC RISE 320BTFOV 31.8X640 R20 6D/3D SSABK W/MY20 DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 18, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-034', longSpec: 'CONNECT(ATB) TCHL XC RISE 320BTFOV 31.8X670 R20 6D/3D SSABK W/MY20 DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 19, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-035', longSpec: 'CONNECT(ATB) TCHL TR RISER 320BTFOV 31.8X720 R20 6D/3D SSABK W/MY20 DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 20, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-036', longSpec: 'CONNECT(ATB) TCHL TR RISER 320BTFOV 31.8X730-320 6D/3D SSABK W/MY20 DECAL W/ WARNING DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 21, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-037', longSpec: 'CONNECT(ATB) TCHL TR RISER 320BTFOV 31.8X750 R20 6D/3D SSABK W/MY20 DECAL W/ WARNING DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 22, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDSD50-002', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LOGO', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 23, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS250-002', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LOGO', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 24, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS500-003', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LOGO', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 25, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS500-004', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LG', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 26, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS500-005', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LG', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 27, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1721-SPC217-001', longSpec: 'SP-R217/ROAD A) 30.9X300 AL SAUK BK W/BK HEAD W2/PC BK BOLT W/O LG W/LASER 1&2 REPEAT 8-9N M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 28, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1721-SPC217-002', longSpec: 'SP 217/ROAD A) 30.9X375 AL SAUK BK W/BK HEAD W2/PC BK BOLT W/O LG W/LASER 1&2 REPEAT 8.9N.M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 29, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1721-SPC217-003', longSpec: 'SP 217/ROAD A) 30.9X395 AL SAUK BK W/BK HEAD W2/PC BK BOLT W/O LG W/LASER 1&2 REPEAT 8.9N.M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 百勝 0001005285 ─────────────────────────────────────────────────────────
  { id: 30, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-001', longSpec: 'CPH-5 1350DX1800 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 31, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-002', longSpec: 'CPH-5 1390DX1600 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 32, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-003', longSpec: 'CPH-5 1420DX1000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 33, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-004', longSpec: 'CPH-5 1450DX1000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 34, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-005', longSpec: 'CPH-5 1550DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 35, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-006', longSpec: 'CPH-5 1650DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 36, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-016', longSpec: 'CPH-5 750DX1000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 37, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-018', longSpec: 'CPH-5 820DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 38, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-022', longSpec: 'CPH-5 8200DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 39, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-025', longSpec: 'CPH-1 5820DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 40, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-026', longSpec: 'CPH-5 8200DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 41, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-027', longSpec: 'CPH-5 8200DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 42, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-028', longSpec: 'CPH-5 8500DX1100 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 43, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-030', longSpec: 'CPH-5 14800DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 44, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-031', longSpec: 'CPH-5 15000DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 45, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-032', longSpec: 'CPH-5 720DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 46, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-033', longSpec: 'CPH-5 7700C 60 211.5 142 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 台灣威菱 0001005861 ──────────────────────────────────────────────────────
  { id: 47, factory: 'GVM1', vendor: '台灣威菱(0001005861)', partNo: '10T1475ANM001', longSpec: 'T1475A 700C 56 134 1/42 CARBO 鉻鉬管 齒 1475U0022', updatedInfo: 'Paul Sun 孫杰坪-2023/12/05' },
  { id: 48, factory: 'GTM1', vendor: '台灣威菱(0001005861)', partNo: '10T1475ANM002', longSpec: 'T1475A 700C 56 134 1/42 CARBO 鉻鉬管 齒 1475U0022', updatedInfo: 'Paul Sun 孫杰坪-2023/04/05' },
  // ── 環宇 0001000259 ──────────────────────────────────────────────────────────
  { id: 49, factory: 'AIP1', vendor: '環宇(0001000259)', partNo: '4442-GLOB6-005', longSpec: 'POWER Global 6.2 A 149 W 24 V L', updatedInfo: 'SOY-2023/08/11' },
  // ── 巨大機械（驗證用：對應出貨/裝箱明細 mock 料號）───────────────────────────
  { id: 50, factory: 'GTM1', vendor: '巨大機械(0001000001)', partNo: '2201-FRM0641-A01', longSpec: 'ROAD FRAME ALLOY 700C SIZE M MATTE BLACK', updatedInfo: 'System-2024/01/01' },
];

/** 入廠需檢驗的料號集合（供列印貼紙判斷雙框線用） */
export const INSPECTION_PART_SET: ReadonlySet<string> = new Set(
  INCOMING_INSPECTION_DATA.map(r => r.partNo)
);



// ── 排除料號 Mock 資料 ────────────────────────────────────────────────────────
const EXCLUDED_PARTS_MOCK: ExcludedPartRow[] = [
  { id: 1,  factory: 'GTM1', partNo: '1129-CSL0075-L01',   updatedInfo: 'Jessica Lin 林月荔-2023/01/12' },
  { id: 2,  factory: 'GTM1', partNo: '1129-CSL0075-L002',  updatedInfo: 'Jessica Lin 林月荔-2023/01/12' },
  { id: 3,  factory: 'GTM1', partNo: '1129-CSL0075-L003',  updatedInfo: 'Jessica Lin 林月荔-2023/01/12' },
  { id: 4,  factory: 'GTM1', partNo: '1129-CSL0075-L006',  updatedInfo: 'Jessica Lin 林月荔-2023/01/12' },
  { id: 5,  factory: 'GTM1', partNo: '1129-CSL0075-0001',  updatedInfo: 'Jessica Lin 林月荔-2023/01/12' },
  { id: 6,  factory: 'GTM1', partNo: '1129-CSL0075-L0006', updatedInfo: 'Jessica Lin 林月荔-2023/01/12' },
  { id: 7,  factory: 'GVM1', partNo: '1450-5111SR-001',    updatedInfo: 'Paul Sun 孫杰坪-2023/03/15' },
  { id: 8,  factory: 'GVM1', partNo: '1450-5111SR-002',    updatedInfo: 'Paul Sun 孫杰坪-2023/03/15' },
  { id: 9,  factory: 'GVM1', partNo: '1321-CONNEC-033',    updatedInfo: 'Paul Sun 孫杰坪-2023/05/01' },
  { id: 10, factory: 'GVM1', partNo: '1321-CONNEC-034',    updatedInfo: 'Paul Sun 孫杰坪-2023/05/01' },
  { id: 11, factory: 'GEM1', partNo: 'DL-6800-GS',         updatedInfo: 'Jessica Lin 林月荔-2023/06/20' },
  { id: 12, factory: 'GEM1', partNo: 'FD-SRAM-AXS-01',    updatedInfo: 'Jessica Lin 林月荔-2023/06/20' },
  { id: 13, factory: 'GTM1', partNo: '2201-FRM0641-A01',   updatedInfo: 'System-2024/01/01' },
  { id: 14, factory: 'GVM1', partNo: '1111-XCE280-001',    updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 15, factory: 'GVM1', partNo: '1111-XCE280-002',    updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
];

// Mock 選項資料（將來串 API）
const FACTORY_OPTIONS = [
  { value: 'GVM1', label: 'GVM1' },
  { value: 'GTM1', label: 'GTM1' },
  { value: 'GEM1', label: 'GEM1' },
  { value: 'GPM1', label: 'GPM1' },
];

const VENDOR_OPTIONS = [
  { value: '0001005224', label: '信友 (0001005224)' },
  { value: '0001009900', label: '台灣松下 (0001009900)' },
  { value: '0002001100', label: '億光 (0002001100)' },
  { value: '0003000512', label: '禧瑪諾 (0003000512)' },
  { value: '0004001872', label: '速聯 (0004001872)' },
];

// 料號選項（廠商選定後才有效，模擬中台物料阻擋 API）
const PART_NO_BY_VENDOR: Record<string, { value: string; label: string; longSpec: string }[]> = {
  '0001005224': [
    { value: '1321-CONNEC-033', label: '1321-CONNEC-033', longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT' },
    { value: '1321-CONNEC-034', label: '1321-CONNEC-034', longSpec: 'CONNECT(ATB) TCHL XC RISE 400BT' },
    { value: '1321-CONNEC-035', label: '1321-CONNEC-035', longSpec: 'CONNECT(ATB) TCHL XC RISE 500BT' },
  ],
  '0001009900': [
    { value: 'BA-2048-M12-01', label: 'BA-2048-M12-01', longSpec: 'BATTERY 48V 12AH BLK PANASONIC' },
    { value: 'BA-2048-M12-02', label: 'BA-2048-M12-02', longSpec: 'BATTERY 48V 12AH WHT PANASONIC' },
    { value: 'BA-3648-M12-01', label: 'BA-3648-M12-01', longSpec: 'BATTERY 48V 12AH BLK PANASONIC XL' },
  ],
  '0002001100': [
    { value: 'LT-F001-LED-01', label: 'LT-F001-LED-01', longSpec: 'FRONT LIGHT LED 80 LUX USB-C BLK' },
    { value: 'LT-F002-LED-01', label: 'LT-F002-LED-01', longSpec: 'FRONT LIGHT LED 120 LUX USB-C BLK' },
  ],
  '0003000512': [
    { value: 'DL-6800-GS', label: 'DL-6800-GS', longSpec: 'DERAILL REAR SHIMANO DEORE XT M8100' },
  ],
  '0004001872': [
    { value: 'FD-SRAM-AXS-01', label: 'FD-SRAM-AXS-01', longSpec: 'DERAILLEUR FRONT SRAM AXS 2X 12SPD' },
  ],
};


const MATERIAL_GROUP_REPORT_DATA: MaterialGroupReportRow[] = [
  { id: 1,  factory: 'GEM1', materialGroup: '100',  descZh: 'BICYCLE',       descEn: 'BICYCLE',         needInspReport: true,  needFuncReport: true  },
  { id: 2,  factory: 'GEM1', materialGroup: '100E', descZh: 'E-BICYCLE',     descEn: 'ELECTRIC BICYCLE', needInspReport: true,  needFuncReport: false },
  { id: 3,  factory: 'GEM1', materialGroup: '101A', descZh: 'Helmet-road',   descEn: 'Helmet-road',     needInspReport: true,  needFuncReport: true  },
  { id: 4,  factory: 'GEM1', materialGroup: '101B', descZh: 'Helmet-MTB',    descEn: 'Helmet-MTB',      needInspReport: true,  needFuncReport: false },
  { id: 5,  factory: 'GEM1', materialGroup: '102',  descZh: 'Accessories',   descEn: 'Accessories',     needInspReport: false, needFuncReport: false },
  { id: 6,  factory: 'GEM1', materialGroup: '103A', descZh: 'Frame-AL',      descEn: 'Frame-Aluminum',  needInspReport: true,  needFuncReport: false },
  { id: 7,  factory: 'GEM1', materialGroup: '103C', descZh: 'Frame-CF',      descEn: 'Frame-Carbon',    needInspReport: true,  needFuncReport: true  },
  { id: 8,  factory: 'GTM1', materialGroup: '110',  descZh: '電動車配件',    descEn: 'E-Bike Parts',    needInspReport: true,  needFuncReport: true  },
  { id: 9,  factory: 'GTM1', materialGroup: '111',  descZh: '車燈類',        descEn: 'Lights',          needInspReport: false, needFuncReport: true  },
];

const HAZARD_REG_DATA: HazardRegRow[] = [
  { id: 1, regCode: 'REACH',     enabled: true, descZh: '化學品品註冊、評估、授權及限制法規',               descEn: 'Registration, Evaluation, Authorisation and Restriction of Chemicals', regMaker: '歐盟（EU）',               regScope: '管制所有在歐盟市場流通的化學物質，要求廠商申報 SVHC 高關注物質',       remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 2, regCode: 'RoHS',      enabled: true, descZh: '限制電子電氣設備中某些有害物質使用指令',            descEn: 'Restriction of Hazardous Substances Directive',                         regMaker: '歐盟（EU）',               regScope: '限制在電子與電氣設備中使用鉛、汞、鎘、六價鉻等有害物質',              remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 3, regCode: 'CP 65',     enabled: true, descZh: '加州第65號提案（及安全飲水暨毒害化學物質施行法）',  descEn: 'California Proposition 65',                                              regMaker: '美國加州',                 regScope: '要求企業告知消費者產品含有可能致癌或影響生殖的有害化學物質',          remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 4, regCode: 'POPs',      enabled: true, descZh: '持久性有機污染物規範',                            descEn: 'Persistent Organic Pollutants Regulation',                              regMaker: '歐盟（根據斯德哥爾摩公約）',  regScope: '限制或禁止使用具持久性、生物積累性和毒性的有機污染物',                remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 5, regCode: 'TSCA',      enabled: true, descZh: '有毒物質控制法',                                  descEn: 'Toxic Substances Control Act',                                           regMaker: '美國',                     regScope: '授權美國環保署（EPA）評估和管制化學物質對人體健康和環境的風險',        remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 6, regCode: 'CPSIA',     enabled: true, descZh: '消費品安全改進法案',                              descEn: 'Consumer Product Safety Improvement Act',                               regMaker: '美國',                     regScope: '規範兒童產品鉛含量上限及鄰苯二甲酸酯限制，保護兒童健康安全',          remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 7, regCode: 'EN 71-3',   enabled: true, descZh: '玩具安全標準第3部：特定元素遷移',                 descEn: 'European Standard EN 71-3',                                              regMaker: '歐盟',                     regScope: '規範玩具材料中特定重金屬元素（鉛、鎘、鉻等）的遷移量上限',            remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 8, regCode: 'ASTM F963', enabled: true, descZh: 'ASTM F963玩具安全消費者標準規範',                 descEn: 'ASTM F963 Standard Consumer Safety Specification for Toy Safety',        regMaker: '美國玩具協議協會（ASTM）',  regScope: '規範玩具的化學、機械和電氣安全，適用於進入美國市場的玩具產品',        remark: '', createdInfo: 'Paul Sun 孫杰坪-2025/06/02' },
  { id: 9, regCode: 'GB 3565',   enabled: true, descZh: '自行車安全要求',                                  descEn: "National Standard of the People's Republic of China GB 3565",            regMaker: '中國',                     regScope: '規範自行車結構、材料、性能等安全要求，適用於進入中國大陸市場的自行車', remark: '', createdInfo: 'Jessica Lin 林芳宜-2025/07/15' },
];


// ─────────────────────────────────────────────────────────────────────────────
// Tab Item
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] px-[16px] relative shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 whitespace-nowrap ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox 圖示（Tab2 用，可互動）
// ─────────────────────────────────────────────────────────────────────────────
function CheckboxDisplay({ checked, onToggle }: { checked: boolean; onToggle?: () => void }) {
  const base = 'inline-flex items-center justify-center w-[20px] h-[20px] rounded-[4px] transition-colors cursor-pointer select-none';
  if (checked) {
    return (
      <span
        className={`${base} bg-[#005EB8] hover:bg-[#004ca3]`}
        onClick={e => { e.stopPropagation(); onToggle?.(); }}
        role="checkbox"
        aria-checked="true"
        tabIndex={0}
        onKeyDown={e => e.key === ' ' && onToggle?.()}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={`${base} border border-[rgba(145,158,171,0.4)] hover:border-[#005EB8]`}
      onClick={e => { e.stopPropagation(); onToggle?.(); }}
      role="checkbox"
      aria-checked="false"
      tabIndex={0}
      onKeyDown={e => e.key === ' ' && onToggle?.()}
    />
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// AddInspectionOverlay — 新增檢驗料號彈窗
// ─────────────────────────────────────────────────────────────────────────────

interface AddInspectionOverlayProps {
  onClose: () => void;
  onAdd: (row: Omit<IncomingInspectionRow, 'id'>) => void;
}

function AddInspectionOverlay({ onClose, onAdd }: AddInspectionOverlayProps) {
  const [factory, setFactory] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [partNo, setPartNo]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const partOptions = vendorId ? (PART_NO_BY_VENDOR[vendorId] ?? []) : [];
  const selectedPart = partOptions.find(p => p.value === partNo);
  const vendorLabel = VENDOR_OPTIONS.find(v => v.value === vendorId)?.label ?? '';

  // 選廠商切換時清空料號
  const handleVendorChange = (v: string) => {
    setVendorId(v);
    setPartNo('');
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!factory || !vendorId || !partNo) return;
    onAdd({
      factory,
      vendor: vendorLabel,
      partNo,
      longSpec: selectedPart?.longSpec ?? '',
      updatedInfo: 'System-' + new Date().toLocaleDateString('zh-TW'),
    });
    onClose();
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="520px" maxHeight="460px">
      <div className="relative w-full h-full">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381"
              fillRule="evenodd"
            />
          </svg>
        </button>

        {/* 內容區 */}
        <div className="flex flex-col h-full px-[50px] pt-[58px] pb-[40px] gap-[24px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            新增檢驗料號
          </p>

          <div className="flex flex-col gap-[20px] flex-1">
            {/* 工廠 */}
            <DropdownSelect
              label="工廠"
              value={factory}
              onChange={setFactory}
              options={FACTORY_OPTIONS}
              placeholder="請選擇工廠"
              searchable
              error={submitted && !factory}
            />

            {/* 廠商 */}
            <DropdownSelect
              label="廠商"
              value={vendorId}
              onChange={handleVendorChange}
              options={VENDOR_OPTIONS}
              placeholder="請選擇廠商"
              searchable
              error={submitted && !vendorId}
            />

            {/* 料號（廠商未選時 disabled） */}
            <div>
              <DropdownSelect
                label="料號"
                value={partNo}
                onChange={setPartNo}
                options={partOptions}
                placeholder={vendorId ? '請選擇料號' : '請先選擇廠商'}
                searchable
                disabled={!vendorId}
                error={submitted && !partNo}
              />
              {/* 長規格描述預覽 */}
              {selectedPart && (
                <p className="mt-[8px] text-[12px] text-[#637381] leading-[18px] pl-[2px]">
                  {selectedPart.longSpec}
                </p>
              )}
              {submitted && !partNo && (
                <p className="mt-[4px] text-[12px] text-[#ff5630]">請選擇料號</p>
              )}
            </div>
          </div>

          {/* 新增按鈕 */}
          <button
            onClick={handleSubmit}
            className="w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
            style={{ backgroundColor: '#00559c' }}
          >
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">新增</p>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab1：入廠需檢驗的物料
// ─────────────────────────────────────────────────────────────────────────────

function Tab1IncomingInspection() {
  const [rows, setRows] = useState<IncomingInspectionRow[]>(INCOMING_INSPECTION_DATA);
  const [vendorSearch, setVendorSearch] = useState('');
  const [partSearch, setPartSearch]     = useState('');
  const [showAddOverlay, setShowAddOverlay] = useState(false);

  const handleDelete = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleAdd = (row: Omit<IncomingInspectionRow, 'id'>) => {
    setRows(prev => [...prev, { id: Date.now(), ...row }]);
  };

  const filtered = useMemo(() => {
    return rows.filter(row => {
      const matchVendor = !vendorSearch || (() => {
        const tokens = vendorSearch.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        return tokens.some(t => row.vendor.toLowerCase().includes(t));
      })();
      const matchPart   = !partSearch   || row.partNo.toLowerCase().includes(partSearch.toLowerCase());
      return matchVendor && matchPart;
    });
  }, [rows, vendorSearch, partSearch]);

  const columns: StandardColumn<IncomingInspectionRow>[] = [
    { key: 'id',          label: '#',          width: 56,  minWidth: 48  },
    { key: 'factory',     label: '工廠',        width: 90,  minWidth: 72  },
    { key: 'vendor',      label: '廠商',        width: 200, minWidth: 140 },
    { key: 'partNo',      label: '料號',        width: 180, minWidth: 120 },
    { key: 'longSpec',    label: '長規格描述',  width: 280, minWidth: 160 },
    { key: 'updatedInfo', label: '最後修改資訊', width: 220, minWidth: 160 },
    {
      key: '_action',
      label: '',
      width: 64,
      minWidth: 64,
      required: true,
      renderCell: (_val, row) => (
        <div onClick={e => e.stopPropagation()}>
          <DeleteButton onClick={() => handleDelete(row.id)} title="移除此料號" />
        </div>
      ),
    },
  ];


  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商"
            value={vendorSearch}
            onChange={setVendorSearch}
            placeholder="廠商名稱或代碼，多選請用逗號分隔"
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={partSearch}
            onChange={setPartSearch}
          />
        </div>
      </div>


      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab1-v2"
        showCheckbox={false}
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '入廠需檢驗的物料.csv', [
          { key: 'factory',     label: '工廠' },
          { key: 'vendor',      label: '廠商' },
          { key: 'partNo',      label: '料號' },
          { key: 'longSpec',    label: '長規格描述' },
          { key: 'updatedInfo', label: '最後修改資訊' },
        ])}
        actionButton={
          <button
            id="q-other-tab1-add-btn"
            onClick={() => setShowAddOverlay(true)}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
          >
            新增
          </button>
        }
      />

      {/* 新增彈窗 */}
      {showAddOverlay && (
        <AddInspectionOverlay
          onClose={() => setShowAddOverlay(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExcludePartsOverlay — 排除料號彈窗
// ─────────────────────────────────────────────────────────────────────────────

const EXCLUDE_CHECKBOX_W = 44;

/** 下載 Excel 範本（CSV 模擬） */
function downloadExcludeTemplate() {
  const csv = '\uFEFF工廠,料號\nGTM1,1129-CSL0075-L01\nGVM1,1450-5111SR-001';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '排除料號匯入範本.csv';
  a.click();
  URL.revokeObjectURL(url);
}

interface ExcludePartsOverlayProps {
  onClose: () => void;
}

function ExcludePartsOverlay({ onClose }: ExcludePartsOverlayProps) {
  const [rows, setRows] = useState<ExcludedPartRow[]>(EXCLUDED_PARTS_MOCK);
  const [factorySearch, setFactorySearch] = useState('');
  const [partSearch, setPartSearch]       = useState('');
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 篩選
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const mF = !factorySearch || r.factory.toLowerCase().includes(factorySearch.toLowerCase());
      const mP = !partSearch   || r.partNo.toLowerCase().includes(partSearch.toLowerCase());
      return mF && mP;
    });
  }, [rows, factorySearch, partSearch]);

  // 分頁
  const totalPages   = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePageNum  = Math.min(page, totalPages);
  const paginated    = filtered.slice((safePageNum - 1) * perPage, safePageNum * perPage);

  // 全選邏輯
  const pageIds        = paginated.map(r => r.id);
  const isAllSelected  = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => { const s = new Set(prev); pageIds.forEach(id => s.delete(id)); return s; });
    } else {
      setSelectedIds(prev => { const s = new Set(prev); pageIds.forEach(id => s.add(id)); return s; });
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // 刪除選取
  const handleDeleteSelected = () => {
    setRows(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  // 匯入 Excel/CSV（模擬解析，實際串 API 時替換）
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1); // 跳過 header
      const now = new Date().toLocaleDateString('zh-TW').replace(/\//g, '/');
      const newRows: ExcludedPartRow[] = lines
        .map((line, i) => {
          const cols = line.replace(/\r/g, '').split(',');
          const factory = (cols[0] ?? '').trim();
          const partNo  = (cols[1] ?? '').trim();
          if (!factory || !partNo) return null;
          return { id: Date.now() + i, factory, partNo, updatedInfo: `System-${now}` };
        })
        .filter(Boolean) as ExcludedPartRow[];
      if (newRows.length > 0) {
        setRows(prev => [
          ...prev,
          ...newRows.filter(nr => !prev.some(r => r.factory === nr.factory && r.partNo === nr.partNo)),
        ]);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = ''; // reset
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="760px" maxHeight="85vh">
      <div className="relative w-full flex flex-col h-full">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381" fillRule="evenodd"
            />
          </svg>
        </button>

        {/* ── 標題列 ── */}
        <div className="shrink-0 flex items-center justify-between px-[20px] pt-[52px] pb-[4px]">
          <div className="flex items-center gap-[16px]">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] leading-[28px] text-[#1c252e]">
              免交任何報告的料號
            </p>
            {/* 匯入按鈕 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#005eb8] hover:text-[#004680] transition-colors cursor-pointer"
            >
              匯入
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
            {/* 下載範本 */}
            <button
              onClick={downloadExcludeTemplate}
              className="flex items-center gap-[4px] font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381] hover:text-[#1c252e] transition-colors cursor-pointer"
              title="下載 Excel 匯入範本（工廠、料號 兩欄）"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              下載範本
            </button>
          </div>
          {/* 搜尋欄 */}
          <div className="flex gap-[12px]" style={{ width: 360 }}>
            <div className="flex-1 min-w-0">
              <SearchField label="工廠" value={factorySearch} onChange={v => { setFactorySearch(v); setPage(1); }} />
            </div>
            <div className="flex-1 min-w-0">
              <SearchField label="料號" value={partSearch} onChange={v => { setPartSearch(v); setPage(1); }} />
            </div>
          </div>
        </div>

        {/* results count */}
        <div className="shrink-0 px-[20px] pb-[8px]">
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381]">
            <span className="font-semibold text-[#1c252e]">{filtered.length.toLocaleString()}</span> results
          </p>
        </div>

        {/* ── 表格區域（含 selection toolbar） ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden mx-[20px] mb-[4px] rounded-[12px] border border-[rgba(145,158,171,0.16)]">

          {/* Selection Toolbar — 在表頭上方 */}
          {selectedIds.size > 0 && (
            <div className="shrink-0 flex items-center h-[48px] border-b border-[rgba(145,158,171,0.08)] bg-[#d9e8f5]">
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0"
                style={{ width: EXCLUDE_CHECKBOX_W }}
              >
                <ExcludeCheckIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
              </div>
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] mr-[4px] whitespace-nowrap">
                {selectedIds.size} selected
              </span>
              <span
                onClick={handleDeleteSelected}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#ff5630] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >
                刪除料號
              </span>
            </div>
          )}

          {/* 表頭 */}
          <div className="shrink-0 flex items-center bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.16)]" style={{ height: 44 }}>
            {/* 全選 checkbox — 有選取時隱藏（Selection Toolbar 已提供） */}
            {selectedIds.size === 0 ? (
              <div
                data-is-checkbox="true"
                className="flex items-center justify-center shrink-0"
                style={{ width: EXCLUDE_CHECKBOX_W }}
              >
                <ExcludeCheckIcon checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} />
              </div>
            ) : (
              <div className="shrink-0" style={{ width: EXCLUDE_CHECKBOX_W }} />
            )}
            {[{ label: '工廠', flex: '0 0 100px' }, { label: '料號', flex: '1 1 0' }, { label: '最後修改資訊', flex: '0 0 220px' }].map(col => (
              <div key={col.label} style={{ flex: col.flex }} className="px-[12px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] uppercase tracking-wide whitespace-nowrap">{col.label}</p>
              </div>
            ))}
          </div>

          {/* 資料列 */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {paginated.length === 0 ? (
              <div className="flex items-center justify-center h-[120px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">沒有資料</p>
              </div>
            ) : paginated.map(row => (
              <div
                key={row.id}
                className="flex items-center border-b border-[rgba(145,158,171,0.08)] hover:bg-[#f9fafb] transition-colors"
                style={{ minHeight: 48 }}
              >
                <div
                  data-is-checkbox="true"
                  className="flex items-center justify-center shrink-0"
                  style={{ width: EXCLUDE_CHECKBOX_W }}
                >
                  <ExcludeCheckIcon checked={selectedIds.has(row.id)} onChange={() => handleToggleRow(row.id)} />
                </div>
                <div style={{ flex: '0 0 100px' }} className="px-[12px] py-[10px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e]">{row.factory}</p>
                </div>
                <div style={{ flex: '1 1 0' }} className="px-[12px] py-[10px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e]">{row.partNo}</p>
                </div>
                <div style={{ flex: '0 0 220px' }} className="px-[12px] py-[10px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381]">{row.updatedInfo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分頁 */}
        <div className="shrink-0 px-[20px] pb-[12px]">
          <PaginationControls
            page={safePageNum}
            perPage={perPage}
            total={filtered.length}
            onPageChange={setPage}
            onPerPageChange={p => { setPerPage(p); setPage(1); }}
          />
        </div>
      </div>
    </BaseOverlay>
  );
}

/** 排除料號 Overlay 用的簡易 Checkbox icon */
function ExcludeCheckIcon({ checked, indeterminate, onChange }: { checked: boolean; indeterminate?: boolean; onChange?: () => void }) {
  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); onChange?.(); };
  if (indeterminate) {
    return (
      <span
        onClick={handleClick}
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] bg-[#005EB8] cursor-pointer"
        role="checkbox" aria-checked="mixed"
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none"><rect width="10" height="2" rx="1" fill="white"/></svg>
      </span>
    );
  }
  if (checked) {
    return (
      <span
        onClick={handleClick}
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] bg-[#005EB8] cursor-pointer"
        role="checkbox" aria-checked="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  return (
    <span
      onClick={handleClick}
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] border border-[rgba(145,158,171,0.4)] cursor-pointer hover:border-[#005EB8] transition-colors"
      role="checkbox" aria-checked="false"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab2：需付檢測報告的物料群組
// ─────────────────────────────────────────────────────────────────────────────

function Tab2MaterialGroupReport() {
  const [rows, setRows]               = useState<MaterialGroupReportRow[]>(MATERIAL_GROUP_REPORT_DATA);
  const [factoryFilter, setFactoryFilter] = useState('');
  const [groupSearch,   setGroupSearch]   = useState('');
  const [inspRepFilter, setInspRepFilter] = useState('');
  const [funcRepFilter, setFuncRepFilter] = useState('');
  const [showExclude,   setShowExclude]   = useState(false);
  // 主表格選取狀態
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 切換物料群組的報告需求
  const handleToggle = (id: number, field: 'needInspReport' | 'needFuncReport') => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: !r[field] } : r));
  };

  // Selection handlers
  const handleToggleRow = (id: number) => {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const handleToggleAll = (ids: number[]) => {
    const allSelected = ids.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
    } else {
      setSelectedIds(prev => { const s = new Set(prev); ids.forEach(id => s.add(id)); return s; });
    }
  };
  // Batch 操作
  const batchSetInsp = () => {
    setRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, needInspReport: true } : r));
    setSelectedIds(new Set());
  };
  const batchSetFunc = () => {
    setRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, needFuncReport: true } : r));
    setSelectedIds(new Set());
  };
  const batchClearAll = () => {
    setRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, needInspReport: false, needFuncReport: false } : r));
    setSelectedIds(new Set());
  };

  const filtered = useMemo(() => {
    return rows.filter(row => {
      const matchFactory  = !factoryFilter || row.factory === factoryFilter;
      const matchGroup    = !groupSearch   || row.materialGroup.includes(groupSearch) || row.descZh.includes(groupSearch) || row.descEn.toLowerCase().includes(groupSearch.toLowerCase());
      const matchInspRep  = !inspRepFilter
        || (inspRepFilter === 'yes' && row.needInspReport)
        || (inspRepFilter === 'no'  && !row.needInspReport);
      const matchFuncRep  = !funcRepFilter
        || (funcRepFilter === 'yes' && row.needFuncReport)
        || (funcRepFilter === 'no'  && !row.needFuncReport);
      return matchFactory && matchGroup && matchInspRep && matchFuncRep;
    });
  }, [rows, factoryFilter, groupSearch, inspRepFilter, funcRepFilter]);

  const columns: StandardColumn<MaterialGroupReportRow>[] = [
    { key: 'factory',       label: '工廠',           width: 90,  minWidth: 72  },
    { key: 'materialGroup', label: '物料群組',        width: 110, minWidth: 90  },
    { key: 'descZh',        label: '物料群組說明',    width: 200, minWidth: 120 },
    { key: 'descEn',        label: '物料群組說明(En)', width: 200, minWidth: 120 },
    {
      key: 'needInspReport',
      label: '需繳交檢驗報告',
      width: 150,
      minWidth: 110,
      renderCell: (_val, row) => (
        <div className="flex items-center justify-center">
          <CheckboxDisplay
            checked={row.needInspReport}
            onToggle={() => handleToggle(row.id, 'needInspReport')}
          />
        </div>
      ),
    },
    {
      key: 'needFuncReport',
      label: '需繳交功性能測試報告',
      width: 185,
      minWidth: 140,
      renderCell: (_val, row) => (
        <div className="flex items-center justify-center">
          <CheckboxDisplay
            checked={row.needFuncReport}
            onToggle={() => handleToggle(row.id, 'needFuncReport')}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="工廠"
            value={factoryFilter}
            onChange={setFactoryFilter}
            options={[{ value: '', label: '全部' }, ...FACTORY_OPTIONS]}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="物料群組"
            value={groupSearch}
            onChange={setGroupSearch}
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="需繳交檢驗報告"
            value={inspRepFilter}
            onChange={setInspRepFilter}
            options={[
              { value: '', label: '全部' },
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No'  },
            ]}
          />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="需繳交功性能測試報告"
            value={funcRepFilter}
            onChange={setFuncRepFilter}
            options={[
              { value: '', label: '全部' },
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No'  },
            ]}
          />
        </div>
      </div>

      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab2-v2"
        showCheckbox={true}
        selectedIds={selectedIds}
        onToggleRow={handleToggleRow}
        onToggleAll={handleToggleAll}
        updateTime="2025/05/05 12:30"
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '需付檢測報告的物料群組.csv', [
          { key: 'factory',        label: '工廠' },
          { key: 'materialGroup',  label: '物料群組' },
          { key: 'descZh',         label: '物料群組說明' },
          { key: 'descEn',         label: '物料群組說明(En)' },
          { key: 'needInspReport', label: '需繳交檢驗報告' },
          { key: 'needFuncReport', label: '需繳交功性能測試報告' },
        ])}
        batchActions={
          (() => {
            const SEP = <span className="text-[rgba(145,158,171,0.4)] select-none">|</span>;
            const CTA_INSP = (
              <span
                onClick={batchSetInsp}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >
                需繳交檢驗報告
              </span>
            );
            const CTA_FUNC = (
              <span
                onClick={batchSetFunc}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >
                需繳交功性能測試報告
              </span>
            );
            const CTA_CLEAR = (
              <span
                onClick={batchClearAll}
                className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#ff5630] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
              >
                全部不須繳交
              </span>
            );
            return <>{CTA_INSP}{SEP}{CTA_FUNC}{SEP}{CTA_CLEAR}</>;
          })()
        }
        actionButton={
          <button
            id="q-other-tab2-exclude-btn"
            onClick={() => setShowExclude(true)}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors whitespace-nowrap"
          >
            排除料號
          </button>
        }
      />

      {/* 排除料號 Overlay */}
      {showExclude && <ExcludePartsOverlay onClose={() => setShowExclude(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HazardRegOverlay — 新增 / 編輯法規彈窗
// ─────────────────────────────────────────────────────────────────────────────

interface HazardRegOverlayProps {
  mode: 'add' | 'edit';
  initial?: HazardRegRow;
  /** 外部傳入歷程（供顯示），同時接受新增歷程的 callback */
  history?: HistoryEntry[];
  onClose: () => void;
  onSave: (row: Omit<HazardRegRow, 'id' | 'createdInfo'>, historyEntry: HistoryEntry) => void;
}

function HazardRegOverlay({ mode, initial, history = [], onClose, onSave }: HazardRegOverlayProps) {
  const [regCode,  setRegCode]  = useState(initial?.regCode  ?? '');
  const [descZh,   setDescZh]   = useState(initial?.descZh   ?? '');
  const [descEn,   setDescEn]   = useState(initial?.descEn   ?? '');
  const [regMaker, setRegMaker] = useState(initial?.regMaker ?? '');
  const [regScope, setRegScope] = useState(initial?.regScope ?? '');
  const [remark,   setRemark]   = useState(initial?.remark   ?? '');
  const [enabled,  setEnabled]  = useState(initial?.enabled  ?? true);
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isAdd = mode === 'add';

  /** 比對修改前後，產生差異描述 */
  const buildDiff = (): string => {
    if (isAdd) return `新增法規：${regCode}`;
    const lines: string[] = [];
    const check = (label: string, oldVal: string | boolean, newVal: string | boolean) => {
      if (String(oldVal) !== String(newVal)) lines.push(`${label}：「${oldVal}」→「${newVal}」`);
    };
    check('法規說明',    initial?.descZh   ?? '', descZh);
    check('法規說明(EN)', initial?.descEn  ?? '', descEn);
    check('法規制定者',  initial?.regMaker ?? '', regMaker);
    check('法規管理範圍', initial?.regScope ?? '', regScope);
    check('備註',        initial?.remark   ?? '', remark);
    return lines.length > 0 ? lines.join('；') : '無異動';
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!regCode || !descZh) return;
    const dateStr = localDateToDisplay();
    const entry: HistoryEntry = {
      date: dateStr,
      event: isAdd ? '新增法規' : '編輯法規',
      operator: 'System',
      remark: buildDiff(),
    };
    onSave({ regCode, descZh, descEn, regMaker, regScope, remark, enabled }, entry);
    onClose();
  };

  const inputCls = (invalid?: boolean) =>
    `w-full h-[44px] px-[14px] text-[14px] text-[#1c252e] bg-white rounded-[8px] outline-none transition-colors border ${invalid ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.3)]'} focus:border-[#2196F3] disabled:bg-[#f4f6f8] disabled:cursor-not-allowed disabled:opacity-60`;

  // 可調式 textarea 樣式
  const textareaCls = (invalid?: boolean) =>
    `w-full min-h-[44px] px-[14px] py-[10px] text-[14px] text-[#1c252e] bg-white rounded-[8px] outline-none resize-y transition-colors border ${invalid ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.3)]'} focus:border-[#2196F3]`;

  const labelCls = 'w-[108px] shrink-0 text-[14px] font-medium text-[#1c252e] pt-[12px]';


  return (
    <BaseOverlay onClose={onClose} maxWidth="680px" maxHeight="90vh">
      <div className="relative w-full flex flex-col" style={{ minHeight: 480 }}>
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381" fillRule="evenodd"
            />
          </svg>
        </button>

        {/* 標題列 */}
        <div className="flex items-start justify-between px-[50px] pt-[56px] pb-[20px]">
          <div>
            <p className="font-semibold text-[18px] leading-[28px] text-[#1c252e]">
              {isAdd ? '新增法規' : '編輯法規'}
            </p>
            {isAdd && (
              <p className="mt-[4px] text-[12px] text-[#ff5630] leading-[18px]">
                ＊新增法規後，僅可編輯或停用，無提供刪除法規。
              </p>
            )}
          </div>
          {/* 歷程：對齊全站標準樣式 */}
          <p
            className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70 shrink-0"
            style={{ fontVariationSettings: "'wdth' 100" }}
            onClick={() => setShowHistory(true)}
          >
            歷程
          </p>
        </div>

        {/* OrderHistory 彈窗 */}
        {showHistory && (
          <OrderHistory
            titleLabel="法規歷程"
            entries={[...history].reverse()}
            onClose={() => setShowHistory(false)}
          />
        )}


        {/* 表單 */}
        <div className="flex-1 px-[50px] pb-[32px] flex flex-col gap-[16px] overflow-y-auto">
          {/* 法規代號：新增時可輸入，編輯時唯讀 */}
          <div className="flex items-start gap-[16px]">
            <span className={labelCls}>法規代號<span className="text-[#ff5630] ml-[2px]">*</span></span>
            {isAdd ? (
              <textarea
                rows={1}
                value={regCode} onChange={e => setRegCode(e.target.value)}
                className={textareaCls(submitted && !regCode)}
                placeholder="例：RoHS"
              />
            ) : (
              <input
                type="text" value={regCode} disabled
                className={inputCls()}
              />
            )}
          </div>
          {submitted && !regCode && <p className="text-[12px] text-[#ff5630] ml-[124px] -mt-[8px]">請填寫法規代號</p>}

          <div className="flex items-start gap-[16px]">
            <span className={labelCls}>法規說明<span className="text-[#ff5630] ml-[2px]">*</span></span>
            <textarea
              rows={1}
              value={descZh} onChange={e => setDescZh(e.target.value)}
              className={textareaCls(submitted && !descZh)}
              placeholder="中文說明"
            />
          </div>
          {submitted && !descZh && <p className="text-[12px] text-[#ff5630] ml-[124px] -mt-[8px]">請填寫法規說明</p>}

          <div className="flex items-start gap-[16px]">
            <span className={labelCls}>法規說明(EN)</span>
            <textarea rows={1} value={descEn} onChange={e => setDescEn(e.target.value)}
              className={textareaCls()} placeholder="English description" />
          </div>

          <div className="flex items-start gap-[16px]">
            <span className={labelCls}>法規制定者</span>
            <textarea rows={1} value={regMaker} onChange={e => setRegMaker(e.target.value)}
              className={textareaCls()} placeholder="例：歐盟（EU）" />
          </div>

          <div className="flex items-start gap-[16px]">
            <span className={labelCls}>法規管理範圍</span>
            <textarea rows={3} value={regScope} onChange={e => setRegScope(e.target.value)}
              className={textareaCls()} placeholder="管轄範圍描述" />
          </div>

          <div className="flex items-start gap-[16px]">
            <span className={labelCls}>備註</span>
            <textarea rows={1} value={remark} onChange={e => setRemark(e.target.value)}
              className={textareaCls()} placeholder="選填" />
          </div>
        </div>


        {/* 送出 */}
        <div className="px-[50px] pb-[32px] shrink-0">
          <button
            onClick={handleSubmit}
            className="w-full h-[42px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
            style={{ backgroundColor: '#00559c' }}
          >
            <p className="font-bold leading-[24px] text-white text-[14px]">
              {isAdd ? '新增' : '儲存'}
            </p>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab3：危害物質法規維護
// ─────────────────────────────────────────────────────────────────────────────

function Tab3HazardReg() {
  const [rows, setRows] = useState<HazardRegRow[]>(HAZARD_REG_DATA);
  const [regCodeSearch, setRegCodeSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [editTarget, setEditTarget] = useState<HazardRegRow | null>(null);
  /** 每筆法規的歷程（key = row.id） */
  const [historyMap, setHistoryMap] = useState<Record<number, HistoryEntry[]>>({});

  const handleToggleEnabled = (id: number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleAdd = (data: Omit<HazardRegRow, 'id' | 'createdInfo'>, entry: HistoryEntry) => {
    const newId = Date.now();
    setRows(prev => [...prev, {
      id: newId,
      ...data,
      createdInfo: 'System-' + new Date().toLocaleDateString('zh-TW'),
    }]);
    setHistoryMap(prev => ({ ...prev, [newId]: [entry] }));
  };

  const handleEdit = (data: Omit<HazardRegRow, 'id' | 'createdInfo'>, entry: HistoryEntry) => {
    if (!editTarget) return;
    const id = editTarget.id;
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    setHistoryMap(prev => ({ ...prev, [id]: [...(prev[id] ?? []), entry] }));
  };


  const filtered = useMemo(() => {
    return rows.filter(row => {
      const matchCode    = !regCodeSearch || row.regCode.toLowerCase().includes(regCodeSearch.toLowerCase());
      const matchEnabled = !enabledFilter
        || (enabledFilter === 'enabled'  && row.enabled)
        || (enabledFilter === 'disabled' && !row.enabled);
      return matchCode && matchEnabled;
    });
  }, [rows, regCodeSearch, enabledFilter]);

  const columns: StandardColumn<HazardRegRow>[] = [
    { key: 'id',          label: '#',           width: 56,  minWidth: 48  },
    {
      key: 'regCode',
      label: '法規代號',
      width: 120,
      minWidth: 90,
      renderCell: (val, row) => (
        <span
          className="text-[#1890FF] cursor-pointer hover:underline font-medium"
          onClick={e => { e.stopPropagation(); setEditTarget(row); }}
        >
          {String(val)}
        </span>
      ),
    },
    {
      key: 'enabled',
      label: '啟用',
      width: 90,
      minWidth: 72,
      renderCell: (_val, row) => (
        <div onClick={e => e.stopPropagation()}>
          <ToggleSwitch checked={row.enabled} onChange={() => handleToggleEnabled(row.id)} />
        </div>
      ),
    },
    { key: 'descZh',      label: '法規說明',     width: 220, minWidth: 140 },
    { key: 'descEn',      label: '法規說明(En)',  width: 220, minWidth: 140 },
    { key: 'regMaker',    label: '法規制定者',    width: 160, minWidth: 110 },
    { key: 'regScope',    label: '法規管理範圍',  width: 240, minWidth: 140 },
    { key: 'remark',      label: '備註',          width: 140, minWidth: 80  },
    { key: 'createdInfo', label: '建檔資訊',      width: 220, minWidth: 160 },
  ];


  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1 min-w-0">
          <SearchField label="法規代號" value={regCodeSearch} onChange={setRegCodeSearch} />
        </div>
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="啟用狀態"
            value={enabledFilter}
            onChange={setEnabledFilter}
            options={[
              { value: '',         label: '全部'  },
              { value: 'enabled',  label: '啟用'  },
              { value: 'disabled', label: '未啟用' },
            ]}
          />
        </div>
      </div>

      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab3-v2"
        showCheckbox={false}
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '危害物質法規維護.csv', [
          { key: 'regCode',     label: '法規代號' },
          { key: 'descZh',      label: '法規說明' },
          { key: 'descEn',      label: '法規說明(En)' },
          { key: 'regMaker',    label: '法規制定者' },
          { key: 'regScope',    label: '法規管理範圍' },
          { key: 'remark',      label: '備註' },
          { key: 'createdInfo', label: '建檔資訊' },
        ])}
        actionButton={
          <button
            id="q-other-tab3-add-btn"
            onClick={() => setShowAddOverlay(true)}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-semibold text-[13px] transition-colors"
          >
            新增
          </button>
        }
      />

      {showAddOverlay && (
        <HazardRegOverlay mode="add" onClose={() => setShowAddOverlay(false)} onSave={handleAdd} history={[]} />
      )}
      {editTarget && (
        <HazardRegOverlay
          mode="edit"
          initial={editTarget}
          history={historyMap[editTarget.id] ?? []}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 主元件
// ─────────────────────────────────────────────────────────────────────────────

export function QualityOtherSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('incoming-inspection');

  const tabs = QUALITY_OTHER_TABS;

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] overflow-hidden border border-[rgba(145,158,171,0.12)]">
      {/* ── Tab 列 ── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.24)] px-[20px] flex items-center gap-[4px]">
        {tabs.map(tab => (
          <TabItem
            key={tab.key}
            label={tab.label}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* ── Tab 內容 ── */}
      {activeTab === 'incoming-inspection'   && <Tab1IncomingInspection />}
      {activeTab === 'material-group-report' && <Tab2MaterialGroupReport />}
      {activeTab === 'hazard-reg'            && <Tab3HazardReg />}
    </div>
  );
}
