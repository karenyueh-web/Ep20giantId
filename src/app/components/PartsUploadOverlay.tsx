import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { BaseOverlay } from './BaseOverlay';
import svgPaths from '@/imports/svg-36drtgagrx';
import * as XLSX from 'xlsx';
import type { PartRecord } from './partsMaintenanceData';
import { downloadQuotationTemplate } from './PartsUploadManager';
import { PartsUploadPreview, validateUploadData, type ValidationSummary } from './PartsUploadPreview';

// ── 上傳插圖 SVG（複用 ForecastUploadOverlay 的圖案）───────────────────────
function UploadIllustration() {
  return (
    <div className="w-[200px] h-[150px] relative shrink-0">
      <div className="absolute" style={{ inset: '16.67% 16.27% 16.67% 16.25%' }}>
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 134.955 100">
          <g id="container">
            <path d={svgPaths.p1b3b6000} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p35e11c80} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p3fdcea00} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p38d4fc00} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.pb48b300}  fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p20af35f0} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p34143400} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p2dee8ec0} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p2d50ab00} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p282df600} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.pcee4380}  fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p251f8200} fill="#FF5630" opacity="0.05" />
            <path d={svgPaths.p2339d900} fill="#FF5630" opacity="0.05" />
            <path clipRule="evenodd" d={svgPaths.p33648f00} fill="#004680" fillRule="evenodd" />
            <rect fill="white" height="32.3027" transform="rotate(34.64 82.2144 26.5316)" width="9.51728" x="82.2144" y="26.5316" />
            <rect fill="#FFAB00" height="6.71903" transform="rotate(34.804 82.7787 27.7908)" width="6.71903" x="82.7787" y="27.7908" />
            <rect fill="#FFAB00" height="6.72812" opacity="0.5" transform="rotate(34.64 78.4566 34.4394)" width="6.72812" x="78.4566" y="34.4394" />
            <rect fill="#FFAB00" height="6.72813" opacity="0.3" transform="rotate(34.64 73.8383 41.1225)" width="6.72813" x="73.8383" y="41.1225" />
            <rect fill="white" height="32.1806" transform="rotate(16.29 71.1515 24.8671)" width="9.51729" x="71.1515" y="24.8671" />
            <rect fill="#FF5630" height="6.72812" transform="rotate(16.29 72.3507 25.7588)" width="6.72812" x="72.3507" y="25.7588" />
            <rect fill="#FF5630" height="6.72812" opacity="0.5" transform="rotate(16.29 70.072 33.5553)" width="6.72812" x="70.072" y="33.5553" />
            <rect fill="#FF5630" height="6.72813" opacity="0.3" transform="rotate(16.29 67.7938 41.3507)" width="6.72813" x="67.7938" y="41.3507" />
            <rect fill="white" height="32.1806" transform="rotate(4.6 64.6806 25.3542)" width="9.51729" x="64.6806" y="25.3542" />
            <rect fill="#00B8D9" height="6.72812" transform="rotate(4.6 66.0307 25.985)" width="6.72812" x="66.0307" y="25.985" />
            <rect fill="#00B8D9" height="6.72812" opacity="0.5" transform="rotate(4.6 65.3784 34.0799)" width="6.72812" x="65.3784" y="34.0799" />
            <rect fill="#00B8D9" height="6.72812" opacity="0.3" transform="rotate(4.6 64.7274 42.1772)" width="6.72812" x="64.7274" y="42.1772" />
            <rect fill="white" height="32.1806" transform="rotate(-2.61 60.4126 26.6439)" width="9.51728" x="60.4126" y="26.6439" />
            <rect fill="#005EB8" height="6.72812" transform="rotate(-2.61 61.8298 27.0984)" width="6.72813" x="61.8298" y="27.0984" />
            <rect fill="#005EB8" height="6.73653" opacity="0.5" transform="rotate(-2.86241 62.4634 34.9552)" width="6.73653" x="62.4634" y="34.9552" />
            <rect fill="#005EB8" height="6.72813" opacity="0.3" transform="rotate(-2.61 62.5692 43.327)" width="6.72812" x="62.5692" y="43.327" />
            <path d={svgPaths.p2f764fc0} fill="#F4F6F8" />
            <path d={svgPaths.p19810ac0} fill="black" opacity="0.1" />
            <path d={svgPaths.p17109400} fill="#005EB8" />
            <path d={svgPaths.p193583c0} fill="#FF5630" opacity="0.1" />
            <path d={svgPaths.p346c900}  fill="white" />
            <g opacity="0.3">
              <path d={svgPaths.p31312c00} fill="#005EB8" />
              <path d={svgPaths.p401d780}  fill="#005EB8" />
              <path d={svgPaths.p27a0d080} fill="#005EB8" />
              <path d={svgPaths.p3917bb00} fill="#005EB8" />
              <path d={svgPaths.p1e769480} fill="#005EB8" />
              <path d={svgPaths.p2937e500} fill="#005EB8" />
            </g>
            <g>
              <path d={svgPaths.p8cf0a80}  fill="#005EB8" />
              <path d={svgPaths.p3f181c00} fill="#005EB8" />
              <path d={svgPaths.p1c27ab00} fill="#005EB8" />
            </g>
            <rect fill="white" height="38.0467" rx="4.73723" transform="rotate(-71.99 83.3883 27.0891)" width="21.2607" x="83.3883" y="27.0891" />
            <g opacity="0.24">
              <path d={svgPaths.p28714570} fill="#005EB8" />
              <path d={svgPaths.p21869100} fill="#005EB8" />
              <path d={svgPaths.p3d2f8400} fill="#005EB8" />
              <path d={svgPaths.p27b6cf00} fill="#005EB8" />
              <path d={svgPaths.p1ad0ea80} fill="#005EB8" />
            </g>
            <rect fill="#005EB8" height="4.71006" opacity="0.5" transform="rotate(-71.99 111.001 33.714)" width="2.06914" x="111.001" y="33.714" />
            <path d={svgPaths.p3aff7cc0} fill="white" />
            <g>
              <path d={svgPaths.p261d5d00} fill="#F4F6F8" />
              <path d={svgPaths.p3450700}  fill="#F4F6F8" />
            </g>
            <g>
              <path d={svgPaths.p2e7e100}  fill="#C4CDD5" />
              <path d={svgPaths.p7ae3d80}  fill="#C4CDD5" />
              <path d={svgPaths.p201b0200} fill="#C4CDD5" />
              <path d={svgPaths.p3a85aa80} fill="#C4CDD5" />
              <path d={svgPaths.p283fdbc0} fill="#C4CDD5" />
              <path d={svgPaths.p17378c00} fill="#C4CDD5" />
            </g>
            <path d={svgPaths.p35533600} fill="url(#paint0_linear_parts)" />
            <g opacity="0.2">
              <path d={svgPaths.p23deca30} fill="#005EB8" />
              <path d={svgPaths.p37308b80} fill="#005EB8" />
              <path d={svgPaths.p322e3700} fill="#005EB8" />
              <path d={svgPaths.p29eaf00}  fill="#005EB8" />
              <path d={svgPaths.pde010c0}  fill="#005EB8" />
              <path d={svgPaths.p12866600} fill="#005EB8" />
              <path d={svgPaths.p386da500} fill="#005EB8" />
            </g>
            <g>
              <path d={svgPaths.p732bf72}  fill="#005EB8" />
              <path d={svgPaths.p10c7f900} fill="#005EB8" />
              <path d={svgPaths.p220ca100} fill="#005EB8" />
            </g>
            <g opacity="0.08">
              <path d={svgPaths.p7a3c00}   fill="#005EB8" />
              <path d={svgPaths.p2d6bea00} fill="#005EB8" />
              <path d={svgPaths.p16d4e00}  fill="#005EB8" />
              <path d={svgPaths.p25ffb00}  fill="#005EB8" />
            </g>
            <path clipRule="evenodd" d={svgPaths.p94ef700}  fill="#00559C" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3f5bf000} fill="#005EB8" fillRule="evenodd" opacity="0.72" />
            <path clipRule="evenodd" d={svgPaths.p263cc200} fill="#00559C" fillRule="evenodd" />
            <g>
              <path d={svgPaths.p18bc6700} fill="#005EB8" />
              <path d={svgPaths.p2d6c980}  fill="#005EB8" />
              <path d={svgPaths.p30140300} fill="#005EB8" />
            </g>
            <g>
              <path clipRule="evenodd" d={svgPaths.p16bc5100} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p38823af2} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2810f200} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3aeb3300} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p28e04e80} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p13d0ef00} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p182f4d40} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3368faf0} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p1828a3d0} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p1afab680} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3a534600} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p67356b0}  fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3cbbe340} fill="#00559C" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p9229c00}  fill="#00559C" fillRule="evenodd" />
            </g>
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_parts" x1="41.9284" x2="21.7462" y1="32.1831" y2="91.7768">
              <stop stopColor="#005EB8" />
              <stop offset="1" stopColor="#00559C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── 結構驗證所需的必要分頁與欄位定義 ────────────────────────────────────────

const REQUIRED_SHEET1_HEADERS = ['物料', '工廠', '採購組織'];
const REQUIRED_SHEET2_HEADERS = ['物料', '工廠', '採購組織', '品牌'];

/** 解析 Excel 工作表為物件陣列（以第一列為 header） */
function sheetToObjects(ws: XLSX.WorkSheet): Record<string, string>[] {
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
  return raw.map(row => {
    const obj: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      obj[k.trim()] = String(v ?? '').trim();
    }
    return obj;
  });
}

/** 結構驗證結果 */
export interface StructureValidationResult {
  valid: boolean;
  errors: string[];
  sheet1Data?: Record<string, string>[];
  sheet2Data?: Record<string, string>[];
}

/** P2 基本格式驗證：分頁存在、標題列正確、有資料列 */
export function validateExcelStructure(workbook: XLSX.WorkBook): StructureValidationResult {
  const errors: string[] = [];

  // 1. 確認分頁存在（by name，不 by index）
  const sheet1 = workbook.Sheets['基本資料設定'];
  const sheet2 = workbook.Sheets['品牌設定'];

  if (!sheet1) errors.push('缺少必要分頁：「基本資料設定」');
  if (!sheet2) errors.push('缺少必要分頁：「品牌設定」');

  if (errors.length > 0) return { valid: false, errors };

  // 2. 解析資料
  const sheet1Data = sheetToObjects(sheet1);
  const sheet2Data = sheetToObjects(sheet2);

  // 3. 確認標題列欄位（用欄位名稱定位）
  if (sheet1Data.length > 0) {
    const s1Headers = Object.keys(sheet1Data[0]);
    for (const reqHeader of REQUIRED_SHEET1_HEADERS) {
      if (!s1Headers.includes(reqHeader)) {
        errors.push(`「基本資料設定」分頁缺少必要欄位：${reqHeader}`);
      }
    }
  } else {
    // 嘗試直接讀標題列
    const headerRange = XLSX.utils.decode_range(sheet1['!ref'] || 'A1:A1');
    const headers: string[] = [];
    for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
      const cell = sheet1[XLSX.utils.encode_cell({ r: 0, c })];
      if (cell) headers.push(String(cell.v ?? '').trim());
    }
    if (headers.length === 0) {
      errors.push('「基本資料設定」分頁沒有資料（空白分頁）');
    } else {
      for (const reqHeader of REQUIRED_SHEET1_HEADERS) {
        if (!headers.includes(reqHeader)) {
          errors.push(`「基本資料設定」分頁缺少必要欄位：${reqHeader}`);
        }
      }
      if (errors.length === 0) {
        errors.push('「基本資料設定」分頁沒有資料列（只有標題列）');
      }
    }
  }

  if (sheet2Data.length > 0) {
    const s2Headers = Object.keys(sheet2Data[0]);
    for (const reqHeader of REQUIRED_SHEET2_HEADERS) {
      if (!s2Headers.includes(reqHeader)) {
        errors.push(`「品牌設定」分頁缺少必要欄位：${reqHeader}`);
      }
    }
  }
  // 品牌設定可以是空的（廠商可以不填品牌）

  if (sheet1Data.length === 0 && errors.length === 0) {
    errors.push('「基本資料設定」分頁沒有資料列');
  }

  return {
    valid: errors.length === 0,
    errors,
    sheet1Data: errors.length === 0 ? sheet1Data : undefined,
    sheet2Data: errors.length === 0 ? sheet2Data : undefined,
  };
}

// ── 主元件 Props ──────────────────────────────────────────────────────────────
interface PartsUploadOverlayProps {
  onClose: () => void;
  /** 當前列表的未報價料號（用於下載範本） */
  pendingParts: PartRecord[];
  /** 確認匯入後回傳解析資料，由父元件執行寫入 */
  onConfirm?: (sheet1Data: Record<string, string>[], sheet2Data: Record<string, string>[]) => void;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function PartsUploadOverlay({ onClose, pendingParts, onConfirm }: PartsUploadOverlayProps) {
  const [dragOver, setDragOver]             = useState(false);
  const [file, setFile]                     = useState<File | null>(null);
  const [parsing, setParsing]               = useState(false);
  const [downloadingTpl, setDownloadingTpl] = useState(false);
  const [structureErrors, setStructureErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Phase 3 預覽相關 state ──
  const [parsedSheet1, setParsedSheet1] = useState<Record<string, string>[]>([]);
  const [parsedSheet2, setParsedSheet2] = useState<Record<string, string>[]>([]);
  const [previewSummary, setPreviewSummary] = useState<ValidationSummary | null>(null);

  // ── 接受的檔案格式 ──
  const ACCEPTED_MIME = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const validateFileType = (f: File) =>
    ACCEPTED_MIME.includes(f.type) || f.name.toLowerCase().endsWith('.xlsx');

  const handleFile = useCallback((f: File) => {
    if (!validateFileType(f)) {
      alert('僅支援 .xlsx 格式');
      return;
    }
    setFile(f);
    setStructureErrors([]);
  }, []);

  const onDragOver  = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop      = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };
  const onBrowseClick = () => fileInputRef.current?.click();
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  const clearFile = () => { setFile(null); setStructureErrors([]); };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTpl(true);
    try { await downloadQuotationTemplate(pendingParts); } finally { setDownloadingTpl(false); }
  };

  // ── 解析 + 結構驗證 + 資料驗證 ──
  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setStructureErrors([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const result = validateExcelStructure(wb);

      if (!result.valid) {
        setStructureErrors(result.errors);
      } else {
        // 結構通過，過濾備註列後執行資料驗證引擎並切換到預覽模式
        const cleanSheet2 = result.sheet2Data!.filter(row => {
          const m = (row['物料'] ?? '').trim();
          return m !== '' && !m.startsWith('※') && !m.startsWith('若有');
        });
        const summary = validateUploadData(result.sheet1Data!, result.sheet2Data!);
        setParsedSheet1(result.sheet1Data!);
        setParsedSheet2(cleanSheet2);
        setPreviewSummary(summary);
      }
    } catch (err) {
      setStructureErrors([`檔案解析失敗：${err instanceof Error ? err.message : '未知錯誤'}`]);
    } finally {
      setParsing(false);
    }
  };

  // ── 從預覽返回上傳 ──
  const handleBackToUpload = () => {
    setPreviewSummary(null);
    setParsedSheet1([]);
    setParsedSheet2([]);
  };

  // ── 確認匯入 ──
  const handleConfirmImport = () => {
    if (!previewSummary) return;

    // 只取驗證通過（passed）的 sheet1 列，避免 noInput 空列覆蓋掉現有資料
    const passedSheet1Indices = new Set(
      previewSummary.sheet1Results
        .filter(r => r.status === 'passed')
        .map(r => r.rowIndex)
    );
    const filteredSheet1 = parsedSheet1.filter((_, idx) => passedSheet1Indices.has(idx));

    // 對應的 sheet2 列：只保留 material|plant|purchaseOrg 有出現在 filteredSheet1 的列
    const passedKeys = new Set(
      filteredSheet1.map(r => `${r['物料'] ?? ''}|${r['工廠'] ?? ''}|${r['採購組織'] ?? ''}`)
    );
    const filteredSheet2 = parsedSheet2.filter(r => {
      const key = `${r['物料'] ?? ''}|${r['工廠'] ?? ''}|${r['採購組織'] ?? ''}`;
      return passedKeys.has(key);
    });

    onConfirm?.(filteredSheet1, filteredSheet2);
  };

  // ── 是否在預覽模式 ──
  const isPreviewMode = previewSummary !== null;

  return (
    <BaseOverlay onClose={onClose} maxWidth={isPreviewMode ? '1100px' : '840px'} maxHeight={isPreviewMode ? '85vh' : '600px'}>
      <div className="relative flex flex-col h-full px-[35px] py-[28px] gap-[16px]">

        {isPreviewMode ? (
          // ─── 預覽模式 ───
          <>
            {/* 預覽標題 */}
            <div className="flex items-center gap-[12px] shrink-0">
              <button
                onClick={handleBackToUpload}
                className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors"
                title="返回上傳"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                預覽確認
              </p>
            </div>
            <PartsUploadPreview
              summary={previewSummary}
              onCancel={handleBackToUpload}
              onConfirm={handleConfirmImport}
            />
          </>
        ) : (
          // ─── 上傳模式 ───
          <>
            {/* ── 標題列 ── */}
            <div className="flex items-center gap-[14px] shrink-0">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                上傳零件資訊
              </p>
            </div>

            {/* ── 上傳區域 ── */}
            <div className="flex-1 min-h-0">
              <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={onInputChange} />

              {!file ? (
                <div
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={onBrowseClick}
                  className={`relative flex flex-col items-center justify-center w-full h-full rounded-[8px] cursor-pointer transition-colors ${
                    dragOver ? 'bg-[rgba(0,94,184,0.08)]' : 'bg-[rgba(145,158,171,0.08)] hover:bg-[rgba(145,158,171,0.12)]'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-[8px] border border-dashed pointer-events-none transition-colors ${
                    dragOver ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.3)]'
                  }`} />
                  <div className="flex flex-col items-center gap-[12px] px-[40px] py-[32px]">
                    <UploadIllustration />
                    <div className="flex flex-col items-center gap-[6px] text-center">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                        Drop or select file
                      </p>
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px] leading-[22px]">
                        Drop files here or click to{' '}
                        <span className="text-[#005eb8]">browse</span>
                        {' '}through your machine.
                      </p>
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#919eab] text-[12px] leading-[18px] mt-[2px]">
                        支援格式：.xlsx
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-[20px]">
                  {/* 檔案資訊卡片 */}
                  <div className="flex items-center gap-[14px] w-full max-w-[480px] px-[20px] py-[16px] rounded-[10px] border border-[rgba(145,158,171,0.24)] bg-white shadow-[0_2px_8px_rgba(145,158,171,0.12)]">
                    <div className="flex items-center justify-center w-[44px] h-[44px] rounded-[8px] shrink-0 bg-[rgba(0,94,184,0.08)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] truncate leading-[22px]">{file.name}</p>
                      <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#919eab] leading-[18px]">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    {parsing ? (
                      <div className="shrink-0 w-[20px] h-[20px]">
                        <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="20" height="20">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#005eb8" strokeWidth="3"/>
                          <path className="opacity-75" fill="#005eb8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); clearFile(); }}
                        className="shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* 選擇其他檔案 */}
                  {!parsing && (
                    <button onClick={onBrowseClick}
                      className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] hover:text-[#005eb8] transition-colors underline">
                      選擇其他檔案
                    </button>
                  )}

                  {/* 結構驗證錯誤訊息 */}
                  {structureErrors.length > 0 && (
                    <div className="w-full max-w-[480px] rounded-[8px] border border-[#ff5630] bg-[rgba(255,86,48,0.04)] px-[16px] py-[12px]">
                      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#ff5630] mb-[6px]">
                        檔案格式驗證失敗
                      </p>
                      <ul className="list-disc list-inside space-y-[2px]">
                        {structureErrors.map((err, i) => (
                          <li key={i} className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#637381] leading-[18px]">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── 底部按鈕列 ── */}
            <div className="flex items-center justify-end gap-[12px] shrink-0 pt-[4px]">
              <button onClick={onClose} disabled={parsing}
                className="h-[36px] min-w-[80px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleParse} disabled={!file || parsing}
                className="h-[36px] min-w-[80px] px-[16px] rounded-[8px] bg-[#004680] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white hover:bg-[#003a6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-[6px]">
                {parsing && (
                  <svg className="animate-spin w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {parsing ? '解析中...' : '開始驗證'}
              </button>
            </div>
          </>
        )}
      </div>
    </BaseOverlay>
  );
}
