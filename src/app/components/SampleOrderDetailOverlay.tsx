'use client';

import { useState } from 'react';
import { BaseOverlay } from './BaseOverlay';
import { DropdownSelect } from './DropdownSelect';
import { SearchField } from './SearchField';
import {
  getStatusDef,
  SAMPLE_TYPE_OPTIONS,
  updateSampleOrderVendorReply,
  type SampleOrderRecord,
  type SampleOrderStatus,
} from './sampleOrderData';

// ── FloatingInput（帶浮動標籤，唯讀 / 可編輯）──────────────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{
          borderColor: readOnly ? 'rgba(145,158,171,0.10)' : 'rgba(145,158,171,0.2)',
        }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
      </div>
      {readOnly ? (
        <p className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#637381] leading-[22px] bg-[rgba(145,158,171,0.04)]">
          {value || '—'}
        </p>
      ) : (
        <textarea
          className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
          style={{ resize: 'none', minHeight: '54px' }}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={1}
        />
      )}
    </div>
  );
}

// ── NumberInput（帶浮動標籤的數字輸入）──────────────────────────────────────
function NumberInput({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{
          borderColor: readOnly ? 'rgba(145,158,171,0.10)' : 'rgba(145,158,171,0.2)',
        }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
      </div>
      {readOnly ? (
        <p className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#637381] leading-[22px] bg-[rgba(145,158,171,0.04)]">
          {value || '—'}
        </p>
      ) : (
        <input
          type="number"
          className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
          style={{ minHeight: '54px' }}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

// ── InfoField：唯讀 key-value（零件資料區專用）──────────────────────────────
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <p className="text-[11px] font-semibold leading-[16px]" style={{ color: '#919eab' }}>
        {label}
      </p>
      <p className="text-[13px] leading-[20px] font-medium" style={{ color: '#1c252e' }}>
        {value || '—'}
      </p>
    </div>
  );
}

// ── SectionBox：帶標籤框線的區塊 ─────────────────────────────────────────────
function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 區塊標題 */}
      <p
        className="text-[12px] font-semibold leading-[18px] mb-[10px]"
        style={{ color: '#637381' }}
      >
        {title}
      </p>
      {/* 帶框線的內容區 */}
      <div
        className="rounded-[12px] p-[16px] flex flex-col gap-[16px]"
        style={{
          border: '1px solid rgba(145,158,171,0.20)',
          backgroundColor: 'rgba(145,158,171,0.02)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── 狀態判斷 ─────────────────────────────────────────────────────────────────
function isReadonlyStatus(status: SampleOrderStatus): boolean {
  return status === 'SC' || status === 'CC' || status === 'CL';
}

function getSampleTypeLabel(t: string) {
  return t === 'D' ? 'D(開發樣)'
    : t === 'G' ? 'G(量產品)'
    : t === 'E' ? 'E(工程樣)'
    : 'S(特殊樣)';
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SampleOrderDetailOverlayProps {
  order: SampleOrderRecord;
  onClose: () => void;
  onUpdated?: (updatedOrder: SampleOrderRecord) => void;
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export function SampleOrderDetailOverlay({
  order,
  onClose,
  onUpdated,
}: SampleOrderDetailOverlayProps) {
  const statusDef = getStatusDef(order.status);
  const readonly  = isReadonlyStatus(order.status);
  const canReply  = order.status === 'V';

  // 廠商回覆欄位
  const [vendorShipDate, setVendorShipDate]           = useState(order.vendorShipDate ?? '');
  const [actualShipDate, setActualShipDate]           = useState(order.actualShipDate ?? '');
  const [availableDate, setAvailableDate]             = useState(order.availableDate ?? '');
  const [vendorDailyCapacity, setVendorDailyCapacity] = useState(
    order.vendorDailyCapacity != null ? String(order.vendorDailyCapacity) : '',
  );

  const handleReply = () => {
    const updated = updateSampleOrderVendorReply(order.id, {
      vendorShipDate,
      actualShipDate,
      availableDate,
      vendorDailyCapacity: vendorDailyCapacity ? Number(vendorDailyCapacity) : undefined,
    });
    if (updated) onUpdated?.(updated);
    onClose();
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="680px" maxHeight="92vh">
      <div className="relative w-full h-full flex flex-col">

        {/* ── 關閉按鈕 ── */}
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

        {/* ══════════════════════════════════════════════════════════════
            HEADER：狀態 badge + 索樣單號 + 建立時間 + 歷程按鈕
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="shrink-0 flex items-center gap-[12px] pl-[52px] pr-[20px] pt-[18px] pb-[14px] border-b"
          style={{ borderColor: 'rgba(145,158,171,0.12)' }}
        >
          {/* 狀態 Badge */}
          <div
            className="inline-flex items-center justify-center h-[24px] px-[8px] rounded-[6px] shrink-0"
            style={{ backgroundColor: statusDef.bgColor }}
          >
            <p
              className="text-[11px] font-bold leading-none whitespace-nowrap"
              style={{ color: statusDef.textColor }}
            >
              {statusDef.label}({order.status})
            </p>
          </div>

          {/* 索樣單號 */}
          <p className="font-semibold text-[15px] leading-[24px] text-[#1c252e] shrink-0">
            索樣單：{order.orderNo}
          </p>

          {/* 建立時間 */}
          <p className="text-[13px] leading-[20px] flex-1" style={{ color: '#919eab' }}>
            {order.createdAt}
          </p>

          {/* 歷程按鈕 */}
          <button
            className="flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
            title="歷程記錄"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#637381"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[12px] font-medium leading-none" style={{ color: '#637381' }}>
              歷程
            </span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            可捲動內容區
        ══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[20px] custom-scrollbar">

          {/* ── 區塊一：零件資料 ────────────────────────────────────── */}
          <SectionBox title="零件資料">
            {/* 長規格敘述（全寬，字色較深） */}
            <p className="text-[13px] font-medium leading-[20px]" style={{ color: '#1c252e' }}>
              {order.longDescription || '—'}
            </p>

            {/* 分隔線 */}
            <div style={{ height: '1px', backgroundColor: 'rgba(145,158,171,0.12)' }} />

            {/* 第一列：供應商 / 料號 / 採購組織 */}
            <div className="grid grid-cols-3 gap-[16px]">
              <InfoField label="供應商" value={`${order.vendorName}(${order.vendorCode})`} />
              <InfoField label="料號"   value={order.material} />
              <InfoField label="採購組織" value={order.purchaseOrg} />
            </div>

            {/* 第二列：工廠 / 廠商商料號 */}
            <div className="grid grid-cols-3 gap-[16px]">
              <InfoField label="工廠"     value={order.plant} />
              <InfoField label="廠商商料號" value={order.vendorMaterialNo ?? ''} />
            </div>
          </SectionBox>

          {/* ── 區塊二：巨大需求 ─────────────────────────────────────── */}
          <SectionBox title="巨大需求">
            <div className="grid grid-cols-2 gap-[16px]">
              {/* 重新索樣 */}
              {order.status === 'DR' ? (
                <DropdownSelect
                  label="重新索樣"
                  value={order.resample ? '是' : '否'}
                  onChange={() => {}}
                  options={[{ value: '否', label: '否' }, { value: '是', label: '是' }]}
                />
              ) : (
                <FloatingInput label="重新索樣" value={order.resample ? '是' : '否'} readOnly />
              )}

              {/* 索樣類型 */}
              {order.status === 'DR' ? (
                <DropdownSelect
                  label="索樣類型"
                  value={order.sampleType}
                  onChange={() => {}}
                  options={SAMPLE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              ) : (
                <FloatingInput
                  label="索樣類型"
                  value={getSampleTypeLabel(order.sampleType)}
                  readOnly
                />
              )}

              {/* 樣品需求日 */}
              {order.status === 'DR' ? (
                <SearchField label="樣品需求日" value={order.demandDate} onChange={() => {}} type="date" />
              ) : (
                <FloatingInput label="樣品需求日" value={order.demandDate} readOnly />
              )}

              {/* 需求數量 */}
              <NumberInput
                label="需求數量"
                value={order.demandQty != null ? String(order.demandQty) : ''}
                readOnly={order.status !== 'DR'}
                placeholder="請輸入數量"
              />
            </div>
          </SectionBox>

          {/* ── 區塊三：廠商回覆（狀態 V/B/SC 才顯示）─────────────── */}
          {(order.status === 'V' || order.status === 'B' || order.status === 'SC') && (
            <SectionBox title="廠商回覆">
              <div className="grid grid-cols-2 gap-[16px]">
                {/* 樣品送達日 */}
                {canReply ? (
                  <SearchField label="樣品送達日" value={vendorShipDate} onChange={setVendorShipDate} type="date" />
                ) : (
                  <FloatingInput label="樣品送達日" value={order.vendorShipDate ?? ''} readOnly />
                )}

                {/* 實際送樣日 */}
                {canReply ? (
                  <SearchField label="實際送樣日" value={actualShipDate} onChange={setActualShipDate} type="date" />
                ) : (
                  <FloatingInput label="實際送樣日" value={order.actualShipDate ?? ''} readOnly />
                )}

                {/* 首批可供貨日 */}
                {canReply ? (
                  <SearchField label="首批可供貨日" value={availableDate} onChange={setAvailableDate} type="date" />
                ) : (
                  <FloatingInput label="首批可供貨日" value={order.availableDate ?? ''} readOnly />
                )}

                {/* 廠商日產能 */}
                <NumberInput
                  label="廠商日產能"
                  value={
                    canReply
                      ? vendorDailyCapacity
                      : (order.vendorDailyCapacity != null ? String(order.vendorDailyCapacity) : '')
                  }
                  onChange={canReply ? setVendorDailyCapacity : undefined}
                  readOnly={!canReply}
                  placeholder="請輸入日產能"
                />
              </div>
            </SectionBox>
          )}

          {/* 備註（有才顯示） */}
          {order.remark && (
            <FloatingInput label="備註" value={order.remark} readOnly />
          )}

        </div>

        {/* ══════════════════════════════════════════════════════════════
            CTA 底部按鈕列
        ══════════════════════════════════════════════════════════════ */}
        {!readonly && (
          <div
            className="shrink-0 flex gap-[12px] px-[24px] py-[16px] border-t"
            style={{ borderColor: 'rgba(145,158,171,0.12)' }}
          >
            <button
              onClick={onClose}
              className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium hover:bg-[rgba(145,158,171,0.08)] transition-colors"
              style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
            >
              取消
            </button>

            {order.status === 'V' && (
              <button
                onClick={handleReply}
                className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
                style={{ backgroundColor: '#00559c' }}
              >
                <p className="font-bold text-[14px] text-white">回覆採購</p>
              </button>
            )}

            {order.status === 'B' && (
              <button
                className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
                style={{ backgroundColor: '#00559c' }}
              >
                <p className="font-bold text-[14px] text-white">完結</p>
              </button>
            )}
          </div>
        )}

      </div>
    </BaseOverlay>
  );
}
