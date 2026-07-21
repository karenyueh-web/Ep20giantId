import { useState, useRef } from 'react';
import { BaseOverlay } from './BaseOverlay';
import { OrderHistory } from './OrderHistory';
import type { HistoryEntry } from './OrderStoreContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FileField = 'thirdParty' | 'selfDecl';
export type HazardFileStatus = 'pending' | 'uploaded' | 'notRequired';

export interface HazardFile {
  name: string;        // 檔名
  uploadedAt: string;  // YYYY/MM/DD HH:MM
  uploadedBy?: string; // 上傳者
}

export interface HazardFileOverlayProps {
  onClose: () => void;
  // 資料
  year: number;
  vendor: string;
  regulationCode: string;
  regulationDesc: string;
  // 欄位種類
  field: FileField;
  // 目前狀態（向後相容）
  fileStatus: HazardFileStatus;
  files?: HazardFile[];        // 目前已上傳的檔案清單
  notRequired?: boolean;       // 是否不需繳交
  // 歷程
  history?: HistoryEntry[];
  returnReason?: string;   // 巨大退回原因（如有）
  // 角色控制
  isGiant?: boolean;
  rowStatus: 'V' | 'G' | 'CL';
  // 回調
  onDownload?: (fileName: string) => void;
  onSubmit: (data: {
    files?: File[];
    action: 'upload' | 'notRequired' | 'submitToGiant' | 'reopen' | 'returnToVendor' | 'confirmClose';
    returnReason?: string;
  }) => void;
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFileChange }: {
  onFileChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFileChange(dropped);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center gap-[8px] py-[24px] transition-colors cursor-pointer ${
        isDragOver ? 'border-[#1677ff] bg-[rgba(22,119,255,0.04)]' : 'border-[rgba(145,158,171,0.32)] bg-[#f9fafb]'
      }`}
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
      <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
        點擊或拖曳上傳（可多選）
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => onFileChange(Array.from(e.target.files ?? []))}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
    </div>
  );
}

// ─── File Item ────────────────────────────────────────────────────────────────

function UploadedFileItem({ name, onDelete, onDownload }: {
  name: string;
  onDelete?: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <button
        onClick={onDownload}
        className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1677ff] underline flex-1 truncate text-left hover:text-[#0958d9] transition-colors cursor-pointer"
        title="點擊下載"
      >
        {name}
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-[4px] text-[#ff5630] hover:opacity-70 transition-opacity shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px]">Delete</span>
        </button>
      )}
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
    <div
      className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]"
      style={{ backgroundColor: s.bg }}
    >
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] whitespace-nowrap" style={{ color: s.color }}>
        {s.label}
      </p>
    </div>
  );
}

// ─── Return Reason Dialog ─────────────────────────────────────────────────────

function ReturnReasonDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <BaseOverlay onClose={onCancel} maxWidth="400px" maxHeight="260px">
      <div className="flex flex-col h-full px-[32px] py-[28px] gap-[20px]">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">
          退回廠商
        </p>
        <div className="relative w-full" style={{ minHeight: '48px' }}>
          <div className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)]" />
          <div className="absolute flex items-center left-[14px] px-[2px] top-[-6px] z-10">
            <div className="absolute bg-white h-[10px] left-0 right-0 top-[2px]" />
            <p className="relative text-[12px] font-semibold text-[#637381] whitespace-nowrap">
              退回原因 <span className="text-[#ff5630]">*</span>
            </p>
          </div>
          <input
            autoFocus
            className="w-full rounded-[8px] px-[14px] pt-[16px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="請填寫退回原因..."
          />
        </div>
        <div className="flex gap-[12px] mt-auto">
          <button
            onClick={onCancel}
            className="flex-1 h-[40px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }}
            disabled={!reason.trim()}
            className="flex-1 h-[40px] rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: '#ff5630' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#cc3d1a'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ff5630'; }}
          >
            確認退回
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HazardFileUploadOverlay({
  onClose, year, vendor, regulationCode, regulationDesc,
  field, fileStatus, files: initFiles = [], notRequired: initNotRequired = false,
  history = [],
  returnReason,
  isGiant = false, rowStatus, onDownload, onSubmit,
}: HazardFileOverlayProps) {
  // 目前已上傳的檔案清單（名稱，用於顯示）
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(initFiles.map(f => f.name));
  // 新選取但尚未送出的檔案
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  // 歷程彈窗
  const [showHistory, setShowHistory] = useState(false);
  // 退回廠商 dialog
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const fieldLabel  = field === 'thirdParty' ? '第三方檢測報告' : '自我宣告書';
  const isNotRequired = fileStatus === 'notRequired' || initNotRequired;

  // 角色 / 模式
  const isReadOnly      = !isGiant && rowStatus !== 'V';
  const isGiantReviewing = isGiant && rowStatus === 'G';
  const isCLMode        = rowStatus === 'CL';

  const title = isGiantReviewing
    ? `檢視${fieldLabel}`
    : uploadedFiles.length > 0 || pendingFiles.length > 0
      ? `編輯${fieldLabel}`
      : `上傳${fieldLabel}`;

  const handleAddFiles = (newFiles: File[]) => {
    setPendingFiles(prev => [...prev, ...newFiles]);
  };

  const handleSubmitUpload = () => {
    onSubmit({
      files: pendingFiles,
      action: isGiant ? 'upload' : 'submitToGiant',
    });
  };

  return (
    <>
      <BaseOverlay onClose={onClose} maxWidth="560px" maxHeight="480px">
        <div className="relative w-full h-full flex flex-col">
          {/* 關閉按鈕 */}
          <button
            className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={onClose}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                fill="#637381" fillRule="evenodd" />
            </svg>
          </button>

          {/* 內容 */}
          <div className="flex flex-col h-full px-[40px] pt-[52px] pb-[28px] gap-[16px] overflow-y-auto custom-scrollbar">

            {/* 標題列 */}
            <div className="flex items-center gap-[10px] flex-wrap">
              <StatusBadge status={rowStatus} />
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
                {title}
              </p>
              {/* 歷程連結（藍色底線，對齊系統規格） */}
              <p
                onClick={() => setShowHistory(true)}
                className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73] ml-auto whitespace-nowrap"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                歷程
              </p>

            </div>

            {/* 副標題：年度 · 廠商 · 法規 */}
            <div className="flex flex-col gap-[2px]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                {year} · {vendor}
              </p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">
                {regulationCode} · {regulationDesc}
              </p>
            </div>

            {/* 退回原因提示（廠商视角且有被退回時） */}
            {!isGiant && rowStatus === 'V' && returnReason && (
              <div className="flex items-start gap-[10px] rounded-[10px] border border-[rgba(255,171,0,0.35)] bg-[rgba(255,171,0,0.08)] px-[14px] py-[12px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[1px]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#B76E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="#B76E00" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="#B76E00" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="flex flex-col gap-[2px]">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#B76E00]">
                    巨大退回原因
                  </p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#B76E00] leading-[20px]">
                    {returnReason}
                  </p>
                </div>
              </div>
            )}

            {/* 檔案區域 */}
            {isNotRequired ? (
              /* 不需繳交提示卡 */
              <div className="flex items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-[rgba(145,158,171,0.4)] bg-[rgba(145,158,171,0.04)] h-[80px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#919EAB" strokeWidth="1.5"/>
                  <path d="M12 8v4m0 4h.01" stroke="#919EAB" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-[#919EAB]">
                  此項目已設定為不需繳交
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {/* 已上傳檔案列表 */}
                {uploadedFiles.map((name, idx) => (
                  <UploadedFileItem
                    key={`existing-${idx}`}
                    name={name}
                    onDownload={() => onDownload?.(name)}
                    onDelete={isGiantReviewing || isCLMode ? undefined : () =>
                      setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
                    }
                  />
                ))}
                {/* 新增待上傳檔案（尚未送出） */}
                {pendingFiles.map((f, idx) => (
                  <UploadedFileItem
                    key={`pending-${idx}`}
                    name={`${f.name} （待上傳）`}
                    onDelete={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                  />
                ))}
                {/* UploadZone：非唯讀、非巨大檢視、非 CL 時常駐 */}
                {!isReadOnly && !isGiantReviewing && !isCLMode && (
                  <UploadZone onFileChange={handleAddFiles} />
                )}
              </div>
            )}

            {/* 底部按鈕 */}
            <div className="flex gap-[12px] mt-auto pt-[8px]">
              {/* CL 狀態：巨大可重新開啟 */}
              {isCLMode ? (
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
                /* G 狀態 + 巨大角色：退回廠商 + 確認結案 */
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
                /* V 狀態 / 廠商 or 巨大編輯模式 */
                isNotRequired ? (
                  <button
                    onClick={() => onSubmit({ action: 'reopen' })}
                    disabled={isReadOnly && !isGiant}
                    className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors disabled:opacity-40"
                    style={{ backgroundColor: '#ff5630' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#cc3d1a'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ff5630'; }}
                  >
                    重新開啟上傳
                  </button>
                ) : (
                  <>
                    {/* 設定不需繳交 */}
                    {(rowStatus === 'V' || isGiant) && (
                      <button
                        onClick={() => onSubmit({ action: 'notRequired' })}
                        className="flex-1 h-[40px] rounded-[8px] border border-[rgba(145,158,171,0.32)] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                      >
                        設定不需繳交
                      </button>
                    )}
                    {/* 轉交巨大 / 儲存 */}
                    <button
                      onClick={handleSubmitUpload}
                      disabled={!isGiant && pendingFiles.length === 0 && uploadedFiles.length === 0}
                      className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors disabled:opacity-40"
                      style={{ backgroundColor: '#00559c' }}
                      onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#004680'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00559c'; }}
                    >
                      {isGiant ? '儲存' : '轉交巨大'}
                    </button>
                  </>
                )
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
          titleLabel={`${fieldLabel}歷程`}
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
