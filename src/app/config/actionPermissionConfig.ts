// src/app/config/actionPermissionConfig.ts
// 定義哪些功能模組有「行為操作權限」控制，以及各模組可控制的 action 清單。
//
// ── 使用規則（見 AGENTS.md）────────────────────────────────────────────────
// 新增功能時，問自己：
//   「這個操作，是不是所有能進入這個模組的角色都應該可以執行？」
//   → 是  → 不需加入此檔案，有模組存取權限即可操作
//   → 否  → 在 FEATURE_ACTION_CONFIG 新增對應 entry
// ──────────────────────────────────────────────────────────────────────────

export interface ActionDef {
  id: string;    // 行為識別碼（如 'create'、'delete'）
  label: string; // 管理介面顯示名稱（如 '新增公告'）
}

export interface FeatureActionConfig {
  featureId: string;    // 對應 FEATURE_TREE 節點 id（PermissionSettingsPage 的 id）
  featureLabel: string; // 功能顯示名稱
  actions: ActionDef[]; // 此功能可個別控制的行為清單
}

/**
 * 已設定 Action 權限控制的功能模組清單。
 *
 * 不在此清單內的模組 → 有模組存取權限即可執行所有操作（不需額外 Action 設定）。
 */
export const FEATURE_ACTION_CONFIG: FeatureActionConfig[] = [
  {
    featureId: 'overview-announcement',
    featureLabel: '公佈欄',
    actions: [
      { id: 'create', label: '新增公告' },
      { id: 'edit',   label: '編輯公告' },
      { id: 'delete', label: '刪除公告' },
    ],
  },
  {
    featureId: 'mgmt-order-forecast',
    featureLabel: '預測訂單',
    actions: [
      { id: 'create', label: '新增預測訂單' },
      { id: 'delete', label: '刪除預測訂單' },
    ],
  },
  {
    featureId: 'mgmt-correction',
    featureLabel: '修正單管理',
    actions: [
      { id: 'return',        label: '退回廠商' },
      { id: 'submit_delete', label: '確認刪單提交' },
    ],
  },
  {
    featureId: 'mgmt-invoice',
    featureLabel: '發票作業',
    actions: [
      { id: 'delete', label: '刪除發票' },
      { id: 'return', label: '退回廠商' },
    ],
  },
  {
    featureId: 'mgmt-quality-abnormal',
    featureLabel: '品質異常單',
    actions: [
      { id: 'delete_attachment', label: '刪除縮圖/附件' },
    ],
  },
  {
    featureId: 'mgmt-account-vendor',
    featureLabel: '廠商帳號管理',
    actions: [
      { id: 'edit_purchase_group', label: '新增/刪除採購群組' },
    ],
  },
  {
    featureId: 'mgmt-parts-info',
    featureLabel: '零件資訊',
    actions: [
      { id: 'create_sample', label: '開立索樣單' },
    ],
  },
];

/**
 * 快速查詢輔助：依 featureId 取得 FeatureActionConfig。
 */
export function getFeatureActionConfig(featureId: string): FeatureActionConfig | undefined {
  return FEATURE_ACTION_CONFIG.find(f => f.featureId === featureId);
}
