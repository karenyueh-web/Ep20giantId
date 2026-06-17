'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { EditButton } from './ActionButtons';
import { BaseOverlay } from './BaseOverlay';
import {
  type EsgMaterialRecord,
  MOCK_ESG_MATERIALS,
} from './esgMaterialData';

// ── Props ─────────────────────────────────────────────────────────────────────
interface EsgMaterialPageProps {
  userRole?: string;
}

// ── 表單型別 & 初始值 ──────────────────────────────────────────────────────────
type FormState = { nameTw: string; nameCn: string; nameEn: string; carbonEmission: string };
const EMPTY_FORM: FormState = { nameTw: '', nameCn: '', nameEn: '', carbonEmission: '' };

// ── FloatingInput（沿用 ShippingBasicSettingsPage 規範）──────────────────────
function FloatingInput({
  label, value, onChange, required, showError,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  showError?: string;
}) {
  const isError = !!showError;
  const borderColor = isError ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = isError ? '#ff5630' : '#637381';
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor }}
      />
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p className="relative shrink-0 leading-[12px]" style={{ fontSize: '12px', fontWeight: 600, color: labelColor }}>
          {label}
        </p>
      </div>
      <textarea
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        style={{ resize: 'vertical', minHeight: '54px', color: '#1c252e' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={1}
        onFocus={e => {
          const border = e.currentTarget.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
          if (border) { border.style.borderColor = '#1890FF'; border.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)'; }
        }}
        onBlur={e => {
          const border = e.currentTarget.parentElement?.querySelector('[aria-hidden]') as HTMLElement;
          if (border) { border.style.borderColor = isError ? '#ff5630' : 'rgba(145,158,171,0.2)'; border.style.boxShadow = ''; }
        }}
      />
      {showError && <p className="mt-[4px] text-[12px] text-[#ff5630]">{showError}</p>}
    </div>
  );
}

// ── 新增/編輯 Modal ────────────────────────────────────────────────────────────
function MaterialFormModal({
  mode, initialData, onClose, onSave,
}: {
  mode: 'add' | 'edit';
  initialData?: EsgMaterialRecord;
  onClose: () => void;
  onSave: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initialData
      ? {
          nameTw: initialData.nameTw,
          nameCn: initialData.nameCn,
          nameEn: initialData.nameEn,
          carbonEmission: String(initialData.carbonEmission),
        }
      : { ...EMPTY_FORM },
  );
  const [submitted, setSubmitted] = useState(false);

  // ESC 關閉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setField = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const errors = submitted ? {
    nameTw:         !form.nameTw.trim()         ? '必填' : '',
    nameCn:         !form.nameCn.trim()         ? '必填' : '',
    nameEn:         !form.nameEn.trim()         ? '必填' : '',
    carbonEmission: !form.carbonEmission.trim() ? '必填'
                  : isNaN(Number(form.carbonEmission)) ? '請輸入數字' : '',
  } : { nameTw: '', nameCn: '', nameEn: '', carbonEmission: '' };

  const hasError = Object.values(errors).some(v => v !== '');

  const handleSave = () => {
    setSubmitted(true);
    const e = {
      nameTw:         !form.nameTw.trim(),
      nameCn:         !form.nameCn.trim(),
      nameEn:         !form.nameEn.trim(),
      carbonEmission: !form.carbonEmission.trim() || isNaN(Number(form.carbonEmission)),
    };
    if (Object.values(e).some(Boolean)) return;
    onSave(form);
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="560px" maxHeight="600px">
      <div className="relative w-full h-full">
        {/* 關閉按鈕 — 左上角，沿用 AddVendorMailOverlay 規範 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill="#637381"
              fillRule="evenodd"
            />
          </svg>
        </button>

        {/* 內容區 */}
        <div className="flex flex-col h-full px-[50px] pt-[58px] pb-[40px] gap-[24px]">
        {/* 標題 */}
        <div className="flex flex-col gap-[4px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            {mode === 'add' ? '新增材料資訊' : '編輯材料資訊'}
          </p>
          {mode === 'add' && (
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] leading-[20px] text-[#ff5630]">
              *新增材料後，僅可編輯，不可刪除材料。
            </p>
          )}
        </div>

        {/* 表單欄位（FloatingInput 規範） */}
        <div className="flex flex-col gap-[16px] flex-1">
          <FloatingInput
            label="材料名(繁中)"
            value={form.nameTw}
            onChange={v => setField('nameTw', v)}
            required
            showError={errors.nameTw}
          />
          <FloatingInput
            label="材料名(簡中)"
            value={form.nameCn}
            onChange={v => setField('nameCn', v)}
            required
            showError={errors.nameCn}
          />
          <FloatingInput
            label="材料名(EN)"
            value={form.nameEn}
            onChange={v => setField('nameEn', v)}
            required
            showError={errors.nameEn}
          />
          <FloatingInput
            label="炭排量(kg CO₂e)"
            value={form.carbonEmission}
            onChange={v => {
              // 只允許數字與一個小數點
              const filtered = v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              setField('carbonEmission', filtered);
            }}
            required
            showError={errors.carbonEmission}
          />
        </div>

        {/* 儲存按鈕 — 沿用 AddVendorMailOverlay #00559c */}
        <button
          onClick={handleSave}
          className="w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
          style={{ backgroundColor: '#00559c' }}
        >
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">
            儲存
          </p>
        </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ── 更新資訊 cell（有修改紀錄優先顯示，否則顯示建檔資訊）──────────────────────
function UpdateInfoCell({ record }: { record: EsgMaterialRecord }) {
  const name = record.updatedBy ?? record.createdBy;
  const date = record.updatedAt ?? record.createdAt;
  return (
    <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] whitespace-nowrap">
      {name} - {date}
    </span>
  );
}

// ── 主元件 ─────────────────────────────────────────────────────────────────────
export default function EsgMaterialPage({ userRole = 'giant' }: EsgMaterialPageProps) {
  const [materials, setMaterials] = useState<EsgMaterialRecord[]>([...MOCK_ESG_MATERIALS]);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingRecord, setEditingRecord] = useState<EsgMaterialRecord | null>(null);
  const [searchTw, setSearchTw] = useState('');
  const [searchCn, setSearchCn] = useState('');
  const [searchEn, setSearchEn] = useState('');

  // ── 篩選 ─────────────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = materials;
    if (searchTw.trim()) {
      const kw = searchTw.trim().toLowerCase();
      data = data.filter(m => m.nameTw.toLowerCase().includes(kw));
    }
    if (searchCn.trim()) {
      const kw = searchCn.trim().toLowerCase();
      data = data.filter(m => m.nameCn.toLowerCase().includes(kw));
    }
    if (searchEn.trim()) {
      const kw = searchEn.trim().toLowerCase();
      data = data.filter(m => m.nameEn.toLowerCase().includes(kw));
    }
    return data;
  }, [materials, searchTw, searchCn, searchEn]);

  // ── 序號欄 ────────────────────────────────────────────────────────────────────
  type EsgMaterialWithSeq = EsgMaterialRecord & { _seq: number };
  const displayData: EsgMaterialWithSeq[] = useMemo(
    () => filteredData.map((m, i) => ({ ...m, _seq: i + 1 })),
    [filteredData],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row: EsgMaterialRecord) => {
    setEditingRecord(row);
    setModalMode('edit');
  }, []);

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    setModalMode('add');
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setEditingRecord(null);
  }, []);

  const handleSave = useCallback((form: FormState) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;

    if (modalMode === 'add') {
      const newRecord: EsgMaterialRecord = {
        id: Date.now(),
        nameTw: form.nameTw.trim(),
        nameCn: form.nameCn.trim(),
        nameEn: form.nameEn.trim(),
        carbonEmission: Number(form.carbonEmission),
        createdBy: '目前使用者',
        createdAt: dateStr,
      };
      setMaterials(prev => [...prev, newRecord]);
      toast('新增材料成功');
    } else if (modalMode === 'edit' && editingRecord) {
      setMaterials(prev =>
        prev.map(m =>
          m.id === editingRecord.id
            ? { ...m,
                nameTw: form.nameTw.trim(),
                nameCn: form.nameCn.trim(),
                nameEn: form.nameEn.trim(),
                carbonEmission: Number(form.carbonEmission),
                updatedBy: '目前使用者',
                updatedAt: dateStr,
              }
            : m,
        ),
      );
      toast('編輯材料成功');
    }
    handleCloseModal();
  }, [modalMode, editingRecord, handleCloseModal]);

  // ── 欄位定義 ─────────────────────────────────────────────────────────────────
  const columns: StandardColumn<EsgMaterialWithSeq>[] = useMemo(
    () => [
      { key: '_seq',          label: '#',              width: 52,  minWidth: 44  },
      { key: 'nameTw',        label: '材料名',          width: 120, minWidth: 90  },
      { key: 'nameCn',        label: '材料名(簡體中文)', width: 140, minWidth: 110 },
      { key: 'nameEn',        label: '材料名(英文)',     width: 220, minWidth: 140 },
      {
        key: 'carbonEmission',
        label: '炭排量(kg CO₂e)',
        width: 140,
        minWidth: 110,
        renderCell: (val) => (
          <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1c252e] leading-[22px]">
            {String(val)}
          </span>
        ),
      },
      {
        key: 'createdBy',
        label: '更新資訊',
        width: 240,
        minWidth: 180,
        renderCell: (_val, row) => <UpdateInfoCell record={row} />,
      },
      {
        key: 'id',
        label: '',
        width: 56,
        minWidth: 56,
        renderCell: (_val, row) => <EditButton onClick={() => handleEdit(row)} />,
      },
    ],
    [handleEdit],
  ) as StandardColumn<EsgMaterialWithSeq>[];

  // ── Toolbar 右側新增按鈕 ──────────────────────────────────────────────────────
  const actionButton = (
    <button
      onClick={handleAdd}
      className="flex items-center gap-[6px] h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] text-white text-[14px] font-medium hover:bg-[#2d3a46] transition-colors whitespace-nowrap shrink-0"
    >
      新增
    </button>
  );

  // ── 渲染 ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* A. 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[20px]">
        <SearchField label="材料名(繁中)" value={searchTw} onChange={setSearchTw} type="search" />
        <SearchField label="材料名(簡中)" value={searchCn} onChange={setSearchCn} type="search" />
        <SearchField label="材料名(En)"   value={searchEn} onChange={setSearchEn} type="search" />
      </div>

      {/* B. 表格 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<EsgMaterialWithSeq>
          columns={columns}
          data={displayData}
          storageKey="esg-material-v3"
          showCheckbox={false}
          actionButton={actionButton}
          externalFilteredData={displayData}
          onExportCsv={() => toast('匯出 CSV 功能開發中')}
        />
      </div>

      {/* C. 新增/編輯 Modal */}
      {modalMode && (
        <MaterialFormModal
          mode={modalMode}
          initialData={editingRecord ?? undefined}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      <Toaster />
    </div>
  );
}
