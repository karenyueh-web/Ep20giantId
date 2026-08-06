// announcementData.ts — 公佈欄資料模型與 Mock 資料

// ── 附件 ─────────────────────────────────────────────────────────────────────
export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string; // mock 階段使用 blob URL 或空字串
}

// ── 公告主體 ──────────────────────────────────────────────────────────────────
export interface AnnouncementRecord {
  id: string;
  publisherUnit: string;       // PUBLISHER_UNIT_OPTIONS 的 value
  publisherName: string;       // 發布人姓名
  publisherEmail: string;      // 發布人 email（用於判斷是否為本人發布）
  publishedAt: string;         // ISO datetime，排序依據（降冪 = 最新在前）
  titleZh: string;
  titleEn: string;
  contentZh: string;           // Tiptap 輸出的 HTML string
  contentEn: string;
  attachments: AnnouncementAttachment[];
  readCount: number;
  // readByCurrentUser 不存在資料層，由 localStorage announcementReadIds 動態計算
}

// ── 發布單位清單（9 選項）────────────────────────────────────────────────────
export const PUBLISHER_UNIT_OPTIONS = [
  { value: 'GTM',       label: 'GTM採購組織' },
  { value: 'GBD',       label: 'GBD商品採購組織' },
  { value: 'GI',        label: 'GI採購組織' },
  { value: 'AIP',       label: 'AIP採購組織' },
  { value: 'GVM',       label: 'GVM採購組織' },
  { value: 'TW_JOINT',  label: '台灣區委購(GEM、GCX、GVM)' },
  { value: 'GROUP_MFG', label: '【集團公告】全球製造中心' },
  { value: 'GROUP_DIG', label: '【集團公告】全球數位中心' },
  { value: 'SYSTEM',    label: '【系統公告】' },
] as const;

export type PublisherUnitValue = typeof PUBLISHER_UNIT_OPTIONS[number]['value'];

/** 由 value 取得顯示標籤 */
export function getUnitLabel(value: string): string {
  return PUBLISHER_UNIT_OPTIONS.find(o => o.value === value)?.label ?? value;
}

// ── localStorage 工具 ────────────────────────────────────────────────────────
const STORAGE_KEY = 'announcements';
const READ_IDS_KEY = 'announcementReadIds';
const MOCK_VERSION_KEY = 'announcementMockVersion';
const MOCK_VERSION = 'v2'; // 變更此版本號可強制重置所有使用者的已讀狀態

export function loadAnnouncements(): AnnouncementRecord[] {
  try {
    const version = localStorage.getItem(MOCK_VERSION_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    // 版本一致才讀快取，版本不同代表 mock 資料已更新，重置一切
    if (raw && version === MOCK_VERSION) return JSON.parse(raw) as AnnouncementRecord[];
  } catch {}
  // 首次載入或版本更新：重置已讀狀態，讓所有公告預設為未讀
  localStorage.removeItem(READ_IDS_KEY);
  localStorage.setItem(MOCK_VERSION_KEY, MOCK_VERSION);
  return [...MOCK_ANNOUNCEMENTS];
}

export function saveAnnouncements(list: AnnouncementRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

export function saveReadIds(ids: Set<string>): void {
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
}

// ── Mock 資料（依 publishedAt 降冪排列，最新在前）───────────────────────────
export const MOCK_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 'ann-001',
    publisherUnit: 'GROUP_MFG',
    publisherName: '王大明',
    publisherEmail: 'g00108123@giant.com',
    publishedAt: '2022-08-12T22:00:00+08:00',
    titleZh: '巨大的感謝',
    titleEn: 'Huge Thanks',
    contentZh: '<p>敬致供應鏈的各位協力夥伴，</p><p>時際台北車展，劉執行長寫了一封信給各位夥伴，表達對大家的感謝，煩請轉交給貴公司主管，並代為表達感謝與期待北展的豐碩成果. 謝謝各位！（信件如附件）</p>',
    contentEn: '<p>Dear partners in the supply chain,</p><p>On occasion of the Taipei Auto Show, CEO Liu has written a letter to all of you expressing his gratitude.</p><p>Please forward this letter to your company\'s supervisor and express our gratitude and hope for a fruitful Taipei Auto Show. Thank you! (The letter is attached.)</p>',
    attachments: [
      {
        id: 'att-001',
        name: 'To valued supplier 中文版-2025-03-15.pdf',
        // data URI 供本機測試下載用，實際上線後改為真實 API URL
        url: `data:text/plain;charset=utf-8,${encodeURIComponent('To valued supplier\n\n敬致供應鏈的各位協力夥伴，\n時際台北車展，劉執行長寫了一封信給各位夥伴，表達對大家的感謝。\n\n--- 測試附件 (Mock) ---')}`,
      },
    ],
    readCount: 12,
  },
  {
    id: 'ann-002',
    publisherUnit: 'GTM',
    publisherName: '李宜瑾-Evelyn Lee',
    publisherEmail: 'g00106917@giant.com',
    publishedAt: '2022-08-12T22:00:00+08:00',
    titleZh: 'GTM歲休',
    titleEn: 'GTM Annual Shutdown',
    contentZh: '<p>敬致各位供應商夥伴，</p><p>4/21~4/25 為GTM歲休，期間不收料，4/28開始收料，敬請留意並安排出貨時程。</p>',
    contentEn: '<p>Dear supplier partners,</p><p>GTM annual shutdown is scheduled from 4/21 to 4/25. No goods will be received during this period. Receiving will resume on 4/28. Please take note and arrange your shipment schedule accordingly.</p>',
    attachments: [],
    readCount: 12,
  },
  {
    id: 'ann-003',
    publisherUnit: 'TW_JOINT',
    publisherName: '陳美玲',
    publisherEmail: 'g00109456@giant.com',
    publishedAt: '2022-08-12T22:00:00+08:00',
    titleZh: '幼獅物流收貨時間調整',
    titleEn: 'Adjustment of Delivery Hours at Younglion Logistics',
    contentZh: '<p>敬致各位供應商夥伴，</p><p>如有EP使用及操作上的問題，可與對應的採購窗口聯繫。</p>',
    contentEn: '<p>Dear supplier partners,</p><p>If you have any questions regarding EP usage and operations, please contact your corresponding procurement representative.</p>',
    attachments: [],
    readCount: 12,
  },
  {
    id: 'ann-004',
    publisherUnit: 'SYSTEM',
    publisherName: '系統管理員',
    publisherEmail: 'g00107789@giant.com',
    publishedAt: '2022-08-11T10:00:00+08:00',
    titleZh: '【系統公告】EP 系統升級通知',
    titleEn: 'System Upgrade Notice',
    contentZh: '<p>親愛的使用者，</p><p>EP 系統將於本週六凌晨 02:00～06:00 進行例行性維護升級，期間系統將暫停服務，請提前完成相關作業，造成不便敬請見諒。</p>',
    contentEn: '<p>Dear users,</p><p>The EP system will undergo routine maintenance from 02:00 to 06:00 this Saturday. The system will be temporarily unavailable during this period. Please complete any necessary tasks in advance. We apologize for any inconvenience.</p>',
    attachments: [
      {
        id: 'att-002',
        name: '系統升級說明.pdf',
        url: `data:text/plain;charset=utf-8,${encodeURIComponent('【系統公告】EP 系統升級說明\n\n維護時間：本週六凌晨 02:00～06:00\n影響範圍：全系統\n\n--- 測試附件 (Mock) ---')}`,
      },
      {
        id: 'att-003',
        name: '維護時程表.xlsx',
        url: `data:text/plain;charset=utf-8,${encodeURIComponent('維護時程表 (Mock)\n日期, 時間, 項目\n2025-03-15, 02:00-06:00, EP 系統升級')}`,
      },
    ],
    readCount: 58,
  },
];
