/**
 * generate-erd-excel.mjs
 * 產生系統物件導向 ERD Excel 報表
 * 執行: node generate-erd-excel.mjs
 */

import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '系統物件欄位總表.xlsx');

// ═══════════════════════════════════════════════════
// 定義所有物件類別與欄位
// ═══════════════════════════════════════════════════

const MODULES = [
  // ─────────────────────────────────────────────────
  // 1. 訂單模組
  // ─────────────────────────────────────────────────
  {
    module: '訂單模組',
    className: 'OrderRow',
    classNameZh: '訂單主資料',
    source: 'AdvancedOrderTable.tsx',
    description: '採購訂單的主資料物件，涵蓋所有訂單狀態與交貨排程資訊',
    fields: [
      { field: 'id',                    zh: '識別碼',              type: 'number',   required: true,  note: '系統流水號' },
      { field: 'status',                zh: '訂單狀態',            type: 'enum',     required: true,  note: 'NP / V / B / CK / CL' },
      { field: 'orderNo',               zh: '訂單號碼',            type: 'string',   required: true,  note: '如 4500XXXXXX' },
      { field: 'orderDate',             zh: '訂單日期',            type: 'string',   required: true,  note: 'YYYY/MM/DD' },
      { field: 'orderType',             zh: '訂單類型',            type: 'string',   required: true,  note: '如 NB / 換貨(J)' },
      { field: 'company',               zh: '公司名稱',            type: 'string',   required: false, note: '採購公司' },
      { field: 'purchaseOrg',           zh: '採購組織',            type: 'string',   required: false, note: '如 1101' },
      { field: 'orderSeq',              zh: '訂單序號',            type: 'string',   required: true,  note: '' },
      { field: 'docSeqNo',              zh: '單據序號',            type: 'string',   required: true,  note: '' },
      { field: 'purchaser',             zh: '採購人員',            type: 'string',   required: false, note: '' },
      { field: 'orderQty',              zh: '訂貨量',              type: 'number',   required: true,  note: '' },
      { field: 'acceptQty',             zh: '驗收量',              type: 'number',   required: true,  note: '' },
      { field: 'comparePrice',          zh: '比對價格',            type: 'string',   required: false, note: '' },
      { field: 'unit',                  zh: '單位',                type: 'string',   required: false, note: '' },
      { field: 'currency',              zh: '幣別',                type: 'string',   required: false, note: 'TWD/USD/EUR…' },
      { field: 'leadtime',              zh: '前置天數',            type: 'number',   required: false, note: '天' },
      { field: 'vendorCode',            zh: '廠商代號',            type: 'string',   required: true,  note: '' },
      { field: 'vendorName',            zh: '廠商名稱',            type: 'string',   required: true,  note: '' },
      { field: 'materialNo',            zh: '料號',                type: 'string',   required: true,  note: '' },
      { field: 'customerBrand',         zh: '客戶品牌',            type: 'string',   required: false, note: '' },
      { field: 'vendorMaterialNo',      zh: '廠商料號',            type: 'string',   required: false, note: '' },
      { field: 'productName',           zh: '品名',                type: 'string',   required: true,  note: '' },
      { field: 'specification',         zh: '規格',                type: 'string',   required: true,  note: '長規格敘述' },
      { field: 'expectedDelivery',      zh: '預計交期',            type: 'string',   required: true,  note: 'YYYY/MM/DD' },
      { field: 'vendorDeliveryDate',    zh: '廠商可交貨日期',      type: 'string',   required: false, note: 'YYYY/MM/DD' },
      { field: 'deliveryQty',           zh: '交貨量',              type: 'number',   required: false, note: '' },
      { field: 'scheduleLines',         zh: '交貨排程明細',        type: 'array',    required: false, note: '→ScheduleLine[]' },
      { field: 'inTransitQty',          zh: '在途量',              type: 'number',   required: true,  note: '' },
      { field: 'undeliveredQty',        zh: '未交量',              type: 'number',   required: true,  note: '' },
      { field: 'lineItemNote',          zh: '行項備註',            type: 'string',   required: false, note: '' },
      { field: 'agreedDate',            zh: '協議日期',            type: 'string',   required: false, note: '' },
      { field: 'internalNote',          zh: '內部備註',            type: 'string',   required: false, note: '' },
      { field: 'materialPOContent',     zh: '採購單內容',          type: 'string',   required: false, note: '' },
      { field: 'productionScheduleDate',zh: '生管排程交貨日期',    type: 'string',   required: false, note: '' },
      { field: 'storageLocationCode',   zh: '儲存地點代碼',        type: 'string',   required: false, note: '' },
      { field: 'plantCode',             zh: '工廠代號',            type: 'string',   required: false, note: '' },
      { field: 'isRejectedOrder',       zh: '不接單標記',          type: 'boolean',  required: false, note: '' },
      { field: 'adjustmentType',        zh: '調整單據類型',        type: 'enum',     required: false, note: 'modify/reject/split/split-order' },
      { field: 'deletionCode',          zh: '刪單修正單號',        type: 'string',   required: false, note: '' },
    ],
  },
  {
    module: '訂單模組',
    className: 'ScheduleLine',
    classNameZh: '交貨排程行',
    source: 'AdvancedOrderTable.tsx',
    description: '訂單拆期/拆單後的多行排程資料',
    fields: [
      { field: 'expectedDelivery',   zh: '預計交期',         type: 'string',  required: true,  note: '' },
      { field: 'qty',                zh: '數量',             type: 'number',  required: true,  note: '' },
      { field: 'vendorDeliveryDate', zh: '廠商可交日期',     type: 'string',  required: false, note: '' },
    ],
  },
  {
    module: '訂單模組',
    className: 'HistoryEntry',
    classNameZh: '操作歷程記錄',
    source: 'OrderStoreContext.tsx',
    description: '訂單/修正單/出貨單/發票等各模組共用的操作歷程記錄物件',
    fields: [
      { field: 'date',      zh: '操作時間',   type: 'string',  required: true,  note: 'YYYY/MM/DD HH:mm' },
      { field: 'event',     zh: '事件描述',   type: 'string',  required: true,  note: '如 廠商確認交期OK(NP→B)' },
      { field: 'operator',  zh: '操作人員',   type: 'string',  required: true,  note: '廠商-OOO / 巨大-OOO' },
      { field: 'remark',    zh: '備註',        type: 'string',  required: false, note: '' },
    ],
  },
  {
    module: '訂單模組',
    className: 'CorrectionOrderRow',
    classNameZh: '修正單',
    source: 'OrderStoreContext.tsx',
    description: '針對訂單進行修正（不拆單/拆單/刪單）的修正單物件',
    fields: [
      { field: 'id',                   zh: '識別碼',          type: 'number',  required: true,  note: '' },
      { field: 'correctionDocNo',      zh: '修正單號',        type: 'string',  required: true,  note: 'YYYYMMDDXXXX' },
      { field: 'correctionStatus',     zh: '修正單狀態',      type: 'enum',    required: true,  note: 'DR/V/B/CP/SS/CL' },
      { field: 'correctionType',       zh: '修正類型',        type: 'string',  required: true,  note: '不拆單/拆單/刪單' },
      { field: 'orderNo',              zh: '原訂單號碼',      type: 'string',  required: true,  note: '' },
      { field: 'orderSeq',             zh: '原訂單序號',      type: 'string',  required: true,  note: '' },
      { field: 'docSeqNo',             zh: '單據序號',        type: 'string',  required: true,  note: '' },
      { field: 'vendorCode',           zh: '廠商代號',        type: 'string',  required: true,  note: '' },
      { field: 'vendorName',           zh: '廠商名稱',        type: 'string',  required: true,  note: '' },
      { field: 'purchaseOrg',          zh: '採購組織',        type: 'string',  required: true,  note: '' },
      { field: 'materialNo',           zh: '料號',            type: 'string',  required: true,  note: '' },
      { field: 'productName',          zh: '品名',            type: 'string',  required: true,  note: '' },
      { field: 'orderDate',            zh: '訂單日期',        type: 'string',  required: true,  note: '' },
      { field: 'orderQty',             zh: '訂貨量',          type: 'number',  required: true,  note: '' },
      { field: 'acceptQty',            zh: '驗收量',          type: 'number',  required: true,  note: '' },
      { field: 'company',              zh: '公司',            type: 'string',  required: true,  note: '' },
      { field: 'createdAt',            zh: '開立時間',        type: 'string',  required: true,  note: 'YYYY/MM/DD HH:mm' },
      { field: 'expectedDelivery',     zh: '預計交期',        type: 'string',  required: false, note: '' },
      { field: 'vendorDeliveryDate',   zh: '原廠商交期',      type: 'string',  required: false, note: '' },
      { field: 'agreedDate',           zh: '協議日期',        type: 'string',  required: false, note: '' },
      { field: 'inTransitQty',         zh: '在途量',          type: 'number',  required: false, note: '' },
      { field: 'deliveryQty',          zh: '交貨量',          type: 'number',  required: false, note: '' },
      { field: 'newMaterialNo',        zh: '新料號',          type: 'string',  required: false, note: '拆單時使用' },
      { field: 'correctionNote',       zh: '修正備註',        type: 'string',  required: false, note: '' },
      { field: 'savedDeliveryRows',    zh: '暫存交貨排程',    type: 'array',   required: false, note: '→SavedDeliveryRow[]' },
      { field: 'savedPeriodInput',     zh: '暫存期數',        type: 'string',  required: false, note: '' },
    ],
  },
  {
    module: '訂單模組',
    className: 'SavedDeliveryRow',
    classNameZh: '修正交貨排程行',
    source: 'OrderStoreContext.tsx',
    description: '修正單中儲存的交貨排程（DR暫存時使用）',
    fields: [
      { field: 'expectedDelivery',    zh: '預計交期',        type: 'string',  required: true,  note: '' },
      { field: 'vendorOriginalDate',  zh: '廠商原交期',      type: 'string',  required: true,  note: '' },
      { field: 'newVendorDate',       zh: '廠商新交期',      type: 'string',  required: true,  note: '' },
      { field: 'originalQty',         zh: '原數量',          type: 'number',  required: true,  note: '' },
      { field: 'newQty',              zh: '新數量',          type: 'string',  required: true,  note: '' },
      { field: 'deleted',             zh: '已刪除',          type: 'boolean', required: false, note: '' },
      { field: 'splitOrderSeq',       zh: '拆單序號',        type: 'string',  required: false, note: '拆單專用' },
      { field: 'splitNewMaterialNo',  zh: '拆單新料號',      type: 'string',  required: false, note: '拆單專用' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 2. 出貨模組
  // ─────────────────────────────────────────────────
  {
    module: '出貨模組',
    className: 'ShipmentRow',
    classNameZh: '出貨單主資料',
    source: 'ShipmentListPage.tsx',
    description: '出貨單頭資料，包含運輸方式、交貨日期及明細',
    fields: [
      { field: 'id',                zh: '識別碼',          type: 'number',  required: true,  note: '' },
      { field: 'vendorShipmentNo',  zh: '廠商出貨單號',    type: 'string',  required: true,  note: '' },
      { field: 'vendorCode',        zh: '廠商代號',        type: 'string',  required: true,  note: '' },
      { field: 'vendorName',        zh: '廠商名稱',        type: 'string',  required: true,  note: '' },
      { field: 'currency',          zh: '幣別',            type: 'string',  required: true,  note: '' },
      { field: 'transportType',     zh: '運輸型態',        type: 'enum',    required: true,  note: 'S海運/A空運/T陸運' },
      { field: 'deliveryDate',      zh: '交貨日期',        type: 'string',  required: true,  note: 'YYYY/MM/DD' },
      { field: 'arrivalDate',       zh: '到貨日期',        type: 'string',  required: true,  note: 'YYYY/MM/DD' },
      { field: 'invoiceDate',       zh: '發票日期',        type: 'string',  required: false, note: 'YYYY/MM/DD' },
      { field: 'deliveryAddress',   zh: '交貨地址',        type: 'string',  required: true,  note: '' },
      { field: 'sapDeliveryNo',     zh: 'SAP送貨單號',    type: 'string',  required: false, note: '' },
      { field: 'createdAt',         zh: '開立時間',        type: 'string',  required: false, note: '' },
      { field: 'status',            zh: '出貨單狀態',      type: 'enum',    required: true,  note: 'open/sap_sent/closed' },
      { field: 'details',           zh: '出貨明細',        type: 'array',   required: true,  note: '→ShipmentDetailItem[]' },
    ],
  },
  {
    module: '出貨模組',
    className: 'ShipmentDetailItem',
    classNameZh: '出貨明細項次',
    source: 'ShipmentListPage.tsx / ShipmentDetailPage.tsx',
    description: '出貨單的逐筆明細，包含箱數資訊與重量',
    fields: [
      { field: 'itemNo',              zh: '項次',             type: 'number',  required: true,  note: '' },
      { field: 'orderNo',             zh: '訂單號碼',         type: 'string',  required: true,  note: '' },
      { field: 'orderSeq',            zh: '訂單序號',         type: 'string',  required: true,  note: '' },
      { field: 'materialNo',          zh: '料號',             type: 'string',  required: true,  note: '' },
      { field: 'vendorMaterialNo',    zh: '廠商料號',         type: 'string',  required: false, note: '' },
      { field: 'orderPendingQty',     zh: '未交量',           type: 'number',  required: true,  note: '' },
      { field: 'shipQty',             zh: '出貨量',           type: 'number',  required: true,  note: '可編輯' },
      { field: 'qtyPerBox',           zh: '每箱數量',         type: 'string',  required: true,  note: '' },
      { field: 'totalBoxes',          zh: '總箱數',           type: 'number',  required: true,  note: '自動計算' },
      { field: 'boxes',               zh: '箱數明細',         type: 'array',   required: true,  note: '→BoxItem[]' },
      { field: 'netWeight',           zh: '淨重',             type: 'string',  required: true,  note: '' },
      { field: 'grossWeight',         zh: '毛重',             type: 'string',  required: true,  note: '' },
      { field: 'weightUnit',          zh: '重量單位',         type: 'string',  required: true,  note: 'KG/G/LB/OZ' },
      { field: 'countryOfOrigin',     zh: '原產國家',         type: 'string',  required: true,  note: '' },
      { field: 'receivedQty',         zh: '累計收料量',       type: 'number',  required: false, note: '' },
      { field: 'storageLocationCode', zh: '儲存地點',         type: 'string',  required: false, note: '' },
      { field: 'productName',         zh: '品名',             type: 'string',  required: false, note: '' },
      { field: 'company',             zh: '客戶名稱',         type: 'string',  required: false, note: '' },
      { field: 'plantCode',           zh: '工廠代號',         type: 'string',  required: false, note: '' },
      { field: 'specification',       zh: '規格',             type: 'string',  required: false, note: '' },
    ],
  },
  {
    module: '出貨模組',
    className: 'BoxItem',
    classNameZh: '單箱資料',
    source: 'ShipmentDetailPage.tsx',
    description: '出貨明細中每個箱子的編號與數量',
    fields: [
      { field: 'boxNo', zh: '箱號', type: 'number', required: true, note: '' },
      { field: 'qty',   zh: '數量', type: 'number', required: true, note: '' },
    ],
  },
  {
    module: '出貨模組',
    className: 'CsvPrefillData',
    classNameZh: 'CSV匯入預填資料',
    source: 'ShipmentDetailPage.tsx',
    description: '出貨單 CSV 批量匯入時的頭資料',
    fields: [
      { field: 'vendorShipmentNo', zh: '廠商出貨單號', type: 'string', required: true,  note: '' },
      { field: 'currency',         zh: '幣別',         type: 'string', required: true,  note: '' },
      { field: 'transportType',    zh: '運輸型態',     type: 'string', required: true,  note: '' },
      { field: 'deliveryDate',     zh: '交貨日期',     type: 'string', required: true,  note: '' },
      { field: 'arrivalDate',      zh: '到貨日期',     type: 'string', required: true,  note: '' },
      { field: 'deliveryAddress',  zh: '交貨地址',     type: 'string', required: true,  note: '' },
      { field: 'rows',             zh: 'CSV明細行',    type: 'array',  required: true,  note: '→CsvPrefillRow[]' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 3. 發票模組
  // ─────────────────────────────────────────────────
  {
    module: '發票模組',
    className: 'InvoiceRecord',
    classNameZh: '發票記錄',
    source: 'invoiceStore.ts',
    description: '系統發票的主記錄物件，用於發票查詢與歷程追蹤',
    fields: [
      { field: 'id',          zh: '系統流水編號',   type: 'string',   required: true,  note: 'INV-YYYYMMDD-XXXX' },
      { field: 'invoiceNo',   zh: '發票號碼',       type: 'string',   required: true,  note: '' },
      { field: 'invoiceDate', zh: '發票日期',       type: 'string',   required: true,  note: 'YYYY/MM/DD' },
      { field: 'status',      zh: '發票狀態',       type: 'enum',     required: true,  note: 'DR/P/B/S/F/H' },
      { field: 'buyerName',   zh: '買方',           type: 'string',   required: true,  note: '' },
      { field: 'invoiceType', zh: '發票聯式',       type: 'string',   required: true,  note: '21/22/25' },
      { field: 'taxRate',     zh: '稅率',           type: 'string',   required: true,  note: '"5"/"0"/"10"' },
      { field: 'taxCode',     zh: '稅碼',           type: 'string',   required: true,  note: 'V0/V1' },
      { field: 'taxAmount',   zh: '發票稅額',       type: 'number',   required: true,  note: '自動計算' },
      { field: 'totalAmount', zh: '發票總額（含稅）',type: 'number',  required: true,  note: '自動計算' },
      { field: 'currency',    zh: '幣別',           type: 'string',   required: true,  note: 'TWD/USD/EUR…' },
      { field: 'bondedType',  zh: '保稅廠別',       type: 'string',   required: true,  note: '保稅/非保稅' },
      { field: 'vendorName',  zh: '廠商名稱(編號)', type: 'string',   required: true,  note: '' },
      { field: 'execNote',    zh: '執行備註',       type: 'string',   required: false, note: '' },
      { field: 'detailCount', zh: '明細數量',       type: 'number',   required: true,  note: '' },
      { field: 'createdAt',   zh: '建立時間',       type: 'string',   required: true,  note: 'YYYY/MM/DD HH:mm' },
      { field: 'rows',        zh: '發票明細',       type: 'array',    required: true,  note: '→InvoiceDetailRow[]' },
      { field: 'history',     zh: '操作歷程',       type: 'array',    required: false, note: '→HistoryEntry[]' },
    ],
  },
  {
    module: '發票模組',
    className: 'InvoiceDetailRow',
    classNameZh: '發票明細行',
    source: 'invoiceDetailData.ts',
    description: '發票的逐筆明細，對應驗收單號',
    fields: [
      { field: 'id',              zh: '識別碼',         type: 'number',  required: true,  note: '' },
      { field: 'acceptNo',        zh: '驗收單號',       type: 'string',  required: true,  note: '' },
      { field: 'acceptSeq',       zh: '驗收項次',       type: 'string',  required: true,  note: '' },
      { field: 'orderNo',         zh: '訂單號碼',       type: 'string',  required: true,  note: '' },
      { field: 'materialNo',      zh: '料號',           type: 'string',  required: true,  note: '' },
      { field: 'acceptQty',       zh: '驗收量',         type: 'number',  required: true,  note: '' },
      { field: 'acceptPrice',     zh: '驗收價',         type: 'number',  required: true,  note: '' },
      { field: 'unitPrice',       zh: '單價',           type: 'string',  required: true,  note: '可手動輸入' },
      { field: 'priceModified',   zh: '是否修改單價',   type: 'boolean', required: false, note: '' },
      { field: 'itemTax',         zh: '單項稅額',       type: 'number',  required: true,  note: '自動計算' },
      { field: 'subtotalExTax',   zh: '未稅小計',       type: 'number',  required: true,  note: '自動計算' },
      { field: 'subtotalInTax',   zh: '含稅小計',       type: 'number',  required: true,  note: '自動計算' },
      { field: 'productName',     zh: '品名',           type: 'string',  required: true,  note: '= specification' },
    ],
  },
  {
    module: '發票模組',
    className: 'InvoiceAcceptRow',
    classNameZh: '可選驗收資料行',
    source: 'invoiceCreateData.ts',
    description: '開立發票時，從驗收資料選取的候選明細行',
    fields: [
      { field: 'id',            zh: '識別碼',        type: 'number', required: true,  note: '' },
      { field: 'vendorName',    zh: '廠商簡稱(編號)',type: 'string', required: true,  note: '' },
      { field: 'orderNo',       zh: '訂單號碼',      type: 'string', required: true,  note: '' },
      { field: 'orderSeq',      zh: '訂單序號',      type: 'string', required: true,  note: '' },
      { field: 'orderType',     zh: '訂單類型',      type: 'string', required: true,  note: '' },
      { field: 'receiveDate',   zh: '收料日期',      type: 'string', required: true,  note: '' },
      { field: 'acceptNo',      zh: '驗收單號',      type: 'string', required: true,  note: '' },
      { field: 'acceptSeq',     zh: '驗收項次',      type: 'string', required: true,  note: '' },
      { field: 'vendorShipNo',  zh: '廠商出貨單',    type: 'string', required: true,  note: '' },
      { field: 'shipSeq',       zh: '出貨序號',      type: 'string', required: false, note: '' },
      { field: 'materialNo',    zh: '料號',          type: 'string', required: true,  note: '' },
      { field: 'deliveryNo',    zh: '送貨單號',      type: 'string', required: false, note: '' },
      { field: 'orderQty',      zh: '訂貨量',        type: 'number', required: true,  note: '' },
      { field: 'shipQty',       zh: '出貨量',        type: 'number', required: true,  note: '' },
      { field: 'acceptQty',     zh: '驗收量',        type: 'number', required: true,  note: '' },
      { field: 'acceptPrice',   zh: '驗收價',        type: 'number', required: true,  note: '' },
      { field: 'returnQty',     zh: '驗退量',        type: 'number', required: false, note: '' },
      { field: 'claimDate',     zh: '可請款日',      type: 'string', required: false, note: '' },
      { field: 'specification', zh: '規格',          type: 'string', required: false, note: '' },
      { field: 'outsourceNo',   zh: '委外加工編號',  type: 'string', required: false, note: '' },
      { field: 'bondedType',    zh: '保稅廠別',      type: 'string', required: true,  note: '' },
      { field: 'companyCode',   zh: '公司代碼',      type: 'string', required: true,  note: '' },
      { field: 'companyName',   zh: '公司名稱',      type: 'string', required: true,  note: '' },
      { field: 'purchaseOrg',   zh: '採購組織',      type: 'string', required: true,  note: '' },
      { field: 'purchaseGroup', zh: '採購群組',      type: 'string', required: true,  note: '' },
      { field: 'customerPO',    zh: '客戶PO號碼',   type: 'string', required: false, note: '' },
      { field: 'plantCode',     zh: '工廠代碼',      type: 'string', required: false, note: '' },
    ],
  },
  {
    module: '發票模組',
    className: 'TrackRecord',
    classNameZh: '字軌主檔',
    source: 'invoiceSettingsStore.ts',
    description: '發票設定 Tab1：各月份的字軌設定',
    fields: [
      { field: 'id',      zh: '識別碼', type: 'number', required: true,  note: '' },
      { field: 'year',    zh: '年份',   type: 'string', required: true,  note: '' },
      { field: 'month',   zh: '月份',   type: 'string', required: true,  note: 'MM' },
      { field: 'taxCode', zh: '稅碼',   type: 'string', required: true,  note: 'V0/V1' },
      { field: 'track',   zh: '字軌',   type: 'string', required: true,  note: '如 HT/JA' },
    ],
  },
  {
    module: '發票模組',
    className: 'DeadlineRecord',
    classNameZh: '發票截止日期',
    source: 'InvoiceSettingsPage.tsx',
    description: '發票設定 Tab2：各月份的請款截止日期',
    fields: [
      { field: 'id',        zh: '識別碼',     type: 'number', required: true,  note: '' },
      { field: 'year',      zh: '年份',       type: 'string', required: true,  note: '' },
      { field: 'month',     zh: '月份',       type: 'string', required: true,  note: '' },
      { field: 'deadline',  zh: '截止日期',   type: 'string', required: true,  note: 'YYYY/MM/DD' },
      { field: 'updatedAt', zh: '更新時間-人員', type: 'string', required: false, note: '' },
    ],
  },
  {
    module: '發票模組',
    className: 'FactoryTaxRate',
    classNameZh: '工廠稅率設定',
    source: 'InvoiceSettingsPage.tsx',
    description: '發票設定 Tab3：各工廠的稅率設定',
    fields: [
      { field: 'factoryCode',   zh: 'SAP工廠代號', type: 'string', required: true,  note: '' },
      { field: 'companyCode',   zh: '公司代碼',    type: 'string', required: true,  note: '' },
      { field: 'bondedType',    zh: '保稅別',      type: 'string', required: true,  note: '' },
      { field: 'taxRate',       zh: '稅率',        type: 'number', required: true,  note: '5/0/10' },
      { field: 'taxCode',       zh: '稅碼',        type: 'string', required: true,  note: 'V0/V1' },
      { field: 'effectiveDate', zh: '有效日期',    type: 'string', required: false, note: '' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 4. 品質異常模組
  // ─────────────────────────────────────────────────
  {
    module: '品質異常模組',
    className: 'QualityRow',
    classNameZh: '品質異常單',
    source: 'AdvancedQualityTable.tsx',
    description: '品質異常通報單，涵蓋不良情形、應急處理到對策提出全流程',
    fields: [
      { field: 'id',              zh: '識別碼',       type: 'number', required: true,  note: '' },
      { field: 'vendor',          zh: '廠商(編號)',    type: 'string', required: true,  note: '' },
      { field: 'abnormalNumber',  zh: '品質異常單號', type: 'string', required: true,  note: '' },
      { field: 'quantity',        zh: '數量',         type: 'number', required: true,  note: '' },
      { field: 'orderNumber',     zh: '訂單號碼',     type: 'string', required: true,  note: '' },
      { field: 'status',          zh: '單據狀態',     type: 'enum',   required: true,  note: 'V/G/CE/CL' },
      { field: 'partNumber',      zh: '料號',         type: 'string', required: true,  note: '' },
      { field: 'date',            zh: '開單日期',     type: 'string', required: true,  note: 'YYYY/MM/DD' },
      { field: 'description',     zh: '長規格敘述',   type: 'string', required: true,  note: '' },
      { field: 'defectType',      zh: '不良情形',     type: 'string', required: true,  note: '' },
      { field: 'emergencyAction', zh: '應急處理',     type: 'string', required: false, note: '' },
      { field: 'causeAnalysis',   zh: '原因分析',     type: 'string', required: false, note: '廠商填寫' },
      { field: 'countermeasure',  zh: '對策提出',     type: 'string', required: false, note: '廠商填寫' },
      { field: 'gtmConfirm',      zh: 'GTM確認',      type: 'string', required: false, note: '' },
      { field: 'confirmer',       zh: '確認者',       type: 'string', required: false, note: '' },
      { field: 'attachment',      zh: '附件',         type: 'string', required: false, note: '' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 5. 零件資訊維護模組
  // ─────────────────────────────────────────────────
  {
    module: '零件維護模組',
    className: 'PartRecord',
    classNameZh: '零件資料',
    source: 'partsMaintenanceData.ts',
    description: '供應商零件維護主資料，由中台同步帶入，廠商填寫報價資訊',
    fields: [
      { field: 'id',                zh: '識別碼',             type: 'number',  required: true,  note: '' },
      { field: 'vendorCode',        zh: '廠商代號',           type: 'string',  required: true,  note: '中台帶入（唯讀）' },
      { field: 'vendorName',        zh: '廠商名稱',           type: 'string',  required: true,  note: '中台帶入（唯讀）' },
      { field: 'material',          zh: '料號',               type: 'string',  required: true,  note: '中台帶入（唯讀）' },
      { field: 'plant',             zh: '工廠',               type: 'string',  required: true,  note: '中台帶入（唯讀）' },
      { field: 'purchaseOrg',       zh: '採購組織',           type: 'string',  required: true,  note: '中台帶入（唯讀）' },
      { field: 'longDescription',   zh: '長規格描述',         type: 'string',  required: true,  note: '中台帶入（唯讀）' },
      { field: 'qaCompletionDate',  zh: '品質驗證完成日',     type: 'string',  required: false, note: '廠商填寫' },
      { field: 'sampleDate',        zh: '樣品交期',           type: 'string',  required: false, note: '廠商填寫' },
      { field: 'firstDeliveryDate', zh: '首批交期',           type: 'string',  required: false, note: '廠商填寫' },
      { field: 'grossWeight',       zh: '毛重',               type: 'string',  required: false, note: '' },
      { field: 'netWeight',         zh: '淨重',               type: 'string',  required: false, note: '' },
      { field: 'weightUnit',        zh: '重量單位',           type: 'string',  required: false, note: 'KG/G/LB/OZ' },
      { field: 'vendorPartNo',      zh: '廠商料號',           type: 'string',  required: false, note: '廠商填寫' },
      { field: 'remark',            zh: '備註',               type: 'string',  required: false, note: '' },
      { field: 'brandSettings',     zh: '品牌設定',           type: 'array',   required: false, note: '→BrandSetting[]' },
      { field: 'quoteStatus',       zh: '報價狀態',           type: 'enum',    required: true,  note: 'pending/quoted' },
      { field: 'notifyStatus',      zh: '通知狀態',           type: 'enum',    required: true,  note: 'sent/unsent' },
      { field: 'notifySentAt',      zh: '寄送時間紀錄',       type: 'array',   required: false, note: '可多次寄送' },
      { field: 'savedAt',           zh: '儲存時間',           type: 'string',  required: false, note: '' },
      { field: 'updatedAt',         zh: '更新時間',           type: 'string',  required: true,  note: '' },
      { field: 'syncDtcDte',        zh: '同步DTC/DTE',        type: 'boolean', required: true,  note: '' },
      { field: 'history',           zh: '操作歷程',           type: 'array',   required: false, note: '→PartHistoryEntry[]' },
    ],
  },
  {
    module: '零件維護模組',
    className: 'BrandSetting',
    classNameZh: '品牌報價設定',
    source: 'partsMaintenanceData.ts',
    description: '零件資料中，針對不同品牌的報價設定（一對多）',
    fields: [
      { field: 'id',              zh: '識別碼',       type: 'number', required: true,  note: '' },
      { field: 'brand',           zh: '品牌',         type: 'string', required: true,  note: '' },
      { field: 'unitPrice',       zh: '單價',         type: 'string', required: true,  note: '' },
      { field: 'currency',        zh: '幣別',         type: 'string', required: true,  note: '' },
      { field: 'quoteQty',        zh: '報價數量',     type: 'string', required: true,  note: '' },
      { field: 'leadTime',        zh: '前置天數',     type: 'string', required: true,  note: '天' },
      { field: 'moq',             zh: '最小訂購量',   type: 'string', required: true,  note: '' },
      { field: 'tradeTerms',      zh: '國貿條件',     type: 'string', required: true,  note: 'FOB/EXW…' },
      { field: 'tradeTermsPlace', zh: '國貿條件地點', type: 'string', required: true,  note: '' },
      { field: 'quoteUnit',       zh: '報價單位',     type: 'string', required: true,  note: 'PCE/SET/KGM…' },
      { field: 'productType',     zh: '產品類型',     type: 'string', required: true,  note: '標準品/客製品' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 6. 廠商帳號管理模組
  // ─────────────────────────────────────────────────
  {
    module: '廠商帳號模組',
    className: 'VendorData',
    classNameZh: '廠商基本資料',
    source: 'VendorAccountManagementPage.tsx',
    description: '廠商帳號管理主資料',
    fields: [
      { field: 'id',           zh: '識別碼',        type: 'number',   required: true,  note: '' },
      { field: 'code',         zh: '廠商代號',      type: 'string',   required: true,  note: '' },
      { field: 'name',         zh: '廠商簡稱',      type: 'string',   required: true,  note: '' },
      { field: 'fullName',     zh: '廠商全名',      type: 'string',   required: true,  note: '' },
      { field: 'phone',        zh: '電話',          type: 'string',   required: false, note: '' },
      { field: 'address',      zh: '地址',          type: 'string',   required: false, note: '' },
      { field: 'salesCount',   zh: '啟用業務數',    type: 'number',   required: false, note: '' },
      { field: 'mainProducts', zh: '主要產品',      type: 'string',   required: false, note: '' },
      { field: 'salesNames',   zh: '業務人員姓名',  type: 'string[]', required: false, note: '' },
    ],
  },
  {
    module: '廠商帳號模組',
    className: 'SalesAccount',
    classNameZh: '業務帳號',
    source: 'SalesAccountForm.tsx',
    description: '廠商的業務帳號資料（一廠商對多業務）',
    fields: [
      { field: 'id',            zh: '識別碼',        type: 'string', required: true,  note: '' },
      { field: 'email',         zh: 'Email',         type: 'string', required: true,  note: '' },
      { field: 'name',          zh: '姓名',          type: 'string', required: true,  note: '' },
      { field: 'role',          zh: '角色',          type: 'string', required: true,  note: '業務/品保/管理階層' },
      { field: 'purchaseOrg',   zh: '採購組織',      type: 'string', required: true,  note: '' },
      { field: 'purchaseGroup', zh: '採購群組',      type: 'string', required: true,  note: '' },
      { field: 'status',        zh: '狀態',          type: 'enum',   required: true,  note: 'active/inactive' },
    ],
  },
  {
    module: '廠商帳號模組',
    className: 'Contact',
    classNameZh: '聯絡人',
    source: 'VendorContactsForm.tsx',
    description: '廠商的其他聯絡人資料（用於郵件收件管理）',
    fields: [
      { field: 'name',          zh: '姓名',          type: 'string',  required: true,  note: '' },
      { field: 'role',          zh: '角色',          type: 'string',  required: true,  note: '' },
      { field: 'priority',      zh: '收件優先',      type: 'string',  required: true,  note: '收件人/CC' },
      { field: 'purchaseOrg',   zh: '採購組織',      type: 'string',  required: true,  note: '' },
      { field: 'emailEnabled',  zh: '啟用寄信',      type: 'boolean', required: true,  note: '' },
      { field: 'email',         zh: 'Email',         type: 'string',  required: true,  note: '' },
      { field: 'phone',         zh: '電話',          type: 'string',  required: false, note: '' },
      { field: 'remark',        zh: '備註',          type: 'string',  required: false, note: '' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 7. 使用者註冊模組
  // ─────────────────────────────────────────────────
  {
    module: '使用者模組',
    className: 'RegisterForm',
    classNameZh: '使用者註冊表單',
    source: 'RegisterPage.tsx',
    description: '廠商使用者自行申請帳號時的表單欄位',
    fields: [
      { field: 'name',              zh: '姓名',           type: 'string',   required: true,  note: '' },
      { field: 'companyName',       zh: '廠商公司',       type: 'string',   required: true,  note: '下拉選單（或填寫其他）' },
      { field: 'customCompanyName', zh: '其他公司名稱',   type: 'string',   required: false, note: '選「其他」時填寫' },
      { field: 'selectedRoles',     zh: '申請角色',       type: 'string[]', required: true,  note: '業務/品保/管理階層' },
      { field: 'giantContact',      zh: '巨大窗口',       type: 'string',   required: true,  note: '下拉選單' },
      { field: 'email',             zh: 'Email',          type: 'string',   required: true,  note: '' },
      { field: 'password',          zh: '密碼',           type: 'string',   required: true,  note: '' },
      { field: 'confirmPassword',   zh: '確認密碼',       type: 'string',   required: true,  note: '' },
    ],
  },

  // ─────────────────────────────────────────────────
  // 8. ESG 材料維護模組
  // ─────────────────────────────────────────────────
  {
    module: 'ESG模組',
    className: 'EsgMaterialRecord',
    classNameZh: 'ESG材料記錄',
    source: 'esgMaterialData.ts',
    description: 'ESG 材料維護主檔，用於碳排量計算基準資料',
    fields: [
      { field: 'id',            zh: '識別碼',       type: 'number', required: true,  note: '' },
      { field: 'nameTw',        zh: '材料名（繁中）',type: 'string', required: true,  note: '' },
      { field: 'nameCn',        zh: '材料名（簡中）',type: 'string', required: true,  note: '' },
      { field: 'nameEn',        zh: '材料名（英文）',type: 'string', required: true,  note: '' },
      { field: 'carbonEmission',zh: '碳排量',       type: 'number', required: true,  note: 'kg CO₂e' },
      { field: 'createdBy',     zh: '建檔者',       type: 'string', required: true,  note: '' },
      { field: 'createdAt',     zh: '建檔日期',     type: 'string', required: true,  note: 'YYYY/MM/DD' },
      { field: 'updatedBy',     zh: '最後修改者',   type: 'string', required: false, note: '' },
      { field: 'updatedAt',     zh: '最後修改日期', type: 'string', required: false, note: '' },
    ],
  },
];

// ═══════════════════════════════════════════════════
// 建立 Excel
// ═══════════════════════════════════════════════════

async function buildExcel() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GiantId System';
  wb.created = new Date();

  // ── 色彩定義 ──
  const COLOR = {
    /** 深藍：巨大品牌色 */
    primary:     '005EB8',
    /** 模組標題行 */
    moduleBg:    '1C252E',
    moduleText:  'FFFFFF',
    /** 類別標題行 */
    classBg:     '2D5F9E',
    classText:   'FFFFFF',
    /** 欄位表頭行 */
    headerBg:    'D6E4F5',
    headerText:  '1C252E',
    /** 必填 */
    requiredBg:  'FFF3CD',
    /** 必填標記文字 */
    requiredText:'8B4513',
    /** 選填 */
    optionalBg:  'F4F6F8',
    /** 奇數列 */
    rowOdd:      'FFFFFF',
    rowEven:     'F8FAFB',
    /** 邊框 */
    border:      'C8D0DA',
    /** 陣列型別 */
    arrayType:   'D5E8D4',
    /** enum型別 */
    enumType:    'DAE8FC',
  };

  const border = (color = COLOR.border) => ({
    top:    { style: 'thin', color: { argb: color } },
    left:   { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right:  { style: 'thin', color: { argb: color } },
  });

  // ── 封面 Sheet ──
  const coverSheet = wb.addWorksheet('📋 封面');
  coverSheet.columns = [{ width: 80 }];

  const addCoverRow = (text, boldSize, bgArgb, textArgb = 'FFFFFF') => {
    const r = coverSheet.addRow([text]);
    r.height = boldSize > 16 ? 40 : 24;
    const c = r.getCell(1);
    c.font = { bold: boldSize > 13, size: boldSize, color: { argb: textArgb }, name: 'Calibri' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    return r;
  };

  coverSheet.addRow([]);
  addCoverRow('🏭 巨大機械 — GiantId 廠商入口網站', 22, COLOR.moduleBg);
  addCoverRow('系統物件導向欄位總表（OOP Field Reference）', 16, COLOR.primary);
  coverSheet.addRow([]);
  addCoverRow(`產生日期：${new Date().toLocaleDateString('zh-TW')}`, 12, 'F4F6F8', '1C252E');
  coverSheet.addRow([]);

  const modules = [...new Set(MODULES.map(m => m.module))];
  modules.forEach(mod => {
    const classes = MODULES.filter(m => m.module === mod);
    const r = coverSheet.addRow([`【${mod}】  ${classes.map(c => c.className).join('  /  ')}`]);
    r.height = 22;
    const c = r.getCell(1);
    c.font = { size: 12, color: { argb: '1C252E' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EBF4FF' } };
    c.alignment = { vertical: 'middle', wrapText: true };
    c.border = border('D6E4F5');
  });
  coverSheet.addRow([]);
  addCoverRow('說明：每個 Sheet 對應一個系統模組，列出該模組所有物件類別及其欄位定義', 11, 'FFF8E1', '5C4813');

  // ── 每個模組建立一個 Sheet ──
  const moduleGroups = {};
  MODULES.forEach(cls => {
    if (!moduleGroups[cls.module]) moduleGroups[cls.module] = [];
    moduleGroups[cls.module].push(cls);
  });

  const MODULE_ICONS = {
    '訂單模組':     '📦',
    '出貨模組':     '🚢',
    '發票模組':     '🧾',
    '品質異常模組': '⚠️',
    '零件維護模組': '🔧',
    '廠商帳號模組': '🏭',
    '使用者模組':   '👤',
    'ESG模組':      '🌱',
  };

  for (const [modName, classes] of Object.entries(moduleGroups)) {
    const icon = MODULE_ICONS[modName] || '📁';
    const ws = wb.addWorksheet(`${icon} ${modName}`);

    ws.columns = [
      { key: 'no',       width: 6  },
      { key: 'class',    width: 26 },
      { key: 'classZh',  width: 18 },
      { key: 'field',    width: 26 },
      { key: 'fieldZh',  width: 22 },
      { key: 'type',     width: 14 },
      { key: 'required', width: 8  },
      { key: 'note',     width: 32 },
      { key: 'source',   width: 34 },
    ];

    // 模組標題
    ws.addRow([]);
    const modTitleRow = ws.addRow([`${icon} ${modName}`, '', '', '', '', '', '', '', '']);
    ws.mergeCells(`A${modTitleRow.number}:I${modTitleRow.number}`);
    modTitleRow.height = 36;
    modTitleRow.eachCell(c => {
      c.font = { bold: true, size: 16, color: { argb: COLOR.moduleText }, name: 'Calibri' };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.moduleBg } };
      c.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    });

    let fieldIndex = 0;

    for (const cls of classes) {
      // 類別標題
      ws.addRow([]);
      const clsTitleRow = ws.addRow([
        `▶ ${cls.className}`, cls.classNameZh, '', `來源：${cls.source}`, '', '', '', cls.description, ''
      ]);
      ws.mergeCells(`A${clsTitleRow.number}:C${clsTitleRow.number}`);
      ws.mergeCells(`D${clsTitleRow.number}:G${clsTitleRow.number}`);
      ws.mergeCells(`H${clsTitleRow.number}:I${clsTitleRow.number}`);
      clsTitleRow.height = 28;
      clsTitleRow.eachCell(c => {
        c.font = { bold: true, size: 12, color: { argb: COLOR.classText }, name: 'Calibri' };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.classBg } };
        c.alignment = { vertical: 'middle', wrapText: true };
        c.border = border('2D5F9E');
      });

      // 欄位表頭
      const headerRow = ws.addRow(['#', '類別名（英）', '類別名（中）', '欄位名（英）', '欄位名（中）', '資料型別', '必填', '說明/備註', '來源檔案']);
      headerRow.height = 22;
      headerRow.eachCell(c => {
        c.font = { bold: true, size: 11, color: { argb: COLOR.headerText }, name: 'Calibri' };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } };
        c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        c.border = border();
      });

      // 欄位資料行
      cls.fields.forEach((f, i) => {
        fieldIndex++;
        const isEven = i % 2 === 0;
        const isRequired = f.required;

        let typeBg = isEven ? COLOR.rowOdd : COLOR.rowEven;
        if (f.type === 'array') typeBg = COLOR.arrayType;
        else if (f.type === 'enum') typeBg = COLOR.enumType;

        const row = ws.addRow([
          fieldIndex,
          cls.className,
          cls.classNameZh,
          f.field,
          f.zh,
          f.type,
          isRequired ? '✓必填' : '',
          f.note,
          cls.source,
        ]);
        row.height = 18;

        row.eachCell((c, colNum) => {
          const rowBg = isEven ? COLOR.rowOdd : COLOR.rowEven;
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
          c.font = { size: 10, name: 'Calibri' };
          c.alignment = { vertical: 'middle', wrapText: true };
          c.border = border();
        });

        // 欄位名稱以藍色顯示
        row.getCell(4).font = { size: 10, color: { argb: '005EB8' }, bold: true, name: 'Courier New' };

        // 必填標記
        const reqCell = row.getCell(7);
        if (isRequired) {
          reqCell.font = { size: 10, color: { argb: 'B85C00' }, bold: true, name: 'Calibri' };
          reqCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.requiredBg } };
        }

        // 型別顏色
        const typeCell = row.getCell(6);
        if (f.type === 'array') {
          typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.arrayType } };
          typeCell.font = { size: 10, color: { argb: '2D6A2D' }, name: 'Calibri' };
        } else if (f.type === 'enum') {
          typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.enumType } };
          typeCell.font = { size: 10, color: { argb: '0050A0' }, name: 'Calibri' };
        } else if (f.type === 'boolean') {
          typeCell.font = { size: 10, color: { argb: '8B008B' }, name: 'Calibri' };
        }
      });
    }
  }

  // ── 欄位狀態總表 Sheet ──
  const summarySheet = wb.addWorksheet('📊 模組統計');
  summarySheet.columns = [
    { width: 20 }, { width: 26 }, { width: 18 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 30 },
  ];

  const sumTitle = summarySheet.addRow(['📊 系統物件統計總表', '', '', '', '', '', '']);
  summarySheet.mergeCells(`A${sumTitle.number}:G${sumTitle.number}`);
  sumTitle.height = 34;
  sumTitle.eachCell(c => {
    c.font = { bold: true, size: 16, color: { argb: 'FFFFFF' }, name: 'Calibri' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.moduleBg } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  summarySheet.addRow([]);

  const sumHeader = summarySheet.addRow(['模組', '類別名（英）', '類別名（中）', '總欄位數', '必填欄位', '選填欄位', '來源檔案']);
  sumHeader.height = 22;
  sumHeader.eachCell(c => {
    c.font = { bold: true, size: 11, color: { argb: COLOR.headerText } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = border();
  });

  MODULES.forEach((cls, i) => {
    const required = cls.fields.filter(f => f.required).length;
    const optional = cls.fields.filter(f => !f.required).length;
    const row = summarySheet.addRow([
      cls.module,
      cls.className,
      cls.classNameZh,
      cls.fields.length,
      required,
      optional,
      cls.source,
    ]);
    row.height = 18;
    const bg = i % 2 === 0 ? COLOR.rowOdd : COLOR.rowEven;
    row.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.font = { size: 10 };
      c.alignment = { vertical: 'middle', wrapText: true };
      c.border = border();
    });
    row.getCell(2).font = { size: 10, color: { argb: '005EB8' }, bold: true, name: 'Courier New' };
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'center' };
  });

  // 總計行
  summarySheet.addRow([]);
  const total = MODULES.reduce((s, m) => s + m.fields.length, 0);
  const totalReq = MODULES.reduce((s, m) => s + m.fields.filter(f => f.required).length, 0);
  const totalOpt = MODULES.reduce((s, m) => s + m.fields.filter(f => !f.required).length, 0);
  const totRow = summarySheet.addRow(['合計', `${MODULES.length} 個物件類別`, '', total, totalReq, totalOpt, '']);
  totRow.height = 22;
  totRow.eachCell(c => {
    c.font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.primary } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = border();
  });

  await wb.xlsx.writeFile(OUTPUT_PATH);
  console.log(`✅ Excel 已產生：${OUTPUT_PATH}`);
  console.log(`   📦 模組數：${Object.keys(moduleGroups).length}`);
  console.log(`   🗂  物件類別數：${MODULES.length}`);
  console.log(`   📋 欄位總數：${total}（必填 ${totalReq}，選填 ${totalOpt}）`);
}

buildExcel().catch(err => {
  console.error('❌ 發生錯誤：', err);
  process.exit(1);
});
