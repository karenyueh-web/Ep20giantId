import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { ForecastOrderRow } from './AdvancedForecastTable';
import { SearchField } from './SearchField';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';

// ── 維度定義 ─────────────────────────────────────────────────────────────────
type DimensionKey =
  | 'purchaseGroup'
  | 'purchaseOrg'
  | 'vendor'
  | 'uploadWeek'
  | 'deliveryWeek'
  | 'vendorMaterialNo'
  | 'materialNo'
  | 'productName';

interface DimensionOption {
  key: DimensionKey;
  label: string;
}

const DIMENSION_OPTIONS: DimensionOption[] = [
  { key: 'purchaseGroup',    label: '採購群組' },
  { key: 'purchaseOrg',     label: '採購組織' },
  { key: 'vendor',          label: '廠商' },
  { key: 'uploadWeek',      label: '上傳週別' },
  { key: 'deliveryWeek',    label: '交期週別' },
  { key: 'vendorMaterialNo', label: '廠商料號' },
  { key: 'materialNo',      label: '料號' },
  { key: 'productName',     label: '品名' },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface ForecastPivotOverlayProps {
  data: ForecastOrderRow[];
  onClose: () => void;
}

// ── 差異量 Cell ───────────────────────────────────────────────────────────────
function PivotDiffCell({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#118d57]">
        +{value.toLocaleString()}
      </span>
    );
  if (value < 0)
    return (
      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#ff5630]">
        {value.toLocaleString()}
      </span>
    );
  return <span className="text-[#919eab] text-[14px]">—</span>;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function ForecastPivotOverlay({ data, onClose }: ForecastPivotOverlayProps) {
  // ── 橫向拖拽捲動 ──
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── 日期篩選 ──
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  // ── 列維度勾選（預設全不勾） ──
  const [selectedDimensions, setSelectedDimensions] = useState<Set<DimensionKey>>(new Set());

  const toggleDimension = (key: DimensionKey) => {
    setSelectedDimensions(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── 維度排序（按 DIMENSION_OPTIONS 順序） ──
  const orderedDimensions = useMemo(
    () => DIMENSION_OPTIONS.filter(d => selectedDimensions.has(d.key)),
    [selectedDimensions]
  );

  // ── 樞紐計算 ──
  const pivotResult = useMemo(() => {
    // 1. 日期篩選
    const filtered = data.filter(row => {
      if (dateFrom && row.deliveryDate < dateFrom) return false;
      if (dateTo   && row.deliveryDate > dateTo)   return false;
      return true;
    });

    // 2. 取出所有不重複的 deliveryWeek，排序
    const weekSet = new Set<string>();
    filtered.forEach(r => weekSet.add(r.deliveryWeek));
    const weekCols = Array.from(weekSet).sort();

    // 3. 若沒有選任何維度，直接返回
    if (orderedDimensions.length === 0) {
      return { weekCols, groups: [] };
    }

    // 4. 分組
    const groupMap = new Map<string, { dimensions: string[]; byWeek: Map<string, { purchaseQty: number; diffQty: number }> }>();

    filtered.forEach(row => {
      const dims = orderedDimensions.map(d => String(row[d.key] ?? ''));
      const key  = dims.join('\u001f'); // 使用 unit separator 避免歧義
      if (!groupMap.has(key)) {
        groupMap.set(key, { dimensions: dims, byWeek: new Map() });
      }
      const group = groupMap.get(key)!;
      const w = row.deliveryWeek;
      const cur = group.byWeek.get(w) ?? { purchaseQty: 0, diffQty: 0 };
      group.byWeek.set(w, {
        purchaseQty: cur.purchaseQty + row.purchaseQty,
        diffQty:     cur.diffQty     + row.diffQty,
      });
    });

    const groups = Array.from(groupMap.values());
    return { weekCols, groups };
  }, [data, dateFrom, dateTo, orderedDimensions]);

  const { weekCols, groups } = pivotResult;

  // ── 下載 Excel ───────────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const dimLabels = orderedDimensions.map(d => d.label);
    // 第一列（表頭）
    const headerRow: string[] = [
      ...dimLabels,
      ...weekCols.flatMap(w => [`${w} 採購量`, `${w} 差異量`]),
      '小計 採購量',
      '小計 差異量',
    ];

    const rows: (string | number)[][] = [headerRow];

    groups.forEach(g => {
      const totalPurchase = weekCols.reduce((s, w) => s + (g.byWeek.get(w)?.purchaseQty ?? 0), 0);
      const totalDiff     = weekCols.reduce((s, w) => s + (g.byWeek.get(w)?.diffQty     ?? 0), 0);
      rows.push([
        ...g.dimensions,
        ...weekCols.flatMap(w => [
          g.byWeek.get(w)?.purchaseQty ?? 0,
          g.byWeek.get(w)?.diffQty     ?? 0,
        ]),
        totalPurchase,
        totalDiff,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '樞紐分析');
    const dateSuffix = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `預測訂單樞紐分析_${dateSuffix}.xlsx`);
  };

  // ── 表格樣式常數 ──────────────────────────────────────────────────────────────
  const headerCls =
    "font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[12px] text-[#637381] whitespace-nowrap";
  const cellCls =
    "font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] whitespace-nowrap";

  const DIM_COL_W = 160;
  const DATA_COL_W = 90;

  // ── 渲染 ─────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col">

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-[16px] h-[64px] px-[20px] border-b border-[rgba(145,158,171,0.12)]">
        {/* 返回按鈕 */}
        <button
          onClick={onClose}
          className="flex items-center gap-[8px] hover:opacity-70 transition-opacity shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 16.5L6 10l6.5-6.5"
              stroke="#1c252e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-[#637381]">
            返回
          </span>
        </button>

        {/* 標題 */}
        <p className="flex-1 font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
          預測訂單樞紐分析表
        </p>

        {/* 下載 Excel */}
        <button
          onClick={handleExportExcel}
          className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors shrink-0"
        >
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white leading-none">
            下載 Excel
          </span>
        </button>
      </div>

      {/* ── 篩選控制列 ── */}
      <div className="shrink-0 bg-[#f4f6f8] px-[20px] py-[16px] border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex items-start gap-[32px] flex-wrap">

          {/* 日期起訖 */}
          <div className="flex items-end gap-[12px] shrink-0">
            <div className="w-[200px]">
              <SearchField
                label="交期起"
                value={dateFrom}
                onChange={setDateFrom}
                type="date"
                allowPastDates
              />
            </div>
            <div className="w-[200px]">
              <SearchField
                label="交期訖"
                value={dateTo}
                onChange={setDateTo}
                type="date"
                allowPastDates
              />
            </div>
          </div>

          {/* 列維度勾選 */}
          <div className="flex items-center gap-[12px] flex-wrap min-h-[54px]">
            <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] text-[#637381] shrink-0">
              列維度：
            </span>
            {DIMENSION_OPTIONS.map(opt => (
              <label
                key={opt.key}
                className="flex items-center gap-[6px] cursor-pointer text-[14px] text-[#1c252e] font-normal whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  checked={selectedDimensions.has(opt.key)}
                  onChange={() => toggleDimension(opt.key)}
                  className="w-[16px] h-[16px] rounded-[4px] accent-[#005eb8] cursor-pointer"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── 表格區域 ── */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar${canDragScroll ? ' cursor-grab' : ''}`}
      >

        {/* 未選維度 */}
        {orderedDimensions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-[12px] py-[60px]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"
                stroke="#919eab"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#919eab]">
              請先從右側勾選至少一個列維度
            </p>
          </div>
        )}

        {/* 已選維度但無資料 */}
        {orderedDimensions.length > 0 && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-[12px] py-[60px]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="#919eab"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#919eab]">
              無符合條件的資料
            </p>
          </div>
        )}

        {/* 有資料才顯示表格 */}
        {orderedDimensions.length > 0 && groups.length > 0 && (
          <table
            className="border-collapse"
            style={{
              minWidth:
                orderedDimensions.length * DIM_COL_W +
                weekCols.length * DATA_COL_W * 2 +
                DATA_COL_W * 2 +
                'px',
            }}
          >
            {/* ── 表頭第一層 ── */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f4f6f8]">
                {/* 維度欄（空白佔位，sticky left） */}
                {orderedDimensions.map((d, i) => (
                  <th
                    key={d.key}
                    className={`${headerCls} px-[16px] py-[10px] border-b border-r border-[rgba(145,158,171,0.12)] text-left bg-[#f4f6f8]`}
                    style={{
                      width: DIM_COL_W,
                      minWidth: DIM_COL_W,
                      position: 'sticky',
                      left: i * DIM_COL_W,
                      zIndex: 15,
                      boxShadow: i === orderedDimensions.length - 1 ? '2px 0 4px -2px rgba(145,158,171,0.2)' : undefined,
                    }}
                  />
                ))}

                {/* 週別欄（每週 span 2），字體放大至 14px 讓週別清晰易讀 */}
                {weekCols.map(w => (
                  <th
                    key={w}
                    colSpan={2}
                    className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#637381] whitespace-nowrap px-[8px] py-[10px] border-b border-r border-[rgba(145,158,171,0.12)] text-center"
                    style={{ width: DATA_COL_W * 2, minWidth: DATA_COL_W * 2 }}
                  >
                    {w}
                  </th>
                ))}

                {/* 小計（span 2） */}
                <th
                  colSpan={2}
                  className={`${headerCls} px-[8px] py-[10px] border-b border-[rgba(145,158,171,0.12)] text-center bg-[#f4f6f8]`}
                  style={{
                    width: DATA_COL_W * 2,
                    minWidth: DATA_COL_W * 2,
                    position: 'sticky',
                    right: 0,
                    zIndex: 5,
                  }}
                >
                  小計
                </th>
              </tr>

              {/* ── 表頭第二層 ── */}
              <tr className="bg-[#f4f6f8]">
                {/* 維度標籤，sticky left */}
                {orderedDimensions.map((d, i) => (
                  <th
                    key={d.key}
                    className={`${headerCls} px-[16px] py-[8px] border-b border-r border-[rgba(145,158,171,0.12)] text-left bg-[#f4f6f8]`}
                    style={{
                      width: DIM_COL_W,
                      minWidth: DIM_COL_W,
                      position: 'sticky',
                      left: i * DIM_COL_W,
                      zIndex: 15,
                      boxShadow: i === orderedDimensions.length - 1 ? '2px 0 4px -2px rgba(145,158,171,0.2)' : undefined,
                    }}
                  >
                    {d.label}
                  </th>
                ))}

                {/* 每週兩個子欄 */}
                {weekCols.flatMap(w => [
                  <th
                    key={`${w}-pq`}
                    className={`${headerCls} px-[8px] py-[8px] border-b border-r border-[rgba(145,158,171,0.12)] text-right`}
                    style={{ width: DATA_COL_W, minWidth: DATA_COL_W }}
                  >
                    採購量
                  </th>,
                  <th
                    key={`${w}-dq`}
                    className={`${headerCls} px-[8px] py-[8px] border-b border-r border-[rgba(145,158,171,0.12)] text-right`}
                    style={{ width: DATA_COL_W, minWidth: DATA_COL_W }}
                  >
                    差異量
                  </th>,
                ])}

                {/* 小計子欄 */}
                <th
                  className={`${headerCls} px-[8px] py-[8px] border-b border-r border-[rgba(145,158,171,0.12)] text-right bg-[#f4f6f8]`}
                  style={{
                    width: DATA_COL_W,
                    minWidth: DATA_COL_W,
                    position: 'sticky',
                    right: DATA_COL_W,
                    zIndex: 5,
                  }}
                >
                  採購量
                </th>
                <th
                  className={`${headerCls} px-[8px] py-[8px] border-b border-[rgba(145,158,171,0.12)] text-right bg-[#f4f6f8]`}
                  style={{
                    width: DATA_COL_W,
                    minWidth: DATA_COL_W,
                    position: 'sticky',
                    right: 0,
                    zIndex: 5,
                  }}
                >
                  差異量
                </th>
              </tr>
            </thead>

            {/* ── 資料列 ── */}
            <tbody>
              {groups.map((g, gi) => {
                const totalPurchase = weekCols.reduce(
                  (s, w) => s + (g.byWeek.get(w)?.purchaseQty ?? 0),
                  0
                );
                const totalDiff = weekCols.reduce(
                  (s, w) => s + (g.byWeek.get(w)?.diffQty ?? 0),
                  0
                );
                return (
                  <tr
                    key={gi}
                    className="border-b border-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.04)] transition-colors"
                  >
                    {/* 維度值，sticky left（白色背景，避免捲動時透出後方資料） */}
                    {g.dimensions.map((val, di) => (
                      <td
                        key={di}
                        className={`${cellCls} px-[16px] py-[12px] border-r border-[rgba(145,158,171,0.08)] bg-white`}
                        style={{
                          width: DIM_COL_W,
                          minWidth: DIM_COL_W,
                          position: 'sticky',
                          left: di * DIM_COL_W,
                          zIndex: 3,
                          boxShadow: di === orderedDimensions.length - 1 ? '2px 0 4px -2px rgba(145,158,171,0.16)' : undefined,
                        }}
                      >
                        {val}
                      </td>
                    ))}

                    {/* 週別資料 */}
                    {weekCols.flatMap(w => {
                      const cell = g.byWeek.get(w);
                      return [
                        <td
                          key={`${w}-pq`}
                          className={`${cellCls} px-[8px] py-[12px] text-right border-r border-[rgba(145,158,171,0.08)]`}
                          style={{ width: DATA_COL_W, minWidth: DATA_COL_W }}
                        >
                          {cell ? cell.purchaseQty.toLocaleString() : '—'}
                        </td>,
                        <td
                          key={`${w}-dq`}
                          className="px-[8px] py-[12px] text-right border-r border-[rgba(145,158,171,0.08)]"
                          style={{ width: DATA_COL_W, minWidth: DATA_COL_W }}
                        >
                          {cell ? <PivotDiffCell value={cell.diffQty} /> : <span className="text-[#919eab] text-[14px]">—</span>}
                        </td>,
                      ];
                    })}

                    {/* 小計 */}
                    <td
                      className={`${cellCls} px-[8px] py-[12px] text-right border-r border-[rgba(145,158,171,0.08)] bg-[#f4f6f8]`}
                      style={{
                        width: DATA_COL_W,
                        minWidth: DATA_COL_W,
                        position: 'sticky',
                        right: DATA_COL_W,
                        zIndex: 5,
                      }}
                    >
                      {totalPurchase.toLocaleString()}
                    </td>
                    <td
                      className="px-[8px] py-[12px] text-right bg-[#f4f6f8]"
                      style={{
                        width: DATA_COL_W,
                        minWidth: DATA_COL_W,
                        position: 'sticky',
                        right: 0,
                        zIndex: 5,
                      }}
                    >
                      <PivotDiffCell value={totalDiff} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
