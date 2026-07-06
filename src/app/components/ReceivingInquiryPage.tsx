/**
 * ReceivingInquiryPage — Overview • 收料查詢
 *
 * TAB1：已出貨未收料（廠商已有出貨單，驗收量 = 0）
 * TAB2：應出貨未出貨（尚未實作，畫面建置中）
 * TAB3：委外加工單狀況（尚未實作，畫面建置中）
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import { PaginationControls } from './PaginationControls';
import { DraggableColumnHeader } from './table/DraggableColumnHeader';
import { measureTextWidth } from './table/tableUtils';
import { OrderDetail } from './OrderDetail';
import { ShipmentDetailPage } from './ShipmentDetailPage';
import type { CsvPrefillData } from './ShipmentDetailPage';

// ── 型別 ─────────────────────────────────────────────────────────────────────

type ReceivingTab = 'shipped-not-received' | 'should-ship-not-shipped' | 'outsource';

type RecvColKey =
  | 'company'
  | 'purchaseOrg'
  | 'orderType'
  | 'vendorCode'
  | 'orderDocSeq'
  | 'materialNo'
  | 'productName'
  | 'specification'
  | 'orderQty'
  | 'shipQty'
  | 'vendorShipmentNo'
  | 'deliveryDate';

interface RecvCol {
  key: RecvColKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export interface ReceivingRow {
  id: string;
  company: string;
  purchaseOrg: string;
  orderType: string;
  vendorCode: string;
  vendorName: string; // for search
  orderNo: string;
  orderSeq: string;
  orderDocSeq: string; // = orderNo + orderSeq display
  materialNo: string;
  productName: string;
  specification: string;
  orderQty: number;
  shipQty: number;
  vendorShipmentNo: string;
  deliveryDate: string;
  acceptQty: number; // should be 0 for this tab
}

// ── Mock 資料 ─────────────────────────────────────────────────────────────────

export const MOCK_RECEIVING_ROWS: ReceivingRow[] = [
  {
    id: 'r-001',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500100001',
    orderSeq: '10',
    orderDocSeq: '4500100001 / 10',
    materialNo: '2201-FRM0641-A01',
    productName: '鋁合金車架',
    specification: 'ROAD FRAME ALLOY 700C SIZE M MATTE BLACK',
    orderQty: 50,
    shipQty: 50,
    vendorShipmentNo: '91775295',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-002',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500100001',
    orderSeq: '20',
    orderDocSeq: '4500100001 / 20',
    materialNo: '3301-WHL0641-A02',
    productName: '輪組',
    specification: 'WHEELSET 700C DISC BRAKE 12X100/142 BLACK',
    orderQty: 32,
    shipQty: 30,
    vendorShipmentNo: '91775295',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-003',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500100002',
    orderSeq: '10',
    orderDocSeq: '4500100002 / 10',
    materialNo: '4401-STM0641-B01',
    productName: '車把立管',
    specification: 'STEM ALLOY 31.8mm±6° 100mm SILVER',
    orderQty: 100,
    shipQty: 100,
    vendorShipmentNo: '91775296',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-004',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500800070',
    orderSeq: '20',
    orderDocSeq: '4500800070 / 20',
    materialNo: '5501-RIM0641-K02',
    productName: '輪框',
    specification: 'RIM ALLOY 700C 32H DISC SILVER',
    orderQty: 200,
    shipQty: 200,
    vendorShipmentNo: '91775301',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-005',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000641',
    vendorName: '華銘',
    orderNo: '4500800071',
    orderSeq: '10',
    orderDocSeq: '4500800071 / 10',
    materialNo: '6601-TIR0641-K03',
    productName: '車胎',
    specification: 'TIRE 700x23C FOLDING BEAD BLACK',
    orderQty: 400,
    shipQty: 400,
    vendorShipmentNo: '91775301',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-006',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000045',
    vendorName: '佳承精密',
    orderNo: '4500200011',
    orderSeq: '10',
    orderDocSeq: '4500200011 / 10',
    materialNo: '9901-HDL0045-E01',
    productName: '把手組',
    specification: 'HANDLEBAR 700mm FLAT ALLOY 31.8 BLACK',
    orderQty: 60,
    shipQty: 60,
    vendorShipmentNo: 'SHP-2025-0046',
    deliveryDate: '2025/07/05',
    acceptQty: 0,
  },
  {
    id: 'r-007',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000045',
    vendorName: '佳承精密',
    orderNo: '4500200012',
    orderSeq: '10',
    orderDocSeq: '4500200012 / 10',
    materialNo: '1129-SAD0045-E02',
    productName: '坐墊',
    specification: 'SADDLE RACING 143mm BLACK',
    orderQty: 45,
    shipQty: 45,
    vendorShipmentNo: 'SHP-2025-0046',
    deliveryDate: '2025/07/05',
    acceptQty: 0,
  },
  {
    id: 'r-008',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'SB',
    vendorCode: '0001000053',
    vendorName: '久廣精密',
    orderNo: '4500300020',
    orderSeq: '10',
    orderDocSeq: '4500300020 / 10',
    materialNo: '2201-FRK0053-F01',
    productName: '前叉',
    specification: 'FORK CARBON TAPERED 1-1/8"-1.5" QR 100mm BLACK',
    orderQty: 20,
    shipQty: 20,
    vendorShipmentNo: 'INV-20250610-001',
    deliveryDate: '2025/06/10',
    acceptQty: 0,
  },
  {
    id: 'r-009',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'SB',
    vendorCode: '0001000053',
    vendorName: '久廣精密',
    orderNo: '4500300021',
    orderSeq: '10',
    orderDocSeq: '4500300021 / 10',
    materialNo: '3301-DRL0053-F02',
    productName: '傳動撥鏈器',
    specification: 'DERAILLEUR REAR 11-SPEED SHIMANO COMPATIBLE',
    orderQty: 35,
    shipQty: 35,
    vendorShipmentNo: 'INV-20250610-001',
    deliveryDate: '2025/06/10',
    acceptQty: 0,
  },
  {
    id: 'r-010',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'SB',
    vendorCode: '0001000053',
    vendorName: '久廣精密',
    orderNo: '4500300022',
    orderSeq: '10',
    orderDocSeq: '4500300022 / 10',
    materialNo: '4401-GRP0053-F03',
    productName: '握把',
    specification: 'GRIP LOCK-ON 130mm ERGONOMIC BLACK',
    orderQty: 150,
    shipQty: 150,
    vendorShipmentNo: 'INV-20250610-001',
    deliveryDate: '2025/06/10',
    acceptQty: 0,
  },
  {
    id: 'r-011',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000059',
    vendorName: '金盛元工業',
    orderNo: '4500400030',
    orderSeq: '10',
    orderDocSeq: '4500400030 / 10',
    materialNo: '6601-CHN0059-G01',
    productName: '鏈條',
    specification: 'CHAIN 11-SPEED 116L NICKEL PLATED',
    orderQty: 500,
    shipQty: 500,
    vendorShipmentNo: 'INV-20250620-002',
    deliveryDate: '2025/06/20',
    acceptQty: 0,
  },
  {
    id: 'r-012',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000012',
    vendorName: '台灣製造',
    orderNo: '4500500040',
    orderSeq: '10',
    orderDocSeq: '4500500040 / 10',
    materialNo: '7701-HDL0012-H01',
    productName: '車頭碗',
    specification: 'HEADSET INTEGRATED 1-1/8" CARTRIDGE BLACK',
    orderQty: 100,
    shipQty: 100,
    vendorShipmentNo: 'VND-2025-88001',
    deliveryDate: '2025/08/01',
    acceptQty: 0,
  },
  {
    id: 'r-013',
    company: '捷安特',
    purchaseOrg: 'GIANT採購',
    orderType: 'NB',
    vendorCode: '0001000012',
    vendorName: '台灣製造',
    orderNo: '4500500041',
    orderSeq: '10',
    orderDocSeq: '4500500041 / 10',
    materialNo: '8801-FRM0012-H02',
    productName: '車架',
    specification: 'FRAME ALLOY MTB 27.5 M MATTE GREY',
    orderQty: 80,
    shipQty: 80,
    vendorShipmentNo: 'VND-2025-88001',
    deliveryDate: '2025/08/01',
    acceptQty: 0,
  },
  {
    id: 'r-014',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000046',
    vendorName: '速聯國際',
    orderNo: '4500600050',
    orderSeq: '10',
    orderDocSeq: '4500600050 / 10',
    materialNo: '9901-BRK0046-I01',
    productName: '煞車卡鉗',
    specification: 'BRAKE CALIPER HYDRAULIC DISC FLAT MOUNT BLACK',
    orderQty: 30,
    shipQty: 30,
    vendorShipmentNo: 'VND-2025-88002',
    deliveryDate: '2025/09/01',
    acceptQty: 0,
  },
  {
    id: 'r-015',
    company: '巨大機械',
    purchaseOrg: 'GEM採購',
    orderType: 'NB',
    vendorCode: '0001000046',
    vendorName: '速聯國際',
    orderNo: '4500600051',
    orderSeq: '10',
    orderDocSeq: '4500600051 / 10',
    materialNo: '1129-FRK0046-I02',
    productName: '前叉避震',
    specification: 'FORK SUSPENSION 27.5 130mm TRAVEL 15x110 BOOST',
    orderQty: 25,
    shipQty: 25,
    vendorShipmentNo: 'VND-2025-88002',
    deliveryDate: '2025/09/01',
    acceptQty: 0,
  },
];

// ── 採購組織選項 ──────────────────────────────────────────────────────────────
const PURCHASE_ORG_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'GEM採購', label: 'GEM採購' },
  { value: 'GIANT採購', label: 'GIANT採購' },
];

// ── 欄位定義 ─────────────────────────────────────────────────────────────────
const DEFAULT_COLS: RecvCol[] = [
  { key: 'company',          label: '公司',         width: 110, minWidth: 90  },
  { key: 'purchaseOrg',      label: '採購組織',     width: 120, minWidth: 100 },
  { key: 'orderType',        label: '訂單類型',     width: 100, minWidth: 80  },
  { key: 'vendorCode',       label: '供應商(編號)', width: 180, minWidth: 140 },
  { key: 'orderDocSeq',      label: '單號序號',     width: 180, minWidth: 150 },
  { key: 'materialNo',       label: '料號',         width: 200, minWidth: 150 },
  { key: 'productName',      label: '品名',         width: 140, minWidth: 100 },
  { key: 'specification',    label: '規格敘述',     width: 280, minWidth: 160 },
  { key: 'orderQty',         label: '訂貨量',       width: 90,  minWidth: 70  },
  { key: 'shipQty',          label: '出貨量',       width: 90,  minWidth: 70  },
  { key: 'vendorShipmentNo', label: '廠商出貨單號', width: 160, minWidth: 120 },
  { key: 'deliveryDate',     label: '交貨日期',     width: 120, minWidth: 100 },
];

const STORAGE_KEY = 'receivingInquiry_shipped_v1_cols';
const DRAG_TYPE   = 'recv-col';

// (ReadonlyField, OrderDetailOverlay, ShipmentDetailOverlay 已移除 —— 請使用現成的 OrderDetail 與 ShipmentDetailPage)


// ── 畫面建置中（其他 TAB）────────────────────────────────────────────────────
function UnderDevelopment({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[24px] px-[40px]">
      {/* 圖示 */}
      <div className="w-[72px] h-[72px] rounded-[20px] bg-[rgba(0,94,184,0.08)] flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] mb-[8px]">
          {title}
        </p>
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
          此功能正在開發中，敬請期待
        </p>
      </div>
    </div>
  );
}

// ── TAB1：已出貨未收料 ───────────────────────────────────────────────────────
interface ShippedNotReceivedTabProps {
  onOrderDetail: (row: ReceivingRow) => void;
  onShipmentDetail: (row: ReceivingRow) => void;
}
function ShippedNotReceivedTab({ onOrderDetail, onShipmentDetail }: ShippedNotReceivedTabProps) {
  // ── 搜尋狀態 ──
  const [purchaseOrg, setPurchaseOrg]     = useState('');
  const [vendorKeyword, setVendorKeyword] = useState('');
  const [materialKeyword, setMaterialKeyword] = useState('');

  // ── 欄位設定 ──
  const [columns, setColumns] = useState<RecvCol[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { key: RecvColKey; width: number; visible?: boolean }[];
        const keyOrder = parsed.map(p => p.key);
        const sorted = [...DEFAULT_COLS].sort(
          (a, b) => keyOrder.indexOf(a.key) - keyOrder.indexOf(b.key)
        );
        return sorted.map(c => {
          const s = parsed.find(p => p.key === c.key);
          return { ...c, width: s?.width ?? c.width, visible: s?.visible ?? true };
        });
      }
    } catch {}
    return DEFAULT_COLS.map(c => ({ ...c, visible: true }));
  });

  const visibleColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);
  const totalWidth = useMemo(() => visibleColumns.reduce((s, c) => s + c.width, 0), [visibleColumns]);

  // 儲存欄位設定
  useEffect(() => {
    const toSave = columns.map(c => ({ key: c.key, width: c.width, visible: c.visible }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [columns]);

  // ── Toolbar 狀態 ──
  const [showColSelector, setShowColSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

  // ── Overlay ──
  // (明細頁由上層 ReceivingInquiryPage 管理，透過 props 傳入 callback)

  // ── DnD resize（欄寬由 DraggableColumnHeader 內部管理，這裡只需要 updateColumnWidth 回呼） ──
  const updateColumnWidth = useCallback((key: string, width: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width } : c));
  }, []);

  const autoFitWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    if (!col) return;
    const headerW = measureTextWidth(col.label, '600 14px "Public Sans","Noto Sans JP",sans-serif') + 32 + 16;
    let maxDataW = 0;
    MOCK_RECEIVING_ROWS.forEach(row => {
      const val = String((row as any)[key] ?? '');
      const w = measureTextWidth(val, '14px "Public Sans","Noto Sans JP",sans-serif') + 32;
      if (w > maxDataW) maxDataW = w;
    });
    const bestFit = Math.max(col.minWidth, Math.ceil(Math.max(headerW, maxDataW)));
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width: bestFit } : c));
  }, [columns]);

  const moveColumn = useCallback((dragKey: string, hoverKey: string) => {
    setColumns(prev => {
      const arr = [...prev];
      const from = arr.findIndex(c => c.key === dragKey);
      const to   = arr.findIndex(c => c.key === hoverKey);
      if (from < 0 || to < 0) return prev;
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      return arr;
    });
  }, []);

  // ── 橫向拖拉捲動 ──
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 篩選 ──
  const filteredData = useMemo(() => {
    let data = MOCK_RECEIVING_ROWS;

    // 搜尋列篩選
    if (purchaseOrg) data = data.filter(r => r.purchaseOrg === purchaseOrg);
    if (vendorKeyword.trim()) {
      const kw = vendorKeyword.trim().toLowerCase();
      data = data.filter(r =>
        r.vendorName.toLowerCase().includes(kw) || r.vendorCode.toLowerCase().includes(kw)
      );
    }
    if (materialKeyword.trim()) {
      const kw = materialKeyword.trim().toLowerCase();
      data = data.filter(r => r.materialNo.toLowerCase().includes(kw));
    }

    // FilterDialog 條件
    filters.forEach(f => {
      data = data.filter(row => {
        const val = String((row as any)[f.column] ?? '').toLowerCase();
        const term = f.value.toLowerCase();
        switch (f.operator) {
          case 'contains':    return val.includes(term);
          case 'equals':      return val === term;
          case 'startsWith':  return val.startsWith(term);
          case 'notContains': return !val.includes(term);
          default:            return true;
        }
      });
    });
    return data;
  }, [purchaseOrg, vendorKeyword, materialKeyword, filters]);

  // 分頁
  useEffect(() => { setPage(1); }, [purchaseOrg, vendorKeyword, materialKeyword, filters]);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // ── 欄位顯示/隱藏 ──
  const colSelectorItems = useMemo(() =>
    columns.map(c => ({ key: c.key, label: c.label, visible: c.visible !== false })),
    [columns]
  );

  const filterColumns = useMemo(() =>
    columns.map(c => ({ key: c.key, label: c.label })),
    [columns]
  );

  // ── 匯出 CSV ──
  const handleExportCsv = useCallback(() => {
    const header = visibleColumns.map(c => c.label).join(',');
    const rows = filteredData.map(row =>
      visibleColumns.map(c => `"${String((row as any)[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '已出貨未收料.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [filteredData, visibleColumns]);

  // ── 儲存格渲染 ──────────────────────────────────────────────────────────────
  const renderCell = (col: RecvCol, row: ReceivingRow) => {
    switch (col.key) {
      case 'vendorCode':
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
            {row.vendorName}（{row.vendorCode}）
          </span>
        );
      case 'orderDocSeq':
        return (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer text-left"
            onClick={() => onOrderDetail(row)}
          >
            {row.orderDocSeq}
          </button>
        );
      case 'vendorShipmentNo':
        return (
          <button
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer text-left"
            onClick={() => onShipmentDetail(row)}
          >
            {row.vendorShipmentNo}
          </button>
        );
      case 'orderQty':
      case 'shipQty':
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
            {(row as any)[col.key]}
          </span>
        );
      default:
        return (
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate block" title={String((row as any)[col.key] ?? '')}>
            {(row as any)[col.key] ?? '—'}
          </span>
        );
    }
  };

  return (
    <>
      {/* ── 搜尋列（平均欄寬：每個欄位用 flex-1 min-w-0 包裹）── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        {/* 採購組織 */}
        <div className="flex-1 min-w-0">
          <DropdownSelect
            label="採購組織"
            value={purchaseOrg}
            onChange={setPurchaseOrg}
            options={PURCHASE_ORG_OPTIONS}
          />
        </div>
        {/* 供應商 */}
        <div className="flex-1 min-w-0">
          <SearchField
            label="供應商"
            value={vendorKeyword}
            onChange={setVendorKeyword}
            placeholder="名稱或代碼關鍵字"
          />
        </div>
        {/* 料號 */}
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={materialKeyword}
            onChange={setMaterialKeyword}
            placeholder="料號關鍵字"
          />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <TableToolbar
        resultCount={filteredData.length}
        onToggleColumnSelector={() => setShowColSelector(v => !v)}
        onToggleFilterDialog={() => setShowFilterDialog(v => !v)}
        onExportCsv={handleExportCsv}
        filterCount={filters.length}
      />

      {/* ColumnSelector */}
      {showColSelector && (
        <ColumnSelector
          columns={colSelectorItems}
          onClose={() => setShowColSelector(false)}
          onChange={updated => {
            setColumns(prev =>
              updated
                .map(u => {
                  const col = prev.find(c => c.key === u.key);
                  return col ? { ...col, visible: u.visible } : null;
                })
                .filter(Boolean) as RecvCol[]
            );
          }}
        />
      )}

      {/* FilterDialog */}
      {showFilterDialog && (
        <FilterDialog
          columns={filterColumns}
          filters={filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={f => { setFilters(f); setShowFilterDialog(false); }}
        />
      )}

      {/* ── 表格 ── */}
      <DndProvider backend={HTML5Backend}>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((col, idx) => (
                <DraggableColumnHeader
                  key={col.key}
                  column={col}
                  index={idx}
                  dragType={DRAG_TYPE}
                  isLast={idx === visibleColumns.length - 1}
                  moveColumn={moveColumn}
                  updateColumnWidth={updateColumnWidth}
                  autoFitWidth={autoFitWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    setSortConfig(prev =>
                      prev.key === key
                        ? { key, direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc' }
                        : { key, direction: 'asc' }
                    );
                  }}
                />
              ))}
            </div>

            {/* 資料列 */}
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center py-[60px]">
                <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">查無資料</span>
              </div>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <div
                  key={row.id}
                  className={`flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${rowIdx % 2 === 0 ? '' : 'bg-[rgba(145,158,171,0.02)]'}`}
                >
                  {visibleColumns.map((col, colIdx) => (
                    <div
                      key={col.key}
                      style={colIdx === visibleColumns.length - 1 ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                      className={`flex items-center px-[16px] py-[12px] overflow-hidden ${colIdx < visibleColumns.length - 1 ? 'border-r border-[rgba(145,158,171,0.08)]' : ''}`}
                    >
                      {renderCell(col, row)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </DndProvider>

      {/* ── 分頁 ── */}
      <PaginationControls
        total={filteredData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setPage(1); }}
      />

      {/* ── Overlays（已移至上層 ReceivingInquiryPage 管理）── */}
    </>
  );
}

// ── TabItem（對齊設計規範）────────────────────────────────────────────────────
function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer select-none"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
const TABS: { key: ReceivingTab; label: string }[] = [
  { key: 'shipped-not-received',    label: '已出貨未收料' },
  { key: 'should-ship-not-shipped', label: '應出貨未出貨' },
  { key: 'outsource',               label: '委外加工單狀況' },
];

export function ReceivingInquiryPage() {
  const [activeTab, setActiveTab] = useState<ReceivingTab>('shipped-not-received');

  // ── 訂單明細（整頁替換） ──────────────────────────────────────────────────
  const [orderDetailRow, setOrderDetailRow] = useState<ReceivingRow | null>(null);

  // ── 出貨單明細（整頁替換） ────────────────────────────────────────────────
  const [shipmentDetailRow, setShipmentDetailRow] = useState<ReceivingRow | null>(null);

  // ── 訂單明細：整頁替換 ────────────────────────────────────────────────────
  if (orderDetailRow) {
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={() => setOrderDetailRow(null)}
          orderData={{
            orderNo:  orderDetailRow.orderNo,
            orderSeq: orderDetailRow.orderSeq,
            vendor:   `${orderDetailRow.vendorName}（${orderDetailRow.vendorCode}）`,
            status:   'CK',
            orderQty: orderDetailRow.orderQty,
          }}
          isReadOnly={true}
        />
      </div>
    );
  }

  // ── 出貨單明細：整頁替換（readOnly mode + csvData 提供明細行）────────────
  if (shipmentDetailRow) {
    // 同一廠商出貨單下所有序號
    const relatedRows = MOCK_RECEIVING_ROWS.filter(r => r.vendorShipmentNo === shipmentDetailRow.vendorShipmentNo);
    const csvData: CsvPrefillData = {
      vendorShipmentNo: shipmentDetailRow.vendorShipmentNo,
      currency:         'TWD',
      transportType:    'S',
      deliveryDate:     shipmentDetailRow.deliveryDate,
      arrivalDate:      '',
      deliveryAddress:  '',
      rows: relatedRows.map((r, idx) => ({
        itemNo:           idx + 1,
        orderNo:          r.orderNo,
        orderSeq:         r.orderSeq,
        shipQty:          r.shipQty,
        qtyPerBox:        '',
        netWeight:        '0',
        grossWeight:      '0',
        weightUnit:       'KG',
        countryOfOrigin:  'TW',
      })),
    };
    return (
      <ShipmentDetailPage
        selectedOrders={[]}
        readOnly={true}
        sapDeliveryNo={shipmentDetailRow.vendorShipmentNo}
        csvData={csvData}
        onClose={() => setShipmentDetailRow(null)}
      />
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── TAB 列（對齊設計規範：gap-40, px-20, 底部灰線）── */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-auto">
            {TABS.map(tab => (
              <TabItem
                key={tab.key}
                label={tab.label}
                isActive={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
            {/* 底部灰色底線 */}
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ── TAB 內容 ── */}
      {activeTab === 'shipped-not-received'    && (
        <ShippedNotReceivedTab
          onOrderDetail={setOrderDetailRow}
          onShipmentDetail={setShipmentDetailRow}
        />
      )}
      {activeTab === 'should-ship-not-shipped' && <UnderDevelopment title="應出貨未出貨" />}
      {activeTab === 'outsource'               && <UnderDevelopment title="委外加工單狀況" />}
    </div>
  );
}
