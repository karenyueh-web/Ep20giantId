import { ResponsivePageLayout } from './ResponsivePageLayout';
import type { PageType } from './MainLayout';

// ── 頁面資訊映射 ──────────────────────────────────────────────────────────────
const PAGE_META: Partial<Record<string, { title: string; breadcrumb: string }>> = {
  // OVERVIEW
  'dashboard':              { title: 'Dashboard',       breadcrumb: '首頁 • Dashboard' },
  'announcement':           { title: '公佈欄',          breadcrumb: '首頁 • 公佈欄' },
  'personal-settings':      { title: '個人設定',        breadcrumb: '首頁 • 個人設定' },
  'receiving-inquiry':      { title: '收料查詢',        breadcrumb: '管理作業 • 收料查詢' },
  'schedule-inquiry':       { title: '排程總表查詢',    breadcrumb: '' },
  // 訂單管理
  'order-schedule-change':  { title: '變更生管排程',    breadcrumb: '訂單管理 • 變更生管排程' },
  // 修正單管理
  'correction-create':      { title: '建立修正單',      breadcrumb: '修正單管理 • 建立修正單' },
  'correction-list':        { title: '修正單查詢',      breadcrumb: '修正單管理 • 修正單查詢' },
  // 出貨單
  'shipping-create':        { title: '建立出貨單',      breadcrumb: '出貨單 • 建立出貨單' },
  'shipping-list':          { title: '出貨單查詢',      breadcrumb: '出貨單 • 出貨單查詢' },
  'shipping-packing':       { title: '出貨/裝箱明細',  breadcrumb: '出貨單 • 出貨/裝箱明細' },
  'shipping-print':         { title: '列印單據',        breadcrumb: '出貨單 • 列印單據' },
  'shipping-settings':      { title: '基本設定',        breadcrumb: '出貨單 • 基本設定' },
  // 發票作業
  'invoice-create':         { title: '開立發票',        breadcrumb: '發票作業 • 開立發票' },
  'invoice-list':           { title: '發票查詢',        breadcrumb: '發票作業 • 發票查詢' },
  'invoice-settings':       { title: '發票設定',        breadcrumb: '發票作業 • 發票設定' },
  // 零件/索樣維護
  'parts-maintain':         { title: '零件資訊維護',    breadcrumb: '零件/索樣維護 • 零件資訊維護' },
  'parts-quote':            { title: '列印報價單',      breadcrumb: '零件/索樣維護 • 列印報價單' },
  'parts-sample':           { title: '索樣單',          breadcrumb: '零件/索樣維護 • 索樣單' },
  // 品保作業
  'quality-report':         { title: '檢驗/測試報告',  breadcrumb: '品保作業 • 檢驗/測試報告' },
  'quality-hazard':         { title: '危害物質管理',    breadcrumb: '品保作業 • 危害物質管理' },
  'quality-other':          { title: '其他設定',        breadcrumb: '品保作業 • 其他設定' },
  // 產險 / 新零件 / 廠商評價 / ESG / 出貨台灣
  'insurance-maintain':     { title: '產險資料維護',    breadcrumb: '產險資料維護' },
  'newparts-project':       { title: '新零件專案維護',  breadcrumb: '新零件維護 • 新零件專案維護' },
  'newparts-settings':      { title: '專案設定',        breadcrumb: '新零件維護 • 專案設定' },
  'vendor-evaluation':      { title: '廠商評價',        breadcrumb: '廠商評價' },
  'esg-material':           { title: '物料成分總檔',    breadcrumb: 'ESG • 物料成分總檔' },
  'esg-maintain':           { title: '材料維護',        breadcrumb: 'ESG • 材料維護' },
  'shipment-tw-order':      { title: '訂單查詢',        breadcrumb: '出貨台灣捷安特 • 訂單查詢' },
  'shipment-tw-shipping':   { title: '出貨單查詢',      breadcrumb: '出貨台灣捷安特 • 出貨單查詢' },
  'shipment-tw-print':      { title: '列印外箱貼紙',    breadcrumb: '出貨台灣捷安特 • 列印外箱貼紙' },
};

// ── Mock 骨架列（假資料，背景模糊用） ──────────────────────────────────────────
function MockRow({ widths, shade }: { widths: number[]; shade?: boolean }) {
  return (
    <div className={`flex h-[52px] border-b border-[rgba(145,158,171,0.06)] ${shade ? 'bg-[rgba(145,158,171,0.03)]' : ''}`}>
      {widths.map((w, i) => (
        <div
          key={i}
          className="flex items-center px-[14px] border-r border-[rgba(145,158,171,0.06)] last:border-r-0 last:flex-1"
          style={{ width: w }}
        >
          <div
            className="h-[12px] rounded-full bg-[rgba(145,158,171,0.28)]"
            style={{ width: `${55 + ((i * 17 + w) % 38)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Mock 上方搜尋欄骨架 ──────────────────────────────────────────────────────
function MockSearchBar() {
  return (
    <div className="flex gap-[12px] items-end px-[20px] py-[16px] border-b border-[rgba(145,158,171,0.08)]">
      {[120, 160, 140, 110].map((w, i) => (
        <div key={i} className="flex flex-col gap-[6px]">
          <div className="h-[10px] w-[48px] rounded-full bg-[rgba(145,158,171,0.25)]" />
          <div className="h-[36px] rounded-[8px] bg-[rgba(145,158,171,0.12)] border border-[rgba(145,158,171,0.16)]" style={{ width: w }} />
        </div>
      ))}
      <div className="h-[36px] w-[80px] ml-auto rounded-[8px] bg-[rgba(145,158,171,0.2)]" />
    </div>
  );
}

// ── Mock Toolbar 骨架 ─────────────────────────────────────────────────────────
function MockToolbar() {
  return (
    <div className="flex items-center justify-between px-[20px] h-[52px] border-b border-[rgba(145,158,171,0.08)]">
      <div className="flex gap-[8px] items-center">
        <div className="h-[12px] w-[60px] rounded-full bg-[rgba(145,158,171,0.22)]" />
        <div className="h-[12px] w-[40px] rounded-full bg-[rgba(145,158,171,0.16)]" />
      </div>
      <div className="flex gap-[8px]">
        {[80, 72, 72, 88].map((w, i) => (
          <div key={i} className="h-[32px] rounded-[8px] bg-[rgba(145,158,171,0.15)]" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// ── Mock 表頭骨架 ─────────────────────────────────────────────────────────────
function MockTableHeader({ widths }: { widths: number[] }) {
  return (
    <div className="flex h-[48px] bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.08)]">
      {widths.map((w, i) => (
        <div
          key={i}
          className="flex items-center px-[14px] border-r border-[rgba(145,158,171,0.06)] last:border-r-0 last:flex-1"
          style={{ width: w }}
        >
          <div className="h-[10px] rounded-full bg-[rgba(145,158,171,0.35)]" style={{ width: `${60 + (i * 13 % 30)}%` }} />
        </div>
      ))}
    </div>
  );
}

// ── 假內容（會被模糊） ────────────────────────────────────────────────────────
function MockContent() {
  const colWidths = [88, 100, 120, 190, 110, 120, 160, 160, 90, 100, 110];
  return (
    <div className="bg-white rounded-[16px] flex flex-col h-full overflow-hidden shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]">
      <MockSearchBar />
      <MockToolbar />
      <MockTableHeader widths={colWidths} />
      {/* 資料列 */}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <MockRow key={i} widths={colWidths} shade={i % 2 === 1} />
        ))}
      </div>
      {/* 分頁列 */}
      <div className="h-[52px] border-t border-[rgba(145,158,171,0.08)] flex items-center px-[20px] gap-[12px]">
        {[60, 40, 36, 36, 36].map((w, i) => (
          <div key={i} className="h-[28px] rounded-[6px] bg-[rgba(145,158,171,0.15)]" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface UnderConstructionPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function UnderConstructionPage({
  currentPage,
  onPageChange,
  onLogout,
  userRole = 'giant',
}: UnderConstructionPageProps) {
  const meta = PAGE_META[currentPage] ?? { title: '功能開發中', breadcrumb: '功能開發中' };

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title={meta.title}
      breadcrumb={meta.breadcrumb}
    >
      {/* 相對容器：假內容 + 毛玻璃遮罩疊加 */}
      <div className="relative h-full w-full">
        {/* ── 底層：假頁面內容（套用模糊） ── */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          style={{ filter: 'blur(4px)', opacity: 0.7 }}
          aria-hidden="true"
        >
          <MockContent />
        </div>

        {/* ── 毛玻璃遮罩 ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'rgba(248,250,252,0.55)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        >
          {/* 建置中圖示 */}
          <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-white shadow-[0px_4px_24px_rgba(0,94,184,0.12)] mb-[20px]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#005eb8" opacity="0.3" />
              <path d="M2 17L12 22L22 17" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* 文字 */}
          <p
            className="text-[#1c252e] text-[22px] leading-[32px] tracking-[0.5px]"
            style={{ fontFamily: "'Noto_Sans_TC:Bold','Public_Sans:SemiBold',sans-serif", fontWeight: 700 }}
          >
            畫面建置中
          </p>
          <p
            className="mt-[8px] text-[#637381] text-[14px] leading-[22px]"
            style={{ fontFamily: "'Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif" }}
          >
            此功能正在開發中，敬請期待
          </p>
        </div>
      </div>
    </ResponsivePageLayout>
  );
}