import { BaseOverlay } from './BaseOverlay';
import svgPaths from '@/imports/svg-vcni536e4m';
import { useState } from 'react';
import { DropdownSelect } from './DropdownSelect';
import { CheckboxIcon } from './CheckboxIcon';

interface AddVendorMailOverlayProps {
  onClose: () => void;
  onSave?: () => void;
}

// 廠商行資料類型
interface VendorRow {
  id: string;
  vendorCode: string;
  vendorName: string;
  orgCode: string;
  all: boolean;
  miniPlatform: boolean;
  newOrder: boolean;
  correctNotice: boolean;
  paperInvoice: boolean;
  shipNotice: boolean;
  priceAnomaly: boolean;
  partsMaintenance: boolean;
  sampleOrder: boolean;
}

export function AddVendorMailOverlay({ onClose, onSave }: AddVendorMailOverlayProps) {
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [vendorRows, setVendorRows] = useState<VendorRow[]>([
    {
      id: '1',
      vendorCode: '000100461',
      vendorName: '天心',
      orgCode: '4111',
      all: true,
      miniPlatform: false,
      newOrder: false,
      correctNotice: false,
      paperInvoice: false,
      shipNotice: false,
      priceAnomaly: false,
      partsMaintenance: false,
      sampleOrder: false,
    },
    {
      id: '2',
      vendorCode: '000100461',
      vendorName: '天心',
      orgCode: '4112',
      all: true,
      miniPlatform: false,
      newOrder: false,
      correctNotice: false,
      paperInvoice: false,
      shipNotice: false,
      priceAnomaly: false,
      partsMaintenance: false,
      sampleOrder: false,
    },
  ]);

  // 處理ALL checkbox的切換
  const handleAllToggle = (rowId: string) => {
    setVendorRows(vendorRows.map(row => {
      if (row.id === rowId) {
        const newAllState = !row.all;
        return {
          ...row,
          all: newAllState,
          miniPlatform: newAllState,
          newOrder: newAllState,
          correctNotice: newAllState,
          paperInvoice: newAllState,
          shipNotice: newAllState,
          priceAnomaly: newAllState,
          partsMaintenance: newAllState,
          sampleOrder: newAllState,
        };
      }
      return row;
    }));
  };

  // 處理個別checkbox的切換
  const handleCheckboxToggle = (rowId: string, field: keyof Omit<VendorRow, 'id' | 'vendorCode' | 'vendorName' | 'orgCode' | 'all'>) => {
    setVendorRows(vendorRows.map(row => {
      if (row.id === rowId) {
        const newRow = { ...row, [field]: !row[field] };
        // 檢查是否所有欄位都被選中
        const allChecked = newRow.miniPlatform && newRow.newOrder && 
                           newRow.correctNotice && newRow.paperInvoice && 
                           newRow.shipNotice && newRow.priceAnomaly &&
                           newRow.partsMaintenance && newRow.sampleOrder;
        newRow.all = allChecked;
        return newRow;
      }
      return row;
    }));
  };

  // 新增廠商行
  const addVendorRow = () => {
    const newRow: VendorRow = {
      id: Date.now().toString(),
      vendorCode: selectedVendor,
      vendorName: '天心',
      orgCode: '',
      all: false,
      miniPlatform: false,
      newOrder: false,
      correctNotice: false,
      paperInvoice: false,
      shipNotice: false,
      priceAnomaly: false,
      partsMaintenance: false,
      sampleOrder: false,
    };
    setVendorRows([...vendorRows, newRow]);
  };

  // 刪除廠商行
  const deleteVendorRow = (rowId: string) => {
    if (vendorRows.length > 1) {
      setVendorRows(vendorRows.filter(row => row.id !== rowId));
    }
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="1263px" maxHeight="772px">
      <div className="relative bg-white w-[1263px] h-[772px] rounded-[16px]">
        {/* 關閉按鈕 - 灰色，左上角 */}
        <button 
          className="absolute left-[50px] top-[24px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <div className="relative size-[24px]">
            <div className="absolute inset-[8.33%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path 
                  clipRule="evenodd" 
                  d={svgPaths.p275a9800} 
                  fill="#637381" 
                  fillRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        </button>

        {/* 標題 */}
        <div className="absolute left-[50px] top-[58px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            請輸入廠商編號
          </p>
        </div>

        {/* 廠商選擇下拉框 */}
        <div className="absolute left-[50px] top-[110px] w-[272px]">
          <DropdownSelect
            label=""
            value={selectedVendor}
            onChange={(value) => setSelectedVendor(value || '')}
            options={[
              { value: '', label: 'All' },
              { value: '000100461', label: '天心(000100461)' },
              { value: '000100462', label: '速聯(000100462)' },
              { value: '000100463', label: '速聯(000100463)' },
            ]}
            placeholder="All"
            searchable={true}
          />
        </div>

        {/* 新增按鈕 */}
        <button 
          className="absolute left-[359px] top-[117px] size-[40px] cursor-pointer hover:opacity-70 transition-opacity"
          onClick={addVendorRow}
        >
          <div className="absolute inset-[8.33%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path 
                clipRule="evenodd" 
                d={svgPaths.pa468400} 
                fill="#1D7BF5" 
                fillRule="evenodd" 
              />
            </svg>
          </div>
        </button>

        {/* 儲存按鈕 */}
        <button
          onClick={() => {
            onSave?.();
            onClose();
          }}
          className="absolute right-[59px] top-[127px] bg-[#00559c] h-[36px] px-[12px] rounded-[8px] min-w-[130px] hover:bg-[#004680] transition-colors flex items-center justify-center"
        >
          <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">
            儲存
          </p>
        </button>

        {/* 表格背景容器 */}
        <div className="absolute left-[50px] top-[175px] w-[1154px] h-[573px] bg-[#f4f6f8] rounded-[8px] p-[24px]">
          <div className="bg-white rounded-[8px] h-full flex flex-col overflow-hidden">
            {/* 表格標題行 */}
            <div className="flex items-center h-[56px] bg-white border-t border-[rgba(145,158,171,0.08)] shrink-0">
              <div className="w-[24px] ml-[12px]"></div>
              <div className="w-[150px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  廠商編號
                </p>
              </div>
              <div className="w-[100px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  採購組織
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  ALL
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  小平台
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  新訂單
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  修正單通知
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  紙本發票
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  出貨通知
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  單價異常
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  零件維護
                </p>
              </div>
              <div className="w-[80px] flex items-center justify-center shrink-0">
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[14px] text-black">
                  索樣單
                </p>
              </div>
            </div>

            {/* 表格數據行容器 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {vendorRows.map((row) => (
                <div key={row.id} className="flex items-center h-[76px] border-t border-[rgba(145,158,171,0.08)]">
                  {/* 刪除按鈕 */}
                  <div className="w-[24px] ml-[12px] flex items-center justify-center shrink-0">
                    <button
                      onClick={() => deleteVendorRow(row.id)}
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      <div className="relative size-[24px]">
                        <div className="absolute inset-[8.29%_12.5%_8.37%_12.5%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
                            <g>
                              <path d={svgPaths.p309dd480} fill="#1D7BF5" />
                              <path 
                                clipRule="evenodd" 
                                d={svgPaths.p2846fa00} 
                                fill="#1D7BF5" 
                                fillRule="evenodd" 
                              />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* 廠商編號 */}
                  <div className="w-[150px] flex items-center justify-center shrink-0">
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[15px]">
                      {row.vendorName}({row.vendorCode})
                    </p>
                  </div>

                  {/* 採購組織 */}
                  <div className="w-[100px] flex items-center justify-center shrink-0">
                    <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#1c252e] text-[14px]">
                      {row.orgCode}
                    </p>
                  </div>

                  {/* ALL */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.all} 
                      onClick={() => handleAllToggle(row.id)} 
                    />
                  </div>

                  {/* 小平台 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.miniPlatform} 
                      onClick={() => handleCheckboxToggle(row.id, 'miniPlatform')} 
                    />
                  </div>

                  {/* 新訂單 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.newOrder} 
                      onClick={() => handleCheckboxToggle(row.id, 'newOrder')} 
                    />
                  </div>

                  {/* 修正單通知 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.correctNotice} 
                      onClick={() => handleCheckboxToggle(row.id, 'correctNotice')} 
                    />
                  </div>

                  {/* 紙本發票 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.paperInvoice} 
                      onClick={() => handleCheckboxToggle(row.id, 'paperInvoice')} 
                    />
                  </div>

                  {/* 出貨通知 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.shipNotice} 
                      onClick={() => handleCheckboxToggle(row.id, 'shipNotice')} 
                    />
                  </div>

                  {/* 單價異常 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.priceAnomaly} 
                      onClick={() => handleCheckboxToggle(row.id, 'priceAnomaly')} 
                    />
                  </div>

                  {/* 零件維護 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.partsMaintenance} 
                      onClick={() => handleCheckboxToggle(row.id, 'partsMaintenance')} 
                    />
                  </div>

                  {/* 索樣單 */}
                  <div className="w-[80px] flex items-center justify-center shrink-0">
                    <CheckboxIcon 
                      checked={row.sampleOrder} 
                      onClick={() => handleCheckboxToggle(row.id, 'sampleOrder')} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
}