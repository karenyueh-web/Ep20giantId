/**
 * ShipmentPrintPage — 列印頁面（內嵌全頁，非 Modal）
 *
 * 結構：
 *   ─ 工具列：← 返回  |  TAB：中文出貨單 / 中文外箱貼紙 / 英文出貨單 / 英文外箱貼紙  |  [print 按鈕]
 *   ─ 預覽區：白底 A4 比例卡片；中文出貨單 TAB 已實作真實文件，其他 TAB 保留佔位
 */

import { useState } from 'react';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { ShipmentRow, ShipmentDetailItem } from './ShipmentListPage';
import { MOCK_VENDORS } from './VendorManagementTable';

// ── TAB 定義 ─────────────────────────────────────────────────────────────────
export type PrintTab = 'zh-shipment' | 'zh-sticker' | 'en-shipment' | 'en-sticker';

interface TabItem {
  id: PrintTab;
  label: string;
}

const PRINT_TABS: TabItem[] = [
  { id: 'zh-shipment', label: '中文出貨單' },
  { id: 'zh-sticker',  label: '中文外箱貼紙' },
  { id: 'en-shipment', label: '英文出貨單' },
  { id: 'en-sticker',  label: '英文外箱貼紙' },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface ShipmentPrintPageProps {
  vendorShipmentNo: string;
  shipment?: ShipmentRow;
  onBack: () => void;
  initialTab?: PrintTab;
  /** 限制可顯示的 TAB，預設全部 */
  tabs?: PrintTab[];
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function ShipmentPrintPage({ vendorShipmentNo, shipment, onBack, initialTab = 'zh-shipment', tabs }: ShipmentPrintPageProps) {
  const availableTabs = tabs ? PRINT_TABS.filter(t => tabs.includes(t.id)) : PRINT_TABS;
  const resolvedInitial = availableTabs.find(t => t.id === initialTab)?.id ?? availableTabs[0]?.id ?? 'zh-shipment';
  const [activeTab, setActiveTab] = useState<PrintTab>(resolvedInitial);

  const isSticker = activeTab.includes('sticker');

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ── @media print 全域 CSS ── */}
      <style>{`
        @page { size: A4 portrait; margin: 12mm; }

        @media print {
          /* 隱藏全部，讓 visibility 可被子層覆蓋 */
          body * { visibility: hidden !important; }

          /* 列印區域及其所有子節點設為可見 */
          .print-area,
          .print-area * { visibility: visible !important; }

          /* 固定在頁面左上角，撐滿整頁 */
          .print-area {
            position: fixed !important;
            inset: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
            overflow: visible !important;
          }

          /* 移除預覽卡片的裝飾，撐滿寬度 */
          .shipment-doc-wrapper {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm !important;
          }
        }
      `}</style>

      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

        {/* ── 工具列（no-print）──────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-[rgba(145,158,171,0.08)] relative no-print">
          <div className="content-stretch flex items-center h-[48px] px-[20px] gap-[16px] relative w-full">

            {/* ← 返回 */}
            <div
              onClick={onBack}
              className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity"
              aria-label="返回"
            >
              <IconsSolidIcSolarMultipleForwardLeftBroken />
            </div>

            {/* TAB 列 */}
            {availableTabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
              >
                {activeTab === tab.id && (
                  <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
                )}
                <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${activeTab === tab.id ? 'text-[#1c252e]' : 'text-[#637381]'}`}>
                  {tab.label}
                </p>
              </div>
            ))}

            {/* print 按鈕 */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-[7px] h-[32px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              print
            </button>

            {/* 底部灰色線 */}
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>

        {/* ── 預覽區 ──────────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[32px] py-[28px] print-area">
          <PrintPreviewArea isSticker={isSticker} activeTab={activeTab} shipment={shipment} />
        </div>
      </div>
    </>
  );
}

// ── 預覽區路由 ────────────────────────────────────────────────────────────────
function PrintPreviewArea({ isSticker, activeTab, shipment }: { isSticker: boolean; activeTab: PrintTab; shipment?: ShipmentRow }) {

  // 中文出貨單：有資料就顯示真實文件
  if (activeTab === 'zh-shipment') {
    if (shipment) {
      return (
        <div className="flex flex-col items-center gap-[24px] w-full">
          <ZhShipmentDoc shipment={shipment} />
        </div>
      );
    }
    // 無資料時的提示
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-[12px]">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">請先從列表選取出貨單後再列印</p>
      </div>
    );
  }

  // 其他 TAB 保留毛玻璃佔位
  const tabLabel = PRINT_TABS.find(t => t.id === activeTab)?.label ?? '';
  const cardCount = isSticker ? 4 : 2;
  return (
    <div className="relative w-full min-h-full">
      <div className={`grid gap-[20px] ${isSticker ? 'grid-cols-2' : 'grid-cols-1 max-w-[660px] mx-auto'}`}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="bg-white rounded-[12px] border border-[rgba(145,158,171,0.12)] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            {isSticker ? <StickerSkeleton /> : <ShipmentDocSkeleton index={i} />}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: 'rgba(244,246,248,0.70)' }}>
        <div className="flex items-center justify-center rounded-full mb-[20px] shrink-0" style={{ width: 80, height: 80, background: 'rgba(0,94,184,0.08)', boxShadow: '0 0 0 18px rgba(0,94,184,0.04)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
          </svg>
        </div>
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[20px] text-[#1c252e] mb-[10px] text-center">{tabLabel} 預覽</p>
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] text-center leading-[24px]">功能建置中，敬請期待</p>
        <div className="mt-[20px] flex items-center gap-[7px] px-[16px] py-[7px] rounded-full" style={{ background: 'rgba(0,94,184,0.08)', border: '1px solid rgba(0,94,184,0.18)' }}>
          <span className="w-[8px] h-[8px] rounded-full bg-[#005eb8] shrink-0 animate-pulse" />
          <span className="font-['Public_Sans:Medium',sans-serif] font-medium text-[13px] text-[#005eb8]">功能開發中</span>
        </div>
      </div>
    </div>
  );
}

// ── 中文出貨單（送貨單）HTML 模板 ────────────────────────────────────────────
function ZhShipmentDoc({ shipment }: { shipment: ShipmentRow }) {
  const vendorFull = MOCK_VENDORS.find(v => v.code === shipment.vendorCode)?.fullName
    ?? shipment.vendorName.replace(/\(.*\)/, '').trim();
  const plantCode = shipment.details[0]?.plantCode ?? '';
  const company   = shipment.details[0]?.company   ?? '';
  const totalQty   = shipment.details.reduce((s, d) => s + d.shipQty, 0);
  const totalBoxes = shipment.details.reduce((s, d) => s + d.totalBoxes, 0);

  // ── 分頁設定 ──────────────────────────────────────────────────────────────
  const ROWS_PER_PAGE = 10; // 每頁最多幾筆明細
  const pages: ShipmentDetailItem[][] = [];
  for (let i = 0; i < shipment.details.length; i += ROWS_PER_PAGE) {
    pages.push(shipment.details.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]); // 空資料也要渲染一頁

  // ── 樣式常數 ──────────────────────────────────────────────────────────────
  const border = '1px solid #333';
  const td: React.CSSProperties  = { border, padding: '3px 5px', fontSize: '13px', verticalAlign: 'middle' };
  const th: React.CSSProperties  = { ...td, fontWeight: 'bold', background: '#f0f0f0', textAlign: 'center' };
  const etd: React.CSSProperties = { ...td, height: '22px' };

  // ── 共用：A + B 表頭列（每頁重複） ────────────────────────────────────────
  const TableHeader = () => (
    <>
      {/* A：客戶資訊 */}
      <tr>
        <td style={{ ...td }} colSpan={2}>客戶名稱:{company}</td>
        <td style={{ ...td }} colSpan={2}>客戶出貨國家:</td>
        <td style={{ ...td }} colSpan={4}>交貨地點:{shipment.deliveryAddress}</td>
      </tr>
      {/* B：欄位標頭 */}
      <tr>
        <th style={{ ...th, width: '17%' }}>訂購號碼</th>
        <th style={{ ...th, width: '18%' }}>料號</th>
        <th style={{ ...th, width: '17%' }}>品名規格</th>
        <th style={{ ...th, width: '8%', whiteSpace: 'nowrap' }}>總數量</th>
        <th style={{ ...th, width: '6%', whiteSpace: 'nowrap' }}>件數</th>
        <th style={{ ...th, width: '10%' }}>儲存地點</th>
        <th style={{ ...th, width: '13%' }}>廠商料號</th>
        <th style={{ ...th, width: '11%' }}>客戶訂單號碼</th>
      </tr>
    </>
  );

  return (
    <div
      className="shipment-doc-wrapper"
      style={{
        width: '100%', maxWidth: '660px', margin: '0 auto',
        background: 'white', padding: '20px 24px',
        fontFamily: "'Noto Sans TC','Noto Sans JP','微軟正黑體',sans-serif",
        fontSize: '12px', color: '#000',
        border: '1px solid rgba(145,158,171,0.2)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        boxSizing: 'border-box',
      }}
    >
      {pages.map((pageRows, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage  = pageIndex === pages.length - 1;
        const emptyRows   = Math.max(0, ROWS_PER_PAGE - pageRows.length);
        const pageQty     = pageRows.reduce((s, d) => s + d.shipQty, 0);
        const pageBoxes   = pageRows.reduce((s, d) => s + d.totalBoxes, 0);

        return (
          <div
            key={pageIndex}
            style={{ pageBreakAfter: isLastPage ? 'auto' : 'always', breakAfter: isLastPage ? 'auto' : 'page' }}
          >
            {/* ─ 文件表頭（第一頁顯示）─ */}
            {isFirstPage && (
              <>
                {/* ① 公司名稱 */}
                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', letterSpacing: '1px' }}>
                  {vendorFull}
                </div>

                {/* ②③ 工廠/日期（左）+ QR（右）+ 送貨單（絕對置中）*/}
                <div style={{ position: 'relative', display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'stretch' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '14px' }}>工廠:{plantCode}</div>
                      <div style={{ fontSize: '14px', textAlign: 'right' }}>廠商出貨單號: {shipment.vendorShipmentNo}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px' }}>日期：{shipment.deliveryDate}</div>
                      <div style={{ fontSize: '14px', textAlign: 'right' }}>進項交貨單號: {shipment.sapDeliveryNo || '—'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '58px', height: '58px', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999', flexShrink: 0 }}>QR Code</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', pointerEvents: 'none' }}>送貨單</div>
                </div>
              </>
            )}

            {/* ─ 表格（每頁） ─ */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader />

              {/* 明細資料列 */}
              {pageRows.map((d: ShipmentDetailItem, i: number) => (
                <tr key={i}>
                  <td style={{ ...td, wordBreak: 'break-all' }}>{d.orderNo}-{d.orderSeq}</td>
                  <td style={{ ...td, wordBreak: 'break-all' }}>{d.materialNo}</td>
                  <td style={td}>{d.productName || d.materialNo}</td>
                  <td style={{ ...td, textAlign: 'right'  }}>{d.shipQty}</td>
                  <td style={{ ...td, textAlign: 'right'  }}>{d.totalBoxes}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{d.storageLocationCode || ''}</td>
                  <td style={td}>{d.vendorMaterialNo || ''}</td>
                  <td style={td}></td>
                </tr>
              ))}

              {/* 空白補列（填滿至 ROWS_PER_PAGE）*/}
              {Array.from({ length: emptyRows }).map((_, i) => (
                <tr key={`e${i}`}>{[0,1,2,3,4,5,6,7].map(j => <td key={j} style={etd}></td>)}</tr>
              ))}

              {/* 小計（每頁結尾）*/}
              <tr>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={3}>小計</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{pageQty}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{pageBoxes}</td>
                <td style={td}></td><td style={td}></td><td style={td}></td>
              </tr>

              {/* 合計 + 運送方式（最後一頁）*/}
              {isLastPage && (
                <>
                  <tr>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={3}>合計</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{totalQty}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{totalBoxes}</td>
                    <td style={td}></td><td style={td}></td><td style={td}></td>
                  </tr>
                  {/* 合計後空白列 */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`lp${i}`}>{[0,1,2,3,4,5,6,7].map(j => <td key={j} style={etd}></td>)}</tr>
                  ))}
                  {/* C：運送方式 */}
                  <tr>
                    <td style={{ ...td, textAlign: 'center', writingMode: 'vertical-rl', letterSpacing: '4px', verticalAlign: 'middle' }} rowSpan={4}>運送方式</td>
                    <td style={{ ...td, height: '26px' }}>□ 1  自送</td>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'top', padding: 0 }} colSpan={2} rowSpan={4}>
                      <div style={{ borderBottom: '1px solid #333', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>簽收</div>
                    </td>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'top', padding: 0 }} colSpan={2} rowSpan={4}>
                      <div style={{ borderBottom: '1px solid #333', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>備註</div>
                    </td>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'top', padding: 0 }} colSpan={2} rowSpan={4}>
                      <div style={{ borderBottom: '1px solid #333', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>出貨核章</div>
                    </td>
                  </tr>
                  <tr><td style={td}>□ 2  貨運</td></tr>
                  <tr><td style={td}>□ 3  專車</td></tr>
                  <tr><td style={td}>□ 4</td></tr>
                </>
              )}
            </table>
          </div>
        );
      })}
    </div>
  );
}



// ── 保留原有骨架元件（其他 TAB 用） ──────────────────────────────────────────
function StickerSkeleton() {
  return (
    <div className="p-[14px] flex flex-col gap-[8px]" style={{ minHeight: 260 }}>
      <div className="grid grid-cols-2 gap-[8px]">
        <div className="h-[11px] rounded-[3px] bg-[rgba(145,158,171,0.14)]" style={{ width: '70%' }} />
        <div className="h-[11px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '60%', marginLeft: 'auto' }} />
      </div>
      <div className="border border-[rgba(145,158,171,0.16)] rounded-[4px] p-[8px] flex flex-col gap-[5px]">
        <div className="h-[11px] rounded-[3px] bg-[rgba(145,158,171,0.16)]" style={{ width: '55%' }} />
        <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '80%' }} />
      </div>
      {[['客戶料號','淨重'], ['客戶訂單號碼','毛重'], ['廠商料號','']].map((_, i) => (
        <div key={i} className="grid grid-cols-2 gap-[4px]">
          <div className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '65%' }} />
          <div className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.08)]" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

function ShipmentDocSkeleton({ index }: { index: number }) {
  return (
    <div className="p-[20px] flex flex-col gap-[12px]" style={{ minHeight: 340 }}>
      <div className="flex items-center justify-center py-[8px] border-b border-[rgba(145,158,171,0.14)]">
        <div className="h-[16px] rounded-[3px] bg-[rgba(145,158,171,0.16)]" style={{ width: 140 }} />
      </div>
      <div className="grid grid-cols-2 gap-x-[24px] gap-y-[10px]">
        {Array.from({ length: 6 }).map((_, j) => (
          <div key={j} className="flex gap-[8px] items-center">
            <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: 60, flexShrink: 0 }} />
            <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.14)]" style={{ flex: 1 }} />
          </div>
        ))}
      </div>
      <div className="border border-[rgba(145,158,171,0.14)] rounded-[4px] overflow-hidden mt-[4px]">
        <div className="flex gap-[0px] bg-[rgba(145,158,171,0.06)] border-b border-[rgba(145,158,171,0.14)]">
          {[70,120,120,70,70,70].map((w, j) => (
            <div key={j} className="px-[8px] py-[8px]" style={{ width: w, flexShrink: 0 }}>
              <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.12)]" />
            </div>
          ))}
        </div>
        {Array.from({ length: index === 0 ? 2 : 3 }).map((_, row) => (
          <div key={row} className="flex gap-[0px] border-b border-[rgba(145,158,171,0.08)] last:border-0">
            {[70,120,120,70,70,70].map((w, j) => (
              <div key={j} className="px-[8px] py-[7px]" style={{ width: w, flexShrink: 0 }}>
                <div className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.09)]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
