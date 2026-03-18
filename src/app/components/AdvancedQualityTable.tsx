import { useState, useCallback, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 're-resizable';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';
import type { FilterCondition } from './FilterDialog';

// ===== Types =====
export type QualityColumnKey = 
  | 'vendor' | 'abnormalNumber' | 'quantity' | 'orderNumber' | 'status'
  | 'partNumber' | 'date' | 'description' | 'defectType' | 'emergencyAction'
  | 'causeAnalysis' | 'countermeasure' | 'gtmConfirm' | 'confirmer' | 'attachment';

export interface QualityColumn {
  key: QualityColumnKey;
  label: string;
  width: number;
  minWidth: number;
  visible?: boolean;
}

export interface QualityRow {
  id: number;
  vendor: string;
  abnormalNumber: string;
  quantity: number;
  orderNumber: string;
  status: 'V' | 'G' | 'CE' | 'CL';
  partNumber: string;
  date: string;
  description: string;
  defectType: string;
  emergencyAction: string;
  causeAnalysis: string;
  countermeasure: string;
  gtmConfirm: string;
  confirmer: string;
  attachment: string;
}

interface AdvancedQualityTableProps {
  activeTab: string;
  data: QualityRow[];
  onRowClick: (row: QualityRow) => void;
  abnormalNumberFilter: string;
  partNumberFilter: string;
  userEmail?: string;
  onColumnsChange?: (columns: QualityColumn[]) => void;
  columnsVersion?: number;
  appliedFilters?: FilterCondition[];
}

// ===== Default Columns =====
export const defaultQualityColumns: QualityColumn[] = [
  { key: 'vendor', label: '廠商(編號)', width: 200, minWidth: 120 },
  { key: 'abnormalNumber', label: '品質異常單號', width: 160, minWidth: 120 },
  { key: 'quantity', label: '數量', width: 90, minWidth: 70 },
  { key: 'orderNumber', label: '訂單號碼', width: 140, minWidth: 100 },
  { key: 'status', label: '單據狀態', width: 110, minWidth: 90 },
  { key: 'partNumber', label: '料號', width: 200, minWidth: 120 },
  { key: 'date', label: '開單日期', width: 120, minWidth: 100 },
  { key: 'description', label: '長規格敘述', width: 320, minWidth: 150 },
  { key: 'defectType', label: '不良情形', width: 180, minWidth: 100 },
  { key: 'emergencyAction', label: '應急處理', width: 180, minWidth: 100 },
  { key: 'causeAnalysis', label: '原因分析', width: 180, minWidth: 100 },
  { key: 'countermeasure', label: '對策提出', width: 180, minWidth: 100 },
  { key: 'gtmConfirm', label: 'GTM確認', width: 110, minWidth: 80 },
  { key: 'confirmer', label: '確認者', width: 120, minWidth: 80 },
  { key: 'attachment', label: '附件', width: 100, minWidth: 70 },
];

// ===== Mock Data =====
export const qualityMockData: QualityRow[] = [
  {
    id: 1, vendor: '速聯(000100463)', abnormalNumber: '000200000981', quantity: 50,
    orderNumber: '4500172720', status: 'V', partNumber: '1129-CSL0075-L01',
    date: '2024/12/25',
    description: 'REMEDY 7 A 17.5~21.5 TK426-M 金油下-無膜標(一般色) TS1186D',
    defectType: '外觀不良-刮傷', emergencyAction: '退回供應商', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: ''
  },
  {
    id: 2, vendor: '速聯(000100463)', abnormalNumber: '000200000982', quantity: 120,
    orderNumber: '4500172730', status: 'G', partNumber: '1129-CSL0075-L02',
    date: '2024/12/26',
    description: 'REMEDY 7 A 17.5~21.5 TK426-M 金油下-無膜標(一般色) TS1186D',
    defectType: '尺寸不符', emergencyAction: '特採使用', causeAnalysis: '模具磨損導致尺寸偏差',
    countermeasure: '更換模具', gtmConfirm: '待確認', confirmer: '', attachment: '1'
  },
  {
    id: 3, vendor: '久廣(000100531)', abnormalNumber: '000200000983', quantity: 30,
    orderNumber: '4500172740', status: 'V', partNumber: '1129-CSL0075-L03',
    date: '2024/12/27',
    description: 'DEFY ADVANCED PRO 1 ML/L 前叉 FK901-C',
    defectType: '材質不良', emergencyAction: '退回供應商', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: ''
  },
  {
    id: 4, vendor: '金盛元(000100597)', abnormalNumber: '000200000984', quantity: 200,
    orderNumber: '4500172750', status: 'G', partNumber: '2201-FRM0088-A01',
    date: '2024/12/28',
    description: 'TCR ADVANCED SL DISC FRAME ML CARBON/ORANGE',
    defectType: '塗裝不良-色差', emergencyAction: '重工處理', causeAnalysis: '烤漆溫度控制不當',
    countermeasure: '調整烤漆參數', gtmConfirm: '已確認', confirmer: '王大明', attachment: '2'
  },
  {
    id: 5, vendor: '佳承(000100458)', abnormalNumber: '000200000985', quantity: 80,
    orderNumber: '4500172760', status: 'CL', partNumber: '3301-HDL0045-B02',
    date: '2024/12/29',
    description: 'CONTACT SLR AERO OD2 HANDLEBAR 400MM',
    defectType: '焊接不良', emergencyAction: '退回供應商', causeAnalysis: '焊接參數設定錯誤',
    countermeasure: '重新校正焊接機', gtmConfirm: '已確認', confirmer: '李小華', attachment: '3'
  },
  {
    id: 6, vendor: '台灣製造(000100123)', abnormalNumber: '000200000986', quantity: 15,
    orderNumber: '4500172770', status: 'CE', partNumber: '4401-SDP0022-C01',
    date: '2025/01/02',
    description: 'FLEET SLR FORWARD SADDLE 145MM',
    defectType: '包裝破損', emergencyAction: '取消訂單', causeAnalysis: '運輸過程中碰撞',
    countermeasure: '改善包裝方式', gtmConfirm: '已確認', confirmer: '張志明', attachment: ''
  },
  {
    id: 7, vendor: '精密工業(000100456)', abnormalNumber: '000200000987', quantity: 500,
    orderNumber: '4500172780', status: 'V', partNumber: '5501-BRK0011-D01',
    date: '2025/01/03',
    description: 'CONDUCT SL DISC BRAKE FRONT HYDRAULIC',
    defectType: '功能異常-煞車力不足', emergencyAction: '待供應商回覆', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: '1'
  },
  {
    id: 8, vendor: '速聯(000100463)', abnormalNumber: '000200000988', quantity: 75,
    orderNumber: '4500172790', status: 'G', partNumber: '6601-DRL0033-E02',
    date: '2025/01/04',
    description: 'SHIMANO DEORE XT RD-M8100 SGS 12-SPEED',
    defectType: '電鍍不良-起泡', emergencyAction: '特採使用', causeAnalysis: '電鍍液濃度異常',
    countermeasure: '更換電鍍液', gtmConfirm: '待確認', confirmer: '', attachment: '2'
  },
  {
    id: 9, vendor: '久廣(000100531)', abnormalNumber: '000200000989', quantity: 40,
    orderNumber: '4500172800', status: 'CL', partNumber: '7701-WHL0055-F01',
    date: '2025/01/05',
    description: 'SLR 1 42 DISC WHEELSYSTEM FRONT 12X100',
    defectType: '軸承異音', emergencyAction: '退回供應商', causeAnalysis: '軸承安裝不當',
    countermeasure: '加強安裝SOP培訓', gtmConfirm: '已確認', confirmer: '陳美玲', attachment: '1'
  },
  {
    id: 10, vendor: '金盛元(000100597)', abnormalNumber: '000200000990', quantity: 160,
    orderNumber: '4500172810', status: 'V', partNumber: '8801-TIR0077-G01',
    date: '2025/01/06',
    description: 'GAVIA COURSE 1 700X25C TUBELESS READY',
    defectType: '膠料老化', emergencyAction: '退回供應商', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: ''
  },
  {
    id: 11, vendor: '佳承(000100458)', abnormalNumber: '000200000991', quantity: 25,
    orderNumber: '4500172820', status: 'G', partNumber: '9901-SPT0012-H01',
    date: '2025/01/07',
    description: 'D-FUSE SEATPOST COMPOSITE FOR TCR',
    defectType: '碳纖維裂紋', emergencyAction: '全數退回', causeAnalysis: '成型壓力不足',
    countermeasure: '調整成型壓力參數', gtmConfirm: '待確認', confirmer: '', attachment: '4'
  },
  {
    id: 12, vendor: '台灣製造(000100123)', abnormalNumber: '000200000992', quantity: 90,
    orderNumber: '4500172830', status: 'CE', partNumber: '1101-PED0088-I01',
    date: '2025/01/08',
    description: 'PLATFORM PEDAL NYLON BODY CR-MO AXLE',
    defectType: '螺紋不良', emergencyAction: '取消訂單', causeAnalysis: '攻牙刀具磨損',
    countermeasure: '定期更換刀具', gtmConfirm: '已確認', confirmer: '林志豪', attachment: ''
  },
  {
    id: 13, vendor: '速聯(000100463)', abnormalNumber: '000200000993', quantity: 300,
    orderNumber: '4500172840', status: 'V', partNumber: '1201-CHN0044-J01',
    date: '2025/01/09',
    description: 'SHIMANO CN-HG701 11-SPEED CHAIN',
    defectType: '硬度不足', emergencyAction: '待供應商回覆', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: ''
  },
  {
    id: 14, vendor: '精密工業(000100456)', abnormalNumber: '000200000994', quantity: 45,
    orderNumber: '4500172850', status: 'G', partNumber: '1301-STM0022-K01',
    date: '2025/01/10',
    description: 'CONTACT SL OD2 STEM 90MM -8DEG',
    defectType: '組裝不良', emergencyAction: '重工處理', causeAnalysis: '作業員未按SOP操作',
    countermeasure: '加強教育訓練', gtmConfirm: '已確認', confirmer: '黃美惠', attachment: '1'
  },
  {
    id: 15, vendor: '久廣(000100531)', abnormalNumber: '000200000995', quantity: 60,
    orderNumber: '4500172860', status: 'CL', partNumber: '1401-GRP0033-L01',
    date: '2025/01/11',
    description: 'STRATUS LITE GRIP 130MM BLACK',
    defectType: '材質硬度異常', emergencyAction: '退回供應商', causeAnalysis: '原料批次不良',
    countermeasure: '加強進料檢驗', gtmConfirm: '已確認', confirmer: '吳建宏', attachment: '2'
  },
  {
    id: 16, vendor: '金盛元(000100597)', abnormalNumber: '000200000996', quantity: 110,
    orderNumber: '4500172870', status: 'V', partNumber: '1501-BBR0011-M01',
    date: '2025/01/12',
    description: 'SHIMANO BB-MT800 PRESS FIT BB',
    defectType: '防水性不足', emergencyAction: '待供應商回覆', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: ''
  },
  {
    id: 17, vendor: '佳承(000100458)', abnormalNumber: '000200000997', quantity: 35,
    orderNumber: '4500172880', status: 'G', partNumber: '1601-CST0055-N01',
    date: '2025/01/13',
    description: 'CADEX BOOST CASSETTE 10-36T 12-SPEED',
    defectType: '齒面粗糙度不符', emergencyAction: '特採使用', causeAnalysis: '切削加工參數偏差',
    countermeasure: '重新校正CNC參數', gtmConfirm: '待確認', confirmer: '', attachment: '1'
  },
  {
    id: 18, vendor: '速聯(000100463)', abnormalNumber: '000200000998', quantity: 220,
    orderNumber: '4500172890', status: 'V', partNumber: '1701-HUB0022-O01',
    date: '2025/01/14',
    description: 'SHIMANO FH-MT410-B REAR HUB 32H BOOST',
    defectType: '表面處理不良', emergencyAction: '退回供應商', causeAnalysis: '',
    countermeasure: '', gtmConfirm: '', confirmer: '', attachment: ''
  },
  {
    id: 19, vendor: '台灣製造(000100123)', abnormalNumber: '000200000999', quantity: 55,
    orderNumber: '4500172900', status: 'CL', partNumber: '1801-SPK0044-P01',
    date: '2025/01/15',
    description: 'DT SWISS COMPETITION SPOKE 2.0/1.8 BLK',
    defectType: '強度不足', emergencyAction: '退回供應商', causeAnalysis: '熱處理製程異常',
    countermeasure: '修正熱處理溫度曲線', gtmConfirm: '已確認', confirmer: '趙明德', attachment: '1'
  },
  {
    id: 20, vendor: '精密工業(000100456)', abnormalNumber: '000200001000', quantity: 180,
    orderNumber: '4500172910', status: 'CE', partNumber: '1901-NIP0011-Q01',
    date: '2025/01/16',
    description: 'DT SWISS PHR ALLOY NIPPLE 14MM BLK',
    defectType: '電鍍層剝落', emergencyAction: '取消訂單', causeAnalysis: '基材前處理不良',
    countermeasure: '改善前處理流程', gtmConfirm: '已確認', confirmer: '周雅琳', attachment: ''
  },
];

// ===== Draggable Column Header =====
const DraggableColumnHeader = ({
  column, index, moveColumn, updateColumnWidth, sortConfig, onSort, isLast
}: {
  column: QualityColumn;
  index: number;
  moveColumn: (dragKey: QualityColumnKey, hoverKey: QualityColumnKey) => void;
  updateColumnWidth: (key: QualityColumnKey, width: number) => void;
  sortConfig: { key: QualityColumnKey | null; direction: 'asc' | 'desc' | null };
  onSort: (key: QualityColumnKey) => void;
  isLast?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'quality-column',
    item: () => ({ columnKey: column.key, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'quality-column',
    hover: (item: { columnKey: QualityColumnKey; index: number }) => {
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
      onResizeStop={(e, direction, ref, d) => {
        updateColumnWidth(column.key, column.width + d.width);
      }}
      handleStyles={{
        right: {
          width: '4px',
          right: '0',
          cursor: 'col-resize',
          background: 'transparent',
          zIndex: 1,
        },
      }}
      handleClasses={{
        right: 'hover:bg-[#1D7BF5] transition-colors',
      }}
      className={`bg-[#f4f6f8] ${isLast ? '' : 'border-r border-[rgba(145,158,171,0.08)]'}`}
    >
      <div
        ref={(node) => drag(drop(node))}
        className={`h-full flex items-center justify-start px-[16px] cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'P' || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'path') {
            onSort(column.key);
          }
        }}
      >
        {/* 拖曳符號 */}
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

        {/* 排序圖標 */}
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

// ===== Main Component =====
export function AdvancedQualityTable({
  activeTab,
  data,
  onRowClick,
  abnormalNumberFilter,
  partNumberFilter,
  userEmail = 'default',
  onColumnsChange,
  columnsVersion,
  appliedFilters,
}: AdvancedQualityTableProps) {
  // 水平拖拽滾動
  const { scrollContainerRef, handleMouseDown, canDragScroll } = useHorizontalDragScroll();

  // 生成 localStorage key（含 tab）
  const getStorageKey = (tab: string) => {
    const safeTab = tab.replace(/[^a-zA-Z0-9]/g, '_');
    return `qualityAbnormal_${userEmail}_${safeTab}_columns`;
  };

  // 從 localStorage 載入欄位設定
  const loadColumnsFromStorage = (tab: string): QualityColumn[] => {
    const storageKey = getStorageKey(tab);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedColumns = JSON.parse(saved) as QualityColumn[];
        if (savedColumns.length === defaultQualityColumns.length) {
          return savedColumns;
        }
      }
    } catch (error) {
      console.error('Failed to load columns from storage:', error);
    }
    return defaultQualityColumns.map(col => ({ ...col }));
  };

  // 儲存欄位設定到 localStorage
  const saveColumnsToStorage = (tab: string, cols: QualityColumn[]) => {
    const storageKey = getStorageKey(tab);
    try {
      localStorage.setItem(storageKey, JSON.stringify(cols));
    } catch (error) {
      console.error('Failed to save columns to storage:', error);
    }
  };

  const [columns, setColumns] = useState<QualityColumn[]>(() => loadColumnsFromStorage(activeTab));
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: QualityColumnKey | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null,
  });

  // 當 tab 切換時更新 columns
  useEffect(() => {
    setIsLoadingFromStorage(true);
    const loadedColumns = loadColumnsFromStorage(activeTab);
    setColumns(loadedColumns);
    setTimeout(() => setIsLoadingFromStorage(false), 0);
  }, [activeTab, userEmail]);

  // 當 columnsVersion 變化時重新載入
  useEffect(() => {
    if (columnsVersion !== undefined && columnsVersion > 0) {
      setIsLoadingFromStorage(true);
      const loadedColumns = loadColumnsFromStorage(activeTab);
      setColumns(loadedColumns);
      setTimeout(() => setIsLoadingFromStorage(false), 0);
    }
  }, [columnsVersion]);

  // 當欄位變更時儲存並通知父組件
  useEffect(() => {
    if (!isLoadingFromStorage) {
      saveColumnsToStorage(activeTab, columns);
    }
    if (onColumnsChange) {
      onColumnsChange(columns);
    }
  }, [columns, activeTab, userEmail]);

  // 拖拽排序欄位
  const moveColumn = useCallback((dragKey: QualityColumnKey, hoverKey: QualityColumnKey) => {
    setColumns((prev) => {
      const dragIndex = prev.findIndex(col => col.key === dragKey);
      const hoverIndex = prev.findIndex(col => col.key === hoverKey);
      const newColumns = [...prev];
      const [removed] = newColumns.splice(dragIndex, 1);
      newColumns.splice(hoverIndex, 0, removed);
      return newColumns;
    });
  }, []);

  // 調整欄寬
  const updateColumnWidth = useCallback((key: QualityColumnKey, width: number) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const index = newColumns.findIndex(col => col.key === key);
      newColumns[index] = { ...newColumns[index], width };
      return newColumns;
    });
  }, []);

  // 篩選可見欄位
  const visibleColumns = columns.filter(col => col.visible !== false);

  // 依 tab 過濾數據
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'All') return data;
    const statusMatch = activeTab.match(/\(([A-Z]+)\)/);
    if (statusMatch) {
      return data.filter(item => item.status === statusMatch[1]);
    }
    return data;
  }, [data, activeTab]);

  // 搜尋過濾
  const searchFilteredData = useMemo(() => {
    return tabFilteredData.filter(item => {
      const matchesAbnormal = !abnormalNumberFilter ||
        item.abnormalNumber.toLowerCase().includes(abnormalNumberFilter.toLowerCase());
      const matchesPart = !partNumberFilter ||
        item.partNumber.toLowerCase().includes(partNumberFilter.toLowerCase());
      return matchesAbnormal && matchesPart;
    });
  }, [tabFilteredData, abnormalNumberFilter, partNumberFilter]);

  // 進階篩選
  const advancedFilteredData = useMemo(() => {
    if (!appliedFilters || appliedFilters.length === 0) return searchFilteredData;
    return searchFilteredData.filter(item => {
      return appliedFilters.every(filter => {
        const itemValue = item[filter.column as keyof QualityRow];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'contains':
            return itemValue !== undefined && String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
          case 'equals':
            return itemValue !== undefined && String(itemValue).toLowerCase() === filterValue.toLowerCase();
          case 'notEquals':
            return itemValue === undefined || String(itemValue).toLowerCase() !== filterValue.toLowerCase();
          case 'startsWith':
            return itemValue !== undefined && String(itemValue).toLowerCase().startsWith(filterValue.toLowerCase());
          case 'endsWith':
            return itemValue !== undefined && String(itemValue).toLowerCase().endsWith(filterValue.toLowerCase());
          case 'isEmpty':
            return !itemValue || String(itemValue).trim() === '';
          case 'isNotEmpty':
            return itemValue !== undefined && String(itemValue).trim() !== '';
          default:
            return true;
        }
      });
    });
  }, [searchFilteredData, appliedFilters]);

  // 排序
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return advancedFilteredData;

    const sorted = [...advancedFilteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const aStr = String(aValue);
      const bStr = String(bValue);

      const isNumber = /^\d/.test(aStr) && /^\d/.test(bStr);
      const isChinese = /^[\u4e00-\u9fa5]/.test(aStr) && /^[\u4e00-\u9fa5]/.test(bStr);

      let comparison = 0;
      if (isNumber) {
        const aNum = parseFloat(aStr.match(/^[\d.]+/)?.[0] || '0');
        const bNum = parseFloat(bStr.match(/^[\d.]+/)?.[0] || '0');
        comparison = aNum - bNum;
      } else if (isChinese) {
        comparison = aStr.localeCompare(bStr, 'zh-Hans-CN', { sensitivity: 'base' });
      } else {
        comparison = aStr.localeCompare(bStr, 'en', { sensitivity: 'base' });
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [advancedFilteredData, sortConfig]);

  // ===== 狀態 badge 樣式 =====
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'V':
        return { bg: 'bg-[rgba(0,184,217,0.16)]', text: 'text-[#006c9c]', label: 'V' };
      case 'G':
        return { bg: 'bg-[rgba(255,171,0,0.16)]', text: 'text-[#B76E00]', label: 'G' };
      case 'CE':
        return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]', label: 'CE' };
      case 'CL':
        return { bg: 'bg-[rgba(34,197,94,0.16)]', text: 'text-[#118D57]', label: 'CL' };
      default:
        return { bg: 'bg-[rgba(145,158,171,0.16)]', text: 'text-[#637381]', label: status };
    }
  };

  // ===== 渲染 Cell =====
  const getCellValue = (row: QualityRow, key: QualityColumnKey) => {
    const value = row[key];

    // 品質異常單號 → 藍色連結
    if (key === 'abnormalNumber') {
      return (
        <p
          className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#005eb8] text-[14px] underline cursor-pointer hover:text-[#003d73] truncate"
          onClick={() => onRowClick(row)}
          title={String(value)}
        >
          {String(value)}
        </p>
      );
    }

    // 單據狀態 → badge
    if (key === 'status') {
      const badge = getBadgeStyle(String(value));
      return (
        <div className={`${badge.bg} flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] rounded-[6px]`}>
          <p className={`font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] ${badge.text} text-[12px] text-center`}>
            {badge.label}
          </p>
        </div>
      );
    }

    // 附件 → 數字或空
    if (key === 'attachment') {
      if (!value || String(value) === '0') {
        return (
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[14px]">
            -
          </p>
        );
      }
      return (
        <div className="flex items-center gap-[4px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.3 6.7L8 12c-1 1-2.6 1-3.6 0s-1-2.6 0-3.6l5.3-5.3c.6-.6 1.6-.6 2.2 0s.6 1.6 0 2.2L6.7 10.5c-.2.2-.6.2-.8 0s-.2-.6 0-.8l4.4-4.4" stroke="#637381" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">
            {String(value)}
          </p>
        </div>
      );
    }

    // 數量
    if (key === 'quantity') {
      return (
        <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] truncate" title={String(value)}>
          {String(value)}
        </p>
      );
    }

    // 預設
    const displayValue = value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '-';
    const isPlaceholder = displayValue === '-';
    return (
      <p
        className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[14px] truncate w-full ${isPlaceholder ? 'text-[#919eab]' : 'text-[#1c252e]'}`}
        title={displayValue}
      >
        {displayValue}
      </p>
    );
  };

  const totalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full">
        {/* 表格容器 */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar ${canDragScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div style={{ minWidth: `${totalWidth}px` }}>
            {/* 表頭 */}
            <div data-table-header="true" className="flex sticky top-0 z-10 border-b border-[rgba(145,158,171,0.08)]">
              {visibleColumns.map((column, index) => (
                <DraggableColumnHeader
                  key={column.key}
                  column={column}
                  index={index}
                  moveColumn={moveColumn}
                  updateColumnWidth={updateColumnWidth}
                  sortConfig={sortConfig}
                  onSort={(key) => {
                    let direction: 'asc' | 'desc' | null = 'asc';
                    if (sortConfig.key === key && sortConfig.direction === 'asc') {
                      direction = 'desc';
                    }
                    setSortConfig({ key, direction });
                  }}
                  isLast={index === visibleColumns.length - 1}
                />
              ))}
              <div className="flex-1 bg-[#f4f6f8] min-w-0" />
            </div>

            {/* 資料列 */}
            {sortedData.map((row) => (
              <div
                key={row.id}
                className="flex border-b border-[rgba(145,158,171,0.08)] h-[76px] hover:bg-[rgba(145,158,171,0.04)]"
              >
                {visibleColumns.map((column, colIndex) => {
                  const isLastCol = colIndex === visibleColumns.length - 1;
                  return (
                    <div
                      key={`${row.id}-${column.key}`}
                      style={isLastCol
                        ? { minWidth: column.width, flex: 1 }
                        : { width: column.width }}
                      className={`flex items-center justify-start px-[16px] ${isLastCol ? '' : 'border-r border-[rgba(145,158,171,0.08)]'} overflow-hidden`}
                    >
                      {getCellValue(row, column.key)}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* 空資料提示 */}
            {sortedData.length === 0 && (
              <div className="flex items-center justify-center py-[60px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#919eab] text-[14px]">
                  無符合條件的資料
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 分頁控制 */}
        <div className="flex items-center justify-center gap-[24px] px-[23px] py-[16px] bg-white border-t border-[rgba(145,158,171,0.08)] shrink-0">
          <div className="flex items-center gap-[8px]">
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
              Rows per page:
            </p>
            <select className="px-[8px] py-[4px] border border-[rgba(145,158,171,0.2)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px]">
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
          </div>

          <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
            1-{sortedData.length} of {sortedData.length}
          </p>

          <div className="flex items-center gap-[8px]">
            <button className="p-[4px] hover:bg-[rgba(145,158,171,0.08)] rounded-[4px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="p-[4px] hover:bg-[rgba(145,158,171,0.08)] rounded-[4px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}