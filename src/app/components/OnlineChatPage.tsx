import { useState, useRef, useEffect, useCallback } from 'react';
import { chatRooms, availableMembers, type ChatRoom, type ChatMessage, type ChatMember } from '@/app/data/chatData';
import { ResponsivePageLayout } from './ResponsivePageLayout';
import { SearchField } from './SearchField';
import { BaseOverlay } from './BaseOverlay';
import type { PageType } from './MainLayout';

// ── Props ──────────────────────────────────────────────────────────────────────
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
    <span className="shrink-0 inline-flex items-center h-[18px] px-[6px] rounded-[4px] font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] leading-none whitespace-nowrap bg-[rgba(34,197,94,0.15)] text-[#16a34a]">
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
    localStorage.getItem('userAvatar')
  );

  useEffect(() => {
    const handler = () => setAvatarSrc(localStorage.getItem('userAvatar'));
    window.addEventListener('userAvatarChanged', handler);
    return () => window.removeEventListener('userAvatarChanged', handler);
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden bg-[#f0f0f0]"
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span
            className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-white select-none"
            style={{ fontSize: size * 0.38 }}
          >
            我
          </span>
        )}
      </div>
      {/* 在線狀態 */}
      <div
        className="absolute rounded-full border-[1.5px] border-white bg-[#22c55e]"
        style={{ width: size * 0.26, height: size * 0.26, bottom: 0, right: 0 }}
      />
    </div>
  );
}

// ── Avatar 元件（對方）────────────────────────────────────────────────────────
function Avatar({
  src, bg, name, size = 40, online,
}: {
  src?: string; bg: string; name: string; size?: number; online?: boolean;
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
      {online !== undefined && (
        <div
          className={`absolute rounded-full border-[1.5px] border-white ${online ? 'bg-[#22c55e]' : 'bg-[#919eab]'}`}
          style={{ width: size * 0.26, height: size * 0.26, bottom: 0, right: 0 }}
        />
      )}
    </div>
  );
}

// ── 聊天室列表項目 ────────────────────────────────────────────────────────────
function ChatListItem({
  room, isSelected, onClick,
}: {
  room: ChatRoom; isSelected: boolean; onClick: () => void;
}) {
  // 一對一時的唯一 member（用於 badge）
  const primaryMember = room.type === 'direct' ? room.members[0] : null;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-[12px] px-[20px] py-[12px] cursor-pointer transition-colors ${
        isSelected ? 'bg-[rgba(0,94,184,0.06)]' : 'hover:bg-[#f9fafb]'
      }`}
    >
      {/* 頭像：群組用 GroupAvatar，一對一用 Avatar */}
      {room.type === 'group'
        ? <GroupAvatar size={48} />
        : <Avatar src={room.avatar} bg={room.avatarBg} name={room.name} size={48} online={primaryMember?.isOnline} />
      }

      {/* 文字資訊 */}
      <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
        {/* 第一行：Badge + 名稱 + 時間 */}
        <div className="flex items-center gap-[6px]">
          {/* Badge */}
          {room.type === 'group' ? <GroupBadge /> : (primaryMember && <RoleBadge member={primaryMember} />)}
          {/* 名稱 */}
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e] truncate leading-[22px] flex-1 min-w-0">
            {room.name}
          </p>
          {/* 時間 */}
          <span className="shrink-0 font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] leading-[18px]">
            {room.lastTime}
          </span>
        </div>

        {/* 第二行：最後訊息 + 未讀數 */}
        <div className="flex items-center justify-between gap-[8px]">
          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] truncate leading-[22px]">
            {room.lastMessage}
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
  message, room, onImageClick,
}: {
  message: ChatMessage; room: ChatRoom; onImageClick: (url: string) => void;
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

  // ── 自己的訊息：全寬卡片居中 ─────────────────────────────────────────
  if (isMe) {
    return (
      <div className="w-full flex flex-col gap-[4px]">

        {/* 文字訊息卡片 */}
        {message.type === 'text' && (
          <div className="w-full px-[16px] py-[12px] rounded-[10px] bg-[rgba(0,94,184,0.07)] border border-[rgba(0,94,184,0.15)]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#1c252e] leading-[22px] whitespace-pre-wrap">
              {message.text}
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
              {message.text}
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
  onClose, onCreateRoom,
}: {
  onClose: () => void;
  onCreateRoom: (room: ChatRoom) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<ChatMember[]>([]);
  const [groupName, setGroupName] = useState('');

  const filtered = availableMembers.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const toggleMember = (member: ChatMember) => {
    setSelectedMembers(prev =>
      prev.find(m => m.id === member.id)
        ? prev.filter(m => m.id !== member.id)
        : [...prev, member]
    );
  };

  const [groupNameError, setGroupNameError] = useState(false);

  const handleCreate = () => {
    if (selectedMembers.length === 0) return;
    const isGroup = selectedMembers.length > 1;
    // 群組名稱必填
    if (isGroup && !groupName.trim()) {
      setGroupNameError(true);
      return;
    }
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      type: isGroup ? 'group' : 'direct',
      name: isGroup ? groupName.trim() : selectedMembers[0].name,
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

  const isGroup = selectedMembers.length > 1;

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

        {/* 已選成員 Tag chips */}
        {selectedMembers.length > 0 && (
          <div className="shrink-0 px-[32px] pb-[12px] flex flex-wrap gap-[8px]">
            {selectedMembers.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-[6px] bg-[rgba(0,94,184,0.08)] border border-[rgba(0,94,184,0.2)] rounded-[20px] pl-[10px] pr-[6px] h-[28px]"
              >
                <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8] leading-none">
                  {m.name}
                </span>
                <button
                  onClick={() => toggleMember(m)}
                  className="flex items-center justify-center w-[16px] h-[16px] rounded-full hover:bg-[rgba(0,94,184,0.15)] transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" />
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

        {/* 群組名稱（選 2+ 人時顯示，必填）*/}
        {isGroup && (
          <div className="shrink-0 px-[32px] pb-[12px]">
            <div className="relative w-full" style={{ minHeight: '54px' }}>
              <div className={`absolute inset-0 pointer-events-none rounded-[8px] border border-solid ${groupNameError ? 'border-red-400' : 'border-[rgba(145,158,171,0.2)]'}`} />
              <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
                <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
                <p style={{ fontSize: '12px', fontWeight: 600, color: groupNameError ? '#ef4444' : '#637381' }}>群組名稱（必填）</p>
              </div>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="輸入群組名稱"
                className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent placeholder:text-[#919eab]"
              />
            </div>
          </div>
        )}

        {/* 人員列表 */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[16px]">
          {filtered.length === 0 ? (
            <p className="text-center text-[14px] text-[#919eab] py-[20px]">找不到相關人員</p>
          ) : (
            filtered.map(member => {
              const isSelected = !!selectedMembers.find(m => m.id === member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member)}
                  className={`flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[rgba(0,94,184,0.06)]' : 'hover:bg-[#f9fafb]'
                  }`}
                >
                  <Avatar src={member.avatar} bg={member.avatarBg} name={member.name} size={44} online={member.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] mb-[2px]">
                      <RoleBadge member={member} />
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px]">
                        {member.name}
                      </p>
                    </div>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] leading-[20px] truncate">
                      {member.company} · {member.email}
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
            })
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="shrink-0 px-[32px] py-[20px]">
          <button
            onClick={handleCreate}
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
        <img src={imageUrl} alt="圖片預覽" className="max-w-full max-h-full object-contain rounded-[8px]" />
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
      imageUrl: url,
      time: new Date().toLocaleString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }),
    });
  });
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function OnlineChatPage({ currentPage, onPageChange, onLogout, userRole }: OnlineChatPageProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(chatRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState('');
  const [panelWidth, setPanelWidth] = useState(300);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [showCreateOverlay, setShowCreateOverlay] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]); // 图片暂存區

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null;

  // 過濾聊天室列表
  const filteredRooms = rooms.filter(r => {
    const q = listSearch.toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.members.some(m =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      )
    );
  });

  // 顯示所有訊息
  const filteredMessages = selectedRoom ? selectedRoom.messages : [];

  // 自動捲到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoomId, filteredMessages.length]);

  // 進入聊天室 → 清除未讀
  const handleSelectRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    setRooms(prev => prev.map(r =>
      r.id === roomId ? { ...r, unreadCount: 0 } : r
    ));
    window.dispatchEvent(new CustomEvent('chatReadUpdated'));
  }, []);

  // 將 File[] 轉為 object URL 并加入暂存區（不直接送出）
  const stageImages = useCallback((files: File[]) => {
    const imgFiles = files.filter(f => f.type.startsWith('image/'));
    if (imgFiles.length === 0) return;
    const urls = imgFiles.map(f => URL.createObjectURL(f));
    setPendingImages(prev => [...prev, ...urls]);
  }, []);

  // 發送訊息（文字 + 暂存圖片一起送出）
  const handleSend = () => {
    if (!selectedRoom) return;
    const hasText = messageText.trim().length > 0;
    const hasImages = pendingImages.length > 0;
    if (!hasText && !hasImages) return;

    const time = new Date().toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
    const newMessages: ChatMessage[] = [];

    if (hasImages) {
      newMessages.push({
        id: `m-${Date.now()}-img`,
        senderId: 'me',
        type: 'image',
        imageUrls: [...pendingImages],
        time,
      });
    }
    if (hasText) {
      newMessages.push({
        id: `m-${Date.now()}-txt`,
        senderId: 'me',
        type: 'text',
        text: messageText.trim(),
        time,
      });
    }

    const lastMsg = hasText ? messageText.trim() : `[圖片 ${pendingImages.length} 張]`;
    setRooms(prev => prev.map(r =>
      r.id === selectedRoom.id
        ? { ...r, messages: [...r.messages, ...newMessages], lastMessage: lastMsg, lastTime: '剛剛' }
        : r
    ));
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
    setRooms(prev => [room, ...prev]);
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
              {filteredRooms.length === 0 ? (
                <p className="text-center text-[14px] text-[#919eab] py-[32px]">找不到相關對話</p>
              ) : (
                filteredRooms.map(room => (
                  <ChatListItem
                    key={room.id}
                    room={room}
                    isSelected={selectedRoomId === room.id}
                    onClick={() => handleSelectRoom(room.id)}
                  />
                ))
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
                    : <Avatar src={selectedRoom.avatar} bg={selectedRoom.avatarBg} name={selectedRoom.name} size={44} online={selectedRoom.members[0]?.isOnline} />
                  }

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px]">
                      {/* Badge */}
                      {selectedRoom.type === 'group'
                        ? <GroupBadge />
                        : (selectedRoom.members[0] && <RoleBadge member={selectedRoom.members[0]} />)
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
                  {filteredMessages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      room={selectedRoom}
                      onImageClick={url => setPreviewImage(url)}
                    />
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
        />
      )}
      {previewImage && (
        <ImagePreviewOverlay
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </ResponsivePageLayout>
  );
}
