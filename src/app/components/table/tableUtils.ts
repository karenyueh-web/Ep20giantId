// ── 表格共用工具函式 ──────────────────────────────────────────────────────────

/**
 * 測量文字寬度（使用 DOM span，支援中文字型 fallback）
 * 用於「雙擊自動最適欄寬」功能
 */
export function measureTextWidth(
  text: string,
  font = '14px "Public Sans", "Noto Sans JP", sans-serif',
): number {
  let el = (measureTextWidth as any)._el as HTMLSpanElement | undefined;
  if (!el) {
    el = document.createElement('span');
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    (measureTextWidth as any)._el = el;
  }
  el.style.font = font;
  el.textContent = text;
  return el.offsetWidth;
}
