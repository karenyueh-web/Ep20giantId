// Dashboard 頁面的數據

export interface Order {
  id: string;
  orderNumber: string;
  status: 'new' | 'vendor-confirm' | 'completed';
  date: string;
  amount: number;
  customer: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

// 訂單數據
export const orders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'new',
    date: '2024-01-15',
    amount: 15000,
    customer: '台北分店'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    status: 'new',
    date: '2024-01-16',
    amount: 28000,
    customer: '台中分店'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    status: 'new',
    date: '2024-01-17',
    amount: 12500,
    customer: '高雄分店'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    status: 'new',
    date: '2024-01-18',
    amount: 32000,
    customer: '台南分店'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    status: 'new',
    date: '2024-01-19',
    amount: 19500,
    customer: '新北分店'
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    status: 'vendor-confirm',
    date: '2024-01-14',
    amount: 35000,
    customer: '桃園分店'
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    status: 'vendor-confirm',
    date: '2024-01-13',
    amount: 22000,
    customer: '新竹分店'
  },
  {
    id: '8',
    orderNumber: 'ORD-2024-008',
    status: 'vendor-confirm',
    date: '2024-01-12',
    amount: 18500,
    customer: '嘉義分店'
  },
  {
    id: '9',
    orderNumber: 'ORD-2024-009',
    status: 'vendor-confirm',
    date: '2024-01-11',
    amount: 27500,
    customer: '彰化分店'
  },
  {
    id: '10',
    orderNumber: 'ORD-2024-010',
    status: 'vendor-confirm',
    date: '2024-01-10',
    amount: 41000,
    customer: '宜蘭分店'
  },
  {
    id: '11',
    orderNumber: 'ORD-2024-011',
    status: 'completed',
    date: '2024-01-09',
    amount: 45000,
    customer: '基隆分店'
  }
];

// 公告數據
export const announcements: Announcement[] = [
  {
    id: '1',
    title: '2024年春節假期配送調整通知',
    date: '2024-01-15',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    title: '新版訂單管理系統上線',
    date: '2024-01-14',
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    title: '第一季度產品價格調整',
    date: '2024-01-13',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '4',
    title: '倉庫盤點時間公告',
    date: '2024-01-12',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '5',
    title: '供應商會議時間變更',
    date: '2024-01-11',
    isRead: false,
    priority: 'low'
  },
  {
    id: '6',
    title: '運費計算方式更新說明',
    date: '2024-01-10',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '7',
    title: '新增產品線資訊',
    date: '2024-01-09',
    isRead: false,
    priority: 'low'
  },
  {
    id: '8',
    title: '客戶滿意度調查',
    date: '2024-01-08',
    isRead: true,
    priority: 'low'
  }
];

// 計算統計數據
export function getDashboardStats() {
  const newOrdersCount = orders.filter(order => order.status === 'new').length;
  const vendorConfirmCount = orders.filter(order => order.status === 'vendor-confirm').length;
  const unreadAnnouncementsCount = announcements.filter(announcement => !announcement.isRead).length;
  
  return {
    newOrdersCount,
    vendorConfirmCount,
    unreadAnnouncementsCount
  };
}
