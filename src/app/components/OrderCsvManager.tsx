import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, CalendarDays, ArrowRight, ChevronDown, FileText, Table, Package, Truck, FilePlus2, Trash2 } from 'lucide-react';
import type { OrderRow, ScheduleLine, OrderColumn, OrderColumnKey } from './AdvancedOrderTable';
import { computeRowDayDiff, computeProdSchedDayDiff } from './AdvancedOrderTable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ===== Types =====
export type CsvAction = '同意' | '不同意' | '修改交期' | '';

export interface CsvParsedRow {
  rowIndex: number; // 1-based row in CSV
  orderNo: string;
  orderSeq: string;
  vendorName: string;
  vendorCode: string;
  materialNo: string;
  productName: string;
  status: string;
  orderQty: string;
  expectedDelivery: string;
  action: CsvAction;
  newDeliveryDate: string;
  remarks: string;
  // Validation
  matchedOrder?: OrderRow;
  error?: string;
  isValid: boolean;
}

export interface CsvImportResult {
  totalRows: number;
  approveRows: CsvParsedRow[];
  rejectRows: CsvParsedRow[];
  modifyDateRows: CsvParsedRow[];
  skipRows: CsvParsedRow[];
  errorRows: CsvParsedRow[];
}

// ===== CSV Export (BOM UTF-8 .csv) =====
export function exportOrdersCsv(orders: OrderRow[], filename?: string, columns?: OrderColumn[]) {
  let headers: string[];
  let data: (string | number)[][];

  if (columns && columns.length > 0) {
    const visibleCols = columns.filter(c => c.visible !== false);
    headers = visibleCols.map(c => c.label);
    data = orders.map(o => visibleCols.map(c => getColumnRawValue(o, c.key)));
  } else {
    // Fallback: default commonly used columns
    headers = [
      '訂單號碼', '訂單序號', '廠商名稱', '廠商編號', '料號', '品名',
      '訂單狀態', '訂貨量', '預計交期',
      '動作(同意/不同意/修改交期)', '新預計交期(YYYY/MM/DD)', '備註'
    ];
    data = orders.map(order => [
      order.orderNo,
      order.orderSeq,
      order.vendorName,
      order.vendorCode,
      order.materialNo,
      order.productName,
      order.status,
      order.orderQty,
      order.expectedDelivery,
      '', // 動作 - user fills
      '', // 新預計交期 - user fills
      '', // 備註 - user fills
    ]);
  }

  // Output as real .csv
  const csvContent = [headers, ...data].map(row =>
    row.map(cell => {
      const s = String(cell ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  ).join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `訂單匯出_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== CSV Parse =====
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvContent(content: string, allOrders: OrderRow[]): CsvImportResult {
  // Remove BOM
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    return { totalRows: 0, approveRows: [], rejectRows: [], modifyDateRows: [], skipRows: [], errorRows: [] };
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const parsedRows: CsvParsedRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCsvLine(dataLines[i]);
    if (fields.length < 9) {
      parsedRows.push({
        rowIndex: i + 2,
        orderNo: fields[0] || '',
        orderSeq: fields[1] || '',
        vendorName: fields[2] || '',
        vendorCode: fields[3] || '',
        materialNo: fields[4] || '',
        productName: fields[5] || '',
        status: fields[6] || '',
        orderQty: fields[7] || '',
        expectedDelivery: fields[8] || '',
        action: '',
        newDeliveryDate: '',
        remarks: '',
        error: `第${i + 2}行欄位數不足 (需至少9欄，實際${fields.length}欄)`,
        isValid: false,
      });
      continue;
    }

    const orderNo = fields[0];
    const orderSeq = fields[1];
    const actionRaw = (fields[9] || '').trim();
    const newDeliveryDate = (fields[10] || '').trim();
    const remarks = (fields[11] || '').trim();

    // Validate action
    let action: CsvAction = '';
    let error: string | undefined;
    if (actionRaw === '同意' || actionRaw === '不同意' || actionRaw === '修改交期') {
      action = actionRaw;
    } else if (actionRaw !== '') {
      error = `動作欄位無效: "${actionRaw}"（僅接受: 同意/不同意/修改交期）`;
    }

    // Match order
    const matchedOrder = allOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
    if (!matchedOrder && action !== '') {
      error = error || `找不到對應訂單 (訂單號碼: ${orderNo}, 序號: ${orderSeq})`;
    }

    // Validate modify date requires newDeliveryDate
    if (action === '修改交期' && !newDeliveryDate) {
      error = error || '修改交期需要填寫「新預計交期」欄位';
    }

    // Validate date format
    if (newDeliveryDate && !/^\d{4}\/\d{2}\/\d{2}$/.test(newDeliveryDate)) {
      error = error || `日期格式錯誤: "${newDeliveryDate}"（格式: YYYY/MM/DD）`;
    }

    // Check order status allows action
    if (matchedOrder && action !== '' && !error) {
      const allowedStatuses = ['NP', 'V', 'B'];
      if (!allowedStatuses.includes(matchedOrder.status)) {
        error = `訂單狀態 ${matchedOrder.status} 不允許此操作`;
      }
    }

    parsedRows.push({
      rowIndex: i + 2,
      orderNo,
      orderSeq,
      vendorName: fields[2] || '',
      vendorCode: fields[3] || '',
      materialNo: fields[4] || '',
      productName: fields[5] || '',
      status: fields[6] || '',
      orderQty: fields[7] || '',
      expectedDelivery: fields[8] || '',
      action,
      newDeliveryDate,
      remarks,
      matchedOrder,
      error,
      isValid: !error,
    });
  }

  return {
    totalRows: parsedRows.length,
    approveRows: parsedRows.filter(r => r.action === '同意' && r.isValid),
    rejectRows: parsedRows.filter(r => r.action === '不同意' && r.isValid),
    modifyDateRows: parsedRows.filter(r => r.action === '修改交期' && r.isValid),
    skipRows: parsedRows.filter(r => r.action === '' && r.isValid),
    errorRows: parsedRows.filter(r => !r.isValid),
  };
}

// ===== CSV Import Overlay =====
interface CsvImportOverlayProps {
  allOrders: OrderRow[];
  onConfirm: (result: CsvImportResult) => void;
  onClose: () => void;
}

type ImportStep = 'upload' | 'preview';

export function CsvImportOverlay({ allOrders, onConfirm, onClose }: CsvImportOverlayProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCsvContent(content, allOrders);
      setImportResult(result);
      setStep('preview');
    };
    reader.readAsText(file, 'UTF-8');
  }, [allOrders]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      processFile(file);
    }
  };

  const actionCount = importResult
    ? importResult.approveRows.length + importResult.rejectRows.length + importResult.modifyDateRows.length
    : 0;

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'upload' ? '520px' : '900px', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <FileSpreadsheet size={22} className="text-[#005eb8]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              {step === 'upload' ? 'CSV 批次匯入' : 'CSV 匯入預覽'}
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
            <X size={20} className="text-[#637381]" />
          </div>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
                請先匯出訂單 CSV，在「動作」欄填入指令後匯入。
              </p>
              <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">動作欄位說明：</p>
                <div className="flex items-center gap-[6px]">
                  <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">同意</span> — 同意該筆訂單</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <XCircle size={14} className="text-[#ff5630] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">不同意</span> — 不同意該筆訂單（可在備註欄填寫原因）</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <CalendarDays size={14} className="text-[#005eb8] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">修改交期</span> — 需同時填寫「新預計交期」欄 (YYYY/MM/DD)</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[14px] h-[14px] flex items-center justify-center shrink-0">
                    <div className="w-[6px] h-[6px] bg-[#919eab] rounded-full" />
                  </div>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">空白 — 不處理該筆訂單</p>
                </div>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`flex flex-col items-center justify-center gap-[12px] border-2 border-dashed rounded-[12px] py-[40px] px-[20px] cursor-pointer transition-colors ${
                isDragOver ? 'border-[#005eb8] bg-[rgba(0,94,184,0.04)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#005eb8] hover:bg-[rgba(0,94,184,0.02)]'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={40} className="text-[#919eab]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center">
                拖曳 CSV 檔案至此處，或<span className="text-[#005eb8] font-semibold underline">點擊選擇檔案</span>
              </p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">
                僅支援 .csv 格式
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && importResult && (
          <>
            <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
              {/* File name */}
              <div className="flex items-center gap-[8px] shrink-0">
                <FileSpreadsheet size={16} className="text-[#637381]" />
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
              </div>

              {/* Summary */}
              <div className="flex gap-[8px] flex-wrap shrink-0">
                <TotalSummaryBadge total={importResult.totalRows} validCount={actionCount} skipCount={importResult.skipRows?.length ?? 0} errorCount={importResult.errorRows.length} />
                <SummaryBadge
                  label="同意"
                  count={importResult.approveRows.length}
                  bgColor="bg-[rgba(34,197,94,0.12)]"
                  textColor="text-[#118d57]"
                  icon={<CheckCircle2 size={14} />}
                />
                <SummaryBadge
                  label="不同意"
                  count={importResult.rejectRows.length}
                  bgColor="bg-[rgba(255,86,48,0.12)]"
                  textColor="text-[#b71d18]"
                  icon={<XCircle size={14} />}
                />
                <SummaryBadge
                  label="修改交期"
                  count={importResult.modifyDateRows.length}
                  bgColor="bg-[rgba(0,94,184,0.12)]"
                  textColor="text-[#005eb8]"
                  icon={<CalendarDays size={14} />}
                />
                <SummaryBadge
                  label="不處理"
                  count={importResult.skipRows.length}
                  bgColor="bg-[rgba(145,158,171,0.08)]"
                  textColor="text-[#919eab]"
                />
              </div>

              {/* Preview table */}
              <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
                <table className="w-full min-w-[800px]">
                  <thead className="sticky top-0 z-[1]">
                    <tr className="bg-[#f4f6f8]">
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] w-[40px]">行</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">作</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">訂單號碼</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">序號</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">廠商名稱</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">料號</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">交期變更</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">備註</th>
                      <th className="px-[10px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Error rows first */}
                    {importResult.errorRows.map((row) => (
                      <CsvPreviewRow key={`err-${row.rowIndex}`} row={row} type="error" />
                    ))}
                    {/* Action rows */}
                    {importResult.approveRows.map((row) => (
                      <CsvPreviewRow key={`app-${row.rowIndex}`} row={row} type="approve" />
                    ))}
                    {importResult.rejectRows.map((row) => (
                      <CsvPreviewRow key={`rej-${row.rowIndex}`} row={row} type="reject" />
                    ))}
                    {importResult.modifyDateRows.map((row) => (
                      <CsvPreviewRow key={`mod-${row.rowIndex}`} row={row} type="modifyDate" />
                    ))}
                    {/* Skip rows */}
                    {importResult.skipRows.map((row) => (
                      <CsvPreviewRow key={`skip-${row.rowIndex}`} row={row} type="skip" />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
              <button
                className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
                onClick={() => { setStep('upload'); setImportResult(null); setFileName(''); }}
              >
                重新選擇檔案
              </button>
              <div className="flex gap-[12px]">
                <button
                  className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
                  onClick={onClose}
                >
                  取消
                </button>
                <button
                  className="h-[36px] px-[20px] rounded-[8px] bg-[#005eb8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#004a94] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onConfirm(importResult)}
                  disabled={actionCount === 0}
                >
                  確認執行 ({actionCount} 筆)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== Sub-components =====
function SummaryBadge({ label, count, bgColor, textColor, icon }: {
  label: string; count: number; bgColor: string; textColor: string; icon?: React.ReactNode;
}) {
  return (
    <div className={`${bgColor} flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]`}>
      {icon && <span className={textColor}>{icon}</span>}
      <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] ${textColor}`}>
        {label}
      </p>
      <p className={`font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] ${textColor}`}>
        {count}
      </p>
    </div>
  );
}

function TotalSummaryBadge({ total, validCount, skipCount, errorCount }: { total: number; validCount: number; skipCount: number; errorCount: number }) {
  const parts: string[] = [];
  if (validCount > 0) parts.push(`有效 ${validCount}`);
  if (errorCount > 0) parts.push(`錯誤 ${errorCount}`);
  if (skipCount > 0) parts.push(`不處理 ${skipCount}`);
  const detail = parts.length > 0 ? `（${parts.join('、')}）` : '';
  return (
    <div className="bg-[rgba(145,158,171,0.12)] flex items-center gap-[6px] h-[28px] px-[10px] rounded-[6px]">
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">共計</p>
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold text-[13px] text-[#637381]">{total}</p>
      {detail && <p className={`font-['Public_Sans:Regular',sans-serif] text-[11px] ${errorCount > 0 ? 'text-[#b76e00]' : 'text-[#637381]'}`}>{detail}</p>}
    </div>
  );
}

function CsvPreviewRow({ row, type }: { row: CsvParsedRow; type: 'approve' | 'reject' | 'modifyDate' | 'skip' | 'error' }) {
  const rowBg = type === 'error'
    ? 'bg-[rgba(255,171,0,0.04)]'
    : type === 'skip'
    ? ''
    : 'bg-[rgba(0,94,184,0.02)]';

  const actionBadge = () => {
    switch (type) {
      case 'approve':
        return (
          <div className="bg-[rgba(34,197,94,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]">
            <CheckCircle2 size={12} className="text-[#118d57]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#118d57]">同意</p>
          </div>
        );
      case 'reject':
        return (
          <div className="bg-[rgba(255,86,48,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]">
            <XCircle size={12} className="text-[#b71d18]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b71d18]">不同意</p>
          </div>
        );
      case 'modifyDate':
        return (
          <div className="bg-[rgba(0,94,184,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]">
            <CalendarDays size={12} className="text-[#005eb8]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#005eb8]">修改交期</p>
          </div>
        );
      case 'error':
        return (
          <div className="bg-[rgba(255,171,0,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]">
            <AlertTriangle size={12} className="text-[#b76e00]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b76e00]">{row.action || '錯誤'}</p>
          </div>
        );
      default:
        return (
          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">—</p>
        );
    }
  };

  const cellClass = "px-[10px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]";

  return (
    <tr className={`border-t border-[rgba(145,158,171,0.08)] ${rowBg}`}>
      <td className={`${cellClass} text-[#919eab]`}>{row.rowIndex}</td>
      <td className="px-[10px] py-[8px]">{actionBadge()}</td>
      <td className={cellClass}>{row.orderNo}</td>
      <td className={cellClass}>{row.orderSeq}</td>
      <td className={`${cellClass} truncate max-w-[140px]`}>{row.vendorName}</td>
      <td className={`${cellClass} truncate max-w-[120px]`}>{row.materialNo}</td>
      <td className="px-[10px] py-[8px]">
        {type === 'modifyDate' && row.matchedOrder ? (
          <div className="flex items-center gap-[4px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] line-through">{row.expectedDelivery}</p>
            <ArrowRight size={12} className="text-[#005eb8] shrink-0" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#005eb8]">{row.newDeliveryDate}</p>
          </div>
        ) : (
          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">—</p>
        )}
      </td>
      <td className={`${cellClass} truncate max-w-[120px] ${row.remarks ? 'text-[#1c252e]' : 'text-[#919eab]'}`}>
        {row.remarks || '—'}
      </td>
      <td className="px-[10px] py-[8px]">
        {type === 'error' ? (
          <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#b76e00] max-w-[160px]" title={row.error}>
            {row.error}
          </p>
        ) : (
          <CheckCircle2 size={14} className="text-[#22c55e]" />
        )}
      </td>
    </tr>
  );
}

// ===== Export/Import buttons for toolbar =====
export type ExportType = 'excel' | 'csv' | 'batchReplySchedule' | 'batchReplySplit' | 'batchCorrectionAdjust' | 'batchCorrectionSplit';

interface ExportOption {
  type: ExportType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { type: 'excel',                 label: '匯出 Excel',                      icon: <Table size={15} className="text-[#118d57]" />,        description: '依列表顯示欄位匯出 .xlsx 格式' },
  { type: 'csv',                   label: '匯出 CSV',                       icon: <FileText size={15} className="text-[#005eb8]" />,      description: '依列表顯示欄位匯出 .csv 格式' },
  { type: 'batchReplySchedule',    label: '下載批次回覆 (拆 Schedule Line)', icon: <FileSpreadsheet size={15} className="text-[#8e33ff]" />, description: 'NP/V 訂單，每筆排程一列' },
  { type: 'batchReplySplit',       label: '下載批次回覆 (拆單)',             icon: <FileSpreadsheet size={15} className="text-[#ff5630]" />, description: 'NP/V 訂單，每筆訂單一列' },
  { type: 'batchCorrectionAdjust', label: '下載批次建立（不拆單）',       icon: <FilePlus2 size={15} className="text-[#00a76f]" />,     description: 'CK 訂單，調整交期/料號，支援多期排程' },
  { type: 'batchCorrectionSplit',  label: '下載批次建立（拆單）',            icon: <FilePlus2 size={15} className="text-[#8e33ff]" />,     description: 'CK 訂單，填寫拆單數與各序號交貨量/料號' },
];

interface CsvToolbarButtonsProps {
  onExportSelect: (type: ExportType) => void;
  onImport: () => void;
  importLabel?: string;
  /** 隱藏批次回覆相關功能（下載批次回覆 + 批次上傳回覆）*/
  hideBatchReply?: boolean;
  /** 僅隱藏「下載批次回覆 (拆單)」選項（換貨單不支援拆單）*/
  hideBatchReplySplit?: boolean;
  /** 不拆單調整範本上傳回調 */
  onBatchCorrectionAdjustImport?: () => void;
  /** 拆單範本上傳回調 */
  onBatchCorrectionSplitImport?: () => void;
  /** 隱藏批次建立修正單相關功能 */
  hideBatchCorrection?: boolean;
}

interface BatchCorrectionDropdownProps {
  onAdjust?: () => void;
  onSplit?: () => void;
}

// 已合併為單一按鈕，子選項由 Overlay 內部的檔案偵測取代
function BatchCorrectionDropdown({ onAdjust }: BatchCorrectionDropdownProps) {
  return (
    <div className="relative flex items-center">
      <div className="w-[1px] h-[20px] bg-[rgba(145,158,171,0.2)]" />
      <button
        className="flex items-center gap-[6px] h-[36px] px-[12px] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
        onClick={onAdjust}
        title="批次建立修正單"
      >
        <FilePlus2 size={16} className="text-[#637381]" />
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] whitespace-nowrap">批次建立修正單</p>
      </button>
    </div>
  );
}

export function CsvToolbarButtons({ onExportSelect, onImport, importLabel = '批次上傳回覆', hideBatchReply = false, hideBatchReplySplit = false, onBatchCorrectionAdjustImport, onBatchCorrectionSplitImport, hideBatchCorrection = false }: CsvToolbarButtonsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  }, []);

  // Attach/detach listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="flex items-center gap-[2px] h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.2)] overflow-visible relative" ref={dropdownRef}>
      {/* Export button with dropdown */}
      <button
        className="flex items-center gap-[6px] h-full px-[12px] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
        title="匯出"
      >
        <Download size={16} className="text-[#637381]" />
        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] whitespace-nowrap">Export</p>
        <ChevronDown size={14} className={`text-[#637381] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+4px)] right-0 w-[320px] bg-white rounded-[10px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)] border border-[rgba(145,158,171,0.12)] py-[6px] z-[100]">
          {(hideBatchReply
              ? EXPORT_OPTIONS.filter(o =>
                  o.type === 'excel' || o.type === 'csv' ||
                  (o.type === 'batchCorrectionAdjust' && !hideBatchCorrection) ||
                  (o.type === 'batchCorrectionSplit' && !hideBatchCorrection)
                )
              : hideBatchReplySplit
                ? EXPORT_OPTIONS.filter(o =>
                    o.type !== 'batchReplySplit' &&
                    ((o.type !== 'batchCorrectionAdjust' && o.type !== 'batchCorrectionSplit') || !hideBatchCorrection)
                  )
                : hideBatchCorrection
                  ? EXPORT_OPTIONS.filter(o => o.type !== 'batchCorrectionAdjust' && o.type !== 'batchCorrectionSplit')
                  : EXPORT_OPTIONS
            ).map((option) => (
            <button
              key={option.type}
              className="w-full flex items-start gap-[10px] px-[14px] py-[10px] hover:bg-[rgba(145,158,171,0.06)] transition-colors text-left"
              onClick={() => {
                onExportSelect(option.type);
                setShowDropdown(false);
              }}
            >
              <div className="mt-[2px] shrink-0">{option.icon}</div>
              <div className="flex flex-col gap-[2px] min-w-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">
                  {option.label}
                </p>
                <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!hideBatchReply && <>
        <div className="w-[1px] h-[20px] bg-[rgba(145,158,171,0.2)]" />

        {/* Import button */}
        <button
          className="flex items-center gap-[6px] h-full px-[12px] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
          onClick={onImport}
          title={importLabel}
        >
          <Upload size={16} className="text-[#637381]" />
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] whitespace-nowrap">{importLabel}</p>
        </button>
      </>}

      {/* 批次建立修正單（下拉選單，含不拆單調整 & 拆單） */}
      {!hideBatchCorrection && (onBatchCorrectionAdjustImport || onBatchCorrectionSplitImport) && (
        <BatchCorrectionDropdown
          onAdjust={onBatchCorrectionAdjustImport}
          onSplit={onBatchCorrectionSplitImport}
        />
      )}
    </div>
  );
}

// ===== Helper: shared batch reply headers & escape =====
// 統一格式標題：SL（拆 Schedule Line）與 IT（拆單）採用相同欄位結構
// 首欄「答交類型」填入 SL 或 IT；移除 SL 原本的「項次」欄，統一為日期+數量 2欄一組
const BATCH_REPLY_UNIFIED_HEADERS = [
  '答交類型', '訂單號碼', '訂單序號', '料號', '比對單價', '幣別',
  '預計交期', '訂貨量', '單位',
  '同意碼', '廠商可交貨日期1', '交貨量1',
  '廠商可交貨日期2', '交貨量2',
];

function escCsv(val: string) {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  // Delay cleanup so the browser has time to initiate the download
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

// ===== Shared: XLSX auto-fit column width (CJK-aware) =====
function calcDisplayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0) || 0;
    if (
      (code >= 0x2E80 && code <= 0x9FFF) ||
      (code >= 0xF900 && code <= 0xFAFF) ||
      (code >= 0xFF01 && code <= 0xFF60) ||
      (code >= 0x3000 && code <= 0x303F) ||
      (code >= 0x3040 && code <= 0x30FF)
    ) {
      w += 2.2;
    } else {
      w += 1;
    }
  }
  return w;
}

function applyAutoWidth(ws: XLSX.WorkSheet, allRows: (string | number | null | undefined)[][]) {
  if (allRows.length === 0) return;
  const colCount = Math.max(...allRows.map(r => r.length));
  const cols: XLSX.ColInfo[] = [];
  for (let i = 0; i < colCount; i++) {
    let maxW = 4;
    for (const row of allRows) {
      const cell = row[i];
      const text = cell !== undefined && cell !== null ? String(cell) : '';
      const w = calcDisplayWidth(text);
      if (w > maxW) maxW = w;
    }
    cols.push({ wch: Math.min(Math.ceil(maxW + 3), 50) });
  }
  ws['!cols'] = cols;
}

function buildXlsx(sheetName: string, allRows: (string | number | null | undefined)[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  applyAutoWidth(ws, allRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const isCsv = /\.csv$/i.test(filename);

  // 使用 base64 data URI 下載，完全不依賴 blob URL（避免 Chrome 不支援 blob download 屬性）
  const a = document.createElement('a');
  a.style.display = 'none';

  if (isCsv) {
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const base64 = btoa(unescape(encodeURIComponent('\uFEFF' + csvContent)));
    a.href = 'data:text/csv;base64,' + base64;
  } else {
    const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    a.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64;
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== Column key → raw value accessor (for Excel export) =====
function getColumnRawValue(row: OrderRow, key: OrderColumnKey): string | number {
  switch (key) {
    case 'status': return row.status;
    case 'orderNo': return row.orderNo;
    case 'orderDate': return row.orderDate || '';
    case 'orderType': return row.orderType || '';
    case 'company': return (row as any).company || '';
    case 'purchaseOrg': return (row as any).purchaseOrg || '';
    case 'orderSeq': return row.orderSeq;
    case 'docSeqNo': return (row.orderNo || '') + (row.orderSeq || '');
    case 'purchaser': return (row as any).purchaser || '';
    case 'orderQty': return row.orderQty;
    case 'acceptQty': return row.acceptQty;
    case 'comparePrice': return row.comparePrice || '';
    case 'unit': return row.unit || '';
    case 'currency': return row.currency || 'TWD';
    case 'leadtime': return row.leadtime ?? '';
    case 'vendorCode': return row.vendorCode;
    case 'vendorName': return row.vendorName;
    case 'materialNo': return row.materialNo;
    case 'customerBrand': return (row as any).customerBrand || '';
    case 'vendorMaterialNo': return (row as any).vendorMaterialNo || '';
    case 'productName': return row.productName;
    case 'specification': return row.specification || '';
    case 'expectedDelivery': return row.expectedDelivery;
    case 'vendorDeliveryDate': return row.vendorDeliveryDate || '';
    case 'deliveryQty': return (row as any).deliveryQty ?? '';
    case 'schedLineIndex': {
      const lines = row.scheduleLines;
      if (!lines || lines.length === 0) return '1';
      if (lines.length === 1) return String(lines[0].index);
      return lines.map(l => l.index).join('/');
    }
    case 'dayDiff': {
      const diff = computeRowDayDiff(row);
      return diff !== null ? diff : '';
    }
    case 'productionScheduleDate': return row.productionScheduleDate || '';
    case 'prodSchedDayDiff': {
      const diff = computeProdSchedDayDiff(row);
      return diff !== null ? diff : '';
    }
    case 'inTransitQty': return row.inTransitQty;
    case 'undeliveredQty': return row.undeliveredQty;
    case 'lineItemNote': return row.lineItemNote || '';
    case 'internalNote': return row.internalNote || '';
    case 'materialPOContent': return row.materialPOContent || '';
    default: return '';
  }
}

// ===== 1) Export Excel (.xlsx) – visible columns only =====
export function exportOrdersExcel(orders: OrderRow[], filename?: string, columns?: OrderColumn[]) {
  // If columns provided, use only visible ones in their order; otherwise fall back to default set
  if (columns && columns.length > 0) {
    const visibleCols = columns.filter(c => c.visible !== false);
    const headers = visibleCols.map(c => c.label);
    const data = orders.map(o => visibleCols.map(c => getColumnRawValue(o, c.key)));
    buildXlsx('訂單', [headers, ...data], filename || `訂單匯出_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } else {
    // Fallback: default commonly used columns
    const headers = [
      '訂單號碼', '訂單序號', '廠商名稱', '廠商編號', '料號', '品名',
      '訂單狀態', '訂貨量', '已收量', '比對單價', '幣別', '單位',
      '預計交期', '廠商可交貨日期', '前置天數',
      '在途量', '未交量', '行項目備註',
    ];
    const data = orders.map(o => [
      o.orderNo, o.orderSeq, o.vendorName, o.vendorCode, o.materialNo, o.productName,
      o.status, o.orderQty, o.acceptQty, o.comparePrice || '', o.currency || 'TWD', o.unit || '',
      o.expectedDelivery, o.vendorDeliveryDate || '', o.leadtime ?? '',
      o.inTransitQty, o.undeliveredQty, o.lineItemNote || '',
    ]);
    buildXlsx('訂單', [headers, ...data], filename || `訂單匯出_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  return orders.length;
}

// ===== 2) Export CSV – all columns (existing, unchanged) =====
// exportOrdersCsv is already defined above

// ===== 2b) Forecast Export – generic helpers for ForecastOrderRow =====
export function exportForecastExcel(
  rows: Record<string, any>[],
  columns: { key: string; label: string; visible?: boolean }[],
  filename?: string,
) {
  const visibleCols = columns.filter(c => c.visible !== false);
  const headers = visibleCols.map(c => c.label);
  const data = rows.map(r => visibleCols.map(c => r[c.key] ?? ''));
  buildXlsx('預測訂單', [headers, ...data], filename || `預測訂單匯出_${new Date().toISOString().slice(0, 10)}.xlsx`);
  return rows.length;
}

export function exportForecastCsv(
  rows: Record<string, any>[],
  columns: { key: string; label: string; visible?: boolean }[],
  filename?: string,
) {
  const visibleCols = columns.filter(c => c.visible !== false);
  const headers = visibleCols.map(c => c.label);
  const data = rows.map(r => visibleCols.map(c => String(r[c.key] ?? '')));
  const csvContent = [headers, ...data].map(row =>
    row.map(cell => {
      const s = String(cell ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  ).join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `預測訂單匯出_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== 3) Batch Reply – Split Schedule Line (拆 schedule line) =====
// Each schedule line of an NP/V order becomes a separate row.
// If an order has no schedule lines, output one row with empty schedule fields.
export function exportBatchReplyScheduleLine(orders: OrderRow[], filename?: string, options?: { hideRejectOption?: boolean }) {
  const npvOrders = orders.filter(o => o.status === 'NP' || o.status === 'V');
  let totalRows = 0;

  // 標題（統一格式，首欄「答交類型」= SL）
  const headers = BATCH_REPLY_UNIFIED_HEADERS;

  // 說明列
  const instructionRows: string[][] = [
    ['同意碼說明：Y=訂單確認 / N=調整單據（需填新交期）/ X=不接單'],
    ['若需拆更多期，請在L欄後繼續增加交貨資訊(廠商可交貨日期3+交貨量3)以此類推'],
    [],
  ];

  const rows: string[][] = [];
  for (const order of npvOrders) {
    const lines = order.scheduleLines && order.scheduleLines.length > 0
      ? order.scheduleLines
      : [null]; // at least one row per order

    for (let li = 0; li < lines.length; li++) {
      const sl = lines[li];
      const baseRow: (string | number)[] = [
        'SL',              // 答交類型（拆 Schedule Line）
        order.orderNo,
        order.orderSeq,
        order.materialNo,
        order.comparePrice || '',
        order.currency || 'TWD',
        sl ? sl.deliveryDate : order.expectedDelivery,
        sl ? sl.quantity : order.orderQty,
        order.unit || '',
        '', // 同意碼
        '', // 廠商可交貨日期1
        '', // 交貨量1
        '', // 廠商可交貨日期2
        '', // 交貨量2
      ];
      rows.push(baseRow as string[]);
      totalRows++;
    }
  }

  const defaultName = filename || `批次回覆_拆ScheduleLine_${new Date().toISOString().slice(0, 10)}.csv`;
  const xlsxName = defaultName.replace(/\.csv$/i, '.xlsx');
  buildXlsx('批次回覆', [...instructionRows, headers, ...rows], xlsxName);
  return totalRows;
}

// ===== 4) Batch Reply – Split Order (拆單) =====
// One row per NP/V order (aggregated, same as previous exportBatchReplyCsv).
// `allOrders` is used to compute 新序號2 (next available seq for the same orderNo).
export function exportBatchReplySplitOrder(orders: OrderRow[], allOrders?: OrderRow[], filename?: string, options?: { hideRejectOption?: boolean }) {
  const npvOrders = orders.filter(o => o.status === 'NP' || o.status === 'V');

  // 說明列
  const instructionRows: string[][] = [
    ['同意碼說明：Y=訂單確認 / N=調整單據（需填新交期）/ X=不接單'],
    ['若需拆更多單，請在L欄後繼續增加交貨資訊(廠商可交貨日期3+交貨量3)以此類推'],
    [],
  ];

  const headers = BATCH_REPLY_UNIFIED_HEADERS;

  const rows = npvOrders.map(order => [
    'IT',              // 答交類型（拆單）
    order.orderNo,
    order.orderSeq,
    order.materialNo,
    order.comparePrice || '',
    order.currency || 'TWD',
    order.expectedDelivery,
    order.orderQty,
    order.unit || '',
    '',   // 同意碼
    '',   // 廠商可交貨日期1
    '',   // 交貨量1
    '',   // 廠商可交貨日期2
    '',   // 交貨量2
  ]);

  const defaultName = filename || `批次回覆_拆單_${new Date().toISOString().slice(0, 10)}.csv`;
  const xlsxName = defaultName.replace(/\.csv$/i, '.xlsx');
  buildXlsx('批次回覆', [...instructionRows, headers, ...rows], xlsxName);
  return npvOrders.length;
}

// Keep legacy alias
export const exportBatchReplyCsv = exportBatchReplySplitOrder;

// ═══════════════════════════════════════════════════════════════════════════════
// 5) Batch Reply Import — 解析廠商回填的批次回覆 CSV
// ═══════════════════════════════════════════════════════════════════════════════

export type BatchAgreeCode = 'Y' | 'N' | 'X' | '';
export type BatchReplyMode = 'schedule-line' | 'split-order' | 'unknown';

export interface BatchDelivery {
  date: string;
  qty: number;
  seq?: string;
  /** 拆單模式下，此組交貨對應的新訂單序號（第1組＝原序號，第2組起由系統計算） */
  newOrderSeq?: string;
}

export interface BatchReplyParsedRow {
  rowIndex: number;
  orderNo: string;
  orderSeq: string;
  materialNo: string;
  comparePrice: string;
  currency: string;
  expectedDelivery: string;
  orderQty: string;
  unit: string;
  agreeCode: BatchAgreeCode;
  deliveries: BatchDelivery[];
  rejectReason?: string;
  schedLineIndex?: string;
  newSeq1?: string;
  newSeq2?: string;
  matchedOrder?: OrderRow;
  error?: string;
  /** 被跳過的原因（例如狀態為 B/CK/CL 不接受批次回覆） */
  skipReason?: string;
  isValid: boolean;
  /** 答交類型（新格式檔案有此欄）：SL = 拆 Schedule Line，IT = 拆單 */
  replyType?: 'SL' | 'IT';
}

export interface BatchReplyImportResult {
  mode: BatchReplyMode;
  totalRows: number;
  agreeRows: BatchReplyParsedRow[];
  disagreeRows: BatchReplyParsedRow[];
  rejectOrderRows: BatchReplyParsedRow[];
  skipRows: BatchReplyParsedRow[];
  errorRows: BatchReplyParsedRow[];
}

function detectBatchReplyMode(headerLine: string): BatchReplyMode {
  const headers = parseCsvLine(headerLine);
  // Legacy: old split-order template had 新序號1/新序號2
  if (headers.includes('\u65b0\u5e8f\u865f1') || headers.includes('\u65b0\u5e8f\u865f2')) return 'split-order';
  // Schedule Line template has 項次1（schedule line index column）
  if (headers.includes('\u9805\u6b4c1')) return 'schedule-line';
  // New split-order template: has 同意碼 but no 項次1
  if (headers.includes('\u540c\u610f\u78bc')) return 'split-order';
  return 'unknown';
}

function isInstructionRow(fields: string[]): boolean {
  const colA = (fields[0] || '').trim();
  const colI = (fields[8] || '').trim();
  if (colA !== '') return false;
  if (/[交期同意碼請填問題]/.test(colI)) return true;
  if (!colA && !fields[1]?.trim() && !fields[2]?.trim() && colI.length > 5) return true;
  return false;
}

function isValidDateStr(s: string): boolean {
  return /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s);
}

/**
 * 將各種日期格式正規化為 YYYY/MM/DD。
 * 支援：YYYY/M/D、YYYY-MM-DD、M/D/YYYY、M/D/YY、MM-DD-YYYY 等。
 * 如果無法辨識則原樣回傳。
 */
function normalizeDateStr(s: string): string {
  if (!s) return s;
  const trimmed = s.trim();

  // Already valid: YYYY/MM/DD or YYYY/M/D
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('/');
    return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
  }
  // YYYY-MM-DD (ISO)
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
  }
  // M/D/YYYY (US format from Excel)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [m, d, y] = trimmed.split('/');
    return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
  }
  // M/D/YY (short year from Excel) – assume 2000+
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(trimmed)) {
    const [m, d, yy] = trimmed.split('/');
    const fullYear = parseInt(yy, 10) >= 50 ? `19${yy}` : `20${yy}`;
    return `${fullYear}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
  }
  return trimmed;
}

export function parseBatchReplyCsv(content: string, allOrders: OrderRow[]): BatchReplyImportResult {
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(l => l.trim() !== '');
  const empty: BatchReplyImportResult = { mode: 'unknown', totalRows: 0, agreeRows: [], disagreeRows: [], rejectOrderRows: [], skipRows: [], errorRows: [] };
  // 動態找到標題列（含獨立「同意碼」欄的那一行），跳過最前面的說明列
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.includes('同意碼')) {
      headerIndex = i;
      break;
    }
  }
  if (headerIndex === -1) return empty;

  // 偵測格式版本：新格式（含「答交類型」欄）或舊格式
  const headerFields = parseCsvLine(lines[headerIndex]);
  const isNewFormat = headerFields.includes('答交類型');

  // 舊格式：從標題列結構偵測模式（向後相容）
  let globalMode: BatchReplyMode = 'unknown';
  if (!isNewFormat) {
    globalMode = detectBatchReplyMode(lines[headerIndex]);
    if (globalMode === 'unknown') return empty;
  }

  // 欄位索引：新格式所有欄往右移一格（首欄為答交類型）
  const idxAnswerType = 0;
  const idxOrderNo   = isNewFormat ? 1 : 0;
  const idxOrderSeq  = isNewFormat ? 2 : 1;
  const idxMaterial  = isNewFormat ? 3 : 2;
  const idxPrice     = isNewFormat ? 4 : 3;
  const idxCurrency  = isNewFormat ? 5 : 4;
  const idxExpDel    = isNewFormat ? 6 : 5;
  const idxOrderQty  = isNewFormat ? 7 : 6;
  const idxUnit      = isNewFormat ? 8 : 7;
  const idxAgree     = isNewFormat ? 9 : 8;
  const idxDelStart  = isNewFormat ? 10 : 9;  // 交貨資訊起始欄

  const dataLines = lines.slice(headerIndex + 1);
  const rows: BatchReplyParsedRow[] = [];
  // 拆單模式：預先計算各 orderNo 的序號 tracker
  const splitSeqTracker: Record<string, number> = {};
  const getNextSplitSeq = (orderNo: string, currentSeq: number): string => {
    if (!(orderNo in splitSeqTracker)) {
      const seqs = allOrders
        .filter(o => o.orderNo === orderNo)
        .map(o => parseInt(o.orderSeq, 10))
        .filter(n => !isNaN(n));
      if (!isNaN(currentSeq)) seqs.push(currentSeq);
      splitSeqTracker[orderNo] = seqs.length > 0 ? Math.max(...seqs) : 0;
    }
    splitSeqTracker[orderNo] += 10;
    return String(splitSeqTracker[orderNo]);
  };

  // 整個檔案的模式（新格式從第一筆資料列决定；舊格式用 globalMode）
  let fileMode: BatchReplyMode = globalMode;

  for (let i = 0; i < dataLines.length; i++) {
    const f = parseCsvLine(dataLines[i]);
    if (isInstructionRow(f)) continue;
    if (f.every(x => x.trim() === '')) continue;
    const rowIndex = i + 2;

    // 決定此列模式
    let mode: BatchReplyMode;
    let replyType: 'SL' | 'IT' | undefined;
    if (isNewFormat) {
      const answerType = (f[idxAnswerType] || '').trim().toUpperCase();
      replyType = answerType === 'IT' ? 'IT' : 'SL';
      mode = replyType === 'IT' ? 'split-order' : 'schedule-line';
      if (fileMode === 'unknown') fileMode = mode;
    } else {
      mode = globalMode;
    }

    const orderNo = (f[idxOrderNo] || '').trim();
    const orderSeq = (f[idxOrderSeq] || '').trim();
    const agreeCodeRaw = (f[idxAgree] || '').trim().toUpperCase();
    let agreeCode: BatchAgreeCode = '';
    let error: string | undefined;
    if (agreeCodeRaw === 'Y') agreeCode = 'Y';
    else if (agreeCodeRaw === 'N') agreeCode = 'N';
    else if (agreeCodeRaw === 'X') agreeCode = 'X';
    else if (agreeCodeRaw !== '') error = `同意碼無效: "${agreeCodeRaw}"（僅接受 Y、N 或 X）`;
    if (!orderNo && agreeCode === '') continue;
    // 不接單原因：僅舊格式 split-order 有此欄（col 15）；新格式無
    const rejectReason = (!isNewFormat && mode === 'split-order') ? (f[15] || '').trim() : '';
    const deliveries: BatchDelivery[] = [];
    let schedLineIndex: string | undefined;
    let newSeq1: string | undefined;
    let newSeq2: string | undefined;
    if (!isNewFormat && mode === 'schedule-line') {
      // 舊 SL 格式：3欄一組（項次 + 廠商可交貨日期 + 交貨量），從 col 9
      schedLineIndex = (f[9] || '').trim();
      for (let colStart = 9; colStart + 2 < f.length; colStart += 3) {
        const seqVal = (f[colStart] || '').trim();
        const dateVal = normalizeDateStr((f[colStart + 1] || '').trim());
        const qtyVal = (f[colStart + 2] || '').trim();
        if (dateVal || qtyVal) {
          deliveries.push({ date: dateVal, qty: parseInt(qtyVal, 10) || 0, seq: seqVal });
        }
      }
    } else {
      // 新格式（SL 或 IT）及舊格式 IT：2欄一組（廠商可交貨日期 + 交貨量）
      for (let colStart = idxDelStart; colStart + 1 < f.length; colStart += 2) {
        const dateVal = normalizeDateStr((f[colStart] || '').trim());
        const qtyVal = (f[colStart + 1] || '').trim();
        if (dateVal || qtyVal) {
          deliveries.push({ date: dateVal, qty: parseInt(qtyVal, 10) || 0 });
        }
      }
      // 新格式 SL：自動補排程項次（seq）
      if (isNewFormat && mode === 'schedule-line') {
        deliveries.forEach((d, idx) => { d.seq = String(idx + 1); });
      }
    }
    const matched = allOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
    if (!matched && agreeCode !== '') error = error || `找不到對應訂單 (${orderNo} / ${orderSeq})`;
    // B/CK/CL 狀態的訂單不接受批次回覆 → 視為跳過（非錯誤）
    let skipReason: string | undefined;
    if (matched && matched.status !== 'NP' && matched.status !== 'V') {
      skipReason = `狀態 ${matched.status} 不接受批次回覆（僅限 NP/V）`;
      agreeCode = ''; // 強制清空同意碼，歸入 skipRows
    }
    // IT 模式：為每組 delivery 計算新序號
    if (mode === 'split-order') {
      const currentSeqNum = parseInt(orderSeq, 10);
      for (let di = 0; di < deliveries.length; di++) {
        if (di === 0) {
          deliveries[di].newOrderSeq = orderSeq; // 第1組保留原序號
        } else {
          deliveries[di].newOrderSeq = getNextSplitSeq(orderNo, currentSeqNum);
        }
      }
    }
    // Y：直接同意，後面不應該填任何交貨資訊
    if (agreeCode === 'Y' && !error && deliveries.some(d => d.date || d.qty)) {
      error = '同意碼 Y 為直接確認，不需填入交貨資訊';
    }
    // N（IT/拆單）：至少需要 2 組有效交貨資料
    if (agreeCode === 'N' && !error && mode === 'split-order') {
      const validGroups = deliveries.filter(d => d.date && isValidDateStr(d.date) && d.qty > 0);
      if (validGroups.length < 2) error = '拆單需填入至少 2 組交貨資料（交貨日期+數量）';
    }
    // N（SL/拆 Schedule Line）：至少需要 1 組有效交期
    if (agreeCode === 'N' && !error && mode === 'schedule-line') {
      if (!deliveries.some(d => d.date && isValidDateStr(d.date))) error = '同意碼 N 需填入至少一組新交期';
    }
    // X（不接單）不需要交期
    if ((agreeCode === 'Y' || agreeCode === 'N') && !error) {
      for (const d of deliveries) { if (d.date && !isValidDateStr(d.date)) { error = `日期格式錯誤: "${d.date}"`; break; } }
    }
    // 過去日期驗證
    if ((agreeCode === 'Y' || agreeCode === 'N') && !error) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      for (const d of deliveries) {
        if (d.date && isValidDateStr(d.date)) {
          const [y, m, day] = d.date.split('/').map(Number);
          if (new Date(y, m - 1, day) < today) { error = `交貨日期不得為過去日期: "${d.date}"`; break; }
        }
      }
    }
    // 交貨量加總驗證
    if ((agreeCode === 'Y' || agreeCode === 'N') && !error && matched) {
      const validDels = deliveries.filter(d => d.date && d.qty > 0);
      if (validDels.length > 0) {
        const totalDeliveryQty = validDels.reduce((s, d) => s + d.qty, 0);
        const matchedOrderQty = matched.orderQty ?? 0;
        if (matchedOrderQty > 0 && totalDeliveryQty !== matchedOrderQty) {
          error = `交貨量加總 ${totalDeliveryQty} ≠ 訂貨量 ${matchedOrderQty}`;
        }
      }
    }
    rows.push({
      rowIndex, orderNo, orderSeq, materialNo: (f[idxMaterial] || '').trim(),
      comparePrice: (f[idxPrice] || '').trim(), currency: (f[idxCurrency] || '').trim(),
      expectedDelivery: normalizeDateStr((f[idxExpDel] || '').trim()), orderQty: (f[idxOrderQty] || '').trim(),
      unit: (f[idxUnit] || '').trim(), agreeCode, deliveries, rejectReason,
      schedLineIndex, newSeq1, newSeq2, matchedOrder: matched, error, skipReason, isValid: !error,
      replyType,
    });
  }
  // 新格式但無資料列時，fileMode 仍為 unknown → 預設 schedule-line
  if (isNewFormat && fileMode === 'unknown') fileMode = 'schedule-line';
  return {
    mode: fileMode, totalRows: rows.length,
    agreeRows: rows.filter(r => r.agreeCode === 'Y' && r.isValid),
    disagreeRows: rows.filter(r => r.agreeCode === 'N' && r.isValid),
    rejectOrderRows: rows.filter(r => r.agreeCode === 'X' && r.isValid),
    skipRows: rows.filter(r => r.agreeCode === '' && r.isValid),
    errorRows: rows.filter(r => !r.isValid),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6) Batch Reply Import Overlay
// ═══════════════════════════════════════════════════════════════════════════════
interface BatchReplyImportOverlayProps {
  allOrders: OrderRow[];
  onConfirm: (result: BatchReplyImportResult) => void;
  onClose: () => void;
  /** 換貨(J)單不接受「不接單」，傳 true 隱藏 X 相關選項 */
  hideRejectOption?: boolean;
}

export function BatchReplyImportOverlay({ allOrders, onConfirm, onClose, hideRejectOption = false }: BatchReplyImportOverlayProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [batchResult, setBatchResult] = useState<BatchReplyImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setFileName(file.name); setParseError('');
    const isXlsx = /\.(xlsx|xls)$/i.test(file.name);
    if (isXlsx) {
      // Read XLSX → convert to CSV string → parse
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array', cellDates: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const csvContent = XLSX.utils.sheet_to_csv(ws, { dateNF: 'yyyy/mm/dd' });
          const result = parseBatchReplyCsv(csvContent, allOrders);
          if (result.mode === 'unknown') {
            setParseError('無法辨識檔案格式，請確認是由「下載批次回覆」匯出的檔案（標題需含「同意碼」）');
            return;
          }
          setBatchResult(result); setStep('preview');
        } catch {
          setParseError('無法讀取 Excel 檔案，請確認檔案格式正確');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Read as CSV text
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = parseBatchReplyCsv(content, allOrders);
        if (result.mode === 'unknown') {
          setParseError('無法辨識 CSV 格式，請確認是由「下載批次回覆」匯出的檔案（標題需含「同意碼」）');
          return;
        }
        setBatchResult(result); setStep('preview');
      };
      reader.readAsText(file, 'UTF-8');
    }
  }, [allOrders]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processFile(f); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (
      f.name.endsWith('.csv') || f.type === 'text/csv' ||
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls') ||
      f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      f.type === 'application/vnd.ms-excel'
    )) processFile(f);
  };
  const actionCount = batchResult ? batchResult.agreeRows.length + batchResult.disagreeRows.length + (hideRejectOption ? 0 : batchResult.rejectOrderRows.length) : 0;
  const modeLabel = batchResult?.mode === 'split-order' ? '拆單 (IT)' : '拆 Schedule Line (SL)';

  return (
    <div className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]" onClick={onClose}>
      <div className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'upload' ? '560px' : '1060px', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <Upload size={22} className="text-[#005eb8]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              {step === 'upload' ? '批次上傳回覆' : `批次回覆預覽 — ${modeLabel}`}
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
            <X size={20} className="text-[#637381]" />
          </div>
        </div>
        {/* Upload */}
        {step === 'upload' && (
          <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
                請上傳廠商回填的「批次回覆」CSV，系統自動辨識格式（拆 Schedule Line / 拆單）。
              </p>
              <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">同意碼說明：</p>
                <div className="flex items-center gap-[6px]">
                  <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">Y</span> — 執行【訂單確認】，推進至 B</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <XCircle size={14} className="text-[#ff5630] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">N</span> — 執行【調整單據】，需填新交期，推進至 B</p>
                </div>
                {!hideRejectOption && (
                <div className="flex items-center gap-[6px]">
                  <Package size={14} className="text-[#637381] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">X</span> — 執行【不接單】，推進至 B</p>
                </div>
                )}
                <div className="flex items-center gap-[6px]">
                  <div className="w-[14px] h-[14px] flex items-center justify-center shrink-0"><div className="w-[6px] h-[6px] bg-[#919eab] rounded-full" /></div>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">空白 — 不處理</p>
                </div>
              </div>
            </div>
            {parseError && (
              <div className="flex items-start gap-[8px] bg-[rgba(255,171,0,0.08)] rounded-[8px] px-[14px] py-[10px]">
                <AlertTriangle size={16} className="text-[#b76e00] shrink-0 mt-[2px]" />
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#b76e00]">{parseError}</p>
              </div>
            )}
            <div className={`flex flex-col items-center justify-center gap-[12px] border-2 border-dashed rounded-[12px] py-[40px] px-[20px] cursor-pointer transition-colors ${isDragOver ? 'border-[#005eb8] bg-[rgba(0,94,184,0.04)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#005eb8] hover:bg-[rgba(0,94,184,0.02)]'}`}
              onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <Upload size={40} className="text-[#919eab]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center">拖曳檔案至此處，或<span className="text-[#005eb8] font-semibold underline">點擊選擇檔案</span></p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">支援由「下載批次回覆」匯出的 .xlsx 或 .csv</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
            </div>
          </div>
        )}
        {/* Preview */}
        {step === 'preview' && batchResult && (<>
          <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
            <div className="flex items-center gap-[10px] shrink-0">
              <FileSpreadsheet size={16} className="text-[#637381]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
              <div className={`px-[8px] h-[22px] flex items-center rounded-[4px] ${batchResult.mode === 'split-order' ? 'bg-[rgba(255,86,48,0.12)]' : 'bg-[rgba(142,51,255,0.12)]'}`}>
                <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] ${batchResult.mode === 'split-order' ? 'text-[#ff5630]' : 'text-[#8e33ff]'}`}>{modeLabel}</p>
              </div>
            </div>
            <div className="flex gap-[8px] flex-wrap shrink-0">
              {/* 共計 tag：包含 Y/N/X/不處理的括弧小字 */}
              {(() => {
                const valid = batchResult.agreeRows.length + batchResult.disagreeRows.length + (hideRejectOption ? 0 : batchResult.rejectOrderRows.length);
                const err = batchResult.errorRows.length;
                const skip = batchResult.skipRows.length;
                const parts: string[] = [];
                if (valid > 0) parts.push(`有效 ${valid}`);
                if (err > 0) parts.push(`錯誤 ${err}`);
                if (skip > 0) parts.push(`不處理 ${skip}`);
                const subtitle = parts.length > 0 ? `（${parts.join('、')}）` : '';
                return (
                  <div className="flex items-center gap-[6px] px-[10px] h-[28px] bg-[rgba(145,158,171,0.12)] rounded-[6px]">
                    <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#1c252e]">
                      共計 {batchResult.totalRows} 筆
                    </p>
                    {subtitle && (
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#637381]">{subtitle}</p>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
              {(() => {
                const allRows = [
                  ...batchResult.errorRows,
                  ...batchResult.agreeRows,
                  ...batchResult.disagreeRows,
                  ...(!hideRejectOption ? batchResult.rejectOrderRows : []),
                  ...batchResult.skipRows,
                ];
                const maxDeliveries = Math.max(2, ...allRows.map(r => r.deliveries.length));
                const isSplitOrder = batchResult.mode === 'split-order';
                const deliveryHeaders: string[] = [];
                for (let i = 1; i <= maxDeliveries; i++) {
                  if (isSplitOrder) deliveryHeaders.push(`新序號${i}`);
                  deliveryHeaders.push(`交貨日期${i}`, `量${i}`);
                }
                return (
                  <table className="w-full min-w-[1200px]">
                    <thead className="sticky top-0 z-[1]"><tr className="bg-[#f4f6f8]">
                      {['行','同意碼','訂單號碼','序號','料號','預計交期','訂貨量',...deliveryHeaders,'驗證'].map(h => (
                        <th key={h} className="px-[8px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {allRows.map(r => (
                        <BRRow key={`${r.agreeCode}${r.rowIndex}`} row={r} maxDeliveries={maxDeliveries} isSplitOrder={isSplitOrder} />
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
            <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
              onClick={() => { setStep('upload'); setBatchResult(null); setFileName(''); }}>重新選擇檔案</button>
            <div className="flex gap-[12px]">
              <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={onClose}>取消</button>
              <button className="h-[36px] px-[20px] rounded-[8px] bg-[#005eb8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#004a94] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onConfirm(batchResult)} disabled={actionCount === 0}>確認執行 ({actionCount} 筆)</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

function BRRow({ row, maxDeliveries = 2, isSplitOrder = false }: { row: BatchReplyParsedRow; maxDeliveries?: number; isSplitOrder?: boolean }) {
  const c = "px-[8px] py-[7px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]";
  const badge = () => {
    if (!row.isValid) return <div className="bg-[rgba(255,171,0,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px] whitespace-nowrap"><AlertTriangle size={12} className="text-[#b76e00]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b76e00]">錯誤</p></div>;
    if (row.agreeCode === 'Y') return <div className="bg-[rgba(34,197,94,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px] whitespace-nowrap"><CheckCircle2 size={12} className="text-[#118d57]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#118d57]">Y 訂單確認</p></div>;
    if (row.agreeCode === 'N') return <div className="bg-[rgba(255,86,48,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px] whitespace-nowrap"><XCircle size={12} className="text-[#b71d18]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b71d18]">{isSplitOrder ? 'N 拆單' : 'N 拆 SL'}</p></div>;
    if (row.agreeCode === 'X') return <div className="bg-[rgba(99,115,129,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px] whitespace-nowrap"><Package size={12} className="text-[#454f5b]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#454f5b]">X 不接單</p></div>;
    return <p className="text-[12px] text-[#919eab]">—</p>;
  };
  const bg = !row.isValid ? 'bg-[rgba(255,171,0,0.04)]' : row.skipReason ? 'bg-[rgba(145,158,171,0.04)]' : row.agreeCode === 'Y' ? 'bg-[rgba(34,197,94,0.02)]' : row.agreeCode === 'N' ? 'bg-[rgba(255,86,48,0.02)]' : row.agreeCode === 'X' ? 'bg-[rgba(99,115,129,0.02)]' : '';

  // 動態建立交貨期資料格
  const deliveryCells: React.ReactNode[] = [];
  for (let i = 0; i < maxDeliveries; i++) {
    const d = row.deliveries[i];
    // 新序號欄（split-order 模式才有）
    if (isSplitOrder) {
      const seqVal = d?.newOrderSeq;
      const isOriginal = i === 0;
      deliveryCells.push(
        <td key={`seq${i}`} className={c}>
          {seqVal
            ? <span className={`font-semibold ${isOriginal ? 'text-[#637381]' : 'text-[#005eb8]'}`}>{seqVal}</span>
            : <span className="text-[#919eab]">—</span>}
        </td>
      );
    }
    if (row.agreeCode === 'X') {
      if (i === 0) {
        deliveryCells.push(
          <td key={`d${i}`} className={c}><span style={{ color: '#ff5630', textDecoration: 'line-through', textDecorationColor: '#ff5630' }}>{row.expectedDelivery || '—'}</span></td>,
          <td key={`q${i}`} className={c}>—</td>
        );
      } else {
        deliveryCells.push(
          <td key={`d${i}`} className={`${c} text-[#919eab]`}>—</td>,
          <td key={`q${i}`} className={`${c} text-[#919eab]`}>—</td>
        );
      }
    } else {
      const hasDate = !!(d?.date);
      deliveryCells.push(
        <td key={`d${i}`} className={`${c} ${hasDate ? 'text-[#005eb8] font-semibold' : 'text-[#919eab]'}`}>{d?.date || '—'}</td>,
        <td key={`q${i}`} className={c}>{d?.qty || '—'}</td>
      );
    }
  }

  return (
    <tr className={`border-t border-[rgba(145,158,171,0.08)] ${bg}`}>
      <td className={`${c} text-[#919eab]`}>{row.rowIndex}</td>
      <td className="px-[8px] py-[7px]">{badge()}</td>
      <td className={c}>{row.orderNo}</td><td className={c}>{row.orderSeq}</td>
      <td className={`${c} truncate max-w-[110px]`}>{row.materialNo}</td>
      <td className={c}>{row.expectedDelivery}</td><td className={c}>{row.orderQty}</td>
      {deliveryCells}
      <td className="px-[8px] py-[7px]">{!row.isValid ? <p className="text-[11px] text-[#b76e00] max-w-[140px]" title={row.error}>{row.error}</p> : row.skipReason ? <p className="text-[11px] text-[#919eab] max-w-[140px]" title={row.skipReason}>{row.skipReason}</p> : row.agreeCode ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <span className="text-[#919eab] text-[12px]">—</span>}</td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7) Batch Correction — 批次建立修正單（匯出範本 + 匯入解析 + Overlay）
// ═══════════════════════════════════════════════════════════════════════════════

const BATCH_CORRECTION_HEADERS = [
  '訂單號碼', '訂單序號', '廠商名稱', '廠商編號', '料號', '品名',
  '預計交期', '訂貨量', '交貨量', '驗收量', '在途量',
  '修正碼', '新廠商交期', '新交貨量', '新料號', '備註',
];

export function exportBatchCorrectionTemplate(orders: OrderRow[], filename?: string) {
  const eligible = orders.filter(o => o.status === 'CK' || o.status === 'B');
  const instructionRows: (string | number | null)[][] = [
    ['', '', '', '', '', '', '', '', '', '', '',
      '修正碼說明：A＝不拆單（需填新廠商交期 或/及 新交貨量）；B＝拆單（需填新交貨量，原序號保留該數量，剩餘量自動拆至新序號）', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '',
      '空白＝不處理。新交貨量規則：訂貨量 ≥ 新交貨量 ≥ 驗收量+在途量。新料號若填寫：A碼覆蓋原料號，B碼套用至拆出的新序號。', '', '', '', ''],
  ];
  const rows: (string | number | null)[][] = eligible.map(order => [
    order.orderNo, order.orderSeq, order.vendorName, order.vendorCode,
    order.materialNo, order.productName, order.expectedDelivery,
    order.orderQty, (order as any).deliveryQty ?? order.orderQty,
    order.acceptQty, order.inTransitQty,
    '', '', '', '', '',
  ]);
  const allRows: (string | number | null)[][] = [BATCH_CORRECTION_HEADERS, ...instructionRows, ...rows];
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const defaultName = filename || `批次建立修正單_${datePart}.csv`;

  // Use SheetJS writeFile — .csv extension auto-outputs CSV format (same mechanism as other working exports)
  buildXlsx('批次修正單', allRows, defaultName);
  return eligible.length;
}

// ───────────────────────────────────────────────────────────────────────────
// 7b) 批次建立修正單（不拆單）— 獨立範本 + 解析 + Overlay
// ───────────────────────────────────────────────────────────────────────────

const BATCH_CORRECTION_ADJUST_HEADERS = [
  '訂單號碼', '訂單序號', '訂貨量', '驗收量', '在途量',
  '廠商名稱', '廠商編號',
  '修正碼',
  '料號', '新料號',
  '品名', '預計交期',
  '新廠商交期1', '新交貨量1',
  '新廠商交期2', '新交貨量2',
];

const BATCH_CORRECTION_SPLIT_HEADERS = [
  '訂單號碼', '訂單序號', '廠商名稱', '廠商編號', '料號', '品名',
  '預計交期', '訂貨量', '驗收量', '在途量',
  '拆單數',
  '新廠商交期1', '交貨量1', '料號1',
  '新廠商交期2', '交貨量2', '料號2',
];

export function exportBatchCorrectionAdjustTemplate(orders: OrderRow[], filename?: string) {
  const eligible = orders.filter(o => o.status === 'CK');
  // 說明列：文字在 A 欄（index 0）
  const instructionRows: (string | number | null)[][] = [
    ['需調整的單請於【修正碼】填A，要刪單請填D，留白者視同不處理',
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  const rows: (string | number | null)[][] = eligible.map(order => [
    order.orderNo, order.orderSeq,
    order.orderQty,        // 訂貨量
    order.acceptQty,       // 驗收量
    order.inTransitQty,    // 在途量
    order.vendorName, order.vendorCode,
    '',                    // 修正碼（A=調整，留白=略過）
    order.materialNo,      // 料號
    '',                    // 新料號（用戶填寫）
    order.productName, order.expectedDelivery,  // 品名, 預計交期
    '', '',                // 新廠商交期1, 新交貨量1
    '', '',                // 新廠商交期2, 新交貨量2
  ]);
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  // 說明列在前，空白列，標題列在後（對應圖1格式：說明列→空白列→欄名列→資料）
  const emptyRow: (string)[] = [];
  buildXlsx('批次修正單(不拆單)', [...instructionRows, emptyRow, BATCH_CORRECTION_ADJUST_HEADERS, ...rows],
    filename || `批次建立修正單(不拆單)_${datePart}.xlsx`);
  return eligible.length;
}

export function exportBatchCorrectionSplitTemplate(orders: OrderRow[], filename?: string) {
  const eligible = orders.filter(o => o.status === 'CK');
  // 說明列：3 列說明，文字全部在 A 欄（index 0）
  const instructionRows: (string | number | null)[][] = [
    ['【料號】欄位若不需填寫請直接留白',
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['要拆單的單需在【拆單數】填入拆單數量，最少為2，空白者視同不處理',
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['拆單數3以上者，請於Q欄後自行補上交貨資料(新廠商交期3+交貨量3+料號3)，以此類推',
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ];
  const rows: (string | number | null)[][] = eligible.map(order => [
    order.orderNo, order.orderSeq, order.vendorName, order.vendorCode,
    order.materialNo, order.productName, order.expectedDelivery,
    order.orderQty,                               // 訂貨量
    order.acceptQty,                              // 驗收量
    order.inTransitQty,                           // 在途量
    '',   // 拆單數
    '', '', '', // 新廠商交期1, 交貨量1, 料號1
    '', '', '', // 新廠商交期2, 交貨量2, 料號2
  ]);
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  // 說明列在前，空白列，標題列在後（對應圖2格式：3列說明→空白列→欄名列→資料）
  const emptyRowSplit: (string)[] = [];
  buildXlsx('批次修正單(拆單)', [...instructionRows, emptyRowSplit, BATCH_CORRECTION_SPLIT_HEADERS, ...rows],
    filename || `批次建立修正單_拆單_${datePart}.xlsx`);
  return eligible.length;
}

// ── 不拆單調整 Parse ─────────────────────────────────────────────────────────

export interface CorrectionAdjustParsedRow {
  rowIndex: number; orderNo: string; orderSeq: string;
  vendorName: string; vendorCode: string; materialNo: string; productName: string;
  expectedDelivery: string; orderQty: string; deliveryQty: string;
  acceptQty: string; inTransitQty: string;
  newMaterialNo: string;
  schedules: { newVendorDate: string; newQty: string }[];
  remark: string;
  isDelete?: boolean;
  matchedOrder?: OrderRow; error?: string; skipReason?: string; isValid: boolean;
}

export interface CorrectionAdjustImportResult {
  totalRows: number;
  validRows: CorrectionAdjustParsedRow[];
  deleteRows: CorrectionAdjustParsedRow[];
  skipRows: CorrectionAdjustParsedRow[];
  errorRows: CorrectionAdjustParsedRow[];
}

function isAdjustInstructionRow(fields: string[]): boolean {
  const colA = (fields[0] || '').trim();
  if (colA !== '') return false;
  // 新欄位格式：說明列在 colH（index 7）
  const colH = (fields[7] || '').trim();
  if (/不拆單調整|不須調整|留白/.test(colH)) return true;
  if (!colA && !fields[1]?.trim() && !fields[2]?.trim() && colH.length > 5) return true;
  return false;
}

export function parseBatchCorrectionAdjustCsv(content: string, allOrders: OrderRow[]): CorrectionAdjustImportResult {
  const clean = content.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter(l => l.trim() !== '');
  const empty: CorrectionAdjustImportResult = { totalRows: 0, validRows: [], deleteRows: [], skipRows: [], errorRows: [] };
  if (lines.length < 2) return empty;
  // detect header — 新格式含「修正碼」欄，舊格式含「新料號」或「新廠商交期1」
  // 動態找標題列：說明列在最前，第一個含「訂單號碼」的列才是標題列
  const headerLineIdx = lines.findIndex(l => {
    const f = parseCsvLine(l);
    return f[0]?.trim() === '訂單號碼';
  });
  if (headerLineIdx < 0) return empty;
  const headerFields = parseCsvLine(lines[headerLineIdx]);
  const isNewFormat = headerFields.includes('修正碼');
  // 區分三代格式：
  //   V3：有「修正碼」+「新料號」(無數字)→ 現在最新格式
  //   V2：有「修正碼」但無「料號」 → 中間版本（既有程式碼中，對下相容）
  //   V1：有「修正碼」+「新料號1」 → 舊新格式
  const isNewFormatV3 = isNewFormat && headerFields.includes('新料號') && !headerFields.includes('新料號1');
  const isNewFormatV2 = isNewFormat && !headerFields.includes('料號');   // 無料號欄版
  const isNewFormatV1 = isNewFormat && headerFields.includes('新料號1');             // 舊新格式
  const isOldFormat = !isNewFormat && headerFields.includes('新廠商交期1'); // 最舊格式：無修正碼欄
  if (!isNewFormat && !isOldFormat) return empty;
  const dataLines = lines.slice(headerLineIdx + 1);
  const rows: CorrectionAdjustParsedRow[] = [];
  for (let i = 0; i < dataLines.length; i++) {
    const f = parseCsvLine(dataLines[i]);
    if (isAdjustInstructionRow(f)) continue;
    if (f.every(x => x.trim() === '')) continue;
    const rowIndex = i + 2;
    const orderNo = (f[0] || '').trim();
    const orderSeq = (f[1] || '').trim();
    if (!orderNo) continue;

    let deliveryQty: string, acceptQty: string, inTransitQty: string;
    let vendorName: string, vendorCode: string;
    let correctionCode: string;
    let materialNo: string, newMaterialNo: string, productName: string;
    let expectedDelivery: string, orderQty: string;
    let schedules: { newVendorDate: string; newQty: string }[] = [];
    let remark: string;

    if (isNewFormatV3) {
      // 最新格式：A訂單號碼 B訂單序號 C訂貨量 D驗收量 E在途量 F廠商名稱 G廠商編號 H修正碼
      //                    I料號 J新料號 K品名 L預計交期 M新廠商交期1 N新交貨量1 O新廠商交期2 P新交貨量2
      orderQty      = (f[2] || '').trim();
      deliveryQty   = (f[2] || '').trim();
      acceptQty     = (f[3] || '').trim();
      inTransitQty  = (f[4] || '').trim();
      vendorName    = (f[5] || '').trim();
      vendorCode    = (f[6] || '').trim();
      correctionCode = (f[7] || '').trim().toUpperCase();
      materialNo    = (f[8] || '').trim();
      newMaterialNo = (f[9] || '').trim();
      productName   = (f[10] || '').trim();
      expectedDelivery = normalizeDateStr((f[11] || '').trim());
      const date1 = normalizeDateStr((f[12] || '').trim()); // 新廠商交期1
      const qty1  = (f[13] || '').trim();                   // 新交貨量1
      const date2 = normalizeDateStr((f[14] || '').trim()); // 新廠商交期2
      const qty2  = (f[15] || '').trim();                   // 新交貨量2
      if (date1 || qty1) schedules.push({ newVendorDate: date1, newQty: qty1 });
      if (date2 || qty2) schedules.push({ newVendorDate: date2, newQty: qty2 });
      remark = '';
    } else if (isNewFormatV2) {
      // 中間版本（無料號）：A訂單號碼 B訂單序號 C訂貨量 D驗收量 E在途量 F廠商名稱 G廠商編號 H修正碼
      //                    I品名 J預計交期 K新廠商交期1 L新交貨量1 M新廠商交期2 N新交貨量2
      orderQty      = (f[2] || '').trim();
      deliveryQty   = (f[2] || '').trim(); // 同訂貨量
      acceptQty     = (f[3] || '').trim();
      inTransitQty  = (f[4] || '').trim();
      vendorName    = (f[5] || '').trim();
      vendorCode    = (f[6] || '').trim();
      correctionCode = (f[7] || '').trim().toUpperCase();
      materialNo    = '';
      newMaterialNo = '';
      productName   = (f[8] || '').trim();
      expectedDelivery = normalizeDateStr((f[9] || '').trim());
      const date1 = normalizeDateStr((f[10] || '').trim()); // 新廠商交期1
      const qty1  = (f[11] || '').trim();                   // 新交貨量1
      const date2 = normalizeDateStr((f[12] || '').trim()); // 新廠商交期2
      const qty2  = (f[13] || '').trim();                   // 新交貨量2
      if (date1 || qty1) schedules.push({ newVendorDate: date1, newQty: qty1 });
      if (date2 || qty2) schedules.push({ newVendorDate: date2, newQty: qty2 });
      remark = '';
    } else if (isNewFormat) {
      // 舊新格式（有料號）：A訂單號碼 B訂單序號 C交貨量 D驗收量 E在途量 F廠商名稱 G廠商編號 H修正碼
      //                    I料號 J新料號1 K品名 L預計交期 M新廠商交期1 N新廠商交期2 O訂貨量 P新交貨量1 Q新交貨量2
      deliveryQty   = (f[2] || '').trim();
      acceptQty     = (f[3] || '').trim();
      inTransitQty  = (f[4] || '').trim();
      vendorName    = (f[5] || '').trim();
      vendorCode    = (f[6] || '').trim();
      correctionCode = (f[7] || '').trim().toUpperCase();
      materialNo    = (f[8] || '').trim();
      newMaterialNo = (f[9] || '').trim();
      productName   = (f[10] || '').trim();
      expectedDelivery = normalizeDateStr((f[11] || '').trim());
      orderQty      = (f[14] || '').trim();
      const date1 = normalizeDateStr((f[12] || '').trim());
      const qty1  = (f[15] || '').trim();
      const date2 = normalizeDateStr((f[13] || '').trim());
      const qty2  = (f[16] || '').trim();
      if (date1 || qty1) schedules.push({ newVendorDate: date1, newQty: qty1 });
      if (date2 || qty2) schedules.push({ newVendorDate: date2, newQty: qty2 });
      remark = '';
    } else {
      // 舊欄位格式（向下相容）
      vendorName    = (f[2] || '').trim();
      vendorCode    = (f[3] || '').trim();
      materialNo    = (f[4] || '').trim();
      productName   = (f[5] || '').trim();
      expectedDelivery = normalizeDateStr((f[6] || '').trim());
      orderQty      = (f[7] || '').trim();
      deliveryQty   = (f[8] || '').trim();
      acceptQty     = (f[9] || '').trim();
      inTransitQty  = (f[10] || '').trim();
      newMaterialNo = (f[11] || '').trim();
      correctionCode = '';
      for (let p = 0; p < 3; p++) {
        const dateRaw = normalizeDateStr((f[12 + p * 2] || '').trim());
        const qtyRaw = (f[13 + p * 2] || '').trim();
        if (dateRaw || qtyRaw) schedules.push({ newVendorDate: dateRaw, newQty: qtyRaw });
      }
      remark = (f[18] || '').trim();
    }

    // 若修正碼為空（不拆單調整填 A）且無任何調整欄位 → 跳過
    if (isNewFormat && correctionCode === '' && schedules.length === 0 && !newMaterialNo) {
      const matched2 = allOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
      rows.push({ rowIndex, orderNo, orderSeq, vendorName, vendorCode, materialNo, productName,
        expectedDelivery, orderQty, deliveryQty, acceptQty, inTransitQty,
        newMaterialNo, schedules, remark, matchedOrder: matched2, isValid: true });
      continue;
    }

    let error: string | undefined;
    const matched = allOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
    if (!matched) {
      if (!newMaterialNo && schedules.length === 0 && correctionCode !== 'D') {
        rows.push({ rowIndex, orderNo, orderSeq, vendorName, vendorCode, materialNo, productName,
          expectedDelivery, orderQty, deliveryQty, acceptQty, inTransitQty,
          newMaterialNo, schedules, remark, isValid: true });
        continue;
      }
      if (correctionCode !== 'D') error = `找不到對應訂單 (${orderNo} / ${orderSeq})`;
    }
    let skipReason: string | undefined;
    if (matched && matched.status !== 'CK') {
      skipReason = `狀態 ${matched.status} 不允許開立修正單（僅限 CK）`;
    }
    // D碼 → 刪單，不需要交貨資料，直接推入 deleteRow
    if (correctionCode === 'D') {
      if (schedules.length > 0 || newMaterialNo) {
        rows.push({ rowIndex, orderNo, orderSeq, vendorName, vendorCode, materialNo, productName,
          expectedDelivery, orderQty, deliveryQty, acceptQty, inTransitQty,
          newMaterialNo, schedules, remark, matchedOrder: matched, isDelete: true,
          error: '修正碼 D（刪單）後方不可填寫交貨資料或新料號', isValid: false });
      } else {
        rows.push({ rowIndex, orderNo, orderSeq, vendorName, vendorCode, materialNo, productName,
          expectedDelivery, orderQty, deliveryQty, acceptQty, inTransitQty,
          newMaterialNo, schedules, remark, matchedOrder: matched, isDelete: true, isValid: true });
      }
      continue;
    }
    if (!skipReason && !error && schedules.length === 0 && !newMaterialNo) {
      rows.push({ rowIndex, orderNo, orderSeq, vendorName, vendorCode, materialNo, productName,
        expectedDelivery, orderQty, deliveryQty, acceptQty, inTransitQty,
        newMaterialNo, schedules, remark, matchedOrder: matched, isValid: true });
      continue;
    }
    if (!skipReason && !error && matched) {
      const aQ = matched.acceptQty ?? 0, iQ = matched.inTransitQty ?? 0;
      const minQ = aQ + iQ;
      const oQ = matched.orderQty ?? 0; // 上限為訂貨量
      // 今天日期（格式 YYYY/MM/DD）
      const today = new Date();
      const todayStr = `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2,'0')}/${String(today.getDate()).padStart(2,'0')}`;
      for (const s of schedules) {
        if (s.newVendorDate && !isValidDateStr(s.newVendorDate)) { error = `日期格式錯誤: "${s.newVendorDate}"`; break; }
        if (s.newVendorDate && s.newVendorDate < todayStr) { error = `新廠商交期 "${s.newVendorDate}" 不可為過去日期`; break; }
        if (s.newQty) {
          const q = parseInt(s.newQty, 10);
          if (isNaN(q) || q <= 0) { error = `新交貨量格式錯誤: "${s.newQty}"（需大於 0）`; break; }
        }
      }
      if (!error && schedules.length > 0) {
        const totalNewQty = schedules.reduce((s, r) => s + (parseInt(r.newQty, 10) || 0), 0);
        if (totalNewQty > oQ) error = `新交貨量合計 ${totalNewQty} 超過訂貨量 ${oQ}`;
        else if (minQ > 0 && totalNewQty < minQ) error = `新交貨量合計 ${totalNewQty} 不可低於驗收量+在途量 ${minQ}`;
      }
    }
    rows.push({
      rowIndex, orderNo, orderSeq, vendorName, vendorCode, materialNo, productName,
      expectedDelivery, orderQty, deliveryQty, acceptQty, inTransitQty,
      newMaterialNo, schedules, remark, matchedOrder: matched, error, skipReason, isValid: !error,
    });
  }
  const hasAction = (r: CorrectionAdjustParsedRow) => r.schedules.length > 0 || !!r.newMaterialNo || !!r.isDelete;
  return {
    totalRows: rows.length,
    validRows: rows.filter(r => r.isValid && !r.skipReason && hasAction(r) && !r.isDelete),
    deleteRows: rows.filter(r => r.isValid && !!r.isDelete),
    skipRows: rows.filter(r => r.isValid && (r.skipReason || !hasAction(r))),
    errorRows: rows.filter(r => !r.isValid),
  };
}

// ── 拆單 Parse ───────────────────────────────────────────────────────────────

export interface CorrectionSplitParsedRow {
  rowIndex: number; orderNo: string; orderSeq: string;
  vendorName: string; vendorCode: string; materialNo: string; productName: string;
  expectedDelivery: string; orderQty: string; deliveryQty: string;
  acceptQty: string; inTransitQty: string;
  splitCount: string;
  splits: { newVendorDate: string; qty: string; newMaterialNo: string }[];
  remark: string;
  matchedOrder?: OrderRow; error?: string; skipReason?: string; isValid: boolean;
}

export interface CorrectionSplitImportResult {
  totalRows: number;
  validRows: CorrectionSplitParsedRow[];
  skipRows: CorrectionSplitParsedRow[];
  errorRows: CorrectionSplitParsedRow[];
}

function isSplitInstructionRow(fields: string[]): boolean {
  const colA = (fields[0] || '').trim();
  // 新格式說明列：A欄有「科驗」說明文字，或 K欄(index 10)有拆單數說明文字且A欄空白
  if (colA !== '') {
    if (/【科驗】|欄位若不需填寫/.test(colA)) return true;
    return false;
  }
  const colK = (fields[10] || '').trim();
  if (/拆單數|合計|序號|Q欄|自行補上/.test(colK)) return true;
  // 舊格式說明列：L欄(index 11)
  const colL = (fields[11] || '').trim();
  if (/拆單數|合計|序號/.test(colL)) return true;
  if (!colA && !fields[1]?.trim() && !fields[2]?.trim() && (colK.length > 5 || colL.length > 5)) return true;
  return false;
}

export function parseBatchCorrectionSplitCsv(content: string, allOrders: OrderRow[]): CorrectionSplitImportResult {
  const clean = content.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter(l => l.trim() !== '');
  const empty: CorrectionSplitImportResult = { totalRows: 0, validRows: [], skipRows: [], errorRows: [] };
  if (lines.length < 2) return empty;
  // 動態找標題列：說明列在最前，第一個含「訂單號碼」的列才是標題列
  const headerLineIdx = lines.findIndex(l => {
    const f = parseCsvLine(l);
    return f[0]?.trim() === '訂單號碼';
  });
  if (headerLineIdx < 0) return empty;
  const headerFields = parseCsvLine(lines[headerLineIdx]);
  if (!headerFields.includes('拆單數') && !headerFields.includes('交貨量1')) return empty;
  // 判斷是否為新格式（無獨立的「交貨量」欄；舊格式在訂貨量後有「交貨量」欄）
  const hasStandaloneDeliveryQty = headerFields.includes('交貨量'); // 舊格式才有此欄（交貨量1等不算）
  const isNewSplitFormat = !hasStandaloneDeliveryQty && headerFields.includes('拆單數');
  const dataLines = lines.slice(headerLineIdx + 1);
  const rows: CorrectionSplitParsedRow[] = [];
  for (let i = 0; i < dataLines.length; i++) {
    const f = parseCsvLine(dataLines[i]);
    if (isSplitInstructionRow(f)) continue;
    if (f.every(x => x.trim() === '')) continue;
    const rowIndex = i + 2;
    const orderNo = (f[0] || '').trim();
    const orderSeq = (f[1] || '').trim();
    if (!orderNo) continue;
    // 新格式：拆單數在 index 10，舊格式在 index 11
    const splitCountIdx = isNewSplitFormat ? 10 : 11;
    const splitCount = (f[splitCountIdx] || '').trim();
    // 新格式：第1組從 index 11，舊格式從 index 12
    const firstGroupIdx = isNewSplitFormat ? 11 : 12;
    const splits: { newVendorDate: string; qty: string; newMaterialNo: string }[] = [];
    for (let p = 0; p < 3; p++) {
      const dateRaw = normalizeDateStr((f[firstGroupIdx + p * 3] || '').trim());
      const qtyRaw = (f[firstGroupIdx + p * 3 + 1] || '').trim();
      const matRaw = (f[firstGroupIdx + p * 3 + 2] || '').trim();
      if (qtyRaw || dateRaw || matRaw) splits.push({ newVendorDate: dateRaw, qty: qtyRaw, newMaterialNo: matRaw });
    }
    // 備註：新格式無固定備註欄（可能在後面），舊格式在 index 21
    const remark = isNewSplitFormat ? '' : (f[21] || '').trim();
    // 驗收量/在途量索引：新格式 8/9，舊格式 9/10
    const acceptQtyStr = isNewSplitFormat ? (f[8] || '') : (f[9] || '');
    const inTransitQtyStr = isNewSplitFormat ? (f[9] || '') : (f[10] || '');
    const deliveryQtyStr = isNewSplitFormat ? (f[7] || '') : (f[8] || ''); // 新格式用訂貨量，舊格式有獨立交貨量
    // 拆單數空白且無任何交期/量 → 略過（不調整）
    if (!splitCount && splits.length === 0) {
      rows.push({ rowIndex, orderNo, orderSeq, vendorName: f[2]||'', vendorCode: f[3]||'', materialNo: f[4]||'', productName: f[5]||'', expectedDelivery: normalizeDateStr(f[6]||''), orderQty: f[7]||'', deliveryQty: deliveryQtyStr, acceptQty: acceptQtyStr, inTransitQty: inTransitQtyStr, splitCount, splits, remark, isValid: true, skipReason: '未填拆單數，略過' });
      continue;
    }
    let error: string | undefined;
    const matched = allOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
    if (!matched) error = `找不到對應訂單 (${orderNo} / ${orderSeq})`;
    let skipReason: string | undefined;
    if (matched && matched.status !== 'CK') {
      skipReason = `狀態 ${matched.status} 不允許開立修正單（僅限 CK）`;
    }
    if (!skipReason && !error) {
      // 1. 拆單數必須 ≥ 2
      const splitCountNum = parseInt(splitCount, 10);
      if (!splitCount || isNaN(splitCountNum) || splitCountNum < 2) {
        error = '拆單數必須填 2 以上';
      } else if (splits.length !== splitCountNum) {
        // 2. 實際填寫組數必須等於拆單數
        error = `拆單數填 ${splitCountNum}，但只填了 ${splits.length} 組交期/交貨量（每組需同時填寫交期和交貨量）`;
      } else {
        // 3. 每組的交期和交貨量都必須有填
        // 今天日期（格式 YYYY/MM/DD）
        const today = new Date();
        const todayStr = `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2,'0')}/${String(today.getDate()).padStart(2,'0')}`;
        for (let gi = 0; gi < splits.length; gi++) {
          const s = splits[gi];
          if (!s.qty) { error = `第${gi + 1}期缺少交貨量`; break; }
          if (!s.newVendorDate) { error = `第${gi + 1}期缺少新廠商交期`; break; }
          if (s.newVendorDate && !isValidDateStr(s.newVendorDate)) { error = `第${gi + 1}期日期格式錯誤: "${s.newVendorDate}"`; break; }
          if (s.newVendorDate && s.newVendorDate < todayStr) { error = `第${gi + 1}期新廠商交期 "${s.newVendorDate}" 不可為過去日期`; break; }
        }
        if (!error) {
          // 4. 合計驗證：不超過訂貨量且不低於驗收量+在途量
          const totalSplitQty = splits.reduce((s, r) => s + (parseInt(r.qty, 10) || 0), 0);
          const oQ = matched ? (matched.orderQty ?? 0) : 0;
          const aQ = matched?.acceptQty ?? 0, iQ = matched?.inTransitQty ?? 0;
          if (matched && totalSplitQty > oQ) error = `各拆出量合計 ${totalSplitQty} 超過訂貨量 ${oQ}`;
          else if (matched && aQ + iQ > 0 && totalSplitQty < aQ + iQ) error = `各拆出量合計 ${totalSplitQty} 不可低於驗收量+在途量 ${aQ + iQ}`;
        }
      }
    }
    rows.push({
      rowIndex, orderNo, orderSeq, vendorName: f[2]||'', vendorCode: f[3]||'', materialNo: f[4]||'', productName: f[5]||'', expectedDelivery: normalizeDateStr(f[6]||''), orderQty: f[7]||'', deliveryQty: deliveryQtyStr, acceptQty: acceptQtyStr, inTransitQty: inTransitQtyStr,
      splitCount, splits, remark, matchedOrder: matched, error, skipReason, isValid: !error && !skipReason,
    });
  }
  return {
    totalRows: rows.length,
    validRows: rows.filter(r => r.isValid && !r.skipReason && r.splits.length >= 2),
    skipRows: rows.filter(r => !r.error && (r.skipReason || r.splits.length < 2)),
    errorRows: rows.filter(r => !!r.error),
  };
}

// ── 不拆單調整 Overlay ────────────────────────────────────────────────────────

interface BatchCorrectionAdjustImportOverlayProps {
  allOrders: OrderRow[];
  onConfirm: (result: CorrectionAdjustImportResult) => void;
  onClose: () => void;
}

export function BatchCorrectionAdjustImportOverlay({ allOrders, onConfirm, onClose }: BatchCorrectionAdjustImportOverlayProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [result, setResult] = useState<CorrectionAdjustImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setFileName(file.name); setParseError('');
    const isXlsx = /\.(xlsx|xls)$/i.test(file.name);
    const parse = (csvContent: string) => {
      const r = parseBatchCorrectionAdjustCsv(csvContent, allOrders);
      if (r.totalRows === 0) { setParseError('無法辨識檔案格式，請使用「下載批次建立（不拆單）」匯出的範本'); return; }
      setResult(r); setStep('preview');
    };
    if (isXlsx) {
      const reader = new FileReader();
      reader.onload = (e) => { try { const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array', cellDates: true }); parse(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]], { dateNF: 'yyyy/mm/dd' })); } catch { setParseError('無法讀取 Excel 檔案'); } };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => parse(e.target?.result as string);
      reader.readAsText(file, 'UTF-8');
    }
  }, [allOrders]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]" onClick={onClose}>
      <div className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'upload' ? '560px' : '1100px', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <FilePlus2 size={22} className="text-[#00a76f]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              {step === 'upload' ? '批次建立修正單（不拆單）' : '不拆單 — 匯入預覽'}
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}><X size={20} className="text-[#637381]" /></div>
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
            <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">欄位說明（不拆單）：</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 需調整的單請於【修正碼】填A，要刪單請填D，留白者視同不處理</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 各期合計不可低於驗收量＋在途量，且不可超過訂貨量</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 新廠商交期不可填入過去日期</p>
            </div>
            {parseError && <div className="flex items-start gap-[8px] bg-[rgba(255,171,0,0.08)] rounded-[8px] px-[14px] py-[10px]"><AlertTriangle size={16} className="text-[#b76e00] shrink-0 mt-[2px]" /><p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#b76e00]">{parseError}</p></div>}
            <div
              className={`flex flex-col items-center justify-center gap-[12px] border-2 border-dashed rounded-[12px] py-[40px] px-[20px] cursor-pointer transition-colors ${isDragOver ? 'border-[#00a76f] bg-[rgba(0,167,111,0.04)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#00a76f] hover:bg-[rgba(0,167,111,0.02)]'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={40} className="text-[#919eab]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center">拖曳檔案至此處，或<span className="text-[#00a76f] font-semibold underline">點擊選擇檔案</span></p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">支援「下載批次建立（不拆單）」匯出的 .xlsx 或 .csv</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && result && (<>
          <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
            <div className="flex items-center gap-[10px] shrink-0">
              <FileSpreadsheet size={16} className="text-[#637381]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
            </div>
            <div className="flex gap-[8px] flex-wrap shrink-0">
              <TotalSummaryBadge total={result.totalRows} validCount={result.validRows.length + result.deleteRows.length} skipCount={result.skipRows.length} errorCount={result.errorRows.length} />
              <SummaryBadge label="A 調整" count={result.validRows.length} bgColor="bg-[rgba(0,167,111,0.12)]" textColor="text-[#00a76f]" icon={<FilePlus2 size={14} />} />
              <SummaryBadge label="D 刪單" count={result.deleteRows.length} bgColor="bg-[rgba(255,86,48,0.12)]" textColor="text-[#ff5630]" icon={<Trash2 size={14} />} />
            </div>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
              <table className="w-full min-w-[900px]">
                <thead className="sticky top-0 z-[1]"><tr className="bg-[#f4f6f8]">
                  {['行','訂單號碼','序號','料號','新料號','第1期交期','第1期量','第2期交期','第2期量','第3期交期','第3期量','備註','驗證'].map(h => (
                    <th key={h} className="px-[8px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {result.errorRows.map(r => <BCAdjustRow key={`e${r.rowIndex}`} row={r} />)}
                  {result.validRows.map(r => <BCAdjustRow key={`v${r.rowIndex}`} row={r} />)}
                  {result.deleteRows.map(r => <BCAdjustRow key={`d${r.rowIndex}`} row={r} />)}
                  {result.skipRows.map(r => <BCAdjustRow key={`s${r.rowIndex}`} row={r} />)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
            <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={() => { setStep('upload'); setResult(null); setFileName(''); }}>重新選擇檔案</button>
            <div className="flex gap-[12px]">
              <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={onClose}>取消</button>
              <button className="h-[36px] px-[20px] rounded-[8px] bg-[#00a76f] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#007b55] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onConfirm(result)} disabled={result.validRows.length + result.deleteRows.length === 0}>確認建立修正單 ({result.validRows.length + result.deleteRows.length} 筆)</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

function BCAdjustRow({ row }: { row: CorrectionAdjustParsedRow }) {
  const c = "px-[8px] py-[7px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]";
  const isSkip = !row.error && (!!row.skipReason || (row.schedules.length === 0 && !row.newMaterialNo && !row.isDelete));
  const bg = !row.isValid ? 'bg-[rgba(255,171,0,0.04)]' : row.isDelete ? 'bg-[rgba(255,86,48,0.02)]' : isSkip ? 'bg-[rgba(145,158,171,0.04)]' : 'bg-[rgba(0,167,111,0.02)]';
  const isOk = row.isValid && !isSkip;
  const accent = isOk ? 'text-[#118d57] font-semibold' : 'text-[#b71d18] font-semibold';
  const s1 = row.schedules[0], s2 = row.schedules[1], s3 = row.schedules[2];
  return (
    <tr className={`border-t border-[rgba(145,158,171,0.08)] ${bg}`}>
      <td className={`${c} text-[#919eab]`}>{row.rowIndex}</td>
      <td className={c}>{row.orderNo}</td>
      <td className={c}>{row.orderSeq}</td>
      <td className={`${c} truncate max-w-[100px]`}>{row.materialNo}</td>
      <td className={`${c} ${row.newMaterialNo ? accent : 'text-[#919eab]'}`}>{row.newMaterialNo || '—'}</td>
      <td className={`${c} ${s1?.newVendorDate ? accent : 'text-[#919eab]'}`}>{s1?.newVendorDate || '—'}</td>
      <td className={`${c} ${s1?.newQty ? accent : 'text-[#919eab]'}`}>{s1?.newQty || '—'}</td>
      <td className={`${c} ${s2?.newVendorDate ? accent : 'text-[#919eab]'}`}>{s2?.newVendorDate || '—'}</td>
      <td className={`${c} ${s2?.newQty ? accent : 'text-[#919eab]'}`}>{s2?.newQty || '—'}</td>
      <td className={`${c} ${s3?.newVendorDate ? accent : 'text-[#919eab]'}`}>{s3?.newVendorDate || '—'}</td>
      <td className={`${c} ${s3?.newQty ? accent : 'text-[#919eab]'}`}>{s3?.newQty || '—'}</td>
      <td className={`${c} truncate max-w-[100px] ${row.isDelete ? 'text-[#ff5630] font-semibold' : row.remark ? '' : 'text-[#919eab]'}`}>{row.isDelete ? '刪單' : row.remark || '—'}</td>
      <td className="px-[8px] py-[7px]">
        {!row.isValid ? <p className="text-[11px] text-[#b76e00] max-w-[140px]" title={row.error}>{row.error}</p>
         : row.isDelete ? <CheckCircle2 size={14} className="text-[#22c55e]" />
         : row.skipReason ? <p className="text-[11px] text-[#919eab] max-w-[140px]" title={row.skipReason}>{row.skipReason}</p>
         : isSkip ? <span className="text-[#919eab] text-[12px]">—（不處理）</span>
         : <CheckCircle2 size={14} className="text-[#22c55e]" />}
      </td>
    </tr>
  );
}

// ── 拆單 Overlay ──────────────────────────────────────────────────────────────

interface BatchCorrectionSplitImportOverlayProps {
  allOrders: OrderRow[];
  onConfirm: (result: CorrectionSplitImportResult) => void;
  onClose: () => void;
}

export function BatchCorrectionSplitImportOverlay({ allOrders, onConfirm, onClose }: BatchCorrectionSplitImportOverlayProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [result, setResult] = useState<CorrectionSplitImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setFileName(file.name); setParseError('');
    const isXlsx = /\.(xlsx|xls)$/i.test(file.name);
    const parse = (csvContent: string) => {
      const r = parseBatchCorrectionSplitCsv(csvContent, allOrders);
      if (r.totalRows === 0) { setParseError('無法辨識檔案格式，請使用「下載批次建立（拆單）」匯出的範本'); return; }
      setResult(r); setStep('preview');
    };
    if (isXlsx) {
      const reader = new FileReader();
      reader.onload = (e) => { try { const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array', cellDates: true }); parse(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]], { dateNF: 'yyyy/mm/dd' })); } catch { setParseError('無法讀取 Excel 檔案'); } };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => parse(e.target?.result as string);
      reader.readAsText(file, 'UTF-8');
    }
  }, [allOrders]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]" onClick={onClose}>
      <div className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'upload' ? '560px' : '1100px', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <FilePlus2 size={22} className="text-[#8e33ff]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              {step === 'upload' ? '批次建立修正單（拆單）' : '拆單 — 匯入預覽'}
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}><X size={20} className="text-[#637381]" /></div>
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
            <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">欄位說明（拆單）：</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 【料號】欄位若不需填寫請直接留白</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 需在【拆單數】填入拆單數量，最少為2，空白者視同不處理</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 拆單料3以上者，請於Q欄後自行補上交貨資料(新廠商交期3+交貨量3+料號3)，以此類推</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 各期合計不可低於驗收量＋在途量，且不可超過訂貨量</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 新廠商交期不可填入過去日期</p>
            </div>
            {parseError && <div className="flex items-start gap-[8px] bg-[rgba(255,171,0,0.08)] rounded-[8px] px-[14px] py-[10px]"><AlertTriangle size={16} className="text-[#b76e00] shrink-0 mt-[2px]" /><p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#b76e00]">{parseError}</p></div>}
            <div
              className={`flex flex-col items-center justify-center gap-[12px] border-2 border-dashed rounded-[12px] py-[40px] px-[20px] cursor-pointer transition-colors ${isDragOver ? 'border-[#8e33ff] bg-[rgba(142,51,255,0.04)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#8e33ff] hover:bg-[rgba(142,51,255,0.02)]'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={40} className="text-[#919eab]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center">拖曳檔案至此處，或<span className="text-[#8e33ff] font-semibold underline">點擊選擇檔案</span></p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">支援「下載批次建立（拆單）」匯出的 .xlsx 或 .csv</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && result && (<>
          <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
            <div className="flex items-center gap-[10px] shrink-0">
              <FileSpreadsheet size={16} className="text-[#637381]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
            </div>
            <div className="flex gap-[8px] flex-wrap shrink-0">
              <TotalSummaryBadge total={result.totalRows} validCount={result.validRows.length} skipCount={result.skipRows.length} errorCount={result.errorRows.length} />
            </div>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
              <table className="w-full min-w-[1000px]">
                <thead className="sticky top-0 z-[1]"><tr className="bg-[#f4f6f8]">
                  {['行','訂單號碼','序號','料號','拆單數','交期1','量1','料號1','交期2','量2','料號2','交期3','量3','料號3','備註','驗證'].map(h => (
                    <th key={h} className="px-[8px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {result.errorRows.map(r => <BCSplitRow key={`e${r.rowIndex}`} row={r} />)}
                  {result.validRows.map(r => <BCSplitRow key={`v${r.rowIndex}`} row={r} />)}
                  {result.skipRows.map(r => <BCSplitRow key={`s${r.rowIndex}`} row={r} />)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
            <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={() => { setStep('upload'); setResult(null); setFileName(''); }}>重新選擇檔案</button>
            <div className="flex gap-[12px]">
              <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={onClose}>取消</button>
              <button className="h-[36px] px-[20px] rounded-[8px] bg-[#8e33ff] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#5b1fc0] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onConfirm(result)} disabled={result.validRows.length === 0}>確認建立拆單修正單 ({result.validRows.length} 筆)</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

function BCSplitRow({ row }: { row: CorrectionSplitParsedRow }) {
  const c = "px-[8px] py-[7px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]";
  const isSkip = !row.error && (!!row.skipReason || row.splits.length < 2);
  const bg = !row.isValid ? 'bg-[rgba(255,171,0,0.04)]' : isSkip ? 'bg-[rgba(145,158,171,0.04)]' : 'bg-[rgba(142,51,255,0.02)]';
  const isOk = row.isValid && !isSkip;
  const accent = isOk ? 'text-[#118d57] font-semibold' : 'text-[#b71d18] font-semibold';
  const s1 = row.splits[0], s2 = row.splits[1], s3 = row.splits[2];
  return (
    <tr className={`border-t border-[rgba(145,158,171,0.08)] ${bg}`}>
      <td className={`${c} text-[#919eab]`}>{row.rowIndex}</td>
      <td className={c}>{row.orderNo}</td>
      <td className={c}>{row.orderSeq}</td>
      <td className={`${c} truncate max-w-[100px]`}>{row.materialNo}</td>
      <td className={`${c} ${row.splitCount ? accent : 'text-[#919eab]'}`}>{row.splitCount || '—'}</td>
      <td className={`${c} ${s1?.newVendorDate ? accent : 'text-[#919eab]'}`}>{s1?.newVendorDate || '—'}</td>
      <td className={`${c} ${s1?.qty ? accent : 'text-[#919eab]'}`}>{s1?.qty || '—'}</td>
      <td className={`${c} ${s1?.newMaterialNo ? accent : 'text-[#919eab]'}`}>{s1?.newMaterialNo || '—'}</td>
      <td className={`${c} ${s2?.newVendorDate ? accent : 'text-[#919eab]'}`}>{s2?.newVendorDate || '—'}</td>
      <td className={`${c} ${s2?.qty ? accent : 'text-[#919eab]'}`}>{s2?.qty || '—'}</td>
      <td className={`${c} ${s2?.newMaterialNo ? accent : 'text-[#919eab]'}`}>{s2?.newMaterialNo || '—'}</td>
      <td className={`${c} ${s3?.newVendorDate ? accent : 'text-[#919eab]'}`}>{s3?.newVendorDate || '—'}</td>
      <td className={`${c} ${s3?.qty ? accent : 'text-[#919eab]'}`}>{s3?.qty || '—'}</td>
      <td className={`${c} ${s3?.newMaterialNo ? accent : 'text-[#919eab]'}`}>{s3?.newMaterialNo || '—'}</td>
      <td className={`${c} truncate max-w-[80px] ${row.remark ? '' : 'text-[#919eab]'}`}>{row.remark || '—'}</td>
      <td className="px-[8px] py-[7px]">
        {!row.isValid ? <p className="text-[11px] text-[#b76e00] max-w-[140px]" title={row.error}>{row.error}</p>
         : row.skipReason ? <p className="text-[11px] text-[#919eab] max-w-[140px]" title={row.skipReason}>{row.skipReason}</p>
         : isSkip ? <span className="text-[#919eab] text-[12px]">—（不處理）</span>
         : <CheckCircle2 size={14} className="text-[#22c55e]" />}
      </td>
    </tr>
  );
}

// ── 合併上傳 Overlay（自動偵測拆單 / 不拆單調整）────────────────────────────

interface BatchCorrectionCombinedImportOverlayProps {
  allOrders: OrderRow[];
  onConfirmAdjust: (result: CorrectionAdjustImportResult) => void;
  onConfirmSplit: (result: CorrectionSplitImportResult) => void;
  onClose: () => void;
}

export function BatchCorrectionCombinedImportOverlay({
  allOrders, onConfirmAdjust, onConfirmSplit, onClose,
}: BatchCorrectionCombinedImportOverlayProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [adjustResult, setAdjustResult] = useState<CorrectionAdjustImportResult | null>(null);
  const [splitResult, setSplitResult] = useState<CorrectionSplitImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [duplicateKeys, setDuplicateKeys] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: File[]) => {
    setParseError('');
    const readFile = (file: File): Promise<string> => new Promise((res, rej) => {
      const isXlsx = /\.(xlsx|xls)$/i.test(file.name);
      if (isXlsx) {
        const r = new FileReader();
        r.onload = (e) => { try { const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array', cellDates: true }); res(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]], { dateNF: 'yyyy/mm/dd' })); } catch { rej(new Error('無法讀取 Excel')); } };
        r.readAsArrayBuffer(file);
      } else {
        const r = new FileReader();
        r.onload = (e) => res(e.target?.result as string);
        r.readAsText(file, 'UTF-8');
      }
    });
    // 限制最多 2 個檔案，只取前兩個
    const targets = files.slice(0, 2);
    Promise.all(targets.map(f => readFile(f).then(csv => ({ csv, name: f.name })).catch(() => null))).then(results => {
      let newSplit: CorrectionSplitImportResult | null = null;
      let newAdjust: CorrectionAdjustImportResult | null = null;
      const errors: string[] = [];
      for (const res of results) {
        if (!res) continue;
        // 動態找標題列（說明列在最前，需掃描找到 A 欄為「訂單號碼」的列）
        const csvLines = res.csv.split(/\r?\n/);
        const hIdx = csvLines.findIndex(l => parseCsvLine(l)[0]?.trim() === '訂單號碼');
        const headers = hIdx >= 0 ? parseCsvLine(csvLines[hIdx]) : [];
        if (headers.includes('拆單數') || (headers.includes('交貨量1') && !headers.includes('新交貨量1'))) {
          const r = parseBatchCorrectionSplitCsv(res.csv, allOrders);
          if (r.totalRows > 0) { newSplit = r; continue; }
        }
        const r2 = parseBatchCorrectionAdjustCsv(res.csv, allOrders);
        if (r2.totalRows > 0) { newAdjust = r2; continue; }
        errors.push(`無法辨識「${res.name}」的範本類型`);
      }
      if (!newSplit && !newAdjust) {
        setParseError(errors.join('；') || '無法辨識檔案格式，請使用「批次建立修正單」導出的範本');
        return;
      }
      if (errors.length > 0) setParseError(errors.join('；'));
      else setParseError('');
      // 偵測相同訂單號碼+訂單序號同時出現在兩種範本
      const dupKeys: string[] = [];
      if (newSplit && newAdjust) {
        const splitKeys = new Set(
          [...newSplit.validRows, ...newSplit.errorRows, ...newSplit.skipRows]
            .map(r => `${r.orderNo}-${r.orderSeq}`)
        );
        const adjustKeys = [...newAdjust.validRows, ...newAdjust.errorRows, ...newAdjust.skipRows]
          .map(r => `${r.orderNo}-${r.orderSeq}`);
        for (const k of adjustKeys) { if (splitKeys.has(k)) dupKeys.push(k); }
      }
      setDuplicateKeys([...new Set(dupKeys)]);
      setSplitResult(newSplit); setAdjustResult(newAdjust);
      setFileName(targets.map(f => f.name).join('、'));
      setStep('preview');
    });
  }, [allOrders]);

  const reset = () => { setStep('upload'); setAdjustResult(null); setSplitResult(null); setFileName(''); setParseError(''); setDuplicateKeys([]); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const fs = Array.from(e.dataTransfer.files); if (fs.length > 0) processFiles(fs); };


  // 動態標題（供 header 使用）
  const previewTitle = splitResult && adjustResult
    ? '拆單 ＋ 不拆單 — 匯入預覽'
    : splitResult ? '拆單 — 匯入預覽'
    : '不拆單 — 匯入預覽';

  return (
    <div className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]" onClick={onClose}>
      <div className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'upload' ? '560px' : '1100px', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <FilePlus2 size={22} className="text-[#637381]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              {step === 'upload' ? '批次建立修正單' : previewTitle}
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}><X size={20} className="text-[#637381]" /></div>
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <div className="flex flex-col gap-[16px] px-[24px] py-[24px] overflow-y-auto">
            {/* 拆單說明 */}
            <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">欄位說明（拆單）：</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 【料號】欄位若不需填寫請直接留白</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 需在【拆單數】填入拆單數量，最少為2，空白者視同不處理</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 拆單料3以上者，請於Q欄後自行補上交貨資料(新廠商交期3+交貨量3+料號3)，以此類推</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 各期合計不可低於驗收量＋在途量，且不可超過訂貨量</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 新廠商交期不可填入過去日期</p>
            </div>
            {/* 不拆單調整說明 */}
            <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">欄位說明（不拆單）：</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 需調整的單請於【修正碼】填A，要刪單請填D，留白者視同不處理</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 各期合計不可低於驗收量＋在途量，且不可超過訂貨量</p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381]">• 新廠商交期不可填入過去日期</p>
            </div>
            {parseError && <div className="flex items-start gap-[8px] bg-[rgba(255,171,0,0.08)] rounded-[8px] px-[14px] py-[10px]"><AlertTriangle size={16} className="text-[#b76e00] shrink-0 mt-[2px]" /><p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#b76e00]">{parseError}</p></div>}
            <div
              className={`flex flex-col items-center justify-center gap-[12px] border-2 border-dashed rounded-[12px] py-[40px] px-[20px] cursor-pointer transition-colors ${isDragOver ? 'border-[#637381] bg-[rgba(99,115,129,0.04)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#637381] hover:bg-[rgba(99,115,129,0.02)]'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={40} className="text-[#919eab]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center">拖曳檔案至此處，或<span className="text-[#637381] font-semibold underline">點擊選擇檔案</span></p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">支援「下載批次建立（拆單）」或「下載批次建立（不拆單）」匯出的 .xlsx 或 .csv</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" multiple className="hidden" onChange={e => { const fs = Array.from(e.target.files ?? []); if (fs.length > 0) processFiles(fs); e.target.value = ''; }} />
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && (() => {
          const hasSplit = !!splitResult;
          const hasAdjust = !!adjustResult;
          const totalValid = (splitResult?.validRows.length ?? 0) + (adjustResult?.validRows.length ?? 0) + (adjustResult?.deleteRows.length ?? 0);
          const headerTitle = hasSplit && hasAdjust
            ? '拆單 ＋ 不拆單 — 匯入預覽'
            : hasSplit ? '拆單 — 匯入預覽' : '不拆單 — 匯入預覽';
          return (
            <>
              {/* Dynamic header update */}
              <style>{`.combined-overlay-title::after { content: "${headerTitle}"; }`}</style>
              <div className="flex flex-col gap-[0] flex-1 min-h-0 overflow-y-auto">
                {/* 重複單號序號警告 */}
                {duplicateKeys.length > 0 && (
                  <div className="mx-[24px] mt-[16px] flex items-start gap-[10px] bg-[rgba(255,171,0,0.08)] border border-[rgba(255,171,0,0.32)] rounded-[8px] px-[14px] py-[12px]">
                    <AlertTriangle size={16} className="text-[#b76e00] shrink-0 mt-[2px]" />
                    <div className="flex flex-col gap-[4px]">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#b76e00]">
                        以下單號序號同時存在於拆單與不拆單範本，一個單號序號只能擇一類型開單，請確認後再送出：
                      </p>
                      <div className="flex flex-wrap gap-[6px] mt-[4px]">
                        {duplicateKeys.map(k => (
                          <span key={k} className="inline-flex items-center bg-[rgba(255,171,0,0.16)] text-[#b76e00] text-[11px] font-semibold px-[8px] h-[22px] rounded-[4px]">{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* 檔名列 */}
                <div className="flex items-center gap-[10px] px-[24px] pt-[16px] pb-[8px] shrink-0">
                  <FileSpreadsheet size={16} className="text-[#637381]" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
                </div>

                {/* 拆單預覽 */}
                {hasSplit && splitResult && (
                  <div className="flex flex-col gap-[8px] px-[24px] pb-[16px]">
                    <div className="flex items-center gap-[8px] shrink-0">
                      <span className="inline-flex items-center gap-[4px] bg-[rgba(142,51,255,0.1)] text-[#8e33ff] text-[11px] font-semibold px-[8px] h-[22px] rounded-[4px]">拆單</span>
                      <TotalSummaryBadge total={splitResult.totalRows} validCount={splitResult.validRows.length} skipCount={splitResult.skipRows.length} errorCount={splitResult.errorRows.length} />
                    </div>
                    <div className="overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]" style={{ maxHeight: hasAdjust ? '300px' : '420px' }}>
                      <table className="w-full min-w-[1000px]">
                        <thead className="sticky top-0 z-[1]"><tr className="bg-[#f4f6f8]">
                          {['行','訂單號碼','序號','料號','拆單數','交期1','量1','料號1','交期2','量2','料號2','交期3','量3','料號3','備註','驗證'].map(h => (
                            <th key={h} className="px-[8px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {splitResult.errorRows.map(r => <BCSplitRow key={`e${r.rowIndex}`} row={r} />)}
                          {splitResult.validRows.map(r => <BCSplitRow key={`v${r.rowIndex}`} row={r} />)}
                          {splitResult.skipRows.map(r => <BCSplitRow key={`s${r.rowIndex}`} row={r} />)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 不拆單調整預覽 */}
                {hasAdjust && adjustResult && (
                  <div className="flex flex-col gap-[8px] px-[24px] pb-[16px]">
                    <div className="flex items-center gap-[8px] shrink-0">
                      <span className="inline-flex items-center gap-[4px] bg-[rgba(0,167,111,0.1)] text-[#00a76f] text-[11px] font-semibold px-[8px] h-[22px] rounded-[4px]">不拆單</span>
                      <TotalSummaryBadge total={adjustResult.totalRows} validCount={adjustResult.validRows.length + adjustResult.deleteRows.length} skipCount={adjustResult.skipRows.length} errorCount={adjustResult.errorRows.length} />
                    </div>
                    <div className="overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]" style={{ maxHeight: hasSplit ? '300px' : '420px' }}>
                      <table className="w-full min-w-[900px]">
                        <thead className="sticky top-0 z-[1]"><tr className="bg-[#f4f6f8]">
                          {['行','訂單號碼','序號','料號','新料號','第1期交期','第1期量','第2期交期','第2期量','第3期交期','第3期量','備註','驗證'].map(h => (
                            <th key={h} className="px-[8px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {adjustResult.errorRows.map(r => <BCAdjustRow key={`e${r.rowIndex}`} row={r} />)}
                          {adjustResult.validRows.map(r => <BCAdjustRow key={`v${r.rowIndex}`} row={r} />)}
                          {adjustResult.deleteRows.map(r => <BCAdjustRow key={`d${r.rowIndex}`} row={r} />)}
                          {adjustResult.skipRows.map(r => <BCAdjustRow key={`s${r.rowIndex}`} row={r} />)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
                <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={reset}>重新選擇檔案</button>
                <div className="flex gap-[12px]">
                  <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={onClose}>取消</button>
                  <button
                    className="h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#2d3d4f] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={totalValid === 0 || duplicateKeys.length > 0}
                    onClick={() => {
                      if (splitResult) onConfirmSplit(splitResult);
                      if (adjustResult) onConfirmAdjust(adjustResult);
                      onClose();
                    }}
                  >
                    {duplicateKeys.length > 0 ? '存在重複單號，無法建立' : `確認建立修正單（${totalValid} 筆）`}
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}



export type CorrectionBatchCode = 'A' | 'B' | 'D' | '';

export interface CorrectionBatchParsedRow {
  rowIndex: number; orderNo: string; orderSeq: string;
  vendorName: string; vendorCode: string; materialNo: string; productName: string;
  expectedDelivery: string; orderQty: string; deliveryQty: string;
  acceptQty: string; inTransitQty: string;
  correctionCode: CorrectionBatchCode; newVendorDate: string; newDeliveryQty: string;
  newMaterialNo: string; remark: string;
  matchedOrder?: OrderRow; error?: string; skipReason?: string; isValid: boolean;
}

export interface CorrectionBatchImportResult {
  totalRows: number;
  adjustRows: CorrectionBatchParsedRow[];
  splitRows: CorrectionBatchParsedRow[];
  deleteRows: CorrectionBatchParsedRow[];
  skipRows: CorrectionBatchParsedRow[];
  errorRows: CorrectionBatchParsedRow[];
}

function detectCorrectionBatchMode(headerLine: string): boolean {
  return parseCsvLine(headerLine).includes('修正碼');
}

function isCorrectionInstructionRow(fields: string[]): boolean {
  const colA = (fields[0] || '').trim();
  const colL = (fields[11] || '').trim();
  if (colA !== '') return false;
  if (/修正碼|不處理|新交貨量規則/.test(colL)) return true;
  if (!colA && !fields[1]?.trim() && !fields[2]?.trim() && colL.length > 5) return true;
  return false;
}

export function parseBatchCorrectionCsv(content: string, allOrders: OrderRow[]): CorrectionBatchImportResult {
  const clean = content.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter(l => l.trim() !== '');
  const empty: CorrectionBatchImportResult = { totalRows: 0, adjustRows: [], splitRows: [], deleteRows: [], skipRows: [], errorRows: [] };
  if (lines.length < 2) return empty;
  if (!detectCorrectionBatchMode(lines[0])) return empty;
  const dataLines = lines.slice(1);
  const rows: CorrectionBatchParsedRow[] = [];
  for (let i = 0; i < dataLines.length; i++) {
    const f = parseCsvLine(dataLines[i]);
    if (isCorrectionInstructionRow(f)) continue;
    if (f.every(x => x.trim() === '')) continue;
    const rowIndex = i + 2;
    const orderNo = (f[0] || '').trim();
    const orderSeq = (f[1] || '').trim();
    const codeRaw = (f[11] || '').trim().toUpperCase();
    let correctionCode: CorrectionBatchCode = '';
    let error: string | undefined;
    if (codeRaw === 'A') correctionCode = 'A';
    else if (codeRaw === 'B') correctionCode = 'B';
    else if (codeRaw === 'D') correctionCode = 'D';
    else if (codeRaw !== '') error = `修正碼無效: "${codeRaw}"（僅接受 A、B、D 或空白）`;
    if (!orderNo && correctionCode === '') continue;
    const newVendorDate = normalizeDateStr((f[12] || '').trim());
    const newDeliveryQty = (f[13] || '').trim();
    const newMaterialNo = (f[14] || '').trim();
    const remark = (f[15] || '').trim();
    const matched = allOrders.find(o => o.orderNo === orderNo && o.orderSeq === orderSeq);
    if (!matched && correctionCode !== '') error = error || `找不到對應訂單 (${orderNo} / ${orderSeq})`;
    let skipReason: string | undefined;
    if (matched && matched.status !== 'CK' && matched.status !== 'B') {
      skipReason = `狀態 ${matched.status} 不允許開立修正單（僅限 CK/B）`;
      correctionCode = '';
    }
    if (correctionCode === 'A' && !error) {
      const hasNewDate = newVendorDate !== '';
      const hasNewQty = newDeliveryQty !== '';
      if (!hasNewDate && !hasNewQty) error = '修正碼 A 至少需填寫「新廠商交期」或「新交貨量」';
      if (hasNewDate && !isValidDateStr(newVendorDate)) error = error || `日期格式錯誤: "${newVendorDate}"（格式: YYYY/MM/DD）`;
      if (hasNewQty) {
        const qty = parseInt(newDeliveryQty, 10);
        if (isNaN(qty) || qty < 0) error = error || `新交貨量格式錯誤: "${newDeliveryQty}"`;
        else if (matched) {
          const oQ = matched.orderQty ?? 0, aQ = matched.acceptQty ?? 0, iQ = matched.inTransitQty ?? 0;
          if (qty > oQ) error = error || `新交貨量 ${qty} 超過訂貨量 ${oQ}`;
          else if (qty < aQ + iQ) error = error || `新交貨量 ${qty} 低於 驗收量(${aQ})+在途量(${iQ})=${aQ + iQ}`;
        }
      }
      if (!error && matched && hasNewDate) {
        const origDate = matched.vendorDeliveryDate || matched.expectedDelivery || '';
        if (newVendorDate === origDate && !hasNewQty && !newMaterialNo) error = '無異動：新廠商交期與原始相同，且未修改交貨量或料號';
      }
    }
    if (correctionCode === 'D' && !error) {
      // 刪單：後方不可填任何交貨資料
      if (newVendorDate || newDeliveryQty || newMaterialNo) {
        error = '修正碼 D（刪單）後方不可填寫新廠商交期、新交貨量或新料號';
      }
    }
    if (correctionCode === 'B' && !error) {
      if (!newDeliveryQty) { error = '修正碼 B（拆單）必須填寫「新交貨量」（原序號保留量）'; }
      else if (matched) {
        const qty = parseInt(newDeliveryQty, 10);
        const dQ = (matched as any).deliveryQty ?? matched.orderQty ?? 0;
        const oQ = matched.orderQty ?? 0;
        const aQ = matched.acceptQty ?? 0;
        const iQ = matched.inTransitQty ?? 0;
        if (isNaN(qty) || qty < 0) error = `新交貨量格式錯誤: "${newDeliveryQty}"`;
        else if (qty >= dQ) error = `新交貨量 ${qty} 必須小於目前交貨量 ${dQ}（否則無法拆單）`;
        else if (qty < aQ + iQ) error = `新交貨量 ${qty} 低於 驗收量(${aQ})+在途量(${iQ})=${aQ + iQ}`;
        else {
          const remainder = dQ - qty;
          if (remainder <= 0) error = '拆出量為 0，無需拆單';
          else if (qty + remainder > oQ) error = `原序號(${qty})+拆出量(${remainder})=${qty + remainder} 超過訂貨量(${oQ})`;
        }
      }
      if (!error && newVendorDate && !isValidDateStr(newVendorDate)) error = `日期格式錯誤: "${newVendorDate}"（格式: YYYY/MM/DD）`;
    }

    rows.push({
      rowIndex, orderNo, orderSeq,
      vendorName: (f[2] || '').trim(), vendorCode: (f[3] || '').trim(),
      materialNo: (f[4] || '').trim(), productName: (f[5] || '').trim(),
      expectedDelivery: normalizeDateStr((f[6] || '').trim()),
      orderQty: (f[7] || '').trim(), deliveryQty: (f[8] || '').trim(),
      acceptQty: (f[9] || '').trim(), inTransitQty: (f[10] || '').trim(),
      correctionCode, newVendorDate, newDeliveryQty, newMaterialNo, remark,
      matchedOrder: matched, error, skipReason, isValid: !error,
    });
  }
  return {
    totalRows: rows.length,
    adjustRows: rows.filter(r => r.correctionCode === 'A' && r.isValid),
    splitRows: rows.filter(r => r.correctionCode === 'B' && r.isValid),
    deleteRows: rows.filter(r => r.correctionCode === 'D' && r.isValid),
    skipRows: rows.filter(r => r.correctionCode === '' && r.isValid),
    errorRows: rows.filter(r => !r.isValid),
  };
}

interface BatchCorrectionImportOverlayProps {
  allOrders: OrderRow[];
  onConfirm: (result: CorrectionBatchImportResult) => void;
  onClose: () => void;
}

export function BatchCorrectionImportOverlay({ allOrders, onConfirm, onClose }: BatchCorrectionImportOverlayProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [batchResult, setBatchResult] = useState<CorrectionBatchImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFile = useCallback((file: File) => {
    setFileName(file.name); setParseError('');
    const isXlsx = /\.(xlsx|xls)$/i.test(file.name);
    if (isXlsx) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array', cellDates: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(ws, { dateNF: 'yyyy/mm/dd' });
          const result = parseBatchCorrectionCsv(csv, allOrders);
          if (result.totalRows === 0 && !csv.includes('修正碼')) { setParseError('無法辨識檔案格式，請確認是由「下載批次建立修正單」匯出的檔案（標題需含「修正碼」）'); return; }
          setBatchResult(result); setStep('preview');
        } catch { setParseError('無法讀取 Excel 檔案，請確認檔案格式正確'); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = parseBatchCorrectionCsv(content, allOrders);
        if (result.totalRows === 0 && !content.includes('修正碼')) { setParseError('無法辨識 CSV 格式，請確認是由「下載批次建立修正單」匯出的檔案（標題需含「修正碼」）'); return; }
        setBatchResult(result); setStep('preview');
      };
      reader.readAsText(file, 'UTF-8');
    }
  }, [allOrders]);
  const handleFileSelect2 = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processFile(f); };
  const handleDragOver2 = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave2 = () => setIsDragOver(false);
  const handleDrop2 = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv' || f.name.endsWith('.xlsx') || f.name.endsWith('.xls') ||
      f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || f.type === 'application/vnd.ms-excel')) processFile(f);
  };
  const actionCount = batchResult ? batchResult.adjustRows.length + batchResult.splitRows.length + batchResult.deleteRows.length : 0;
  return (
    <div className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]" onClick={onClose}>
      <div className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'upload' ? '560px' : '1060px', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <FilePlus2 size={22} className="text-[#00a76f]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
              {step === 'upload' ? '批次上傳建立修正單' : '批次建立修正單預覽'}
            </p>
          </div>
          <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}><X size={20} className="text-[#637381]" /></div>
        </div>
        {step === 'upload' && (
          <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">請上傳由「下載批次建立修正單」匯出的範本，在「修正碼」欄填入指令後匯入。</p>
              <div className="flex flex-col gap-[4px] bg-[#f4f6f8] rounded-[8px] px-[16px] py-[12px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">修正碼說明：</p>
                <div className="flex items-center gap-[6px]">
                  <FilePlus2 size={14} className="text-[#00a76f] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">A</span> — 不拆單調整（需填「新廠商交期」或/及「新交貨量」）</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <Truck size={14} className="text-[#8e33ff] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">B</span> — 拆單（必填「新交貨量」＝原序號保留量，剩餘量自動拆至新序號；「新料號」套用至新序號）</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <Trash2 size={14} className="text-[#ff5630] shrink-0" />
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]"><span className="font-semibold">D</span> — 刪單（後方欄位請保持空白）</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[14px] h-[14px] flex items-center justify-center shrink-0"><div className="w-[6px] h-[6px] bg-[#919eab] rounded-full" /></div>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">空白 — 不處理</p>
                </div>
                <div className="mt-[4px] border-t border-[rgba(145,158,171,0.12)] pt-[4px]">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">新交貨量規則：訂貨量 ≥ 新交貨量 ≥ 驗收量+在途量。A碼「新料號」覆蓋原料號；B碼「新料號」套用至拆出的新序號。</p>
                </div>
              </div>
            </div>
            {parseError && (<div className="flex items-start gap-[8px] bg-[rgba(255,171,0,0.08)] rounded-[8px] px-[14px] py-[10px]"><AlertTriangle size={16} className="text-[#b76e00] shrink-0 mt-[2px]" /><p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#b76e00]">{parseError}</p></div>)}
            <div className={`flex flex-col items-center justify-center gap-[12px] border-2 border-dashed rounded-[12px] py-[40px] px-[20px] cursor-pointer transition-colors ${isDragOver ? 'border-[#00a76f] bg-[rgba(0,167,111,0.04)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#00a76f] hover:bg-[rgba(0,167,111,0.02)]'}`}
              onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver2} onDragLeave={handleDragLeave2} onDrop={handleDrop2}>
              <Upload size={40} className="text-[#919eab]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] text-center">拖曳檔案至此處，或<span className="text-[#00a76f] font-semibold underline">點擊選擇檔案</span></p>
              <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">支援 .xlsx 或 .csv</p>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect2} />
            </div>
          </div>
        )}
        {step === 'preview' && batchResult && (<>
          <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
            <div className="flex items-center gap-[10px] shrink-0">
              <FileSpreadsheet size={16} className="text-[#637381]" />
              <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{fileName}</p>
            </div>
            <div className="flex gap-[8px] flex-wrap shrink-0">
              <TotalSummaryBadge total={batchResult.totalRows} validCount={actionCount} skipCount={batchResult.skipRows.length} errorCount={batchResult.errorRows.length} />
              <SummaryBadge label="A 不拆單" count={batchResult.adjustRows.length} bgColor="bg-[rgba(0,167,111,0.12)]" textColor="text-[#00a76f]" icon={<FilePlus2 size={14} />} />
              <SummaryBadge label="B 拆單" count={batchResult.splitRows.length} bgColor="bg-[rgba(142,51,255,0.12)]" textColor="text-[#8e33ff]" icon={<Truck size={14} />} />
              <SummaryBadge label="D 刪單" count={batchResult.deleteRows.length} bgColor="bg-[rgba(255,86,48,0.12)]" textColor="text-[#ff5630]" icon={<Trash2 size={14} />} />
              <SummaryBadge label="不處理" count={batchResult.skipRows.length} bgColor="bg-[rgba(145,158,171,0.08)]" textColor="text-[#919eab]" />
            </div>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
              <table className="w-full min-w-[1060px]">
                <thead className="sticky top-0 z-[1]"><tr className="bg-[#f4f6f8]">
                  {['行','修正碼','訂單號碼','序號','料號','預計交期','訂貨量','新廠商交期','新交貨量','新料號','備註','驗證'].map(h => (
                    <th key={h} className="px-[8px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381] whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {batchResult.errorRows.map(r => <BCRow key={`e${r.rowIndex}`} row={r} />)}
                  {batchResult.adjustRows.map(r => <BCRow key={`a${r.rowIndex}`} row={r} />)}
                  {batchResult.splitRows.map(r => <BCRow key={`b${r.rowIndex}`} row={r} />)}
                  {batchResult.deleteRows.map(r => <BCRow key={`d${r.rowIndex}`} row={r} />)}
                  {batchResult.skipRows.map(r => <BCRow key={`s${r.rowIndex}`} row={r} />)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
            <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
              onClick={() => { setStep('upload'); setBatchResult(null); setFileName(''); }}>重新選擇檔案</button>
            <div className="flex gap-[12px]">
              <button className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]" onClick={onClose}>取消</button>
              <button className="h-[36px] px-[20px] rounded-[8px] bg-[#00a76f] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#007b55] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onConfirm(batchResult)} disabled={actionCount === 0}>確認建立並提交修正單 ({actionCount} 筆)</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

function BCRow({ row }: { row: CorrectionBatchParsedRow }) {
  const c = "px-[8px] py-[7px] font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#1c252e]";
  const badge = () => {
    if (!row.isValid) return <div className="bg-[rgba(255,171,0,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]"><AlertTriangle size={12} className="text-[#b76e00]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#b76e00]">錯誤</p></div>;
    if (row.correctionCode === 'A') return <div className="bg-[rgba(0,167,111,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]"><FilePlus2 size={12} className="text-[#00a76f]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#00a76f]">A 調整</p></div>;
    if (row.correctionCode === 'B') return <div className="bg-[rgba(142,51,255,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]"><Truck size={12} className="text-[#8e33ff]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#8e33ff]">B 拆單</p></div>;
    if (row.correctionCode === 'D') return <div className="bg-[rgba(255,86,48,0.12)] flex items-center gap-[4px] px-[8px] h-[22px] rounded-[4px]"><Trash2 size={12} className="text-[#ff5630]" /><p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#ff5630]">D 刪單</p></div>;
    return <p className="text-[12px] text-[#919eab]">—</p>;
  };
  const isB = row.correctionCode === 'B';
  const isD = row.correctionCode === 'D';
  const accentColor = isB ? 'text-[#8e33ff]' : isD ? 'text-[#ff5630]' : 'text-[#00a76f]';
  const bg = !row.isValid ? 'bg-[rgba(255,171,0,0.04)]' : row.skipReason ? 'bg-[rgba(145,158,171,0.04)]' : row.correctionCode === 'A' ? 'bg-[rgba(0,167,111,0.02)]' : isB ? 'bg-[rgba(142,51,255,0.02)]' : isD ? 'bg-[rgba(255,86,48,0.02)]' : '';
  // For B (split), compute remainder info
  const splitInfo = isB && row.matchedOrder && row.newDeliveryQty
    ? (() => { const dQ = (row.matchedOrder as any).deliveryQty ?? row.matchedOrder.orderQty ?? 0; const nQ = parseInt(row.newDeliveryQty, 10); return isNaN(nQ) ? '' : `原${nQ} / 拆${dQ - nQ}`; })()
    : '';
  return (
    <tr className={`border-t border-[rgba(145,158,171,0.08)] ${bg}`}>
      <td className={`${c} text-[#919eab]`}>{row.rowIndex}</td>
      <td className="px-[8px] py-[7px]">{badge()}</td>
      <td className={c}>{row.orderNo}</td><td className={c}>{row.orderSeq}</td>
      <td className={`${c} truncate max-w-[110px]`}>{row.materialNo}</td>
      <td className={c}>{row.expectedDelivery}</td><td className={c}>{row.orderQty}</td>
      <td className={`${c} ${row.newVendorDate ? `${accentColor} font-semibold` : 'text-[#919eab]'}`}>{row.newVendorDate || '—'}</td>
      <td className={`${c} ${row.newDeliveryQty ? `${accentColor} font-semibold` : 'text-[#919eab]'}`}>{row.newDeliveryQty || '—'}{splitInfo && <span className="text-[11px] text-[#919eab] ml-[4px]">({splitInfo})</span>}</td>
      <td className={`${c} truncate max-w-[100px] ${row.newMaterialNo ? `${accentColor} font-semibold` : 'text-[#919eab]'}`}>{row.newMaterialNo || '—'}{isB && row.newMaterialNo && <span className="text-[10px] text-[#919eab] ml-[2px]">(新序號)</span>}</td>
      <td className={`${c} truncate max-w-[120px] ${row.remark ? '' : 'text-[#919eab]'}`}>{row.remark || '—'}</td>
      <td className="px-[8px] py-[7px]">{!row.isValid ? <p className="text-[11px] text-[#b76e00] max-w-[140px]" title={row.error}>{row.error}</p> : row.skipReason ? <p className="text-[11px] text-[#919eab] max-w-[140px]" title={row.skipReason}>{row.skipReason}</p> : row.correctionCode ? <CheckCircle2 size={14} className="text-[#22c55e]" /> : <span className="text-[#919eab] text-[12px]">—</span>}</td>
    </tr>
  );
}