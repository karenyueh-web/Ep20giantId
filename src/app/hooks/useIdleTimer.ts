// @refresh reset
import { useEffect, useRef } from 'react';

interface UseIdleTimerOptions {
  onIdle: () => void;
  idleTime?: number;
  enabled?: boolean;
}

export function useIdleTimer({ onIdle, idleTime = 3600000, enabled = true }: UseIdleTimerOptions) {
  // hook 1
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // hook 2 — store latest values; assigned synchronously each render (no extra useEffect needed)
  const latestRef = useRef({ onIdle, idleTime });
  latestRef.current = { onIdle, idleTime };

  // hook 3 — only re-runs when `enabled` changes
  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        latestRef.current.onIdle();
      }, latestRef.current.idleTime);
    };

    // mousemove excluded — fires hundreds of times per second, costly
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [enabled]);
}
