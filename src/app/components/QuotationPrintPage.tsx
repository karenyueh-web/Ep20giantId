/**
 * QuotationPrintPage — 報價單列印頁面（內嵌全頁，非 Modal）
 *
 * 結構（比照 ShipmentPrintPage）：
 *   ─ 工具列：← 返回  |  TAB：中文報價單 / 英文報價單  |  [print 按鈕]
 *   ─ 預覽區：白底 A4 比例卡片
 *     · 中文報價單：實作完整文件
 *     · 英文報價單：佔位（內容待補）
 */

import { useState } from 'react';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { PartRecord, BrandSetting } from '@/app/components/partsMaintenanceData';
import { MOCK_VENDORS } from '@/app/components/VendorManagementTable';
import giantGroupLogo from '@/assets/giant-group-logo.png';

// ── Giant Group Logo（使用真實圖片）─────────────────────────────────────────
const GiantLogo = () => (
  <img
    src={giantGroupLogo}
    alt="Giant Group"
    style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
  />
);

// ── 公司固定資訊（Hard code）────────────────────────────────────────────────
const COMPANY_NAME   = '巨大機械工業股份有限公司';
const COMPANY_PHONE  = 'TEL: +886-4-26814771';
const COMPANY_FAX    = 'FAX: +886-4-26821231';

// ── F3 固定備註條款（中文）────────────────────────────────────────────────────
const FOOTER_NOTES_ZH = [
  'Giant EP已新增零件料號，請您開啟 Giant EP 平台維護。',
  '請收到此單後兩個日曆天內報價完成，未能準時報價完成，請依照敝司系統單價請款。如單價維護後有任何異動，請務必Mail通知整合採購負責窗口。',
  '如屬客製品，適用以下條款：\n客製品係由客戶自行與您談妥規格、價格、預估交期、預估數量等交易條件，巨大僅代理採購。\n客戶取消或延後與巨大間訂單時，巨大得延後或取消相應客製品訂單及其款項支付。客戶無法、拒絕或延後支付貨款時，巨大得延後或取消客製品訂單及其款項支付，當客戶無法支付貨款時，巨大倉庫之產品得退回原廠商並全額退款。',
  '完成報價回填後，請將此通知單以Mail或掃描傳真予整合採購負責窗口。',
  '如未落實維護EP零件資訊頭檔欄位，後續將影響內部廠商評價結果。',
];

// ── F3 固定備註條款（英文）────────────────────────────────────────────────────
const FOOTER_NOTES_EN = [
  'The Giant Part Number has been added to the Giant EP system. Please log in to the Giant EP platform to complete the necessary maintenance.',
  'Please submit your quotation within two (2) calendar days of receiving this notification. Should you be unable to meet this deadline, payment will be processed based on the unit price recorded in our system. In the event of any subsequent changes to the unit price, please notify the designated Integrated Sourcing contact via email without delay.',
  'For Customized Products, the following terms and conditions shall apply:\nThe transaction terms for Customized Products — including specifications, pricing, estimated lead time, and estimated quantity — are negotiated directly between the customer and the supplier. Giant acts solely as a purchasing intermediary.\nIn the event that a customer cancels or postpones an order placed with Giant, Giant reserves the right to defer or cancel the corresponding Customized Product order(s) and associated payments. If the customer is unable to pay, refuses to pay, or delays payment for the goods, Giant likewise reserves the right to defer or cancel the Customized Product order(s) and associated payments. Should the customer ultimately be unable to fulfill payment obligations, products held in Giant\'s warehouse may be returned to the original supplier with a full refund.',
  'Upon completion of the quotation, please forward this notification to the designated Integrated Sourcing contact via email or scanned fax.',
  'Failure to diligently maintain the required EP part information header fields may adversely affect your performance evaluation results within our internal vendor assessment system.',
];

// ── TAB 定義 ─────────────────────────────────────────────────────────────────
type QuotePrintTab = 'zh' | 'en';

const QUOTE_PRINT_TABS: { id: QuotePrintTab; label: string }[] = [
  { id: 'zh', label: '中文報價單' },
  { id: 'en', label: '英文報價單' },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface QuotationPrintPageProps {
  /** 單筆模式（從明細頁進入）*/
  part?: PartRecord;
  /** 多筆模式（從列印報價單列表進入）*/
  parts?: PartRecord[];
  /** 要列印的品牌 ID 集合（多筆模式才用）*/
  selectedBrandIds?: Set<number>;
  onBack: () => void;
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export default function QuotationPrintPage({ part, parts, selectedBrandIds, onBack }: QuotationPrintPageProps) {
  // 統一成「多筆 parts」，單筆模式就包成陣列
  const effectiveParts: PartRecord[] = parts ?? (part ? [part] : []);
  // 若無 selectedBrandIds 限制（單筆模式），代表顯示該物料全部品牌設定
  const effectiveBrandIds = selectedBrandIds ?? null;
  const [activeTab, setActiveTab] = useState<QuotePrintTab>('zh');

  // ── 列印處理（比照 ShipmentPrintPage）──────────────────────────────────────
  const handlePrint = () => {
    const printArea = document.querySelector('.quotation-print-area');
    if (!printArea) { window.print(); return; }

    const cloned = printArea.cloneNode(true) as HTMLElement;

    // ① 移除不列印的元素（預覽分頁線等）
    cloned.querySelectorAll('[data-no-print]').forEach(el => el.remove());

    // ② 清掉螢幕視覺樣式
    cloned.querySelectorAll('.quotation-page-block').forEach(el => {
      const e = el as HTMLElement;
      e.style.boxShadow   = 'none';
      e.style.overflow    = 'visible';
      e.style.height      = 'auto';
      e.style.minHeight   = '0';
      e.style.width       = '100%';
      e.style.margin      = '0';
      e.style.padding     = '10mm 12mm';
      e.style.boxSizing   = 'border-box';
      e.style.display     = 'block';
    });

    // ③ 在外層 wrapper div 設 page-break（避免 :last-child 問題）
    const wrappers = cloned.querySelectorAll('.shipment-doc-wrapper > div');
    wrappers.forEach((el, idx) => {
      const e = el as HTMLElement;
      e.style.pageBreakAfter = idx < wrappers.length - 1 ? 'always' : 'auto';
    });

    // ③ 清掉 wrapper 的 flex 置中
    cloned.querySelectorAll('.shipment-doc-wrapper').forEach(el => {
      const e = el as HTMLElement;
      e.style.display       = 'block';
      e.style.width         = '100%';
      e.style.alignItems    = '';
      e.style.flexDirection = '';
    });

    const htmlContent = [
      '<!DOCTYPE html>',
      '<html lang="zh-TW">',
      '<head>',
      '  <meta charset="UTF-8" />',
      '  <title>報價單</title>',
      '  <style>',
      '    @page { size: A4 portrait; margin: 0; }',
      '    *, *::before, *::after { box-sizing: border-box; }',
      '    html, body { margin: 0; padding: 0; background: white; font-family: "Noto Sans TC","微軟正黑體",sans-serif; }',
      '    table { border-collapse: collapse; width: 100%; }',
      '    td, th { border: 1px solid #555; padding: 2px 4px; font-size: 11px; vertical-align: middle; word-break: break-all; }',
      '    .shipment-doc-wrapper { border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; max-width: none !important; width: 100% !important; display: block !important; }',
      '  </style>',
      '</head>',
      '<body>' + cloned.innerHTML + '</body>',
      '</html>',
    ].join('\n');

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:none;pointer-events:none;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    }, 400);
  };

  return (
    <div className="print-wrapper bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 工具列 ───────────────────────────────────────────────────────── */}
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

          {/* TAB 列 */}
          {QUOTE_PRINT_TABS.map(tab => (
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

          {/* 底線 */}
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
        </div>
      </div>

      {/* ── 預覽區：灰底可捲動，多頁 A4 白卡垂直排列 ────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#dde1e7] quotation-print-area"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', gap: '0' }}
      >
        {activeTab === 'zh'
          ? <ZhQuotationDoc parts={effectiveParts} selectedBrandIds={effectiveBrandIds} />
          : <EnQuotationDoc parts={effectiveParts} selectedBrandIds={effectiveBrandIds} />
        }
      </div>
    </div>
  );
}

// ── 中文報價單文件 ────────────────────────────────────────────────────────────
function ZhQuotationDoc({ parts, selectedBrandIds }: { parts: PartRecord[]; selectedBrandIds: Set<number> | null }) {
  const firstPart = parts[0];
  const vendorFull = firstPart
    ? (MOCK_VENDORS.find(v => v.code === firstPart.vendorCode)?.fullName ??
       MOCK_VENDORS.find(v => v.name === firstPart.vendorName)?.fullName ??
       firstPart.vendorName)
    : '';
  const userEmail  = localStorage.getItem('currentUserEmail') ?? '';
  const printedAt  = new Date().toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(/\//g, '/');

  type QuoteLine = BrandSetting & { _part: PartRecord };
  const lines: QuoteLine[] = parts.flatMap((p) =>
    p.brandSettings
      .filter((bs) => selectedBrandIds === null || selectedBrandIds.has(bs.id))
      .map((bs) => ({ ...bs, _part: p }))
  );

  const ROWS_FIRST_PAGE = 12;  // 第一頁有表頭+公司資訊，可用空間較少
  const ROWS_OTHER_PAGE = 18;  // 後續頁無表頭但有 thead，可放更多列
  const FOOTER_ROWS = 8;       // 頁尾（生效日+備註條款）約佔 8 行空間
  const pages: QuoteLine[][] = [];
  let cursor = 0;
  while (cursor < lines.length) {
    const limit = pages.length === 0 ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGE;
    pages.push(lines.slice(cursor, cursor + limit));
    cursor += limit;
  }
  if (pages.length === 0) pages.push([]);

  // 判斷頁尾能否合併到最後一頁
  const lastPageLimit = pages.length === 1 ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGE;
  const lastPageRows = pages[pages.length - 1].length;
  const footerFitsOnLastPage = lastPageRows <= lastPageLimit - FOOTER_ROWS;
  const totalPages = footerFitsOnLastPage ? pages.length : pages.length + 1;

  const border = '1px solid #555';
  const td: React.CSSProperties = { border, padding: '3px 5px', fontSize: '11px', verticalAlign: 'middle', wordBreak: 'break-all' };
  const th: React.CSSProperties = { ...td, fontWeight: 'bold', background: '#f0f0f0', textAlign: 'center', wordBreak: 'break-all', whiteSpace: 'normal', lineHeight: '1.3' };

  // -- 頁尾內容（生效日 + 備註條款）--
  const FooterContent = () => (
    <>
      <div style={{ marginTop: '16px', fontSize: '12px', lineHeight: '1.8' }}>
        <div>生效日（西元年/月/日）：</div>
        <div style={{ marginTop: '4px' }}>廠商簽章：</div>
      </div>
      <div style={{ marginTop: '16px', fontSize: '10.5px', lineHeight: '1.7', color: '#222' }}>
        {FOOTER_NOTES_ZH.map((note, ni) => (
          <div key={ni} style={{ marginBottom: '4px' }}>
            {`${ni + 1}. `}
            {note.split('\n').map((line, j) => (
              <span key={j}>{j > 0 && <br />}{j > 0 ? <span style={{ paddingLeft: '16px' }}>{line}</span> : line}</span>
            ))}
          </div>
        ))}
      </div>
    </>
  );

  // -- Common table head (repeated each page) ----------------------------
  const TableHead = () => (
    <thead>
      <tr>
        <th style={th}>物料群組</th>
        <th style={th}>物料料號</th>
        <th style={th}>GMC工廠</th>
        <th style={th}>長規格敍述</th>
        <th style={th}>供應商料號</th>
        <th style={th}>報價單位</th>
        <th style={th}>採購單價</th>
        <th style={th}>幣別</th>
        <th style={th}>客戶品牌</th>
        <th style={th}>標準品/<br/>客製品</th>
        <th style={th}>Lead<br/>Time</th>
        <th style={th}>國貿條件</th>
      </tr>
    </thead>
  );


  return (
    <div className="shipment-doc-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Noto Sans TC','Noto Sans JP',sans-serif", fontSize: '12px', color: '#000', boxSizing: 'border-box' }}>
      {pages.map((pageLines, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        return (
          <div key={pageIndex}>
            <div className="quotation-page-block" style={{ width: '794px', minHeight: '1123px', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '32px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {pageIndex === 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <GiantLogo />
                    <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7' }}>
                      <div>列印日期：{printedAt}</div>
                      <div>{COMPANY_PHONE}</div>
                      <div>{COMPANY_FAX}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.8', marginBottom: '6px' }}>
                    <div>To: {vendorFull}({firstPart?.vendorCode ?? ''})</div>
                    <div>窗口: {userEmail}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px', margin: '8px 0 12px' }}>
                    {COMPANY_NAME} 報價單
                  </div>
                </>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '6%' }} /><col style={{ width: '11%' }} /><col style={{ width: '5%' }} />
                  <col style={{ width: '20%' }} /><col style={{ width: '10%' }} /><col style={{ width: '5%' }} />
                  <col style={{ width: '6%' }} /><col style={{ width: '5%' }} /><col style={{ width: '7%' }} />
                  <col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '10%' }} />
                </colgroup>
                <TableHead />
                <tbody>
                  {pageLines.length === 0 ? (
                    <tr><td colSpan={12} style={{ ...td, textAlign: 'center', color: '#919eab' }}>尚無品牌設定資料</td></tr>
                  ) : pageLines.map((b, i) => (
                    <tr key={i}>
                      <td style={td}></td>
                      <td style={td}>{b._part.material}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b._part.plant}</td>
                      <td style={td}>{b._part.longDescription}</td>
                      <td style={td}>{b._part.vendorPartNo}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.quoteUnit}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{b.unitPrice ? Number(b.unitPrice).toLocaleString() : ''}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.currency}</td>
                      <td style={td}>{b.brand}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.productType}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.leadTime}</td>
                      <td style={td}>{b.tradeTerms}{b.tradeTermsPlace ? ` (${b.tradeTermsPlace})` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 如果是最後一頁且空間夠，頁尾直接接在表格後 */}
              {isLastPage && footerFitsOnLastPage && <FooterContent />}
              <div data-no-print="true" style={{ marginTop: 'auto', paddingTop: '8px', textAlign: 'right', fontSize: '11px', color: '#888' }}>
                {pageIndex + 1} / {totalPages}
              </div>
            </div>
            <div data-no-print="true" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0', color: '#aaa', fontSize: '13px' }}>
              <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #bbb 0, #bbb 6px, transparent 6px, transparent 12px)' }} />
              <span style={{ padding: '2px 14px', color: '#777', fontSize: '13px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                第 {pageIndex + 1} 頁 / 共 {totalPages} 頁
              </span>
              <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #bbb 0, #bbb 6px, transparent 6px, transparent 12px)' }} />
            </div>
          </div>
        );
      })}
      {/* 頁尾獨立一頁（僅在最後一頁塞不下時才顯示）*/}
      {!footerFitsOnLastPage && (
        <div>
          <div className="quotation-page-block" style={{ width: '794px', minHeight: '1123px', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '32px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FooterContent />
            <div data-no-print="true" style={{ marginTop: 'auto', paddingTop: '8px', textAlign: 'right', fontSize: '11px', color: '#888' }}>
              {totalPages} / {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// ── 英文報價單文件 ────────────────────────────────────────────────────────────
function EnQuotationDoc({ parts, selectedBrandIds }: { parts: PartRecord[]; selectedBrandIds: Set<number> | null }) {
  const firstPart = parts[0];
  const vendorFull = firstPart
    ? (MOCK_VENDORS.find(v => v.code === firstPart.vendorCode)?.fullName ??
       MOCK_VENDORS.find(v => v.name === firstPart.vendorName)?.fullName ??
       firstPart.vendorName)
    : '';
  const userEmail = localStorage.getItem('currentUserEmail') ?? '';
  const printedAt = new Date().toLocaleString('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(',', '');

  type QuoteLine = BrandSetting & { _part: PartRecord };
  const lines: QuoteLine[] = parts.flatMap((p) =>
    p.brandSettings
      .filter((bs) => selectedBrandIds === null || selectedBrandIds.has(bs.id))
      .map((bs) => ({ ...bs, _part: p }))
  );

  const ROWS_FIRST_PAGE = 12;
  const ROWS_OTHER_PAGE = 18;
  const FOOTER_ROWS = 8;
  const pages: QuoteLine[][] = [];
  let cursor = 0;
  while (cursor < lines.length) {
    const limit = pages.length === 0 ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGE;
    pages.push(lines.slice(cursor, cursor + limit));
    cursor += limit;
  }
  if (pages.length === 0) pages.push([]);

  // 判斷頁尾能否合併到最後一頁
  const lastPageLimit = pages.length === 1 ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGE;
  const lastPageRows = pages[pages.length - 1].length;
  const footerFitsOnLastPage = lastPageRows <= lastPageLimit - FOOTER_ROWS;
  const totalPages = footerFitsOnLastPage ? pages.length : pages.length + 1;

  // ── 樣式常數 ──────────────────────────────────────────────────────────────
  const border = '1px solid #555';
  const td: React.CSSProperties = { border, padding: '3px 5px', fontSize: '10.5px', verticalAlign: 'middle' };
  // 英文版表頭允許換行、字型縮小，避免撐破表格
  const th: React.CSSProperties = {
    ...td,
    fontWeight: 'bold',
    background: '#f0f0f0',
    textAlign: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    lineHeight: '1.3',
    fontSize: '10px',
  };

  // -- 頁尾內容 --
  const FooterContent = () => (
    <>
      <div style={{ marginTop: '16px', fontSize: '12px', lineHeight: '1.8' }}>
        <div>Effective Date (Day/Month/Year):</div>
        <div style={{ marginTop: '4px' }}>Signature:</div>
      </div>
      <div style={{ marginTop: '16px', fontSize: '10.5px', lineHeight: '1.7', color: '#222' }}>
        {FOOTER_NOTES_EN.map((note, ni) => (
          <div key={ni} style={{ marginBottom: '4px' }}>
            {`${ni + 1}. `}
            {note.split('\n').map((line, j) => (
              <span key={j}>{j > 0 && <br />}{j > 0 ? <span style={{ paddingLeft: '16px' }}>{line}</span> : line}</span>
            ))}
          </div>
        ))}
      </div>
    </>
  );

  const EnTableHead = () => (
    <thead>
      <tr>
        <th style={th}>Material Group</th>
        <th style={th}>Giant Part NO</th>
        <th style={th}>Factory</th>
        <th style={th}>Item Description</th>
        <th style={th}>Vendor Part NO</th>
        <th style={th}>Quotation Unit</th>
        <th style={th}>Unit Price</th>
        <th style={th}>Currency</th>
        <th style={th}>Brand</th>
        <th style={th}>STD / CUS</th>
        <th style={th}>Lead Time</th>
        <th style={th}>Incoterms</th>
      </tr>
    </thead>
  );


  return (
    <div className="shipment-doc-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Noto Sans TC','Noto Sans JP',Arial,sans-serif", fontSize: '12px', color: '#000', boxSizing: 'border-box' }}>
      {pages.map((pageLines, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        return (
          <div key={pageIndex}>
            <div className="quotation-page-block" style={{ width: '794px', minHeight: '1123px', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '32px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {pageIndex === 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <GiantLogo />
                    <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7' }}>
                      <div>Print Date: {printedAt}</div>
                      <div>{COMPANY_PHONE}</div>
                      <div>{COMPANY_FAX}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.8', marginBottom: '6px' }}>
                    <div>To: {vendorFull}({firstPart?.vendorCode ?? ''})</div>
                    <div>Contact Window: {userEmail}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', margin: '8px 0 12px' }}>
                    GIANT Quotation Notification
                  </div>
                </>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '7%' }} /><col style={{ width: '11%' }} /><col style={{ width: '5%' }} />
                  <col style={{ width: '18%' }} /><col style={{ width: '10%' }} /><col style={{ width: '6%' }} />
                  <col style={{ width: '7%' }} /><col style={{ width: '6%' }} /><col style={{ width: '7%' }} />
                  <col style={{ width: '7%' }} /><col style={{ width: '7%' }} /><col style={{ width: '9%' }} />
                </colgroup>
                <EnTableHead />
                <tbody>
                  {pageLines.length === 0 ? (
                    <tr><td colSpan={12} style={{ ...td, textAlign: 'center', color: '#919eab' }}>No brand setting data available</td></tr>
                  ) : pageLines.map((b, i) => (
                    <tr key={i}>
                      <td style={{ ...td, wordBreak: 'break-all' }}></td>
                      <td style={{ ...td, wordBreak: 'break-all' }}>{b._part.material}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b._part.plant}</td>
                      <td style={{ ...td, wordBreak: 'break-word' }}>{b._part.longDescription}</td>
                      <td style={{ ...td, wordBreak: 'break-all' }}>{b._part.vendorPartNo}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.quoteUnit}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{b.unitPrice ? Number(b.unitPrice).toLocaleString() : ''}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.currency}</td>
                      <td style={{ ...td, wordBreak: 'break-word' }}>{b.brand}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.productType}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{b.leadTime}</td>
                      <td style={{ ...td, wordBreak: 'break-word' }}>{b.tradeTerms}{b.tradeTermsPlace ? ` (${b.tradeTermsPlace})` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 如果是最後一頁且空間夠，頁尾直接接在表格後 */}
              {isLastPage && footerFitsOnLastPage && <FooterContent />}
              <div data-no-print="true" style={{ marginTop: 'auto', paddingTop: '8px', textAlign: 'right', fontSize: '11px', color: '#888' }}>
                {pageIndex + 1} / {totalPages}
              </div>
            </div>
            <div data-no-print="true" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0', color: '#aaa', fontSize: '13px' }}>
              <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #bbb 0, #bbb 6px, transparent 6px, transparent 12px)' }} />
              <span style={{ padding: '2px 14px', color: '#777', fontSize: '13px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                Page {pageIndex + 1} of {totalPages}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #bbb 0, #bbb 6px, transparent 6px, transparent 12px)' }} />
            </div>
          </div>
        );
      })}
      {/* 頁尾獨立一頁（僅在最後一頁塞不下時才顯示）*/}
      {!footerFitsOnLastPage && (
        <div>
          <div className="quotation-page-block" style={{ width: '794px', minHeight: '1123px', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: '32px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FooterContent />
            <div data-no-print="true" style={{ marginTop: 'auto', paddingTop: '8px', textAlign: 'right', fontSize: '11px', color: '#888' }}>
              {totalPages} / {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


