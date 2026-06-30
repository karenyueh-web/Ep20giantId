/**
 * SampleOrderPrintPage — 索樣單列印頁面（內嵌全頁，非 Modal）
 *
 * 結構（比照 QuotationPrintPage）：
 *   ─ 工具列：← 返回  |  TAB：中文索樣單 / 英文索樣單  |  [print 按鈕]
 *   ─ 預覽區：白底 A4 橫向比例卡片（索樣單文件）
 *
 * ──────────────────────────────────────────────────
 * 中文版明細表格欄位（共 12 欄）：
 *   1. 索樣單號       orderNo
 *   2. 物料群組       ─（待查 SAP）
 *   3. 物料料號       material
 *   4. GMC工廠        plant
 *   5. 長規格敘述     longDescription
 *   6. 供應商料號     vendorMaterialNo
 *   7. 索樣日期       sampleDate          ← 中文獨有
 *   8. 需求日期       demandDate
 *   9. 需求數量       demandQty
 *  10. 首批可供貨日   availableDate
 *  11. 廠商日產能     vendorDailyCapacity
 *  12. 樣品達交日     vendorShipDate
 *
 * 英文版明細表格欄位（共 12 欄）：
 *   1. Sample Order No       orderNo
 *   2. Material Group        ─（待查 SAP）
 *   3. Part No               material
 *   4. Factory               plant
 *   5. Item Description      longDescription
 *   6. Vendor Part NO        vendorMaterialNo
 *   7. Brand                 ─（待擴充欄位）  ← 英文獨有
 *   8. Sample Required Date  demandDate
 *   9. Required QTY          demandQty
 *  10. First batch available date  availableDate
 *  11. Daily production Capacity   vendorDailyCapacity
 *  12. Sample Delivery date        vendorShipDate
 * ──────────────────────────────────────────────────
 */

import { useState, useMemo } from 'react';
import giantGroupLogo from '@/assets/giant-group-logo.png';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import type { SampleOrderRecord } from './sampleOrderData';

// ── Giant Group Logo ─────────────────────────────────────────────────────────
const GiantLogo = () => (
  <img
    src={giantGroupLogo}
    alt="Giant Group"
    style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
  />
);

// ── 公司固定資訊 ─────────────────────────────────────────────────────────────
const COMPANY_NAME  = '巨大機械工業股份有限公司';
const COMPANY_PHONE = 'TEL: +886-4-26814771';
const COMPANY_FAX   = 'FAX: +886-4-26821201';

// ── 中文固定備註條款（8 條）──────────────────────────────────────────────────
const FOOTER_NOTES_ZH = [
  'Giant EP已新增零件料號，請您開啟 Giant EP 平台維護。',
  '如未落實維護EP零件資訊頭檔欄位，後續將影響內部廠商評價結果。',
  '如無法如期完成送樣或無法滿足數量請即刻反應，未能準時送樣完成，後續將影響內部廠商評價結果。',
  '測試樣品不付款，測試樣品需求將依實際狀況更新。',
  'G(量產品)索樣，樣品需同量產品質(Golden Sample)，非開發樣。D(開發樣)索樣即開發樣品。',
  '送樣時請在外箱貼上此單，並指名" XXX "收。',
  '送樣地點-437台中市大甲區順帆路19號 巨大機械大甲廠 大樓總機收',
  '請於樣品寄出前務必回填EP零件資訊維護-單品毛淨重、材質，避免影響出貨流程。如產品未定案，請先以預估重量供參。如重量有任何異動，請務必Mail通知整合採購負責窗口。',
];

// ── 英文固定備註條款（8 條，依用戶提供文字）─────────────────────────────────
const FOOTER_NOTES_EN = [
  'Please maintain the new Giant Part No. on the Giant EP platform.',
  'Incomplete maintenance of the Giant EP Platform part information may affect your Supplier Performance Evaluation.',
  "If there's any questions or problems about the sample required date and quantity, please contact your POC immediately. Delays in sample delivery may affect your Supplier Performance Evaluation.",
  'Sample order No. starting with "G" indicate Golden Samples, which must match the mass production quality, not development sample.\nSample order No. starting with "D" indicate Development samples.',
  'Samples are intended for quality and compatibility testing, and should be provided free of charge.',
  'Please attach this notification to the sample package when sending the samples, and address it to the sample recipient.',
  'Sample delivery address: GTM (No. 19, Shunfan Rd., Dajia Dist., Taichung City 437, Taiwan)',
  'Please maintain Giant EP platform of part no. net and gross weight and material information before shipping samples, to avoid affecting the shipment process. If the specification is not yet confirmed, please provide estimated weight for reference. Please notify your Integrated Sourcing POC of any changes via email.',
];

// ── TAB 定義 ─────────────────────────────────────────────────────────────────
type SamplePrintTab = 'zh' | 'en';

const SAMPLE_PRINT_TABS: { id: SamplePrintTab; label: string }[] = [
  { id: 'zh', label: '中文索樣單' },
  { id: 'en', label: '英文索樣單' },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface SampleOrderPrintPageProps {
  orders: SampleOrderRecord[];
  onBack: () => void;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function SampleOrderPrintPage({ orders, onBack }: SampleOrderPrintPageProps) {
  const [activeTab, setActiveTab] = useState<SamplePrintTab>('zh');

  // 依廠商分組（保持選取順序）
  const vendorGroups = useMemo(() => {
    const map = new Map<string, SampleOrderRecord[]>();
    for (const order of orders) {
      const key = order.vendorCode;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(order);
    }
    return Array.from(map.values());
  }, [orders]);

  const vendorCount = vendorGroups.length;

  // ── 列印處理（A4 橫向）────────────────────────────────────────────────────
  const handlePrint = () => {
    const printArea = document.querySelector('.sample-order-print-area');
    if (!printArea) { window.print(); return; }

    const cloned = printArea.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('[data-no-print]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    const htmlContent = [
      '<!DOCTYPE html>',
      '<html lang="zh-TW">',
      '<head>',
      '  <meta charset="UTF-8" />',
      `  <title>${activeTab === 'zh' ? '索樣單' : 'Sample Request'}</title>`,
      '  <style>',
      '    @page { size: A4 landscape; margin: 8mm; }',
      '    *, *::before, *::after { box-sizing: border-box; }',
      '    html, body { margin: 0; padding: 0; background: white; font-family: "Noto Sans TC","微軟正黑體",Arial,sans-serif; }',
      '    table { border-collapse: collapse; width: 100%; table-layout: fixed; }',
      '    td, th { border: 1px solid #555; padding: 2px 4px; font-size: 10px; vertical-align: middle; word-break: break-word; }',
      '    [data-no-print] { display: none; }',
      '    .sample-doc-wrapper { border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; max-width: none !important; }',
      '  </style>',
      '</head>',
      '<body>' + cloned.innerHTML + '</body>',
      '</html>',
    ].join('\n');

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:1123px;height:794px;border:none;pointer-events:none;';
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

          {/* TAB 列（中文 / 英文） */}
          {SAMPLE_PRINT_TABS.map(tab => (
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

          {/* 單據數量 */}
          <span className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] ml-auto">
            {vendorCount > 1
              ? `共 ${orders.length} 筆 ／ ${vendorCount} 家廠商`
              : `共 ${orders.length} 筆`
            }
          </span>

          {/* 底線 */}
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
        </div>
      </div>

      {/* ── 預覽區 ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[32px] py-[28px] sample-order-print-area">
        {vendorGroups.map((groupOrders, idx) => (
          <div
            key={groupOrders[0]?.vendorCode ?? idx}
            style={{
              pageBreakAfter: idx < vendorGroups.length - 1 ? 'always' : 'auto',
              marginBottom: idx < vendorGroups.length - 1 ? '0' : '0',
            }}
          >
            {activeTab === 'zh'
              ? <ZhSampleOrderDoc orders={groupOrders} />
              : <EnSampleOrderDoc orders={groupOrders} />
            }
            {/* 預覽區分隔線（列印時不顯示） */}
            {idx < vendorGroups.length - 1 && (
              <div
                data-no-print
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '24px 0',
                  color: '#919eab',
                  fontSize: '12px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'rgba(145,158,171,0.24)' }} />
                <span>接下來是第 {idx + 2} 家廠商</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(145,158,171,0.24)' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 文件外框共用樣式 ─────────────────────────────────────────────────────────
const DOC_WRAPPER_STYLE: React.CSSProperties = {
  width: '100%',
  maxWidth: '960px',
  margin: '0 auto',
  background: 'white',
  padding: '20px 24px',
  fontSize: '11px',
  color: '#000',
  border: '1px solid rgba(145,158,171,0.2)',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  boxSizing: 'border-box',
};

const BORDER = '1px solid #555';

// ── 中文索樣單文件 ────────────────────────────────────────────────────────────
// 欄位：索樣單號 | 物料群組 | 物料料號 | GMC工廠 | 長規格敘述 | 供應商料號
//      | 索樣日期 | 需求日期 | 需求數量 | 首批可供貨日 | 廠商日產能 | 樣品達交日
function ZhSampleOrderDoc({ orders }: { orders: SampleOrderRecord[] }) {
  const firstOrder = orders[0];
  const userEmail   = localStorage.getItem('currentUserEmail') ?? '';
  const userName    = localStorage.getItem('currentUserName')  ?? userEmail;
  // 開單者姓名：優先取索樣單的 createdBy，無法取得才 fallback 登入者
  const creatorName = firstOrder?.createdBy || userName || userEmail;
  const printedAt  = new Date().toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(/\//g, '/');

  const td: React.CSSProperties = { border: BORDER, padding: '3px 5px', fontSize: '10px', verticalAlign: 'middle', wordBreak: 'break-word' };
  const th: React.CSSProperties = { ...td, fontWeight: 'bold', background: '#f0f0f0', textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.3' };
  const tdC: React.CSSProperties = { ...td, textAlign: 'center' };

  return (
    <div
      className="sample-doc-wrapper"
      style={{ ...DOC_WRAPPER_STYLE, fontFamily: "'Noto Sans TC','Noto Sans JP','微軟正黑體',sans-serif" }}
    >
      {/* ① 頁首 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <GiantLogo />
        <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7' }}>
          <div>列印日期：{printedAt}</div>
          <div>{COMPANY_PHONE}</div>
          <div>{COMPANY_FAX}</div>
        </div>
      </div>

      {/* ② To / 窗口 */}
      <div style={{ fontSize: '12px', lineHeight: '1.8', marginBottom: '6px' }}>
        {firstOrder && <div>To: {firstOrder.vendorName}({firstOrder.vendorCode})</div>}
        <div>窗口: {userEmail}</div>
      </div>

      {/* ③ 標題 */}
      <div style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', letterSpacing: '2px', margin: '8px 0 14px' }}>
        {COMPANY_NAME} 索樣單
      </div>

      {/* ④ 明細表格（中文版 11 欄） */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '9%' }}  /> {/* 索樣單號 */}
          <col style={{ width: '7%' }}  /> {/* 物料群組 */}
          <col style={{ width: '11%' }} /> {/* 物料料號 */}
          <col style={{ width: '5%' }}  /> {/* GMC工廠 */}
          <col style={{ width: '23%' }} /> {/* 長規格敘述 */}
          <col style={{ width: '10%' }} /> {/* 供應商料號 */}
          <col style={{ width: '8%' }}  /> {/* 需求日期 */}
          <col style={{ width: '6%' }}  /> {/* 需求數量 */}
          <col style={{ width: '8%' }}  /> {/* 首批可供貨日 */}
          <col style={{ width: '7%' }}  /> {/* 廠商日產能 */}
          <col style={{ width: '6%' }}  /> {/* 樣品達交日 */}
        </colgroup>
        <thead>
          <tr>
            <th style={th}>索樣單號</th>
            <th style={th}>物料群組</th>
            <th style={th}>物料料號</th>
            <th style={th}>GMC工廠</th>
            <th style={th}>長規格敘述</th>
            <th style={th}>供應商料號</th>
            <th style={th}>需求日期</th>
            <th style={th}>需求數量</th>
            <th style={th}>首批<br />可供貨日</th>
            <th style={th}>廠商<br />日產能</th>
            <th style={th}>樣品<br />達交日</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ ...td, textAlign: 'center', color: '#919eab' }}>尚無索樣單資料</td>
            </tr>
          ) : (
            orders.map((o, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : 'white' }}>
                <td style={{ ...td, fontWeight: 'bold', textAlign: 'center' }}>{o.orderNo}</td>
                <td style={td}></td>
                <td style={{ ...td, wordBreak: 'break-all', fontSize: '9px' }}>{o.material}</td>
                <td style={tdC}>{o.plant}</td>
                <td style={{ ...td, fontSize: '9px' }}>{o.longDescription}</td>
                <td style={{ ...td, wordBreak: 'break-all', fontSize: '9px' }}>{o.vendorMaterialNo ?? ''}</td>
                <td style={tdC}>{o.demandDate}</td>
                <td style={tdC}>{o.demandQty ?? ''}</td>
                <td style={tdC}>{o.availableDate ?? ''}</td>
                <td style={tdC}>{o.vendorDailyCapacity ?? ''}</td>
                <td style={tdC}>{o.vendorShipDate ?? ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ⑤ 備註條款 */}
      <div style={{ marginTop: '16px', fontSize: '10px', lineHeight: '1.75', color: '#222' }}>
        {FOOTER_NOTES_ZH.map((note, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>{`${i + 1}. ${note}`}</div>
        ))}
      </div>

      {/* ⑥ 樣品收件人 */}
      <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', letterSpacing: '1px' }}>
        樣品收件人：{creatorName}
      </div>
    </div>
  );
}

// ── 英文索樣單文件 ────────────────────────────────────────────────────────────
// 欄位：Sample Order No | Material Group | Part No | Factory | Item Description
//      | Vendor Part NO | Brand | Sample Required Date | Required QTY
//      | First batch available date | Daily production Capacity | Sample Delivery date
function EnSampleOrderDoc({ orders }: { orders: SampleOrderRecord[] }) {
  const firstOrder  = orders[0];
  const userEmail   = localStorage.getItem('currentUserEmail') ?? '';
  const userName    = localStorage.getItem('currentUserName')  ?? userEmail;
  // 開單者姓名：優先取索樣單的 createdBy，無法取得才 fallback 登入者
  const creatorName = firstOrder?.createdBy || userName || userEmail;
  const printedAt  = new Date().toLocaleString('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(',', '');

  const td: React.CSSProperties = { border: BORDER, padding: '3px 5px', fontSize: '10px', verticalAlign: 'middle', wordBreak: 'break-word' };
  // 英文表頭允許換行、字型縮小，避免撐破表格
  const th: React.CSSProperties = { ...td, fontWeight: 'bold', background: '#f0f0f0', textAlign: 'center', fontSize: '9px', whiteSpace: 'normal', lineHeight: '1.3' };
  const tdC: React.CSSProperties = { ...td, textAlign: 'center' };

  return (
    <div
      className="sample-doc-wrapper"
      style={{ ...DOC_WRAPPER_STYLE, fontFamily: "'Noto Sans TC','Noto Sans JP',Arial,sans-serif" }}
    >
      {/* ① Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <GiantLogo />
        <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7' }}>
          <div>Print Date: {printedAt}</div>
          <div>{COMPANY_PHONE}</div>
          <div>{COMPANY_FAX}</div>
        </div>
      </div>

      {/* ② To / Contact Window */}
      <div style={{ fontSize: '12px', lineHeight: '1.8', marginBottom: '6px' }}>
        {firstOrder && <div>To: {firstOrder.vendorName}({firstOrder.vendorCode})</div>}
        <div>Contact Window: {userEmail}</div>
      </div>

      {/* ③ Title */}
      <div style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', letterSpacing: '1px', margin: '8px 0 14px' }}>
        GIANT Sample Order Notification
      </div>

      {/* ④ Detail Table（英文版 11 欄） */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '9%' }}  /> {/* Sample Order No */}
          <col style={{ width: '7%' }}  /> {/* Material Group */}
          <col style={{ width: '11%' }} /> {/* Part No */}
          <col style={{ width: '5%' }}  /> {/* Factory */}
          <col style={{ width: '22%' }} /> {/* Item Description */}
          <col style={{ width: '10%' }} /> {/* Vendor Part NO */}
          <col style={{ width: '9%' }}  /> {/* Sample Required Date */}
          <col style={{ width: '6%' }}  /> {/* Required QTY */}
          <col style={{ width: '8%' }}  /> {/* First batch available date */}
          <col style={{ width: '7%' }}  /> {/* Daily production Capacity */}
          <col style={{ width: '6%' }}  /> {/* Sample Delivery date */}
        </colgroup>
        <thead>
          <tr>
            <th style={th}>Sample<br />Order No</th>
            <th style={th}>Material<br />Group</th>
            <th style={th}>Part No</th>
            <th style={th}>Factory</th>
            <th style={th}>Item Description</th>
            <th style={th}>Vendor<br />Part NO</th>
            <th style={th}>Sample<br />Required Date</th>
            <th style={th}>Required<br />QTY</th>
            <th style={th}>First batch<br />available date</th>
            <th style={th}>Daily production<br />Capacity</th>
            <th style={th}>Sample<br />Delivery date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ ...td, textAlign: 'center', color: '#919eab' }}>No data available</td>
            </tr>
          ) : (
            orders.map((o, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : 'white' }}>
                {/* 1. Sample Order No */}
                <td style={{ ...td, fontWeight: 'bold', textAlign: 'center' }}>{o.orderNo}</td>
                {/* 2. Material Group（待查 SAP） */}
                <td style={td}></td>
                {/* 3. Part No */}
                <td style={{ ...td, wordBreak: 'break-all', fontSize: '9px' }}>{o.material}</td>
                {/* 4. Factory */}
                <td style={tdC}>{o.plant}</td>
                {/* 5. Item Description */}
                <td style={{ ...td, fontSize: '9px' }}>{o.longDescription}</td>
                {/* 6. Vendor Part NO */}
                <td style={{ ...td, wordBreak: 'break-all', fontSize: '9px' }}>{o.vendorMaterialNo ?? ''}</td>
                {/* 7. Sample Required Date */}
                <td style={tdC}>{o.demandDate}</td>
                {/* 8. Required QTY */}
                <td style={tdC}>{o.demandQty ?? ''}</td>
                {/* 9. First batch available date */}
                <td style={tdC}>{o.availableDate ?? ''}</td>
                {/* 10. Daily production Capacity */}
                <td style={tdC}>{o.vendorDailyCapacity ?? ''}</td>
                {/* 11. Sample Delivery date */}
                <td style={tdC}>{o.vendorShipDate ?? ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ⑤ Footer Notes */}
      <div style={{ marginTop: '16px', fontSize: '10px', lineHeight: '1.75', color: '#222' }}>
        {FOOTER_NOTES_EN.map((note, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>
            {`${i + 1}. `}
            {note.split('\n').map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {j > 0 ? <span style={{ paddingLeft: '16px' }}>{line}</span> : line}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ⑥ Sample Recipient */}
      <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', letterSpacing: '1px' }}>
        Sample Recipient: {creatorName}
      </div>
    </div>
  );
}
