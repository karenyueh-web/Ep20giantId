import { mdoList, mdoGet } from '../client';

export interface MdoExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  enterprise_id?: string;
  created_at: string;
}

/** 取得所有匯率 */
export async function fetchExchangeRates(): Promise<MdoExchangeRate[]> {
  const res = await mdoList<MdoExchangeRate>('/finance-commercial/exchange-rates');
  return res.data;
}

/** 取得最新匯率（指定幣別對） */
export async function fetchLatestExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<MdoExchangeRate | null> {
  const all = await fetchExchangeRates();
  const matched = all
    .filter(r => r.from_currency === fromCurrency && r.to_currency === toCurrency)
    .sort((a, b) => b.effective_date.localeCompare(a.effective_date));
  return matched[0] ?? null;
}
