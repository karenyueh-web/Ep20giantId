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
import { QUALITY_OTHER_TABS, type QualityOtherTabKey } from '@/app/config/qualityOtherConfig';
import { StandardDataTable, type StandardColumn } from './StandardDataTable';
import { SearchField } from './SearchField';
import { DropdownSelect } from './DropdownSelect';
import { Button } from '@/app/components/ui/button';
import { DeleteButton } from './ActionButtons';
import { BaseOverlay } from './BaseOverlay';

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
  longSpec: string;          // 長規格描述
  updatedInfo: string;       // 最後修改資訊
  _action?: never;           // 虛擬欄，供刪除按鈕欄位使用
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

type ActiveTab = QualityOtherTabKey;

// ─────────────────────────────────────────────────────────────────────────────
// Mock 資料
// ─────────────────────────────────────────────────────────────────────────────

const INCOMING_INSPECTION_DATA: IncomingInspectionRow[] = [
  // ── 協立 0001003621 ─────────────────────────────────────────────────────────
  { id:  1, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-001', longSpec: 'XCE26 SOFT COIL 27.5" 90 1.125 265 AL PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  2, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-002', longSpec: 'XCE26 SOFT COIL 27.5" 90 1.125 265 AL PM 9 100 W/O RMT A/L OOD CROWN&LEG: YS 727 MATTE W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  3, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-003', longSpec: 'XCE26 SOFT COIL 29" 100 1.125 265 PM 9 100 W/O RMT A/L OOD CROWN&LEG: YS 727 MATTE W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  4, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-004', longSpec: 'XCE26 SOFT COIL 29" 100 1.125 265 PM 9 100 W/O RMT W/ TRANSAR T TA-2509 MATTE DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  5, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-005', longSpec: 'XCE26 SOFT COIL 27.5" 90 1.125 265 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  6, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-006', longSpec: 'XCE26 STD COIL 27.5" 90 1.125 265 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  7, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-007', longSpec: 'XCE26 STD COIL 27.5" 100 1.125 265 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  8, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCE280-008', longSpec: 'XCE26 STD COIL 29" 100 1.125 260 PM 9 100 W/O RMT AL OOD CROWN&LEG: YS 727 MATTE W/ YS 728 GLOSS& YS 727 MATTE DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id:  9, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMHD80-009', longSpec: 'XCM HARD COIL 29" 100 1.125 265 POST MOUNT 9 100 WITHOUT REMOTE ALLOY OOD CROWN&LEG: YS 727 MATTE W/YS 728', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 10, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMSD0-001', longSpec: 'XCM DS COIL HARD 29" 100 1.125 265 STEEL 46 PM 160 9 100 W/O RMT W/O LOCKOUT AL STD OOD BLK M BLK DECAL MY21', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 11, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMSD0-002', longSpec: 'XCM DS COIL STD 29" 100 1.125 265 STEEL 46 PM 160 9 100 W/O RMT W/O LOCKOUT AL STD M BLK M BLK DECAL MY21 TALON 3-GE', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 12, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMSD0-003', longSpec: 'SF20 XCM DS COIL SOFT 27.5" 060 80 1.125 265 STEEL 42 PM 160 9 100 W/O RMT W/O LOCKOUT AL C: YS727 MATTE BLACKIF: YS727', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 13, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMTS0-004', longSpec: 'SF20 XCM DS COIL SOFT 29" 080 100 1.125 265 STEEL 51 PM 160 9 100 W/O RMT W/O LOCKOUT AL C: YS727 MATTE BLACKIF: YS727 M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 14, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMTS0-005', longSpec: 'SF20 XCM DS COIL SOFT 27.5" 060 80 1.125 265 STEEL 51 PM 160 9 100 W/O RMT W/O LOCKOUT AL C: YS727 MATTE BLACKIF: YS727 M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 15, factory: 'GVM1', vendor: '協立(0001003621)', partNo: '1111-XCMTS0-006', longSpec: 'SF20 XCM DS COIL HARD 27.5" 080 90 1.125 265MM PM OD0 9 100 W/O RMT W/OMMMQR W/O REMOTE W/O LOCKOUT ALLOY G/F: YS 727 BLK MATTE W/TA 2', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 帝盟 0001003650 ─────────────────────────────────────────────────────────
  { id: 16, factory: 'GVM1', vendor: '帝盟(0001003650)', partNo: '1710-DDKGP2-0001', longSpec: 'DDK GP2000 TEM99 BLACK STEEL BLACK WITH BUMPER BLACK BA417541A PRO ACTIVE', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 信友 0001005224 ─────────────────────────────────────────────────────────
  { id: 17, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-033', longSpec: 'CONNECT(ATB) TCHL XC RISE 320BTFOV 31.8X640 R20 6D/3D SSABK W/MY20 DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 18, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-034', longSpec: 'CONNECT(ATB) TCHL XC RISE 320BTFOV 31.8X670 R20 6D/3D SSABK W/MY20 DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 19, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-035', longSpec: 'CONNECT(ATB) TCHL TR RISER 320BTFOV 31.8X720 R20 6D/3D SSABK W/MY20 DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 20, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-036', longSpec: 'CONNECT(ATB) TCHL TR RISER 320BTFOV 31.8X730-320 6D/3D SSABK W/MY20 DECAL W/ WARNING DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 21, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1321-CONNEC-037', longSpec: 'CONNECT(ATB) TCHL TR RISER 320BTFOV 31.8X750 R20 6D/3D SSABK W/MY20 DECAL W/ WARNING DECAL', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 22, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDSD50-002', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LOGO', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 23, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS250-002', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LOGO', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 24, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS500-003', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LOGO', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 25, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS500-004', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LG', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 26, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1330-TDS500-005', longSpec: 'TDS-D507G-6FOV(ATB) 28.6X(31.8) H=41 7D S.A BK W/BK BOLT W/O LG', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 27, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1721-SPC217-001', longSpec: 'SP-R217/ROAD A) 30.9X300 AL SAUK BK W/BK HEAD W2/PC BK BOLT W/O LG W/LASER 1&2 REPEAT 8-9N M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 28, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1721-SPC217-002', longSpec: 'SP 217/ROAD A) 30.9X375 AL SAUK BK W/BK HEAD W2/PC BK BOLT W/O LG W/LASER 1&2 REPEAT 8.9N.M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 29, factory: 'GVM1', vendor: '信友(0001005224)', partNo: '1721-SPC217-003', longSpec: 'SP 217/ROAD A) 30.9X395 AL SAUK BK W/BK HEAD W2/PC BK BOLT W/O LG W/LASER 1&2 REPEAT 8.9N.M', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 百勝 0001005285 ─────────────────────────────────────────────────────────
  { id: 30, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-001', longSpec: 'CPH-5 1350DX1800 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 31, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-002', longSpec: 'CPH-5 1390DX1600 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 32, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-003', longSpec: 'CPH-5 1420DX1000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 33, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-004', longSpec: 'CPH-5 1450DX1000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 34, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-005', longSpec: 'CPH-5 1550DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 35, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-006', longSpec: 'CPH-5 1650DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 36, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-016', longSpec: 'CPH-5 750DX1000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 37, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-018', longSpec: 'CPH-5 820DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 38, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-022', longSpec: 'CPH-5 8200DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 39, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-025', longSpec: 'CPH-1 5820DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 40, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-026', longSpec: 'CPH-5 8200DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 41, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-027', longSpec: 'CPH-5 8200DX1200 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 42, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-028', longSpec: 'CPH-5 8500DX1100 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 43, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-030', longSpec: 'CPH-5 14800DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 44, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-031', longSpec: 'CPH-5 15000DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 45, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-032', longSpec: 'CPH-5 720DX2000 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  { id: 46, factory: 'GVM1', vendor: '百勝(0001005285)', partNo: '1450-5111SR-033', longSpec: 'CPH-5 7700C 60 211.5 142 C1 BLK RGA-1.5 7X6 W/OBC-5111SR-NT', updatedInfo: 'Paul Sun 孫杰坪-2022/10/07' },
  // ── 台灣威菱 0001005861 ──────────────────────────────────────────────────────
  { id: 47, factory: 'GVM1', vendor: '台灣威菱(0001005861)', partNo: '10T1475ANM001', longSpec: 'T1475A 700C 56 134 1/42 CARBO 鉻鉬管 齒 1475U0022', updatedInfo: 'Paul Sun 孫杰坪-2023/12/05' },
  { id: 48, factory: 'GTM1', vendor: '台灣威菱(0001005861)', partNo: '10T1475ANM002', longSpec: 'T1475A 700C 56 134 1/42 CARBO 鉻鉬管 齒 1475U0022', updatedInfo: 'Paul Sun 孫杰坪-2023/04/05' },
  // ── 環宇 0001000259 ──────────────────────────────────────────────────────────
  { id: 49, factory: 'AIP1', vendor: '環宇(0001000259)', partNo: '4442-GLOB6-005', longSpec: 'POWER Global 6.2 A 149 W 24 V L', updatedInfo: 'SOY-2023/08/11' },
];



// Mock 選項資料（將來串 API）
const FACTORY_OPTIONS = [
  { value: 'GVM1', label: 'GVM1' },
  { value: 'GTM1', label: 'GTM1' },
  { value: 'GEM1', label: 'GEM1' },
  { value: 'GPM1', label: 'GPM1' },
];

const VENDOR_OPTIONS = [
  { value: '0001005224', label: '信友 (0001005224)' },
  { value: '0001009900', label: '台灣松下 (0001009900)' },
  { value: '0002001100', label: '億光 (0002001100)' },
  { value: '0003000512', label: '禧瑪諾 (0003000512)' },
  { value: '0004001872', label: '速聯 (0004001872)' },
];

// 料號選項（廠商選定後才有效，模擬中台物料阻擋 API）
const PART_NO_BY_VENDOR: Record<string, { value: string; label: string; longSpec: string }[]> = {
  '0001005224': [
    { value: '1321-CONNEC-033', label: '1321-CONNEC-033', longSpec: 'CONNECT(ATB) TCHL XC RISE 320BT' },
    { value: '1321-CONNEC-034', label: '1321-CONNEC-034', longSpec: 'CONNECT(ATB) TCHL XC RISE 400BT' },
    { value: '1321-CONNEC-035', label: '1321-CONNEC-035', longSpec: 'CONNECT(ATB) TCHL XC RISE 500BT' },
  ],
  '0001009900': [
    { value: 'BA-2048-M12-01', label: 'BA-2048-M12-01', longSpec: 'BATTERY 48V 12AH BLK PANASONIC' },
    { value: 'BA-2048-M12-02', label: 'BA-2048-M12-02', longSpec: 'BATTERY 48V 12AH WHT PANASONIC' },
    { value: 'BA-3648-M12-01', label: 'BA-3648-M12-01', longSpec: 'BATTERY 48V 12AH BLK PANASONIC XL' },
  ],
  '0002001100': [
    { value: 'LT-F001-LED-01', label: 'LT-F001-LED-01', longSpec: 'FRONT LIGHT LED 80 LUX USB-C BLK' },
    { value: 'LT-F002-LED-01', label: 'LT-F002-LED-01', longSpec: 'FRONT LIGHT LED 120 LUX USB-C BLK' },
  ],
  '0003000512': [
    { value: 'DL-6800-GS', label: 'DL-6800-GS', longSpec: 'DERAILL REAR SHIMANO DEORE XT M8100' },
  ],
  '0004001872': [
    { value: 'FD-SRAM-AXS-01', label: 'FD-SRAM-AXS-01', longSpec: 'DERAILLEUR FRONT SRAM AXS 2X 12SPD' },
  ],
};


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


// ─────────────────────────────────────────────────────────────────────────────
// AddInspectionOverlay — 新增檢驗料號彈窗
// ─────────────────────────────────────────────────────────────────────────────

interface AddInspectionOverlayProps {
  onClose: () => void;
  onAdd: (row: Omit<IncomingInspectionRow, 'id'>) => void;
}

function AddInspectionOverlay({ onClose, onAdd }: AddInspectionOverlayProps) {
  const [factory, setFactory] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [partNo, setPartNo]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const partOptions = vendorId ? (PART_NO_BY_VENDOR[vendorId] ?? []) : [];
  const selectedPart = partOptions.find(p => p.value === partNo);
  const vendorLabel = VENDOR_OPTIONS.find(v => v.value === vendorId)?.label ?? '';

  // 選廠商切換時清空料號
  const handleVendorChange = (v: string) => {
    setVendorId(v);
    setPartNo('');
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!factory || !vendorId || !partNo) return;
    onAdd({
      factory,
      vendor: vendorLabel,
      partNo,
      longSpec: selectedPart?.longSpec ?? '',
      updatedInfo: 'System-' + new Date().toLocaleDateString('zh-TW'),
    });
    onClose();
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="520px" maxHeight="460px">
      <div className="relative w-full h-full">
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

        {/* 內容區 */}
        <div className="flex flex-col h-full px-[50px] pt-[58px] pb-[40px] gap-[24px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            新增檢驗料號
          </p>

          <div className="flex flex-col gap-[20px] flex-1">
            {/* 工廠 */}
            <DropdownSelect
              label="工廠"
              value={factory}
              onChange={setFactory}
              options={FACTORY_OPTIONS}
              placeholder="請選擇工廠"
              searchable
              error={submitted && !factory}
            />

            {/* 廠商 */}
            <DropdownSelect
              label="廠商"
              value={vendorId}
              onChange={handleVendorChange}
              options={VENDOR_OPTIONS}
              placeholder="請選擇廠商"
              searchable
              error={submitted && !vendorId}
            />

            {/* 料號（廠商未選時 disabled） */}
            <div>
              <DropdownSelect
                label="料號"
                value={partNo}
                onChange={setPartNo}
                options={partOptions}
                placeholder={vendorId ? '請選擇料號' : '請先選擇廠商'}
                searchable
                disabled={!vendorId}
                error={submitted && !partNo}
              />
              {/* 長規格描述預覽 */}
              {selectedPart && (
                <p className="mt-[8px] text-[12px] text-[#637381] leading-[18px] pl-[2px]">
                  {selectedPart.longSpec}
                </p>
              )}
              {submitted && !partNo && (
                <p className="mt-[4px] text-[12px] text-[#ff5630]">請選擇料號</p>
              )}
            </div>
          </div>

          {/* 新增按鈕 */}
          <button
            onClick={handleSubmit}
            className="w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
            style={{ backgroundColor: '#00559c' }}
          >
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">新增</p>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab1：入廠需檢驗的物料
// ─────────────────────────────────────────────────────────────────────────────

function Tab1IncomingInspection() {
  const [rows, setRows] = useState<IncomingInspectionRow[]>(INCOMING_INSPECTION_DATA);
  const [vendorSearch, setVendorSearch] = useState('');
  const [partSearch, setPartSearch]     = useState('');
  const [showAddOverlay, setShowAddOverlay] = useState(false);

  const handleDelete = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleAdd = (row: Omit<IncomingInspectionRow, 'id'>) => {
    setRows(prev => [...prev, { id: Date.now(), ...row }]);
  };

  const filtered = useMemo(() => {
    return rows.filter(row => {
      const matchVendor = !vendorSearch || row.vendor.includes(vendorSearch);
      const matchPart   = !partSearch   || row.partNo.toLowerCase().includes(partSearch.toLowerCase());
      return matchVendor && matchPart;
    });
  }, [rows, vendorSearch, partSearch]);

  const columns: StandardColumn<IncomingInspectionRow>[] = [
    { key: 'id',          label: '#',          width: 56,  minWidth: 48  },
    { key: 'factory',     label: '工廠',        width: 90,  minWidth: 72  },
    { key: 'vendor',      label: '廠商',        width: 200, minWidth: 140 },
    { key: 'partNo',      label: '料號',        width: 180, minWidth: 120 },
    { key: 'longSpec',    label: '長規格描述',  width: 280, minWidth: 160 },
    { key: 'updatedInfo', label: '最後修改資訊', width: 220, minWidth: 160 },
    {
      key: '_action',
      label: '',
      width: 64,
      minWidth: 64,
      required: true,
      renderCell: (_val, row) => (
        <div onClick={e => e.stopPropagation()}>
          <DeleteButton onClick={() => handleDelete(row.id)} title="移除此料號" />
        </div>
      ),
    },
  ];


  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 搜尋列 */}
      <div className="shrink-0 flex gap-[16px] items-center px-[20px] py-[16px]">
        <div className="flex-1 min-w-0">
          <SearchField
            label="廠商"
            value={vendorSearch}
            onChange={setVendorSearch}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SearchField
            label="料號"
            value={partSearch}
            onChange={setPartSearch}
          />
        </div>
      </div>


      {/* 表格 */}
      <StandardDataTable
        columns={columns}
        data={filtered}
        storageKey="quality-other-tab1-v2"
        showCheckbox={false}
        embedded
        onExportCsv={() => exportRowsToCsv(filtered, '入廠需檢驗的物料.csv', [
          { key: 'factory',     label: '工廠' },
          { key: 'vendor',      label: '廠商' },
          { key: 'partNo',      label: '料號' },
          { key: 'longSpec',    label: '長規格描述' },
          { key: 'updatedInfo', label: '最後修改資訊' },
        ])}
        actionButton={
          <button
            id="q-other-tab1-add-btn"
            onClick={() => setShowAddOverlay(true)}
            className="flex items-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] transition-colors"
          >
            新增
          </button>
        }
      />

      {/* 新增彈窗 */}
      {showAddOverlay && (
        <AddInspectionOverlay
          onClose={() => setShowAddOverlay(false)}
          onAdd={handleAdd}
        />
      )}
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
  const [rows, setRows] = useState<HazardRegRow[]>(HAZARD_REG_DATA);
  const [regCodeSearch, setRegCodeSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');

  const handleToggleEnabled = (id: number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const filtered = useMemo(() => {
    return rows.filter(row => {
      const matchCode    = !regCodeSearch || row.regCode.toLowerCase().includes(regCodeSearch.toLowerCase());
      const matchEnabled = !enabledFilter
        || (enabledFilter === 'enabled'  && row.enabled)
        || (enabledFilter === 'disabled' && !row.enabled);
      return matchCode && matchEnabled;
    });
  }, [rows, regCodeSearch, enabledFilter]);

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
          <ToggleSwitch checked={row.enabled} onChange={() => handleToggleEnabled(row.id)} />
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

  const tabs = QUALITY_OTHER_TABS;

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
