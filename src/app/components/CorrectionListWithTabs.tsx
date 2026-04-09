import { useState, useMemo, useCallback, useEffect } from 'react';
import type React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useOrderStore, nowDateStr, operatorByRole } from './OrderStoreContext';
import type { CorrectionOrderRow, CorrectionStatus, HistoryEntry } from './OrderStoreContext';
import type { OrderRow } from './AdvancedOrderTable';
import { extraCkOrders } from './CorrectionCreatePage';
import { CorrectionDetailPage } from './CorrectionDetailPage';
import type { CorrectionFormData } from './CorrectionDetailPage';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { PaginationControls } from './PaginationControls';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import { exportOrdersExcel, exportOrdersCsv } from './OrderCsvManager';
import { CheckboxIcon } from './CheckboxIcon';
import svgTrash from '@/imports/svg-g29eakwhmm';

// ─── 常數 ─────────────────────────────────────────────────────────────────────
const DOCNO_COL_WIDTH = 120;
const ACTION_COL_WIDTH = 148;

// ─── Column 定義 ─────────────────────────────────────────────────────────────
export type CorrectionColumnKey =
  | 'vendorName' | 'purchaseOrg' | 'correctionStatus' | 'correctionDocNo'
  | 'correctionType' | 'orderNo' | 'orderSeq' | 'materialNo' | 'productName'
  | 'orderDate' | 'acceptQty' | 'orderQty' | 'company' | 'createdAt';

export interface CorrectionColumn {
  key: CorrectionColumnKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export const defaultCorrectionColumns: CorrectionColumn[] = [
  { key: 'vendorName',        label: '廠商(編號)',             width: 200, minWidth: 120 },
  { key: 'purchaseOrg',       label: '採購組織',               width: 110, minWidth: 80 },
  { key: 'correctionStatus',  label: '修正單狀態',             width: 100, minWidth: 80 },
  { key: 'correctionType',    label: '修正類型',               width: 110, minWidth: 80 },
  { key: 'orderNo',           label: '訂單號碼',               width: 120, minWidth: 100 },
  { key: 'orderSeq',          label: '訂單序號',               width: 80,  minWidth: 60 },
  { key: 'materialNo',        label: '料號',                   width: 160, minWidth: 100 },
  { key: 'productName',       label: '品名',                   width: 180, minWidth: 100 },
  { key: 'orderDate',         label: '訂單日期',               width: 110, minWidth: 90 },
  { key: 'acceptQty',         label: '驗收量',                 width: 90,  minWidth: 60 },
  { key: 'orderQty',          label: '訂貨量',                 width: 90,  minWidth: 60 },
  { key: 'company',           label: '公司',                   width: 110, minWidth: 80 },
  { key: 'createdAt',         label: '開立時間',               width: 140, minWidth: 100 },
];

export function getCorrectionColumns(): CorrectionColumn[] {
  return defaultCorrectionColumns.map(c => ({ ...c }));
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const correctionMockData: CorrectionOrderRow[] = [
  { id: 80001, correctionDocNo: '202603080004', correctionStatus: 'DR', correctionType: '不拆單', orderNo: '400649723', orderSeq: '10', docSeqNo: '40064972310', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '1129-CSL0075-L01', productName: '碳纖維座管', orderDate: '2024/12/25', orderQty: 100, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/08 10:20' },
  { id: 80002, correctionDocNo: '202603080005', correctionStatus: 'DR', correctionType: '不拆單', orderNo: '400649723', orderSeq: '10', docSeqNo: '40064972310', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '1129-CSL0075-L01', productName: '碳纖維座管', orderDate: '2024/12/25', orderQty: 100, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/08 11:05' },
  { id: 80003, correctionDocNo: '202603080006', correctionStatus: 'DR', correctionType: '不拆單', orderNo: '400649723', orderSeq: '10', docSeqNo: '40064972310', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '1129-CSL0075-L01', productName: '碳纖維座管', orderDate: '2024/12/25', orderQty: 100, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/08 11:30' },
  { id: 80004, correctionDocNo: '202603090007', correctionStatus: 'V', correctionType: '不拆單', orderNo: '400649801', orderSeq: '10', docSeqNo: '40064980110', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '2101-CHN0099-A01', productName: '12速鏈條', orderDate: '2025/03/05', orderQty: 300, acceptQty: 300, company: '巨大機械', createdAt: '2026/03/09 09:00' },
  { id: 80005, correctionDocNo: '202603090008', correctionStatus: 'V', correctionType: '不拆單', orderNo: '400649802', orderSeq: '20', docSeqNo: '40064980220', vendorCode: '00010053', vendorName: '久廣精密(00010053)', purchaseOrg: 'GEM採購組織', materialNo: '3301-FRK0055-B01', productName: '碳纖維前叉-D型', orderDate: '2025/03/08', orderQty: 150, acceptQty: 150, company: '巨大機械', createdAt: '2026/03/09 09:15' },
  { id: 80006, correctionDocNo: '202603090009', correctionStatus: 'V', correctionType: '不拆單', orderNo: '400649803', orderSeq: '30', docSeqNo: '40064980330', vendorCode: '00010059', vendorName: '金盛元工業(00010059)', purchaseOrg: 'GEM採購組織', materialNo: '4401-GRP0022-C01', productName: '競速握把套', orderDate: '2025/03/10', orderQty: 400, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/09 10:00' },
  { id: 80007, correctionDocNo: '202603090010', correctionStatus: 'B', correctionType: '不拆單', orderNo: '400649804', orderSeq: '40', docSeqNo: '40064980440', vendorCode: '00010045', vendorName: '佳承精密(00010045)', purchaseOrg: 'GEM採購組織', materialNo: '5501-WHL0088-D01', productName: '碟煞輪組後輪', orderDate: '2025/03/12', orderQty: 80, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/09 14:00' },
  { id: 80008, correctionDocNo: '202603090011', correctionStatus: 'B', correctionType: '不拆單', orderNo: '400649805', orderSeq: '50', docSeqNo: '40064980550', vendorCode: '00010012', vendorName: '台灣製造(00010012)', purchaseOrg: 'GEM採購組織', materialNo: '6601-BRK0044-E01', productName: '後碟煞系統', orderDate: '2025/03/15', orderQty: 200, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/09 15:00' },
  { id: 80009, correctionDocNo: '202603070003', correctionStatus: 'CP', correctionType: '不拆單', orderNo: '400649808', orderSeq: '10', docSeqNo: '40064980810', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '9901-STM0033-H01', productName: '鋁合金龍頭', orderDate: '2025/02/20', orderQty: 250, acceptQty: 250, company: '巨大機械', createdAt: '2026/03/07 16:00' },
  { id: 80010, correctionDocNo: '202603050002', correctionStatus: 'SS', correctionType: '不拆單', orderNo: '400649806', orderSeq: '60', docSeqNo: '40064980660', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '7701-NIP0011-F01', productName: '鋁合金花鼓螺絲', orderDate: '2025/03/18', orderQty: 500, acceptQty: 0, company: '巨大機械', createdAt: '2026/03/05 08:30' },
  { id: 80012, correctionDocNo: '202603140012', correctionStatus: 'DR', correctionType: '拆單', orderNo: '400649808', orderSeq: '80', docSeqNo: '40064980880', vendorCode: '00010059', vendorName: '金盛元工業(00010059)', purchaseOrg: 'GEM採購組織', materialNo: '9901-DRL0066-H01', productName: '碳纖維後撥鏈器', orderDate: '2025/03/22', orderQty: 480, acceptQty: 120, company: '巨大機械', createdAt: '2026/03/14 09:30', savedDeliveryRows: [{ expectedDelivery: '2025/07/02', vendorOriginalDate: '2025/07/02', newVendorDate: '2025/07/02', originalQty: 480, newQty: '200', splitOrderSeq: '80', splitNewMaterialNo: '' }, { expectedDelivery: '2025/07/02', vendorOriginalDate: '2025/07/02', newVendorDate: '2025/07/15', originalQty: 480, newQty: '280', splitOrderSeq: '90', splitNewMaterialNo: '' }], savedPeriodInput: '2' },
];

// ─── Tab 定義 ─────────────────────────────────────────────────────────────────
type TabKey = 'ALL' | 'CK' | CorrectionStatus;

interface TabDef {
  key: TabKey;
  label: string;
  statusBg?: string;
  statusText?: string;
  activeBadgeBg?: string;
  activeBadgeText?: string;
}

const tabs: TabDef[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DR', label: '草稿(DR)', activeBadgeBg: 'bg-[rgba(255,171,0,0.16)]', activeBadgeText: 'text-[#b76e00]', statusBg: 'bg-[rgba(255,171,0,0.16)]', statusText: 'text-[#b76e00]' },
  { key: 'V',  label: '廠商確認中(V)', activeBadgeBg: 'bg-[rgba(0,184,217,0.16)]', activeBadgeText: 'text-[#006c9c]', statusBg: 'bg-[rgba(0,94,184,0.16)]', statusText: 'text-[#00559c]' },
  { key: 'B',  label: '採購確認中(B)', activeBadgeBg: 'bg-[rgba(142,51,255,0.16)]', activeBadgeText: 'text-[#5119b7]', statusBg: 'bg-[rgba(142,51,255,0.16)]', statusText: 'text-[#5119b7]' },
  { key: 'CP', label: '單據已確認，資料處理中(CP)', activeBadgeBg: 'bg-[rgba(0,184,217,0.16)]', activeBadgeText: 'text-[#006c9c]', statusBg: 'bg-[rgba(0,184,217,0.16)]', statusText: 'text-[#006c9c]' },
  { key: 'SS', label: '修正通過(SS)', activeBadgeBg: 'bg-[rgba(34,197,94,0.16)]', activeBadgeText: 'text-[#118d57]', statusBg: 'bg-[rgba(34,197,94,0.16)]', statusText: 'text-[#118d57]' },
  { key: 'CL', label: '單據結案(CL)', activeBadgeBg: 'bg-[rgba(145,158,171,0.16)]', activeBadgeText: 'text-[#637381]', statusBg: 'bg-[rgba(145,158,171,0.16)]', statusText: 'text-[#637381]' },
];

// 歷史修正單專用 Tabs（僅 ALL / CK / CL）
const historyTabs: TabDef[] = [
  { key: 'ALL', label: 'All' },
  { key: 'CK', label: '已確認(CK)', activeBadgeBg: 'bg-[rgba(34,197,94,0.16)]', activeBadgeText: 'text-[#118d57]', statusBg: 'bg-[rgba(34,197,94,0.16)]', statusText: 'text-[#118d57]' },
  { key: 'CL', label: '單據結案(CL)', activeBadgeBg: 'bg-[rgba(145,158,171,0.16)]', activeBadgeText: 'text-[#637381]', statusBg: 'bg-[rgba(145,158,171,0.16)]', statusText: 'text-[#637381]' },
];

// 歷史修正單假資料（3年以上，CK / CL）
const historyCorrectionMockData: CorrectionOrderRow[] = [
  { id: 70001, correctionDocNo: '202201050001', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512345', orderSeq: '10', docSeqNo: '40051234510', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '1129-CSL0075-L01', productName: '碳纖維座管', orderDate: '2021/12/01', orderQty: 200, acceptQty: 200, company: '巨大機械', createdAt: '2022/01/05 09:00' },
  { id: 70002, correctionDocNo: '202201080002', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512346', orderSeq: '20', docSeqNo: '40051234620', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '2101-CHN0099-A01', productName: '12速鏈條', orderDate: '2021/12/10', orderQty: 500, acceptQty: 500, company: '巨大機械', createdAt: '2022/01/08 10:30' },
  { id: 70003, correctionDocNo: '202202100003', correctionStatus: 'CL' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512347', orderSeq: '30', docSeqNo: '40051234730', vendorCode: '00010053', vendorName: '久廣精密(00010053)', purchaseOrg: 'GEM採購組織', materialNo: '3301-FRK0055-B01', productName: '碳纖維前叉-D型', orderDate: '2022/01/20', orderQty: 300, acceptQty: 0, company: '巨大機械', createdAt: '2022/02/10 14:00' },
  { id: 70004, correctionDocNo: '202202150004', correctionStatus: 'CK' as CorrectionStatus, correctionType: '拆單', orderNo: '400512348', orderSeq: '40', docSeqNo: '40051234840', vendorCode: '00010059', vendorName: '金盛元工業(00010059)', purchaseOrg: 'GEM採購組織', materialNo: '4401-GRP0022-C01', productName: '競速握把套', orderDate: '2022/01/25', orderQty: 600, acceptQty: 300, company: '巨大機械', createdAt: '2022/02/15 09:15' },
  { id: 70005, correctionDocNo: '202203200005', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512349', orderSeq: '50', docSeqNo: '40051234950', vendorCode: '00010045', vendorName: '佳承精密(00010045)', purchaseOrg: 'GEM採購組織', materialNo: '5501-WHL0088-D01', productName: '碟煞輪組後輪', orderDate: '2022/02/28', orderQty: 120, acceptQty: 120, company: '巨大機械', createdAt: '2022/03/20 11:00' },
  { id: 70006, correctionDocNo: '202204050006', correctionStatus: 'CL' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512350', orderSeq: '60', docSeqNo: '40051235060', vendorCode: '00010012', vendorName: '台灣製造(00010012)', purchaseOrg: 'GEM採購組織', materialNo: '6601-BRK0044-E01', productName: '後碟煞系統', orderDate: '2022/03/10', orderQty: 400, acceptQty: 0, company: '巨大機械', createdAt: '2022/04/05 08:30' },
  { id: 70007, correctionDocNo: '202205120007', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512351', orderSeq: '70', docSeqNo: '40051235170', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '7701-NIP0011-F01', productName: '鋁合金花鼓螺絲', orderDate: '2022/04/22', orderQty: 800, acceptQty: 800, company: '巨大機械', createdAt: '2022/05/12 13:45' },
  { id: 70008, correctionDocNo: '202206080008', correctionStatus: 'CK' as CorrectionStatus, correctionType: '拆單', orderNo: '400512352', orderSeq: '80', docSeqNo: '40051235280', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '8801-SPK0033-G01', productName: '競速輻條組', orderDate: '2022/05/15', orderQty: 200, acceptQty: 200, company: '巨大機械', createdAt: '2022/06/08 10:00' },
  { id: 70009, correctionDocNo: '202207150009', correctionStatus: 'CL' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512353', orderSeq: '90', docSeqNo: '40051235390', vendorCode: '00010053', vendorName: '久廣精密(00010053)', purchaseOrg: 'GEM採購組織', materialNo: '9901-STM0033-H01', productName: '鋁合金龍頭', orderDate: '2022/06/20', orderQty: 150, acceptQty: 0, company: '巨大機械', createdAt: '2022/07/15 09:30' },
  { id: 70010, correctionDocNo: '202208200010', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400512354', orderSeq: '10', docSeqNo: '40051235410', vendorCode: '00010059', vendorName: '金盛元工業(00010059)', purchaseOrg: 'GEM採購組織', materialNo: '1002-HDL0077-I01', productName: '碳纖維把手', orderDate: '2022/07/30', orderQty: 100, acceptQty: 100, company: '巨大機械', createdAt: '2022/08/20 14:20' },
  { id: 70011, correctionDocNo: '202104010011', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400488001', orderSeq: '10', docSeqNo: '40048800110', vendorCode: '00010045', vendorName: '佳承精密(00010045)', purchaseOrg: 'GEM採購組織', materialNo: '2003-BBX0044-J01', productName: '鋁合金底架', orderDate: '2021/03/15', orderQty: 350, acceptQty: 350, company: '巨大機械', createdAt: '2021/04/01 09:00' },
  { id: 70012, correctionDocNo: '202105200012', correctionStatus: 'CL' as CorrectionStatus, correctionType: '拆單', orderNo: '400488002', orderSeq: '20', docSeqNo: '40048800220', vendorCode: '00010012', vendorName: '台灣製造(00010012)', purchaseOrg: 'GEM採購組織', materialNo: '3004-CHN0055-K01', productName: '10速鏈條', orderDate: '2021/04/25', orderQty: 700, acceptQty: 0, company: '巨大機械', createdAt: '2021/05/20 11:00' },
  { id: 70013, correctionDocNo: '202106100013', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400488003', orderSeq: '30', docSeqNo: '40048800330', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '4005-FRK0066-L01', productName: '鋼製前叉', orderDate: '2021/05/30', orderQty: 250, acceptQty: 250, company: '巨大機械', createdAt: '2021/06/10 08:45' },
  { id: 70014, correctionDocNo: '202107250014', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400488004', orderSeq: '40', docSeqNo: '40048800440', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '5006-GRP0077-M01', productName: '橡膠握把', orderDate: '2021/06/20', orderQty: 1000, acceptQty: 1000, company: '巨大機械', createdAt: '2021/07/25 15:30' },
  { id: 70015, correctionDocNo: '202109050015', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400488005', orderSeq: '50', docSeqNo: '40048800550', vendorCode: '00010053', vendorName: '久廣精密(00010053)', purchaseOrg: 'GEM採購組織', materialNo: '6007-WHL0088-N01', productName: '鋁合金輪圈', orderDate: '2021/08/10', orderQty: 80, acceptQty: 80, company: '巨大機械', createdAt: '2021/09/05 10:00' },
  { id: 70016, correctionDocNo: '202110150016', correctionStatus: 'CL' as CorrectionStatus, correctionType: '不拆單', orderNo: '400488006', orderSeq: '60', docSeqNo: '40048800660', vendorCode: '00010059', vendorName: '金盛元工業(00010059)', purchaseOrg: 'GEM採購組織', materialNo: '7008-BRK0099-O01', productName: '碟煞來令片', orderDate: '2021/09/15', orderQty: 500, acceptQty: 0, company: '巨大機械', createdAt: '2021/10/15 16:00' },
  { id: 70017, correctionDocNo: '202111280017', correctionStatus: 'CK' as CorrectionStatus, correctionType: '拆單', orderNo: '400488007', orderSeq: '70', docSeqNo: '40048800770', vendorCode: '00010045', vendorName: '佳承精密(00010045)', purchaseOrg: 'GEM採購組織', materialNo: '8009-NUT0011-P01', productName: '快拆螺帽組', orderDate: '2021/10/20', orderQty: 2000, acceptQty: 2000, company: '巨大機械', createdAt: '2021/11/28 09:30' },
  { id: 70018, correctionDocNo: '202112100018', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400488008', orderSeq: '80', docSeqNo: '40048800880', vendorCode: '00010012', vendorName: '台灣製造(00010012)', purchaseOrg: 'GEM採購組織', materialNo: '9010-SAD0022-Q01', productName: '競速車座', orderDate: '2021/11/25', orderQty: 90, acceptQty: 90, company: '巨大機械', createdAt: '2021/12/10 13:00' },
  { id: 70019, correctionDocNo: '202009200019', correctionStatus: 'CL' as CorrectionStatus, correctionType: '不拆單', orderNo: '400455001', orderSeq: '10', docSeqNo: '40045500110', vendorCode: '0001000734', vendorName: 'SHIMANOSIC(0001000734)', purchaseOrg: 'GEM採購組織', materialNo: '1011-PDL0033-R01', productName: '卡踏踏板', orderDate: '2020/08/30', orderQty: 400, acceptQty: 0, company: '巨大機械', createdAt: '2020/09/20 08:00' },
  { id: 70020, correctionDocNo: '202011050020', correctionStatus: 'CK' as CorrectionStatus, correctionType: '不拆單', orderNo: '400455002', orderSeq: '20', docSeqNo: '40045500220', vendorCode: '00010046', vendorName: '速聯國際(00010046)', purchaseOrg: 'GEM採購組織', materialNo: '2012-CST0044-S01', productName: '11速飛輪組', orderDate: '2020/10/15', orderQty: 180, acceptQty: 180, company: '巨大機械', createdAt: '2020/11/05 11:30' },
];

// ─── viewMode 對應 ────────────────────────────────────────────────────────────
type ViewMode = 'edit' | 'vendorReview' | 'purchaserReview' | 'readonly';
function getViewMode(status: CorrectionStatus): ViewMode {
  if (status === 'DR') return 'edit';
  if (status === 'V')  return 'vendorReview';
  if (status === 'B')  return 'purchaserReview';
  return 'readonly';
}

// ─── CorrectionOrderRow → OrderRow ───────────────────────────────────────────
function correctionRowToOrderRow(row: CorrectionOrderRow): OrderRow {
  return {
    id: row.id,
    status: 'CK',
    orderNo: row.orderNo,
    orderSeq: row.orderSeq,
    docSeqNo: row.docSeqNo,
    vendorCode: row.vendorCode,
    vendorName: row.vendorName,
    purchaseOrg: row.purchaseOrg,
    materialNo: row.materialNo,
    productName: row.productName,
    orderDate: row.orderDate,
    orderQty: row.orderQty,
    acceptQty: row.acceptQty,
    company: row.company,
    inTransitQty: row.inTransitQty ?? 0,
    deliveryQty: row.deliveryQty ?? row.orderQty,
    expectedDelivery: row.expectedDelivery ?? '',
    vendorDeliveryDate: row.vendorDeliveryDate ?? '',
    agreedDate: row.agreedDate ?? '',
    undeliveredQty: 0,
    orderType: '',
    purchaser: '',
    comparePrice: '',
    unit: '',
    currency: 'TWD',
    leadtime: 0,
    customerBrand: '',
    vendorMaterialNo: '',
    specification: '',
    lineItemNote: '',
    internalNote: '',
    materialPOContent: '',
  } as OrderRow;
}

// ─── 狀態 Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CorrectionStatus }) {
  const tab = tabs.find(t => t.key === status);
  const bg = tab?.statusBg ?? 'bg-[rgba(145,158,171,0.16)]';
  const color = tab?.statusText ?? 'text-[#637381]';
  return (
    <div className={`${bg} h-[24px] min-w-[24px] rounded-[6px] flex items-center justify-center px-[6px]`}>
      <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center whitespace-nowrap ${color}`}>{status}</p>
    </div>
  );
}

// ─── Tab Item ────────────────────────────────────────────────────────────────
function TabItem({ tabDef, count, isActive, onClick }: { tabDef: TabDef; count?: number; isActive: boolean; onClick: () => void }) {
  const badgeBg = isActive && tabDef.activeBadgeBg ? tabDef.activeBadgeBg : 'bg-[rgba(145,158,171,0.16)]';
  const badgeText = isActive && tabDef.activeBadgeText ? tabDef.activeBadgeText : 'text-[#637381]';

  const parenMatch = tabDef.label.match(/^(.*?)(\([^)]+\))$/);
  const labelDesc = parenMatch ? parenMatch[1] : tabDef.label;
  const labelCode = parenMatch ? parenMatch[2] : '';

  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-0 max-w-[160px] relative shrink cursor-pointer overflow-hidden"
      title={tabDef.label}
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <div className="flex items-center min-w-0">
        <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative min-w-0 truncate ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
          {labelDesc}
        </p>
        {labelCode && (
          <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px] whitespace-nowrap`}>
            {labelCode}
          </p>
        )}
      </div>
      {count !== undefined && (
        <div className={`${badgeBg} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badgeText} text-[12px] text-center`}>{count}</p>
        </div>
      )}
    </div>
  );
}

// ─── Draggable Column Header ─────────────────────────────────────────────────
const DraggableColumnHeader = ({
  column, index, moveColumn, updateColumnWidth, sortConfig, onSort, isLast,
}: {
  column: CorrectionColumn;
  index: number;
  moveColumn: (dragKey: CorrectionColumnKey, hoverKey: CorrectionColumnKey) => void;
  updateColumnWidth: (key: CorrectionColumnKey, width: number) => void;
  sortConfig: { key: CorrectionColumnKey | null; direction: 'asc' | 'desc' | null };
  onSort: (key: CorrectionColumnKey) => void;
  isLast?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'correction-column',
    item: () => ({ columnKey: column.key, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: 'correction-column',
    hover: (item: { columnKey: CorrectionColumnKey; index: number }) => {
      if (item.index !== index) {
        moveColumn(item.columnKey, column.key);
        item.index = index;
      }
    },
  });

  const isSorted = sortConfig.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;

  return (
    <Resizable
      size={{ width: column.width, height: 56 }}
      minWidth={column.minWidth}
      maxWidth={800}
      enable={{ right: true }}
      onResizeStop={(_e, _dir, _ref, d) => updateColumnWidth(column.key, column.width + d.width)}
      handleStyles={{ right: { width: '4px', right: '0', cursor: 'col-resize', background: 'transparent', zIndex: 1 } }}
      handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={(node) => drag(drop(node))}
        className={`h-full flex items-center justify-start px-[16px] cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget || ['P', 'svg', 'path'].includes((e.target as HTMLElement).tagName)) {
            onSort(column.key);
          }
        }}
      >
        {isHovered && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-[6px] shrink-0">
            <circle cx="5" cy="3" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="3" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="8" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="8" r="1.5" fill="#919EAB" />
            <circle cx="5" cy="13" r="1.5" fill="#919EAB" />
            <circle cx="11" cy="13" r="1.5" fill="#919EAB" />
          </svg>
        )}
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
          {column.label}
        </p>
        {sortDirection && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
            {sortDirection === 'asc' ? (
              <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
            ) : (
              <path d="M8 13L4 9H12L8 13Z" fill="#637381" />
            )}
          </svg>
        )}
      </div>
    </Resizable>
  );
};

// ─── 工具列 Divider ───────────────────────────────────────────────────────────
function ToolbarDivider() {
  return (
    <div className="h-[28px] w-px bg-[rgba(99,115,129,0.32)] shrink-0 mx-[4px]" />
  );
}

// ─── 工具列 Action Button ─────────────────────────────────────────────────────
function ToolbarBtn({ label, onClick, disabled, title }: { label: string; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center justify-center px-[12px] py-[16px] hover:opacity-70 transition-opacity disabled:opacity-35 shrink-0"
    >
      <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#004680] text-[14px] text-center whitespace-nowrap">{label}</span>
    </button>
  );
}

// ─── 通用選取工具列 ────────────────────────────────────────────────────────────
interface SelectionToolbarProps {
  selectedCount: number;
  isAllSelected: boolean;
  onToggleAll: () => void;
  activeTab: TabKey;
  canView: boolean;
  onView: () => void;
  onBulkSubmit: () => void;        // DR: 全部提交廠商
  onEdit: () => void;              // DR: 編輯 (1 only)
  canEdit: boolean;
  onDelete: () => void;            // DR: 刪除
  onBulkAgree: () => void;         // V:  全部同意
  onBulkConfirm: () => void;       // B:  全部確認
}

function SelectionToolbar({
  selectedCount, isAllSelected, onToggleAll,
  activeTab,
  canView, onView,
  onBulkSubmit, onEdit, canEdit, onDelete,
  onBulkAgree,
  onBulkConfirm,
}: SelectionToolbarProps) {
  return (
    <div className="flex items-center h-[48px] bg-[#d9e8f5] border-b border-[rgba(145,158,171,0.08)]">
      {/* 左側：checkbox toggle（與表格 checkbox 對齊） */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 56, minWidth: 56 }}
      >
        <button
          onClick={onToggleAll}
          className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(0,85,156,0.12)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 16.6667 16.6667" fill="none">
            <path clipRule="evenodd" d={svgTrash.p220f9900} fill="#00559C" fillRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 計數文字 */}
      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e] leading-[24px] whitespace-nowrap mr-[4px]">
        {selectedCount} selected
      </span>

      {/* Tab-specific actions */}
      {activeTab === 'DR' && (
        <>
          <ToolbarBtn label="全部提交廠商" onClick={onBulkSubmit} />
          <ToolbarDivider />
          <ToolbarBtn label="編輯" onClick={onEdit} disabled={!canEdit} title={!canEdit ? '請選取修正單以編輯' : undefined} />
          <ToolbarDivider />
          <ToolbarBtn label="刪除" onClick={onDelete} />
        </>
      )}

      {activeTab === 'V' && (
        <>
          <ToolbarBtn label="檢視" onClick={onView} disabled={!canView} title={!canView ? '請選取修正單以檢視' : undefined} />
          <ToolbarDivider />
          <ToolbarBtn label="全部同意" onClick={onBulkAgree} />
        </>
      )}

      {activeTab === 'B' && (
        <>
          <ToolbarBtn label="檢視" onClick={onView} disabled={!canView} title={!canView ? '請選取修正單以檢視' : undefined} />
          <ToolbarDivider />
          <ToolbarBtn label="全部確認" onClick={onBulkConfirm} />
        </>
      )}

      {(activeTab === 'CP' || activeTab === 'SS') && (
        <ToolbarBtn label="檢視" onClick={onView} disabled={!canView} title={!canView ? '請選取修正單以檢視' : undefined} />
      )}

      {(activeTab === 'CK' || activeTab === 'CL') && (
        <ToolbarBtn label="檢視" onClick={onView} disabled={!canView} title={!canView ? '請選取修正單以檢視' : undefined} />
      )}

      {activeTab === 'ALL' && (
        <ToolbarBtn label="檢視" onClick={onView} disabled={!canView} title={!canView ? '請選取修正單以檢視' : undefined} />
      )}
    </div>
  );
}

// ─── 主元件 ───────────────────────────────────────────────────────────────────
interface CorrectionListWithTabsProps {
  userRole?: string;
  /** 歷史修正單模式：只顯示 CK/CL Tab、注入歷史假資料、唯讀不提供操作 */
  historyMode?: boolean;
}

export function CorrectionListWithTabs({ userRole, historyMode = false }: CorrectionListWithTabsProps) {
  const { correctionOrders, addCorrectionOrder, addCorrectionHistory, updateCorrectionOrder, deleteCorrectionOrders, orders: storeOrders, addOrder: addStoreOrder, updateOrderFields: updateStoreOrderFields, addOrderHistory: addStoreOrderHistory } = useOrderStore();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [orderNoSearch, setOrderNoSearch] = useState('');
  const [correctionDocNoSearch, setCorrectionDocNoSearch] = useState('');
  const [correctionTypeSearch, setCorrectionTypeSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deletedMockIds, setDeletedMockIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  // ── Column / Filter / Sort state ───────────────────────────────────────────
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [tempColumns, setTempColumns] = useState<CorrectionColumn[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: CorrectionColumnKey | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);

  const [currentUserEmail] = useState<string>(() => localStorage.getItem('currentUserEmail') || 'default');

  // ── 明細檢視（支援多張 1/x 導覽）────────────────────────────────────────
  const [detailRows, setDetailRows] = useState<CorrectionOrderRow[]>([]);
  const [detailIndex, setDetailIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  // ── 修正單號欄寬（可拖曳調整，持久化至 localStorage）────────────────────────
  const getDocNoWidthKey = useCallback(
    () => `correctionList_${currentUserEmail}_docNoWidth`,
    [currentUserEmail]
  );
  const [docNoWidth, setDocNoWidth] = useState<number>(() => {
    try {
      const email = localStorage.getItem('currentUserEmail') || 'default';
      const saved = localStorage.getItem(`correctionList_${email}_docNoWidth`);
      if (saved) return Math.max(80, Math.min(400, Number(saved)));
    } catch { /* ignore */ }
    return DOCNO_COL_WIDTH;
  });

  // docNoWidth 變更時寫入 localStorage
  useEffect(() => {
    try { localStorage.setItem(getDocNoWidthKey(), String(docNoWidth)); } catch { /* ignore */ }
  }, [docNoWidth, getDocNoWidthKey]);

  // ── Horizontal drag scroll ─────────────────────────────────────────────────
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // ── localStorage helpers ───────────────────────────────────────────────────
  const getStorageKey = useCallback((tab: string) => {
    const safeTab = tab.replace(/[^a-zA-Z0-9]/g, '_');
    return `correctionList_${currentUserEmail}_${safeTab}_columns`;
  }, [currentUserEmail]);

  const loadColumnsFromStorage = useCallback((tab: string): CorrectionColumn[] => {
    try {
      const saved = localStorage.getItem(getStorageKey(tab));
      if (saved) {
        const savedCols = JSON.parse(saved) as CorrectionColumn[];
        const knownKeys = new Set(defaultCorrectionColumns.map(c => c.key));
        const merged = defaultCorrectionColumns.map(col => {
          const sc = savedCols.find(s => s.key === col.key);
          return sc ? { ...col, width: sc.width, visible: sc.visible } : col;
        });
        const orderedKeys = savedCols.filter(s => knownKeys.has(s.key as CorrectionColumnKey)).map(s => s.key);
        if (orderedKeys.length === merged.length) {
          return orderedKeys.map(k => merged.find(m => m.key === k)!);
        }
        return merged;
      }
    } catch { /* ignore */ }
    return defaultCorrectionColumns.map(c => ({ ...c }));
  }, [getStorageKey]);

  const saveColumnsToStorage = useCallback((tab: string, cols: CorrectionColumn[]) => {
    try { localStorage.setItem(getStorageKey(tab), JSON.stringify(cols)); } catch { /* ignore */ }
  }, [getStorageKey]);

  // ── Columns state (per-tab, persisted) ─────────────────────────────────────
  const [columns, setColumns] = useState<CorrectionColumn[]>(() => loadColumnsFromStorage('ALL'));

  useEffect(() => {
    setIsLoadingFromStorage(true);
    setColumns(loadColumnsFromStorage(activeTab));
    setTimeout(() => setIsLoadingFromStorage(false), 0);
  }, [activeTab, currentUserEmail, loadColumnsFromStorage]);

  useEffect(() => {
    if (!isLoadingFromStorage) {
      saveColumnsToStorage(activeTab, columns);
    }
  }, [columns, activeTab, isLoadingFromStorage, saveColumnsToStorage]);

  const visibleColumns = useMemo(() => columns.filter(c => c.visible !== false), [columns]);

  // ── Column drag / resize ───────────────────────────────────────────────────
  const moveColumn = useCallback((dragKey: CorrectionColumnKey, hoverKey: CorrectionColumnKey) => {
    setColumns(prev => {
      const dragIdx = prev.findIndex(c => c.key === dragKey);
      const hoverIdx = prev.findIndex(c => c.key === hoverKey);
      const next = [...prev];
      const [removed] = next.splice(dragIdx, 1);
      next.splice(hoverIdx, 0, removed);
      return next;
    });
  }, []);

  const updateColumnWidth = useCallback((key: CorrectionColumnKey, width: number) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, width } : c));
  }, []);

  // ── Columns button handlers ────────────────────────────────────────────────
  const handleColumnsClick = useCallback(() => {
    setTempColumns(JSON.parse(JSON.stringify(columns)));
    setShowColumnSelector(v => !v);
    if (showFilterDialog) setShowFilterDialog(false);
  }, [columns, showFilterDialog]);

  const handleToggleColumn = (key: string) => {
    setTempColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !(c.visible !== false) } : c));
  };
  const handleToggleAll = (selectAll: boolean) => {
    setTempColumns(prev => prev.map(c => ({ ...c, visible: selectAll })));
  };
  const handleApplyColumns = () => {
    setColumns(tempColumns);
    setShowColumnSelector(false);
  };

  // ── Filters handlers ──────────────────────────────────────────────────────
  const handleFiltersClick = () => {
    setShowFilterDialog(v => !v);
    if (showColumnSelector) setShowColumnSelector(false);
  };
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterDialog(false);
  };

  // ── Sort handler ──────────────────────────────────────────────────────────
  const handleSort = useCallback((key: CorrectionColumnKey) => {
    setSortConfig(prev => {
      if (prev.key === key && prev.direction === 'asc') return { key, direction: 'desc' };
      return { key, direction: 'asc' };
    });
  }, []);

  // ── Data merge: store + mock ──────────────────────────────────────────────
  const allCorrectionOrders = useMemo(() => {
    // 歷史模式：直接使用歷史假資料，不合併 store
    if (historyMode) return historyCorrectionMockData;
    const storeIds = new Set(correctionOrders.map(o => o.id));
    const mock = correctionMockData.filter(o => !storeIds.has(o.id) && !deletedMockIds.has(o.id));
    const merged = [...correctionOrders, ...mock];
    // 以 correctionDocNo 去重，確保 key 唯一
    const seen = new Set<string>();
    return merged.filter(o => {
      const k = o.correctionDocNo || String(o.id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [correctionOrders, deletedMockIds, historyMode]);

  // ── 修正類型選項（動態從資料中收集，確保含已知類型）──────────────────────
  const correctionTypeOptions = useMemo(() => {
    const known = ['不拆單', '刪單', '拆單'];
    const fromData = allCorrectionOrders.map(o => o.correctionType ?? '').filter(Boolean);
    const all = [...new Set([...known, ...fromData])];
    // DropdownSelect 格式：第一項為「全部」(value='')，其餘為各類型
    return [
      { value: '', label: '全部' },
      ...all.map(t => ({ value: t, label: t })),
    ];
  }, [allCorrectionOrders]);

  // ── 多關鍵字搜尋 ──────────────────────────────────────────────────────────
  const splitKw = (s: string) => s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchAny = (val: string, kws: string[]) => kws.some(k => val.toLowerCase().includes(k));

  // ── Tab + search filter ───────────────────────────────────────────────────
  const searchFilteredOrders = useMemo(() => {
    let result = allCorrectionOrders;
    if (activeTab !== 'ALL') result = result.filter(o => o.correctionStatus === activeTab);
    if (orderNoSearch.trim()) {
      const kws = splitKw(orderNoSearch);
      result = result.filter(o => matchAny(o.orderNo, kws));
    }
    if (correctionDocNoSearch.trim()) {
      const kws = splitKw(correctionDocNoSearch);
      result = result.filter(o => matchAny(o.correctionDocNo, kws));
    }
    if (correctionTypeSearch) {
      result = result.filter(o => o.correctionType === correctionTypeSearch);
    }
    return result;
  }, [allCorrectionOrders, activeTab, orderNoSearch, correctionDocNoSearch, correctionTypeSearch]);

  // ── Advanced filter ───────────────────────────────────────────────────────
  const advancedFilteredOrders = useMemo(() => {
    if (appliedFilters.length === 0) return searchFilteredOrders;
    return searchFilteredOrders.filter(item =>
      appliedFilters.every(f => {
        const raw = String(item[f.column as keyof CorrectionOrderRow] ?? '');
        const fv = f.value;
        switch (f.operator) {
          case 'contains':   return raw.toLowerCase().includes(fv.toLowerCase());
          case 'equals':     return raw.toLowerCase() === fv.toLowerCase();
          case 'notEquals':  return raw.toLowerCase() !== fv.toLowerCase();
          case 'startsWith': return raw.toLowerCase().startsWith(fv.toLowerCase());
          case 'endsWith':   return raw.toLowerCase().endsWith(fv.toLowerCase());
          case 'isEmpty':    return !raw || raw.trim() === '' || raw === '-';
          case 'isNotEmpty': return raw.trim() !== '' && raw !== '-';
          default:           return true;
        }
      })
    );
  }, [searchFilteredOrders, appliedFilters]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sortedOrders = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      if (activeTab === 'ALL') {
        return [...advancedFilteredOrders].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
      }
      return advancedFilteredOrders;
    }
    const sorted = [...advancedFilteredOrders].sort((a, b) => {
      const aVal = a[sortConfig.key! as keyof CorrectionOrderRow];
      const bVal = b[sortConfig.key! as keyof CorrectionOrderRow];
      if (!aVal && !bVal) return 0;
      if (!aVal) return 1;
      if (!bVal) return -1;
      const aStr = String(aVal);
      const bStr = String(bVal);
      const isNumber = /^\d/.test(aStr) && /^\d/.test(bStr);
      const isChinese = /^[\u4e00-\u9fa5]/.test(aStr) && /^[\u4e00-\u9fa5]/.test(bStr);
      let cmp = 0;
      if (isNumber) {
        cmp = parseFloat(aStr.match(/^[\d.]+/)?.[0] || '0') - parseFloat(bStr.match(/^[\d.]+/)?.[0] || '0');
      } else if (isChinese) {
        cmp = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      } else {
        cmp = aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
      }
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [advancedFilteredOrders, sortConfig, activeTab]);

  // ── Tab counts ────────────────────────────────────────────────────────────
  const activeTabs = historyMode ? historyTabs : tabs;
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of activeTabs) {
      if (t.key === 'ALL') continue;
      c[t.key] = allCorrectionOrders.filter(o => o.correctionStatus === t.key).length;
    }
    return c;
  }, [allCorrectionOrders, activeTabs]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalItems = sortedOrders.length;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedOrders.slice(start, start + perPage);
  }, [sortedOrders, page, perPage]);

  // ── Checkbox (all rows) ────────────────────────────────────────────────────
  const toggleId = (id: number) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // selectedIdsOnPage: 僅計算當頁已選取的
  const selectedIdsOnPage = useMemo(
    () => new Set(paginatedOrders.filter(o => selectedIds.has(o.id)).map(o => o.id)),
    [paginatedOrders, selectedIds]
  );

  const isAllSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.has(o.id));
  const toggleAll = () => {
    if (isAllSelected) {
      const n = new Set(selectedIds);
      paginatedOrders.forEach(o => n.delete(o.id));
      setSelectedIds(n);
    } else {
      const n = new Set(selectedIds);
      paginatedOrders.forEach(o => n.add(o.id));
      setSelectedIds(n);
    }
  };

  // ── Tab change ────────────────────────────────────────────────────────────
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds(new Set());
    setSortConfig({ key: null, direction: null });
  };

  // ── Export helpers ─────────────────────────────────────────────────────────
  const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const tabLabel = activeTab === 'ALL' ? '全部' : activeTab;
  const handleExportExcel = () => {
    const cols = visibleColumns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));
    const rows = sortedOrders.map(o => ({ ...o, status: o.correctionStatus as any }));
    exportOrdersExcel(rows as any, `修正單查詢_${tabLabel}_${dateSuffix}.xlsx`, cols as any);
  };
  const handleExportCsv = () => {
    const cols = visibleColumns.map(c => ({ key: c.key, label: c.label, width: c.width, minWidth: c.minWidth, visible: c.visible }));
    const rows = sortedOrders.map(o => ({ ...o, status: o.correctionStatus as any }));
    exportOrdersCsv(rows as any, `修正單查詢_${tabLabel}_${dateSuffix}.csv`, cols as any);
  };

  // ── Filter column options ─────────────────────────────────────────────────
  const filterColumnOptions = columns.map(c => ({ key: c.key, label: c.label }));

  // ── 批次功能 Helpers ──────────────────────────────────────────────────────
  const getSelectedRows = () =>
    allCorrectionOrders.filter(o => selectedIdsOnPage.has(o.id));

  // DR: 全部提交廠商
  const handleBulkSubmit = () => {
    const rows = getSelectedRows().filter(r => r.correctionStatus === 'DR');
    rows.forEach(row => {
      updateCorrectionOrder(row.id, row.correctionDocNo, { correctionStatus: 'V' });
      addCorrectionHistory(row.id, {
        date: nowDateStr(),
        event: '批次提交廠商',
        operator: operatorByRole(userRole as any),
        remark: '',
      });
    });
    const mockIds = [...selectedIdsOnPage].filter(id => !correctionOrders.some(o => o.id === id));
    if (mockIds.length > 0) setDeletedMockIds(prev => new Set([...prev, ...mockIds]));
    setSelectedIds(new Set());
    showToast(`已批次提交 ${rows.length} 張修正單至廠商確認(V)`);
  };

  // DR: 編輯（支援多張）
  const handleBulkEdit = () => {
    if (selectedIdsOnPage.size === 0) return;
    // 保持選取順序：依表格顯示順序排序
    const selectedArr = paginatedOrders.filter(o => selectedIdsOnPage.has(o.id));
    if (selectedArr.length > 0) {
      setSelectedIds(new Set());
      setDetailRows(selectedArr);
      setDetailIndex(0);
    }
  };

  // 通用批次刪除執行（確認後）
  const executeBulkDelete = () => {
    const ids = [...selectedIdsOnPage];
    const storeIds = ids.filter(id => correctionOrders.some(o => o.id === id));
    if (storeIds.length > 0) deleteCorrectionOrders(storeIds);
    const mockIds = ids.filter(id => !correctionOrders.some(o => o.id === id));
    if (mockIds.length > 0) setDeletedMockIds(prev => new Set([...prev, ...mockIds]));
    setSelectedIds(new Set());
    setDeleteConfirmOpen(false);
    const label = activeTab === 'DR' ? '草稿' : activeTab === 'ALL' ? '' : `${activeTab} 狀態`;
    showToast(`已刪除 ${ids.length} 張${label}修正單`);
  };

  // DR: 直接刪除；其他狀態：開啟確認對話框
  const handleBulkDelete = () => {
    if (activeTab === 'DR') {
      executeBulkDelete();
    } else {
      setDeleteConfirmOpen(true);
    }
  };

  // V: 全部同意（→ SS，並回寫原訂單）
  const handleBulkAgree = () => {
    const rows = getSelectedRows().filter(r => r.correctionStatus === 'V');
    rows.forEach(row => {
      // 執行訂單回寫
      if (row.correctionType === '拆單' && row.savedDeliveryRows && row.savedDeliveryRows.length > 1) {
        executeSplitFromCorrection(row);
      } else if (row.correctionType === '不拆單') {
        applyNonSplitCorrectionToOrder(row);
      }
      // 修正單推進 SS
      updateCorrectionOrder(row.id, row.correctionDocNo, { correctionStatus: 'SS' });
      addCorrectionHistory(row.id, {
        date: nowDateStr(),
        event: '批次同意修正，資料已回寫原訂單 (→SS)',
        operator: operatorByRole(userRole as any),
        remark: `修正類型：${row.correctionType}`,
      });
    });
    setSelectedIds(new Set());
    showToast(`已批次同意 ${rows.length} 張修正單，訂單已更新，狀態轉為 SS`);
  };

  // B: 全部確認（→ SS，並回寫原訂單）
  const handleBulkConfirm = () => {
    const rows = getSelectedRows().filter(r => r.correctionStatus === 'B');
    rows.forEach(row => {
      // 執行訂單回寫
      if (row.correctionType === '拆單' && row.savedDeliveryRows && row.savedDeliveryRows.length > 1) {
        executeSplitFromCorrection(row);
      } else if (row.correctionType === '不拆單') {
        applyNonSplitCorrectionToOrder(row);
      }
      // 修正單推進 SS
      updateCorrectionOrder(row.id, row.correctionDocNo, { correctionStatus: 'SS' });
      addCorrectionHistory(row.id, {
        date: nowDateStr(),
        event: '批次採購確認，資料已回寫原訂單 (→SS)',
        operator: operatorByRole(userRole as any),
        remark: `修正類型：${row.correctionType}`,
      });
    });
    setSelectedIds(new Set());
    showToast(`已批次確認 ${rows.length} 張修正單，訂單已更新，狀態轉為 SS`);
  };

  // 通用：檢視（支援多張，任意狀態）
  const handleView = () => {
    if (selectedIdsOnPage.size === 0) return;
    const selectedArr = paginatedOrders.filter(o => selectedIdsOnPage.has(o.id));
    if (selectedArr.length > 0) {
      setSelectedIds(new Set());
      setDetailRows(selectedArr);
      setDetailIndex(0);
    }
  };

  // ── Cell renderer ─────────────────────────────────────────────────────────
  const getCellValue = (row: CorrectionOrderRow, key: CorrectionColumnKey) => {
    if (key === 'correctionStatus') return <StatusBadge status={row.correctionStatus} />;
    // 單號序號 = 訂單號碼 + 訂單序號（自動計算）
    if (key === 'docSeqNo') {
      const computed = (row.orderNo || '') + (row.orderSeq || '');
      const display = computed || '—';
      const isPlaceholder = display === '—';
      return (
        <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${isPlaceholder ? 'text-[#919eab]' : 'text-[#1c252e]'}`} title={display}>
          {display}
        </p>
      );
    }
    const value = row[key as keyof CorrectionOrderRow];
    const display = value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '—';
    const isPlaceholder = display === '—';
    return (
      <p
        className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${isPlaceholder ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
        title={display}
      >
        {display}
      </p>
    );
  };

  const totalWidth = visibleColumns.reduce((sum, c) => sum + c.width, 0) + 56 + docNoWidth;

  // ── sticky-left style helpers ──────────────────────────────────────────────
  const stickyCheckboxStyle: React.CSSProperties = { position: 'sticky', left: 0, zIndex: 4 };
  const stickyDocNoStyle: React.CSSProperties = {
    position: 'sticky',
    left: 56,
    zIndex: 4,
    width: docNoWidth,
    minWidth: docNoWidth,
    boxShadow: '2px 0 4px -2px rgba(145,158,171,0.18)',
  };

  // ── 明細頁：onSave / onSubmit（多張時不關閉明細頁）──────────────────────
  const handleDetailSave = (_idx: number, data: CorrectionFormData) => {
    const row = detailRows[detailIndex];
    if (!row) return;
    updateCorrectionOrder(row.id, row.correctionDocNo, {
      newMaterialNo: data.newMaterialNo,
      correctionNote: data.correctionNote,
      savedDeliveryRows: data.deliveryRows.map(r => ({
        expectedDelivery: r.expectedDelivery,
        vendorOriginalDate: r.vendorOriginalDate,
        newVendorDate: r.newVendorDate,
        originalQty: r.originalQty,
        newQty: r.newQty,
        deleted: r.deleted,
      })),
      savedPeriodInput: data.periodInput,
    });
    showToast(`已開立修正單為草稿(DR)狀態：${row.correctionDocNo} 號`);
    // 單張時關閉；多張時留在明細頁（perOrderStatus 已追蹤狀態）
    if (detailRows.length <= 1) setDetailRows([]);
  };

  const handleDetailSubmit = (_idx: number, data: CorrectionFormData) => {
    const row = detailRows[detailIndex];
    if (!row) return;
    updateCorrectionOrder(row.id, row.correctionDocNo, {
      correctionStatus: 'V',
      newMaterialNo: data.newMaterialNo,
      correctionNote: data.correctionNote,
      savedDeliveryRows: data.deliveryRows.map(r => ({
        expectedDelivery: r.expectedDelivery,
        vendorOriginalDate: r.vendorOriginalDate,
        newVendorDate: r.newVendorDate,
        originalQty: r.originalQty,
        newQty: r.newQty,
        deleted: r.deleted,
      })),
      savedPeriodInput: data.periodInput,
    });
    const totalNewQty = data.deliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);
    showToast(totalNewQty === 0
      ? `刪單修正單 ${row.correctionDocNo} 號��提交廠商，待廠商確認後執行刪單(V)`
      : `修正單 ${row.correctionDocNo} 號已提交廠商，狀態轉為待廠商確認(V)`
    );
    if (detailRows.length <= 1) setDetailRows([]);
  };

  // ── 明細頁：approve / disagree / returnToVendor ───────────────────────────
  // ── 拆單修正單到達 SS 時，執行原訂單拆單作業 ──────────────────────────────
  const executeSplitFromCorrection = (corrRow: CorrectionOrderRow) => {
    const now = nowDateStr();
    const rows = corrRow.savedDeliveryRows;
    if (!rows || rows.length <= 1) return;

    // 找到原訂單（若 store 中不存在，從修正單資料建構並加入 store）
    let origOrder = storeOrders.find(
      o => o.orderNo === corrRow.orderNo && o.orderSeq === corrRow.orderSeq
    );
    if (!origOrder) {
      // 優先從 extraCkOrders 查找完整原訂單資料
      const extraSource = extraCkOrders.find(
        o => o.orderNo === corrRow.orderNo && o.orderSeq === corrRow.orderSeq
      );
      // 次選：同訂單號的兄弟訂單（共享通用欄位如採購人員、單位、客戶品牌等）
      const siblingOrder = !extraSource
        ? storeOrders.find(o => o.orderNo === corrRow.orderNo)
        : undefined;

      const reconstructedId = Date.now() + Math.floor(Math.random() * 100000);
      const reconstructed: OrderRow = {
        // 若找到 extraCkOrders 完整資料，直接展開
        ...(extraSource ? { ...extraSource } : {}),
        // 兄弟訂單提供通用欄位（不覆蓋 extraSource 的值）
        ...(siblingOrder && !extraSource ? {
          orderType: siblingOrder.orderType,
          purchaser: siblingOrder.purchaser,
          comparePrice: siblingOrder.comparePrice,
          unit: siblingOrder.unit,
          currency: siblingOrder.currency,
          leadtime: siblingOrder.leadtime,
          customerBrand: siblingOrder.customerBrand,
          vendorMaterialNo: siblingOrder.vendorMaterialNo,
          specification: siblingOrder.specification,
          lineItemNote: siblingOrder.lineItemNote,
          internalNote: siblingOrder.internalNote,
          materialPOContent: siblingOrder.materialPOContent,
        } : {}),
        // 修正單本身的資料（最高優先，確保正確）
        id: reconstructedId,
        status: 'CK' as const,
        orderNo: corrRow.orderNo,
        orderDate: corrRow.orderDate,
        orderType: extraSource?.orderType || siblingOrder?.orderType || 'Z2QB',
        company: corrRow.company,
        purchaseOrg: corrRow.purchaseOrg,
        orderSeq: corrRow.orderSeq,
        docSeqNo: corrRow.orderNo + corrRow.orderSeq,
        orderQty: corrRow.orderQty ?? 0,
        acceptQty: corrRow.acceptQty ?? 0,
        vendorCode: corrRow.vendorCode,
        vendorName: corrRow.vendorName,
        materialNo: corrRow.materialNo ?? '',
        productName: corrRow.productName ?? '',
        specification: extraSource?.specification || siblingOrder?.specification || '',
        expectedDelivery: corrRow.expectedDelivery ?? corrRow.vendorDeliveryDate ?? '',
        vendorDeliveryDate: corrRow.vendorDeliveryDate ?? '',
        inTransitQty: corrRow.inTransitQty ?? 0,
        undeliveredQty: Math.max(0, (corrRow.orderQty ?? 0) - (corrRow.acceptQty ?? 0) - (corrRow.inTransitQty ?? 0)),
        deliveryQty: corrRow.deliveryQty ?? corrRow.orderQty ?? 0,
        agreedDate: corrRow.agreedDate ?? '',
      };
      addStoreOrder(reconstructed);
      addStoreOrderHistory(reconstructedId, {
        date: now,
        event: '訂單建立（由修正單拆單還原）',
        operator: '系統',
        remark: `原訂單 ${corrRow.orderNo}-${corrRow.orderSeq} 由修正單 ${corrRow.correctionDocNo} 拆單作業自動建立`,
      });
      origOrder = reconstructed;
    }

    // ── 拆單欄位對應表 ──────────────────────────────────────────────────────
    // 修正單拆單欄位        → 一般訂單欄位
    // ─────────────────────────────────────────
    // 訂單序號 (splitOrderSeq)        → orderSeq
    // 預計交期 (expectedDelivery)     → expectedDelivery
    // 新交貨量 (newQty)               → orderQty
    // 新廠商交期 (newVendorDate) → vendorDeliveryDate
    // 新料號 (splitNewMaterialNo)     → materialNo
    // 其餘欄位全部從原訂單同步

    // 第 1 筆：更新原訂單（orderSeq 不變）
    const first = rows[0];
    const firstQty = parseFloat(first.newQty) || origOrder.orderQty;
    const firstUpdate: Record<string, any> = {
      orderQty: firstQty,
      expectedDelivery: first.expectedDelivery || origOrder.expectedDelivery,
      vendorDeliveryDate: first.newVendorDate,
      adjustmentType: undefined,
      scheduleLines: [{ index: 1, expectedDelivery: first.expectedDelivery || origOrder.expectedDelivery, deliveryDate: first.newVendorDate, quantity: firstQty }],
    };
    if (first.splitNewMaterialNo && first.splitNewMaterialNo !== origOrder.materialNo) {
      firstUpdate.materialNo = first.splitNewMaterialNo;
    }
    updateStoreOrderFields(origOrder.id, firstUpdate);
    addStoreOrderHistory(origOrder.id, {
      date: now,
      event: '修正單拆單執行完成',
      operator: '系統',
      remark: `修正單 ${corrRow.correctionDocNo} 拆單執行，保留序號 ${first.splitOrderSeq || corrRow.orderSeq}，訂貨量 ${firstQty}`,
    });

    // 第 2 筆起：各自新增為獨立訂單（CK 狀態）
    // 僅覆蓋對應表中的 5 個欄位，其餘全部從原訂單同步
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r.deleted) continue;
      const newSeq = r.splitOrderSeq || String(parseInt(corrRow.orderSeq, 10) + i * 10);
      const qty = parseFloat(r.newQty) || 0;
      const newId = Date.now() + Math.floor(Math.random() * 100000) + i;

      const newOrder: OrderRow = {
        ...origOrder,                            // 其餘全部從原單同步
        id: newId,
        status: 'CK',
        orderSeq: newSeq,                        // 訂單序號
        docSeqNo: origOrder.orderNo + newSeq,
        expectedDelivery: r.expectedDelivery || origOrder.expectedDelivery,  // 預計交期
        orderQty: qty,                           // 新交貨量 → 訂貨量
        vendorDeliveryDate: r.newVendorDate,     // 新廠商交期 → 廠商可交貨日期
        adjustmentType: undefined,
        scheduleLines: [{ index: 1, expectedDelivery: r.expectedDelivery || origOrder.expectedDelivery, deliveryDate: r.newVendorDate, quantity: qty }],
        // 新料號 → 料號
        materialNo: (r.splitNewMaterialNo && r.splitNewMaterialNo !== origOrder.materialNo)
          ? r.splitNewMaterialNo
          : origOrder.materialNo,
      };

      addStoreOrder(newOrder);
      addStoreOrderHistory(newId, {
        date: now,
        event: '訂單成立（修正單拆單產生）',
        operator: '系統',
        remark: `由修正單 ${corrRow.correctionDocNo} 拆單產生，原訂單 ${corrRow.orderNo}-${corrRow.orderSeq}`,
      });
    }
  };

  // ── 不拆單修正單到達 CP 時，回寫原訂單欄位 ─────────────────────────────
  // 欄位對應（依圖說明）：
  //   新料號 (newMaterialNo)                → materialNo
  //   項次N-新廠商交期 (newVendorDate)      → scheduleLines[N].deliveryDate
  //   項次N-新交貨量 (newQty)              → scheduleLines[N].quantity
  //   訂貨量 (orderQty)                    → 所有有效項次 newQty 加總
  //   廠商可交貨日期 (vendorDeliveryDate)   → 最後一筆(最晚)項次的 newVendorDate
  const applyNonSplitCorrectionToOrder = (corrRow: CorrectionOrderRow) => {
    const now = nowDateStr();
    const rows = corrRow.savedDeliveryRows;

    // 找到原訂單
    let origOrder = storeOrders.find(
      o => o.orderNo === corrRow.orderNo && o.orderSeq === corrRow.orderSeq
    );
    if (!origOrder) {
      // 找不到時從修正單資料還原基本訂單並加入 store
      const extraSource = extraCkOrders.find(
        o => o.orderNo === corrRow.orderNo && o.orderSeq === corrRow.orderSeq
      );
      const siblingOrder = !extraSource
        ? storeOrders.find(o => o.orderNo === corrRow.orderNo)
        : undefined;
      const reconstructedId = Date.now() + Math.floor(Math.random() * 100000);
      const reconstructed: OrderRow = {
        ...(extraSource ? { ...extraSource } : {}),
        ...(siblingOrder && !extraSource ? {
          orderType: siblingOrder.orderType,
          purchaser: siblingOrder.purchaser,
          comparePrice: siblingOrder.comparePrice,
          unit: siblingOrder.unit,
          currency: siblingOrder.currency,
          leadtime: siblingOrder.leadtime,
          customerBrand: siblingOrder.customerBrand,
          vendorMaterialNo: siblingOrder.vendorMaterialNo,
          specification: siblingOrder.specification,
          lineItemNote: siblingOrder.lineItemNote,
          internalNote: siblingOrder.internalNote,
          materialPOContent: siblingOrder.materialPOContent,
        } : {}),
        id: reconstructedId,
        status: 'CK' as const,
        orderNo: corrRow.orderNo,
        orderDate: corrRow.orderDate,
        orderType: extraSource?.orderType || siblingOrder?.orderType || 'Z2QB',
        company: corrRow.company,
        purchaseOrg: corrRow.purchaseOrg,
        orderSeq: corrRow.orderSeq,
        docSeqNo: corrRow.orderNo + corrRow.orderSeq,
        orderQty: corrRow.orderQty ?? 0,
        acceptQty: corrRow.acceptQty ?? 0,
        vendorCode: corrRow.vendorCode,
        vendorName: corrRow.vendorName,
        materialNo: corrRow.materialNo ?? '',
        productName: corrRow.productName ?? '',
        specification: extraSource?.specification || siblingOrder?.specification || '',
        expectedDelivery: corrRow.expectedDelivery ?? corrRow.vendorDeliveryDate ?? '',
        vendorDeliveryDate: corrRow.vendorDeliveryDate ?? '',
        inTransitQty: corrRow.inTransitQty ?? 0,
        undeliveredQty: Math.max(0, (corrRow.orderQty ?? 0) - (corrRow.acceptQty ?? 0) - (corrRow.inTransitQty ?? 0)),
        deliveryQty: corrRow.deliveryQty ?? corrRow.orderQty ?? 0,
        agreedDate: corrRow.agreedDate ?? '',
      };
      addStoreOrder(reconstructed);
      addStoreOrderHistory(reconstructedId, {
        date: now,
        event: '訂單建立（由不拆單修正單還原）',
        operator: '系統',
        remark: `原訂單 ${corrRow.orderNo}-${corrRow.orderSeq} 由修正單 ${corrRow.correctionDocNo} 自動建立`,
      });
      origOrder = reconstructed;
    }

    // 建構新 scheduleLines（過濾已刪除的項次）
    const validRows = rows ? rows.filter(r => !r.deleted) : [];

    const updates: Record<string, any> = {};

    if (validRows.length > 0) {
      // scheduleLines：以修正單每筆項次的新廠商交期與新交貨量覆蓋
      const newScheduleLines = validRows.map((r, idx) => ({
        index: idx + 1,
        expectedDelivery: r.expectedDelivery || origOrder!.expectedDelivery,
        deliveryDate: r.newVendorDate,
        quantity: parseFloat(r.newQty) || 0,
      }));

      // orderQty = 所有有效項次 newQty 加總
      const totalQty = newScheduleLines.reduce((sum, l) => sum + l.quantity, 0);

      // vendorDeliveryDate = 最後一筆(最晚)項次的廠商交期
      const lastVendorDate = newScheduleLines[newScheduleLines.length - 1].deliveryDate;

      updates.scheduleLines = newScheduleLines;
      updates.orderQty = totalQty;
      updates.vendorDeliveryDate = lastVendorDate;
    }

    // 若修正單有新料號，覆蓋原訂單的料號
    if (corrRow.newMaterialNo && corrRow.newMaterialNo !== origOrder.materialNo) {
      updates.materialNo = corrRow.newMaterialNo;
    }

    if (Object.keys(updates).length > 0) {
      updateStoreOrderFields(origOrder.id, updates);
    }

    addStoreOrderHistory(origOrder.id, {
      date: now,
      event: '修正單回寫完成（不拆單）',
      operator: '系統',
      remark: '',
    });
  };

  const handleDetailApprove = () => {
    const row = detailRows[detailIndex];
    if (!row) return;
    // V → CP，B → CP（採購確認修正單）
    const newStatus = row.correctionStatus === 'V' ? 'CP'
      : row.correctionStatus === 'B' ? 'CP'
      : row.correctionStatus;

    if (newStatus === 'CP') {
      // 執行訂單回寫，然後直接推進 SS
      if (row.correctionType === '拆單' && row.savedDeliveryRows && row.savedDeliveryRows.length > 1) {
        // 拆單：執行拆單作業
        executeSplitFromCorrection(row);
      } else if (row.correctionType === '不拆單') {
        // 不拆單：回寫料號、scheduleLines、訂貨量、廠商可交貨日期
        applyNonSplitCorrectionToOrder(row);
      }
      // 訂單回寫後，修正單直接推進 SS（修正通過）
      updateCorrectionOrder(row.id, row.correctionDocNo, { correctionStatus: 'SS' });
      addCorrectionHistory(row.id, {
        date: nowDateStr(),
        event: '修正確認，資料已回寫原訂單 (→SS)',
        operator: operatorByRole(userRole as any),
        remark: `修正類型：${row.correctionType}`,
      });
      showToast(`修正確認完成（${row.correctionDocNo}），訂單已更新，狀態轉為 SS`);
    } else {
      if (newStatus !== row.correctionStatus) {
        updateCorrectionOrder(row.id, row.correctionDocNo, { correctionStatus: newStatus });
      }
      addCorrectionHistory(row.id, {
        date: nowDateStr(),
        event: `修正確認`,
        operator: operatorByRole(userRole as any),
        remark: '',
      });
      showToast(`修正確認完成（${row.correctionDocNo}），狀態轉為 ${newStatus}`);
    }

    if (detailRows.length <= 1) setDetailRows([]);
  };
  const handleDetailDisagree = (reason: string, adjustedRows?: { expectedDelivery: string; vendorOriginalDate: string; newVendorDate: string; originalQty: number; newQty: string; deleted?: boolean; splitNewMaterialNo?: string }[], newMaterialNo?: string) => {
    const row = detailRows[detailIndex];
    if (!row) return;
    // 狀態轉為 B（廠商不同意，待採購處理）
    const newStatus = 'B' as const;
    const updates: Partial<CorrectionOrderRow> = { correctionStatus: newStatus };
    // 若廠商變更了料號，將新料號寫入 newMaterialNo
    if (newMaterialNo) {
      updates.newMaterialNo = newMaterialNo;
    }
    // 若廠商選擇「調整交貨排程」，將廠商調整後的交貨排程寫入 savedDeliveryRows
    if (adjustedRows && adjustedRows.length > 0) {
      updates.savedDeliveryRows = adjustedRows.map(r => ({
        expectedDelivery: r.expectedDelivery,
        vendorOriginalDate: r.vendorOriginalDate,
        newVendorDate: r.newVendorDate,
        originalQty: r.originalQty,
        newQty: r.newQty,
        deleted: r.deleted,
        splitNewMaterialNo: r.splitNewMaterialNo,
      }));
      updates.savedPeriodInput = String(adjustedRows.filter(r => !r.deleted).length);
    }
    // 若此列來自 mock data（不在 store 中），先加入 store 再更新
    if (!correctionOrders.some(o => o.id === row.id)) {
      addCorrectionOrder({ ...row, ...updates });
    } else {
      updateCorrectionOrder(row.id, row.correctionDocNo, updates);
    }
    addCorrectionHistory(row.id, {
      date: nowDateStr(),
      event: '廠商調整修正單',
      operator: operatorByRole(userRole as any),
      remark: `調整原因：${reason}`,
    });
    showToast(`已提交調整修正單（${row.correctionDocNo}），狀態轉為 ${newStatus}`);
    if (detailRows.length <= 1) setDetailRows([]);
  };
  const handleDetailReturnToVendor = (reason: string) => {
    const row = detailRows[detailIndex];
    if (!row) return;
    // 狀態退回 V（廠商待確認）
    const newStatus = 'V' as const;
    const updates: Partial<CorrectionOrderRow> = { correctionStatus: newStatus };
    // 若此列來自 mock data（不在 store 中），先加入 store 再更新
    if (!correctionOrders.some(o => o.id === row.id)) {
      addCorrectionOrder({ ...row, ...updates });
    } else {
      updateCorrectionOrder(row.id, row.correctionDocNo, updates);
    }
    addCorrectionHistory(row.id, {
      date: nowDateStr(),
      event: `退回廠商`,
      operator: operatorByRole(userRole as any),
      remark: reason ? `退回原因：${reason}` : '',
    });
    showToast(`已退回廠商（${row.correctionDocNo}），狀態轉為 ${newStatus}`);
    if (detailRows.length <= 1) setDetailRows([]);
  };

  // B: 關閉單據（轉 CL）
  const handleDetailCloseToCL = () => {
    const row = detailRows[detailIndex];
    if (!row) return;
    const newStatus = 'CL' as const;
    const updates: Partial<CorrectionOrderRow> = { correctionStatus: newStatus };
    if (!correctionOrders.some(o => o.id === row.id)) {
      addCorrectionOrder({ ...row, ...updates });
    } else {
      updateCorrectionOrder(row.id, row.correctionDocNo, updates);
    }
    addCorrectionHistory(row.id, {
      date: nowDateStr(),
      event: `單據關閉`,
      operator: operatorByRole(userRole as any),
      remark: '',
    });
    showToast(`單據已關閉（${row.correctionDocNo}），狀態轉為 CL`);
    if (detailRows.length <= 1) setDetailRows([]);
  };

  // V: 採購抽單（V→B）
  const handleDetailWithdraw = () => {
    const row = detailRows[detailIndex];
    if (!row) return;
    const newStatus = 'B' as const;
    const updates: Partial<CorrectionOrderRow> = { correctionStatus: newStatus };
    if (!correctionOrders.some(o => o.id === row.id)) {
      addCorrectionOrder({ ...row, ...updates });
    } else {
      updateCorrectionOrder(row.id, row.correctionDocNo, updates);
    }
    addCorrectionHistory(row.id, {
      date: nowDateStr(),
      event: '抽單 (V→B)',
      operator: operatorByRole(userRole as any),
      remark: '',
    });
    showToast(`已抽單（${row.correctionDocNo}），狀態轉為 B`);
    if (detailRows.length <= 1) setDetailRows([]);
  };

  // ── 多張編輯時，組建每張訂單各自的初始資料 map ──────────────────────────
  const initialDataByOrderId = useMemo(() => {
    if (detailRows.length <= 1) return undefined;
    const map: Record<number, { newMaterialNo?: string; correctionNote?: string; savedDeliveryRows?: any[]; savedPeriodInput?: string }> = {};
    detailRows.forEach(r => {
      map[r.id] = {
        newMaterialNo: r.newMaterialNo,
        correctionNote: r.correctionNote,
        savedDeliveryRows: r.savedDeliveryRows,
        savedPeriodInput: r.savedPeriodInput,
      };
    });
    return map;
  }, [detailRows]);

  // ── 明細頁渲染（支援多張 1/x 導覽）──────────────────────────────────────
  if (detailRows.length > 0) {
    const currentRow = detailRows[detailIndex];
    const vm = getViewMode(currentRow.correctionStatus);
    const ordersForDetail = detailRows.map(r => correctionRowToOrderRow(r));
    const isDrEdit = currentRow.correctionStatus === 'DR';

    // ── 計算同訂單號下最高序號（用於拆單新項次序號計算）──────────────────
    const computeMaxSeqForOrder = (orderNo: string): number => {
      const seqs = storeOrders
        .filter(o => o.orderNo === orderNo)
        .map(o => parseInt(o.orderSeq, 10))
        .filter(n => !isNaN(n));
      // 也查 correctionOrders 中同 orderNo 的序號
      const corrSeqs = correctionOrders
        .filter(c => c.orderNo === orderNo)
        .map(c => parseInt(c.orderSeq, 10))
        .filter(n => !isNaN(n));
      const all = [...seqs, ...corrSeqs];
      return all.length > 0 ? Math.max(...all) : 0;
    };
    const maxSeqInSameOrderNo = computeMaxSeqForOrder(currentRow.orderNo);

    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col h-full w-full">
          <CorrectionDetailPage
            orders={ordersForDetail}
            currentIndex={detailIndex}
            correctionDocNo={currentRow.correctionDocNo}
            onBack={() => { setDetailRows([]); setDetailIndex(0); }}
            onIndexChange={setDetailIndex}
            viewMode={vm}
            isExistingDoc={true}
            initialNewMaterialNo={currentRow.newMaterialNo}
            initialCorrectionNote={currentRow.correctionNote}
            initialSavedDeliveryRows={currentRow.savedDeliveryRows}
            initialSavedPeriodInput={currentRow.savedPeriodInput}
            correctionType={currentRow.correctionType}
            correctionStatusCode={currentRow.correctionStatus}
            initialDataByOrderId={initialDataByOrderId}
            maxSeqInSameOrderNo={maxSeqInSameOrderNo}
            userRole={userRole as any}
            onSubmit={isDrEdit ? handleDetailSubmit : undefined}
            onSave={isDrEdit ? handleDetailSave : undefined}
            onApprove={handleDetailApprove}
            onDisagree={handleDetailDisagree}
            onReturnToVendor={handleDetailReturnToVendor}
            onCloseToCL={handleDetailCloseToCL}
            onWithdraw={handleDetailWithdraw}
          />
        </div>
        {toastMsg && (
          <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
            <div className="bg-[#1c252e] text-white rounded-[8px] px-[18px] py-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.18)]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] whitespace-nowrap">{toastMsg}</p>
            </div>
          </div>
        )}
      </DndProvider>
    );
  }

  const showToolbar = selectedIdsOnPage.size > 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

        {/* ── 歷史修正單提示橫幅 ────────────────────────────────────── */}
        {historyMode && (
          <div className="flex items-center gap-[8px] px-[20px] py-[10px] bg-[#fff7e6] border-b border-[#ffe4a0] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#d97706" />
            </svg>
            <p className="text-[13px] text-[#92400e]" style={{ fontFamily: "'Public_Sans:Medium',sans-serif" }}>
              本頁顯示 <strong>3 年以上</strong>（2022/12 以前）已確認（CK）或已關單（CL）的歷史修正單，僅供查詢，不提供編輯。
            </p>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="relative shrink-0 w-full">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-hidden">
              {activeTabs.map(t => (
                <TabItem
                  key={t.key}
                  tabDef={t}
                  count={t.key === 'ALL' ? undefined : counts[t.key]}
                  isActive={activeTab === t.key}
                  onClick={() => handleTabChange(t.key)}
                />
              ))}
              <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
            </div>
          </div>
        </div>

        {/* ── 搜尋列 ───────────────────────────────────────────────────── */}
        <div className="flex gap-[16px] items-center px-[20px] py-[20px] shrink-0">
          <SearchField label="單號序號" value={orderNoSearch} onChange={(v) => { setOrderNoSearch(v); setPage(1); }} />
          <SearchField label="修正單號" value={correctionDocNoSearch} onChange={(v) => { setCorrectionDocNoSearch(v); setPage(1); }} />
          <DropdownSelect
            label="修正類型"
            value={correctionTypeSearch}
            onChange={(v) => { setCorrectionTypeSearch(v); setPage(1); }}
            options={correctionTypeOptions}
            searchable
          />
        </div>

        {/* ── Toolbar (Columns / Filters / Export) ────────────────────── */}
        <TableToolbar
          resultsCount={totalItems}
          showColumnSelector={showColumnSelector}
          showFilterDialog={showFilterDialog}
          onColumnsClick={handleColumnsClick}
          onFiltersClick={handleFiltersClick}
          columnsButton={
            <ColumnSelector
              columns={tempColumns}
              onToggleColumn={handleToggleColumn}
              onToggleAll={handleToggleAll}
              onClose={() => setShowColumnSelector(false)}
              onApply={handleApplyColumns}
            />
          }
          filtersButton={
            <FilterDialog
              filters={filters}
              availableColumns={filterColumnOptions}
              onFiltersChange={setFilters}
              onClose={() => setShowFilterDialog(false)}
              onApply={handleApplyFilters}
            />
          }
          onExportExcel={handleExportExcel}
          onExportCsv={handleExportCsv}
        />

        {/* ── 選取工具列（scroll 容器外，保持全寬不被推出畫面） ─────── */}
        {showToolbar && (
          <div className="shrink-0">
            <SelectionToolbar
              selectedCount={selectedIdsOnPage.size}
              isAllSelected={isAllSelected}
              onToggleAll={toggleAll}
              activeTab={activeTab}
              canView={selectedIdsOnPage.size >= 1}
              onView={handleView}
              onBulkSubmit={handleBulkSubmit}
              onEdit={handleBulkEdit}
              canEdit={selectedIdsOnPage.size >= 1}
              onDelete={handleBulkDelete}
              onBulkAgree={handleBulkAgree}
              onBulkConfirm={handleBulkConfirm}
            />
          </div>
        )}

        {/* ── 進階表格 ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <div style={{ minWidth: `${totalWidth}px` }}>

              {/* 表頭（恆常顯示欄位標題，工具列已獨立至 scroll 外） */}
              <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
                <>
                  {/* Checkbox header */}
                  <div className="bg-[#f4f6f8] shrink-0 w-[56px] flex items-center justify-center border-r border-[rgba(145,158,171,0.08)]" style={stickyCheckboxStyle}>
                    <CheckboxIcon checked={isAllSelected} onClick={toggleAll} />
                  </div>
                  {/* 修正單號 header — 支援欄寬拖曳調整 */}
                  <Resizable
                    size={{ width: docNoWidth, height: 56 }}
                    minWidth={80}
                    maxWidth={400}
                    enable={{ right: true }}
                    onResizeStop={(_e, _dir, _ref, d) => setDocNoWidth(prev => prev + d.width)}
                    handleStyles={{ right: { width: '4px', right: '0', cursor: 'col-resize', background: 'transparent', zIndex: 1 } }}
                    handleClasses={{ right: 'hover:bg-[#1D7BF5] transition-colors' }}
                    className="bg-[#f4f6f8] border-r border-[rgba(145,158,171,0.08)] shrink-0"
                    style={stickyDocNoStyle}
                  >
                    <div
                      className="h-full flex items-center justify-start px-[16px] cursor-pointer select-none"
                      onClick={() => handleSort('correctionDocNo')}
                    >
                      <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[24px] text-[#637381] text-[14px] whitespace-nowrap">
                        修正單號
                      </p>
                      {sortConfig.key === 'correctionDocNo' && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[6px] shrink-0">
                          {sortConfig.direction === 'asc'
                            ? <path d="M8 3L12 7H4L8 3Z" fill="#637381" />
                            : <path d="M8 13L4 9H12L8 13Z" fill="#637381" />}
                        </svg>
                      )}
                    </div>
                  </Resizable>
                  {visibleColumns.map((col, idx) => (
                    <DraggableColumnHeader
                      key={col.key}
                      column={col}
                      index={idx}
                      moveColumn={moveColumn}
                      updateColumnWidth={updateColumnWidth}
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      isLast={idx === visibleColumns.length - 1}
                    />
                  ))}
                  <div className="flex-1 bg-[#f4f6f8] min-w-0" />
                </>
              </div>

              {/* 資料列 */}
              {paginatedOrders.map(row => (
                <div
                  key={row.correctionDocNo || `order-${row.id}`}
                  className={`flex border-b border-[rgba(145,158,171,0.08)] h-[76px] hover:bg-[rgba(145,158,171,0.04)] group transition-colors ${selectedIds.has(row.id) ? 'bg-[rgba(0,94,184,0.04)]' : ''}`}
                >
                  {/* Checkbox */}
                  <div
                    className="shrink-0 w-[56px] flex items-center justify-center border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                    style={stickyCheckboxStyle}
                  >
                    <CheckboxIcon checked={selectedIds.has(row.id)} onClick={() => toggleId(row.id)} />
                  </div>
                  {/* 修正單號 */}
                  <div
                    className="shrink-0 flex items-center justify-start px-[16px] border-r border-[rgba(145,158,171,0.08)] bg-white group-hover:bg-[#f6f7f8]"
                    style={stickyDocNoStyle}
                  >
                    <button
                      className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] text-[#1677ff] underline hover:text-[#0958d9] cursor-pointer truncate text-left"
                      title={row.correctionDocNo}
                      onClick={() => { setDetailRows([row]); setDetailIndex(0); }}
                    >
                      {row.correctionDocNo || '—'}
                    </button>
                    {/* CP 頁籤：轉 SS 測試按鈕 */}
                    {activeTab === 'CP' && row.correctionStatus === 'CP' && (() => {
                      const isDeleteOrder = row.correctionType === '刪單';
                      const targetStatus = isDeleteOrder ? 'CL' : 'SS';
                      const targetLabel = isDeleteOrder ? '轉CL' : '轉SS';
                      return (
                        <button
                          className="ml-[6px] shrink-0 px-[6px] py-[1px] rounded-[4px] bg-[#005eb8] text-white text-[11px] leading-[18px] hover:bg-[#004a93] cursor-pointer whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            const isMock = !correctionOrders.some(o => o.id === row.id);
                            if (isMock) {
                              addCorrectionOrder({ ...row, correctionStatus: targetStatus });
                              setDeletedMockIds(prev => new Set([...prev, row.id]));
                            } else {
                              updateCorrectionOrder(row.id, row.correctionDocNo, { correctionStatus: targetStatus });
                            }
                            addCorrectionHistory(row.id, {
                              date: nowDateStr(),
                              event: `測試轉 ${targetStatus}`,
                              operator: operatorByRole(userRole as any),
                              remark: '手動測試轉換',
                            });
                            if (!isDeleteOrder && row.correctionType === '拆單' && row.savedDeliveryRows && row.savedDeliveryRows.length > 1) {
                              executeSplitFromCorrection({ ...row, correctionStatus: 'SS' });
                            }
                            showToast(`${row.correctionDocNo} 已轉為 ${targetStatus} 狀態`);
                          }}
                        >
                          {targetLabel}
                        </button>
                      );
                    })()}
                  </div>
                  {visibleColumns.map((col, colIdx) => {
                    const isLastCol = colIdx === visibleColumns.length - 1;
                    return (
                      <div
                        key={`${row.id}-${col.key}`}
                        style={isLastCol ? { minWidth: col.width, flex: 1 } : { width: col.width }}
                        className={`flex items-center justify-start px-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} overflow-hidden`}
                      >
                        {getCellValue(row, col.key)}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* 空資料提示 */}
              {paginatedOrders.length === 0 && (
                <div className="flex items-center justify-center py-[60px]">
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">
                    尚無修正單資料
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 分頁 ─────────────────────────────────────────────────────── */}
        <div className="shrink-0">
          <PaginationControls
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onPageChange={setPage}
            onItemsPerPageChange={(v) => { setPerPage(v); setPage(1); }}
          />
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
          <div className="bg-[#1c252e] text-white rounded-[8px] px-[18px] py-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.18)]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] whitespace-nowrap">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* ── 批次刪除確認對話框 ───────────────────────────────────────────── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center" style={{ background: 'rgba(28,37,46,0.48)' }}>
          <div className="bg-white rounded-[16px] shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.24)] w-[400px] max-w-[90vw] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px]">
              <div className="flex items-center gap-[12px]">
                {/* 警告 icon */}
                <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[rgba(255,86,48,0.12)] shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L18.66 17H1.34L10 2Z" stroke="#ff5630" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                    <path d="M10 8V11" stroke="#ff5630" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="14" r="0.75" fill="#ff5630" />
                  </svg>
                </div>
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1c252e]">
                  確認批次刪除
                </p>
              </div>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex items-center justify-center w-[32px] h-[32px] rounded-full hover:bg-[rgba(145,158,171,0.08)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-[24px] pb-[8px]">
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#637381]">
                您即將刪除已選取的
                <span className="font-semibold text-[#1c252e] mx-[4px]">{selectedIdsOnPage.size}</span>
                張修正單，此操作無法復原。
              </p>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#ff5630] mt-[8px]">
                請確認您已了解刪除後資料將無法恢復。
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-[12px] px-[24px] py-[20px]">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-[40px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
              >
                <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] leading-[24px] text-[#1c252e]">取消</span>
              </button>
              <button
                onClick={executeBulkDelete}
                className="h-[40px] px-[16px] rounded-[8px] bg-[#ff5630] hover:bg-[#e04020] transition-colors"
              >
                <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] leading-[24px] text-white">確認刪除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
}
