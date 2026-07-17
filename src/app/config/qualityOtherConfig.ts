/**
 * qualityOtherConfig.ts — 品保作業 • 其他設定 共用設定
 *
 * 所有與「其他設定」相關的 Tab 識別碼與顯示名稱統一定義於此。
 * QualityOtherSettingsPage 與 PermissionSettingsPage 都從這裡 import，
 * 未來只需修改此檔即可同步更新兩端。
 */

export const QUALITY_OTHER_TABS = [
  {
    key:    'incoming-inspection'   as const,
    label:  '入廠需檢驗的物料',
    permId: 'mgmt-quality-other-incoming',
  },
  {
    key:    'material-group-report' as const,
    label:  '需付檢測報告的物料群組',
    permId: 'mgmt-quality-other-material-group',
  },
  {
    key:    'hazard-reg'            as const,
    label:  '危害物質法規維護',
    permId: 'mgmt-quality-other-hazard-reg',
  },
] as const;

/** Tab key 聯合型別，與 QualityOtherSettingsPage 的 ActiveTab 保持一致 */
export type QualityOtherTabKey = typeof QUALITY_OTHER_TABS[number]['key'];
