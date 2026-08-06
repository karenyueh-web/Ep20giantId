/**
 * AnnouncementCreatePage.tsx — 新增公告頁
 *
 * 版面：
 *   發布單位（下拉）
 *   ─────────────────────────────────────
 *   Post title (中)   |  Post title (EN)
 *   ─────────────────────────────────────
 *   Content (中) RTE  |  Content (EN) RTE
 *   ─────────────────────────────────────
 *   附件區（上傳 + 列表）
 *   ─────────────────────────────────────
 *                         [Cancel] [Post]
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Paperclip, X } from 'lucide-react';
import { DropdownSelect } from './DropdownSelect';
import { RichTextEditor } from './RichTextEditor';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import type { PageType } from './MainLayout';
import {
  loadAnnouncements,
  saveAnnouncements,
  getUnitLabel,
  PUBLISHER_UNIT_OPTIONS,
  type AnnouncementRecord,
  type AnnouncementAttachment,
} from './announcementData';

// ── FloatingInput（對齊 ShippingBasicSettingsPage 規範）───────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  required,
  showError,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  showError?: boolean;
}) {
  const isError = showError && !value;
  const borderColor = isError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor = isError ? '#ff5630' : '#637381';
  const borderRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div
        ref={borderRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: labelColor }}>
          {label}{required && <span style={{ color: '#ff5630' }}> *</span>}
        </p>
      </div>
      <input
        type="text"
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => {
          if (borderRef.current) {
            borderRef.current.style.borderColor = '#1890FF';
            borderRef.current.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)';
          }
        }}
        onBlur={() => {
          if (borderRef.current) {
            borderRef.current.style.borderColor = isError ? '#ff5630' : 'rgba(145,158,171,0.2)';
            borderRef.current.style.boxShadow = '';
          }
        }}
      />
      {isError && (
        <p className="absolute top-full left-[14px] mt-[2px] text-[12px] text-[#ff5630] whitespace-nowrap">此欄位為必填</p>
      )}
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
interface AnnouncementCreatePageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

export function AnnouncementCreatePage({
  currentPage,
  onPageChange,
  onLogout,
  userRole,
}: AnnouncementCreatePageProps) {
  // ── 表單狀態 ─────────────────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null); // null = 新增模式
  const [publisherUnit, setPublisherUnit] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);

  // 編輯模式：挂載時從 localStorage 讀取待編輯公告
  useEffect(() => {
    const id = localStorage.getItem('announcementEditId');
    if (!id) return;
    const all = loadAnnouncements();
    const found = all.find(a => a.id === id);
    if (!found) return;
    setEditId(id);
    setPublisherUnit(found.publisherUnit);
    setTitleZh(found.titleZh);
    setTitleEn(found.titleEn);
    setContentZh(found.contentZh);
    setContentEn(found.contentEn);
    setAttachments(found.attachments);
    // 清除，避免下次進入仍殘留
    localStorage.removeItem('announcementEditId');
  }, []);

  const isEditMode = !!editId;

  // ── 驗證狀態 ─────────────────────────────────────────────────────────────────
  const [submitted, setSubmitted] = useState(false);
  const [fileError, setFileError] = useState('');

  // ── 附件 input ref ────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 允許的附件格式 ────────────────────────────────────────────────────────
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ];
  const ALLOWED_EXTS = ['.pdf', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];

  // ── 附件上傳 ─────────────────────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const invalid = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return !ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXTS.includes(ext);
    });

    if (invalid.length > 0) {
      setFileError(`不支援的格式：${invalid.map(f => f.name).join('、')}。僅允許 PDF、Excel、JPG、PNG`);
      e.target.value = '';
      return;
    }

    setFileError('');
    const newAtts: AnnouncementAttachment[] = files.map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAtts]);
    // reset input so same file can be re-selected
    e.target.value = '';
  }, []);

  const handleDeleteAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // ── 拖曳上傳 ──────────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const invalid = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return !ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXTS.includes(ext);
    });
    if (invalid.length > 0) {
      setFileError(`不支援的格式：${invalid.map(f => f.name).join('、')}。僅允許 PDF、Excel、JPG、PNG`);
      return;
    }
    setFileError('');
    const newAtts: AnnouncementAttachment[] = files.map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAtts]);
  }, []);

  // ── 取消 ─────────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    onPageChange('announcement');
  }, [onPageChange]);

  // ── 發布 ─────────────────────────────────────────────────────────────────────
  const handlePost = useCallback(() => {
    setSubmitted(true);
    // 驗證必填
    if (!publisherUnit || !titleZh || !titleEn) return;

    const currentUserName = localStorage.getItem('currentUserName') ?? '未知使用者';
    const currentUserEmail = localStorage.getItem('currentUserEmail') ?? '';

    const newRecord: AnnouncementRecord = {
      id: `ann-${Date.now()}`,
      publisherUnit,
      publisherName: currentUserName,
      publisherEmail: currentUserEmail,
      publishedAt: new Date().toISOString(),
      titleZh,
      titleEn,
      contentZh: contentZh || '<p></p>',
      contentEn: contentEn || '<p></p>',
      attachments,
      readCount: 0,
    };

    const existing = loadAnnouncements();

    if (isEditMode && editId) {
      // 編輯模式：UPDATE 現有公告（保留 readCount 和 publishedAt）
      const updated = existing.map(a =>
        a.id === editId
          ? { ...a, publisherUnit, titleZh, titleEn,
              contentZh: contentZh || '<p></p>',
              contentEn: contentEn || '<p></p>',
              attachments }
          : a
      );
      saveAnnouncements(updated);
    } else {
      // 新增模式：CREATE
      const newRecord: AnnouncementRecord = {
        id: `ann-${Date.now()}`,
        publisherUnit,
        publisherName: currentUserName,
        publisherEmail: currentUserEmail,
        publishedAt: new Date().toISOString(),
        titleZh,
        titleEn,
        contentZh: contentZh || '<p></p>',
        contentEn: contentEn || '<p></p>',
        attachments,
        readCount: 0,
      };
      saveAnnouncements([newRecord, ...existing]);
    }

    onPageChange('announcement');
  }, [publisherUnit, titleZh, titleEn, contentZh, contentEn, attachments, onPageChange, isEditMode, editId]);

  const unitOptions = PUBLISHER_UNIT_OPTIONS.map(o => ({ value: o.value, label: o.label }));

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title={isEditMode ? '編輯公告' : '新增公告'}
      breadcrumb={isEditMode ? '公佈欄 • 編輯公告' : '公佈欄 • 新增公告'}
    >
      {/* ── 白色卡片 wrapper ── */}
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] overflow-hidden">

        {/* 頁面標題列 */}
        <div className="shrink-0 flex items-center h-[56px] px-[24px] border-b border-[rgba(145,158,171,0.12)]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] leading-[28px] text-[#1c252e]">
            {isEditMode ? '編輯公告' : '新增公告'}
          </p>
        </div>

        {/* 可捲動的表單內容 */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[32px] py-[28px] flex flex-col gap-[24px]">

          {/* 發布單位 */}
          <div>
            <DropdownSelect
              label="發布單位 *"
              value={publisherUnit}
              onChange={setPublisherUnit}
              options={unitOptions}
              error={submitted && !publisherUnit}
            />
            {submitted && !publisherUnit && (
              <p className="mt-[4px] text-[12px] text-[#ff5630] pl-[14px]">此欄位為必填</p>
            )}
          </div>

          {/* Post title (中) / (EN) — 並排 */}
          <div className="flex gap-[20px]">
            <div className="flex-1 min-w-0">
              <FloatingInput
                label="Post title (中)"
                value={titleZh}
                onChange={setTitleZh}
                required
                showError={submitted}
              />
            </div>
            <div className="flex-1 min-w-0">
              <FloatingInput
                label="Post title (EN)"
                value={titleEn}
                onChange={setTitleEn}
                required
                showError={submitted}
              />
            </div>
          </div>

          {/* Content (中) / (EN) RTE — 並排 */}
          <div className="flex gap-[20px]">
            <div className="flex-1 min-w-0">
              <RichTextEditor
                label="Content (中)"
                value={contentZh}
                onChange={setContentZh}
                minHeight={200}
              />
            </div>
            <div className="flex-1 min-w-0">
              <RichTextEditor
                label="Content (EN)"
                value={contentEn}
                onChange={setContentEn}
                minHeight={200}
              />
            </div>
          </div>

          {/* 附件區 */}
          <div className="flex flex-col gap-[8px]">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] text-[#637381] leading-[18px]">
              附件
            </p>

            {/* 已上傳附件列表（產险樣式）*/}
            {attachments.map(att => (
              <div
                key={att.id}
                className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px] border border-[rgba(145,158,171,0.2)] hover:bg-[#f4f6f8] transition-colors group"
              >
                {/* paperclip SVG 跟產险完全相同 */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* 檔名（藍Te底線，有 url 才可下載）*/}
                <a
                  href={att.url || '#'}
                  download={att.name}
                  onClick={e => { if (!att.url) e.preventDefault(); }}
                  className={`flex-1 text-[14px] truncate font-['Public_Sans:Regular',sans-serif] ${att.url ? 'text-[#005eb8] underline cursor-pointer hover:text-[#003d73]' : 'text-[#1c252e]'}`}
                >
                  {att.name}
                </a>
                {/* Delete 按鈕（產险樣式）*/}
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="flex items-center gap-[4px] text-[13px] text-[#ff5630] hover:opacity-70 transition-opacity shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Delete
                </button>
              </div>
            ))}

            {/* 上傳區塊（產险樣式）*/}
            <div
              className="flex flex-col items-center justify-center gap-[6px] border-2 border-dashed border-[rgba(145,158,171,0.32)] rounded-[8px] py-[24px] cursor-pointer hover:border-[#005eb8] hover:bg-[rgba(0,94,184,0.02)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {/* 上傳箭頭 SVG（跟產险完全相同）*/}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#919eab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[13px] text-[#637381]">點擊或拖曳上傳檔案</p>
              <p className="text-[12px] text-[#919eab]">支援格式：PDF、Excel（.xls/.xlsx）、JPG、PNG</p>
            </div>

            {/* 格式錯誤提示 */}
            {fileError && (
              <p className="text-[12px] text-[#ff5630]">{fileError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

        </div>

        {/* ── 底部操作按鈕（固定）── */}
        <div className="shrink-0 flex items-center justify-end gap-[12px] px-[32px] py-[16px] border-t border-[rgba(145,158,171,0.12)]">
          {/* Cancel */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center h-[48px] px-[24px] rounded-[8px] border text-[14px] font-semibold transition-colors"
            style={{ borderColor: 'rgba(145,158,171,0.32)', color: '#637381' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(145,158,171,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>

          {/* Post */}
          <button
            type="button"
            onClick={handlePost}
            className="flex items-center justify-center h-[48px] px-[32px] rounded-[8px] text-[14px] font-semibold text-white transition-colors"
            style={{ backgroundColor: '#00559c' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#004680')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00559c')}
          >
            {isEditMode ? '儲存' : 'Post'}
          </button>
        </div>
      </div>
    </ResponsivePageLayout>
  );
}
