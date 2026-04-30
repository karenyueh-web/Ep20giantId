import { useState, useMemo, useCallback, useRef } from 'react';
import { AdvancedOrderTable, defaultOrderColumns, getOrderColumns, computeRowDayDiff } from './AdvancedOrderTable';
import type { OrderRow, OrderColumn } from './AdvancedOrderTable';
import { TableToolbar } from './TableToolbar';
import { ColumnSelector } from './ColumnSelector';
import { FilterDialog, type FilterCondition } from './FilterDialog';
import { SearchField } from './SearchField';
import { CsvToolbarButtons, BatchCorrectionCombinedImportOverlay, exportOrdersExcel, exportOrdersCsv, exportBatchCorrectionAdjustTemplate, exportBatchCorrectionSplitTemplate, type CorrectionAdjustImportResult, type CorrectionSplitImportResult, type ExportType } from './OrderCsvManager';
import { useOrderStore } from './OrderStoreContext';
import { nowDateStr, operatorByRole } from './OrderStoreContext';
import type { CorrectionOrderRow } from './OrderStoreContext';
import { CorrectionDetailPage } from './CorrectionDetailPage';
import type { CorrectionFormData } from './CorrectionDetailPage';

// ── 額外的 CK 修正單 Mock Data ─────────────────────────────────────────────────
export const extraCkOrders: OrderRow[] = [
  {
    id: 9001, status: 'CK', vendorDeliveryDate: '2025/05/10',
    orderNo: '400649801', orderDate: '2025/03/05', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '10', docSeqNo: '400649801010',
    purchaser: '王大明', orderQty: 300, acceptQty: 300, comparePrice: '45', unit: 'PCS', currency: 'TWD',
    leadtime: 5, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '2101-CHN0099-A01', customerBrand: 'G01', vendorMaterialNo: 'CN-M8100-12SPD',
    productName: '12速鏈條', specification: 'SHIMANO CN-M8100 12-SPEED CHAIN',
    expectedDelivery: '2025/05/08', deliveryQty: 300,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '13500', agreedDate: '2025/05/10',
    internalNote: '', materialPOContent: '',
  },
  {
    id: 9002, status: 'CK', vendorDeliveryDate: '2025/05/15',
    orderNo: '400649802', orderDate: '2025/03/08', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '20', docSeqNo: '400649802020',
    purchaser: '李玉霞', orderQty: 150, acceptQty: 150, comparePrice: '1200', unit: 'SET', currency: 'TWD',
    leadtime: 10, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '3301-FRK0055-B01', customerBrand: 'G02', vendorMaterialNo: 'FK901-D-CF',
    productName: '碳纖維前叉-D型', specification: 'DEFY ADV 2 SL DISC FRAME ML CARBON/WHITE',
    expectedDelivery: '2025/05/12', deliveryQty: 150,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '180000', agreedDate: '2025/05/15',
    internalNote: '', materialPOContent: '',
  },
  {
    id: 9003, status: 'CK', vendorDeliveryDate: '2025/05/20',
    orderNo: '400649803', orderDate: '2025/03/10', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '30', docSeqNo: '400649803030',
    purchaser: '陳俊宏', orderQty: 400, acceptQty: 0, comparePrice: '38', unit: 'PCS', currency: 'TWD',
    leadtime: 7, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '4401-GRP0022-C01', customerBrand: 'G03', vendorMaterialNo: 'STRATUS-PRO-130',
    productName: '競速握把套', specification: 'STRATUS PRO GRIP 130MM CARBON',
    expectedDelivery: '2025/05/18', deliveryQty: 400,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '15200', agreedDate: '2025/05/20',
    internalNote: '', materialPOContent: 'STANDARD ORDER',
  },
  {
    id: 9004, status: 'CK', vendorDeliveryDate: '2025/06/01',
    orderNo: '400649804', orderDate: '2025/03/12', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '40', docSeqNo: '400649804040',
    purchaser: '吳佳慧', orderQty: 80, acceptQty: 0, comparePrice: '3200', unit: 'SET', currency: 'USD',
    leadtime: 14, vendorCode: '00010045', vendorName: '佳承精密(00010045)',
    materialNo: '5501-WHL0088-D01', customerBrand: 'G01', vendorMaterialNo: 'SLR2-42-DISC-R',
    productName: '碟煞輪組後輪', specification: 'SLR 2 42 DISC WHEELSYSTEM REAR 12X142',
    expectedDelivery: '2025/05/28', deliveryQty: 80,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '256000', agreedDate: '2025/06/01',
    internalNote: '限整採可編輯', materialPOContent: 'HIGH VALUE',
  },
  {
    id: 9005, status: 'CK', vendorDeliveryDate: '2025/06/10',
    orderNo: '400649805', orderDate: '2025/03/15', orderType: 'Z2HB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '50', docSeqNo: '400649805050',
    purchaser: '張建國', orderQty: 200, acceptQty: 0, comparePrice: '580', unit: 'SET', currency: 'TWD',
    leadtime: 7, vendorCode: '00010012', vendorName: '台灣製造(00010012)',
    materialNo: '6601-BRK0044-E01', customerBrand: 'G04', vendorMaterialNo: 'COND-SL-R-HYD',
    productName: '後碟煞系統', specification: 'CONDUCT SL DISC BRAKE REAR HYDRAULIC',
    expectedDelivery: '2025/06/05', deliveryQty: 200,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '116000', agreedDate: '2025/06/10',
    internalNote: '', materialPOContent: '',
  },
  {
    id: 9006, status: 'CK', vendorDeliveryDate: '2025/06/15',
    orderNo: '400649806', orderDate: '2025/03/18', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '60', docSeqNo: '400649806060',
    purchaser: '林美珍', orderQty: 500, acceptQty: 0, comparePrice: '28', unit: 'PCS', currency: 'TWD',
    leadtime: 5, vendorCode: '00010046', vendorName: '速聯國際(00010046)',
    materialNo: '7701-NIP0011-F01', customerBrand: 'G02', vendorMaterialNo: 'PHR-ALY-14MM-SV',
    productName: '鋁合金花鼓螺絲', specification: 'DT SWISS PHR ALLOY NIPPLE 14MM SILVER',
    expectedDelivery: '2025/06/12', deliveryQty: 500,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '14000', agreedDate: '2025/06/15',
    internalNote: '', materialPOContent: '',
  },
  {
    id: 9007, status: 'CK', vendorDeliveryDate: '2025/06/20',
    orderNo: '400649807', orderDate: '2025/03/20', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '70', docSeqNo: '400649807070',
    purchaser: '周志偉', orderQty: 120, acceptQty: 0, comparePrice: '2800', unit: 'SET', currency: 'TWD',
    leadtime: 14, vendorCode: '00010053', vendorName: '久廣精密(00010053)',
    materialNo: '8801-FRM0033-G01', customerBrand: 'G01', vendorMaterialNo: 'TCR-ADV-SL2-ML',
    productName: '公路車車架-SL2', specification: 'TCR ADVANCED SL 2 DISC FRAME ML RAW CARBON',
    expectedDelivery: '2025/06/18', deliveryQty: 120,
    inTransitQty: 0, undeliveredQty: 0, lineItemNote: '336000', agreedDate: '2025/06/20',
    internalNote: '', materialPOContent: 'LIMITED QTY',
  },
  {
    id: 9008, status: 'CK', vendorDeliveryDate: '2025/07/05',
    orderNo: '400649808', orderDate: '2025/03/22', orderType: 'Z2QB',
    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '80', docSeqNo: '400649808080',
    purchaser: '陳俊宏', orderQty: 600, acceptQty: 120, comparePrice: '950', unit: 'SET', currency: 'TWD',
    leadtime: 10, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',
    materialNo: '9901-DRL0066-H01', customerBrand: 'G03', vendorMaterialNo: 'DRLR-PRO-XS-BLK',
    productName: '碳纖維後撥鏈器', specification: 'DEORE XT RD-M8100 12-SPEED SHADOW+ DERAILLEUR',
    expectedDelivery: '2025/07/02', deliveryQty: 480,
    inTransitQty: 80, undeliveredQty: 400, lineItemNote: '456000', agreedDate: '2025/07/05',
    internalNote: '部分已驗收', materialPOContent: 'PARTIAL ACCEPT',
  },
];

// ── 主元件 ──────────────────────────────────────────────────��──────────────────
interface CorrectionCreatePageProps {
  userRole?: 'vendor' | 'purchaser' | 'giant';
  onNavigateToList?: () => void;
}

export function CorrectionCreatePage({ userRole, onNavigateToList }: CorrectionCreatePageProps) {
  const { orders, addCorrectionOrder, updateCorrectionOrder, correctionOrders, generateCorrectionDocNo, addCorrectionHistory, addOrderHistory } = useOrderStore();

  // ── 視圖狀態：'list' = 訂單列表，'detail' = 修正單明細 ──────────────────
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [detailOrders, setDetailOrders] = useState<OrderRow[]>([]);
  const [detailIndex, setDetailIndex] = useState(0);

  /**
   * 每張訂單各自獨立的修正單號（批次模式下各單號不共用）
   * 使用 ref 儲存，避免每次 render 重新產生；
   * 在 enterDetail 時為所有選取訂單預先產生唯一號碼。
   */
  const correctionDocNoMapRef = useRef<Record<number, string>>({});
  const getOrderDocNo = (orderId: number): string => correctionDocNoMapRef.current[orderId] ?? '';

  // ── 修正型態狀態 ─────────────────────────────────────────────────────────
  const [selectedCorrectionType, setSelectedCorrectionType] = useState<'不拆單' | '拆單'>('不拆單');

  // ── 搜尋欄位狀態 ─────────────────────────────────────────────────────────
  const [docSeqNoSearch, setDocSeqNoSearch]   = useState('');
  const [orderNoSearch, setOrderNoSearch]     = useState('');
  const [orderSeqSearch, setOrderSeqSearch]   = useState('');
  const [vendorSearch, setVendorSearch]       = useState('');

  // ── 表格狀態 ──────────────────────────────────────────────────────────────
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilterDialog, setShowFilterDialog]   = useState(false);
  const [availableColumns, setAvailableColumns]   = useState<OrderColumn[]>([]);
  const [tempColumns, setTempColumns]             = useState<OrderColumn[]>([]);
  const [columnsVersion, setColumnsVersion]       = useState(0);
  const [filters, setFilters]                     = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters]       = useState<FilterCondition[]>([]);

  // ── Batch correction import overlay (合併) ──────────────────────────────────
  const [showBatchCorrectionImport, setShowBatchCorrectionImport] = useState(false);

  // ── 快速刪單確認對話框 ──────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteOrders, setPendingDeleteOrders] = useState<OrderRow[]>([]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── 用戶 Email（用於 localStorage key）───────────────────────────────────
  const [currentUserEmail] = useState<string>(() =>
    localStorage.getItem('currentUserEmail') || 'default'
  );

  // ── 已有進行中修正單（DR/V/B/CP，非 SS/CL）→ 從建立列表排除 ──────────────
  const lockedDocSeqNos = useMemo(() => {
    return new Set(
      correctionOrders
        .filter(c => c.correctionStatus !== 'SS' && c.correctionStatus !== 'CL')
        .map(c => (c.orderNo || '') + (c.orderSeq || ''))
    );
  }, [correctionOrders]);

  // ── 合併 Store CK + 額外 mock CK 訂單，排除已有修正單的項目 ──────────────
  const allCkOrders = useMemo(() => {
    const storeCk = orders.filter(o => o.status === 'CK');
    const storeIds = new Set(storeCk.map(o => o.id));
    const extra = extraCkOrders.filter(o => !storeIds.has(o.id));
    // 已有進行中修正單（非 CL）者，不再出現於建立列表
    // 驗收量＋在途量 >= 訂貨量 者，無可修正量，亦不顯示
    return [...storeCk, ...extra].filter(o =>
      !lockedDocSeqNos.has((o.orderNo || '') + (o.orderSeq || '')) &&
      (o.acceptQty ?? 0) + (o.inTransitQty ?? 0) < (o.orderQty ?? 0)
    );
  }, [orders, lockedDocSeqNos]);

  // ── 多關鍵字搜尋輔助 ──────────────────────────────────────────────────────
  const splitKw = (s: string) =>
    s.split(/[、,，]/).map(x => x.trim().toLowerCase()).filter(Boolean);
  const matchAny = (val: string, kws: string[]) =>
    kws.some(k => val.toLowerCase().includes(k));

  // ── 搜尋過濾（即時） ──────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return allCkOrders.filter(o => {
      if (docSeqNoSearch.trim()) {
        const kws = splitKw(docSeqNoSearch);
        if (!matchAny((o.orderNo || '') + (o.orderSeq || ''), kws)) return false;
      }
      if (orderNoSearch.trim()) {
        const kws = splitKw(orderNoSearch);
        if (!matchAny(o.orderNo, kws)) return false;
      }
      if (orderSeqSearch.trim()) {
        const kws = splitKw(orderSeqSearch);
        if (!matchAny(o.orderSeq, kws)) return false;
      }
      if (vendorSearch.trim()) {
        const kws = splitKw(vendorSearch);
        if (!matchAny(o.vendorCode, kws) && !matchAny(o.vendorName, kws)) return false;
      }
      return true;
    });
  }, [allCkOrders, docSeqNoSearch, orderNoSearch, orderSeqSearch, vendorSearch]);

  // ── Filtered count (含 advanced filter) ──────────────────────────────────
  const getFilteredCount = () => {
    if (!appliedFilters.length) return filteredOrders.length;
    return filteredOrders.filter(item =>
      appliedFilters.every(f => {
        let raw: string;
        if (f.column === 'dayDiff') {
          const d = computeRowDayDiff(item);
          raw = d === null ? '-' : d > 0 ? `+${d}` : `${d}`;
        } else {
          const v = item[f.column as keyof OrderRow];
          raw = v !== undefined && v !== null ? String(v) : '';
        }
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
    ).length;
  };

  // ── 進入修正單明細 ─────────────────────────────────────────────────────────
  const enterDetail = (type?: '不拆單' | '拆單') => {
    if (selectedOrderIds.size === 0) { showToast('請先選取訂單'); return; }
    if (type) setSelectedCorrectionType(type);
    const selected = filteredOrders.filter(o => selectedOrderIds.has(o.id));
    setDetailOrders(selected);
    setDetailIndex(0);
    setView('detail');

    // 為所有選取訂單預先產生唯一修正單號
    const docNoMap: Record<number, string> = {};
    selected.forEach(o => {
      docNoMap[o.id] = generateCorrectionDocNo();
    });
    correctionDocNoMapRef.current = docNoMap;
  };

  // ── Checkbox handlers ─────────────────────────────────────────────────────
  const handleToggleOrder = (orderId: number) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredOrders.map(o => o.id);
    const allSel = allIds.every(id => selectedOrderIds.has(id));
    if (allSel) {
      const next = new Set(selectedOrderIds);
      allIds.forEach(id => next.delete(id));
      setSelectedOrderIds(next);
    } else {
      const next = new Set(selectedOrderIds);
      allIds.forEach(id => next.add(id));
      setSelectedOrderIds(next);
    }
  };

  // ── Column selector handlers ──────────────────────────────────────────────
  const handleColumnsClick = useCallback(() => {
    let cols = availableColumns.length > 0 ? availableColumns : [];
    if (cols.length === 0) {
      const safeTab = 'CK';
      const storageKey = `correction_create_${currentUserEmail}_${safeTab}_columns`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedCols = JSON.parse(saved) as OrderColumn[];
          cols = defaultOrderColumns.map(col => {
            const sc = savedCols.find(s => s.key === col.key);
            return sc ? { ...col, width: sc.width, visible: sc.visible } : col;
          });
        } else {
          cols = getOrderColumns();
        }
      } catch {
        cols = getOrderColumns();
      }
    }
    setTempColumns(JSON.parse(JSON.stringify(cols)));
    setShowColumnSelector(v => !v);
    if (showFilterDialog) setShowFilterDialog(false);
  }, [availableColumns, currentUserEmail, showFilterDialog]);

  const handleToggleColumn = (key: string) => {
    setTempColumns(prev =>
      prev.map(col => col.key === key ? { ...col, visible: !(col.visible !== false) } : col)
    );
  };

  const handleToggleAll = (selectAll: boolean) => {
    setTempColumns(prev => prev.map(col => ({ ...col, visible: selectAll })));
  };

  const handleApplyColumns = () => {
    const safeTab = 'CK';
    const storageKey = `correction_create_${currentUserEmail}_${safeTab}_columns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tempColumns));
      setAvailableColumns(tempColumns);
      setColumnsVersion(v => v + 1);
    } catch (err) {
      console.error('Failed to save columns:', err);
    }
    setShowColumnSelector(false);
  };

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handleFiltersClick = () => {
    setShowFilterDialog(v => !v);
    if (showColumnSelector) setShowColumnSelector(false);
  };

  const handleApplyFilters = (validFilters: typeof filters) => {
    setAppliedFilters(validFilters);
    setShowFilterDialog(false);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const currentCols = availableColumns.length > 0 ? availableColumns : defaultOrderColumns;
  const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const handleExportSelect = (type: ExportType) => {
    switch (type) {
      case 'excel':
        exportOrdersExcel(filteredOrders, `修正單_建立修正單_${dateSuffix}.xlsx`, currentCols);
        showToast(`已匯出 ${filteredOrders.length} 筆訂單 (Excel)`);
        break;
      case 'csv':
        exportOrdersCsv(filteredOrders, `修正單_建立修正單_${dateSuffix}.csv`, currentCols);
        showToast(`已匯出 ${filteredOrders.length} 筆訂單 (CSV)`);
        break;
      case 'batchCorrectionAdjust': {
        if (filteredOrders.length === 0) { showToast('目前篩選結果中沒有可下載的訂單'); return; }
        const countAdj = exportBatchCorrectionAdjustTemplate(filteredOrders);
        showToast(`已下載 ${countAdj} 筆批次建立修正單範本（不拆單）`);
        break;
      }
      case 'batchCorrectionSplit': {
        if (filteredOrders.length === 0) { showToast('目前篩選結果中沒有可下載的訂單'); return; }
        const countSpl = exportBatchCorrectionSplitTemplate(filteredOrders);
        showToast(`已下載 ${countSpl} 筆批次建立修正單範本（拆單）`);
        break;
      }
      default: break;
    }
  };

  // ── 批次建立修正單匯入確認（不拆單）────────────────────────────────────
  const handleBatchAdjustConfirm = (result: CorrectionAdjustImportResult) => {
    const now = nowDateStr();
    const op = operatorByRole(userRole as any);
    let createdCount = 0;
    for (const row of result.validRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;
      const docNo = generateCorrectionDocNo();
      const correctionId = Date.now() + Math.floor(Math.random() * 10000) + row.rowIndex;
      const totalQty = (order as any).deliveryQty ?? order.orderQty ?? 0;
      const schedCount = row.schedules.length;
      const savedDeliveryRows = row.schedules.length > 0
        ? row.schedules.map((s, i) => {
            const base = Math.floor(totalQty / schedCount);
            const rem = totalQty % schedCount;
            const autoQty = i < rem ? base + 1 : base;
            // 優先採用 CSV 填寫的 newQty；未填時才用均分的 autoQty（避免覆蓋用戶明確設定的值）
            const newQty = s.newQty ? s.newQty : String(autoQty);
            return {
              expectedDelivery: order.expectedDelivery,
              vendorOriginalDate: order.vendorDeliveryDate || order.expectedDelivery || '',
              newVendorDate: s.newVendorDate || order.vendorDeliveryDate || order.expectedDelivery || '',
              originalQty: i === 0 ? totalQty : 0,
              newQty,
              deleted: false,
            };
          })
        : [{
            expectedDelivery: order.expectedDelivery,
            vendorOriginalDate: order.vendorDeliveryDate || order.expectedDelivery || '',
            newVendorDate: order.vendorDeliveryDate || order.expectedDelivery || '',
            originalQty: (order as any).deliveryQty ?? order.orderQty,
            newQty: String((order as any).deliveryQty ?? order.orderQty),
            deleted: false,
          }];
      const corrRow: CorrectionOrderRow = {
        id: correctionId, correctionDocNo: docNo, correctionStatus: 'V', correctionType: '不拆單',
        orderNo: order.orderNo, orderSeq: order.orderSeq,
        docSeqNo: (order.orderNo || '') + (order.orderSeq || ''),
        vendorCode: order.vendorCode, vendorName: order.vendorName,
        purchaseOrg: (order as any).purchaseOrg || '', materialNo: order.materialNo,
        productName: order.productName, orderDate: order.orderDate || '',
        orderQty: order.orderQty, acceptQty: order.acceptQty, company: (order as any).company || '',
        createdAt: now, expectedDelivery: order.expectedDelivery,
        vendorDeliveryDate: order.vendorDeliveryDate || '', agreedDate: (order as any).agreedDate || '',
        inTransitQty: order.inTransitQty, deliveryQty: (order as any).deliveryQty ?? order.orderQty,
        newMaterialNo: row.newMaterialNo || '', correctionNote: row.remark || '', savedDeliveryRows,
      };
      // ── 先計算異動摘要（與手動送單 buildChangeSummary 一致），無變更則跳過不建單 ──
      const changeParts: string[] = [];
      // 料號變更
      if (row.newMaterialNo && row.newMaterialNo !== (order.materialNo ?? '')) {
        changeParts.push(`料號：${order.materialNo || '—'} → ${row.newMaterialNo}`);
      }
      // 修正備註
      if (row.remark?.trim()) {
        changeParts.push(`備註：${row.remark.trim()}`);
      }
      // 各期交貨排程變更
      savedDeliveryRows.forEach((dr, idx) => {
        const label = `第${idx + 1}期`;
        const rowParts: string[] = [];
        if (dr.newVendorDate && dr.newVendorDate !== dr.vendorOriginalDate) {
          rowParts.push(`交期 ${dr.vendorOriginalDate || '—'} → ${dr.newVendorDate}`);
        }
        if (String(dr.newQty) !== String(dr.originalQty)) {
          rowParts.push(`交貨量 ${dr.originalQty} → ${dr.newQty}`);
        }
        if (idx > 0 && dr.originalQty === 0) {
          // 新增期次：標示「新增」
          const newParts: string[] = [];
          if (dr.newVendorDate) newParts.push(`交期 ${dr.newVendorDate}`);
          if (dr.newQty) newParts.push(`交貨量 ${dr.newQty}`);
          changeParts.push(`${label}（新增）：${newParts.join('、')}`);
        } else if (rowParts.length > 0) {
          changeParts.push(`${label}：${rowParts.join('、')}`);
        }
      });
      // 無任何欄位變更 → 直接跳過，不建立修正單
      if (changeParts.length === 0) continue;
      const changeSummary = changeParts.join('；');
      addCorrectionOrder(corrRow);
      addCorrectionHistory(correctionId, {
        date: now, event: '修正單開立並提交（批次匯入-不拆單）', operator: op,
        remark: `修正單號: ${docNo}，不拆單 → V；${changeSummary}`,
      });
      // ── 在原訂單歷程中記錄開立修正單事件（修正單號會自動顯示為連結）──
      addOrderHistory(order.id, {
        date: now,
        event: '開立修正單',
        operator: op,
        remark: `修正單號: ${docNo}，修正類型：不拆單`,
      });
      createdCount++;
    }
    // ── 刪單（D碼）──
    let deleteCount = 0;
    for (const row of result.deleteRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;
      const docNo = generateCorrectionDocNo();
      const correctionId = Date.now() + Math.floor(Math.random() * 10000) + row.rowIndex;
      const corrRow: CorrectionOrderRow = {
        id: correctionId, correctionDocNo: docNo, correctionStatus: 'V', correctionType: '刪單',
        orderNo: order.orderNo, orderSeq: order.orderSeq,
        docSeqNo: (order.orderNo || '') + (order.orderSeq || ''),
        vendorCode: order.vendorCode, vendorName: order.vendorName,
        purchaseOrg: (order as any).purchaseOrg || '', materialNo: order.materialNo,
        productName: order.productName, orderDate: order.orderDate || '',
        orderQty: order.orderQty, acceptQty: order.acceptQty, company: (order as any).company || '',
        createdAt: now, expectedDelivery: order.expectedDelivery,
        vendorDeliveryDate: order.vendorDeliveryDate || '', agreedDate: (order as any).agreedDate || '',
        inTransitQty: order.inTransitQty, deliveryQty: (order as any).deliveryQty ?? order.orderQty,
        newMaterialNo: '', correctionNote: '刪單', savedDeliveryRows: (() => {
          const aQ = order.acceptQty ?? 0;
          const iQ = order.inTransitQty ?? 0;
          const calcNewQty = aQ + iQ;
          return [{
            expectedDelivery: order.expectedDelivery,
            vendorOriginalDate: order.vendorDeliveryDate || order.expectedDelivery || '',
            newVendorDate: order.vendorDeliveryDate || order.expectedDelivery || '',
            originalQty: (order as any).deliveryQty ?? order.orderQty ?? 0,
            newQty: String(calcNewQty),
            deleted: false,
          }];
        })(),
      };
      addCorrectionOrder(corrRow);
      addCorrectionHistory(correctionId, {
        date: now, event: '修正單開立並提交（批次匯入-刪單）', operator: op,
        remark: `修正單號: ${docNo}，刪單 → V`,
      });
      // ── 在原訂單歷程中記錄開立修正單事件 ──
      addOrderHistory(order.id, {
        date: now,
        event: '開立修正單',
        operator: op,
        remark: `修正單號: ${docNo}，修正類型：刪單`,
      });
      deleteCount++;
    }
    const parts: string[] = [];
    if (createdCount > 0) parts.push(`${createdCount} 張不拆單`);
    if (deleteCount > 0) parts.push(`${deleteCount} 張刪單`);
    const totalCreated = createdCount + deleteCount;
    const skippedAdj = result.validRows.length - createdCount;
    showToast(`批次建立修正單完成：${parts.join('、')}已提交廠商 (V)${skippedAdj > 0 ? `（${skippedAdj} 張無欄位變更已略過）` : ''}`);
    setShowBatchCorrectionImport(false);
    setTimeout(() => onNavigateToList?.(), 2200);
  };

  // ── 批次建立修正單匯入確認（拆單）──────────────────────────────────────────
  const handleBatchSplitConfirm = (result: CorrectionSplitImportResult) => {
    const now = nowDateStr();
    const op = operatorByRole(userRole as any);
    const seqTracker: Record<string, number> = {};
    const getNextSplitSeq = (orderNo: string, knownSeq?: number): string => {
      if (!(orderNo in seqTracker)) {
        // 查 store 中所有訂單（不限 CK 狀態），找該 orderNo 下最大的序號
        // 同時納入被拆單本身的序號（避免因過濾導致找不到）
        const seqs = orders
          .filter(o => o.orderNo === orderNo)
          .map(o => parseInt(o.orderSeq, 10))
          .filter(n => !isNaN(n));
        if (knownSeq !== undefined && !isNaN(knownSeq)) seqs.push(knownSeq);
        seqTracker[orderNo] = seqs.length > 0 ? Math.max(...seqs) : 0;
      }
      seqTracker[orderNo] += 10;
      return String(seqTracker[orderNo]);
    };
    for (const row of result.validRows) {
      if (!row.matchedOrder) continue;
      const order = row.matchedOrder;
      const docNo = generateCorrectionDocNo();
      const correctionId = Date.now() + Math.floor(Math.random() * 10000) + row.rowIndex + 50000;
      const savedDeliveryRows = row.splits.map((s, i) => ({
        expectedDelivery: order.expectedDelivery,
        vendorOriginalDate: order.vendorDeliveryDate || order.expectedDelivery || '',
        newVendorDate: s.newVendorDate || order.vendorDeliveryDate || order.expectedDelivery || '',
        originalQty: i === 0 ? ((order as any).deliveryQty ?? order.orderQty) : 0,
        newQty: s.qty,
        deleted: false,
        splitOrderSeq: i === 0 ? order.orderSeq : getNextSplitSeq(order.orderNo, parseInt(order.orderSeq, 10)),
        splitNewMaterialNo: s.newMaterialNo || '',
      }));
      const corrRow: CorrectionOrderRow = {
        id: correctionId, correctionDocNo: docNo, correctionStatus: 'V', correctionType: '拆單',
        orderNo: order.orderNo, orderSeq: order.orderSeq,
        docSeqNo: (order.orderNo || '') + (order.orderSeq || ''),
        vendorCode: order.vendorCode, vendorName: order.vendorName,
        purchaseOrg: (order as any).purchaseOrg || '', materialNo: order.materialNo,
        productName: order.productName, orderDate: order.orderDate || '',
        orderQty: order.orderQty, acceptQty: order.acceptQty, company: (order as any).company || '',
        createdAt: now, expectedDelivery: order.expectedDelivery,
        vendorDeliveryDate: order.vendorDeliveryDate || '', agreedDate: (order as any).agreedDate || '',
        inTransitQty: order.inTransitQty, deliveryQty: (order as any).deliveryQty ?? order.orderQty,
        newMaterialNo: '', correctionNote: row.remark || '', savedDeliveryRows,
      };
      addCorrectionOrder(corrRow);
      // 歷程備註：列出每拆的序號、交期、交貨量（與手動送單一致）
      const splitSummaryParts = savedDeliveryRows.map((dr, idx) => {
        const parts: string[] = [];
        if (dr.newVendorDate) parts.push(`交期 ${dr.newVendorDate}`);
        if (dr.newQty) parts.push(`交貨量 ${dr.newQty}`);
        if ((dr as any).splitNewMaterialNo) parts.push(`料號 ${(dr as any).splitNewMaterialNo}`);
        return `第${idx + 1}拆(序號${(dr as any).splitOrderSeq || '—'})：${parts.join('、')}`;
      });
      addCorrectionHistory(correctionId, {
        date: now, event: '修正單開立並提交（批次匯入-拆單）', operator: op,
        remark: `修正單號: ${docNo}，拆單 → V；${splitSummaryParts.join('；')}`,
      });
      // ── 在原訂單歷程中記錄開立修正單事件 ──
      addOrderHistory(order.id, {
        date: now,
        event: '開立修正單',
        operator: op,
        remark: `修正單號: ${docNo}，修正類型：拆單`,
      });
    }
    showToast(`批次建立拆單修正單完成：${result.validRows.length} 張已提交廠商 (V)`);
    setShowBatchCorrectionImport(false);
    setTimeout(() => onNavigateToList?.(), 2200);
  };

  // ── 快速刪單（捷徑）──────────────────────────────────────────────────────
  // Step 1: 顯示確認對話框
  const handleQuickDelete = () => {
    if (selectedOrderIds.size === 0) { showToast('請先選取訂單'); return; }
    const selected = filteredOrders.filter(o => selectedOrderIds.has(o.id));
    setPendingDeleteOrders(selected);
    setShowDeleteConfirm(true);
  };

  // Step 2: 用戶確認後才真正建立修正單
  const handleConfirmQuickDelete = () => {
    const now = nowDateStr();
    const op = operatorByRole(userRole as any);
    let deleteCount = 0;
    pendingDeleteOrders.forEach((order, idx) => {
      const docNo = generateCorrectionDocNo();
      const correctionId = Date.now() + Math.floor(Math.random() * 10000) + idx;
      const aQ = order.acceptQty ?? 0;
      const iQ = order.inTransitQty ?? 0;
      const calcNewQty = aQ + iQ;
      const corrRow: CorrectionOrderRow = {
        id: correctionId,
        correctionDocNo: docNo,
        correctionStatus: 'V',
        correctionType: '刪單',
        orderNo: order.orderNo,
        orderSeq: order.orderSeq,
        docSeqNo: (order.orderNo || '') + (order.orderSeq || ''),
        vendorCode: order.vendorCode,
        vendorName: order.vendorName,
        purchaseOrg: order.purchaseOrg ?? '',
        materialNo: order.materialNo ?? '',
        productName: order.productName ?? '',
        orderDate: order.orderDate,
        orderQty: order.orderQty ?? 0,
        acceptQty: order.acceptQty ?? 0,
        company: order.company ?? '',
        createdAt: now,
        expectedDelivery: order.expectedDelivery ?? '',
        vendorDeliveryDate: order.vendorDeliveryDate ?? '',
        agreedDate: order.agreedDate ?? '',
        inTransitQty: order.inTransitQty ?? 0,
        deliveryQty: order.deliveryQty ?? order.orderQty ?? 0,
        newMaterialNo: '',
        correctionNote: '刪單',
        savedDeliveryRows: [{
          expectedDelivery: order.expectedDelivery ?? '',
          vendorOriginalDate: order.vendorDeliveryDate || order.expectedDelivery || '',
          newVendorDate: order.vendorDeliveryDate || order.expectedDelivery || '',
          originalQty: order.deliveryQty ?? order.orderQty ?? 0,
          newQty: String(calcNewQty),
          deleted: false,
        }],
      };
      addCorrectionOrder(corrRow);
      addCorrectionHistory(correctionId, {
        date: now, event: '修正單開立並提交（快速刪單）', operator: op,
        remark: `修正單號: ${docNo}，刪單 → V`,
      });
      addOrderHistory(order.id, {
        date: now,
        event: '開立修正單',
        operator: op,
        remark: `修正單號: ${docNo}，修正類型：刪單`,
      });
      deleteCount++;
    });
    setShowDeleteConfirm(false);
    setPendingDeleteOrders([]);
    setSelectedOrderIds(new Set());
    showToast(`${deleteCount} 張刪單修正單已提交廠商 (V)`);
    setTimeout(() => onNavigateToList?.(), 2200);
  };

  // ── Batch action bar ──

  const batchActions = (
    <div className="flex items-center" data-is-checkbox="true">
      <button
        data-is-checkbox="true"
        onClick={() => enterDetail('不拆單')}
        className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
      >
        不拆單
      </button>
      {/* 分隔線 */}
      <div className="h-[30px] w-[1px] bg-[#919eab] mx-[2px] opacity-30" />
      <button
        data-is-checkbox="true"
        onClick={() => enterDetail('拆單')}
        className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#004680] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
      >拆單</button>
      {/* 分隔線 */}
      <div className="h-[30px] w-[1px] bg-[#919eab] mx-[2px] opacity-30" />
      <button
        data-is-checkbox="true"
        onClick={handleQuickDelete}
        className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#ff5630] leading-[24px] whitespace-nowrap cursor-pointer select-none px-[10px] py-[16px] hover:opacity-70 transition-opacity"
      >刪單</button>
    </div>
  );

  // ── Filter column options ─────────────────────────────────────────────────
  const filterColumns = (availableColumns.length > 0 ? availableColumns : defaultOrderColumns)
    .map(col => ({ key: col.key, label: col.label }));

  // ── Helper: 建立修正單資料並寫入 store ──────────────────────────────────
  const buildCorrectionOrder = (order: OrderRow, status: 'DR' | 'V', data?: CorrectionFormData, isDelete?: boolean): CorrectionOrderRow => ({
    id: order.id,          // ← 使用原始訂單 ID，確保歷程 key 與 CorrectionDetailPage 一致
    correctionDocNo: getOrderDocNo(order.id),
    correctionStatus: status,
    correctionType: isDelete ? '刪單' : selectedCorrectionType,
    orderNo: order.orderNo,
    orderSeq: order.orderSeq,
    docSeqNo: order.docSeqNo,
    vendorCode: order.vendorCode,
    vendorName: order.vendorName,
    purchaseOrg: order.purchaseOrg ?? '',
    materialNo: order.materialNo ?? '',
    productName: order.productName ?? '',
    orderDate: order.orderDate,
    orderQty: order.orderQty ?? 0,
    acceptQty: order.acceptQty ?? 0,
    company: order.company ?? '',
    createdAt: nowDateStr(),
    // 原訂單交貨相關欄位（供明細頁還原完整顯示）
    expectedDelivery: order.expectedDelivery ?? '',
    vendorDeliveryDate: order.vendorDeliveryDate ?? '',
    agreedDate: order.agreedDate ?? '',
    inTransitQty: order.inTransitQty ?? 0,
    deliveryQty: order.deliveryQty ?? order.orderQty ?? 0,
    // 修正內容
    newMaterialNo: data?.newMaterialNo ?? '',
    correctionNote: data?.correctionNote ?? '',
    // 交貨排程（DR 暫存時保存，供繼續編輯還原）
    savedDeliveryRows: data?.deliveryRows.map(r => ({
      expectedDelivery: r.expectedDelivery,
      vendorOriginalDate: r.vendorOriginalDate,
      newVendorDate: r.newVendorDate,
      originalQty: r.originalQty,
      newQty: r.newQty,
      deleted: r.deleted,
      splitOrderSeq: r.splitOrderSeq,
      splitNewMaterialNo: r.splitNewMaterialNo,
    })),
    savedPeriodInput: data?.periodInput,
  });

  // ── 修正單明細視圖 ─────────────────────────────────────────────────────────
  if (view === 'detail' && detailOrders.length > 0) {

    // 判斷某張訂單是否已在 store 中（以本批次 correctionDocNo 為識別）
    const isOrderInStore = (orderId: number) =>
      correctionOrders.some(c => c.id === orderId && c.correctionDocNo === getOrderDocNo(orderId));

    // 智慧寫入：已存在則 update，否則 add
    const saveOrderToStore = (corrRow: CorrectionOrderRow) => {
      if (isOrderInStore(corrRow.id)) {
        const { id, correctionDocNo: docNo, ...updates } = corrRow;
        updateCorrectionOrder(id, docNo, updates);
      } else {
        addCorrectionOrder(corrRow);
      }
    };

    // ── 計算同訂單號下最高序號（用於拆單新項次序號計算）──────────────────
    const currentDetailOrder = detailOrders[detailIndex];
    const computeMaxSeqInSameOrderNo = (orderNo: string): number => {
      // 從所有 CK 訂單 + store 內所有訂單中，找同一 orderNo 的最大 orderSeq
      const allSources = [...allCkOrders, ...orders];
      const seqs = allSources
        .filter(o => o.orderNo === orderNo)
        .map(o => parseInt(o.orderSeq, 10))
        .filter(n => !isNaN(n));
      return seqs.length > 0 ? Math.max(...seqs) : 0;
    };
    const maxSeqInSameOrderNo = currentDetailOrder
      ? computeMaxSeqInSameOrderNo(currentDetailOrder.orderNo)
      : undefined;

    return (
      <>
        <CorrectionDetailPage
          orders={detailOrders}
          currentIndex={detailIndex}
          correctionDocNo={getOrderDocNo(detailOrders[detailIndex]?.id)}
          correctionType={selectedCorrectionType}
          maxSeqInSameOrderNo={maxSeqInSameOrderNo}
          // 若該張訂單已被自動暫存為 DR，isExistingDoc=true 讓明細頁正確顯示單號
          isExistingDoc={isOrderInStore(detailOrders[detailIndex]?.id)}
          onBack={() => {
            setView('list');
            setSelectedOrderIds(new Set());
          }}
          onIndexChange={setDetailIndex}
          onSubmit={(idx: number, data: CorrectionFormData, isDelete?: boolean) => {
            const order = detailOrders[idx];
            const docNo = getOrderDocNo(order.id);
            const corrRow = buildCorrectionOrder(order, 'V', data, isDelete);
            saveOrderToStore(corrRow);
            // ── 在原訂單歷程中記錄開立修正單事件（修正單號自動顯示為連結）──
            addOrderHistory(order.id, {
              date: nowDateStr(),
              event: '開立修正單',
              operator: operatorByRole(userRole as any),
              remark: `修正單號: ${docNo}，修正類型：${isDelete ? '刪單' : selectedCorrectionType}`,
            });
            if (detailOrders.length === 1) {
              // ── 單筆：維持原有導航行為 ──────────────────────────────────
              setSelectedOrderIds(new Set());
              setView('list');
              showToast(`修正單 ${docNo} 號已提交廠商，狀態轉為待廠商確認(V)`);
              setTimeout(() => onNavigateToList?.(), 2200);
            }
            // 批次模式：各單各有獨立單號，不再 autoSaveRemainingAsDR
          }}
          onSave={(idx: number, data: CorrectionFormData, isDelete?: boolean) => {
            const order = detailOrders[idx];
            const docNo = getOrderDocNo(order.id);
            const corrRow = buildCorrectionOrder(order, 'DR', data, isDelete);
            saveOrderToStore(corrRow);
            // ── 在原訂單歷程中記錄開立修正單草稿事件 ──
            addOrderHistory(order.id, {
              date: nowDateStr(),
              event: '開立修正單（草稿）',
              operator: operatorByRole(userRole as any),
              remark: `修正單號: ${docNo}，修正類型：${isDelete ? '刪單' : selectedCorrectionType}（DR暫存）`,
            });
            if (detailOrders.length === 1) {
              // ── 單筆：維持原有導航行為 ──────────────────────────────────
              setSelectedOrderIds(new Set());
              setView('list');
              showToast(`修正單 ${docNo} 號已暫存為草稿(DR)`);
              setTimeout(() => onNavigateToList?.(), 2200);
            }
            // 批次模式：各單各有獨立單號，不再 autoSaveRemainingAsDR
          }}
          userRole={userRole}
        />
        {/* Toast — 明細視圖也需要顯示 */}
        {toastMsg && (
          <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
            <div className="bg-[#1c252e] text-white rounded-[8px] px-[18px] py-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.18)]">
              <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] whitespace-nowrap">
                {toastMsg}
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── 訂單列表視圖 ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── 上方搜尋列 ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-[12px] items-end px-[20px] py-[16px] shrink-0">
        <SearchField
          label="單號序號"
          value={docSeqNoSearch}
          onChange={setDocSeqNoSearch}
          placeholder="輸入單號序號"
        />
        <SearchField
          label="訂單號碼"
          value={orderNoSearch}
          onChange={setOrderNoSearch}
          placeholder="輸入訂單號碼"
        />
        <SearchField
          label="訂單序號"
          value={orderSeqSearch}
          onChange={setOrderSeqSearch}
          placeholder="輸入訂單序號"
        />
        <SearchField
          label="廠商(編號)"
          value={vendorSearch}
          onChange={setVendorSearch}
          placeholder="輸入廠商名稱或編號"
        />
      </div>

      {/* ── TableToolbar ───────────────────────────────────────────────────── */}
      <TableToolbar
        resultsCount={getFilteredCount()}
        showColumnSelector={showColumnSelector}
        showFilterDialog={showFilterDialog}
        onColumnsClick={handleColumnsClick}
        onFiltersClick={handleFiltersClick}
        actionButton={
          <CsvToolbarButtons
            onExportSelect={handleExportSelect}
            onImport={() => {}}
            hideBatchReply={true}
            hideBatchCorrection={false}
            onBatchCorrectionAdjustImport={() => setShowBatchCorrectionImport(true)}
            onBatchCorrectionSplitImport={() => setShowBatchCorrectionImport(true)}
          />
        }
        columnsButton={
          showColumnSelector ? (
            <ColumnSelector
              columns={tempColumns}
              onToggleColumn={handleToggleColumn}
              onToggleAll={handleToggleAll}
              onClose={() => setShowColumnSelector(false)}
              onApply={handleApplyColumns}
            />
          ) : null
        }
        filtersButton={
          showFilterDialog ? (
            <FilterDialog
              filters={filters}
              availableColumns={filterColumns}
              onFiltersChange={setFilters}
              onClose={() => setShowFilterDialog(false)}
              onApply={handleApplyFilters}
            />
          ) : null
        }
      />

      {/* ── 進階表格 ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AdvancedOrderTable
          activeTab="CK"
          data={filteredOrders}
          userEmail={currentUserEmail}
          userRole={userRole}
          selectedOrderIds={selectedOrderIds}
          onToggleOrder={handleToggleOrder}
          onSelectAll={handleSelectAll}
          forceShowCheckbox={true}
          batchActions={batchActions}
          storageKeyPrefix="correction_create"
          columnsVersion={columnsVersion}
          appliedFilters={appliedFilters}
          onColumnsChange={(cols) => {
            setAvailableColumns(cols);
            if (tempColumns.length === 0) setTempColumns(JSON.parse(JSON.stringify(cols)));
          }}
        />
      </div>

      {/* ── 批次建立修正單匯入 Overlay（合併版）──────────────────────────────── */}
      {showBatchCorrectionImport && (
        <BatchCorrectionCombinedImportOverlay
          allOrders={allCkOrders}
          onConfirmAdjust={handleBatchAdjustConfirm}
          onConfirmSplit={handleBatchSplitConfirm}
          onClose={() => setShowBatchCorrectionImport(false)}
        />
      )}


      {/* ── 快速刪單確認對話框 ──────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.2)] w-full max-w-[560px] flex flex-col overflow-hidden">
            {/* 標題區 */}
            <div className="flex items-center gap-[12px] px-[24px] py-[20px] border-b border-[rgba(145,158,171,0.16)]">
              <div className="shrink-0 w-[40px] h-[40px] rounded-full bg-[rgba(255,86,48,0.12)] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[16px] leading-[24px]">確認刪單</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[13px] leading-[20px]">
                  以下 {pendingDeleteOrders.length} 筆訂單將提交刪單修正單，請確認是否繼續。
                </p>
              </div>
            </div>
            {/* 訂單清單 */}
            <div className="px-[24px] py-[16px] flex flex-col gap-0 max-h-[320px] overflow-y-auto">
              <div className="flex gap-[12px] px-[12px] py-[8px] bg-[#f4f6f8] rounded-[6px] mb-[4px]">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] w-[160px] shrink-0">單號序號</p>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] flex-1">廠商名稱</p>
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381] w-[60px] shrink-0 text-right">訂貨量</p>
              </div>
              {pendingDeleteOrders.map((order, i) => (
                <div
                  key={order.id}
                  className={`flex gap-[12px] px-[12px] py-[10px] ${i < pendingDeleteOrders.length - 1 ? 'border-b border-[rgba(145,158,171,0.12)]' : ''}`}
                >
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] w-[160px] shrink-0">
                    {(order.orderNo || '') + (order.orderSeq || '')}
                  </p>
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] flex-1 truncate">
                    {order.vendorName || '-'}
                  </p>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] w-[60px] shrink-0 text-right">
                    {order.orderQty ?? '-'}
                  </p>
                </div>
              ))}
            </div>
            {/* 按鈕區 */}
            <div className="flex gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.16)] justify-end">
              <button
                onClick={() => { setShowDeleteConfirm(false); setPendingDeleteOrders([]); }}
                className="h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] bg-white hover:bg-[rgba(145,158,171,0.08)] transition-colors cursor-pointer"
              >取消</button>
              <button
                onClick={handleConfirmQuickDelete}
                className="h-[36px] px-[20px] rounded-[8px] bg-[#ff5630] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#b71d18] transition-colors cursor-pointer"
              >確認刪單</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
          <div className="bg-[#1c252e] text-white rounded-[8px] px-[18px] py-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.18)]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] whitespace-nowrap">
              {toastMsg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}