/**
 * UpdateTimeLabel / NextUpdateTooltip
 * - UpdateTimeLabel: 純文字版的「更新時間」，hover 顯示「下次更新時間」tooltip
 * - NextUpdateTooltip: wrapper 版，可包住任何元素，hover 顯示相同 tooltip
 *
 * tooltip 使用專案既有的 shadcn/ui Tooltip（Radix UI Portal + 智慧定位），
 * 不受 overflow-hidden 裁切，也不會超出視窗邊界。
 */

import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';

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

// ── 純文字版：直接顯示 label + 時間，hover 時跳 tooltip ─────────────────────
interface UpdateTimeLabelProps {
  /** 顯示用的 label 文字，預設「更新時間」 */
  label?: string;
  /** 目前更新時間（格式：YYYY/MM/DD HH:mm） */
  currentTime: string;
  /** 下次更新時間，未傳入時自動 +1 小時模擬 */
  nextUpdateTime?: string;
  /** 更新頻率文字（預設「10分鐘一次」），未來串接排程設定 */
  refreshInterval?: string;
}

export function UpdateTimeLabel({
  label = '更新時間',
  currentTime,
  nextUpdateTime,
  refreshInterval = '10分鐘一次',
}: UpdateTimeLabelProps) {
  const nextTime = nextUpdateTime ?? addOneHour(currentTime);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center cursor-default select-none">
          <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#005eb8] whitespace-nowrap">
            {label}：{currentTime}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={8}
        align="end"
        collisionPadding={16}
        className="bg-[#005eb8] text-white font-['Public_Sans:Regular',sans-serif] text-[12px] leading-[18px] px-[10px] py-[6px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]"
        arrowClassName="bg-[#005eb8] fill-[#005eb8]"
      >
        下次更新時間：{nextTime} ({refreshInterval})
      </TooltipContent>
    </Tooltip>
  );
}

// ── Wrapper 版：包住任何子元素，hover 時跳 tooltip ──────────────────────────
interface NextUpdateTooltipProps {
  children: React.ReactNode;
  /** 目前更新時間，用來推算下次時間 */
  currentTime: string;
  /** 下次更新時間，未傳入時自動 +1 小時模擬 */
  nextUpdateTime?: string;
  /** 更新頻率文字（預設「10分鐘一次」），未來串接排程設定 */
  refreshInterval?: string;
}

export function NextUpdateTooltip({
  children,
  currentTime,
  nextUpdateTime,
  refreshInterval = '10分鐘一次',
}: NextUpdateTooltipProps) {
  const nextTime = nextUpdateTime ?? addOneHour(currentTime);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex">{children}</div>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={8}
        align="end"
        collisionPadding={16}
        className="bg-[#005eb8] text-white font-['Public_Sans:Regular',sans-serif] text-[12px] leading-[18px] px-[10px] py-[6px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.2)]"
        arrowClassName="bg-[#005eb8] fill-[#005eb8]"
      >
        下次更新時間：{nextTime} ({refreshInterval})
      </TooltipContent>
    </Tooltip>
  );
}
