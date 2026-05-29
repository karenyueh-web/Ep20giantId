// ── 發票設定：字軌主檔資料（共用，供 InvoiceSettingsPage 與 invoiceStore 使用）──

export interface TrackRecord {
  id: number;
  year: string;
  month: string;
  taxCode: string;
  track: string;
}

export const TRACK_DATA: TrackRecord[] = [
  { id: 1,  year: '2025', month: '01', taxCode: 'V0', track: 'HT' },
  { id: 2,  year: '2025', month: '01', taxCode: 'V0', track: 'HU' },
  { id: 3,  year: '2025', month: '02', taxCode: 'V0', track: 'HT' },
  { id: 4,  year: '2025', month: '02', taxCode: 'V0', track: 'HV' },
  { id: 5,  year: '2025', month: '03', taxCode: 'V1', track: 'JA' },
  { id: 6,  year: '2025', month: '03', taxCode: 'V1', track: 'JB' },
  { id: 7,  year: '2025', month: '04', taxCode: 'V0', track: 'HW' },
  { id: 8,  year: '2025', month: '04', taxCode: 'V0', track: 'HX' },
  { id: 9,  year: '2025', month: '05', taxCode: 'V0', track: 'HY' },
  { id: 10, year: '2025', month: '05', taxCode: 'V1', track: 'JC' },
  { id: 11, year: '2025', month: '06', taxCode: 'V0', track: 'HZ' },
  { id: 12, year: '2024', month: '01', taxCode: 'V0', track: 'GT' },
  { id: 13, year: '2024', month: '02', taxCode: 'V0', track: 'GU' },
  { id: 14, year: '2024', month: '03', taxCode: 'V1', track: 'IA' },
];
