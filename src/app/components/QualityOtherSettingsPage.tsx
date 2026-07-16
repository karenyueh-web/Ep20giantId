/**
 * QualityOtherSettingsPage — 品保作業 • 其他設定
 *
 * 三個 Tab 分頁：
 *  1. 入廠需檢驗的物料
 *  2. 需付檢測報告的物料群組
 *  3. 危害物質法規維護
 *
 * 使用標準表格系統（StandardDataTable）
 */

import { useState, useMemo } from 'react';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { Button } from '@/app/components/ui/button';
import { ToggleSwitch } from './ToggleSwitch';

// ─────────────────────────────────────────────────────────────────────────────
// 共用 CSV 匯出工具
// ─────────────────────────────────────────────────────────────────────────────
function exportRowsToCsv<T>(
  rows: T[],
  filename: string,
  fields: { key: keyof T & string; label: string }[]
) {
  const header = fields.map(f => `"${f.label}"`).join(',');
  const body = rows.map(row =>
    fields.map(f => `"${String((row[f.key] as unknown) ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csv = `\uFEFF${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// 型別定義
// ─────────────────────────────────────────────────────────────────────────────

/** Tab1：入廠需檢驗的物料 */
interface IncomingInspectionRow {
  id: number;
  factory: string;           // 工廠
  vendor: string;            // 廠商
  partNo: string;            // 料號
  inspect: boolean;          // 是否檢驗
  longSpec: string;          // 長規格描述
  updatedInfo: string;       // 最後修改資訊
}

/** Tab2：需付檢測報告的物料群組 */
interface MaterialGroupReportRow {
  id: number;
  factory: string;           // 工廠
  materialGroup: string;     // 物料群組
  descZh: string;            // 物料群組說明
  descEn: string;            // 物料群組說明2
  needInspReport: boolean;   // 需繳交檢驗報告
  needFuncReport: boolean;   // 需繳交功能測試報告
}

/** Tab3：危害物質法規維護 */
interface HazardRegRow {
  id: number;
  regCode: string;           // 法規代號
  enabled: boolean;          // 啟用
  descZh: string;            // 法規說明
  descEn: string;            // 法規說明(En)
  regMaker: string;          // 法規制定者
  regScope: string;          // 法規管理範圍
  createdInfo: string;       // 建檔資訊
}

type ActiveTab = 'incoming-inspection' | 'material-group-report' | 'hazard-reg';

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料
// ─────────────────────────────────────────────────────────────────────────────

const INCOMING_INSPECTION_DATA: IncomingInspectionRow[] = [
  { id: 1,  factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', inspect: true,  longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT', updatedInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 2,  factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', inspect: true,  longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT', updatedInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 3,  factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', inspect: true,  longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT', updatedInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 4,  factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', inspect: true,  longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT', updatedInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 5,  factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', inspect: false, longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT', updatedInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 6,  factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-034', inspect: true,  longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT', updatedInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 7,  factory: 'GVM1', vendor: '台灣松下(0001009900)', partNo: 'BA-2048-M12-01', inspect: true,  longSpec: 'BATTERY 48V 12AH BLK PANASONIC', updatedInfo: 'Paul Sun 孫杰坪-2024/03/21' },
  { id: 8,  factory: 'GVM1', vendor: '台灣松下(0001009900)', partNo: 'BA-2048-M12-02', inspect: false, longSpec: 'BATTERY 48V 12AH WHT PANASONIC', updatedInfo: 'Paul Sun 孫杰坪-2024/03/21' },
  { id: 9,  factory: 'GTM1', vendor: '億光(0002001100)', partNo: 'LT-F001-LED-01',  inspect: true,  longSpec: 'FRONT LIGHT LED 80 LUX USB-C BLK', updatedInfo: 'Allen Zou 鄧芳筆-2024/02/15' },
];

const MATERIAL_GROUP_REPORT_DATA: MaterialGroupReportRow[] = [
  { id: 1,  factory: 'GEM1', materialGroup: '100',  descZh: 'BICYCLE',       descEn: 'BICYCLE',         needInspReport: true,  needFuncReport: true  },
  { id: 2,  factory: 'GEM1', materialGroup: '100E', descZh: 'E-BICYCLE',     descEn: 'ELECTRIC BICYCLE', needInspReport: true,  needFuncReport: false },
  { id: 3,  factory: 'GEM1', materialGroup: '101A', descZh: 'Helmet-road',   descEn: 'Helmet-road',     needInspReport: true,  needFuncReport: true  },
  { id: 4,  factory: 'GEM1', materialGroup: '101B', descZh: 'Helmet-MTB',    descEn: 'Helmet-MTB',      needInspReport: true,  needFuncReport: false },
  { id: 5,  factory: 'GEM1', materialGroup: '102',  descZh: 'Accessories',   descEn: 'Accessories',     needInspReport: false, needFuncReport: false },
  { id: 6,  factory: 'GEM1', materialGroup: '103A', descZh: 'Frame-AL',      descEn: 'Frame-Aluminum',  needInspReport: true,  needFuncReport: false },
  { id: 7,  factory: 'GEM1', materialGroup: '103C', descZh: 'Frame-CF',      descEn: 'Frame-Carbon',    needInspReport: true,  needFuncReport: true  },
  { id: 8,  factory: 'GTM1', materialGroup: '110',  descZh: '電動車配件',    descEn: 'E-Bike Parts',    needInspReport: true,  needFuncReport: true  },
  { id: 9,  factory: 'GTM1', materialGroup: '111',  descZh: '車燈類',        descEn: 'Lights',          needInspReport: false, needFuncReport: true  },
];

const HAZARD_REG_DATA: HazardRegRow[] = [
  { id: 1, regCode: 'RoHS',  enabled: true,  descZh: '限制電子電氣設備中某些有害物質使用指令',   descEn: 'Restriction of Hazardous Substances Directive',        regMaker: '歐盟（EU）',            regScope: '限制在電子與電氣設備中使用有害物質', createdInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 2, regCode: 'POPs',  enabled: true,  descZh: '持久性有機污染物規範',                     descEn: 'Persistent Organic Pollutants Regulation',             regMaker: '歐盟（根據斯德哥爾摩公約）', regScope: '限制或禁止使用具持久性有機污染物', createdInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 3, regCode: 'TSCA',  enabled: true,  descZh: '有毒物質控制法',                           descEn: 'Toxic Substances Control Act',                          regMaker: '美國',                  regScope: '授權美國環保署（EPA）管制化學物質', createdInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 4, regCode: 'CPSIA', enabled: true,  descZh: '消費品安全改進法案',                       descEn: 'Consumer Product Safety Improvement Act',               regMaker: '美國',                  regScope: '主要針對兒童產品的安全標準', createdInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 5, regCode: 'REACH', enabled: false, descZh: '化學品注冊、評估、授權和限制法規',         descEn: 'Registration, Evaluation, Authorisation and Restriction', regMaker: '歐盟（EU）',            regScope: '管制化學物質及其安全使用', createdInfo: 'Paul Sun 孫杰坪-2024/03/20' },
  { id: 6, regCode: 'SVHC',  enabled: true,  descZh: '高關注物質清單',                           descEn: 'Substances of Very High Concern',                       regMaker: '歐盟（EU）',            regScope: '要求申報REACH法規下的高關注物質', createdInfo: 'Paul Sun 孫杰坪-2024/03/20' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tab Item
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] px-[16px] relative shrink-0 cursor-pointer"
      onClick={onClick}
    >
      {isActive && <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />}
      <p className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[22px] relative shrink-0 whitespace-nowrap ${isActive ? 'text-[#1c252e]' : 'text-[#637381]'} text-[14px]`}>
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox 圖示（Tab2 用）
// ─────────────────────────────────────────────────────────────────────────────
function CheckboxDisplay({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[4px] bg-[#00559c]">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[4px] border border-[rgba(145,158,171,0.4)]" />
  );
}


function Tab1IncomingInspection() {
  const [vendorSearch, setVendorSearch] = useState('');
  const [partSearch, setPartSearch]     = useState('');
  const [inspectFilter, setInspectFilter] = useState('');

  const filtered = useMemo(() => {
    return INCOMING_INSPECTION_DATA.filter(row => {
      const matchVendor  = !vendorSearch || row.vendor.includes(vendorSearch);
      const matchPart    = !partSearch   || row.partNo.toLowerCase().includes(partSearch.toLowerCase());
      const matchInspect = !inspectFilter
        || (inspectFilter === 'yes' && row.inspect)
        || (inspectFilter === 'no'  && !row.inspect);
      return matchVendor && matchPart && matchInspect;
    });
  }, [vendorSearch, partSearch, inspectFilter]);

  const columns: StandardColumn<IncomingInspectionRow>[] = [
    { key: 'id',          label: '#',          width: 56,  minWidth: 48  },
    { key: 'factory',     label: '工廠',        width: 90,  minWidth: 72  },
    { key: 'vendor',      label: '廠商',        width: 200, minWidth: 140 },
    { key: 'partNo',      label: '料號',        width: 180, minWidth: 120 },
    {
      key: 'inspect',
      label: '是否檢驗',
      width: 110,
      minWidth: 90,
      renderCell: (_val, row) => (
        <div className="flex items-center">
          <ToggleSwitch checked={row.inspect} onChange={() => {}} />
        </div>
      ),
    },
    { key: 'longSpec',    label: '長規格描述',  width: 280, minWidth: 160 },
    { key: 'updatedInfo', label: '最後修改資訊', width: 220, minWidth: 160 },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1">
          <SearchField
            label="廠商"
            value={vendorSearch}
            onChange={setVendorSearch}
          />
        </div>
        <div className="flex-1">
          <SearchField
            label="料號"
            value={partSearch}
            onChange={setPartSearch}
          />
        </div>
        <div className="flex-1">
          <DropdownSelect
            label="是否檢驗"
            value={inspectFilter}
            onChange={setInspectFilter}
            options={[
              { value: '', label: '全部' },
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No'  },
            ]}
          />
        </div>
      </div>

      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab1-v1"
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '入廠需檢驗的物料.csv', [
          { key: 'factory',     label: '工廠' },
          { key: 'vendor',      label: '廠商' },
          { key: 'partNo',      label: '料號' },
          { key: 'inspect',     label: '是否檢驗' },
          { key: 'longSpec',    label: '長規格描述' },
          { key: 'updatedInfo', label: '最後修改資訊' },
        ])}
        actionButton={
          <Button
            id="q-other-tab1-add-btn"
            className="h-[36px] px-[16px] rounded-[8px] text-[14px] font-semibold"
            style={{ backgroundColor: '#1c252e' }}
          >
            新增
          </Button>
        }
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab2：需付檢測報告的物料群組
// ─────────────────────────────────────────────────────────────────────────────

function Tab2MaterialGroupReport() {
  const [groupSearch,    setGroupSearch]    = useState('');
  const [inspRepFilter,  setInspRepFilter]  = useState('');
  const [funcRepFilter,  setFuncRepFilter]  = useState('');

  const filtered = useMemo(() => {
    return MATERIAL_GROUP_REPORT_DATA.filter(row => {
      const matchGroup    = !groupSearch   || row.materialGroup.includes(groupSearch) || row.descZh.includes(groupSearch);
      const matchInspRep  = !inspRepFilter
        || (inspRepFilter === 'yes' && row.needInspReport)
        || (inspRepFilter === 'no'  && !row.needInspReport);
      const matchFuncRep  = !funcRepFilter
        || (funcRepFilter === 'yes' && row.needFuncReport)
        || (funcRepFilter === 'no'  && !row.needFuncReport);
      return matchGroup && matchInspRep && matchFuncRep;
    });
  }, [groupSearch, inspRepFilter, funcRepFilter]);

  const columns: StandardColumn<MaterialGroupReportRow>[] = [
    { key: 'factory',       label: '工廠',           width: 90,  minWidth: 72  },
    { key: 'materialGroup', label: '物料群組',        width: 110, minWidth: 90  },
    { key: 'descZh',        label: '物料群組說明',    width: 180, minWidth: 120 },
    { key: 'descEn',        label: '物料群組說明2',   width: 180, minWidth: 120 },
    {
      key: 'needInspReport',
      label: '需繳交檢驗報告',
      width: 150,
      minWidth: 110,
      renderCell: (_val, row) => (
        <div className="flex items-center justify-center">
          <CheckboxDisplay checked={row.needInspReport} />
        </div>
      ),
    },
    {
      key: 'needFuncReport',
      label: '需繳交功能測試報告',
      width: 175,
      minWidth: 130,
      renderCell: (_val, row) => (
        <div className="flex items-center justify-center">
          <CheckboxDisplay checked={row.needFuncReport} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1">
          <SearchField
            label="物料群組"
            value={groupSearch}
            onChange={setGroupSearch}
          />
        </div>
        <div className="flex-1">
          <DropdownSelect
            label="是否繳交檢驗報告"
            value={inspRepFilter}
            onChange={setInspRepFilter}
            options={[
              { value: '', label: '全部' },
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No'  },
            ]}
          />
        </div>
        <div className="flex-1">
          <DropdownSelect
            label="是否繳交功性能報告"
            value={funcRepFilter}
            onChange={setFuncRepFilter}
            options={[
              { value: '', label: '全部' },
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No'  },
            ]}
          />
        </div>
      </div>

      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab2-v1"
        showCheckbox={true}
        updateTime="2025/05/05 12:30"
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '需付檢測報告的物料群組.csv', [
          { key: 'factory',       label: '工廠' },
          { key: 'materialGroup', label: '物料群組' },
          { key: 'descZh',        label: '物料群組說明' },
          { key: 'descEn',        label: '物料群組說明2' },
          { key: 'needInspReport', label: '需繳交檢驗報告' },
          { key: 'needFuncReport', label: '需繳交功能測試報告' },
        ])}
        actionButton={
          <Button
            id="q-other-tab2-exclude-btn"
            className="h-[36px] px-[16px] rounded-[8px] text-[14px] font-semibold"
            style={{ backgroundColor: '#1c252e' }}
          >
            排除料號
          </Button>
        }
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab3：危害物質法規維護
// ─────────────────────────────────────────────────────────────────────────────

function Tab3HazardReg() {
  const [regCodeSearch, setRegCodeSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');

  const filtered = useMemo(() => {
    return HAZARD_REG_DATA.filter(row => {
      const matchCode    = !regCodeSearch || row.regCode.toLowerCase().includes(regCodeSearch.toLowerCase());
      const matchEnabled = !enabledFilter
        || (enabledFilter === 'enabled'  && row.enabled)
        || (enabledFilter === 'disabled' && !row.enabled);
      return matchCode && matchEnabled;
    });
  }, [regCodeSearch, enabledFilter]);

  const columns: StandardColumn<HazardRegRow>[] = [
    { key: 'id',          label: '#',          width: 56,  minWidth: 48  },
    {
      key: 'regCode',
      label: '法規代號',
      width: 120,
      minWidth: 90,
      renderCell: (val) => (
        <span className="text-[#1890FF] cursor-pointer hover:underline font-medium">{String(val)}</span>
      ),
    },
    {
      key: 'enabled',
      label: '啟用',
      width: 90,
      minWidth: 72,
      renderCell: (_val, row) => (
        <div className="flex items-center">
          <ToggleSwitch checked={row.enabled} onChange={() => {}} />
        </div>
      ),
    },
    { key: 'descZh',       label: '法規說明',       width: 220, minWidth: 140 },
    { key: 'descEn',       label: '法規說明(En)',    width: 220, minWidth: 140 },
    { key: 'regMaker',     label: '法規制定者',      width: 160, minWidth: 110 },
    { key: 'regScope',     label: '法規管理範圍',    width: 220, minWidth: 140 },
    { key: 'createdInfo',  label: '建檔資訊',        width: 220, minWidth: 160 },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1">
          <SearchField
            label="法規代號"
            value={regCodeSearch}
            onChange={setRegCodeSearch}
          />
        </div>
        <div className="flex-1">
          <DropdownSelect
            label="啟用/未啟用"
            value={enabledFilter}
            onChange={setEnabledFilter}
            options={[
              { value: '',         label: '全部'   },
              { value: 'enabled',  label: '啟用'   },
              { value: 'disabled', label: '未啟用'  },
            ]}
          />
        </div>
      </div>

      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab3-v1"
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '危害物質法規維護.csv', [
          { key: 'regCode',     label: '法規代號' },
          { key: 'enabled',     label: '啟用' },
          { key: 'descZh',      label: '法規說明' },
          { key: 'descEn',      label: '法規說明(En)' },
          { key: 'regMaker',    label: '法規制定者' },
          { key: 'regScope',    label: '法規管理範圍' },
          { key: 'createdInfo', label: '建檔資訊' },
        ])}
        actionButton={
          <Button
            id="q-other-tab3-add-btn"
            className="h-[36px] px-[16px] rounded-[8px] text-[14px] font-semibold"
            style={{ backgroundColor: '#1c252e' }}
          >
            新增
          </Button>
        }
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 主元件
// ─────────────────────────────────────────────────────────────────────────────

export function QualityOtherSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('incoming-inspection');

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'incoming-inspection',  label: '入廠需檢驗的物料' },
    { key: 'material-group-report', label: '需付檢測報告的物料群組' },
    { key: 'hazard-reg',           label: '危害物質法規維護' },
  ];

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] overflow-hidden border border-[rgba(145,158,171,0.12)]">
      {/* ── Tab 列 ── */}
      <div className="shrink-0 border-b border-[rgba(145,158,171,0.24)] px-[20px] flex items-center gap-[4px]">
        {tabs.map(tab => (
          <TabItem
            key={tab.key}
            label={tab.label}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* ── Tab 內容 ── */}
      {activeTab === 'incoming-inspection'   && <Tab1IncomingInspection />}
      {activeTab === 'material-group-report' && <Tab2MaterialGroupReport />}
      {activeTab === 'hazard-reg'            && <Tab3HazardReg />}
    </div>
  );
}
