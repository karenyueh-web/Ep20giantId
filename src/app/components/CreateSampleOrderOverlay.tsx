'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BaseOverlay } from './BaseOverlay';
import { DropdownSelect } from './DropdownSelect';
import { SimpleDatePicker } from './SimpleDatePicker';
import {
  addSampleOrder,
  SAMPLE_TYPE_OPTIONS,
  type SampleType,
} from './sampleOrderData';
import type { PartRecord } from './partsMaintenanceData';

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
        <p className="relative" style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
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

// ── NumberInput（帶浮動標籤的數字輸入）────────────────────────────────────────
function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor: 'rgba(145,158,171,0.2)' }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative" style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
      </div>
      <input
        type="number"
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        style={{ minHeight: '54px', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={1}
      />
    </div>
  );
}

// ── DateInput（帶浮動標籤的日期選擇器，與 FloatingInput 結構完全一致）─────────────
function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerPos, setPickerPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  // 計算座標（固定向上展開，底部對齊欄位上方）
  const calcPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pickerH = pickerRef.current?.offsetHeight ?? 340;
    setPickerPos({
      left: rect.left,
      top: rect.top - pickerH - 4,
    });
  }, []);

  const handleToggle = () => {
    if (!showPicker) {
      // 先開啟讓 picker 渲染，再計算位置
      setShowPicker(true);
    } else {
      setShowPicker(false);
    }
  };

  // 開啟後量測高度並重新定位
  useEffect(() => {
    if (!showPicker) return;
    // 等一幀讓 picker 渲染完畢
    requestAnimationFrame(() => {
      if (!containerRef.current || !pickerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pickerH = pickerRef.current.offsetHeight;
      setPickerPos({
        left: rect.left,
        top: rect.top - pickerH - 4,
      });
    });
  }, [showPicker]);

  // 點擊外部關閉
  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        pickerRef.current && !pickerRef.current.contains(target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  // 滾動時重新計算位置
  useEffect(() => {
    if (!showPicker) return;
    const onScroll = () => {
      if (!containerRef.current || !pickerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pickerH = pickerRef.current.offsetHeight;
      setPickerPos({
        left: rect.left,
        top: rect.top - pickerH - 4,
      });
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [showPicker]);

  return (
    <div className="relative w-full" ref={containerRef} style={{ minHeight: '54px' }}>
      {/* 一致的框線 overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor: 'rgba(145,158,171,0.2)' }}
      />
      {/* 浮動標籤 */}
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative" style={{ fontSize: '12px', fontWeight: 600, color: '#637381' }}>{label}</p>
      </div>
      {/* 內容區：日期文字 + calendar icon */}
      <div
        className="flex items-center w-full cursor-pointer select-none"
        style={{ minHeight: '54px', paddingLeft: '14px', paddingRight: '10px', paddingTop: '18px', paddingBottom: '10px' }}
        onClick={handleToggle}
      >
        <span
          className="flex-1 text-[14px] leading-[22px] truncate"
          style={{ color: value ? '#1c252e' : '#919eab' }}
        >
          {value || '選擇日期'}
        </span>
        {/* 清除 */}
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
        {/* Calendar icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" fill="#637381" opacity="0.2" />
          <path d="M3 9h18M8 2v4M16 2v4" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      {/* 日曆（portal 渲染到 body，徹底脫離 modal DOM） */}
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

// ── InfoField：純文字 key-value 顯示 ────────────────────────────────────────
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

// ── SectionBox：帶標籤邊框的區塊容器 ─────────────────────────────────────────
function SectionBox({
  title,
  children,
  highlight = false,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className="text-[12px] font-semibold leading-[18px] mb-[10px]"
        style={{ color: highlight ? '#0065A9' : '#637381' }}
      >
        {title}
      </p>
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface CreateSampleOrderOverlayProps {
  selectedParts: PartRecord[];
  onClose: () => void;
  onCreated: (orderNo: string) => void;
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export function CreateSampleOrderOverlay({
  selectedParts,
  onClose,
  onCreated,
}: CreateSampleOrderOverlayProps) {
  const firstPart = selectedParts[0];

  // 巨大需求欄位
  const [demandDate,  setDemandDate]  = useState('');
  const [sampleType,  setSampleType]  = useState<string>('G');
  const [resample,    setResample]    = useState<string>('否');
  const [demandQty,   setDemandQty]   = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  const resampleOptions = [
    { value: '否', label: '否' },
    { value: '是', label: '是' },
  ];

  const handleSubmit = (targetStatus: 'DR' | 'V') => {
    setSubmitted(true);
    // 巨大需求必填驗證
    if (!demandDate || !demandQty) return;

    let lastOrderNo = '';
    selectedParts.forEach((part) => {
      const record = addSampleOrder({
        status:          targetStatus,
        vendorCode:      part.vendorCode,
        vendorName:      part.vendorName,
        purchaseOrg:     part.purchaseOrg,
        plant:           part.plant,
        material:        part.material,
        longDescription: part.longDescription,
        sampleDate:      demandDate,
        demandDate,
        demandQty:       demandQty ? Number(demandQty) : undefined,
        resample:        resample === '是',
        sampleType:      sampleType as SampleType,
        createdBy:       '王大明',
      });
      lastOrderNo = record.orderNo;
    });

    onCreated(lastOrderNo);
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="680px" autoHeight>
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
            HEADER
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="shrink-0 px-[52px] pt-[20px] pb-[14px] border-b"
          style={{ borderColor: 'rgba(145,158,171,0.12)' }}
        >
          <p className="font-semibold text-[18px] leading-[28px] text-[#1c252e]">
            開立索樣單
          </p>
          <p className="text-[13px] mt-[2px]" style={{ color: '#919eab' }}>
            共 {selectedParts.length} 筆零件，每筆各開立一張索樣單
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            可捲動內容區
        ══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[20px] custom-scrollbar">

          {/* ── 區塊一：索樣零件清單 ────────────────────────────────── */}
          <SectionBox title="索樣零件清單">
            {/* 供應商 / 採購組織 / 工廠（唯讀資訊） */}
            <div className="grid grid-cols-3 gap-[16px]">
              <InfoField label="供應商(編號)" value={`${firstPart.vendorName}(${firstPart.vendorCode})`} />
              <InfoField label="採購組織"   value={firstPart.purchaseOrg} />
              <InfoField label="工廠"       value={firstPart.plant} />
            </div>

            {/* 分隔線 */}
            <div style={{ height: '1px', backgroundColor: 'rgba(145,158,171,0.12)' }} />

            {/* 零件表格 */}
            <div className="rounded-[8px] overflow-hidden" style={{ border: '1px solid rgba(145,158,171,0.16)' }}>
              {/* 表頭 */}
              <div
                className="grid px-[14px] py-[8px] gap-[16px]"
                style={{
                  backgroundColor: '#f4f6f8',
                  gridTemplateColumns: '1fr 2fr',
                }}
              >
                <span className="text-[12px] font-semibold" style={{ color: '#637381' }}>料號</span>
                <span className="text-[12px] font-semibold" style={{ color: '#637381' }}>長規格敘述</span>
              </div>
              {/* 資料列 */}
              <div className="max-h-[180px] overflow-y-auto custom-scrollbar">
                {selectedParts.map((part, i) => (
                  <div
                    key={part.id}
                    className="grid px-[14px] py-[10px] gap-[16px]"
                    style={{
                      gridTemplateColumns: '1fr 2fr',
                      borderTop: '1px solid rgba(145,158,171,0.08)',
                      backgroundColor: i % 2 === 0 ? 'white' : 'rgba(145,158,171,0.02)',
                    }}
                  >
                    <span className="text-[13px] font-medium truncate" style={{ color: '#1c252e' }}>
                      {part.material}
                    </span>
                    <span className="text-[13px] truncate" style={{ color: '#637381' }}>
                      {part.longDescription}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionBox>

          {/* ── 區塊二：巨大需求 ─────────────────────────────────────── */}
          <SectionBox title="巨大需求" highlight>
            <div className="grid grid-cols-2 gap-[16px]">
              {/* 重新索樣 */}
              <DropdownSelect
                label="重新索樣"
                value={resample}
                onChange={setResample}
                options={resampleOptions}
              />

              {/* 索樣類型 */}
              <DropdownSelect
                label="索樣類型"
                value={sampleType}
                onChange={setSampleType}
                options={SAMPLE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />

              {/* 樣品需求日 */}
              <DateInput
                label="樣品需求日"
                value={demandDate}
                onChange={setDemandDate}
              />

              {/* 需求數量 */}
              <NumberInput
                label="需求數量"
                value={demandQty}
                onChange={setDemandQty}
                placeholder="請輸入數量"
              />
            </div>

            {/* 驗證錯誤提示 */}
            {submitted && (!demandDate || !demandQty) && (
              <p className="text-[12px] mt-[-8px]" style={{ color: '#ff5630' }}>
                ⚠ 請填寫樣品需求日及需求數量
              </p>
            )}
          </SectionBox>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            CTA 底部按鈕列
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="shrink-0 flex gap-[12px] px-[24px] py-[16px] border-t"
          style={{ borderColor: 'rgba(145,158,171,0.12)' }}
        >
          <button
            onClick={() => handleSubmit('DR')}
            className="flex-1 h-[36px] rounded-[8px] border text-[14px] font-medium hover:bg-[rgba(145,158,171,0.08)] transition-colors"
            style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
          >
            暫存草稿
          </button>
          <button
            onClick={() => handleSubmit('V')}
            className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
            style={{ backgroundColor: '#00559c' }}
          >
            <p className="font-bold text-[14px] text-white">轉交廠商</p>
          </button>
        </div>

      </div>
    </BaseOverlay>
  );
}
