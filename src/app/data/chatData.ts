// 共享聊天數據 - 用於ChatPageNew和Dashboard
import imgImgAvatar1 from "figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png";
import imgImgAvatar2 from "figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png";
import imgImgAvatar25 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";

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

// 採購相關的對話資料
export const chatData: ChatConversation[] = [
  {
    id: '1',
    name: '巨大-ann',
    avatar: imgImgAvatar1,
    avatarBg: '#ffdbde',
    lastMessage: '訂單編號: 4005....',
    time: '3 days',
    unreadCount: 6,
    messages: [
      { id: '1', sender: 'them', text: '你好', time: '2025/01/17 04:02 PM' },
      { id: '2', sender: 'them', text: '我們發現訂單編號4108917000的封裝有誤', time: '2025/01/17 04:02 PM' },
      { id: '3', sender: 'me', text: '請問是哪個品項呢', time: '2025/01/17 04:02 PM' },
      { id: '4', sender: 'them', text: '訂單序號10', time: '2025/01/17 04:02 PM' },
      { id: '5', sender: 'me', text: '我們會立即處理，預計明天重新出貨', time: '2025/01/17 04:03 PM' },
      { id: '6', sender: 'them', text: '好的，謝謝你的協助', time: '2025/01/17 04:03 PM' },
    ]
  },
  {
    id: '2',
    name: '巨大-OOO',
    avatar: imgImgAvatar2,
    avatarBg: '#f6d3bd',
    lastMessage: '我們的船運突然....',
    time: '3 days',
    unreadCount: 2,
    messages: [
      { id: '1', sender: 'them', text: '您好，想詢問一下訂單4205的交期', time: '2025/01/16 10:15 AM' },
      { id: '2', sender: 'me', text: '您好，讓我查詢一下', time: '2025/01/16 10:16 AM' },
      { id: '3', sender: 'me', text: '該訂單預計下週三出貨', time: '2025/01/16 10:17 AM' },
      { id: '4', sender: 'them', text: '我們的船運突然延遲了，可以改到下週五嗎？', time: '2025/01/16 10:20 AM' },
      { id: '5', sender: 'me', text: '沒問題，我幫您調整交期', time: '2025/01/16 10:21 AM' },
      { id: '6', sender: 'them', text: '太感謝了！', time: '2025/01/16 10:21 AM' },
    ]
  },
  {
    id: '3',
    name: '巨大-OOO',
    avatar: imgImgAvatar25,
    avatarBg: '#fff2b9',
    lastMessage: '好的，那我們這....',
    time: '3 days',
    unreadCount: 1,
    messages: [
      { id: '1', sender: 'them', text: '採購訂單5003的報價單可以提供嗎？', time: '2025/01/15 02:30 PM' },
      { id: '2', sender: 'me', text: '可以的，我現在就寄給您', time: '2025/01/15 02:31 PM' },
      { id: '3', sender: 'me', text: '已經寄到您的信箱了', time: '2025/01/15 02:32 PM' },
      { id: '4', sender: 'them', text: '收到了，謝謝', time: '2025/01/15 02:35 PM' },
      { id: '5', sender: 'them', text: '價格部分我們需要再內部討論一下', time: '2025/01/15 02:36 PM' },
      { id: '6', sender: 'me', text: '好的，那我們這週五前給您回覆可以嗎？', time: '2025/01/15 02:37 PM' },
      { id: '7', sender: 'them', text: '沒問題', time: '2025/01/15 02:37 PM' },
    ]
  }
];