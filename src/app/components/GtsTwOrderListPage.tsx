'use client';

/**
 * GtsTwOrderListPage — 出貨台灣捷安特「訂單查詢」頁面
 *
 * 功能：
 * - 搜尋列：訂單編號、廠商簡稱(編號)、料號（3 欄平均欄寬）
 * - 表格欄位：訂單編號、廠商簡稱(編號)、料號、數量、單位、廠商料號、採購數量、採購單位
 * - 使用 StandardDataTable
 * - Mock AX 訂單資料（待中台 API 串接後替換）
 */

import { useState, useMemo, useCallback } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';

// ── 資料型別 ────────────────────────────────────────────────────────────────
interface GtsTwOrderRow {
  id: number;
  orderNo: string;
  vendorDisplay: string;
  materialNo: string;
  qty: number;
  unit: string;
  vendorMaterialNo: string;
  purchaseQty: number;
  purchaseUnit: string;
}

// ── Mock 資料（模擬 AX 訂單，待中台 API 串接後替換） ──────────────────────
const MOCK_GTS_ORDERS: GtsTwOrderRow[] = [
  { id: 1,  orderNo: 'AX-2026-00001', vendorDisplay: '台灣欣欣(124003)',  materialNo: '4300544', qty: 100, unit: 'PCE', vendorMaterialNo: 'EMA-TF412930S-ACCB', purchaseQty: 100, purchaseUnit: 'PCE' },
  { id: 2,  orderNo: 'AX-2026-00002', vendorDisplay: '捷昇工業(124010)',  materialNo: '5290019', qty: 200, unit: 'SET', vendorMaterialNo: 'JW11-SHSBXX11S',     purchaseQty: 200, purchaseUnit: 'SET' },
  { id: 3,  orderNo: 'AX-2026-00003', vendorDisplay: '台灣欣欣(124003)',  materialNo: '3180022', qty: 50,  unit: 'PCE', vendorMaterialNo: 'EMA-BB95-ACCB',       purchaseQty: 50,  purchaseUnit: 'PCE' },
  { id: 4,  orderNo: 'AX-2026-00004', vendorDisplay: '日本島野(126001)',  materialNo: '4100087', qty: 300, unit: 'PCE', vendorMaterialNo: 'SM-CN120-HG',         purchaseQty: 300, purchaseUnit: 'PCE' },
  { id: 5,  orderNo: 'AX-2026-00005', vendorDisplay: '捷昇工業(124010)',  materialNo: '5290031', qty: 150, unit: 'SET', vendorMaterialNo: 'JW11-SHSBXX12S',     purchaseQty: 150, purchaseUnit: 'SET' },
  { id: 6,  orderNo: 'AX-2026-00006', vendorDisplay: '日本島野(126001)',  materialNo: '4100090', qty: 500, unit: 'PCE', vendorMaterialNo: 'SM-CN120-IG',         purchaseQty: 500, purchaseUnit: 'PCE' },
  { id: 7,  orderNo: 'AX-2026-00007', vendorDisplay: '台灣欣欣(124003)',  materialNo: '3180030', qty: 80,  unit: 'PCE', vendorMaterialNo: 'EMA-BB95-SS',         purchaseQty: 80,  purchaseUnit: 'PCE' },
  { id: 8,  orderNo: 'AX-2026-00008', vendorDisplay: '力致科技(128005)',  materialNo: '4521100', qty: 60,  unit: 'EA',  vendorMaterialNo: 'LC-BLS-E1-BLK',      purchaseQty: 60,  purchaseUnit: 'EA'  },
  { id: 9,  orderNo: 'AX-2026-00009', vendorDisplay: '力致科技(128005)',  materialNo: '4521105', qty: 120, unit: 'EA',  vendorMaterialNo: 'LC-BLS-E1-RED',      purchaseQty: 120, purchaseUnit: 'EA'  },
  { id: 10, orderNo: 'AX-2026-00010', vendorDisplay: '捷昇工業(124010)',  materialNo: '5290045', qty: 200, unit: 'SET', vendorMaterialNo: 'JW11-SHSBXX13S',     purchaseQty: 200, purchaseUnit: 'SET' },
];

// ── 欄位定義 ────────────────────────────────────────────────────────────────
const COLUMNS: StandardColumn<GtsTwOrderRow>[] = [
  { key: 'orderNo',          label: '訂單編號',       width: 180, minWidth: 130 },
  { key: 'vendorDisplay',    label: '廠商簡稱(編號)', width: 180, minWidth: 130 },
  { key: 'materialNo',       label: '料號',            width: 140, minWidth: 100 },
  { key: 'qty',              label: '數量',            width: 100, minWidth: 80  },
  { key: 'unit',             label: '單位',            width: 90,  minWidth: 70  },
  { key: 'vendorMaterialNo', label: '廠商料號',        width: 220, minWidth: 140 },
];

// ── 主元件 ──────────────────────────────────────────────────────────────────
export default function GtsTwOrderListPage() {
  const [filterOrderNo,   setFilterOrderNo]   = useState('');
  const [filterVendor,    setFilterVendor]    = useState('');
  const [filterMaterial,  setFilterMaterial]  = useState('');

  const filteredData = useMemo(() => {
    let data = MOCK_GTS_ORDERS;
    if (filterOrderNo.trim()) {
      const kw = filterOrderNo.trim().toLowerCase();
      data = data.filter(r => r.orderNo.toLowerCase().includes(kw));
    }
    if (filterVendor.trim()) {
      const kw = filterVendor.trim().toLowerCase();
      data = data.filter(r => r.vendorDisplay.toLowerCase().includes(kw));
    }
    if (filterMaterial.trim()) {
      const kw = filterMaterial.trim().toLowerCase();
      data = data.filter(r =>
        r.materialNo.toLowerCase().includes(kw) ||
        r.vendorMaterialNo.toLowerCase().includes(kw)
      );
    }
    return data;
  }, [filterOrderNo, filterVendor, filterMaterial]);

  const handleExportCsv = useCallback(() => {
    const headers = COLUMNS.map(c => c.label).join(',');
    const rows = filteredData.map(r =>
      [r.orderNo, r.vendorDisplay, r.materialNo, r.qty, r.unit, r.vendorMaterialNo, r.purchaseQty, r.purchaseUnit].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gts_orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 搜尋列 ── */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="訂單編號"
            value={filterOrderNo}
            onChange={setFilterOrderNo}
            type="search"
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商簡稱(編號)"
            value={filterVendor}
            onChange={setFilterVendor}
            type="search"
            placeholder="廠商名稱或 AX 編號"
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={filterMaterial}
            onChange={setFilterMaterial}
            type="search"
          />
        </div>
      </div>

      {/* ── StandardDataTable ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<GtsTwOrderRow>
          columns={COLUMNS}
          data={filteredData}
          storageKey="gts-tw-order-v2"
          showCheckbox={false}
          onExportCsv={handleExportCsv}
          className="rounded-none shadow-none"
        />
      </div>
    </div>
  );
}

