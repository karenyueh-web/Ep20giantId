'use client';

import { useState, useMemo } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import {
  getParts,
  type PartRecord,
  type MaterialComposition,
} from './partsMaintenanceData';
import { getEsgMaterials } from './esgMaterialData';

// ── 展平後的列資料型別 ─────────────────────────────────────────────────────────
interface SummaryRow {
  /** 唯一 key：料號 + 成分 ID */
  id: string;
  vendorLabel: string;   // 廠商(編號) e.g. 速聯(000100463)
  vendorCode: string;
  material: string;
  plant: string;
  purchaseOrg: string;
  nameTw: string;
  nameCn: string;
  nameEn: string;
  carbonEmission: number;
  /** 更新資訊顯示文字 */
  updateInfo: string;
}

// ── 將 parts store 展平 ───────────────────────────────────────────────────────
function buildSummaryRows(): SummaryRow[] {
  const esgMap = new Map(getEsgMaterials().map(m => [m.id, m]));
  const rows: SummaryRow[] = [];

  for (const part of getParts()) {
    if (!part.materialCompositions?.length) continue;
    for (const mc of part.materialCompositions) {
      // 即時參照 ESG 材料主檔（材料名與炭排量優先從 master data 取）
      const esg = esgMap.get(mc.esgMaterialId);
      const displayBy   = mc.updatedBy  ?? mc.createdBy;
      const displayDate = mc.updatedAt  ?? mc.createdAt;
      rows.push({
        id:             `${part.id}_${mc.id}`,
        vendorLabel:    `${part.vendorName}(${part.vendorCode})`,
        vendorCode:     part.vendorCode,
        material:       part.material,
        plant:          part.plant,
        purchaseOrg:    part.purchaseOrg,
        nameTw:         esg?.nameTw  ?? mc.nameTw,
        nameCn:         esg?.nameCn  ?? mc.nameCn,
        nameEn:         esg?.nameEn  ?? mc.nameEn,
        carbonEmission: esg?.carbonEmission ?? mc.carbonEmission,
        updateInfo:     `${displayBy} — ${displayDate}`,
      });
    }
  }
  return rows;
}

// ── 從 rows 動態產生下拉選項 ──────────────────────────────────────────────────
function buildOptions(rows: SummaryRow[], key: 'vendorLabel' | 'purchaseOrg') {
  const unique = Array.from(new Set(rows.map(r => r[key]))).sort();
  return [
    { value: '', label: '全部' },
    ...unique.map(v => ({ value: v, label: v })),
  ];
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EsgMaterialSummaryPageProps {
  userRole?: string;
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export default function EsgMaterialSummaryPage({
  userRole: _userRole = 'giant',
}: EsgMaterialSummaryPageProps) {
  // 每次渲染時重新讀取（使資料與零件頁同步）
  const allRows = useMemo(() => buildSummaryRows(), []);

  // ── 篩選 state ────────────────────────────────────────────────────────────
  const [vendorFilter,   setVendorFilter]   = useState('');
  const [purchaseFilter, setPurchaseFilter] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [nameSearch,     setNameSearch]     = useState('');

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
        key: 'carbonEmission',
        label: '炭排量(kg CO₂e)',
        width: 150,
        minWidth: 110,
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
        {/* 廠商(編號) 下拉 */}
        <DropdownSelect
          label="廠商(編號)"
          value={vendorFilter}
          onChange={setVendorFilter}
          options={vendorOptions}
        />

        {/* 採購組織 下拉 */}
        <DropdownSelect
          label="採購組織"
          value={purchaseFilter}
          onChange={setPurchaseFilter}
          options={purchaseOptions}
        />

        {/* 料號 搜尋 */}
        <SearchField
          label="料號"
          value={materialSearch}
          onChange={setMaterialSearch}
          type="search"
        />

        {/* 材料名 搜尋（繁中/簡中/英） */}
        <SearchField
          label="材料名"
          value={nameSearch}
          onChange={setNameSearch}
          type="search"
        />
      </div>


      {/* B. 表格（唯讀，無新增按鈕） */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<SummaryRowWithSeq>
          columns={columns}
          data={displayData}
          storageKey="esg-material-summary-v1"
          showCheckbox={false}
          externalFilteredData={displayData}
          onExportCsv={() => {
            const headers = columns.filter(c => c.key !== '_seq').map(c => c.label);
            const csvRows = displayData.map(r =>
              [
                r.vendorLabel, r.material, r.plant, r.purchaseOrg,
                r.nameTw, r.nameCn, r.nameEn,
                String(r.carbonEmission), r.updateInfo,
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
    </div>
  );
}
