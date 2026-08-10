import { useState, useRef, useCallback, useEffect } from 'react';
import {
  LayoutDashboard, Megaphone, ClipboardList, FilePen, Truck,
  Receipt, Users, Settings as SettingsIcon, UserCheck, Component,
  Shield, ShieldCheck, PackageCheck, CalendarDays,
  ChevronDown, ChevronRight, MessageCircle, Globe,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import svgPaths from "@/imports/svg-d84x18jyny";
import type { PageType } from './MainLayout';
import { pageConfig } from '@/app/config/pageConfig';
import { BaseOverlay } from './BaseOverlay';
import { mockVendorsSuccess, mockVendorsFail } from '@/imports/廠商帳號審核-4007-9767';
import { useLanguage, type Language } from './LanguageContext';
import { useSidebar } from './SidebarContext';
import { getSampleOrders } from './sampleOrderData';
import { getChatUnreadCount } from '@/app/data/chatData';
import { getParts } from './partsMaintenanceData';


// ── 通知數量（從 localStorage 讀取未讀公告數，後端對接時替換）────────────────────
const ANNOUNCEMENT_MOCK_VERSION = 'v2'; // 需與 announcementData.ts 的 MOCK_VERSION 一致

function getAnnouncementUnreadCount(): number {
  try {
    const version = localStorage.getItem('announcementMockVersion');
    const announcementsRaw = localStorage.getItem('announcements');
    const readIdsRaw = localStorage.getItem('announcementReadIds');

    const totalIds: string[] = announcementsRaw
      ? (JSON.parse(announcementsRaw) as { id: string }[]).map(a => a.id)
      : ['ann-001', 'ann-002', 'ann-003', 'ann-004']; // mock 預設 4 筆

    // 版本不符（含首次載入、mock 資料更新後尚未進入公佈欄）
    // → readIds 尚未被 loadAnnouncements() 重置，一律視為「全部未讀」
    if (version !== ANNOUNCEMENT_MOCK_VERSION) {
      return totalIds.length;
    }

    const readIds: string[] = readIdsRaw ? JSON.parse(readIdsRaw) : [];
    const readSet = new Set(readIds);
    return totalIds.filter(id => !readSet.has(id)).length;
  } catch {
    return 0;
  }
}

function useNotificationCounts() {
  const [counts, setCounts] = useState(() => ({
    announcement: getAnnouncementUnreadCount(),
    chat: getChatUnreadCount(),
  }));

  useEffect(() => {
    // 監聽 localStorage 變更（同頁 setItem 不會觸發 storage 事件，改用 custom event）
    const refreshAnnouncement = () => {
      setCounts(prev => ({
        ...prev,
        announcement: getAnnouncementUnreadCount(),
      }));
    };

    const refreshChat = (e: Event) => {
      // OnlineChatPage dispatch 時會帶入即時總未讀數
      const count = (e as CustomEvent<{ count: number }>).detail?.count;
      setCounts(prev => ({
        ...prev,
        chat: count ?? getChatUnreadCount(),
      }));
    };

    // 跨分頁同步
    window.addEventListener('storage', refreshAnnouncement);
    // 同頁點擊卡片後通知更新（AnnouncementPage 內會 dispatch 此事件）
    window.addEventListener('announcementReadUpdated', refreshAnnouncement);
    // Chat 未讀更新（OnlineChatPage 內會 dispatch 此事件）
    window.addEventListener('chatReadUpdated', refreshChat);

    return () => {
      window.removeEventListener('storage', refreshAnnouncement);
      window.removeEventListener('announcementReadUpdated', refreshAnnouncement);
      window.removeEventListener('chatReadUpdated', refreshChat);
    };
  }, []);

  return counts;
}


// ── 大頭像元件 ─────────────────────────────────────────────────────────────────
interface UserAvatarProps {
  name: string;
  role?: string; // 'giant' | 'vendor'
  onClick: () => void;
}

function UserAvatar({ name, role, onClick }: UserAvatarProps) {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() =>
    localStorage.getItem('userAvatar')
  );

  useEffect(() => {
    const handler = () => setAvatarSrc(localStorage.getItem('userAvatar'));
    window.addEventListener('userAvatarChanged', handler);
    return () => window.removeEventListener('userAvatarChanged', handler);
  }, []);

  // 取名字第一字：中文直接取；英文格式（如 "李宜瑾-Evelyn Lee"）取首個中文字
  const firstChar = (() => {
    const ch = name.charAt(0);
    return ch || '?';
  })();

  return (
    <button
      onClick={onClick}
      className="relative rounded-[500px] shrink-0 size-[44px] overflow-hidden cursor-pointer group"
      title="點擊更換頭像"
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt="avatar" className="size-full object-cover rounded-[500px]" />
      ) : (
        <div
          className="size-full rounded-[500px] flex items-center justify-center"
          style={{ backgroundColor: role === 'vendor' ? '#5b21b6' : '#00559c' }}
        >
          <span className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-white text-[17px] leading-none select-none">
            {firstChar}
          </span>
        </div>
      )}
      {/* hover 提示遮罩 */}
      <div className="absolute inset-0 rounded-[500px] bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>

  );
}

// ── 頭像裁切 Overlay（Canvas 裁切器）───────────────────────────────────────────
const CROP_CANVAS_SIZE = 280;
const CROP_RADIUS = 120;

function AvatarCropOverlay({ onClose, onSave, name, role }: { onClose: () => void; onSave: (dataUrl: string) => void; name?: string; role?: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNewImage, setIsNewImage] = useState(false);

  // 掛載時：優先載入 userAvatarRaw（原始圖）+ 上次裁切參數
  // 若無原始圖（舊版資料），不顯示任何圖（避免拿裁切後的圓形圖再次裁切）
  useEffect(() => {
    const rawSrc = localStorage.getItem('userAvatarRaw');
    if (!rawSrc) return; // 沒有原始圖 → 等使用者選新圖
    const savedScale  = parseFloat(localStorage.getItem('userAvatarCropScale')  ?? '0') || null;
    const savedOffX   = parseFloat(localStorage.getItem('userAvatarCropOffsetX') ?? '0');
    const savedOffY   = parseFloat(localStorage.getItem('userAvatarCropOffsetY') ?? '0');
    const img = new Image();
    img.onload = () => {
      previewImgRef.current = img;
      if (savedScale) {
        // 還原上次的裁切參數
        setScale(savedScale);
        setOffset({ x: savedOffX, y: savedOffY });
        offsetRef.current = { x: savedOffX, y: savedOffY };
      } else {
        // 首次載入：自動 fitScale
        const fitScale = Math.max(
          (CROP_RADIUS * 2) / img.naturalWidth,
          (CROP_RADIUS * 2) / img.naturalHeight
        ) * 1.1;
        setScale(fitScale);
        setOffset({ x: 0, y: 0 });
        offsetRef.current = { x: 0, y: 0 };
      }
    };
    img.src = rawSrc;
    setImageSrc(rawSrc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = previewImgRef.current;

    ctx.clearRect(0, 0, CROP_CANVAS_SIZE, CROP_CANVAS_SIZE);

    if (img) {
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, CROP_CANVAS_SIZE / 2 - w / 2 + offset.x, CROP_CANVAS_SIZE / 2 - h / 2 + offset.y, w, h);
    } else {
      // 無圖時：繪製預設頭像（色彩同 UserAvatar）
      const bg = role === 'vendor' ? '#5b21b6' : '#00559c';
      const firstChar = name?.charAt(0) || '?';
      ctx.save();
      ctx.beginPath();
      ctx.arc(CROP_CANVAS_SIZE / 2, CROP_CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = `bold ${CROP_RADIUS * 0.75}px 'Public Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(firstChar, CROP_CANVAS_SIZE / 2, CROP_CANVAS_SIZE / 2 + 2);
      ctx.restore();
    }

    // 暗色遮罩（evenodd 保留圓形透明區）
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, CROP_CANVAS_SIZE, CROP_CANVAS_SIZE);
    ctx.arc(CROP_CANVAS_SIZE / 2, CROP_CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();

    // 圓形邊框
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CROP_CANVAS_SIZE / 2, CROP_CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, offset, name, role]);

  useEffect(() => { draw(); }, [draw]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImageSrc(src);
      // 儲存原始圖（供下次開啟 editor 使用）
      localStorage.setItem('userAvatarRaw', src);
      // 重置裁切參數（新圖從頭裁）
      localStorage.removeItem('userAvatarCropScale');
      localStorage.removeItem('userAvatarCropOffsetX');
      localStorage.removeItem('userAvatarCropOffsetY');
      const img = new Image();
      img.onload = () => {
        previewImgRef.current = img;
        const fitScale = Math.max(
          (CROP_RADIUS * 2) / img.naturalWidth,
          (CROP_RADIUS * 2) / img.naturalHeight
        ) * 1.1;
        setScale(fitScale);
        setOffset({ x: 0, y: 0 });
        offsetRef.current = { x: 0, y: 0 };
      };
      img.src = src;
      setIsNewImage(true);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewImgRef.current) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y };
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const newOffset = { x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y };
    offsetRef.current = newOffset;
    setOffset(newOffset);
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };

  // 使用 useEffect 手動連結 non-passive wheel，讓 preventDefault 能正常運作
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setScale(s => Math.max(0.2, Math.min(6, s + delta)));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const handleSave = () => {
    const img = previewImgRef.current;
    if (!img) return; // canvas 沒有圖 → 不做任何事
    const OUTPUT = 220;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = OUTPUT;
    offCanvas.height = OUTPUT;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();
    const ratio = OUTPUT / CROP_CANVAS_SIZE;
    const w = img.naturalWidth * scale * ratio;
    const h = img.naturalHeight * scale * ratio;
    ctx.drawImage(img, OUTPUT / 2 - w / 2 + offset.x * ratio, OUTPUT / 2 - h / 2 + offset.y * ratio, w, h);
    // 同步儲存裁切參數，供下次開啟 editor 時還原
    localStorage.setItem('userAvatarCropScale',   String(scale));
    localStorage.setItem('userAvatarCropOffsetX', String(offset.x));
    localStorage.setItem('userAvatarCropOffsetY', String(offset.y));
    onSave(offCanvas.toDataURL('image/png'));
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="420px" maxHeight="580px">
      <div className="relative w-full h-full">
        {/* 關閉按鈕 */}
        <button
          className="absolute left-[20px] top-[20px] z-10 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="#637381" fillRule="evenodd" />
          </svg>
        </button>

        <div className="flex flex-col h-full px-[40px] pt-[58px] pb-[32px] gap-[16px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            更換頭像
          </p>

          {/* Canvas 預覽 */}
          <div className="flex flex-col items-center gap-[8px]">
            <canvas
              ref={canvasRef}
              width={CROP_CANVAS_SIZE}
              height={CROP_CANVAS_SIZE}
              className="rounded-[12px] bg-[#1c252e]"
              style={{ cursor: imageSrc ? 'grab' : 'default', width: CROP_CANVAS_SIZE, height: CROP_CANVAS_SIZE }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {imageSrc && (
              <p className="text-[12px] text-[#919eab] text-center">拖拉移動位置・滾輪縮放大小</p>
            )}
          </div>

          {/* 縮放滑桿 */}
          {imageSrc && (
            <div className="flex items-center gap-[12px]">
              <span className="text-[12px] text-[#637381] shrink-0">縮小</span>
              <input
                type="range" min="0.2" max="6" step="0.01"
                value={scale}
                onChange={e => setScale(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#00559c' }}
              />
              <span className="text-[12px] text-[#637381] shrink-0">放大</span>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex flex-col gap-[8px] mt-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[36px] rounded-[8px] border border-[rgba(145,158,171,0.2)] flex items-center justify-center hover:bg-[#f4f6f8] transition-colors"
            >
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[24px] text-[#1c252e] text-[14px]">選擇圖片</p>
            </button>
            {imageSrc && (
              <button
                onClick={handleSave}
                className="w-full h-[36px] rounded-[8px] flex items-center justify-center hover:bg-[#004680] transition-colors"
                style={{ backgroundColor: '#00559c' }}
              >
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-white text-[14px]">儲存頭像</p>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
    </BaseOverlay>
  );
}

// ── 語言選擇下拉（由地球 icon 觸發）────────────────────────────────────────────
function LanguageDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language, setLanguage } = useLanguage();
  const languageOptions: { value: Language; label: string }[] = [
    { value: '繁中', label: '繁中' },
    { value: '簡中', label: '簡中' },
    { value: 'English', label: 'English' },
  ];

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-white rounded-[10px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),0px_20px_40px_-4px_rgba(145,158,171,0.24)] z-[101] overflow-hidden min-w-[120px]">
        {languageOptions.map((opt) => (
          <div
            key={opt.value}
            className={`px-[14px] py-[10px] cursor-pointer hover:bg-[rgba(145,158,171,0.06)] transition-colors ${
              language === opt.value ? 'bg-[rgba(0,94,184,0.08)]' : ''
            }`}
            onClick={() => { setLanguage(opt.value); onClose(); }}
          >
            <p className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] ${
              language === opt.value ? 'text-[#005eb8]' : 'text-[#1c252e]'
            }`}>
              {opt.label}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 用戶信息組件（新版：上下版面 + 4 icon 快捷鍵）─────────────────────────────
interface UserInfoProps {
  onPageChange: (page: PageType) => void;
}

function UserInfo({ onPageChange }: UserInfoProps) {
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'g00106917@giant.com';
  const currentUserType  = localStorage.getItem('currentUserType')  || 'giant';
  const currentUserName  = localStorage.getItem('currentUserName')  || '';
  // 帳號類型前綴：giant → 巨大，vendor → 廠商
  const typeLabel = currentUserType === 'vendor' ? '廠商' : '巨大';
  const notifications    = useNotificationCounts();

  const [showCropper, setShowCropper] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleAvatarSave = (dataUrl: string) => {
    localStorage.setItem('userAvatar', dataUrl);
    window.dispatchEvent(new Event('userAvatarChanged'));
    setShowCropper(false);
  };

  const iconBtnCls = 'relative flex items-center justify-center rounded-[500px] size-[44px] cursor-pointer hover:bg-[rgba(255,255,255,0.15)] transition-colors shrink-0';



  return (
    <>
      <div className="flex flex-col w-full mb-[8px] gap-[8px]" data-name="UserInfo">

        {/* ── 上排：頭像（左）+ 4 icon（右側均分）── */}
        <div className="flex flex-row items-center w-full gap-[4px]">
          <UserAvatar
            name={currentUserName || currentUserRole}
            role={currentUserType}
            onClick={() => setShowCropper(true)}
          />

          {/* 4 icons 均分剩餘空間 */}
          <div className="flex-1 flex items-center justify-around">

            {/* 設定 */}
            <button
              id="user-card-settings-btn"
              className={iconBtnCls}
              onClick={() => onPageChange('personal-settings')}
              title="個人設定"
            >
              <SettingsIcon size={22} strokeWidth={1.6} className="text-white" />
            </button>

            {/* 公布欄 */}
            <button
              id="user-card-announcement-btn"
              className={iconBtnCls}
              onClick={() => onPageChange('announcement')}
              title="公佈欄"
            >
              <Megaphone size={22} strokeWidth={1.6} className="text-white" />
              {notifications.announcement > 0 && (
                <span className="absolute top-[-4px] right-[-4px] min-w-[18px] h-[18px] rounded-[500px] bg-[#ff5630] flex items-center justify-center px-[3px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-white text-[11px] leading-none">
                    {notifications.announcement > 99 ? '99+' : notifications.announcement}
                  </span>
                </span>
              )}
            </button>

            {/* 語言（地球） */}
            <div className="relative">
              <button
                id="user-card-language-btn"
                className={iconBtnCls}
                onClick={() => setLangOpen(v => !v)}
                title="語言設定"
              >
                <Globe size={22} strokeWidth={1.6} className="text-white" />
              </button>
              <LanguageDropdown isOpen={langOpen} onClose={() => setLangOpen(false)} />
            </div>

            {/* Online Chat */}
            <button
              id="user-card-chat-btn"
              className={iconBtnCls}
              onClick={() => onPageChange('online-chat')}
              title="Online Chat"
            >
              <MessageCircle size={22} strokeWidth={1.6} className="text-white" />
              {notifications.chat > 0 && (
                <span className="absolute top-[-4px] right-[-4px] min-w-[18px] h-[18px] rounded-[500px] bg-[#ff5630] flex items-center justify-center px-[3px]">
                  <span className="font-['Public_Sans:Regular',sans-serif] text-white text-[11px] leading-none">
                    {notifications.chat > 99 ? '99+' : notifications.chat}
                  </span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── 下排：系統角色 + Email ── */}
        <div className="flex flex-col gap-[2px] w-full pb-[8px]">
          <p
            className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[18px] text-white text-[12px] overflow-hidden text-ellipsis whitespace-nowrap"
            title={[typeLabel, currentUserName].filter(Boolean).join(' ')}
          >
            <span className="text-white">{typeLabel}</span>
            {currentUserName && (
              <span className="ml-[6px]">{currentUserName}</span>
            )}
          </p>
          <p
            className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[16px] text-[rgba(255,255,255,0.55)] text-[12px] overflow-hidden text-ellipsis whitespace-nowrap"
            title={currentUserEmail}
          >
            {currentUserEmail}
          </p>
        </div>
      </div>

      {/* 頭像裁切 Overlay */}
      {showCropper && (
        <AvatarCropOverlay onClose={() => setShowCropper(false)} onSave={handleAvatarSave} name={currentUserName} role={currentUserType} />
      )}

    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Icon 元件（v2 規範：Lucide React Outline，24×24 viewBox，pure stroke，stroke-width 2）
// ─────────────────────────────────────────────────────────────────────────────

const ICON_CLS = 'size-[24px] shrink-0 text-[var(--icon-color,#637381)]';
const ICON_PROPS = { size: 24, strokeWidth: 2 } as const;

function DashboardIcon()     { return <LayoutDashboard  {...ICON_PROPS} className={ICON_CLS} />; }
function AnnouncementIcon()  { return <Megaphone        {...ICON_PROPS} className={ICON_CLS} />; }
function ChatIcon()          { return <MessageCircle    {...ICON_PROPS} className={ICON_CLS} />; }
function OrderIcon()         { return <ClipboardList    {...ICON_PROPS} className={ICON_CLS} />; }
function CorrectOrderIcon()  { return <FilePen          {...ICON_PROPS} className={ICON_CLS} />; }
function ShippingIcon()      { return <Truck            {...ICON_PROPS} className={ICON_CLS} />; }
function InvoiceIcon()       { return <Receipt          {...ICON_PROPS} className={ICON_CLS} />; }
function AccountIcon()       { return <Users            {...ICON_PROPS} className={ICON_CLS} />; }
function SystemSettingsIcon(){ return <SettingsIcon     {...ICON_PROPS} className={ICON_CLS} />; }
function VendorApprovalIcon(){ return <UserCheck        {...ICON_PROPS} className={ICON_CLS} />; }
function PartsIcon()         { return <Component        {...ICON_PROPS} className={ICON_CLS} />; }
function InsuranceIcon()     { return <Shield           {...ICON_PROPS} className={ICON_CLS} />; }
function QualityIcon()       { return <ShieldCheck      {...ICON_PROPS} className={ICON_CLS} />; }
function ReceivingIcon()     { return <PackageCheck     {...ICON_PROPS} className={ICON_CLS} />; }
function ScheduleIcon()      { return <CalendarDays     {...ICON_PROPS} className={ICON_CLS} />; }

function ArrowDownIcon()  { return <ChevronDown  size={16} strokeWidth={2} className="size-[16px] shrink-0 text-[var(--icon-color,#637381)]" />; }
function ArrowRightIcon() { return <ChevronRight size={16} strokeWidth={2} className="size-[16px] shrink-0 text-[var(--icon-color,#637381)]" />; }


// 選單項目組件
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  hasSubmenu?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, badge, hasSubmenu, isActive, isExpanded, onClick }: NavItemProps) {
  return (
    <div 
      className={`min-h-[44px] relative rounded-[8px] shrink-0 w-full cursor-pointer transition-colors ${
        isActive ? 'bg-[rgba(255,184,0,0.15)]' : 'bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,184,0,0.08)]'
      }`}
      data-name="NavVertical/Item"
      onClick={onClick}
      style={{
        ['--icon-color' as any]: isActive ? '#ffb800' : '#637381',
      }}
    >
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[12px] pr-[8px] py-[4px] relative w-full">
          <div className="content-stretch flex items-center justify-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="item-icon">
            {icon}
          </div>
          <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="item-text">
            <div className="flex flex-col items-center justify-center size-full">
              <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
                <div className={`css-g0mm18 flex flex-col font-['Public_Sans:${isActive ? 'SemiBold' : 'Medium'}',sans-serif] ${isActive ? 'font-semibold' : 'font-medium'} justify-center leading-[0] overflow-hidden relative shrink-0 ${isActive ? 'text-[#ffb800]' : 'text-[#a8aeb3]'} text-[14px] text-ellipsis w-full`}>
                  <p className="css-g0mm18 leading-[22px] overflow-hidden">{label}</p>
                </div>
              </div>
            </div>
          </div>
          {badge && (
            <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ info">
              <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">{badge}</p>
            </div>
          )}
          {hasSubmenu && (
            <div className="content-stretch flex items-center justify-center pl-[8px] pr-0 py-0 relative shrink-0" data-name="arrow">
              {isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 子選單項目組件
interface SubMenuItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  page?: PageType;
  onNavigate?: (page: PageType) => void;
  badge?: string;
}

function SubMenuItem({ label, isActive, onClick, page, onNavigate, badge }: SubMenuItemProps) {
  const handleClick = onClick ?? (page && onNavigate ? () => onNavigate(page) : undefined);
  return (
    <div 
      className="min-h-[40px] relative rounded-[8px] shrink-0 w-full cursor-pointer transition-colors bg-[rgba(255,255,255,0)] hover:bg-[rgba(255,184,0,0.05)]"
      onClick={handleClick}
    >
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-center min-h-[inherit] pl-[48px] pr-[8px] py-[4px] relative w-full">
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-col items-center justify-center size-full">
              <div className="content-stretch flex flex-col items-center justify-center pl-0 pr-[16px] py-0 relative w-full">
                <div className={`css-g0mm18 flex flex-col font-['Public_Sans:${isActive ? 'SemiBold' : 'Regular'}',sans-serif] ${isActive ? 'font-semibold' : 'font-normal'} justify-center leading-[0] overflow-hidden relative shrink-0 ${isActive ? 'text-[#ffc933] hover:text-[#ffc933]' : 'text-[#8a9099] hover:text-[#ffd666]'} text-[13px] text-ellipsis w-full transition-colors`}>
                  <p className="css-g0mm18 leading-[20px] overflow-hidden">{label}</p>
                </div>
              </div>
            </div>
          </div>
          {badge && (
            <div className="bg-[#ffe9d5] content-stretch flex gap-[6px] h-[24px] items-center justify-center min-w-[24px] px-[6px] py-0 relative rounded-[6px] shrink-0" data-name="✳️ info">
              <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#7a0916] text-[12px] text-center">{badge}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mini NavItem ────────────────────────────────────────────────────────────
interface NavItemMiniProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  onClick?: () => void;
}

function NavItemMini({ icon, label, isActive, hasSubmenu, onClick }: NavItemMiniProps) {
  return (
    <div
      className={`relative flex flex-col items-center gap-[5px] h-[58px] justify-end pb-[6px] pt-[8px] rounded-[8px] w-full cursor-pointer transition-colors ${
        isActive ? 'bg-[rgba(255,184,0,0.15)]' : 'hover:bg-[rgba(255,184,0,0.08)]'
      }`}
      onClick={onClick}
      style={{ ['--fill-0' as any]: isActive ? '#FFB800' : '#637381' }}
    >
      {/* Submenu arrow indicator */}
      {hasSubmenu && (
        <div className="absolute top-[7px] right-[6px]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3.5 2.5L6.5 5L3.5 7.5" stroke="#637381" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      {/* Icon */}
      <div className="shrink-0">
        {icon}
      </div>
      {/* Label */}
      <span
        className={`text-[10px] text-center leading-[14px] overflow-hidden text-ellipsis whitespace-nowrap w-full px-[4px] ${
          isActive ? 'text-[#ffb800]' : 'text-[#8a9099]'
        }`}
        style={{ fontFamily: "'Public_Sans:Medium', sans-serif", fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Mini Flyout data ────────────────────────────────────────────────────────
// label 由 pageConfig.navLabel 提供，改名時只需修改 pageConfig.ts
const MINI_SUBMENUS: Record<string, { label: string; page?: PageType }[]> = {
  order: [
    { label: pageConfig['order-list'].navLabel,             page: 'order-list' },
    { label: pageConfig['order-exchange'].navLabel,         page: 'order-exchange' },
    { label: pageConfig['order-return'].navLabel,           page: 'order-return' },
    { label: pageConfig['order-forecast'].navLabel,         page: 'order-forecast' },
    { label: pageConfig['order-schedule-change'].navLabel,  page: 'order-schedule-change' },
    { label: pageConfig['order-history'].navLabel,          page: 'order-history' },
  ],
  correction: [
    { label: pageConfig['correction-create'].navLabel,  page: 'correction-create' },
    { label: pageConfig['correction-list'].navLabel,    page: 'correction-list' },
    { label: pageConfig['correction-history'].navLabel, page: 'correction-history' },
  ],
  shipping: [
    { label: pageConfig['shipping-create'].navLabel,   page: 'shipping-create' },
    { label: pageConfig['shipping-list'].navLabel,     page: 'shipping-list' },
    { label: pageConfig['shipping-packing'].navLabel,  page: 'shipping-packing' },
    { label: pageConfig['shipping-print'].navLabel,    page: 'shipping-print' },
    { label: pageConfig['shipping-settings'].navLabel, page: 'shipping-settings' },
  ],
  invoice: [
    { label: pageConfig['invoice-create'].navLabel,   page: 'invoice-create' },
    { label: pageConfig['invoice-list'].navLabel,     page: 'invoice-list' },
    { label: pageConfig['invoice-settings'].navLabel, page: 'invoice-settings' },
  ],
  parts: [
    { label: pageConfig['parts-maintain'].navLabel, page: 'parts-maintain' },
    { label: pageConfig['parts-quote'].navLabel,    page: 'parts-quote' },
    { label: pageConfig['parts-sample'].navLabel,   page: 'parts-sample' },
  ],
  quality: [
    { label: pageConfig['quality-abnormal'].navLabel, page: 'quality-abnormal' },
    { label: pageConfig['quality-report'].navLabel,   page: 'quality-report' },
    { label: pageConfig['quality-hazard'].navLabel,   page: 'quality-hazard' },
    { label: pageConfig['quality-other'].navLabel,    page: 'quality-other' },
  ],
  newparts: [
    { label: pageConfig['newparts-project'].navLabel,  page: 'newparts-project' },
    { label: pageConfig['newparts-settings'].navLabel, page: 'newparts-settings' },
  ],
  esg: [
    { label: pageConfig['esg-material'].navLabel, page: 'esg-material' },
    { label: pageConfig['esg-maintain'].navLabel, page: 'esg-maintain' },
  ],
  'shipment-tw': [
    { label: pageConfig['shipment-tw-order'].navLabel,    page: 'shipment-tw-order' },
    { label: pageConfig['shipment-tw-shipping'].navLabel, page: 'shipment-tw-shipping' },
    { label: pageConfig['shipment-tw-print'].navLabel,    page: 'shipment-tw-print' },
  ],
  account: [
    { label: pageConfig['vendor-account-management'].navLabel, page: 'vendor-account-management' },
    { label: pageConfig['giant-account-management'].navLabel,  page: 'giant-account-management' },
  ],
  system: [
    { label: pageConfig['permission-settings'].navLabel, page: 'permission-settings' },
    { label: pageConfig['schedule-settings'].navLabel,   page: 'schedule-settings' },
  ],
};

// ─── Mini Flyout Panel (rendered via portal) ─────────────────────────────────
interface MiniNavFlyoutProps {
  menuId: string;
  label: string;
  top: number;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MiniNavFlyout({ menuId, label, top, currentPage, onNavigate, onMouseEnter, onMouseLeave }: MiniNavFlyoutProps) {
  const items = MINI_SUBMENUS[menuId] ?? [];
  return createPortal(
    <div
      className="fixed z-[500] overflow-hidden"
      style={{ left: 94, top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Card */}
      <div
        className="bg-[#1a2230] rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.55)] border border-[rgba(255,255,255,0.07)] overflow-hidden"
        style={{ minWidth: 196 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[14px] pt-[11px] pb-[10px] border-b border-[rgba(255,255,255,0.07)]">
          <p
            className="text-white text-[13px] leading-[18px]"
            style={{ fontFamily: "'Public_Sans:SemiBold',sans-serif", fontWeight: 600 }}
          >
            {label}
          </p>
          {/* Small chevron-right decoration */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Sub-items */}
        {items.map((item, idx) => {
          const isActive = !!(item.page && currentPage === item.page);
          const clickable = !!item.page;
          return (
            <div
              key={idx}
              className={`flex items-center gap-[10px] px-[14px] py-[9px] transition-colors ${
                isActive
                  ? 'bg-[rgba(255,184,0,0.13)]'
                  : clickable
                    ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.06)]'
                    : 'opacity-40 cursor-not-allowed'
              }`}
              onClick={() => clickable && onNavigate(item.page!)}
            >
              <div
                className={`size-[5px] rounded-full shrink-0 transition-colors ${
                  isActive ? 'bg-[#FFB800]' : 'bg-[#4a5568]'
                }`}
              />
              <p
                className={`text-[13px] leading-[20px] transition-colors ${
                  isActive ? 'text-[#FFB800]' : 'text-[#a8aeb3] hover:text-white'
                }`}
                style={{ fontFamily: isActive ? "'Public_Sans:SemiBold',sans-serif" : "'Public_Sans:Regular',sans-serif", fontWeight: isActive ? 600 : 400 }}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
      {/* Left connector triangle */}
      <div
        className="absolute top-[16px] -left-[7px] w-0 h-0"
        style={{
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderRight: '7px solid rgba(255,255,255,0.07)',
        }}
      />
      <div
        className="absolute top-[17px] -left-[6px] w-0 h-0"
        style={{
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid #1a2230',
        }}
      />
    </div>,
    document.body
  );
}

// ─── Mini item wrapper with hover-flyout ─────────────────────────────────────
interface MiniSubmenuItemProps {
  menuId: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onShow: (menuId: string, label: string, rect: DOMRect) => void;
  onHide: () => void;
}

function MiniSubmenuItem({ menuId, icon, label, isActive, onShow, onHide }: MiniSubmenuItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="w-full"
      onMouseEnter={() => ref.current && onShow(menuId, label, ref.current.getBoundingClientRect())}
      onMouseLeave={onHide}
    >
      <NavItemMini icon={icon} label={label} isActive={isActive} hasSubmenu />
    </div>
  );
}

// ─── Mini Nav Layout (manages flyout state) ───────────────────────────────────
interface MiniNavLayoutProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

function MiniNavLayout({ currentPage, onPageChange, onLogout }: MiniNavLayoutProps) {
  const [flyout, setFlyout] = useState<{ menuId: string; label: string; top: number } | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFlyout = useCallback((menuId: string, label: string, rect: DOMRect) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const items = MINI_SUBMENUS[menuId] ?? [];
    const flyoutHeight = items.length * 38 + 50;
    const top = Math.max(8, Math.min(rect.top, window.innerHeight - flyoutHeight - 16));
    setFlyout({ menuId, label, top });
  }, []);

  const startHide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setFlyout(null), 130);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  const handleNavigate = useCallback((page: PageType) => {
    onPageChange(page);
    setFlyout(null);
  }, [onPageChange]);

  return (
    <div className="flex flex-col gap-[4px] items-center w-full px-[4px]" data-name="list-mini">
      {/* Direct nav items (no submenu) */}
      <NavItemMini icon={<VendorApprovalIcon />} label="廠商審核" isActive={currentPage === 'vendor-account-review'} onClick={() => onPageChange('vendor-account-review')} />
      <NavItemMini icon={<DashboardIcon />} label="Dashboard" isActive={currentPage === 'dashboard'} onClick={() => onPageChange('dashboard')} />
      <NavItemMini icon={<AnnouncementIcon />} label="公佈欄" isActive={currentPage === 'announcement'} onClick={() => onPageChange('announcement')} />
      <NavItemMini icon={<ChatIcon />} label="Online Chat" isActive={currentPage === 'online-chat'} onClick={() => onPageChange('online-chat')} />
      <NavItemMini icon={<ReceivingIcon />} label="收料查詢" isActive={currentPage === 'receiving-inquiry'} onClick={() => onPageChange('receiving-inquiry')} />
      <NavItemMini icon={<ScheduleIcon />} label="排程總表" isActive={currentPage === 'schedule-inquiry'} onClick={() => onPageChange('schedule-inquiry')} />
      <NavItemMini icon={<QualityIcon />} label="廠商評價" isActive={currentPage === 'vendor-evaluation'} onClick={() => onPageChange('vendor-evaluation')} />

      <div className="w-full h-px bg-[rgba(145,158,171,0.12)] my-[4px]" />

      {/* Submenu items — hover reveals flyout */}
      <MiniSubmenuItem menuId="parts" icon={<PartsIcon />} label="零件維護" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="newparts" icon={<PartsIcon />} label="新零件" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="order" icon={<OrderIcon />} label="訂單管理" isActive={['order-list','order-forecast','order-exchange','order-return'].includes(currentPage)} onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="correction" icon={<CorrectOrderIcon />} label="修正單" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="shipping" icon={<ShippingIcon />} label="出貨單" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="quality" icon={<QualityIcon />} label="品保作業" isActive={currentPage === 'quality-abnormal'} onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="invoice" icon={<InvoiceIcon />} label="發票作業" onShow={showFlyout} onHide={startHide} />
      <NavItemMini icon={<InsuranceIcon />} label="產險維護" onClick={() => {}} />
      <MiniSubmenuItem menuId="esg" icon={<InsuranceIcon />} label="ESG" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="shipment-tw" icon={<ShippingIcon />} label="出貨台灣" onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="account" icon={<AccountIcon />} label="帳號管理" isActive={['vendor-account-management','giant-account-management'].includes(currentPage)} onShow={showFlyout} onHide={startHide} />
      <MiniSubmenuItem menuId="system" icon={<SystemSettingsIcon />} label="系統設定" isActive={['permission-settings','schedule-settings'].includes(currentPage)} onShow={showFlyout} onHide={startHide} />

      {/* Logout */}
      {onLogout && (
        <div className="mt-[8px] w-full">
          <button onClick={onLogout} className="w-full h-[40px] bg-[rgba(183,29,24,0.15)] hover:bg-[rgba(183,29,24,0.25)] rounded-[8px] transition-colors cursor-pointer flex items-center justify-center" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7Z" fill="#b71d18"/>
              <path d="M4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="#b71d18" opacity="0.6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Flyout portal */}
      {flyout && (
        <MiniNavFlyout
          menuId={flyout.menuId}
          label={flyout.label}
          top={flyout.top}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onMouseEnter={cancelHide}
          onMouseLeave={startHide}
        />
      )}
    </div>
  );
}

// 主導航列表組件
interface NavigationListProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  isMini?: boolean;
}

// ─── Nav Permission Helper ───────────────────────────────────────────────────
// 讀取角色的模組存取設定（permission-settings-{roleId}）
// IT 角色永遠全開；其他角色依勾選清單決定可見性
function useNavPermission() {
  const roleId = localStorage.getItem('currentUserRoleId') ?? '';
  // IT 角色不受限制
  if (roleId === 'giant-it') return () => true;
  // 未設定任何角色 → 全開（防禦性預設，例如 Dev 帳號直接設 giant-it 不受影響）
  const key = `permission-settings-${roleId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return () => true;
  try {
    const allowed = JSON.parse(raw) as string[];
    // PermissionSettingsPage 儲存的是「葉節點 id」（最細層）
    // 例如勾選「訂單管理」會存入 mgmt-order-general-list-all 等葉節點
    // hasNav('mgmt-order') 需比對「allowed 中有任何 id 以 featureId 開頭」
    return (featureId: string) =>
      allowed.some(id => id === featureId || id.startsWith(featureId + '-'));
  } catch {
    return () => true;
  }
}

export function NavigationList({ currentPage, onPageChange, onLogout, isMini = false }: NavigationListProps) {
  const { open } = useSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // 根據當前頁面自動展開相應的菜單
    const autoExpanded: string[] = [];
    
    if (['order-list', 'order-forecast', 'order-exchange', 'order-return', 'order-history', 'order-schedule-change'].includes(currentPage)) {
      autoExpanded.push('order');
    }
    if (['correction-create', 'correction-list', 'correction-history'].includes(currentPage)) {
      autoExpanded.push('correction');
    }
    if (['shipping-create', 'shipping-list', 'shipping-packing', 'shipping-print', 'shipping-settings'].includes(currentPage)) {
      autoExpanded.push('shipping');
    }
    if (['quality-abnormal', 'quality-report', 'quality-hazard', 'quality-other'].includes(currentPage)) {
      autoExpanded.push('quality');
    }
    if (['invoice-create', 'invoice-list', 'invoice-settings'].includes(currentPage)) {
      autoExpanded.push('invoice');
    }
    if (['parts-maintain', 'parts-quote', 'parts-sample'].includes(currentPage)) {
      autoExpanded.push('parts');
    }
    if (['vendor-account-management', 'giant-account-management'].includes(currentPage)) {
      autoExpanded.push('account');
    }
    if (['esg-material', 'esg-maintain'].includes(currentPage)) {
      autoExpanded.push('esg');
    }
    if (['shipment-tw-order', 'shipment-tw-shipping', 'shipment-tw-print'].includes(currentPage)) {
      autoExpanded.push('shipment-tw');
    }
    if (['permission-settings', 'schedule-settings'].includes(currentPage)) {
      autoExpanded.push('system');
    }
    
    return autoExpanded;
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)   // 再點一次 → 收合
        : [menuId]                             // 點新的 → 只保留這一個（其他全收合）
    );
  };

  // When in mini mode, clicking a submenu parent expands the sidebar + opens the menu
  const handleMiniSubmenuClick = (menuId: string) => {
    open();
    setExpandedMenus(prev =>
      prev.includes(menuId) ? prev : [...prev, menuId]
    );
  };

  // ── 模組存取權限 ──────────────────────────────────────────────────────────
  // hasNav(featureId) → 此角色是否可看到該功能入口
  const hasNav = useNavPermission();

  // 計算廠商帳號審核的總數量
  const vendorAccountReviewCount = mockVendorsSuccess.length + mockVendorsFail.length;
  const vendorAccountReviewBadge = vendorAccountReviewCount > 0 ? `${vendorAccountReviewCount}` : undefined;

  // 索樣單未關閉狀態數量（V + SC），監聴資料變更即時更新
  const calcSampleCount = () =>
    getSampleOrders().filter(o => o.status === 'V' || o.status === 'B' || o.status === 'SC').length;

  // 零件資訊未報價數量
  const calcPendingCount = () =>
    getParts().filter(p => p.quoteStatus === 'pending').length;

  const [sampleOrderBadge, setSampleOrderBadge] = useState<string | undefined>(() => {
    const count = calcSampleCount();
    return count > 0 ? String(count) : undefined;
  });

  // 零件資訊（未報價）badge
  const [partsPendingBadge, setPartsPendingBadge] = useState<string | undefined>(() => {
    const count = calcPendingCount();
    return count > 0 ? String(count) : undefined;
  });

  // 零件/索樣 主選單 badge（未報價 + 索樣單活躍數量）
  const [partsAndSampleBadge, setPartsAndSampleBadge] = useState<string | undefined>(() => {
    const total = calcSampleCount() + calcPendingCount();
    return total > 0 ? String(total) : undefined;
  });

  useEffect(() => {
    const handler = () => {
      const sCount = calcSampleCount();
      const pCount = calcPendingCount();
      setSampleOrderBadge(sCount > 0 ? String(sCount) : undefined);
      setPartsPendingBadge(pCount > 0 ? String(pCount) : undefined);
      const total = sCount + pCount;
      setPartsAndSampleBadge(total > 0 ? String(total) : undefined);
    };
    window.addEventListener('sampleOrdersChanged', handler);
    return () => window.removeEventListener('sampleOrdersChanged', handler);
  }, []);

  // ── MINI layout ──────────────────────────────────────────────────────────
  if (isMini) {
    return (
      <MiniNavLayout
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
      />
    );
  }

  // ── FULL layout ───────────────────────────────────────────────────────────
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="list">
      {/* 用戶信息區塊 - 包含頭像、角色、email和語言選擇器 */}
      <UserInfo onPageChange={onPageChange} />
      
      {/* OVERVIEW 區塊 - 只判斷實際出現在 nav 的項目（公佈欄/Chat 已移至上方 icon 列） */}
      {(['overview-vendor-review','overview-receiving','overview-schedule','overview-vendor-eval'].some(id => hasNav(id))) && (
        <div className="relative shrink-0 w-full" data-name="subheader">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center pb-[8px] pl-[12px] pr-0 pt-[16px] relative w-full">
              <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">OVERVIEW</p>
            </div>
          </div>
        </div>
      )}
      

      {/* 廠商帳號審核 */}
      {hasNav('overview-vendor-review') && (
        <NavItem
          icon={<VendorApprovalIcon />}
          label="廠商帳號審核"
          isActive={currentPage === 'vendor-account-review'}
          onClick={() => onPageChange('vendor-account-review')}
          badge={vendorAccountReviewBadge}
        />
      )}


      {/* 收料查詢 */}
      {hasNav('overview-receiving') && (
        <NavItem
          icon={<ReceivingIcon />}
          label="收料查詢"
          isActive={currentPage === 'receiving-inquiry'}
          onClick={() => onPageChange('receiving-inquiry')}
        />
      )}

      {/* 排程總表查詢 */}
      {hasNav('overview-schedule') && (
        <NavItem
          icon={<ScheduleIcon />}
          label="排程總表查詢"
          isActive={currentPage === 'schedule-inquiry'}
          onClick={() => onPageChange('schedule-inquiry')}
        />
      )}

      {/* 廠商評價 */}
      {hasNav('overview-vendor-eval') && (
        <NavItem
          icon={<QualityIcon />}
          label="廠商評價"
          isActive={currentPage === 'vendor-evaluation'}
          onClick={() => onPageChange('vendor-evaluation')}
        />
      )}

      {/* MANAGEMENT 區塊 - 只要有任一 management 功能有權限才顯示標題 */}
      {(['mgmt-parts','mgmt-order','mgmt-correction','mgmt-shipping','mgmt-quality','mgmt-invoice','mgmt-insurance','mgmt-esg','mgmt-ship-tw','mgmt-account','mgmt-system'].some(id => hasNav(id))) && (
        <div className="relative shrink-0 w-full" data-name="subheader">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center pb-[8px] pl-[12px] pr-0 pt-[16px] relative w-full">
              <p className="css-ew64yg font-['Public_Sans:Bold',sans-serif] font-bold leading-[18px] relative shrink-0 text-[#919eab] text-[11px] uppercase">Management</p>
            </div>
          </div>
        </div>
      )}

      {/* 1. 零件/索樣 */}
      {hasNav('mgmt-parts') && (
        <div className="w-full">
          <NavItem
            icon={<PartsIcon />}
            label="零件/索樣"
            hasSubmenu
            isExpanded={expandedMenus.includes('parts')}
            isActive={expandedMenus.includes('parts')}
            onClick={() => toggleMenu('parts')}
            badge={partsAndSampleBadge}
          />
          {expandedMenus.includes('parts') && (
            <div className="w-full">
              {hasNav('mgmt-parts-info') && <SubMenuItem label="零件資訊" page="parts-maintain" onNavigate={onPageChange} isActive={currentPage === 'parts-maintain'} badge={partsPendingBadge} />}
              {hasNav('mgmt-parts-print-quote') && <SubMenuItem label="列印報價單" page="parts-quote" onNavigate={onPageChange} isActive={currentPage === 'parts-quote'} />}
              {hasNav('mgmt-parts-sample') && <SubMenuItem label="索樣單" page="parts-sample" onNavigate={onPageChange} isActive={currentPage === 'parts-sample'} badge={sampleOrderBadge} />}
            </div>
          )}
        </div>
      )}

      {/* 3. 訂單管理 */}
      {hasNav('mgmt-order') && (
        <div className="w-full">
          <NavItem
            icon={<OrderIcon />}
            label="訂單管理"
            hasSubmenu
            isExpanded={expandedMenus.includes('order')}
            isActive={expandedMenus.includes('order')}
            onClick={() => toggleMenu('order')}
          />
          {expandedMenus.includes('order') && (
            <div className="w-full">
              {hasNav('mgmt-order-general') && <SubMenuItem label="一般訂單查詢" isActive={currentPage === 'order-list'} onClick={() => onPageChange('order-list')} />}
              {hasNav('mgmt-order-exchange') && <SubMenuItem label="換貨(J)單據查詢" isActive={currentPage === 'order-exchange'} onClick={() => onPageChange('order-exchange')} />}
              {hasNav('mgmt-order-return') && <SubMenuItem label="退貨單據查詢" isActive={currentPage === 'order-return'} onClick={() => onPageChange('order-return')} />}
              {hasNav('mgmt-order-forecast') && <SubMenuItem label="預測訂單查詢" isActive={currentPage === 'order-forecast'} onClick={() => onPageChange('order-forecast')} />}
              {hasNav('mgmt-order-schedule-change') && <SubMenuItem label="變更生管排程" page="order-schedule-change" onNavigate={onPageChange} isActive={currentPage === 'order-schedule-change'} />}
              {hasNav('mgmt-order-history') && <SubMenuItem label="歷史訂單查詢" isActive={currentPage === 'order-history'} onClick={() => onPageChange('order-history')} />}
            </div>
          )}
        </div>
      )}

      {/* 4. 修正單管理 */}
      {hasNav('mgmt-correction') && (
        <div className="w-full">
          <NavItem
            icon={<CorrectOrderIcon />}
            label="修正單管理"
            hasSubmenu
            isExpanded={expandedMenus.includes('correction')}
            isActive={expandedMenus.includes('correction')}
            onClick={() => toggleMenu('correction')}
          />
          {expandedMenus.includes('correction') && (
            <div className="w-full">
              {hasNav('mgmt-correction-create') && <SubMenuItem label="建立修正單" page="correction-create" onNavigate={onPageChange} isActive={currentPage === 'correction-create'} />}
              {hasNav('mgmt-correction-list') && <SubMenuItem label="修正單查詢" page="correction-list" onNavigate={onPageChange} isActive={currentPage === 'correction-list'} />}
              {hasNav('mgmt-correction-history') && <SubMenuItem label="歷史修正單" page="correction-history" onNavigate={onPageChange} isActive={currentPage === 'correction-history'} />}
            </div>
          )}
        </div>
      )}

      {/* 5. 出貨單 */}
      {hasNav('mgmt-shipping') && (
        <div className="w-full">
          <NavItem
            icon={<ShippingIcon />}
            label="出貨單"
            hasSubmenu
            isExpanded={expandedMenus.includes('shipping')}
            isActive={expandedMenus.includes('shipping')}
            onClick={() => toggleMenu('shipping')}
          />
          {expandedMenus.includes('shipping') && (
            <div className="w-full">
              {hasNav('mgmt-shipping-create') && <SubMenuItem label="建立出貨單" page="shipping-create" onNavigate={onPageChange} isActive={currentPage === 'shipping-create'} />}
              {hasNav('mgmt-shipping-list') && <SubMenuItem label="出貨單查詢" page="shipping-list" onNavigate={onPageChange} isActive={currentPage === 'shipping-list'} />}
              {hasNav('mgmt-shipping-packing') && <SubMenuItem label="出貨/裝箱明細" page="shipping-packing" onNavigate={onPageChange} isActive={currentPage === 'shipping-packing'} />}
              {hasNav('mgmt-shipping-print') && <SubMenuItem label="列印單據" page="shipping-print" onNavigate={onPageChange} isActive={currentPage === 'shipping-print'} />}
              {hasNav('mgmt-shipping-settings') && <SubMenuItem label="基本設定" page="shipping-settings" onNavigate={onPageChange} isActive={currentPage === 'shipping-settings'} />}
            </div>
          )}
        </div>
      )}

      {/* 6. 品保作業 */}
      {hasNav('mgmt-quality') && (
        <div className="w-full">
          <NavItem
            icon={<QualityIcon />}
            label="品保作業"
            hasSubmenu
            isExpanded={expandedMenus.includes('quality')}
            isActive={expandedMenus.includes('quality')}
            onClick={() => toggleMenu('quality')}
          />
          {expandedMenus.includes('quality') && (
            <div className="w-full">
              {hasNav('mgmt-quality-abnormal') && <SubMenuItem label="品質異常單" page="quality-abnormal" onNavigate={onPageChange} isActive={currentPage === 'quality-abnormal'} />}
              {hasNav('mgmt-quality-report') && <SubMenuItem label="檢驗/測試報告" page="quality-report" onNavigate={onPageChange} isActive={currentPage === 'quality-report'} />}
              {hasNav('mgmt-quality-hazard') && <SubMenuItem label="危害物質管理" page="quality-hazard" onNavigate={onPageChange} isActive={currentPage === 'quality-hazard'} />}
              {hasNav('mgmt-quality-other') && <SubMenuItem label="其他設定" page="quality-other" onNavigate={onPageChange} isActive={currentPage === 'quality-other'} />}
            </div>
          )}
        </div>
      )}

      {/* 7. 發票作業 */}
      {hasNav('mgmt-invoice') && (
        <div className="w-full">
          <NavItem
            icon={<InvoiceIcon />}
            label="發票作業"
            hasSubmenu
            isExpanded={expandedMenus.includes('invoice')}
            isActive={expandedMenus.includes('invoice')}
            onClick={() => toggleMenu('invoice')}
          />
          {expandedMenus.includes('invoice') && (
            <div className="w-full">
              {hasNav('mgmt-invoice-create') && <SubMenuItem label="開立發票" page="invoice-create" onNavigate={onPageChange} isActive={currentPage === 'invoice-create'} />}
              {hasNav('mgmt-invoice-list') && <SubMenuItem label="發票查詢" page="invoice-list" onNavigate={onPageChange} isActive={currentPage === 'invoice-list'} />}
              {hasNav('mgmt-invoice-settings') && <SubMenuItem label="發票設定" page="invoice-settings" onNavigate={onPageChange} isActive={currentPage === 'invoice-settings'} />}
            </div>
          )}
        </div>
      )}

      {/* 8. 產險資料維護 */}
      {hasNav('mgmt-insurance') && (
        <NavItem
          icon={<InsuranceIcon />}
          label="產險資料維護"
          isActive={currentPage === 'insurance-maintain'}
          onClick={() => onPageChange('insurance-maintain')}
        />
      )}

      {/* 9. ESG */}
      {hasNav('mgmt-esg') && (
        <div className="w-full">
          <NavItem
            icon={<InsuranceIcon />}
            label="ESG"
            hasSubmenu
            isExpanded={expandedMenus.includes('esg')}
            isActive={expandedMenus.includes('esg')}
            onClick={() => toggleMenu('esg')}
          />
          {expandedMenus.includes('esg') && (
            <div className="w-full">
              {hasNav('mgmt-esg-material') && <SubMenuItem label="物料成分總檔" page="esg-material" onNavigate={onPageChange} isActive={currentPage === 'esg-material'} />}
              {hasNav('mgmt-esg-maintain') && <SubMenuItem label="材料維護" page="esg-maintain" onNavigate={onPageChange} isActive={currentPage === 'esg-maintain'} />}
            </div>
          )}
        </div>
      )}


      {/* 11. 出貨台灣捷安特 */}
      {hasNav('mgmt-ship-tw') && (
        <div className="w-full">
          <NavItem
            icon={<ShippingIcon />}
            label="出貨台灣捷安特"
            hasSubmenu
            isExpanded={expandedMenus.includes('shipment-tw')}
            isActive={expandedMenus.includes('shipment-tw')}
            onClick={() => toggleMenu('shipment-tw')}
          />
          {expandedMenus.includes('shipment-tw') && (
            <div className="w-full">
              {hasNav('mgmt-ship-tw-order') && <SubMenuItem label="訂單查詢" page="shipment-tw-order" onNavigate={onPageChange} isActive={currentPage === 'shipment-tw-order'} />}
              {hasNav('mgmt-ship-tw-shipping') && <SubMenuItem label="出貨單查詢" page="shipment-tw-shipping" onNavigate={onPageChange} isActive={currentPage === 'shipment-tw-shipping'} />}
              {hasNav('mgmt-ship-tw-print') && <SubMenuItem label="列印外箱貼紙" page="shipment-tw-print" onNavigate={onPageChange} isActive={currentPage === 'shipment-tw-print'} />}
            </div>
          )}
        </div>
      )}

      {/* 12. 帳號管理 */}
      {hasNav('mgmt-account') && (
        <div className="w-full">
          <NavItem
            icon={<AccountIcon />}
            label="帳號管理"
            hasSubmenu
            isExpanded={expandedMenus.includes('account')}
            isActive={expandedMenus.includes('account')}
            onClick={() => toggleMenu('account')}
          />
          {expandedMenus.includes('account') && (
            <div className="w-full">
              {hasNav('mgmt-account-vendor') && <SubMenuItem label="廠商帳號管理" isActive={currentPage === 'vendor-account-management'} onClick={() => onPageChange('vendor-account-management')} page="vendor-account-management" />}
              {hasNav('mgmt-account-giant') && <SubMenuItem label="巨大帳號管理" isActive={currentPage === 'giant-account-management'} onClick={() => onPageChange('giant-account-management')} page="giant-account-management" />}
            </div>
          )}
        </div>
      )}

      {/* 13. 系統設定 */}
      {hasNav('mgmt-system') && (
        <div className="w-full">
          <NavItem
            icon={<SystemSettingsIcon />}
            label="系統設定"
            hasSubmenu
            isExpanded={expandedMenus.includes('system')}
            isActive={expandedMenus.includes('system')}
            onClick={() => toggleMenu('system')}
          />
          {expandedMenus.includes('system') && (
            <div className="w-full">
              {hasNav('mgmt-system-permission') && <SubMenuItem label="角色權限設定" isActive={currentPage === 'permission-settings'} onClick={() => onPageChange('permission-settings')} page="permission-settings" />}
              {hasNav('mgmt-system-schedule') && <SubMenuItem label="排程設定" isActive={currentPage === 'schedule-settings'} onClick={() => onPageChange('schedule-settings')} page="schedule-settings" />}
            </div>
          )}
        </div>
      )}

      {/* 登出按鈕 */}
      {onLogout && (
        <div className="mt-[16px] w-full">
          <button
            onClick={onLogout}
            className="w-full h-[48px] bg-[#ffe5e5] hover:bg-[#ffcccc] rounded-[8px] transition-colors cursor-pointer"
          >
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#b71d18] leading-[22px]">
              Logout
            </p>
          </button>
        </div>
      )}
    </div>
  );
}