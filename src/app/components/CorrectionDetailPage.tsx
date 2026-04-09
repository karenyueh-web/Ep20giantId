import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import svgPaths from '../../imports/svg-aomtl6pp5x';
import svgRao from '../../imports/svg-rao7rkpd6p';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import { SimpleDatePicker } from './SimpleDatePicker';
import type { OrderRow } from './AdvancedOrderTable';
import { useOrderStore, nowDateStr, operatorByRole } from './OrderStoreContext';
import type { HistoryEntry, SavedDeliveryRow } from './OrderStoreContext';
import { OrderHistory } from './OrderHistory';

// ── Types ──────────────────────────────────────────────────────────────────────
interface DeliveryRow {
  id: number;
  expectedDelivery: string;   // 預計交期 (read-only)
  vendorOriginalDate: string; // 原廠商交期 (read-only)
  newVendorDate: string;      // 新廠商交期 (editable)
  originalQty: number;        // 原交貨量 (read-only)
  newQty: string;             // 新交貨量 (editable)
  deleted?: boolean;          // 軟刪除：紅線槓掉，提交時排除
  // 拆單專用欄位
  splitOrderSeq?: string;       // 拆單訂單序號（儲存用，顯示以 idx 計算為準）
  splitNewMaterialNo?: string;  // 拆單新料號（每列獨立）
}

export interface CorrectionFormData {
  newMaterialNo: string;     // 新料號
  periodInput: string;       // 交貨排程：輸入期數，控制 deliveryRows 筆數
  originalPeriodCount: number; // 原單期數（唯讀，僅供顯示）
  correctionNote: string;    // 修正備註
  deliveryRows: DeliveryRow[];
}

interface CorrectionDetailPageProps {
  orders: OrderRow[];
  currentIndex: number;
  correctionDocNo: string;
  onBack: () => void;
  onIndexChange: (idx: number) => void;
  onSubmit?: (idx: number, data: CorrectionFormData, isDelete?: boolean) => void;
  onSave?: (idx: number, data: CorrectionFormData, isDelete?: boolean) => void;
  userRole?: 'vendor' | 'purchaser' | 'giant';
  /** 檢視模式：
   * 'edit'            — DR：可編輯，[提交廠商]+[暫存]（預設）
   * 'vendorReview'    — V ：唯讀，[修正確認]+[不同意]
   * 'purchaserReview' — B ：唯讀，[修正確認]+[退回廠商]
   * 'readonly'        — CP/SS/CL：唯讀，無底部按鈕
   */
  viewMode?: 'edit' | 'vendorReview' | 'purchaserReview' | 'readonly';
  /** 是否已開立修正單（已有修正單號）— 用於查詢頁面進入的單據 */
  isExistingDoc?: boolean;
  /** 從查詢頁帶入的新料號（若有）*/
  initialNewMaterialNo?: string;
  /** 從查詢頁帶入的修正備註（若有）*/
  initialCorrectionNote?: string;
  /** 從查詢頁帶入的已儲存交貨排程（DR 繼續編輯用）*/
  initialSavedDeliveryRows?: SavedDeliveryRow[];
  /** 從查詢頁帶入的已儲存期數輸入（DR 繼續編輯用）*/
  initialSavedPeriodInput?: string;
  /** 修正單類型，如 '不拆單' */
  correctionType?: string;
  /** 修正單狀態碼，如 'DR' | 'V' | 'B' | 'CP' | 'SS' */
  correctionStatusCode?: string;
  /** 多張編輯時，每張訂單的初始表單資料（key = order.id） */
  initialDataByOrderId?: Record<number, {
    newMaterialNo?: string;
    correctionNote?: string;
    savedDeliveryRows?: SavedDeliveryRow[];
    savedPeriodInput?: string;
  }>;
  /** 同一訂單編號下最高的訂單序號（用於拆單新項次序號計算） */
  maxSeqInSameOrderNo?: number;
  onApprove?: () => void;
  onDisagree?: (reason: string, adjustedRows?: { expectedDelivery: string; vendorOriginalDate: string; newVendorDate: string; originalQty: number; newQty: string; deleted?: boolean; splitNewMaterialNo?: string }[], newMaterialNo?: string) => void;
  onReturnToVendor?: (reason: string) => void;
  /** B 狀態：關閉單據（轉 CL）*/
  onCloseToCL?: () => void;
  /** V 狀態：採購抽單（V→B）*/
  onWithdraw?: () => void;
}

// ── ID counter ─────────────────────────────────────────────────────────────────
let _rid = 200;
const nextRid = () => ++_rid;

// ── Generate initial delivery rows from order ──────────────────────────────────
function makeInitialRows(order: OrderRow): DeliveryRow[] {
  const total = order.deliveryQty ?? order.orderQty ?? 0;
  return [
    { id: nextRid(), expectedDelivery: order.expectedDelivery ?? order.vendorDeliveryDate ?? '', vendorOriginalDate: order.vendorDeliveryDate ?? '', newVendorDate: order.vendorDeliveryDate ?? '', originalQty: total, newQty: String(total) },
  ];
}

// ── 拆單新交貨量預設分配：訂貨量 / 拆單數，餘數加到最後一筆 ─────────────────
function computeSplitQty(orderQty: number, splitCount: number, idx: number): string {
  if (splitCount <= 0) return '';
  const base = Math.floor(orderQty / splitCount);
  const remainder = orderQty - base * (splitCount - 1);
  return String(idx === splitCount - 1 ? remainder : base);
}

// ── Generate initial split rows from order (拆單) ──────────────────────────────
// 拆單至少需要兩筆項次，因此預設產生 2 列
function makeInitialSplitRows(order: OrderRow): DeliveryRow[] {
  const qty = order.orderQty ?? 0;
  const count = 2;
  return [
    {
      id: nextRid(),
      expectedDelivery: order.expectedDelivery ?? order.vendorDeliveryDate ?? '',
      vendorOriginalDate: order.vendorDeliveryDate ?? '',
      newVendorDate: order.vendorDeliveryDate ?? '',
      originalQty: qty,
      newQty: computeSplitQty(qty, count, 0),
      splitOrderSeq: order.orderSeq,
      splitNewMaterialNo: order.materialNo ?? '',
    },
    {
      id: nextRid(),
      expectedDelivery: order.expectedDelivery ?? order.vendorDeliveryDate ?? '',
      vendorOriginalDate: order.vendorDeliveryDate ?? '',
      newVendorDate: order.vendorDeliveryDate ?? '',
      originalQty: qty,
      newQty: computeSplitQty(qty, count, 1),
      splitOrderSeq: '',
      splitNewMaterialNo: order.materialNo ?? '',
    },
  ];
}

// ── Gradient chat icon ─────────────────────────────────────────────────────────
function ChatIcon() {
  return (
    <svg width="36" height="35" viewBox="0 0 24 23.0734" fill="none">
      <defs>
        <linearGradient id="cdp1" x1="8.156" x2="24" y1="7.229" y2="23.073" gradientUnits="userSpaceOnUse">
          <stop stopColor="#77ED8B" /><stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="cdp2" x1="0" x2="19.302" y1="0" y2="19.302" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00B8D9" /><stop offset="1" stopColor="#006C9C" />
        </linearGradient>
      </defs>
      <path clipRule="evenodd" d={svgRao.p3a4a2480} fill="url(#cdp1)" fillRule="evenodd" />
      <path clipRule="evenodd" d={svgRao.p24d6df00} fill="url(#cdp2)" fillRule="evenodd" />
      <g opacity="0.48">
        <path clipRule="evenodd" d={svgRao.p1c344620} fill="#006C9C" fillRule="evenodd" />
        <path clipRule="evenodd" d={svgRao.p356ce880} fill="#006C9C" fillRule="evenodd" />
        <path clipRule="evenodd" d={svgRao.p1f1f1b00} fill="#006C9C" fillRule="evenodd" />
      </g>
      <path d={svgRao.p2d7e32c0} fill="white" />
      <path d={svgRao.p26d26b00} fill="white" />
      <path d={svgRao.p355dbd80} fill="white" />
    </svg>
  );
}

// ── Trash icon ─────────────────────────────────────────────────────────────────
function TrashIcon({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center shrink-0 size-[24px] hover:opacity-70 transition-opacity">
      <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
        <path d={svgPaths.p309dd480} fill="#FF5630" />
        <path clipRule="evenodd" d={svgPaths.p2846fa00} fill="#FF5630" fillRule="evenodd" />
      </svg>
    </button>
  );
}

// ── Down arrow (for dropdown) ──────────────────────────────────────────────────
function DownArrow() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[35.42%_20.74%_35.4%_20.83%]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.34969 4.66909">
          <path d={svgRao.p29522f00} fill="#1C252E" />
        </svg>
      </div>
    </div>
  );
}

// ── Info pair: label + value ───────────────────────────────────────────────────
function InfoItem({ label, value, width }: { label: string; value: string; width?: string }) {
  return (
    <div className={`content-stretch flex gap-[10px] items-start relative shrink-0 ${width ?? 'w-[200px]'}`}>
      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[14px] leading-[22px] whitespace-nowrap shrink-0">{label}</p>
      <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#454f5b] text-[14px] leading-[22px] whitespace-nowrap shrink-0">{value || '—'}</p>
    </div>
  );
}

// ── Qty input ─────────────────────────────────────────────────────────────────
function QtyField({ value, onChange, highlight, isChanged }: { value: string; onChange: (v: string) => void; highlight?: boolean; isChanged?: boolean }) {
  return (
    <div className="h-[34px] relative w-full rounded-[8px]">
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${highlight || isChanged ? 'border-[#ff5630]' : 'border-[#dfe3e8]'}`} />
      <div className="flex items-center size-full px-[12px] py-[6px]">
        <input
          type="number" min="1" value={value}
          onChange={e => {
            const raw = e.target.value;
            if (raw === '') { onChange(''); return; }
            const n = parseFloat(raw);
            if (!isNaN(n) && n > 0) onChange(raw);
          }}
          className={`flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none ${isChanged ? 'text-[#ff5630]' : 'text-[#454f5b]'}`}
        />
      </div>
    </div>
  );
}


// ── DateCell — SimpleDatePicker popup ─────────────────────────────────────────
interface DateCellProps { value: string; rowId: number; onSelect: (id: number, date: string) => void; isChanged?: boolean; disabled?: boolean; minDate?: string; }
function DateCell({ value, rowId, onSelect, isChanged, disabled, minDate }: DateCellProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [openUpward, setOpenUpward] = useState(false);

  const handleOpen = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const calendarWidth = 280;
      const calendarHeight = 310; // SimpleDatePicker 大約高度（含月份導覽列）
      const left = Math.min(r.left, window.innerWidth - calendarWidth - 8);
      // 下方空間不足時改往上彈出
      const spaceBelow = window.innerHeight - r.bottom - 8;
      const shouldOpenUp = spaceBelow < calendarHeight && r.top > calendarHeight;
      setOpenUpward(shouldOpenUp);
      setPos({
        top: shouldOpenUp ? r.top - calendarHeight - 4 : r.bottom + 4,
        left: Math.max(8, left),
      });
    }
    setOpen(v => !v);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: PointerEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setTimeout(() => setOpen(false), 80);
      }
    };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [open]);

  return (
    <>
      <div ref={btnRef} onClick={handleOpen} className="relative rounded-[8px] shrink-0 w-full cursor-pointer">
        <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${isChanged ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.16)]'}`} />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center pl-[12px] pr-[8px] py-[6px] relative w-full">
            <p className={`flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap overflow-hidden text-ellipsis ${isChanged ? 'text-[#ff5630]' : 'text-[#454f5b]'}`}>{value || '選擇日期'}</p>
            {!disabled && <DownArrow />}
          </div>
        </div>
      </div>
      {open && createPortal(
        <div
          className="fixed z-[99999]"
          style={{ top: pos.top, left: pos.left }}
          onPointerDown={e => e.stopPropagation()}
        >
          <SimpleDatePicker
            selectedDate={value}
            onDateSelect={date => { onSelect(rowId, date); setOpen(false); }}
            minDate={minDate}
          />
        </div>,
        document.body
      )}
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function CorrectionDetailPage({
  orders, currentIndex, correctionDocNo, onBack, onIndexChange, onSubmit, onSave,
  userRole, viewMode = 'edit', isExistingDoc, initialNewMaterialNo, initialCorrectionNote,
  initialSavedDeliveryRows, initialSavedPeriodInput,
  correctionType, correctionStatusCode,
  initialDataByOrderId,
  maxSeqInSameOrderNo,
  onApprove, onDisagree, onReturnToVendor, onCloseToCL, onWithdraw,
}: CorrectionDetailPageProps) {
  const order = orders[currentIndex];
  const total = orders.length;
  const { addCorrectionHistory, getCorrectionHistory } = useOrderStore();

  /**
   * 批次開立時，每張訂單的本機操作狀態（不依賴 viewMode/correctionStatusCode）
   * 必須宣告在 effectiveStatusCode useMemo 之前，避免 temporal dead zone
   */
  const [perOrderStatus, setPerOrderStatus] = useState<Record<number, 'saved' | 'submitted'>>({});
  const currentOrderLocalStatus = perOrderStatus[order.id];
  const isLocallySubmitted = currentOrderLocalStatus === 'submitted';

  // ── 有效狀態碼（優先序：perOrderStatus > correctionStatusCode > viewMode 推導）
  const effectiveStatusCode = useMemo(() => {
    // 本機操作狀態優先（批次開立時的即時反饋）
    if (currentOrderLocalStatus === 'submitted') return 'V';
    if (currentOrderLocalStatus === 'saved') return 'DR';
    // 父層傳入的狀態碼（查詢頁進入時）
    if (correctionStatusCode) return correctionStatusCode;
    // 最後由 viewMode 推導
    return ({ edit: 'DR', vendorReview: 'V', purchaserReview: 'B', readonly: 'SS' } as Record<string, string>)[viewMode] ?? 'DR';
  }, [currentOrderLocalStatus, correctionStatusCode, viewMode]);

  // ── 狀態碼 → 顯示標籤 ──────────────────────────────────────────────────
  const statusLabel = useMemo(() => {
    const statusMap: Record<string, string> = {
      DR: '草稿(DR)',
      V: '廠商確認中(V)',
      B: '採購確認中(B)',
      CP: '單據已確認(CP)',
      SS: '修正通過(SS)',
      CL: '單據結案(CL)',
    };
    return statusMap[effectiveStatusCode] ?? effectiveStatusCode;
  }, [effectiveStatusCode]);

  // ── 狀態碼 → Tag 顏色（與列表 tab statusBg/statusText 對齊）────────────
  const statusStyle = useMemo(() => {
    const styleMap: Record<string, { bg: string; border: string; text: string }> = {
      DR: { bg: 'rgba(255,171,0,0.16)',   border: '#b76e00', text: '#b76e00' },
      V:  { bg: 'rgba(0,94,184,0.16)',    border: '#00559c', text: '#00559c' },
      B:  { bg: 'rgba(142,51,255,0.16)',  border: '#5119b7', text: '#5119b7' },
      CP: { bg: 'rgba(0,184,217,0.16)',   border: '#006c9c', text: '#006c9c' },
      SS: { bg: 'rgba(34,197,94,0.16)',   border: '#118d57', text: '#118d57' },
      CL: { bg: 'rgba(145,158,171,0.16)', border: '#637381', text: '#637381' },
    };
    return styleMap[effectiveStatusCode] ?? styleMap['DR'];
  }, [effectiveStatusCode]);

  // ── Helper: 寫入修正單歷程（獨立於訂單歷程）─────────────────────────────
  const recordHistory = useCallback((orderId: number, event: string, remark = '') => {
    const entry: HistoryEntry = {
      date: nowDateStr(),
      event,
      operator: operatorByRole(userRole),
      remark,
    };
    addCorrectionHistory(orderId, entry);
  }, [addCorrectionHistory, userRole]);

  // ── 讀取當前訂單的修正單歷程 ───────────────────────────────────────────
  const orderHistory = useMemo(() => getCorrectionHistory(order.id), [getCorrectionHistory, order.id]);

  // ── Per-order form state ──────────────────────────────────────────────────
  const [formMap, setFormMap] = useState<Record<number, CorrectionFormData>>(() => {
    const m: Record<number, CorrectionFormData> = {};
    orders.forEach((o, idx) => {
      // 多張編輯：優先查找 initialDataByOrderId（每張訂單各自的已存資料）
      const perOrderData = initialDataByOrderId?.[o.id];
      const savedRows = perOrderData?.savedDeliveryRows ?? (idx === 0 ? initialSavedDeliveryRows : undefined);
      const savedMaterialNo = perOrderData?.newMaterialNo ?? (idx === 0 ? (initialNewMaterialNo ?? '') : '');
      const savedNote = perOrderData?.correctionNote ?? (idx === 0 ? (initialCorrectionNote ?? '') : '');
      const savedPeriod = perOrderData?.savedPeriodInput ?? (idx === 0 ? initialSavedPeriodInput : undefined);

      if (savedRows && savedRows.length > 0) {
        const restoredRows: DeliveryRow[] = savedRows.map(sr => ({
          id: nextRid(),
          expectedDelivery: sr.expectedDelivery,
          vendorOriginalDate: sr.vendorOriginalDate,
          newVendorDate: sr.newVendorDate,
          originalQty: sr.originalQty,
          newQty: sr.newQty,
          deleted: sr.deleted,
          splitOrderSeq: sr.splitOrderSeq,
          splitNewMaterialNo: sr.splitNewMaterialNo,
        }));
        const fallbackRows = correctionType === '拆單' ? makeInitialSplitRows(o) : makeInitialRows(o);
        m[o.id] = {
          newMaterialNo: savedMaterialNo,
          periodInput: savedPeriod ?? String(restoredRows.length),
          originalPeriodCount: fallbackRows.length,
          correctionNote: savedNote,
          deliveryRows: restoredRows,
        };
      } else {
        const rows = correctionType === '拆單' ? makeInitialSplitRows(o) : makeInitialRows(o);
        m[o.id] = {
          newMaterialNo: savedMaterialNo,
          periodInput: String(rows.length),
          originalPeriodCount: rows.length,
          correctionNote: savedNote,
          deliveryRows: rows,
        };
      }
    });
    return m;
  });
  const form = formMap[order.id];
  const setForm = (updater: (prev: CorrectionFormData) => CorrectionFormData) =>
    setFormMap(prev => ({ ...prev, [order.id]: updater(prev[order.id]) }));

  // ── 拆單模式判斷（早於 useEffect，避免 TDZ）──────────────────────────────
  const isSplitMode = correctionType === '拆單';

  // ── 拆單序號計算基準 ──────────────────────────────────────────────────────
  // 項次1 = 原序號, 項次2+ = maxSeqInSameOrderNo + idx*10
  // 若未傳入 maxSeqInSameOrderNo，預設為原序號本身
  const splitSeqBase = maxSeqInSameOrderNo ?? parseInt(order.orderSeq, 10);

  // ── 拆單：將 computedSeq 寫入 splitOrderSeq 以持久化序號 ─────────────────
  const stampSplitSeqs = (f: typeof form): typeof form => {
    if (!isSplitMode) return f;
    return {
      ...f,
      deliveryRows: f.deliveryRows.map((row, idx) => ({
        ...row,
        splitOrderSeq: String(idx === 0 ? parseInt(order.orderSeq, 10) : splitSeqBase + idx * 10),
      })),
    };
  };

  // ── 期數輸入 → 自動調整 deliveryRows ─────────────────────────────────────
  // 參照 OrderDetail.tsx 的 splitPeriods useEffect 邏輯
  // 唯讀模式（V/B/CP/SS/CL）不執行自動期數調整，避免覆蓋已儲存的交貨排程資料
  useEffect(() => {
    if (isReadOnly || isDeleteMode || isSplitMode) return;
    const n = parseInt(formMap[order.id]?.periodInput ?? '');
    if (isNaN(n) || n <= 0) return;
    const allRows = formMap[order.id]?.deliveryRows ?? [];
    // 比對「有效列數」（排除軟刪除），而非總列數
    const activeCount = allRows.filter(r => !r.deleted).length;
    if (n === activeCount) return;

    const orderQty = order.orderQty ?? 0;

    if (n > activeCount) {
      // 增加有效列：先復原已軟刪除列（先進先復），不足再新增；並重新分配數量
      const base = Math.floor(orderQty / n);
      const rem = orderQty % n;
      let currentActive = activeCount;
      let newRows = allRows.map(r => {
        if (!r.deleted || currentActive >= n) return r;
        currentActive++;
        return { ...r, deleted: false };
      });
      // 若仍不足，新增全新列（原廠商交期與第1期相同，顯示 order.vendorDeliveryDate）
      for (let i = newRows.filter(r => !r.deleted).length; i < n; i++) {
        newRows.push({
          id: nextRid(),
          expectedDelivery: order.expectedDelivery ?? order.vendorDeliveryDate ?? '',
          vendorOriginalDate: order.vendorDeliveryDate ?? '',
          newVendorDate: order.vendorDeliveryDate ?? '',
          originalQty: 0,
          newQty: '0',
        });
      }
      // 重新分配數量（僅對有效列）
      let activeIdx = 0;
      newRows = newRows.map(r => {
        if (r.deleted) return r;
        const qty = activeIdx < rem ? base + 1 : base;
        activeIdx++;
        return { ...r, newQty: String(qty) };
      });
      setFormMap(prev => ({ ...prev, [order.id]: { ...prev[order.id], deliveryRows: newRows } }));
    } else {
      // 減少有效列：優先「直接移除」 originalQty === 0 的新增列；
      // 不足時再對原有列（originalQty > 0）做軟刪除（紅線顯示）
      const orderQty = order.orderQty ?? 0;
      const toRemove = activeCount - n;
      let removed = 0;
      // Step 1: 從後往前移除新增列（originalQty === 0）
      let newRows = [...allRows];
      for (let i = newRows.length - 1; i >= 0 && removed < toRemove; i--) {
        if (!newRows[i].deleted && newRows[i].originalQty === 0) {
          newRows.splice(i, 1);
          removed++;
        }
      }
      // Step 2: 若仍不足，從後往前軟刪除原有列（originalQty > 0）
      for (let i = newRows.length - 1; i >= 0 && removed < toRemove; i--) {
        if (!newRows[i].deleted) {
          newRows[i] = { ...newRows[i], deleted: true };
          removed++;
        }
      }
      // Step 3: 重新分配剩餘有效列的新交貨量
      const base = Math.floor(orderQty / n);
      const rem = orderQty % n;
      let activeIdx = 0;
      newRows = newRows.map(r => {
        if (r.deleted) return r;
        const qty = activeIdx < rem ? base + 1 : base;
        activeIdx++;
        return { ...r, newQty: String(qty) };
      });
      setFormMap(prev => ({ ...prev, [order.id]: { ...prev[order.id], deliveryRows: newRows } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMap[order.id]?.periodInput, order.id]);

  // ── 拆單數 → 自動增減拆單列 ──────────────────────────────────────────────
  // 拆單模式：增加時新增列，減少時直接移除（不使用軟刪除）
  // 每次拆單數變動時，重新計算所有列的預設新交貨量（訂貨量/拆單數，餘數放最後一筆）
  useEffect(() => {
    if (!isSplitMode || isReadOnly) return;
    const n = parseInt(formMap[order.id]?.periodInput ?? '');
    if (isNaN(n) || n < 2) return; // 拆單至少需要 2 筆
    const allRows = formMap[order.id]?.deliveryRows ?? [];
    const currentCount = allRows.length;
    if (n === currentCount) return;

    const orderQty = order.orderQty ?? 0;

    if (n > currentCount) {
      const newRows = [...allRows];
      // 新增列
      for (let i = currentCount; i < n; i++) {
        newRows.push({
          id: nextRid(),
          expectedDelivery: order.expectedDelivery ?? order.vendorDeliveryDate ?? '',
          vendorOriginalDate: order.vendorDeliveryDate ?? '',
          newVendorDate: order.vendorDeliveryDate ?? '',
          originalQty: orderQty,
          newQty: '',
          splitOrderSeq: '',
          splitNewMaterialNo: order.materialNo ?? '',
        });
      }
      // 重新分配所有列的新交貨量
      const redistributed = newRows.map((row, idx) => ({
        ...row,
        newQty: computeSplitQty(orderQty, n, idx),
      }));
      setFormMap(prev => ({ ...prev, [order.id]: { ...prev[order.id], deliveryRows: redistributed } }));
    } else {
      // 減少：從後往前直接移除（拆單最少保留 2 列）
      const trimmed = allRows.slice(0, Math.max(n, 2));
      const finalCount = trimmed.length;
      // 重新分配所有列的新交貨量
      const redistributed = trimmed.map((row, idx) => ({
        ...row,
        newQty: computeSplitQty(orderQty, finalCount, idx),
      }));
      setFormMap(prev => ({ ...prev, [order.id]: { ...prev[order.id], deliveryRows: redistributed } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMap[order.id]?.periodInput, order.id, isSplitMode]);

  const [showHistory, setShowHistory] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ► 單據在「提交採購(V→B)」或「退回廠商(B→V)」後開啟，自動展开歷程面板
  // 開啟條件: viewMode 為 vendorReview 或 purchaserReview，且最新一筆歷程含有「不同意」或「退回」字樣
  useEffect(() => {
    if (viewMode !== 'vendorReview' && viewMode !== 'purchaserReview') return;
    const latest = orderHistory[0]; // addCorrectionHistory 是從前插入，[0] 為最新
    if (!latest) return;
    const isReturnEvent =
      latest.event.includes('退回廠商') ||   // B → V：採購退回廠商
      latest.event.includes('廠商調整修正單') ||  // V → B：廠商調整修正單（原不同意）
      latest.event.includes('不同意修正');  // V → B：舊版歷程相容
    if (isReturnEvent) {
      setShowHistory(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 刪單模式（per-order，各訂單獨立）──
  const [deleteModeMap, setDeleteModeMap] = useState<Record<number, boolean>>({});
  const isDeleteMode = deleteModeMap[order.id] ?? false;
  const setIsDeleteMode = (val: boolean) => setDeleteModeMap(prev => ({ ...prev, [order.id]: val }));
  const preDeleteRowsMapRef = useRef<Record<number, DeliveryRow[]>>({});
  // ── 退回廠商表單（inline swap，purchaserReview 模式）──
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  // ── 不同意表單（inline swap）──
  const [showDisagreeForm, setShowDisagreeForm] = useState(false);
  const [disagreeType, setDisagreeType] = useState<'reject' | 'adjustSchedule'>('reject');
  const [disagreeRejectReason, setDisagreeRejectReason] = useState('');
  const [disagreeAdjustPeriod, setDisagreeAdjustPeriod] = useState('');
  const [disagreeAdjustReason, setDisagreeAdjustReason] = useState('');
  const [disagreeNewMaterialNo, setDisagreeNewMaterialNo] = useState('');
  const [disagreeDeliveryRows, setDisagreeDeliveryRows] = useState<{ id: number; expectedDelivery: string; vendorOriginalDate: string; newVendorDate: string; originalQty: number; newQty: string; deleted?: boolean; splitNewMaterialNo?: string; splitOrderSeq?: string }[]>([]);
  // 保存採購方原始修正資料的 ref，供歷程差異比對用
  const purchaserOriginalRowsRef = useRef<{ id: number; newVendorDate: string; originalQty: number; newQty: string; deleted?: boolean }[]>([]);
  const initDisagreeRows = useCallback(() => {
    // 帶入全部項次（含已刪除），保留刪除狀態
    const rows = form.deliveryRows.map(r => ({
      id: r.id, expectedDelivery: r.expectedDelivery, vendorOriginalDate: r.vendorOriginalDate,
      newVendorDate: r.newVendorDate, originalQty: r.originalQty, newQty: r.newQty,
      deleted: !!r.deleted, splitNewMaterialNo: r.splitNewMaterialNo, splitOrderSeq: r.splitOrderSeq,
    }));
    setDisagreeDeliveryRows(rows);
    setDisagreeAdjustPeriod(String(rows.length));
    setDisagreeNewMaterialNo(form.newMaterialNo || '');
    // 保存採購方原始數據快照（含刪除狀態）
    purchaserOriginalRowsRef.current = rows.map(r => ({
      id: r.id, newVendorDate: r.newVendorDate, originalQty: r.originalQty, newQty: r.newQty,
      deleted: r.deleted, splitNewMaterialNo: r.splitNewMaterialNo,
    }));
  }, [form.deliveryRows, form.newMaterialNo]);
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  // 可編輯判斷：viewMode 不是 edit，或這張已被提交廠商，都應唯讀
  const isReadOnly = viewMode !== 'edit' || isLocallySubmitted;
  const hasAcceptQty = (order.acceptQty ?? 0) > 0;
  // 計算新交貨量時排除已軟刪除的列
  const totalNewQty = useMemo(() => form.deliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0), [form.deliveryRows]);
  // 採購設定的新交貨量合計（V 狀態 form 唯讀，totalNewQty 即為採購目標）
  const purchaserAdjustedTotal = totalNewQty;
  const isDeleteOrder = isDeleteMode || (totalNewQty === 0 && form.deliveryRows.some(r => !r.deleted));

  // ── 檢查是否有任何異動（無異動 = 不可開立修正單）──────────────────────────
  const hasAnyChange = useMemo(() => {
    // 0. 刪單模式視為有異動
    if (isDeleteMode) return true;
    // 拆單模式：有多筆或任一列有值即視為有異動（拆單無軟刪除）
    if (isSplitMode) {
      if (form.deliveryRows.length > 1) return true;
      if (form.deliveryRows.some(r => (r.newVendorDate !== r.vendorOriginalDate || r.newQty !== '' || (r.splitNewMaterialNo ?? '') !== (order.materialNo ?? '')))) return true;
      return false;
    }
    // 1. 新料號有變更
    if (form.newMaterialNo && form.newMaterialNo !== (order.materialNo ?? '')) return true;
    // 2. 任一排程列：新廠商交貨日有變更
    if (form.deliveryRows.some(r => !r.deleted && r.newVendorDate !== r.vendorOriginalDate)) return true;
    // 3. 任一排程列：新交貨量有變更
    if (form.deliveryRows.some(r => !r.deleted && r.newQty !== String(r.originalQty))) return true;
    // 4. 任一排程列被標記刪除
    if (form.deliveryRows.some(r => r.deleted)) return true;
    return false;
  }, [isDeleteMode, isSplitMode, form.newMaterialNo, form.deliveryRows, order.materialNo]);

  const noChangeBlock = !isReadOnly && !hasAnyChange;

  // ── 各欄位是否有異動（用於 V/B/readonly 模式下紅色標題）────────────────
  const hasMaterialChange = !!(form.newMaterialNo && form.newMaterialNo !== (order.materialNo ?? ''));
  const hasDateChange = form.deliveryRows.some(r => !r.deleted && r.newVendorDate !== r.vendorOriginalDate);
  const hasQtyChange = form.deliveryRows.some(r => !r.deleted && r.newQty !== String(r.originalQty));

  // ── 最低需求：新交貨量合計不可少於 驗收量＋在途量 ──────────────────────────
  const minRequiredQty = (order.acceptQty ?? 0) + (order.inTransitQty ?? 0);
  // belowMinQty：拆單與不拆單皆適用（加總 < 驗收量+在途量 → 不合法）
  const belowMinQty = !isDeleteMode && minRequiredQty > 0 && totalNewQty < minRequiredQty;
  // aboveMaxQty：拆單與不拆單皆不可超過原訂貨量
  const aboveMaxQty = !isDeleteMode && totalNewQty > (order.orderQty ?? 0);
  // 交期不可為過去日期
  const todayStr = (() => { const t = new Date(); return `${t.getFullYear()}/${String(t.getMonth()+1).padStart(2,'0')}/${String(t.getDate()).padStart(2,'0')}`; })();
  const hasPastDate = !isReadOnly && !isDeleteMode && form.deliveryRows.some(r => !r.deleted && !!r.newVendorDate && r.newVendorDate < todayStr);


  const updateRow = (id: number, field: keyof DeliveryRow, val: string) =>
    setForm(p => ({ ...p, deliveryRows: p.deliveryRows.map(r => r.id === id ? { ...r, [field]: val } : r) }));

  // 軟刪除：按垃圾桶 → 標記 deleted，顯示紅線槓掉；再按復原圖示 → 取消刪除
  // 同步更新 periodInput，確保儲存後重新開啟時 useEffect 不會復原已刪除的列
  // 例外：originalQty === 0 的「新增期次」，直接完全移除（不顯示紅線），因為建立階段只是在調整
  // ＊刪除後同步重算剩餘有效列的 newQty（按 orderQty / 有效期數 均分），
  //   避免垃圾桶逐一刪除時數量未更新的問題。
  const toggleDeleteRow = (id: number) => {
    const totalQty = order.orderQty ?? 0;
    setForm(p => {
      const target = p.deliveryRows.find(r => r.id === id);
      let rows: typeof p.deliveryRows;
      if (target && target.originalQty === 0) {
        // 新增的期次：直接移除，不做軟刪除
        if (p.deliveryRows.length <= 1) { showToast('至少需保留一筆交貨排程'); return p; }
        rows = p.deliveryRows.filter(r => r.id !== id);
      } else {
        // 原有期次：軟刪除（顯示紅線）
        rows = p.deliveryRows.map(r => r.id === id ? { ...r, deleted: !r.deleted } : r);
      }
      // 重算剩餘有效列的 newQty
      const activeCount = rows.filter(r => !r.deleted).length;
      const base = activeCount > 0 ? Math.floor(totalQty / activeCount) : 0;
      const rem = activeCount > 0 ? totalQty % activeCount : 0;
      let activeIdx = 0;
      const redistributed = rows.map(r => {
        if (r.deleted) return r;
        const qty = activeIdx < rem ? base + 1 : base;
        activeIdx++;
        return { ...r, newQty: String(qty) };
      });
      return { ...p, deliveryRows: redistributed, periodInput: String(activeCount) };
    });
  };

  // 手動刪除單列 → 同步更新 periodInput
  const removeRow = (id: number) => {
    if (form.deliveryRows.length <= 1) { showToast('至少需保留一筆交貨排程'); return; }
    setForm(p => {
      const rows = p.deliveryRows.filter(r => r.id !== id);
      return { ...p, deliveryRows: rows, periodInput: String(rows.length) };
    });
  };

  // 拆單模式：直接移除新增的拆單列（非軟刪除），同步更新拆單數
  // 拆單至少需要 2 筆項次才構成拆單
  // 移除後重新分配所有列的新交貨量（訂貨量/拆單數，餘數放最後一筆）
  const removeSplitRow = (id: number) => {
    if (form.deliveryRows.length <= 2) { showToast('拆單至少需保留兩筆項次'); return; }
    setForm(p => {
      const rows = p.deliveryRows.filter(r => r.id !== id);
      const qty = order.orderQty ?? 0;
      const redistributed = rows.map((row, idx) => ({
        ...row,
        newQty: computeSplitQty(qty, rows.length, idx),
      }));
      return { ...p, deliveryRows: redistributed, periodInput: String(rows.length) };
    });
  };

  // ── 比對 form 與原始訂單，產生異動摘要（寫入歷程備註）────────────────────
  const buildChangeSummary = (): string => {
    const changes: string[] = [];
    if (isDeleteMode) {
      changes.push(`【刪單】交貨排程調整為驗收量＋在途量（${minRequiredQty}）`);
    }

    // 拆單摘要
    if (isSplitMode) {
      changes.push(`【拆單】拆單數：${form.deliveryRows.length}；採購目標量：${totalNewQty}`);
      form.deliveryRows.forEach((row, idx) => {
        const label = `第${idx + 1}筆`;
        const parts: string[] = [];
        // 訂單序號：優先使用已持久化的 splitOrderSeq，否則動態計算
        const seqNo = row.splitOrderSeq && row.splitOrderSeq !== ''
          ? parseInt(row.splitOrderSeq, 10)
          : (idx === 0 ? parseInt(order.orderSeq, 10) : splitSeqBase + idx * 10);
        parts.push(`序號 ${seqNo}`);
        if ((row.splitNewMaterialNo ?? '') !== (order.materialNo ?? '')) parts.push(`料號 ${order.materialNo || '—'} → ${row.splitNewMaterialNo || '—'}`);
        if (row.newVendorDate !== row.vendorOriginalDate) parts.push(`交期→${row.newVendorDate}`);
        if (row.newQty) parts.push(`交貨量 ${row.newQty}`);
        if (parts.length) changes.push(`${label}：${parts.join('、')}`);
      });
      if (form.correctionNote.trim()) changes.push(`備註：${form.correctionNote.trim()}`);
      return changes.join('\n') || '（無欄位變更）';
    }

    // 料號變更
    if (form.newMaterialNo && form.newMaterialNo !== (order.materialNo ?? '')) {
      changes.push(`料號：${order.materialNo || '—'} → ${form.newMaterialNo}`);
    }

    // 修正備註
    if (form.correctionNote.trim()) {
      changes.push(`備註：${form.correctionNote.trim()}`);
    }

    // 各排程列變更
    form.deliveryRows.forEach((row, idx) => {
      const label = `第${idx + 1}期`;
      if (row.deleted) {
        // 只有刪除「原有期次」（originalQty > 0）才記入備註；
        // 刪除「新增期次」（originalQty === 0）不產生備註，因為那只是建立過程中的臨時增刪
        if (row.originalQty > 0) {
          changes.push(`${label}：刪除`);
        }
        return;
      }
      const rowChanges: string[] = [];
      if (row.newVendorDate !== row.vendorOriginalDate) {
        rowChanges.push(`交期 ${row.vendorOriginalDate || '—'} → ${row.newVendorDate}`);
      }
      if (row.newQty !== String(row.originalQty)) {
        rowChanges.push(`交貨量 ${row.originalQty} → ${row.newQty}`);
      }
      if (rowChanges.length > 0) {
        changes.push(`${label}：${rowChanges.join('、')}`);
      }
    });

    // 不拆單：第一行加入採購目標量
    if (changes.length > 0) {
      changes.unshift(`採購目標量：${totalNewQty}`);
    }
    return changes.length > 0 ? changes.join('\n') : '（無欄位變更）';
  };

  // ── 刪單模式 toggle（提交前可取消）─────────────────────────────────────────
  const handleToggleDeleteMode = () => {
    if (isDeleteMode) {
      // 取消刪單：還原到按下前的快照
      setIsDeleteMode(false);
      const snap = preDeleteRowsMapRef.current[order.id];
      if (snap) {
        setForm(p => ({
          ...p,
          deliveryRows: snap,
          periodInput: String(snap.length),
        }));
      }
    } else {
      // 啟動刪單：保存快照，自動計算新交貨量（合計=驗收量+在途量）
      preDeleteRowsMapRef.current[order.id] = form.deliveryRows.map(r => ({ ...r }));
      const minRequired = (order.acceptQty ?? 0) + (order.inTransitQty ?? 0);
      let remaining = minRequired;
      const newRows = form.deliveryRows.map(r => {
        if (remaining <= 0) return { ...r, newQty: '0', deleted: false };
        const assignQty = Math.min(r.originalQty, remaining);
        remaining -= assignQty;
        if (assignQty === 0) return { ...r, newQty: '0', deleted: false };
        return { ...r, newQty: String(assignQty), deleted: false };
      });
      setForm(p => ({ ...p, deliveryRows: newRows, periodInput: String(newRows.length) }));
      setIsDeleteMode(true);
    }
  };

  // ── 驗證：非刪單模式下，所有未刪除的項次「新交貨量」不可為 0 ──────────────
  const hasZeroQtyRow = useMemo(() => {
    if (isDeleteMode) return false;
    return form.deliveryRows.some(r => !r.deleted && r.newQty !== '' && parseFloat(r.newQty) === 0);
  }, [form.deliveryRows, isDeleteMode]);

  const handleSubmit = () => {
    if (hasZeroQtyRow) {
      showToast('新交貨量不可填 0，如需刪除請使用刪單功能');
      return;
    }
    if (belowMinQty) {
      showToast(`新交貨量合計（${totalNewQty}）不可少於驗收量＋在途量（${minRequiredQty}），無法開立修正單`);
      return;
    }
    if (aboveMaxQty) {
      showToast(`新交貨量合計（${totalNewQty}）不可超過訂貨量（${order.orderQty ?? 0}）`);
      return;
    }
    if (hasPastDate) {
      showToast('新廠商交期不可為過去日期');
      return;
    }
    if (isDeleteOrder) {
      setShowDeleteConfirm(true);
    } else {
      recordHistory(order.id, '修正單提交廠商確認', buildChangeSummary());
      setPerOrderStatus(prev => ({ ...prev, [order.id]: 'submitted' }));
      // showToast 必須在 onSubmit 之前呼叫：onSubmit 可能觸發父層導航而卸載此元件
      showToast(`修正單 ${correctionDocNo} 號已提交廠商，狀態轉為待廠商確認(V)`);
      onSubmit?.(currentIndex, stampSplitSeqs(form));
    }
  };
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    recordHistory(order.id, '修正單提交廠商-執行刪單', buildChangeSummary());
    setPerOrderStatus(prev => ({ ...prev, [order.id]: 'submitted' }));
    showToast(`刪單修正單 ${correctionDocNo} 號已提交廠商，待廠商確認後執行刪單(V)`);
    onSubmit?.(currentIndex, stampSplitSeqs(form), true);
  };
  const handleSave = () => {
    if (hasZeroQtyRow) {
      showToast('新交貨量不可填 0，如需刪除請使用刪單功能');
      return;
    }
    if (belowMinQty) {
      showToast(`新交貨量合計（${totalNewQty}）不可少於驗收量＋在途量（${minRequiredQty}），無法開立修正單`);
      return;
    }
    if (aboveMaxQty) {
      showToast(`新交貨量合計（${totalNewQty}）不可超過訂貨量（${order.orderQty ?? 0}）`);
      return;
    }
    if (hasPastDate) {
      showToast('新廠商交期不可為過去日期');
      return;
    }
    recordHistory(order.id, '修正單暫存', buildChangeSummary());
    setPerOrderStatus(prev => ({ ...prev, [order.id]: 'saved' }));
    showToast(`已開立修正單為草稿(DR)狀態：${correctionDocNo} 號`);
    onSave?.(currentIndex, stampSplitSeqs(form), isDeleteMode);
  };

  return (
    <div
      className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden"
    >
      {/* ── 頂部：原訂單資訊 ────────────────────────────────────────────────── */}
      <div className="content-stretch flex flex-col gap-[10px] items-start px-[23px] py-[10px] relative w-full shrink-0 border-b border-[rgba(145,158,171,0.12)]">
        <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
          <div onClick={onBack} className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity" aria-label="返回">
            <IconsSolidIcSolarMultipleForwardLeftBroken />
          </div>
          <div className="h-[48px] min-h-[48px] relative shrink-0">
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            <div className="flex flex-row items-center justify-center min-h-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-h-[inherit] relative px-[4px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">原訂單資訊</p>
              </div>
            </div>
          </div>
          <div className="bg-[#d3f4e0] h-[48px] min-w-[48px] relative rounded-[8px] shrink-0">
            <div aria-hidden="true" className="absolute border border-[#118d57] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] relative p-[12px]">
                <div className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#118d57] text-[16px] text-center whitespace-nowrap">
                  <p className="mb-0">訂單已確認(CK)</p>
                  <p>{(order.orderNo || '') + (order.orderSeq || '')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap flex-wrap">
          <InfoItem label="公司" value={order.company ?? ''} />
          <InfoItem label="採購組織" value={order.purchaseOrg ?? ''} />
          <InfoItem label="訂單號碼" value={order.orderNo} width="w-[200px]" />
          <InfoItem label="訂單序號" value={order.orderSeq} width="w-[200px]" />
          <InfoItem label="廠商(編號)" value={order.vendorName ?? order.vendorCode} width="w-[200px]" />
        </div>
        <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap flex-wrap">
          <InfoItem label="訂貨量" value={String(order.orderQty ?? 0)} width="w-[200px]" />
          <InfoItem label="驗收量" value={String(order.acceptQty ?? 0)} width="w-[200px]" />
          <InfoItem label="在途量" value={String(order.inTransitQty ?? 0)} width="w-[200px]" />
          <InfoItem label="廠商料號" value={order.vendorMaterialNo ?? ''} width="w-[410px]" />
        </div>
        <div className="content-stretch flex gap-[10px] items-center leading-[22px] relative shrink-0 text-[14px] w-full whitespace-nowrap flex-wrap">
          <InfoItem label="料號" value={order.materialNo ?? ''} width="w-[400px]" />
          <InfoItem label="品名" value={order.productName ?? ''} width="w-[400px]" />
        </div>
        {order.specification && <InfoItem label="規格" value={order.specification} width="w-auto" />}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 灰色區域：Header bar + 白卡 + 底部按鈕                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#f4f6f8] rounded-b-[16px] overflow-hidden">

        {/* ── Header bar ───────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-[16px] pl-[24px] pr-[12px] py-[17px] relative">
          <div className="content-stretch flex gap-[17px] items-center relative shrink-0">
            {/* 修正明細 */}
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[#1c252e] text-[18px] whitespace-nowrap">修正明細</p>
            {/* Tag 1: 單據類型 — 黑底白字；刪單模式 → 紅底白字「刪單」 */}
            <div
              className="h-[48px] min-w-[48px] relative rounded-[8px] shrink-0 transition-colors"
              style={{ backgroundColor: (isDeleteMode || correctionType === '刪單') ? '#ff5630' : '#1c252e' }}
            >
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[12px] relative">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-white text-[16px] text-center whitespace-nowrap">
                    {isDeleteMode ? '刪單' : (correctionType || '不拆單')}
                  </p>
                </div>
              </div>
            </div>
            {/* Tag 2: 修正單狀態 + 修正單號 — 動態色碼與列表對齊 */}
            <div
              className="h-[48px] min-w-[48px] relative rounded-[8px] shrink-0"
              style={{ backgroundColor: statusStyle.bg }}
            >
              <div
                aria-hidden="true"
                className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
                style={{ borderColor: statusStyle.border }}
              />
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] h-full items-center justify-center min-w-[inherit] px-[12px] relative">
                  <div
                    className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[16px] text-center whitespace-nowrap"
                    style={{ color: statusStyle.text }}
                  >
                    <p className="mb-0">{statusLabel}</p>
                    <p>{isExistingDoc || currentOrderLocalStatus ? correctionDocNo : ''}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Pagination */}
            <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0">
              <div
                className="relative rounded-[500px] shrink-0 size-[40px] cursor-pointer"
                style={{ opacity: currentIndex === 0 ? 0.3 : 0.48 }}
                onClick={() => currentIndex > 0 && onIndexChange(currentIndex - 1)}
              >
                <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[500px]" />
                <div className="flex items-center justify-center size-full">
                  <svg width="6" height="12" viewBox="0 0 5.8323 11.6678" fill="none">
                    <path d={svgRao.p3d3af100} fill="#637381" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col font-['Public_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 size-[40px] text-[#1c252e] text-[14px] text-center">
                <p className="leading-[22px]">{currentIndex + 1}/{total}</p>
              </div>
              <div
                className="bg-[#005eb8] relative rounded-[500px] shrink-0 size-[40px] cursor-pointer hover:bg-[#004a99] transition-colors flex items-center justify-center"
                style={{ opacity: currentIndex === total - 1 ? 0.3 : 1 }}
                onClick={() => currentIndex < total - 1 && onIndexChange(currentIndex + 1)}
              >
                <svg width="6" height="12" viewBox="0 0 5.88271 11.6925" fill="none">
                  <path d={svgRao.p2165200} fill="white" />
                </svg>
              </div>
            </div>
          </div>

          {/* 歷程 + 刪單 + 關閉 + 抽單 */}
          <div className="ml-auto flex items-center gap-[16px] relative">
            {/* 刪單按鈕：僅 edit 模式、未提交、非拆單時顯示 */}
            {viewMode === 'edit' && !isLocallySubmitted && !isSplitMode && (
              <button
                onClick={e => { e.stopPropagation(); handleToggleDeleteMode(); }}
                className={`flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] border transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] ${
                  isDeleteMode
                    ? 'bg-[#ff5630] border-[#ff5630] text-white hover:bg-[#e04e28]'
                    : 'bg-white border-[rgba(145,158,171,0.32)] text-[#ff5630] hover:bg-[rgba(255,86,48,0.06)]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
                {isDeleteMode ? '取消刪單' : '刪單'}
              </button>
            )}
            {/* 關閉按鈕：僅 purchaserReview (B) 模式顯示 */}
            {viewMode === 'purchaserReview' && (
              <button
                onClick={e => { e.stopPropagation(); onCloseToCL?.(); }}
                className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] border bg-white border-[rgba(145,158,171,0.32)] text-[#ff5630] hover:bg-[rgba(255,86,48,0.06)] transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
                關閉
              </button>
            )}
            {/* 抽單按鈕：V 狀態 + 採購/巨大角色 */}
            {viewMode === 'vendorReview' && (userRole === 'purchaser' || userRole === 'giant') && (
              <button
                onClick={e => { e.stopPropagation(); onWithdraw?.(); }}
                className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[8px] bg-[#637381] hover:bg-[#4a555f] transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white"
              >
                抽單
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); setShowHistory(true); }}
              className="content-stretch flex gap-[12px] items-center relative shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="relative shrink-0 size-[36px]">
                <div className="absolute inset-[0.17%_0_3.69%_0]"><ChatIcon /></div>
              </div>
              <p className="font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#005eb8] text-[16px] underline whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>歷程</p>
            </button>
          </div>
        </div>

        {/* ══ 退回廠商表單（inline swap，purchaserReview B 狀態）══════════ */}
        {showReturnForm ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-[27px]">
              <div className="bg-white rounded-[8px] w-full overflow-hidden">
                <div className="flex flex-col gap-[10px] px-[41px] pt-[22px] pb-[22px]">
                  {/* 標題 */}
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">請輸入退回原因</p>

                  {/* 文字區域 */}
                  <div className="w-full relative rounded-[8px] min-h-[240px]">
                    <div aria-hidden="true" className="absolute border-2 border-[#005eb8] border-solid inset-0 pointer-events-none rounded-[8px]" />
                    <textarea
                      value={returnReason}
                      onChange={e => { if (e.target.value.length <= 50) setReturnReason(e.target.value); }}
                      placeholder="請簡述原因，限50字"
                      rows={8}
                      className="w-full min-h-[240px] px-[16px] py-[12px] font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none resize-none placeholder:text-[#919eab] text-[#1c252e] rounded-[8px]"
                    />
                  </div>
                  <p className="text-right text-[12px] text-[#919eab]">{returnReason.length} / 50</p>
                </div>
              </div>
            </div>
            {/* 底部按鈕 */}
            <div className="shrink-0 flex gap-[12px] px-[27px] pt-[12px] pb-[16px]">
              {/* 退回廠商（確認送出） */}
              <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] bg-[#004680]">
                <button
                  onClick={() => {
                    setShowReturnForm(false);
                    onReturnToVendor?.(returnReason.trim());
                    showToast('已退回廠商');
                  }}
                  className="flex items-center justify-center min-w-[inherit] size-full"
                >
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[14px] text-center text-white whitespace-nowrap px-[12px]">退回廠商</p>
                </button>
              </div>
              {/* 取消 */}
              <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]">
                <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                <button
                  onClick={() => { setShowReturnForm(false); setReturnReason(''); }}
                  className="flex items-center justify-center min-w-[inherit] size-full hover:bg-[rgba(145,158,171,0.08)] rounded-[8px] transition-colors"
                >
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap px-[12px]">取消</p>
                </button>
              </div>
            </div>
          </>
        ) : showDisagreeForm ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-[27px]">
              <div className="bg-white rounded-[8px] w-full overflow-hidden">
                <div className="flex flex-col gap-[10px] px-[41px] pt-[22px] pb-[22px]">
                  {correctionType === '刪單' ? (
                    /* 刪單：不顯示異動原因選擇，直接顯示聯絡採購窗口訊息 */
                    <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] py-[8px]">
                      請與您的巨大採購窗口聯絡，進一步了解刪單細節。
                    </p>
                  ) : (<>
                  {/* 標題 */}
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">請選擇異動原因</p>

                  {/* ── Radio 1：不接單 ── */}
                  <div className="flex items-center gap-[10px] w-full h-[40px]">
                    <label className="flex items-center gap-[8px] shrink-0 cursor-pointer" onClick={() => setDisagreeType('reject')}>
                      <div className="relative size-[40px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          {disagreeType === 'reject' ? (
                            <>
                              <circle cx="10" cy="10" r="9" stroke="#005EB8" strokeWidth="2" />
                              <circle cx="10" cy="10" r="5" fill="#005EB8" />
                            </>
                          ) : (
                            <circle cx="10" cy="10" r="9" stroke="#637381" strokeWidth="2" />
                          )}
                        </svg>
                      </div>
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">不接單</p>
                    </label>
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${disagreeType === 'reject' ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.16)]'}`} />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="text"
                          value={disagreeRejectReason}
                          onChange={e => { if (e.target.value.length <= 50) setDisagreeRejectReason(e.target.value); }}
                          disabled={disagreeType !== 'reject'}
                          placeholder="請簡述原因，限50字"
                          className="flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] disabled:cursor-not-allowed disabled:text-[#c4cdd5] text-[#1c252e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Radio 2：調整交貨排程 ── */}
                  <div className="flex items-center gap-[10px] w-full h-[40px]">
                    <label className="flex items-center gap-[8px] shrink-0 cursor-pointer" onClick={() => { setDisagreeType('adjustSchedule'); initDisagreeRows(); }}>
                      <div className="relative size-[40px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          {disagreeType === 'adjustSchedule' ? (
                            <>
                              <circle cx="10" cy="10" r="9" stroke="#005EB8" strokeWidth="2" />
                              <circle cx="10" cy="10" r="5" fill="#005EB8" />
                            </>
                          ) : (
                            <circle cx="10" cy="10" r="9" stroke="#637381" strokeWidth="2" />
                          )}
                        </svg>
                      </div>
                      <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isSplitMode ? 'text-[#1c252e]' : 'text-[#005eb8]'}`}>{isSplitMode ? '調整拆單數' : '調整交貨排程'}</p>
                    </label>
                    {/* 期數 */}
                    <div className="relative rounded-[8px] shrink-0 w-[138px] h-full">
                      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${disagreeType === 'adjustSchedule' ? 'border-[rgba(145,158,171,0.16)]' : 'border-[rgba(145,158,171,0.16)]'}`} />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="number" min={isSplitMode ? "2" : "1"} max="99"
                          value={disagreeAdjustPeriod}
                          onChange={e => {
                            if (disagreeType !== 'adjustSchedule') return;
                            if (isSplitMode && effectiveStatusCode === 'V') return; // 拆單V狀態：廠商不可改期數
                            setDisagreeAdjustPeriod(e.target.value);
                            const count = parseInt(e.target.value) || 0;
                            const minCount = isSplitMode ? 2 : 1;
                            if (count >= minCount && count <= 99) {
                              const orderQty = order.orderQty ?? 0;
                              setDisagreeDeliveryRows(prev => {
                                let rows = [...prev];
                                if (isSplitMode) {
                                  // 拆單：增加直接新增列，減少從後往前截斷
                                  if (count > rows.length) {
                                    for (let i = rows.length; i < count; i++) {
                                      const computedSeq = i === 0 ? parseInt(order.orderSeq, 10) : splitSeqBase + i * 10;
                                      rows.push({
                                        id: nextRid(),
                                        expectedDelivery: rows[0]?.expectedDelivery ?? '',
                                        vendorOriginalDate: rows[0]?.vendorOriginalDate ?? '',
                                        newVendorDate: rows[0]?.newVendorDate ?? '',
                                        originalQty: orderQty,
                                        newQty: '',
                                        splitOrderSeq: String(computedSeq),
                                        splitNewMaterialNo: order.materialNo ?? '',
                                      });
                                    }
                                  } else {
                                    rows = rows.slice(0, Math.max(count, 2));
                                  }
                                  // 重新分配交貨量
                                  const n = rows.length;
                                  const base = Math.floor(orderQty / n);
                                  const rem = orderQty % n;
                                  rows = rows.map((r, i) => ({ ...r, newQty: String(i < rem ? base + 1 : base) }));
                                } else {
                                  // 不拆單：增加/刪減，平均分配 purchaserAdjustedTotal
                                  while (rows.length < count) {
                                    const base = rows[0] || form.deliveryRows[0];
                                    rows.push({ id: nextRid(), expectedDelivery: base?.expectedDelivery ?? '', vendorOriginalDate: base?.vendorOriginalDate ?? '', newVendorDate: '', originalQty: 0, newQty: '0' });
                                  }
                                  rows = rows.slice(0, count);
                                  // 均分採購目標量
                                  const n = rows.length;
                                  const pBase = Math.floor(purchaserAdjustedTotal / n);
                                  const pRem = purchaserAdjustedTotal % n;
                                  rows = rows.map((r, i) => ({ ...r, newQty: String(i < pRem ? pBase + 1 : pBase) }));
                                }
                                return rows;
                              });
                            }
                          }}
                          disabled={disagreeType !== 'adjustSchedule' || (isSplitMode && effectiveStatusCode === 'V')}
                          placeholder="請輸入期數"
                          className="w-full font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#454f5b] text-[14px] bg-transparent outline-none placeholder:text-[#919eab] disabled:cursor-not-allowed disabled:text-[#c4cdd5]"
                        />
                      </div>
                    </div>
                    {/* 原因 */}
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="text"
                          value={disagreeAdjustReason}
                          onChange={e => { if (e.target.value.length <= 50) setDisagreeAdjustReason(e.target.value); }}
                          disabled={disagreeType !== 'adjustSchedule'}
                          placeholder="請簡述原因"
                          className="flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] disabled:cursor-not-allowed disabled:text-[#c4cdd5] text-[#1c252e]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 原單期數提示 */}
                  {disagreeType === 'adjustSchedule' && (
                    <div className="flex items-center gap-[10px]">
                      <div className="shrink-0" style={{ width: '152px' }} />
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#919eab] text-[12px] leading-[18px] whitespace-nowrap shrink-0">
                         原單 {isSplitMode ? 1 : form.deliveryRows.filter(r => !r.deleted).length} 期
                      </p>
                    </div>
                  )}
                  </>)}
                </div>

                {/* ── 不拆單：原料號 / 新料號 ── */}
                {disagreeType === 'adjustSchedule' && !isSplitMode && (
                  <div className="flex gap-[10px] items-center w-full h-[40px] px-[41px] pb-[10px]">
                    <div className="flex-[1_0_0] flex items-center h-full gap-[10px]">
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">原料號</p>
                      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                        <div aria-hidden="true" className="absolute border border-[#dfe3e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
                        <div className="flex items-center size-full px-[12px] py-[6px]">
                          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[14px] whitespace-nowrap">{order.materialNo ?? '—'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-[1_0_0] flex items-center h-full gap-[10px]">
                      <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[14px] whitespace-nowrap ${hasAcceptQty || effectiveStatusCode === 'V' ? 'text-[#919eab]' : 'text-[#005eb8]'}`}>新料號</p>
                      <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                        <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${disagreeNewMaterialNo && disagreeNewMaterialNo !== (order.materialNo ?? '') ? 'border-[#ff5630]' : 'border-[#dfe3e8]'}`} />
                        <div className="flex items-center size-full px-[12px] py-[6px]">
                          <input
                            type="text"
                            value={disagreeNewMaterialNo}
                            onChange={e => !hasAcceptQty && effectiveStatusCode !== 'V' && setDisagreeNewMaterialNo(e.target.value)}
                            disabled={hasAcceptQty || effectiveStatusCode === 'V'}
                            placeholder={hasAcceptQty ? '已有驗收量不得修改料號' : ''}
                            className={`flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] disabled:cursor-not-allowed ${disagreeNewMaterialNo && disagreeNewMaterialNo !== (order.materialNo ?? '') ? 'text-[#ff5630]' : 'text-[#454f5b]'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 調整交貨排程表格 ── */}
                {disagreeType === 'adjustSchedule' && disagreeDeliveryRows.length > 0 && (
                  <div className="mx-[27px] mb-[22px] rounded-[8px] overflow-hidden border border-[rgba(145,158,171,0.2)]">
                    {/* 表頭 */}
                    <div className="flex items-center w-full gap-[20px] px-[45px] h-[40px] border-b border-[rgba(145,158,171,0.2)] bg-[rgba(145,158,171,0.04)]">
                      <div className="shrink-0 w-[50px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">項次</p></div>
                      {isSplitMode && (
                        <div className="shrink-0 w-[70px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">訂單序號</p></div>
                      )}
                      {isSplitMode && (
                        <div className="shrink-0 w-[150px]"><p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] ${effectiveStatusCode === 'V' ? 'text-[#1c252e]' : 'text-[#005eb8]'} text-[14px] whitespace-nowrap`}>新料號</p></div>
                      )}
                      <div className="shrink-0 w-[100px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">預計交期</p></div>
                      <div className="shrink-0 w-[100px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">原廠商交期</p></div>
                      <div className="shrink-0 w-[150px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] whitespace-nowrap">新廠商交期</p></div>
                      {!isSplitMode && (
                        <div className="shrink-0 w-[100px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">原交貨量</p></div>
                      )}
                      <div className="shrink-0 w-[150px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] whitespace-nowrap">新交貨量</p></div>
                      <div className="shrink-0 size-[24px]" />
                    </div>
                    {/* 資料列 */}
                    {disagreeDeliveryRows.map((row, idx) => {
                      const purchaserOrig = purchaserOriginalRowsRef.current.find(o => o.id === row.id);
                      const isDeleted = !!row.deleted;
                      const dateChanged = !isDeleted && purchaserOrig ? row.newVendorDate !== purchaserOrig.newVendorDate : !isDeleted && !!row.newVendorDate;
                      const qtyChanged = !isDeleted && purchaserOrig ? row.newQty !== purchaserOrig.newQty : !isDeleted && row.newQty !== '0';
                      // 刪除狀態是否與採購方不同（廠商復原了採購方刪除的項次，或廠商刪了採購方保留的項次）
                      const deletedChanged = purchaserOrig ? isDeleted !== !!purchaserOrig.deleted : true;
                      return (
                      <div
                        key={row.id}
                        className={`flex items-center w-full gap-[20px] px-[45px] h-[52px] border-t border-[rgba(145,158,171,0.1)] first:border-t-0 relative transition-colors ${isDeleted ? 'bg-[rgba(255,86,48,0.04)]' : !purchaserOrig ? 'bg-[rgba(0,94,184,0.03)]' : deletedChanged ? 'bg-[rgba(0,94,184,0.03)]' : ''}`}
                      >
                        {/* 軟刪除紅線覆蓋層 */}
                        {isDeleted && (
                          <div className="absolute inset-x-[45px] top-1/2 h-[1.5px] bg-[#ff5630] pointer-events-none z-[1]" />
                        )}
                        <div className="flex items-center shrink-0 w-[50px]"><p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{idx + 1}</p></div>
                        {isSplitMode && (
                          <div className="flex items-center shrink-0 w-[70px]"><p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.splitOrderSeq || (idx === 0 ? order.orderSeq : String(splitSeqBase + idx * 10))}</p></div>
                        )}
                        {isSplitMode && (
                          <div className={`flex items-center shrink-0 w-[150px] ${isDeleted ? 'opacity-70 pointer-events-none' : ''}`}>
                            <div className="flex-1 h-[36px] min-w-0 relative rounded-[8px]">
                              <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[8px] border-[rgba(145,158,171,0.2)]" />
                              <input
                                type="text"
                                value={row.splitNewMaterialNo ?? order.materialNo ?? ''}
                                onChange={e => effectiveStatusCode !== 'V' && setDisagreeDeliveryRows(prev => prev.map(r => r.id === row.id ? { ...r, splitNewMaterialNo: e.target.value } : r))}
                                disabled={effectiveStatusCode === 'V'}
                                placeholder=""
                                className="w-full h-full px-[8px] font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] leading-[22px] bg-transparent outline-none disabled:cursor-not-allowed placeholder:text-[#919eab] text-[#454f5b]"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center shrink-0 w-[100px]"><p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.expectedDelivery || '—'}</p></div>
                        <div className="flex items-center shrink-0 w-[100px]"><p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.vendorOriginalDate || '—'}</p></div>
                        <div className={`flex items-center shrink-0 w-[150px] ${isDeleted ? 'opacity-70 pointer-events-none' : ''}`}>
                          <DateCell value={row.newVendorDate} rowId={row.id} onSelect={(id, date) => setDisagreeDeliveryRows(prev => prev.map(r => r.id === id ? { ...r, newVendorDate: date } : r))} isChanged={dateChanged} minDate={todayStr} />
                        </div>
                        {!isSplitMode && (
                          <div className="flex items-center shrink-0 w-[100px]"><p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.originalQty}</p></div>
                        )}
                        <div className={`flex items-center shrink-0 w-[150px] ${isDeleted ? 'opacity-70 pointer-events-none' : ''}`}>
                          <QtyField value={row.newQty} onChange={val => setDisagreeDeliveryRows(prev => prev.map(r => r.id === row.id ? { ...r, newQty: val } : r))} isChanged={qtyChanged} />
                        </div>
                        {/* 操作按鈕：刪除 / 復原 */}
                        <div className="flex items-center justify-center shrink-0 size-[24px] z-[2]">
                          {(isSplitMode ? (effectiveStatusCode !== 'V' && idx >= 2) : (idx !== 0 && !isDeleted)) && (
                            <TrashIcon onClick={() => {
                              if (isSplitMode) {
                                // 拆單：直接移除並重新分配交貨量
                                setDisagreeDeliveryRows(prev => {
                                  const rows = prev.filter(r => r.id !== row.id);
                                  const orderQty = order.orderQty ?? 0;
                                  const n = rows.length;
                                  const base = Math.floor(orderQty / n);
                                  const rem = orderQty % n;
                                  return rows.map((r, i) => ({ ...r, newQty: String(i < rem ? base + 1 : base) }));
                                });
                                setDisagreeAdjustPeriod(prev => String(parseInt(prev) - 1));
                              } else {
                                // 不拆單：新增列硬刪除、原列軟刪除
                                const isNewRow = !purchaserOriginalRowsRef.current.find(o => o.id === row.id);
                                if (isNewRow) {
                                  // 硬刪除並重新均分
                                  setDisagreeDeliveryRows(prev => {
                                    const rows = prev.filter(r => r.id !== row.id);
                                    const active = rows.filter(r => !r.deleted);
                                    const n = active.length;
                                    if (n > 0) {
                                      const pBase = Math.floor(purchaserAdjustedTotal / n);
                                      const pRem = purchaserAdjustedTotal % n;
                                      let ai = 0;
                                      return rows.map(r => r.deleted ? r : { ...r, newQty: String(ai < pRem ? (ai++, pBase + 1) : (ai++, pBase)) });
                                    }
                                    return rows;
                                  });
                                  setDisagreeAdjustPeriod(prev => String(parseInt(prev) - 1));
                                } else {
                                  // 原列軟刪除
                                  setDisagreeDeliveryRows(prev => prev.map(r => r.id === row.id ? { ...r, deleted: true } : r));
                                }
                              }
                            }} />
                          )}
                          {idx !== 0 && isDeleted && (
                            <button
                              onClick={() => setDisagreeDeliveryRows(prev => prev.map(r => r.id === row.id ? { ...r, deleted: false } : r))}
                              title="復原此項次"
                              className="flex items-center justify-center shrink-0 size-[24px] hover:opacity-70 transition-opacity"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="#637381"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}

                {/* ── 不同意調整交貨排程驗證摘要（同修正明細格式，放在表格下方） ── */}
                {(() => {
                  if (disagreeType !== 'adjustSchedule' || disagreeDeliveryRows.length === 0) return null;
                  const dTotalNewQty = disagreeDeliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);
                  const dNotMatchPurchaser = dTotalNewQty !== purchaserAdjustedTotal;
                  const dHasZeroQty = disagreeDeliveryRows.some(r => !r.deleted && (parseFloat(r.newQty) || 0) === 0);
                  const dHasPastDate = disagreeDeliveryRows.some(r => !r.deleted && !!r.newVendorDate && r.newVendorDate < todayStr);
                  return (
                    <>
                      <div className={`px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] flex-wrap ${dNotMatchPurchaser || dHasZeroQty ? 'bg-[rgba(255,86,48,0.04)]' : 'bg-[rgba(145,158,171,0.03)]'}`}>
                          <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#637381] leading-[18px] shrink-0">
                            新交貨量合計：
                            <strong className={dNotMatchPurchaser ? 'text-[#ff5630]' : 'text-[#118d57]'}>{dTotalNewQty}</strong>
                            　｜　採購設定目標量：<strong>{purchaserAdjustedTotal}</strong>
                          </p>
                          {dNotMatchPurchaser && (
                            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                              ⚠ 新交貨量合計須等於採購設定目標量（{purchaserAdjustedTotal}），提交已鎖定
                            </p>
                          )}
                          {dHasZeroQty && (
                            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                              ⚠ 新交貨量不可填 0，如需刪除請使用刪單功能
                            </p>
                          )}
                        </div>

                      {dHasPastDate && (
                        <div className="px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] bg-[rgba(255,86,48,0.04)]">
                          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                            ⚠ 新廠商交期不可為過去日期，請重新選擇
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            {/* ── 底部按鈕：提交採購 / 取消 ── */}
            <div className="shrink-0 flex gap-[12px] items-center px-[40px] py-[17px]">
              {correctionType === '刪單' ? (
                /* 刪單：僅顯示「關閉」按鈕 */
                <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <button onClick={() => setShowDisagreeForm(false)} className="flex items-center justify-center min-w-[inherit] size-full hover:bg-[rgba(145,158,171,0.08)] rounded-[8px] transition-colors">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap px-[12px]">關閉</p>
                  </button>
                </div>
              ) : (() => {
                const hasMaterialNoChange = !!(disagreeNewMaterialNo && disagreeNewMaterialNo !== (order.materialNo ?? ''));
                // ── 驗證邏輯（同修正明細） ──
                const dTotalNewQty = disagreeDeliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);
                const dNotMatchPurchaser = dTotalNewQty !== purchaserAdjustedTotal;
                const dSplitTooFew = isSplitMode && disagreeDeliveryRows.filter(r => !r.deleted).length < 2;
                const dHasZeroQty = disagreeDeliveryRows.some(r => !r.deleted && (parseFloat(r.newQty) || 0) === 0);
                const dHasPastDate = disagreeDeliveryRows.some(r => !r.deleted && !!r.newVendorDate && r.newVendorDate < todayStr);
                const hasAnyChangeInRows = disagreeDeliveryRows.some(r => {
                  const orig = purchaserOriginalRowsRef.current.find(o => o.id === r.id);
                  if (!orig) return true;
                  return r.newVendorDate !== orig.newVendorDate || r.newQty !== orig.newQty || !!r.deleted !== !!orig.deleted || (r.splitNewMaterialNo ?? '') !== (orig as any).splitNewMaterialNo;
                }) || disagreeDeliveryRows.length !== purchaserOriginalRowsRef.current.length;
                const canSubmit = disagreeType === 'reject'
                  ? !!disagreeRejectReason.trim()
                  : (!!disagreeAdjustReason.trim() || hasMaterialNoChange || hasAnyChangeInRows)
                    && !dNotMatchPurchaser && !dHasZeroQty && !dHasPastDate && !dSplitTooFew;

                return (
                  <>
                    <div className={`flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] transition-opacity ${canSubmit ? 'bg-[#004680]' : 'bg-[#919eab] opacity-50'}`}>
                      <button
                        disabled={!canSubmit}
                        onClick={() => {
                          let reason = '';
                          if (disagreeType === 'reject') {
                            reason = `不接單：${disagreeRejectReason.trim()}`;
                          } else {
                            const parts: string[] = [];
                            if (hasMaterialNoChange) parts.push(`料號：${order.materialNo || '—'} → ${disagreeNewMaterialNo}`);
                            if (disagreeAdjustReason.trim()) parts.push(`調整交貨排程：${disagreeAdjustReason.trim()}`);
                            const origRows = purchaserOriginalRowsRef.current;
                            // 逐期比對差異（對比採購方原始修正內容）
                            disagreeDeliveryRows.forEach((r, i) => {
                              const orig = origRows.find(o => o.id === r.id);
                              const changes: string[] = [];
                              if (!orig) {
                                // 新增的期數
                                if (isSplitMode && r.splitNewMaterialNo && r.splitNewMaterialNo !== (order.materialNo ?? '')) changes.push(`料號 → ${r.splitNewMaterialNo}`);
                                if (r.newVendorDate) changes.push(`新交貨日 ${r.newVendorDate}`);
                                if (r.newQty !== '0') changes.push(`新交貨量 ${r.newQty}`);
                                if (changes.length > 0) parts.push(`第${i + 1}期（新增）：${changes.join('、')}`);
                              } else {
                                // 刪除狀態變更
                                if (!!r.deleted !== !!orig.deleted) {
                                  parts.push(`第${i + 1}期：${r.deleted ? '廠商刪除此項次' : '廠商復原此項次'}`);
                                }
                                if (!r.deleted) {
                                  const origMat = (orig as any).splitNewMaterialNo ?? '';
                                  const newMat = r.splitNewMaterialNo ?? '';
                                  if (isSplitMode && newMat !== origMat) changes.push(`料號 ${origMat || order.materialNo || '—'} → ${newMat || order.materialNo || '—'}`);
                                  if (r.newVendorDate !== orig.newVendorDate) changes.push(`新交貨日 ${orig.newVendorDate || '—'} → ${r.newVendorDate || '—'}`);
                                  if (r.newQty !== orig.newQty) changes.push(`新交貨量 ${orig.newQty} → ${r.newQty}`);
                                  if (changes.length > 0) parts.push(`第${i + 1}期：${changes.join('、')}`);
                                }
                              }
                            });
                            reason = parts.join('；');
                          }
                          setShowDisagreeForm(false);
                          // 調整交貨排程時，將廠商調整後的交貨排程一併傳出
                          if (disagreeType === 'adjustSchedule') {
                            const adjustedRows = disagreeDeliveryRows.map(r => ({
                              expectedDelivery: r.expectedDelivery,
                              vendorOriginalDate: r.vendorOriginalDate,
                              newVendorDate: r.newVendorDate,
                              originalQty: r.originalQty,
                              newQty: r.newQty,
                              deleted: r.deleted,
                              splitNewMaterialNo: r.splitNewMaterialNo,
                            }));
                            onDisagree?.(reason, adjustedRows, hasMaterialNoChange ? disagreeNewMaterialNo : undefined);
                          } else {
                            onDisagree?.(reason);
                          }
                          showToast('已提交調整修正單');
                        }}
                        className="flex items-center justify-center min-w-[inherit] size-full disabled:cursor-not-allowed"
                      >
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[14px] text-center text-white whitespace-nowrap px-[12px]">提交採購</p>
                      </button>
                    </div>
                    <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px]">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <button onClick={() => setShowDisagreeForm(false)} className="flex items-center justify-center min-w-[inherit] size-full hover:bg-[rgba(145,158,171,0.08)] rounded-[8px] transition-colors">
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap px-[12px]">取消</p>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        ) : (
        <>
        {/* ── 白底卡片（可捲動）────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-[27px]">
          <div className="bg-white rounded-[8px] w-full overflow-hidden">

            {/* ── 欄位區（依修正型態切換）───────────────────────────────────── */}
            {isSplitMode ? (
              /* ── 拆單模式欄位 ── */
              <div className="flex flex-col gap-[10px] px-[41px] pt-[22px] pb-[16px]">
                <div className="flex gap-[10px] items-center w-full h-[40px]">
                  <div className="flex-[1_0_0] flex items-center h-full gap-[10px]">
                    <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[14px] whitespace-nowrap ${isReadOnly ? 'text-[#1c252e]' : 'text-[#005eb8]'}`}>拆單數</p>
                    <div className="relative rounded-[8px] shrink-0 w-[138px] h-full">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="number" min="2" max="99"
                          value={form.periodInput}
                          onChange={e => {
                            if (isReadOnly) return;
                            const v = e.target.value;
                            if (v !== '' && parseInt(v, 10) < 2) return;
                            setForm(p => ({ ...p, periodInput: v }));
                          }}
                          readOnly={isReadOnly}
                          placeholder="拆單數"
                          className="w-full font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#454f5b] text-[14px] bg-transparent outline-none placeholder:text-[#919eab] read-only:cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-[3_0_0] flex items-center h-full gap-[10px]">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">修正備註</p>
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="text"
                          value={form.correctionNote}
                          onChange={e => !isReadOnly && setForm(p => ({ ...p, correctionNote: e.target.value }))}
                          readOnly={isReadOnly}
                          placeholder={isReadOnly ? '' : '輸入備註'}
                          className="flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[#454f5b] text-[14px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] read-only:cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* 原單序號數量提示 */}
                <div className="flex items-center gap-[10px] pl-[0px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[13px] whitespace-nowrap">原單序號數量：1</p>
                </div>
              </div>
            ) : (
              /* ── 不拆單模式欄位 ── */
              <div className="flex flex-col gap-[10px] px-[41px] pt-[22px] pb-[16px]">
                {/* Row 1: ��料號 / 新料號 */}
                <div className="flex gap-[10px] items-center w-full h-[40px]">
                  <div className="flex-[1_0_0] flex items-center h-full gap-[10px]">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">原料號</p>
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                      <div aria-hidden="true" className="absolute border border-[#dfe3e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[14px] whitespace-nowrap">{order.materialNo ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-[1_0_0] flex items-center h-full gap-[10px]">
                    <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[14px] whitespace-nowrap ${isReadOnly ? (hasMaterialChange ? 'text-[#ff5630]' : 'text-[#1c252e]') : (hasAcceptQty ? 'text-[#919eab]' : 'text-[#005eb8]')}`}>新料號</p>
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[8px] ${form.newMaterialNo && form.newMaterialNo !== (order.materialNo ?? '') ? 'border-[#ff5630]' : 'border-[#dfe3e8]'}`} />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="text"
                          value={form.newMaterialNo}
                          onChange={e => !hasAcceptQty && !isReadOnly && !isDeleteMode && setForm(p => ({ ...p, newMaterialNo: e.target.value }))}
                          disabled={hasAcceptQty || isReadOnly || isDeleteMode}
                          placeholder={hasAcceptQty ? '已有驗收量不得修改料號' : ''}
                          className={`flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] disabled:cursor-not-allowed ${form.newMaterialNo && form.newMaterialNo !== (order.materialNo ?? '') ? 'text-[#ff5630]' : 'text-[#454f5b]'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Row 2: 交貨排程 / 修正備註 */}
                <div className="flex gap-[10px] items-center w-full h-[40px]">
                  <div className="flex-[1_0_0] flex items-center h-full gap-[10px]">
                    <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[14px] whitespace-nowrap ${isReadOnly || isDeleteMode ? 'text-[#1c252e]' : 'text-[#005eb8]'}`}>交貨排程</p>
                    <div className="relative rounded-[8px] shrink-0 w-[138px] h-full">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="number" min="1" max="99"
                          value={form.periodInput}
                          onChange={e => !isReadOnly && !isDeleteMode && setForm(p => ({ ...p, periodInput: e.target.value }))}
                          readOnly={isReadOnly || isDeleteMode}
                          placeholder="請輸入期數"
                          className="w-full font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#454f5b] text-[14px] bg-transparent outline-none placeholder:text-[#919eab] read-only:cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-[3_0_0] flex items-center h-full gap-[10px]">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[#1c252e] text-[14px] whitespace-nowrap">修正備註</p>
                    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[8px]">
                      <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                      <div className="flex items-center size-full px-[12px] py-[6px]">
                        <input
                          type="text"
                          value={form.correctionNote}
                          onChange={e => !isReadOnly && setForm(p => ({ ...p, correctionNote: e.target.value }))}
                          readOnly={isReadOnly}
                          placeholder={isReadOnly ? '' : '輸入備註'}
                          className="flex-1 min-w-0 font-['Public_Sans:Regular',sans-serif] font-normal text-[#454f5b] text-[14px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] read-only:cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Row 3: 原單期數提示 */}
                <div className="flex gap-[10px] items-center w-full">
                  <div className="flex-[1_0_0] flex items-center gap-[10px]">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] shrink-0 text-[14px] whitespace-nowrap text-transparent select-none">交貨排程</p>
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#919eab] text-[12px] leading-[18px] whitespace-nowrap shrink-0">原單 {form.originalPeriodCount} 期</p>
                  </div>
                  <div className="flex-[3_0_0]" />
                </div>
              </div>
            )}

            {/* ── 表格（依修正型態切換）──────────────────────────────────────── */}
            {isSplitMode ? (
              /* ── 拆單表格 ── */
              <div className="mx-[16px] mb-[22px] rounded-[8px] overflow-hidden border border-[rgba(145,158,171,0.2)]">
                {/* 表頭 */}
                <div className="flex items-center gap-[8px] px-[12px] h-[40px] border-b border-[rgba(145,158,171,0.2)] bg-[rgba(145,158,171,0.04)]">
                  <div className="shrink-0 w-[32px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[13px] whitespace-nowrap">項次</p></div>
                  <div className="shrink-0 w-[56px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[13px] whitespace-nowrap">訂單序號</p></div>
                  <div className="shrink-0 w-[200px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[13px] whitespace-nowrap">新料號</p></div>
                  <div className="shrink-0 w-[76px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[13px] whitespace-nowrap">預計交期</p></div>
                  <div className="shrink-0 w-[76px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[13px] whitespace-nowrap">原廠商交期</p></div>
                  <div className="shrink-0 w-[150px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[13px] whitespace-nowrap">新廠商交期</p></div>
                  <div className="shrink-0 w-[76px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[13px] whitespace-nowrap">新交貨量</p></div>
                  <div className="shrink-0 size-[24px]" />
                </div>
                {/* 資料列 */}
                {form.deliveryRows.map((row, idx) => {
                  const dateChanged = row.newVendorDate !== row.vendorOriginalDate;
                  const qtyChanged = !!row.newQty && row.newQty !== String(row.originalQty);
                  // 訂單序號：優先使用已持久化的 splitOrderSeq，否則動態計算
                  const computedSeq = row.splitOrderSeq && row.splitOrderSeq !== ''
                    ? parseInt(row.splitOrderSeq, 10)
                    : (idx === 0 ? parseInt(order.orderSeq, 10) : splitSeqBase + idx * 10);
                  return (
                    <div
                      key={row.id}
                      className="flex items-center gap-[8px] px-[12px] h-[52px] border-t border-[rgba(145,158,171,0.1)] first:border-t-0 relative transition-colors"
                    >
                      {/* 項次 */}
                      <div className="shrink-0 w-[32px]"><p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[13px] whitespace-nowrap text-[#454f5b]">{idx + 1}</p></div>
                      {/* 訂單序號 — 項次1=原序號, 項次2+=maxSeq+idx*10，全部唯讀無外框 */}
                      <div className="shrink-0 w-[56px] flex items-center">
                        <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] leading-[22px] whitespace-nowrap text-[#454f5b]">
                          {computedSeq}
                        </p>
                      </div>
                      {/* 新料號（預帶原料號，有驗收量時鎖定；紅字顯示若已變更） */}
                      {(() => {
                        const matChanged = (row.splitNewMaterialNo ?? '') !== (order.materialNo ?? '');
                        const matDisabled = isReadOnly || (order.acceptQty ?? 0) > 0;
                        return (
                          <div className="shrink-0 w-[200px]">
                            <div className="h-[34px] relative rounded-[8px]">
                              <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[8px] border-[#dfe3e8]" />
                              <div className="flex items-center size-full px-[8px]">
                                <input
                                  type="text"
                                  value={row.splitNewMaterialNo ?? ''}
                                  onChange={e => !matDisabled && updateRow(row.id, 'splitNewMaterialNo', e.target.value)}
                                  disabled={matDisabled}
                                  title={matDisabled && !isReadOnly ? '有驗收量，料號不可修改' : undefined}
                                  placeholder={order.materialNo ?? '新料號'}
                                  className={`w-full font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] leading-[22px] bg-transparent outline-none placeholder:text-[#919eab] disabled:cursor-not-allowed ${matChanged ? 'text-[#ff5630]' : 'text-[#454f5b]'}`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* 預計交期 */}
                      <div className="shrink-0 w-[76px]"><p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[13px] whitespace-nowrap text-[#454f5b]">{row.expectedDelivery || '—'}</p></div>
                      {/* 原廠商交期 */}
                      <div className="shrink-0 w-[76px]"><p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[13px] whitespace-nowrap text-[#454f5b]">{row.vendorOriginalDate || '—'}</p></div>
                      {/* 新廠商交期 */}
                      <div className={`shrink-0 w-[150px] ${isReadOnly ? 'pointer-events-none' : ''}`}>
                        <DateCell value={row.newVendorDate} rowId={row.id} onSelect={(id, date) => updateRow(id, 'newVendorDate', date)} isChanged={dateChanged} disabled={isReadOnly} minDate={todayStr} />
                      </div>
                      {/* 新交貨量 */}
                      <div className={`shrink-0 w-[76px] ${isReadOnly ? 'pointer-events-none' : ''}`}>
                        <QtyField value={row.newQty} onChange={val => !isReadOnly && updateRow(row.id, 'newQty', val)} isChanged={qtyChanged} highlight={row.newQty !== '' && parseFloat(row.newQty) === 0} />
                      </div>
                      {/* 操作按鈕（第一列不顯示；拆單新增項次直接刪除而非軟刪除） */}
                      <div className="flex items-center justify-center shrink-0 size-[24px] z-[2]">
                        {!isReadOnly && idx >= 2 && <TrashIcon onClick={() => removeSplitRow(row.id)} />}
                      </div>
                    </div>
                  );
                })}
                {/* 拆單：新交貨量合計驗證（訂貨量>=新交貨量加總>=驗收量+在途量） */}
                {(() => {
                  const splitTotalNewQty = form.deliveryRows.reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);
                  const orderQty = order.orderQty ?? 0;
                  const splitMinQty = (order.acceptQty ?? 0) + (order.inTransitQty ?? 0);
                  const exceedOrder = splitTotalNewQty > orderQty;
                  const belowMin = splitMinQty > 0 && splitTotalNewQty < splitMinQty;
                  const hasQtyInput = form.deliveryRows.some(r => r.newQty !== '');
                  const hasZeroInput = form.deliveryRows.some(r => r.newQty !== '' && parseFloat(r.newQty) === 0);
                  if (!hasQtyInput) return null;
                  return (
                    <div className={`px-[12px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[12px] flex-wrap ${exceedOrder || belowMin || hasZeroInput ? 'bg-[rgba(255,86,48,0.04)]' : 'bg-[rgba(145,158,171,0.03)]'}`}>
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#637381] leading-[18px] shrink-0">
                        新交貨量合計：
                        <strong className={exceedOrder || belowMin ? 'text-[#ff5630]' : 'text-[#118d57]'}>{splitTotalNewQty}</strong>
                        　｜　訂貨量：<strong>{orderQty}</strong>
                        {splitMinQty > 0 && (<>　｜　驗收量＋在途量：<strong>{splitMinQty}</strong></>)}
                      </p>
                      {exceedOrder && (
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                          ⚠ 新交貨量合計不可超過訂貨量（{orderQty}）
                        </p>
                      )}
                      {belowMin && (
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                          ⚠ 新交貨量合計不可低於驗收量＋在途量（{splitMinQty}）
                        </p>
                      )}
                      {hasZeroInput && (
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                          ⚠ 新交貨量不可填 0
                        </p>
                      )}
                    </div>
                  );
                })()}
                {/* 拆單：過去日期警告 */}
                {!isReadOnly && form.deliveryRows.some(r => !!r.newVendorDate && r.newVendorDate < todayStr) && (
                  <div className="px-[12px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[12px] bg-[rgba(255,86,48,0.04)]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                      ⚠ 新廠商交期不可為過去日期
                    </p>
                  </div>
                )}
                {/* 拆單：無異動提示 */}
                {noChangeBlock && (
                  <div className="px-[12px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[12px] bg-[rgba(255,171,0,0.06)]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#b76e00] leading-[18px] shrink-0">⚠ 尚無異動項目，請增加拆單筆數或填入欄位後方可開立修正單</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── 不拆單表格 ── */
              <div className="mx-[27px] mb-[22px] rounded-[8px] overflow-hidden border border-[rgba(145,158,171,0.2)]">
              {/* 表頭 */}
              <div className="flex items-center w-full gap-[20px] px-[45px] h-[40px] border-b border-[rgba(145,158,171,0.2)] bg-[rgba(145,158,171,0.04)]">
                <div className="shrink-0 w-[50px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">項次</p></div>
                <div className="shrink-0 w-[100px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">預計交期</p></div>
                <div className="shrink-0 w-[100px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">原廠商交期</p></div>
                <div className="shrink-0 w-[150px]">
                  <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${(correctionType === '刪單' || isDeleteMode) ? 'text-[#1c252e]' : isReadOnly ? (hasDateChange ? 'text-[#ff5630]' : 'text-[#1c252e]') : 'text-[#005eb8]'}`}>新廠商交期</p>
                </div>
                <div className="shrink-0 w-[100px]"><p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] whitespace-nowrap">原交貨量</p></div>
                <div className="shrink-0 w-[150px]">
                  <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isReadOnly ? (hasQtyChange ? 'text-[#ff5630]' : 'text-[#1c252e]') : 'text-[#005eb8]'}`}>新交貨量</p>
                </div>
                <div className="shrink-0 size-[24px]" />
              </div>
              {/* 資料列 */}
              {form.deliveryRows.map((row, idx) => {
                const isDeleted = !!row.deleted;
                const isStrikethrough = isDeleted || isDeleteMode || correctionType === '刪單';
                return (
                  <div
                    key={row.id}
                    className={`flex items-center w-full gap-[20px] px-[45px] h-[52px] border-t border-[rgba(145,158,171,0.1)] first:border-t-0 relative transition-colors ${isStrikethrough ? 'bg-[rgba(255,86,48,0.04)]' : ''}`}
                  >
                    {isStrikethrough && <div className="absolute inset-x-[45px] top-1/2 h-[1.5px] bg-[#ff5630] pointer-events-none z-[1]" />}
                    <div className="flex items-center shrink-0 w-[50px]">
                      <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] w-full text-[14px] ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{idx + 1}</p>
                    </div>
                    <div className="flex items-center shrink-0 w-[100px]">
                      <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.expectedDelivery || '—'}</p>
                    </div>
                    <div className="flex items-center shrink-0 w-[100px]">
                      <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.vendorOriginalDate || '—'}</p>
                    </div>
                    <div className={`flex items-center shrink-0 w-[150px] ${isStrikethrough ? 'opacity-70 pointer-events-none' : (isReadOnly || isDeleteMode) ? 'pointer-events-none' : ''}`}>
                      {(correctionType === '刪單' || isDeleteMode) ? (
                        <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap text-[#454f5b]`}>{row.newVendorDate || '—'}</p>
                      ) : (
                        <DateCell value={row.newVendorDate} rowId={row.id} onSelect={(id, date) => updateRow(id, 'newVendorDate', date)} isChanged={!isDeleted && row.newVendorDate !== row.vendorOriginalDate} disabled={isReadOnly || isDeleteMode} minDate={todayStr} />
                      )}
                    </div>
                    <div className="flex items-center shrink-0 w-[100px]">
                      <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px] whitespace-nowrap ${isDeleted ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#454f5b]'}`}>{row.originalQty}</p>
                    </div>
                    <div className={`flex items-center shrink-0 w-[150px] ${isStrikethrough ? 'opacity-70 pointer-events-none' : (isReadOnly || isDeleteMode) ? 'pointer-events-none' : ''}`}>
                      <QtyField
                        value={row.newQty}
                        onChange={val => !isReadOnly && !isDeleteMode && updateRow(row.id, 'newQty', val)}
                        highlight={!isStrikethrough && !isDeleted && (parseFloat(row.newQty) || 0) === 0}
                        isChanged={!isStrikethrough && !isDeleted && row.newQty !== String(row.originalQty)}
                      />
                    </div>
                    <div className="flex items-center justify-center shrink-0 size-[24px] z-[2]">
                      {!isReadOnly && !isDeleteMode && idx !== 0 && !isDeleted && <TrashIcon onClick={() => toggleDeleteRow(row.id)} />}
                      {!isReadOnly && !isDeleteMode && idx !== 0 && isDeleted && (
                        <button onClick={() => toggleDeleteRow(row.id)} title="復原此項次" className="flex items-center justify-center shrink-0 size-[24px] hover:opacity-70 transition-opacity">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="#637381"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 刪單警示（刪單類型不顯示） */}
              {correctionType !== '刪單' && (isDeleteMode ? (
                <div className="px-[45px] py-[8px] border-t border-[rgba(145,158,171,0.1)] bg-[rgba(255,86,48,0.04)]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px]">
                    ⚠ 刪單：交貨排程已依驗收量＋在途量（{minRequiredQty}）自動調整，不開放人工修改
                  </p>
                </div>
              ) : isDeleteOrder ? (
                <div className="px-[45px] py-[8px] border-t border-[rgba(145,158,171,0.1)]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px]">
                    ⚠ 新交貨量總計為 0，提交後將執行刪單
                  </p>
                </div>
              ) : null)}

              {/* 最低需求提示列（驗收量＋在途量 > 0 時顯示） */}
              {correctionType !== '刪單' && minRequiredQty > 0 && (
                <div className={`px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] flex-wrap ${belowMinQty || hasZeroQtyRow ? 'bg-[rgba(255,86,48,0.04)]' : 'bg-[rgba(145,158,171,0.03)]'}`}>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#637381] leading-[18px] shrink-0">
                    新交貨量合計：
                    <strong className={belowMinQty ? 'text-[#ff5630]' : 'text-[#118d57]'}>{totalNewQty}</strong>
                    　｜　不得低於（驗收量 {order.acceptQty ?? 0} ＋ 在途量 {order.inTransitQty ?? 0}）= <strong>{minRequiredQty}</strong>
                  </p>
                  {belowMinQty && (
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                      ⚠ 新交貨量不足，暫存及提交已鎖定
                    </p>
                  )}
                  {hasZeroQtyRow && (
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                      ⚠ 新交貨量不可填 0，如需刪除請使用刪單功能
                    </p>
                  )}
                </div>
              )}

              {/* 新交貨量為0提示列（當 minRequiredQty 為 0 時獨立顯示） */}
              {correctionType !== '刪單' && hasZeroQtyRow && minRequiredQty === 0 && (
                <div className="px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] bg-[rgba(255,86,48,0.04)]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                    ⚠ 新交貨量不可填 0，如需刪除請使用刪單功能
                  </p>
                </div>
              )}

              {/* 超過訂貨量提示列 */}
              {correctionType !== '刪單' && aboveMaxQty && (
                <div className="px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] bg-[rgba(255,86,48,0.04)]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#637381] leading-[18px] shrink-0">
                    新交貨量合計：<strong className="text-[#ff5630]">{totalNewQty}</strong>
                    　｜　不得超過訂貨量 = <strong>{order.orderQty ?? 0}</strong>
                  </p>
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                    ⚠ 新交貨量超過訂貨量，暫存及提交已鎖定
                  </p>
                </div>
              )}

              {/* 過去日期提示列 */}
              {hasPastDate && correctionType !== '刪單' && !isDeleteMode && (
                <div className="px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] bg-[rgba(255,86,48,0.04)]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">
                    ⚠ 新廠商交期不可為過去日期，請重新選擇
                  </p>
                </div>
              )}

              {/* 無異動提示列（edit 模式下，無任何欄位變更時顯示） */}
              {correctionType !== '刪單' && noChangeBlock && (
                <div className="px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] bg-[rgba(255,171,0,0.06)]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#b76e00] leading-[18px] shrink-0">
                    ⚠ 尚無異動項目，請至少修改新料號、新廠商交貨日、新交貨量或刪除項次其中之一，方可開立修正單
                  </p>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* ── 底部按鈕（在灰色區內）────────────────────────────────────────── */}
        {/* 已提交廠商的單：顯示鎖定提示，不再顯示按鈕 */}
        {viewMode === 'edit' && isLocallySubmitted && (
          <div className="shrink-0 flex items-center gap-[8px] px-[27px] py-[17px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 1.5C9.5 1.5 7.5 3.5 7.5 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-1.5V6c0-2.5-2-4.5-4.5-4.5zm0 1.5c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="#00559c"/>
            </svg>
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#00559c] leading-[22px]">
              已提交廠商確認，本單不再開放修改
            </p>
          </div>
        )}

        {viewMode !== 'readonly' && !(viewMode === 'edit' && isLocallySubmitted) && (
          <div className="shrink-0 flex gap-[12px] items-center px-[27px] py-[17px]">
            {viewMode === 'vendorReview' ? (
              <>
                {/* 修正確認 */}
                <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] bg-[#118d57]">
                  <button onClick={() => { onApprove?.(); showToast('已修正確認'); }} className="flex items-center justify-center min-w-[inherit] size-full">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[14px] text-center text-white whitespace-nowrap px-[12px]">修正確認</p>
                  </button>
                </div>
                {/* 調整修正單（原：不同意） */}
                <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] bg-white">
                  <button onClick={() => { setDisagreeType('reject'); setDisagreeRejectReason(''); setDisagreeAdjustPeriod(''); setDisagreeAdjustReason(''); initDisagreeRows(); setShowDisagreeForm(true); }} className="flex items-center justify-center min-w-[inherit] size-full">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[#118d57] text-[14px] text-center whitespace-nowrap px-[12px]">調整修正單</p>
                  </button>
                </div>
              </>
            ) : viewMode === 'purchaserReview' ? (
              <>
                {/* 修正確認 */}
                <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] bg-[#118d57]">
                  <button onClick={() => { onApprove?.(); showToast('已修正確認'); }} className="flex items-center justify-center min-w-[inherit] size-full">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[14px] text-center text-white whitespace-nowrap px-[12px]">修正確認</p>
                  </button>
                </div>
                {/* 退回廠商 */}
                <div className="flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] bg-white">
                  <button onClick={() => { setReturnReason(''); setShowReturnForm(true); }} className="flex items-center justify-center min-w-[inherit] size-full">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[#118d57] text-[14px] text-center whitespace-nowrap px-[12px]">退回廠商</p>
                  </button>
                </div>
              </>
            ) : (
              /* 'edit' (DR) — 原有按鈕 */
              <>
                <div className={`flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] transition-opacity ${noChangeBlock || belowMinQty || aboveMaxQty || hasPastDate || hasZeroQtyRow ? 'bg-[#919eab] opacity-50' : 'bg-[#004680]'}`}>
                  <button onClick={handleSubmit} disabled={noChangeBlock || belowMinQty || aboveMaxQty || hasPastDate || hasZeroQtyRow} className="flex items-center justify-center min-w-[inherit] size-full disabled:cursor-not-allowed">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[14px] text-center text-white whitespace-nowrap px-[12px]">
                      {isDeleteOrder ? '提交廠商（執行刪單）' : '提交廠商'}
                    </p>
                  </button>
                </div>
                <div className={`flex-[1_0_0] h-[36px] min-h-px min-w-[64px] relative rounded-[8px] transition-opacity ${noChangeBlock || belowMinQty || aboveMaxQty || hasPastDate || hasZeroQtyRow ? 'opacity-50' : ''}`}>
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <button onClick={handleSave} disabled={noChangeBlock || belowMinQty || aboveMaxQty || hasPastDate || hasZeroQtyRow} className="flex items-center justify-center min-w-[inherit] size-full disabled:cursor-not-allowed">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] shrink-0 text-[#1c252e] text-[14px] text-center whitespace-nowrap px-[12px]">暫存</p>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        </>
        )}

      </div>

      {/* ── 刪單確認 Dialog ─────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(22,28,36,0.48)' }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(0,0,0,0.18)] w-[420px] max-w-[90vw] p-[28px] flex flex-col gap-[16px]" onClick={e => e.stopPropagation()}>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e] leading-[24px]">確認執行刪單？</p>
            <div className="flex gap-[10px] justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="h-[38px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#454f5b] hover:bg-[rgba(145,158,171,0.08)] transition-colors">取消</button>
              <button onClick={handleConfirmDelete} className="h-[38px] px-[20px] rounded-[8px] bg-[#ff5630] hover:bg-[#e04e28] transition-colors font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white">確認提交刪單</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
          <div className="bg-[#1c252e] text-white rounded-[8px] px-[18px] py-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.18)]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] whitespace-nowrap">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* ── 訂單歷程（共用 OrderHistory 元件）──────────────────────────────── */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          entries={orderHistory}
          correctionDocNo={correctionDocNo}
          docSeqNo={(order.orderNo || '') + (order.orderSeq || '')}
        />
      )}
    </div>
  );
}
