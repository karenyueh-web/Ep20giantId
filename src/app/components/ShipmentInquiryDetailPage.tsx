/**
 * ShipmentInquiryDetailPage
 * 出貨單查詢 — 明細頁（查詢唯讀版）
 */

import { useState } from 'react';
import type { ShipmentRow } from './ShipmentListPage';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';

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
}



// ── 列印下拉按鈕 ──────────────────────────────────────────────────────────────
function PrintDropdown() {
  const [open, setOpen] = useState(false);

  const options = [
    { label: '列印中文出貨單' },
    { label: '列印英文出貨單' },
    { label: '列印中文外箱貼紙' },
    { label: '列印英文外箱貼紙' },
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
              key={o.label}
              onClick={() => { setOpen(false); }}
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
  { key: 'itemNo',         label: '出貨項次', width: 72,  align: 'left' },
  { key: 'orderNo',        label: '單號序號', width: 130, align: 'left' },
  { key: 'materialNo',     label: '料號',     width: 140, align: 'left' },
  { key: 'orderPendingQty',label: '訂單待交', width: 80,  align: 'right' },
  { key: 'shipQty',        label: '*出貨量',  width: 80,  align: 'right' },
  { key: 'qtyPerBox',      label: '每箱數量', width: 90,  align: 'right' },
  { key: 'totalBoxes',     label: '*總箱數',  width: 80,  align: 'center' },
  { key: 'netWeight',      label: '淨重(個)', width: 90,  align: 'right' },
  { key: 'grossWeight',    label: '毛重(個)', width: 90,  align: 'right' },
  { key: 'weightUnit',     label: '重量單位', width: 100, align: 'center' },
  { key: 'countryOfOrigin',label: '原產國家', width: 110, align: 'center' },
];

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function ShipmentInquiryDetailPage({ shipment, onClose, onDelete, onEdit }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const transportLabel = TRANSPORT_OPTIONS.find(o => o.value === shipment.transportType)?.label ?? shipment.transportType;

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 上半：白色區 — 標題 + 基本資訊 ─────────────────────────────────── */}
      <div className="shrink-0 px-[24px] pt-[16px] pb-[20px] border-b border-[rgba(145,158,171,0.12)]">

        {/* 標題列 */}
        <div className="flex items-center justify-between mb-[20px]">

          {/* 左側：← 返回 + 基本資訊 Tab + SAP送貨單號 + 開立時間 */}
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
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">SAP送貨單號:</span>
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
            <PrintDropdown />
            <button
              onClick={onEdit}
              className="h-[36px] min-w-[88px] px-[16px] rounded-[8px] bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
            >
              編輯
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="h-[36px] min-w-[88px] px-[16px] rounded-[8px] bg-[#ff5630] hover:bg-[#b71d18] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
            >
              整單刪除
            </button>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="font-['Roboto:Regular',sans-serif] font-normal text-[16px] min-w-[44px] text-center text-[#005eb8] underline [text-decoration-skip-ink:none] hover:opacity-70 cursor-pointer transition-opacity whitespace-nowrap"
            >
              歷程
            </button>
          </div>
        </div>

        {/* 基本資訊欄位：灰底唯讀 */}
        <div className="flex gap-[16px] flex-wrap mb-[16px]">
          <ReadonlyField label="廠商出貨單號" value={shipment.vendorShipmentNo} required />
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
            <div className="relative inline-flex items-end">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
                出貨明細
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1c252e]" />
            </div>
            {shipment.sapDeliveryNo ? (
              <div className="flex items-center gap-[4px]">
                <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">SAP送貨單號:</span>
                <span className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{shipment.sapDeliveryNo}</span>
              </div>
            ) : null}
          </div>

          {/* 表格容器 */}
          <div className="bg-white rounded-[12px] shadow-[0px_0px_2px_rgba(145,158,171,0.2),0px_4px_8px_rgba(145,158,171,0.08)] overflow-hidden">
            <div className="overflow-x-auto">

              {/* 表頭 */}
              <div className="flex items-center py-[10px] border-b border-[rgba(145,158,171,0.12)] bg-[rgba(145,158,171,0.04)]">
                {TABLE_COLS.map(col => (
                  <div key={col.key} style={{ width: col.width, minWidth: col.width }} className={`px-[8px] shrink-0 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381] leading-[20px]">
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* 資料列 */}
              {shipment.details.length === 0 && (
                <div className="flex items-center justify-center h-[80px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">目前沒有出貨明細</p>
                </div>
              )}

              {shipment.details.map((row, idx) => (
                <div
                  key={row.itemNo}
                  className={`flex items-center py-[12px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors ${idx % 2 === 1 ? 'bg-[rgba(145,158,171,0.02)]' : ''}`}
                >
                  <div style={{ width: 72, minWidth: 72 }} className="px-[8px] text-left shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.itemNo}</span>
                  </div>
                  <div style={{ width: 130, minWidth: 130 }} className="px-[8px] text-left shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.orderNo}{row.orderSeq}</span>
                  </div>
                  <div style={{ width: 140, minWidth: 140 }} className="px-[8px] text-left shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] truncate block">{row.materialNo}</span>
                  </div>
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{row.orderPendingQty}</span>
                  </div>
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] font-medium">{row.shipQty}</span>
                  </div>
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{row.qtyPerBox}</span>
                  </div>
                  <div style={{ width: 80, minWidth: 80 }} className="px-[8px] text-center shrink-0">
                    {row.totalBoxes > 0 ? (
                      <span className="font-['Public_Sans:SemiBold',sans-serif] text-[17px] text-[#005eb8]">{row.totalBoxes}</span>
                    ) : (
                      <span className="font-['Public_Sans:Regular',sans-serif] text-[17px] text-[#c4cdd6]">—</span>
                    )}
                  </div>
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{row.netWeight || '0'}</span>
                  </div>
                  <div style={{ width: 90, minWidth: 90 }} className="px-[8px] text-right shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{row.grossWeight || '0'}</span>
                  </div>
                  <div style={{ width: 100, minWidth: 100 }} className="px-[8px] text-center shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{row.weightUnit}</span>
                  </div>
                  <div style={{ width: 110, minWidth: 110 }} className="px-[8px] text-center shrink-0">
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{row.countryOfOrigin}</span>
                  </div>
                </div>
              ))}
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

      {/* ── 歷程面板 (stub) ──────────────────────────────────────────────────── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-[200] flex justify-end"
          onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}
          style={{ background: 'rgba(28,37,46,0.35)' }}
        >
          <div className="bg-white w-[360px] h-full shadow-[-4px_0px_20px_rgba(0,0,0,0.08)] flex flex-col">
            <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px] border-b border-[rgba(145,158,171,0.12)]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">歷程紀錄</p>
              <button onClick={() => setShowHistory(false)} className="text-[#919eab] hover:text-[#1c252e] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1 px-[24px] py-[16px] flex items-center justify-center">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">歷程功能開發中</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
