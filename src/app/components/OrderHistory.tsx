import svgPaths from "@/imports/svg-cj340dtu48";
import type { HistoryEntry } from './OrderStoreContext';

interface OrderHistoryProps {
  onClose: () => void;
  entries?: HistoryEntry[];
  /** 修正單號（歷程表頭顯示用） */
  correctionDocNo?: string;
  /** 單號序號（歷程表頭顯示用） */
  docSeqNo?: string;
  /** 點擊修正單號連結的回調 */
  onCorrectionDocClick?: (docNo: string) => void;
}

// 修正單號格式：12 位數字（YYYYMMDD + 4 位流水號）
const CORRECTION_DOC_RE = /(\d{12})/g;

/** 將文字中的修正單號轉為可點擊藍色連結，其餘保持原樣 */
function renderWithCorrectionLinks(
  text: string,
  onCorrectionDocClick?: (docNo: string) => void,
  baseColor?: string,
) {
  if (!onCorrectionDocClick) return text;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(CORRECTION_DOC_RE);
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const docNo = match[1];
    parts.push(
      <span
        key={`${docNo}-${match.index}`}
        className="text-[#005eb8] underline cursor-pointer hover:opacity-70"
        style={{ color: '#005eb8' }}
        onClick={(e) => { e.stopPropagation(); onCorrectionDocClick(docNo); }}
      >
        {docNo}
      </span>
    );
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? <>{parts}</> : text;
}

export function OrderHistory({ onClose, entries = [], correctionDocNo, docSeqNo, onCorrectionDocClick }: OrderHistoryProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-[16px] shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] w-[1200px] h-[690px] max-w-[90vw] max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* 返回按鈕 */}
        <div className="absolute left-[45px] top-[21px] cursor-pointer" onClick={onClose}>
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path clipRule="evenodd" d={svgPaths.p1310fb97} fill="#1D7BF5" fillRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* 標題 */}
        <div className="absolute left-[45px] top-[66.39px] right-[45px] flex items-baseline gap-[16px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px] shrink-0">
            {correctionDocNo ? '修正歷程' : '訂單歷程'}
          </p>
          {(correctionDocNo || docSeqNo) && (
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px] truncate">
              {correctionDocNo && <span>修正單號：<span className="text-[#1c252e]">{renderWithCorrectionLinks(correctionDocNo, onCorrectionDocClick)}</span></span>}
              {correctionDocNo && docSeqNo && <span className="mx-[8px]">|</span>}
              {docSeqNo && <span>單號序號：<span className="text-[#1c252e]">{docSeqNo}</span></span>}
            </p>
          )}
        </div>

        {/* 灰色背景區域 */}
        <div className="absolute left-[45px] top-[125px] w-[1110px] h-[520px] bg-[#f4f6f8] rounded-[8px] p-[30px]">
          {/* 白色內容區塊 */}
          <div className="bg-white rounded-[8px] w-full h-full overflow-hidden flex flex-col">
            {/* 表頭 */}
            <div className="flex-shrink-0 border-b border-[rgba(145,158,171,0.08)]">
              <div className="flex items-center gap-[20px] px-[16px] py-[16px]">
                <div className="w-[160px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px]">日期</p>
                </div>
                <div className="w-[260px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px]">事項</p>
                </div>
                <div className="w-[150px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px]">操作人員</p>
                </div>
                <div className="flex-1">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px]">備註</p>
                </div>
              </div>
            </div>

            {/* 可滾動內容區域 */}
            <div className="flex-1 overflow-y-auto">
              {entries.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">尚無歷程記錄</p>
                </div>
              ) : (
                entries.map((entry, idx) => {
                  const isLatest = idx === 0;
                  const color = isLatest ? '#005eb8' : '#637381';
                  return (
                    <div key={idx} className="w-full border-b border-[rgba(145,158,171,0.08)]">
                      <div className="flex items-center gap-[20px] px-[16px] py-[16px]">
                        <div className="w-[160px]">
                          <p
                            className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px]"
                            style={{ color }}
                          >
                            {entry.date}
                          </p>
                        </div>
                        <div className="w-[260px]">
                          <p
                            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px]"
                            style={{ color }}
                          >
                            {entry.event}
                          </p>
                        </div>
                        <div className="w-[150px]">
                          <p
                            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px]"
                            style={{ color }}
                          >
                            {entry.operator}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p
                            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px]"
                            style={{ color }}
                          >
                            {entry.remark
                              ? entry.remark.split(/[;；\n]/).map((seg, i, arr) => (
                                  <span key={i}>
                                    {renderWithCorrectionLinks(seg.trim(), onCorrectionDocClick, color)}
                                    {i < arr.length - 1 && <br />}
                                  </span>
                                ))
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}