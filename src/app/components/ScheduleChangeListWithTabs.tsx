import { useState, useRef, useCallback, useMemo } from 'react';
import { AdvancedOrderTable, getOrderColumns, defaultOrderColumns } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn, ScheduleLine } from './AdvancedOrderTable';
import { OrderDetail } from './OrderDetail';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { exportOrdersCsv, exportOrdersExcel } from './OrderCsvManager';
import { BatchApproveDialog } from './OrderBatchDialogs';
import { useOrderStore, nowDateStr, operatorByRole, type HistoryEntry } from './OrderStoreContext';
import { computeRowDayDiff } from './AdvancedOrderTable';

// ── 變更生管排程專用欄位配置（預設顯示 productionScheduleDate / prodSchedDayDiff）──
const SCHED_CHANGE_STORAGE_KEY_PREFIX = 'orderList_v2_sched_change';

function getScheduleChangeColumns(): OrderColumn[] {
  return defaultOrderColumns.map(col => {
    if (col.key === 'schedLineIndex')         return { ...col, visible: true };
    if (col.key === 'productionScheduleDate') return { ...col, visible: true };
    if (col.key === 'prodSchedDayDiff')        return { ...col, visible: true };
    return { ...col };
  });
}

// ── CSV 欄位定義 ────────────────────────────────────────────────────────────
// 欄位說明：訂單序號=orderSeq（如100）、項次=排程項次（如1/2/3）
const CSV_HEADERS = ['訂單號碼', '訂單序號', '項次', '料號', '預計交期', '生管用交貨日期', '交貨量'];

// ── 日期正規化：接受 YYYY/M/D、YYYY-M-D、YYYY.M.D，輸出 YYYY/MM/DD ────────
// 回傳 null 表示非空但格式/值域不合法
function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return '';
  const m = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day   = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // 用 Date 確認值域（e.g. 2/30 不合法）
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return `${m[1]}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

interface ParsedCsvRow {
  orderNo: string;
  docSeqNo: string;
  orderSeq: string;
  materialNo: string;
  expectedDelivery: string;
  productionScheduleDate: string;
  deliveryQty: string;
  _matchedId?: number; // 匹配到的 OrderRow.id
  _error?: string;
}

// ── 上傳確認 Modal ──────────────────────────────────────────────────────────
interface UploadModalProps {
  rows: ParsedCsvRow[];
  onConfirm: () => void;
  onClose: () => void;
}

function UploadPreviewModal({ rows, onConfirm, onClose }: UploadModalProps) {
  const validRows   = rows.filter(r => !r._error && r._matchedId !== undefined && r.productionScheduleDate.trim() !== '');
  const errorRows   = rows.filter(r => !!r._error);
  const skippedRows = rows.filter(r => !r._error && r.productionScheduleDate.trim() === '');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_-4px_rgba(145,158,171,0.24)] w-[820px] max-w-[96vw] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[rgba(145,158,171,0.24)]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#e8f4fd] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.667 10.833V15a1.667 1.667 0 01-1.667 1.667H5a1.667 1.667 0 01-1.667-1.667V5A1.667 1.667 0 015 3.333h4.167M13.333 2.5h4.167v4.167M8.333 11.667l9.167-9.167" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">上傳大量變更 — 預覽確認</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                共 {rows.length} 筆資料：{validRows.length} 筆可套用、{skippedRows.length} 筆無日期(略過)、{errorRows.length} 筆無法匹配
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-[32px] h-[32px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="#637381" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[16px]">
          {/* 可套用區 */}
          {validRows.length > 0 && (
            <div className="mb-[16px]">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#22c55e]" />
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">將套用 {validRows.length} 筆生管用交貨日期</p>
              </div>
              <div className="rounded-[8px] border border-[rgba(145,158,171,0.24)] overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#f4f6f8]">
                    <tr>
                      {['訂單號碼', '訂單序號', '料號', '生管用交貨日期'].map(h => (
                        <th key={h} className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#637381] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[rgba(145,158,171,0.04)]'}>
                        <td className="px-[12px] py-[8px] text-[#1c252e]">{r.orderNo}</td>
                        <td className="px-[12px] py-[8px] text-[#1c252e] font-mono">{r.orderSeq}</td>
                        <td className="px-[12px] py-[8px] text-[#1c252e]">{r.materialNo}</td>
                        <td className="px-[12px] py-[8px]">
                          <span className="inline-flex items-center gap-[4px] bg-[#e8f4fd] text-[#005eb8] px-[8px] py-[2px] rounded-[4px] font-['Public_Sans:SemiBold',sans-serif] font-semibold">
                            {r.productionScheduleDate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 略過區 */}
          {skippedRows.length > 0 && (
            <div className="mb-[16px]">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#ffa726]" />
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">略過 {skippedRows.length} 筆（生管用交貨日期為空）</p>
              </div>
              <div className="rounded-[8px] border border-[rgba(145,158,171,0.24)] overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#f4f6f8]">
                    <tr>
                      {['訂單號碼', '訂單序號', '料號'].map(h => (
                        <th key={h} className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#637381]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {skippedRows.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[rgba(145,158,171,0.04)]'}>
                        <td className="px-[12px] py-[8px] text-[#637381]">{r.orderNo}</td>
                        <td className="px-[12px] py-[8px] text-[#637381] font-mono">{(r.orderNo || '') + (r.orderSeq || '')}</td>
                        <td className="px-[12px] py-[8px] text-[#637381]">{r.materialNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 錯誤區 */}
          {errorRows.length > 0 && (
            <div>
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#ff5630]" />
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">{errorRows.length} 筆無法匹配的訂單序號</p>
              </div>
              <div className="rounded-[8px] border border-[rgba(255,86,48,0.2)] overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-[#fff2f0]">
                    <tr>
                      {['訂單序號', '錯誤原因'].map(h => (
                        <th key={h} className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#b71d18]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {errorRows.map((r, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-[12px] py-[8px] text-[#b71d18] font-mono">{r.orderSeq}</td>
                        <td className="px-[12px] py-[8px] text-[#b71d18]">{r._error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {validRows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[40px] gap-[8px]">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#fff7e6"/>
                <path d="M24 16v8M24 30v2" stroke="#ffa726" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381]">無可套用的資料</p>
              <p className="text-[13px] text-[#919eab]">請確認 CSV 中已填寫「生管用交貨日期」欄位</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.24)]">
          <button
            onClick={onClose}
            className="h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] border-solid bg-white hover:bg-[rgba(145,158,171,0.08)] transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381]"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={validRows.length === 0}
            className="h-[36px] px-[20px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] disabled:bg-[rgba(145,158,171,0.24)] disabled:cursor-not-allowed transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white"
          >
            確認套用 {validRows.length > 0 ? `(${validRows.length} 筆)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
interface ScheduleChangeListWithTabsProps {
  userRole?: 'vendor' | 'purchaser' | 'giant';
}

export function ScheduleChangeListWithTabs({ userRole }: ScheduleChangeListWithTabsProps) {
  // ── Order Store ─────────────────────────────────────────────────────────────
  const { orders, updateOrderStatus, updateOrderFields, addOrderHistory, getOrderHistory } = useOrderStore();
  const ckOrders: OrderRow[] = orders.filter(o => o.status === 'CK');

  // ── Detail overlay ──────────────────────────────────────────────────────────
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

  // ── Column / Filter ─────────────────────────────────────────────────────────
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns] = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // ── Checkbox ────────────────────────────────────────────────────────────────
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

  // ── Search ──────────────────────────────────────────────────────────────────
  const [docSeqNoSearch, setDocSeqNoSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');

  // ── Batch dialogs ───────────────────────────────────────────────────────────
  const [batchDialog, setBatchDialog] = useState<'approve' | null>(null);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 匯出 Excel / CSV（透過 TableToolbar 內建 Export 按鈕觸發）──────────────
  const handleExportExcel = () => {
    const currentCols = availableColumns.length > 0 ? availableColumns : getScheduleChangeColumns();
    const count = exportOrdersExcel(filteredOrders, `變更生管排程匯出_${new Date().toISOString().slice(0, 10)}.xlsx`, currentCols);
    showToast(`已匯出 ${count} 筆生管排程 (Excel)`);
  };
  const handleExportCsv = () => {
    const currentCols = availableColumns.length > 0 ? availableColumns : getScheduleChangeColumns();
    exportOrdersCsv(filteredOrders, `變更生管排程匯出_${new Date().toISOString().slice(0, 10)}.csv`, currentCols);
    showToast(`已匯出 ${filteredOrders.length} 筆生管排程 (CSV)`);
  };

  // ── User email ──────────────────────────────────────────────────────────────
  const [currentUserEmail] = useState(() => localStorage.getItem('currentUserEmail') || 'default');

  // ── Upload modal ────────────────────────────────────────────────────────────
  const [uploadRows, setUploadRows] = useState<ParsedCsvRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 搜尋 + 進階篩選後的資料（供 AdvancedOrderTable 和 CSV 下載共用）──────
  const filteredOrders = useMemo(() => {
    let list = [...ckOrders];

    // 搜尋欄：單號序號
    if (docSeqNoSearch.trim()) {
      const q = docSeqNoSearch.toLowerCase();
      list = list.filter(o =>
        ((o.orderNo || '') + (o.orderSeq || '')).toLowerCase().includes(q) ||
        (o.orderNo ?? '').toLowerCase().includes(q)
      );
    }
    // 搜尋欄：廠商(編號)
    if (vendorSearch.trim()) {
      const q = vendorSearch.toLowerCase();
      list = list.filter(o =>
        (o.vendorName ?? '').toLowerCase().includes(q) ||
        (o.vendorCode ?? '').toLowerCase().includes(q)
      );
    }
    // 進階篩選
    if (appliedFilters.length > 0) {
      list = list.filter(item =>
        appliedFilters.every(filter => {
          let rawValue: string;
          if (filter.column === 'dayDiff') {
            const diff = computeRowDayDiff(item);
            rawValue = diff === null ? '-' : diff > 0 ? `+${diff}` : `${diff}`;
          } else {
            const v = item[filter.column as keyof OrderRow];
            rawValue = v !== undefined && v !== null ? String(v) : '';
          }
          switch (filter.operator) {
            case 'contains':   return rawValue.toLowerCase().includes(filter.value.toLowerCase());
            case 'equals':     return rawValue.toLowerCase() === filter.value.toLowerCase();
            case 'notEquals':  return rawValue.toLowerCase() !== filter.value.toLowerCase();
            case 'startsWith': return rawValue.toLowerCase().startsWith(filter.value.toLowerCase());
            case 'endsWith':   return rawValue.toLowerCase().endsWith(filter.value.toLowerCase());
            case 'isEmpty':    return !rawValue || rawValue.trim() === '' || rawValue === '-';
            case 'isNotEmpty': return rawValue.trim() !== '' && rawValue !== '-';
            default:           return true;
          }
        })
      );
    }
    return list;
  }, [ckOrders, docSeqNoSearch, vendorSearch, appliedFilters]);

  // ── 下載 CSV ──────────────────────────────────────────────────────────────
  const handleDownloadCSV = useCallback(() => {
    // 所有欄位一律加雙引號，避免 Excel 把數字字串（orderNo/orderSeq）轉成科學記號
    const esc = (s: string | number | undefined | null) => {
      const str = s !== undefined && s !== null ? String(s) : '';
      return `"${str.replace(/"/g, '""')}"`;
    };

    // 計算項次顯示值（scheduleLines 為空時預設 1）
    const getSchedIndex = (o: OrderRow) => {
      const sl = o.scheduleLines;
      if (!sl || sl.length === 0) return '1';
      if (sl.length === 1) return String(sl[0].index);
      return sl.map(l => l.index).join('/');
    };

    const lines: string[] = [CSV_HEADERS.map(h => `"${h}"`).join(',')];
    filteredOrders.forEach(o => {
      lines.push([
        esc(o.orderNo),
        esc(o.orderSeq),                          // 訂單序號（如 100），非 docSeqNo
        esc(getSchedIndex(o)),                    // 項次（如 1 或 1/2/3）
        esc(o.materialNo),
        esc(o.expectedDelivery),
        esc(o.productionScheduleDate ?? ''),      // 生管用交貨日期（空白待填）
        esc(o.deliveryQty),
      ].join(','));
    });

    const bom = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.download = `生管排程變更_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已下載 ${filteredOrders.length} 筆資料的 CSV`);
  }, [filteredOrders]);

  // ── 上傳：解析 CSV ────────────────────────────────────────────────────────
  const parseCsv = useCallback((text: string): ParsedCsvRow[] => {
    const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    // 允許 header 順序不固定，根據 header 行取欄位索引
    const headerLine = lines[0].split(',').map(h => h.replace(/^\uFEFF/, '').trim().replace(/^"|"$/g, ''));
    const idx = (name: string) => headerLine.indexOf(name);

    const iOrderNo     = idx('訂單號碼');
    const iOrderSeq    = idx('訂單序號');  // 對應 orderSeq（如 100）
    const iSchedIdx    = idx('項次');      // 排程項次，僅供參考
    const iMaterialNo  = idx('料號');
    const iExpected    = idx('預計交期');
    const iProdDate    = idx('生管用交貨日期');
    const iDeliveryQty = idx('交貨量');

    // 以 orderNo + orderSeq 組合鍵查找 OrderRow.id
    const orderKeyMap = new Map<string, number>();
    ckOrders.forEach(o => orderKeyMap.set(`${o.orderNo}||${o.orderSeq}`, o.id));

    const result: ParsedCsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const get = (idx: number) => idx >= 0 ? (cells[idx] ?? '') : '';

      const orderNo  = get(iOrderNo);
      const orderSeq = get(iOrderSeq);
      const matchedId = orderKeyMap.get(`${orderNo}||${orderSeq}`);

      // 日期正規化：YYYY/M/D → YYYY/MM/DD，非空但格式錯誤時回傳 null
      const rawDate       = get(iProdDate);
      const normalizedDate = normalizeDate(rawDate);
      const dateError     = rawDate.trim() !== '' && normalizedDate === null
        ? `日期格式不符（輸入: "${rawDate}"），請使用 YYYY/MM/DD`
        : undefined;

      result.push({
        orderNo,
        docSeqNo:               get(iSchedIdx),
        orderSeq,
        materialNo:             get(iMaterialNo),
        expectedDelivery:       get(iExpected),
        productionScheduleDate: normalizedDate ?? rawDate, // 格式錯誤時保留原值供 Modal 顯示
        deliveryQty:            get(iDeliveryQty),
        _matchedId:             matchedId,
        _error:                 matchedId === undefined
          ? `找不到對應訂單（號碼: ${orderNo}, 序號: ${orderSeq}）`
          : dateError,
      });
    }
    return result;
  }, [ckOrders]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      setUploadRows(rows);
    };
    reader.readAsText(file, 'utf-8');
    // 清空 input value，允許重複選同一檔案
    e.target.value = '';
  }, [parseCsv]);

  const handleUploadConfirm = useCallback(() => {
    if (!uploadRows) return;
    const validRows = uploadRows.filter(r => !r._error && r._matchedId !== undefined && r.productionScheduleDate.trim() !== '');
    const now = nowDateStr();
    const operator = operatorByRole(userRole);
    validRows.forEach(r => {
      updateOrderFields(r._matchedId!, { productionScheduleDate: r.productionScheduleDate });
      addOrderHistory(r._matchedId!, {
        date: now,
        event: '批次匯入生管用交貨日期',
        operator,
        remark: `生管用交貨日期設定為 ${r.productionScheduleDate}`,
      });
    });
    setUploadRows(null);
    showToast(`已成功套用 ${validRows.length} 筆生管用交貨日期`);
  }, [uploadRows, updateOrderFields, addOrderHistory, userRole]);

  // ── Filtered count ──────────────────────────────────────────────────────────
  const getFilteredCount = () => filteredOrders.length;

  // ── Select all ──────────────────────────────────────────────────────────────
  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.has(o.id));
  const handleSelectAll = () => {
    if (isAllSelected) {
      const s = new Set(selectedOrderIds);
      filteredOrders.forEach(o => s.delete(o.id));
      setSelectedOrderIds(s);
    } else {
      const s = new Set(selectedOrderIds);
      filteredOrders.forEach(o => s.add(o.id));
      setSelectedOrderIds(s);
    }
  };
  const handleToggleOrder = (orderId: number) => {
    const s = new Set(selectedOrderIds);
    s.has(orderId) ? s.delete(orderId) : s.add(orderId);
    setSelectedOrderIds(s);
  };

  // ── Order actions ───────────────────────────────────────────────────────────
  const handleOrderConfirmClick = (order: OrderRow) => { setSelectedOrder(order); setIsReadOnlyMode(false); setShowOrderDetail(true); };
  const handleMoreOptionsClick  = (order: OrderRow) => { setSelectedOrder(order); setIsReadOnlyMode(true);  setShowOrderDetail(true); };
  const handleCloseDetail = () => { setShowOrderDetail(false); setSelectedOrder(null); setIsReadOnlyMode(false); };

  const handleStatusChange = (
    newStatus: string,
    eventText: string,
    remark?: string,
    vendorDeliveryDate?: string,
    splitLines?: ScheduleLine[]
  ) => {
    if (!selectedOrder) return;
    const entry: HistoryEntry = { date: nowDateStr(), event: eventText, operator: operatorByRole(userRole), remark: remark ?? '' };
    const rowUpdate: Partial<Omit<OrderRow, 'id' | 'status'>> = {};
    if (vendorDeliveryDate) rowUpdate.vendorDeliveryDate = vendorDeliveryDate;
    if (splitLines && splitLines.length > 0) {
      rowUpdate.scheduleLines = splitLines;
      if (splitLines.length >= 2) rowUpdate.vendorDeliveryDate = splitLines[splitLines.length - 1].deliveryDate;
    }
    updateOrderStatus(selectedOrder.id, newStatus as OrderRow['status'], entry, Object.keys(rowUpdate).length > 0 ? rowUpdate : undefined);
    setShowOrderDetail(false);
    setSelectedOrder(null);
    showToast(`訂單已更新為 ${newStatus} 狀態`);
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const handleColumnsChange = (cols: OrderColumn[]) => setAvailableColumns(cols);

  const handleColumnsClick = () => {
    let cols = availableColumns;
    if (cols.length === 0) {
      const storageKey = `${SCHED_CHANGE_STORAGE_KEY_PREFIX}_${currentUserEmail}_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedCols = JSON.parse(saved) as OrderColumn[];
          // 以 getScheduleChangeColumns() 為基底，套用已存的寬度與可見性
          cols = getScheduleChangeColumns().map(col => {
            const s = savedCols.find(x => x.key === col.key);
            return s ? { ...col, width: s.width, visible: s.visible } : col;
          });
        } else {
          cols = getScheduleChangeColumns();
        }
      } catch { cols = getScheduleChangeColumns(); }
    }
    setTempColumns(JSON.parse(JSON.stringify(cols)));
    setShowColumnSelector(!showColumnSelector);
  };

  const handleApplyColumns = () => {
    const storageKey = `${SCHED_CHANGE_STORAGE_KEY_PREFIX}_${currentUserEmail}_columns`;
    try { localStorage.setItem(storageKey, JSON.stringify(tempColumns)); } catch { /* ignore */ }
    setAvailableColumns(tempColumns);
    setColumnsVersion(v => v + 1);
    setShowColumnSelector(false);
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const handleApplyFilters = () => { setAppliedFilters(filters); setShowFilterDialog(false); };

  // ── Batch ────────────────────────────────────────────────────────────────────
  const getSelectedOrders = () => filteredOrders.filter(o => selectedOrderIds.has(o.id));
  const handleBatchAction = (action: 'approve') => {
    setBatchDialog(action);
  };

  // ── Detail view ─────────────────────────────────────────────────────────────
  // 用 live lookup 確保進入詳情後永遠取到 store 最新資料（含批次匯入後的 productionScheduleDate）
  const liveSelectedOrder = selectedOrder
    ? (orders.find(o => o.id === selectedOrder.id) ?? selectedOrder)
    : null;

  if (showOrderDetail) {
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={handleCloseDetail}
          orderData={liveSelectedOrder ? {
            orderNo:                liveSelectedOrder.orderNo,
            orderSeq:               liveSelectedOrder.orderSeq,
            vendor:                 liveSelectedOrder.vendorName,
            status:                 liveSelectedOrder.status,
            vendorDeliveryDate:     liveSelectedOrder.vendorDeliveryDate,
            scheduleLines:          liveSelectedOrder.scheduleLines,
            productionScheduleDate: liveSelectedOrder.productionScheduleDate,
            orderQty:               liveSelectedOrder.orderQty,
            comparePrice:           liveSelectedOrder.comparePrice,
            unit:                   liveSelectedOrder.unit,
            acceptQty:              liveSelectedOrder.acceptQty,
          } : undefined}
          onStatusChange={handleStatusChange}
          isReadOnly={isReadOnlyMode}
          userRole={userRole}
          orderHistory={liveSelectedOrder ? getOrderHistory(liveSelectedOrder.id) : []}
          hideChatIcon={true}
        />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋欄 ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-[16px] items-end flex-wrap px-[20px] pt-[16px] pb-[14px] shrink-0">
        <SearchField label="單號序號"   value={docSeqNoSearch} onChange={setDocSeqNoSearch} />
        <SearchField label="廠商(編號)" value={vendorSearch}   onChange={setVendorSearch} />
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={getFilteredCount()}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
        columnsButton={
          <ColumnSelector
            columns={tempColumns}
            onToggleColumn={key => {
              setTempColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c));
            }}
            onToggleAll={all => setTempColumns(prev => prev.map(c => ({ ...c, visible: all })))}
            onClose={() => setShowColumnSelector(false)}
            onApply={handleApplyColumns}
          />
        }
        filtersButton={
          <FilterDialog
            filters={filters}
            availableColumns={availableColumns.length > 0 ? availableColumns : getScheduleChangeColumns()}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        actionButton={
          <div className="flex items-center gap-[8px]">
            {/* 下載變更檔案 */}
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] border border-[#005eb8] border-solid bg-white hover:bg-[rgba(0,94,184,0.04)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 11.25V13.5C15.75 13.8978 15.592 14.2794 15.3107 14.5607C15.0294 14.842 14.6478 15 14.25 15H3.75C3.35218 15 2.97064 14.842 2.68934 14.5607C2.40804 14.2794 2.25 13.8978 2.25 13.5V11.25M5.25 7.5L9 11.25L12.75 7.5M9 2.25V11.25" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] whitespace-nowrap">
                下載變更檔案
              </span>
            </button>

            {/* 上傳大量變更 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 11.25V13.5C15.75 13.8978 15.592 14.2794 15.3107 14.5607C15.0294 14.842 14.6478 15 14.25 15H3.75C3.35218 15 2.97064 14.842 2.68934 14.5607C2.40804 14.2794 2.25 13.8978 2.25 13.5V11.25M12.75 6L9 2.25L5.25 6M9 2.25V11.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white whitespace-nowrap">
                上傳大量變更
              </span>
            </button>

            {/* 隱藏 file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        }
      />

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <AdvancedOrderTable
        activeTab="CK"
        data={filteredOrders}
        onOrderConfirm={handleOrderConfirmClick}
        onMoreOptions={handleMoreOptionsClick}
        userEmail={currentUserEmail}
        userRole={userRole}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={[]} // 進階篩選已在 filteredOrders 套用，避免重複
        selectedOrderIds={selectedOrderIds}
        onToggleOrder={handleToggleOrder}
        onSelectAll={handleSelectAll}
        onBatchAction={handleBatchAction}
        initialColumns={getScheduleChangeColumns()}
        storageKeyPrefix={SCHED_CHANGE_STORAGE_KEY_PREFIX}
      />

      {/* ── Upload Preview Modal ──────────────────────────────────────────── */}
      {uploadRows !== null && (
        <UploadPreviewModal
          rows={uploadRows}
          onConfirm={handleUploadConfirm}
          onClose={() => setUploadRows(null)}
        />
      )}

      {/* ── Batch Dialogs ──────────────────────────────────────────────────── */}
      {batchDialog === 'approve' && (
        <BatchApproveDialog
          orders={getSelectedOrders()}
          onConfirm={() => { showToast(`已同意 ${getSelectedOrders().length} 筆`); setSelectedOrderIds(new Set()); setBatchDialog(null); }}
          onClose={() => setBatchDialog(null)}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}