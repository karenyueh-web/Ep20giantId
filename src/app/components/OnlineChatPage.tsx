import React, { useState, useRef, useEffect, useCallback } from 'react';
import { type ChatRoom, type ChatMessage, type ChatMember, availableMembers } from '@/app/data/chatData';
import { useChatStore } from './ChatStoreContext';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import { SearchField } from './SearchField';
import { BaseOverlay } from './BaseOverlay';
import { getAvatarKey } from './NavigationList';
import type { PageType } from './MainLayout';

// ── 工具：關鍵字黃底高亮 ────────────────────────────────────────────────────────
function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword || !keyword.trim() || !text) return <>{text}</>;
  try {
    const escaped = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const result: JSX.Element[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) result.push(<span key={`t${last}`}>{text.slice(last, match.index)}</span>);
      result.push(<mark key={`m${match.index}`} className="bg-[#fef08a] text-inherit rounded-[2px] px-[1px] not-italic">{match[0]}</mark>);
      last = match.index + match[0].length;
      if (match[0].length === 0) break; // 防止無限迴圈
    }
    if (last < text.length) result.push(<span key={`t${last}`}>{text.slice(last)}</span>);
    return <>{result}</>;
  } catch {
    return <>{text}</>;
  }
}

interface OnlineChatPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

// ── 工具：取得訊息送出者名稱（群組用）────────────────────────────────────────
function getSenderName(room: ChatRoom, senderId: string): string {
  if (senderId === 'me') return '';
  const member = room.members.find(m => m.id === senderId);
  if (!member) return '';
  const identity = member.role === 'giant'
    ? '巨大'
    : (member.company.length > 6 ? member.company.slice(0, 6) : member.company);
  return `${identity}-${member.name}`;
}

// ── 身分識別 Badge ─────────────────────────────────────────────────────────────
function RoleBadge({ member }: { member: ChatMember }) {
  if (member.role === 'giant') {
    return (
      <span className="shrink-0 inline-flex items-center h-[18px] px-[6px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] leading-none whitespace-nowrap bg-[rgba(0,94,184,0.12)] text-[#005eb8]">
        巨大
      </span>
    );
  }
  const shortName = member.company.length > 6 ? member.company.slice(0, 6) : member.company;
  return (
    <span className="shrink-0 inline-flex items-center h-[18px] px-[6px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] leading-none whitespace-nowrap bg-[rgba(100,60,180,0.12)] text-[#6b21a8]">
      {shortName}
    </span>
  );
}

// 群組 Badge：綠色
function GroupBadge() {
  return (
    <span className="shrink-0 inline-flex items-center justify-center h-[18px] px-[6px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] leading-none whitespace-nowrap bg-[rgba(55,65,81,0.12)] text-[#374151]">
      group
    </span>
  );
}

// 群組 Avatar：深灰底 + group 文字
function GroupAvatar({ size = 48 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#374151' }}
      >
        <span
          className="font-['Public_Sans:Bold',sans-serif] font-bold text-white tracking-tight"
          style={{ fontSize: size * 0.26 }}
        >
          group
        </span>
      </div>
    </div>
  );
}

// ── 登入者 Avatar（從 localStorage 讀取，與 NavigationList 一致）──────────────
function MeAvatar({ size = 44 }: { size?: number }) {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() =>
    localStorage.getItem(getAvatarKey())
  );

  useEffect(() => {
    const handler = () => setAvatarSrc(localStorage.getItem(getAvatarKey()));
    window.addEventListener('userAvatarChanged', handler);
    return () => window.removeEventListener('userAvatarChanged', handler);
  }, []);

  const userName = localStorage.getItem('currentUserName') || '';
  const userType = localStorage.getItem('currentUserType') || 'giant';
  const firstChar = userName.charAt(0) || '我';
  const bgColor = userType === 'vendor' ? '#5b21b6' : '#00559c';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: avatarSrc ? undefined : bgColor }}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span
            className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-white select-none"
            style={{ fontSize: size * 0.38 }}
          >
            {firstChar}
          </span>
        )}
      </div>
    </div>
  );
}


// ── Avatar 元件（對方）────────────────────────────────────────────────────────
function Avatar({
  src, bg, name, size = 40,
}: {
  src?: string; bg: string; name: string; size?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {src ? (
          <img alt={name} className="w-full h-full object-cover" src={src} />
        ) : (
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e]"
            style={{ fontSize: size * 0.38 }}>
            {name.charAt(0)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── 右鍵選單 ─────────────────────────────────────────────────────────────────
interface ContextMenuState { roomId: string; x: number; y: number; }

// ── 聊天室列表項目 ────────────────────────────────────────────────────────────
function ChatListItem({
  room, isSelected, isPinned, keyword, onClick, onContextMenu,
}: {
  room: ChatRoom; isSelected: boolean; isPinned: boolean; keyword: string;
  onClick: () => void; onContextMenu: (e: React.MouseEvent) => void;
}) {
  const primaryMember = room.type === 'direct' ? room.members[0] : null;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`relative flex items-center gap-[12px] px-[20px] py-[12px] cursor-pointer transition-colors select-none ${
        isSelected ? 'bg-[rgba(0,94,184,0.06)]' : 'hover:bg-[#f9fafb]'
      }`}
    >
      {/* 頭像 */}
      {room.type === 'group'
        ? <GroupAvatar size={48} />
        : <Avatar src={room.avatar} bg={room.avatarBg} name={room.name} size={48} />
      }

      {/* 文字資訊 */}
      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        {/* 第一行：Badge + 名稱 + 時間 */}
        <div className="flex items-center gap-[6px]">
          {room.type === 'group' ? <GroupBadge /> : (primaryMember && <RoleBadge member={primaryMember} />)}
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e] truncate leading-[22px] flex-1 min-w-0">
            <HighlightText text={room.name} keyword={keyword} />
          </p>
          <span className="shrink-0 font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] leading-[18px]">
            {room.lastTime}
          </span>
        </div>

        {/* 第二行：最後訊息 + 未讀數 */}
        <div className="flex items-center justify-between gap-[8px]">
          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] truncate leading-[22px]">
            <HighlightText text={room.lastMessage} keyword={keyword} />
          </p>
          {room.unreadCount > 0 && (
            <div className="shrink-0 flex items-center justify-center bg-[#22c55e] rounded-full min-w-[20px] h-[20px] px-[5px]">
              <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] text-white leading-none">
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 已釘住標示（小釘子圖，常駐顯示） */}
      {isPinned && (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="#e11d48" className="shrink-0 opacity-70">
          <path d="M9.828.722a.5.5 0 01.354.146l4.95 4.95a.5.5 0 010 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 01.16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 01-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 010-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 011.013.16l3.134-3.133a2.772 2.772 0 01-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 01.353-.146z" />
        </svg>
      )}
    </div>
  );
}


// ── 圖片訊息氣泡（含下載按鈕）───────────────────────────────────────────────
function ImageMessage({ imageUrl, onPreview }: { imageUrl: string; onPreview: () => void }) {
  const [hovered, setHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="relative shrink-0 cursor-pointer"
      style={{ width: 80, height: 80 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPreview}
    >
      <img
        src={imageUrl}
        alt="圖片訊息"
        className="w-full h-full object-cover rounded-[8px] border border-[rgba(145,158,171,0.2)]"
      />
      {hovered && (
        <div className="absolute inset-0 rounded-[8px] bg-black/30 flex items-center justify-center gap-[6px]">
          <div className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white/20 hover:bg-white/40 transition-colors">
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="white" strokeWidth="1.5" />
              <path d="M12.5 12.5L16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 8h4M8 6v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div
            onClick={handleDownload}
            className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v9M5 9l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}


// ── 訊息氣泡 ──────────────────────────────────────────────────────────────────
function MessageBubble({
  message, room, keyword, onImageClick,
}: {
  message: ChatMessage; room: ChatRoom; keyword: string; onImageClick: (url: string) => void;
}) {
  const isMe = message.senderId === 'me';
  const senderName = !isMe && room.type === 'group' ? getSenderName(room, message.senderId) : '';
  const member = !isMe ? room.members.find(m => m.id === message.senderId) : null;

  // ── 系統訊息：居中灰色細字 ────────────────────────────────────────
  if (message.type === 'system') {
    return (
      <div className="flex items-center justify-center gap-[8px] py-[4px]">
        <div className="flex-1 h-[1px] bg-[rgba(145,158,171,0.15)]" />
        <p className="shrink-0 font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] leading-none px-[4px]">
          {message.text}
        </p>
        <div className="flex-1 h-[1px] bg-[rgba(145,158,171,0.15)]" />
      </div>
    );
  }

  // ── 單據資料卡片（context）：鵜黃底 + 鵜黃虛線框 ──────────────────────────
  if (message.type === 'context') {
    const fields = (message.text ?? '').split(' | ');
    return (
      <div className="w-full rounded-[10px] border border-dashed border-[rgba(255,171,0,0.5)] bg-[rgba(255,171,0,0.06)] px-[14px] py-[12px]">
        {/* 標題列 */}
        <div className="flex items-center gap-[6px] mb-[8px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b76e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b76e00] leading-none tracking-wide uppercase">單據資料</p>
          <div className="flex-1 h-[1px] bg-[rgba(255,171,0,0.3)]" />
        </div>
        {/* 各欄位：欄位名稱粗體，値正常 */}
        <div className="flex flex-wrap gap-x-[16px] gap-y-[4px]">
          {fields.map((field, i) => {
            const colonIdx = field.indexOf('：');
            if (colonIdx !== -1) {
              const label = field.slice(0, colonIdx);
              const value = field.slice(colonIdx + 1);
              return (
                <p key={i} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#454f5b] leading-[20px]">
                  <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold">{label}：</span>
                  <HighlightText text={value} keyword={keyword} />
                </p>
              );
            }
            return (
              <p key={i} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#454f5b] leading-[20px]">
                <HighlightText text={field} keyword={keyword} />
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 自己的訊息：全寬卡片居中 ─────────────────────────────────────────
  if (isMe) {
    return (
      <div className="w-full flex flex-col gap-[4px]">

        {/* 文字訊息卡片 */}
        {message.type === 'text' && (
          <div className="w-full px-[16px] py-[12px] rounded-[10px] bg-[rgba(0,94,184,0.07)] border border-[rgba(0,94,184,0.15)]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#1c252e] leading-[22px] whitespace-pre-wrap">
              <HighlightText text={message.text ?? ''} keyword={keyword} />
              <span className="inline-block ml-[10px] font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab] align-bottom">
                {message.time}
              </span>
            </p>
          </div>
        )}

        {/* 圖片訊息：多張縮圖，左到右排列 */}
        {message.type === 'image' && (message.imageUrls?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-[8px]">
            {message.imageUrls!.map((url, i) => (
              <ImageMessage key={i} imageUrl={url} onPreview={() => onImageClick(url)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── 對方的訊息：頭像 + 氣泡靠左 ──────────────────────────────────────
  return (
    <div className="flex gap-[10px] flex-row">
      <Avatar
        src={member?.avatar}
        bg={member?.avatarBg ?? '#e0e0e0'}
        name={member?.name ?? '?'}
        size={36}
      />

      <div className="flex flex-col gap-[4px] max-w-[70%] items-start">
        {/* 群組：送出者名稱 */}
        {senderName && (
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] px-[4px]">
            {senderName}
          </p>
        )}

        {/* 時間 */}
        <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] leading-[18px] px-[2px]">
          {message.time}
        </p>

        {/* 文字氣泡 */}
        {message.type === 'text' && (
          <div className="px-[16px] py-[10px] rounded-[12px] rounded-tl-[4px] bg-white border border-[rgba(145,158,171,0.2)]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#1c252e] leading-[22px] whitespace-pre-wrap">
              <HighlightText text={message.text ?? ''} keyword={keyword} />
            </p>
          </div>
        )}

        {/* 圖片訊息：多張縮圖，左到右排列 */}
        {message.type === 'image' && (message.imageUrls?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-[8px]">
            {message.imageUrls!.map((url, i) => (
              <ImageMessage key={i} imageUrl={url} onPreview={() => onImageClick(url)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ── 群組改名編輯器 ────────────────────────────────────────────────────────────
function GroupNameEditor({ name, onSave }: { name: string; onSave: (n: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(name); }, [name]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onSave(trimmed);
    else setValue(name);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setValue(name); setEditing(false); } }}
        className="flex-1 min-w-0 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e] leading-[24px] border-b-2 border-[#005eb8] outline-none bg-transparent"
      />
    );
  }

  return (
    <div className="flex items-center gap-[6px] min-w-0">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e] leading-[24px] truncate">
        {name}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full hover:bg-[#f4f6f8] transition-colors"
        title="修改群組名稱"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="#637381" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ── 空白狀態 ──────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[12px]">
      <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-[rgba(0,94,184,0.06)]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-[4px]">
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#919eab] leading-[24px]">
          選擇對話開始聊天
        </p>
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#c4cdd5] leading-[22px]">
          或點擊左上角 + 建立新的對話
        </p>
      </div>
    </div>
  );
}

// ── CreateChatOverlay（建立新對話 / 群組）────────────────────────────────────
function CreateChatOverlay({
  onClose, onCreateRoom, userRole, currentVendorCode,
}: {
  onClose: () => void;
  onCreateRoom: (room: ChatRoom) => void;
  /** 登入者身份：'giant' 可見所有人；'vendor' 只能見巨大＋自家廠商 */
  userRole?: string;
  /** 廠商帳號的自家廠商編號（vendorCode），用來過濾同廠商人員 */
  currentVendorCode?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<ChatMember[]>([]);
  /** 群組名稱確認彈窗（按下「建立群組」才顯示） */
  const [showGroupNameStep, setShowGroupNameStep] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState(false);

  // ── 人員清單過濾 ──
  // 搜尋框為空時不顯示清單（需先輸入才出現結果）
  const filtered = searchQuery.trim()
    ? availableMembers.filter(m => {
        // 角色可見範圍過濾
        if (userRole === 'vendor') {
          const isSameVendor = currentVendorCode ? m.vendorCode === currentVendorCode : false;
          if (m.role !== 'giant' && !isSameVendor) return false;
        }
        // 關鍵字過濾
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        );
      })
    : [];

  const [vendorConflictMsg, setVendorConflictMsg] = useState<string | null>(null);

  /** 取得目前已選清單中唯一的廠商 vendorCode（若有廠商成員）*/
  const selectedVendorCode = selectedMembers.find(m => m.role === 'vendor')?.vendorCode ?? null;

  /**
   * 判斷某成員是否因廠商衝突而不可選：
   * - 自己是廠商 AND 目前已有另一家廠商的成員在選單中
   */
  const isVendorConflict = (member: ChatMember) =>
    member.role === 'vendor' &&
    selectedVendorCode !== null &&
    member.vendorCode !== selectedVendorCode;

  const toggleMember = (member: ChatMember) => {
    // 已選取 → 直接取消選取
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
      setVendorConflictMsg(null);
      return;
    }
    // 廠商衝突 → 阻止並顯示提示
    if (isVendorConflict(member)) {
      setVendorConflictMsg('一個群組只能包含同一家廠商的成員');
      setTimeout(() => setVendorConflictMsg(null), 3000);
      return;
    }
    setSelectedMembers(prev => [...prev, member]);
    setVendorConflictMsg(null);
  };

  /** 取得 chip 顯示文字：巨大-XXX 或 廠商簡稱-XXX */
  const getChipLabel = (m: ChatMember) => {
    if (m.role === 'giant') return `巨大-${m.name}`;
    const shortCompany = m.company.length > 6 ? m.company.slice(0, 6) : m.company;
    return `${shortCompany}-${m.name}`;
  };

  /** chip 配色：巨大→藍色、廠商→紫色 */
  const getChipStyle = (m: ChatMember) => m.role === 'giant'
    ? { bg: 'rgba(0,94,184,0.08)', border: 'rgba(0,94,184,0.2)', text: '#005eb8', hover: 'rgba(0,94,184,0.15)', stroke: '#005eb8' }
    : { bg: 'rgba(107,70,193,0.08)', border: 'rgba(107,70,193,0.2)', text: '#6b46c1', hover: 'rgba(107,70,193,0.15)', stroke: '#6b46c1' };

  const isGroup = selectedMembers.length > 1;

  /** 按下底部按鈕 */
  const handleClickAction = () => {
    if (selectedMembers.length === 0) return;
    if (isGroup) {
      // 多選 → 跳出群組名稱輸入步驟
      setShowGroupNameStep(true);
    } else {
      // 單選 → 直接建立一對一對話
      const newRoom: ChatRoom = {
        id: `room-${Date.now()}`,
        type: 'direct',
        name: selectedMembers[0].name,
        avatar: selectedMembers[0].avatar,
        avatarBg: selectedMembers[0].avatarBg,
        members: selectedMembers,
        lastMessage: '',
        lastTime: '剛剛',
        unreadCount: 0,
        messages: [],
      };
      onCreateRoom(newRoom);
      onClose();
    }
  };

  /** 群組名稱步驟：確認建立 */
  const handleConfirmGroup = () => {
    if (!groupName.trim()) {
      setGroupNameError(true);
      return;
    }
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      type: 'group',
      name: groupName.trim(),
      avatar: selectedMembers[0].avatar,
      avatarBg: selectedMembers[0].avatarBg,
      members: selectedMembers,
      lastMessage: '',
      lastTime: '剛剛',
      unreadCount: 0,
      messages: [],
    };
    onCreateRoom(newRoom);
    onClose();
  };

  // ── 群組名稱輸入步驟（覆蓋在同一個 overlay 上）──
  if (showGroupNameStep) {
    return (
      <BaseOverlay onClose={onClose} maxWidth="520px" maxHeight="360px">
        <div className="relative flex flex-col h-full">
          {/* 返回按鈕 */}
          <button
            className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-[6px]"
            onClick={() => { setShowGroupNameStep(false); setGroupNameError(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="shrink-0 pt-[58px] px-[32px] pb-[20px]">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px] mb-[4px]">
              設定群組名稱
            </p>
            <p className="text-[13px] text-[#637381]">已選擇 {selectedMembers.length} 位成員</p>
          </div>

          {/* 群組名稱輸入 */}
          <div className="shrink-0 px-[32px] pb-[16px]">
            <label className="block mb-[6px] text-[12px] font-semibold" style={{ color: groupNameError ? '#ef4444' : '#637381' }}>
              群組名稱（必填）
            </label>
            <input
              autoFocus
              type="text"
              value={groupName}
              onChange={e => { setGroupName(e.target.value); setGroupNameError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleConfirmGroup(); }}
              placeholder="輸入群組名稱"
              className={`w-full rounded-[8px] px-[14px] py-[12px] text-[14px] text-[#1c252e] outline-none bg-transparent placeholder:text-[#919eab] border ${groupNameError ? 'border-red-400' : 'border-[rgba(145,158,171,0.3)]'} focus:border-[#005eb8] transition-colors`}
            />
            {groupNameError && (
              <p className="mt-[6px] text-[12px] text-red-500">請輸入群組名稱</p>
            )}
          </div>


          {/* 確認建立按鈕 */}
          <div className="shrink-0 px-[32px] pb-[24px] mt-auto">
            <button
              onClick={handleConfirmGroup}
              className="w-full h-[44px] rounded-[8px] flex items-center justify-center font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white transition-colors"
              style={{ backgroundColor: '#00559c' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#004680'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00559c'; }}
            >
              確認建立群組
            </button>
          </div>
        </div>
      </BaseOverlay>
    );
  }

  return (
    <BaseOverlay onClose={onClose} maxWidth="520px" maxHeight="600px">
      <div className="relative flex flex-col h-full">
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

        {/* 標題 */}
        <div className="shrink-0 pt-[58px] px-[32px] pb-[16px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">
            建立新對話
          </p>
        </div>

        {/* 已選成員 Tag chips（帶身分識別） */}
        {selectedMembers.length > 0 && (
          <div className="shrink-0 px-[32px] pb-[12px] flex flex-wrap gap-[8px]">
            {selectedMembers.map(m => (
              <div
                key={m.id}
                style={{
                  backgroundColor: getChipStyle(m).bg,
                  borderColor: getChipStyle(m).border,
                }}
                className="flex items-center gap-[6px] border rounded-[20px] pl-[10px] pr-[6px] h-[28px]"
              >
                <span
                  style={{ color: getChipStyle(m).text }}
                  className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-none"
                >
                  {getChipLabel(m)}
                </span>
                <button
                  onClick={() => toggleMember(m)}
                  className="flex items-center justify-center w-[16px] h-[16px] rounded-full transition-colors"
                  style={{ '--hover-bg': getChipStyle(m).hover } as React.CSSProperties}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = getChipStyle(m).hover; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke={getChipStyle(m).stroke} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 搜尋框 */}
        <div className="shrink-0 px-[32px] pb-[12px]">
          <SearchField
            label="搜尋姓名、廠商、email"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* 人員列表：搜尋前顯示提示，搜尋後顯示結果 */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[16px]">
          {!searchQuery.trim() ? null : filtered.length === 0 ? (
            <p className="text-center text-[14px] text-[#919eab] py-[20px]">找不到相關人員</p>
          ) : (
            <>
              <p className="px-[16px] py-[8px] text-[12px] text-[#919eab] font-['Public_Sans:Regular',sans-serif]">
                共 {filtered.length} 位
              </p>
              {/* 廠商衝突提示 */}
              {vendorConflictMsg && (
                <div className="mx-[16px] mb-[8px] px-[12px] py-[8px] rounded-[8px] bg-[#fff3cd] border border-[#ffc107] flex items-center gap-[8px]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5L1 14h14L8 1.5z" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 6v4M8 11.5v.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px] text-[#92400e] font-['Public_Sans:Regular',sans-serif]">{vendorConflictMsg}</span>
                </div>
              )}
              {filtered.map(member => {
              const isSelected = !!selectedMembers.find(m => m.id === member.id);
              const disabled = isVendorConflict(member);
              return (
                <div
                  key={member.id}
                  onClick={() => !disabled && toggleMember(member)}
                  title={disabled ? '此群組已包含其他廠商成員，無法加入' : undefined}
                  className={`flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] transition-colors ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'bg-[rgba(0,94,184,0.06)] cursor-pointer'
                        : 'hover:bg-[#f9fafb] cursor-pointer'
                  }`}
                >
                  <Avatar src={member.avatar} bg={member.avatarBg} name={member.name} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] mb-[2px]">
                      <RoleBadge member={member} />
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px]">
                        {member.name}
                      </p>
                    </div>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] leading-[20px] truncate">
                      {member.email}
                    </p>
                  </div>
                  {/* 勾選 */}
                  <div className={`shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 transition-colors ${
                    isSelected ? 'bg-[#005eb8] border-[#005eb8]' : 'border-[rgba(145,158,171,0.4)]'
                  }`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                    )}
                  </div>
                </div>
              );
              })}
            </>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="shrink-0 px-[32px] py-[20px]">
          <button
            onClick={handleClickAction}
            disabled={selectedMembers.length === 0}
            className="w-full h-[44px] rounded-[8px] flex items-center justify-center font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#00559c' }}
            onMouseEnter={e => { if (selectedMembers.length > 0) e.currentTarget.style.backgroundColor = '#004680'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#00559c'; }}
          >
            {isGroup ? '建立群組' : '開始聊天'}
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}


// ── 圖片放大 Overlay（含下載按鈕）────────────────────────────────────────────
function ImagePreviewOverlay({ imageUrls, onClose }: { imageUrls: string[]; onClose: () => void }) {
  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="90vw" maxHeight="90vh">
      <div className="relative flex items-center justify-center h-full p-[20px]">
        {/* 關閉 */}
        <button
          className="absolute left-[16px] top-[16px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381" fillRule="evenodd" />
          </svg>
        </button>
        {/* 下載 */}
        <button
          className="absolute right-[16px] top-[16px] z-10 flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors"
          onClick={handleDownload}
          title="下載圖片"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M3 7l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 11h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white leading-none">下載</span>
        </button>
        <img src={imageUrls[0]} alt="圖片預覽" className="max-w-full max-h-full object-contain rounded-[8px]" />
      </div>
    </BaseOverlay>
  );
}

// ── 工具：把圖片 File 加入聊天室 ─────────────────────────────────────────────
function createImageMessage(file: File): Promise<ChatMessage> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    resolve({
      id: `m-${Date.now()}-${Math.random()}`,
      senderId: 'me',
      type: 'image',
      imageUrls: [url],
      time: new Date().toLocaleString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }),
    });
  });
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function OnlineChatPage({ currentPage, onPageChange, onLogout, userRole }: OnlineChatPageProps) {
  const chatStore = useChatStore();
  const allRooms = chatStore.rooms;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(() => chatStore.activeRoomId);
  const [listSearch, setListSearch] = useState('');
  const [panelWidth, setPanelWidth] = useState(300);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [showCreateOverlay, setShowCreateOverlay] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  // 釘選狀態（來自 ChatStoreContext）
  const pinnedIds = chatStore.pinnedIds;

  // 右鍵選單狀態
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // 進入頁面時：自動選中 activeRoomId（從浮動 panel 跳過來）
  useEffect(() => {
    if (chatStore.activeRoomId) {
      setSelectedRoomId(chatStore.activeRoomId);
      chatStore.setActiveRoomId(null);
    }
  }, [chatStore.activeRoomId]);

  const togglePin = (roomId: string) => {
    chatStore.togglePin(roomId);
    setContextMenu(null);
  };

  // 點外部關閉右鍵選單
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    document.addEventListener('click', close);
    return () => {
      document.removeEventListener('click', close);
    };
  }, [contextMenu]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // 過濾 + 排序（釘選區由新到舊、一般區由新到舊）
  const sortByLatest = (a: ChatRoom, b: ChatRoom) => {
    const aTime = a.messages.at(-1)?.time ?? '';
    const bTime = b.messages.at(-1)?.time ?? '';
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return bTime.localeCompare(aTime);
  };

  const allFiltered = allRooms.filter(r => {
    const q = listSearch.toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.members.some(m =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      ) ||
      r.messages.some(msg => msg.text?.toLowerCase().includes(q))
    );
  });

  // selectedRoom 只從過濾結果中取，搜尋時若該房間不在結果內則右側自動清空
  const selectedRoom = allFiltered.find(r => r.id === selectedRoomId) ?? null;

  const pinnedRooms   = allFiltered.filter(r =>  pinnedIds.has(r.id)).sort(sortByLatest);
  const unpinnedRooms = allFiltered.filter(r => !pinnedIds.has(r.id)).sort(sortByLatest);

  // 顯示所有訊息
  const filteredMessages = selectedRoom ? selectedRoom.messages : [];

  // 自動捲動：有未讀分隔線時捲到分隔線，否則捲到底部
  useEffect(() => {
    setTimeout(() => {
      if (dividerRef.current) {
        dividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }, [selectedRoomId, filteredMessages.length]);

  // 進入聊天室 → 先記錄上次閱讀位置，再清除未讀
  const handleSelectRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    chatStore.recordLastSeen(roomId);
    chatStore.markRead(roomId);
  }, [chatStore]);

  // 將 File[] 轉為 object URL 并加入暂存區（不直接送出）
  const stageImages = useCallback((files: File[]) => {
    const imgFiles = files.filter(f => f.type.startsWith('image/'));
    if (imgFiles.length === 0) return;
    const urls = imgFiles.map(f => URL.createObjectURL(f));
    setPendingImages(prev => [...prev, ...urls]);
  }, []);

  // 發送訊息（文字 + 暫存圖片一起送出）
  const handleSend = () => {
    if (!selectedRoom) return;
    const hasText = messageText.trim().length > 0;
    const hasImages = pendingImages.length > 0;
    if (!hasText && !hasImages) return;
    chatStore.sendMessage(selectedRoom.id, messageText.trim(), hasImages ? pendingImages : undefined);
    setMessageText('');
    setPendingImages([]);
  };

  // 選檔按鈕：圖片進暂存區
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !selectedRoom) return;
    stageImages(files);
    e.target.value = '';
  };

  // 貼上圖片 → 暂存區
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!selectedRoom) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) stageImages(files);
  }, [selectedRoom, stageImages]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // 拖拉圖片
  const handleDragOver = (e: React.DragEvent) => {
    if (!selectedRoom) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (!selectedRoom) return;
    const files = Array.from(e.dataTransfer.files);
    stageImages(files);
  };

  // 建立新聊天室
  const handleCreateRoom = (room: ChatRoom) => {
    chatStore.addRoom(room);
    setSelectedRoomId(room.id);
  };



  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="Online Chat"
      breadcrumb="Online Chat"
    >
      <div className="h-[calc(100vh-124px)] min-h-[500px] flex">
        <div className="flex flex-1 flex-col bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] overflow-hidden">

          {/* ══ 頂部全寬搜尋列 ══ */}
          <div className="h-[84px] shrink-0 flex items-center gap-[12px] px-[20px] border-b border-[rgba(145,158,171,0.2)]">
            {/* 當前登入者頭像 */}
            <MeAvatar size={44} />
            {/* 搜尋框（全寬） */}
            <div className="flex-1 min-w-0">
              <SearchField
                label="搜尋廠商名稱、廠商姓名、對話內容"
                value={listSearch}
                onChange={setListSearch}
              />
            </div>
            {/* 新增對話按鈕 */}
            <button
              onClick={() => setShowCreateOverlay(true)}
              className="shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[#f4f6f8] transition-colors"
              title="建立新對話"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="#1c252e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ══ 下方主體：左側列表 + 右側對話 ══ */}
          <div className="flex flex-1 min-h-0" ref={containerRef}>

            {/* ── 左側聊天室列表 ── */}
            <div
              className="shrink-0 flex flex-col border-r border-[rgba(145,158,171,0.2)] overflow-y-auto custom-scrollbar py-[8px]"
              style={{ width: panelWidth }}
            >
              {allFiltered.length === 0 ? (
                <p className="text-center text-[14px] text-[#919eab] py-[32px]">找不到相關對話</p>
              ) : (
                <>
                  {/* 釘選區 */}
                  {pinnedRooms.length > 0 && (
                    <>
                      {pinnedRooms.map(room => (
                        <ChatListItem
                          key={room.id}
                          room={room}
                          isSelected={selectedRoomId === room.id}
                          isPinned={true}
                          keyword={listSearch}
                          onClick={() => handleSelectRoom(room.id)}
                          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ roomId: room.id, x: e.clientX, y: e.clientY }); }}
                        />
                      ))}
                      {unpinnedRooms.length > 0 && (
                        <div className="mx-[20px] my-[2px] border-t border-[rgba(145,158,171,0.15)]" />
                      )}
                    </>
                  )}

                  {/* 一般對話區 */}
                  {unpinnedRooms.map(room => (
                    <ChatListItem
                      key={room.id}
                      room={room}
                      isSelected={selectedRoomId === room.id}
                      isPinned={false}
                      keyword={listSearch}
                      onClick={() => handleSelectRoom(room.id)}
                      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ roomId: room.id, x: e.clientX, y: e.clientY }); }}
                    />
                  ))}
                </>
              )}
            </div>

            {/* ── 可拖曳分隔線 ── */}
            <div
              className="w-[5px] shrink-0 cursor-col-resize hover:bg-[rgba(0,94,184,0.15)] active:bg-[rgba(0,94,184,0.25)] transition-colors group relative"
              onMouseDown={(e) => {
                e.preventDefault();
                isResizing.current = true;
                const startX = e.clientX;
                const startWidth = panelWidth;
                const onMove = (ev: MouseEvent) => {
                  if (!isResizing.current) return;
                  const delta = ev.clientX - startX;
                  const next = Math.min(520, Math.max(200, startWidth + delta));
                  setPanelWidth(next);
                };
                const onUp = () => {
                  isResizing.current = false;
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            >
              {/* 中央細線提示 */}
              <div className="absolute inset-y-0 left-[2px] w-[1px] bg-[rgba(145,158,171,0.2)] group-hover:bg-[rgba(0,94,184,0.3)] transition-colors" />
            </div>

            {/* ── 右側對話區 ── */}
            {selectedRoom ? (
              <div
                ref={chatAreaRef}
                className="flex-1 flex flex-col min-w-0 relative"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* 拖拉提示遮罩 */}
                {isDraggingOver && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(0,94,184,0.08)] border-2 border-dashed border-[#005eb8]">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <rect x="4" y="4" width="40" height="40" rx="8" fill="rgba(0,94,184,0.1)" />
                      <path d="M24 16v12M16 24l8 8 8-8" stroke="#005eb8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 34h20" stroke="#005eb8" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <p className="mt-[12px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#005eb8]">
                      放開以傳送圖片
                    </p>
                  </div>
                )}

                {/* 對話 Header（與左側列表頂端齊平） */}
                <div className="h-[84px] shrink-0 flex items-center gap-[12px] px-[20px] border-b border-[rgba(145,158,171,0.2)]">
                  {/* 頭像：群組用 GroupAvatar */}
                  {selectedRoom.type === 'group'
                    ? <GroupAvatar size={44} />
                    : <Avatar src={selectedRoom.avatar} bg={selectedRoom.avatarBg} name={selectedRoom.name} size={44} />
                  }

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px]">
                      {/* Badge（右側 Header 用較大尺寸，對齊姓名字級） */}
                      {selectedRoom.type === 'group'
                        ? (
                          <span className="shrink-0 inline-flex items-center h-[24px] px-[8px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] leading-none whitespace-nowrap bg-[rgba(55,65,81,0.12)] text-[#374151]">
                            group
                          </span>
                        )
                        : selectedRoom.members[0] && (
                          selectedRoom.members[0].role === 'giant'
                            ? (
                              <span className="shrink-0 inline-flex items-center h-[24px] px-[8px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] leading-none whitespace-nowrap bg-[rgba(0,94,184,0.12)] text-[#005eb8]">
                                巨大
                              </span>
                            ) : (
                              <span className="shrink-0 inline-flex items-center h-[24px] px-[8px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] leading-none whitespace-nowrap bg-[rgba(107,70,193,0.12)] text-[#6b21a8]">
                                {selectedRoom.members[0].company.length > 6
                                  ? selectedRoom.members[0].company.slice(0, 6)
                                  : selectedRoom.members[0].company}
                              </span>
                            )
                        )
                      }

                      {/* 群組：可編輯名稱 */}
                      {selectedRoom.type === 'group' ? (
                        <GroupNameEditor
                          name={selectedRoom.name}
                          onSave={(newName) => {
                            const oldName = selectedRoom.name;
                            const now = new Date();
                            const timeStr = now.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                            const actor = localStorage.getItem('currentUserName') ?? '成員';
                            const systemMsg: import('../data/chatData').ChatMessage = {
                              id: `sys-${Date.now()}`,
                              senderId: 'system',
                              type: 'system',
                              text: `${actor} 將群組名稱由「${oldName}」改為「${newName}」`,
                              time: timeStr,
                            };
                            setRooms(prev => prev.map(r =>
                              r.id === selectedRoom.id
                                ? { ...r, name: newName, messages: [...r.messages, systemMsg] }
                                : r
                            ));
                          }}
                        />
                      ) : (
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e] leading-[24px] truncate">
                          {selectedRoom.name}
                        </p>
                      )}
                    </div>
                    {selectedRoom.type === 'group' && (
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] leading-[18px] truncate">
                        {selectedRoom.members.map(m => {
                          const identity = m.role === 'giant' ? '巨大' : (m.company.length > 6 ? m.company.slice(0, 6) : m.company);
                          return `${identity}-${m.name}`;
                        }).join('、')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 訊息串 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-[20px] py-[20px] flex flex-col gap-[16px] bg-[#f9fafb]">
                  {filteredMessages.map((msg, i) => (
                    <React.Fragment key={msg.id}>
                      {/* 在第一則未讀訊息前插入「上一次的閱讀位置」分隔線 */}
                      {selectedRoom?.lastSeenCount != null && i === selectedRoom.lastSeenCount && (
                        <div ref={dividerRef} className="flex items-center gap-[8px] py-[4px]">
                          <div className="flex-1 h-[1px] bg-[rgba(0,94,184,0.25)]" />
                          <p className="shrink-0 font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#005eb8] whitespace-nowrap">上一次的閱讀位置</p>
                          <div className="flex-1 h-[1px] bg-[rgba(0,94,184,0.25)]" />
                        </div>
                      )}
                      <MessageBubble
                        message={msg}
                        room={selectedRoom!}
                        keyword={listSearch}
                        onImageClick={url => setPreviewImage(url)}
                      />
                    </React.Fragment>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 整合輸入區：暂存圖片列 + 輸入列 */}
                <div className="shrink-0 border-t border-[rgba(145,158,171,0.2)] bg-white">

                  {/* 圖片暂存區（有圖片時才顯示） */}
                  {pendingImages.length > 0 && (
                    <div className="flex items-center gap-[8px] px-[20px] pt-[12px] pb-[8px] flex-wrap">
                      {pendingImages.map((url, i) => (
                        <div key={i} className="relative shrink-0 group" style={{ width: 64, height: 64 }}>
                          <img
                            src={url}
                            alt="暂存圖片"
                            className="w-full h-full object-cover rounded-[8px] border border-[rgba(145,158,171,0.2)]"
                          />
                          {/* 刪除按鈕 */}
                          <button
                            onClick={() => setPendingImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#1c252e] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {/* 再加圖片按鈕 */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 flex items-center justify-center rounded-[8px] border-2 border-dashed border-[rgba(145,158,171,0.3)] hover:border-[#005eb8] hover:bg-[rgba(0,94,184,0.04)] transition-colors"
                        style={{ width: 64, height: 64 }}
                        title="再新增圖片"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 4v12M4 10h12" stroke="#919eab" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* 文字輸入列 */}
                  <div className="h-[72px] flex items-center gap-[8px] px-[20px]">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    {/* 附件按鈕（沒有暂存圖片時才顯示） */}
                    {pendingImages.length === 0 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[#f4f6f8] transition-colors"
                        title="上傳圖片"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                            stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                    <input
                      type="text"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={pendingImages.length > 0 ? '可附加文字訊息再送出…' : '輸入訊息… (可直接貼上或拖拉圖片)'}
                      className="flex-1 font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none bg-transparent leading-[22px]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageText.trim() && pendingImages.length === 0}
                      className="shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full transition-colors disabled:opacity-30"
                      style={{ backgroundColor: (messageText.trim() || pendingImages.length > 0) ? '#005eb8' : 'transparent' }}
                      title="發送"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M16 2L9 9M16 2L11 16l-2-7-7-2 14-5z"
                          stroke={(messageText.trim() || pendingImages.length > 0) ? 'white' : '#919eab'}
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* 彈窗 */}
      {showCreateOverlay && (
        <CreateChatOverlay
          onClose={() => setShowCreateOverlay(false)}
          onCreateRoom={handleCreateRoom}
          userRole={userRole}
          // 廠商帳號 mock 示範：以廠商編號 '0001000001'（久廣實業）為例
          // 實際上線時應從登入 context 取得廠商編號
          currentVendorCode={
            userRole === 'vendor' ? '0001000001' : undefined
          }
        />
      )}
      {previewImage && (
        <ImagePreviewOverlay
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* 右鍵選單 */}
      {contextMenu && (() => {
        const isCurrentlyPinned = pinnedIds.has(contextMenu.roomId);
        return (
          <div
            className="fixed z-[500] bg-white rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[rgba(145,158,171,0.15)] p-[4px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => togglePin(contextMenu.roomId)}
              title={isCurrentlyPinned ? '取消釘住' : '釘住對話'}
              className="flex items-center justify-center w-[36px] h-[36px] hover:bg-[#f9fafb] transition-colors rounded-[6px]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={isCurrentlyPinned ? '#919eab' : '#e11d48'}>
                <path d="M9.828.722a.5.5 0 01.354.146l4.95 4.95a.5.5 0 010 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 01.16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 01-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 010-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 011.013.16l3.134-3.133a2.772 2.772 0 01-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 01.353-.146z" />
              </svg>
            </button>
          </div>
        );
      })()}

    </ResponsivePageLayout>
  );
}
