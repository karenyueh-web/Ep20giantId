/**
 * AnnouncementPage.tsx — 公佈欄列表首頁
 *
 * 版面：
 *   全寬 TAB
 *   全寬 搜尋列
 *   全寬 results count + [新增公告] [全部已讀]
 *   ─────────────────────────────────────────
 *   左側 40% 卡片列表 | 右側 60% 預覽面板
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Eye, Paperclip, Download, Pencil, Trash2 } from 'lucide-react';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import { BaseOverlay } from './BaseOverlay';
import type { PageType } from './MainLayout';
import { useActionPermission } from '@/app/hooks/useActionPermission';
import {
  loadAnnouncements,
  saveAnnouncements,
  loadReadIds,
  saveReadIds,
  getUnitLabel,
  PUBLISHER_UNIT_OPTIONS,
  type AnnouncementRecord,
} from './announcementData';

// ── 工具：HTML → 純文字（卡片預覽用）──────────────────────────────────────────
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent ?? tmp.innerText ?? '';
}

// ── 工具：格式化日期時間顯示（YYYY/MM/DD HH:mm，與專案其他頁面一致）──────────
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const hh   = String(d.getHours()).padStart(2, '0');
    const min  = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  } catch {
    return iso;
  }
}

// ── 已讀圓點 ──────────────────────────────────────────────────────────────────
function ReadDot({ isRead }: { isRead: boolean }) {
  return (
    <span
      className="shrink-0 w-[8px] h-[8px] rounded-full inline-block mt-[7px]"
      style={{ backgroundColor: isRead ? '#22c55e' : '#ff5630' }}
    />
  );
}

// ── 發布單位標籤 ───────────────────────────────────────────────────────────────
function UnitBadge({ unit }: { unit: string }) {
  const label = getUnitLabel(unit);
  return (
    <span
      className="inline-flex items-center h-[22px] px-[8px] rounded-[6px] text-[12px] font-semibold whitespace-nowrap leading-none shrink-0"
      style={{ backgroundColor: 'rgba(0,94,184,0.12)', color: '#005eb8' }}
    >
      {label}
    </span>
  );
}

// ── 關鍵字黃底標示 ────────────────────────────────────────────────────────────
function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const splitRe = new RegExp(`(${escaped})`, 'gi');
  const matchRe = new RegExp(`^${escaped}$`, 'i');
  const parts = text.split(splitRe);
  return (
    <>
      {parts.map((part, i) =>
        matchRe.test(part) ? (
          <mark
            key={i}
            style={{
              backgroundColor: '#ffe566',
              color: 'inherit',
              borderRadius: '2px',
              padding: '0 1px',
            }}
          >
            {part}
          </mark>
        ) : part
      )}
    </>
  );
}

// ── 左側公告卡片 ───────────────────────────────────────────────────────────────
interface AnnouncementCardProps {
  record: AnnouncementRecord;
  isRead: boolean;
  isSelected: boolean;
  keyword: string;
  onClick: () => void;
}

function AnnouncementCard({ record, isRead, isSelected, keyword, onClick }: AnnouncementCardProps) {
  const preview = useMemo(() => stripHtml(record.contentZh), [record.contentZh]);

  return (
    <div
      onClick={onClick}
      className="flex flex-row gap-[10px] p-[16px] cursor-pointer transition-all rounded-[12px] bg-white"
      style={{
        boxShadow: isSelected
          ? '0px 0px 0px 2px #005eb8, 0px 4px 12px rgba(0,94,184,0.12)'
          : '0px 1px 3px rgba(145,158,171,0.2), 0px 0px 2px rgba(145,158,171,0.12)',
      }}
    >
      {/* 已讀圓點 */}
      <ReadDot isRead={isRead} />

      {/* 卡片主體 */}
      <div className="flex flex-col gap-[6px] flex-1 min-w-0">
        {/* 上方：單位標籤 + 時間 + 閱讀數 */}
        <div className="flex items-center gap-[8px] flex-wrap">
          <UnitBadge unit={record.publisherUnit} />
          <span className="text-[#637381] text-[12px] leading-[18px] whitespace-nowrap">
            {formatDateTime(record.publishedAt)}
          </span>
          <span className="flex items-center gap-[3px] text-[#637381] text-[12px] leading-[18px] ml-auto shrink-0">
            <Eye size={13} strokeWidth={2} />
            {record.readCount}
          </span>
        </div>

        {/* 標題 */}
        <p
          className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] leading-[20px] text-[#1c252e] truncate"
        >
          <Highlight text={record.titleZh} keyword={keyword} />
        </p>

        {/* 內文預覽（最多 2 行） */}
        <p
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[13px] leading-[19px] text-[#637381] overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          <Highlight text={preview} keyword={keyword} />
        </p>
      </div>
    </div>
  );
}

// ── 右側預覽面板 ───────────────────────────────────────────────────────────────
interface PreviewPanelProps {
  record: AnnouncementRecord | null;
  isRead: boolean;
  canModify?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PreviewPanel({ record, isRead, canModify, onEdit, onDelete }: PreviewPanelProps) {
  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#919eab] text-[14px]">請選擇公告</p>
      </div>
    );
  }

  // ── 下載全部附件 ──────────────────────────────────────────────────────────
  const handleDownloadAll = () => {
    record.attachments.forEach(att => {
      if (!att.url) return;
      const a = document.createElement('a');
      a.href = att.url;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-[24px] py-[20px] gap-[14px]">

      {/* 第一行：單位標籤（左）時間/發布人/閱讀數/下載全部 icon（右）*/}
      <div className="flex items-center justify-between gap-[12px] shrink-0">
        <UnitBadge unit={record.publisherUnit} />
        <div className="flex items-center gap-[10px] shrink-0">
          <span className="text-[#637381] text-[13px] whitespace-nowrap">
            {formatDateTime(record.publishedAt)}
          </span>
          <span className="text-[#637381] text-[13px] whitespace-nowrap">
            {record.publisherName}
          </span>
          <span className="flex items-center gap-[3px] text-[#637381] text-[13px]">
            <Eye size={13} strokeWidth={2} />
            {record.readCount}
          </span>
          {/* 下載全部 icon（僅有附件時顯示）*/}
          {record.attachments.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              title="下載全部附件"
              className="flex items-center justify-center w-[32px] h-[32px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[#637381] transition-colors shrink-0"
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(145,158,171,0.08)';
                e.currentTarget.style.borderColor = '#637381';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(145,158,171,0.32)';
              }}
            >
              <Download size={15} strokeWidth={2} />
            </button>
          )}
          {/* 編輯 / 刪除（權限符合時顯示）*/}
          {canModify && (
            <>
              <button
                type="button"
                onClick={onEdit}
                title="編輯公告"
                className="flex items-center justify-center w-[32px] h-[32px] rounded-[8px] transition-colors text-[#005eb8] shrink-0"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,94,184,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Pencil size={15} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="刪除公告"
                className="flex items-center justify-center w-[32px] h-[32px] rounded-[8px] transition-colors text-[#ff5630] shrink-0"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,86,48,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Trash2 size={15} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 標題 */}
      <h2 className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[20px] leading-[28px] text-[#1c252e] shrink-0">
        {record.titleZh}
      </h2>

      {/* 附件：小卡片，只顯示檔名（無個別下載按鈕）*/}
      {record.attachments.length > 0 && (
        <div className="flex flex-col gap-[8px] shrink-0">
          {record.attachments.map(att => (
            <div
              key={att.id}
              className="flex items-center gap-[10px] px-[14px] h-[48px] rounded-[8px] border border-[rgba(145,158,171,0.2)] bg-white shrink-0"
            >
              <Paperclip size={15} strokeWidth={2} className="text-[#637381] shrink-0" />
              <span className="flex-1 text-[13px] text-[#1c252e] truncate min-w-0">
                {att.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 內文：無分隔線，直接接在附件下方 */}
      <div
        className="announcement-content"
        dangerouslySetInnerHTML={{ __html: record.contentZh }}
      />



      {/* prose 樣式 */}
      <style>{`
        .announcement-content {
          font-family: 'Public Sans', 'Noto Sans JP', sans-serif;
          font-size: 14px;
          line-height: 1.75;
          color: #1c252e;
        }
        .announcement-content p { margin: 0 0 10px 0; }
        .announcement-content p:last-child { margin-bottom: 0; }
        .announcement-content strong { font-weight: 700; }
        .announcement-content em { font-style: italic; }
        .announcement-content s { text-decoration: line-through; }
        .announcement-content ul { list-style: disc; padding-left: 20px; margin: 0 0 10px 0; }
        .announcement-content ol { list-style: decimal; padding-left: 20px; margin: 0 0 10px 0; }
        .announcement-content li { margin-bottom: 4px; }
      `}</style>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
interface AnnouncementPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

type TabType = 'all' | 'unread';

export function AnnouncementPage({
  currentPage,
  onPageChange,
  onLogout,
  userRole,
}: AnnouncementPageProps) {
  const currentUserType = localStorage.getItem('currentUserType') ?? 'vendor';
  const isGiant = currentUserType === 'giant';

  // ── 資料狀態 ────────────────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(() => {
    const stored = loadAnnouncements();
    // 依 publishedAt 降冪排序
    return [...stored].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  });

  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());

  // ── 搜尋 / 篩選狀態 ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [keyword, setKeyword] = useState('');
  const [unitFilter, setUnitFilter] = useState('');

  // ── 選中公告 ────────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string>(announcements[0]?.id ?? '');

  // ── 過濾後的公告 ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = announcements;

    if (activeTab === 'unread') {
      list = list.filter(a => !readIds.has(a.id));
    }
    if (unitFilter) {
      list = list.filter(a => a.publisherUnit === unitFilter);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(
        a =>
          a.titleZh.toLowerCase().includes(kw) ||
          a.titleEn.toLowerCase().includes(kw) ||
          stripHtml(a.contentZh).toLowerCase().includes(kw) ||
          stripHtml(a.contentEn).toLowerCase().includes(kw),
      );
    }
    return list;
  }, [announcements, activeTab, unitFilter, keyword, readIds]);

  // 若 filtered 改變，確保 selectedId 有效
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find(a => a.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  // ── 點擊卡片：標記已讀 + 閱覽數（同帳號只計一次）────────────────────────────
  const handleCardClick = useCallback((id: string) => {
    setSelectedId(id);
    setReadIds(prev => {
      // 已讀過：不重複累加閱覽數，直接返回
      if (prev.has(id)) return prev;

      // ── 首次閱覽：readCount + 1 ──────────────────────────────────────────────
      // 邏輯：同一帳號（readIds 中無此 id）才觸發，重複點擊不累加
      // 後端對接時：呼叫 PATCH /api/announcements/{id}/read
      //   → 後端以 user_id + announcement_id 做 unique constraint
      //   → 確保同帳號多次呼叫只計一次，回傳最新 readCount
      setAnnouncements(prevList => {
        const updated = prevList.map(a =>
          a.id === id ? { ...a, readCount: a.readCount + 1 } : a
        );
        saveAnnouncements(updated);
        return updated;
      });

      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      // 通知 NavigationList 更新未讀徽章
      window.dispatchEvent(new Event('announcementReadUpdated'));
      return next;
    });
  }, []);

  // ── 全部已讀 ────────────────────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      filtered.forEach(a => next.add(a.id));
      saveReadIds(next);
      // 通知 NavigationList 更新未讀徽章
      window.dispatchEvent(new Event('announcementReadUpdated'));
      return next;
    });
  }, [filtered]);

  // ── 選中公告物件 ─────────────────────────────────────────────────────────────
  const selectedRecord = useMemo(
    () => filtered.find(a => a.id === selectedId) ?? announcements.find(a => a.id === selectedId) ?? null,
    [filtered, selectedId, announcements],
  );

  // ── 下拉選單選項 ─────────────────────────────────────────────────────────────
  const unitOptions = useMemo(() => [
    { value: '', label: '全部' },
    ...PUBLISHER_UNIT_OPTIONS.map(o => ({ value: o.value, label: o.label })),
  ], []);

  // ── unread 計數 ──────────────────────────────────────────────────────────────
  const unreadCount = useMemo(
    () => announcements.filter(a => !readIds.has(a.id)).length,
    [announcements, readIds],
  );

  // ── Action 權限：公佈欄 ───────────────────────────────────────────────────────────
  const { can } = useActionPermission(userRole, 'overview-announcement');

  // ── 編輯 / 刪除權限判斷 ──────────────────────────────────────────────────────
  const currentUserEmail = localStorage.getItem('currentUserEmail') ?? '';
  const currentUserName  = localStorage.getItem('currentUserName')  ?? '';
  // 最高管理層：後端對接時改為 API 權限判斷
  const isSuperAdmin = localStorage.getItem('currentUserPermission') === 'admin';
  const canModifyRecord = useCallback((record: AnnouncementRecord | null, mode: 'edit' | 'delete' = 'edit'): boolean => {
    if (!record) return false;
    if (!isGiant) return false; // 只有巨大帳號有操作權
    if (!can(mode)) return false;             // Action 權限檢查
    if (record.publisherEmail === currentUserEmail) return true; // 自己發的
    if (record.publisherName  === currentUserName)  return true; // 語名同步判斷
    if (isSuperAdmin) return true;                               // 最高管理層
    return false;
  }, [isGiant, currentUserEmail, currentUserName, isSuperAdmin, can]);

  // ── 刪除確認狀態 ──────────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirmId) return;
    setAnnouncements(prev => {
      const next = prev.filter(a => a.id !== deleteConfirmId);
      saveAnnouncements(next);
      return next;
    });
    // 移除已讀記錄
    setReadIds(prev => {
      const next = new Set(prev);
      next.delete(deleteConfirmId);
      saveReadIds(next);
      return next;
    });
    // 選到下一筆
    setSelectedId(prev => {
      if (prev === deleteConfirmId) {
        const remaining = announcements.filter(a => a.id !== deleteConfirmId);
        return remaining[0]?.id ?? '';
      }
      return prev;
    });
    window.dispatchEvent(new Event('announcementReadUpdated'));
    setDeleteConfirmId(null);
  }, [deleteConfirmId, announcements]);

  // ── 編輯：寫入 localStorage 再跳頁 ─────────────────────────────────────────
  const handleEditClick = useCallback((id: string) => {
    localStorage.setItem('announcementEditId', id);
    onPageChange('announcement-create');
  }, [onPageChange]);

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="公佈欄"
      breadcrumb="公佈欄"
    >
      {/* ── 白色卡片 wrapper ── */}
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] overflow-hidden">

        {/* ── A. TAB（全寬）── */}
        <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[20px] relative shrink-0 w-full">
          {/* 底部灰色底線 */}
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />

          {(['all', 'unread'] as TabType[]).map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
            >
              {activeTab === tab && (
                <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              )}
              <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === tab ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
                {tab === 'all' ? 'All' : 'unread'}
              </p>
              {tab === 'unread' && unreadCount > 0 && (
                <div className="bg-[rgba(255,86,48,0.16)] h-[24px] min-w-[24px] px-[6px] rounded-[6px] flex items-center justify-center">
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[#b71d18] text-[12px] text-center">{unreadCount}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── B. 搜尋列（全寬）── */}
        <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
          <div className="flex-1 min-w-0">
            <SearchField
              label="內文關鍵字"
              value={keyword}
              onChange={setKeyword}
            />
          </div>
          <div className="flex-1 min-w-0">
            <DropdownSelect
              label="發布單位"
              value={unitFilter}
              onChange={setUnitFilter}
              options={unitOptions}
            />
          </div>
        </div>

        {/* ── C. results count + 操作按鈕（全寬）── */}
        <div className="shrink-0 flex items-center px-[20px] pb-[12px] gap-[12px]">
          <span className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] flex-1">
            {filtered.length} results found
          </span>

          {/* 全部已讀 */}
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] border text-[14px] font-semibold transition-colors"
            style={{
              borderColor: 'rgba(145,158,171,0.32)',
              color: '#637381',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(145,158,171,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            全部已讀
          </button>

          {/* 新增公告（僅巨大帳號，且有 create 權限）*/}
          {isGiant && can('create') && (
            <button
              type="button"
              onClick={() => onPageChange('announcement-create' as PageType)}
              className="flex items-center h-[36px] px-[16px] rounded-[8px] text-[14px] font-semibold text-white transition-colors"
              style={{ backgroundColor: '#1c252e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2c3540')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1c252e')}
            >
              新增公告
            </button>
          )}
        </div>

        {/* ── D. 內容區：左卡片(40%) | 右預覽(60%)── */}
        <div className="flex flex-1 min-h-0">

          {/* 左側卡片列表 40%：各卡片浮動，有 gap 與 padding */}
          <div
            className="overflow-y-auto custom-scrollbar shrink-0 flex flex-col gap-[12px] p-[16px]"
            style={{ width: '40%' }}
          >
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full py-[40px]">
                <p className="text-[#919eab] text-[14px]">沒有符合條件的公告</p>
              </div>
            ) : (
              filtered.map(record => (
                <AnnouncementCard
                  key={record.id}
                  record={record}
                  isRead={readIds.has(record.id)}
                  isSelected={record.id === selectedId}
                  keyword={keyword}
                  onClick={() => handleCardClick(record.id)}
                />
              ))
            )}
          </div>

          {/* 右側預覽面板 60%：白底 + 浮動灰卡 */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-[16px] bg-white">
            <div
              className="rounded-[12px] h-full overflow-hidden"
              style={{ backgroundColor: '#f4f6f8', boxShadow: '0px 1px 3px rgba(145,158,171,0.2), 0px 0px 2px rgba(145,158,171,0.12)' }}
            >
              <PreviewPanel
                record={selectedRecord}
                isRead={selectedRecord ? readIds.has(selectedRecord.id) : false}
                canModify={canModifyRecord(selectedRecord, 'edit')}
                onEdit={() => selectedRecord && handleEditClick(selectedRecord.id)}
                onDelete={() => selectedRecord && handleDeleteClick(selectedRecord.id)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── 刪除確認 Overlay ── */}
      {deleteConfirmId && (
        <BaseOverlay onClose={() => setDeleteConfirmId(null)} maxWidth="420px" autoHeight>
          <div className="p-[32px] flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] leading-[28px] text-[#1c252e]">
                刪除公告
              </p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#637381]">
                確定要刪除這則公告？此操作無法復原。
              </p>
            </div>
            <div className="flex justify-end gap-[12px]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-[40px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] text-[14px] text-[#637381] font-['Public_Sans:SemiBold',sans-serif] font-semibold hover:bg-[#f4f6f8] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="h-[40px] px-[20px] rounded-[8px] bg-[#ff5630] text-white text-[14px] font-['Public_Sans:SemiBold',sans-serif] font-semibold hover:bg-[#b71d18] transition-colors"
              >
                確認刪除
              </button>
            </div>
          </div>
        </BaseOverlay>
      )}
    </ResponsivePageLayout>
  );
}
