// ── 索樣單 — 資料模型、常數與 Mock 資料 ────────────────────────────────────

// ── 狀態定義 ────────────────────────────────────────────────────────────────

export type SampleOrderStatus = 'DR' | 'V' | 'SC' | 'CL' | 'CC';

export interface SampleOrderStatusDef {
  code: SampleOrderStatus;
  label: string;
  tabLabel: string;
  oldCode: string;
  definition: string;
  note: string;
  /** Badge 背景色 */
  bgColor: string;
  /** Badge 文字色 */
  textColor: string;
}

export const SAMPLE_ORDER_STATUSES: SampleOrderStatusDef[] = [
  {
    code: 'DR',
    label: '草稿',
    tabLabel: '草稿(DR)',
    oldCode: 'RR',
    definition: '未正式成立索樣單前',
    note: '整採可執行刪除',
    bgColor: 'rgba(145,158,171,0.16)',
    textColor: '#637381',
  },
  {
    code: 'V',
    label: '廠商確認中',
    tabLabel: '廠商確認中(V)',
    oldCode: 'WR',
    definition: '整採送出後，廠商確認中',
    note: '',
    bgColor: 'rgba(24,144,255,0.12)',
    textColor: '#1677ff',
  },
  {
    code: 'SC',
    label: '廠商已回覆',
    tabLabel: '廠商已回覆(SC)',
    oldCode: 'RP',
    definition: '廠商回覆後',
    note: '整採可執行取消、完結',
    bgColor: 'rgba(255,171,0,0.16)',
    textColor: '#b76e00',
  },
  {
    code: 'CL',
    label: '已關閉',
    tabLabel: '關閉結案(CL)',
    oldCode: 'CL',
    definition: '單據結案',
    note: '由整採執行',
    bgColor: 'rgba(99,115,129,0.12)',
    textColor: '#637381',
  },
  {
    code: 'CC',
    label: '取消',
    tabLabel: '取消(CC)',
    oldCode: 'DE',
    definition: '單據取消',
    note: '由整採執行',
    bgColor: 'rgba(255,86,48,0.12)',
    textColor: '#ff5630',
  },
];

export function getStatusDef(code: SampleOrderStatus): SampleOrderStatusDef {
  return SAMPLE_ORDER_STATUSES.find((s) => s.code === code)!;
}

// ── 索樣類型 ────────────────────────────────────────────────────────────────

export type SampleType = 'D' | 'G';

export const SAMPLE_TYPE_OPTIONS: { value: SampleType; label: string }[] = [
  { value: 'D', label: 'D(開發樣)' },
  { value: 'G', label: 'G(量產品)' },
];

// ── 介面定義 ────────────────────────────────────────────────────────────────

export interface SampleOrderRecord {
  id: string;
  /** 索樣單號（格式：G25XXXXX） */
  orderNo: string;
  /** 狀態 */
  status: SampleOrderStatus;
  /** 供應商代碼（MDO: supplierCode） */
  supplierCode: string;
  /** 供應商名稱（MDO: supplierName） */
  supplierName: string;
  /** 採購組織 */
  purchaseOrg: string;
  /** 工廠（MDO: plantCode） */
  plantCode: string;
  /** 料號（MDO: materialNo） */
  materialNo: string;
  /** 長規格敘述 */
  longDescription: string;
  /** 供應商料號（MDO: supplierMaterialNo） */
  supplierMaterialNo?: string;
  /** 索樣日期（YYYY/MM/DD） */
  sampleDate: string;
  /** 需求日期（YYYY/MM/DD） */
  demandDate: string;
  /** 需求數量 */
  demandQty?: number;
  /** 重新索樣 */
  resample: boolean;
  /** 索樣類型 */
  sampleType: SampleType;
  /** 備註 */
  remark: string;
  /** 建立者 */
  createdBy: string;
  /** 建立時間 */
  createdAt: string;
  /** 最後更新時間 */
  updatedAt: string;
  // ── 廠商回覆欄位（狀態 V 以後才有值） ─────────────────────────────────
  /** 樣品達交日（MDO: supplierShipDate） */
  supplierShipDate?: string;
  /** 實際送樣日 */
  actualShipDate?: string;
  /** 首批可供貨日 */
  availableDate?: string;
  /** 廠商日產能（MDO: supplierDailyCapacity） */
  supplierDailyCapacity?: number;
  // ── 取消索樣（CC 狀態才有值） ────────────────────────────────────────────
  /** 取消原因 */
  cancelReason?: string;
  // ── 退回廠商補填旗標 ──────────────────────────────────────────────────
  /** 被整採購退回廠商補填：true 時廠商回覆全部欄位必填 */
  needsFullVendorReply?: boolean;
  /** needsFullVendorReply 的新命名（兩者並存） */
  needsFullSupplierReply?: boolean;
  // ── MDO 相關 ──────────────────────────────────────────────────────────────────
  /** MDO revision_no，supplierReplySampleOrderMdo 的 required 欄位 */
  mdoRevisionNo?: number;
  /** 物料群組（來自 items API，用於列印索樣單的「物料群組」欄） */
  materialGroup?: string;
}

// 依年度獨立計算流水號：跨年自動歸零
let _orderSeqYear = new Date().getFullYear();
let _orderSeq = 0; // 頁面載入後由 syncOrderSeqFromRecords() 同步至 MDO 最大值

function genOrderNo(): string {
  const currentYear = new Date().getFullYear();
  if (currentYear !== _orderSeqYear) {
    // 跨年 → 重置
    _orderSeqYear = currentYear;
    _orderSeq = 0;
  }
  _orderSeq += 1;
  const yearSuffix = String(currentYear).slice(-2);
  return `G${yearSuffix}${String(_orderSeq).padStart(5, '0')}`;
}

/**
 * 從已載入的 MDO 記錄中同步流水號上限，避免重整頁面後從 0 重算造成重複單號。
 * 格式：G<YY><NNNNN>，例如 G2600042 → seq=42
 */
function syncOrderSeqFromRecords(records: SampleOrderRecord[]): void {
  const currentYear = new Date().getFullYear();
  const yearSuffix = String(currentYear).slice(-2); // "26"
  const prefix = `G${yearSuffix}`; // "G26"

  let maxSeq = _orderSeq; // 保留目前值（可能已在本次 session 遞增過）
  for (const r of records) {
    if (r.orderNo?.startsWith(prefix)) {
      const seqStr = r.orderNo.slice(prefix.length); // "00042"
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  if (maxSeq > _orderSeq) {
    _orderSeq = maxSeq;
  }
}

// ── Store（從 MDO 載入，不使用 Mock 資料）─────────────────────────────────
// Mock 資料已清除，由 loadOrders() 從 MDO 載入後透過 replaceAllSampleOrders() 同步
let _sampleOrders: SampleOrderRecord[] = [];

// ── Store 操作函式 ──────────────────────────────────────────────────────────────────

function notifySampleOrderChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sampleOrdersChanged'));
  }
}

export function getSampleOrders(): SampleOrderRecord[] {
  return _sampleOrders;
}

/** MDO 資料載入後同步覆蓋整個 store（取代 Mock 資料） */
export function replaceAllSampleOrders(records: SampleOrderRecord[]): void {
  _sampleOrders = [...records];
  // 同步流水號上限，避免重整頁面後產生重複單號
  syncOrderSeqFromRecords(records);
  notifySampleOrderChange();
}

export function addSampleOrder(record: Omit<SampleOrderRecord, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>): SampleOrderRecord {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const newRecord: SampleOrderRecord = {
    ...record,
    id: crypto.randomUUID(),
    orderNo: genOrderNo(),
    createdAt: ts,
    updatedAt: ts,
  };
  _sampleOrders = [newRecord, ..._sampleOrders];
  notifySampleOrderChange();
  return newRecord;
}

/**
 * MDO create 成功後，用 MDO 回傳的 UUID 取代本地暫時 id，並存入 revision_no。
 * localId: addSampleOrder 產生的 crypto.randomUUID()
 * mdoId: MDO create response 的 id (UUID)
 * mdoRevisionNo: MDO create response 的 revision_no（通常為 1）
 */
export function updateSampleOrderMdoId(localId: string, mdoId: string, mdoRevisionNo: number): void {
  _sampleOrders = _sampleOrders.map((r) =>
    r.id === localId
      ? { ...r, id: mdoId, mdoRevisionNo }
      : r
  );
  notifySampleOrderChange();
}


export function deleteSampleOrders(ids: string[]): void {
  _sampleOrders = _sampleOrders.filter((r) => !ids.includes(r.id));
  notifySampleOrderChange();
}

export function updateSampleOrderStatus(ids: string[], status: SampleOrderStatus): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  _sampleOrders = _sampleOrders.map((r) =>
    ids.includes(r.id) ? { ...r, status, updatedAt: ts } : r,
  );
  notifySampleOrderChange();
}

/** 取消索樣：SC → CC，同時寫入取消原因 */
export function cancelSampleOrder(id: string, reason: string): SampleOrderRecord | null {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  _sampleOrders = _sampleOrders.map((r) =>
    r.id === id ? { ...r, status: 'CC', cancelReason: reason, updatedAt: ts } : r,
  );
  notifySampleOrderChange();
  return _sampleOrders.find((r) => r.id === id) ?? null;
}

/** 批次取消索樣：將多筆狀態設為 CC，並寫入相同的取消原因 */
export function batchCancelSampleOrders(ids: string[], reason: string): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  _sampleOrders = _sampleOrders.map((r) =>
    ids.includes(r.id) ? { ...r, status: 'CC' as SampleOrderStatus, cancelReason: reason, updatedAt: ts } : r,
  );
  notifySampleOrderChange();
}

/** 退回廠商補填：SC → V，標記需要補齊全部廠商回覆欄位 */
export function revertSampleOrderToV(id: string): SampleOrderRecord | null {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  _sampleOrders = _sampleOrders.map((r) =>
    r.id === id ? { ...r, status: 'V', needsFullVendorReply: true, updatedAt: ts } : r,
  );
  notifySampleOrderChange();
  return _sampleOrders.find((r) => r.id === id) ?? null;
}

/** 廠商回覆：更新回覆欄位並將狀態推進到 SC（廠商已回覆） */
export function updateSampleOrderVendorReply(
  id: string,
  reply: {
    supplierShipDate?: string;
    actualShipDate?: string;
    availableDate?: string;
    supplierDailyCapacity?: number;
  },
): SampleOrderRecord | null {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  let found: SampleOrderRecord | null = null;
  _sampleOrders = _sampleOrders.map((r) => {
    if (r.id !== id) return r;
    const updated: SampleOrderRecord = { ...r, ...reply, status: 'SC', updatedAt: ts };
    found = updated;
    return updated;
  });
  notifySampleOrderChange();
  return found;
}

/** SC 補填：在 SC 狀態下更新首批可供貨日 / 實際送樣日，不改變 status */
export function updateSCSuppFields(
  id: string,
  fields: { availableDate?: string; actualShipDate?: string },
): SampleOrderRecord | null {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  let found: SampleOrderRecord | null = null;
  _sampleOrders = _sampleOrders.map((r) => {
    if (r.id !== id) return r;
    const updated: SampleOrderRecord = { ...r, ...fields, updatedAt: ts };
    found = updated;
    return updated;
  });
  notifySampleOrderChange();
  return found;
}


/** 草稿更新：更新 DR 的可編輯欄位，可選擇同時轉交廠商（status → V） */
export function updateSampleOrderDraft(
  id: string,
  fields: {
    resample: boolean;
    sampleType: string;
    demandDate: string;
    demandQty?: number;
  },
  submit: boolean, // true = 轉交廠商（DR→V），false = 暫存草稿（保持 DR）
): SampleOrderRecord | null {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  let found: SampleOrderRecord | null = null;
  _sampleOrders = _sampleOrders.map((r) => {
    if (r.id !== id) return r;
    const updated: SampleOrderRecord = {
      ...r,
      ...fields,
      sampleType: fields.sampleType as SampleOrderRecord['sampleType'],
      status: submit ? 'V' : 'DR',
      updatedAt: ts,
    };
    found = updated;
    return updated;
  });
  notifySampleOrderChange();
  return found;
}

// ── 索樣單歷程 Store ────────────────────────────────────────────────────────

export interface SampleHistoryEntry {
  date: string;       // 'YYYY/MM/DD HH:mm'
  event: string;      // e.g. '開立索樣單（轉交廠商）'
  operator: string;   // e.g. '王大明'
  remark: string;
}

let _sampleOrderHistory: Record<string, SampleHistoryEntry[]> = {};

export function addSampleOrderHistory(id: string, entry: SampleHistoryEntry): void {
  if (!_sampleOrderHistory[id]) {
    _sampleOrderHistory[id] = [];
  }
  _sampleOrderHistory[id] = [entry, ..._sampleOrderHistory[id]];
}

export function getSampleOrderHistory(id: string): SampleHistoryEntry[] {
  return _sampleOrderHistory[id] ?? [];
}

// ── 重複檢核：取最近一筆非 DR 狀態的索樣單 ──────────────────────────────────

/** 檢查同一零件（materialNo + supplierCode + plantCode）是否已有非 DR 索樣單，回傳最近一筆 */
export function findLatestExistingSampleOrder(
  materialNo: string,
  supplierCode: string,
  plantCode: string,
): SampleOrderRecord | undefined {
  return _sampleOrders
    .filter(
      (o) =>
        o.materialNo === materialNo &&
        o.supplierCode === supplierCode &&
        o.plantCode === plantCode &&
        o.status !== 'DR',
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/** 查詢同一零件所有索樣單紀錄（含 DR），按建立日期降冪排序 */
export function findAllExistingSampleOrders(
  materialNo: string,
  supplierCode: string,
  plantCode: string,
): SampleOrderRecord[] {
  return _sampleOrders
    .filter(
      (o) =>
        o.materialNo === materialNo &&
        o.supplierCode === supplierCode &&
        o.plantCode === plantCode,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
