'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BaseOverlay } from './BaseOverlay';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import { OrderHistory } from './OrderHistory';
import {
  getStatusDef,
  getSampleOrders,
  getSampleOrderHistory,
  SAMPLE_TYPE_OPTIONS,
  cancelSampleOrder,
  revertSampleOrderToV,
  updateSampleOrderStatus,
  updateSampleOrderVendorReply,
  updateSampleOrderDraft,
  updateSCSuppFields,
  addSampleOrderHistory,
  type SampleOrderRecord,
  type SampleOrderStatus,
} from './sampleOrderData';
import { buildEmail1, buildEmail2, buildEmail3, buildEmail4 } from './sampleOrderEmail';

// Mock AD 帳號 Email 對照（實際由後端查詢 AD）
const MOCK_AD_EMAIL: Record<string, string> = {
  '王大明': 'wang.daming@giant-bicycles.com',
  '李小華': 'li.xiaohua@giant-bicycles.com',
};

/** Mock 寄信（後端實作時替換為真實 API call） */
function sendEmailMock(email: ReturnType<typeof buildEmail1>) {
  // eslint-disable-next-line no-console
  console.info(
    `[EP Email Mock] 寄出信${email.emailNo} | ${email.subjectZh}`,
    `\n收件人：${email.recipientQuery}`,
  );
}

// ── FloatingInput（帶浮動標籤，唯讀 / 可編輯）──────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  textColor,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  textColor?: string;
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
        <p className="relative" style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
      </div>
      {readOnly ? (
        <p
          className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] leading-[22px] bg-[rgba(145,158,171,0.04)]"
          style={{ color: textColor ?? '#637381' }}
        >
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
  hasError = false,
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  hasError?: boolean;
  required?: boolean;
  min?: number;
  step?: number;
}) {
  const borderColor = readOnly
    ? 'rgba(145,158,171,0.10)'
    : hasError
    ? '#ff5630'
    : 'rgba(145,158,171,0.2)';
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative" style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}>
          {label}{(required || hasError) && <span style={{ marginLeft: '3px', color: hasError ? '#ff5630' : '#637381' }}>*</span>}
        </p>
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
          min={min}
          step={step}
        />
      )}
    </div>
  );
}

// ── DateInput（帶浮動標籤的日期選擇器，使用 portal 避免 overflow 截斷）───────
function DateInput({
  label,
  value,
  onChange,
  hasError = false,
  isLate = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
  isLate?: boolean;
  required?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef    = useRef<HTMLDivElement>(null); // 指向 portal wrapper，用於 click-outside 判斷
  // SimpleDatePicker 使用 position:absolute，不貢獻父層高度
  // → 不能靠 DOM 測量高度，改用固定常數
  const PICKER_H = 320; // calendar 最大高度（含 header + 6 週）
  const PICKER_W = 280; // SimpleDatePicker 固定寬度
  const [pickerPos, setPickerPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const handleToggle = () => setShowPicker((v) => !v);

  /** 計算 picker 位置：優先上方，上方不足改下方，並夾緊 viewport */
  const calcPos = () => {
    if (!containerRef.current) return;
    const rect   = containerRef.current.getBoundingClientRect();
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;
    const GAP    = 6;
    const MARGIN = 8;

    let top = rect.top - PICKER_H - GAP;
    if (top < MARGIN) top = rect.bottom + GAP;
    top = Math.min(top, vh - PICKER_H - MARGIN);
    top = Math.max(top, MARGIN);

    let left = rect.left;
    if (left + PICKER_W > vw - MARGIN) left = rect.right - PICKER_W;
    left = Math.max(left, MARGIN);

    setPickerPos({ left, top });
  };

  // 開啟後用 double rAF 確保 browser layout/paint 完成才量測
  useEffect(() => {
    if (!showPicker) return;
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(calcPos);
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2 ?? 0); };
  }, [showPicker]);

  // 點擊外部關閉：排除 input 本身 AND calendar portal
  useEffect(() => {
    if (!showPicker) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        pickerRef.current    && !pickerRef.current.contains(target)
      ) {
        setTimeout(() => setShowPicker(false), 0);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [showPicker]);

  // 滾動 / resize 時重算
  useEffect(() => {
    if (!showPicker) return;
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [showPicker]);


  return (
    <div className="relative w-full" ref={containerRef} style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor: hasError ? '#ff5630' : 'rgba(145,158,171,0.2)' }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative" style={{ fontSize: '12px', fontWeight: 600, color: hasError ? '#ff5630' : '#637381' }}>
          {label}{(required || hasError) && <span style={{ marginLeft: '3px', color: hasError ? '#ff5630' : '#637381' }}>*</span>}
        </p>
      </div>
      <div
        className="flex items-center w-full cursor-pointer select-none"
        style={{ minHeight: '54px', paddingLeft: '14px', paddingRight: '10px', paddingTop: '18px', paddingBottom: '10px' }}
        onClick={handleToggle}
      >
        <span
          className="flex-1 text-[14px] leading-[22px] truncate font-medium"
          style={{ color: !value ? '#919eab' : isLate ? '#ff5630' : '#1c252e' }}
        >
          {value || '選擇日期'}
        </span>
        {value && (
          <div
            className="flex items-center justify-center shrink-0 size-[24px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors mr-[4px]"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#919EAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" fill="#637381" opacity="0.2" />
          <path d="M3 9h18M8 2v4M16 2v4" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      {showPicker && createPortal(
        <div
          ref={pickerRef}
          style={{
            position: 'fixed',
            left: pickerPos.left,
            top: pickerPos.top,
            zIndex: 9999,
          }}
        >
          <SimpleDatePicker
            selectedDate={value}
            onDateSelect={(date) => { onChange(date); setShowPicker(false); }}
          />
        </div>,
        document.body,
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
  titleExtra,
  children,
  highlight = false,
}: {
  title: string;
  titleExtra?: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div>
      {/* 區塊標題 */}
      <div className="flex items-center gap-[8px] mb-[10px]">
        <p
          className="text-[12px] font-semibold leading-[18px]"
          style={{ color: highlight ? '#0065A9' : '#637381' }}
        >
          {title}
        </p>
        {titleExtra}
      </div>
      {/* 帶框線的內容區 */}
      <div
        className="rounded-[12px] p-[16px] flex flex-col gap-[16px]"
        style={{
          border: highlight
            ? '1.5px solid rgba(0, 101, 169, 0.35)'
            : '1px solid rgba(145,158,171,0.20)',
          backgroundColor: highlight
            ? 'rgba(0, 101, 169, 0.02)'
            : 'rgba(145,158,171,0.02)',
          boxShadow: highlight
            ? '0 2px 12px 0 rgba(0, 101, 169, 0.10), 0 0 0 1px rgba(0, 101, 169, 0.06)'
            : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── 狀態判斷 ─────────────────────────────────────────────────────
function isReadonlyStatus(status: SampleOrderStatus): boolean {
  // CC / CL 完全唯讀；SC 保留 CTA（取消索樣 / 關閉結案）
  return status === 'CC' || status === 'CL';
}

function getSampleTypeLabel(t: string) {
  return t === 'D' ? 'D(開發樣)' : 'G(量產品)';
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
  // - vendorShipDate: V 狀態預設帶入樣品需求日
  // - actualShipDate: 無預設值（用戶需自行填寫）
  const [vendorShipDate, setVendorShipDate]           = useState(order.vendorShipDate ?? (order.status === 'V' ? order.demandDate : ''));
  const [actualShipDate, setActualShipDate]           = useState(order.actualShipDate ?? '');
  const [availableDate, setAvailableDate]             = useState(order.availableDate ?? '');
  const [vendorDailyCapacity, setVendorDailyCapacity] = useState(
    order.vendorDailyCapacity != null ? String(order.vendorDailyCapacity) : '',
  );

  // DR 可編輯欄位 state
  const [drResample,   setDrResample]   = useState(order.resample ? '是' : '否');
  const [drSampleType, setDrSampleType] = useState(order.sampleType);
  const [drDemandDate, setDrDemandDate] = useState(order.demandDate ?? '');
  const [drDemandQty,  setDrDemandQty]  = useState(order.demandQty != null ? String(order.demandQty) : '');

  // ── 歷程彈窗 ──
  const [showHistory, setShowHistory] = useState(false);
  // 回覆採購按下後才觸發紅框
  const [replySubmitted, setReplySubmitted] = useState(false);
  // SC 狀態：廠商回覆區全部欄位可調整
  const [scVendorShipDate,     setScVendorShipDate]     = useState(order.vendorShipDate     ?? '');
  const [scVendorDailyCapacity, setScVendorDailyCapacity] = useState(
    order.vendorDailyCapacity != null ? String(order.vendorDailyCapacity) : '',
  );
  const [scAvailableDate,  setScAvailableDate]  = useState(order.availableDate  ?? '');
  const [scActualShipDate, setScActualShipDate] = useState(order.actualShipDate ?? '');

  const handleReply = () => {
    setReplySubmitted(true);
    const shipEmpty  = !vendorShipDate;
    const capNum     = Number(vendorDailyCapacity);
    const capInvalid = !vendorDailyCapacity || !Number.isInteger(capNum) || capNum <= 0;
    if (shipEmpty || capInvalid) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const updated = updateSampleOrderVendorReply(order.id, {
      vendorShipDate,
      actualShipDate,
      availableDate,
      vendorDailyCapacity: vendorDailyCapacity ? Number(vendorDailyCapacity) : undefined,
    });
    addSampleOrderHistory(order.id, {
      date: ts,
      event: '回覆採購',
      operator: '王大明',
      remark: [
        vendorShipDate      ? `樣品達交日：${vendorShipDate}`       : null,
        capNum > 0          ? `日產能：${capNum}`                        : null,
        availableDate       ? `首批可供貨日：${availableDate}`  : null,
        actualShipDate      ? `實際送樣日：${actualShipDate}`      : null,
      ].filter(Boolean).join('，'),
    });
    if (updated) onUpdated?.(updated);

    // 觸發寄信：首次回覆 → 信二；補填後回覆 → 信四
    const latestOrder: SampleOrderRecord = {
      ...order,
      vendorShipDate,
      actualShipDate: actualShipDate || undefined,
      availableDate: availableDate || undefined,
      vendorDailyCapacity: capNum > 0 ? capNum : undefined,
      status: 'SC',
    };
    const email = order.needsFullVendorReply
      ? buildEmail4(latestOrder)
      : buildEmail2(latestOrder);
    sendEmailMock(email);
    onClose();
  };

  // DR：暫存草稿
  const handleSaveDraft = () => {
    const qtyNum = Number(drDemandQty);
    if (!drDemandQty || !Number.isInteger(qtyNum) || qtyNum <= 0) {
      window.alert('「需求數量」需為大於 0 的整數');
      return;
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const sampleTypeLabel = SAMPLE_TYPE_OPTIONS.find(o => o.value === drSampleType)?.label ?? drSampleType;
    const updated = updateSampleOrderDraft(
      order.id,
      {
        resample: drResample === '是',
        sampleType: drSampleType,
        demandDate: drDemandDate,
        demandQty: Number(drDemandQty),
      },
      false,
    );
    addSampleOrderHistory(order.id, {
      date: ts,
      event: '草稿已儲存',
      operator: '王大明',
      remark: [
        `索樣類型：${sampleTypeLabel}`,
        drDemandDate  ? `樣品需求日：${drDemandDate}`  : null,
        drDemandQty   ? `需求數量：${drDemandQty}`         : null,
        drResample === '是' ? '重新索樣：是' : null,
      ].filter(Boolean).join('，'),
    });
    if (updated) onUpdated?.(updated);
    onClose();
  };

  // DR：轉交廠商（DR → V）
  const handleSendToVendor = () => {
    const qtyNum = Number(drDemandQty);
    if (!drDemandQty || !Number.isInteger(qtyNum) || qtyNum <= 0) {
      window.alert('「需求數量」需為大於 0 的整數');
      return;
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const sampleTypeLabel = SAMPLE_TYPE_OPTIONS.find(o => o.value === drSampleType)?.label ?? drSampleType;
    const updated = updateSampleOrderDraft(
      order.id,
      {
        resample: drResample === '是',
        sampleType: drSampleType,
        demandDate: drDemandDate,
        demandQty: Number(drDemandQty),
      },
      true,
    );
    addSampleOrderHistory(order.id, {
      date: ts,
      event: '轉交廠商',
      operator: '王大明',
      remark: [
        `索樣類型：${sampleTypeLabel}`,
        drDemandDate  ? `樣品需求日：${drDemandDate}`  : null,
        drDemandQty   ? `需求數量：${drDemandQty}`         : null,
        drResample === '是' ? '重新索樣：是' : null,
      ].filter(Boolean).join('，'),
    });
    if (updated) onUpdated?.(updated);

    // 觸發寄信：信一（DR→V）
    const latestOrder: SampleOrderRecord = {
      ...order,
      resample: drResample === '是',
      sampleType: drSampleType,
      demandDate: drDemandDate,
      demandQty: Number(drDemandQty),
      status: 'V',
    };
    const createdByEmail = MOCK_AD_EMAIL[order.createdBy] ?? `${order.createdBy}@giant-bicycles.com`;
    sendEmailMock(buildEmail1(latestOrder, createdByEmail));
    onClose();
  };

  // SC：取消索樣 dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason]         = useState('');

  // SC：關閉結案前不完整欄位的 dialog state
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [missingFields, setMissingFields]               = useState<string[]>([]);

  // SC：確認取消（SC → CC）
  const handleCancelToCC = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    // cancelSampleOrder 同時寫入 cancelReason 到 record
    const updated = cancelSampleOrder(order.id, cancelReason);
    addSampleOrderHistory(order.id, {
      date: ts,
      event: '取消索樣',
      operator: '王大明',
      remark: cancelReason || '(無原因)',
    });
    if (updated) onUpdated?.(updated);
    setShowCancelDialog(false);
    onClose();
  };

  // SC：儲存（保持 SC 狀態，存全部廠商回覆欄位）
  const handleSaveSC = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const capNum = Number(scVendorDailyCapacity);
    const capOk  = scVendorDailyCapacity && Number.isInteger(capNum) && capNum > 0;

    const updated = updateSampleOrderVendorReply(order.id, {
      vendorShipDate:      scVendorShipDate || undefined,
      vendorDailyCapacity: capOk ? capNum   : undefined,
      availableDate:       scAvailableDate  || undefined,
      actualShipDate:      scActualShipDate || undefined,
    });

    // 只記錄本次有變動的欄位
    const origCapStr = order.vendorDailyCapacity != null ? String(order.vendorDailyCapacity) : '';
    const changes: string[] = [];
    if (scVendorShipDate  !== (order.vendorShipDate  ?? '')) changes.push(`樣品達交日：${scVendorShipDate  || '（清空）'}`);
    if (scVendorDailyCapacity !== origCapStr)                changes.push(`日產能：${scVendorDailyCapacity || '（清空）'}`);
    if (scAvailableDate   !== (order.availableDate   ?? '')) changes.push(`首批可供貨日：${scAvailableDate  || '（清空）'}`);
    if (scActualShipDate  !== (order.actualShipDate  ?? '')) changes.push(`實際送樣日：${scActualShipDate  || '（清空）'}`);

    if (changes.length > 0) {
      addSampleOrderHistory(order.id, {
        date: ts,
        event: '廠商回覆資料已更新',
        operator: '王大明',
        remark: changes.join('，'),
      });
    }
    if (updated) onUpdated?.(updated);
    onClose();
  };

  // SC：關閉結案（先存全部 SC 欄位，再檢查完整性）
  const handleCloseToCL = () => {
    const capNum = Number(scVendorDailyCapacity);
    const capOk  = scVendorDailyCapacity && Number.isInteger(capNum) && capNum > 0;

    // 先存目前所有 SC 欄位
    updateSampleOrderVendorReply(order.id, {
      vendorShipDate:      scVendorShipDate || undefined,
      vendorDailyCapacity: capOk ? capNum  : undefined,
      availableDate:       scAvailableDate  || undefined,
      actualShipDate:      scActualShipDate || undefined,
    });

    // 檢查必填欄位（以 local state 為主）
    const missing: string[] = [];
    if (!scVendorShipDate)  missing.push('樣品達交日');
    if (!capOk)             missing.push('廠商日產能');
    if (!scActualShipDate)  missing.push('實際送樣日');
    if (!scAvailableDate)   missing.push('首批可供貨日');

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowIncompleteDialog(true);
      return;
    }

    // 全部填寫完整，直接轉 CL
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    updateSampleOrderStatus([order.id], 'CL');
    addSampleOrderHistory(order.id, {
      date: ts,
      event: '關閉結案',
      operator: '王大明',
      remark: '',
    });
    const updated = getSampleOrders().find(o => o.id === order.id) ?? null;
    if (updated) onUpdated?.(updated);
    onClose();
  };

  // SC：資料不齊全，退回廠商確認（SC → V，標記 needsFullVendorReply=true）
  const handleRevertToV = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const updated = revertSampleOrderToV(order.id); // SC→V + needsFullVendorReply=true
    addSampleOrderHistory(order.id, {
      date: ts,
      event: '退回廠商補填（資料不齊全）',
      operator: '王大明',
      remark: `缺少欄位：${missingFields.join('、')}`,
    });
    if (updated) onUpdated?.(updated);
    setShowIncompleteDialog(false);

    // 觸發寄信：信三（SC→V）
    const createdByEmail = MOCK_AD_EMAIL[order.createdBy] ?? `${order.createdBy}@giant-bicycles.com`;
    sendEmailMock(buildEmail3(
      { ...order, status: 'V', updatedAt: ts },
      missingFields,
      createdByEmail,
    ));
    onClose();
  };

  // DR 狀態沒有廠商回覆區，用 autoHeight
  const useAutoHeight = order.status === 'DR';

  return (
    <BaseOverlay onClose={onClose} maxWidth="680px" {...(useAutoHeight ? { autoHeight: true } : { maxHeight: '92vh' })}>
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
          className="shrink-0 flex flex-col pl-[52px] pr-[20px] pt-[18px] border-b"
          style={{ borderColor: 'rgba(145,158,171,0.12)' }}
        >
          {/* ── 第一列：狀態 Badge + 索樣單號 + 建立時間 + 歷程按鈕 ── */}
          <div className="flex items-center gap-[12px] pb-[14px]">
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
              onClick={() => setShowHistory(true)}
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

          {/* ── 第二列：CC 狀態就顯示取消原因 ── */}
          {order.status === 'CC' && (
            <div className="flex items-start gap-[6px] pb-[10px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[3px]">
                <circle cx="12" cy="12" r="10" stroke="#ff5630" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-[13px] leading-[20px]" style={{ color: '#b71d18' }}>
                {order.cancelReason || '(未記錄取消原因)'}
              </p>
            </div>
          )}
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

            {/* 第二列：工廠 / 供應商料號 */}
            <div className="grid grid-cols-3 gap-[16px]">
              <InfoField label="工廠"     value={order.plant} />
              <InfoField label="供應商料號" value={order.vendorMaterialNo ?? ''} />
            </div>
          </SectionBox>

          {/* ── 區塊二：巨大需求 ─────────────────────────────────────── */}
          <SectionBox title="巨大需求" highlight={order.status === 'DR'}>
            <div className="grid grid-cols-2 gap-[16px]">
              {/* 重新索樣 */}
              {order.status === 'DR' ? (
                <DropdownSelect
                  label="重新索樣"
                  value={drResample}
                  onChange={setDrResample}
                  options={[{ value: '否', label: '否' }, { value: '是', label: '是' }]}
                />
              ) : (
                <FloatingInput label="重新索樣" value={order.resample ? '是' : '否'} readOnly />
              )}

              {/* 索樣類型 */}
              {order.status === 'DR' ? (
                <DropdownSelect
                  label="索樣類型"
                  value={drSampleType}
                  onChange={setDrSampleType}
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
                <DateInput label="樣品需求日" value={drDemandDate} onChange={setDrDemandDate} />
              ) : (
                <FloatingInput label="樣品需求日" value={order.demandDate} readOnly />
              )}

              {/* 需求數量 */}
              <NumberInput
                label="需求數量"
                value={order.status === 'DR' ? drDemandQty : (order.demandQty != null ? String(order.demandQty) : '')}
                onChange={order.status === 'DR' ? setDrDemandQty : undefined}
                readOnly={order.status !== 'DR'}
                placeholder="請輸入數量"
                hasError={order.status === 'DR' && (!drDemandQty || !Number.isInteger(Number(drDemandQty)) || Number(drDemandQty) <= 0)}
                required={order.status === 'DR'}
                min={1}
                step={1}
              />
            </div>
          </SectionBox>

          {/* 廠商回覆區：
              - 正常 V 狀態：只有樣品達交日必填
              - needsFullVendorReply=true（被採購退回補填）：全部空欄位標紅
          */}
          {(order.status === 'V' || order.status === 'SC' || order.status === 'CC' || order.status === 'CL') && (
            <SectionBox
              title="廠商回覆"
              highlight={canReply || order.status === 'SC'}
              titleExtra={canReply && order.needsFullVendorReply ? (
                <span className="flex items-center gap-[4px]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#b76e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] font-medium" style={{ color: '#b76e00' }}>請補齊所有資料欄位，謝謝</span>
                </span>
              ) : undefined}
            >
              <div className="grid grid-cols-2 gap-[16px]">
                {/* 樣品達交日：V 必填，SC 可調整 */}
                {canReply ? (
                  <DateInput
                    label="樣品達交日"
                    value={vendorShipDate}
                    onChange={setVendorShipDate}
                    hasError={replySubmitted && !vendorShipDate}
                    required
                    isLate={!!vendorShipDate && !!order.demandDate && vendorShipDate > order.demandDate}
                  />
                ) : order.status === 'SC' ? (
                  <DateInput
                    label="樣品達交日"
                    value={scVendorShipDate}
                    onChange={setScVendorShipDate}
                    isLate={!!scVendorShipDate && !!order.demandDate && scVendorShipDate > order.demandDate}
                  />
                ) : (
                  <FloatingInput
                    label="樣品達交日"
                    value={order.vendorShipDate ?? ''}
                    readOnly
                    textColor={order.vendorShipDate && order.demandDate && order.vendorShipDate > order.demandDate ? '#ff5630' : '#637381'}
                  />
                )}

                {/* 廠商日產能：V 必填，SC 可調整 */}
                <NumberInput
                  label="廠商日產能"
                  value={
                    canReply ? vendorDailyCapacity
                    : order.status === 'SC' ? scVendorDailyCapacity
                    : (order.vendorDailyCapacity != null ? String(order.vendorDailyCapacity) : '')
                  }
                  onChange={
                    canReply ? setVendorDailyCapacity
                    : order.status === 'SC' ? setScVendorDailyCapacity
                    : undefined
                  }
                  readOnly={!canReply && order.status !== 'SC'}
                  placeholder="請輸入日產能"
                  hasError={replySubmitted && canReply && (!vendorDailyCapacity || !Number.isInteger(Number(vendorDailyCapacity)) || Number(vendorDailyCapacity) <= 0)}
                  required={canReply}
                  min={1}
                  step={1}
                />

                {/* 首批可供貨日：V 退回補填時必填；SC 可調整 */}
                {canReply ? (
                  <DateInput label="首批可供貨日" value={availableDate} onChange={setAvailableDate} hasError={!!order.needsFullVendorReply && !availableDate} />
                ) : order.status === 'SC' ? (
                  <DateInput label="首批可供貨日" value={scAvailableDate} onChange={setScAvailableDate} />
                ) : (
                  <FloatingInput label="首批可供貨日" value={order.availableDate ?? ''} readOnly />
                )}

                {/* 實際送樣日：V 退回補填時必填；SC 可調整 */}
                {canReply ? (
                  <DateInput
                    label="實際送樣日"
                    value={actualShipDate}
                    onChange={setActualShipDate}
                    hasError={!!order.needsFullVendorReply && !actualShipDate}
                    isLate={!!actualShipDate && !!order.demandDate && actualShipDate > order.demandDate}
                  />
                ) : order.status === 'SC' ? (
                  <DateInput
                    label="實際送樣日"
                    value={scActualShipDate}
                    onChange={setScActualShipDate}
                    isLate={!!scActualShipDate && !!order.demandDate && scActualShipDate > order.demandDate}
                  />
                ) : (
                  <FloatingInput
                    label="實際送樣日"
                    value={order.actualShipDate ?? ''}
                    readOnly
                    textColor={order.actualShipDate && order.demandDate && order.actualShipDate > order.demandDate ? '#ff5630' : '#637381'}
                  />
                )}
              </div>

              {/* inline 錯誤提示 */}
              {replySubmitted && canReply && (() => {
                const shipEmpty  = !vendorShipDate;
                const capNum     = Number(vendorDailyCapacity);
                const capInvalid = !vendorDailyCapacity || !Number.isInteger(capNum) || capNum <= 0;
                if (!shipEmpty && !capInvalid) return null;
                const msg = shipEmpty && capInvalid
                  ? '⚠ 請填寫樣品達交日，且廠商日產能需為大於 0 的整數'
                  : shipEmpty
                  ? '⚠ 請填寫樣品達交日'
                  : '⚠ 廠商日產能需為大於 0 的整數';
                return <p className="text-[12px] mt-[-8px]" style={{ color: '#ff5630' }}>{msg}</p>;
              })()}
            </SectionBox>
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
            {order.status === 'DR' && (
              <>
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
                >
                  暫存草稿
                </button>
                <button
                  onClick={handleSendToVendor}
                  className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
                  style={{ backgroundColor: '#00559c' }}
                >
                  <p className="font-bold text-[14px] text-white">轉交廠商</p>
                </button>
              </>
            )}

            {order.status === 'V' && (
              <>
                <button
                  onClick={() => { setCancelReason(''); setShowCancelDialog(true); }}
                  className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium transition-colors hover:bg-[rgba(255,86,48,0.08)]"
                  style={{ borderColor: 'rgba(255,86,48,0.5)', color: '#ff5630' }}
                >
                  取消索樣
                </button>
                <button
                  onClick={handleReply}
                  className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
                  style={{ backgroundColor: '#00559c' }}
                >
                  <p className="font-bold text-[14px] text-white">回覆採購</p>
                </button>
              </>
            )}

            {order.status === 'SC' && (
              <>
                <button
                  onClick={() => { setCancelReason(''); setShowCancelDialog(true); }}
                  className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium transition-colors hover:bg-[rgba(255,86,48,0.08)]"
                  style={{ borderColor: 'rgba(255,86,48,0.5)', color: '#ff5630' }}
                >
                  取消索樣
                </button>
                <button
                  onClick={handleSaveSC}
                  className="flex-1 h-[36px] rounded-[8px] text-[14px] font-medium hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#118D57', color: '#fff' }}
                >
                  儲存
                </button>
                <button
                  onClick={handleCloseToCL}
                  className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
                  style={{ backgroundColor: '#00559c' }}
                >
                  <p className="font-bold text-[14px] text-white">關閉結案</p>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── 取消索樣：填寫原因 dialog ── */}
        {showCancelDialog && (
          <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(28,37,62,0.35)' }}>
            <div className="bg-white rounded-[16px] shadow-[0_8px_32px_0_rgba(28,37,62,0.18)] w-[400px] mx-[16px] overflow-hidden">
              {/* dialog header */}
              <div className="flex items-center gap-[10px] px-[20px] py-[14px] border-b" style={{ borderColor: 'rgba(145,158,171,0.12)' }}>
                <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px]" style={{ backgroundColor: 'rgba(255,86,48,0.10)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-semibold text-[15px] leading-[22px]" style={{ color: '#1c252e' }}>取消索樣</p>
              </div>
              {/* dialog body */}
              <div className="px-[20px] pt-[16px] pb-[12px] flex flex-col gap-[10px]">
                <p className="text-[13px] leading-[20px]" style={{ color: '#637381' }}>請輸入取消原因（必填）</p>
                <textarea
                  className="w-full rounded-[8px] border px-[12px] py-[10px] text-[14px] leading-[22px] outline-none resize-none"
                  style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#1c252e', minHeight: '80px' }}
                  placeholder="請說明取消索樣原因…"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  autoFocus
                />
              </div>
              {/* dialog footer */}
              <div className="flex gap-[10px] px-[20px] py-[14px] border-t" style={{ borderColor: 'rgba(145,158,171,0.12)' }}>
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
                >
                  返回
                </button>
                <button
                  onClick={handleCancelToCC}
                  disabled={!cancelReason.trim()}
                  className="flex-1 h-[36px] rounded-[8px] text-[14px] font-bold text-white transition-colors"
                  style={{ backgroundColor: cancelReason.trim() ? '#ff5630' : 'rgba(255,86,48,0.35)', cursor: cancelReason.trim() ? 'pointer' : 'not-allowed' }}
                >
                  確認取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 關閉結案：廠商回覆資料不齊全 dialog ── */}
        {showIncompleteDialog && (
          <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(28,37,62,0.35)' }}>
            <div className="bg-white rounded-[16px] shadow-[0_8px_32px_0_rgba(28,37,62,0.18)] w-[420px] mx-[16px] overflow-hidden">
              {/* dialog header */}
              <div className="flex items-center gap-[10px] px-[20px] py-[14px] border-b" style={{ borderColor: 'rgba(145,158,171,0.12)' }}>
                <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px]" style={{ backgroundColor: 'rgba(255,171,0,0.12)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      stroke="#b76e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-semibold text-[15px] leading-[22px]" style={{ color: '#1c252e' }}>廠商回覆資料不齊全</p>
              </div>
              {/* dialog body */}
              <div className="px-[20px] pt-[14px] pb-[16px] flex flex-col gap-[10px]">
                <p className="text-[13px] leading-[20px]" style={{ color: '#637381' }}>以下欄位尚未填寫，無法關閉結案：</p>
                <div className="flex flex-col gap-[6px]">
                  {missingFields.map(field => (
                    <div key={field} className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px]" style={{ backgroundColor: 'rgba(255,86,48,0.06)', border: '1px solid rgba(255,86,48,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <circle cx="12" cy="12" r="10" stroke="#ff5630" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <p className="text-[13px] font-semibold" style={{ color: '#ff5630' }}>{field} 需填寫</p>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] leading-[18px] mt-[4px]" style={{ color: '#919eab' }}>點擊「確認」後狀態將退回「廠商確認中(V)」，請廠商補充缺少資料。</p>
              </div>
              {/* dialog footer */}
              <div className="flex gap-[10px] px-[20px] py-[14px] border-t" style={{ borderColor: 'rgba(145,158,171,0.12)' }}>
                <button
                  onClick={() => setShowIncompleteDialog(false)}
                  className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
                >
                  取消
                </button>
                <button
                  onClick={handleRevertToV}
                  className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center text-[14px] font-bold text-white hover:bg-[#b76e00] transition-colors"
                  style={{ backgroundColor: '#c47b00' }}
                >
                  確認，退回廠商補充
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── 索樣單歷程彈窗 ── */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          entries={getSampleOrderHistory(order.id)}
          titleLabel="索樣單歷程"
          correctionDocNo={order.orderNo}
          correctionDocNoLabel="索樣單號"
        />
      )}

    </BaseOverlay>
  );
}
