/**
 * pageConfig.ts — 頁面設定單一來源 (Single Source of Truth)
 *
 * 所有頁面的 title、breadcrumb、navLabel 集中在此定義。
 * 改名時只需修改此檔案，NavigationList、App.tsx 等地方會自動連動。
 *
 * navLabel  : 側欄子選單的文字
 * title     : 頁首顯示的標題
 * breadcrumb: 麵包屑路徑（靜態版本；動態子頁保留在 App.tsx）
 */

import type { PageType } from '@/app/components/MainLayout';

export interface PageConfig {
  navLabel: string;
  title: string;
  breadcrumb: string;
}

export const pageConfig: Record<PageType, PageConfig> = {
  // ── OVERVIEW ──────────────────────────────────────────────────────────────
  'dashboard': {
    navLabel: '首頁',
    title: '首頁',
    breadcrumb: '',
  },
  'announcement': {
    navLabel: '公佈欄',
    title: '公佈欄',
    breadcrumb: 'Overview • 公佈欄',
  },
  'online-chat': {
    navLabel: '線上客服',
    title: '線上客服',
    breadcrumb: 'Overview • 線上客服',
  },
  'receiving-inquiry': {
    navLabel: '收料查詢',
    title: '收料查詢',
    breadcrumb: 'Overview • 收料查詢',
  },
  'schedule-inquiry': {
    navLabel: '排程總表查詢',
    title: '排程總表查詢',
    breadcrumb: 'Overview • 排程總表查詢',
  },
  'vendor-account-review': {
    navLabel: '廠商帳號審核',
    title: '廠商帳號審核',
    breadcrumb: 'Overview • 廠商帳號審核',
  },

  // ── 訂單管理 ───────────────────────────────────────────────────────────────
  'order-list': {
    navLabel: '一般訂單查詢',
    title: '一般訂單查詢',
    breadcrumb: '訂單管理 • 一般訂單查詢',
  },
  'order-exchange': {
    navLabel: '換貨(J)單據查詢',
    title: '換貨(J)單據查詢',
    breadcrumb: '訂單管理 • 換貨(J)單據查詢',
  },
  'order-return': {
    navLabel: '退貨單據查詢',
    title: '退貨單據查詢',
    breadcrumb: '訂單管理 • 退貨單據查詢',
  },
  'order-forecast': {
    navLabel: '預測訂單查詢',
    title: '預測訂單查詢',
    breadcrumb: '訂單管理 • 預測訂單查詢',
  },
  'order-schedule-change': {
    navLabel: '變更生管排程',
    title: '變更生管排程',
    breadcrumb: '訂單管理 • 變更生管排程',
  },
  'order-history': {
    navLabel: '歷史訂單查詢',
    title: '歷史訂單查詢',
    breadcrumb: '訂單管理 • 歷史訂單查詢',
  },

  // ── 修正單管理 ─────────────────────────────────────────────────────────────
  'correction-create': {
    navLabel: '建立修正單',
    title: '建立修正單',
    breadcrumb: '修正單管理 • 建立修正單',
  },
  'correction-list': {
    navLabel: '修正單查詢',
    title: '修正單查詢',
    breadcrumb: '修正單管理 • 修正單查詢',
  },
  'correction-history': {
    navLabel: '歷史修正單',
    title: '歷史修正單',
    breadcrumb: '修正單管理 • 歷史修正單',
  },

  // ── 出貨單 ─────────────────────────────────────────────────────────────────
  'shipping-create': {
    navLabel: '建立出貨單',
    title: '建立出貨單',
    breadcrumb: '出貨單 • 建立出貨單',
  },
  'shipping-list': {
    navLabel: '出貨單查詢',
    title: '出貨單查詢',
    breadcrumb: '出貨單 • 出貨單查詢',
  },
  'shipping-packing': {
    navLabel: '出貨/裝箱明細',
    title: '出貨/裝箱明細',
    breadcrumb: '出貨單 • 出貨/裝箱明細',
  },
  'shipping-print': {
    navLabel: '列印單據',
    title: '列印單據',
    breadcrumb: '出貨單 • 列印單據',
  },
  'shipping-settings': {
    navLabel: '基本設定',
    title: '基本設定',
    breadcrumb: '出貨單 • 基本設定',
  },

  // ── 發票作業 ───────────────────────────────────────────────────────────────
  'invoice-create': {
    navLabel: '開立發票',
    title: '開立發票',
    breadcrumb: '發票作業 • 開立發票',
  },
  'invoice-list': {
    navLabel: '發票查詢',
    title: '發票查詢',
    breadcrumb: '發票作業 • 發票查詢',
  },
  'invoice-settings': {
    navLabel: '發票設定',
    title: '發票設定',
    breadcrumb: '發票作業 • 發票設定',
  },

  // ── 零件/索樣 ──────────────────────────────────────────────────────────────
  'parts-maintain': {
    navLabel: '零件資訊',
    title: '零件資訊',
    breadcrumb: '零件/索樣 • 零件資訊',
  },
  'parts-quote': {
    navLabel: '列印報價單',
    title: '列印報價單',
    breadcrumb: '零件/索樣 • 列印報價單',
  },
  'parts-sample': {
    navLabel: '索樣單',
    title: '索樣單',
    breadcrumb: '零件/索樣 • 索樣單',
  },

  // ── 品保作業 ───────────────────────────────────────────────────────────────
  'quality-abnormal': {
    navLabel: '品質異常單',
    title: '品質異常單',
    breadcrumb: '品保作業 • 品質異常單',
  },
  'quality-report': {
    navLabel: '檢驗/測試報告',
    title: '檢驗/測試報告',
    breadcrumb: '品保作業 • 檢驗/測試報告',
  },
  'quality-hazard': {
    navLabel: '危害物質管理',
    title: '危害物質管理',
    breadcrumb: '品保作業 • 危害物質管理',
  },
  'quality-other': {
    navLabel: '其他設定',
    title: '其他設定',
    breadcrumb: '品保作業 • 其他設定',
  },

  // ── 產險 ───────────────────────────────────────────────────────────────────
  'insurance-maintain': {
    navLabel: '保險維護',
    title: '保險維護',
    breadcrumb: '產險 • 保險維護',
  },

  // ── 新零件 ─────────────────────────────────────────────────────────────────
  'newparts-project': {
    navLabel: '新零件專案維護',
    title: '新零件專案維護',
    breadcrumb: '新零件 • 新零件專案維護',
  },
  'newparts-settings': {
    navLabel: '專案設定',
    title: '專案設定',
    breadcrumb: '新零件 • 專案設定',
  },

  // ── 廠商評價 ───────────────────────────────────────────────────────────────
  'vendor-evaluation': {
    navLabel: '廠商評價',
    title: '廠商評價',
    breadcrumb: '廠商評價 • 交貨準時率',
  },

  // ── ESG ────────────────────────────────────────────────────────────────────
  'esg-material': {
    navLabel: '物料成分總檔',
    title: '物料成分總檔',
    breadcrumb: 'ESG • 物料成分總檔',
  },
  'esg-maintain': {
    navLabel: '材料維護',
    title: '材料維護',
    breadcrumb: 'ESG • 材料維護',
  },

  // ── 出貨台灣 ───────────────────────────────────────────────────────────────
  'shipment-tw-order': {
    navLabel: '訂單查詢',
    title: '訂單查詢',
    breadcrumb: '出貨台灣 • 訂單查詢',
  },
  'shipment-tw-shipping': {
    navLabel: '出貨單查詢',
    title: '出貨單查詢',
    breadcrumb: '出貨台灣 • 出貨單查詢',
  },
  'shipment-tw-print': {
    navLabel: '列印外箱貼紙',
    title: '列印外箱貼紙',
    breadcrumb: '出貨台灣 • 列印外箱貼紙',
  },

  // ── 帳號管理 ───────────────────────────────────────────────────────────────
  'vendor-account-management': {
    navLabel: '廠商帳號管理',
    title: '廠商帳號管理',
    breadcrumb: '帳號管理 • 廠商帳號管理',
  },
  'giant-account-management': {
    navLabel: '巨大帳號管理',
    title: '巨大帳號管理',
    breadcrumb: '帳號管理 • 巨大帳號管理',
  },

  // ── 系統設定 ───────────────────────────────────────────────────────────────
  'permission-settings': {
    navLabel: '角色權限設定',
    title: '角色權限設定',
    breadcrumb: '系統設定 • 角色權限設定',
  },
  'schedule-settings': {
    navLabel: '排程設定',
    title: '排程設定',
    breadcrumb: '系統設定 • 排程設定',
  },

  // ── 個人設定 ───────────────────────────────────────────────────────────────
  'personal-settings': {
    navLabel: '個人設定',
    title: '個人設定',
    breadcrumb: '個人設定',
  },
};
