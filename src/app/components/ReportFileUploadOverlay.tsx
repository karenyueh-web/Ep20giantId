import { useState, useRef } from 'react';
import { BaseOverlay } from './BaseOverlay';
import { OrderHistory } from './OrderHistory';
import type { HistoryEntry } from './OrderStoreContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportFile {
  name: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface ReportFileOverlayProps {
  onClose: () => void;
  vendor: string;
  shipmentNo: string;       // SAP交貨單（保留供內部用）
  vendorShipNo?: string;    // 廠商出貨單（顯示於明細）
  partNo: string;
  shipDate: string;
  reportType: string;
  files: ReportFile[];
  rowStatus: 'V' | 'G' | 'CL';
  isGiant?: boolean;
  history?: HistoryEntry[];
  returnReason?: string;
  onSubmit: (data: {
    files?: File[];
    action: 'submitToGiant' | 'returnToVendor' | 'confirmClose' | 'reopen';
    returnReason?: string;
  }) => void;
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFileChange }: { onFileChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFileChange(dropped);
  };
  return (
    <div
      className={`border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center gap-[8px] py-[24px] transition-colors cursor-pointer ${isDragOver ? 'border-[#1677ff] bg-[rgba(22,119,255,0.04)]' : 'border-[rgba(145,158,171,0.32)] bg-[#f9fafb]'}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">點擊或拖曳上傳（可多選）</p>
      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={e => onFileChange(Array.from(e.target.files ?? []))}
        accept=".pdf,.doc,.docx,.xls,.xlsx" />
    </div>
  );
}

// ─── File Items ───────────────────────────────────────────────────────────────

function UploadedFileItem({ name, onDelete, onDownload }: {
  name: string; onDelete?: () => void; onDownload?: () => void;
}) {
  return (
    <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <button onClick={onDownload}
        className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1677ff] underline flex-1 truncate text-left hover:text-[#0958d9] transition-colors cursor-pointer"
        title="點擊下載">
        {name}
      </button>
      {onDelete && (
        <button onClick={onDelete} className="flex items-center gap-[4px] text-[#ff5630] hover:opacity-70 transition-opacity shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px]">Delete</span>
        </button>
      )}
    </div>
  );
}

function PendingFileItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] border border-dashed border-[#1677ff] bg-[rgba(22,119,255,0.04)]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#1677ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke="#1677ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="#1677ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p className="flex-1 font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] truncate min-w-0">{file.name}</p>
      <button onClick={onRemove} className="shrink-0 flex items-center justify-center w-[24px] h-[24px] rounded-full hover:bg-[rgba(255,86,48,0.08)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'V' | 'G' | 'CL' }) {
  const map = {
    V:  { label: '廠商確認中', bg: 'rgba(0,184,217,0.16)',  color: '#006c9c' },
    G:  { label: '巨大確認中', bg: 'rgba(255,171,0,0.16)',  color: '#B76E00' },
    CL: { label: '已結案',     bg: 'rgba(34,197,94,0.16)',  color: '#118D57' },
  };
  const s = map[status];
  return (
    <div className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]" style={{ backgroundColor: s.bg }}>
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] whitespace-nowrap" style={{ color: s.color }}>
        {s.label}
      </p>
    </div>
  );
}

// ─── Return Reason Dialog ─────────────────────────────────────────────────────

function ReturnReasonDialog({ onCancel, onConfirm }: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <BaseOverlay onClose={onCancel} maxWidth="400px" maxHeight="260px">
      <div className="flex flex-col h-full px-[32px] py-[28px] gap-[20px]">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">退回廠商</p>
        <div className="relative w-full" style={{ minHeight: '48px' }}>
          <div className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)]" />
          <div className="absolute flex items-center left-[14px] px-[2px] top-[-6px] z-10">
            <div className="absolute bg-white h-[10px] left-0 right-0 top-[2px]" />
            <p className="relative text-[12px] font-semibold text-[#637381] whitespace-nowrap">退回原因 <span className="text-[#ff5630]">*</span></p>
          </div>
          <input autoFocus
            className="w-full rounded-[8px] px-[14px] pt-[16px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
            value={reason} onChange={e => setReason(e.target.value)} placeholder="請填寫退回原因..." />
        </div>
        <div className="flex gap-[12px] mt-auto">
          <button onClick={onCancel}
            className="flex-1 h-[40px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors">
            取消
          </button>
          <button onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }}
            disabled={!reason.trim()}
            className="flex-1 h-[40px] rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: '#ff5630' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#cc3d1a'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ff5630'; }}>
            確認退回
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReportFileUploadOverlay({
  onClose, vendor, shipmentNo, vendorShipNo, partNo, shipDate, reportType,
  files: initFiles = [], rowStatus, isGiant = false,
  history = [], returnReason, onSubmit,
}: ReportFileOverlayProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(initFiles.map(f => f.name));
  const [pendingFiles, setPendingFiles]   = useState<File[]>([]);
  const [showHistory, setShowHistory]     = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const isReadOnly       = !isGiant && rowStatus !== 'V';
  const isGiantReviewing = isGiant && rowStatus === 'G';
  const isCLMode         = rowStatus === 'CL';
  const hasFiles         = uploadedFiles.length > 0 || pendingFiles.length > 0;

  const handleAddFiles      = (newFiles: File[]) => setPendingFiles(prev => [...prev, ...newFiles]);
  const handleSubmitToGiant = () => onSubmit({ files: pendingFiles.length > 0 ? pendingFiles : undefined, action: 'submitToGiant' });

  return (
    <>
      <BaseOverlay onClose={onClose} maxWidth="560px" maxHeight="520px">
        <div className="relative w-full h-full flex flex-col">
          {/* 關閉按鈕 */}
          <button className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                fill="#637381" fillRule="evenodd" />
            </svg>
          </button>

          {/* 內容區（單一 scroll 區塊，與危害物質 Overlay 結構一致） */}
          <div className="flex flex-col h-full px-[40px] pt-[52px] pb-[28px] gap-[16px] overflow-y-auto custom-scrollbar">

            {/* 標題列：狀態 badge + 報告種類 + 歷程連結 */}
            <div className="flex items-center gap-[10px] flex-wrap">
              <StatusBadge status={rowStatus} />
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
                {reportType}
              </p>
              <p
                onClick={() => setShowHistory(true)}
                className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73] ml-auto whitespace-nowrap"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                歷程
              </p>
            </div>

            {/* 副標題：標注欄位名稱 + 內容 */}
            <div className="flex flex-col gap-[4px]">
              <div className="flex items-baseline gap-[8px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] w-[72px] shrink-0">廠商</p>
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{vendor}</p>
              </div>
              <div className="flex items-baseline gap-[8px]">
                <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] w-[72px] shrink-0">料號</p>
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{partNo}</p>
              </div>
              {vendorShipNo && (
                <div className="flex items-baseline gap-[8px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] w-[72px] shrink-0">廠商出貨單</p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{vendorShipNo}</p>
                </div>
              )}
            </div>

            {/* 退回原因提示（廠商視角且有被退回時） */}
            {!isGiant && rowStatus === 'V' && returnReason && (
              <div className="flex items-start gap-[10px] rounded-[10px] border border-[rgba(255,171,0,0.35)] bg-[rgba(255,171,0,0.08)] px-[14px] py-[12px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[1px]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#B76E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="#B76E00" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="#B76E00" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="flex flex-col gap-[2px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#B76E00]">巨大退回原因</p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#B76E00] leading-[20px]">{returnReason}</p>
                </div>
              </div>
            )}

            {/* 檔案區域 */}
            <div className="flex flex-col gap-[8px]">
              {uploadedFiles.map((name, idx) => (
                <UploadedFileItem
                  key={`existing-${idx}`}
                  name={name}
                  onDelete={isGiantReviewing || isCLMode ? undefined : () =>
                    setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
                  }
                />
              ))}
              {pendingFiles.map((f, idx) => (
                <PendingFileItem
                  key={`pending-${idx}`}
                  file={f}
                  onRemove={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                />
              ))}
              {!isReadOnly && !isGiantReviewing && !isCLMode && (
                <UploadZone onFileChange={handleAddFiles} />
              )}
              {!hasFiles && (isReadOnly || isGiantReviewing || isCLMode) && (
                <div className="flex items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-[rgba(145,158,171,0.4)] bg-[rgba(145,158,171,0.04)] h-[80px]">
                  <p className="font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-[#919EAB]">尚無上傳檔案</p>
                </div>
              )}
            </div>

            {/* 底部按鈕 */}
            <div className="flex gap-[12px] mt-auto pt-[8px]">
              {isCLMode ? (
                // CL：巨大可重新開啟
                isGiant ? (
                  <button
                    onClick={() => onSubmit({ action: 'reopen' })}
                    className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors"
                    style={{ backgroundColor: '#ff5630' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#cc3d1a'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ff5630'; }}
                  >
                    重新開啟上傳
                  </button>
                ) : null
              ) : isGiantReviewing ? (
                <>
                  <button
                    onClick={() => setShowReturnDialog(true)}
                    className="flex-1 h-[40px] rounded-[8px] border border-[rgba(145,158,171,0.32)] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  >
                    退回廠商
                  </button>
                  <button
                    onClick={() => onSubmit({ action: 'confirmClose' })}
                    className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors"
                    style={{ backgroundColor: '#00559c' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#004680'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00559c'; }}
                  >
                    已確認
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubmitToGiant}
                  disabled={!isGiant && pendingFiles.length === 0 && uploadedFiles.length === 0}
                  className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#00559c' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#004680'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00559c'; }}
                >
                  {isGiant ? '儲存' : '轉交巨大'}
                </button>
              )}
            </div>

          </div>
        </div>
      </BaseOverlay>

      {/* 歷程彈窗 */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          entries={history}
          titleLabel={`${reportType}歷程`}
        />
      )}

      {/* 退回廠商原因 Dialog */}
      {showReturnDialog && (
        <ReturnReasonDialog
          onCancel={() => setShowReturnDialog(false)}
          onConfirm={reason => {
            setShowReturnDialog(false);
            onSubmit({ action: 'returnToVendor', returnReason: reason });
          }}
        />
      )}
    </>
  );
}
