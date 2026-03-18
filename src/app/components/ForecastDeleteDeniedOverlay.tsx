import { BaseOverlay } from './BaseOverlay';
import svgDanger from '@/imports/svg-vi2pceknlo';
import type { ForecastOrderRow } from './AdvancedForecastTable';

interface ForecastDeleteDeniedOverlayProps {
  deniedRows: ForecastOrderRow[];
  onClose: () => void;
}

// 表頭欄位定義
const COLS = [
  { key: 'uploadWeek',  label: '上傳週別', w: 100 },
  { key: 'companyCode', label: '公司',     w: 100 },
  { key: 'purchaseOrg', label: '採購組織', w: 100 },
  { key: 'vendor',      label: '廠商',     w: 160 },
  { key: 'materialNo',  label: '物料號碼', w: 160 },
  { key: 'deliveryDate',label: '交貨日期', w: 110 },
  { key: 'purchaseQty', label: '交貨量',   w: 90  },
  { key: 'updatedBy',   label: '上傳人員', w: 100 },
] as const;

export function ForecastDeleteDeniedOverlay({ deniedRows, onClose }: ForecastDeleteDeniedOverlayProps) {
  return (
    <BaseOverlay onClose={onClose} maxWidth="1148px" maxHeight="600px">
      {/* ── 頂部警示列 ── */}
      <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
        {/* 危險圖示 */}
        <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,86,48,0.08)]">
          <svg width="24" height="24" viewBox="0 0 18 20" fill="none">
            <path
              clipRule="evenodd"
              d={svgDanger.p3d63d600}
              fill="#FF5630"
              fillRule="evenodd"
            />
          </svg>
        </div>
        {/* 標題 */}
        <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">
          您無權限刪除以下訂單
        </p>
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
          title="關閉"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── 表格區域 ── */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="min-w-max">
          {/* 表頭 */}
          <div className="flex sticky top-0 z-10 bg-[#f4f6f8] border-b border-[rgba(145,158,171,0.12)]">
            {COLS.map((col) => (
              <div
                key={col.key}
                style={{ width: col.w, minWidth: col.w }}
                className="flex items-center px-[10px] h-[44px] border-r border-[rgba(145,158,171,0.08)] last:border-r-0"
              >
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e] whitespace-nowrap">
                  {col.label}
                </p>
              </div>
            ))}
            {/* 右側留白 */}
            <div className="flex-1 min-w-0" />
          </div>

          {/* 資料列 */}
          {deniedRows.map((row) => (
            <div
              key={row.id}
              className="flex border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors"
            >
              {COLS.map((col) => (
                <div
                  key={col.key}
                  style={{ width: col.w, minWidth: col.w }}
                  className="flex items-center px-[10px] h-[48px] border-r border-[rgba(145,158,171,0.08)] last:border-r-0"
                >
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#637381] truncate">
                    {col.key === 'purchaseQty'
                      ? row[col.key].toLocaleString()
                      : row[col.key]}
                  </p>
                </div>
              ))}
              <div className="flex-1 min-w-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 底部說明 ── */}
      <div className="shrink-0 flex items-center justify-between px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)] bg-[rgba(255,86,48,0.04)]">
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] text-[#637381] leading-[20px]">
          只有採購組織相符或由您本人上傳的訂單才可刪除。
        </p>
        <button
          onClick={onClose}
          className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors shrink-0"
        >
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white leading-none">
            確認
          </span>
        </button>
      </div>
    </BaseOverlay>
  );
}
