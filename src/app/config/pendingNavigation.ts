// src/app/config/pendingNavigation.ts
// 用於在頁面跳轉前傳遞「要自動開啟的使用者」資訊
// 跨組件的 module-level 狀態，避免 prop drilling

export interface PendingNavUser {
  userName: string;
  account: string;          // login account ID
  type: 'giant' | 'vendor';
  companyName?: string;
}

let _pending: PendingNavUser | null = null;

/** 設定待開啟的使用者（在 onPageChange 之前呼叫） */
export function setPendingNavUser(user: PendingNavUser): void {
  _pending = user;
}

/** 取出並清除（destination page 的 useEffect 中呼叫） */
export function consumePendingNavUser(): PendingNavUser | null {
  const u = _pending;
  _pending = null;
  return u;
}
