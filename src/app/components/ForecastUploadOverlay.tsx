import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { BaseOverlay } from './BaseOverlay';
import svgPaths from '@/imports/svg-36drtgagrx';
import ExcelJS from 'exceljs';

// ── 上傳插圖 SVG ───────────────────────────────────────────────────────────────
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
            <path d={svgPaths.p35533600} fill="url(#paint0_linear)" />
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
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="41.9284" x2="21.7462" y1="32.1831" y2="91.7768">
              <stop stopColor="#005EB8" />
              <stop offset="1" stopColor="#00559C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── 範本 Excel 產生（含黃底必填標示） ────────────────────────────────────────
async function downloadSampleTemplate() {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('預測訂單範本');

  // ── 欄位定義：required = 黃底 ──
  const COLS = [
    { label: '供應商代碼', key: 'vend_no',      width: 16, required: true  },
    { label: '公司代碼',   key: 'BUKRS',         width: 12, required: true  },
    { label: '採購組織',   key: 'EKORG',         width: 12, required: true  },
    { label: '採購群組',   key: 'EKGRP',         width: 12, required: true  },
    { label: '料號',       key: 'part_no',       width: 22, required: true  },
    { label: '廠商料號',   key: 'vend_part_no',  width: 18, required: false },
    { label: 'LeadTime',   key: 'LeadTime',      width: 12, required: false },
    { label: '交貨日期',   key: 'EINDT',         width: 14, required: true  },
    { label: '交貨量',     key: 'ord_qty',       width: 12, required: true  },
    { label: '採購單位',   key: 'MEINS',         width: 12, required: true  },
  ];

  // 設定欄位寬度
  ws.columns = COLS.map((c, i) => ({ key: String(i + 1), width: c.width }));

  // ── 填色樣式 ──
  const yellowFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  const boldFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: true, size: 11 };
  const normalFont: Partial<ExcelJS.Font> = { name: 'Calibri', bold: false, size: 11 };
  const thinBorder: Partial<ExcelJS.Borders> = {
    top:    { style: 'thin', color: { argb: 'FFD0D0D0' } },
    left:   { style: 'thin', color: { argb: 'FFD0D0D0' } },
    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    right:  { style: 'thin', color: { argb: 'FFD0D0D0' } },
  };

  const applyHeaderStyle = (row: ExcelJS.Row) => {
    COLS.forEach((col, i) => {
      const cell = row.getCell(i + 1);
      cell.font = boldFont;
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (col.required) cell.fill = yellowFill;
    });
    row.height = 20;
  };

  // ── 第一列：中文欄位名稱（必填欄黃底） ──
  const row1 = ws.addRow(COLS.map(c => c.label));
  applyHeaderStyle(row1);

  // ── 第二列：英文欄位代碼（必填欄黃底） ──
  const row2 = ws.addRow(COLS.map(c => c.key));
  applyHeaderStyle(row2);

  // ── 資料列 ──
  const DATA: (string | number)[][] = [
    ['1000641', '1100', '1101', 'T40', '3G915094K1',    '', '', '20191014', 2,     'SET'],
    ['1000590', '1100', '1101', 'T40', '3G915021K1',    '', '', '20191014', 2,     'SET'],
    ['1000482', '1100', '1101', 'T40', '3DB20003-1',    '', '', '20191018', 3,     'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20215B1',    '', '', '20191119', 85,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20215B1',    '', '', '20191121', 42,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20215B1',    '', '', '20200103', 43,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20215B1',    '', '', '20200113', 9,     'SET'],
    ['1000482', '1100', '1101', 'T40', '3FF-9T00005',   '', '', '20191205', 650,   'SET'],
    ['1000482', '1100', '1101', 'T40', '3FF-9T00005',   '', '', '20191212', 346,   'SET'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20191212', 1056,  'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20191220', 1350,  'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20191226', 808,   'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200102', 1704,  'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200109', 1830,  'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200116', 940,   'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200123', 848,   'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200130', 1072,  'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200206', 312,   'PCE'],
    ['1000500', '1100', '1101', 'T10', '323-T211HT1001','', '', '20200213', 1878,  'PCE'],
    ['1000641', '1100', '1101', 'T40', '3SU20216-1',    '', '', '20191114', 41,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20216-1',    '', '', '20191115', 43,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20216-1',    '', '', '20191116', 41,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20216-1',    '', '', '20191118', 41,    'SET'],
    ['1000641', '1100', '1101', 'T40', '3SU20216-1',    '', '', '20191119', 42,    'SET'],
  ];

  DATA.forEach(rowData => {
    const row = ws.addRow(rowData);
    row.height = 18;
    COLS.forEach((_col, i) => {
      const cell = row.getCell(i + 1);
      cell.font = normalFont;
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // ── 凍結前兩列 ──
  ws.views = [{ state: 'frozen', ySplit: 2 }];

  // ── 輸出 ──
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '預測訂單上傳範本.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── 主元件 Props ──────────────────────────────────────────────────────────────
interface ForecastUploadOverlayProps {
  onClose: () => void;
  onConfirm?: (file: File) => void;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function ForecastUploadOverlay({ onClose, onConfirm }: ForecastUploadOverlayProps) {
  const [dragOver, setDragOver]               = useState(false);
  const [file, setFile]                       = useState<File | null>(null);
  const [uploading, setUploading]             = useState(false);
  const [uploaded, setUploaded]               = useState(false);
  const [downloadingTpl, setDownloadingTpl]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 接受的檔案格式 ──
  const ACCEPTED = ['.csv', '.xlsx'];
  const ACCEPTED_MIME = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const validateFile = (f: File) =>
    ACCEPTED_MIME.includes(f.type) || ACCEPTED.some(ext => f.name.toLowerCase().endsWith(ext));

  const handleFile = useCallback((f: File) => {
    if (!validateFile(f)) { alert('僅支援 .csv、.xlsx 格式'); return; }
    setFile(f);
    setUploaded(false);
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

  const handleUpdate = async () => {
    if (!file) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setUploaded(true);
    onConfirm?.(file);
    setTimeout(() => onClose(), 800);
  };

  const clearFile = () => { setFile(null); setUploaded(false); };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTpl(true);
    try { await downloadSampleTemplate(); } finally { setDownloadingTpl(false); }
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="840px" maxHeight="560px">
      <div className="relative flex flex-col h-full px-[35px] py-[28px] gap-[16px]">

        {/* ── 標題列 ── */}
        <div className="flex items-center gap-[14px] shrink-0">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            請上傳預測訂單
          </p>
          <button
            onClick={handleDownloadTemplate}
            disabled={downloadingTpl}
            className="font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[28px] text-[#005eb8] text-[15px] underline decoration-solid hover:text-[#004680] transition-colors disabled:opacity-60 flex items-center gap-[4px]"
          >
            {downloadingTpl && (
              <svg className="animate-spin w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#005eb8" strokeWidth="3"/>
                <path className="opacity-75" fill="#005eb8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            範本
          </button>
          {/* 必填說明 */}
          <span className="flex items-center gap-[5px] text-[12px] text-[#637381]">
            <span className="inline-block w-[12px] h-[12px] rounded-[2px] bg-[#FFFF00] border border-[#cccc00] shrink-0" />
            必填欄位
          </span>
        </div>

        {/* ── 上傳區域 ── */}
        <div className="flex-1 min-h-0">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={onInputChange} />

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
                    支援格式：.csv、.xlsx
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full gap-[20px]">
              <div className="flex items-center gap-[14px] w-full max-w-[480px] px-[20px] py-[16px] rounded-[10px] border border-[rgba(145,158,171,0.24)] bg-white shadow-[0_2px_8px_rgba(145,158,171,0.12)]">
                <div className={`flex items-center justify-center w-[44px] h-[44px] rounded-[8px] shrink-0 ${
                  uploaded ? 'bg-[rgba(17,141,87,0.08)]' : 'bg-[rgba(0,94,184,0.08)]'
                }`}>
                  {uploaded ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="#118d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#118d57" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#005eb8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] truncate leading-[22px]">{file.name}</p>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#919eab] leading-[18px]">
                    {formatSize(file.size)}
                    {uploaded && <span className="ml-[8px] text-[#118d57]">上傳成功</span>}
                  </p>
                </div>
                {uploading ? (
                  <div className="shrink-0 w-[20px] h-[20px]">
                    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#005eb8" strokeWidth="3"/>
                      <path className="opacity-75" fill="#005eb8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                ) : !uploaded ? (
                  <button onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="#637381" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                ) : (
                  <div className="shrink-0 flex items-center justify-center w-[28px] h-[28px]">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 9l3.5 3.5L14 6" stroke="#118d57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              {!uploading && !uploaded && (
                <button onClick={onBrowseClick}
                  className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] hover:text-[#005eb8] transition-colors underline">
                  選擇其他檔案
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 底部按鈕列 ── */}
        <div className="flex items-center justify-end gap-[12px] shrink-0 pt-[4px]">
          <button onClick={onClose} disabled={uploading}
            className="h-[36px] min-w-[80px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-[#1c252e] hover:bg-[rgba(145,158,171,0.08)] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={!file || uploading || uploaded}
            className="h-[36px] min-w-[80px] px-[16px] rounded-[8px] bg-[#004680] font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white hover:bg-[#003a6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-[6px]">
            {uploading && (
              <svg className="animate-spin w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {uploading ? '上傳中...' : 'Update'}
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}