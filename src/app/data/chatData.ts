// chatData.ts — Online Chat 資料定義與 Mock 資料
import imgAvatar1 from 'figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png';
import imgAvatar2 from 'figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png';
import imgAvatar3 from 'figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png';
import imgAvatar4 from 'figma:asset/267fe8c99db3e57af5fb08e1bedfbdb0788f011c.png';

// ── 型別定義 ──────────────────────────────────────────────────────────────────

export interface ChatMember {
  id: string;
  name: string;
  company: string;
  email: string;
  role: 'vendor' | 'giant';
  avatar: string;
  avatarBg: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' 或 member.id
  type: 'text' | 'image' | 'system';
  text?: string;
  imageUrls?: string[];  // 支援多張圖片批次上傳
  time: string;     // 顯示用
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  avatarBg: string;
  members: ChatMember[];
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

// 舊型別（向後相容，供 Dashboard 使用）
export interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: Message[];
}

// ── 可搜尋人員清單（建立新對話用）────────────────────────────────────────────

export const availableMembers: ChatMember[] = [
  {
    id: 'giant-001',
    name: '王小明',
    company: '巨大機械',
    email: 'ming.wang@giant.com.tw',
    role: 'giant',
    avatar: imgAvatar1,
    avatarBg: '#ffdbde',
    isOnline: true,
  },
  {
    id: 'giant-002',
    name: '李美玲',
    company: '巨大機械',
    email: 'meiling.li@giant.com.tw',
    role: 'giant',
    avatar: imgAvatar2,
    avatarBg: '#f6d3bd',
    isOnline: true,
  },
  {
    id: 'giant-003',
    name: '陳志豪',
    company: '巨大機械',
    email: 'zhihao.chen@giant.com.tw',
    role: 'giant',
    avatar: imgAvatar3,
    avatarBg: '#fff2b9',
    isOnline: false,
  },
  {
    id: 'giant-004',
    name: '張雅婷',
    company: '巨大機械',
    email: 'yating.chang@giant.com.tw',
    role: 'giant',
    avatar: imgAvatar4,
    avatarBg: '#d6f5d6',
    isOnline: true,
  },
];

// ── Mock 聊天室資料 ────────────────────────────────────────────────────────────

export const chatRooms: ChatRoom[] = [
  // ① 一對一：王小明（有未讀）
  {
    id: 'room-001',
    type: 'direct',
    name: '王小明',
    avatar: imgAvatar1,
    avatarBg: '#ffdbde',
    members: [availableMembers[0]],
    lastMessage: '訂單編號 4108917000 的封裝有誤，麻煩確認',
    lastTime: '3d',
    unreadCount: 3,
    messages: [
      { id: 'm001', senderId: 'giant-001', type: 'text', text: '您好，我們發現訂單編號 4108917000 的封裝有誤', time: '2026/01/17 04:00 PM' },
      { id: 'm002', senderId: 'giant-001', type: 'text', text: '是訂單序號第 10 項，請確認一下', time: '2026/01/17 04:01 PM' },
      { id: 'm003', senderId: 'me',        type: 'text', text: '收到，我馬上查看', time: '2026/01/17 04:02 PM' },
      { id: 'm004', senderId: 'me',        type: 'text', text: '已確認，是包裝規格寫錯了，我們會立即處理', time: '2026/01/17 04:05 PM' },
      { id: 'm005', senderId: 'giant-001', type: 'text', text: '好的，預計什麼時候可以重新出貨？', time: '2026/01/17 04:06 PM' },
      { id: 'm006', senderId: 'me',        type: 'text', text: '預計明天重新出貨，我們會寄出貨通知給您', time: '2026/01/17 04:07 PM' },
      { id: 'm007', senderId: 'giant-001', type: 'text', text: '訂單編號 4108917000 的封裝有誤，麻煩確認', time: '2026/01/17 04:10 PM' },
    ],
  },

  // ② 一對一：李美玲（有未讀）
  {
    id: 'room-002',
    type: 'direct',
    name: '李美玲',
    avatar: imgAvatar2,
    avatarBg: '#f6d3bd',
    members: [availableMembers[1]],
    lastMessage: '我們的船運突然延遲，能改到下週五嗎？',
    lastTime: '3d',
    unreadCount: 1,
    messages: [
      { id: 'm001', senderId: 'giant-002', type: 'text', text: '您好，想詢問訂單 4205 的交期', time: '2026/01/16 10:15 AM' },
      { id: 'm002', senderId: 'me',        type: 'text', text: '您好，讓我查詢一下', time: '2026/01/16 10:16 AM' },
      { id: 'm003', senderId: 'me',        type: 'text', text: '該訂單預計下週三出貨', time: '2026/01/16 10:17 AM' },
      { id: 'm004', senderId: 'giant-002', type: 'text', text: '我們的船運突然延遲，能改到下週五嗎？', time: '2026/01/16 10:20 AM' },
    ],
  },

  // ③ 一對一：陳志豪（無未讀，含圖片訊息）
  {
    id: 'room-003',
    type: 'direct',
    name: '陳志豪',
    avatar: imgAvatar3,
    avatarBg: '#fff2b9',
    members: [availableMembers[2]],
    lastMessage: '報價單已寄到您信箱',
    lastTime: '5d',
    unreadCount: 0,
    messages: [
      { id: 'm001', senderId: 'giant-003', type: 'text', text: '採購訂單 5003 的報價單可以提供嗎？', time: '2026/01/15 02:30 PM' },
      { id: 'm002', senderId: 'me',        type: 'text', text: '可以的，我現在就寄給您', time: '2026/01/15 02:31 PM' },
      { id: 'm003', senderId: 'me',        type: 'text', text: '報價單已寄到您信箱', time: '2026/01/15 02:32 PM' },
      { id: 'm004', senderId: 'giant-003', type: 'text', text: '收到了，謝謝！價格部分需要內部討論', time: '2026/01/15 02:35 PM' },
      { id: 'm005', senderId: 'me',        type: 'text', text: '好的，另外附上最新的產品規格圖', time: '2026/01/15 02:36 PM' },
      { id: 'm006', senderId: 'me',        type: 'image', imageUrls: ['https://placehold.co/400x300/e3f2fd/1c252e?text=Product+Spec'], time: '2026/01/15 02:36 PM' },
      { id: 'm007', senderId: 'giant-003', type: 'text', text: '收到規格圖，我們這週五前給您回覆', time: '2026/01/15 02:40 PM' },
    ],
  },

  // ④ 群組：出貨協調群組（有未讀）
  {
    id: 'room-004',
    type: 'group',
    name: '出貨協調群組',
    avatar: imgAvatar4,
    avatarBg: '#d6f5d6',
    members: [availableMembers[0], availableMembers[1], availableMembers[3]],
    lastMessage: '張雅婷：明天的出貨確認一下數量',
    lastTime: '1d',
    unreadCount: 5,
    messages: [
      { id: 'm001', senderId: 'giant-001', type: 'text', text: '大家好，這個群組用來協調本季的出貨安排', time: '2026/01/18 09:00 AM' },
      { id: 'm002', senderId: 'giant-004', type: 'text', text: '好的，我會定期更新出貨進度', time: '2026/01/18 09:05 AM' },
      { id: 'm003', senderId: 'me',        type: 'text', text: '收到，有問題我會在這裡提出', time: '2026/01/18 09:10 AM' },
      { id: 'm004', senderId: 'giant-002', type: 'text', text: '1 月份的出貨計畫已更新，請查看', time: '2026/01/19 02:00 PM' },
      { id: 'm005', senderId: 'giant-001', type: 'image', imageUrls: ['https://placehold.co/400x300/fff3e0/1c252e?text=Shipping+Schedule'], time: '2026/01/19 02:05 PM' },
      { id: 'm006', senderId: 'me',        type: 'text', text: '已收到，目前備貨正常，按計畫出貨', time: '2026/01/19 03:00 PM' },
      { id: 'm007', senderId: 'giant-004', type: 'text', text: '明天的出貨確認一下數量', time: '2026/01/20 08:30 AM' },
    ],
  },
];

// ── 計算未讀數（供 NavigationList 使用）────────────────────────────────────────

export function getChatUnreadCount(): number {
  return chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);
}

// ── 舊版相容（供 Dashboard.tsx 使用）────────────────────────────────────────────

export const chatData: ChatConversation[] = chatRooms
  .filter(r => r.type === 'direct')
  .map(r => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    avatarBg: r.avatarBg,
    lastMessage: r.lastMessage,
    time: r.lastTime,
    unreadCount: r.unreadCount,
    messages: r.messages
      .filter(m => m.type === 'text')
      .map(m => ({
        id: m.id,
        sender: m.senderId === 'me' ? 'me' : 'them',
        text: m.text || '',
        time: m.time,
      })) as Message[],
  }));