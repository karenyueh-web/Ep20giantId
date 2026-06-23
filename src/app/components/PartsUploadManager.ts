// ── 零件資訊上傳管理器 — 範本生成 ─────────────────────────────────────────────
import ExcelJS from 'exceljs';
import type { PartRecord } from './partsMaintenanceData';
import {
  BRAND_OPTIONS,
  CURRENCY_OPTIONS,
  TRADE_TERMS_OPTIONS,
  QUOTE_UNIT_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from './partsMaintenanceData';

// ── 樣式常數 ─────────────────────────────────────────────────────────────────

const FONT_HEADER: Partial<ExcelJS.Font> = { name: 'Calibri', bold: true, size: 11 };
const FONT_NORMAL: Partial<ExcelJS.Font> = { name: 'Calibri', bold: false, size: 11 };
const FONT_NOTE: Partial<ExcelJS.Font> = { name: 'Calibri', bold: false, size: 10, italic: true, color: { argb: 'FF637381' } };

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top:    { style: 'thin', color: { argb: 'FFD0D0D0' } },
  left:   { style: 'thin', color: { argb: 'FFD0D0D0' } },
  bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
  right:  { style: 'thin', color: { argb: 'FFD0D0D0' } },
};

/** 灰底（唯讀欄位） */
const FILL_GRAY: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
/** 黃底（可編輯重點欄位） */
const FILL_YELLOW: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
/** 綠底（分頁 3 標題） */
const FILL_GREEN_HEADER: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
/** 淺綠底（分頁 3 資料列） */
const FILL_GREEN_LIGHT: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };

const ALIGNMENT_CENTER: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center' };
const ALIGNMENT_LEFT: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'left' };

// ── 分頁 1 欄位定義 ──────────────────────────────────────────────────────────

interface Sheet1ColDef {
  label: string;
  key: keyof PartRecord | 'vendorDisplay' | 'syncDtcDteDisplay';
  width: number;
  readOnly: boolean;
  /** 可編輯重點欄位用黃底標示 */
  highlight?: boolean;
  /** 取值函式（覆寫預設） */
  getValue?: (p: PartRecord) => string;
}

const SHEET1_COLS: Sheet1ColDef[] = [
  { label: '供應商',             key: 'vendorDisplay',       width: 22, readOnly: true,  getValue: p => `${p.vendorCode}(${p.vendorName})` },
  { label: '物料',               key: 'material',            width: 22, readOnly: true  },
  { label: '工廠',               key: 'plant',               width: 10, readOnly: true  },
  { label: '採購組織',           key: 'purchaseOrg',         width: 12, readOnly: true  },
  { label: '長規格敘述',         key: 'longDescription',     width: 50, readOnly: true  },
  { label: '廠商QA認證完成日期', key: 'qaCompletionDate',    width: 22, readOnly: false, highlight: true },
  { label: '可配合日期',         key: 'sampleDate',          width: 16, readOnly: false, highlight: true },
  { label: '首次交貨可出貨日期', key: 'firstDeliveryDate',   width: 22, readOnly: false, highlight: true },
  { label: '廠商料號',           key: 'vendorPartNo',        width: 18, readOnly: false },
  { label: '毛重',               key: 'grossWeight',         width: 10, readOnly: false },
  { label: '淨重',               key: 'netWeight',           width: 10, readOnly: false },
  { label: '重量單位',           key: 'weightUnit',          width: 12, readOnly: false },
  { label: '同步DTC/DTE',        key: 'syncDtcDteDisplay',   width: 14, readOnly: false, getValue: p => p.syncDtcDte ? 'Y' : 'N' },
];

// ── 分頁 2 欄位定義 ──────────────────────────────────────────────────────────

interface Sheet2ColDef {
  label: string;
  width: number;
  readOnly: boolean;
  /** Data Validation 參照分頁 3 的欄位名稱 */
  validationRef?: string;
}

const SHEET2_COLS: Sheet2ColDef[] = [
  { label: '物料',             width: 22, readOnly: true  },
  { label: '工廠',             width: 10, readOnly: true  },
  { label: '採購組織',         width: 12, readOnly: true  },
  { label: '品牌',             width: 14, readOnly: false, validationRef: '品牌' },
  { label: '採購單價',         width: 14, readOnly: false },
  { label: '幣別',             width: 10, readOnly: false, validationRef: '幣別' },
  { label: '報價數量',         width: 14, readOnly: false },
  { label: 'Lead Time',       width: 12, readOnly: false },
  { label: 'MOQ',              width: 10, readOnly: false },
  { label: '國貿條件',         width: 20, readOnly: false, validationRef: '國貿條件' },
  { label: '國貿條件約定地點', width: 18, readOnly: false },
  { label: '報價單位',         width: 16, readOnly: false, validationRef: '報價單位' },
  { label: '標準品/客製品',    width: 14, readOnly: false, validationRef: '標準品/客製品' },
];

// ── 分頁 3 選項區塊定義 ──────────────────────────────────────────────────────

interface OptionBlock {
  title: string;
  options: { value: string; label: string }[];
  /** 是否有說明欄 */
  hasDescription: boolean;
}

function buildOptionBlocks(): OptionBlock[] {
  return [
    { title: '品牌',         options: BRAND_OPTIONS,        hasDescription: false },
    { title: '幣別',         options: CURRENCY_OPTIONS,     hasDescription: false },
    { title: '國貿條件',     options: TRADE_TERMS_OPTIONS,  hasDescription: true  },
    { title: '報價單位',     options: QUOTE_UNIT_OPTIONS,   hasDescription: true  },
    { title: '標準品/客製品', options: PRODUCT_TYPE_OPTIONS, hasDescription: false },
    { title: '重量單位',     options: WEIGHT_UNIT_OPTIONS,  hasDescription: false },
  ];
}

// ── 工具函式 ─────────────────────────────────────────────────────────────────

/** 欄位數字 → Excel 欄位字母（1→A, 2→B, ..., 27→AA） */
function getColLetter(colNum: number): string {
  let result = '';
  let num = colNum;
  while (num > 0) {
    const mod = (num - 1) % 26;
    result = String.fromCharCode(65 + mod) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

/**
 * 預先計算分頁 3 每個選項區塊在 Excel 中的位置和 Data Validation 引用範圍。
 * 這樣可以在建立分頁 1、2 時就設定 Data Validation，不用先建分頁 3。
 */
function precomputeValidationRanges(optionBlocks: OptionBlock[]): Record<string, string> {
  const ranges: Record<string, string> = {};
  let col3Offset = 1;

  for (const block of optionBlocks) {
    const codeCol = col3Offset;
    const lastDataRow = block.options.length + 1; // +1 因為第 1 列是標題
    const colLetter = getColLetter(codeCol);
    ranges[block.title] = `'選項對照表'!$${colLetter}$2:$${colLetter}$${lastDataRow}`;
    col3Offset += block.hasDescription ? 3 : 2; // 留一欄間距
  }

  return ranges;
}

// ── 主函式：下載報價範本 ─────────────────────────────────────────────────────

export async function downloadQuotationTemplate(parts: PartRecord[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const optionBlocks = buildOptionBlocks();
  const validationRanges = precomputeValidationRanges(optionBlocks);

  // ═══════════════════════════════════════════════════════════════════════════
  // 分頁 1：基本資料設定
  // ═══════════════════════════════════════════════════════════════════════════
  const ws1 = workbook.addWorksheet('基本資料設定');

  // 欄寬
  SHEET1_COLS.forEach((col, i) => {
    ws1.getColumn(i + 1).width = col.width;
  });

  // 標題列
  const headerRow1 = ws1.addRow(SHEET1_COLS.map(c => c.label));
  headerRow1.height = 22;
  SHEET1_COLS.forEach((col, i) => {
    const cell = headerRow1.getCell(i + 1);
    cell.font = FONT_HEADER;
    cell.border = THIN_BORDER;
    cell.alignment = ALIGNMENT_CENTER;
    if (col.readOnly) {
      cell.fill = FILL_GRAY;
    } else if (col.highlight) {
      cell.fill = FILL_YELLOW;
    }
  });

  // 資料列
  parts.forEach(part => {
    const rowData = SHEET1_COLS.map(col => {
      if (col.getValue) return col.getValue(part);
      return String((part as Record<string, unknown>)[col.key] ?? '');
    });
    const row = ws1.addRow(rowData);
    row.height = 20;

    SHEET1_COLS.forEach((col, i) => {
      const cell = row.getCell(i + 1);
      cell.font = FONT_NORMAL;
      cell.border = THIN_BORDER;
      cell.alignment = ALIGNMENT_LEFT;

      if (col.readOnly) {
        cell.fill = FILL_GRAY;
        // locked = true 是 ExcelJS 預設，不需要額外設定
      } else {
        cell.protection = { locked: false };
        if (col.highlight) {
          cell.fill = FILL_YELLOW;
        }
      }
    });

    // 重量單位 Data Validation
    const weightUnitIdx = SHEET1_COLS.findIndex(c => c.label === '重量單位');
    if (weightUnitIdx >= 0 && validationRanges['重量單位']) {
      row.getCell(weightUnitIdx + 1).dataValidation = {
        type: 'list',
        formulae: [validationRanges['重量單位']],
        showErrorMessage: true,
        errorTitle: '無效的重量單位',
        error: '請從下拉選單中選擇有效的重量單位',
      };
    }

    // 同步DTC/DTE Data Validation（Y/N）
    const syncIdx = SHEET1_COLS.findIndex(c => c.label === '同步DTC/DTE');
    if (syncIdx >= 0) {
      row.getCell(syncIdx + 1).dataValidation = {
        type: 'list',
        formulae: ['"Y,N"'],
        showErrorMessage: true,
        errorTitle: '無效的值',
        error: '請輸入 Y 或 N',
      };
      row.getCell(syncIdx + 1).protection = { locked: false };
    }
  });

  // 凍結標題列
  ws1.views = [{ state: 'frozen', ySplit: 1 }];

  // 啟用 Sheet Protection（鎖定唯讀欄位）
  await ws1.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 分頁 2：品牌設定
  // ═══════════════════════════════════════════════════════════════════════════
  const ws2 = workbook.addWorksheet('品牌設定');

  // 欄寬
  SHEET2_COLS.forEach((col, i) => {
    ws2.getColumn(i + 1).width = col.width;
  });

  // 標題列
  const headerRow2 = ws2.addRow(SHEET2_COLS.map(c => c.label));
  headerRow2.height = 22;
  SHEET2_COLS.forEach((col, i) => {
    const cell = headerRow2.getCell(i + 1);
    cell.font = FONT_HEADER;
    cell.border = THIN_BORDER;
    cell.alignment = ALIGNMENT_CENTER;
    if (col.readOnly) {
      cell.fill = FILL_GRAY;
    }
  });

  // 每個料號一列，品牌預設 ALL
  parts.forEach(part => {
    const rowData = SHEET2_COLS.map(col => {
      if (col.label === '物料') return part.material;
      if (col.label === '工廠') return part.plant;
      if (col.label === '採購組織') return part.purchaseOrg;
      if (col.label === '品牌') return 'ALL';
      return '';
    });
    const row = ws2.addRow(rowData);
    row.height = 20;

    SHEET2_COLS.forEach((col, i) => {
      const cell = row.getCell(i + 1);
      cell.font = FONT_NORMAL;
      cell.border = THIN_BORDER;
      cell.alignment = ALIGNMENT_LEFT;

      if (col.readOnly) {
        cell.fill = FILL_GRAY;
      } else {
        cell.protection = { locked: false };

        // Data Validation 下拉
        if (col.validationRef && validationRanges[col.validationRef]) {
          cell.dataValidation = {
            type: 'list',
            formulae: [validationRanges[col.validationRef]],
            showErrorMessage: true,
            errorTitle: `無效的${col.label}`,
            error: `請從下拉選單中選擇有效的${col.label}`,
          };
        }
      }
    });
  });

  // 備註列：多品牌提示
  const noteRowNum = parts.length + 3;
  const noteCell = ws2.getCell(noteRowNum, 1);
  noteCell.value = '※ 若有多品牌需求，請自行複製該料號列並修改品牌欄位。新增列的選項欄位下拉功能可能需要手動從上方列複製。';
  noteCell.font = FONT_NOTE;
  ws2.mergeCells(noteRowNum, 1, noteRowNum, SHEET2_COLS.length);

  // 凍結標題列
  ws2.views = [{ state: 'frozen', ySplit: 1 }];

  // 啟用 Sheet Protection（允許插入/刪除列，因為多品牌需要新增列）
  await ws2.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: true,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: true,
    sort: false,
    autoFilter: false,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 分頁 3：選項對照表
  // ═══════════════════════════════════════════════════════════════════════════
  const ws3 = workbook.addWorksheet('選項對照表');

  let col3Offset = 1;
  for (const block of optionBlocks) {
    const codeCol = col3Offset;
    const descCol = block.hasDescription ? col3Offset + 1 : -1;

    // 標題列
    const headerCell = ws3.getCell(1, codeCol);
    headerCell.value = block.title;
    headerCell.font = { ...FONT_HEADER, color: { argb: 'FFFFFFFF' } };
    headerCell.fill = FILL_GREEN_HEADER;
    headerCell.border = THIN_BORDER;
    headerCell.alignment = ALIGNMENT_CENTER;
    ws3.getColumn(codeCol).width = 16;

    if (block.hasDescription) {
      const descHeaderCell = ws3.getCell(1, descCol);
      descHeaderCell.value = '說明';
      descHeaderCell.font = { ...FONT_HEADER, color: { argb: 'FFFFFFFF' } };
      descHeaderCell.fill = FILL_GREEN_HEADER;
      descHeaderCell.border = THIN_BORDER;
      descHeaderCell.alignment = ALIGNMENT_CENTER;
      ws3.getColumn(descCol).width = 28;
    }

    // 資料列
    block.options.forEach((opt, i) => {
      const rowNum = i + 2;
      const codeCell = ws3.getCell(rowNum, codeCol);
      codeCell.value = opt.value;
      codeCell.font = FONT_NORMAL;
      codeCell.border = THIN_BORDER;
      codeCell.fill = FILL_GREEN_LIGHT;
      codeCell.alignment = ALIGNMENT_LEFT;

      if (block.hasDescription && descCol > 0) {
        const descCell = ws3.getCell(rowNum, descCol);
        const desc = opt.label.replace(opt.value, '').replace(/^\s*\(?\s*/, '').replace(/\s*\)?\s*$/, '');
        descCell.value = desc || opt.value;
        descCell.font = FONT_NORMAL;
        descCell.border = THIN_BORDER;
        descCell.fill = FILL_GREEN_LIGHT;
        descCell.alignment = ALIGNMENT_LEFT;
      }
    });

    col3Offset += block.hasDescription ? 3 : 2;
  }

  // ── 日期格式說明區塊 ──
  const dateCol = col3Offset;
  const dateHeaderCell = ws3.getCell(1, dateCol);
  dateHeaderCell.value = '日期格式';
  dateHeaderCell.font = { ...FONT_HEADER, color: { argb: 'FFFFFFFF' } };
  dateHeaderCell.fill = FILL_GREEN_HEADER;
  dateHeaderCell.border = THIN_BORDER;
  dateHeaderCell.alignment = ALIGNMENT_CENTER;
  ws3.getColumn(dateCol).width = 20;

  const dateSampleCol = dateCol + 1;
  const dateSampleHeaderCell = ws3.getCell(1, dateSampleCol);
  dateSampleHeaderCell.value = '說明';
  dateSampleHeaderCell.font = { ...FONT_HEADER, color: { argb: 'FFFFFFFF' } };
  dateSampleHeaderCell.fill = FILL_GREEN_HEADER;
  dateSampleHeaderCell.border = THIN_BORDER;
  dateSampleHeaderCell.alignment = ALIGNMENT_CENTER;
  ws3.getColumn(dateSampleCol).width = 36;

  const dateExamples = [
    { format: 'YYYYMMDD', desc: '標準格式（例：20260102）' },
    { format: 'YYYY/MM/DD', desc: '系統自動轉為 YYYYMMDD' },
    { format: 'YYYY-MM-DD', desc: '系統自動轉為 YYYYMMDD' },
  ];
  dateExamples.forEach((ex, i) => {
    const rowNum = i + 2;
    const fmtCell = ws3.getCell(rowNum, dateCol);
    fmtCell.value = ex.format;
    fmtCell.font = FONT_NORMAL;
    fmtCell.border = THIN_BORDER;
    fmtCell.fill = FILL_GREEN_LIGHT;
    fmtCell.alignment = ALIGNMENT_LEFT;

    const descCell = ws3.getCell(rowNum, dateSampleCol);
    descCell.value = ex.desc;
    descCell.font = FONT_NORMAL;
    descCell.border = THIN_BORDER;
    descCell.fill = FILL_GREEN_LIGHT;
    descCell.alignment = ALIGNMENT_LEFT;
  });

  // 凍結標題列
  ws3.views = [{ state: 'frozen', ySplit: 1 }];

  // ═══════════════════════════════════════════════════════════════════════════
  // 輸出下載
  // ═══════════════════════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // 組合檔名：批次報價零件資訊-YYYYMMDD-廠商簡稱.xlsx
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const vendorName = parts[0]?.vendorName ?? '廠商';
  a.download = `批次報價零件資訊-${yyyy}${mm}${dd}-${vendorName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
