/**
 * ShipmentPrintPage — 列印頁面（內嵌全頁，非 Modal）
 *
 * 結構：
 *   ─ 工具列：← 返回  |  [print 按鈕]  |  TAB：中文出貨單 / 中文外箱貼紙 / 英文出貨單 / 英文外箱貼紙
 *   ─ 預覽區：滾動白底，目前以毛玻璃佔位（功能開發中）
 */

import { useState } from 'react';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';

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
  onBack: () => void;
  initialTab?: PrintTab;
  /** 限制可顯示的 TAB，預設全部 */
  tabs?: PrintTab[];
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function ShipmentPrintPage({ vendorShipmentNo, onBack, initialTab = 'zh-shipment', tabs }: ShipmentPrintPageProps) {
  // 若有傳入 tabs 限制，過濾可用 TAB；否則全部顯示
  const availableTabs = tabs ? PRINT_TABS.filter(t => tabs.includes(t.id)) : PRINT_TABS;
  // initialTab 若不在可用清單內，取第一個可用 TAB
  const resolvedInitial = availableTabs.find(t => t.id === initialTab)?.id ?? availableTabs[0]?.id ?? 'zh-shipment';
  const [activeTab, setActiveTab] = useState<PrintTab>(resolvedInitial);

  const isSticker = activeTab.includes('sticker');

  const handlePrint = () => {
    // 將來接實際 PDF API，目前 stub
    window.print();
  };

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_0px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 工具列：← 返回 | TAB | print ─────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.08)] relative">
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
              {/* Active 底線 */}
              {activeTab === tab.id && (
                <div
                  aria-hidden="true"
                  className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none"
                />
              )}
              {/* TAB 文字 */}
              <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 text-[14px] ${
                activeTab === tab.id ? 'text-[#1c252e]' : 'text-[#637381]'
              }`}>
                {tab.label}
              </p>
            </div>
          ))}

          {/* print 黑色按鈕（最後一個 TAB 後面） */}
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

          {/* 底部灰色背景線 */}
          <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
        </div>
      </div>

      {/* ── 預覽區 ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#f4f6f8] px-[32px] py-[28px]">
        <PrintPreviewArea isSticker={isSticker} activeTab={activeTab} />
      </div>
    </div>
  );
}

// ── 預覽區（功能開發中，毛玻璃遮罩）─────────────────────────────────────────
function PrintPreviewArea({ isSticker, activeTab }: { isSticker: boolean; activeTab: PrintTab }) {
  const tabLabel = PRINT_TABS.find(t => t.id === activeTab)?.label ?? '';

  // 模擬文件骨架卡片數量
  const cardCount = isSticker ? 4 : 2;

  return (
    <div className="relative w-full min-h-full">

      {/* ── 骨架文件（在毛玻璃下方，給視覺輪廓感）── */}
      <div className={`grid gap-[20px] ${isSticker ? 'grid-cols-2' : 'grid-cols-1 max-w-[660px] mx-auto'}`}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[12px] border border-[rgba(145,158,171,0.12)] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            {isSticker ? <StickerSkeleton /> : <ShipmentDocSkeleton index={i} />}
          </div>
        ))}
      </div>

      {/* ── 毛玻璃遮罩 + 提示文字 ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background: 'rgba(244,246,248,0.70)',
        }}
      >
        {/* 圖示圓圈 */}
        <div
          className="flex items-center justify-center rounded-full mb-[20px] shrink-0"
          style={{
            width: 80,
            height: 80,
            background: 'rgba(0,94,184,0.08)',
            boxShadow: '0 0 0 18px rgba(0,94,184,0.04)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </div>

        {/* 主標題 */}
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[20px] text-[#1c252e] mb-[10px] text-center">
          {tabLabel} 預覽
        </p>

        {/* 說明文字 */}
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] text-center leading-[24px]">
          此區塊將串接 PDF 生成 API 呈現文件預覽<br />
          功能建置中，敬請期待
        </p>

        {/* 「功能開發中」標籤 */}
        <div
          className="mt-[20px] flex items-center gap-[7px] px-[16px] py-[7px] rounded-full"
          style={{ background: 'rgba(0,94,184,0.08)', border: '1px solid rgba(0,94,184,0.18)' }}
        >
          <span className="w-[8px] h-[8px] rounded-full bg-[#005eb8] shrink-0 animate-pulse" />
          <span className="font-['Public_Sans:Medium',sans-serif] font-medium text-[13px] text-[#005eb8]">
            功能開發中
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 外箱貼紙骨架 ─────────────────────────────────────────────────────────────
function StickerSkeleton() {
  return (
    <div className="p-[14px] flex flex-col gap-[8px]" style={{ minHeight: 260 }}>
      {/* 出貨單號列 */}
      <div className="grid grid-cols-2 gap-[8px]">
        <div className="h-[11px] rounded-[3px] bg-[rgba(145,158,171,0.14)]" style={{ width: '70%' }} />
        <div className="h-[11px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '60%', marginLeft: 'auto' }} />
      </div>
      {/* 料號區塊 */}
      <div className="border border-[rgba(145,158,171,0.16)] rounded-[4px] p-[8px] flex flex-col gap-[5px]">
        <div className="h-[11px] rounded-[3px] bg-[rgba(145,158,171,0.16)]" style={{ width: '55%' }} />
        <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '80%' }} />
      </div>
      {/* 欄位格線 */}
      {[['客戶料號','淨重'], ['客戶訂單號碼','毛重'], ['廠商料號','']] .map((row, i) => (
        <div key={i} className="grid grid-cols-2 gap-[4px]">
          <div className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '65%' }} />
          <div className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.08)]" style={{ width: '40%' }} />
        </div>
      ))}
      <div className="h-[1px] bg-[rgba(145,158,171,0.14)] my-[4px]" />
      {/* QR + 數量 */}
      <div className="flex items-end gap-[10px] mt-auto">
        <div className="rounded-[4px] bg-[rgba(145,158,171,0.12)] shrink-0" style={{ width: 56, height: 56 }} />
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-[4px] mb-[6px]">
            {['總數量','組件數','本件數量'].map((_, j) => (
              <div key={j} className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-[4px]">
            {[1,2,3].map(j => (
              <div key={j} className="h-[14px] rounded-[3px] bg-[rgba(145,158,171,0.14)]" />
            ))}
          </div>
        </div>
      </div>
      {/* Made in Taiwan */}
      <div className="flex justify-center mt-[4px]">
        <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.08)]" style={{ width: 90 }} />
      </div>
    </div>
  );
}

// ── 出貨單文件骨架 ───────────────────────────────────────────────────────────
function ShipmentDocSkeleton({ index }: { index: number }) {
  return (
    <div className="p-[20px] flex flex-col gap-[12px]" style={{ minHeight: 340 }}>
      {/* 標題 */}
      <div className="flex items-center justify-center py-[8px] border-b border-[rgba(145,158,171,0.14)]">
        <div className="h-[16px] rounded-[3px] bg-[rgba(145,158,171,0.16)]" style={{ width: 140 }} />
      </div>
      {/* 資訊欄 */}
      <div className="grid grid-cols-2 gap-x-[24px] gap-y-[10px]">
        {Array.from({ length: 6 }).map((_, j) => (
          <div key={j} className="flex gap-[8px] items-center">
            <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: 60, flexShrink: 0 }} />
            <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.14)]" style={{ flex: 1 }} />
          </div>
        ))}
      </div>
      {/* 表格 */}
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
      {/* 簽章區 */}
      <div className="flex justify-end gap-[32px] mt-auto pt-[12px] border-t border-[rgba(145,158,171,0.10)]">
        {['廠商簽章', '確認簽章'].map(label => (
          <div key={label} className="flex flex-col items-center gap-[6px]">
            <div className="h-[32px] w-[80px] border border-[rgba(145,158,171,0.16)] rounded-[4px]" />
            <div className="h-[9px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: 48 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
