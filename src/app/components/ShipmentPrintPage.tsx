/**
 * ShipmentPrintPage — 列印頁面（內嵌全頁，非 Modal）
 *
 * 結構：
 *   ─ 工具列：← 返回  |  TAB：中文出貨單 / 中文外箱貼紙 / 英文出貨單 / 英文外箱貼紙  |  [print 按鈕]
 *   ─ 預覽區：白底 A4 比例卡片；中文出貨單 TAB 已實作真實文件，其他 TAB 保留佔位
 */

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { ShipmentRow, ShipmentDetailItem } from './ShipmentListPage';
import type { BoxLineRow } from './ShipmentShippingInquiryPage';
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
  selectedBoxRows?: BoxLineRow[];
  onBack: () => void;
  initialTab?: PrintTab;
  /** 限制可顯示的 TAB，預設全部 */
  tabs?: PrintTab[];
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function ShipmentPrintPage({ vendorShipmentNo, shipment, selectedBoxRows, onBack, initialTab = 'zh-shipment', tabs }: ShipmentPrintPageProps) {
  const availableTabs = tabs ? PRINT_TABS.filter(t => tabs.includes(t.id)) : PRINT_TABS;
  const resolvedInitial = availableTabs.find(t => t.id === initialTab)?.id ?? availableTabs[0]?.id ?? 'zh-shipment';
  const [activeTab, setActiveTab] = useState<PrintTab>(resolvedInitial);

  const isSticker = activeTab.includes('sticker');

  const handlePrint = () => {
    const printArea = document.querySelector('.print-area');
    if (!printArea) { window.print(); return; }

    // ① Clone 列印區域
    const cloned = printArea.cloneNode(true) as HTMLElement;

    // ② Canvas（QR Code）轉成 <img>
    const canvases = printArea.querySelectorAll('canvas');
    const clonedCanvases = cloned.querySelectorAll('canvas');
    canvases.forEach((canvas, i) => {
      const img = document.createElement('img');
      img.src = (canvas as HTMLCanvasElement).toDataURL('image/png');
      img.style.cssText = (canvas as HTMLElement).style.cssText;
      img.width  = canvas.width;
      img.height = canvas.height;
      clonedCanvases[i]?.replaceWith(img);
    });

    // ③ 修改 cloned 的 inline style
    cloned.querySelectorAll('.shipment-doc-wrapper').forEach(el => {
      const e = el as HTMLElement;
      e.style.padding = '0';
      e.style.margin = '0';
      e.style.border = 'none';
      e.style.boxShadow = 'none';
      e.style.borderRadius = '0';
      e.style.maxWidth = '100%';
      e.style.width = '100%';
    });
    cloned.querySelectorAll('[data-no-print]').forEach(el => {
      const e = el as HTMLElement;
      e.style.marginTop = 'auto';
      e.style.marginBottom = '0';
    });

    // ④ 建立隱藏 iframe（不會被彈窗攔截）
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:0;height:0;border:none;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }

    const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <title> </title>
  <style>
    @page { size: A4 portrait; margin: ${isSticker ? '0mm' : '12mm'}; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; font-family: 'Noto Sans TC','Noto Sans JP','微軟正黑體',sans-serif; }
    table  { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #333; padding: 3px 5px; font-size: 13px; vertical-align: middle; }
    .shipment-page-block {
      page-break-after: always;
      break-after: page;
      min-height: 273mm;
      display: flex;
      flex-direction: column;
    }
    .shipment-page-block:last-child {
      page-break-after: auto;
      break-after: auto;
      min-height: 0;
    }
    [data-no-print] { display: flex; }
  </style>
</head>
<body>${cloned.innerHTML}</body>
</html>`;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // ⑤ 等渲染完成後列印，列印結束移除 iframe
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); }, 500);
    }, 300);
  };

  return (
    <>


      <div className="print-wrapper bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

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
          <PrintPreviewArea isSticker={isSticker} activeTab={activeTab} shipment={shipment} selectedBoxRows={selectedBoxRows} />
        </div>
      </div>
    </>
  );
}

// ── 預覽區路由 ────────────────────────────────────────────────────────────────
function PrintPreviewArea({ isSticker, activeTab, shipment, selectedBoxRows }: { isSticker: boolean; activeTab: PrintTab; shipment?: ShipmentRow; selectedBoxRows?: BoxLineRow[] }) {

  // 中文出貨單：有資料就顯示真實文件
  if (activeTab === 'zh-shipment') {
    if (shipment) {
      return (
        <div className="flex flex-col items-center gap-[24px] w-full">
          <ZhShipmentDoc shipment={shipment} />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-[12px]">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">請先從列表選取出貨單後再列印</p>
      </div>
    );
  }

  // 英文出貨單
  if (activeTab === 'en-shipment') {
    if (shipment) {
      return (
        <div className="flex flex-col items-center gap-[24px] w-full">
          <EnShipmentDoc shipment={shipment} />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-[12px]">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#919eab]">請先從列表選取出貨單後再列印</p>
      </div>
    );
  }

  // 中文外箱貼紙
  if (activeTab === 'zh-sticker') {
    // 優先使用已傳入的 selectedBoxRows，否則從 shipment 自動展開
    const boxRows = (selectedBoxRows && selectedBoxRows.length > 0)
      ? selectedBoxRows
      : shipment
        ? expandShipmentToBoxRows(shipment)
        : [];

    if (boxRows.length > 0) {
      return (
        <div className="flex flex-col items-center gap-[24px] w-full">
          <ZhStickerDoc boxRows={boxRows} />
        </div>
      );
    }
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

// ── QR Code Canvas 元件 ───────────────────────────────────────────────────────
function QrCodeCanvas({ value, size = 62 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).catch(console.error);
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    />
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
  const ROWS_PER_PAGE = 15; // 每頁最多幾筆明細
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
        const pageQty     = pageRows.reduce((s, d) => s + d.shipQty, 0);
        const pageBoxes   = pageRows.reduce((s, d) => s + d.totalBoxes, 0);

        return (
          <div key={pageIndex} className="shipment-page-block">
            {/* ─ 文件表頭（每頁皆顯示）─ */}
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
                {/* 每頁都顯示 QR Code */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '66px' }}>
                  <QrCodeCanvas value={shipment.sapDeliveryNo || shipment.vendorShipmentNo} size={62} />
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', pointerEvents: 'none' }}>送貨單</div>
              </div>
            </>

            {/* ─ 表格（每頁） ─ */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader />

              {/* 明細資料列（每 5 筆加粗底框線） */}
              {pageRows.map((d: ShipmentDetailItem, i: number) => {
                const isFifthRow = (i + 1) % 5 === 0;
                const rowTd: React.CSSProperties = isFifthRow
                  ? { ...td, borderBottom: '2.5px solid #000' }
                  : td;
                return (
                  <tr key={i}>
                    <td style={{ ...rowTd, wordBreak: 'break-all' }}>{d.orderNo}-{d.orderSeq}</td>
                    <td style={{ ...rowTd, wordBreak: 'break-all' }}>{d.materialNo}</td>
                    <td style={rowTd}>{d.productName || d.materialNo}</td>
                    <td style={{ ...rowTd, textAlign: 'right'  }}>{d.shipQty}</td>
                    <td style={{ ...rowTd, textAlign: 'right'  }}>{d.totalBoxes}</td>
                    <td style={{ ...rowTd, textAlign: 'center' }}>{d.storageLocationCode || ''}</td>
                    <td style={rowTd}>{d.vendorMaterialNo || ''}</td>
                    <td style={rowTd}></td>
                  </tr>
                );
              })}

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

            {/* ─ 分頁符號（非最後頁顯示，列印時隱藏）─ */}
            {!isLastPage && (
              <div
                data-no-print="true"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  margin: '20px 0', color: '#aaa', fontSize: '13px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
                <span style={{ padding: '2px 14px', color: '#777', fontSize: '13px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  {pageIndex + 1} / {pages.length}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── 英文出貨單（Delivery Sheet）HTML 模板 ──────────────────────────────────────
function EnShipmentDoc({ shipment }: { shipment: ShipmentRow }) {
  const vendorFull = MOCK_VENDORS.find(v => v.code === shipment.vendorCode)?.fullName
    ?? shipment.vendorName.replace(/\(.*\)/, '').trim();
  const plantCode = shipment.details[0]?.plantCode ?? '';
  const company   = shipment.details[0]?.company   ?? '';
  const totalQty   = shipment.details.reduce((s, d) => s + d.shipQty, 0);
  const totalBoxes = shipment.details.reduce((s, d) => s + d.totalBoxes, 0);

  // ── 分頁設定 ──────────────────────────────────────────────────────────────
  const ROWS_PER_PAGE = 15;
  const pages: ShipmentDetailItem[][] = [];
  for (let i = 0; i < shipment.details.length; i += ROWS_PER_PAGE) {
    pages.push(shipment.details.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  // ── 樣式常數 ──────────────────────────────────────────────────────────────
  const border = '1px solid #333';
  const td: React.CSSProperties  = { border, padding: '3px 5px', fontSize: '13px', verticalAlign: 'middle' };
  const th: React.CSSProperties  = { ...td, fontWeight: 'bold', background: '#f0f0f0', textAlign: 'center' };

  // ── 共用：A + B 表頭列（每頁重複） ────────────────────────────────────────
  const TableHeader = () => (
    <>
      {/* A：Customer info */}
      <tr>
        <td style={{ ...td }} colSpan={2}>Customer:{company}</td>
        <td style={{ ...td }} colSpan={2}>Cust shipment country :</td>
        <td style={{ ...td }} colSpan={4}>Address : {shipment.deliveryAddress}</td>
      </tr>
      {/* B：Column headers */}
      <tr>
        <th style={{ ...th, width: '17%' }}>Purchase order</th>
        <th style={{ ...th, width: '18%' }}>Part no</th>
        <th style={{ ...th, width: '17%' }}>Part short name</th>
        <th style={{ ...th, width: '8%', whiteSpace: 'nowrap' }}>Ship qty</th>
        <th style={{ ...th, width: '6%', whiteSpace: 'nowrap' }}>Carton qty</th>
        <th style={{ ...th, width: '10%' }}>Location</th>
        <th style={{ ...th, width: '13%' }}>Vender part no.</th>
        <th style={{ ...th, width: '11%' }}>Cus order No.</th>
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
        const isLastPage  = pageIndex === pages.length - 1;
        const pageQty     = pageRows.reduce((s, d) => s + d.shipQty, 0);
        const pageBoxes   = pageRows.reduce((s, d) => s + d.totalBoxes, 0);

        return (
          <div key={pageIndex} className="shipment-page-block">
            {/* ─ Document header (every page) ─ */}
            <>
              {/* ① Company name */}
              <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', letterSpacing: '1px' }}>
                {vendorFull}
              </div>

              {/* ②③ Plant/Date (left) + QR (right) + Delivery sheet (centered) */}
              <div style={{ position: 'relative', display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '14px' }}>Plant:{plantCode}</div>
                    <div style={{ fontSize: '14px', textAlign: 'right' }}>Vender ship no:{shipment.vendorShipmentNo}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px' }}>Onboard date : {shipment.deliveryDate}</div>
                    <div style={{ fontSize: '14px', textAlign: 'right' }}>Inbound Delivery:{shipment.sapDeliveryNo || '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '66px' }}>
                  <QrCodeCanvas value={shipment.sapDeliveryNo || shipment.vendorShipmentNo} size={62} />
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0px', pointerEvents: 'none' }}>Delivery sheet</div>
              </div>
            </>

            {/* ─ Table (per page) ─ */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader />

              {/* Data rows (thick border every 5 rows) */}
              {pageRows.map((d: ShipmentDetailItem, i: number) => {
                const isFifthRow = (i + 1) % 5 === 0;
                const rowTd: React.CSSProperties = isFifthRow
                  ? { ...td, borderBottom: '2.5px solid #000' }
                  : td;
                return (
                  <tr key={i}>
                    <td style={{ ...rowTd, wordBreak: 'break-all' }}>{d.orderNo}-{d.orderSeq}</td>
                    <td style={{ ...rowTd, wordBreak: 'break-all' }}>{d.materialNo}</td>
                    <td style={rowTd}>{d.productName || d.materialNo}</td>
                    <td style={{ ...rowTd, textAlign: 'right'  }}>{d.shipQty}</td>
                    <td style={{ ...rowTd, textAlign: 'right'  }}>{d.totalBoxes}</td>
                    <td style={{ ...rowTd, textAlign: 'center' }}>{d.storageLocationCode || ''}</td>
                    <td style={rowTd}>{d.vendorMaterialNo || ''}</td>
                    <td style={rowTd}></td>
                  </tr>
                );
              })}

              {/* Subtotal (every page) */}
              <tr>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={3}>Subtotal</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{pageQty}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{pageBoxes}</td>
                <td style={td}></td><td style={td}></td><td style={td}></td>
              </tr>

              {/* Total + Ship type (last page only) */}
              {isLastPage && (
                <>
                  <tr>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={3}>Total</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{totalQty}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }}>{totalBoxes}</td>
                    <td style={td}></td><td style={td}></td><td style={td}></td>
                  </tr>
                  <tr>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'middle', lineHeight: '1.2', fontSize: '12px' }} rowSpan={4}><div>Ship</div><div>type</div></td>
                    <td style={{ ...td, height: '26px' }}>1  Sea</td>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'top', padding: 0 }} colSpan={2} rowSpan={4}>
                      <div style={{ borderBottom: '1px solid #333', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Receiver signature</div>
                    </td>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'top', padding: 0 }} colSpan={2} rowSpan={4}>
                      <div style={{ borderBottom: '1px solid #333', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Remark</div>
                    </td>
                    <td style={{ ...td, textAlign: 'center', verticalAlign: 'top', padding: 0 }} colSpan={2} rowSpan={4}>
                      <div style={{ borderBottom: '1px solid #333', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Shipping approved</div>
                    </td>
                  </tr>
                  <tr><td style={td}>2  Air</td></tr>
                  <tr><td style={td}>3  Truck</td></tr>
                  <tr><td style={td}>4</td></tr>
                </>
              )}
            </table>

            {/* ─ Page separator (hidden during print) ─ */}
            {!isLastPage && (
              <div
                data-no-print="true"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  margin: '20px 0', color: '#aaa', fontSize: '13px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
                <span style={{ padding: '2px 14px', color: '#777', fontSize: '13px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  {pageIndex + 1} / {pages.length}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── 從出貨單展開為箱級別資料（本地輕量版，避免 import 副作用）───────────────
let _stickerBarcodeCounter = 1;
function expandShipmentToBoxRows(ship: ShipmentRow): BoxLineRow[] {
  _stickerBarcodeCounter = 1;
  const rows: BoxLineRow[] = [];
  for (const d of ship.details) {
    const boxes = d.boxes ?? [];
    for (const box of boxes) {
      const bc = String(_stickerBarcodeCounter++).padStart(10, '0') + 'S';
      rows.push({
        id: `${ship.id}-${d.itemNo}-${box.boxNo}`,
        barcode: bc,
        boxQty: box.qty,
        labelSeqNo: box.boxNo,
        totalBoxes: boxes.length,
        itemNo: d.itemNo,
        orderDocSeq: `${d.orderNo}${d.orderSeq}`,
        orderNo: d.orderNo,
        orderSeq: d.orderSeq,
        materialNo: d.materialNo,
        vendorMaterialNo: d.vendorMaterialNo || 'TEMPPRICE',
        productName: d.productName || '',
        customerMaterialNo: '',
        customerOrderNo: '',
        shipQty: d.shipQty,
        netWeight: d.netWeight,
        grossWeight: d.grossWeight,
        weightUnit: d.weightUnit,
        countryOfOrigin: d.countryOfOrigin,
        vendorName: ship.vendorName,
        vendorShipmentNo: ship.vendorShipmentNo,
        sapDeliveryNo: ship.sapDeliveryNo,
        deliveryDate: ship.deliveryDate,
        deliveryAddress: ship.deliveryAddress,
        storageLocation: d.storageLocationCode || '',
        plantCode: d.plantCode || 'GTM1',
        specification: d.specification || '',
      });
    }
  }
  return rows;
}

// ── 原產國家 → Made in XX 轉換 ────────────────────────────────────────────────
const COUNTRY_MADE_IN: Record<string, string> = {
  TW: 'Made in Taiwan', CN: 'Made in China', JP: 'Made in Japan',
  US: 'Made in USA', DE: 'Made in Germany', KR: 'Made in Korea',
  IT: 'Made in Italy', FR: 'Made in France', VN: 'Made in Vietnam',
  TH: 'Made in Thailand', MY: 'Made in Malaysia', ID: 'Made in Indonesia',
};
function getMadeIn(code: string): string {
  return COUNTRY_MADE_IN[code] ?? (code ? `Made in ${code}` : '—');
}

// ── 中文外箱貼紙文件 ──────────────────────────────────────────────────────────
// A4 = 210mm × 297mm → 切成 2×3 = 6 等分區塊
// 每區塊之間留 4mm 間距，頁面邊距 5mm
// 區塊寬 = (210 - 5*2 - 4) / 2 = 98mm
// 區塊高 = (297 - 5*2 - 4*2) / 3 = 93mm
// 貼紙置入區塊中，填滿整個區塊

const STICKER_PAGE_MARGIN  = '5mm';
const STICKER_GAP          = '4mm';
const STICKER_COL_W        = '98mm';   // (210 - 10 - 4) / 2
const STICKER_ROW_H        = '93mm';   // (297 - 10 - 8) / 3

function ZhStickerDoc({ boxRows }: { boxRows: BoxLineRow[] }) {
  const STICKERS_PER_PAGE = 6; // 2 columns × 3 rows
  const pages: BoxLineRow[][] = [];
  for (let i = 0; i < boxRows.length; i += STICKERS_PER_PAGE) {
    pages.push(boxRows.slice(i, i + STICKERS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div
      className="shipment-doc-wrapper"
      style={{
        width: '210mm', margin: '0 auto', background: 'white',
        fontFamily: "'Noto Sans TC','Noto Sans JP','微軟正黑體',sans-serif",
        fontSize: '10px', color: '#000', boxSizing: 'border-box',
      }}
    >
      {pages.map((pageStickers, pageIdx) => {
        const isLastPage = pageIdx === pages.length - 1;
        // 補足空格到 6 張
        const cells = [...pageStickers];
        while (cells.length < STICKERS_PER_PAGE) cells.push(null as any);

        return (
          <div key={pageIdx} className="shipment-page-block">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `${STICKER_COL_W} ${STICKER_COL_W}`,
              gridTemplateRows: `${STICKER_ROW_H} ${STICKER_ROW_H} ${STICKER_ROW_H}`,
              gap: STICKER_GAP,
              width: '210mm',
              height: '297mm',
              padding: STICKER_PAGE_MARGIN,
              boxSizing: 'border-box',
            }}>
              {cells.map((row, idx) => (
                <div key={idx} style={{
                  width: '100%', height: '100%', overflow: 'hidden',
                  display: 'flex', alignItems: 'stretch', justifyContent: 'stretch',
                }}>
                  {row ? <SingleSticker row={row} /> : <div style={{ width: '100%', height: '100%' }} />}
                </div>
              ))}
            </div>

            {/* 分頁符號（非最後頁顯示，列印時隱藏） */}
            {!isLastPage && (
              <div
                data-no-print="true"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  margin: '12px 0', color: '#aaa', fontSize: '13px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
                <span style={{ padding: '2px 14px', color: '#777', fontSize: '13px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  {pageIdx + 1} / {pages.length}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 單張貼紙 ──────────────────────────────────────────────────────────────────
function SingleSticker({ row }: { row: BoxLineRow }) {
  // 格式組合
  const stickerShipNo = `${row.vendorShipmentNo}-${String(row.itemNo).padStart(5, '0')}`;
  const stickerStorage = `${row.storageLocation} ${row.plantCode}`.trim();
  const stickerOrderNo = `${row.orderNo}-${String(row.orderSeq).padStart(6, '0')}`;
  const madeIn = getMadeIn(row.countryOfOrigin);

  const border = '1px solid #000';
  const cellBase: React.CSSProperties = {
    border, padding: '1px 4px', fontSize: '9px', verticalAlign: 'middle',
    lineHeight: '1.3', wordBreak: 'break-all', overflow: 'hidden',
  };
  const labelStyle: React.CSSProperties = { ...cellBase, fontWeight: 'normal', whiteSpace: 'nowrap', color: '#333', width: '22%' };
  const valueStyle: React.CSSProperties = { ...cellBase, fontWeight: 'normal' };

  return (
    <table style={{
      width: '100%', height: '100%', borderCollapse: 'collapse',
      tableLayout: 'fixed', border: '2px solid #000',
    }}>
      <colgroup>
        <col style={{ width: '22%' }} />
        <col style={{ width: '28%' }} />
        <col style={{ width: '22%' }} />
        <col style={{ width: '28%' }} />
      </colgroup>
      <tbody>
        {/* Row 1: 出貨單號 + 出貨日 */}
        <tr>
          <td style={labelStyle}>出貨單號</td>
          <td style={{ ...valueStyle, fontWeight: 'bold', fontSize: '9px' }}>{stickerShipNo}</td>
          <td style={labelStyle}>出貨日</td>
          <td style={valueStyle}>{row.deliveryDate}</td>
        </tr>

        {/* Row 2: 料號（粗體） */}
        <tr>
          <td style={labelStyle}>料號</td>
          <td style={{ ...valueStyle, fontWeight: 'bold', fontSize: '10px' }} colSpan={3}>{row.materialNo}</td>
        </tr>

        {/* Row 3: 品名規格描述（全寬） */}
        <tr>
          <td style={{ ...valueStyle, fontSize: '8.5px', color: '#222' }} colSpan={4}>
            {row.specification || row.productName || ''}
          </td>
        </tr>

        {/* Row 4: 客戶料號 | 淨重 */}
        <tr>
          <td style={labelStyle}>客戶料號</td>
          <td style={valueStyle}>{row.customerMaterialNo || ''}</td>
          <td style={labelStyle}>淨重</td>
          <td style={valueStyle}>{row.netWeight}{row.netWeight ? 'kg' : ''}</td>
        </tr>

        {/* Row 5: 客戶訂單號碼 | 毛重 */}
        <tr>
          <td style={labelStyle}>客戶訂單號碼</td>
          <td style={valueStyle}>{row.customerOrderNo || ''}</td>
          <td style={labelStyle}>毛重</td>
          <td style={valueStyle}>{row.grossWeight}{row.grossWeight ? 'kg' : ''}</td>
        </tr>

        {/* Row 6: 廠商料號 */}
        <tr>
          <td style={labelStyle}>廠商料號</td>
          <td style={valueStyle} colSpan={3}>{row.vendorMaterialNo || ''}</td>
        </tr>

        {/* Row 7: 廠商名稱 | 儲存地點 */}
        <tr>
          <td style={labelStyle}>廠商名稱</td>
          <td style={valueStyle}>{row.vendorName.replace(/\(.*\)/, '').trim()}</td>
          <td style={labelStyle}>儲存地點</td>
          <td style={valueStyle}>{stickerStorage}</td>
        </tr>

        {/* Row 8: 出貨目的地 */}
        <tr>
          <td style={labelStyle}>出貨目的地</td>
          <td style={{ ...valueStyle, fontSize: '8px' }} colSpan={3}>{row.deliveryAddress}</td>
        </tr>

        {/* Row 9: 訂單號碼 */}
        <tr>
          <td style={labelStyle}>訂單號碼</td>
          <td style={{ ...valueStyle, fontWeight: 'bold' }} colSpan={3}>{stickerOrderNo}</td>
        </tr>

        {/* Row 10-11: QR Code + 數量區 */}
        <tr>
          <td style={{ ...cellBase, padding: 0, textAlign: 'center', verticalAlign: 'top' }} rowSpan={2}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2px' }}>
              <QrCodeCanvas value={row.barcode || row.sapDeliveryNo} size={48} />
              <div style={{ fontSize: '7px', marginTop: '1px', wordBreak: 'break-all', lineHeight: '1.1' }}>{row.barcode}</div>
            </div>
          </td>
          <td style={{ ...labelStyle, textAlign: 'center', fontWeight: 'bold' }}>總數量</td>
          <td style={{ ...labelStyle, textAlign: 'center', fontWeight: 'bold' }}>總件數</td>
          <td style={{ ...labelStyle, textAlign: 'center', fontWeight: 'bold' }}>本件數量</td>
        </tr>
        <tr>
          <td style={{ ...valueStyle, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{row.shipQty}</td>
          <td style={{ ...valueStyle, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{row.labelSeqNo}/{row.totalBoxes}</td>
          <td style={{ ...valueStyle, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{row.boxQty}</td>
        </tr>

        {/* Row 12: Made in XX */}
        <tr>
          <td style={{ ...cellBase, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }} colSpan={4}>
            {madeIn}
          </td>
        </tr>
      </tbody>
    </table>
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
