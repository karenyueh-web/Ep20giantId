import { useState } from 'react';
import { BaseOverlay } from './BaseOverlay';

// ─── ReasonInputOverlay ───────────────────────────────────────────────────────
// 通用「輸入原因」彈窗，供退回廠商、取消單據等需要填寫原因的動作使用
// 參考來源：QualityAbnormalDetail.tsx 的 ReasonInputOverlay（品保作業標準）

interface ReasonInputOverlayProps {
  title: string;
  placeholder: string;
  confirmLabel: string;
  /** 確認按鈕背景色，預設深藍 #004680 */
  confirmColor?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function ReasonInputOverlay({
  title,
  placeholder,
  confirmLabel,
  confirmColor = '#004680',
  onConfirm,
  onClose,
}: ReasonInputOverlayProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const isEmpty = reason.trim() === '';

  return (
    <BaseOverlay onClose={onClose} maxWidth="480px" maxHeight="380px">
      {/* 頂部 */}
      <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,171,0,0.08)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFAB00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFAB00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">{title}</p>
        <button onClick={onClose} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* 內容 */}
      <div className="flex-1 px-[20px] py-[16px] flex flex-col gap-[8px]">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">請輸入原因（必填）：</p>
        <textarea
          className={`flex-1 w-full rounded-[8px] border ${
            touched && isEmpty ? 'border-[#FF5630]' : 'border-[rgba(145,158,171,0.3)]'
          } px-[12px] py-[10px] resize-none outline-none font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] placeholder-[#919EAB] focus:border-[#1D7BF5] focus:ring-2 focus:ring-[rgba(29,123,245,0.2)] transition-all`}
          placeholder={placeholder}
          value={reason}
          onChange={e => { setReason(e.target.value); setTouched(true); }}
          style={{ minHeight: 100 }}
        />
        {touched && isEmpty && (
          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#FF5630]">此欄位為必填</p>
        )}
      </div>
      {/* 底部 */}
      <div className="shrink-0 flex justify-end gap-[8px] px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)]">
        <button
          onClick={onClose}
          className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.3)] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
        >
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381]">關閉</span>
        </button>
        <button
          onClick={() => { setTouched(true); if (!isEmpty) onConfirm(reason.trim()); }}
          className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] transition-colors"
          style={{ backgroundColor: confirmColor }}
        >
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white">{confirmLabel}</span>
        </button>
      </div>
    </BaseOverlay>
  );
}
