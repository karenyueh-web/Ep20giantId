import { useState } from 'react';
import { OrderDetail } from './OrderDetail';
import { AdvancedOrderTable, getOrderColumns } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn } from './AdvancedOrderTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { exportOrdersCsv, exportOrdersExcel } from './OrderCsvManager';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';

// ── 訂單類型選項（含全部）────────────────────────────────────────────────────
const ORDER_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'ZOR',  label: 'ZOR　一般採購訂單' },
  { value: 'ZNB',  label: 'ZNB　國內採購' },
  { value: 'Z1JB', label: 'Z1JB　退貨一般品' },
  { value: 'Z1JD', label: 'Z1JD　退貨瑕疵品' },
  { value: 'Z3TB', label: 'Z3TB　換貨一般品' },
  { value: 'Z3TD', label: 'Z3TD　換貨瑕疵品' },
];

// ── 歷史訂單 Mock Data：全部 CL、3年以上（≤ 2023/02）、全訂單類型 ──────────
export const historyOrderMockData: OrderRow[] = [
  // ── ZOR（一般採購訂單）──────────────────────────────────────────────────
  {
    id: 9001, status: 'CL', vendorName: '速聯國際(00010046)', orderDate: '2022/11/05', expectedDelivery: '2023/01/10',
    orderNo: '400100201', orderSeq: '10', materialNo: '2201-FRM0046-H01', orderQty: 120, acceptQty: 120,
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 0, statisticalDeliveryDate: '2023/01/10',
    gbdOrderNo: 'GBD-HIS-2022-0201', docSeqNo: 'H201', specification: 'TCR ADVANCED SL DISC FRAME M CARBON/RED',
    orderType: 'ZOR', productName: '公路車架(一般採購)'
  },
  {
    id: 9002, status: 'CL', vendorName: '佳承精密(00010045)', orderDate: '2022/09/20', expectedDelivery: '2022/11/30',
    orderNo: '400100202', orderSeq: '20', materialNo: '3301-WHL0045-H02', orderQty: 80, acceptQty: 80,
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 0, statisticalDeliveryDate: '2022/11/30',
    gbdOrderNo: 'GBD-HIS-2022-0202', docSeqNo: 'H202', specification: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100',
    orderType: 'ZOR', productName: '輪組前輪(一般採購)'
  },
  {
    id: 9003, status: 'CL', vendorName: '久廣精密(00010053)', orderDate: '2022/07/14', expectedDelivery: '2022/09/20',
    orderNo: '400100203', orderSeq: '30', materialNo: '4401-STM0053-H03', orderQty: 200, acceptQty: 200,
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 0, statisticalDeliveryDate: '2022/09/20',
    gbdOrderNo: 'GBD-HIS-2022-0203', docSeqNo: 'H203', specification: 'CONTACT SL OD2 STEM 110MM -6DEG',
    orderType: 'ZOR', productName: '鋁合金龍頭(一般採購)'
  },
  {
    id: 9004, status: 'CL', vendorName: '金盛元工業(00010059)', orderDate: '2021/12/01', expectedDelivery: '2022/02/10',
    orderNo: '400100204', orderSeq: '40', materialNo: '5501-BRK0059-H04', orderQty: 300, acceptQty: 300,
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 0, statisticalDeliveryDate: '2022/02/10',
    gbdOrderNo: 'GBD-HIS-2021-0204', docSeqNo: 'H204', specification: 'SHIMANO BR-R9270 DURA-ACE CALIPER FRONT',
    orderType: 'ZOR', productName: '碟煞卡鉗前(一般採購)'
  },

  // ── ZNB（國內採購）─────────────────────────────────────────────────────
  {
    id: 9005, status: 'CL', vendorName: '台灣製造(00010012)', orderDate: '2022/10/15', expectedDelivery: '2022/12/20',
    orderNo: '400200205', orderSeq: '10', materialNo: '6601-CRK0012-H05', orderQty: 150, acceptQty: 150,
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 0, statisticalDeliveryDate: '2022/12/20',
    gbdOrderNo: 'GBD-HIS-2022-0205', docSeqNo: 'H205', specification: 'SHIMANO FC-R9200 DURA-ACE 52/36T 170MM',
    orderType: 'ZNB', productName: '牙盤組(國內採購)'
  },
  {
    id: 9006, status: 'CL', vendorName: '速聯國際(00010046)', orderDate: '2021/08/22', expectedDelivery: '2021/10/30',
    orderNo: '400200206', orderSeq: '20', materialNo: '7701-CST0046-H06', orderQty: 500, acceptQty: 500,
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 0, statisticalDeliveryDate: '2021/10/30',
    gbdOrderNo: 'GBD-HIS-2021-0206', docSeqNo: 'H206', specification: 'SHIMANO CS-R9200 12-SPEED 11-34T',
    orderType: 'ZNB', productName: '飛輪(國內採購)'
  },
  {
    id: 9007, status: 'CL', vendorName: '佳承精密(00010045)', orderDate: '2020/06/10', expectedDelivery: '2020/08/15',
    orderNo: '400200207', orderSeq: '30', materialNo: '8801-TIR0045-H07', orderQty: 1000, acceptQty: 1000,
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 0, statisticalDeliveryDate: '2020/08/15',
    gbdOrderNo: 'GBD-HIS-2020-0207', docSeqNo: 'H207', specification: 'GAVIA FONDO 1 700X28C TUBELESS READY',
    orderType: 'ZNB', productName: '外胎(國內採購)'
  },

  // ── Z1JB（退貨一般品）──────────────────────────────────────────────────
  {
    id: 9008, status: 'CL', vendorName: '久廣精密(00010053)', orderDate: '2022/05/18', expectedDelivery: '2022/07/20',
    orderNo: '500600208', orderSeq: '10', materialNo: '9901-HDL0053-H08', orderQty: 45, acceptQty: 45,
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 0, statisticalDeliveryDate: '2022/07/20',
    gbdOrderNo: 'GBD-HIS-2022-0208', docSeqNo: 'H208', specification: 'CONTACT SLR OD2 HANDLEBAR 440MM 退貨',
    orderType: 'Z1JB', productName: '鋁合金把手(退貨)'
  },
  {
    id: 9009, status: 'CL', vendorName: '金盛元工業(00010059)', orderDate: '2021/11/02', expectedDelivery: '2022/01/08',
    orderNo: '500600209', orderSeq: '20', materialNo: '1129-SAD0059-H09', orderQty: 60, acceptQty: 60,
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 0, statisticalDeliveryDate: '2022/01/08',
    gbdOrderNo: 'GBD-HIS-2021-0209', docSeqNo: 'H209', specification: 'FLEET SLR SADDLE 155MM CARBON RAIL 退貨',
    orderType: 'Z1JB', productName: '競賽坐墊(退貨)'
  },
  {
    id: 9010, status: 'CL', vendorName: '台灣製造(00010012)', orderDate: '2020/03/25', expectedDelivery: '2020/05/30',
    orderNo: '500600210', orderSeq: '30', materialNo: '2201-PED0012-H10', orderQty: 200, acceptQty: 200,
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 0, statisticalDeliveryDate: '2020/05/30',
    gbdOrderNo: 'GBD-HIS-2020-0210', docSeqNo: 'H210', specification: 'LOOK KEO 2 MAX PEDAL 退貨',
    orderType: 'Z1JB', productName: '競速踏板(退貨)'
  },

  // ── Z1JD（退貨瑕疵品）──────────────────────────────────────────────────
  {
    id: 9011, status: 'CL', vendorName: '速聯國際(00010046)', orderDate: '2022/08/11', expectedDelivery: '2022/10/15',
    orderNo: '500600211', orderSeq: '10', materialNo: '3301-FRK0046-H11', orderQty: 30, acceptQty: 30,
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 0, statisticalDeliveryDate: '2022/10/15',
    gbdOrderNo: 'GBD-HIS-2022-0211', docSeqNo: 'H211', specification: 'PROPEL ADVANCED PRO FORK CARBON STEERER 瑕疵品退貨',
    orderType: 'Z1JD', productName: '碳纖維前叉(瑕疵退)'
  },
  {
    id: 9012, status: 'CL', vendorName: '佳承精密(00010045)', orderDate: '2021/04/16', expectedDelivery: '2021/06/20',
    orderNo: '500600212', orderSeq: '20', materialNo: '4401-DRL0045-H12', orderQty: 80, acceptQty: 80,
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 0, statisticalDeliveryDate: '2021/06/20',
    gbdOrderNo: 'GBD-HIS-2021-0212', docSeqNo: 'H212', specification: 'SHIMANO RD-R9250 Di2 12-SPEED 瑕疵品退貨',
    orderType: 'Z1JD', productName: '後變速器Di2(瑕疵退)'
  },

  // ── Z3TB（換貨一般品）──────────────────────────────────────────────────
  {
    id: 9013, status: 'CL', vendorName: '久廣精密(00010053)', orderDate: '2022/06/28', expectedDelivery: '2022/09/05',
    orderNo: '500700213', orderSeq: '10', materialNo: '5501-WHL0053-H13', orderQty: 20, acceptQty: 20,
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 0, statisticalDeliveryDate: '2022/09/05',
    gbdOrderNo: 'GBD-HIS-2022-0213', docSeqNo: 'H213', specification: 'SLR 0 CARBON 65 WHEELSYSTEM REAR 12X142 換貨',
    orderType: 'Z3TB', productName: '碳纖維輪組後輪(換貨)'
  },
  {
    id: 9014, status: 'CL', vendorName: '金盛元工業(00010059)', orderDate: '2021/09/03', expectedDelivery: '2021/11/10',
    orderNo: '500700214', orderSeq: '20', materialNo: '6601-CHN0059-H14', orderQty: 500, acceptQty: 500,
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 0, statisticalDeliveryDate: '2021/11/10',
    gbdOrderNo: 'GBD-HIS-2021-0214', docSeqNo: 'H214', specification: 'SHIMANO CN-M9100 12-SPEED CHAIN 換貨',
    orderType: 'Z3TB', productName: '12速鏈條(換貨)'
  },
  {
    id: 9015, status: 'CL', vendorName: '台灣製造(00010012)', orderDate: '2020/01/20', expectedDelivery: '2020/03/25',
    orderNo: '500700215', orderSeq: '30', materialNo: '7701-HDL0012-H15', orderQty: 100, acceptQty: 100,
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 0, statisticalDeliveryDate: '2020/03/25',
    gbdOrderNo: 'GBD-HIS-2020-0215', docSeqNo: 'H215', specification: 'CONTACT SLR OD2 HANDLEBAR 400MM 換貨',
    orderType: 'Z3TB', productName: '鋁合金把手(換貨)'
  },

  // ── Z3TD（換貨瑕疵品）──────────────────────────────────────────────────
  {
    id: 9016, status: 'CL', vendorName: '速聯國際(00010046)', orderDate: '2022/12/08', expectedDelivery: '2023/02/15',
    orderNo: '500700216', orderSeq: '10', materialNo: '8801-FRM0046-H16', orderQty: 8, acceptQty: 8,
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 0, statisticalDeliveryDate: '2023/02/15',
    gbdOrderNo: 'GBD-HIS-2022-0216', docSeqNo: 'H216', specification: 'TCR ADVANCED SL FRAME S CARBON/BLACK 瑕疵品換貨',
    orderType: 'Z3TD', productName: '公路車架(瑕疵換)'
  },
  {
    id: 9017, status: 'CL', vendorName: '佳承精密(00010045)', orderDate: '2021/07/19', expectedDelivery: '2021/09/25',
    orderNo: '500700217', orderSeq: '20', materialNo: '9901-BRK0045-H17', orderQty: 40, acceptQty: 40,
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 0, statisticalDeliveryDate: '2021/09/25',
    gbdOrderNo: 'GBD-HIS-2021-0217', docSeqNo: 'H217', specification: 'SHIMANO BR-M9120 SAINT CALIPER SET 瑕疵品換貨',
    orderType: 'Z3TD', productName: '山地煞車組(瑕疵換)'
  },
  {
    id: 9018, status: 'CL', vendorName: '久廣精密(00010053)', orderDate: '2019/11/14', expectedDelivery: '2020/01/20',
    orderNo: '500700218', orderSeq: '30', materialNo: '1129-GRP0053-H18', orderQty: 300, acceptQty: 300,
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 0, statisticalDeliveryDate: '2020/01/20',
    gbdOrderNo: 'GBD-HIS-2019-0218', docSeqNo: 'H218', specification: 'STRATUS LITE GRIP 130MM BLACK 瑕疵品換貨',
    orderType: 'Z3TD', productName: '握把套(瑕疵換)'
  },
];

// ── Tab 組件（歷史只有一個 CL tab）────────────────────────────────────────────
interface TabItemProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

function TabItem({ label, count, isActive, onClick }: TabItemProps) {
  const badgeStyle = { bgColor: 'bg-[rgba(145,158,171,0.16)]', textColor: 'text-[#637381]' };
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
      {count !== undefined && (
        <div className={`${badgeStyle.bgColor} content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 ${badgeStyle.textColor} text-[12px] text-center`}>
            {count}
          </p>
        </div>
      )}
    </div>
  );
}

// ── 唯讀標示徽章 ──────────────────────────────────────────────────────────────
function ReadOnlyBadge() {
  return (
    <div className="flex items-center gap-[6px] px-[10px] py-[4px] rounded-[6px] bg-[rgba(145,158,171,0.12)] border border-[rgba(145,158,171,0.24)]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#637381"/>
      </svg>
      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] whitespace-nowrap">
        僅供查詢（3年以上 CL）
      </span>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export function HistoryOrderListWithTabs() {
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns] = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion] = useState(0);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  // 搜尋欄位
  const [docSeqNoSearch, setDocSeqNoSearch] = useState('');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [orderNoSearch, setOrderNoSearch] = useState('');
  const [orderTypeSearch, setOrderTypeSearch] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentUserEmail] = useState<string>(() =>
    localStorage.getItem('currentUserEmail') || 'default'
  );

  // 多關鍵字搜尋輔助
  const splitKeywords = (input: string): string[] =>
    input.split(/[、,，]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  const matchesAnyKeyword = (value: string, keywords: string[]): boolean =>
    keywords.some(kw => value.toLowerCase().includes(kw));

  const getFilteredData = (): OrderRow[] => {
    let data = historyOrderMockData;
    // 搜尋列：單號序號
    if (docSeqNoSearch.trim()) {
      const keywords = splitKeywords(docSeqNoSearch);
      data = data.filter(o => matchesAnyKeyword((o.orderNo || '') + (o.orderSeq || ''), keywords));
    }
    // 搜尋列：訂單號碼
    if (orderNoSearch.trim()) {
      const keywords = splitKeywords(orderNoSearch);
      data = data.filter(o => matchesAnyKeyword(o.orderNo || '', keywords));
    }
    // 搜尋列：訂單日期區間
    if (orderDateFrom.trim()) {
      const from = orderDateFrom.trim().replace(/-/g, '/');
      data = data.filter(o => o.orderDate >= from);
    }
    if (orderDateTo.trim()) {
      const to = orderDateTo.trim().replace(/-/g, '/');
      data = data.filter(o => o.orderDate <= to);
    }
    // 搜尋列：訂單類型
    if (orderTypeSearch.trim()) {
      data = data.filter(o => o.orderType.toLowerCase().includes(orderTypeSearch.trim().toLowerCase()));
    }
    // 進階篩選
    if (appliedFilters.length > 0) {
      data = data.filter(item =>
        appliedFilters.every(filter => {
          const itemValue = item[filter.column as keyof OrderRow];
          const filterValue = filter.value;
          switch (filter.operator) {
            case 'contains':   return itemValue !== undefined && String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
            case 'equals':     return itemValue !== undefined && String(itemValue).toLowerCase() === filterValue.toLowerCase();
            case 'notEquals':  return itemValue === undefined || String(itemValue).toLowerCase() !== filterValue.toLowerCase();
            case 'startsWith': return itemValue !== undefined && String(itemValue).toLowerCase().startsWith(filterValue.toLowerCase());
            case 'endsWith':   return itemValue !== undefined && String(itemValue).toLowerCase().endsWith(filterValue.toLowerCase());
            case 'isEmpty':    return !itemValue || String(itemValue).trim() === '';
            case 'isNotEmpty': return itemValue !== undefined && String(itemValue).trim() !== '';
            default:           return true;
          }
        })
      );
    }
    return data;
  };

  const handleMoreOptionsClick = (order: OrderRow) => {
    setSelectedOrder(order); setShowOrderDetail(true);
  };
  const handleCloseDetail = () => { setShowOrderDetail(false); setSelectedOrder(null); };

  const handleColumnsChange = (columns: OrderColumn[]) => setAvailableColumns(columns);

  const handleToggleColumn = (key: string) =>
    setTempColumns(tempColumns.map(col => col.key === key ? { ...col, visible: !(col.visible !== false) } : col));

  const handleToggleAll = (selectAll: boolean) =>
    setTempColumns(tempColumns.map(col => ({ ...col, visible: selectAll })));

  const handleApplyColumns = () => {
    const storageKey = `historyOrderList_${currentUserEmail}_CL_columns`;
    try { localStorage.setItem(storageKey, JSON.stringify(tempColumns)); } catch { /* */ }
    setAvailableColumns(tempColumns);
    setColumnsVersion(prev => prev + 1);
    setShowColumnSelector(false);
  };

  const handleColumnsClick = () => {
    let cols = availableColumns;
    if (cols.length === 0) {
      const storageKey = `historyOrderList_${currentUserEmail}_CL_columns`;
      try { const saved = localStorage.getItem(storageKey); cols = saved ? JSON.parse(saved) : getOrderColumns(); }
      catch { cols = getOrderColumns(); }
    }
    setTempColumns(JSON.parse(JSON.stringify(cols)));
    setShowColumnSelector(!showColumnSelector);
  };

  const handleApplyFilters = () => { setAppliedFilters(filters); setShowFilterDialog(false); };

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const getExportData = () => ({
    data: filteredData,
    cols: availableColumns.length > 0 ? availableColumns : getOrderColumns(),
    dateSuffix: new Date().toISOString().slice(0, 10),
  });

  const handleExportExcel = () => {
    const { data, cols, dateSuffix } = getExportData();
    const count = exportOrdersExcel(data, `歷史訂單匯出_CL_${dateSuffix}.xlsx`, cols);
    showToast(`已匯出 ${count} 筆歷史訂單 (Excel)`);
  };

  const handleExportCsv = () => {
    const { data, cols, dateSuffix } = getExportData();
    exportOrdersCsv(data, `歷史訂單匯出_CL_${dateSuffix}.csv`, cols);
    showToast(`已匯出 ${data.length} 筆歷史訂單 (CSV)`);
  };

  // 歷史頁面永遠是 read-only，點擊訂單確認按鈕也只開 read-only detail
  const handleOrderConfirmClick = (order: OrderRow) => {
    setSelectedOrder(order); setShowOrderDetail(true);
  };

  // OrderDetail 全頁 view（永遠 isReadOnly）
  if (showOrderDetail) {
    return (
      <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">
        <OrderDetail
          onClose={handleCloseDetail}
          orderData={selectedOrder ? {
            orderNo: selectedOrder.orderNo, orderSeq: selectedOrder.orderSeq,
            vendor: selectedOrder.vendorName, status: selectedOrder.status,
            orderQty: selectedOrder.orderQty,
            comparePrice: selectedOrder.comparePrice,
            unit: selectedOrder.unit,
            acceptQty: selectedOrder.acceptQty,
          } : undefined}
          onConfirm={handleCloseDetail}
          isReadOnly={true}
        />
      </div>
    );
  }

  const filteredData = getFilteredData();
  const filteredCount = filteredData.length;

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 w-full">
        <div className="flex gap-[16px] items-end flex-wrap pl-[20px] pr-[20px] pt-[20px] pb-[16px]">
          <SearchField label="單號序號"     value={docSeqNoSearch}  onChange={setDocSeqNoSearch} />
          <SearchField label="訂單日期(起)" value={orderDateFrom}   onChange={setOrderDateFrom} type="date" />
          <SearchField label="訂單日期(迄)" value={orderDateTo}     onChange={setOrderDateTo}   type="date" />
          <SearchField label="訂單號碼"     value={orderNoSearch}   onChange={setOrderNoSearch} />
          {/* 訂單類型 Dropdown with searcher */}
          <div className="flex-1 min-w-[180px]">
            <DropdownSelect
              label="訂單類型"
              value={orderTypeSearch}
              onChange={setOrderTypeSearch}
              options={ORDER_TYPE_OPTIONS}
              placeholder="全部"
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={filteredCount}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={() => setShowFilterDialog(!showFilterDialog)}
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
            availableColumns={availableColumns.length > 0 ? availableColumns : getOrderColumns()}
            onFiltersChange={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onApply={handleApplyFilters}
          />
        }
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        actionButton={
          <div className="flex items-center gap-[12px]">
          </div>
        }
      />

      {/* ── Table（永遠帶 activeTab='ALL'，資料已預先過濾為全 CL）───────────── */}
      <AdvancedOrderTable
        activeTab="ALL"
        data={filteredData}
        onOrderConfirm={handleOrderConfirmClick}
        onMoreOptions={handleMoreOptionsClick}
        userEmail={currentUserEmail}
        onColumnsChange={handleColumnsChange}
        columnsVersion={columnsVersion}
        appliedFilters={appliedFilters}
        selectedOrderIds={new Set()}
        onToggleOrder={() => {}}
        onSelectAll={() => {}}
        onBatchAction={() => {}}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.5-10.5l-5 5L6 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}