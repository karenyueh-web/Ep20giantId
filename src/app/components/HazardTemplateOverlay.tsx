import { useState, useRef } from 'react';
import { BaseOverlay } from './BaseOverlay';
import { EditButton, DeleteButton } from './ActionButtons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateItem {
  id: number;
  name: string;      // 範本說明（如 REACH-自我宣告書）
  fileName: string;  // 附件檔名
}

interface HazardTemplateOverlayProps {
  onClose: () => void;
  isGiant?: boolean; // 巨大角色才能新增/編輯/刪除
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TEMPLATES: TemplateItem[] = [
  { id: 1, name: 'REACH-自我宣告書',        fileName: '2025危害物質聲明書-REACH.docx' },
  { id: 2, name: 'RoHS/加州65-自我宣告書',  fileName: 'RoHS/加州65-自我宣告書 2025危害物質聲明書-California 65&RoHS.docx' },
];

// 模擬下載（實際連接上線時替換為真實 URL）
function mockDownload(fileName: string) {
  const blob = new Blob([''], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Upload Zone (small) ──────────────────────────────────────────────────────

function MiniUploadZone({ file, onFileChange }: {
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center gap-[6px] py-[20px] px-[12px] cursor-pointer transition-colors ${
        isDragOver ? 'border-[#1677ff] bg-[rgba(22,119,255,0.04)]' : 'border-[rgba(145,158,171,0.32)] bg-[#f9fafb]'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        e.preventDefault(); setIsDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFileChange(f);
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {file ? (
        <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1677ff] text-center break-all leading-[18px]">
          {file.name}
        </p>
      ) : (
        <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919EAB]">
          點擊或拖曳上傳附件
        </p>
      )}
      <input ref={inputRef} type="file" className="hidden"
        onChange={e => onFileChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}

// ─── Floating Input (mini) ────────────────────────────────────────────────────

function FloatingInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full" style={{ paddingTop: '10px' }}>
      {/* 邊框：從 padding-top 處開始，不超出容器 */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none rounded-[8px] border border-[rgba(145,158,171,0.2)]"
        style={{ top: '10px' }} />
      {/* 浮動 label：垂直置中於邊框頂部 */}
      <div className="absolute flex items-center left-[12px] px-[2px] z-10" style={{ top: '3px' }}>
        <div className="absolute bg-white h-[2px] left-0 right-0" style={{ top: '8px' }} />
        <p className="text-[11px] font-semibold text-[#637381] relative">{label}</p>
      </div>
      <input
        className="w-full rounded-[8px] px-[12px] pt-[12px] pb-[8px] text-[13px] text-[#1c252e] outline-none bg-transparent border-0 leading-[20px]"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="..."
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HazardTemplateOverlay({ onClose, isGiant = false }: HazardTemplateOverlayProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [editTarget, setEditTarget] = useState<TemplateItem | null>(null);

  // 新增表單
  const [newName, setNewName]   = useState('');
  const [newFile, setNewFile]   = useState<File | null>(null);

  // 編輯表單
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);

  const handleAdd = () => {
    if (!newName.trim() || !newFile) return;
    const item: TemplateItem = {
      id: Math.max(0, ...templates.map(t => t.id)) + 1,
      name: newName.trim(),
      fileName: newFile?.name ?? '(尚未上傳)',
    };
    setTemplates(prev => [...prev, item]);
    setNewName(''); setNewFile(null);
  };

  const handleEditOpen = (t: TemplateItem) => {
    setEditTarget(t);
    setEditName(t.name);
    setEditFile(null);
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    setTemplates(prev => prev.map(t =>
      t.id === editTarget.id
        ? { ...t, name: editName, fileName: editFile?.name ?? t.fileName }
        : t
    ));
    setEditTarget(null);
  };

  const handleDelete = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="820px" maxHeight="540px">
      <div className="relative w-full h-full flex gap-0 overflow-hidden rounded-[16px]">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-20 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381" fillRule="evenodd" />
          </svg>
        </button>

        {/* ── 左側：範本列表 ── */}
        <div className="flex-1 flex flex-col px-[40px] pt-[52px] pb-[32px] overflow-y-auto custom-scrollbar">
          {/* 標題 */}
          <div className="flex items-center gap-[8px] mb-[24px]">
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
              宣告書範本
            </p>
          </div>

          {/* 列表 */}
          <div className="flex flex-col gap-[16px]">
            {templates.map((t, i) => (
              <div key={t.id} className="flex items-start gap-[12px]">
                {/* 序號 */}
                <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] shrink-0 w-[16px] text-right mt-[2px]">
                  {i + 1}
                </span>
                {/* 說明 + 檔案（垂直排列） */}
                <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e]">
                    {t.name}
                  </span>
                  {/* 檔案連結 */}
                  <div className="flex items-center gap-[6px]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                        stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span
                      onClick={() => mockDownload(t.fileName)}
                      className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1677ff] underline break-all cursor-pointer hover:text-[#0958d9] transition-colors leading-[18px]">
                      {t.fileName}
                    </span>
                  </div>
                </div>
                {/* 巨大才有編輯/刪除 */}
                {isGiant && (
                  <div className="flex items-center shrink-0">
                    <DeleteButton onClick={() => handleDelete(t.id)} />
                    <EditButton onClick={() => handleEditOpen(t)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右側分隔線 */}
        {isGiant && (
          <div className="w-[1px] bg-[rgba(145,158,171,0.12)] shrink-0 my-[32px]" />
        )}

        {/* ── 右側：新增 / 編輯 表單 ── */}
        {isGiant && (
          <div className="w-[320px] shrink-0 flex flex-col">
            {/* 編輯範本 */}
            {editTarget ? (
              <div className="flex flex-col px-[28px] pt-[52px] pb-[24px] gap-[16px] h-full">
                {/* 關閉編輯 */}
                <button onClick={() => setEditTarget(null)}
                  className="absolute right-[20px] top-[20px] w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors z-10">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">
                  編輯範本
                </p>
                {/* 範本說明（唯讀顯示） */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[12px] font-semibold text-[#637381]">範本說明</p>
                  <p className="text-[14px] text-[#1c252e]">{editTarget.name}</p>
                </div>
                {/* 目前附件 */}
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[12px] font-semibold text-[#637381]">上傳附件</p>
                  <div className="flex items-start gap-[6px]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[1px]">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                        stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span
                      onClick={() => mockDownload(editTarget.fileName)}
                      className="text-[13px] text-[#1677ff] underline break-all leading-[20px] cursor-pointer hover:text-[#0958d9] transition-colors">{editTarget.fileName}</span>
                  </div>
                </div>
                {/* 重新上傳 */}
                <MiniUploadZone file={editFile} onFileChange={setEditFile} />
                {/* 覆蓋提醒 */}
                <p className="text-[11px] text-[#919EAB] leading-[17px]">
                  <span className="font-semibold text-[#ff5630]">請注意：</span>
                  一個宣告書範本只能有一個檔案，上傳新檔後將會直接覆蓋舊檔
                </p>
                {/* 儲存 */}
                <button
                  onClick={handleEditSave}
                  className="w-full h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white mt-auto hover:bg-[#004680] transition-colors"
                  style={{ backgroundColor: '#00559c' }}
                >
                  儲存
                </button>
              </div>
            ) : (
              /* 新增範本 */
              <div className="flex flex-col px-[28px] pt-[52px] pb-[24px] gap-[16px] h-full">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">
                  新增範本
                </p>
                <FloatingInput
                  label="範本說明"
                  value={newName}
                  onChange={setNewName}
                />
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[12px] font-semibold text-[#637381]">上傳附件</p>
                  <MiniUploadZone file={newFile} onFileChange={setNewFile} />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newFile}
                  className="w-full h-[40px] rounded-[8px] flex items-center justify-center font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white mt-auto hover:bg-[#004680] transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#00559c' }}
                >
                  新增
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseOverlay>
  );
}
