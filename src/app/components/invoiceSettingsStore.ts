// ── 發票設定：字軌主檔資料（共用，供 InvoiceSettingsPage 與 invoiceStore 使用）──

export interface TrackRecord {
  id: number;
  year: string;
  month: string;
  taxCode: string;
  track: string;
}

export const TRACK_DATA: TrackRecord[] = [
  // ── 2024 ──
  { id: 1,  year: '2024', month: '01', taxCode: 'V0', track: 'GT' },
  { id: 2,  year: '2024', month: '02', taxCode: 'V0', track: 'GU' },
  { id: 3,  year: '2024', month: '03', taxCode: 'V1', track: 'IA' },
  { id: 4,  year: '2024', month: '04', taxCode: 'V0', track: 'GV' },
  { id: 5,  year: '2024', month: '05', taxCode: 'V0', track: 'GW' },
  { id: 6,  year: '2024', month: '06', taxCode: 'V1', track: 'IB' },
  { id: 7,  year: '2024', month: '07', taxCode: 'V0', track: 'GX' },
  { id: 8,  year: '2024', month: '08', taxCode: 'V0', track: 'GY' },
  { id: 9,  year: '2024', month: '09', taxCode: 'V1', track: 'IC' },
  { id: 10, year: '2024', month: '10', taxCode: 'V0', track: 'GZ' },
  { id: 11, year: '2024', month: '11', taxCode: 'V0', track: 'HA' },
  { id: 12, year: '2024', month: '12', taxCode: 'V1', track: 'ID' },
  // ── 2025 ──
  { id: 13, year: '2025', month: '01', taxCode: 'V0', track: 'HT' },
  { id: 14, year: '2025', month: '01', taxCode: 'V0', track: 'HU' },
  { id: 15, year: '2025', month: '02', taxCode: 'V0', track: 'HT' },
  { id: 16, year: '2025', month: '02', taxCode: 'V0', track: 'HV' },
  { id: 17, year: '2025', month: '03', taxCode: 'V1', track: 'JA' },
  { id: 18, year: '2025', month: '03', taxCode: 'V1', track: 'JB' },
  { id: 19, year: '2025', month: '04', taxCode: 'V0', track: 'HW' },
  { id: 20, year: '2025', month: '04', taxCode: 'V0', track: 'HX' },
  { id: 21, year: '2025', month: '05', taxCode: 'V0', track: 'HY' },
  { id: 22, year: '2025', month: '05', taxCode: 'V1', track: 'JC' },
  { id: 23, year: '2025', month: '06', taxCode: 'V0', track: 'HZ' },
  { id: 24, year: '2025', month: '07', taxCode: 'V0', track: 'HB' },
  { id: 25, year: '2025', month: '07', taxCode: 'V1', track: 'JD' },
  { id: 26, year: '2025', month: '08', taxCode: 'V0', track: 'HC' },
  { id: 27, year: '2025', month: '08', taxCode: 'V1', track: 'JE' },
  { id: 28, year: '2025', month: '09', taxCode: 'V0', track: 'HD' },
  { id: 29, year: '2025', month: '09', taxCode: 'V1', track: 'JF' },
  { id: 30, year: '2025', month: '10', taxCode: 'V0', track: 'HE' },
  { id: 31, year: '2025', month: '10', taxCode: 'V1', track: 'JG' },
  { id: 32, year: '2025', month: '11', taxCode: 'V0', track: 'HF' },
  { id: 33, year: '2025', month: '11', taxCode: 'V1', track: 'JH' },
  { id: 34, year: '2025', month: '12', taxCode: 'V0', track: 'HG' },
  { id: 35, year: '2025', month: '12', taxCode: 'V1', track: 'JI' },
  // ── 2026 ──
  { id: 36, year: '2026', month: '01', taxCode: 'V0', track: 'HH' },
  { id: 37, year: '2026', month: '01', taxCode: 'V1', track: 'JJ' },
  { id: 38, year: '2026', month: '02', taxCode: 'V0', track: 'HI' },
  { id: 39, year: '2026', month: '02', taxCode: 'V1', track: 'JK' },
  { id: 40, year: '2026', month: '03', taxCode: 'V0', track: 'HJ' },
  { id: 41, year: '2026', month: '03', taxCode: 'V1', track: 'JL' },
  { id: 42, year: '2026', month: '04', taxCode: 'V0', track: 'HK' },
  { id: 43, year: '2026', month: '04', taxCode: 'V1', track: 'JM' },
  { id: 44, year: '2026', month: '05', taxCode: 'V0', track: 'HL' },
  { id: 45, year: '2026', month: '05', taxCode: 'V1', track: 'JN' },
  { id: 46, year: '2026', month: '06', taxCode: 'V0', track: 'HM' },
  { id: 47, year: '2026', month: '06', taxCode: 'V1', track: 'JO' },
  { id: 48, year: '2026', month: '07', taxCode: 'V0', track: 'HN' },
  { id: 49, year: '2026', month: '07', taxCode: 'V1', track: 'JP' },
  { id: 50, year: '2026', month: '08', taxCode: 'V0', track: 'HO' },
  { id: 51, year: '2026', month: '08', taxCode: 'V1', track: 'JQ' },
  { id: 52, year: '2026', month: '09', taxCode: 'V0', track: 'HP' },
  { id: 53, year: '2026', month: '09', taxCode: 'V1', track: 'JR' },
  { id: 54, year: '2026', month: '10', taxCode: 'V0', track: 'HQ' },
  { id: 55, year: '2026', month: '10', taxCode: 'V1', track: 'JS' },
  { id: 56, year: '2026', month: '11', taxCode: 'V0', track: 'HR' },
  { id: 57, year: '2026', month: '11', taxCode: 'V1', track: 'JT' },
  { id: 58, year: '2026', month: '12', taxCode: 'V0', track: 'HS' },
  { id: 59, year: '2026', month: '12', taxCode: 'V1', track: 'JU' },
];
