'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import {
  fetchAllSupplierMaterials,
  type MdoSupplierMaterial,
} from '../api/supplier/supplierMaterialIntroduction';
import {
  fetchMaterialCompositionsByItem,
  fetchAllEsgMaterials,
  type MdoMaterialComposition,
  type MdoEsgMaterial,
} from '../api/quality/esgMaterials';
import {
  fetchAllSupplierQuotations,
  type MdoSupplierQuotation,
} from '../api/pricing/supplierQuotations';
import { mdoList } from '../api/client';
import type { MdoSupplier } from '../api/supplier/suppliers';

/** 取得全量廠商（自動翻頁，limit 最大 100） */
async function fetchAllSuppliers(): Promise<MdoSupplier[]> {
  const PAGE_SIZE = 100;
  const first = await mdoList<MdoSupplier>('/product-master/suppliers', { page: 1, limit: PAGE_SIZE });
  const totalPages = first.pagination?.totalPages ?? 1;
  if (totalPages <= 1) return first.data;
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      mdoList<MdoSupplier>('/product-master/suppliers', { page: i + 2, limit: PAGE_SIZE }).then(r => r.data)
    )
  );
  return [...first.data, ...rest.flat()];
}

// ── 展平後的列資料型別 ─────────────────────────────────────────────────────────
interface SummaryRow {
  /** 唯一 key：quotation.id + comp.id */
  id: string;
  vendorLabel: string;   // 廠商(編號) e.g. 速聯(000100463)
  vendorCode: string;
  material: string;      // 料號（material_no）
  plant: string;         // 工廠（plant_code，來自 supplier-quotations）
  purchaseOrg: string;
  nameTw: string;
  nameCn: string;
  nameEn: string;
  /** 單位重量（待 MDO 補欄位後串接，目前為空字串） */
  unitWeight: string;
  /** 更新資訊顯示文字 */
  updateInfo: string;
}

// ── 從 rows 動態產生下拉選項 ──────────────────────────────────────────────────
function buildOptions(rows: SummaryRow[], key: 'vendorLabel' | 'purchaseOrg') {
  const unique = Array.from(new Set(rows.map(r => r[key]))).sort();
  return [
    { value: '', label: '全部' },
    ...unique.map(v => ({ value: v, label: v })),
  ];
}

// ── 格式化時間戳 ─────────────────────────────────────────────────────────────
function formatTs(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EsgMaterialSummaryPageProps {
  userRole?: string;
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export default function EsgMaterialSummaryPage({
  userRole: _userRole = 'giant',
}: EsgMaterialSummaryPageProps) {
  // ── 非同步資料 state ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [allRows, setAllRows] = useState<SummaryRow[]>([]);

  // ── 篩選 state ────────────────────────────────────────────────────────────
  const [vendorFilter,   setVendorFilter]   = useState('');
  const [purchaseFilter, setPurchaseFilter] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [nameSearch,     setNameSearch]     = useState('');

  // ── 資料載入 ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 並行取得全量資料
      // 主軸改為 supplier-quotations（含 plant_code、supplier_no、material_no、purchase_org）
      const [quotations, supplierMaterials, suppliers, esgMaterials] = await Promise.all([
        fetchAllSupplierQuotations(),
        fetchAllSupplierMaterials(),
        fetchAllSuppliers(),
        fetchAllEsgMaterials(),
      ]);

      // 2. 建立查找 map
      // supplier_no → supplier name
      const supplierNameMap = new Map<string, string>(
        suppliers.map(s => [s.supplier_no, s.name ?? s.fullname_chinese ?? s.supplier_no])
      );

      // (supplier_no + material_no) → MdoSupplierMaterial（取得 material_id = item_id）
      const smByKey = new Map<string, MdoSupplierMaterial>();
      for (const sm of supplierMaterials) {
        smByKey.set(`${sm.supplier_no}::${sm.material_no}`, sm);
      }

      // esg_material.id → MdoEsgMaterial
      const esgMap = new Map<string, MdoEsgMaterial>(
        esgMaterials.map(m => [m.id, m])
      );

      // 3. 去重收集所有 item_id（透過 supplier_no + material_no 對應）
      const itemIdSet = new Set<string>();
      for (const q of quotations) {
        if (q.is_deleted) continue;
        const sm = smByKey.get(`${q.supplier_no}::${q.material_no}`);
        if (sm?.material_id) itemIdSet.add(sm.material_id);
      }

      // 4. 並行查詢所有 item 的 material-compositions
      const itemIds = Array.from(itemIdSet);
      const compositionResults = await Promise.all(
        itemIds.map(itemId =>
          fetchMaterialCompositionsByItem(itemId).then(comps => ({ itemId, comps }))
        )
      );
      // item_id → composition[]（過濾軟刪除）
      const compByItemId = new Map<string, MdoMaterialComposition[]>();
      for (const { itemId, comps } of compositionResults) {
        compByItemId.set(itemId, comps.filter(c => !c.is_deleted));
      }

      // 5. 以 quotation 為主軸展平成 SummaryRow
      // 同一 supplier_no + material_no 可能有多筆報價（不同品牌），避免重複建立成分列
      // 策略：以 (supplier_no + material_no) 為單位，只展開成分一次（取第一筆報價的 plant_code）
      const seenKey = new Set<string>(); // 避免 (supplier_no + material_no) 重複
      const rows: SummaryRow[] = [];

      // 先依 supplier_no + material_no 整理出代表性報價（去重）
      const representativeQuote = new Map<string, MdoSupplierQuotation>();
      for (const q of quotations) {
        if (q.is_deleted) continue;
        const key = `${q.supplier_no}::${q.material_no}`;
        if (!representativeQuote.has(key)) {
          representativeQuote.set(key, q);
        }
      }

      for (const [key, q] of representativeQuote) {
        if (seenKey.has(key)) continue;
        seenKey.add(key);

        const sm = smByKey.get(key);
        if (!sm?.material_id) continue;

        const comps = compByItemId.get(sm.material_id) ?? [];
        if (comps.length === 0) continue; // 無成分資料就跳過

        const vendorName = supplierNameMap.get(q.supplier_no) ?? '';
        const vendorLabel = vendorName
          ? `${vendorName}(${q.supplier_no})`
          : q.supplier_no;

        for (const comp of comps) {
          const esg = esgMap.get(comp.esg_material_id);
          const nameTw = esg?.name_tw ?? comp.name_tw ?? '';
          const nameCn = esg?.name_cn ?? comp.name_cn ?? '';
          const nameEn = esg?.name_en ?? comp.name_en ?? '';

          const displayBy   = comp.updated_by ?? comp.created_by ?? '';
          const displayDate = comp.updated_at  ?? comp.created_at;

          rows.push({
            id:          `${q.id}_${comp.id}`,
            vendorLabel,
            vendorCode:  q.supplier_no,
            material:    q.material_no,
            plant:       q.plant_code,          // ✅ 來自 supplier-quotations
            purchaseOrg: q.purchase_org,
            nameTw,
            nameCn,
            nameEn,
            unitWeight:  '',                    // ⏸ 待 MDO 補 unit_weight 欄位後串接
            updateInfo:  `${displayBy}${displayDate ? ' — ' + formatTs(displayDate) : ''}`,
          });
        }
      }

      setAllRows(rows);
    } catch (e) {
      console.error('[EsgMaterialSummaryPage] 載入失敗:', e);
      setError(e instanceof Error ? e.message : '資料載入失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── 動態下拉選項 ──────────────────────────────────────────────────────────
  const vendorOptions   = useMemo(() => buildOptions(allRows, 'vendorLabel'),   [allRows]);
  const purchaseOptions = useMemo(() => buildOptions(allRows, 'purchaseOrg'),   [allRows]);

  // ── 篩選邏輯 ─────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let rows = allRows;
    if (vendorFilter)   rows = rows.filter(r => r.vendorLabel  === vendorFilter);
    if (purchaseFilter) rows = rows.filter(r => r.purchaseOrg  === purchaseFilter);
    if (materialSearch.trim()) {
      const kw = materialSearch.trim().toLowerCase();
      rows = rows.filter(r => r.material.toLowerCase().includes(kw));
    }
    if (nameSearch.trim()) {
      const kw = nameSearch.trim().toLowerCase();
      rows = rows.filter(r =>
        r.nameTw.toLowerCase().includes(kw) ||
        r.nameCn.toLowerCase().includes(kw) ||
        r.nameEn.toLowerCase().includes(kw),
      );
    }
    return rows;
  }, [allRows, vendorFilter, purchaseFilter, materialSearch, nameSearch]);

  // ── 序號欄 ────────────────────────────────────────────────────────────────
  type SummaryRowWithSeq = SummaryRow & { _seq: number };
  const displayData: SummaryRowWithSeq[] = useMemo(
    () => filteredData.map((r, i) => ({ ...r, _seq: i + 1 })),
    [filteredData],
  );

  // ── 欄位定義 ─────────────────────────────────────────────────────────────
  const columns: StandardColumn<SummaryRowWithSeq>[] = useMemo(
    () => [
      {
        key: '_seq',
        label: '#',
        width: 52,
        minWidth: 44,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'vendorLabel',
        label: '廠商(編號)',
        width: 180,
        minWidth: 130,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'material',
        label: '料號',
        width: 160,
        minWidth: 120,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'plant',
        label: '工廠',
        width: 90,
        minWidth: 70,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'purchaseOrg',
        label: '採購組織',
        width: 100,
        minWidth: 80,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'nameTw',
        label: '材料名',
        width: 160,
        minWidth: 110,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'nameCn',
        label: '材料名(簡體中文)',
        width: 180,
        minWidth: 130,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'nameEn',
        label: '材料名(英文)',
        width: 220,
        minWidth: 150,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'unitWeight',
        label: '單位重量',
        width: 120,
        minWidth: 90,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'updateInfo',
        label: '更新資訊',
        width: 250,
        minWidth: 180,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">
            {String(val)}
          </span>
        ),
      },
    ],
    [],
  ) as StandardColumn<SummaryRowWithSeq>[];

  // ── 渲染 ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* A. 搜尋/篩選列 */}
      <div className="shrink-0 grid grid-cols-4 gap-[16px] items-start px-[20px] py-[20px]">
        <DropdownSelect
          label="廠商(編號)"
          value={vendorFilter}
          onChange={setVendorFilter}
          options={vendorOptions}
        />
        <DropdownSelect
          label="採購組織"
          value={purchaseFilter}
          onChange={setPurchaseFilter}
          options={purchaseOptions}
        />
        <SearchField
          label="料號"
          value={materialSearch}
          onChange={setMaterialSearch}
          type="search"
        />
        <SearchField
          label="材料名"
          value={nameSearch}
          onChange={setNameSearch}
          type="search"
        />
      </div>

      {/* B. 載入中 / 錯誤狀態 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] animate-pulse">
            資料載入中…
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#ff5630] mb-[12px]">
              {error}
            </p>
            <button
              onClick={loadData}
              className="px-[16px] py-[8px] rounded-[8px] bg-[#005eb8] text-white text-[14px] font-['Public_Sans:Medium',sans-serif] hover:bg-[#003d73] transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>
      )}

      {/* C. 表格 */}
      {!loading && !error && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <StandardDataTable<SummaryRowWithSeq>
            columns={columns}
            data={displayData}
            storageKey="esg-material-summary-v2"
            showCheckbox={false}
            externalFilteredData={displayData}
            onExportCsv={() => {
              const headers = columns.filter(c => c.key !== '_seq').map(c => c.label);
              const csvRows = displayData.map(r =>
                [
                  r.vendorLabel, r.material, r.plant, r.purchaseOrg,
                  r.nameTw, r.nameCn, r.nameEn,
                  r.unitWeight, r.updateInfo,
                ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
              );
              const csv = [headers.join(','), ...csvRows].join('\n');
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = '物料成分總檔.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        </div>
      )}
    </div>
  );
}
