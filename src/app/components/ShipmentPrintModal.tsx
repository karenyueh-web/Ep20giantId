/**
 * ShipmentPrintModal — 列印預覽 Modal
 *
 * 功能：
 *   - 上方列印按鈕
 *   - 四個 TAB（中文出貨單 / 中文外箱貼紙 / 英文出貨單 / 英文外箱貼紙）
 *   - 下方預覽畫面（功能開發中，毛玻璃效果佔位）
 */

import { useState } from 'react';

// ── TAB 定義 ─────────────────────────────────────────────────────────────────
type PrintTab = 'zh-shipment' | 'zh-sticker' | 'en-shipment' | 'en-sticker';

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
interface ShipmentPrintModalProps {
  vendorShipmentNo: string;
  onClose: () => void;
  initialTab?: PrintTab;
}

// ── 主元件 ───────────────────────────────────────────────────────────────────
export function ShipmentPrintModal({ vendorShipmentNo, onClose, initialTab = 'zh-shipment' }: ShipmentPrintModalProps) {
  const [activeTab, setActiveTab] = useState<PrintTab>(initialTab);

  const handlePrint = () => {
    // 將來接 PDF API，目前為 stub
    alert(`列印功能開發中\n文件類型：${PRINT_TABS.find(t => t.id === activeTab)?.label}\n出貨單號：${vendorShipmentNo}`);
  };

  return (
    /* ── backdrop ── */
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center"
      style={{ background: 'rgba(28,37,46,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── 主容器 ── */}
      <div
        className="bg-white rounded-[16px] shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.28)] flex flex-col overflow-hidden"
        style={{ width: 860, height: '88vh', maxHeight: 760, maxWidth: '95vw' }}
      >

        {/* ── 頂部工具列 ─────────────────────────────────────────────────── */}
        <div className="shrink-0 px-[24px] pt-[16px] flex items-center justify-between">

          {/* 左側標題 */}
          <div className="flex items-center gap-[10px]">
            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
              title="關閉"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
            <div>
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] text-[#1c252e] leading-[24px]">
                列印預覽
              </p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] leading-[18px]">
                {vendorShipmentNo}
              </p>
            </div>
          </div>

          {/* 右側：列印按鈕 */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-[8px] h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] hover:bg-[#2d3748] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors whitespace-nowrap"
          >
            {/* printer icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            print
          </button>
        </div>

        {/* ── TAB 切換列（對齊 VendorDetailPage 規範）─────────────────────── */}
        <div className="shrink-0 relative">
          <div className="content-stretch flex gap-[40px] h-[48px] items-center px-[24px] relative w-full">

            {PRINT_TABS.map(tab => (
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

            {/* 底部灰色背景線 */}
            <div className="absolute bg-[rgba(145,158,171,0.12)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>

        {/* ── 預覽區域 ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 bg-[#f4f6f8] overflow-auto custom-scrollbar px-[24px] py-[20px]">
          <PrintPreviewArea activeTab={activeTab} />
        </div>

      </div>
    </div>
  );
}

// ── 預覽區（功能開發中，毛玻璃佔位）─────────────────────────────────────────
function PrintPreviewArea({ activeTab }: { activeTab: PrintTab }) {
  const tabLabel = PRINT_TABS.find(t => t.id === activeTab)?.label ?? '';

  // 根據 TAB 模擬預覽畫面的佈局（外箱貼紙為 2 欄，出貨單為 1 欄全寬）
  const isSticker = activeTab.includes('sticker');

  return (
    <div className="relative w-full h-full min-h-[480px]">

      {/* ── 模擬文件骨架（半透明，供毛玻璃遮罩下方顯示輪廓感）── */}
      <div className={`grid gap-[16px] ${isSticker ? 'grid-cols-2' : 'grid-cols-1 max-w-[600px] mx-auto'}`}>
        {Array.from({ length: isSticker ? 4 : 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[8px] border border-[rgba(145,158,171,0.16)] shadow-[0px_2px_8px_rgba(0,0,0,0.06)]"
            style={{ height: isSticker ? 280 : 360 }}
          >
            {/* 模擬單據骨架線條 */}
            <div className="p-[16px] flex flex-col gap-[8px]">
              <div className="flex gap-[8px]">
                <div className="h-[14px] rounded-[3px] bg-[rgba(145,158,171,0.15)]" style={{ width: '40%' }} />
                <div className="h-[14px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '30%' }} />
              </div>
              <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '80%' }} />
              <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.08)]" style={{ width: '60%' }} />
              {/* 分隔線 */}
              <div className="h-[1px] bg-[rgba(145,158,171,0.15)] my-[4px]" />
              {/* 欄位格 */}
              <div className="grid grid-cols-3 gap-[6px]">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" />
                ))}
              </div>
              {/* QR Code 佔位（貼紙樣式） */}
              {isSticker && (
                <div className="flex items-end gap-[12px] mt-auto pt-[16px]">
                  <div
                    className="rounded-[4px] bg-[rgba(145,158,171,0.12)] shrink-0"
                    style={{ width: 60, height: 60 }}
                  />
                  <div className="flex flex-col gap-[6px] flex-1">
                    <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.10)]" style={{ width: '90%' }} />
                    <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.08)]" style={{ width: '70%' }} />
                    <div className="h-[10px] rounded-[3px] bg-[rgba(145,158,171,0.06)]" style={{ width: '50%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── 毛玻璃遮罩（功能開發中提示）── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-[12px]"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(244,246,248,0.72)',
        }}
      >
        {/* 工程圖示 */}
        <div
          className="flex items-center justify-center rounded-full mb-[20px] shrink-0"
          style={{
            width: 72,
            height: 72,
            background: 'rgba(0,94,184,0.08)',
            boxShadow: '0 0 0 16px rgba(0,94,184,0.04)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </div>

        {/* 主文字 */}
        <p
          className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e] mb-[8px] text-center"
        >
          {tabLabel} 預覽
        </p>

        {/* 副文字 */}
        <p
          className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] text-center leading-[22px] max-w-[300px]"
        >
          此區塊將接 PDF 生成 API 呈現文件預覽，<br />功能建置中，敬請期待
        </p>

        {/* 標籤 */}
        <div
          className="mt-[20px] flex items-center gap-[6px] px-[14px] py-[6px] rounded-full"
          style={{ background: 'rgba(0,94,184,0.08)', border: '1px solid rgba(0,94,184,0.16)' }}
        >
          {/* 閃爍點 */}
          <span
            className="w-[7px] h-[7px] rounded-full bg-[#005eb8] shrink-0 animate-pulse"
          />
          <span
            className="font-['Public_Sans:Medium',sans-serif] font-medium text-[12px] text-[#005eb8]"
          >
            功能開發中
          </span>
        </div>
      </div>

    </div>
  );
}
