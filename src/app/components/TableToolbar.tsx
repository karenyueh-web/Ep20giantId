// 共用的 Table Toolbar 組件
import { useState, useRef, useEffect, useCallback } from 'react';

interface TableToolbarProps {
  resultsCount: number;
  showColumnSelector: boolean;
  showFilterDialog: boolean;
  onColumnsClick: () => void;
  onFiltersClick: () => void;
  columnsButton?: React.ReactNode;
  filtersButton?: React.ReactNode;
  actionButton?: React.ReactNode;
  /** 提供此 callback 即自動顯示 Export 下拉選單中的「匯出 Excel」選項 */
  onExportExcel?: () => void;
  /** 提供此 callback 即自動顯示 Export 下拉選單中的「匯出 CSV」選項 */
  onExportCsv?: () => void;
  /** 提供此 callback 即在 Export 下拉選單中顯示「下載變更檔案」選項 */
  onExportScheduleChange?: () => void;
}

export function TableToolbar({
  resultsCount,
  showColumnSelector,
  showFilterDialog,
  onColumnsClick,
  onFiltersClick,
  columnsButton,
  filtersButton,
  actionButton,
  onExportExcel,
  onExportCsv,
  onExportScheduleChange,
}: TableToolbarProps) {
  const hasExport = !!(onExportExcel || onExportCsv || onExportScheduleChange);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
      setShowExportDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="relative flex items-center justify-between px-[20px] py-[16px] bg-white shrink-0 w-full" style={{ borderTop: 'none', borderBottom: 'none' }}>
      <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#1c252e] text-[14px]">
        <span className="leading-[22px]">{resultsCount} </span>
        <span className="leading-[22px] text-[#637381]">results found</span>
      </p>
      
      <div className="flex gap-[12px] relative items-center">
        {/* Columns 按鈕 */}
        <div className="relative">
          <button 
            className="flex items-center gap-[8px] h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]"
            onClick={onColumnsClick}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.25 4.5H15.75M6 8.25H12M8.25 12H9.75" stroke="#1C252E" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[#1c252e] text-[13px]">
              Columns
            </p>
          </button>
          {/* 欄位選擇器彈窗 */}
          {showColumnSelector && columnsButton && (
            <div className="absolute left-0 top-[36px] z-50">
              {columnsButton}
            </div>
          )}
        </div>
        
        {/* Filters 按鈕 */}
        <div className="relative">
          <button 
            className="flex items-center gap-[8px] h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)]"
            onClick={onFiltersClick}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M16.5 6.75H1.5M12 9.75V12.75M6 9.75V12.75M2.25 3.75H15.75V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15 14.25 15H3.75C3.35218 15 2.97064 14.842 2.68934 14.5607C2.40804 14.2794 2.25 13.8978 2.25 13.5V3.75Z" stroke="#1C252E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[#1c252e] text-[13px]">
              Filters
            </p>
          </button>
          {/* Filter 彈窗 */}
          {showFilterDialog && filtersButton && (
            <div className="absolute left-0 top-[36px] z-50">
              {filtersButton}
            </div>
          )}
        </div>

        {/* ── 內建 Export 下拉選單（匯出 Excel / CSV）── */}
        {hasExport && (
          <div className="relative" ref={exportRef}>
            <button
              className="flex items-center gap-[6px] h-[30px] px-[4px] rounded-[8px] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
              onClick={() => setShowExportDropdown(prev => !prev)}
              title="匯出"
            >
              {/* Download icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C252E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[#1c252e] text-[13px]">
                Export
              </p>
              {/* Chevron */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showExportDropdown && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-[280px] bg-white rounded-[10px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)] border border-[rgba(145,158,171,0.12)] py-[6px] z-[100]">
                {/* 匯出 Excel */}
                {onExportExcel && (
                  <button
                    className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
                    onClick={() => { onExportExcel(); setShowExportDropdown(false); }}
                  >
                    <div className="mt-[2px] shrink-0">
                      {/* Table icon (green) */}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#118d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-[2px] min-w-0">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
                        匯出 Excel
                      </p>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">
                        依列表顯示欄位匯出 .xlsx 格式
                      </p>
                    </div>
                  </button>
                )}
                {/* 匯出 CSV */}
                {onExportCsv && (
                  <button
                    className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
                    onClick={() => { onExportCsv(); setShowExportDropdown(false); }}
                  >
                    <div className="mt-[2px] shrink-0">
                      {/* FileText icon (blue) */}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-[2px] min-w-0">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
                        匯出 CSV
                      </p>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">
                        依列表顯示欄位匯出 .csv 格式
                      </p>
                    </div>
                  </button>
                )}
                {/* 下載變更檔案 */}
                {onExportScheduleChange && (
                  <button
                    className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
                    onClick={() => { onExportScheduleChange(); setShowExportDropdown(false); }}
                  >
                    <div className="mt-[2px] shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005eb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-[2px] min-w-0">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
                        下載變更檔案
                      </p>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">
                        匯出生管排程變更用 .csv 檔案
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 自定義按鈕 */}
        {actionButton}
      </div>
    </div>
  );
}
