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
 * TAB 2：達交準時率（建置中）
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

// ─────────────────────────────────────────────────────────────────────────────
// 靜態選項
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'GTM', label: 'GTM' },
  { value: 'GEM', label: 'GEM' },
  { value: 'GHM', label: 'GHM' },
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
// Mock 資料：交貨準時率清單
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_DELIVERY_ROWS: DeliveryOntimeRow[] = [
  { id: 1,  vendorDisplay: '速聯(000100463)', vendorCode: '000100463', period: '202506', ontimeRate: '100%', ontimeQty: 52,  totalQty: 52  },
  { id: 2,  vendorDisplay: '速聯(000100463)', vendorCode: '000100463', period: '202507', ontimeRate: '100%', ontimeQty: 100, totalQty: 100 },
  { id: 3,  vendorDisplay: '速聯(000100463)', vendorCode: '000100463', period: '202508', ontimeRate: '80%',  ontimeQty: 80,  totalQty: 100 },
  { id: 4,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202506', ontimeRate: '95%',  ontimeQty: 95,  totalQty: 100 },
  { id: 5,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202507', ontimeRate: '88%',  ontimeQty: 44,  totalQty: 50  },
  { id: 6,  vendorDisplay: '台灣日立(000200128)', vendorCode: '000200128', period: '202508', ontimeRate: '100%', ontimeQty: 60,  totalQty: 60  },
  { id: 7,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202506', ontimeRate: '75%',  ontimeQty: 75,  totalQty: 100 },
  { id: 8,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202507', ontimeRate: '90%',  ontimeQty: 90,  totalQty: 100 },
  { id: 9,  vendorDisplay: '聯華電子(000300077)', vendorCode: '000300077', period: '202508', ontimeRate: '85%',  ontimeQty: 85,  totalQty: 100 },
  { id: 10, vendorDisplay: '台達電(000400055)', vendorCode: '000400055', period: '202506', ontimeRate: '92%',  ontimeQty: 46,  totalQty: 50  },
  { id: 11, vendorDisplay: '台達電(000400055)', vendorCode: '000400055', period: '202507', ontimeRate: '100%', ontimeQty: 200, totalQty: 200 },
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
// TAB 設定
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: EvalTab; label: string }[] = [
  { key: 'delivery-ontime', label: '交貨準時率' },
  { key: 'arrival-ontime',  label: '達交準時率' },
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
  const periodLabel = row.period.length === 6
    ? `${row.period.slice(0, 4)}/${row.period.slice(4, 6)}/01-${row.period.slice(0, 4)}/${row.period.slice(4, 6)}/30`
    : row.period;

  return (
    <BaseOverlay onClose={onClose} maxWidth="980px" maxHeight="640px">
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
            <div style={{ width: 160 }}>
              <SearchField
                label="訂單號碼"
                value={filterOrderNo}
                onChange={setFilterOrderNo}
                type="search"
              />
            </div>
            <div style={{ width: 140 }}>
              <SearchField
                label="訂單序號"
                value={filterOrderSeq}
                onChange={setFilterOrderSeq}
                type="search"
              />
            </div>
            <div style={{ width: 120 }}>
              <DropdownSelect
                label="是否準時"
                value={filterIsOntime}
                onChange={setFilterIsOntime}
                options={IS_ONTIME_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* ── 結果數量列 ── */}
        <div className="shrink-0 flex items-center gap-[12px] px-[24px] py-[10px] bg-[rgba(145,158,171,0.04)]">
          <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381]">
            {filteredDetails.length} results
          </span>
          <div className="flex-1" />
          {/* Export 按鈕 */}
          <button className="flex items-center gap-[6px] h-[32px] px-[12px] rounded-[6px] border border-[rgba(145,158,171,0.32)] hover:bg-[rgba(145,158,171,0.08)] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381]">Export</span>
          </button>
        </div>

        {/* ── 表格 ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <StandardDataTable<DeliveryDetailRow>
            columns={detailColumns}
            data={filteredDetails}
            storageKey="delivery-ontime-detail-v1"
            showCheckbox={false}
            externalFilteredData={filteredDetails}
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
  const filteredRows = useMemo(() => {
    let data = MOCK_DELIVERY_ROWS;
    if (filterVendor.trim()) {
      const kw = filterVendor.trim().toLowerCase();
      data = data.filter(r =>
        r.vendorDisplay.toLowerCase().includes(kw) ||
        r.vendorCode.toLowerCase().includes(kw)
      );
    }
    return data;
  }, [filterVendor]);

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
            label="訂單日期(起)"
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            type="date"
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="訂單日期(迄)"
            value={filterDateTo}
            onChange={setFilterDateTo}
            type="date"
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
            placeholder="廠商名稱或代碼"
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

      {activeTab === 'arrival-ontime' && (
        <div className="flex flex-col flex-1 min-h-0">
          <UnderConstruction title="達交準時率" />
        </div>
      )}

      {activeTab === 'evaluation-sheet' && (
        <div className="flex flex-col flex-1 min-h-0">
          <UnderConstruction title="廠商評價表" />
        </div>
      )}

    </div>
  );
}

export default VendorEvaluationPage;
