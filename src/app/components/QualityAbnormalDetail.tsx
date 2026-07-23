import svgPaths from "@/imports/svg-2gq4xnil6q";
import closeIconPaths from "@/imports/svg-gcyyqek0b9";
import { useState, useRef, useCallback, useEffect } from 'react';
import { BaseOverlay } from './BaseOverlay';
import { type HistoryEntry } from './AdvancedQualityTable';
import { OrderHistory } from './OrderHistory';

// ─── 檔案資料型別 ────────────────────────────────────────────────────
export interface UploadedImage {
  id: string;
  name: string;
  url: string;       // object URL
  file: File;
  isImage: boolean;  // 是否為圖片（決定縮圖預覽或圖示）
}

// ─── 副檔名 → 色彩映射 ─────────────────────────────────────────────
function getExtColor(ext: string): { bg: string; text: string } {
  switch (ext.toLowerCase()) {
    case 'pdf':  return { bg: '#ff5630', text: 'white' };
    case 'doc':  case 'docx': return { bg: '#1D7BF5', text: 'white' };
    case 'xls':  case 'xlsx': return { bg: '#22c55e', text: 'white' };
    case 'ppt':  case 'pptx': return { bg: '#ff6b00', text: 'white' };
    case 'zip':  case 'rar':  case '7z': return { bg: '#8b5cf6', text: 'white' };
    default:     return { bg: '#637381', text: 'white' };
  }
}

// ─── Lightbox（圖片放大 + 左右切換，僅顯示圖片類型）──────────────
interface LightboxProps {
  images: UploadedImage[];   // 只傳 isImage=true 的項目
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const img = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 關閉按鈕 */}
        <button
          className="absolute right-[-44px] top-0 z-10 flex items-center justify-center w-[36px] h-[36px] rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={onClose}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="white" fillRule="evenodd" />
          </svg>
        </button>

        {/* 主圖 */}
        <img src={img.url} alt={img.name} className="rounded-[12px] object-contain" style={{ maxWidth: '80vw', maxHeight: '78vh' }} />

        {/* 檔名 + 計數 */}
        <div className="mt-[12px] flex items-center gap-[12px]">
          <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-white/70 truncate max-w-[340px]">{img.name}</p>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white/50 shrink-0">{currentIndex + 1} / {images.length}</p>
        </div>

        {/* 左箭頭 */}
        {hasPrev && (
          <button className="absolute left-[-56px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/25 transition-colors" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}

        {/* 右箭頭 */}
        {hasNext && (
          <button className="absolute right-[-56px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/25 transition-colors" onClick={(e) => { e.stopPropagation(); onNext(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 縮圖卡（圖片顯示預覽，其他檔案顯示副檔名色塊）────────────────
interface ThumbnailProps {
  image: UploadedImage;
  onClick: () => void;
  onDelete: () => void;
}

function Thumbnail({ image, onClick, onDelete }: ThumbnailProps) {
  const ext = image.name.split('.').pop() ?? 'file';
  const { bg, text } = getExtColor(ext);

  return (
    <div className="relative group shrink-0 cursor-pointer" style={{ width: 72, height: 72 }} onClick={onClick}>
      {image.isImage ? (
        /* 圖片：縮圖預覽 */
        <img src={image.url} alt={image.name} className="w-full h-full object-cover rounded-[8px] border border-[rgba(145,158,171,0.2)]" />
      ) : (
        /* 非圖片：副檔名色塊 */
        <div className="w-full h-full rounded-[8px] border border-[rgba(145,158,171,0.2)] flex flex-col items-center justify-center gap-[4px]" style={{ backgroundColor: `${bg}18` }}>
          <div className="rounded-[4px] px-[6px] py-[2px]" style={{ backgroundColor: bg }}>
            <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[10px] uppercase" style={{ color: text }}>{ext}</span>
          </div>
          <p className="font-['Public_Sans:Regular',sans-serif] text-[9px] text-[#637381] text-center truncate w-full px-[4px]">{image.name}</p>
        </div>
      )}

      {/* hover overlay：圖片顯示放大icon，檔案顯示下載icon */}
      <div className="absolute inset-0 rounded-[8px] bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        {image.isImage ? (
          <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* 刪除按鈕 */}
      <button
        className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#ff5630] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#cc3d1f] z-10"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="移除"
      >
        <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
          <path clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" fill="white" fillRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// ─── 不良情形和應急處理 + 圖片區（新版）──────────────────────────
function IssueSection({
  defectType,
  emergencyAction,
  onAttachmentAdd,
  onAttachmentDelete,
  initialImages,
  onImagesChange,
  isReadOnly,
}: {
  defectType: string;
  emergencyAction: string;
  onAttachmentAdd?: (filename: string) => void;
  onAttachmentDelete?: (filename: string) => void;
  initialImages?: UploadedImage[];
  onImagesChange?: (images: UploadedImage[]) => void;
  isReadOnly?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(initialImages ?? []);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 圖片變動時通知父層儲存（重新開啟時可還原）
  useEffect(() => { onImagesChange?.(images); }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((files: FileList | File[]) => {
    const MAX = 10;
    // 異常圖片只接受圖片檔
    const arr = Array.from(files);
    setImages(prev => {
      const remaining = MAX - prev.length;
      if (remaining <= 0) return prev;
      const toAdd = arr.slice(0, remaining).map(f => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        url: URL.createObjectURL(f),
        file: f,
        isImage: f.type.startsWith('image/') || /\.(jpe?g|png|gif|bmp|webp|svg|avif|heic)$/i.test(f.name),
      }));
      toAdd.forEach(img => onAttachmentAdd?.(img.name));
      return [...prev, ...toAdd];
    });
  }, [onAttachmentAdd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        onAttachmentDelete?.(target.name);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleDownloadAll = () => {
    images.forEach(img => {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name;
      a.click();
    });
  };

  return (
    <>
      {/* ── 三欄等寬排版：不良情形 | 應急處理 | 異常圖片 ── */}
      <div className="flex gap-[13px] w-full my-[20px]" style={{ height: 200 }}>

        {/* ── 欄 1：不良情形 ── */}
        <div className="flex-1 min-w-0">
          <div className="border border-[#637381] rounded-[8px] h-full relative">
            <div className="p-[10px] h-full flex flex-col">
              <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[10px]">不良情形</p>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">
                <p className="css-4hzbpn">{defectType || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 欄 2：應急處理 ── */}
        <div className="flex-1 min-w-0">
          <div className="border border-[#637381] rounded-[8px] h-full relative">
            <div className="p-[10px] h-full flex flex-col">
              <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[10px]">應急處理</p>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">
                <p className="css-4hzbpn">{emergencyAction || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 欄 3：異常圖片 ── */}
        <div className="flex-1 min-w-0">
          <div className="border border-[#637381] rounded-[8px] h-full relative">
            <div className="p-[10px] h-full flex flex-col">
              {/* 標題列 */}
              <div className="flex items-center justify-between mb-[8px] shrink-0">
                <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black">
                  附件
                  {images.length > 0 && (
                    <span className="ml-[6px] font-normal text-[12px] text-[#637381]">({images.length}/10)</span>
                  )}
                </p>
                <div className="flex items-center gap-[8px]">
                  {/* 下載全部 */}
                  {images.length > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center gap-[4px] h-[26px] px-[10px] rounded-[6px] border border-[rgba(145,158,171,0.3)] hover:border-[#1c252e] hover:bg-[rgba(28,37,46,0.04)] transition-colors"
                      title="下載全部附件"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">下載全部</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 拖曳上傳 / 縮圖展示區 */}
              <div
                className={`flex-1 relative rounded-[6px] transition-colors ${
                  !isReadOnly && isDragging
                    ? 'bg-[rgba(29,123,245,0.06)] border-[2px] border-dashed border-[#1D7BF5]'
                    : images.length === 0
                      ? 'border border-dashed border-[rgba(145,158,171,0.4)]'
                      : ''
                }`}
                style={{ minHeight: 80 }}
                onDragOver={!isReadOnly ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
                onDragLeave={!isReadOnly ? () => setIsDragging(false) : undefined}
                onDrop={!isReadOnly ? handleDrop : undefined}
              >
                {images.length === 0 ? (
                  /* 空狀態 */
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-[4px] ${!isReadOnly ? 'cursor-pointer' : ''}`}
                    onClick={!isReadOnly ? () => fileInputRef.current?.click() : undefined}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17 8 12 3 7 8" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919EAB] text-center">
                      {isReadOnly ? '尚無附件' : (
                        <>
                          拖曳或{' '}
                          <span className="text-[#1D7BF5] cursor-pointer hover:underline">點擊上傳</span>
                          {' '}支援 JPG、PNG、PDF、Word（上限10個）
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  /* 縮圖：單排橫向捲動，從左上角排列 */
                  <div className="overflow-x-auto custom-scrollbar h-full">
                    <div className="flex gap-[8px] px-[4px] pt-[4px] pb-[4px]">
                      {images.map((img, idx) => (
                        <Thumbnail
                          key={img.id}
                          image={img}
                          onClick={() => setLightboxIndex(idx)}
                          onDelete={isReadOnly ? undefined : () => handleDelete(img.id)}
                        />
                      ))}

                      {/* 補充上傳格（未達上限才顯示） */}
                      {!isReadOnly && images.length < 10 && (
                        <button
                          className="flex items-center justify-center rounded-[8px] border border-dashed border-[rgba(145,158,171,0.4)] hover:border-[#1D7BF5] hover:bg-[rgba(29,123,245,0.04)] transition-colors shrink-0"
                          style={{ width: 72, height: 72 }}
                          onClick={() => fileInputRef.current?.click()}
                          title="繼續新增檔案"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="#919EAB" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 隱藏的 file input（接受所有類型） */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNext={() => setLightboxIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))}
        />
      )}
    </>
  );
}

// ─── 以下為原始元件，不變 ─────────────────────────────────────────

// 打印機圖標
function IconsSolidIcSolarPrinterMinimalisticBold() {
  return (
    <div className="relative shrink-0 size-[36px] cursor-pointer hover:opacity-80">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
        <g>
          <g>
            <path d={svgPaths.p1db90400} fill="var(--fill-0, #1D7BF5)" />
            <path d={svgPaths.p19b82c00} fill="var(--fill-0, #1D7BF5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// 聊天圖標
function Stack() {
  return (
    <div className="absolute inset-[0.17%_0_3.69%_0]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.0001 34.6104">
        <g>
          <path clipRule="evenodd" d={svgPaths.p394a5c00} fill="url(#paint0_linear_87_21242)" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p24400500} fill="url(#paint1_linear_87_21242)" fillRule="evenodd" />
          <g opacity="0.48">
            <path clipRule="evenodd" d={svgPaths.p9c7a500} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p93aab80} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p824e980} fill="var(--fill-0, #006C9C)" fillRule="evenodd" />
          </g>
          <g>
            <path d={svgPaths.p3cf27300} fill="var(--fill-0, white)" />
            <path d={svgPaths.p34712180} fill="var(--fill-0, white)" />
            <path d={svgPaths.p3c272500} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_87_21242" x1="12.2341" x2="36.0001" y1="10.8444" y2="34.6104">
            <stop stopColor="#77ED8B" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_87_21242" x1="0" x2="28.9534" y1="0.00021312" y2="28.9537">
            <stop stopColor="#00B8D9" />
            <stop offset="1" stopColor="#006C9C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconsNotificationsIcChat() {
  return (
    <div className="relative shrink-0 size-[36px] cursor-pointer hover:opacity-80">
      <Stack />
    </div>
  );
}

// 頂部操作區
function TopActions({ onHistoryOpen }: { onHistoryOpen?: () => void }) {
  return (
    <div className="content-stretch flex gap-[12px] items-center">
      <IconsSolidIcSolarPrinterMinimalisticBold />
      <IconsNotificationsIcChat />
      <p
        onClick={onHistoryOpen}
        className="[text-decoration-skip-ink:none] css-ew64yg decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline cursor-pointer hover:text-[#003d73]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        歷程
      </p>
    </div>
  );
}

// 狀態標籤
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    '廠商確認中': { bg: 'rgba(0,184,217,0.16)', border: '#00b8d9', text: '#006c9c', code: 'V' },
    '巨大確認中': { bg: 'rgba(255,171,0,0.16)', border: '#ffab00', text: '#B76E00', code: 'G' },
    '已結案': { bg: 'rgba(34,197,94,0.08)', border: '#22c55e', text: '#22c55e', code: 'CL' },
    '處理中': { bg: 'rgba(255,171,0,0.08)', border: '#ffab00', text: '#ffab00', code: '' },
    '取消': { bg: 'rgba(145,158,171,0.16)', border: '#919eab', text: '#637381', code: 'CE' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['廠商確認中'];

  return (
    <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-w-[48px] px-[12px] py-0 relative rounded-[8px] shrink-0" style={{ backgroundColor: config.bg }}>
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[14px] whitespace-nowrap" style={{ color: config.text }}>
        {config.code ? `${status}(${config.code})` : status}
      </p>
    </div>
  );
}

// 頂部標題區
function TopHeader({ abnormalNumber, status }: { abnormalNumber: string; status: string }) {
  return (
    <div className="content-stretch flex gap-[17px] items-center">
      <StatusBadge status={status} />
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">{`品質異常單:  ${abnormalNumber}`}</p>
      <p className="css-ew64yg font-['Roboto:Regular',sans-serif] font-normal leading-[16px] text-[#637381] text-[12px] tracking-[0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        2025/01/01 00:00
      </p>
    </div>
  );
}

// 資訊項目
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="content-stretch flex gap-[10px] items-start shrink-0 w-[200px]">
      <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[14px]">{label}</p>
      <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381] text-[14px]">{value}</p>
    </div>
  );
}

// 基本資訊區
interface BasicInfoProps {
  vendor: string;
  orderNumber: string;
  quantity: number;
  partNumber: string;
  description: string;
}
function BasicInfo({ vendor, orderNumber, quantity, partNumber, description }: BasicInfoProps) {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start px-0 py-[10px] w-full">
      {/* 基本資料標籤 */}
      <div className="content-stretch flex flex-col items-start shrink-0 w-[72px]">
        <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0">
          <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
          <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">基本資料</p>
        </div>
      </div>

      <div className="content-stretch flex gap-[10px] items-center w-full">
        <InfoItem label="廠商(編號)" value={vendor} />
        <InfoItem label="訂單號碼" value={orderNumber} />
        <InfoItem label="數量" value={String(quantity)} />
        <InfoItem label="料號" value={partNumber} />
      </div>
      <div className="content-stretch flex gap-[10px] items-start w-full">
        <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e] text-[14px] shrink-0">長規格敘述</p>
        <p className="css-ew64yg font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[#637381] text-[14px]">{description}</p>
      </div>
    </div>
  );
}

// 廠商回覆區塊
interface VendorReplyData {
  reviewer: string;
  filler: string;
  rootCause: string;
  countermeasure: string;
}

function VendorReply({
  status,
  initialData,
  returnReason,
  onSubmitSuccess,
  onAttachmentAdd,
  onAttachmentDelete,
  initialImages,
  onImagesChange,
}: {
  status: string;
  initialData?: VendorReplyData;
  returnReason?: string;
  onSubmitSuccess?: (data: VendorReplyData) => void;
  onAttachmentAdd?: (filename: string) => void;
  onAttachmentDelete?: (filename: string) => void;
  initialImages?: UploadedImage[];
  onImagesChange?: (images: UploadedImage[]) => void;
}) {
  const isReadOnly = status !== '廠商確認中';

  // ── 欄位 state（如果是 read-only 則帶入已存的資料） ──
  const [reviewer, setReviewer] = useState(initialData?.reviewer ?? '');
  const [filler, setFiller] = useState(initialData?.filler ?? '');
  const [rootCause, setRootCause] = useState(initialData?.rootCause ?? '');
  const [countermeasure, setCountermeasure] = useState(initialData?.countermeasure ?? '');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // ── 驗證並送出（將填寫內容傳回父層） ──
  const handleSubmit = () => {
    const missing: string[] = [];
    if (!reviewer.trim()) missing.push('審核者');
    if (!filler.trim()) missing.push('填表者');
    if (!rootCause.trim()) missing.push('原因分析');
    if (!countermeasure.trim()) missing.push('提出對策');
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
    // TODO: 送出 API
    onSubmitSuccess?.({ reviewer, filler, rootCause, countermeasure });
  };

  // ── 圖片上傳狀態 ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(initialImages ?? []);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 圖片變動時通知父層儲存（重新開啟時可還原）
  useEffect(() => { onImagesChange?.(images); }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((files: FileList | File[]) => {
    const MAX = 10;
    const arr = Array.from(files);
    setImages(prev => {
      const remaining = MAX - prev.length;
      if (remaining <= 0) return prev;
      const toAdd = arr.slice(0, remaining).map(f => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        url: URL.createObjectURL(f),
        file: f,
        isImage: f.type.startsWith('image/') || /\.(jpe?g|png|gif|bmp|webp|svg|avif|heic)$/i.test(f.name),
      }));
      toAdd.forEach(img => onAttachmentAdd?.(img.name));
      return [...prev, ...toAdd];
    });
  }, [onAttachmentAdd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        onAttachmentDelete?.(target.name);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleDownloadAll = () => {
    images.forEach(img => {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name;
      a.click();
    });
  };

  return (
    <div className={`px-[24px] py-[20px] ${isReadOnly ? 'bg-[#f4f6f8]' : 'bg-[#fff1e5]'}`}>
      {/* C 版：單列精簡標題列 */}
      <div className="flex items-center gap-[12px] w-full mb-[14px] flex-wrap">
        {/* 廠商回覆標題（底線樣式） */}
        <div className="content-stretch flex flex-col items-start shrink-0 w-[72px]">
          <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0">
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">廠商回覆</p>
          </div>
        </div>



        {/* 審核者 */}
        {!isReadOnly ? (
          <div className="flex items-center gap-[6px] shrink-0">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#637381] shrink-0">審核者<span className="text-[#FF5630] ml-[2px]">*</span></p>
            <input
              type="text"
              value={reviewer}
              onChange={e => setReviewer(e.target.value)}
              placeholder="請輸入審核者"
              className="h-[34px] w-[120px] px-[10px] rounded-[6px] border-2 border-white bg-white/80 outline-none font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] placeholder-[#919EAB] focus:bg-white focus:border-[#1D7BF5] focus:ring-2 focus:ring-[rgba(29,123,245,0.3)] transition-all"
            />
          </div>
        ) : (
          <div className="flex items-center gap-[6px] shrink-0">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">審核者</p>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381]">{reviewer}</p>
          </div>
        )}

        {/* 填表者 */}
        {!isReadOnly ? (
          <div className="flex items-center gap-[6px] shrink-0">
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#637381] shrink-0">填表者<span className="text-[#FF5630] ml-[2px]">*</span></p>
            <input
              type="text"
              value={filler}
              onChange={e => setFiller(e.target.value)}
              placeholder="請輸入填表者"
              className="h-[34px] w-[120px] px-[10px] rounded-[6px] border-2 border-white bg-white/80 outline-none font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] placeholder-[#919EAB] focus:bg-white focus:border-[#1D7BF5] focus:ring-2 focus:ring-[rgba(29,123,245,0.3)] transition-all"
            />
          </div>
        ) : (
          <div className="flex items-center gap-[6px] shrink-0">
            <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[14px] text-[#1c252e]">填表者</p>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] text-[#637381]">{filler}</p>
          </div>
        )}

        {/* 回覆巨大按鈕 */}
        {!isReadOnly && (
          <div
            onClick={handleSubmit}
            className="bg-[#1D7BF5] h-[36px] min-w-[80px] rounded-[8px] cursor-pointer hover:bg-[#1565c0] shrink-0">
            <div className="flex items-center justify-center px-[16px] h-full">
              <p className="css-ew64yg font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">回覆巨大</p>
            </div>
          </div>
        )}
      </div>

      {/* ── 退回原因 banner（被退回的單才顯示） ── */}
      {!!returnReason && (
        <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] text-[#FF5630] mb-[14px]">
          巨大退回原因：{returnReason}
        </p>
      )}

      {/* ── 驗證失敗 Alert ── */}
      {missingFields.length > 0 && (
        <BaseOverlay onClose={() => setMissingFields([])} maxWidth="400px" maxHeight="300px">
          {/* 頂部警示列 */}
          <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,86,48,0.08)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FF5630" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="#FF5630" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">尚未填寫必要欄位</p>
            <button
              onClick={() => setMissingFields([])}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* 內容 */}
          <div className="flex-1 px-[20px] py-[16px]">
            <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] mb-[12px]">送出前請先填寫以下欄位：</p>
            <ul className="space-y-[6px]">
              {missingFields.map(f => (
                <li key={f} className="flex items-center gap-[8px]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#FF5630] shrink-0" />
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e]">{f}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* 底部 */}
          <div className="shrink-0 flex justify-end px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)]">
            <button
              onClick={() => setMissingFields([])}
              className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors"
            >
              <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white">確認</span>
            </button>
          </div>
        </BaseOverlay>
      )}




      {/* ── 三欄等寬：原因分析 | 提出對策 | 附件 ── */}
      <div className="flex gap-[13px] w-full" style={{ height: 200 }}>

        {/* 欄 1：原因分析 */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[10px] shadow-sm h-full">
            <div className="p-[10px] h-full flex flex-col">
              <div className="flex items-center gap-[4px] mb-[7px]">
                <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black">原因分析</p>
                {!isReadOnly && <span className="text-[#FF5630] text-[14px] font-bold leading-none">*</span>}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!isReadOnly ? (
                  <textarea
                    className="w-full h-full resize-none outline-none bg-transparent font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#1c252e] text-[14px] placeholder-[#919EAB]"
                    placeholder="請輸入原因分析..."
                    value={rootCause}
                    onChange={e => setRootCause(e.target.value)}
                    style={{ minHeight: '100%' }}
                  />
                ) : (
                  <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">{rootCause}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 欄 2：提出對策 */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[10px] shadow-sm h-full">
            <div className="p-[10px] h-full flex flex-col">
              <div className="flex items-center gap-[4px] mb-[7px]">
                <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black">提出對策</p>
                {!isReadOnly && <span className="text-[#FF5630] text-[14px] font-bold leading-none">*</span>}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!isReadOnly ? (
                  <textarea
                    className="w-full h-full resize-none outline-none bg-transparent font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#1c252e] text-[14px] placeholder-[#919EAB]"
                    placeholder="請輸入提出對策..."
                    value={countermeasure}
                    onChange={e => setCountermeasure(e.target.value)}
                    style={{ minHeight: '100%' }}
                  />
                ) : (
                  <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">{countermeasure}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 欄 3：附件（圖片上傳） */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[10px] shadow-sm h-full">
            <div className="p-[10px] h-full flex flex-col">
              {/* 標題列 */}
              <div className="flex items-center justify-between mb-[8px] shrink-0">
                <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black">
                  附件
                  {images.length > 0 && (
                    <span className="ml-[6px] font-normal text-[12px] text-[#637381]">({images.length}/10)</span>
                  )}
                </p>
                <div className="flex items-center gap-[8px]">
                  {images.length > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center gap-[4px] h-[26px] px-[10px] rounded-[6px] border border-[rgba(145,158,171,0.3)] hover:border-[#1c252e] hover:bg-[rgba(28,37,46,0.04)] transition-colors"
                      title="下載全部附件"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">下載全部</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 拖曳上傳 / 縮圖展示區 */}
              <div
                className={`flex-1 relative rounded-[6px] transition-colors ${
                  !isReadOnly && isDragging
                    ? 'bg-[rgba(29,123,245,0.06)] border-[2px] border-dashed border-[#1D7BF5]'
                    : images.length === 0
                      ? 'border border-dashed border-[rgba(145,158,171,0.4)]'
                      : ''
                }`}
                style={{ minHeight: 80 }}
                onDragOver={!isReadOnly ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
                onDragLeave={!isReadOnly ? () => setIsDragging(false) : undefined}
                onDrop={!isReadOnly ? handleDrop : undefined}
              >
                {images.length === 0 ? (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-[4px] ${!isReadOnly ? 'cursor-pointer' : ''}`}
                    onClick={!isReadOnly ? () => fileInputRef.current?.click() : undefined}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17 8 12 3 7 8" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919EAB] text-center">
                      {isReadOnly ? '尚無附件' : (
                        <>
                          拖曳或{' '}
                          <span className="text-[#1D7BF5] cursor-pointer hover:underline">點擊上傳</span>
                          {' '}支援 JPG、PNG、PDF、Word（上限10個）
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar h-full">
                    <div className="flex gap-[8px] px-[4px] pt-[4px] pb-[4px]">
                      {images.map((img, idx) => (
                        <Thumbnail
                          key={img.id}
                          image={img}
                          onClick={() => setLightboxIndex(idx)}
                          onDelete={isReadOnly ? undefined : () => handleDelete(img.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 隱藏的 file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNext={() => setLightboxIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))}
        />
      )}
    </div>
  );
}

// ─── 原因輸入 Overlay ────────────────────────────────────────────────
interface ReasonInputOverlayProps {
  title: string;
  placeholder: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

function ReasonInputOverlay({ title, placeholder, confirmLabel, confirmColor, onConfirm, onClose }: ReasonInputOverlayProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const isEmpty = reason.trim() === '';

  return (
    <BaseOverlay onClose={onClose} maxWidth="480px" maxHeight="380px">
      {/* 頂部 */}
      <div className="shrink-0 flex items-center gap-[12px] pl-[4px] pr-[16px] py-[4px] border-b border-[rgba(145,158,171,0.12)]">
        <div className="flex items-center justify-center rounded-[12px] shrink-0 size-[48px] bg-[rgba(255,171,0,0.08)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFAB00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFAB00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="flex-1 font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] leading-[22px] text-[#1c252e]">{title}</p>
        <button onClick={onClose} className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-[rgba(145,158,171,0.12)] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* 內容 */}
      <div className="flex-1 px-[20px] py-[16px] flex flex-col gap-[8px]">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">請輸入原因（必填）：</p>
        <textarea
          className={`flex-1 w-full rounded-[8px] border ${
            touched && isEmpty ? 'border-[#FF5630]' : 'border-[rgba(145,158,171,0.3)]'
          } px-[12px] py-[10px] resize-none outline-none font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[13px] text-[#1c252e] placeholder-[#919EAB] focus:border-[#1D7BF5] focus:ring-2 focus:ring-[rgba(29,123,245,0.2)] transition-all`}
          placeholder={placeholder}
          value={reason}
          onChange={e => { setReason(e.target.value); setTouched(true); }}
          style={{ minHeight: 100 }}
        />
        {touched && isEmpty && (
          <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#FF5630]">此欄位為必填</p>
        )}
      </div>
      {/* 底部 */}
      <div className="shrink-0 flex justify-end gap-[8px] px-[20px] py-[12px] border-t border-[rgba(145,158,171,0.12)]">
        <button
          onClick={onClose}
          className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] border border-[rgba(145,158,171,0.3)] hover:bg-[rgba(145,158,171,0.08)] transition-colors"
        >
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381]">關閉</span>
        </button>
        <button
          onClick={() => { setTouched(true); if (!isEmpty) onConfirm(reason.trim()); }}
          className="flex items-center justify-center h-[36px] px-[20px] rounded-[8px] transition-colors"
          style={{ backgroundColor: confirmColor }}
        >
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-white">{confirmLabel}</span>
        </button>
      </div>
    </BaseOverlay>
  );
}

function GiantReply({ status, returnReason, cancelReason, initialConfirmText, onCancel, onReturn, onSettle, onAttachmentAdd, onAttachmentDelete, initialImages, onImagesChange }: GiantReplyProps & { initialConfirmText?: string; onAttachmentAdd?: (filename: string) => void; onAttachmentDelete?: (filename: string) => void; initialImages?: UploadedImage[]; onImagesChange?: (images: UploadedImage[]) => void }) {
  const isEditable = status === '巨大確認中';
  const [confirmText, setConfirmText] = useState(initialConfirmText ?? '');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  // ── 圖片上傳狀態 ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(initialImages ?? []);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 圖片變動時通知父層儲存（重新開啟時可還原）
  useEffect(() => { onImagesChange?.(images); }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback((files: FileList | File[]) => {
    const MAX = 10;
    const arr = Array.from(files);
    setImages(prev => {
      const remaining = MAX - prev.length;
      if (remaining <= 0) return prev;
      const toAdd = arr.slice(0, remaining).map(f => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        url: URL.createObjectURL(f),
        file: f,
        isImage: f.type.startsWith('image/') || /\.(jpe?g|png|gif|bmp|webp|svg|avif|heic)$/i.test(f.name),
      }));
      toAdd.forEach(img => onAttachmentAdd?.(img.name));
      return [...prev, ...toAdd];
    });
  }, [onAttachmentAdd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        onAttachmentDelete?.(target.name);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleDownloadAll = () => {
    images.forEach(img => {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name;
      a.click();
    });
  };

  return (
    <div className={`px-[24px] py-[20px] rounded-bl-[16px] rounded-br-[16px] ${
      isEditable ? 'bg-[#fff1e5]' : 'bg-[#f4f6f8]'
    }`}>

      {/* 標題列 */}
      <div className="flex items-center gap-[12px] w-full mb-[14px]">
        {/* 巨大回覆標題（底線樣式） */}
        <div className="content-stretch flex flex-col items-start shrink-0 w-[72px]">
          <div className="content-stretch flex gap-[8px] h-[48px] items-center justify-center min-h-[48px] min-w-[48px] relative shrink-0">
            <div aria-hidden="true" className="absolute border-[#1c252e] border-b-2 border-solid inset-0 pointer-events-none" />
            <p className="css-ew64yg font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">巨大回覆</p>
          </div>
        </div>

        {/* 彈性空白 */}
        <div className="flex-1" />

        {/* 功能按鈕（只在 巨大確認中 狀態顯示） */}
        {isEditable && (
          <>
            <button
              onClick={() => setShowCancelDialog(true)}
              className="flex items-center justify-center h-[36px] px-[16px] rounded-[8px] bg-[#FF5630] hover:bg-[#E0421A] transition-colors shrink-0"
            >
              <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white">取消單據</span>
            </button>
            <button
              onClick={() => setShowReturnDialog(true)}
              className="flex items-center justify-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors shrink-0"
            >
              <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white">儲存後退回廠商</span>
            </button>
            <button
              onClick={() => onSettle?.(confirmText)}
              className="flex items-center justify-center h-[36px] px-[16px] rounded-[8px] bg-[#1c252e] hover:bg-[#2c3540] transition-colors shrink-0"
            >
              <span className="font-['Public_Sans:Bold',sans-serif] font-bold text-[14px] text-white">儲存後結案</span>
            </button>
          </>
        )}
      </div>

      {/* 取消原因 banner */}
      {!!cancelReason && (
        <div className="flex items-start gap-[10px] px-[14px] py-[10px] rounded-[8px] mb-[14px] bg-[rgba(145,158,171,0.12)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[3px]">
            <circle cx="12" cy="12" r="10" stroke="#637381" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="#637381" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#1c252e] mb-[2px]">取消原因</p>
            <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381]">{cancelReason}</p>
          </div>
        </div>
      )}

      {/* 二欄：確認回覆(1) | 附件(2) */}
      <div className="flex gap-[13px] w-full" style={{ height: 200 }}>

        {/* 欄 1：確認回覆 */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[10px] shadow-sm h-full">
            <div className="p-[10px] h-full flex flex-col">
              <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black mb-[7px]">確認回覆</p>
              {isEditable ? (
                <textarea
                  className="flex-1 w-full resize-none outline-none bg-transparent font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#1c252e] text-[14px] placeholder-[#919EAB]"
                  placeholder="請輸入確認回覆..."
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  style={{ minHeight: 120 }}
                />
              ) : (
                <p className="css-ew64yg font-['Public_Sans:Light','Noto_Sans_JP:Light',sans-serif] font-light leading-[24px] text-[#637381] text-[14px]">{confirmText}</p>
              )}
            </div>
          </div>
        </div>

        {/* 欄 2：附件 (flex-2) */}
        <div className="flex-[2] min-w-0">
          <div className="bg-white rounded-[10px] shadow-sm h-full">
            <div className="p-[10px] h-full flex flex-col">
              {/* 標題列 */}
              <div className="flex items-center justify-between mb-[8px] shrink-0">
                <p className="css-4hzbpn font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-black">
                  附件
                  {images.length > 0 && (
                    <span className="ml-[6px] font-normal text-[12px] text-[#637381]">({images.length}/10)</span>
                  )}
                </p>
                <div className="flex items-center gap-[8px]">
                  {images.length > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center gap-[4px] h-[26px] px-[10px] rounded-[6px] border border-[rgba(145,158,171,0.3)] hover:border-[#1c252e] hover:bg-[rgba(28,37,46,0.04)] transition-colors"
                      title="下載全部附件"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#637381]">下載全部</span>
                    </button>
                  )}

                </div>
              </div>

              {/* 拖曳上傳 / 縮圖展示區 */}
              <div
                className={`flex-1 relative rounded-[6px] transition-colors ${
                  isEditable && isDragging
                    ? 'bg-[rgba(29,123,245,0.06)] border-[2px] border-dashed border-[#1D7BF5]'
                    : images.length === 0
                      ? 'border border-dashed border-[rgba(145,158,171,0.4)]'
                      : ''
                }`}
                style={{ minHeight: 80 }}
                onDragOver={isEditable ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
                onDragLeave={isEditable ? () => setIsDragging(false) : undefined}
                onDrop={isEditable ? handleDrop : undefined}
              >
                {images.length === 0 ? (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-[4px] ${isEditable ? 'cursor-pointer' : ''}`}
                    onClick={isEditable ? () => fileInputRef.current?.click() : undefined}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17 8 12 3 7 8" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="#919EAB" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919EAB] text-center">
                      {isEditable
                        ? <>拖曳或{' '}<span className="text-[#1D7BF5] cursor-pointer hover:underline">點擊上傳</span>{' '}支援 JPG、PNG、PDF、Word（上限10個）</>
                        : '尚無附件'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar h-full">
                    <div className="flex gap-[8px] px-[4px] pt-[4px] pb-[4px]">
                      {images.map((img, idx) => (
                        <Thumbnail
                          key={img.id}
                          image={img}
                          onClick={() => setLightboxIndex(idx)}
                          onDelete={isEditable ? () => handleDelete(img.id) : () => {}}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 隱藏的 file input */}
      {isEditable && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNext={() => setLightboxIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))}
        />
      )}

      {/* 取消單據對話 */}
      {showCancelDialog && (
        <ReasonInputOverlay
          title="取消單據"
          placeholder="請說明取消原因..."
          confirmLabel="確認取消"
          confirmColor="#FF5630"
          onConfirm={(reason) => { onCancel(reason); setShowCancelDialog(false); }}
          onClose={() => setShowCancelDialog(false)}
        />
      )}

      {/* 退回廠商對話 */}
      {showReturnDialog && (
        <ReasonInputOverlay
          title="退回廠商"
          placeholder="請說明退回原因..."
          confirmLabel="確認退回"
          confirmColor="#1c252e"
          onConfirm={(reason) => { onReturn(reason); setShowReturnDialog(false); }}
          onClose={() => setShowReturnDialog(false)}
        />
      )}
    </div>
  );
}
// 主元件
interface QualityAbnormalDetailProps {
  abnormalNumber: string;
  status: string;
  row?: {
    vendor: string;
    orderNumber: string;
    quantity: number;
    partNumber: string;
    description: string;
    defectType: string;
    emergencyAction: string;
    causeAnalysis: string;
    countermeasure: string;
    gtmConfirm?: string;
    vendorReviewer?: string;
    vendorFiller?: string;
    isReturned?: boolean;
    returnReason?: string;
    replyHistory?: HistoryEntry[];
  };
  onVendorReplySubmit?: (data: VendorReplyData) => void;
  onReturn?: (reason: string) => void;
  onCancel?: (reason: string) => void;
  onSettle?: (confirmText: string) => void;
  onAttachmentAdd?: (section: 'basic' | 'vendor' | 'giant', filename: string) => void;
  onAttachmentDelete?: (section: 'basic' | 'vendor' | 'giant', filename: string) => void;
  /** 圖片持久化：重新開啟時帶入各區塊已上傳圖片 */
  initialFiles?: { basic: UploadedImage[]; vendor: UploadedImage[]; giant: UploadedImage[] };
  /** 圖片變動時通知父層儲存 */
  onFilesChange?: (section: 'basic' | 'vendor' | 'giant', images: UploadedImage[]) => void;
  onClose?: () => void;
}

export function QualityAbnormalDetail({ abnormalNumber, status: initialStatus, row, onVendorReplySubmit, onReturn, onCancel, onSettle, onAttachmentAdd, onAttachmentDelete, initialFiles, onFilesChange, onClose }: QualityAbnormalDetailProps) {
  const [localStatus, setLocalStatus] = useState(initialStatus);
  const [returnReason, setReturnReason] = useState(row?.returnReason ?? '');
  const [cancelReason, setCancelReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // 當外部 status prop 改變時（例如廠商送出後 V→G），同步更新 localStatus
  useEffect(() => {
    setLocalStatus(initialStatus);
  }, [initialStatus]);

  const handleCancel = (reason: string) => {
    setCancelReason(reason);
    setLocalStatus('取消');
    onCancel?.(reason);
  };

  const handleReturn = (reason: string) => {
    setReturnReason(reason);
    setLocalStatus('廠商確認中');
    onReturn?.(reason);
  };

  const handleSettle = (confirmText: string) => {
    setLocalStatus('已結案');
    onSettle?.(confirmText);
  };

  // 巨大回覆顯示條件：非「廠商確認中」，或曾退回過（有 returnReason 或 row.isReturned）
  const showGiantReply = localStatus !== '廠商確認中' || !!returnReason || !!row?.isReturned;

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar rounded-[16px] relative">
      {/* 關閉按鈕 */}
      {onClose && (
        <div
          className="absolute left-[20px] top-[15px] cursor-pointer hover:opacity-70 transition-opacity z-10"
          onClick={onClose}
        >
          <div className="relative size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path clipRule="evenodd" d={closeIconPaths.p275a9800} fill="#637381" fillRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* 灰色背景區域 - 頂部部分 */}
      <div className="bg-[#f4f6f8] rounded-tl-[16px] rounded-tr-[16px] px-[24px] pt-[24px]">
        {/* 頂部標題和操作按鈕 */}
        <div className="flex h-[84px] items-center justify-between">
          <TopHeader abnormalNumber={abnormalNumber} status={localStatus} />
          <TopActions onHistoryOpen={() => setShowHistory(true)} />
        </div>

        {/* 基本資訊 */}
        <BasicInfo
          vendor={row?.vendor ?? ''}
          orderNumber={row?.orderNumber ?? ''}
          quantity={row?.quantity ?? 0}
          partNumber={row?.partNumber ?? ''}
          description={row?.description ?? ''}
        />

        {/* 不良情形 + 應急處理 + 品保圖片 */}
        <IssueSection
          defectType={row?.defectType ?? ''}
          emergencyAction={row?.emergencyAction ?? ''}
          onAttachmentAdd={onAttachmentAdd ? (fn) => onAttachmentAdd('basic', fn) : undefined}
          onAttachmentDelete={onAttachmentDelete ? (fn) => onAttachmentDelete('basic', fn) : undefined}
          initialImages={initialFiles?.basic}
          onImagesChange={onFilesChange ? (imgs) => onFilesChange('basic', imgs) : undefined}
          isReadOnly={localStatus === '取消' || localStatus === '已結案'}
        />
      </div>

      {/* 廠商回覆區（白色背景） */}
      <VendorReply
        status={localStatus}
        initialData={{
          reviewer: row?.vendorReviewer ?? '',
          filler: row?.vendorFiller ?? '',
          rootCause: row?.causeAnalysis ?? '',
          countermeasure: row?.countermeasure ?? '',
        }}
        returnReason={row?.returnReason}
        onSubmitSuccess={onVendorReplySubmit ?? onClose}
        onAttachmentAdd={onAttachmentAdd ? (fn) => onAttachmentAdd('vendor', fn) : undefined}
        onAttachmentDelete={onAttachmentDelete ? (fn) => onAttachmentDelete('vendor', fn) : undefined}
        initialImages={initialFiles?.vendor}
        onImagesChange={onFilesChange ? (imgs) => onFilesChange('vendor', imgs) : undefined}
      />

      {/* 巨大回覆區 */}
      {showGiantReply && (
        <GiantReply
          status={localStatus}
          returnReason={returnReason || undefined}
          cancelReason={cancelReason || undefined}
          initialConfirmText={row?.gtmConfirm ?? ''}
          onCancel={handleCancel}
          onReturn={handleReturn}
          onSettle={handleSettle}
          onAttachmentAdd={onAttachmentAdd ? (fn) => onAttachmentAdd('giant', fn) : undefined}
          onAttachmentDelete={onAttachmentDelete ? (fn) => onAttachmentDelete('giant', fn) : undefined}
          initialImages={initialFiles?.giant}
          onImagesChange={onFilesChange ? (imgs) => onFilesChange('giant', imgs) : undefined}
        />
      )}

      {/* 歷程 Overlay：使用系統標準 OrderHistory 表格元件 */}
      {showHistory && (
        <OrderHistory
          onClose={() => setShowHistory(false)}
          titleLabel="品質異常歷程"
          entries={[...(row?.replyHistory ?? [])].reverse().map(e => ({
            date: e.timestamp,
            event: e.summary,
            operator: e.actor === 'system' ? '系統' : e.actor,
            remark: e.detail?.map(d => `${d.label}：${d.value}`).join('；') ?? '',
          }))}
        />
      )}
    </div>
  );
}