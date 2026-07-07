/**
 * receivingConfig.ts — 收料查詢 共用設定
 *
 * 所有與「收料查詢」相關的 Tab 識別碼與顯示名稱統一定義於此。
 * ReceivingInquiryPage 與 PermissionSettingsPage 都從這裡 import，
 * 未來只需修改此檔即可同步更新兩端。
 */

export const RECEIVING_TABS = [
  {
    key:         'shipped-not-received'    as const,
    label:       '已出貨未收料',
    permId:      'overview-receiving-tab-shipped',
  },
  {
    key:         'should-ship-not-shipped' as const,
    label:       '延遲到貨',
    permId:      'overview-receiving-tab-unshipped',
  },
  {
    key:         'outsource'              as const,
    label:       '委外加工單狀況',
    permId:      'overview-receiving-tab-outsource',
  },
] as const;

/** Tab key 聯合型別，與 ReceivingInquiryPage 的 ReceivingTab 保持一致 */
export type ReceivingTabKey = typeof RECEIVING_TABS[number]['key'];
