/**
 * QualityAbnormalPrintPage — 品質異常單列印頁面
 * 文件格式：GTM 協力廠商商品品質異常對策表(EP)
 */

import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import giantGroupLogo from '@/assets/giant-group-logo.png';
import type { QualityRow } from './AdvancedQualityTable';

const GiantLogo = () => (
  <img src={giantGroupLogo} alt="Giant Group" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
);

interface QualityAbnormalPrintPageProps {
  row: QualityRow;
  onBack: () => void;
}

export default function QualityAbnormalPrintPage({ row, onBack }: QualityAbnormalPrintPageProps) {
  const handlePrint = () => {
    const printArea = document.querySelector('.quality-print-area');
    if (!printArea) { window.print(); return; }

    const cloned = printArea.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('[data-no-print]').forEach(el => el.remove());

    const htmlContent = [
      '<!DOCTYPE html>',
      '<html lang="zh-TW">',
      '<head>',
      '  <meta charset="UTF-8" />',
      '  <title>GTM 協力廠商商品品質異常對策表</title>',
      '  <style>',
      '    @page { size: A4 portrait; margin: 8mm 10mm; }',
      '    *, *::before, *::after { box-sizing: border-box; box-shadow: none !important; }',
      '    html, body { margin: 0; padding: 0; background: white; font-family: "Noto Sans TC","微軟正黑體",sans-serif; }',
      '    table { border-collapse: collapse; width: 100%; }',
      '    td { border: 1px solid #333; padding: 2px 4px; font-size: 12px; vertical-align: middle; word-break: break-all; }',
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
    doc.open(); doc.write(htmlContent); doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    }, 400);
  };

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">
      {/* 工具列 */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.08)]" data-no-print>
        <div className="flex items-center h-[48px] px-[20px] gap-[16px]">
          <div onClick={onBack} className="shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity">
            <IconsSolidIcSolarMultipleForwardLeftBroken />
          </div>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] flex-1">
            GTM 協力廠商商品品質異常對策表(EP)
          </p>
          <button
            onClick={handlePrint}
            className="flex items-center gap-[7px] h-[32px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            print
          </button>
        </div>
      </div>

      {/* 預覽區 */}
      <div
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#dde1e7] quality-print-area"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px' }}
      >
        <QualityAbnormalDoc row={row} />
      </div>
    </div>
  );
}

// ── 文件主體 ─────────────────────────────────────────────────────────────────
function QualityAbnormalDoc({ row }: { row: QualityRow }) {
  // 底部日期：取最後一筆 giant_reply，否則用列印當下時間
  const bottomDate = (() => {
    const last = [...(row.replyHistory ?? [])].reverse().find(e => e.type === 'giant_reply');
    if (last) return last.timestamp;
    return new Date().toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  })();

  // ── 樣式常數 ──────────────────────────────────────────────────────────────
  const B = '1px solid #333';

  /** 一般資料格 */
  const td: React.CSSProperties = {
    border: B, padding: '3px 5px', fontSize: '12px',
    verticalAlign: 'middle', wordBreak: 'break-all',
  };

  /** 標籤格（灰底粗體置中） */
  const th: React.CSSProperties = {
    ...td, background: '#f0f0f0', fontWeight: 'bold',
    textAlign: 'center', whiteSpace: 'nowrap',
  };

  /** 大型內容格（靠上） */
  const content: React.CSSProperties = {
    ...td, verticalAlign: 'top', padding: '5px 6px',
  };

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        background: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        padding: '16px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans TC','微軟正黑體',sans-serif",
        fontSize: '12px',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 標題區 ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', position: 'relative' }}>
        <GiantLogo />
        <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
            GTM 協力廠商商品品質異常對策表(EP)
          </span>
        </div>
      </div>

      {/* 協調者 / QM單號 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
        <span>協調者：{row.coordinator || '—'}</span>
        {/* TODO: 協調者未來從中台開單人員資料串接 */}
        <span>QM品質異常通知單號：{row.abnormalNumber}</span>
      </div>

      {/* ── 主體：主表 + 右側豎向流程文字 ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>

        {/* ── 主表 ── */}
        <table style={{ flex: 1, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {/*
            欄寬分配（共 9 欄，總寬約 726px = 794-20(padding)*2-22(右側流程欄)）：
            Col0  保存期限  18px
            Col1  廠商/零件 label  56px
            Col2  廠商代號 / 零件編號 value  130px
            Col3  日期/規格 label  30px
            Col4  日期/規格 value  140px
            Col5  訂單號碼 label  50px
            Col6  訂單號碼 value  110px
            Col7  數量 label  28px
            Col8  數量 value  auto
          */}
          <colgroup>
            <col style={{ width: '18px' }} />
            <col style={{ width: '56px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '38px' }} />
            <col style={{ width: '140px' }} />
            <col style={{ width: '62px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '36px' }} />
            <col />
          </colgroup>
          <tbody>

            {/* ── Row 1: 廠商 ── */}
            <tr style={{ height: '40px' }}>
              <td colSpan={2} style={th}>廠商</td>
              <td style={td}>{row.vendor}</td>
              <td style={th}>日期</td>
              <td style={td}>{row.date}</td>
              <td style={th}>訂單號碼</td>
              <td style={td}>{row.orderNumber}</td>
              <td style={th}>數量</td>
              <td style={td}>{row.quantity}</td>
            </tr>

            {/* ── Row 2: 零件編號 ── */}
            <tr style={{ height: '40px' }}>
              <td colSpan={2} style={th}>零件編號</td>
              <td colSpan={3} style={td}>{row.partNumber}</td>
              <td style={th}>規格敍述</td>
              <td colSpan={3} style={td}>{row.description}</td>
            </tr>

            {/* ── Row 3: 不良情形 ── */}
            <tr>
              <td colSpan={2} style={th}>不良情形</td>
              <td colSpan={7} style={{ ...content, height: '125px' }}>
                {row.defectType}
              </td>
            </tr>

            {/* ── Row 4: 應急處理 ── */}
            <tr>
              <td colSpan={2} style={th}>應急處理</td>
              <td colSpan={7} style={{ ...content, height: '125px' }}>
                {row.emergencyAction}
              </td>
            </tr>

            {/* ── Row 5: 原因分析 ── */}
            <tr>
              <td colSpan={2} style={th}>原因分析</td>
              <td colSpan={7} style={{ ...content, height: '196px' }}>
                {row.causeAnalysis}
              </td>
            </tr>

            {/* ── Row 6: 對策提出 ── */}
            <tr>
              <td colSpan={2} style={th}>對策提出</td>
              <td colSpan={7} style={{ ...content, height: '196px' }}>
                {row.countermeasure}
              </td>
            </tr>

            {/* ── Row 7: GTM確認（上：回覆內容 80%，下：日期確認者 20%）── */}
            <tr>
              <td colSpan={2} rowSpan={2} style={{ ...th, verticalAlign: 'middle' }}>GTM確認</td>
              <td colSpan={7} style={{ ...content, height: '176px' }}>
                {row.gtmConfirm}
              </td>
            </tr>
            <tr>
              <td colSpan={7} style={{ ...td, height: '20px', fontSize: '12px', color: '#000', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>日期：{bottomDate}</span>
                  <span style={{ color: '#000' }}>確認者：{row.confirmer || '—'}</span>
                </div>
              </td>
            </tr>

          </tbody>
        </table>

        {/* ── 右側豎向文字：保存期限 ── */}
        <div
          style={{
            border: B,
            borderLeft: 'none',
            width: '44px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            padding: '4px 2px',
          }}
        >
          保存期限：二年
        </div>

        {/* ── 右側豎向文字：流程 ── */}
        <div
          style={{
            border: B,
            borderLeft: 'none',
            width: '44px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            padding: '4px 2px',
          }}
        >
          流程：填表人↓廠商↓確認↓品保存檔
        </div>
      </div>

      {/* ── 頁尾 ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
        <tbody>
          {/* 品質編號 / 公司名 */}
          <tr>
            <td colSpan={4} style={{ ...td, fontSize: '12px', border: 'none', padding: '2px 0' }}>
              品質:219A-03
            </td>
            <td colSpan={4} style={{ ...td, fontSize: '12px', textAlign: 'right', border: 'none', padding: '2px 0' }}>
              巨大機械工業股份有限公司
            </td>
          </tr>
          {/* 主管 / 審核 / 填表（標籤+括號合一格）*/}
          <tr>
            <td style={{ ...th, width: '12%', verticalAlign: 'top', lineHeight: '1.6' }}>主管<br />(GTM)</td>
            <td style={{ ...td, width: '22%' }}>&nbsp;</td>
            <td style={{ ...th, width: '10%', verticalAlign: 'top', lineHeight: '1.6' }}>審核<br />(協力廠)</td>
            <td style={{ ...td, width: '22%', verticalAlign: 'middle' }}>{row.vendorReviewer || ''}</td>
            <td style={{ ...th, width: '10%', verticalAlign: 'top', lineHeight: '1.6' }}>填表<br />(協力廠)</td>
            <td style={{ ...td, width: '24%', verticalAlign: 'middle' }}>{row.vendorFiller || ''}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
