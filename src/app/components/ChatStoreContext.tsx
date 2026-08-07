// ChatStoreContext.tsx
// 全局 Chat rooms state，讓 OnlineChatPage 與 FloatingChatPanel 共用同一份資料
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { chatRooms, availableMembers, type ChatRoom, type ChatMessage, type ChatMember } from '@/app/data/chatData';
import { MOCK_VENDORS } from '@/app/data/vendorData';

// ── 型別 ────────────────────────────────────────────────────────────────────

export type { ChatRoom, ChatMessage, ChatMember };
export { availableMembers };

interface ChatStore {
  rooms: ChatRoom[];
  pinnedIds: Set<string>;
  /** 目前浮動 panel 顯示的 roomId；null = panel 關閉 */
  floatingRoomId: string | null;
  /** OnlineChatPage 開啟後要自動選中的 roomId */
  activeRoomId: string | null;

  addRoom: (room: ChatRoom) => void;
  sendMessage: (roomId: string, text: string, imageUrls?: string[]) => void;
  markRead: (roomId: string) => void;
  togglePin: (roomId: string) => void;
  openFloating: (roomId: string) => void;
  closeFloating: () => void;
  setActiveRoomId: (roomId: string | null) => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const ChatStoreContext = createContext<ChatStore | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function ChatStoreProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<ChatRoom[]>(chatRooms);
  const [floatingRoomId, setFloatingRoomId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomIdState] = useState<string | null>(null);

  // 釘選狀態（localStorage 持久化）
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('chat_pinned_ids');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  const addRoom = useCallback((room: ChatRoom) => {
    setRooms(prev => {
      const existingDirect = room.type === 'direct'
        ? prev.find(r => r.type === 'direct' && r.members[0]?.id === room.members[0]?.id)
        : null;
      if (existingDirect) return prev;
      return [room, ...prev];
    });
    // 回傳 roomId（已存在或新增），讓呼叫端 openFloating
  }, []);

  const sendMessage = useCallback((roomId: string, text: string, imageUrls?: string[]) => {
    const time = new Date().toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
    const newMessages: ChatMessage[] = [];

    if (imageUrls && imageUrls.length > 0) {
      newMessages.push({
        id: 'm-' + Date.now() + '-img',
        senderId: 'me',
        type: 'image',
        imageUrls,
        time,
      });
    }
    if (text.trim()) {
      newMessages.push({
        id: 'm-' + Date.now() + '-txt',
        senderId: 'me',
        type: 'text',
        text: text.trim(),
        time,
      });
    }
    if (newMessages.length === 0) return;

    const lastMsg = text.trim() || '[圖片 ' + (imageUrls?.length ?? 0) + ' 張]';
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, messages: [...r.messages, ...newMessages], lastMessage: lastMsg, lastTime: '剛剛' }
        : r
    ));
  }, []);

  const markRead = useCallback((roomId: string) => {
    setRooms(prev => {
      const updated = prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r);
      const totalUnread = updated.reduce((sum, r) => sum + r.unreadCount, 0);
      window.dispatchEvent(new CustomEvent('chatReadUpdated', { detail: { count: totalUnread } }));
      return updated;
    });
  }, []);

  const togglePin = useCallback((roomId: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      next.has(roomId) ? next.delete(roomId) : next.add(roomId);
      localStorage.setItem('chat_pinned_ids', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const openFloating = useCallback((roomId: string) => {
    setFloatingRoomId(roomId);
  }, []);

  const closeFloating = useCallback(() => {
    setFloatingRoomId(null);
  }, []);

  const setActiveRoomId = useCallback((roomId: string | null) => {
    setActiveRoomIdState(roomId);
  }, []);

  return (
    <ChatStoreContext.Provider value={{
      rooms,
      pinnedIds,
      floatingRoomId,
      activeRoomId,
      addRoom,
      sendMessage,
      markRead,
      togglePin,
      openFloating,
      closeFloating,
      setActiveRoomId,
    }}>
      {children}
    </ChatStoreContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useChatStore(): ChatStore {
  const ctx = useContext(ChatStoreContext);
  if (!ctx) throw new Error('useChatStore must be used inside ChatStoreProvider');
  return ctx;
}

// ── 工具：根據訂單資料取得對話候選人 ────────────────────────────────────────
const AVATAR_POOL = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
];
const BG_POOL = [
  '#ffdbde', '#f6d3bd', '#fff2b9', '#d6f5d6',
  '#dbeafe', '#fce7f3', '#ede9fe', '#d1fae5',
];

export function getChatCandidates(
  userRole: string | undefined,
  vendorCode: string | undefined,
  purchaser: string | undefined,
): ChatMember[] {

  if (userRole === 'vendor') {
    // 廠商角色 → 找巨大採購員（從 availableMembers 中的 giant 身份）
    const giants = availableMembers.filter(m => m.role === 'giant');
    if (purchaser) {
      const matched = giants.filter(m => m.name === purchaser);
      const others  = giants.filter(m => m.name !== purchaser);
      return [...matched, ...others];
    }
    return giants;
  }

  // 巨大/採購角色 → 直接從 MOCK_VENDORS 找對應廠商的業務人員
  if (!vendorCode) {
    return availableMembers.filter(m => m.role === 'vendor');
  }

  // 直接用完整 vendorCode 比對，格式已統一為 8 位（如 '00010053'）
  const vendor = MOCK_VENDORS.find(v => v.code === vendorCode);

  if (!vendor || vendor.salesNames.length === 0) {
    return availableMembers.filter(m => m.role === 'vendor');
  }

  // 將廠商的 salesNames 轉為 ChatMember（company 用廠商簡稱）
  return vendor.salesNames.map((name, idx) => ({
    id: `vendor-${vendor.code}-${idx}`,
    name,
    company: vendor.name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@${vendor.code}.ep`,
    role: 'vendor' as const,
    vendorCode: vendor.code,
    avatar: AVATAR_POOL[idx % AVATAR_POOL.length],
    avatarBg: BG_POOL[(vendor.id + idx) % BG_POOL.length],
    isOnline: idx % 2 === 0,
  }));
}

export function findExistingDirectRoom(
  rooms: ChatRoom[],
  memberId: string,
): ChatRoom | undefined {
  return rooms.find(r =>
    r.type === 'direct' && r.members.some(m => m.id === memberId)
  );
}
