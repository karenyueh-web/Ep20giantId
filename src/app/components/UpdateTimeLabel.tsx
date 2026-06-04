/**
 * UpdateTimeLabel / NextUpdateTooltip
 * - UpdateTimeLabel: 純文字版的「更新時間」，hover 顯示「下次更新時間」藍底白字 tooltip
 * - NextUpdateTooltip: wrapper 版，可包住任何元素，hover 顯示相同 tooltip
 */

import { useState } from 'react';

// ── 輔助：時間字串 +1 小時（模擬下次排程時間）──────────────────────────────
function addOneHour(timeStr: string): string {
  try {
    const normalized = timeStr.replace(/\//g, '-');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return '—';
    d.setHours(d.getHours() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '—';
  }
}

// ── Tooltip 浮層（藍底白字）─────────────────────────────────────────────────
function TooltipBubble({ nextTime }: { nextTime: string }) {
  return (
    <span
      className="absolute z-[9999] whitespace-nowrap pointer-events-none"
      style={{ bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}
    >
      <span
        className="flex items-center px-[10px] py-[6px] rounded-[6px] text-white font-['Public_Sans:Regular',sans-serif] text-[12px] leading-[18px] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]"
        style={{ background: '#005eb8' }}
      >
        下次更新時間：{nextTime}
      </span>
      {/* 向下箭頭 */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '100%',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid #005eb8',
        }}
      />
    </span>
  );
}

// ── 純文字版：直接顯示 label + 時間，hover 時跳 tooltip ─────────────────────
interface UpdateTimeLabelProps {
  /** 顯示用的 label 文字，預設「更新時間」 */
  label?: string;
  /** 目前更新時間（格式：YYYY/MM/DD HH:mm） */
  currentTime: string;
  /** 下次更新時間，未傳入時自動 +1 小時模擬 */
  nextUpdateTime?: string;
}

export function UpdateTimeLabel({
  label = '更新時間',
  currentTime,
  nextUpdateTime,
}: UpdateTimeLabelProps) {
  const [hovered, setHovered] = useState(false);
  const nextTime = nextUpdateTime ?? addOneHour(currentTime);

  return (
    <span
      className="relative inline-flex items-center cursor-default select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#005eb8] whitespace-nowrap">
        {label}：{currentTime}
      </span>
      {hovered && <TooltipBubble nextTime={nextTime} />}
    </span>
  );
}

// ── Wrapper 版：包住任何子元素，hover 時跳 tooltip ──────────────────────────
interface NextUpdateTooltipProps {
  children: React.ReactNode;
  /** 目前更新時間，用來推算下次時間 */
  currentTime: string;
  /** 下次更新時間，未傳入時自動 +1 小時模擬 */
  nextUpdateTime?: string;
}

export function NextUpdateTooltip({
  children,
  currentTime,
  nextUpdateTime,
}: NextUpdateTooltipProps) {
  const [hovered, setHovered] = useState(false);
  const nextTime = nextUpdateTime ?? addOneHour(currentTime);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && <TooltipBubble nextTime={nextTime} />}
    </div>
  );
}
