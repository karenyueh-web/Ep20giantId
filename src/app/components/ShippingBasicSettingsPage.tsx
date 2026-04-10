/**
 * ShippingBasicSettingsPage — 出貨單 • 基本設定
 *
 * 三個 Tab 分頁：
 *  1. 儲存地點主檔
 *  2. GTM儲存條件設定
 *  3. GEM目的地設定
 *
 * 使用標準表格系統（StandardDataTable）
 */

import { useState, useMemo } from 'react';
import { ActionCellButtons } from './ActionButtons';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { Button } from '@/app/components/ui/button';
import { DropdownSelect } from './DropdownSelect';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';


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

/** Tab1：儲存地點主檔 */
interface StorageLocationRow {
  id: number;
  factory: string;          // 工廠
  locationCode: string;     // 儲存地點代號
  descZh: string;           // 地點描述(中)
  descEn: string;           // 地點描述(英)
  addressZh: string;        // 地址(中)
  addressEn: string;        // 地址(英)
  updatedInfo: string;      // 更新資訊
}

/** Tab2：GTM儲存條件設定 */
interface GtmStorageConditionRow {
  id: number;
  locationCode: string;     // 儲存地點代號
  conditionCode: string;    // 儲存條件代號
  factory: string;          // 工廠
  address: string;          // 地址
  updatedInfo: string;      // 更新資訊
}

/** Tab3：GEM目的地設定 */
interface GemDestinationRow {
  id: number;
  purchaseOrg: string;      // 採購組織
  transportType: string;    // 運輸型態
  destination: string;      // 目的地
  updatedInfo: string;      // 更新資訊
}

type ActiveTab = 'storage-location' | 'gtm-storage-condition' | 'gem-destination';

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_LOCATION_DATA: StorageLocationRow[] = [
  { id: 1, factory: 'GTM1', locationCode: '2065', descZh: '塗料倉-保稅', descEn: 'Paint-GB', addressZh: '台中市大甲區順帆路19號-南倉旁塗料室', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 2, factory: 'GTM1', locationCode: '2070', descZh: '報廢倉-保稅', descEn: 'Scrapped-GB', addressZh: '台中市大甲區順帆路19號-南倉旁報廢區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/21' },
  { id: 3, factory: 'GTM1', locationCode: '2080', descZh: '原料樣品倉-保稅', descEn: 'Sample-SB', addressZh: '台中市大甲區順帆路19號-各倉樣品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/22' },
  { id: 4, factory: 'GTM1', locationCode: '2090', descZh: '原料客製倉-保稅', descEn: 'Customized-CB', addressZh: '台中市大甲區順帆路19號-各倉客製區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/23' },
  { id: 5, factory: 'GTM1', locationCode: '20NG', descZh: '不良品倉-保稅', descEn: 'NG-GB', addressZh: '台中市大甲區順帆路19號-各倉不良品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/24' },
  { id: 6, factory: 'GTM1', locationCode: '2110', descZh: '幼獅外倉1(WM)', descEn: 'Youshi WH1(WM)', addressZh: '久鼎:台中市大甲區青年路137號', addressEn: '137, Qingnian Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/25' },
  { id: 7, factory: 'GTM1', locationCode: '2120', descZh: '幼獅外倉2', descEn: 'Youshi WH2', addressZh: '久鼎:台中市大甲區青年路137號', addressEn: '137, Qingnian Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/26' },
  { id: 8, factory: 'GTM1', locationCode: '2130', descZh: '幼獅外倉3', descEn: 'Youshi WH3', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/27' },
  { id: 9, factory: 'GTM1', locationCode: '2210', descZh: '塗架Floor-保稅', descEn: 'Painted Frame Floor-GB', addressZh: '台中市大甲區順帆路19號-各塗裝線', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/28' },
  { id: 10, factory: 'GTM1', locationCode: '2220', descZh: '輪組Floor-保稅', descEn: 'Wheelset Floor-GB', addressZh: '台中市大甲區順帆路19號-鋼圈區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/29' },
  { id: 11, factory: 'GTM1', locationCode: '2230', descZh: '車架Floor-保稅', descEn: 'Frame Floor-GB', addressZh: '台中市大甲區順帆路19號-AL黑身車架區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/30' },
  { id: 12, factory: 'GTM1', locationCode: '2241', descZh: '紙箱線邊1-保稅', descEn: 'Carton 1-GB', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/31' },
  { id: 13, factory: 'GTM1', locationCode: '2242', descZh: '紙箱線邊2-保稅', descEn: 'Carton 2-GB', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/32' },
  { id: 14, factory: 'GTM1', locationCode: '2243', descZh: '紙箱線邊3-保稅', descEn: 'Carton 3-GB', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/33' },
  { id: 15, factory: 'GTM1', locationCode: '2244', descZh: '紙箱線邊4-保稅', descEn: 'Carton 4-GB', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/34' },
  { id: 16, factory: 'GTM1', locationCode: '2245', descZh: '紙箱線邊5-保稅', descEn: 'Carton 5-GB', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/35' },
  { id: 17, factory: 'GTM1', locationCode: '2246', descZh: '紙箱線邊6-保稅', descEn: 'Carton 6-GB', addressZh: '台中市大甲區順帆路19號-各裝配線輔材區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/36' },
  { id: 18, factory: 'GTM1', locationCode: '2280', descZh: '半成品樣品倉-保稅', descEn: 'Semi Product-SB', addressZh: '台中市大甲區順帆路19號-各倉樣品區 久鼎:台中市大甲區青年路137號', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/37' },
  { id: 19, factory: 'GTM1', locationCode: '2281', descZh: '車架料樣品倉-保稅', descEn: 'Frame parts-SB', addressZh: '台中市大甲區順帆路19號-各倉樣品區 久鼎:台中市大甲區青年路137號', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/38' },
  { id: 20, factory: 'GTM1', locationCode: '2290', descZh: '半成品客製倉-保稅', descEn: 'Semi product-CB', addressZh: '台中市大甲區順帆路19號-各倉客製區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/39' },
  { id: 21, factory: 'GTM1', locationCode: '2310', descZh: '成品暫存倉-保稅', descEn: 'Bike working area-GB', addressZh: '台中市大甲區順帆路19號-外銷成品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/40' },
  { id: 22, factory: 'GTM9', locationCode: '2310', descZh: '成品暫存倉-保稅', descEn: 'Bike working area-GB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/41' },
  { id: 23, factory: 'GTM1', locationCode: '2320', descZh: '成品自動倉-保稅', descEn: 'Bike auto area-GB', addressZh: '台中市大甲區順帆路19號-自動倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/42' },
  { id: 24, factory: 'GTM1', locationCode: '2330', descZh: '成品人工倉-保稅', descEn: 'Bike artificial area-GB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/43' },
  { id: 25, factory: 'GTM1', locationCode: '2350', descZh: '售服倉-保稅', descEn: 'Afterservice-GB', addressZh: '台中市大甲區順帆路19號-外銷售服區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/44' },
  { id: 26, factory: 'GTM1', locationCode: '2360', descZh: '退貨倉-保稅', descEn: '', addressZh: '台中市大甲區順帆路19號-南倉2F退貨區&鋼圈退貨區&內銷退貨區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/45' },
  { id: 27, factory: 'GTM9', locationCode: '2360', descZh: '退貨倉-保稅', descEn: 'Returned-GB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/46' },
  { id: 28, factory: 'GTM1', locationCode: '2380', descZh: '成品樣品倉-保稅', descEn: 'Sample bike-GB', addressZh: '台中市大甲區順帆路19號-外銷樣品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/47' },
  { id: 29, factory: 'GTM1', locationCode: '2390', descZh: '成品客製倉-保稅', descEn: 'Customized bike-GB', addressZh: '台中市大甲區順帆路19號-外銷客製區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/48' },
  { id: 30, factory: 'GTM1', locationCode: '2410', descZh: 'GEM P-type倉', descEn: 'GEM P type', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/49' },
  { id: 31, factory: 'GTM1', locationCode: '2420', descZh: '東倉(1F)-GEM M-type保稅', descEn: 'GEM M-type East WH (1F)', addressZh: '台中市大甲區順帆路19號-東倉1F', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/50' },
  { id: 32, factory: 'GTM1', locationCode: '2430', descZh: 'GCM P-Type倉', descEn: 'GCM P type', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/51' },
  { id: 33, factory: 'GTM1', locationCode: '2431', descZh: 'GCK P-Type倉', descEn: 'GCK P-Type', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/52' },
  { id: 34, factory: 'GTM1', locationCode: '2432', descZh: 'GEV P-Type倉', descEn: 'GEV P-Type', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/53' },
  { id: 35, factory: 'GTM1', locationCode: '2433', descZh: 'GCT P-Type倉', descEn: 'GCT P-Type', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/54' },
  { id: 36, factory: 'GTM1', locationCode: '2440', descZh: 'GCX M-type倉', descEn: 'GCX M-Type', addressZh: '台中市大甲區順帆路19號-東倉1F', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/55' },
  { id: 37, factory: 'GTM1', locationCode: '2510', descZh: 'GBD 物流內倉-保稅(WM)', descEn: 'GBD WM-GB', addressZh: '台中市大甲區中山路2段901號', addressEn: '901, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/56' },
  { id: 38, factory: 'GTM1', locationCode: '2520', descZh: 'GBD 外倉-京揚', descEn: 'GBD- Elite WH', addressZh: '台中市梧棲區中橫10路100號', addressEn: '100, Zhongheng 10th Rd., Wuqi Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/57' },
  { id: 39, factory: 'GTM1', locationCode: '2530', descZh: 'GBD 外倉-KY', descEn: 'GBD- KY', addressZh: '中國深圳市鹽田區鹽田港保稅區南片區深圳嘉里鹽田港物流中心', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/58' },
  { id: 40, factory: 'GTM1', locationCode: '2560', descZh: 'GBD 外倉-京揚 (GTS)', descEn: 'GBD- Elite WH (GTS)', addressZh: '台中市梧棲區中橫10路100號', addressEn: '100, Zhongheng 10th Rd., Wuqi Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/59' },
  { id: 41, factory: 'GTM1', locationCode: '2610', descZh: 'GI 物流內倉-保稅(WM)', descEn: 'GI (WM)-GB', addressZh: '台中市大甲區中山路2段901號', addressEn: '901, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/60' },
  { id: 42, factory: 'GTM1', locationCode: '2620', descZh: 'GI 外倉-京揚', descEn: 'GI- Elite WH', addressZh: '台中市梧棲區中橫10路100號', addressEn: '100, Zhongheng 10th Rd., Wuqi Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/61' },
  { id: 43, factory: 'GTM1', locationCode: '1932', descZh: '虛擬客製倉', descEn: 'Virtual CN', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/62' },
  { id: 44, factory: 'GTM1', locationCode: '2010', descZh: '長製程管件倉-保稅', descEn: 'Long Process Tube-GB', addressZh: '台中市大甲區順帆路19號-南倉旁AL管件區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/63' },
  { id: 45, factory: 'GTM1', locationCode: '2015', descZh: '碳布冷凍倉-保稅', descEn: 'Prepreg-GB', addressZh: '台中市大甲區順帆路19號-東倉1F後方冷凍倉庫', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/64' },
  { id: 46, factory: 'GTM1', locationCode: '2020', descZh: '南倉-保稅(WM)', descEn: 'South WH-GB', addressZh: '台中市大甲區順帆路19號-南倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/65' },
  { id: 47, factory: 'GTM1', locationCode: '2021', descZh: '南倉-保稅(固定儲格)', descEn: 'South (WM)-GB', addressZh: '台中市大甲區順帆路19號-南倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/66' },
  { id: 48, factory: 'GTM1', locationCode: '2025', descZh: '標紙倉-保稅', descEn: 'Decal-GB', addressZh: '台中市大甲區順帆路19號-標紙室', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/67' },
  { id: 49, factory: 'GTM1', locationCode: '2030', descZh: '東倉2F-保稅(WM)', descEn: 'East WH 2F-GB', addressZh: '台中市大甲區順帆路19號-東倉2F', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/68' },
  { id: 50, factory: 'GTM1', locationCode: '2040', descZh: '鋁管倉-保稅', descEn: 'AL Tubes-GB', addressZh: '台中市大甲區順帆路19號-鋁管倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/69' },
  { id: 51, factory: 'GTM1', locationCode: '2050', descZh: '輪胎鋼圈倉-保稅', descEn: 'Tire/Rim-GB', addressZh: '台中市大甲區順帆路19號-鋼圈區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/70' },
  { id: 52, factory: 'GTM1', locationCode: '2060', descZh: '原料人工倉-保稅', descEn: '', addressZh: '台中市大甲區順帆路19號-外殼區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/71' },
  { id: 53, factory: 'GTM1', locationCode: '1010', descZh: '長製程管件倉', descEn: 'Long Process Tube', addressZh: '台中市大甲區順帆路19號-南倉旁AL管件區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/72' },
  { id: 54, factory: 'GTM1', locationCode: '1015', descZh: '碳布冷凍倉', descEn: 'Prepreg', addressZh: '台中市大甲區順帆路19號-東倉1F後方冷凍倉庫', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/73' },
  { id: 55, factory: 'GTM1', locationCode: '1020', descZh: '南倉 (WM)', descEn: 'South WH', addressZh: '台中市大甲區順帆路19號-南倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/74' },
  { id: 56, factory: 'GTM1', locationCode: '1021', descZh: '南倉 (固定儲格)', descEn: 'South (WM)', addressZh: '台中市大甲區順帆路19號-南倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/75' },
  { id: 57, factory: 'GTM1', locationCode: '1025', descZh: '標紙倉', descEn: 'Decal', addressZh: '台中市大甲區順帆路19號-標紙室', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/76' },
  { id: 58, factory: 'GTM1', locationCode: '1030', descZh: '東倉2F(WM)', descEn: 'East WH 2F', addressZh: '台中市大甲區順帆路19號-東倉2F', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/77' },
  { id: 59, factory: 'GTM1', locationCode: '1040', descZh: '鋁管倉', descEn: 'AL Tubes', addressZh: '台中市大甲區順帆路19號-鋁管倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/78' },
  { id: 60, factory: 'GTM1', locationCode: '1050', descZh: '輪胎鋼圈倉', descEn: 'Tire/Rim', addressZh: '台中市大甲區順帆路19號-鋼圈區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/79' },
  { id: 61, factory: 'GTM1', locationCode: '1060', descZh: '原料人工倉', descEn: '', addressZh: '台中市大甲區順帆路19號-外殼區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/80' },
  { id: 62, factory: 'GTM1', locationCode: '1065', descZh: '塗料倉', descEn: 'Paint', addressZh: '台中市大甲區順帆路19號-南倉旁塗料室', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/81' },
  { id: 63, factory: 'GTM1', locationCode: '1070', descZh: '報廢倉', descEn: 'Scrapped', addressZh: '台中市大甲區順帆路19號-南倉旁報廢區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/82' },
  { id: 64, factory: 'GTM1', locationCode: '1080', descZh: '原料樣品倉', descEn: 'Sample-SN', addressZh: '台中市大甲區順帆路19號-各倉樣品區 久鼎:台中市大甲區青年路137號', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/83' },
  { id: 65, factory: 'GTM1', locationCode: '1090', descZh: '客製倉', descEn: 'Customized-CN', addressZh: '台中市大甲區順帆路19號-各倉客製區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/84' },
  { id: 66, factory: 'GTM1', locationCode: '10NG', descZh: '不良品倉', descEn: 'NG', addressZh: '台中市大甲區順帆路19號-各倉不良品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/85' },
  { id: 67, factory: 'GTM1', locationCode: '1110', descZh: '幼獅外倉1(WM)', descEn: 'Youshi WH1(WM)', addressZh: '久鼎:台中市大甲區青年路137號', addressEn: '137, Qingnian Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/86' },
  { id: 68, factory: 'GTM1', locationCode: '1120', descZh: '幼獅外倉2', descEn: 'Youshi WH2', addressZh: '久鼎:台中市大甲區青年路137號', addressEn: '137, Qingnian Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/87' },
  { id: 69, factory: 'GTM1', locationCode: '1130', descZh: '幼獅外倉2', descEn: 'Youshi WH2', addressZh: '北裕:台中市大甲區中山路二段903號', addressEn: '903, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/88' },
  { id: 70, factory: 'GTM1', locationCode: '1210', descZh: '塗架Floor-保稅', descEn: 'Painted Frame Floor', addressZh: '台中市大甲區順帆路19號-各塗裝線', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/89' },
  { id: 71, factory: 'GTM1', locationCode: '1220', descZh: '輪組Floor', descEn: 'Wheelset Floor', addressZh: '台中市大甲區順帆路19號-鋼圈區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/90' },
  { id: 72, factory: 'GTM1', locationCode: '1230', descZh: '車架Floor', descEn: 'Frame Floor', addressZh: '台中市大甲區順帆路19號-AL黑身車架區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/91' },
  { id: 73, factory: 'GTM1', locationCode: '1241', descZh: '紙箱線邊1', descEn: 'Carton 1', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/92' },
  { id: 74, factory: 'GTM1', locationCode: '1242', descZh: '紙箱線邊2', descEn: 'Carton 2', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/93' },
  { id: 75, factory: 'GTM1', locationCode: '1243', descZh: '紙箱線邊3', descEn: 'Carton 3', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/94' },
  { id: 76, factory: 'GTM1', locationCode: '1244', descZh: '紙箱線邊4', descEn: 'Carton 4', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/95' },
  { id: 77, factory: 'GTM1', locationCode: '1245', descZh: '紙箱線邊5', descEn: 'Carton 5', addressZh: '台中市大甲區順帆路19號-各裝配線紙箱區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/96' },
  { id: 78, factory: 'GTM1', locationCode: '1246', descZh: '紙箱線邊6', descEn: 'Carton 6', addressZh: '台中市大甲區順帆路19號-各裝配線輔材區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/97' },
  { id: 79, factory: 'GTM1', locationCode: '1280', descZh: '半成品樣品倉', descEn: 'Semi Product-SN', addressZh: '台中市大甲區順帆路19號-各倉樣品區 久鼎:台中市大甲區青年路137號', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/98' },
  { id: 80, factory: 'GTM1', locationCode: '1281', descZh: '車架料樣品倉', descEn: 'Frame parts-SN', addressZh: '台中市大甲區順帆路19號-各倉樣品區 久鼎:台中市大甲區青年路137號', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/99' },
  { id: 81, factory: 'GTM1', locationCode: '1290', descZh: '半成品客製倉', descEn: 'Semi product-CN', addressZh: '台中市大甲區順帆路19號-各倉客製區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/100' },
  { id: 82, factory: 'GTM1', locationCode: '1310', descZh: '成品暫存倉', descEn: 'Bike working area', addressZh: '台中市大甲區順帆路19號-內銷成品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/101' },
  { id: 83, factory: 'GTM9', locationCode: '1310', descZh: '成品暫存倉', descEn: 'Bike working area', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/102' },
  { id: 84, factory: 'GTM1', locationCode: '1320', descZh: '成品自動倉', descEn: 'Bike auto area', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/103' },
  { id: 85, factory: 'GTM1', locationCode: '1330', descZh: '成品人工倉', descEn: 'Bike artificial area', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/104' },
  { id: 86, factory: 'GTM1', locationCode: '1350', descZh: '售服倉', descEn: 'Afterservice', addressZh: '台中市大甲區順帆路19號-內銷售服區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/105' },
  { id: 87, factory: 'GTM1', locationCode: '1360', descZh: '退貨倉', descEn: 'Returned', addressZh: '台中市大甲區順帆路19號-南倉2F退貨區&鋼圈退貨區&內銷退貨區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/106' },
  { id: 88, factory: 'GTM9', locationCode: '1360', descZh: '退貨倉', descEn: 'Returned', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/107' },
  { id: 89, factory: 'GTM1', locationCode: '1380', descZh: '成品樣品倉', descEn: 'Sample bike', addressZh: '台中市大甲區順帆路19號-內銷樣品區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/108' },
  { id: 90, factory: 'GTM1', locationCode: '1390', descZh: '成品客製倉', descEn: 'Customized bike', addressZh: '台中市大甲區順帆路19號-內銷客製區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/109' },
  { id: 91, factory: 'GTM1', locationCode: '1510', descZh: 'GBD 物流內倉(WM)', descEn: 'GBD (WM)', addressZh: '台中市大甲區中山路2段901號', addressEn: '901, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/110' },
  { id: 92, factory: 'GTM1', locationCode: '1540', descZh: 'GBD 辦公室', descEn: 'GBD office', addressZh: '台中市西屯區東大路一段999號', addressEn: 'No.999, Sec. 1, Dongda Rd. Xitun Dist., Taichung City 40763 Taiwan (R.O.C.)', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/111' },
  { id: 93, factory: 'GTM1', locationCode: '1550', descZh: 'GBD 東倉', descEn: 'GBD East WH', addressZh: '台中市大甲區順帆路19號-東倉', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/112' },
  { id: 94, factory: 'GTM1', locationCode: '1560', descZh: 'GBD-GTS物流倉', descEn: 'GBD-GTS', addressZh: '台中市大甲區中山路2段901號', addressEn: '901, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/113' },
  { id: 95, factory: 'GTM1', locationCode: '1610', descZh: 'GI 物流內倉(WM)', descEn: 'GI (WM)', addressZh: '台中市大甲區中山路2段901號', addressEn: '901, Sec. 2, Zhongshan Rd., Dajia Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/114' },
  { id: 96, factory: 'GTM1', locationCode: '1710', descZh: 'AIP倉', descEn: 'AIP', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/115' },
  { id: 97, factory: 'GTM1', locationCode: '1810', descZh: '工具室', descEn: 'Tools Room', addressZh: '台中市大甲區順帆路19號-工具室', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/116' },
  { id: 98, factory: 'GTM1', locationCode: '1910', descZh: '進口在途', descEn: 'Onway', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/117' },
  { id: 99, factory: 'GTM1', locationCode: '1920', descZh: '三角貿易倉-GBD', descEn: 'Tri-trade GBD', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/118' },
  { id: 100, factory: 'GTM1', locationCode: '1921', descZh: '三角貿易倉-GI', descEn: 'Tri-trade GI', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/119' },
  { id: 101, factory: 'GTM1', locationCode: '1930', descZh: '虛擬量產倉', descEn: 'Virtual GN', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/120' },
  { id: 102, factory: 'GTM1', locationCode: '1931', descZh: '虛擬樣品倉', descEn: 'Virtual SN', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/121' },
  { id: 103, factory: 'GTM1', locationCode: '2630', descZh: 'GI 外倉-KY', descEn: 'GI- KY', addressZh: '中國深圳市鹽田區鹽田港保稅區南片區深圳嘉里鹽田港物流中心', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/122' },
  { id: 104, factory: 'GTM1', locationCode: '2640', descZh: 'GI 外倉-航耀', descEn: 'GI- HANG YAO', addressZh: '台中市梧棲區中橫十路147號', addressEn: '147, Zhongheng 10th Rd., Wuqi Dist.', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/123' },
  { id: 105, factory: 'GTM1', locationCode: '2710', descZh: 'AIP倉-保稅', descEn: 'AIP- GB', addressZh: '台中市大甲區順帆路19號-外銷AIP區', addressEn: '19, ShunFarn Rd, Dajia District', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/124' },
  { id: 106, factory: 'GTM1', locationCode: '2910', descZh: '進口在途-保稅', descEn: 'Onway-GB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/125' },
  { id: 107, factory: 'GTM1', locationCode: '2930', descZh: '虛擬量產倉-保稅', descEn: 'Virtual-GB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/126' },
  { id: 108, factory: 'GTM1', locationCode: '2931', descZh: '虛擬樣品倉-保稅', descEn: 'Virtual-SB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/127' },
  { id: 109, factory: 'GTM1', locationCode: '2932', descZh: '虛擬客製倉-保稅', descEn: 'Virtual-CB', addressZh: '', addressEn: '', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/128' },
  { id: 110, factory: 'GVM1', locationCode: '2000', descZh: 'Raw Material', descEn: 'Raw Material', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/129' },
  { id: 111, factory: 'GVM1', locationCode: '2001', descZh: 'Shortage', descEn: 'Shortage', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/130' },
  { id: 112, factory: 'GVM1', locationCode: '2200', descZh: 'Frame', descEn: 'Frame', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/131' },
  { id: 113, factory: 'GVM1', locationCode: '2201', descZh: 'Painted Frame', descEn: 'Painted Frame', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/132' },
  { id: 114, factory: 'GVM1', locationCode: '2300', descZh: 'Finished Goods', descEn: 'Finished Goods', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/133' },
  { id: 115, factory: 'GVM1', locationCode: '2301', descZh: 'Return (Value)', descEn: 'Return (Value)', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/134' },
  { id: 116, factory: 'GVM1', locationCode: '2A00', descZh: 'Sample', descEn: 'Sample', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/135' },
  { id: 117, factory: 'GVM1', locationCode: '2B00', descZh: 'Test Run', descEn: 'Test Run', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/136' },
  { id: 118, factory: 'GVM1', locationCode: '2C00', descZh: 'IncomingGoods NG', descEn: 'IncomingGoods NG', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/137' },
  { id: 119, factory: 'GVM1', locationCode: '2C01', descZh: 'Semi-finished NG', descEn: 'Semi-finished NG', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/138' },
  { id: 120, factory: 'GVM1', locationCode: '2D00', descZh: 'Scrap', descEn: 'Scrap', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/139' },
  { id: 121, factory: 'GVM1', locationCode: '2C02', descZh: 'FinishedGoods NG', descEn: 'FinishedGoods NG', addressZh: '越南胡志明市永新坊新加坡工業區 II-A  32 號路 19 號', addressEn: 'No. 19, VSIP II-A, Street 32, Vietnam – Singapore Industrial Park II-A, Vinh Tan Ward, Ho Chi Minh City, Vietnam .', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/140' },
];

const GTM_STORAGE_CONDITION_DATA: GtmStorageConditionRow[] = [
  { id: 1,  locationCode: '1020', conditionCode: 'Z1', factory: 'GTM1', address: '台中市大甲區順帆路19號-南倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/09' },
  { id: 2,  locationCode: '1020', conditionCode: 'Z2', factory: 'GTM1', address: '台中市大甲區順帆路19號-東倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/10' },
  { id: 3,  locationCode: '1020', conditionCode: 'Z3', factory: 'GTM1', address: '台中市大甲區順帆路19號-輪組倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/11' },
  { id: 4,  locationCode: '1020', conditionCode: 'Z4', factory: 'GTM1', address: '台中市大甲區順帆路19號-外倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/12' },
  { id: 5,  locationCode: '2020', conditionCode: 'Z1', factory: 'GTM1', address: '台中市大甲區順帆路19號-南倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/13' },
  { id: 6,  locationCode: '2020', conditionCode: 'Z2', factory: 'GTM1', address: '台中市大甲區順帆路19號-東倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/14' },
  { id: 7,  locationCode: '2020', conditionCode: 'Z3', factory: 'GTM1', address: '台中市大甲區順帆路19號-輪組倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/15' },
  { id: 8,  locationCode: '2020', conditionCode: 'Z4', factory: 'GTM1', address: '台中市大甲區順帆路19號-外倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/16' },
  { id: 9,  locationCode: '1015', conditionCode: 'Z1', factory: 'GTM1', address: '台中市大甲區順帆路19號-碳布倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/17' },
  { id: 10, locationCode: '1015', conditionCode: 'Z2', factory: 'GTM1', address: '台中市大甲區順帆路19號-鋁管倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/18' },
  { id: 11, locationCode: '1015', conditionCode: 'Z3', factory: 'GTM1', address: '台中市大甲區順帆路19號-馬達電池倉', updatedInfo: 'Paul Sun 孫杰坪-2021/12/19' },
  { id: 12, locationCode: '1015', conditionCode: 'Z4', factory: 'GTM1', address: '台中市大甲區順帆路19號-塗料倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/20' },
  { id: 13, locationCode: '2015', conditionCode: 'Z1', factory: 'GTM1', address: '台中市大甲區順帆路19號-碳布倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/21' },
  { id: 14, locationCode: '2015', conditionCode: 'Z2', factory: 'GTM1', address: '台中市大甲區順帆路19號-鋁管倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/22' },
  { id: 15, locationCode: '2015', conditionCode: 'Z3', factory: 'GTM1', address: '台中市大甲區順帆路19號-馬達電池倉', updatedInfo: 'Paul Sun 孫杰坪-2021/12/23' },
  { id: 16, locationCode: '2015', conditionCode: 'Z4', factory: 'GTM1', address: '台中市大甲區順帆路19號-塗料倉',   updatedInfo: 'Paul Sun 孫杰坪-2021/12/24' },
  { id: 17, locationCode: '1241', conditionCode: 'Z1', factory: 'GTM1', address: '台中市大甲區順帆路19號-廠內',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/25' },
  { id: 18, locationCode: '1241', conditionCode: 'Z2', factory: 'GTM1', address: '台中市大甲區順帆路19號-外倉',     updatedInfo: 'Paul Sun 孫杰坪-2021/12/26' },
];

const GEM_DESTINATION_DATA: GemDestinationRow[] = [
  { id: 1, purchaseOrg: '4111', transportType: 'A', destination: 'AMSTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 2, purchaseOrg: '4111', transportType: 'S', destination: 'ROTTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 3, purchaseOrg: '4111', transportType: 'Z1', destination: 'ROTTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 4, purchaseOrg: '4111', transportType: 'Z2', destination: 'AMSTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 5, purchaseOrg: '4121', transportType: 'A', destination: 'AMSTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 6, purchaseOrg: '4121', transportType: 'S', destination: 'ROTTERDAM', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 7, purchaseOrg: '4121', transportType: 'A', destination: 'HAMBURG', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
  { id: 8, purchaseOrg: '4121', transportType: 'Z1', destination: 'HAMBURG', updatedInfo: 'Allen Zou 鄧芳筆 -2024/03/20' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tab Item
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0 cursor-pointer"
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
// 通用刪除確認 Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}
function DeleteConfirmDialog({ open, description, onConfirm, onClose }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-[#1c252e]">確認刪除</DialogTitle>
        </DialogHeader>
        <p className="text-[14px] text-[#637381] mt-[4px]">{description}</p>
        <DialogFooter className="mt-[16px] flex gap-[8px] justify-end">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>刪除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// 新增/編輯 Overlay（依示意圖設計）
// ────────────────────────────────────────────────────────────────────────────────

/** 標籤壓在 border 上方、可自行調整大小的文字輸入框 */
function FloatingInput({
  label, value, onChange, placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const hasValue = value.length > 0;
  const borderColor = required && !hasValue ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor = required && !hasValue ? '#ff5630' : '#637381';
  return (
    <div className="relative w-full" style={{ minHeight: '54px' }}>
      {/* border overlay — same as DropdownSelect */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid"
        style={{ borderColor }}
      />
      {/* label sitting ON the border — same as DropdownSelect */}
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p
          className="relative shrink-0 leading-[12px]"
          style={{ fontSize: '12px', fontWeight: 600, color: labelColor }}
        >
          {label}
        </p>
      </div>
      {/* textarea — resizable, no border */}
      <textarea
        className="w-full rounded-[8px] px-[14px] pt-[18px] pb-[10px] text-[14px] text-[#1c252e] outline-none bg-transparent border-0 leading-[22px]"
        style={{ resize: 'vertical', minHeight: '54px', color: '#1c252e' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        rows={1}
        onFocus={e => {
          const wrapper = e.currentTarget.parentElement;
          const border = wrapper?.querySelector('[aria-hidden]') as HTMLElement;
          if (border) { border.style.borderColor = '#1890FF'; border.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.15)'; }
        }}
        onBlur={e => {
          const wrapper = e.currentTarget.parentElement;
          const border = wrapper?.querySelector('[aria-hidden]') as HTMLElement;
          if (border) { border.style.borderColor = borderColor; border.style.boxShadow = 'none'; }
        }}
      />
    </div>
  );
}

interface AddEditOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
  children: React.ReactNode;
}
function AddEditOverlay({ open, onClose, title, onSubmit, submitLabel = '新增', disabled, children }: AddEditOverlayProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[24px] w-[560px] max-w-[90vw] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] overflow-hidden">
        <div className="px-[40px] pt-[28px] pb-[36px]">
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="size-[28px] bg-[#455a64] rounded-full flex items-center justify-center hover:bg-[#37474f] transition-colors mb-[16px]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* 標題 */}
          <h2 className="text-[20px] font-bold text-[#1c252e] mb-[20px]">{title}</h2>
          {/* 分隔線 */}
          <div className="border-t border-[rgba(145,158,171,0.2)] mb-[28px]" />
          {/* 表單欄位 */}
          <div className="flex flex-col gap-[20px]">{children}</div>
          {/* 提交按鈕 */}
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="mt-[32px] w-full h-[48px] bg-[#1B3F7C] hover:bg-[#15326a] disabled:opacity-40 disabled:cursor-not-allowed rounded-[8px] text-white text-[15px] font-bold tracking-widest transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1：儲存地點主檔
// ─────────────────────────────────────────────────────────────────────────────

function StorageLocationTab() {
  const [data, setData] = useState<StorageLocationRow[]>(STORAGE_LOCATION_DATA);
  const [searchFactory, setSearchFactory]         = useState('');
  const [searchLocationCode, setSearchLocationCode] = useState('');
  const [searchAddress, setSearchAddress]         = useState('');

  // Dialog 狀態
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editRow, setEditRow]         = useState<StorageLocationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorageLocationRow | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  // 表單欄位
  const [form, setForm] = useState<Omit<StorageLocationRow, 'id' | 'updatedInfo'>>({
    factory: '', locationCode: '', descZh: '', descEn: '', addressZh: '', addressEn: '',
  });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const openCreate = () => {
    setEditRow(null);
    setForm({ factory: '', locationCode: '', descZh: '', descEn: '', addressZh: '', addressEn: '' });
    setDialogOpen(true);
  };
  const openEdit = (row: StorageLocationRow) => {
    setEditRow(row);
    setForm({ factory: row.factory, locationCode: row.locationCode, descZh: row.descZh, descEn: row.descEn, addressZh: row.addressZh, addressEn: row.addressEn });
    setDialogOpen(true);
  };
  const handleSave = () => {
    const now = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    if (editRow) {
      setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form, updatedInfo: `系統 -${now}` } : r));
      showToast('儲存地點資料已更新');
    } else {
      const newId = Math.max(...data.map(r => r.id), 0) + 1;
      setData(prev => [...prev, { id: newId, ...form, updatedInfo: `系統 -${now}` }]);
      showToast('儲存地點已新增');
    }
    setDialogOpen(false);
  };
  const handleDelete = (row: StorageLocationRow) => {
    setData(prev => prev.filter(r => r.id !== row.id));
    showToast(`儲存地點 ${row.locationCode} 已刪除`);
  };

  // 搜尋過濾
  const filteredData = useMemo(() => {
    let result = data;
    if (searchFactory)              result = result.filter(r => r.factory === searchFactory);
    if (searchLocationCode.trim())  result = result.filter(r => r.locationCode.toLowerCase().includes(searchLocationCode.trim().toLowerCase()));
    if (searchAddress.trim())       result = result.filter(r => (r.addressZh + r.addressEn).toLowerCase().includes(searchAddress.trim().toLowerCase()));
    return result;
  }, [data, searchFactory, searchLocationCode, searchAddress]);

  const COLUMNS: StandardColumn<StorageLocationRow>[] = [
    { key: 'factory',      label: '工廠',         width: 100,  minWidth: 80  },
    { key: 'locationCode', label: '儲存地點代號', width: 140,  minWidth: 100 },
    { key: 'descZh',       label: '地點描述(中)', width: 200,  minWidth: 140 },
    { key: 'descEn',       label: '地點描述(英)', width: 200,  minWidth: 140 },
    { key: 'addressZh',    label: '地址(中)',      width: 220,  minWidth: 140 },
    { key: 'addressEn',    label: '地址(英)',      width: 220,  minWidth: 140 },
    { key: 'updatedInfo',  label: '更新資訊',     width: 220,  minWidth: 160 },
    {
      key: 'id', label: '', width: 140, minWidth: 140, required: true,
      renderCell: (_val, row) => (
        <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div style={{ minWidth: '200px' }}>
          <DropdownSelect
            label="工廠"
            value={searchFactory}
            onChange={setSearchFactory}
            options={[
              { value: '', label: '全部' },
              { value: 'GTM1', label: 'GTM1' },
              { value: 'GTM9', label: 'GTM9' },
              { value: 'GVM1', label: 'GVM1' },
            ]}
          />
        </div>
        <SearchField label="儲存地點代號" value={searchLocationCode} onChange={setSearchLocationCode} />
        <SearchField label="地址"         value={searchAddress}      onChange={setSearchAddress} />
      </div>

      {/* 標準表格 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<StorageLocationRow>
          columns={COLUMNS}
          data={data}
          storageKey="shipping-settings-storage-location-v2"
          externalFilteredData={filteredData}
          showCheckbox={false}
          onExportCsv={() => exportRowsToCsv(filteredData, '儲存地點主檔.csv', [
            { key: 'factory',      label: '工廠' },
            { key: 'locationCode', label: '儲存地點代號' },
            { key: 'descZh',       label: '地點描述(中)' },
            { key: 'descEn',       label: '地點描述(英)' },
            { key: 'addressZh',    label: '地址(中)' },
            { key: 'addressEn',    label: '地址(英)' },
            { key: 'updatedInfo',  label: '更新資訊' },
          ])}
          actionButton={
            <Button
              className="h-[36px] bg-[#1c252e] text-white hover:bg-[#374151] rounded-[8px] px-[16px] text-[14px] font-semibold"
              onClick={openCreate}
            >
              新增
            </Button>
          }
        />
      </div>

      {/* 新增/編輯 Overlay */}
      <AddEditOverlay
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editRow ? '編輯儲存地點主檔' : '新增儲存地點主檔'}
        onSubmit={handleSave}
        submitLabel={editRow ? '儲存' : '新增'}
        disabled={!form.factory.trim() || !form.locationCode.trim()}
      >
        <DropdownSelect
          label="工廠"
          value={form.factory}
          onChange={v => setForm(f => ({ ...f, factory: v }))}
          options={[
            { value: 'GTM1', label: 'GTM1' },
            { value: 'GTM9', label: 'GTM9' },
            { value: 'GVM1', label: 'GVM1' },
          ]}
          error={!form.factory}
        />
        <FloatingInput label="儲存地點代號" value={form.locationCode} onChange={v => setForm(f => ({ ...f, locationCode: v }))} placeholder="如: 2610" required />
        <FloatingInput label="地點描述(中)" value={form.descZh} onChange={v => setForm(f => ({ ...f, descZh: v }))} placeholder="中文描述" />
        <FloatingInput label="地點描述(英)" value={form.descEn} onChange={v => setForm(f => ({ ...f, descEn: v }))} placeholder="English description" />
        <FloatingInput label="地址(中)" value={form.addressZh} onChange={v => setForm(f => ({ ...f, addressZh: v }))} placeholder="中文地址" />
        <FloatingInput label="地址(英)" value={form.addressEn} onChange={v => setForm(f => ({ ...f, addressEn: v }))} placeholder="English address" />
      </AddEditOverlay>

      {/* 刪除確認 */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        description={`確定要刪除儲存地點「${deleteTarget?.locationCode} - ${deleteTarget?.descZh}」嗎？此操作無法復原。`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2：GTM儲存條件設定
// ─────────────────────────────────────────────────────────────────────────────

function GtmStorageConditionTab() {
  const [data, setData] = useState<GtmStorageConditionRow[]>(GTM_STORAGE_CONDITION_DATA);
  const [searchLocation, setSearchLocation]   = useState('');
  const [searchCondition, setSearchCondition] = useState('');
  const [searchAddress, setSearchAddress]     = useState('');

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editRow, setEditRow]           = useState<GtmStorageConditionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GtmStorageConditionRow | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  const [form, setForm] = useState<Omit<GtmStorageConditionRow, 'id' | 'updatedInfo'>>({
    locationCode: '', conditionCode: '', factory: '', address: '',
  });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const openCreate = () => {
    setEditRow(null);
    setForm({ locationCode: '', conditionCode: '', factory: '', address: '' });
    setDialogOpen(true);
  };
  const openEdit = (row: GtmStorageConditionRow) => {
    setEditRow(row);
    setForm({ locationCode: row.locationCode, conditionCode: row.conditionCode, factory: row.factory, address: row.address });
    setDialogOpen(true);
  };
  const handleSave = () => {
    const now = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    if (editRow) {
      setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form, updatedInfo: `系統 -${now}` } : r));
      showToast('GTM儲存條件已更新');
    } else {
      const newId = Math.max(...data.map(r => r.id), 0) + 1;
      setData(prev => [...prev, { id: newId, ...form, updatedInfo: `系統 -${now}` }]);
      showToast('GTM儲存條件已新增');
    }
    setDialogOpen(false);
  };
  const handleDelete = (row: GtmStorageConditionRow) => {
    setData(prev => prev.filter(r => r.id !== row.id));
    showToast(`儲存條件 ${row.locationCode}-${row.conditionCode} 已刪除`);
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (searchLocation.trim())  result = result.filter(r => r.locationCode.toLowerCase().includes(searchLocation.trim().toLowerCase()));
    if (searchCondition.trim()) result = result.filter(r => r.conditionCode.toLowerCase().includes(searchCondition.trim().toLowerCase()));
    if (searchAddress.trim())   result = result.filter(r => r.address.toLowerCase().includes(searchAddress.trim().toLowerCase()));
    return result;
  }, [data, searchLocation, searchCondition, searchAddress]);

  const COLUMNS: StandardColumn<GtmStorageConditionRow>[] = [
    { key: 'locationCode',  label: '儲存地點代號', width: 160,  minWidth: 120 },
    { key: 'conditionCode', label: '儲存條件代號', width: 160,  minWidth: 120 },
    { key: 'factory',       label: '工廠',          width: 120,  minWidth: 80  },
    { key: 'address',       label: '地址',           width: 300,  minWidth: 180 },
    { key: 'updatedInfo',   label: '更新資訊',      width: 240,  minWidth: 160 },
    {
      key: 'id', label: '', width: 140, minWidth: 140, required: true,
      renderCell: (_val, row) => (
        <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <SearchField label="儲存地點代號" value={searchLocation}  onChange={setSearchLocation} />
        <SearchField label="儲存條件代號" value={searchCondition} onChange={setSearchCondition} />
        <SearchField label="地址"         value={searchAddress}   onChange={setSearchAddress} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<GtmStorageConditionRow>
          columns={COLUMNS}
          data={data}
          storageKey="shipping-settings-gtm-condition-v2"
          externalFilteredData={filteredData}
          showCheckbox={false}
          onExportCsv={() => exportRowsToCsv(filteredData, 'GTM儲存條件設定.csv', [
            { key: 'locationCode',  label: '儲存地點代號' },
            { key: 'conditionCode', label: '儲存條件代號' },
            { key: 'factory',       label: '工廠' },
            { key: 'address',       label: '地址' },
            { key: 'updatedInfo',   label: '更新資訊' },
          ])}
          actionButton={
            <Button
              className="h-[36px] bg-[#1c252e] text-white hover:bg-[#374151] rounded-[8px] px-[16px] text-[14px] font-semibold"
              onClick={openCreate}
            >
              新增
            </Button>
          }
        />
      </div>

      {/* 新增/編輯 Overlay */}
      <AddEditOverlay
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editRow ? '編輯GTM儲存條件VS儲存地點' : '新增GTM儲存條件VS儲存地點'}
        onSubmit={handleSave}
        submitLabel={editRow ? '儲存' : '新增'}
        disabled={!form.locationCode.trim() || !form.conditionCode.trim()}
      >
        <DropdownSelect
          label="儲存地點代號"
          value={form.locationCode}
          onChange={v => setForm(f => ({ ...f, locationCode: v }))}
          options={[
            { value: '1015', label: '1015' },
            { value: '1020', label: '1020' },
            { value: '1241', label: '1241' },
            { value: '2015', label: '2015' },
            { value: '2020', label: '2020' },
          ]}
          error={!form.locationCode}
        />
        <DropdownSelect
          label="儲存條件代號"
          value={form.conditionCode}
          onChange={v => setForm(f => ({ ...f, conditionCode: v }))}
          options={[
            { value: 'Z1', label: 'Z1' },
            { value: 'Z2', label: 'Z2' },
            { value: 'Z3', label: 'Z3' },
            { value: 'Z4', label: 'Z4' },
          ]}
          error={!form.conditionCode}
        />
        <FloatingInput label="地址" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="儲存地址" required />
      </AddEditOverlay>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        description={`確定要刪除儲存條件「${deleteTarget?.locationCode} - ${deleteTarget?.conditionCode}」嗎？此操作無法復原。`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3：GEM目的地設定
// ─────────────────────────────────────────────────────────────────────────────

function GemDestinationTab() {
  const [data, setData] = useState<GemDestinationRow[]>(GEM_DESTINATION_DATA);
  const [searchPurchaseOrg, setSearchPurchaseOrg] = useState('');
  const [searchTransport, setSearchTransport]     = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editRow, setEditRow]           = useState<GemDestinationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GemDestinationRow | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  const [form, setForm] = useState<Omit<GemDestinationRow, 'id' | 'updatedInfo'>>({
    purchaseOrg: '', transportType: '', destination: '',
  });

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const openCreate = () => {
    setEditRow(null);
    setForm({ purchaseOrg: '', transportType: '', destination: '' });
    setDialogOpen(true);
  };
  const openEdit = (row: GemDestinationRow) => {
    setEditRow(row);
    setForm({ purchaseOrg: row.purchaseOrg, transportType: row.transportType, destination: row.destination });
    setDialogOpen(true);
  };
  const handleSave = () => {
    const now = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    if (editRow) {
      setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form, updatedInfo: `系統 -${now}` } : r));
      showToast('GEM目的地設定已更新');
    } else {
      const newId = Math.max(...data.map(r => r.id), 0) + 1;
      setData(prev => [...prev, { id: newId, ...form, updatedInfo: `系統 -${now}` }]);
      showToast('GEM目的地設定已新增');
    }
    setDialogOpen(false);
  };
  const handleDelete = (row: GemDestinationRow) => {
    setData(prev => prev.filter(r => r.id !== row.id));
    showToast(`目的地設定 ${row.purchaseOrg}-${row.transportType} 已刪除`);
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (searchPurchaseOrg.trim())  result = result.filter(r => r.purchaseOrg.toLowerCase().includes(searchPurchaseOrg.trim().toLowerCase()));
    if (searchTransport.trim())    result = result.filter(r => r.transportType.toLowerCase().includes(searchTransport.trim().toLowerCase()));
    if (searchDestination.trim())  result = result.filter(r => r.destination.toLowerCase().includes(searchDestination.trim().toLowerCase()));
    return result;
  }, [data, searchPurchaseOrg, searchTransport, searchDestination]);

  const COLUMNS: StandardColumn<GemDestinationRow>[] = [
    { key: 'purchaseOrg',   label: '採購組織', width: 160, minWidth: 120 },
    { key: 'transportType', label: '運輸型態', width: 160, minWidth: 120 },
    { key: 'destination',   label: '目的地',   width: 200, minWidth: 140 },
    { key: 'updatedInfo',   label: '更新資訊', width: 260, minWidth: 180 },
    {
      key: 'id', label: '', width: 140, minWidth: 140, required: true,
      renderCell: (_val, row) => (
        <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <SearchField label="採購組織" value={searchPurchaseOrg}  onChange={setSearchPurchaseOrg} />
        <SearchField label="運輸型態" value={searchTransport}    onChange={setSearchTransport} />
        <SearchField label="目的地"   value={searchDestination}  onChange={setSearchDestination} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <StandardDataTable<GemDestinationRow>
          columns={COLUMNS}
          data={data}
          storageKey="shipping-settings-gem-destination-v1"
          externalFilteredData={filteredData}
          showCheckbox={false}
          onExportCsv={() => exportRowsToCsv(filteredData, 'GEM目的地設定.csv', [
            { key: 'purchaseOrg',   label: '採購組織' },
            { key: 'transportType', label: '運輸型態' },
            { key: 'destination',   label: '目的地' },
            { key: 'updatedInfo',   label: '更新資訊' },
          ])}
          actionButton={
            <Button
              className="h-[36px] bg-[#1c252e] text-white hover:bg-[#374151] rounded-[8px] px-[16px] text-[14px] font-semibold"
              onClick={openCreate}
            >
              新增
            </Button>
          }
        />
      </div>

      {/* 新增/編輯 Overlay */}
      <AddEditOverlay
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editRow ? '編輯GEM目的地' : '新增GEM目的地'}
        onSubmit={handleSave}
        submitLabel={editRow ? '儲存' : '新增'}
        disabled={!form.purchaseOrg.trim() || !form.transportType.trim() || !form.destination.trim()}
      >
        <DropdownSelect
          label="採購組織"
          value={form.purchaseOrg}
          onChange={v => setForm(f => ({ ...f, purchaseOrg: v }))}
          options={[{ value: '4111', label: '4111' }, { value: '4121', label: '4121' }]}
          error={!form.purchaseOrg}
        />
        <DropdownSelect
          label="運輸型態"
          value={form.transportType}
          onChange={v => setForm(f => ({ ...f, transportType: v }))}
          options={[{ value: 'A', label: 'A' }, { value: 'S', label: 'S' }, { value: 'Z1', label: 'Z1' }, { value: 'Z2', label: 'Z2' }]}
          error={!form.transportType}
        />
        <FloatingInput label="目的地" value={form.destination} onChange={v => setForm(f => ({ ...f, destination: v }))} placeholder="如: AMSTERDAM" required />
      </AddEditOverlay>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        description={`確定要刪除「採購組織 ${deleteTarget?.purchaseOrg} / 運輸型態 ${deleteTarget?.transportType} / 目的地 ${deleteTarget?.destination}」嗎？此操作無法復原。`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />

      {toastMsg && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[250] bg-[#1c252e] text-white px-[24px] py-[12px] rounded-[8px] shadow-[0px_8px_16px_rgba(0,0,0,0.16)] flex items-center gap-[8px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/>
            <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[14px]">{toastMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 主元件
// ─────────────────────────────────────────────────────────────────────────────

export function ShippingBasicSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('storage-location');

  return (
    <div className="bg-white flex flex-col h-full relative rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] w-full overflow-hidden">

      {/* ── Tab 列 ── */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[40px] items-center px-[20px] py-0 relative w-full overflow-x-auto">
            <TabItem
              label="儲存地點主檔"
              isActive={activeTab === 'storage-location'}
              onClick={() => setActiveTab('storage-location')}
            />
            <TabItem
              label="GTM儲存條件設定"
              isActive={activeTab === 'gtm-storage-condition'}
              onClick={() => setActiveTab('gtm-storage-condition')}
            />
            <TabItem
              label="GEM目的地設定"
              isActive={activeTab === 'gem-destination'}
              onClick={() => setActiveTab('gem-destination')}
            />
            {/* 底部灰線 */}
            <div className="absolute bg-[rgba(145,158,171,0.08)] bottom-0 h-[2px] left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ── Tab 內容 ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'storage-location'      && <StorageLocationTab />}
        {activeTab === 'gtm-storage-condition' && <GtmStorageConditionTab />}
        {activeTab === 'gem-destination'       && <GemDestinationTab />}
      </div>
    </div>
  );
}
