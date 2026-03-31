import { useState, useEffect, useRef } from 'react';
import IconsSolidIcSolarMultipleForwardLeftBroken from '@/imports/IconsSolidIcSolarMultipleForwardLeftBroken';
import { chatData, type ChatConversation } from '@/app/data/chatData';
import svgPaths from '@/imports/svg-gcyyqek0b9';
import adjustSvgPaths from '@/imports/svg-ymkervaun9';
import { SimpleDatePicker } from './SimpleDatePicker';
import { OrderHistory } from './OrderHistory';
import { SelectChatPerson } from './SelectChatPerson';
import { ChatOverlay } from './ChatOverlay';
import { useOrderStore, type HistoryEntry, nowDateStr, operatorByRole } from './OrderStoreContext';
import type { CorrectionOrderRow } from './OrderStoreContext';
import type { ScheduleLine } from './AdvancedOrderTable';
import { CorrectionDetailPage } from './CorrectionDetailPage';
import warnSvgPaths from '@/imports/svg-1p5cfw3cmy';

const STATUS_LABEL_MAP: Record<string, string> = {
  'NP': '未處理(NP)',
  'V':  '廠商確認中(V)',
  'B':  '採購確認中(B)',
  'CK': '訂單已確認(CK)',
  'CL': '關閉結案(CL)',
};

const STATUS_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  'NP': { bg: 'rgba(255,86,48,0.16)',    border: '#b71d18', text: '#b71d18' },
  'V':  { bg: 'rgba(0,184,217,0.16)',    border: '#006c9c', text: '#006c9c' },
  'B':  { bg: 'rgba(142,51,255,0.16)',   border: '#5119b7', text: '#5119b7' },
  'CK': { bg: 'rgba(34,197,94,0.16)',    border: '#118d57', text: '#118d57' },
  'CL': { bg: 'rgba(145,158,171,0.16)',  border: '#637381', text: '#637381' },
};

interface OrderDetailProps {
  onClose: () => void;
  orderData?: {
    orderNo: string;
    orderSeq: string;
    vendor: string;
    status: string;
    vendorDeliveryDate?: string;
    expectedDelivery?: string;
    scheduleLines?: ScheduleLine[];
    productionScheduleDate?: string;
    orderQty?: number;
    comparePrice?: string;
    unit?: string;
    acceptQty?: number;
    adjustmentType?: 'modify' | 'reject' | 'split' | 'split-order';
  };
  /** 狀態變更回調：newStatus / 歷程事項 / 備註 / 廠商可交貨日期 / 拆期排程 */
  onStatusChange?: (newStatus: string, eventText: string, remark?: string, vendorDeliveryDate?: string, splitLines?: ScheduleLine[]) => void;
  isReadOnly?: boolean;
  userRole?: string;
  orderHistory?: HistoryEntry[];
  /** 換貨單：調整單據時不提供不接單與拆單選項 */
  hideRejectAndSplitOrder?: boolean;
  /** 變更生管排程：隱藏聊天室入口 */
  hideChatIcon?: boolean;
  /** 變更生管排程：隱藏「訂單確認」與「調整單據」狀態操作按鈕 */
  hideStatusActions?: boolean;
}

// 日期字串是否早於今日（module-level，供 OrderDetail 使用）
function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// 調整單據表單組件
function AdjustOrderForm({ onCancel, onConfirm, orderSeq, defaultDate, hideRejectAndSplitOrder, orderQty: orderQtyProp }: {
  onCancel: () => void;
  /** onConfirm 帶回事項文字、備註、廠商交期（修改交期時）、拆期排程（拆期/拆單時） */
  onConfirm?: (reasonText: string, remark?: string, vendorDate?: string, splitLines?: ScheduleLine[]) => void;
  orderSeq?: string;
  /** 預設的廠商可交貨日期（傳入訂單預計交期作為起始值） */
  defaultDate?: string;
  /** 換貨單不提供不接單與拆單選項 */
  hideRejectAndSplitOrder?: boolean;
  /** 實際訂貨量 */
  orderQty?: number;
}) {
  const [selectedReason, setSelectedReason] = useState<'modify' | 'reject' | 'split' | 'split-order' | null>('modify');
  const [modifyDate, setModifyDate] = useState(defaultDate || '2026/03/02');
  const [modifyReason, setModifyReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [splitPeriods, setSplitPeriods] = useState('');
  const [splitOrderPeriods, setSplitOrderPeriods] = useState('');

  /** 切換選項時，重置目標選項以外的欄位回預設值 */
  const switchReason = (to: 'modify' | 'reject' | 'split' | 'split-order') => {
    setSelectedReason(to);
    setShowDatePicker(false);
    // 每次切換回 modify，日期強制重置為預設（強制廠商重填）
    if (to === 'modify') {
      setModifyDate(defaultDate || '');
      setModifyReason('');
    }
    // 切換離開 split/split-order 時清除期數（切換到另一個拆的品項時也清除）
    if (to !== 'split') setSplitPeriods('');
    if (to !== 'split-order') setSplitOrderPeriods('');
    // splitItems 由 useEffect 監聽期數自動清空（期數清掉後會自動清 items）
  };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDatePickerIndex, setActiveDatePickerIndex] = useState<number | null>(null);
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
  const datePickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 今日日期字串（YYYY/MM/DD），用於過去日期判斷與 minDate
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  })();

  // 判斷日期字串是否早於今日（過去日期）
  const isDateInPast = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  // 訂貨量（從訂單資料獲取，優先使用傳入的 prop）
  const orderQuantity = orderQtyProp ?? 100;

  // 拆期項次列表
  interface SplitItem {
    index: number;
    deliveryDate: string;
    quantity: number;
  }
  const [splitItems, setSplitItems] = useState<SplitItem[]>([]);

  // 監聽期數變化，自動生成項次
  useEffect(() => {
    const activePeriods = selectedReason === 'split' ? splitPeriods : selectedReason === 'split-order' ? splitOrderPeriods : '';
    const periods = parseInt(activePeriods);
    if (periods > 0 && (selectedReason === 'split' || selectedReason === 'split-order')) {
      // 計算每個項次的數量
      const baseQuantity = Math.floor(orderQuantity / periods);
      const remainder = orderQuantity % periods;
      
      const newItems: SplitItem[] = [];
      for (let i = 0; i < periods; i++) {
        // 前面幾個項次多分配1個，確保總和等於訂貨量
        const quantity = i < remainder ? baseQuantity + 1 : baseQuantity;
        newItems.push({
          index: i + 1,
          deliveryDate: defaultDate || '2026/03/02',
          quantity: quantity
        });
      }
      setSplitItems(newItems);
    } else {
      setSplitItems([]);
    }
  }, [splitPeriods, splitOrderPeriods, selectedReason, orderQuantity, defaultDate]);

  // 更新項次的交貨日期
  const updateSplitItemDate = (index: number, date: string) => {
    setSplitItems(prev => prev.map(item => 
      item.index === index ? { ...item, deliveryDate: date } : item
    ));
  };

  // 更新項次的交貨量
  const updateSplitItemQuantity = (index: number, quantity: number) => {
    setSplitItems(prev => prev.map(item => 
      item.index === index ? { ...item, quantity } : item
    ));
  };

  // 點擊外部關閉日期選擇器（使用 pointerdown 避免與 SimpleDatePicker click 衝突）
  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        // 延遲關閉，確保 SimpleDatePicker 的 onClick 先執行
        setTimeout(() => {
          setShowDatePicker(false);
          setActiveDatePickerIndex(null);
        }, 0);
      }
    }
    if (showDatePicker || activeDatePickerIndex !== null) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [showDatePicker, activeDatePickerIndex]);

  return (
    <div ref={containerRef} className="flex flex-col">
      {/* 標題列 */}
      <div className="flex justify-between items-center mb-[16px] flex-shrink-0">
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">請選擇異動原因</p>
        <div className="flex gap-[12px] items-center cursor-pointer hover:opacity-70">
          <div className="relative size-[36px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
              <g>
                <path clipRule="evenodd" d={adjustSvgPaths.p394a5c00} fill="url(#paint0_linear_41_6249)" fillRule="evenodd" />
                <path clipRule="evenodd" d={adjustSvgPaths.p24400500} fill="url(#paint1_linear_41_6249)" fillRule="evenodd" />
                <g opacity="0.48">
                  <path clipRule="evenodd" d={adjustSvgPaths.p9c7a500} fill="#006C9C" fillRule="evenodd" />
                  <path clipRule="evenodd" d={adjustSvgPaths.p93aab80} fill="#006C9C" fillRule="evenodd" />
                  <path clipRule="evenodd" d={adjustSvgPaths.p824e980} fill="#006C9C" fillRule="evenodd" />
                </g>
                <g>
                  <path d={adjustSvgPaths.p3cf27300} fill="white" />
                  <path d={adjustSvgPaths.p34712180} fill="white" />
                  <path d={adjustSvgPaths.p3c272500} fill="white" />
                </g>
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_41_6249" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
                  <stop stopColor="#77ED8B" />
                  <stop offset="1" stopColor="#22C55E" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_41_6249" x1="0" x2="28.9534" y1="0.000213118" y2="28.9537">
                  <stop stopColor="#00B8D9" />
                  <stop offset="1" stopColor="#006C9C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline" style={{ fontVariationSettings: "'wdth' 100" }}>
            歷程
          </p>
        </div>
      </div>

      {/* 表單內容區域 - 自然展開 */}
      <div className="bg-white rounded-[8px]">
        <div className="p-[20px] flex flex-col gap-[10px]">
          {/* 選項1: 需修改交期為 */}
          <div className="flex items-center gap-[10px] flex-shrink-0">
            <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => switchReason('modify')}>
              <div className="relative size-[24px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d={selectedReason === 'modify' ? adjustSvgPaths.p27863c80 : adjustSvgPaths.p3b336900} fill={selectedReason === 'modify' ? '#005EB8' : '#637381'} fillRule="evenodd" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">需修改交期為</p>
            </div>
            <div className="relative" ref={triggerRef}>
              <div className={`border ${selectedReason === 'modify' && isDateInPast(modifyDate) ? 'border-[#ff5630]' : selectedReason === 'modify' ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.16)]'} rounded-[8px] px-[12px] py-[6px] flex items-center gap-[12px] cursor-pointer`} onClick={() => { switchReason('modify'); setShowDatePicker(prev => !prev); }}>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px]" style={{ color: modifyDate && defaultDate && modifyDate !== defaultDate ? '#ff5630' : '#919eab' }}>{modifyDate}</p>
                <div className="relative size-[16px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={adjustSvgPaths.p2b32f00} fill="#1C252E" />
                  </svg>
                </div>
              </div>
                {showDatePicker && (
                <div ref={datePickerRef} className="absolute top-0 left-[calc(100%+10px)] z-50">
                  <SimpleDatePicker
                    selectedDate={modifyDate}
                    minDate={todayStr}
                    onDateSelect={(date) => {
                      setModifyDate(date);
                      setShowDatePicker(false);
                    }}
                  />
                </div>
              )}
            </div>
            <div className={`border ${selectedReason === 'modify' ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.16)]'} rounded-[8px] px-[12px] py-[6px] flex-1`}>
              <input
                type="text"
                className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] w-full outline-none bg-transparent placeholder:text-[#919eab]"
                value={modifyReason}
                onChange={(e) => setModifyReason(e.target.value.slice(0, 50))}
                placeholder="請簡述原因，限50字"
                maxLength={50}
              />
            </div>
          </div>

          {/* 選項2: 不接單 */}
          {!hideRejectAndSplitOrder && (
          <div className="flex items-center gap-[10px] flex-shrink-0">
            <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => switchReason('reject')}>
              <div className="relative size-[24px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d={selectedReason === 'reject' ? adjustSvgPaths.p27863c80 : adjustSvgPaths.p3b336900} fill={selectedReason === 'reject' ? '#005EB8' : '#637381'} fillRule="evenodd" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">不接單</p>
            </div>
            <div className={`border ${selectedReason === 'reject' ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.16)]'} rounded-[8px] px-[12px] py-[6px] flex-1`}>
              <input
                type="text"
                className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] w-full outline-none bg-transparent placeholder:text-[#919eab]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value.slice(0, 50))}
                placeholder="請簡述原因，限50字"
                maxLength={50}
              />
            </div>
          </div>
          )}

          {/* 選項3: 需拆期 */}
          <div className="flex items-center gap-[10px] flex-shrink-0">
            <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => switchReason('split')}>
              <div className="relative size-[24px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d={selectedReason === 'split' ? adjustSvgPaths.p27863c80 : adjustSvgPaths.p3b336900} fill={selectedReason === 'split' ? '#005EB8' : '#637381'} fillRule="evenodd" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">拆 Schedule Line</p>
            </div>
            <div className={`border ${selectedReason === 'split' ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.16)]'} rounded-[8px] px-[12px] py-[6px] w-[120px]`}>
              <input
                type="text"
                className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] w-full outline-none bg-transparent placeholder:text-[#919eab] disabled:cursor-not-allowed"
                value={splitPeriods}
                onChange={(e) => setSplitPeriods(e.target.value)}
                placeholder="請輸入期數"
                disabled={selectedReason !== 'split'}
              />
            </div>
          </div>

          {/* 選項4: 拆單 */}
          {!hideRejectAndSplitOrder && (
          <div className="flex items-center gap-[10px] flex-shrink-0">
            <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => switchReason('split-order')}>
              <div className="relative size-[24px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d={selectedReason === 'split-order' ? adjustSvgPaths.p27863c80 : adjustSvgPaths.p3b336900} fill={selectedReason === 'split-order' ? '#005EB8' : '#637381'} fillRule="evenodd" />
                </svg>
              </div>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">拆單</p>
            </div>
            <div className={`border ${selectedReason === 'split-order' ? 'border-[#005eb8]' : 'border-[rgba(145,158,171,0.16)]'} rounded-[8px] px-[12px] py-[6px] w-[120px]`}>
              <input
                type="text"
                className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px] w-full outline-none bg-transparent placeholder:text-[#919eab] disabled:cursor-not-allowed"
                value={splitOrderPeriods}
                onChange={(e) => setSplitOrderPeriods(e.target.value)}
                placeholder="請輸入期數"
                disabled={selectedReason !== 'split-order'}
              />
            </div>
          </div>
          )}
        </div>

        {/* 表格區域 - 只在需拆期/拆單時顯示 */}
        {(selectedReason === 'split' || selectedReason === 'split-order') && splitItems.length > 0 && (
          <div className="border-t border-[rgba(145,158,171,0.16)] mt-[10px]">
            {/* 表頭 */}
            <div className="flex gap-[20px] px-[45px] py-[10px] border-b border-[rgba(145,158,171,0.16)] text-[14px] leading-[22px] bg-white">
              <div className="w-[100px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[#1c252e]">
                  {selectedReason === 'split-order' ? '新序號' : '項次'}
                </p>
              </div>
              <div className="w-[120px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[#1c252e]">預計交期</p>
              </div>
              <div className="w-[160px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[#ff3030]">廠商可交貨日期</p>
              </div>
              <div className="w-[120px]">
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[#ff3030]">交貨量</p>
              </div>
            </div>
            {/* 項次列表 */}
            {splitItems.map((item, idx) => (
              <div key={item.index} className="flex gap-[20px] px-[45px] py-[10px] border-b border-[rgba(145,158,171,0.16)] text-[14px] leading-[22px]">
                <div className="w-[100px] flex items-center">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab]">
                    {selectedReason === 'split-order'
                      ? (parseInt(orderSeq || '10') + idx * 10)
                      : item.index}
                  </p>
                </div>
                <div className="w-[120px] flex items-center">
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[#919eab]">{defaultDate || '2026/03/02'}</p>
                </div>
                <div className="w-[160px] relative">
                  <div 
                    ref={activeDatePickerIndex === item.index ? triggerRef : undefined}
                    className={`border ${isDateInPast(item.deliveryDate) ? 'border-[#ff5630]' : 'border-[#005eb8]'} rounded-[8px] px-[12px] py-[6px] flex items-center gap-[12px] cursor-pointer`}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = containerRef.current?.getBoundingClientRect();
                      
                      if (containerRect) {
                        // 日期選擇器預估高度約300px
                        const datePickerHeight = 300;
                        let top = rect.top - datePickerHeight - 8;
                        
                        // 確保不超出容器頂部
                        if (top < containerRect.top) {
                          top = containerRect.top + 8;
                        }
                        
                        setDatePickerPosition({
                          top: top,
                          left: rect.left
                        });
                      }
                      setActiveDatePickerIndex(item.index);
                    }}
                  >
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[14px]" style={{ color: item.deliveryDate && defaultDate && item.deliveryDate !== defaultDate ? '#ff5630' : '#919eab' }}>{item.deliveryDate}</p>
                    <div className="relative size-[16px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                        <path d={adjustSvgPaths.p2b32f00} fill="#1C252E" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-[120px]">
                  <div className={`border ${!item.quantity || item.quantity <= 0 ? 'border-[#ff5630]' : 'border-[#005eb8]'} rounded-[8px] px-[12px] py-[6px]`}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] w-full outline-none bg-transparent"
                      style={{ color: item.quantity !== orderQuantity ? '#ff5630' : '#1c252e' }}
                      value={item.quantity === 0 ? '' : String(item.quantity)}
                      placeholder="0"
                      onChange={(e) => {
                        const raw = e.target.value;
                        // 只允許純正整數（不含 0 開頭、不含 0）
                        if (raw === '') {
                          updateSplitItemQuantity(item.index, 0);
                          return;
                        }
                        if (/^[1-9][0-9]*$/.test(raw)) {
                          updateSplitItemQuantity(item.index, parseInt(raw, 10));
                        }
                        // 其他格式（0010、018、-1 等）直接忽略，不更新
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 交貨量加總驗證（拆期/拆單時） */}
        {(selectedReason === 'split' || selectedReason === 'split-order') && splitItems.length > 0 && (() => {
          const totalQty = splitItems.reduce((s, item) => s + (item.quantity || 0), 0);
          const isMatch = totalQty === orderQuantity;
          return (
            <div className={`flex items-center gap-[6px] px-[32px] py-[6px] ${isMatch ? '' : ''}`}>
              <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] ${isMatch ? 'text-[#637381]' : 'text-[#ff5630]'}`}>
                總交貨量({totalQty})需等於訂貨量({orderQuantity})
              </p>
            </div>
          );
        })()}

        {/* 提示訊息 + 錯誤警示（顯示在卡片內，交貨量加總下方） */}
        {(() => {
          // 驗證邏輯（與底部按鈕共用）
          const _modifyDateError = selectedReason === 'modify' && (
            modifyDate === (defaultDate || '') || isDateInPast(modifyDate)
          );
          const _activePeriodStr = selectedReason === 'split' ? splitPeriods : selectedReason === 'split-order' ? splitOrderPeriods : '';
          const _activePeriodNum = parseInt(_activePeriodStr);
          const _splitPeriodsError = (selectedReason === 'split' || selectedReason === 'split-order')
            && (_activePeriodStr.trim() === '' || isNaN(_activePeriodNum) || _activePeriodNum < 1 || !Number.isInteger(_activePeriodNum));
          const _splitItemDateError = (selectedReason === 'split' || selectedReason === 'split-order')
            && splitItems.length > 0 && splitItems.some(item => isDateInPast(item.deliveryDate));
          const _splitItemQtyError = (selectedReason === 'split' || selectedReason === 'split-order')
            && splitItems.length > 0 && splitItems.some(item => !item.quantity || item.quantity <= 0);

          const _modifyDateErrMsg = selectedReason === 'modify'
            ? (modifyDate === (defaultDate || '') ? '請選擇新交期（不可與原預計交期相同）'
              : isDateInPast(modifyDate) ? '廠商可交貨日期不可為過去日期'
              : null)
            : null;
          const _errorMsg = _modifyDateErrMsg
            ?? (_splitPeriodsError ? '請輸入有效的期數（正整數）' : null)
            ?? (_splitItemDateError ? '廠商可交貨日期不可為過去日期' : null)
            ?? (_splitItemQtyError ? '交貨量必須大於 0' : null);

          return (
            <>
              {/* 錯誤訊息 */}
              {_errorMsg && (
                <div className="flex items-center gap-[6px] px-[32px] py-[6px]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#ff5630] text-[12px] leading-[18px]">{_errorMsg}</p>
                </div>
              )}
              {/* 提示訊息 */}
              <div className="flex items-center gap-[4px] px-[32px] py-[12px]">
                <div className="relative size-[16px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path clipRule="evenodd" d={adjustSvgPaths.p144ee300} fill="#637381" fillRule="evenodd" />
                  </svg>
                </div>
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[18px] text-[#637381] text-[12px]">異動原因送出後不可再進行修改，請確認後再送出</p>
              </div>
            </>
          );
        })()}
      </div>

      {/* 底部按鈕 - 固定在底部 */}
      {(() => {
        // ── 驗證邏輯 ──
        // 1. 需修改交期：① 必須改動日期（不能與預設交期相同）② 不能是過去日期
        const modifyDateError = selectedReason === 'modify' && (
          modifyDate === (defaultDate || '') || isDateInPast(modifyDate)
        );

        // 2. 拆期/拆單：期數必須是有效正整數
        const activePeriodStr = selectedReason === 'split' ? splitPeriods : selectedReason === 'split-order' ? splitOrderPeriods : '';
        const activePeriodNum = parseInt(activePeriodStr);
        const splitPeriodsError = (selectedReason === 'split' || selectedReason === 'split-order')
          && (activePeriodStr.trim() === '' || isNaN(activePeriodNum) || activePeriodNum < 1 || !Number.isInteger(activePeriodNum));

        // 3. 拆期/拆單：每列廠商可交貨日期不可為過去
        const splitItemDateError = (selectedReason === 'split' || selectedReason === 'split-order')
          && splitItems.length > 0
          && splitItems.some(item => isDateInPast(item.deliveryDate));

        // 4. 拆期/拆單：每列交貨量必須 > 0
        const splitItemQtyError = (selectedReason === 'split' || selectedReason === 'split-order')
          && splitItems.length > 0
          && splitItems.some(item => !item.quantity || item.quantity <= 0);

        // 5. 交貨量加總需等於訂貨量（原有邏輯）
        const splitQtyMismatch = (selectedReason === 'split' || selectedReason === 'split-order') && splitItems.length > 0
          && splitItems.reduce((s, item) => s + (item.quantity || 0), 0) !== orderQuantity;

        const hasError = modifyDateError || splitPeriodsError || splitItemDateError || splitItemQtyError || splitQtyMismatch;

        // 錯誤訊息（優先顯示第一個錯誤；modify 狀況分兩種）
        const modifyDateErrMsg = selectedReason === 'modify'
          ? (modifyDate === (defaultDate || '') ? '請選擇新交期（不可與原預計交期相同）'
            : isDateInPast(modifyDate) ? '廠商可交貨日期不可為過去日期'
            : null)
          : null;
        // splitQtyMismatch 不在底部重複顯示（表格下方已有紅字提示）
        const errorMsg = modifyDateErrMsg
          ?? (splitPeriodsError ? '請輸入有效的期數（正整數）' : null)
          ?? (splitItemDateError ? '廠商可交貨日期不可為過去日期' : null)
          ?? (splitItemQtyError ? '交貨量必須大於 0' : null);

        return (
      <div className="flex gap-[12px] mt-[24px] flex-shrink-0">
        <div className={`${hasError ? 'bg-[rgba(145,158,171,0.24)] cursor-not-allowed' : 'bg-[#004680] cursor-pointer hover:bg-[#003a6b]'} flex-1 h-[36px] rounded-[8px] transition-colors flex items-center justify-center`} onClick={() => {
          if (hasError) return;
          let reasonText = '提交採購';
          let remark = '';
          let vendorDate: string | undefined;
          let splitLines: ScheduleLine[] | undefined;
          switch (selectedReason) {
            case 'modify':
              reasonText = `需修改交期為 ${modifyDate}`;
              remark = modifyReason;
              vendorDate = modifyDate;
              break;
            case 'reject':
              reasonText = '不接單';
              remark = rejectReason;
              break;
            case 'split': {
              const sorted = [...splitItems].sort((a, b) =>
                a.deliveryDate.localeCompare(b.deliveryDate)
              );
              reasonText = `拆 Schedule Line（${splitPeriods} 期）`;
              remark = sorted.map((item, idx) =>
                `項次${idx + 1}：${item.deliveryDate} × ${item.quantity}`
              ).join('；');
              splitLines = sorted.map((item, idx) => ({ ...item, index: idx + 1 }));
              // 以最後一筆（最晚）日期帶回列表欄位
              if (sorted.length > 0) vendorDate = sorted[sorted.length - 1].deliveryDate;
              break;
            }
            case 'split-order': {
              const sorted = [...splitItems].sort((a, b) =>
                a.deliveryDate.localeCompare(b.deliveryDate)
              );
              reasonText = `拆單（${splitOrderPeriods} 期）`;
              remark = sorted.map((item, idx) =>
                `項次${parseInt(orderSeq || '10') + idx * 10}：${item.deliveryDate} × ${item.quantity}`
              ).join('；');
              splitLines = sorted.map((item, idx) => ({ ...item, index: parseInt(orderSeq || '10') + idx * 10 }));
              // 以最後一筆（最晚）日期帶回列表欄位
              if (sorted.length > 0) vendorDate = sorted[sorted.length - 1].deliveryDate;
              break;
            }
          }
          onConfirm?.(reasonText, remark || undefined, vendorDate, splitLines);
        }}>
          <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">提交採購</p>
        </div>
        <div className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors flex items-center justify-center" onClick={onCancel}>
          <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">取消</p>
        </div>
      </div>
        );
      })()}


      {/* 固定定位的日期選擇器 */}
      {activeDatePickerIndex !== null && (
        <div 
          ref={datePickerRef} 
          className="fixed z-[9999]"
          style={{
            top: `${datePickerPosition.top}px`,
            left: `${datePickerPosition.left}px`
          }}
        >
          <SimpleDatePicker
            selectedDate={splitItems.find(item => item.index === activeDatePickerIndex)?.deliveryDate || defaultDate || '2026/03/02'}
            minDate={todayStr}
            onDateSelect={(date) => {
              updateSplitItemDate(activeDatePickerIndex, date);
              setActiveDatePickerIndex(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function OrderDetail({ onClose, orderData, onStatusChange, isReadOnly, userRole, orderHistory, hideRejectAndSplitOrder, hideChatIcon, hideStatusActions }: OrderDetailProps) {
  const { orders, updateOrderFields, addOrderHistory, getOrderHistory, correctionOrders } = useOrderStore();

  // 從 store 即時查詢當前訂單的 ID（用於直接讀取最新歷程，不依賴外部 prop 快照）
  const liveOrder = orders.find(
    o => o.orderNo === orderData?.orderNo && o.orderSeq === orderData?.orderSeq
  );
  const liveOrderId = liveOrder?.id;
  const isRejectedOrder = liveOrder?.isRejectedOrder === true;

  // ── 查找與此訂單關聯的修正單 ──
  const relatedCorrectionOrders = correctionOrders.filter(
    c => c.orderNo === orderData?.orderNo && c.orderSeq === orderData?.orderSeq
  );

  // ── 修正單明細檢視狀態 ──
  const [viewingCorrectionOrder, setViewingCorrectionOrder] = useState<CorrectionOrderRow | null>(null);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false); // 退回廠商表單
  const [returnReason, setReturnReason] = useState(''); // 退回原因（限50字）
  const [showForceCloseForm, setShowForceCloseForm] = useState(false); // 強制關單表單
  const [forceCloseReason, setForceCloseReason] = useState(''); // 強制關單原因（限50字）
  const [showForceCloseConfirm, setShowForceCloseConfirm] = useState(false); // 二次確認彈窗
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showSelectPerson, setShowSelectPerson] = useState(false); // 控制是否顯示選擇人員彈出框
  const [showChatOverlay, setShowChatOverlay] = useState(false); // 控制是否顯示聊天對話框

  // ► 單據在提交採購(NP/V→B)或退回廠商(B→V)後開啟時，自動展開歷程面板
  // V 狀態：最新歷程含「退回廠商」→ 採購退回，廠商需看原因
  // B 狀態：最新歷程含「需修改交期」「拆單」「拆 Schedule Line」「不接單」→ 廠商有調整動作，採購需看
  useEffect(() => {
    const status = orderData?.status;
    if (status !== 'V' && status !== 'B') return;
    const latest = orderHistory?.[0]; // 前插陣列（newest first），[0] 為最新
    if (!latest) return;
    const isReturnEvent = status === 'V'
      ? latest.event.includes('退回廠商')
      : latest.event.includes('需修改交期') ||
        latest.event.includes('拆單') ||
        latest.event.includes('拆 Schedule Line') ||
        latest.event.includes('不接單') ||
        latest.event.includes('抽單');
    if (isReturnEvent) {
      setShowOrderHistory(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null); // 選中的聊天對話
  const [chatIconPosition, setChatIconPosition] = useState({ top: 0, right: 0 }); // 聊天icon位置
  const [showMore, setShowMore] = useState(false); // 控制 more 展開
  const chatIconRef = useRef<HTMLDivElement>(null);

  // ── 可編輯交貨排程 ───────────────────────────────────────────────────────────
  interface EditableLine {
    uid: number;
    index: number | string;
    expectedDelivery: string;
    vendorDeliveryDate: string;
    productionScheduleDate: string;
    quantity: number;
    isOriginal: boolean;
  }
  const [editableLines, setEditableLines] = useState<EditableLine[]>([]);
  const [activeDp, setActiveDp] = useState<{ uid: number; field: 'vendor' | 'prod' } | null>(null);
  const [dpPos, setDpPos] = useState({ top: 0, left: 0 });
  const dpRef = useRef<HTMLDivElement>(null);
  const schedTableRef = useRef<HTMLDivElement>(null);
  const lineUidRef = useRef(0);
  const initialLinesRef = useRef<EditableLine[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showAddLineWarning, setShowAddLineWarning] = useState(false);
  const [pendingAddUid, setPendingAddUid] = useState<number | null>(null);

  // 點擊聊天icon
  const handleChatIconClick = () => {
    if (chatIconRef.current) {
      const rect = chatIconRef.current.getBoundingClientRect();
      // 彈出框顯示在icon左側
      setChatIconPosition({
        top: rect.top,
        right: window.innerWidth - rect.left + 10 // 10px 間距
      });
      setShowSelectPerson(true);
    }
  };

  // 選擇人員後的處理
  const handleSelectPerson = (personName: string) => {
    setShowSelectPerson(false);
    // 找到對應的聊天對話
    const chatConversation = chatData.find(chat => chat.name === personName);
    if (chatConversation) {
      setSelectedChat(chatConversation);
      setShowChatOverlay(true);
    }
  };

  // ── 可編輯排程：初始化（當訂單切換時重設）────────────────────────────────────
  useEffect(() => {
    // 預計交期：優先使用訂單本身的 expectedDelivery，無值時 fallback
    const orderExpDel = orderData?.expectedDelivery || '';
    if (orderData?.scheduleLines && orderData.scheduleLines.length > 0) {
      lineUidRef.current = orderData.scheduleLines.length;
      const lines = orderData.scheduleLines.map((l, i) => ({
        uid: i + 1,
        index: l.index,
        expectedDelivery: l.expectedDelivery || orderExpDel,
        // 廠商可交貨日期：若無資料，預設為預計交期（NP 尚未廠商調整時，兩個值相同）
        vendorDeliveryDate: l.deliveryDate || orderData.vendorDeliveryDate || l.expectedDelivery || orderExpDel,
        productionScheduleDate: l.productionScheduleDate || orderData.productionScheduleDate || '',
        quantity: l.quantity,
        isOriginal: true,
      }));
      setEditableLines(lines);
      initialLinesRef.current = lines;
    } else {
      lineUidRef.current = 1;
      // 廠商可交貨日期：若無資料，預設為預計交期（NP 尚未廠商調整時，兩個值相同）
      const vd = orderData?.vendorDeliveryDate || orderExpDel;
      const lines = [{
        uid: 1, index: 1,
        expectedDelivery: orderExpDel,
        vendorDeliveryDate: vd,
        productionScheduleDate: orderData?.productionScheduleDate || '',
        quantity: orderData?.orderQty ?? 100,
        isOriginal: true,
      }];
      setEditableLines(lines);
      initialLinesRef.current = lines;
    }
    setScheduleError(null);
    setScheduleSaved(false);
  }, [orderData?.orderNo, orderData?.orderSeq, orderData?.vendorDeliveryDate, orderData?.scheduleLines]);

  // 點擊外部關閉日期選擇器
  useEffect(() => {
    if (!activeDp) return;
    function onDown(e: PointerEvent) {
      if (dpRef.current && !dpRef.current.contains(e.target as Node)) {
        setTimeout(() => setActiveDp(null), 0);
      }
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [activeDp]);

  const openDp = (uid: number, field: 'vendor' | 'prod', e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dpHeight = 300;
    let top = rect.bottom + 8;
    if (top + dpHeight > window.innerHeight) top = rect.top - dpHeight - 8;
    setDpPos({ top, left: rect.left });
    setActiveDp({ uid, field });
  };

  const updateEditLine = (uid: number, patch: Partial<EditableLine>) =>
    setEditableLines(prev => prev.map(l => l.uid === uid ? { ...l, ...patch } : l));

  const addLineAfter = (uid: number) => {
    const idx = editableLines.findIndex(l => l.uid === uid);
    const ref = editableLines[idx];
    const newUid = ++lineUidRef.current;
    const next = [...editableLines];
    next.splice(idx + 1, 0, {
      uid: newUid, index: 0,
      expectedDelivery: ref.expectedDelivery,
      vendorDeliveryDate: ref.vendorDeliveryDate,
      productionScheduleDate: '',
      quantity: 0,
      isOriginal: false,
    });
    setEditableLines(next.map((l, i) => ({ ...l, index: i + 1 })));
  };

  const removeLineAt = (uid: number) => {
    if (editableLines.length <= 1) return;
    setEditableLines(prev =>
      prev.filter(l => l.uid !== uid).map((l, i) => ({ ...l, index: i + 1 }))
    );
  };

  // 差異天數 = 生管用交貨日期 − 廠商可交貨日期
  const calcLineDiff = (prod: string, vendor: string): number | null => {
    if (!prod || !vendor) return null;
    try {
      const parse = (s: string) => {
        const [y, m, d] = s.split('/').map(Number);
        return new Date(y, m - 1, d).getTime();
      };
      return Math.round((parse(prod) - parse(vendor)) / 86_400_000);
    } catch { return null; }
  };

  // ── 差異天數計算（廠商可交貨日期 - 預計交期）──
  const SCHEDULED_DATE = '2026/03/02'; // 預計交期（目前為固定值）

  const calcDayDiff = (vendorDate: string | undefined, scheduledDate: string): number | null => {
    if (!vendorDate) return null;
    try {
      const parse = (s: string) => {
        const [y, m, d] = s.split('/').map(Number);
        return new Date(y, m - 1, d).getTime();
      };
      return Math.round((parse(vendorDate) - parse(scheduledDate)) / 86_400_000);
    } catch {
      return null;
    }
  };

  const vendorDateDisplay =
    orderData?.vendorDeliveryDate ||
    ((orderData?.status === 'CK' || orderData?.status === 'CL') ? SCHEDULED_DATE : '');

  const dayDiff = calcDayDiff(vendorDateDisplay || undefined, SCHEDULED_DATE);

  const dayDiffDisplay = dayDiff === null ? '-' : dayDiff > 0 ? `+${dayDiff}` : `${dayDiff}`;
  const dayDiffColor =
    dayDiff === null ? '#919eab' :
    dayDiff > 0     ? '#b71d18' :   // 延遲：紅
    dayDiff < 0     ? '#118d57' :   // 提前：綠
                      '#919eab';    // 準時：灰

  return (
    <>
      {/* ── 成功 Toast ── */}
      {showSaveToast && (
        <div
          className="fixed top-[24px] left-1/2 z-[9999] -translate-x-1/2 flex items-center gap-[10px] bg-[#1c252e] text-white px-[20px] py-[12px] rounded-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.24)] animate-[fadeInDown_0.25s_ease]"
          style={{ pointerEvents: 'none' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px]">
            交貨排程已儲存
          </p>
        </div>
      )}
      <div className="relative w-full h-full bg-white flex flex-col" data-name="訂單明細">
        {/* 移除絕對定位關閉按鈕 */}

        {/* Main Content */}
        <div className="px-[36px] py-[30px] flex-1 min-h-0 flex flex-col gap-[0px] overflow-y-auto">

          {/* 基本資料標題列：上一頁icon + status badge + 標題 + more + 接單時間 */}
          <div className="flex gap-[12px] items-center pb-[16px]">
            {/* 上一頁 icon */}
            <div
              onClick={onClose}
              className="overflow-clip relative shrink-0 size-[29px] cursor-pointer hover:opacity-70 transition-opacity"
              aria-label="返回"
            >
              <IconsSolidIcSolarMultipleForwardLeftBroken />
            </div>
            {/* 訂單狀態 badge */}
            {(() => {
              const sc = STATUS_COLOR_MAP[orderData?.status ?? 'NP'] ?? STATUS_COLOR_MAP['NP'];
              return (
                <div
                  className="rounded-[8px] px-[12px] py-[4px] flex-shrink-0 border"
                  style={{ backgroundColor: sc.bg, borderColor: sc.border }}
                >
                  <p
                    className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-center whitespace-nowrap text-[16px]"
                    style={{ color: sc.text }}
                  >
                    <span className="block mb-0">
                      {STATUS_LABEL_MAP[orderData?.status ?? 'NP'] ?? (orderData?.status ?? 'NP')}
                    </span>
                    <span className="block">
                      {orderData ? `${orderData.orderNo}${orderData.orderSeq}` : '4000649723'}
                    </span>
                  </p>
                </div>
              );
            })()}
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">訂單明細</p>
            <p
              className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70 select-none"
              style={{ fontVariationSettings: "'wdth' 100" }}
              onClick={() => setShowMore(v => !v)}
            >
              more
            </p>
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px]">{liveOrder?.orderDate || '-'}</p>
          </div>

          {/* 分隔線 */}
          <div className="border-b border-[rgba(145,158,171,0.24)] mb-[16px]" />

          {/* more 展開面板 */}
          {showMore && (
            <div className="bg-[rgba(0,94,184,0.04)] border border-[rgba(0,94,184,0.16)] rounded-[8px] p-[16px] flex flex-col gap-[10px] text-[14px] leading-[22px]">
              {/* more row 1: 在途量 / 未交量 / 單項小記 */}
              <div className="flex gap-[20px]">
                {[
                  { label: '在途量',   value: String(liveOrder?.inTransitQty ?? 0) },
                  { label: '未交量',   value: String(liveOrder?.undeliveredQty ?? 0) },
                  { label: '單項小記', value: liveOrder?.lineItemNote || '-' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-[2px] flex-1">
                    <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">{label}</p>
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{value}</p>
                  </div>
                ))}
              </div>
              {/* more row 2: 項目註記(內部)（全寬） */}
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">項目註記(內部)</p>
                {isReadOnly ? (
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.internalNote || '-'}</p>
                ) : (
                  <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#005eb8] underline cursor-pointer hover:opacity-70">{liveOrder?.internalNote || '(限GEM採購可改)'}</p>
                )}
              </div>
              {/* more row 3: 物料PO內文（全寬） */}
              <div className="flex flex-col gap-[2px]">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">物料PO內文</p>
                {isReadOnly ? (
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.materialPOContent || '-'}</p>
                ) : (
                  <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#005eb8] underline cursor-pointer hover:opacity-70">{liveOrder?.materialPOContent || '(限GEM採購可改)'}</p>
                )}
              </div>

            </div>
          )}

          {/* 基本資料內容 */}
          <div className="flex flex-col gap-[10px] text-[14px] leading-[22px]">

            {/* 第一行：訂單類型 公司 採購組織 訂單序號 單號序號 */}
            <div className="flex gap-[20px]">
              {[
                { label: '訂單類型', value: liveOrder?.orderType || 'Z2QB' },
                { label: '公司',     value: liveOrder?.company || '巨大機械' },
                { label: '採購組織', value: liveOrder?.purchaseOrg || '台灣廠生產採購組織' },
                { label: '訂單序號', value: orderData?.orderSeq || '10' },
                { label: '訂單號碼', value: orderData?.orderNo || '400649731' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-[2px] flex-1">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">{label}</p>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{value}</p>
                </div>
              ))}
            </div>

            {/* 第二行：採購人員 訂貨量 驗收量 比對單價 單位 */}
            <div className="flex gap-[20px]">
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">採購人員</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.purchaser || 'OOO'}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">訂貨量</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{orderData?.orderQty ?? '-'}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">驗收量</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{orderData?.acceptQty ?? 0}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">比對單價</p>
                {isReadOnly ? (
                  <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381]">{orderData?.comparePrice || '-'}</p>
                ) : (
                  <p className="[text-decoration-skip-ink:none] decoration-solid font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#005eb8] underline cursor-pointer hover:opacity-70">{orderData?.comparePrice || '-'}</p>
                )}
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">單位</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{orderData?.unit || '-'}</p>
              </div>
            </div>

            {/* 第三行：leadtime 廠商(編號) 料號 客戶品牌 廠商料號 */}
            <div className="flex gap-[20px]">
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[#1c252e]">leadtime</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.leadtime ?? 5}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">廠商(編號)</p>
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381]">{orderData?.vendor || '廠商名稱(00010000)'}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">料號</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.materialNo || '-'}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">客戶品牌</p>
                <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.customerBrand || '-'}</p>
              </div>
              <div className="flex flex-col gap-[2px] flex-1">
                <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">廠商料號</p>
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.vendorMaterialNo || '-'}</p>
              </div>
            </div>

            {/* 第四行：品名（全寬） */}
            <div className="flex flex-col gap-[2px]">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">品名</p>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.productName || '-'}</p>
            </div>

            {/* 第五行：規格（全寬） */}
            <div className="flex flex-col gap-[2px]">
              <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]">規格</p>
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381]">{liveOrder?.specification || '-'}</p>
            </div>

          </div>

          {/* 交貨排程區域 */}
          <div className="bg-[#f4f6f8] rounded-[8px] flex flex-col p-[24px]">
            {showReturnForm ? (
              // ── 退回廠商：輸入原因表單 ──
              <>
                {/* 標題列 */}
                <div className="flex justify-between items-center mb-[16px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                    請輸入退回原因
                  </p>
                  <div className="flex gap-[12px] items-center">
                    {/* 強制關單按鈕（B 狀態 + 採購/巨大角色）*/}
                    {orderData?.status === 'B' && (userRole === 'purchaser' || userRole === 'giant') && (
                      <div
                        className="bg-[#ff5630] h-[32px] px-[14px] rounded-[8px] cursor-pointer hover:bg-[#e8401a] transition-colors flex items-center justify-center"
                        onClick={() => { setShowReturnForm(false); setReturnReason(''); setShowForceCloseForm(true); }}
                      >
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[13px] text-white whitespace-nowrap">強制關單</p>
                      </div>
                    )}
                    {/* 聊天Icon */}
                    <div
                      ref={chatIconRef}
                      className="relative size-[36px] cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={handleChatIconClick}
                    >
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
                        <g>
                          <path clipRule="evenodd" d={svgPaths.p394a5c00} fill="url(#paint0_linear_chat_ret)" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p24400500} fill="url(#paint1_linear_chat_ret)" fillRule="evenodd" />
                          <g opacity="0.48">
                            <path clipRule="evenodd" d={svgPaths.p9c7a500} fill="#006C9C" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p93aab80} fill="#006C9C" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p824e980} fill="#006C9C" fillRule="evenodd" />
                          </g>
                          <g>
                            <path d={svgPaths.p3cf27300} fill="white" />
                            <path d={svgPaths.p34712180} fill="white" />
                            <path d={svgPaths.p3c272500} fill="white" />
                          </g>
                        </g>
                        <defs>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chat_ret" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
                            <stop stopColor="#77ED8B" />
                            <stop offset="1" stopColor="#22C55E" />
                          </linearGradient>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_chat_ret" x1="0" x2="28.9534" y1="0.00021312" y2="28.9537">
                            <stop stopColor="#00B8D9" />
                            <stop offset="1" stopColor="#006C9C" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    {/* 歷程 */}
                    <p
                      className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                      onClick={() => setShowOrderHistory(true)}
                    >
                      歷程
                    </p>
                  </div>
                </div>

                {/* 原因輸入區 */}
                <div className="bg-white rounded-[8px] flex-1">
                  <textarea
                    className="w-full h-[320px] p-[12px] rounded-[8px] resize-none outline-none border border-[#005eb8] font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#1c252e] placeholder-[#919eab]"
                    placeholder="請簡述原因，限50字"
                    maxLength={50}
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                  />
                </div>

                {/* 底部按鈕 */}
                <div className="flex gap-[12px] mt-[24px]">
                  <div
                    className="bg-[#004680] flex-1 h-[36px] rounded-[8px] cursor-pointer hover:bg-[#003a6b] transition-colors flex items-center justify-center"
                    onClick={() => {
                      setShowReturnForm(false);
                      setReturnReason('');
                      if (onStatusChange) {
                        onStatusChange('V', '退回廠商 (B→V)', returnReason);
                      }
                    }}
                  >
                    <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">退回廠商</p>
                  </div>
                  <div
                    className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors flex items-center justify-center"
                    onClick={() => { setShowReturnForm(false); setReturnReason(''); }}
                  >
                    <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">取消</p>
                  </div>
                </div>
              </>
            ) : showForceCloseForm ? (
              // ── 強制關單：輸入原因表單 ──
              <>
                {/* 標題列 */}
                <div className="flex justify-between items-center mb-[16px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                    請輸入強制關單原因
                  </p>
                  <div className="flex gap-[12px] items-center">
                    {/* 聊天Icon */}
                    <div
                      ref={chatIconRef}
                      className="relative size-[36px] cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={handleChatIconClick}
                    >
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
                        <g>
                          <path clipRule="evenodd" d={svgPaths.p394a5c00} fill="url(#paint0_linear_chat_fc)" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p24400500} fill="url(#paint1_linear_chat_fc)" fillRule="evenodd" />
                          <g opacity="0.48">
                            <path clipRule="evenodd" d={svgPaths.p9c7a500} fill="#006C9C" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p93aab80} fill="#006C9C" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p824e980} fill="#006C9C" fillRule="evenodd" />
                          </g>
                          <g>
                            <path d={svgPaths.p3cf27300} fill="white" />
                            <path d={svgPaths.p34712180} fill="white" />
                            <path d={svgPaths.p3c272500} fill="white" />
                          </g>
                        </g>
                        <defs>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chat_fc" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
                            <stop stopColor="#77ED8B" />
                            <stop offset="1" stopColor="#22C55E" />
                          </linearGradient>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_chat_fc" x1="0" x2="28.9534" y1="0.00021312" y2="28.9537">
                            <stop stopColor="#00B8D9" />
                            <stop offset="1" stopColor="#006C9C" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    {/* 歷程 */}
                    <p
                      className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                      onClick={() => setShowOrderHistory(true)}
                    >
                      歷程
                    </p>
                  </div>
                </div>

                {/* 原因輸入區 */}
                <div className="bg-white rounded-[8px] flex-1">
                  <textarea
                    className="w-full h-[320px] p-[12px] rounded-[8px] resize-none outline-none border border-[#ff5630] font-['Public_Sans:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#1c252e] placeholder-[#919eab]"
                    placeholder="請簡述原因，限50字"
                    maxLength={50}
                    value={forceCloseReason}
                    onChange={e => setForceCloseReason(e.target.value)}
                  />
                </div>

                {/* 底部按鈕 */}
                <div className="flex gap-[12px] mt-[24px]">
                  <div
                    className={`flex-1 h-[36px] rounded-[8px] transition-colors flex items-center justify-center ${
                      forceCloseReason.trim()
                        ? 'bg-[#ff5630] cursor-pointer hover:bg-[#e8401a]'
                        : 'bg-[rgba(255,86,48,0.4)] cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (forceCloseReason.trim()) {
                        setShowForceCloseConfirm(true);
                      }
                    }}
                  >
                    <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">確認關單</p>
                  </div>
                  <div
                    className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors flex items-center justify-center"
                    onClick={() => { setShowForceCloseForm(false); setForceCloseReason(''); }}
                  >
                    <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">取消</p>
                  </div>
                </div>

                {/* ── 二次確認彈窗 ── */}
                {showForceCloseConfirm && (
                  <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={() => setShowForceCloseConfirm(false)}>
                    {/* 半透明遮罩 */}
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
                    {/* 彈窗 */}
                    <div className="relative bg-white rounded-[16px] shadow-[0px_24px_48px_-8px_rgba(145,158,171,0.2)] w-[400px] max-w-[90vw] overflow-hidden" onClick={e => e.stopPropagation()}>
                      {/* 頂部紅色警示條 */}
                      <div className="bg-[#ff5630] h-[4px] w-full" />
                      {/* 圖示 + 標題 */}
                      <div className="flex flex-col items-center pt-[32px] px-[24px]">
                        <div className="flex items-center justify-center size-[56px] rounded-full bg-[rgba(255,86,48,0.12)] mb-[16px]">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[18px] leading-[28px] text-[#1c252e] text-center">
                          確認強制關單？
                        </p>
                        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#637381] text-center mt-[8px]">
                          此操作將把訂單狀態從 <span className="font-semibold text-[#5119b7]">B</span> 直接變更為 <span className="font-semibold text-[#637381]">CL</span>，變更後無法復原。
                        </p>
                      </div>
                      {/* 原因摘要 */}
                      <div className="mx-[24px] mt-[16px] p-[12px] bg-[#f4f6f8] rounded-[8px]">
                        <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] leading-[18px] text-[#919eab] mb-[4px]">關單原因</p>
                        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#1c252e] break-all">{forceCloseReason}</p>
                      </div>
                      {/* 按鈕 */}
                      <div className="flex gap-[12px] p-[24px]">
                        <div
                          className="flex-1 h-[40px] rounded-[8px] border border-[rgba(145,158,171,0.32)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors flex items-center justify-center"
                          onClick={() => setShowForceCloseConfirm(false)}
                        >
                          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">返回</p>
                        </div>
                        <div
                          className="flex-1 h-[40px] rounded-[8px] bg-[#ff5630] cursor-pointer hover:bg-[#e8401a] transition-colors flex items-center justify-center"
                          onClick={() => {
                            setShowForceCloseConfirm(false);
                            setShowForceCloseForm(false);
                            const reason = forceCloseReason;
                            setForceCloseReason('');
                            if (onStatusChange) {
                              onStatusChange('CL', '強制關閉 (B→CL)', reason);
                            }
                          }}
                        >
                          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">確認關單</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : !showAdjustForm ? (
              // ── 原本的交貨排程表格 ──
              <>
                {/* 標題列 */}
                <div className="flex justify-between items-center mb-[16px]">
                  <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                    {(orderData?.status === 'CK' || orderData?.status === 'CL') ? '交貨排程' : '請確認交貨排程是否OK'}
                  </p>
                  <div className="flex gap-[12px] items-center">
                    {/* 強制關單按鈕（B 狀態 + 採購/巨大角色）*/}
                    {orderData?.status === 'B' && (userRole === 'purchaser' || userRole === 'giant') && !isReadOnly && (
                      <div
                        className="bg-[#ff5630] h-[32px] px-[14px] rounded-[8px] cursor-pointer hover:bg-[#e8401a] transition-colors flex items-center justify-center"
                        onClick={() => setShowForceCloseForm(true)}
                      >
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[13px] text-white whitespace-nowrap">強制關單</p>
                      </div>
                    )}
                    {/* 抽單按鈕（V 狀態 + 採購/巨大角色）：把單據從 V 抽回 B，採購再決定後續 */}
                    {orderData?.status === 'V' && (userRole === 'purchaser' || userRole === 'giant') && !isReadOnly && (
                      <div
                        className="bg-[#637381] h-[32px] px-[14px] rounded-[8px] cursor-pointer hover:bg-[#4a555f] transition-colors flex items-center justify-center"
                        onClick={() => {
                          if (onStatusChange) {
                            onStatusChange('B', '抽單 (V→B)');
                          }
                        }}
                      >
                        <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[22px] text-[13px] text-white whitespace-nowrap">抽單</p>
                      </div>
                    )}
                    {/* 聊天Icon：hideChatIcon=true 時隱藏 */}
                    {!hideChatIcon && (
                      <div
                        ref={chatIconRef}
                        className="relative size-[36px] cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={handleChatIconClick}
                      >
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
                          <g>
                            <path clipRule="evenodd" d={svgPaths.p394a5c00} fill="url(#paint0_linear_chat)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p24400500} fill="url(#paint1_linear_chat)" fillRule="evenodd" />
                            <g opacity="0.48">
                              <path clipRule="evenodd" d={svgPaths.p9c7a500} fill="#006C9C" fillRule="evenodd" />
                              <path clipRule="evenodd" d={svgPaths.p93aab80} fill="#006C9C" fillRule="evenodd" />
                              <path clipRule="evenodd" d={svgPaths.p824e980} fill="#006C9C" fillRule="evenodd" />
                            </g>
                            <g>
                              <path d={svgPaths.p3cf27300} fill="white" />
                              <path d={svgPaths.p34712180} fill="white" />
                              <path d={svgPaths.p3c272500} fill="white" />
                            </g>
                          </g>
                          <defs>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chat" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
                              <stop stopColor="#77ED8B" />
                              <stop offset="1" stopColor="#22C55E" />
                            </linearGradient>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_chat" x1="0" x2="28.9534" y1="0.00021312" y2="28.9537">
                              <stop stopColor="#00B8D9" />
                              <stop offset="1" stopColor="#006C9C" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                    {/* 歷程 */}
                    <p
                      className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:opacity-70"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                      onClick={() => setShowOrderHistory(true)}
                    >
                      歷程
                    </p>
                  </div>
                </div>

                {/* 表格區域 */}
                {hideChatIcon ? (
                  /* ── 變更生管排程模式：完整可編輯表格 ── */
                  (() => {
                    const TH = ({ children, red }: { children: React.ReactNode; red?: boolean }) => (
                      <p className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] ${red ? 'text-[#ff3b30]' : 'text-[#1c252e]'}`}>{children}</p>
                    );
                    const ChevronDown = () => (
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0">
                        <path d="M1 1l5 5 5-5" stroke="#1C252E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    );
                    return (
                      <div ref={schedTableRef} className="bg-white rounded-[8px] overflow-visible">
                        {/* 表頭 */}
                        <div className="flex gap-[16px] px-[20px] py-[10px] border-b border-[rgba(145,158,171,0.16)] items-center">
                          <div className="w-[40px] shrink-0"><TH>項次</TH></div>
                          <div className="w-[110px] shrink-0"><TH>預計交期</TH></div>
                          <div className="w-[150px] shrink-0"><TH>廠商可交貨日期(cfn1)</TH></div>
                          <div className="w-[150px] shrink-0"><TH red>生管用交貨日期(cfn2)</TH></div>
                          <div className="w-[120px] shrink-0"><TH red>交貨量</TH></div>
                          <div className="w-[120px] shrink-0"><TH>差異天數(cfn2-1)</TH></div>
                          <div className="w-[72px] shrink-0" />
                        </div>
                        {/* 資料列 */}
                        {editableLines.map((line, rowIdx) => {
                          const diff = calcLineDiff(line.productionScheduleDate, line.vendorDeliveryDate);
                          const diffDisplay = diff === null ? '-' : diff > 0 ? `+${diff}` : `${diff}`;
                          const diffColor = diff === null ? '#919eab' : diff > 0 ? '#b71d18' : diff < 0 ? '#118d57' : '#919eab';
                          const isSingleRow = editableLines.length === 1;
                          const isCfn2Missing = !line.productionScheduleDate;
                          const isCfn2Past = !isCfn2Missing && isPastDate(line.productionScheduleDate);
                          return (
                            <div key={line.uid} className="flex gap-[16px] px-[20px] py-[10px] border-b border-[rgba(145,158,171,0.08)] last:border-b-0 items-center">
                              <div className="w-[40px] shrink-0">
                                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">{rowIdx + 1}</p>
                              </div>
                              <div className="w-[110px] shrink-0">
                                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">{line.expectedDelivery || '-'}</p>
                              </div>
                              <div className="w-[150px] shrink-0">
                                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">
                                  {line.vendorDeliveryDate || '-'}
                                </p>
                              </div>
                              <div className="w-[150px] shrink-0">
                                <div
                                  className={`border ${isCfn2Past ? 'border-[#ff5630]' : 'border-[rgba(145,158,171,0.16)] hover:border-[#005eb8]'} rounded-[8px] px-[12px] py-[6px] flex items-center gap-[6px] cursor-pointer transition-colors`}
                                  onClick={e => openDp(line.uid, 'prod', e)}
                                >
                                  <p className={`font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] flex-1 ${isCfn2Missing ? 'text-[#919eab]' : isCfn2Past ? 'text-[#ff5630]' : 'text-[#1c252e]'}`}>
                                    {line.productionScheduleDate || '請選擇日期'}
                                  </p>
                                  <ChevronDown />
                                </div>
                              </div>
                              <div className="w-[120px] shrink-0">
                                <div className="border border-[rgba(145,158,171,0.2)] hover:border-[#005eb8] rounded-[8px] px-[12px] py-[6px] transition-colors">
                                  <input
                                    type="number"
                                    className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] w-full outline-none bg-transparent placeholder:text-[#919eab]"
                                    value={line.quantity || ''}
                                    placeholder="0"
                                    onChange={e => { updateEditLine(line.uid, { quantity: parseInt(e.target.value) || 0 }); setScheduleError(null); setScheduleSaved(false); }}
                                  />
                                </div>
                              </div>
                              <div className="w-[120px] shrink-0">
                                <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px]" style={{ color: diffColor }}>{diffDisplay}</p>
                              </div>
                              <div className="w-[72px] shrink-0 flex items-center gap-[8px]">
                                {/* + 按鈕：按後先顯示警示，確認才加行 */}
                                <button
                                  onClick={() => {
                                    setPendingAddUid(line.uid);
                                    setShowAddLineWarning(true);
                                  }}
                                  className="w-[32px] h-[32px] rounded-full bg-[#1D7BF5] hover:bg-[#1565d8] flex items-center justify-center transition-colors shrink-0"
                                  title="新增一行"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                </button>
                                {/* - 按鈕：只有一行時隱藏，且項次 1 不提供刪除 */}
                                {!isSingleRow && rowIdx !== 0 && (
                                  <button
                                    onClick={() => { removeLineAt(line.uid); setScheduleError(null); setScheduleSaved(false); }}
                                    className="w-[28px] h-[28px] rounded-full bg-[rgba(255,86,48,0.12)] hover:bg-[rgba(255,86,48,0.28)] flex items-center justify-center transition-colors shrink-0"
                                    title="移除此行"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6H10" stroke="#b71d18" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* 合計列 */}
                        {(() => {
                          const orderQtyVal = orderData?.orderQty ?? 0;
                          const totalQty = editableLines.reduce((s, l) => s + (l.quantity || 0), 0);
                          const isMatch = orderQtyVal > 0 && totalQty === orderQtyVal;
                          return (
                            <div className={`flex items-center gap-[8px] px-[20px] py-[10px] border-t border-[rgba(145,158,171,0.16)] ${isMatch ? 'bg-[rgba(34,197,94,0.06)]' : 'bg-[rgba(255,86,48,0.06)]'}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                                {isMatch
                                  ? <path d="M20 6L9 17L4 12" stroke="#118d57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  : <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
                              </svg>
                              <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] leading-[20px] ${isMatch ? 'text-[#118d57]' : 'text-[#ff5630]'}`}>
                                交貨量合計：{totalQty}　/　訂貨量：{orderQtyVal}{isMatch ? '　✓ 符合' : '　✗ 不符，須調整至相等'}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()
                ) : (
                  /* ── 一般訂單 / 換貨單模式：簡易唯讀排程表 ── */
                  <div className="bg-white rounded-[8px] overflow-visible">
                    {/* 拆單提示：若由 1 期拆為多期，顯示原本期數 */}
                    {editableLines.length > 1 && (
                      <div className="flex items-center gap-[6px] px-[20px] pt-[12px] pb-[4px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px] text-[#ff5630]">
                          {orderData?.adjustmentType === 'split-order' ? '拆單' : '拆 Schedule Line'}：原本 1 期 →
                          調整為 {editableLines.length} 期
                        </p>
                      </div>
                    )}
                    {/* 表頭 */}
                    <div className="flex gap-[16px] px-[20px] py-[10px] border-b border-[rgba(145,158,171,0.16)] items-center">
                      <div className="w-[60px] shrink-0">
                        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#1c252e]">{orderData?.adjustmentType === 'split-order' ? '新序號' : '項次'}</p>
                      </div>
                      <div className="w-[140px] shrink-0">
                        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#1c252e]">預計交期</p>
                      </div>
                      <div className="w-[180px] shrink-0">
                        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#1c252e]">廠商可交貨日期</p>
                      </div>
                      <div className="w-[120px] shrink-0">
                        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#1c252e]">交貨量</p>
                      </div>
                      <div className="w-[140px] shrink-0">
                        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[22px] text-[#1c252e]">差異天數</p>
                      </div>
                    </div>
                    {/* 資料列 */}
                    {editableLines.map((line) => {
                      const lineDiff = calcDayDiff(line.vendorDeliveryDate || undefined, line.expectedDelivery);
                      const lineDiffDisplay = lineDiff === null ? '-' : lineDiff > 0 ? `+${lineDiff}` : `${lineDiff}`;
                      const lineDiffColor = lineDiff === null ? '#919eab' : lineDiff > 0 ? '#b71d18' : lineDiff < 0 ? '#118d57' : '#919eab';
                      const vendorDateChanged = line.vendorDeliveryDate && line.expectedDelivery &&
                        line.vendorDeliveryDate !== line.expectedDelivery;
                      const origOrderQty = orderData?.orderQty ?? 0;
                      const qtyChanged = origOrderQty > 0 && line.quantity !== origOrderQty;
                      return (
                        <div key={line.uid} className="flex gap-[16px] px-[20px] py-[10px] border-b border-[rgba(145,158,171,0.08)] last:border-b-0 items-center">
                          <div className="w-[60px] shrink-0">
                            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">{line.index}</p>
                          </div>
                          <div className="w-[140px] shrink-0">
                            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px] text-[#919eab]">{line.expectedDelivery || '-'}</p>
                          </div>
                          <div className="w-[180px] shrink-0">
                            {isRejectedOrder ? (
                              <p
                                className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px]"
                                style={{ color: '#ff5630', textDecoration: 'line-through', textDecorationColor: '#ff5630' }}
                              >
                                {line.expectedDelivery || '-'}
                              </p>
                            ) : (
                              <p
                                className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px]"
                                style={{ color: vendorDateChanged ? '#ff5630' : '#919eab' }}
                              >
                                {line.vendorDeliveryDate || '-'}
                              </p>
                            )}
                          </div>
                          <div className="w-[120px] shrink-0">
                            <p
                              className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px]"
                              style={{ color: qtyChanged ? '#ff5630' : '#919eab' }}
                            >
                              {line.quantity}
                            </p>
                          </div>
                          <div className="w-[140px] shrink-0">
                            <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[22px]" style={{ color: lineDiffColor }}>{lineDiffDisplay}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 交貨排程 DialogActions（確認修改 / 取消）── 僅變更生管排程模式 */}
                {hideChatIcon && (() => {
                  const orderQtyVal = orderData?.orderQty ?? 100;
                  const totalQty = editableLines.reduce((s, l) => s + (l.quantity || 0), 0);
                  
                  const hasMissingCfn2 = editableLines.some(l => !l.productionScheduleDate);
                  const hasPastCfn2 = editableLines.some(l => l.productionScheduleDate && isPastDate(l.productionScheduleDate));
                  const hasZeroQty = editableLines.some(l => !l.quantity || l.quantity <= 0);
                  const isQtyMismatch = orderQtyVal > 0 && totalQty !== orderQtyVal;
                  // 多筆時，生管用交貨日期不可重複
                  const filledDates = editableLines.map(l => l.productionScheduleDate).filter(Boolean);
                  const hasDuplicateCfn2 = editableLines.length > 1 && filledDates.length !== new Set(filledDates).size;
                  // validationError: 顯示在錯誤 bar（不含數量不符，合計列已呈現）
                  const validationError = hasMissingCfn2
                    ? '請填寫所有項次的生管用交貨日期(cfn2)'
                    : hasPastCfn2
                    ? '生管用交貨日期(cfn2)不可為過去日期'
                    : hasDuplicateCfn2
                    ? '各項次的生管用交貨日期(cfn2)不可重複'
                    : hasZeroQty
                    ? '每個項次的交貨量須大於 0'
                    : null;
                  // isBlocked: 按鈕 disabled 條件（包含數量不符）
                  const isBlocked = !!validationError || isQtyMismatch;

                  const doSave = () => {
                    const found = orders.find(o => o.orderNo === orderData?.orderNo && o.orderSeq === orderData?.orderSeq);
                    if (found) {
                      // 取最後一筆有生管用交貨日期的排程，更新 orderRow 欄位（供列表顯示）
                      const lastWithDate = [...editableLines].reverse().find(l => l.productionScheduleDate);
                      updateOrderFields(found.id, {
                        scheduleLines: editableLines.map((l, i) => ({
                          index: i + 1,
                          expectedDelivery: l.expectedDelivery,
                          deliveryDate: l.vendorDeliveryDate,
                          productionScheduleDate: l.productionScheduleDate,
                          quantity: l.quantity,
                        })),
                        productionScheduleDate: lastWithDate?.productionScheduleDate ?? '',
                      });
                      const linesSummary = editableLines
                        .map(l => `生管用交貨日期${l.productionScheduleDate || '(未設)'} x ${l.quantity}`)
                        .join('、');
                      addOrderHistory(found.id, {
                        date: nowDateStr(),
                        event: '修改交貨排程',
                        operator: operatorByRole(userRole),
                        remark: linesSummary,
                      });
                    }
                    initialLinesRef.current = editableLines.map(l => ({ ...l }));
                    setScheduleError(null);
                    setScheduleSaved(true);
                    setShowAddLineWarning(false);
                    // 成功 Toast：顯示 3 秒後自動消失
                    setShowSaveToast(true);
                    setTimeout(() => setShowSaveToast(false), 3000);
                  };

                  const handleConfirm = () => {
                    if (validationError) {
                      setScheduleError(validationError);
                      setScheduleSaved(false);
                      return;
                    }
                    doSave();
                  };
                  const handleCancel = () => {
                    setEditableLines(initialLinesRef.current.map(l => ({ ...l })));
                    setScheduleError(null);
                    setScheduleSaved(false);
                    setShowAddLineWarning(false);
                  };
                  return (
                    <div className="mt-[12px]">
                      {/* 增加項次警示 bar */}
                      {showAddLineWarning && (
                        <div className="flex items-center gap-[0px] mb-[10px] rounded-[8px] overflow-hidden" style={{ background: '#FFF3CD' }}>
                          {/* 警示 icon */}
                          <div className="flex items-center pl-[14px] pr-[10px] py-[10px] shrink-0">
                            <div className="relative shrink-0 size-[20px]">
                              <svg className="block size-full" fill="none" viewBox="0 0 20 18">
                                <path d={warnSvgPaths.p3f8a5c00} fill="#FFAB00" />
                              </svg>
                            </div>
                          </div>
                          {/* 文字 */}
                          <p className="flex-1 font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] leading-[20px] text-[#7A4100] pr-[8px]">
                            請注意，增加交貨排程後，後續不能開立修正單
                          </p>
                          {/* cancel 按鈕 */}
                          <button
                            onClick={() => { setShowAddLineWarning(false); setPendingAddUid(null); }}
                            className="shrink-0 h-[28px] px-[14px] rounded-[6px] mr-[6px] flex items-center justify-center cursor-pointer transition-colors"
                            style={{ background: '#FFAB00' }}
                          >
                            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#7A4100] whitespace-nowrap">取消</span>
                          </button>
                          {/* OK 按鈕：確認後才真正加行 */}
                          <button
                            onClick={() => {
                              if (pendingAddUid !== null) { addLineAfter(pendingAddUid); setScheduleError(null); setScheduleSaved(false); }
                              setShowAddLineWarning(false);
                              setPendingAddUid(null);
                            }}
                            className="shrink-0 h-[28px] px-[10px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                          >
                            <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#7A4100] whitespace-nowrap">確認新增</span>
                          </button>

                        </div>
                      )}
                      {/* 驗證錯誤訊息：沿用警示 bar 格式（同 showAddLineWarning） */}
                      {(scheduleError || validationError) && (
                        <div className="flex items-center gap-[0px] mb-[10px] rounded-[8px] overflow-hidden" style={{ background: '#FFEAEA' }}>
                          <div className="flex items-center pl-[14px] pr-[10px] py-[10px] shrink-0">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-11a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#FF5630"/>
                            </svg>
                          </div>
                          <p className="flex-1 font-['Public_Sans:Regular',sans-serif] font-normal text-[13px] leading-[20px] text-[#B71D18] pr-[8px]">
                            {scheduleError || validationError}
                          </p>
                        </div>
                      )}
                      {scheduleSaved && !scheduleError && !validationError && (
                        <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px] text-[#118d57] mb-[8px] px-[4px]">
                          ✓ 交貨排程已儲存
                        </p>
                      )}
                      {/* Figma DialogActions 樣式 */}
                      <div className="flex gap-[12px] items-center justify-end">
                        <button
                          onClick={handleConfirm}
                          disabled={isBlocked}
                          className={`flex-1 h-[36px] min-w-[64px] rounded-[8px] flex items-center justify-center transition-colors ${isBlocked ? 'bg-[rgba(145,158,171,0.24)] cursor-not-allowed' : 'bg-[#004680] cursor-pointer hover:bg-[#003a6b]'}`}
                        >
                          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white whitespace-nowrap">確認修改</p>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 h-[36px] min-w-[64px] rounded-[8px] border border-[rgba(145,158,171,0.32)] flex items-center justify-center cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors"
                        >
                          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px] whitespace-nowrap">取消</p>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 底部按鈕 */}
                {!isReadOnly && !hideStatusActions && (
                  <div className="flex gap-[12px] mt-[24px]">
                    <div className="bg-[#004680] flex-1 h-[36px] rounded-[8px] cursor-pointer hover:bg-[#003a6b] transition-colors flex items-center justify-center" onClick={() => {
                      if (onStatusChange) {
                        const s = orderData?.status ?? 'NP';
                        // 訂單確認：不論當前狀態，一律直接轉 CK（不論哪個角色執行）
                        onStatusChange('CK', `訂單確認 (${s}→CK)`);
                      }
                    }}>
                      <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">訂單確認</p>
                    </div>
                    {orderData?.status === 'B' ? (
                      <div className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors flex items-center justify-center" onClick={() => setShowReturnForm(true)}>
                        <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">退回廠商</p>
                      </div>
                    ) : (
                      <div className="flex-1 h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.32)] cursor-pointer hover:bg-[rgba(145,158,171,0.08)] transition-colors flex items-center justify-center" onClick={() => setShowAdjustForm(true)}>
                        <p className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">調整單據</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // ── 調整單據表單 ──
              <AdjustOrderForm 
                onCancel={() => setShowAdjustForm(false)} 
                onConfirm={(reasonText, remark, vendorDate, splitLines) => {
                  setShowAdjustForm(false);
                  if (onStatusChange) {
                    onStatusChange('B', reasonText, remark, vendorDate, splitLines);
                  }
                }} 
                orderSeq={orderData?.orderSeq}
                defaultDate={SCHEDULED_DATE}
                hideRejectAndSplitOrder={hideRejectAndSplitOrder}
                orderQty={orderData?.orderQty}
              />
            )}
          </div>
        </div>
      </div>

      {/* 訂單歷程 */}
      {showOrderHistory && (
        <OrderHistory
          onClose={() => setShowOrderHistory(false)}
          entries={liveOrderId !== undefined ? getOrderHistory(liveOrderId) : (orderHistory ?? [])}
          docSeqNo={orderData ? `${orderData.orderNo}${orderData.orderSeq}` : undefined}
          onCorrectionDocClick={(docNo) => {
            const found = correctionOrders.find(c => c.correctionDocNo === docNo);
            if (found) {
              setShowOrderHistory(false);
              setViewingCorrectionOrder(found);
            }
          }}
        />
      )}

      {/* 選擇人員彈出框 */}
      {showSelectPerson && (
        <SelectChatPerson
          onClose={() => setShowSelectPerson(false)}
          onSelect={handleSelectPerson}
          position={chatIconPosition}
        />
      )}

      {/* 聊天對話框 */}
      {showChatOverlay && selectedChat && (
        <ChatOverlay
          onClose={() => setShowChatOverlay(false)}
          chatConversation={selectedChat}
        />
      )}

      {/* 交貨排程日期選擇器（固定定位） */}
      {activeDp !== null && (
        <div
          ref={dpRef}
          className="fixed z-[9999]"
          style={{ top: `${dpPos.top}px`, left: `${dpPos.left}px` }}
        >
          <SimpleDatePicker
            selectedDate={
              activeDp.field === 'vendor'
                ? editableLines.find(l => l.uid === activeDp.uid)?.vendorDeliveryDate || ''
                : editableLines.find(l => l.uid === activeDp.uid)?.productionScheduleDate || ''
            }
            minDate={activeDp.field !== 'vendor' ? (() => {
              const d = new Date();
              return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
            })() : undefined}
            onDateSelect={date => {
              const field = activeDp.field === 'vendor' ? 'vendorDeliveryDate' : 'productionScheduleDate';
              updateEditLine(activeDp.uid, { [field]: date });
              setActiveDp(null);
            }}
          />
        </div>
      )}

      {/* 修正單明細檢視 Overlay */}
      {viewingCorrectionOrder && liveOrder && (() => {
        const c = viewingCorrectionOrder;
        const orderForDetail: import('./AdvancedOrderTable').OrderRow = {
          id: c.id,  // 使用修正單 id，以正確查找修正歷程
          status: liveOrder.status,
          orderNo: c.orderNo,
          orderDate: c.orderDate,
          orderType: liveOrder.orderType,
          company: c.company,
          purchaseOrg: c.purchaseOrg,
          orderSeq: c.orderSeq,
          docSeqNo: (c.orderNo || '') + (c.orderSeq || ''),
          orderQty: c.orderQty,
          acceptQty: c.acceptQty,
          vendorCode: c.vendorCode,
          vendorName: c.vendorName,
          materialNo: c.materialNo,
          productName: c.productName,
          specification: liveOrder.specification,
          expectedDelivery: c.expectedDelivery || liveOrder.expectedDelivery,
          vendorDeliveryDate: c.vendorDeliveryDate,
          inTransitQty: c.inTransitQty ?? liveOrder.inTransitQty,
          undeliveredQty: liveOrder.undeliveredQty,
        };
        const vm = c.correctionStatus === 'DR' ? 'edit' as const
          : c.correctionStatus === 'V' ? 'vendorReview' as const
          : c.correctionStatus === 'B' ? 'purchaserReview' as const
          : 'readonly' as const;
        return (
          <div className="fixed inset-0 z-[250] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div className="bg-white rounded-[16px] shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] w-[90vw] h-[90vh] max-w-[1400px] overflow-hidden flex flex-col">
              <CorrectionDetailPage
                orders={[orderForDetail]}
                currentIndex={0}
                correctionDocNo={c.correctionDocNo}
                onBack={() => setViewingCorrectionOrder(null)}
                onIndexChange={() => {}}
                viewMode={vm}
                isExistingDoc={true}
                initialNewMaterialNo={c.newMaterialNo}
                initialCorrectionNote={c.correctionNote}
                initialSavedDeliveryRows={c.savedDeliveryRows}
                initialSavedPeriodInput={c.savedPeriodInput}
                correctionType={c.correctionType}
                correctionStatusCode={c.correctionStatus}
                userRole={userRole as any}
              />
            </div>
          </div>
        );
      })()}
    </>
  );
}