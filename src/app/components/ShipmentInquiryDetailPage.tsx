/**
 * ShipmentInquiryDetailPage
 * 出貨單查詢 — 明細頁（查詢唯讀版 + 編輯模式：刪除出貨序號）
 */

import { useState, useMemo } from 'react';
import type { ShipmentRow, ShipmentDetailItem } from './ShipmentListPage';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import { OrderHistory } from './OrderHistory';
import { DeleteButton } from './ActionButtons';
import type { HistoryEntry } from './OrderStoreContext';
import type { PrintTab } from './ShipmentPrintPage';

// ── TRANSPORT_OPTIONS ────────────────────────────────────────────────────────
const TRANSPORT_OPTIONS = [
  { value: 'T', label: 'T 陸運' },
  { value: 'S', label: 'S 海運' },
  { value: 'A', label: 'A 空運' },
  { value: 'E', label: 'E 快遞' },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  shipment: ShipmentRow;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onEditSave?: (updatedDetails: ShipmentDetailItem[]) => void;
  onPrint?: (tab: PrintTab) => void;
}



// ── 列印下拉按鈕 ──────────────────────────────────────────────────────────────
function PrintDropdown({ onSelect }: { onSelect: (tab: PrintTab) => void }) {
  const [open, setOpen] = useState(false);

  const options: { label: string; tab: PrintTab }[] = [
    { label: '中文出貨單',   tab: 'zh-shipment' },
    { label: '中文外箱貼紙', tab: 'zh-sticker'  },
    { label: '英文出貨單',   tab: 'en-shipment' },
    { label: '英文外箱貼紙', tab: 'en-sticker'  },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-[8px] h-[36px] min-w-[88px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap select-none"
      >
        列印
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[42px] right-0 z-50 bg-white rounded-[10px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] border border-[rgba(145,158,171,0.12)] py-[6px] min-w-[160px]">
          {options.map(o => (
            <div
              key={o.tab}
              onClick={() => { setOpen(false); onSelect(o.tab); }}
              className="px-[16px] py-[10px] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors whitespace-nowrap"
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 唯讀欄位（灰底 disabled 樣式）────────────────────────────────────────────
function ReadonlyField({ label, value, required }: { label: string; value: string; required?: boolean }) {
  return (
    <div className="relative h-[54px]" style={{ flex: '1 1 160px', minWidth: '140px', maxWidth: '240px' }}>
      <div className="absolute inset-0 rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-[rgba(145,158,171,0.04)] pointer-events-none" />
      <div className="absolute left-[14px] top-[-6px] flex items-center px-[2px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[6px]" />
        <span className="relative text-[12px] font-semibold font-['Public_Sans:SemiBold',sans-serif] leading-[12px] text-[#919eab]">
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </span>
      </div>
      <div className="absolute inset-0 flex items-center px-[14px] pt-[8px]">
        <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate w-full">
          {value || '—'}
        </span>
      </div>
    </div>
  );
}

// ── Table 欄位定義 ────────────────────────────────────────────────────────────
const TABLE_COLS = [
  { key: 'itemNo',            label: '出貨序號', width: 80,  align: 'left' },
  { key: 'orderNo',           label: '單號序號', width: 130, align: 'left' },
  { key: 'materialNo',        label: '料號',     width: 140, align: 'left' },
  { key: 'vendorMaterialNo',  label: '廠商料號', width: 120, align: 'left' },
  { key: 'orderPendingQty',   label: '訂單待交', width: 80,  align: 'right' },
  { key: 'shipQty',           label: '*出貨量',  width: 80,  align: 'right' },
  { key: 'qtyPerBox',         label: '每箱數量', width: 90,  align: 'right' },
  { key: 'totalBoxes',        label: '*總箱數',  width: 80,  align: 'center' },
  { key: 'netWeight',         label: '淨重', width: 90,  align: 'right' },
  { key: 'grossWeight',       label: '毛重', width: 90,  align: 'right' },
  { key: 'weightUnit',        label: '重量單位', width: 100, align: 'center' },
  { key: 'countryOfOrigin',   label: '原產國家', width: 110, align: 'center' },
  { key: 'receivedQty',       label: '累計收料量', width: 100, align: 'right' },
];

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function ShipmentInquiryDetailPage({ shipment, onClose, onDelete, onEdit, onEditSave, onPrint }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredBoxIdx, setHoveredBoxIdx] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [boxDetailIdx, setBoxDetailIdx] = useState<number | null>(null);
  const boxDetailRow = boxDetailIdx !== null ? shipment.details[boxDetailIdx] : null;

  // ── 編輯模式狀態 ────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<number>>(new Set());
  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  // 編輯用歷程（額外的歷程記錄，儲存時會追加）
  const [editHistoryEntries, setEditHistoryEntries] = useState<HistoryEntry[]>([]);

  // 判斷是否有任一項次已有累計收料量
  const hasReceived = useMemo(() => shipment.details.some(d => (d.receivedQty ?? 0) > 0), [shipment]);

  // ── 編輯模式操作 ────────────────────────────────────────────────────────
  const handleStartEdit = () => {
    setMarkedForDeletion(new Set());
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setMarkedForDeletion(new Set());
    setIsEditing(false);
  };

  const handleToggleDelete = (itemNo: number) => {
    setMarkedForDeletion(prev => {
      const next = new Set(prev);
      if (next.has(itemNo)) { next.delete(itemNo); } else { next.add(itemNo); }
      return next;
    });
  };

  const handleSaveEdit = () => {
    if (markedForDeletion.size === 0) {
      // 沒有標記任何項次，直接退出編輯
      setIsEditing(false);
      return;
    }
    // 卡控：不能刪光所有項次
    const remaining = shipment.details.filter(d => !markedForDeletion.has(d.itemNo));
    if (remaining.length === 0) {
      showToast('至少須保留一個出貨序號');
      return;
    }
    // 組歷程記錄
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const deletedItems = shipment.details.filter(d => markedForDeletion.has(d.itemNo)).sort((a, b) => a.itemNo - b.itemNo);
    const remarkLines = deletedItems.map(d => `項次${d.itemNo} ${d.orderNo}${d.orderSeq} ${d.materialNo} 出貨量${d.shipQty}`).join('；');
    const newEntry: HistoryEntry = {
      date: dateStr,
      event: '刪除出貨序號',
      operator: '廠商-OOO',
      remark: remarkLines,
    };
    setEditHistoryEntries(prev => [...prev, newEntry]);

    // 呼叫上層 callback 同步資料
    if (onEditSave) {
      onEditSave(remaining);
    }

    setMarkedForDeletion(new Set());
    setIsEditing(false);
    showToast('已儲存變更');
  };

  // 組裝歷程記錄
  const historyEntries = useMemo<HistoryEntry[]>(() => {
    const entries: HistoryEntry[] = [];
    if (shipment.createdAt) {
      entries.push({
        date: shipment.createdAt,
        event: '出貨單開立',
        operator: '廠商-OOO',
        remark: '',
      });
    }
    // 加入編輯產生的歷程
    entries.push(...editHistoryEntries);
    // 由近到遠排序（最新事件在最上方）
    return [...entries].reverse();
  }, [shipment, editHistoryEntries]);

  const transportLabel = TRANSPORT_OPTIONS.find(o => o.value === shipment.transportType)?.label ?? shipment.transportType;

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 上半：白色區 — 標題 + 基本資訊 ─────────────────────────────────── */}
      <div className="shrink-0 px-[24px] pt-[16px] pb-[20px] border-b border-[rgba(145,158,171,0.12)]">

        {/* 標題列 */}
        <div className="flex items-center justify-between mb-[20px]">

          {/* 左側：← 返回 + 基本資訊 Tab + 出貨單號 + 開立時間 */}
          <div className="flex items-center gap-[10px] flex-wrap">
            <div onClick={onClose} className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity" aria-label="返回">
              <IconsSolidIcSolarMultipleForwardLeftBroken />
            </div>
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex flex-row items-center justify-center min-h-[inherit] size-full px-[4px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
                  基本資訊
                </p>
              </div>
            </div>

            {shipment.sapDeliveryNo ? (
              <div className="flex items-center gap-[12px]">
                <div className="flex items-center gap-[4px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">出貨單號:</span>
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{shipment.sapDeliveryNo}</span>
                </div>
                {shipment.createdAt ? (
                  <>
                    <div className="w-[1px] h-[14px] bg-[rgba(145,158,171,0.4)] shrink-0" />
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{shipment.createdAt}</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* 右側按鈕 */}
          <div className="flex items-center gap-[10px]">
            {isEditing ? (
              /* ── 編輯模式：儲存 + 取消 ── */
              <>
                <button
                  onClick={handleCancelEdit}
                  className="h-[36px] min-w-[88px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="h-[36px] min-w-[88px] px-[16px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  儲存
                </button>
              </>
            ) : (
              /* ── 正常唯讀模式：列印 + 編輯 + 整單刪除 + 歷程 ── */
              <>
                <PrintDropdown onSelect={(tab) => onPrint?.(tab)} />
                <button
                  onClick={handleStartEdit}
                  className="h-[36px] min-w-[88px] px-[16px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
                >
                  編輯
                </button>
                <button
                  onClick={() => {
                    if (hasReceived) return;
                    setShowDeleteConfirm(true);
                  }}
                  disabled={hasReceived}
                  title={hasReceived ? '出貨序號中有累計收料量，不可整單刪除' : undefined}
                  className={`h-[36px] min-w-[88px] px-[16px] rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap ${
                    hasReceived
                      ? 'bg-[#919eab] text-white cursor-not-allowed'
                      : 'bg-[#ff5630] hover:bg-[#b71d18] text-white'
                  }`}
                >
                  整單刪除
                </button>
                <button
                  onClick={() => setShowHistory(v => !v)}
                  className="font-['Roboto:Regular',sans-serif] font-normal text-[16px] min-w-[44px] text-center text-[#005eb8] underline [text-decoration-skip-ink:none] hover:opacity-70 cursor-pointer transition-opacity whitespace-nowrap"
                >
                  歷程
                </button>
              </>
            )}
          </div>
        </div>

        {/* 基本資訊欄位：灰底唯讀 */}
        <div className="flex gap-[16px] flex-wrap mb-[16px]">
          <ReadonlyField label="廠商出貨單" value={shipment.vendorShipmentNo} required />
          <ReadonlyField label="幣別" value={shipment.currency} />
          <ReadonlyField label="運輸型態" value={transportLabel} />
          <ReadonlyField label="交貨日期" value={shipment.deliveryDate} required />
          <ReadonlyField label="到貨日期" value={shipment.arrivalDate || ''} />
        </div>
        {/* 交貨地址（全寬） */}
        <div className="relative h-[54px]">
          <div className="absolute inset-0 rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-[rgba(145,158,171,0.04)] pointer-events-none" />
          <div className="absolute left-[14px] top-[-6px] flex items-center px-[2px] z-10">
            <div className="absolute bg-white h-[2px] left-0 right-0 top-[6px]" />
            <span className="relative text-[12px] font-semibold font-['Public_Sans:SemiBold',sans-serif] leading-[12px] text-[#919eab]">交貨地址</span>
          </div>
          <div className="absolute inset-0 flex items-center px-[14px] pt-[8px]">
            <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] truncate w-full">
              {shipment.deliveryAddress || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 下半：出貨明細表格 ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto bg-[rgba(145,158,171,0.04)]">
        <div className="px-[24px] pt-[16px] pb-[24px]">

          {/* 出貨明細標題列 */}
          <div className="flex items-center gap-[12px] mb-[8px]">
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex flex-row items-center justify-center min-h-[inherit] size-full px-[4px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
                  出貨明細
                </p>
              </div>
            </div>
          </div>

          {/* 表格容器 */}
          <div className="bg-white rounded-[12px] shadow-[0px_0px_2px_rgba(145,158,171,0.2),0px_4px_8px_rgba(145,158,171,0.08)] overflow-hidden">
            <div className="overflow-x-auto">

              {/* 表頭 */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.12)] bg-[rgba(145,158,171,0.04)]">
                {TABLE_COLS.map(col => (
                  <div key={col.key} style={{ width: col.width, minWidth: col.width }} className={`${col.key === 'itemNo' ? 'pl-[16px] pr-[8px]' : 'px-[8px]'} shrink-0 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381] leading-[20px]">
                      {col.label}
                    </span>
                  </div>
                ))}
                {/* 編輯模式額外操作欄 */}
                {isEditing && (
                  <div style={{ width: 60, minWidth: 60 }} className="px-[4px] shrink-0 text-center">
                    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381] leading-[20px]">操作</span>
                  </div>
                )}
              </div>

              {/* 資料列 */}
              {shipment.details.length === 0 && (
                <div className="flex items-center justify-center h-[80px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">目前沒有出貨明細</p>
                </div>
              )}

              {shipment.details.map((row, idx) => {
                const isMarked = markedForDeletion.has(row.itemNo);
                const canDelete = (row.receivedQty ?? 0) === 0;
                // 文字顏色：標記刪除時統一變灰
                const txtClr = isMarked ? 'text-[rgba(145,158,171,0.5)]' : '';
                const txtClrDark = isMarked ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#1c252e]';
                const txtClrLight = isMarked ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#637381]';
                return (
                <div
                  key={row.itemNo}
                  className={`flex items-center py-[12px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors relative ${idx % 2 === 1 && !isMarked ? 'bg-[rgba(145,158,171,0.02)]' : ''} ${isMarked ? 'bg-[rgba(255,86,48,0.04)]' : ''}`}
                >
                  {/* 軟刪除紅線覆蓋層（同修正單樣式） */}
                  {isMarked && (
                    <div className="absolute inset-x-[8px] top-1/2 h-[1.5px] bg-[#ff5630] pointer-events-none z-[1]" />
                  )}
                  <div style={{ width: 80, minWidth: 80 }} className="pl-[16px] pr-[8px] text-left shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrLight}`}>{row.itemNo}</span>
                  </div>
                  <div style={{ width: 130, minWidth: 130 }} className="px-[8px] text-left shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrLight}`}>{row.orderNo}{row.orderSeq}</span>
                  </div>
                  <div style={{ width: 140, minWidth: 140 }} className="px-[8px] text-left shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrLight} truncate block`}>{row.materialNo}</span>
                  </div>
                  <div style={{ width: 120, minWidth: 120 }} className="px-[8px] text-left shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrLight} truncate block`}>{row.vendorMaterialNo || 'TEMPPRICE'}</span>
                  </div>
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrLight}`}>{row.orderPendingQty}</span>
                  </div>
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] font-medium ${txtClrDark}`}>{row.shipQty}</span>
                  </div>
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrDark}`}>{row.qtyPerBox}</span>
                  </div>
                  <div style={{ width: 80, minWidth: 80 }} className={`px-[8px] text-center shrink-0 ${isMarked ? 'pointer-events-none' : ''}`}>
                    {row.totalBoxes > 0 ? (
                      <div
                        className="relative inline-block"
                        onMouseEnter={() => setHoveredBoxIdx(idx)}
                        onMouseLeave={() => setHoveredBoxIdx(null)}
                      >
                        <button
                          onClick={() => setBoxDetailIdx(idx)}
                          className={`font-['Public_Sans:SemiBold',sans-serif] text-[17px] underline cursor-pointer hover:opacity-70 transition-opacity min-w-[40px] inline-block py-[4px] ${isMarked ? 'text-[rgba(145,158,171,0.5)]' : 'text-[#005eb8]'}`}
                        >{row.totalBoxes}</button>
                        {hoveredBoxIdx === idx && (row.boxes ?? []).length > 0 && (
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[6px] z-[200] pointer-events-none"
                            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                          >
                            <div className="bg-[#1c252e] text-white rounded-[8px] px-[10px] py-[6px] whitespace-nowrap font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px]">
                              {(row.boxes ?? []).map(b => b.qty).join(' / ')}
                            </div>
                            {/* 小三角 */}
                            <div className="flex justify-center">
                              <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1c252e' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-['Public_Sans:Regular',sans-serif] text-[17px] text-[#c4cdd6]">—</span>
                    )}
                  </div>
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrDark}`}>{row.netWeight || '0'}</span>
                  </div>
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrDark}`}>{row.grossWeight || '0'}</span>
                  </div>
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] text-center shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrDark}`}>{row.weightUnit}</span>
                  </div>
                  <div style={{ width: 110, minWidth: 110 }} className="px-[8px] text-center shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${txtClrDark}`}>{row.countryOfOrigin}</span>
                  </div>
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] text-right shrink-0">
                    <span className={`font-['Public_Sans:Regular',sans-serif] text-[13px] ${
                      isMarked ? 'text-[rgba(145,158,171,0.5)]' : (row.receivedQty ?? 0) > 0 ? 'text-[#118d57] font-medium' : 'text-[#c4cdd6]'
                    }`}>
                      {row.receivedQty ?? 0}
                    </span>
                  </div>
                  {/* 編輯模式操作欄 */}
                  {isEditing && (
                    <div style={{ width: 60, minWidth: 60 }} className="px-[4px] flex justify-center shrink-0">
                      {canDelete ? (
                        isMarked ? (
                          /* 已標記 → 顯示「復原」icon */
                          <button
                            onClick={() => handleToggleDelete(row.itemNo)}
                            className="flex items-center justify-center shrink-0 w-[36px] h-[36px] rounded-full hover:bg-[rgba(24,144,255,0.08)] transition-colors"
                            title="取消刪除"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1890FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1 4 1 10 7 10"/>
                              <path d="M3.51 15a9 9 0 1 0 .49-3.08"/>
                            </svg>
                          </button>
                        ) : (
                          /* 未標記 → 顯示刪除 icon */
                          <DeleteButton onClick={() => handleToggleDelete(row.itemNo)} title="刪除此項次" />
                        )
                      ) : (
                        /* 有收料量 → 灰色鎖頭 */
                        <div
                          className="flex items-center justify-center w-[36px] h-[36px] cursor-not-allowed"
                          title="有收料量，無法刪除"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4cdd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 整單刪除確認 Modal ───────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div className="bg-white rounded-[16px] shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.24)] p-[32px] w-[420px] max-w-[90vw]">
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[rgba(255,86,48,0.12)] shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
                確認整單刪除？
              </p>
            </div>
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] mb-[24px] leading-[22px]">
              即將刪除出貨單 <strong className="text-[#1c252e]">{shipment.vendorShipmentNo}</strong>，此操作無法復原，確定繼續？
            </p>
            <div className="flex items-center justify-end gap-[10px]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] bg-white text-[#1c252e] hover:bg-[#f4f6f8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); if (onDelete) onDelete(); }}
                className="h-[36px] px-[20px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 歷程面板 ──────────────────────────────────────────────────────── */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          entries={historyEntries}
          titleLabel="出貨歷程"
          correctionDocNo={shipment.vendorShipmentNo}
          correctionDocNoLabel="廠商出貨單"
          docSeqNo={shipment.sapDeliveryNo || undefined}
          docSeqNoLabel="出貨單號"
        />
      )}

      {/* ── 貼標項次明細彈窗（唯讀）───────────────────────────────────────────── */}
      {boxDetailRow && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setBoxDetailIdx(null); }}
        >
          <div
            className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.20)] flex flex-col overflow-hidden"
            style={{ width: 480, maxHeight: '90vh' }}
          >
            {/* 標題 + 資訊欄 */}
            <div className="px-[24px] pt-[20px] pb-[16px]">
              <h3 className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] mb-[16px]">貼標項次明細</h3>
              <div className="grid grid-cols-2 gap-x-[24px] gap-y-[8px]">
                {[
                  { label: '出貨序號', value: boxDetailRow.itemNo },
                  { label: '單號序號', value: `${boxDetailRow.orderNo}${boxDetailRow.orderSeq}` },
                  { label: '料號', value: boxDetailRow.materialNo },
                  { label: '出貨量', value: boxDetailRow.shipQty },
                  { label: '每箱數量', value: boxDetailRow.qtyPerBox || '—' },
                  { label: '總箱數', value: boxDetailRow.totalBoxes },
                ].map(item => (
                  <div key={item.label} className="flex gap-[6px] items-baseline">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[16px] text-[#637381] whitespace-nowrap">{item.label}</span>
                    <span className="font-['Public_Sans:SemiBold',sans-serif] text-[16px] text-[#1c252e]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 貼標項次列表 */}
            <div className="border-t border-[rgba(145,158,171,0.16)] flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center px-[24px] py-[10px] bg-[rgba(145,158,171,0.04)]">
                <span style={{ width: 80 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381] whitespace-nowrap">貼標項次</span>
                <span style={{ flex: 1 }} className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#637381]">數量</span>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar px-[24px]">
                {(boxDetailRow.boxes ?? []).map(box => (
                  <div key={box.boxNo} className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.08)] last:border-0">
                    <span style={{ width: 80 }} className="font-['Public_Sans:Regular',sans-serif] text-[19px] text-[#1c252e]">{box.boxNo}</span>
                    <span style={{ flex: 1 }} className="font-['Public_Sans:Regular',sans-serif] text-[18px] text-[#1c252e]">{box.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 關閉按鈕 */}
            <div className="px-[24px] py-[16px]">
              <button
                onClick={() => setBoxDetailIdx(null)}
                className="w-full h-[40px] bg-[#1c252e] hover:bg-[#374151] text-white rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] text-[14px] transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
