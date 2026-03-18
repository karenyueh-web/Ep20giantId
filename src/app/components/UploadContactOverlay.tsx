import svgPaths from '@/imports/svg-gqoe61fs3r';
import { BaseOverlay } from './BaseOverlay';

interface UploadContactOverlayProps {
  onClose: () => void;
}

export function UploadContactOverlay({ onClose }: UploadContactOverlayProps) {
  const handleUpdate = () => {
    // TODO: 處理文件上傳邏輯
    console.log('上傳聯絡人');
    alert('聯絡人上傳成功！');
    onClose();
  };

  return (
    <BaseOverlay onClose={onClose} maxWidth="810px" maxHeight="479px">
      {/* 內容區域 */}
      <div className="flex flex-col h-full p-[35px]">
        {/* 標題區域 */}
        <div className="flex gap-[17px] items-center mb-[20px]">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            請上傳聯絡人資訊
          </p>
          <button className="[text-decoration-skip-ink:none] decoration-solid font-['Roboto:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[32px] text-[#005eb8] text-[16px] underline hover:opacity-70 transition-opacity">
            範本
          </button>
        </div>

        {/* 上傳區域 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[rgba(145,158,171,0.08)] relative rounded-[8px] w-full h-[312px]">
            <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
              <div className="flex flex-col items-center justify-center p-[40px] w-full">
                {/* 上傳圖標 */}
                <div className="h-[150px] w-[200px] relative mb-[20px]">
                  <div className="absolute inset-[16.67%_16.27%_16.67%_16.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 134.955 100">
                      <g id="container">
                        <g id="Path" />
                        <path d={svgPaths.p1b3b6000} fill="#FF5630" id="Path_2" opacity="0.05" />
                        <path d={svgPaths.p35e11c80} fill="#FF5630" id="Path_3" opacity="0.05" />
                        <path d={svgPaths.p3fdcea00} fill="#FF5630" id="Path_4" opacity="0.05" />
                        <path d={svgPaths.p38d4fc00} fill="#FF5630" id="Path_5" opacity="0.05" />
                        <path d={svgPaths.p26310b00} fill="#FF5630" id="Path_6" opacity="0.05" />
                        <path d={svgPaths.p20af35f0} fill="#FF5630" id="Path_7" opacity="0.05" />
                        <path d={svgPaths.p34143400} fill="#FF5630" id="Path_8" opacity="0.05" />
                        <path d={svgPaths.p2dee8ec0} fill="#FF5630" id="Path_9" opacity="0.05" />
                        <path d={svgPaths.p2d50ab00} fill="#FF5630" id="Path_10" opacity="0.05" />
                        <path d={svgPaths.p282df600} fill="#FF5630" id="Path_11" opacity="0.05" />
                        <path d={svgPaths.pcee4380} fill="#FF5630" id="Path_12" opacity="0.05" />
                        <path d={svgPaths.p251f8200} fill="#FF5630" id="Path_13" opacity="0.05" />
                        <path d={svgPaths.p2d9c4a00} fill="#FF5630" id="Path_14" opacity="0.05" />
                        <path clipRule="evenodd" d={svgPaths.p33648f00} fill="#004680" fillRule="evenodd" id="Path_15" />
                        <rect fill="white" height="32.3027" id="Rectangle" transform="rotate(34.64 82.2144 26.5316)" width="9.51728" x="82.2144" y="26.5316" />
                        <rect fill="#FFAB00" height="6.71903" id="Rectangle_2" transform="rotate(34.804 82.7787 27.7908)" width="6.71903" x="82.7787" y="27.7908" />
                        <rect fill="#FFAB00" height="6.72812" id="Rectangle_3" opacity="0.5" transform="rotate(34.64 78.4566 34.4394)" width="6.72812" x="78.4566" y="34.4394" />
                        <rect fill="#FFAB00" height="6.72812" id="Rectangle_4" opacity="0.3" transform="rotate(34.64 73.8383 41.1225)" width="6.72812" x="73.8383" y="41.1225" />
                        <rect fill="white" height="32.1806" id="Rectangle_5" transform="rotate(16.29 71.1515 24.8671)" width="9.51728" x="71.1515" y="24.8671" />
                        <rect fill="#FF5630" height="6.72812" id="Rectangle_6" transform="rotate(16.29 72.3507 25.7588)" width="6.72812" x="72.3507" y="25.7588" />
                        <rect fill="#FF5630" height="6.72812" id="Rectangle_7" opacity="0.5" transform="rotate(16.29 70.072 33.5553)" width="6.72812" x="70.072" y="33.5553" />
                        <rect fill="#FF5630" height="6.72812" id="Rectangle_8" opacity="0.3" transform="rotate(16.29 67.7938 41.3507)" width="6.72812" x="67.7938" y="41.3507" />
                        <rect fill="white" height="32.1806" id="Rectangle_9" transform="rotate(4.6 64.6806 25.3542)" width="9.51728" x="64.6806" y="25.3542" />
                        <rect fill="#00B8D9" height="6.72812" id="Rectangle_10" transform="rotate(4.6 66.0307 25.985)" width="6.72812" x="66.0307" y="25.985" />
                        <rect fill="#00B8D9" height="6.72812" id="Rectangle_11" opacity="0.5" transform="rotate(4.6 65.3784 34.0799)" width="6.72812" x="65.3784" y="34.0799" />
                        <rect fill="#00B8D9" height="6.72812" id="Rectangle_12" opacity="0.3" transform="rotate(4.6 64.7274 42.1772)" width="6.72812" x="64.7274" y="42.1772" />
                        <rect fill="white" height="32.1806" id="Rectangle_13" transform="rotate(-2.61 60.4126 26.6439)" width="9.51728" x="60.4126" y="26.6439" />
                        <rect fill="#005EB8" height="6.72812" id="Rectangle_14" transform="rotate(-2.61 61.8298 27.0984)" width="6.72812" x="61.8298" y="27.0984" />
                        <rect fill="#005EB8" height="6.73653" id="Rectangle_15" opacity="0.5" transform="rotate(-2.86241 62.4634 34.9552)" width="6.73653" x="62.4634" y="34.9552" />
                        <rect fill="#005EB8" height="6.72812" id="Rectangle_16" opacity="0.3" transform="rotate(-2.61 62.5692 43.327)" width="6.72812" x="62.5692" y="43.327" />
                        <path d={svgPaths.p2f764fc0} fill="#F4F6F8" id="Path_16" />
                        <path d={svgPaths.p19810ac0} fill="black" id="Path_17" opacity="0.1" />
                        <path d={svgPaths.p1725adb0} fill="#005EB8" id="Path_18" />
                        <path d={svgPaths.p193583c0} fill="#FF5630" id="Path_19" opacity="0.1" />
                        <path d={svgPaths.pc925a80} fill="white" id="Path_20" />
                        <g id="vector" opacity="0.3">
                          <path d={svgPaths.p31312c00} fill="#005EB8" />
                          <path d={svgPaths.p401d780} fill="#005EB8" />
                          <path d={svgPaths.p27a0d080} fill="#005EB8" />
                          <path d={svgPaths.p1be8fa00} fill="#005EB8" />
                          <path d={svgPaths.p35e5fd00} fill="#005EB8" />
                          <path d={svgPaths.p21d0a200} fill="#005EB8" />
                        </g>
                        <g id="vector_2">
                          <path d={svgPaths.p32f01980} fill="#005EB8" />
                          <path d={svgPaths.p1919f680} fill="#005EB8" />
                          <path d={svgPaths.p1c27ab00} fill="#005EB8" />
                        </g>
                        <rect fill="white" height="38.0467" id="Rectangle_17" rx="4.73723" transform="rotate(-71.99 83.3883 27.0891)" width="21.2607" x="83.3883" y="27.0891" />
                        <g id="vector_3" opacity="0.24">
                          <path d={svgPaths.p28714570} fill="#005EB8" />
                          <path d={svgPaths.p21869100} fill="#005EB8" />
                          <path d={svgPaths.p3d2f8400} fill="#005EB8" />
                          <path d={svgPaths.p27b6cf00} fill="#005EB8" />
                          <path d={svgPaths.p1ad0ea80} fill="#005EB8" />
                        </g>
                        <rect fill="#005EB8" height="4.71006" id="Rectangle_18" opacity="0.5" transform="rotate(-71.99 111.001 33.714)" width="2.06914" x="111.001" y="33.714" />
                        <path d={svgPaths.p3aff7cc0} fill="white" id="Rectangle_19" />
                        <g id="vector_4">
                          <path d={svgPaths.p261d5d00} fill="#F4F6F8" />
                          <path d={svgPaths.p3450700} fill="#F4F6F8" />
                        </g>
                        <g id="vector_5">
                          <path d={svgPaths.p2e7e100} fill="#C4CDD5" />
                          <path d={svgPaths.p7ae3d80} fill="#C4CDD5" />
                          <path d={svgPaths.p201b0200} fill="#C4CDD5" />
                          <path d={svgPaths.p3a85aa80} fill="#C4CDD5" />
                          <path d={svgPaths.p283fdbc0} fill="#C4CDD5" />
                          <path d={svgPaths.p17378c00} fill="#C4CDD5" />
                        </g>
                        <path d={svgPaths.p3c89d80} fill="url(#paint0_linear_upload)" id="Path_21" />
                        <g id="vector_6" opacity="0.2">
                          <path d={svgPaths.pa0fa000} fill="#005EB8" />
                          <path d={svgPaths.p37308b80} fill="#005EB8" />
                          <path d={svgPaths.p322e3700} fill="#005EB8" />
                          <path d={svgPaths.p29eaf00} fill="#005EB8" />
                          <path d={svgPaths.pde010c0} fill="#005EB8" />
                          <path d={svgPaths.p12866600} fill="#005EB8" />
                          <path d={svgPaths.p386da500} fill="#005EB8" />
                        </g>
                        <g id="vector_7">
                          <path d={svgPaths.p3d235e00} fill="#005EB8" />
                          <path d={svgPaths.p10c7f900} fill="#005EB8" />
                          <path d={svgPaths.pe1ee380} fill="#005EB8" />
                        </g>
                        <g id="vector_8" opacity="0.08">
                          <path d={svgPaths.p7a3c00} fill="#005EB8" />
                          <path d={svgPaths.p2d6bea00} fill="#005EB8" />
                          <path d={svgPaths.p16d4e00} fill="#005EB8" />
                          <path d={svgPaths.p25ffb00} fill="#005EB8" />
                        </g>
                        <path clipRule="evenodd" d={svgPaths.p94ef700} fill="#00559C" fillRule="evenodd" id="Path_22" />
                        <path clipRule="evenodd" d={svgPaths.p3f5bf000} fill="#005EB8" fillRule="evenodd" id="Path_23" opacity="0.72" />
                        <path clipRule="evenodd" d={svgPaths.p1e32f880} fill="#00559C" fillRule="evenodd" id="Path_24" />
                        <g id="vector_9">
                          <path d={svgPaths.p14e07d00} fill="#005EB8" />
                          <path d={svgPaths.pe782100} fill="#005EB8" />
                          <path d={svgPaths.p30140300} fill="#005EB8" />
                        </g>
                        <g id="vector_10">
                          <path clipRule="evenodd" d={svgPaths.p33f70000} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p38823af2} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p2d935d80} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.pa64cd80} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p1a107600} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p34582300} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p13b206b0} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p3d8eb000} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p1828a3d0} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p2dbf7a00} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p3a534600} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p67356b0} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p143e4480} fill="#00559C" fillRule="evenodd" />
                          <path clipRule="evenodd" d={svgPaths.p9229c00} fill="#00559C" fillRule="evenodd" />
                        </g>
                      </g>
                      <defs>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_upload" x1="41.9284" x2="21.7462" y1="32.1831" y2="91.7768">
                          <stop stopColor="#005EB8" />
                          <stop offset="1" stopColor="#00559C" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* 文字說明 */}
                <div className="flex flex-col gap-[8px] items-center text-center w-full">
                  <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
                    Drop or select file
                  </p>
                  <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[14px]">
                    <span className="leading-[22px]">Drop files here or click to </span>
                    <span className="leading-[22px] text-[#005eb8]">browse</span>
                    <span className="leading-[22px]"> through your machine.</span>
                  </p>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-dashed inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
          </div>
        </div>

        {/* 按鈕區域 */}
        <div className="flex gap-[12px] items-center justify-end pt-[24px]">
          <button 
            className="flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] relative hover:bg-[#f4f6f8] transition-colors"
            onClick={onClose}
          >
            <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.32)] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-[#1c252e] text-[14px]">
              Cancel
            </p>
          </button>
          <button 
            className="bg-[#004680] flex gap-[8px] h-[36px] items-center justify-center min-w-[64px] px-[12px] rounded-[8px] hover:bg-[#003666] transition-colors"
            onClick={handleUpdate}
          >
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[24px] text-[14px] text-white">
              Update
            </p>
          </button>
        </div>
      </div>
    </BaseOverlay>
  );
}
