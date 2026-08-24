'use client';

/**
 * GtsTwUploadOverlay — 上傳台灣捷安特外箱貼紙出貨明細 Overlay
 *
 * 功能：
 * - xlsx / csv 上傳（拖曳 or 點擊選擇）
 * - 解析 Excel 欄位：訂單號碼、物料編號、數量、單位、箱數、每箱入數、出貨單號、出貨日期
 * - Mock AX 驗證（待中台 API 串接後替換）
 * - 成功後顯示筆數 + 跳轉連結
 * - 參考 ForecastUploadOverlay.tsx 結構
 */

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { BaseOverlay } from './BaseOverlay';
import type { GtsTwPrintRow } from './GtsTwPrintPage';

interface GtsTwUploadOverlayProps {
  onClose: () => void;
  onUploadSuccess: (rows: GtsTwPrintRow[]) => void;
}

// ── Excel 欄位對應 GtsTwPrintRow ──────────────────────────────────────────
function parseExcelRow(raw: Record<string, unknown>, index: number): GtsTwPrintRow {
  const get = (key: string) => String(raw[key] ?? '').trim();
  // 欄位名稱已與表格欄位對齊
  const orderNo   = get('訂單號碼') || get('order_no')    || get('orderNo');
  const materialNo= get('料號')     || get('material_no')  || get('materialNo');
  const qty       = Number(get('出貨量')  || get('qty'))       || 0;
  const unit      = get('單位')     || get('unit')        || 'PCE';
  const boxCount  = Number(get('總箱數')  || get('box_count')  || get('boxCount')) || 1;
  const qtyPerBox = Number(get('本件數量') || get('qty_per_box')|| get('qtyPerBox')) || qty;
  const shipNo    = get('廠商出貨單') || get('ship_no')    || get('shipNo');
  const shipDate  = get('交貨日期') || get('ship_date')  || get('shipDate');
  const orderSeq  = get('訂單序號') || get('order_seq') || String(index + 1);

  return {
    id:              index + 1,
    barcode:         `GT${String(index + 1).padStart(8, '0')}`,
    vendorShortName: '',
    vendorShipNo:    shipNo,
    materialNo,
    unitQty:         qtyPerBox,
    shipQty:         qty,
    unit,
    labelFreq:       `1/${boxCount}`,
    totalBoxes:      boxCount,
    orderNo,
    orderSeq,
    deliveryDate:    shipDate,
    productName:     '',
    vendorMaterialNo: '',
    // 貼紙額外欄位
    netWeight:      0,
    grossWeight:    0,
    customerMaterialNo: '',
    customerOrderNo:    '',
    vendorName:         '',
    storageLocation:    '',
    destination:        '',
  };
}

// ── 主元件 ──────────────────────────────────────────────────────────────────
export function GtsTwUploadOverlay({ onClose, onUploadSuccess }: GtsTwUploadOverlayProps) {
  const [isDragging,   setIsDragging]  = useState(false);
  const [uploadState,  setUploadState] = useState<'idle' | 'validating' | 'confirm' | 'success' | 'error'>('idle');
  const [uploadCount,  setUploadCount] = useState(0);
  const [errorMsg,     setErrorMsg]    = useState('');
  const [parsedRows,   setParsedRows]  = useState<GtsTwPrintRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv   = file.name.endsWith('.csv');
    if (!isExcel && !isCsv) {
      setErrorMsg('請上傳 Excel（xlsx/xls）或 CSV 格式的檔案。');
      setUploadState('error');
      return;
    }

    setUploadState('validating');
    setErrorMsg('');

    try {
      const buffer   = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (jsonData.length === 0) {
        setErrorMsg('檔案內容為空，請確認 Excel 欄位格式是否正確。');
        setUploadState('error');
        return;
      }

      // 驗證必填欄位
      const firstRow = jsonData[0];
      const requiredKeys = ['訂單號碼', '料號', '出貨量', '單位', '總箱數', '本件數量', '廠商出貨單', '交貨日期'];
      const excelKeys = Object.keys(firstRow);
      const missing = requiredKeys.filter(k =>
        !excelKeys.some(ek => ek.includes(k) || ek.toLowerCase().includes(k.toLowerCase()))
      );
      if (missing.length > 0) {
        setErrorMsg(`缺少必填欄位：${missing.join('、')}，請使用官方範本。`);
        setUploadState('error');
        return;
      }

      // 模擬 AX 驗證（待中台 API 串接）
      await new Promise(resolve => setTimeout(resolve, 800));

      const rows = jsonData.map((raw, i) => parseExcelRow(raw, i));
      setParsedRows(rows);
      setUploadCount(rows.length);
      setUploadState('confirm');   // 先進確認步驟，使用者確認後才匯入
    } catch {
      setErrorMsg('檔案解析失敗，請確認格式是否正確。');
      setUploadState('error');
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processFile]);

  const handleDownloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['訂單號碼', '料號', '出貨量', '單位', '總箱數', '本件數量', '廠商出貨單', '交貨日期'],
      ['4000035086', '152E-AAAA-666', 100, 'PCE', 1, 100, '00123456', '2026/01/21'],
      ['4000036001', '152E-BBBB-777', 500, 'SET', 3, 200, '0067890',  '2026/01/31'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'GTS外箱貼紙');
    XLSX.writeFile(wb, 'GTS外箱貼紙範本.xlsx');
  }, []);

  const handleConfirmImport = useCallback(() => {
    /**
     * ── 新系統架構（待中台 API 串接後替換）────────────────────────────────
     *
     * 架構說明：
     *   AX → 拋訂單資料 → 中台 MDO
     *   EP → 查中台 MDO 驗證訂單是否存在（不直連 AX）
     *
     * Step 1：驗證訂單存在（逐筆或批次查中台）
     *   GET /ax-orders/{orderNo}
     *   或 POST /ax-orders/validate  body: { orderNos: string[] }
     *   → 若訂單不存在 MDO，回傳錯誤，阻止上傳
     *
     * Step 2：寫入出貨明細
     *   POST /gts-sticker/upload
     *   body: parsedRows.map(r => ({
     *     purchaseOrder: r.orderNo,
     *     partNo:        r.materialNo,
     *     qty:           r.shipQty,
     *     unit:          r.unit,
     *     boxes:         r.totalBoxes,
     *     qtyBox:        r.unitQty,
     *     shipNo:        r.vendorShipNo,
     *     eta:           r.deliveryDate,
     *     action:        'C',   // 統一帶 C（新增），使用者不顯示
     *   }))
     *
     * 防重複上傳：
     *   由 MDO SP / 後端邏輯負責
     *   → 回傳 { success, failed, errors[] }
     *   → 前端展示失敗原因並阻止導入
     * ─────────────────────────────────────────────────────────────────────
     */
    onUploadSuccess(parsedRows);
    setUploadState('success');
  }, [parsedRows, onUploadSuccess]);

  const handleCancelConfirm = useCallback(() => {
    setUploadState('idle');
    setParsedRows([]);
    setUploadCount(0);
  }, []);

  const handleGoToPrint = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BaseOverlay onClose={onClose} maxWidth="640px" maxHeight="520px">
      <div className="relative w-full h-full flex flex-col px-[40px] pt-[40px] pb-[32px] gap-[20px]">

        {/* 關閉按鈕 */}
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

        {/* 標題列 */}
        <div className="flex items-center gap-[16px] pt-[4px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            上傳台灣捷安特專屬外箱貼紙
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer leading-[22px] shrink-0"
          >
            下載範本
          </button>
        </div>

        {/* 說明文字 */}
        <div className="flex flex-col gap-[6px]">
          <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[13px] text-[#637381] leading-[20px]">
            出貨資訊上傳後將無法修改，若需要刪除或修改已上傳的出貨資訊，請聯絡台灣捷安特採購人員協助處理。
          </p>
        </div>

        {/* 上傳區 / 確認區 / 結果區 */}
        {uploadState === 'confirm' ? (
          /* ── 確認提醒區 ── */
          <div className="flex-1 flex flex-col gap-[20px]">
            {/* 警告文字框 */}
            <div className="flex items-start gap-[12px] rounded-[10px] p-[16px] bg-[rgba(255,171,0,0.08)] border border-[rgba(255,171,0,0.32)]">
              <svg className="shrink-0 mt-[1px]" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#B76E00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[13px] text-[#7A4100] leading-[20px]">
                出貨資訊上傳後將無法修改，若需要刪除或修改已上傳的出貨資訊，請聯絡台灣捷安特採購人員協助處理，請確認資料是否正確。
              </p>
            </div>

            {/* 筆數說明 */}
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px]">
              共解析到 <strong className="text-[#1c252e]">{uploadCount}</strong> 筆資料，確認無誤後請點「確認資料無誤」匯入。
            </p>

            {/* 按鈕列 */}
            <div className="flex items-center justify-end gap-[12px] mt-auto">
              <button
                onClick={handleCancelConfirm}
                className="flex items-center h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] hover:bg-[rgba(145,158,171,0.08)] text-[#637381] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex items-center h-[36px] px-[20px] rounded-[8px] bg-[#00559c] hover:bg-[#004680] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
              >
                確認資料無誤
              </button>
            </div>
          </div>
        ) : uploadState === 'success' ? (
          /* ── 成功狀態 ── */
          <div
            className="flex-1 flex flex-col items-center justify-center rounded-[12px] border-[2px] border-dashed"
            style={{ borderColor: '#36B37E', backgroundColor: 'rgba(54,179,126,0.05)' }}
          >
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381] leading-[22px] text-center">
              已上傳 <strong className="text-[#1c252e]">{uploadCount}</strong> 筆資料，可至
              <button
                onClick={handleGoToPrint}
                className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#1677ff] underline hover:text-[#0958d9] transition-colors cursor-pointer leading-[22px] mx-[4px]"
              >
                列印外箱貼紙
              </button>
              查詢並列印
            </p>
          </div>
        ) : (
          /* 上傳區 */
          <div
            className={`flex-1 flex flex-col items-center justify-center rounded-[12px] border-[2px] border-dashed cursor-pointer transition-colors ${
              isDragging ? 'border-[#005eb8] bg-[rgba(0,94,184,0.05)]' : 'border-[rgba(145,158,171,0.32)] hover:border-[#005eb8] hover:bg-[rgba(0,94,184,0.03)]'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadState === 'validating' ? (
              <div className="flex flex-col items-center gap-[12px]">
                <div className="w-[40px] h-[40px] border-[3px] border-[#005eb8] border-t-transparent rounded-full animate-spin" />
                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381] leading-[22px]">
                  驗證中，請稍候…
                </p>
              </div>
            ) : uploadState === 'error' ? (
              <div className="flex flex-col items-center gap-[12px] px-[24px]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 16.5h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="#FF5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#FF5630] leading-[22px] text-center">
                  {errorMsg}
                </p>
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] leading-[20px]">
                  點擊重新選擇檔案
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-[12px]">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M8 32L8 38C8 39.1046 8.89543 40 10 40L38 40C39.1046 40 40 39.1046 40 38L40 32" stroke="#005eb8" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M24 28L24 12" stroke="#005eb8" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M16 20L24 12L32 20" stroke="#005eb8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-center">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[22px]">
                    拖曳檔案至此，或點擊選擇檔案
                  </p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] leading-[20px] mt-[4px]">
                    支援 Excel（xlsx/xls）或 CSV 格式
                  </p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab] leading-[18px] mt-[2px]">
                    填選取得上傳的檔案必須是 Excel 2003 或是 2007 以上版本，必須且必填欄位
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseOverlay>
  );
}
