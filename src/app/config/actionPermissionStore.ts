// src/app/config/actionPermissionStore.ts
// 行為操作權限的資料存取層（Mock 實作）。
//
// ── Mock 策略 ────────────────────────────────────────────────────────────────
// 後端 API 預計 2 個月後上線。目前使用 localStorage 模擬 GET/PUT API。
// 介面設計與後端契約一致，串接時只需替換 loadActionPermissions / saveActionPermissions
// 兩個函式，其他程式碼完全不需改動。
//
// ── 後端 API 契約 ────────────────────────────────────────────────────────────
// GET /api/permissions/action/{roleId}
//   Response: { roleId: string; permissions: ActionPermissionEntry[] }
//
// PUT /api/permissions/action/{roleId}
//   Body:     { roleId: string; permissions: ActionPermissionEntry[] }
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionPermissionEntry {
  featureId: string; // 對應 FEATURE_ACTION_CONFIG 的 featureId
  actions: string[]; // 此角色在該功能上被允許的 action id 清單
}

const STORAGE_PREFIX = 'action-perm-';

// ─── 預設值：新角色尚未設定時，所有 action 預設為「拒絕」────────────────────
const DEFAULT_PERMISSIONS: ActionPermissionEntry[] = [];

// ─── 讀取（模擬 GET API）─────────────────────────────────────────────────────

/**
 * 載入指定角色的行為操作權限。
 *
 * 串接真實 API 時，替換此函式實作（介面不變）：
 * ```ts
 * const res = await fetch(`/api/permissions/action/${roleId}`);
 * return (await res.json()).permissions;
 * ```
 */
export async function loadActionPermissions(roleId: string): Promise<ActionPermissionEntry[]> {
  // TODO: 串接真實 API 時取代以下實作
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${roleId}`);
    if (raw) return JSON.parse(raw) as ActionPermissionEntry[];
  } catch {
    // ignore parse errors
  }
  return DEFAULT_PERMISSIONS;
}

/**
 * 同步版本（供不需非同步的場景使用，如初始 render）。
 * 後端上線後此函式應改為透過 React Query / SWR cache 讀取，不直接呼叫 API。
 */
export function loadActionPermissionsSync(roleId: string): ActionPermissionEntry[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${roleId}`);
    if (raw) return JSON.parse(raw) as ActionPermissionEntry[];
  } catch {
    // ignore
  }
  return DEFAULT_PERMISSIONS;
}

// ─── 儲存（模擬 PUT API）─────────────────────────────────────────────────────

/**
 * 儲存指定角色的行為操作權限。
 *
 * 串接真實 API 時，替換此函式實作（介面不變）：
 * ```ts
 * await fetch(`/api/permissions/action/${roleId}`, {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ roleId, permissions }),
 * });
 * ```
 */
export async function saveActionPermissions(
  roleId: string,
  permissions: ActionPermissionEntry[]
): Promise<void> {
  // TODO: 串接真實 API 時取代以下實作
  localStorage.setItem(`${STORAGE_PREFIX}${roleId}`, JSON.stringify(permissions));
}

// ─── 輔助函式 ─────────────────────────────────────────────────────────────────

/**
 * 快速判斷某角色在某功能的某個 action 是否允許（同步版本，供 Hook 使用）。
 */
export function canPerformAction(
  permissions: ActionPermissionEntry[],
  featureId: string,
  action: string
): boolean {
  const entry = permissions.find(p => p.featureId === featureId);
  return entry?.actions.includes(action) ?? false;
}

/**
 * 更新單一功能的 action 清單，返回更新後的完整 permissions 陣列（immutable）。
 */
export function updateFeatureActions(
  permissions: ActionPermissionEntry[],
  featureId: string,
  actions: string[]
): ActionPermissionEntry[] {
  const existing = permissions.find(p => p.featureId === featureId);
  if (existing) {
    return permissions.map(p =>
      p.featureId === featureId ? { ...p, actions } : p
    );
  }
  return [...permissions, { featureId, actions }];
}
