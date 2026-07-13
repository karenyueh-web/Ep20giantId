// src/app/config/userRoleStore.ts
// 使用者-角色對應 Mock 資料
// 提供：角色人數統計、未設定角色名單、GAC 同步警示

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRoleRecord {
  userId: string;
  userName: string;
  account: string;
  companyName?: string;       // 廠商使用者才有
  type: 'giant' | 'vendor';
  roleIds: string[];          // 對應 RoleItem.id（可多個）
  status: 'active' | 'inactive';
}

export interface SyncAlert {
  roleLabel: string;
  roleType: '巨大' | '廠商';
  affectedCount: number;
  affectedUsers: Array<{ userId: string; userName: string; account: string; type: 'giant' | 'vendor'; companyName?: string }>;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

let MOCK_USERS: UserRoleRecord[] = [
  // 巨大使用者
  { userId: 'g001', userName: '王小明', account: 'ming001',  type: 'giant',  roleIds: ['giant-it'],             status: 'active' },
  { userId: 'g002', userName: '張大華', account: 'hua002',   type: 'giant',  roleIds: ['giant-it'],             status: 'active' },
  { userId: 'g003', userName: '李志遠', account: 'yuan003',  type: 'giant',  roleIds: ['giant-it'],             status: 'inactive' },
  { userId: 'g004', userName: '陳美玉', account: 'yu004',    type: 'giant',  roleIds: ['giant-it', 'giant-finance'], status: 'active' },
  { userId: 'g005', userName: '林建國', account: 'kuo005',   type: 'giant',  roleIds: ['giant-it'],             status: 'active' },
  { userId: 'g006', userName: '吳雅婷', account: 'ting006',  type: 'giant',  roleIds: ['giant-finance'],        status: 'active' },
  { userId: 'g007', userName: '黃志豪', account: 'hao007',   type: 'giant',  roleIds: ['giant-finance'],        status: 'active' },
  { userId: 'g008', userName: '許淑芬', account: 'fen008',   type: 'giant',  roleIds: ['giant-finance'],        status: 'active' },
  { userId: 'g009', userName: '蔡宗翰', account: 'han009',   type: 'giant',  roleIds: ['giant-finance'],        status: 'inactive' },
  { userId: 'g010', userName: '鄭文傑', account: 'jie010',   type: 'giant',  roleIds: ['giant-finance'],        status: 'active' },
  { userId: 'g011', userName: '劉雅雯', account: 'wen011',   type: 'giant',  roleIds: [],                       status: 'active' },  // 未設定角色
  { userId: 'g012', userName: '楊偉誠', account: 'cheng012', type: 'giant',  roleIds: [],                       status: 'active' },  // 未設定角色
  // 廠商使用者
  { userId: 'v001', userName: 'Amy Chen',   account: 'amy@jk.com',    companyName: '久鑫實業', type: 'vendor', roleIds: ['vendor-sales'],           status: 'active' },
  { userId: 'v002', userName: 'Bob Lin',    account: 'bob@jk.com',    companyName: '久鑫實業', type: 'vendor', roleIds: ['vendor-qa'],              status: 'active' },
  { userId: 'v003', userName: 'Carol Wu',   account: 'carol@abc.com', companyName: 'ABC科技',  type: 'vendor', roleIds: ['vendor-developer'],       status: 'active' },
  { userId: 'v004', userName: 'David Kao',  account: 'david@abc.com', companyName: 'ABC科技',  type: 'vendor', roleIds: [],                         status: 'active' },  // 未設定角色
  { userId: 'v005', userName: 'Eva Tsai',   account: 'eva@xyz.com',   companyName: 'XYZ零件',  type: 'vendor', roleIds: ['vendor-subcontractor'],   status: 'inactive' },
];

// ─── Sync Alert Storage ───────────────────────────────────────────────────────

const ALERT_KEY = 'role-sync-alerts';

export function loadSyncAlerts(): SyncAlert[] {
  try {
    const raw = localStorage.getItem(ALERT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SyncAlert[];
      // 過濾掉舊格式（沒有 affectedUsers）的 alert，避免顯示空白框
      const valid = parsed.filter(a => Array.isArray(a.affectedUsers) && a.affectedUsers.length > 0);
      if (valid.length === 0) {
        localStorage.removeItem(ALERT_KEY);
        return [];
      }
      return valid;
    }
  } catch { /* ignore */ }
  return [];
}

export function saveSyncAlerts(alerts: SyncAlert[]): void {
  localStorage.setItem(ALERT_KEY, JSON.stringify(alerts));
}

export function clearSyncAlerts(): void {
  localStorage.removeItem(ALERT_KEY);
}

// ─── Getters ──────────────────────────────────────────────────────────────────

/** 取得某角色 id 的使用者清單 */
export function getUsersByRole(roleId: string): UserRoleRecord[] {
  return MOCK_USERS.filter(u => u.roleIds.includes(roleId));
}

/** 取得某角色 id 的人數 */
export function getRoleUserCount(roleId: string): number {
  return getUsersByRole(roleId).length;
}

/** 取得所有未設定角色的使用者（巨大 + 廠商） */
export function getUsersWithoutRole(): UserRoleRecord[] {
  return MOCK_USERS.filter(u => u.roleIds.length === 0);
}

/** 是否還有未設定角色的使用者 */
export function hasUsersWithoutRole(): boolean {
  return getUsersWithoutRole().length > 0;
}

// ─── GAC Sync ─────────────────────────────────────────────────────────────────

/**
 * 清空指定 roleId 的所有使用者角色（GAC 角色消失時呼叫）
 * @returns 受影響的使用者清單
 */
export function clearRoleFromAllUsers(roleId: string): UserRoleRecord[] {
  const affected: UserRoleRecord[] = [];
  MOCK_USERS = MOCK_USERS.map(u => {
    if (u.roleIds.includes(roleId)) {
      affected.push(u);
      return { ...u, roleIds: u.roleIds.filter(id => id !== roleId) };
    }
    return u;
  });
  return affected;
}
