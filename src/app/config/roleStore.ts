// src/app/config/roleStore.ts
// 角色資料單一來源（Single Source of Truth）
// 新增角色時只需呼叫 addRole()，所有元件自動連動

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleItem {
  id: string;
  label: string;
}

export interface RoleSection {
  title: '巨大' | '廠商';
  dotColor: string;
  roles: RoleItem[];
}

// ─── Default Data ─────────────────────────────────────────────────────────────

export const DEFAULT_ROLE_SECTIONS: RoleSection[] = [
  {
    title: '巨大',
    dotColor: '#005eb8',
    roles: [
      { id: 'giant-it',             label: 'IT' },
      { id: 'giant-finance',        label: '財務' },
      { id: 'giant-qa',             label: '品保' },
      { id: 'giant-bulk-purchase',  label: '整採' },
      { id: 'giant-gtm-production', label: 'GTM生管' },
      { id: 'giant-gtm-warehouse',  label: 'GTM倉儲' },
      { id: 'giant-developer',      label: '開發人員' },
      { id: 'giant-gtm-purchase',   label: 'GTM採購' },
      { id: 'giant-youth-purchase', label: '幼獅採購' },
      { id: 'giant-other-purchase', label: '其它區採購' },
    ],
  },
  {
    title: '廠商',
    dotColor: '#22c55e',
    roles: [
      { id: 'vendor-sales',         label: '業務' },
      { id: 'vendor-qa',            label: '品保' },
      { id: 'vendor-subcontractor', label: '下包商' },
      { id: 'vendor-developer',     label: '開發人員' },
    ],
  },
];

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'permission-role-order';

export function loadRoleSections(): RoleSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RoleSection[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors, fall back to defaults
  }
  return DEFAULT_ROLE_SECTIONS;
}

export function saveRoleSections(sections: RoleSection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export function getGiantRoles(): RoleItem[] {
  return loadRoleSections().find(s => s.title === '巨大')?.roles ?? [];
}

export function getVendorRoles(): RoleItem[] {
  return loadRoleSections().find(s => s.title === '廠商')?.roles ?? [];
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * 新增角色。
 * 同類型重複名稱拋出錯誤；跨類型同名允許。
 */
export function addRole(type: '巨大' | '廠商', label: string, id: string): void {
  const sections = loadRoleSections();
  const section = sections.find(s => s.title === type);
  if (!section) return;

  if (section.roles.some(r => r.label === label)) {
    throw new Error(`角色「${label}」在「${type}」分類中已存在`);
  }

  section.roles.push({ id, label });
  saveRoleSections(sections);
}

/**
 * 驗證角色名稱在指定類型中是否已存在
 */
export function roleExists(label: string, type: '巨大' | '廠商'): boolean {
  const sections = loadRoleSections();
  const section = sections.find(s => s.title === type);
  return section?.roles.some(r => r.label === label) ?? false;
}

// ─── GAC Mock API ─────────────────────────────────────────────────────────────

/**
 * Mock: 向 GAC 確認 attribute 是否已建立此角色。
 * 串接真實 API 時替換此 function 即可，介面不變。
 *
 * @returns true  → GAC 已建立，可新增角色
 * @returns false → GAC 尚未建立，顯示警示
 */
export async function checkGACRoleExists(
  _roleName: string,
  _type: '巨大' | '廠商'
): Promise<boolean> {
  // Mock: 固定模擬 GAC 已建立（回傳 true）
  // TODO: 串接真實 GAC API
  // const res = await fetch(`/api/gac/attributes?name=${roleName}&type=${type}`);
  // return res.ok && (await res.json()).exists === true;
  await new Promise(resolve => setTimeout(resolve, 800));
  return true;
}

/**
 * Mock: 向 GAC 同步角色清單，回傳 GAC 現有角色。
 * 串接真實 API 時替換此 function 即可。
 *
 * ── 測試「角色消失」情境 ──────────────────────────────────────────
 * 在瀏覽器 Console 執行以下指令，再按「同步 GAC」即可觸發警示：
 *
 *   // 模擬 GAC 移除「IT」（巨大）和「業務」（廠商）
 *   localStorage.setItem('gac-test-remove-roles', JSON.stringify(['giant-it', 'vendor-sales']));
 *
 *   // 測試完畢後清除（恢復正常）
 *   localStorage.removeItem('gac-test-remove-roles');
 * ──────────────────────────────────────────────────────────────────
 */
export async function fetchGACRoles(): Promise<{ name: string; type: '巨大' | '廠商' }[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const sections = loadRoleSections();
  const allRoles = sections.flatMap(s =>
    s.roles.map(r => ({ id: r.id, name: r.label, type: s.title as '巨大' | '廠商' }))
  );

  // 測試模式：讀取 localStorage 看哪些 roleId 要被「模擬從 GAC 移除」
  try {
    const raw = localStorage.getItem('gac-test-remove-roles');
    if (raw) {
      const removeIds: string[] = JSON.parse(raw);
      return allRoles
        .filter(r => !removeIds.includes(r.id))
        .map(({ name, type }) => ({ name, type }));
    }
  } catch { /* ignore */ }

  return allRoles.map(({ name, type }) => ({ name, type }));
}
