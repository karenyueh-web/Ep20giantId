// FloatingChatPanel.tsx
// 右下角浮動聊天視窗，點訂單頁的氣泡 icon 後顯示
import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, getChatCandidates, type ChatRoom, type ChatMember } from './ChatStoreContext';
import { availableMembers } from '@/app/data/chatData';
import { SearchField } from './SearchField';

// ── 小型 Avatar ──────────────────────────────────────────────────────────────
function MiniAvatar({ src, bg, name, size = 32 }: { src?: string; bg: string; name: string; size?: number }) {
  return (
    <div className="relative shrink-0 rounded-full overflow-hidden flex items-center justify-center" style={{ width: size, height: size, backgroundColor: bg }}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e] select-none" style={{ fontSize: size * 0.38 }}>{name.charAt(0)}</span>
      }
    </div>
  );
}

// ── 上一次閱讀位置分隔線 ──────────────────────────────────────────────────
function UnreadDivider({ divRef }: { divRef?: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={divRef} className="flex items-center gap-[8px] py-[4px]">
      <div className="flex-1 h-[1px] bg-[rgba(0,94,184,0.25)]" />
      <p className="shrink-0 font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#005eb8] whitespace-nowrap">上一次的閱讀位置</p>
      <div className="flex-1 h-[1px] bg-[rgba(0,94,184,0.25)]" />
    </div>
  );
}

// ── 訊息氣泡 ─────────────────────────────────────────────────────────────────
function Bubble({ msg, room }: { msg: ChatRoom['messages'][0]; room: ChatRoom }) {
  const isMe = msg.senderId === 'me';
  const member = !isMe ? room.members.find(m => m.id === msg.senderId) : null;

  if (msg.type === 'system') {
    return (
      <div className="flex items-center gap-[6px] py-[2px]">
        <div className="flex-1 h-[1px] bg-[rgba(145,158,171,0.15)]" />
        <p className="shrink-0 text-[11px] text-[#919eab]">{msg.text}</p>
        <div className="flex-1 h-[1px] bg-[rgba(145,158,171,0.15)]" />
      </div>
    );
  }

  if (msg.type === 'context') {
    // 單據資料卡片：獨立一區，極淡鵝黃底 + 鵝黃虛線框，與一般氣泡明顯區別
    const fields = (msg.text ?? '').split(' | ');
    return (
      <div className="w-full rounded-[10px] border border-dashed border-[rgba(255,171,0,0.5)] bg-[rgba(255,171,0,0.06)] px-[12px] py-[10px]">
        {/* 標題列 */}
        <div className="flex items-center gap-[6px] mb-[8px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b76e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b76e00] leading-none tracking-wide uppercase">單據資料</p>
          <div className="flex-1 h-[1px] bg-[rgba(255,171,0,0.3)]" />
        </div>
        {/* 各欄位：欄位名稱粗體，值正常 */}
        <div className="flex flex-wrap gap-x-[12px] gap-y-[4px]">
          {fields.map((field, i) => {
            const colonIdx = field.indexOf('：');
            if (colonIdx !== -1) {
              const label = field.slice(0, colonIdx);   // 欄位名稱（不含：）
              const value = field.slice(colonIdx + 1);  // 值
              return (
                <p key={i} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-[#454f5b] leading-[18px]">
                  <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold">{label}：</span>{value}
                </p>
              );
            }
            return (
              <p key={i} className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-[#454f5b] leading-[18px]">
                {field}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  if (isMe) {
    return (
      <div className="w-full">
        {msg.type === 'text' && (
          <div className="w-full px-[12px] py-[8px] rounded-[8px] bg-[rgba(0,94,184,0.07)] border border-[rgba(0,94,184,0.15)]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] leading-[20px] whitespace-pre-wrap">
              {msg.text}
              <span className="inline-block ml-[8px] text-[10px] text-[#919eab] align-bottom">{msg.time}</span>
            </p>
          </div>
        )}
        {msg.type === 'image' && (msg.imageUrls?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-[6px]">
            {msg.imageUrls!.map((url, i) => (
              <img key={i} src={url} alt="" className="w-[72px] h-[72px] object-cover rounded-[6px] border border-[rgba(145,158,171,0.2)]" />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-[8px]">
      {member && <MiniAvatar src={member.avatar} bg={member.avatarBg} name={member.name} size={28} />}
      <div className="flex flex-col gap-[3px] max-w-[75%]">
        <p className="text-[10px] text-[#919eab]">{msg.time}</p>
        {msg.type === 'text' && (
          <div className="px-[12px] py-[8px] rounded-[10px] rounded-tl-[4px] bg-white border border-[rgba(145,158,171,0.2)]">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] leading-[20px] whitespace-pre-wrap">{msg.text}</p>
          </div>
        )}
        {msg.type === 'image' && (msg.imageUrls?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-[6px]">
            {msg.imageUrls!.map((url, i) => (
              <img key={i} src={url} alt="" className="w-[72px] h-[72px] object-cover rounded-[6px] border border-[rgba(145,158,171,0.2)]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface FloatingChatPanelProps {
  onPageChange?: (page: import('./MainLayout').PageType) => void;
  userRole?: string;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function FloatingChatPanel({ onPageChange, userRole }: FloatingChatPanelProps) {
  const chatStore = useChatStore();
  const { rooms, sendMessage, markRead, closeFloating } = chatStore;
  const roomId = chatStore.floatingRoomId;
  const room = roomId ? rooms.find(r => r.id === roomId) : null;
  const [text, setText] = useState('');
  const [minimized, setMinimized] = useState(false);

  // 每次切換到新對話時，重設為展開狀態
  useEffect(() => {
    if (roomId) setMinimized(false);
  }, [roomId]);
  const [showSwitch, setShowSwitch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 開啟時標記已讀
  useEffect(() => {
    if (room && roomId) markRead(roomId);
  }, [roomId, room, markRead]);

  // 自動捲動：有未讀分隔線時捲到分隔線，否則捲到底
  useEffect(() => {
    if (!minimized) {
      setTimeout(() => {
        if (dividerRef.current) {
          dividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  }, [room?.messages.length, minimized]);

  if (!roomId || !room) return null;

  const primaryMember = room.type === 'direct' ? room.members[0] : null;

  // 置換按鈕可用條件：廠商底下還有其他業務可選（扣掉目前這位後 > 0）
  const switchVendorCode = primaryMember?.role === 'vendor' ? primaryMember.vendorCode : undefined;
  const switchCandidates = getChatCandidates(userRole, switchVendorCode, undefined);
  const canSwitch = switchCandidates.filter(c => c.id !== primaryMember?.id).length > 0;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(roomId, text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const handleGoToChat = () => {
    chatStore.setActiveRoomId(roomId);
    closeFloating();
    onPageChange?.('online-chat');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 透明背景層：點擊空白處關閉 */}
      <div className="fixed inset-0 z-[149]" onClick={() => closeFloating()} />

      <div
        className="fixed bottom-[24px] right-[24px] z-[150] flex flex-col rounded-[16px] overflow-hidden shadow-[0px_8px_40px_0px_rgba(28,37,62,0.18),0px_0px_0px_1px_rgba(145,158,171,0.12)] transition-all duration-200"
        style={{ width: 380, height: minimized ? 56 : 520 }}
      >
      {/* ── 標題列 ── */}
      <div
        onClick={() => setMinimized(v => !v)}
        className="shrink-0 flex items-center gap-[10px] px-[16px] h-[56px] bg-[#1c252e] select-none cursor-pointer"
      >
        {primaryMember
          ? <MiniAvatar src={primaryMember.avatar} bg={primaryMember.avatarBg} name={primaryMember.name} size={36} />
          : <div className="shrink-0 w-[36px] h-[36px] rounded-full bg-[#374151] flex items-center justify-center"><span className="text-[12px] text-white font-bold">G</span></div>
        }
        <div className="flex-1 min-w-0">
          {/* 第一行：廠商簡稱-姓名 或 群組名 */}
          <div className="flex items-center gap-[6px] min-w-0">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-white truncate leading-tight">
              {room.type === 'direct' && primaryMember
                ? primaryMember.role === 'giant'
                  ? `巨大採購-${primaryMember.name}`
                  : `${primaryMember.company}-${primaryMember.name}`
                : room.name}
            </p>
          </div>
          {/* 群組顯示成員數 */}
          {room.type === 'group' && (
            <p className="text-[11px] text-[#919eab] leading-none mt-[2px]">{room.members.length} 位成員</p>
          )}
        </div>

        {/* 置換對象（左右箭頭）：廠商只有一位業務時 disable */}
        <button
          onClick={e => { e.stopPropagation(); if (canSwitch) setShowSwitch(true); }}
          disabled={!canSwitch}
          className="shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-full transition-colors"
          style={{ opacity: canSwitch ? 1 : 0.3, cursor: canSwitch ? 'pointer' : 'not-allowed' }}
          onMouseEnter={e => { if (canSwitch) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          title={canSwitch ? '換選對話對象' : '此廠商無其他業務可選'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 8H3m0 0l4-4M3 8l4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 16h18m0 0l-4-4m4 4l-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>


        {/* 前往完整頁面 */}
        <button
          onClick={e => { e.stopPropagation(); handleGoToChat(); }}
          className="shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-white/10 transition-colors"
          title="查看完整對話"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 11L11 3M11 3H6M11 3V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── 主體（展開時顯示）── */}
      {!minimized && (
        <>
          {/* 訊息區 */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f9fafb] px-[16px] py-[12px] flex flex-col gap-[10px] custom-scrollbar">
            {room.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-[8px] py-[40px]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" stroke="#c4cdd5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[12px] text-[#c4cdd5]">還沒有訊息，說聲哈囉吧！</p>
              </div>
            ) : (
              room.messages.map((msg, i) => (
                <React.Fragment key={msg.id}>
                  {/* 在第一則未讀訊息前插入「上一次的閱讀位置」分隔線 */}
                  {room.lastSeenCount != null && i === room.lastSeenCount && (
                    <UnreadDivider divRef={dividerRef} />
                  )}
                  <Bubble msg={msg} room={room} />
                </React.Fragment>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 輸入列 */}
          <div className="shrink-0 bg-white border-t border-[rgba(145,158,171,0.15)] px-[12px] py-[10px] flex items-end gap-[8px]">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="輸入訊息… (Enter 送出)"
              rows={1}
              className="flex-1 min-h-0 resize-none rounded-[8px] bg-[#f4f6f8] px-[12px] py-[8px] text-[13px] text-[#1c252e] placeholder:text-[#919eab] outline-none leading-[20px] max-h-[80px] overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 80) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="shrink-0 flex items-center justify-center w-[34px] h-[34px] rounded-full transition-colors disabled:opacity-30"
              style={{ backgroundColor: '#005eb8' }}
              onMouseEnter={e => { if (text.trim()) e.currentTarget.style.backgroundColor = '#004680'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#005eb8'; }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" fill="white" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* 置換對象：ChatSelectOverlay */}
      {showSwitch && (() => {
        const vendorMember = room?.members.find(m => m.role === 'vendor');
        const switchVendorCode = vendorMember?.vendorCode;
        const purchaser = room?.members.find(m => m.role === 'giant')?.name;
        const candidates = getChatCandidates(userRole, switchVendorCode, purchaser);
        // 把當前對話人標為 disabled，保留在清單但無法選取
        const disabledIds = new Set(primaryMember ? [primaryMember.id] : []);
        return (
          <ChatSelectOverlay
            candidates={candidates}
            disabledIds={disabledIds}
            userRole={userRole}
            title="尋找其他夥伴"
            subtitle="選擇要切換的對話對象"
            actionLabel="開始對話"
            onClose={() => setShowSwitch(false)}
            onCreateRoom={newRoom => {
              // 先找是否已有與同一成員的既存 direct room
              const existing = newRoom.type === 'direct'
                ? rooms.find(r => r.type === 'direct' && r.members[0]?.id === newRoom.members[0]?.id)
                : null;
              if (existing) {
                chatStore.openFloating(existing.id);
              } else {
                chatStore.addRoom(newRoom);
                chatStore.openFloating(newRoom.id);
              }
              setShowSwitch(false);
            }}
          />
        );
      })()}
      </div>
    </>
  );
}

// ── 選人 Overlay（帶預帶候選人）────────────────────────────────────────────────
interface ChatSelectOverlayProps {
  /** 預帶的候選人清單（已排序，前幾個是最相關的） */
  candidates: ChatMember[];
  /** 不可選取的成員 id 集合（顯示但 disabled，例如：當前已在對話中的人）*/
  disabledIds?: Set<string>;
  onClose: () => void;
  onCreateRoom: (room: ChatRoom) => void;
  userRole?: string;
  currentVendorCode?: string;
  /** 自訂標題，預設「開始對話」 */
  title?: string;
  /** 自訂副標，預設依 userRole 顯示 */
  subtitle?: string;
  /** 確認按鈕文字，預設「開始對話」 */
  actionLabel?: string;
  /**
   * 從單據明細開啟對話時傳入的單據資料文字。
   * 使用者送出第一則訊息時，系統會自動將此文字拼接在訊息前面一起送出。
   */
  initialMessage?: string;
}

export function ChatSelectOverlay({
  candidates, disabledIds, onClose, onCreateRoom, userRole, currentVendorCode,
  title = '開始對話',
  subtitle,
  actionLabel = '開始對話',
  initialMessage,
}: ChatSelectOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<ChatMember[]>([]);

  const displayed = searchQuery.trim()
    ? candidates.filter(m => {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        );
      })
    : candidates;

  const toggle = (m: ChatMember) => {
    setSelected(prev =>
      prev.find(s => s.id === m.id)
        ? prev.filter(s => s.id !== m.id)
        : [...prev, m]
    );
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    const first = selected[0];
    const newRoom: ChatRoom = {
      id: 'room-' + Date.now(),
      type: selected.length === 1 ? 'direct' : 'group',
      name: selected.length === 1 ? first.name : selected.map(m => m.name).join(', '),
      avatar: first.avatar,
      avatarBg: first.avatarBg,
      members: selected,
      lastMessage: '',
      lastTime: '剛剛',
      unreadCount: 0,
      messages: [],
      initialMessage,
    };
    onCreateRoom(newRoom);
    onClose();
  };

  const RoleBadge = ({ member }: { member: ChatMember }) => {
    if (member.role === 'giant') {
      return <span className="shrink-0 inline-flex items-center h-[16px] px-[5px] rounded-[3px] font-bold text-[10px] leading-none whitespace-nowrap bg-[rgba(0,94,184,0.1)] text-[#005eb8]">巨大</span>;
    }
    const short = member.company.length > 5 ? member.company.slice(0, 5) : member.company;
    return <span className="shrink-0 inline-flex items-center h-[16px] px-[5px] rounded-[3px] font-bold text-[10px] leading-none whitespace-nowrap bg-[rgba(107,70,193,0.1)] text-[#6b46c1]">{short}</span>;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-[16px] shadow-[0px_24px_64px_0px_rgba(28,37,62,0.18)] flex flex-col overflow-hidden" style={{ width: 480, maxHeight: '80vh' }}>

        {/* 標題 */}
        <div className="shrink-0 flex items-center justify-between px-[24px] pt-[24px] pb-[16px]">
          <div>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e] leading-[28px]">{title}</p>
            <p className="text-[13px] text-[#637381]">
              {subtitle ?? (userRole === 'vendor' ? '已為您預先帶入採購人員' : '已為您預先帶入廠商業務人員')}
            </p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[#f4f6f8] transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="#637381" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 已選 chips — 樣式與 OnlineChatPage CreateChatOverlay 完全一致 */}
        {selected.length > 0 && (() => {
          const getChipLabel = (m: ChatMember) => {
            if (m.role === 'giant') return `巨大-${m.name}`;
            const shortCompany = m.company.length > 6 ? m.company.slice(0, 6) : m.company;
            return `${shortCompany}-${m.name}`;
          };
          const getChipStyle = (m: ChatMember) => m.role === 'giant'
            ? { bg: 'rgba(0,94,184,0.08)', border: 'rgba(0,94,184,0.2)', text: '#005eb8', hover: 'rgba(0,94,184,0.15)', stroke: '#005eb8' }
            : { bg: 'rgba(107,70,193,0.08)', border: 'rgba(107,70,193,0.2)', text: '#6b46c1', hover: 'rgba(107,70,193,0.15)', stroke: '#6b46c1' };
          return (
            <div className="shrink-0 px-[24px] pb-[12px] flex flex-wrap gap-[8px]">
              {selected.map(m => (
                <div
                  key={m.id}
                  style={{ backgroundColor: getChipStyle(m).bg, borderColor: getChipStyle(m).border }}
                  className="flex items-center gap-[6px] border rounded-[20px] pl-[10px] pr-[6px] h-[28px]"
                >
                  <span
                    style={{ color: getChipStyle(m).text }}
                    className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-none"
                  >
                    {getChipLabel(m)}
                  </span>
                  <button
                    onClick={() => toggle(m)}
                    className="flex items-center justify-center w-[16px] h-[16px] rounded-full transition-colors"
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = getChipStyle(m).hover; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1l6 6M7 1L1 7" stroke={getChipStyle(m).stroke} strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* 搜尋框 */}
        <div className="shrink-0 px-[24px] pb-[12px]">
          <SearchField label="搜尋姓名、廠商、email" value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* 人員清單 */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-[12px] pb-[8px]">
          {displayed.length === 0 ? (
            <p className="text-center text-[13px] text-[#919eab] py-[24px]">找不到相關人員</p>
          ) : (
            displayed.map(m => {
              const isSel = !!selected.find(s => s.id === m.id);
              const isDisabled = disabledIds?.has(m.id) ?? false;
              return (
                <div
                  key={m.id}
                  onClick={() => { if (!isDisabled) toggle(m); }}
                  className={`flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px] transition-colors ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSel
                        ? 'bg-[rgba(0,94,184,0.05)] cursor-pointer'
                        : 'hover:bg-[#f9fafb] cursor-pointer'
                  }`}
                >
                  <div className="relative shrink-0">
                    <MiniAvatar src={m.avatar} bg={m.avatarBg} name={m.name} size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[5px] mb-[1px]">
                      <RoleBadge member={m} />
                      <p className="font-semibold text-[13px] text-[#1c252e]">{m.name}</p>
                      {isDisabled && <span className="text-[11px] text-[#919eab]">對話中</span>}
                    </div>
                    <p className="text-[12px] text-[#637381] truncate">{m.email}</p>
                  </div>
                  <div className={`shrink-0 flex items-center justify-center w-[20px] h-[20px] rounded-full border-2 transition-colors ${
                    isDisabled
                      ? 'border-[rgba(145,158,171,0.3)] bg-[rgba(145,158,171,0.1)]'
                      : isSel
                        ? 'bg-[#005eb8] border-[#005eb8]'
                        : 'border-[rgba(145,158,171,0.4)]'
                  }`}>
                    {isSel && !isDisabled && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="shrink-0 px-[24px] py-[20px] border-t border-[rgba(145,158,171,0.15)]">
          <button
            onClick={handleStart}
            disabled={selected.length === 0}
            className="w-full h-[44px] rounded-[8px] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#005eb8' }}
            onMouseEnter={e => { if (selected.length > 0) e.currentTarget.style.backgroundColor = '#004680'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#005eb8'; }}
          >
            {selected.length > 1 ? '建立群組對話' : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
