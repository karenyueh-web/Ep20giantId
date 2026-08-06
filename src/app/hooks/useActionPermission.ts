// src/app/hooks/useActionPermission.ts
// 前端行為操作權限 Hook。
//
// 使用方式：
//   const { can } = useActionPermission(userRoleId, 'overview-announcement');
//   {can('create') && <button>新增公告</button>}
//   {can('delete') && <Trash2 onClick={handleDelete} />}
//
// 特殊規則：
//   - IT（giant-it）與 admin 角色 → 自動全開，不查任何設定
//   - 不在 FEATURE_ACTION_CONFIG 的功能 → can() 永遠回傳 true（不需 action 控制）
//   - 沒有 roleId → can() 回傳 false（防禦性預設）

import { useEffect, useState } from 'react';
import {
  loadActionPermissions,
  canPerformAction,
  type ActionPermissionEntry,
} from '../config/actionPermissionStore';
import { getFeatureActionConfig } from '../config/actionPermissionConfig';

// ─── 預設全開的角色 id（不受設定限制）─────────────────────────────────────────
const UNRESTRICTED_ROLE_IDS: string[] = [
  'giant-it',
  'giant-developer',
];

function isUnrestrictedRole(roleId: string): boolean {
  // 支援精確比對與前綴比對（如 admin-xxx）
  return (
    UNRESTRICTED_ROLE_IDS.includes(roleId) ||
    roleId.startsWith('admin')
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseActionPermissionResult {
  /**
   * 判斷當前使用者是否可執行指定 action。
   *
   * @param action  action id，如 'create'、'delete'、'return'
   * @returns true → 可執行（顯示按鈕）；false → 不可執行（隱藏按鈕）
   */
  can: (action: string) => boolean;
  /** 是否正在載入中（僅在初始化時為 true） */
  loading: boolean;
}

/**
 * 行為操作權限 Hook。
 *
 * @param roleId    當前登入使用者的角色 id（來自 userRole prop 或 auth context）
 * @param featureId 功能模組的 id（對應 FEATURE_ACTION_CONFIG 的 featureId）
 */
export function useActionPermission(
  roleId: string | undefined,
  featureId: string
): UseActionPermissionResult {
  const [permissions, setPermissions] = useState<ActionPermissionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // 若功能不在 FEATURE_ACTION_CONFIG → 不需 action 控制，直接全開
  const featureConfig = getFeatureActionConfig(featureId);
  const isControlled = featureConfig !== undefined;

  useEffect(() => {
    // 無 roleId 時，保持 permissions 為空（can() 回傳 false）
    if (!roleId) {
      setLoading(false);
      return;
    }

    // IT / admin 角色不需查詢
    if (isUnrestrictedRole(roleId)) {
      setLoading(false);
      return;
    }

    // 不受控制的功能不需查詢
    if (!isControlled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadActionPermissions(roleId).then(perms => {
      if (!cancelled) {
        setPermissions(perms);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [roleId, featureId, isControlled]);

  const can = (action: string): boolean => {
    // 無 roleId → 拒絕
    if (!roleId) return false;

    // IT / admin → 全開
    if (isUnrestrictedRole(roleId)) return true;

    // 功能不在 FEATURE_ACTION_CONFIG → 全開（有模組權限即可操作）
    if (!isControlled) return true;

    // 查詢已載入的權限
    return canPerformAction(permissions, featureId, action);
  };

  return { can, loading };
}
