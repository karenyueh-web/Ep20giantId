import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Megaphone, ClipboardList, FilePen, Truck,
  Receipt, Users, Settings as SettingsIcon, UserCheck, Component,
  Shield, ShieldCheck, PackageCheck, CalendarDays,
  MessageCircle, Globe, PanelLeft,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import type { PageType } from './MainLayout';
import { useNavTheme } from './NavThemeContext';
import { useLanguage, type Language } from './LanguageContext';
import { AvatarCropOverlay, getAvatarKey } from './NavigationList';
import { getChatUnreadCount } from '@/app/data/chatData';
import { mockVendorsSuccess, mockVendorsFail } from '@/imports/廠商帳號審核-4007-9767';

// ── 通知數量 hook（複用 NavigationList 同邏輯）──────────────────────────────────
const ANNOUNCEMENT_MOCK_VERSION = 'v2';
function getAnnouncementUnreadCount(): number {
  try {
    const version = localStorage.getItem('announcementMockVersion');
    const announcementsRaw = localStorage.getItem('announcements');
    const readIdsRaw = localStorage.getItem('announcementReadIds');
    const totalIds: string[] = announcementsRaw
      ? (JSON.parse(announcementsRaw) as { id: string }[]).map(a => a.id)
      : ['ann-001', 'ann-002', 'ann-003', 'ann-004'];
    if (version !== ANNOUNCEMENT_MOCK_VERSION) return totalIds.length;
    const readIds: string[] = readIdsRaw ? JSON.parse(readIdsRaw) : [];
    const readSet = new Set(readIds);
    return totalIds.filter(id => !readSet.has(id)).length;
  } catch { return 0; }
}

function useTopBarNotifications() {
  const [counts, setCounts] = useState(() => ({
    announcement: getAnnouncementUnreadCount(),
    chat: getChatUnreadCount(),
  }));
  useEffect(() => {
    const refreshAnn = () => setCounts(p => ({ ...p, announcement: getAnnouncementUnreadCount() }));
    const refreshChat = (e: Event) => {
      const count = (e as CustomEvent<{ count: number }>).detail?.count;
      setCounts(p => ({ ...p, chat: count ?? getChatUnreadCount() }));
    };
    window.addEventListener('storage', refreshAnn);
    window.addEventListener('announcementReadUpdated', refreshAnn);
    window.addEventListener('chatReadUpdated', refreshChat);
    return () => {
      window.removeEventListener('storage', refreshAnn);
      window.removeEventListener('announcementReadUpdated', refreshAnn);
      window.removeEventListener('chatReadUpdated', refreshChat);
    };
  }, []);
  return counts;
}

// ── 選單定義 ──────────────────────────────────────────────────────────────────
interface TopMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  page?: PageType;           // 若有直接 page，點擊直接跳頁
  children?: { label: string; page: PageType }[];  // 子選單
}

function useNavPermission() {
  const roleId = localStorage.getItem('currentUserRoleId') ?? '';
  if (roleId === 'giant-it') return () => true;
  const key = `permission-settings-${roleId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return () => true;
  try {
    const allowed = JSON.parse(raw) as string[];
    return (featureId: string) =>
      allowed.some(id => id === featureId || id.startsWith(featureId + '-'));
  } catch { return () => true; }
}

const ICON_PROPS = { size: 16, strokeWidth: 2 } as const;

function buildMenuItems(hasNav: (id: string) => boolean, notifications: { announcement: number; chat: number }, vendorReviewCount?: number): TopMenuItem[] {
  const items: TopMenuItem[] = [];

  // Dashboard、公佈欄、Chat 已在右側 icon 區，不重複出現在中間選單
  if (hasNav('overview-vendor-review')) items.push({ id: 'vendor-account-review', label: '廠商審核', icon: <UserCheck {...ICON_PROPS}/>, page: 'vendor-account-review' });
  if (hasNav('overview-receiving'))     items.push({ id: 'receiving-inquiry',    label: '收料查詢', icon: <PackageCheck {...ICON_PROPS}/>, page: 'receiving-inquiry' });
  if (hasNav('overview-schedule'))      items.push({ id: 'schedule-inquiry',     label: '排程總表', icon: <CalendarDays {...ICON_PROPS}/>, page: 'schedule-inquiry' });
  if (hasNav('overview-vendor-eval'))   items.push({ id: 'vendor-evaluation',    label: '廠商評價', icon: <ShieldCheck {...ICON_PROPS}/>, page: 'vendor-evaluation' });

  // ── 零件/索樣 ──
  if (hasNav('mgmt-parts')) {
    const children = [
      hasNav('mgmt-parts-info')        && { label: '報價單',   page: 'parts-maintain' as const },
      hasNav('mgmt-parts-print-quote') && { label: '列印報價單', page: 'parts-quote'    as const },
      hasNav('mgmt-parts-sample')      && { label: '索樣單',     page: 'parts-sample'   as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'parts', label: '報價/索樣', icon: <Component {...ICON_PROPS}/>, children });
  }

  // ── 訂單管理 ──
  if (hasNav('mgmt-order')) {
    const children = [
      hasNav('mgmt-order-general')         && { label: '一般訂單查詢',   page: 'order-list'            as const },
      hasNav('mgmt-order-exchange')        && { label: '換貨(J)單據查詢', page: 'order-exchange'        as const },
      hasNav('mgmt-order-return')          && { label: '退貨單據查詢',   page: 'order-return'          as const },
      hasNav('mgmt-order-forecast')        && { label: '預測訂單查詢',   page: 'order-forecast'        as const },
      hasNav('mgmt-order-schedule-change') && { label: '變更生管排程',   page: 'order-schedule-change' as const },
      hasNav('mgmt-order-history')         && { label: '歷史訂單查詢',   page: 'order-history'         as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'order', label: '訂單管理', icon: <ClipboardList {...ICON_PROPS}/>, children });
  }

  // ── 修正單管理 ──
  if (hasNav('mgmt-correction')) {
    const children = [
      hasNav('mgmt-correction-create')  && { label: '建立修正單', page: 'correction-create'  as const },
      hasNav('mgmt-correction-list')    && { label: '修正單查詢', page: 'correction-list'    as const },
      hasNav('mgmt-correction-history') && { label: '歷史修正單', page: 'correction-history' as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'correction', label: '修正單', icon: <FilePen {...ICON_PROPS}/>, children });
  }

  // ── 出貨單 ──
  if (hasNav('mgmt-shipping')) {
    const children = [
      hasNav('mgmt-shipping-create')   && { label: '建立出貨單',   page: 'shipping-create'   as const },
      hasNav('mgmt-shipping-list')     && { label: '出貨單查詢',   page: 'shipping-list'     as const },
      hasNav('mgmt-shipping-packing')  && { label: '出貨/裝箱明細', page: 'shipping-packing'  as const },
      hasNav('mgmt-shipping-print')    && { label: '列印單據',     page: 'shipping-print'    as const },
      hasNav('mgmt-shipping-settings') && { label: '基本設定',     page: 'shipping-settings' as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'shipping', label: '出貨單', icon: <Truck {...ICON_PROPS}/>, children });
  }

  // ── 品保作業 ──
  if (hasNav('mgmt-quality')) {
    const children = [
      hasNav('mgmt-quality-abnormal') && { label: '品質異常單',   page: 'quality-abnormal' as const },
      hasNav('mgmt-quality-report')   && { label: '檢驗/測試報告', page: 'quality-report'   as const },
      hasNav('mgmt-quality-hazard')   && { label: '危害物質管理', page: 'quality-hazard'   as const },
      hasNav('mgmt-quality-other')    && { label: '其他設定',     page: 'quality-other'    as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'quality', label: '品保作業', icon: <ShieldCheck {...ICON_PROPS}/>, children });
  }

  // ── 發票作業 ──
  if (hasNav('mgmt-invoice')) {
    const children = [
      hasNav('mgmt-invoice-create')   && { label: '開立發票', page: 'invoice-create'   as const },
      hasNav('mgmt-invoice-list')     && { label: '發票查詢', page: 'invoice-list'     as const },
      hasNav('mgmt-invoice-settings') && { label: '發票設定', page: 'invoice-settings' as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'invoice', label: '發票作業', icon: <Receipt {...ICON_PROPS}/>, children });
  }

  if (hasNav('mgmt-insurance')) items.push({ id: 'insurance', label: '產險維護', icon: <Shield {...ICON_PROPS}/>, page: 'insurance-maintain' });

  // ── 帳號管理 ──
  if (hasNav('mgmt-account')) {
    const children = [
      hasNav('mgmt-account-vendor') && { label: '廠商帳號管理', page: 'vendor-account-management' as const },
      hasNav('mgmt-account-giant')  && { label: '巨大帳號管理', page: 'giant-account-management'  as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'account', label: '帳號管理', icon: <Users {...ICON_PROPS}/>, children });
  }

  // ── 系統設定 ──
  if (hasNav('mgmt-system')) {
    const children = [
      hasNav('mgmt-system-permission') && { label: '角色權限設定', page: 'permission-settings' as const },
      hasNav('mgmt-system-schedule')   && { label: '排程設定',     page: 'schedule-settings'  as const },
    ].filter(Boolean) as { label: string; page: PageType }[];
    if (children.length) items.push({ id: 'system', label: '系統設定', icon: <SettingsIcon {...ICON_PROPS}/>, children });
  }

  return items;
}


// ── Dropdown Panel ─────────────────────────────────────────────────────────────
interface DropdownProps {
  item: TopMenuItem;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  anchorRect: DOMRect;
  theme: ReturnType<typeof useNavTheme>['theme'];
  onClose: () => void;
  onMenuEnter: () => void;
  onMenuLeave: () => void;
}

function TopNavDropdown({ item, currentPage, onNavigate, anchorRect, theme, onClose, onMenuEnter, onMenuLeave }: DropdownProps) {
  const children = item.children ?? [];
  return createPortal(
    // 移除透明遮罩：它會蓋住 nav bar (z-200)，導致 hover 事件無法觸發
    // 改由 onMenuLeave 控制關閉時機
    <div
      className="fixed z-[500] rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-hidden"
      style={{
        left: anchorRect.left,
        top: anchorRect.bottom + 4,
        minWidth: 200,
        backgroundColor: theme.flyoutBg,
        border: `1px solid ${theme.borderColor}`,
      }}
      onMouseEnter={onMenuEnter}
      onMouseLeave={onMenuLeave}
    >
      {children.map((child, idx) => {
        const isActive = currentPage === child.page;
        return (
          <div
            key={idx}
            className="flex items-center gap-[10px] px-[14px] py-[10px] cursor-pointer transition-colors"
            style={{ backgroundColor: isActive ? theme.flyoutActiveBg : undefined }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = ''; }}
            onClick={() => { onNavigate(child.page); onClose(); }}
          >
            <div
              className="size-[5px] rounded-full shrink-0"
              style={{ backgroundColor: isActive ? theme.flyoutActiveText : '#4a5568' }}
            />
            <p
              className="text-[13px] leading-[20px]"
              style={{
                fontFamily: isActive ? "'Public_Sans:SemiBold',sans-serif" : "'Public_Sans:Regular',sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? theme.flyoutActiveText : theme.inactiveText,
              }}
            >
              {child.label}
            </p>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

// ── Language Dropdown ──────────────────────────────────────────────────────────
function TopBarLangDropdown({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void; theme: ReturnType<typeof useNavTheme>['theme'] }) {
  const { language, setLanguage } = useLanguage();
  const options: { value: Language; label: string }[] = [
    { value: '繁中', label: '繁中' },
    { value: '簡中', label: '簡中' },
    { value: 'English', label: 'English' },
  ];
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-[490]" onClick={onClose} />
      <div className="absolute top-[calc(100%+6px)] right-0 z-[500] rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.45)] overflow-hidden" style={{ minWidth: 120, backgroundColor: theme.flyoutBg, border: `1px solid ${theme.borderColor}` }}>
        {options.map(opt => (
          <div
            key={opt.value}
            className="px-[14px] py-[10px] cursor-pointer transition-colors"
            style={{ backgroundColor: language === opt.value ? theme.flyoutActiveBg : undefined }}
            onMouseEnter={e => { if (language !== opt.value) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (language !== opt.value) (e.currentTarget as HTMLDivElement).style.backgroundColor = ''; }}
            onClick={() => { setLanguage(opt.value); onClose(); }}
          >
            <p style={{ fontFamily: "'Public_Sans:SemiBold',sans-serif", fontWeight: 600, fontSize: 13, color: language === opt.value ? theme.flyoutActiveText : theme.inactiveText }}>{opt.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main NavTopBar Component ───────────────────────────────────────────────────
interface NavTopBarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

export function NavTopBar({ currentPage, onPageChange, onLogout }: NavTopBarProps) {
  const { theme, toggleLayout } = useNavTheme();
  const hasNav = useNavPermission();
  const notifications = useTopBarNotifications();
  const vendorReviewCount = mockVendorsSuccess.length + mockVendorsFail.length;

  const menuItems = buildMenuItems(hasNav, notifications, vendorReviewCount);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleItemHover = useCallback((id: string) => {
    // 清掉關閉 timer，開啟對應 dropdown
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const el = itemRefs.current.get(id);
    if (el) {
      setDropdownRect(el.getBoundingClientRect());
      setOpenDropdown(id);
    }
  }, []);

  const handleNoDropdownHover = useCallback(() => {
    // 滑過沒有子選單的項目時，立即關閉現有 dropdown
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setOpenDropdown(null);
  }, []);

  const handleItemLeave = useCallback(() => {
    // 延遲關閉，讓使用者有時間移到 dropdown panel
    hoverTimerRef.current = setTimeout(() => setOpenDropdown(null), 200);
  }, []);

  const cancelHide = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); }, []);

  const currentUserName = localStorage.getItem('currentUserName') || '';
  const currentUserType = localStorage.getItem('currentUserType') || 'giant';
  const firstChar = currentUserName.charAt(0) || '?';
  const avatarBg = currentUserType === 'vendor' ? '#5b21b6' : '#00559c';

  // 讀取已上傳的頭像，並監聽更改事件
  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    () => localStorage.getItem(getAvatarKey())
  );
  useEffect(() => {
    const handler = () => setAvatarSrc(localStorage.getItem(getAvatarKey()));
    window.addEventListener('userAvatarChanged', handler);
    return () => window.removeEventListener('userAvatarChanged', handler);
  }, []);

  // 裁切器狀態：直接在 NavTopBar 管理，不依賴事件橋接
  const [showCropper, setShowCropper] = useState(false);

  const handleAvatarClick = useCallback(() => {
    setShowCropper(true);
  }, []);

  const handleAvatarSave = useCallback((dataUrl: string) => {
    localStorage.setItem(getAvatarKey(), dataUrl);
    window.dispatchEvent(new Event('userAvatarChanged'));
    setShowCropper(false);
  }, []);

  const iconBtnCls = 'relative flex items-center justify-center rounded-full size-[34px] cursor-pointer transition-colors shrink-0';

  return (
    <div
      className="shrink-0 flex items-center w-full h-[56px] px-[16px] gap-[4px] z-[200]"
      style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.borderColor}` }}
    >
      {/* Logo */}
      <div
        className="flex flex-col justify-center shrink-0 mr-[12px] cursor-pointer select-none"
        onClick={() => onPageChange('dashboard')}
        title="回到 Dashboard"
      >
        <p
          className="font-bold leading-none text-[18px] tracking-[0.04em] uppercase"
          style={{ fontFamily: "'Public_Sans:Bold',sans-serif", color: theme.logoTitle }}
        >
          Giant Group
        </p>
        <p
          className="font-normal leading-[20px] text-[16px] mt-[2px]"
          style={{ fontFamily: "'Public_Sans:Regular',sans-serif", color: '#ffffff' }}
        >
          vendor online operation platform
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-[28px] mx-[8px] shrink-0" style={{ backgroundColor: theme.borderColor }} />

      {/* Nav items - scrollable */}
      <div className="flex-1 flex items-center gap-[2px] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {menuItems.map(item => {
          const isActive = item.page
            ? currentPage === item.page
            : (item.children?.some(c => c.page === currentPage) ?? false);
          const hasChildren = (item.children?.length ?? 0) > 0;

          return (
            <div
              key={item.id}
              ref={el => { if (el) itemRefs.current.set(item.id, el); else itemRefs.current.delete(item.id); }}
              className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[6px] cursor-pointer whitespace-nowrap transition-colors shrink-0"
              style={{
                backgroundColor: isActive ? theme.activeBg : undefined,
                color: isActive ? theme.activeText : theme.inactiveText,
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.hoverBg;
                // 有子選單 → 開 dropdown；無子選單 → 立即關掉現有 dropdown
                if (hasChildren) handleItemHover(item.id);
                else handleNoDropdownHover();
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
                if (hasChildren) handleItemLeave();
              }}
              onClick={() => {
                if (item.page) onPageChange(item.page);
              }}
            >
              <span style={{ opacity: 0.85 }}>{item.icon}</span>
              <span
                className="text-[13px]"
                style={{
                  fontFamily: isActive ? "'Public_Sans:SemiBold',sans-serif" : "'Public_Sans:Medium',sans-serif",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </span>
              {hasChildren && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6 }}>
                  <path d="M2.5 3.5L5 6.5L7.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-[2px] shrink-0 ml-[8px]">

        {/* Announcement */}
        <button
          className={iconBtnCls}
          style={{ color: theme.inactiveText }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          onClick={() => onPageChange('announcement')}
          title="公佈欄"
        >
          <Megaphone size={18} strokeWidth={1.8} />
          {notifications.announcement > 0 && (
            <span className="absolute top-[-2px] right-[-2px] min-w-[16px] h-[16px] rounded-full bg-[#ff5630] flex items-center justify-center px-[3px]">
              <span className="text-white text-[10px] leading-none">{notifications.announcement > 99 ? '99+' : notifications.announcement}</span>
            </span>
          )}
        </button>

        {/* Chat */}
        <button
          className={iconBtnCls}
          style={{ color: theme.inactiveText }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          onClick={() => onPageChange('online-chat')}
          title="Online Chat"
        >
          <MessageCircle size={18} strokeWidth={1.8} />
          {notifications.chat > 0 && (
            <span className="absolute top-[-2px] right-[-2px] min-w-[16px] h-[16px] rounded-full bg-[#ff5630] flex items-center justify-center px-[3px]">
              <span className="text-white text-[10px] leading-none">{notifications.chat > 99 ? '99+' : notifications.chat}</span>
            </span>
          )}
        </button>

        {/* Language */}
        <div className="relative">
          <button
            className={iconBtnCls}
            style={{ color: theme.inactiveText }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            onClick={() => setLangOpen(v => !v)}
            title="語言設定"
          >
            <Globe size={18} strokeWidth={1.8} />
          </button>
          <TopBarLangDropdown isOpen={langOpen} onClose={() => setLangOpen(false)} theme={theme} />
        </div>

        {/* Settings */}
        <button
          className={iconBtnCls}
          style={{ color: theme.inactiveText }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          onClick={() => onPageChange('personal-settings')}
          title="個人設定"
        >
          <SettingsIcon size={18} strokeWidth={1.8} />
        </button>

        {/* Layout toggle */}
        <button
          className={iconBtnCls}
          style={{ color: theme.inactiveText }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          onClick={toggleLayout}
          title="切換為側邊導覽列"
        >
          <PanelLeft size={18} strokeWidth={1.8} />
        </button>

        {/* Divider */}
        <div className="w-px h-[24px] mx-[4px]" style={{ backgroundColor: theme.borderColor }} />

        {/* User avatar */}
        <button
          className="relative size-[32px] rounded-full overflow-hidden cursor-pointer shrink-0 ml-[4px] hover:opacity-80 transition-opacity group"
          onClick={handleAvatarClick}
          title="點擊更換頭像"
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" className="size-full object-cover rounded-full" />
          ) : (
            <div
              className="size-full rounded-full flex items-center justify-center"
              style={{ backgroundColor: avatarBg }}
            >
              <span
                className="text-white text-[14px] leading-none select-none font-bold"
                style={{ fontFamily: "'Public_Sans:Bold',sans-serif" }}
              >
                {firstChar}
              </span>
            </div>
          )}
          {/* hover 提示遺罩 */}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            className={iconBtnCls}
            style={{ color: theme.inactiveText }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            onClick={onLogout}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown — 直接傳 mouse handlers 進 portal，不用無效的 wrapper div */}
      {openDropdown && dropdownRect && (() => {
        const item = menuItems.find(m => m.id === openDropdown);
        if (!item?.children?.length) return null;
        return (
          <TopNavDropdown
            item={item}
            currentPage={currentPage}
            onNavigate={onPageChange}
            anchorRect={dropdownRect}
            theme={theme}
            onClose={() => setOpenDropdown(null)}
            onMenuEnter={cancelHide}
            onMenuLeave={handleItemLeave}
          />
        );
      })()}

      {/* 頭像裁切器（Top Nav 模式下直接在此 render） */}
      {showCropper && (
        <AvatarCropOverlay
          name={currentUserName}
          role={currentUserType}
          onClose={() => setShowCropper(false)}
          onSave={handleAvatarSave}
        />
      )}
    </div>
  );
}
