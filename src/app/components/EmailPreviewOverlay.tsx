import { BaseOverlay } from './BaseOverlay';
import type { EmailPayload } from './sampleOrderEmail';

interface EmailPreviewOverlayProps {
  email: EmailPayload;
  onClose: () => void;
}

const EMAIL_NO_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: '信一', color: '#00559c' },
  2: { label: '信二', color: '#118d57' },
  3: { label: '信三', color: '#b76e00' },
  4: { label: '信四', color: '#0065a9' },
};

export function EmailPreviewOverlay({ email, onClose }: EmailPreviewOverlayProps) {
  const tag = EMAIL_NO_LABEL[email.emailNo] ?? { label: `信${email.emailNo}`, color: '#637381' };

  return (
    <BaseOverlay onClose={onClose} maxWidth="720px" maxHeight="90vh">
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

        {/* Header */}
        <div className="shrink-0 flex items-center gap-[12px] px-[50px] pt-[48px] pb-[16px] border-b border-[rgba(145,158,171,0.12)]">
          {/* 信件編號 TAG */}
          <div
            className="flex items-center justify-center h-[32px] px-[12px] rounded-[6px] shrink-0"
            style={{ backgroundColor: tag.color }}
          >
            <span className="text-white text-[13px] font-semibold leading-none">{tag.label}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[16px] text-[#1c252e] leading-[24px] truncate">
              通知信預覽
            </p>
            <p className="text-[12px] text-[#637381] leading-[18px] mt-[2px]">
              {email.trigger}
            </p>
          </div>
        </div>

        {/* 寄件資訊摘要 */}
        <div className="shrink-0 px-[50px] py-[16px] bg-[#f9fafb] border-b border-[rgba(145,158,171,0.12)]">
          <div className="flex flex-col gap-[6px]">
            <MetaRow label="寄件人（From）" value="noreply@ep.giant-bicycles.com" />
            <MetaRow
              label="收件人（To）"
              value={
                email.recipientType === '廠商業務'
                  ? `廠商業務帳號（role='業務' AND status='active'）`
                  : `開立人員 AD 帳號（${email.recipientQuery}）`
              }
              highlight
            />
            <MetaRow label="主旨（中）" value={email.subjectZh} />
            <MetaRow label="主旨（英）" value={email.subjectEn} />
          </div>
        </div>

        {/* 信件內容 iframe 預覽 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-[50px] py-[24px] custom-scrollbar">
          <p className="text-[11px] text-[#919eab] uppercase tracking-wider mb-[12px]">信件內容預覽</p>
          <div
            className="border border-[rgba(145,158,171,0.2)] rounded-[8px] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-[50px] py-[16px] border-t border-[rgba(145,158,171,0.12)]">
          <p className="text-[12px] text-[#919eab]">
            ✉ Mock 預覽模式：實際寄信由後端 EP 系統統一帳號執行
          </p>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] hover:bg-[#004680] transition-colors"
            style={{ backgroundColor: '#00559c' }}
          >
            <span className="font-bold text-[14px] text-white leading-none">關閉</span>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ── 輔助元件 ─────────────────────────────────────────────────────────────────

function MetaRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-[8px]">
      <span className="shrink-0 text-[12px] text-[#919eab] w-[120px] leading-[20px]">{label}</span>
      <span className={`text-[13px] leading-[20px] flex-1 ${highlight ? 'text-[#1c252e] font-medium' : 'text-[#637381]'}`}>
        {value}
      </span>
    </div>
  );
}
