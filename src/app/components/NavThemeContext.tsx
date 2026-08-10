import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── 佈局類型 ──────────────────────────────────────────────────────────────────
export type NavLayout = 'sidebar' | 'topnav';

// ── 主題 token（由帳號類型決定，使用者不可更改）────────────────────────────────
export interface NavThemeTokens {
  bg: string;                  // Sidebar / TopNav 背景色
  activeBg: string;            // 選中項目背景
  hoverBg: string;             // Hover 背景
  activeText: string;          // 選中文字 & icon 顏色
  inactiveText: string;        // 未選中文字顏色
  inactiveIcon: string;        // 未選中 icon 顏色
  submenuActiveText: string;   // 子選單選中文字
  submenuHoverText: string;    // 子選單 hover 文字
  flyoutBg: string;            // Mini flyout 背景
  flyoutActiveBg: string;      // Mini flyout 選中背景
  flyoutActiveText: string;    // Mini flyout 選中文字
  sectionLabel: string;        // OVERVIEW / Management 標題顏色
  logoTitle: string;           // Logo 主標題顏色
  logoSubtitle: string;        // Logo 副標題顏色
  borderColor: string;         // 分隔線顏色
  miniItemActiveBg: string;    // Mini mode 選中背景
  miniItemHoverBg: string;     // Mini mode hover 背景
}

// ── 主題定義 ──────────────────────────────────────────────────────────────────

/** 巨大帳號：深灰 + 金黃（原有配色） */
const DARK_THEME: NavThemeTokens = {
  bg:                 '#2B2B2B',
  activeBg:           'rgba(255,184,0,0.15)',
  hoverBg:            'rgba(255,184,0,0.08)',
  activeText:         '#ffb800',
  inactiveText:       '#a8aeb3',
  inactiveIcon:       '#637381',
  submenuActiveText:  '#ffc933',
  submenuHoverText:   '#ffd666',
  flyoutBg:           '#1a2230',
  flyoutActiveBg:     'rgba(255,184,0,0.13)',
  flyoutActiveText:   '#FFB800',
  sectionLabel:       '#919eab',
  logoTitle:          '#ffffff',
  logoSubtitle:       'rgba(255,255,255,0.55)',
  borderColor:        'rgba(145,158,171,0.12)',
  miniItemActiveBg:   'rgba(255,184,0,0.15)',
  miniItemHoverBg:    'rgba(255,184,0,0.08)',
};

/** 廠商帳號：深藍 + 白（新配色） */
const BLUE_THEME: NavThemeTokens = {
  bg:                 '#1e3a5f',
  activeBg:           'rgba(255,255,255,0.18)',
  hoverBg:            'rgba(255,255,255,0.09)',
  activeText:         '#ffffff',
  inactiveText:       'rgba(255,255,255,0.65)',
  inactiveIcon:       'rgba(255,255,255,0.55)',
  submenuActiveText:  '#ffffff',
  submenuHoverText:   'rgba(255,255,255,0.85)',
  flyoutBg:           '#163354',
  flyoutActiveBg:     'rgba(255,255,255,0.14)',
  flyoutActiveText:   '#ffffff',
  sectionLabel:       'rgba(255,255,255,0.45)',
  logoTitle:          '#ffffff',
  logoSubtitle:       'rgba(255,255,255,0.55)',
  borderColor:        'rgba(255,255,255,0.1)',
  miniItemActiveBg:   'rgba(255,255,255,0.18)',
  miniItemHoverBg:    'rgba(255,255,255,0.09)',
};

// ── Context 型別 ──────────────────────────────────────────────────────────────
interface NavThemeContextType {
  /** 目前的佈局（sidebar 或 topnav） */
  navLayout: NavLayout;
  /** 切換佈局（sidebar ↔ topnav），設定存 localStorage */
  toggleLayout: () => void;
  /** 目前的主題 token（根據帳號類型決定） */
  theme: NavThemeTokens;
  /** 是否為廠商帳號 */
  isVendor: boolean;
  /** 可見頂層選單數量是否 ≤ 10（超過則不開放 Top Nav） */
  canUseTopNav: boolean;
}

const LAYOUT_STORAGE_KEY = 'nav-layout-preference';

const NavThemeContext = createContext<NavThemeContextType>({
  navLayout: 'sidebar',
  toggleLayout: () => {},
  theme: DARK_THEME,
  isVendor: false,
  canUseTopNav: true,
});

// ── 計算可見頂層選單數量 ───────────────────────────────────────────────────────
// 對應 NavigationList 的所有 NavItem（不含 SubMenuItem）
const TOP_LEVEL_NAV_IDS = [
  // OVERVIEW
  'overview-vendor-review',
  'overview-receiving',
  'overview-schedule',
  'overview-vendor-eval',
  // MANAGEMENT
  'mgmt-parts',
  'mgmt-order',
  'mgmt-correction',
  'mgmt-shipping',
  'mgmt-quality',
  'mgmt-invoice',
  'mgmt-insurance',
  'mgmt-esg',
  'mgmt-ship-tw',
  'mgmt-account',
  'mgmt-system',
] as const;

function countVisibleNavItems(): number {
  const roleId = localStorage.getItem('currentUserRoleId') ?? '';
  // IT 角色全開 → 全部 15 個，必定超過 10
  if (roleId === 'giant-it') return TOP_LEVEL_NAV_IDS.length;
  const key = `permission-settings-${roleId}`;
  const raw = localStorage.getItem(key);
  // 未設定權限 → 全開
  if (!raw) return TOP_LEVEL_NAV_IDS.length;
  try {
    const allowed = JSON.parse(raw) as string[];
    return TOP_LEVEL_NAV_IDS.filter(id =>
      allowed.some(a => a === id || a.startsWith(id + '-'))
    ).length;
  } catch {
    return TOP_LEVEL_NAV_IDS.length;
  }
}

export function useNavTheme() {
  return useContext(NavThemeContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────
interface NavThemeProviderProps {
  children: React.ReactNode;
  /** 帳號類型，來自 App.tsx 的 userRole state（'vendor' | 'procurement' | 'giant'） */
  userType: string;
}

export function NavThemeProvider({ children, userType }: NavThemeProviderProps) {
  const isVendor = userType === 'vendor';

  // 主題由帳號類型決定，使用者不可改變
  const theme = isVendor ? BLUE_THEME : DARK_THEME;

  // 可見頂層選單數量判斷（超過 10 個鎖定 Sidebar）
  const canUseTopNav = countVisibleNavItems() <= 10;

  // 佈局由 localStorage 偏好決定（使用者可切換），但不可用時強制 sidebar
  const [navLayout, setNavLayout] = useState<NavLayout>(() => {
    if (!canUseTopNav) return 'sidebar';
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved === 'sidebar' || saved === 'topnav') return saved;
    return 'sidebar';
  });

  // 若權限改變導致 canUseTopNav 變 false，自動切回 sidebar
  useEffect(() => {
    if (!canUseTopNav && navLayout === 'topnav') {
      setNavLayout('sidebar');
    }
  }, [canUseTopNav, navLayout]);

  // 切換版面設計（僅在 canUseTopNav 時有效）
  const toggleLayout = useCallback(() => {
    if (!canUseTopNav) return;
    setNavLayout(prev => {
      const next: NavLayout = prev === 'sidebar' ? 'topnav' : 'sidebar';
      localStorage.setItem(LAYOUT_STORAGE_KEY, next);
      return next;
    });
  }, [canUseTopNav]);

  // 注入 CSS 變數到 document.documentElement，讓全域 CSS 可讀取
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--nav-bg',                theme.bg);
    root.style.setProperty('--nav-active-bg',         theme.activeBg);
    root.style.setProperty('--nav-hover-bg',          theme.hoverBg);
    root.style.setProperty('--nav-active-text',       theme.activeText);
    root.style.setProperty('--nav-inactive-text',     theme.inactiveText);
    root.style.setProperty('--nav-inactive-icon',     theme.inactiveIcon);
    root.style.setProperty('--nav-submenu-active',    theme.submenuActiveText);
    root.style.setProperty('--nav-submenu-hover',     theme.submenuHoverText);
    root.style.setProperty('--nav-flyout-bg',         theme.flyoutBg);
    root.style.setProperty('--nav-flyout-active-bg',  theme.flyoutActiveBg);
    root.style.setProperty('--nav-flyout-active-text',theme.flyoutActiveText);
    root.style.setProperty('--nav-section-label',     theme.sectionLabel);
    root.style.setProperty('--nav-border',            theme.borderColor);
    root.style.setProperty('--nav-mini-active-bg',    theme.miniItemActiveBg);
    root.style.setProperty('--nav-mini-hover-bg',     theme.miniItemHoverBg);
  }, [theme]);

  return (
    <NavThemeContext.Provider value={{ navLayout, toggleLayout, theme, isVendor, canUseTopNav }}>
      {children}
    </NavThemeContext.Provider>
  );
}
