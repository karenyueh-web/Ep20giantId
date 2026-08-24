'use client';

/**
 * GtsTwPrintPage — 出貨台灣捷安特「列印外箱貼紙」頁面
 *
 * 功能：
 * - 搜尋列：訂單單號、出貨單號、料號、廠商編號（4 欄）
 * - StandardDataTable + checkbox 多選
 * - TableToolbar 「上傳」按鈕
 * - Selection Bar「列印外箱貼紙」→ 切換至貼紙預覽模式
 * - 貼紙預覽：中文外箱貼紙 / 英文外箱貼紙 Tab + print 按鈕
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { GtsTwUploadOverlay } from './GtsTwUploadOverlay';
import QRCode from 'qrcode';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';

// ── 出貨明細資料型別 ─────────────────────────────────────────────────────────
export interface GtsTwPrintRow {
  id: number;
  barcode: string;
  vendorShortName: string;
  vendorShipNo: string;
  materialNo: string;
  unitQty: number;
  shipQty: number;
  unit: string;      // 單位
  labelFreq: string;
  totalBoxes: number;
  orderNo: string;
  orderSeq: string;
  deliveryDate: string;
  productName: string;
  vendorMaterialNo: string;
  // 貼紙額外欄位
  netWeight: number;
  grossWeight: number;
  customerMaterialNo: string;
  customerOrderNo: string;
  vendorName: string;
  storageLocation: string;
  destination: string;
}

// ── Mock 初始資料 ─────────────────────────────────────────────────────────────
const INITIAL_ROWS: GtsTwPrintRow[] = [
  {
    id: 1, barcode: 'GT00160300', vendorShortName: '台灣欣欣(124003)',
    vendorShipNo: '101023G261265', materialNo: '4300544',
    unitQty: 4, shipQty: 4, unit: 'PCE', labelFreq: '1/1', totalBoxes: 1,
    orderNo: 'G261265-1', orderSeq: 'G261265-1',
    deliveryDate: '2026/06/15', productName: 'TRIPEAK G8高端鎖牛叉 / 針孔式 BB86 型 Sram dub(28.99mm) / Rotor 385/30',
    vendorMaterialNo: 'EMA-TF412930S-ACCB',
    netWeight: 0, grossWeight: 0, customerMaterialNo: '', customerOrderNo: '',
    vendorName: '', storageLocation: '', destination: '',
  },
  {
    id: 2, barcode: 'GT00160301', vendorShortName: '台灣欣欣(124003)',
    vendorShipNo: '101023G261265', materialNo: '5290019',
    unitQty: 10, shipQty: 10, unit: 'PCE', labelFreq: '1/1', totalBoxes: 1,
    orderNo: 'G261265-2', orderSeq: 'G261265-2',
    deliveryDate: '2026/06/15', productName: 'Shimano / SRAM (Road) (11 S) 11/11T 變速器',
    vendorMaterialNo: 'EMA-JW11-SHSBXX11S',
    netWeight: 0, grossWeight: 0, customerMaterialNo: '', customerOrderNo: '',
    vendorName: '', storageLocation: '', destination: '',
  },
  {
    id: 3, barcode: 'GT00160302', vendorShortName: '捷昇工業(124010)',
    vendorShipNo: '202023G261300', materialNo: '3180022',
    unitQty: 50, shipQty: 50, unit: 'SET', labelFreq: '1/1', totalBoxes: 1,
    orderNo: 'G261300-1', orderSeq: 'G261300-1',
    deliveryDate: '2026/06/20', productName: '培林培林培林 XX型號',
    vendorMaterialNo: 'JW11-SHSBXX12S',
    netWeight: 0, grossWeight: 0, customerMaterialNo: '', customerOrderNo: '',
    vendorName: '', storageLocation: '', destination: '',
  },
];

// ── 欄位定義（對應 GTS 13 個欄位）────────────────────────────────────────────
const PRINT_COLUMNS: StandardColumn<GtsTwPrintRow>[] = [
  { key: 'barcode',         label: '條碼',            width: 150, minWidth: 110 },
  { key: 'vendorShortName', label: '廠商簡稱(AX編號)', width: 180, minWidth: 130 },
  { key: 'vendorShipNo',    label: '廠商出貨單',       width: 160, minWidth: 120 },
  { key: 'materialNo',      label: '料號',             width: 130, minWidth: 100 },
  { key: 'unitQty',         label: '本件數量',         width: 100, minWidth: 80  },
  { key: 'shipQty',         label: '出貨量',           width: 100, minWidth: 80  },
  { key: 'unit',            label: '單位',             width: 90,  minWidth: 70  },
  { key: 'labelFreq',       label: '貼標項次',         width: 100, minWidth: 80  },
  { key: 'totalBoxes',      label: '總箱數',           width: 90,  minWidth: 70  },
  { key: 'orderNo',         label: '訂單號碼',         width: 150, minWidth: 110 },
  { key: 'orderSeq',        label: '訂單序號',         width: 150, minWidth: 110 },
  { key: 'deliveryDate',    label: '交貨日期',         width: 120, minWidth: 100 },
  { key: 'productName',     label: '品名',             width: 200, minWidth: 140 },
  { key: 'vendorMaterialNo',label: '廠商料號',         width: 200, minWidth: 140 },
];

// ── QR Code Canvas（useEffect + canvas，同 ShipmentPrintPage）────────────────
function QrCodeCanvas({ value, size = 55 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size, margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).catch(console.error);
  }, [value, size]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block', flexShrink: 0 }} />;
}

// ── A4 貼紙尺寸常數（同 ShipmentPrintPage）────────────────────────────────────
const STICKER_PADDING_V = '10mm';
const STICKER_PADDING_H = '12mm';
const STICKER_COL_GAP   = '25mm';
const STICKER_ROW_GAP   = '19mm';
const STICKER_COL_W     = '80mm';
const STICKER_ROW_H     = '80mm';

// ── 單張中文貼紙（table inline-style，對齊 EP 範本）──────────────────────────
function GtsSingleZhSticker({ row }: { row: GtsTwPrintRow }) {
  const border = '1px solid #000';
  const cellBase: React.CSSProperties = {
    border, padding: '1px 4px', fontSize: '11px', verticalAlign: 'middle',
    lineHeight: '1.3', wordBreak: 'break-all', overflow: 'hidden',
  };
  const lbl: React.CSSProperties = { ...cellBase, fontWeight: 'normal', whiteSpace: 'nowrap', color: '#333', width: '26%' };
  const val: React.CSSProperties = { ...cellBase, fontWeight: 'normal' };

  // 廠商名稱：去掉括號內的編號（「台灣欣欣(124003)」→「台灣欣欣」）
  const vendorName = row.vendorShortName.replace(/\(.*\)/, '').trim();
  // 重量：0 時顯示空字串
  const nw = row.netWeight   ? `${row.netWeight}kg`   : '';
  const gw = row.grossWeight ? `${row.grossWeight}kg` : '';
  // 訂單號碼 + 訂單序號
  const orderFull = row.orderSeq ? `${row.orderNo}-${row.orderSeq}` : row.orderNo;

  return (
    <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: '2px solid #000' }}>
      <colgroup>
        <col style={{ width: '26%' }} />
        <col style={{ width: '30%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '24%' }} />
      </colgroup>
      <tbody>
        {/* R1: 出貨單號 + 出貨日 */}
        <tr>
          <td style={lbl}>出貨單號</td>
          <td style={{ ...val, fontSize: '11px' }}>{row.vendorShipNo}</td>
          <td style={lbl}>出貨日</td>
          <td style={val}>{row.deliveryDate}</td>
        </tr>
        {/* R2: 料號（粗體） */}
        <tr>
          <td style={lbl}>料號</td>
          <td style={{ ...val, fontWeight: 'bold', fontSize: '11px' }} colSpan={3}>{row.materialNo}</td>
        </tr>
        {/* R3: 品名 */}
        <tr>
          <td style={{ ...val, fontSize: '10px', color: '#222', height: '20px' }} colSpan={4}>{row.productName}</td>
        </tr>
        {/* R4: 客戶料號 + 淨重 */}
        <tr>
          <td style={lbl}>客戶料號</td>
          <td style={val}>{row.customerMaterialNo}</td>
          <td style={lbl}>淨重</td>
          <td style={val}>{nw}</td>
        </tr>
        {/* R5: 客戶訂單號碼 + 毛重 */}
        <tr>
          <td style={lbl}>客戶訂單號碼</td>
          <td style={val}>{row.customerOrderNo}</td>
          <td style={lbl}>毛重</td>
          <td style={val}>{gw}</td>
        </tr>
        {/* R6: 廠商料號 */}
        <tr>
          <td style={lbl}>廠商料號</td>
          <td style={val} colSpan={3}>{row.vendorMaterialNo}</td>
        </tr>
        {/* R7: 廠商名稱 + 儲存地點 */}
        <tr>
          <td style={lbl}>廠商名稱</td>
          <td style={val}>{vendorName}</td>
          <td style={lbl}>儲存地點</td>
          <td style={val}>{row.storageLocation}</td>
        </tr>
        {/* R8: 出貨目的地 */}
        <tr>
          <td style={lbl}>出貨目的地</td>
          <td style={val} colSpan={3}>{row.destination}</td>
        </tr>
        {/* R9: 訂單號碼（含序號） */}
        <tr>
          <td style={lbl}>訂單號碼</td>
          <td style={val} colSpan={3}>{orderFull}</td>
        </tr>
        {/* R10-11: QR Code + 數量（無 Made in Taiwan） */}
        <tr>
          <td style={{ ...cellBase, padding: 0, textAlign: 'center', verticalAlign: 'middle' }} rowSpan={2}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2px' }}>
              <div style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', lineHeight: '1.1' }}>{row.barcode}</div>
              <QrCodeCanvas value={row.barcode} size={48} />
            </div>
          </td>
          <td style={{ ...lbl, textAlign: 'center' }}>總數量</td>
          <td style={{ ...lbl, textAlign: 'center' }}>總件數</td>
          <td style={{ ...lbl, textAlign: 'center' }}>本件數量</td>
        </tr>
        <tr>
          <td style={{ ...val, textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{row.shipQty}</td>
          <td style={{ ...val, textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{row.labelFreq}</td>
          <td style={{ ...val, textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{row.unitQty}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ── 單張英文貼紙（對齊 EP 範本）─────────────────────────────────────────────
function GtsSingleEnSticker({ row }: { row: GtsTwPrintRow }) {
  const border = '1px solid #000';
  const cellBase: React.CSSProperties = {
    border, padding: '1px 4px', fontSize: '11px', verticalAlign: 'middle',
    lineHeight: '1.3', wordBreak: 'break-all', overflow: 'hidden',
  };
  const lbl: React.CSSProperties = { ...cellBase, fontWeight: 'normal', whiteSpace: 'nowrap', color: '#333', width: '26%' };
  const val: React.CSSProperties = { ...cellBase, fontWeight: 'normal' };

  const vendorName = row.vendorShortName.replace(/\(.*\)/, '').trim();
  const nw = row.netWeight   ? `${row.netWeight}kg`   : '';
  const gw = row.grossWeight ? `${row.grossWeight}kg` : '';
  const orderFull = row.orderSeq ? `${row.orderNo}-${row.orderSeq}` : row.orderNo;

  return (
    <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: '2px solid #000' }}>
      <colgroup>
        <col style={{ width: '26%' }} />
        <col style={{ width: '30%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '24%' }} />
      </colgroup>
      <tbody>
        {/* R1: Ship no. + Ship Dt */}
        <tr>
          <td style={lbl}>Ship no.</td>
          <td style={{ ...val, fontSize: '11px' }}>{row.vendorShipNo}</td>
          <td style={lbl}>Ship Dt</td>
          <td style={val}>{row.deliveryDate}</td>
        </tr>
        {/* R2: Part no.（bold） */}
        <tr>
          <td style={lbl}>Part no.</td>
          <td style={{ ...val, fontWeight: 'bold', fontSize: '11px' }} colSpan={3}>{row.materialNo}</td>
        </tr>
        {/* R3: Product name */}
        <tr>
          <td style={{ ...val, fontSize: '10px', color: '#222', height: '20px' }} colSpan={4}>{row.productName}</td>
        </tr>
        {/* R4: Cust Part no + N.W. */}
        <tr>
          <td style={lbl}>Cust Part no</td>
          <td style={val}>{row.customerMaterialNo}</td>
          <td style={lbl}>N.W.</td>
          <td style={val}>{nw}</td>
        </tr>
        {/* R5: Cust order no + G.W. */}
        <tr>
          <td style={lbl}>Cust order no</td>
          <td style={val}>{row.customerOrderNo}</td>
          <td style={lbl}>G.W.</td>
          <td style={val}>{gw}</td>
        </tr>
        {/* R6: Vend part no */}
        <tr>
          <td style={lbl}>Vend part no</td>
          <td style={val} colSpan={3}>{row.vendorMaterialNo}</td>
        </tr>
        {/* R7: Vend name + S. Loc */}
        <tr>
          <td style={lbl}>Vend name</td>
          <td style={val}>{vendorName}</td>
          <td style={lbl}>S. Loc</td>
          <td style={val}>{row.storageLocation}</td>
        </tr>
        {/* R8: Destination */}
        <tr>
          <td style={lbl}>Destination</td>
          <td style={val} colSpan={3}>{row.destination}</td>
        </tr>
        {/* R9: order no. （含序號） */}
        <tr>
          <td style={lbl}>order no.</td>
          <td style={val} colSpan={3}>{orderFull}</td>
        </tr>
        {/* R10-11: QR + 數量（無 Made in Taiwan） */}
        <tr>
          <td style={{ ...cellBase, padding: 0, textAlign: 'center', verticalAlign: 'middle' }} rowSpan={2}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2px' }}>
              <div style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', lineHeight: '1.1' }}>{row.barcode}</div>
              <QrCodeCanvas value={row.barcode} size={48} />
            </div>
          </td>
          <td style={{ ...lbl, textAlign: 'center' }}>Total qty</td>
          <td style={{ ...lbl, textAlign: 'center' }}>Cartons</td>
          <td style={{ ...lbl, textAlign: 'center' }}>Qty</td>
        </tr>
        <tr>
          <td style={{ ...val, textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{row.shipQty}</td>
          <td style={{ ...val, textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{row.labelFreq}</td>
          <td style={{ ...val, textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{row.unitQty}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ── A4 貼紙文件容器（2 欄 × 3 列 = 6 張/頁）─────────────────────────────────
function GtsStickerDoc({ rows, lang }: { rows: GtsTwPrintRow[]; lang: 'zh' | 'en' }) {
  const STICKERS_PER_PAGE = 6;
  const pages: GtsTwPrintRow[][] = [];
  for (let i = 0; i < rows.length; i += STICKERS_PER_PAGE) {
    pages.push(rows.slice(i, i + STICKERS_PER_PAGE));
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
        const cells = [...pageStickers];
        while (cells.length < STICKERS_PER_PAGE) cells.push(null as any);

        return (
          <div key={pageIdx} className="shipment-page-block">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `${STICKER_COL_W} ${STICKER_COL_W}`,
              gridTemplateRows: `${STICKER_ROW_H} ${STICKER_ROW_H} ${STICKER_ROW_H}`,
              columnGap: STICKER_COL_GAP,
              rowGap: STICKER_ROW_GAP,
              width: '210mm', height: '297mm',
              padding: `${STICKER_PADDING_V} ${STICKER_PADDING_H}`,
              boxSizing: 'border-box',
            }}>
              {cells.map((row, idx) => (
                <div key={idx} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch' }}>
                  {row
                    ? lang === 'zh'
                      ? <GtsSingleZhSticker row={row} />
                      : <GtsSingleEnSticker row={row} />
                    : <div style={{ width: '100%', height: '100%' }} />}
                </div>
              ))}
            </div>
            {!isLastPage && (
              <div data-no-print="true" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0', color: '#aaa', fontSize: '13px' }}>
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
                <span style={{ padding: '2px 14px', color: '#777', fontSize: '13px', whiteSpace: 'nowrap' }}>{pageIdx + 1} / {pages.length}</span>
                <div style={{ flex: 1, height: '1px', background: 'repeating-linear-gradient(to right, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 列印預覽頁（完全對齊 ShipmentPrintPage 版面）──────────────────────────────
function PrintPreviewPage({ rows, onBack }: { rows: GtsTwPrintRow[]; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh');

  const handlePrint = () => {
    const printArea = document.querySelector('.print-area');
    if (!printArea) { window.print(); return; }

    // Clone 列印區域
    const cloned = printArea.cloneNode(true) as HTMLElement;

    // Canvas → img
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

    cloned.querySelectorAll('[data-no-print]').forEach(el => { (el as HTMLElement).style.display = 'none'; });
    cloned.querySelectorAll('.shipment-doc-wrapper').forEach(el => {
      const e = el as HTMLElement;
      e.style.padding = '0'; e.style.margin = '0';
      e.style.border = 'none'; e.style.boxShadow = 'none';
      e.style.borderRadius = '0'; e.style.maxWidth = '100%'; e.style.width = '100%';
    });

    const bodyInner = cloned.innerHTML;
    const htmlContent = [
      '<!DOCTYPE html>', '<html lang="zh-TW">', '<head>',
      '  <meta charset="UTF-8" />', '  <title> </title>', '  <style>',
      '    @page { size: A4 portrait; margin: 0mm; }',
      '    *, *::before, *::after { box-sizing: border-box; }',
      '    html, body { margin: 0; padding: 0; background: white; font-family: sans-serif; }',
      '    table { border-collapse: collapse; width: 100%; }',
      '    td, th { border: 1px solid #333; padding: 1px 4px; font-size: 11px; vertical-align: middle; }',
      '    .shipment-page-block { page-break-after: always; break-after: page; height: 297mm; overflow: hidden; }',
      '    .shipment-page-block:last-child { page-break-after: auto; break-after: auto; }',
      '    [data-no-print] { display: none; }',
      '  </style>', '</head>',
      '<body>' + bodyInner + '</body>', '</html>',
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

  const tabs = [
    { id: 'zh' as const, label: '中文外箱貼紙' },
    { id: 'en' as const, label: '英文外箱貼紙' },
  ];

  return (
    <div className="print-wrapper bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 工具列 ── */}
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
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
            >
              {activeTab === tab.id && (
                <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
              )}
              <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
                activeTab === tab.id ? 'text-[#1c252e]' : 'text-[#637381]'
              }`}>
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

      {/* ── 預覽區（灰底，居中 A4 白底卡片）── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[32px] py-[28px] print-area">
        <div className="flex flex-col items-center gap-[24px] w-full">
          <GtsStickerDoc rows={rows} lang={activeTab} />
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ── 主頁面元件 ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function GtsTwPrintPage() {
  // 資料來源（上傳後合併）
  const [allRows, setAllRows] = useState<GtsTwPrintRow[]>(INITIAL_ROWS);

  // 搜尋狀態
  const [filterOrderNo,  setFilterOrderNo]  = useState('');
  const [filterShipNo,   setFilterShipNo]   = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterVendor,   setFilterVendor]   = useState('');

  // 多選
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 彈窗/模式
  const [showUpload,   setShowUpload]   = useState(false);
  const [printMode,    setPrintMode]    = useState(false);
  const [printRows,    setPrintRows]    = useState<GtsTwPrintRow[]>([]);

  // ── 篩選 ──
  const filteredData = useMemo(() => {
    let data = allRows;
    if (filterOrderNo.trim()) {
      const kw = filterOrderNo.trim().toLowerCase();
      data = data.filter(r => r.orderNo.toLowerCase().includes(kw));
    }
    if (filterShipNo.trim()) {
      const kw = filterShipNo.trim().toLowerCase();
      data = data.filter(r => r.vendorShipNo.toLowerCase().includes(kw));
    }
    if (filterMaterial.trim()) {
      const kw = filterMaterial.trim().toLowerCase();
      data = data.filter(r =>
        r.materialNo.toLowerCase().includes(kw) ||
        r.vendorMaterialNo.toLowerCase().includes(kw)
      );
    }
    if (filterVendor.trim()) {
      const kw = filterVendor.trim().toLowerCase();
      data = data.filter(r => r.vendorShortName.toLowerCase().includes(kw));
    }
    return data;
  }, [allRows, filterOrderNo, filterShipNo, filterMaterial, filterVendor]);

  // ── 多選 handler ──
  const handleToggleRow = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((ids: number[]) => {
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  // ── 上傳成功 ──
  const handleUploadSuccess = useCallback((rows: GtsTwPrintRow[]) => {
    setAllRows(prev => {
      const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
      const newRows = rows.map((r, i) => ({ ...r, id: maxId + i + 1 }));
      return [...prev, ...newRows];
    });
  }, []);

  // ── 列印貼紙 ──
  const handlePrintStickers = useCallback(() => {
    const selected = filteredData.filter(r => selectedIds.has(r.id));
    if (selected.length === 0) return;
    setPrintRows(selected);
    setPrintMode(true);
  }, [filteredData, selectedIds]);

  // ── 匯出 CSV ──
  const handleExportCsv = useCallback(() => {
    const headers = PRINT_COLUMNS.map(c => c.label).join(',');
    const rows = filteredData.map(r =>
      [r.barcode, r.vendorShortName, r.vendorShipNo, r.materialNo, r.unitQty, r.shipQty, r.labelFreq, r.totalBoxes, r.orderNo, r.orderSeq, r.deliveryDate, r.productName, r.vendorMaterialNo].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gts_print_list.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  // ── 列印預覽模式 ──
  if (printMode) {
    return <PrintPreviewPage rows={printRows} onBack={() => setPrintMode(false)} />;
  }

  // ── batchActions ──
  const batchActions = (
    <span
      onClick={handlePrintStickers}
      className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
    >
      列印外箱貼紙
    </span>
  );

  // ── 上傳按鈕（TableToolbar actionButton）──
  const uploadButton = (
    <button
      onClick={() => setShowUpload(true)}
      className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors gap-[6px]"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.667 10.667v2A1.333 1.333 0 004 14h8a1.333 1.333 0 001.333-1.333v-2M8 10V2M5.333 4.667L8 2l2.667 2.667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      上傳
    </button>
  );

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列（4 欄）── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <SearchField label="訂單單號" value={filterOrderNo}  onChange={setFilterOrderNo}  type="search" />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="出貨單號" value={filterShipNo}   onChange={setFilterShipNo}   type="search" />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="料號"     value={filterMaterial}  onChange={setFilterMaterial}  type="search" />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField label="廠商編號" value={filterVendor}   onChange={setFilterVendor}   type="search" />
        </div>
      </div>

      {/* ── StandardDataTable ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<GtsTwPrintRow>
          columns={PRINT_COLUMNS}
          data={filteredData}
          storageKey="gts-tw-print-v1"
          showCheckbox
          externalFilteredData={filteredData}
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          batchActions={batchActions}
          actionButton={uploadButton}
          onExportCsv={handleExportCsv}
          className="rounded-none shadow-none"
        />
      </div>

      {/* ── 上傳 Overlay ── */}
      {showUpload && (
        <GtsTwUploadOverlay
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
