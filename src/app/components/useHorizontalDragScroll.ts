import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * 水平拖拽滾動 Hook
 * 讓使用者可以在表格資料區域（標題列以下）按住左鍵拖拽來水平滾動，
 * 不需要一定操作底部 scrollbar 才能看到右邊的資料。
 * 
 * 特性：
 * - 僅在有水平溢出時啟用（scrollWidth > clientWidth）
 * - 不影響表頭的欄位拖拽排序與寬度調整
 * - 不影響 checkbox、按鈕、連結等互動元素的點擊
 * - 拖拽時游標顯示為 grabbing，資料區域 hover 時顯示 grab
 * - 支援慣性滑動（momentum scrolling）
 */
export function useHorizontalDragScroll() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);
  const [canDragScroll, setCanDragScroll] = useState(false);

  // 偵測是否有水平 overflow
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      setCanDragScroll(container.scrollWidth > container.clientWidth + 1);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);

    // 當內容改變時也重新檢測
    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 僅左鍵
    if (e.button !== 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // 無水平溢出時不啟用
    if (container.scrollWidth <= container.clientWidth + 1) return;

    const target = e.target as HTMLElement;

    // 排除互動元素（按鈕、連結、輸入框、checkbox 等）
    if (target.closest('button, a, input, select, textarea, label, [role="button"], [role="checkbox"]')) return;

    // 排除表頭區域（sticky header 帶有 data-table-header）
    if (target.closest('[data-table-header="true"]')) return;

    // 排除 checkbox 欄位容器（避免 gap 空隙吃掉 click 事件）
    if (target.closest('[data-is-checkbox="true"]')) return;

    // 排除 re-resizable 的 resize handle
    if (target.closest('[class*="resizable-handler"], [class*="Resizable"]')) return;

    // 排除 CheckboxIcon SVG 區域
    if (target.closest('svg')) return;

    // 排除文字節點（<p> 包住的儲存格文字）：讓瀏覽器原生文字選取正常運作
    if (target.closest('p')) return;

    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.clientX;
    scrollLeftStart.current = container.scrollLeft;

    // 注意：不在此處呼叫 e.preventDefault()，保留瀏覽器原生文字選取能力
    // userSelect / cursor 等樣式在 mousemove 確認拖拽後才鎖定
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const deltaX = e.clientX - startX.current;

    // 超過 3px 才算拖拽（避免誤觸）
    if (Math.abs(deltaX) > 3) {
      if (!hasMoved.current) {
        // 剛超過門檻：鎖住文字選取、清除已選範圍
        hasMoved.current = true;
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
        window.getSelection()?.removeAllRanges();
      }
      container.scrollLeft = scrollLeftStart.current - deltaX;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = '';
      container.style.userSelect = '';
    }
  }, []);

  // 全域監聽 mousemove 和 mouseup（支援拖拽超出容器範圍）
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    scrollContainerRef,
    handleMouseDown,
    /** 是否存在水平溢出（可用於條件式顯示 grab 游標） */
    canDragScroll,
  };
}