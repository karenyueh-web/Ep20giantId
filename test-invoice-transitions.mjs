/**
 * test-invoice-transitions.mjs
 * 發票狀態轉換邏輯測試腳本
 *
 * 執行方式：node test-invoice-transitions.mjs
 *
 * 測試範圍：
 *   - 每個 handler 執行後產生的 record.status 是否正確
 *   - record.execNote 是否符合預期
 *   - history 是否正確寫入 action 字串
 *   - 按鈕顯示規則（status + role → 哪些按鈕可見）
 *   - 刪除後呼叫 onClose（而非 onSaveSuccess）
 */

// ─── ANSI 色碼 ───────────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

// ─── 統計 ────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ${GREEN}✓${RESET}  ${description}`);
    passed++;
  } else {
    console.log(`  ${RED}✗${RESET}  ${description}`);
    console.log(`       expected: ${YELLOW}${JSON.stringify(expected)}${RESET}`);
    console.log(`       actual  : ${RED}${JSON.stringify(actual)}${RESET}`);
    failed++;
  }
}

// ─── 模擬 localStorage ───────────────────────────────────────────────────────
const _store = {};
const localStorage = {
  getItem:    (k)    => _store[k] ?? null,
  setItem:    (k, v) => { _store[k] = v; },
  removeItem: (k)    => { delete _store[k]; },
};

// ─── 模擬 invoiceStore 邏輯（複製自 invoiceStore.ts）──────────────────────────
const STORAGE_KEY = 'invoiceRecords';

function loadInvoiceRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveInvoiceRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
function appendInvoiceRecord(record) {
  const existing = loadInvoiceRecords();
  const idx = existing.findIndex(r => r.id === record.id);
  if (idx >= 0) existing[idx] = record;
  else existing.push(record);
  saveInvoiceRecords(existing);
}
function deleteInvoiceRecord(id) {
  saveInvoiceRecords(loadInvoiceRecords().filter(r => r.id !== id));
}

// ─── 模擬 buildInvoiceRecord（簡化版，只產生狀態與歷程相關欄位）─────────────────
function makeRecord(overrides = {}) {
  return {
    id:          'TEST-001',
    invoiceNo:   'HT0000001',
    invoiceDate: '2025/06/01',
    status:      'DR',
    buyerName:   '巨大機械工業股份有限公司(56054251)',
    invoiceType: '21',
    taxRate:     '5',
    taxCode:     'V1',
    taxAmount:   500,
    totalAmount: 10500,
    currency:    'TWD',
    bondedType:  '非保稅',
    vendorName:  '華銘(0001000641)',
    execNote:    '',
    detailCount: 1,
    createdAt:   '2025/06/01 10:00',
    rows:        [],
    history:     [],
    ...overrides,
  };
}

/**
 * 模擬 buildInvoiceRecord(status, action)
 * 會在 history 加上一筆 { action }
 */
function buildRecord(baseRecord, status, action, execNoteOverride = null) {
  const historyEntry = {
    timestamp: '2025/06/01 10:00:00',
    action,
    operator:  '當前使用者',
    changes:   baseRecord.status !== status
      ? `狀態: ${baseRecord.status}→${status}`
      : '無變更',
  };
  const record = {
    ...baseRecord,
    status,
    history: [...baseRecord.history, historyEntry],
  };
  if (execNoteOverride !== null) record.execNote = execNoteOverride;
  return record;
}

// ─── 模擬所有 handler（對應 InvoiceDetailPage.tsx 的邏輯）─────────────────────
const createHandlers = (existingRecord) => {
  const calls = { onSaveSuccess: [], onClose: [] };

  const onSaveSuccess = (r) => calls.onSaveSuccess.push(r);
  const onClose       = ()  => calls.onClose.push(true);

  const handlers = {
    // DR: 暫存
    handleSaveDraft() {
      const record = buildRecord(existingRecord ?? makeRecord(), 'DR',
        existingRecord ? '暫存' : '建立');
      appendInvoiceRecord(record);
      setTimeout(() => onSaveSuccess(record), 0);
      return record;
    },
    // DR: 轉發票（無價差路徑）
    submitAsStatusP() {
      const record = buildRecord(existingRecord ?? makeRecord(), 'P', '確認開立', '');
      appendInvoiceRecord(record);
      setTimeout(() => onSaveSuccess(record), 0);
      return record;
    },
    // DR: 轉發票（有價差）→ B
    handleTransferToPurchasing() {
      const record = buildRecord(existingRecord ?? makeRecord(), 'B', '轉交採購確認', '價差確認中');
      appendInvoiceRecord(record);
      setTimeout(() => onSaveSuccess(record), 0);
      return record;
    },
    // B / F: 線下處理 → H
    handleOffline() {
      const record = buildRecord(existingRecord ?? makeRecord(), 'H', '轉線下處理', '改線下處理');
      appendInvoiceRecord(record);
      setTimeout(() => onSaveSuccess(record), 0);
      return record;
    },
    // B / F: 退回廠商 → DR
    handleReturnToVendor() {
      const record = buildRecord(existingRecord ?? makeRecord(), 'DR', '退回廠商', '採購退回，請廠商重新確認');
      appendInvoiceRecord(record);
      setTimeout(() => onSaveSuccess(record), 0);
      return record;
    },
    // F: 重拋 → P
    handleRetry() {
      const record = buildRecord(existingRecord ?? makeRecord(), 'P', '重拋', '');
      appendInvoiceRecord(record);
      setTimeout(() => onSaveSuccess(record), 0);
      return record;
    },
    // DR / S: 刪除
    handleDeleteInvoice() {
      if (!existingRecord) return;
      deleteInvoiceRecord(existingRecord.id);
      setTimeout(() => onClose(), 0);
    },
  };

  return { handlers, calls };
};

// ─── 按鈕顯示規則（對應 InvoiceDetailPage.tsx JSX）──────────────────────────
function getVisibleButtons(status, role) {
  const buttons = [];
  if (!status || status === 'DR') {
    buttons.push('刪除草稿', '暫存', '轉發票');
  }
  if (status === 'B' && role === 'procurement') {
    buttons.push('線下處理', '退回廠商');
  }
  if (status === 'S' && role === 'vendor') {
    buttons.push('刪除發票');
  }
  if (status === 'F' && role === 'procurement') {
    buttons.push('重拋', '線下處理', '退回廠商');
  }
  // P / H → 無按鈕（任何角色）
  return buttons;
}

// ════════════════════════════════════════════════════════════════════════════
// 測試區
// ════════════════════════════════════════════════════════════════════════════

// ─── Section 1：狀態轉換邏輯 ─────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}══ Section 1：狀態轉換邏輯 ══${RESET}\n`);

// ── 1-1 DR → P（轉發票，無價差）
{
  const base = makeRecord({ id: 'T01', status: 'DR' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.submitAsStatusP();
  const stored = loadInvoiceRecords().find(r => r.id === 'T01');
  assert('[DR→P] submitAsStatusP: status 變為 P',               record.status,  'P');
  assert('[DR→P] submitAsStatusP: execNote 清空',               record.execNote, '');
  assert('[DR→P] submitAsStatusP: history action = 確認開立',   record.history.at(-1)?.action, '確認開立');
  assert('[DR→P] submitAsStatusP: 已寫入 localStorage',         stored?.status,  'P');
}

// ── 1-2 DR → B（轉發票，有價差）
{
  const base = makeRecord({ id: 'T02', status: 'DR' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleTransferToPurchasing();
  assert('[DR→B] handleTransferToPurchasing: status 變為 B',    record.status,   'B');
  assert('[DR→B] handleTransferToPurchasing: execNote',          record.execNote, '價差確認中');
  assert('[DR→B] handleTransferToPurchasing: history action',    record.history.at(-1)?.action, '轉交採購確認');
}

// ── 1-3 DR 暫存（維持 DR）
{
  const base = makeRecord({ id: 'T03', status: 'DR' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleSaveDraft();
  assert('[DR→DR] handleSaveDraft: status 維持 DR',             record.status,  'DR');
  assert('[DR→DR] handleSaveDraft: history action = 暫存',      record.history.at(-1)?.action, '暫存');
}

// ── 1-4 B → H（線下處理）
{
  const base = makeRecord({ id: 'T04', status: 'B', execNote: '價差確認中' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleOffline();
  const stored = loadInvoiceRecords().find(r => r.id === 'T04');
  assert('[B→H] handleOffline: status 變為 H',                  record.status,   'H');
  assert('[B→H] handleOffline: execNote = 改線下處理',          record.execNote, '改線下處理');
  assert('[B→H] handleOffline: history action = 轉線下處理',    record.history.at(-1)?.action, '轉線下處理');
  assert('[B→H] handleOffline: 已寫入 localStorage',            stored?.status,  'H');
}

// ── 1-5 B → DR（退回廠商）
{
  const base = makeRecord({ id: 'T05', status: 'B', execNote: '價差確認中' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleReturnToVendor();
  assert('[B→DR] handleReturnToVendor: status 變為 DR',         record.status,   'DR');
  assert('[B→DR] handleReturnToVendor: execNote',               record.execNote, '採購退回，請廠商重新確認');
  assert('[B→DR] handleReturnToVendor: history action = 退回廠商', record.history.at(-1)?.action, '退回廠商');
}

// ── 1-6 F → P（重拋）
{
  const base = makeRecord({ id: 'T06', status: 'F', execNote: 'SAP連線失敗' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleRetry();
  const stored = loadInvoiceRecords().find(r => r.id === 'T06');
  assert('[F→P] handleRetry: status 變為 P',                    record.status,   'P');
  assert('[F→P] handleRetry: execNote 清空',                    record.execNote, '');
  assert('[F→P] handleRetry: history action = 重拋',            record.history.at(-1)?.action, '重拋');
  assert('[F→P] handleRetry: 已寫入 localStorage',              stored?.status,  'P');
}

// ── 1-7 F → H（線下處理）
{
  const base = makeRecord({ id: 'T07', status: 'F' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleOffline();
  assert('[F→H] handleOffline: status 變為 H',                  record.status,   'H');
  assert('[F→H] handleOffline: execNote = 改線下處理',          record.execNote, '改線下處理');
}

// ── 1-8 F → DR（退回廠商）
{
  const base = makeRecord({ id: 'T08', status: 'F' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  const record = handlers.handleReturnToVendor();
  assert('[F→DR] handleReturnToVendor: status 變為 DR',         record.status,   'DR');
  assert('[F→DR] handleReturnToVendor: history action = 退回廠商', record.history.at(-1)?.action, '退回廠商');
}

// ── 1-9 DR 刪除 → 記錄從 localStorage 消失，觸發 onClose
{
  const base = makeRecord({ id: 'T09', status: 'DR' });
  saveInvoiceRecords([base]);
  const { handlers, calls } = createHandlers(base);
  handlers.handleDeleteInvoice();
  const stored = loadInvoiceRecords().find(r => r.id === 'T09');
  assert('[DR 刪除] 記錄從 localStorage 移除',                  stored, undefined);
}

// ── 1-10 S 廠商刪除 → 記錄移除
{
  const base = makeRecord({ id: 'T10', status: 'S', execNote: '轉發票成功' });
  saveInvoiceRecords([base]);
  const { handlers } = createHandlers(base);
  handlers.handleDeleteInvoice();
  const stored = loadInvoiceRecords().find(r => r.id === 'T10');
  assert('[S 刪除] 記錄從 localStorage 移除',                   stored, undefined);
}

// ─── Section 2：按鈕顯示規則 ────────────────────────────────────────────────
console.log(`\n${BOLD}${CYAN}══ Section 2：按鈕顯示規則 (status + role) ══${RESET}\n`);

const btnTests = [
  // [狀態, 角色, 預期按鈕清單]
  { status: 'DR',       role: 'vendor',      expected: ['刪除草稿', '暫存', '轉發票'] },
  { status: 'DR',       role: 'procurement', expected: ['刪除草稿', '暫存', '轉發票'] },
  { status: 'P',        role: 'vendor',      expected: [] },
  { status: 'P',        role: 'procurement', expected: [] },
  { status: 'B',        role: 'vendor',      expected: [] },
  { status: 'B',        role: 'procurement', expected: ['線下處理', '退回廠商'] },
  { status: 'S',        role: 'vendor',      expected: ['刪除發票'] },
  { status: 'S',        role: 'procurement', expected: [] },
  { status: 'F',        role: 'vendor',      expected: [] },
  { status: 'F',        role: 'procurement', expected: ['重拋', '線下處理', '退回廠商'] },
  { status: 'H',        role: 'vendor',      expected: [] },
  { status: 'H',        role: 'procurement', expected: [] },
  { status: undefined,  role: 'vendor',      expected: ['刪除草稿', '暫存', '轉發票'] },
];

for (const t of btnTests) {
  const actual = getVisibleButtons(t.status, t.role);
  const label  = `[${t.status ?? '新建'}][${t.role}] 可見按鈕`;
  assert(label, actual, t.expected);
}

// ─── Section 3：歷程（history）累積驗證 ──────────────────────────────────────
console.log(`\n${BOLD}${CYAN}══ Section 3：歷程累積驗證 ══${RESET}\n`);

{
  // 模擬：建立 → 暫存 → 轉發票（無價差）→ 線下處理，history 應有 4 筆
  let record = makeRecord({ id: 'TH01', status: 'DR', history: [] });

  // 建立（第一次暫存）
  const { handlers: h1 } = createHandlers(undefined);
  record = { ...record, history: [{ timestamp: 'T', action: '建立', operator: '使用者', changes: '新建草稿' }] };

  // 暫存
  const { handlers: h2 } = createHandlers(record);
  record = h2.handleSaveDraft();

  // 確認開立（無價差）
  const { handlers: h3 } = createHandlers(record);
  record = h3.submitAsStatusP();

  // 線下處理
  const { handlers: h4 } = createHandlers(record);
  record = h4.handleOffline();

  assert('[歷程] 4 次操作後 history.length = 4', record.history.length, 4);
  assert('[歷程] history[0].action = 建立',       record.history[0]?.action, '建立');
  assert('[歷程] history[1].action = 暫存',       record.history[1]?.action, '暫存');
  assert('[歷程] history[2].action = 確認開立',   record.history[2]?.action, '確認開立');
  assert('[歷程] history[3].action = 轉線下處理', record.history[3]?.action, '轉線下處理');
}

// ─── 結果摘要 ────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${'─'.repeat(52)}`);
if (failed === 0) {
  console.log(`${BOLD}${GREEN}✓ 全部通過：${passed} / ${total} 項測試${RESET}`);
} else {
  console.log(`${BOLD}${RED}✗ 有失敗：${failed} 項失敗，${passed} 項通過（共 ${total} 項）${RESET}`);
}
console.log(`${'─'.repeat(52)}\n`);

process.exit(failed > 0 ? 1 : 0);
