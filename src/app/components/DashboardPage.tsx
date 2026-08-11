// DashboardPage.tsx — 依角色權限動態組合版型
// 版型 A：公告 + Chat + 訂單（廠商-業務 / 巨大-採購）
// 版型 B：公告 + Chat（廠商-品保/開發 / 巨大-倉儲/整採/品保/開發）
// 版型 C：純公告全寬（廠商-下包商）

import { useState, useMemo } from 'react';
import { loadAnnouncements, getUnitLabel } from './announcementData';
import { chatRooms } from '../data/chatData';
import { useOrderStore, type HistoryEntry } from './OrderStoreContext';
import { useNavPermission } from './NavigationList';
import type { PageType } from './MainLayout';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  onPageChange: (page: PageType) => void;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE_MAP: Record<string, { bg: string; text: string }> = {
  NP: { bg: 'rgba(255,86,48,0.16)',   text: '#b71d18' },
  V:  { bg: 'rgba(0,184,217,0.16)',   text: '#006c9c' },
  B:  { bg: 'rgba(142,51,255,0.16)',  text: '#5119b7' },
  CK: { bg: 'rgba(34,197,94,0.16)',   text: '#118d57' },
  CL: { bg: 'rgba(145,158,171,0.16)', text: '#637381' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE_MAP[status] ?? STATUS_BADGE_MAP.CL;
  return (
    <div
      className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]"
      style={{ backgroundColor: s.bg }}
    >
      <p
        className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center whitespace-nowrap"
        style={{ color: s.text }}
      >
        {status}
      </p>
    </div>
  );
}

// ─── 共用工具 ──────────────────────────────────────────────────────────────────

/** 從歷程中找最近一次 B→V 的日期（庫商視角：「採購回覆時間」） */
function getPurchaseReplyDate(history: HistoryEntry[]): string {
  const entry = history.find(h => h.event.includes('B→V'));
  if (!entry) return '-';
  return entry.date.split(' ')[0];
}

/** 從歷程中找最近一次 V→B 的日期（巨大視角：「庫商回覆日期」） */
function getVendorReplyDate(history: HistoryEntry[]): string {
  const entry = history.find(h => h.event.includes('V→B'));
  if (!entry) return '-';
  return entry.date.split(' ')[0];
}

// ─── 公告欄區塊 ───────────────────────────────────────────────────────────────

interface AnnouncementSectionProps {
  fullWidth?: boolean;
  onPageChange: (page: PageType) => void;
}

function AnnouncementSection({ fullWidth = false, onPageChange }: AnnouncementSectionProps) {
  const announcements = useMemo(() => loadAnnouncements(), []);
  const unreadIds = useMemo(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem('announcementReadIds') || '[]'));
    } catch { return new Set<string>(); }
  }, []);

  // Dashboard badge 顯示未讀筆數（與 sidebar icon badge 一致）
  const unreadCount = useMemo(
    () => announcements.filter(a => !unreadIds.has(a.id)).length,
    [announcements, unreadIds]
  );

  return (
    <div className={`bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden ${fullWidth ? 'w-full' : 'flex-1 min-w-0'}`}>
      {/* 標題列 */}
      <div className="shrink-0 flex items-center justify-between px-[20px] h-[56px] border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex items-center gap-[8px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#1c252e] text-[16px]">
            未讀公告
          </p>
          {unreadCount > 0 && (
            <div className="h-[22px] min-w-[22px] rounded-[6px] flex items-center justify-center px-[6px] bg-[rgba(255,86,48,0.16)]">
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-[#b71d18]">{unreadCount}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => onPageChange('announcement')}
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
        >
          查看全部
        </button>
      </div>

      {/* 表頭 */}
      <div className="shrink-0 flex items-center h-[40px] bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)]">
        {fullWidth && (
          <div className="shrink-0 flex items-center justify-center" style={{ width: 80, paddingLeft: 16, paddingRight: 8 }}>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px]">狀態</p>
          </div>
        )}
        <div className="shrink-0 px-[16px]" style={{ width: 140 }}>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">發佈單位</p>
        </div>
        <div className="shrink-0 px-[16px]" style={{ width: 130 }}>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px]">發布者</p>
        </div>
        <div className="flex-1 min-w-0 px-[16px]">
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px]">內容</p>
        </div>
        <div className="shrink-0 px-[16px]" style={{ width: 130 }}>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px]">發布日期</p>
        </div>
      </div>

      {/* 公告列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {announcements.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">目前沒有公告</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const isUnread = !unreadIds.has(ann.id);
            return (
              <div
                key={ann.id}
                className="flex items-center border-b border-[rgba(145,158,171,0.08)] hover:bg-[#f5f6f7] transition-colors cursor-pointer"
                style={{ minHeight: 52 }}
                onClick={() => onPageChange('announcement')}
              >
                {/* 狀態（下包商全寬版才顯示） */}
                {fullWidth && (
                  <div className="shrink-0 flex items-center justify-center" style={{ width: 80, paddingLeft: 16, paddingRight: 8 }}>
                    {isUnread && (
                      <div className="flex items-center gap-[4px]">
                        <div className="w-[8px] h-[8px] rounded-full bg-[#ff5630] shrink-0" />
                        <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#ff5630]">unread</p>
                      </div>
                    )}
                  </div>
                )}
                {/* 發佈單位 */}
                <div className="shrink-0 px-[16px] py-[10px]" style={{ width: 140 }}>
                  <span className="inline-flex items-center h-[22px] px-[8px] rounded-[6px] text-[12px] font-semibold leading-none whitespace-nowrap bg-[rgba(0,94,184,0.10)] text-[#005eb8] max-w-full">
                    <span className="truncate" style={{ maxWidth: 104 }}>{getUnitLabel(ann.publisherUnit)}</span>
                  </span>
                </div>
                {/* 發布者 */}
                <div className="shrink-0 px-[16px] py-[12px]" style={{ width: 130 }}>
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px] truncate">
                    {ann.publisherName}
                    {!fullWidth && isUnread && (
                      <span className="ml-[6px] inline-block w-[6px] h-[6px] rounded-full bg-[#ff5630] align-middle" />
                    )}
                  </p>
                </div>
                {/* 內容 */}
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">
                    {ann.titleZh}
                  </p>
                </div>
                {/* 發布日期 */}
                <div className="shrink-0 px-[16px] py-[12px]" style={{ width: 130 }}>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">
                    {ann.publishedAt.split('T')[0].replace(/-/g, '/')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Chatbox 區塊 ─────────────────────────────────────────────────────────────

interface ChatboxSectionProps {
  onPageChange: (page: PageType) => void;
}

function ChatboxSection({ onPageChange }: ChatboxSectionProps) {
  const totalUnread = chatRooms.reduce((s, r) => s + r.unreadCount, 0);

  // 排序：未讀優先 → 再依 lastTime 由新到舊（'1d' < '3d' < '5d'）
  const sortedRooms = useMemo(() => {
    const parseTime = (t: string) => {
      const n = parseInt(t, 10);
      return isNaN(n) ? 9999 : n;
    };
    return [...chatRooms].sort((a, b) => {
      // 未讀 > 已讀
      const aUnread = a.unreadCount > 0 ? 0 : 1;
      const bUnread = b.unreadCount > 0 ? 0 : 1;
      if (aUnread !== bUnread) return aUnread - bUnread;
      // 同層再依時間由新到舊（數字越小 = 越近）
      return parseTime(a.lastTime) - parseTime(b.lastTime);
    });
  }, []);

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden flex-1 min-w-0">
      {/* 標題列 */}
      <div className="shrink-0 flex items-center justify-between px-[20px] h-[56px] border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex items-center gap-[8px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#1c252e] text-[16px]">
            Chatbox
          </p>
          {totalUnread > 0 && (
            <div className="h-[22px] min-w-[22px] rounded-[6px] flex items-center justify-center px-[6px] bg-[rgba(0,184,217,0.16)]">
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-[#006c9c]">{totalUnread}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => onPageChange('online-chat')}
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer"
        >
          開啟對話
        </button>
      </div>

      {/* 對話列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {sortedRooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center gap-[12px] px-[16px] py-[12px] border-b border-[rgba(145,158,171,0.08)] hover:bg-[#f5f6f7] transition-colors cursor-pointer"
            onClick={() => onPageChange('online-chat')}
          >
            {/* 頭像 */}
            <div
              className="shrink-0 w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: room.avatarBg }}
            >
              <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
            </div>

            {/* 名稱 + 最後訊息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-[4px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px] truncate">
                  {room.name}
                </p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#919eab] leading-[18px] shrink-0 whitespace-nowrap">
                  {room.lastTime}
                </p>
              </div>
              <div className="flex items-center justify-between gap-[4px]">
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381] leading-[20px] truncate">
                  {room.lastMessage}
                </p>
                {room.unreadCount > 0 && (
                  <div className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-[#22c55e] flex items-center justify-center px-[4px]">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[11px] text-white leading-none">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 訂單區塊（廠商-業務）────────────────────────────────────────────────────

function VendorOrderSection({ onPageChange }: { onPageChange: (page: PageType) => void }) {
  const [activeTab, setActiveTab] = useState<'NP' | 'V'>('NP');
  const { orders, getOrderHistory } = useOrderStore();
  const hasNav = useNavPermission();
  const hasOrderMgmt = hasNav('mgmt-order');

  const tabData = useMemo(() => ({
    NP: orders.filter(o => o.status === 'NP'),
    V:  orders.filter(o => o.status === 'V'),
  }), [orders]);

  const displayOrders = tabData[activeTab];

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden w-full">
      {/* Tabs */}
      <div className="shrink-0 flex items-center gap-[40px] h-[48px] px-[20px] relative">
        {([['NP', '未處理訂單'], ['V', '廠商確認中']] as const).map(([tab, label]) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-[8px] h-[48px] relative shrink-0 cursor-pointer"
          >
            {activeTab === tab && (
              <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            )}
            <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] text-[14px] relative shrink-0 ${activeTab === tab ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
              {label}
            </p>
            <div
              className={`h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px] ${
                activeTab === tab
                  ? tab === 'NP' ? 'bg-[rgba(255,86,48,0.16)]' : 'bg-[rgba(0,184,217,0.16)]'
                  : 'bg-[rgba(145,158,171,0.16)]'
              }`}
            >
              <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] ${
                activeTab === tab
                  ? tab === 'NP' ? 'text-[#b71d18]' : 'text-[#006c9c]'
                  : 'text-[#637381]'
              }`}>
                {tabData[tab].length}
              </p>
            </div>
          </div>
        ))}
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* 表頭：訂單日期、單號序號、公司、採購組織（有訂單權限加料號/品名）、訂貨量（V tab 加採購回覆時間） */}
      <div className="shrink-0 flex items-center h-[40px] bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)]" style={{ minWidth: 700 }}>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">訂單日期</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">單號序號</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">公司</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">採購組織</p></div>
        {hasOrderMgmt && (
          <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">料號</p></div>
        )}
        {hasOrderMgmt && (
          <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">品名</p></div>
        )}
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">訂貨量</p></div>
        {activeTab === 'V' && (
          <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">採購回覆時間</p></div>
        )}
      </div>

      {/* 訂單列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
        {displayOrders.length === 0 ? (
          <div className="flex items-center justify-center py-[32px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">目前沒有資料</p>
          </div>
        ) : (
          displayOrders.map(order => {
            const history = getOrderHistory(order.id);
            const purchaseReplyDate = activeTab === 'V' ? getPurchaseReplyDate(history) : null;
            return (
              <div
                key={order.id}
                className="flex items-center border-b border-[rgba(145,158,171,0.08)] hover:bg-[#f5f6f7] transition-colors cursor-pointer"
                style={{ minHeight: 48, minWidth: 700 }}
                onClick={() => onPageChange('mgmt-order')}
              >
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">{order.orderDate}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] leading-[22px] cursor-pointer whitespace-nowrap">{order.docSeqNo}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px] truncate">{order.company || '-'}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">{order.purchaseOrg || '-'}</p>
                </div>
                {hasOrderMgmt && (
                  <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">{order.materialNo || '-'}</p>
                  </div>
                )}
                {hasOrderMgmt && (
                  <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">{order.productName || '-'}</p>
                  </div>
                )}
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px]">{order.orderQty}</p>
                </div>
                {activeTab === 'V' && (
                  <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                    <p className={`font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] whitespace-nowrap ${purchaseReplyDate === '-' ? 'text-[#919eab]' : 'text-[#637381]'}`}>
                      {purchaseReplyDate}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


// ─── 訂單區塊（巨大-採購）────────────────────────────────────────────────────

function PurchaseOrderSection({ onPageChange }: { onPageChange: (page: PageType) => void }) {
  const { orders, getOrderHistory } = useOrderStore();

  const vOrders = useMemo(() => orders.filter(o => o.status === 'V'), [orders]);

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] flex flex-col overflow-hidden w-full">
      {/* Tab（單一 Tab） */}
      <div className="shrink-0 flex items-center gap-[40px] h-[48px] px-[20px] relative">
        <div className="flex items-center gap-[8px] h-[48px] relative shrink-0">
          <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
          <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] text-[14px] text-[#1c252e] relative shrink-0">
            採購確認中
          </p>
          <div className="h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px] bg-[rgba(0,184,217,0.16)]">
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-[#006c9c]">{vOrders.length}</p>
          </div>
        </div>
        <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
      </div>

      {/* 表頭：訂單日期、單號序號、公司、採購組織、廠商(編號)、料號、品名、訂貨量、廠商回覆日期 */}
      <div className="shrink-0 flex items-center h-[40px] bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)]" style={{ minWidth: 1100 }}>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">訂單日期</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">單號序號</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">公司</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">採購組織</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">廠商(編號)</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">料號</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">品名</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">訂貨量</p></div>
        <div className="flex-1 min-w-0 px-[16px]"><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] leading-[18px] whitespace-nowrap">廠商回覆日期</p></div>
      </div>

      {/* 訂單列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
        {vOrders.length === 0 ? (
          <div className="flex items-center justify-center py-[32px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">目前沒有資料</p>
          </div>
        ) : (
          vOrders.map(order => {
            const history = getOrderHistory(order.id);
            const vendorReplyDate = getVendorReplyDate(history);
            return (
              <div
                key={order.id}
                className="flex items-center border-b border-[rgba(145,158,171,0.08)] hover:bg-[#f5f6f7] transition-colors cursor-pointer"
                style={{ minHeight: 48, minWidth: 900 }}
                onClick={() => onPageChange('mgmt-order')}
              >
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">{order.orderDate}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] leading-[22px] cursor-pointer whitespace-nowrap">{order.docSeqNo}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px] truncate">{order.company || '-'}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">{order.purchaseOrg || '-'}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">
                    {order.vendorName ? `${order.vendorName}(${order.vendorCode})` : order.vendorCode || '-'}
                  </p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">{order.materialNo || '-'}</p>
                </div>
                {/* 品名 */}
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] truncate">{order.productName || '-'}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px]">{order.orderQty}</p>
                </div>
                <div className="flex-1 min-w-0 px-[16px] py-[12px]">
                  <p className={`font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] whitespace-nowrap ${vendorReplyDate === '-' ? 'text-[#919eab]' : 'text-[#637381]'}`}>{vendorReplyDate}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── DashboardPage 主元件 ─────────────────────────────────────────────────────

export function DashboardPage({ onPageChange }: DashboardPageProps) {
  const hasNav = useNavPermission();
  const userType = localStorage.getItem('currentUserType') || 'giant';

  const showAnnouncement = hasNav('overview-announcement');
  const showChat        = hasNav('overview-chat');
  const showOrder       = hasNav('mgmt-order');

  // 判斷要顯示哪種訂單版型
  // 廠商有訂單 → VendorOrderSection（NP + V Tab）
  // 巨大有訂單 → PurchaseOrderSection（V Tab，含採購回覆日期）
  const orderSection = showOrder
    ? userType === 'vendor'
      ? <VendorOrderSection onPageChange={onPageChange} />
      : <PurchaseOrderSection onPageChange={onPageChange} />
    : null;

  // 版型 C：純公告全寬（沒有 Chat，沒有訂單）
  if (showAnnouncement && !showChat && !showOrder) {
    return (
      <div className="flex flex-col gap-[16px] w-full h-full">
        <AnnouncementSection fullWidth onPageChange={onPageChange} />
      </div>
    );
  }

  // 版型 B / A：公告左半 + Chat 右側
  return (
    <div className="flex flex-col gap-[16px] w-full h-full">
      {/* 上排：公告 + Chat */}
      {(showAnnouncement || showChat) && (
        <div className="flex gap-[16px]" style={{ height: showOrder ? 320 : undefined, flex: showOrder ? '0 0 320px' : '1' }}>
          {showAnnouncement && <AnnouncementSection onPageChange={onPageChange} />}
          {showChat && <ChatboxSection onPageChange={onPageChange} />}
        </div>
      )}

      {/* 下排：訂單區塊 */}
      {orderSection && (
        <div className="flex-1 min-h-0 flex">
          {orderSection}
        </div>
      )}
    </div>
  );
}

// 向後相容 export（MainLayout 等地方使用）
export function DashboardPageContent() {
  return null;
}
