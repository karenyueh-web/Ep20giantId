/**
 * ShipmentInquiryDetailPage — 出貨單查詢 • 明細（唯讀模式）
 *
 * 由 ShipmentListPage 點擊廠商出貨單號連結後開啟
 * - 上方基本資訊：全部唯讀
 * - 右上操作：列印(下拉)、編輯(保留)、整單刪除(確認)、歷程(記錄)
 * - 下方出貨明細：廠商出貨單號TAG + SAP送貨單號小字 + 唯讀表格
 * - 總箱數可點，但開啟的是唯讀箱數明細Modal
 */

import { useState, useRef, useEffect } from 'react';
import type { ShipmentRow, ShipmentDetailItem } from './ShipmentListPage';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';

// ── 擴充型別（明細用完整資料） ─────────────────────────────────────────────────

/** ShipmentDetailItem 即完整明細列，直接引用 */
export type ShipmentDetailItemRO = ShipmentDetailItem;

/** 出貨單（完整版，加入 detailsFull 供明細頁使用） */
export interface ShipmentRowFull extends ShipmentRow {
  detailsFull: ShipmentDetailItemRO[];
}

export interface ShipmentInquiryDetailPageProps {
  shipment: ShipmentRowFull;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

// ── 歷程記錄型別 ────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: number;
  timestamp: string;
  action: string;
  operator: string;
  detail?: string;
}

// ── 讀取欄位元件（唯讀，仿 FloatingInput 邊框樣式） ────────────────────────

function ReadonlyField({ label, value, required, wide }: {
  label: string;
  value: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={`relative ${wide ? 'flex-1' : ''}`} style={{ minWidth: wide ? 160 : undefined }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.16)] bg-[#f4f6f8]" />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-[#f4f6f8] h-[2px] left-0 right-0 top-[5px]" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>
          {required && <span style={{ color: '#ff5630', marginRight: '2px' }}>*</span>}
          {label}
        </p>
      </div>
      <div className="h-[54px] flex items-center px-[14px] pt-[6px]">
        <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] truncate ${value ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function ReadonlyTextarea({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative w-full">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.16)] bg-[#f4f6f8]" />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-[#f4f6f8] h-[2px] left-0 right-0 top-[5px]" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
      </div>
      <div className="min-h-[54px] flex items-center px-[14px] pt-[20px] pb-[10px]">
        <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] w-full leading-[22px] ${value ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

// ── 運輸型態 Map ─────────────────────────────────────────────────────────────

const TRANSPORT_MAP: Record<string, string> = { S: 'S 海運', A: 'A 空運', T: 'T 陸運' };

// ── 箱數明細唯讀 Modal ────────────────────────────────────────────────────────

function BoxDetailReadonlyModal({
  detailRow,
  onClose,
}: {
  detailRow: ShipmentDetailItemRO;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[350] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ width: 480, maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)]">
          <div>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">
              箱數明細
            </p>
            <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] mt-[2px]">
              項次 {detailRow.itemNo} · {detailRow.materialNo} · 出貨量 {detailRow.shipQty}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[24px] py-[16px]">
          <div className="border border-[rgba(145,158,171,0.16)] rounded-[10px] overflow-hidden">
            {/* Header */}
            <div className="flex bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)]">
              <div className="flex-1 px-[16px] py-[10px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">箱號</p>
              </div>
              <div className="w-[140px] px-[16px] py-[10px] text-right">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">數量</p>
              </div>
            </div>
            {/* Rows */}
            {detailRow.boxes.length === 0 ? (
              <div className="flex items-center justify-center h-[80px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">無箱數明細</p>
              </div>
            ) : (
              detailRow.boxes.map((box, idx) => (
                <div
                  key={box.boxNo}
                  className={`flex items-center border-b border-[rgba(145,158,171,0.08)] last:border-b-0 ${idx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                >
                  <div className="flex-1 px-[16px] py-[12px]">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                      箱 {box.boxNo}
                    </span>
                  </div>
                  <div className="w-[140px] px-[16px] py-[12px] text-right">
                    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
                      {box.qty}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* 合計 */}
          <div className="mt-[12px] flex justify-between items-center px-[4px]">
            <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">共 {detailRow.boxes.length} 箱</span>
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#1c252e]">
              合計：{detailRow.boxes.reduce((s, b) => s + b.qty, 0)} 件
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-[24px] py-[14px] border-t border-[rgba(145,158,171,0.12)]">
          <button
            onClick={onClose}
            className="h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 整單刪除確認 Modal ────────────────────────────────────────────────────────

function DeleteShipmentModal({
  vendorShipmentNo,
  onConfirm,
  onCancel,
}: {
  vendorShipmentNo: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[350] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ width: 440 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-[24px] pt-[24px] pb-[20px]">
          <div className="flex items-center gap-[14px] mb-[16px]">
            <div className="w-[48px] h-[48px] rounded-full bg-[rgba(255,86,48,0.1)] flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[17px] text-[#1c252e]">確認整單刪除</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] mt-[2px]">此操作確認後無法復原</p>
            </div>
          </div>
          <div className="bg-[rgba(255,86,48,0.05)] border border-[rgba(255,86,48,0.2)] rounded-[10px] px-[16px] py-[12px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] leading-[22px]">
              即將刪除出貨單
              <span className="font-semibold text-[#1c252e] mx-[4px]">「{vendorShipmentNo}」</span>
              及其全部出貨明細，確定要繼續嗎？
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)]">
          <button
            onClick={onCancel}
            className="h-[38px] px-[18px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="h-[38px] px-[18px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors"
          >
            確認整單刪除
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 列印下拉 ──────────────────────────────────────────────────────────────────

const PRINT_OPTIONS = [
  { value: 'zh-shipment',  label: '中文出貨單', icon: '📄' },
  { value: 'zh-box-label', label: '中文外箱貼紙', icon: '🏷️' },
  { value: 'en-shipment',  label: '英文出貨單', icon: '📄' },
  { value: 'en-box-label', label: '英文外箱貼紙', icon: '🏷️' },
];

function PrintDropdown({ onPrint }: { onPrint: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-[8px] h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        列印
      </button>
      {open && (
        <div className="absolute right-0 top-[44px] bg-white border border-[rgba(145,158,171,0.2)] rounded-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] z-[200] overflow-hidden min-w-[180px]">
          {PRINT_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              onClick={() => { onPrint(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-[10px] px-[16px] py-[10px] text-left hover:bg-[rgba(145,158,171,0.06)] transition-colors ${idx > 0 && idx % 2 === 0 ? 'border-t border-[rgba(145,158,171,0.1)]' : ''}`}
            >
              <span className="text-[16px]">{opt.icon}</span>
              <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 歷程側滑 Panel ────────────────────────────────────────────────────────────

const MOCK_HISTORY: HistoryEntry[] = [
  { id: 1, timestamp: '2025/06/15 09:22', action: '出貨單建立', operator: 'vendor@giant.com', detail: '由廠商開立出貨單' },
  { id: 2, timestamp: '2025/06/16 14:05', action: '上傳修改', operator: 'vendor@giant.com', detail: '項次10 出貨量：100 → 50；每箱數量：20 → 25' },
  { id: 3, timestamp: '2025/06/17 10:31', action: '重拋 SAP', operator: 'system', detail: 'SAP 送貨單號回傳：1720580792' },
  { id: 4, timestamp: '2025/06/18 08:44', action: '採購確認', operator: 'buyer@giant.com', detail: '採購確認出貨資料無誤' },
];

function HistoryPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[200]" onClick={onClose} />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full bg-white z-[201] flex flex-col shadow-[-8px_0px_32px_rgba(0,0,0,0.12)]"
        style={{ width: 380 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)]">
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">修訂歷程</p>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-[24px] py-[20px]">
          <div className="relative">
            {/* 垂直時間軸線 */}
            <div className="absolute left-[15px] top-[8px] bottom-[8px] w-[2px] bg-[rgba(145,158,171,0.16)]" />

            {MOCK_HISTORY.map((entry, idx) => (
              <div key={entry.id} className="flex gap-[16px] mb-[24px] last:mb-0 relative">
                {/* 圓點 */}
                <div className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center shrink-0 z-[1] ${idx === 0 ? 'bg-[#005eb8] border-[#005eb8]' : 'bg-white border-[rgba(145,158,171,0.3)]'}`}>
                  {idx === 0 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className="w-[8px] h-[8px] rounded-full bg-[rgba(145,158,171,0.4)]" />
                  )}
                </div>

                {/* 內容 */}
                <div className="flex-1 pt-[2px]">
                  <div className="flex items-center justify-between mb-[4px]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
                      {entry.action}
                    </p>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">
                      {entry.timestamp}
                    </p>
                  </div>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">
                    {entry.operator}
                  </p>
                  {entry.detail && (
                    <div className="mt-[6px] bg-[#f4f6f8] rounded-[6px] px-[10px] py-[8px]">
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381] leading-[18px]">
                        {entry.detail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[400] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{message}</p>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────

export function ShipmentInquiryDetailPage({
  shipment,
  onClose,
  onDeleted,
}: ShipmentInquiryDetailPageProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [boxModalRow, setBoxModalRow] = useState<ShipmentDetailItemRO | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = (type: string) => {
    const label = PRINT_OPTIONS.find(o => o.value === type)?.label ?? type;
    showToast(`正在列印：${label}`);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDeleted(shipment.id);
  };

  const details = shipment.detailsFull;

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 上半：基本資訊區 ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-[24px] pt-[16px] pb-[20px] border-b border-[rgba(145,158,171,0.12)]">

        {/* 標題列 */}
        <div className="flex items-center justify-between mb-[20px]">
          {/* 左側：← + 基本資訊 Tab */}
          <div className="flex items-center gap-[10px]">
            <div onClick={onClose} className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity" aria-label="返回">
              <IconsSolidIcSolarMultipleForwardLeftBroken />
            </div>
            <div className="h-[48px] min-h-[48px] relative shrink-0">
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              <div className="flex flex-row items-center justify-center min-h-[inherit] size-full">
                <div className="flex gap-[8px] h-full items-center justify-center px-[4px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] whitespace-nowrap">
                    基本資訊
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：操作按鈕 */}
          <div className="flex items-center gap-[10px]">
            {/* 列印 */}
            <PrintDropdown onPrint={handlePrint} />
            {/* 編輯（保留，後續開發） */}
            <button
              disabled
              className="h-[36px] px-[16px] rounded-[8px] bg-[#005eb8] opacity-40 cursor-not-allowed text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] whitespace-nowrap"
              title="編輯功能開發中"
            >
              編輯
            </button>
            {/* 整單刪除 */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="h-[36px] px-[16px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
            >
              整單刪除
            </button>
            {/* 歷程 */}
            <button
              onClick={() => setShowHistory(v => !v)}
              className="font-['Roboto:Regular',sans-serif] font-normal text-[16px] text-[#005eb8] underline [text-decoration-skip-ink:none] hover:opacity-70 cursor-pointer transition-opacity whitespace-nowrap"
            >
              歷程
            </button>
          </div>
        </div>

        {/* 欄位 Row 1：廠商出貨單號 | 幣別 | 運輸型態 | 發票日期 | 交貨日期 | 到貨日期 */}
        <div className="flex gap-[16px] flex-wrap mb-[16px]">
          <div style={{ flex: '1 1 160px', maxWidth: '200px' }}>
            <ReadonlyField label="廠商出貨單號" value={shipment.vendorShipmentNo} required />
          </div>
          <div style={{ flex: '1 1 200px', maxWidth: '240px' }}>
            <ReadonlyField label="廠商" value={shipment.vendorName} />
          </div>
          <div style={{ flex: '1 1 80px', maxWidth: '120px' }}>
            <ReadonlyField label="幣別" value={shipment.currency} />
          </div>
          <div style={{ flex: '1 1 120px', maxWidth: '160px' }}>
            <ReadonlyField label="運輸型態" value={TRANSPORT_MAP[shipment.transportType] ?? shipment.transportType} />
          </div>
          <div style={{ flex: '1 1 140px', maxWidth: '170px' }}>
            <ReadonlyField label="發票日期" value={shipment.invoiceDate} />
          </div>
        </div>

        {/* 欄位 Row 2：交貨日期 | 到貨日期 | 交貨地址（全寬） */}
        <div className="flex gap-[16px] flex-wrap">
          <div style={{ flex: '1 1 140px', maxWidth: '170px' }}>
            <ReadonlyField label="交貨日期" value={shipment.deliveryDate} required />
          </div>
          <div style={{ flex: '1 1 140px', maxWidth: '170px' }}>
            <ReadonlyField label="到貨日期" value={shipment.arrivalDate} />
          </div>
          <div style={{ flex: '2 1 240px' }}>
            <ReadonlyTextarea label="交貨地址" value={shipment.deliveryAddress} />
          </div>
        </div>
      </div>

      {/* ── 下半：出貨明細區 ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[24px] py-[20px]">

        {/* Tab 列：廠商出貨單號 TAG + 出貨明細 Tab + SAP送貨單號 */}
        <div className="flex items-center gap-[16px] mb-[12px] flex-wrap">
          {/* 廠商出貨單號 Tag */}
          <div className="flex flex-col items-center bg-[#005eb8] text-white rounded-[8px] px-[12px] py-[6px] shrink-0 min-w-[100px]">
            <span className="font-['Public_Sans:Regular',sans-serif] text-[10px] text-[rgba(255,255,255,0.72)] leading-[14px]">廠商出貨單號</span>
            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[20px] whitespace-nowrap">
              {shipment.vendorShipmentNo}
            </span>
          </div>

          {/* 出貨明細 Tab */}
          <div className="relative h-[40px] flex items-center px-[4px]">
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[15px] text-[#1c252e]">出貨明細</p>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1c252e] rounded-full" />
          </div>

          {/* SAP送貨單號 */}
          {shipment.sapDeliveryNo && (
            <div className="flex items-center gap-[6px]">
              <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">SAP送貨單號:</span>
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">
                {shipment.sapDeliveryNo}
              </span>
            </div>
          )}
        </div>

        {/* 白底 table 卡片 */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_4px_8px_-2px_rgba(145,158,171,0.12)]">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div style={{ minWidth: '1100px' }}>

              {/* Table header */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.16)] bg-[rgba(145,158,171,0.04)]">
                {[
                  { label: '出貨項次', w: 80,  align: 'center' },
                  { label: '訂單號碼', w: 130, align: 'left'   },
                  { label: '料號',     w: 150, align: 'left'   },
                  { label: '訂單待交', w: 80,  align: 'right'  },
                  { label: '出貨量',   w: 80,  align: 'right'  },
                  { label: '每箱數量', w: 90,  align: 'right'  },
                  { label: '*總箱數',  w: 80,  align: 'center', blue: true },
                  { label: '淨重(個)', w: 90,  align: 'right'  },
                  { label: '毛重(個)', w: 90,  align: 'right'  },
                  { label: '重量單位', w: 90,  align: 'center' },
                  { label: '原產國家', w: 90,  align: 'center' },
                ].map((col, i) => (
                  <div
                    key={i}
                    style={{ width: col.w, minWidth: col.w, flex: `0 0 ${col.w}px` }}
                    className={`px-[10px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] leading-[20px] ${
                      (col as any).blue ? 'text-[#005eb8] text-center' :
                      col.align === 'right' ? 'text-right text-[#637381]' :
                      col.align === 'center' ? 'text-center text-[#637381]' :
                      'text-[#637381]'
                    }`}
                  >
                    {col.label}
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {details.length === 0 && (
                <div className="flex items-center justify-center h-[80px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">無出貨明細</p>
                </div>
              )}

              {details.map((row, idx) => (
                <div
                  key={row.itemNo}
                  className={`flex items-center py-[13px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.03)] transition-colors ${idx % 2 === 1 ? 'bg-[rgba(145,158,171,0.015)]' : ''}`}
                >
                  {/* 出貨項次 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[10px] shrink-0 text-center">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.itemNo}</span>
                  </div>
                  {/* 訂單號碼（orderNo + orderSeq） */}
                  <div style={{ width: 130, minWidth: 130 }} className="px-[10px] shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">
                      {row.orderNo}-{row.orderSeq}
                    </span>
                  </div>
                  {/* 料號 */}
                  <div style={{ width: 150, minWidth: 150 }} className="px-[10px] shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381] truncate block" title={row.materialNo}>
                      {row.materialNo}
                    </span>
                  </div>
                  {/* 訂單待交（唯讀） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[10px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.orderPendingQty}</span>
                  </div>
                  {/* 出貨量 */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[10px] text-right shrink-0">
                    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">{row.shipQty}</span>
                  </div>
                  {/* 每箱數量 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[10px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.qtyPerBox || '—'}</span>
                  </div>
                  {/* 總箱數（藍色連結，點擊開啟唯讀箱數明細） */}
                  <div style={{ width: 80, minWidth: 80 }} className="px-[10px] text-center shrink-0">
                    {row.totalBoxes > 0 ? (
                      <button
                        onClick={() => setBoxModalRow(row)}
                        className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors"
                      >
                        {row.totalBoxes}
                      </button>
                    ) : (
                      <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#919eab]">—</span>
                    )}
                  </div>
                  {/* 淨重(個) */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[10px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.netWeight || '0'}</span>
                  </div>
                  {/* 毛重(個) */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[10px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.grossWeight || '0'}</span>
                  </div>
                  {/* 重量單位 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[10px] text-center shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#919eab]">{row.weightUnit || '—'}</span>
                  </div>
                  {/* 原產國家 */}
                  <div style={{ width: 90, minWidth: 90 }} className="px-[10px] text-center shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#919eab]">{row.countryOfOrigin || '—'}</span>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* 統計行 */}
          <div className="flex items-center justify-between px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.08)] bg-[rgba(145,158,171,0.02)]">
            <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">
              共 {details.length} 個出貨項次
            </span>
            <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">
              出貨總量：{details.reduce((s, d) => s + d.shipQty, 0)} 件 ·
              總箱數：{details.reduce((s, d) => s + d.totalBoxes, 0)} 箱
            </span>
          </div>
        </div>
      </div>

      {/* ── 整單刪除 Modal ── */}
      {showDeleteModal && (
        <DeleteShipmentModal
          vendorShipmentNo={shipment.vendorShipmentNo}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* ── 箱數明細唯讀 Modal ── */}
      {boxModalRow && (
        <BoxDetailReadonlyModal
          detailRow={boxModalRow}
          onClose={() => setBoxModalRow(null)}
        />
      )}

      {/* ── 歷程側滑 Panel ── */}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}

      {/* ── Toast ── */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
