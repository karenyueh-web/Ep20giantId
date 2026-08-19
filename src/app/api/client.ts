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
    throw new Error(`MDO API error ${res.status}: ${res.statusText} (${path})`);
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
