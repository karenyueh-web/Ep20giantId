import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { AdvancedOrderTable, getOrderColumns, defaultOrderColumns } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn, ScheduleLine } from './AdvancedOrderTable';
import { OrderDetail } from './OrderDetail';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { exportOrdersCsv, exportOrdersExcel } from './OrderCsvManager';
import { FilePlus2, Download, ChevronDown } from 'lucide-react';
import { BatchApproveDialog } from './OrderBatchDialogs';
import { useOrderStore, nowDateStr, operatorByRole, type HistoryEntry } from './OrderStoreContext';
import { computeRowDayDiff } from './AdvancedOrderTable';

// ── 變更生管排程專用欄位配置（預設顯示 productionScheduleDate / prodSchedDayDiff）──
const SCHED_CHANGE_STORAGE_KEY_PREFIX = 'orderList_v3_sched_change';

function getScheduleChangeColumns(): OrderColumn[] {
  return defaultOrderColumns.map(col => {
    // docSeqNo 已作為 sticky 單號序號欄顯示，隱藏此欄避免重複
    if (col.key === 'docSeqNo')               return { ...col, visible: false };
    if (col.key === 'schedLineIndex')         return { ...col, visible: true };
    if (col.key === 'productionScheduleDate') return { ...col, visible: true };
    if (col.key === 'prodSchedDayDiff')        return { ...col, visible: true };
    return { ...col };
  });
}

// ── CSV 欄位定義 ────────────────────────────────────────────────────────────
// 欄位說明：訂單序號=orderSeq（如100）、項次=排程項次（如1/2/3）
const CSV_HEADERS = ['訂單號碼', '訂單序號', '項次', '料號', '訂貨量', '未交量', '預計交期', '廠商可交貨日期', '生管用交貨日期'];

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

// 判斷日期字串是否早於今日
function isDatePast(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

interface ParsedCsvRow {
  orderNo: string;
  docSeqNo: string;
  orderSeq: string;
  materialNo: string;
  expectedDelivery: string;
  productionScheduleDate: string;
  deliveryQty: string;
  _rowIndex?: number;   // CSV 行號（從 2 開始）
  _matchedId?: number;  // 匹配到的 OrderRow.id
  _error?: string;
}

// ── 上傳確認 Modal（對齊修正單批次上傳風格）─────────────────────────────────────
interface UploadModalProps {
  rows: ParsedCsvRow[];
  fileName?: string;
  onConfirm: () => void;
  onClose: () => void;
  onReselect: () => void;
}

function UploadPreviewModal({ rows, fileName, onConfirm, onClose, onReselect }: UploadModalProps) {
  const validRows   = rows.filter(r => !r._error && r._matchedId !== undefined && r.productionScheduleDate.trim() !== '');
  const errorRows   = rows.filter(r => !!r._error);
  const skippedRows = rows.filter(r => !r._error && r.productionScheduleDate.trim() === '');

  const getRowStatus = (r: ParsedCsvRow): 'valid' | 'error' | 'skip' => {
    if (r._error) return 'error';
    if (r.productionScheduleDate.trim() === '') return 'skip';
    return 'valid';
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: '820px', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <FilePlus2 size={22} className="text-[#005eb8]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              批次變更 — 匯入預覽
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
          {/* Filename */}
          {fileName && (
            <div className="flex items-center gap-[8px] shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
            </div>
          )}

          {/* Summary badges */}
          <div className="flex gap-[8px] flex-wrap shrink-0">
            <div className="bg-[rgba(145,158,171,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">共計</p>
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#637381]">{rows.length}</p>
            </div>
            <div className="bg-[rgba(34,197,94,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#118d57" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#118d57]">有效</p>
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#118d57]">{validRows.length}</p>
            </div>
            {errorRows.length > 0 && (
              <div className="bg-[rgba(255,86,48,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b71d18" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#b71d18]">錯誤</p>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#b71d18]">{errorRows.length}</p>
              </div>
            )}
            {skippedRows.length > 0 && (
              <div className="bg-[rgba(145,158,171,0.08)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#919eab]">不處理</p>
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#919eab]">{skippedRows.length}</p>
              </div>
            )}
          </div>

          {/* Unified table */}
          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
            <table className="w-full min-w-[600px]">
              <thead className="sticky top-0 z-[1]">
                <tr className="bg-[#f4f6f8]">
                  {['行', '訂單號碼', '序號', '料號', '生管用交貨日期', '驗證'].map(h => (
                    <th key={h} className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const status = getRowStatus(r);
                  return (
                    <tr key={i} className={`border-t border-[rgba(145,158,171,0.08)] ${status === 'error' ? 'bg-[rgba(255,86,48,0.03)]' : ''}`}>
                      <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{r._rowIndex ?? i + 2}</td>
                      <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{r.orderNo}</td>
                      <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]">{r.orderSeq}</td>
                      <td className="px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e] max-w-[140px] truncate">{r.materialNo}</td>
                      <td className="px-[10px] py-[8px]">
                        {r.productionScheduleDate.trim() ? (
                          <span className="inline-flex items-center bg-[rgba(0,94,184,0.1)] text-[#005eb8] px-[8px] py-[2px] rounded-[4px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px]">
                            {r.productionScheduleDate}
                          </span>
                        ) : (
                          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">—</p>
                        )}
                      </td>
                      <td className="px-[10px] py-[8px]">
                        {status === 'valid' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        )}
                        {status === 'skip' && (
                          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">— (不處理)</p>
                        )}
                        {status === 'error' && (
                          <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#b71d18] max-w-[200px]" title={r._error}>{r._error}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
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
        <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
          <button
            onClick={onReselect}
            className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
          >
            重新選擇檔案
          </button>
          <div className="flex gap-[12px]">
            <button
              onClick={onClose}
              className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              disabled={validRows.length === 0}
              className="h-[36px] px-[20px] rounded-[8px] bg-[#005eb8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#004a94] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              確認套用 ({validRows.length} 筆)
            </button>
          </div>
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

  // ── Export Dropdown ─────────────────────────────────────────────────────────
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      const undeliveredQty = (o.orderQty ?? 0) - (o.acceptQty ?? 0);
      lines.push([
        esc(o.orderNo),
        esc(o.orderSeq),                          // 訂單序號（如 100），非 docSeqNo
        esc(getSchedIndex(o)),                    // 項次（如 1 或 1/2/3）
        esc(o.materialNo),
        esc(o.orderQty),                          // 訂貨量
        esc(undeliveredQty),                      // 未交量 = 訂貨量 - 已驗收量
        esc(o.expectedDelivery),                  // 預計交期
        esc(o.vendorDeliveryDate ?? ''),          // 廠商可交貨日期（cfn1）
        esc(o.productionScheduleDate ?? ''),      // 生管用交貨日期（cfn2，空白待填）
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
      const dateError = rawDate.trim() !== '' && normalizedDate === null
        ? `日期格式不符（輸入: "${rawDate}"），請使用 YYYY/MM/DD`
        : (normalizedDate && isDatePast(normalizedDate))
          ? `生管用交貨日期不可為過去日期（輸入: "${rawDate}"）`
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

  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      setUploadRows(rows);
    };
    reader.readAsText(file, 'utf-8');
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
  /** 點擊單號序號藍字連結——直接進入可編輯的生管排程明細 */
  const handleDocNoClick = (order: OrderRow) => { setSelectedOrder(order); setShowOrderDetail(true); };
  const handleCloseDetail = () => { setShowOrderDetail(false); setSelectedOrder(null); };

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
            expectedDelivery:       liveSelectedOrder.expectedDelivery,
            scheduleLines:          liveSelectedOrder.scheduleLines,
            productionScheduleDate: liveSelectedOrder.productionScheduleDate,
            orderQty:               liveSelectedOrder.orderQty,
            comparePrice:           liveSelectedOrder.comparePrice,
            unit:                   liveSelectedOrder.unit,
            acceptQty:              liveSelectedOrder.acceptQty,
          } : undefined}
          onStatusChange={handleStatusChange}
          isReadOnly={false}
          userRole={userRole}
          orderHistory={liveSelectedOrder ? getOrderHistory(liveSelectedOrder.id) : []}
          hideChatIcon={true}
          hideStatusActions={true}
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
        onExportExcel={undefined}
        onExportCsv={undefined}
        actionButton={
          <>
            {/* ── Export + 批次變更：合體外框（同「批次建立修正單」UI）── */}
            <div
              ref={exportDropdownRef}
              className="flex items-center gap-[2px] h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.2)] overflow-visible relative"
            >
              {/* Export 下拉按鈕 */}
              <button
                className="flex items-center gap-[6px] h-full px-[12px] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                onClick={() => setShowExportDropdown(prev => !prev)}
                title="匯出"
              >
                <Download size={16} className="text-[#637381]" />
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] whitespace-nowrap">Export</p>
                <ChevronDown size={14} className={`text-[#637381] transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Export 下拉選單 */}
              {showExportDropdown && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-[300px] bg-white rounded-[10px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)] border border-[rgba(145,158,171,0.12)] py-[6px] z-[100]">
                  {/* 匯出 Excel */}
                  <button
                    className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
                    onClick={() => { handleExportExcel(); setShowExportDropdown(false); }}
                  >
                    <div className="mt-[2px] shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#118d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">匯出 Excel</p>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">依列表顯示欄位匯出 .xlsx 格式</p>
                    </div>
                  </button>
                  {/* 匯出 CSV */}
                  <button
                    className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
                    onClick={() => { handleExportCsv(); setShowExportDropdown(false); }}
                  >
                    <div className="mt-[2px] shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">匯出 CSV</p>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">依列表顯示欄位匯出 .csv 格式</p>
                    </div>
                  </button>
                  {/* 下載變更檔案 */}
                  <button
                    className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
                    onClick={() => { handleDownloadCSV(); setShowExportDropdown(false); }}
                  >
                    <div className="mt-[2px] shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">下載變更檔案</p>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">匯出生管排程變更用 .csv 檔案</p>
                    </div>
                  </button>
                </div>
              )}

              {/* 分隔線 */}
              <div className="w-[1px] h-[20px] bg-[rgba(145,158,171,0.2)]" />

              {/* 批次變更 */}
              <button
                className="flex items-center gap-[6px] h-full px-[12px] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="批次變更"
              >
                <FilePlus2 size={16} className="text-[#637381]" />
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] whitespace-nowrap">批次變更</p>
              </button>
            </div>

            {/* 隱藏 file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        }
      />

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <AdvancedOrderTable
        activeTab="CK"
        data={filteredOrders}
        onDocNoClick={handleDocNoClick}
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
          fileName={uploadFileName ?? undefined}
          onConfirm={handleUploadConfirm}
          onClose={() => { setUploadRows(null); setUploadFileName(null); }}
          onReselect={() => fileInputRef.current?.click()}
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