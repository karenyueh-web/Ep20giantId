'use client';

import { useState } from 'react';
import { BaseOverlay } from './BaseOverlay';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import {
  addSampleOrder,
  SAMPLE_TYPE_OPTIONS,
  type SampleType,
} from './sampleOrderData';
import type { PartRecord } from './partsMaintenanceData';

// ── FloatingInput（局部定義，符合 Overlay 規範）────────────────────────────
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
        style={{ borderColor: readOnly ? 'rgba(145,158,171,0.10)' : 'rgba(145,158,171,0.2)' }}
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
          style={{ resize: 'vertical', minHeight: '54px' }}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={1}
        />
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CreateSampleOrderOverlayProps {
  /** 已選取的零件清單（至少一筆） */
  selectedParts: PartRecord[];
  onClose: () => void;
  /** 成功建立後回調 */
  onCreated: (orderNo: string) => void;
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export function CreateSampleOrderOverlay({
  selectedParts,
  onClose,
  onCreated,
}: CreateSampleOrderOverlayProps) {
  // 從第一筆零件帶入共用欄位（廠商、採購組織、工廠）
  const firstPart = selectedParts[0];

  const [sampleDate, setSampleDate] = useState('');
  const [demandDate, setDemandDate] = useState('');
  const [sampleType, setSampleType] = useState<string>('D');
  const [resample, setResample] = useState<string>('否');
  const [remark, setRemark] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 逐筆零件為每筆各開立一張索樣單
  const handleSubmit = () => {
    setSubmitted(true);
    if (!sampleDate || !demandDate) return;

    let lastOrderNo = '';
    selectedParts.forEach((part) => {
      const record = addSampleOrder({
        status: 'DR',
        vendorCode: part.vendorCode,
        vendorName: part.vendorName,
        purchaseOrg: part.purchaseOrg,
        plant: part.plant,
        material: part.material,
        longDescription: part.longDescription,
        sampleDate,
        demandDate,
        resample: resample === '是',
        sampleType: sampleType as SampleType,
        remark,
        createdBy: '王大明', // Mock 登入用戶
      });
      lastOrderNo = record.orderNo;
    });

    onCreated(lastOrderNo);
  };

  const resampleOptions = [
    { value: '否', label: '否' },
    { value: '是', label: '是' },
  ];

  return (
    <BaseOverlay onClose={onClose} maxWidth="640px" maxHeight="90vh">
      <div className="relative w-full h-full flex flex-col">
        {/* 關閉按鈕 */}
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

        {/* 標題列 */}
        <div className="shrink-0 px-[50px] pt-[50px] pb-[20px] border-b border-[rgba(145,158,171,0.12)]">
          <p className="font-semibold text-[18px] leading-[28px] text-[#1c252e]">
            開立索樣單
          </p>
          <p className="text-[13px] text-[#637381] mt-[4px]">
            共 {selectedParts.length} 筆零件，每筆各開立一張索樣單（狀態：草稿 DR）
          </p>
        </div>

        {/* 內容區（可捲動） */}
        <div className="flex-1 overflow-y-auto px-[50px] py-[24px] flex flex-col gap-[16px]">
          {/* 唯讀欄位 */}
          <div className="grid grid-cols-2 gap-[16px]">
            <FloatingInput
              label="廠商(編號)"
              value={`${firstPart.vendorName}(${firstPart.vendorCode})`}
              readOnly
            />
            <FloatingInput
              label="採購組織"
              value={firstPart.purchaseOrg}
              readOnly
            />
            <FloatingInput
              label="工廠"
              value={firstPart.plant}
              readOnly
            />
            <FloatingInput
              label="零件數量"
              value={`${selectedParts.length} 筆`}
              readOnly
            />
          </div>

          {/* 可編輯欄位 */}
          <div className="grid grid-cols-2 gap-[16px]">
            <SearchField
              label="索樣日期"
              value={sampleDate}
              onChange={setSampleDate}
              type="date"
            />
            <SearchField
              label="需求日期"
              value={demandDate}
              onChange={setDemandDate}
              type="date"
            />
            <DropdownSelect
              label="索樣類型"
              value={sampleType}
              onChange={setSampleType}
              options={SAMPLE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <DropdownSelect
              label="重新索樣"
              value={resample}
              onChange={setResample}
              options={resampleOptions}
            />
          </div>

          {/* 備註 */}
          <FloatingInput
            label="備註"
            value={remark}
            onChange={setRemark}
            placeholder="選填備註..."
          />

          {/* 零件清單 */}
          <div>
            <p className="text-[12px] font-semibold text-[#637381] mb-[8px]">索樣零件清單</p>
            <div className="border border-[rgba(145,158,171,0.16)] rounded-[8px] overflow-hidden">
              {/* 表頭 */}
              <div className="grid grid-cols-[1fr_2fr] bg-[#f4f6f8] px-[16px] py-[8px] gap-[16px]">
                <span className="text-[12px] font-semibold text-[#637381]">料號</span>
                <span className="text-[12px] font-semibold text-[#637381]">長規格敘述</span>
              </div>
              {/* 資料列 */}
              <div className="max-h-[200px] overflow-y-auto">
                {selectedParts.map((part, i) => (
                  <div
                    key={part.id}
                    className="grid grid-cols-[1fr_2fr] px-[16px] py-[10px] gap-[16px] border-t border-[rgba(145,158,171,0.08)]"
                    style={{ backgroundColor: i % 2 === 0 ? 'white' : 'rgba(145,158,171,0.02)' }}
                  >
                    <span className="text-[13px] text-[#1c252e] font-medium truncate">
                      {part.material}
                    </span>
                    <span className="text-[13px] text-[#637381] truncate">
                      {part.longDescription}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部送出按鈕 */}
        <div className="shrink-0 px-[50px] py-[20px] border-t border-[rgba(145,158,171,0.12)]">
          {/* 驗證錯誤提示 */}
          {submitted && (!sampleDate || !demandDate) && (
            <p className="text-[12px] text-[#ff5630] mb-[12px]">
              ⚠ 請填寫索樣日期與需求日期
            </p>
          )}
          <div className="flex gap-[12px]">
            <button
              onClick={onClose}
              className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[14px] font-medium text-[#637381] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
              style={{ backgroundColor: '#00559c' }}
            >
              <p className="font-bold text-[14px] text-white">開立索樣單</p>
            </button>
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
}
