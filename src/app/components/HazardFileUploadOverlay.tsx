import { useState, useRef } from 'react';
import { BaseOverlay } from './BaseOverlay';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FileField = 'thirdParty' | 'selfDecl';
export type HazardFileStatus = 'pending' | 'uploaded' | 'notRequired';

export interface HazardFileOverlayProps {
  onClose: () => void;
  // 資料
  year: number;
  vendor: string;
  regulationCode: string;
  regulationDesc: string;
  // 欄位種類
  field: FileField;
  // 目前狀態
  fileStatus: HazardFileStatus;
  fileName?: string;           // 已上傳時的檔名
  vendorNote?: string;
  giantNote?: string;
  lastEditor?: string;         // 最新編輯者
  lastEditTime?: string;       // 最新編輯時間
  // 角色控制
  isGiant?: boolean;           // 巨大角色 = 任何狀態都可編輯
  rowStatus: 'V' | 'G' | 'CL'; // 整筆資料的狀態
  // 回調
  onSubmit: (data: {
    file?: File | null;
    vendorNote: string;
    giantNote: string;
    action: 'upload' | 'notRequired' | 'submitToGiant' | 'reopen';
  }) => void;
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ file, onFileChange }: {
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center gap-[8px] py-[28px] transition-colors cursor-pointer ${
        isDragOver ? 'border-[#1677ff] bg-[rgba(22,119,255,0.04)]' : 'border-[rgba(145,158,171,0.32)] bg-[#f9fafb]'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
        {file ? file.name : 'Upload file'}
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => onFileChange(e.target.files?.[0] ?? null)}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
    </div>
  );
}

// ─── File Item ────────────────────────────────────────────────────────────────

function UploadedFileItem({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1677ff] underline flex-1 truncate">
        {name}
      </span>
      <button
        onClick={onDelete}
        className="flex items-center gap-[4px] text-[#ff5630] hover:opacity-70 transition-opacity shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px]">Delete</span>
      </button>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'V' | 'G' | 'CL' }) {
  const map = {
    V:  { label: '廠商確認中', bg: '#005eb8', border: '#003d82' },
    G:  { label: '巨大確認中', bg: '#b76e00', border: '#9a5e00' },
    CL: { label: '已結案',     bg: '#118d57', border: '#0a6b3e' },
  };
  const s = map[status];
  return (
    <div
      className="relative h-[24px] min-w-[24px] rounded-[6px] flex items-center px-[8px]"
      style={{ backgroundColor: s.bg }}
    >
      <div className="absolute inset-0 rounded-[6px] border pointer-events-none" style={{ borderColor: s.border }} />
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] text-white whitespace-nowrap">
        {s.label}
      </p>
    </div>
  );
}

// ─── Floating Input ───────────────────────────────────────────────────────────

function FloatingInput({ label, value, onChange, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean;
}) {
  return (
    <div className="relative w-full" style={{ minHeight: '48px' }}>
      <div className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid border-[rgba(145,158,171,0.2)]" />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="text-[12px] font-semibold text-[#637381]">{label}</p>
      </div>
      <input
        className="w-full rounded-[8px] px-[14px] pt-[16px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder="..."
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HazardFileUploadOverlay({
  onClose, year, vendor, regulationCode, regulationDesc,
  field, fileStatus, fileName, vendorNote: initVendorNote = '',
  giantNote: initGiantNote = '', lastEditor, lastEditTime,
  isGiant = false, rowStatus, onSubmit,
}: HazardFileOverlayProps) {
  const [file, setFile]         = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState(fileName ?? null);
  const [vendorNote, setVendorNote] = useState(initVendorNote);
  const [giantNote, setGiantNote]   = useState(initGiantNote);

  const fieldLabel = field === 'thirdParty' ? '第三方檢測報告' : '自我宣告書';

  // 廠商轉交巨大後唯讀；巨大角色任何狀態都可編輯
  const isReadOnly = !isGiant && rowStatus !== 'V';

  // ── 決定標題和模式 ──
  const isNotRequired = fileStatus === 'notRequired';
  const title = isNotRequired
    ? `${fieldLabel}（不須繳交）`
    : existingFile || file
      ? `編輯${fieldLabel}`
      : `上傳${fieldLabel}`;

  return (
    <BaseOverlay onClose={onClose} maxWidth="540px" maxHeight="620px">
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
        <div className="flex flex-col h-full px-[40px] pt-[52px] pb-[32px] gap-[20px] overflow-y-auto custom-scrollbar">

          {/* 標題列 */}
          <div className="flex items-center gap-[10px] flex-wrap">
            <StatusBadge status={rowStatus} />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
              {title}
            </p>
            {lastEditor && (
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919EAB] ml-auto whitespace-nowrap">
                最新編輯者: {lastEditTime} {lastEditor}
              </p>
            )}
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

          {/* 上傳區（唯讀 or 不需繳交時隱藏） */}
          {!isReadOnly && !isNotRequired && (
            <UploadZone file={file} onFileChange={setFile} />
          )}

          {/* 已上傳檔案 */}
          {existingFile && (
            <UploadedFileItem
              name={existingFile}
              onDelete={() => {
                if (!isReadOnly) setExistingFile(null);
              }}
            />
          )}

          {/* 廠商備註 */}
          <FloatingInput
            label="廠商備註"
            value={vendorNote}
            onChange={isGiant || rowStatus === 'V' ? setVendorNote : undefined}
            readOnly={!isGiant && rowStatus !== 'V'}
          />

          {/* 巨大備註 */}
          <FloatingInput
            label="巨大備註"
            value={giantNote}
            onChange={isGiant ? setGiantNote : undefined}
            readOnly={!isGiant}
          />

          {/* 底部按鈕 */}
          <div className="flex gap-[12px] mt-auto pt-[8px]">
            {/* 不需繳交狀態：只有「重新開啟上傳」按鈕 */}
            {isNotRequired ? (
              <button
                onClick={() => onSubmit({ vendorNote, giantNote, action: 'reopen' })}
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
                    onClick={() => onSubmit({ vendorNote, giantNote, action: 'notRequired' })}
                    className="flex-1 h-[40px] rounded-[8px] border border-[rgba(145,158,171,0.32)] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                  >
                    設定不需繳交
                  </button>
                )}
                {/* 轉交巨大 / 儲存 */}
                <button
                  onClick={() => onSubmit({
                    file: file,
                    vendorNote,
                    giantNote,
                    action: isGiant ? 'upload' : 'submitToGiant',
                  })}
                  disabled={!isGiant && !file && !existingFile}
                  className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#00559c' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#004680'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00559c'; }}
                >
                  {isGiant ? '儲存' : '轉交巨大'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
}
