/**
 * MDO 中台 API 基礎 client
 * 所有 MDO API 呼叫都透過這個 client
 */

const MDO_BASE = '/mdo-api';

function getApiKey(): string {
  return import.meta.env.VITE_MDO_API_KEY ?? '';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination?: PaginationMeta;
  meta?: { requestId?: string; timestamp?: string };
}

export interface SingleResponse<T> {
  data: T;
  meta?: { requestId?: string; timestamp?: string };
}

/** 基礎 fetch 包裝 */
async function mdoRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${MDO_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    // 嘗試解析 MDO 回傳的錯誤 body，取出 error.message / error.code
    let mdoMsg = `${res.status}: ${res.statusText}`;
    try {
      const errBody = await res.json();
      const e = errBody?.error;
      if (e) mdoMsg = `[${e.code ?? res.status}] ${e.message ?? res.statusText}`;
    } catch { /* 解析失敗就用預設 */ }
    throw Object.assign(new Error(`MDO ${mdoMsg} (${path})`), { status: res.status, mdoPath: path });
  }

  return res.json() as Promise<T>;

}

/** GET 列表（含分頁） */
export async function mdoList<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ListResponse<T>> {
  const url = params
    ? `${path}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()}`
    : path;
  return mdoRequest<ListResponse<T>>(url);
}

/** GET 單筆 */
export async function mdoGet<T>(path: string): Promise<T> {
  const res = await mdoRequest<SingleResponse<T>>(path);
  return res.data;
}

/** POST 命令（create / update / delete 等） */
export async function mdoCommand<TBody, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const res = await mdoRequest<SingleResponse<TResponse>>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}
