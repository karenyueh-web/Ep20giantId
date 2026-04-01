/**
 * ShippingBasicSettingsPage — 出貨單 • 基本設定
 *
 * 三個 Tab 分頁：
 *  1. 儲存地點主檔
 *  2. GTM儲存條件設定
 *  3. GEM目的地設定
 *
 * 使用標準表格系統（StandardDataTable）
 */

import { useState, useMemo } from 'react';
import { ActionCellButtons } from './ActionButtons';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';


// ─────────────────────────────────────────────────────────────────────────────
// 共用 CSV 匯出工具
// ─────────────────────────────────────────────────────────────────────────────
function exportRowsToCsv<T>(
  rows: T[],
  filename: string,
  fields: { key: keyof T & string; label: string }[]
) {
  const header = fields.map(f => `"${f.label}"`).join(',');
  const body = rows.map(row =>
    fields.map(f => `"${String((row[f.key] as unknown) ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csv = `\uFEFF${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// 型別定義
// ─────────────────────────────────────────────────────────────────────────────

/** Tab1：儲存地點主檔 */
interface StorageLocationRow {
  id: number;
  factory: string;          // 工廠
  locationCode: string;     // 儲存地點代號
  descZh: string;           // 地點描述(中)
  descEn: string;           // 地點描述(英)
  addressZh: string;        // 地址(中)
  addressEn: string;        // 地址(英)
  updatedInfo: string;      // 更新資訊
}

/** Tab2：GTM儲存條件設定 */
interface GtmStorageConditionRow {
  id: number;
  locationCode: string;     // 儲存地點代號
  conditionCode: string;    // 儲存條件代號
  factory: string;          // 工廠
  address: string;          // 地址
  updatedInfo: string;      // 更新資訊
}

/** Tab3：GEM目的地設定 */
interface GemDestinationRow {
  id: number;
  purchaseOrg: string;      // 採購組織
  transportType: string;    // 運輸型態
  destination: string;      // 目的地
  updatedInfo: string;      // 更新資訊
}

type ActiveTab = 'storage-location' | 'gtm-storage-condition' | 'gem-destination';

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_LOCATION_DATA: StorageLocationRow[] = [
  {
    id: 1, factory: 'GTM1', locationCode: '2610',
    descZh: 'GI 物流內倉-保稅(WM)', descEn: 'GI (WM)-GB',
    addressZh: '台中市大甲區中山路2段901號', addressEn: '901, Sec. 2, Zhongshan Rd.',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 2, factory: 'GTM1', locationCode: '2620',
    descZh: 'GI 外倉-京揚', descEn: 'GI-Eite WH',
    addressZh: '台中市梧棲區中橫10路100號', addressEn: '100, Zhongheng 10th Rd.',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 3, factory: 'GTM1', locationCode: '2630',
    descZh: 'GI 外倉-KY', descEn: 'GI-KY',
    addressZh: '中國深圳市鹽田區鹽田港保稅區',  addressEn: 'Yantian Bonded Area, Shenzhen',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 4, factory: 'GTM2', locationCode: '2640',
    descZh: 'GI 外倉-歐倉', descEn: 'GI-EU WH',
    addressZh: '荷蘭鹿特丹港口區', addressEn: 'Port of Rotterdam, Netherlands',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 5, factory: 'GTM2', locationCode: '2650',
    descZh: 'GI 物流內倉-一般', descEn: 'GI (General)-WH',
    addressZh: '台中市大甲區順帆路19號', addressEn: '19, Shunfan Rd., Dajia Dist.',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 6, factory: 'GTM2', locationCode: '2660',
    descZh: 'GI 備品倉', descEn: 'GI-Spare Parts WH',
    addressZh: '台中市大甲區中山路3段100號', addressEn: '100, Sec. 3, Zhongshan Rd.',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
];

const GTM_STORAGE_CONDITION_DATA: GtmStorageConditionRow[] = [
  {
    id: 1, locationCode: '1020', conditionCode: 'Z1',
    factory: 'GTM1', address: '台中市大甲區順帆路19號-南倉',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 2, locationCode: '1020', conditionCode: 'Z2',
    factory: 'GTM1', address: '台中市大甲區順帆路19號-東倉',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 3, locationCode: '1020', conditionCode: 'Z3',
    factory: 'GTM1', address: '台中市大甲區順帆路19號-輪組倉',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 4, locationCode: '1030', conditionCode: 'Z1',
    factory: 'GTM1', address: '台中市大甲區順帆路19號-主廠',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 5, locationCode: '1030', conditionCode: 'Z2',
    factory: 'GTM1', address: '台中市大甲區順帆路19號-附廠',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
  {
    id: 6, locationCode: '2010', conditionCode: 'A',
    factory: 'GTM2', address: '台中市梧棲區中橫10路100號',
    updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20',
  },
];

const GEM_DESTINATION_DATA: GemDestinationRow[] = [
  { id: 1, purchaseOrg: '4111', transportType: 'A', destination: 'AMSTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 2, purchaseOrg: '4111', transportType: 'S', destination: 'ROTTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 3, purchaseOrg: '4111', transportType: 'Z1', destination: 'ROTTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 4, purchaseOrg: '4111', transportType: 'Z2', destination: 'AMSTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 5, purchaseOrg: '4121', transportType: 'A', destination: 'AMSTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 6, purchaseOrg: '4121', transportType: 'S', destination: 'ROTTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 7, purchaseOrg: '4131', transportType: 'A', destination: 'HAMBURG', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 8, purchaseOrg: '4131', transportType: 'Z1', destination: 'HAMBURG', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tab Item
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 whitespace-nowrap ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 通用刪除確認 Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}
function DeleteConfirmDialog({ open, description, onConfirm, onClose }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-[#1c252e]">確認刪除</DialogTitle>
        </DialogHeader>
        <p className="text-[14px] text-[#637381] mt-[4px]">{description}</p>
        <DialogFooter className="mt-[16px] flex gap-[8px] justify-end">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>刪除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// 新增/編輯 Overlay（依示意圖設計）
// ────────────────────────────────────────────────────────────────────────────────

const inputCls = 'w-full h-[48px] border border-[rgba(145,158,171,0.32)] rounded-[8px] px-[14px] text-[14px] text-[#1c252e] outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] transition-colors bg-white placeholder:text-[#c4cdd6]';
const selectCls = 'w-full h-[48px] border border-[rgba(145,158,171,0.32)] rounded-[8px] px-[14px] pr-[40px] text-[14px] text-[#1c252e] outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] transition-colors bg-white appearance-none cursor-pointer';

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[16px]">
      <span className="text-[14px] text-[#637381] shrink-0 w-[90px]">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SelectRow({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <FormRow label={label}>
      <div className="relative">
        <select className={selectCls} value={value} onChange={e => onChange(e.target.value)}>
          <option value="">請選擇</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </FormRow>
  );
}

interface AddEditOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
  children: React.ReactNode;
}
function AddEditOverlay({ open, onClose, title, onSubmit, submitLabel = '新增', disabled, children }: AddEditOverlayProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[24px] w-[560px] max-w-[90vw] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] overflow-hidden">
        <div className="px-[40px] pt-[28px] pb-[36px]">
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="size-[28px] bg-[#455a64] rounded-full flex items-center justify-center hover:bg-[#37474f] transition-colors mb-[16px]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* 標題 */}
          <h2 className="text-[20px] font-bold text-[#1c252e] mb-[20px]">{title}</h2>
          {/* 分隔線 */}
          <div className="border-t border-[rgba(145,158,171,0.2)] mb-[28px]" />
          {/* 表單欄位 */}
          <div className="flex flex-col gap-[20px]">{children}</div>
          {/* 提交按鈕 */}
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="mt-[32px] w-full h-[48px] bg-[#1B3F7C] hover:bg-[#15326a] disabled:opacity-40 disabled:cursor-not-allowed rounded-[8px] text-white text-[15px] font-bold tracking-widest transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1：儲存地點主檔
// ─────────────────────────────────────────────────────────────────────────────

function StorageLocationTab() {
  const [data, setData] = useState<StorageLocationRow[]>(STORAGE_LOCATION_DATA);
  const [searchFactory, setSearchFactory]         = useState('');
  const [searchLocationCode, setSearchLocationCode] = useState('');
  const [searchAddress, setSearchAddress]         = useState('');

  // Dialog 狀態
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editRow, setEditRow]         = useState<StorageLocationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorageLocationRow | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  // 表單欄位
  const [form, setForm] = useState<Omit<StorageLocationRow, 'id' | 'updatedInfo'>>({
    factory: '', locationCode: '', descZh: '', descEn: '', addressZh: '', addressEn: '',
  });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const openCreate = () => {
    setEditRow(null);
    setForm({ factory: '', locationCode: '', descZh: '', descEn: '', addressZh: '', addressEn: '' });
    setDialogOpen(true);
  };
  const openEdit = (row: StorageLocationRow) => {
    setEditRow(row);
    setForm({ factory: row.factory, locationCode: row.locationCode, descZh: row.descZh, descEn: row.descEn, addressZh: row.addressZh, addressEn: row.addressEn });
    setDialogOpen(true);
  };
  const handleSave = () => {
    const now = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    if (editRow) {
      setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form, updatedInfo: `系統 -${now}` } : r));
      showToast('儲存地點資料已更新');
    } else {
      const newId = Math.max(...data.map(r => r.id), 0) + 1;
      setData(prev => [...prev, { id: newId, ...form, updatedInfo: `系統 -${now}` }]);
      showToast('儲存地點已新增');
    }
    setDialogOpen(false);
  };
  const handleDelete = (row: StorageLocationRow) => {
    setData(prev => prev.filter(r => r.id !== row.id));
    showToast(`儲存地點 ${row.locationCode} 已刪除`);
  };

  // 搜尋過濾
  const filteredData = useMemo(() => {
    let result = data;
    if (searchFactory.trim())       result = result.filter(r => r.factory.toLowerCase().includes(searchFactory.trim().toLowerCase()));
    if (searchLocationCode.trim())  result = result.filter(r => r.locationCode.toLowerCase().includes(searchLocationCode.trim().toLowerCase()));
    if (searchAddress.trim())       result = result.filter(r => (r.addressZh + r.addressEn).toLowerCase().includes(searchAddress.trim().toLowerCase()));
    return result;
  }, [data, searchFactory, searchLocationCode, searchAddress]);

  const COLUMNS: StandardColumn<StorageLocationRow>[] = [
    { key: 'factory',      label: '工廠',         width: 100,  minWidth: 80  },
    { key: 'locationCode', label: '儲存地點代號', width: 140,  minWidth: 100 },
    { key: 'descZh',       label: '地點描述(中)', width: 200,  minWidth: 140 },
    { key: 'descEn',       label: '地點描述(英)', width: 200,  minWidth: 140 },
    { key: 'addressZh',    label: '地址(中)',      width: 220,  minWidth: 140 },
    { key: 'addressEn',    label: '地址(英)',      width: 220,  minWidth: 140 },
    { key: 'updatedInfo',  label: '更新資訊',     width: 220,  minWidth: 160 },
    {
      key: 'id', label: '', width: 110, minWidth: 110, required: true,
      renderCell: (_val, row) => (
        <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <SearchField label="工廠"         value={searchFactory}      onChange={setSearchFactory} />
        <SearchField label="儲存地點代號" value={searchLocationCode} onChange={setSearchLocationCode} />
        <SearchField label="地址"         value={searchAddress}      onChange={setSearchAddress} />
      </div>

      {/* 標準表格 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<StorageLocationRow>
          columns={COLUMNS}
          data={data}
          storageKey="shipping-settings-storage-location-v2"
          externalFilteredData={filteredData}
          showCheckbox={false}
          onExportCsv={() => exportRowsToCsv(filteredData, '儲存地點主檔.csv', [
            { key: 'factory',      label: '工廠' },
            { key: 'locationCode', label: '儲存地點代號' },
            { key: 'descZh',       label: '地點描述(中)' },
            { key: 'descEn',       label: '地點描述(英)' },
            { key: 'addressZh',    label: '地址(中)' },
            { key: 'addressEn',    label: '地址(英)' },
            { key: 'updatedInfo',  label: '更新資訊' },
          ])}
          actionButton={
            <Button
              className="h-[36px] bg-[#1c252e] text-white hover:bg-[#374151] rounded-[8px] px-[16px] text-[14px] font-semibold"
              onClick={openCreate}
            >
              新增
            </Button>
          }
        />
      </div>

      {/* 新增/編輯 Overlay */}
      <AddEditOverlay
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editRow ? '編輯儲存地點主檔' : '新增儲存地點主檔'}
        onSubmit={handleSave}
        submitLabel={editRow ? '儲存' : '新增'}
        disabled={!form.factory.trim() || !form.locationCode.trim()}
      >
        <SelectRow label="工廠" value={form.factory} onChange={v => setForm(f => ({ ...f, factory: v }))}
          options={[{ value: 'GTM1', label: 'GTM1' }, { value: 'GTM2', label: 'GTM2' }, { value: 'GEM1', label: 'GEM1' }, { value: 'GEM2', label: 'GEM2' }]}
        />
        <FormRow label="儲存地點代號">
          <input className={inputCls} value={form.locationCode} onChange={e => setForm(f => ({ ...f, locationCode: e.target.value }))} placeholder="如: 2610" />
        </FormRow>
        <FormRow label="地點描述(中)">
          <input className={inputCls} value={form.descZh} onChange={e => setForm(f => ({ ...f, descZh: e.target.value }))} placeholder="中文描述" />
        </FormRow>
        <FormRow label="地點描述(英)">
          <input className={inputCls} value={form.descEn} onChange={e => setForm(f => ({ ...f, descEn: e.target.value }))} placeholder="English description" />
        </FormRow>
        <FormRow label="地址(中)">
          <input className={inputCls} value={form.addressZh} onChange={e => setForm(f => ({ ...f, addressZh: e.target.value }))} placeholder="中文地址" />
        </FormRow>
        <FormRow label="地址(英)">
          <input className={inputCls} value={form.addressEn} onChange={e => setForm(f => ({ ...f, addressEn: e.target.value }))} placeholder="English address" />
        </FormRow>
      </AddEditOverlay>

      {/* 刪除確認 */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        description={`確定要刪除儲存地點「${deleteTarget?.locationCode} - ${deleteTarget?.descZh}」嗎？此操作無法復原。`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2：GTM儲存條件設定
// ─────────────────────────────────────────────────────────────────────────────

function GtmStorageConditionTab() {
  const [data, setData] = useState<GtmStorageConditionRow[]>(GTM_STORAGE_CONDITION_DATA);
  const [searchLocation, setSearchLocation]   = useState('');
  const [searchCondition, setSearchCondition] = useState('');
  const [searchAddress, setSearchAddress]     = useState('');

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editRow, setEditRow]           = useState<GtmStorageConditionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GtmStorageConditionRow | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  const [form, setForm] = useState<Omit<GtmStorageConditionRow, 'id' | 'updatedInfo'>>({
    locationCode: '', conditionCode: '', factory: '', address: '',
  });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const openCreate = () => {
    setEditRow(null);
    setForm({ locationCode: '', conditionCode: '', factory: '', address: '' });
    setDialogOpen(true);
  };
  const openEdit = (row: GtmStorageConditionRow) => {
    setEditRow(row);
    setForm({ locationCode: row.locationCode, conditionCode: row.conditionCode, factory: row.factory, address: row.address });
    setDialogOpen(true);
  };
  const handleSave = () => {
    const now = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    if (editRow) {
      setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form, updatedInfo: `系統 -${now}` } : r));
      showToast('GTM儲存條件已更新');
    } else {
      const newId = Math.max(...data.map(r => r.id), 0) + 1;
      setData(prev => [...prev, { id: newId, ...form, updatedInfo: `系統 -${now}` }]);
      showToast('GTM儲存條件已新增');
    }
    setDialogOpen(false);
  };
  const handleDelete = (row: GtmStorageConditionRow) => {
    setData(prev => prev.filter(r => r.id !== row.id));
    showToast(`儲存條件 ${row.locationCode}-${row.conditionCode} 已刪除`);
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (searchLocation.trim())  result = result.filter(r => r.locationCode.toLowerCase().includes(searchLocation.trim().toLowerCase()));
    if (searchCondition.trim()) result = result.filter(r => r.conditionCode.toLowerCase().includes(searchCondition.trim().toLowerCase()));
    if (searchAddress.trim())   result = result.filter(r => r.address.toLowerCase().includes(searchAddress.trim().toLowerCase()));
    return result;
  }, [data, searchLocation, searchCondition, searchAddress]);

  const COLUMNS: StandardColumn<GtmStorageConditionRow>[] = [
    { key: 'locationCode',  label: '儲存地點代號', width: 160,  minWidth: 120 },
    { key: 'conditionCode', label: '儲存條件代號', width: 160,  minWidth: 120 },
    { key: 'factory',       label: '工廠',          width: 120,  minWidth: 80  },
    { key: 'address',       label: '地址',           width: 300,  minWidth: 180 },
    { key: 'updatedInfo',   label: '更新資訊',      width: 240,  minWidth: 160 },
    {
      key: 'id', label: '', width: 110, minWidth: 110, required: true,
      renderCell: (_val, row) => (
        <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <SearchField label="儲存地點代號" value={searchLocation}  onChange={setSearchLocation} />
        <SearchField label="儲存條件代號" value={searchCondition} onChange={setSearchCondition} />
        <SearchField label="地址"         value={searchAddress}   onChange={setSearchAddress} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<GtmStorageConditionRow>
          columns={COLUMNS}
          data={data}
          storageKey="shipping-settings-gtm-condition-v2"
          externalFilteredData={filteredData}
          showCheckbox={false}
          onExportCsv={() => exportRowsToCsv(filteredData, 'GTM儲存條件設定.csv', [
            { key: 'locationCode',  label: '儲存地點代號' },
            { key: 'conditionCode', label: '儲存條件代號' },
            { key: 'factory',       label: '工廠' },
            { key: 'address',       label: '地址' },
            { key: 'updatedInfo',   label: '更新資訊' },
          ])}
          actionButton={
            <Button
              className="h-[36px] bg-[#1c252e] text-white hover:bg-[#374151] rounded-[8px] px-[16px] text-[14px] font-semibold"
              onClick={openCreate}
            >
              新增
            </Button>
          }
        />
      </div>

      {/* 新增/編輯 Overlay */}
      <AddEditOverlay
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editRow ? '編輯GTM儲存條件VS儲存地點' : '新增GTM儲存條件VS儲存地點'}
        onSubmit={handleSave}
        submitLabel={editRow ? '儲存' : '新增'}
        disabled={!form.locationCode.trim() || !form.conditionCode.trim()}
      >
        <SelectRow label="儲存地點代號" value={form.locationCode} onChange={v => setForm(f => ({ ...f, locationCode: v }))}
          options={[{ value: '1020', label: '1020' }, { value: '1030', label: '1030' }, { value: '2010', label: '2010' }]}
        />
        <SelectRow label="儲存條件代號" value={form.conditionCode} onChange={v => setForm(f => ({ ...f, conditionCode: v }))}
          options={[{ value: 'Z1', label: 'Z1' }, { value: 'Z2', label: 'Z2' }, { value: 'Z3', label: 'Z3' }, { value: 'A', label: 'A' }]}
        />
        <FormRow label="地址">
          <input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="儲存地址" />
        </FormRow>
      </AddEditOverlay>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        description={`確定要刪除儲存條件「${deleteTarget?.locationCode} - ${deleteTarget?.conditionCode}」嗎？此操作無法復原。`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3：GEM目的地設定
// ─────────────────────────────────────────────────────────────────────────────

function GemDestinationTab() {
  const [data, setData] = useState<GemDestinationRow[]>(GEM_DESTINATION_DATA);
  const [searchPurchaseOrg, setSearchPurchaseOrg] = useState('');
  const [searchTransport, setSearchTransport]     = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editRow, setEditRow]           = useState<GemDestinationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GemDestinationRow | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  const [form, setForm] = useState<Omit<GemDestinationRow, 'id' | 'updatedInfo'>>({
    purchaseOrg: '', transportType: '', destination: '',
  });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const openCreate = () => {
    setEditRow(null);
    setForm({ purchaseOrg: '', transportType: '', destination: '' });
    setDialogOpen(true);
  };
  const openEdit = (row: GemDestinationRow) => {
    setEditRow(row);
    setForm({ purchaseOrg: row.purchaseOrg, transportType: row.transportType, destination: row.destination });
    setDialogOpen(true);
  };
  const handleSave = () => {
    const now = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    if (editRow) {
      setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form, updatedInfo: `系統 -${now}` } : r));
      showToast('GEM目的地設定已更新');
    } else {
      const newId = Math.max(...data.map(r => r.id), 0) + 1;
      setData(prev => [...prev, { id: newId, ...form, updatedInfo: `系統 -${now}` }]);
      showToast('GEM目的地設定已新增');
    }
    setDialogOpen(false);
  };
  const handleDelete = (row: GemDestinationRow) => {
    setData(prev => prev.filter(r => r.id !== row.id));
    showToast(`目的地設定 ${row.purchaseOrg}-${row.transportType} 已刪除`);
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (searchPurchaseOrg.trim())  result = result.filter(r => r.purchaseOrg.toLowerCase().includes(searchPurchaseOrg.trim().toLowerCase()));
    if (searchTransport.trim())    result = result.filter(r => r.transportType.toLowerCase().includes(searchTransport.trim().toLowerCase()));
    if (searchDestination.trim())  result = result.filter(r => r.destination.toLowerCase().includes(searchDestination.trim().toLowerCase()));
    return result;
  }, [data, searchPurchaseOrg, searchTransport, searchDestination]);

  const COLUMNS: StandardColumn<GemDestinationRow>[] = [
    { key: 'purchaseOrg',   label: '採購組織', width: 160, minWidth: 120 },
    { key: 'transportType', label: '運輸型態', width: 160, minWidth: 120 },
    { key: 'destination',   label: '目的地',   width: 200, minWidth: 140 },
    { key: 'updatedInfo',   label: '更新資訊', width: 260, minWidth: 180 },
    {
      key: 'id', label: '', width: 110, minWidth: 110, required: true,
      renderCell: (_val, row) => (
        <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <SearchField label="採購組織" value={searchPurchaseOrg}  onChange={setSearchPurchaseOrg} />
        <SearchField label="運輸型態" value={searchTransport}    onChange={setSearchTransport} />
        <SearchField label="目的地"   value={searchDestination}  onChange={setSearchDestination} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<GemDestinationRow>
          columns={COLUMNS}
          data={data}
          storageKey="shipping-settings-gem-destination-v1"
          externalFilteredData={filteredData}
          showCheckbox={false}
          onExportCsv={() => exportRowsToCsv(filteredData, 'GEM目的地設定.csv', [
            { key: 'purchaseOrg',   label: '採購組織' },
            { key: 'transportType', label: '運輸型態' },
            { key: 'destination',   label: '目的地' },
            { key: 'updatedInfo',   label: '更新資訊' },
          ])}
          actionButton={
            <Button
              className="h-[36px] bg-[#1c252e] text-white hover:bg-[#374151] rounded-[8px] px-[16px] text-[14px] font-semibold"
              onClick={openCreate}
            >
              新增
            </Button>
          }
        />
      </div>

      {/* 新增/編輯 Overlay */}
      <AddEditOverlay
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editRow ? '編輯GEM目的地' : '新增GEM目的地'}
        onSubmit={handleSave}
        submitLabel={editRow ? '儲存' : '新增'}
        disabled={!form.purchaseOrg.trim() || !form.transportType.trim() || !form.destination.trim()}
      >
        <SelectRow label="採購組織" value={form.purchaseOrg} onChange={v => setForm(f => ({ ...f, purchaseOrg: v }))}
          options={[{ value: '4111', label: '4111' }, { value: '4121', label: '4121' }, { value: '4131', label: '4131' }]}
        />
        <SelectRow label="運輸型態" value={form.transportType} onChange={v => setForm(f => ({ ...f, transportType: v }))}
          options={[{ value: 'A', label: 'A' }, { value: 'S', label: 'S' }, { value: 'Z1', label: 'Z1' }, { value: 'Z2', label: 'Z2' }]}
        />
        <FormRow label="目的地">
          <input className={inputCls} value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="如: AMSTERDAM" />
        </FormRow>
      </AddEditOverlay>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        description={`確定要刪除「採購組織 ${deleteTarget?.purchaseOrg} / 運輸型態 ${deleteTarget?.transportType} / 目的地 ${deleteTarget?.destination}」嗎？此操作無法復原。`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 主元件
// ─────────────────────────────────────────────────────────────────────────────

export function ShippingBasicSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('storage-location');

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── Tab 列 ── */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-auto">
            <TabItem
              label="儲存地點主檔"
              isActive={activeTab === 'storage-location'}
              onClick={() => setActiveTab('storage-location')}
            />
            <TabItem
              label="GTM儲存條件設定"
              isActive={activeTab === 'gtm-storage-condition'}
              onClick={() => setActiveTab('gtm-storage-condition')}
            />
            <TabItem
              label="GEM目的地設定"
              isActive={activeTab === 'gem-destination'}
              onClick={() => setActiveTab('gem-destination')}
            />
            {/* 底部灰線 */}
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ── Tab 內容 ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'storage-location'      && <StorageLocationTab />}
        {activeTab === 'gtm-storage-condition' && <GtmStorageConditionTab />}
        {activeTab === 'gem-destination'       && <GemDestinationTab />}
      </div>
    </div>
  );
}
