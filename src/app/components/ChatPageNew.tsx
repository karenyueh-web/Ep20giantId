import svgPaths from "@/imports/svg-k90cvtwh8p";
import svgPathsChat from "@/imports/svg-huvuhonro6";
import imgImgAvatar25 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";
import type { PageType } from './MainLayout';
import { useState, useRef, useEffect } from 'react';
import { chatData, type ChatConversation } from '@/app/data/chatData';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface ChatPageNewProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  initialChatId?: string | null;
  onLogout?: () => void;
  userRole?: string;
}

// 空白圖標組件
function IconsEmptyIcChatActive({ className }: { className?: string }) {
  return (
    <div className={className} data-name="icons/empty/ic-chat-active">
      <div className="absolute left-0 size-[120px] top-0" data-name="icons/empty/background">
        <div className="absolute inset-[9.42%_11.9%_8.83%_8.33%]" data-name="stack">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 95.714 98.1007">
            <g id="stack" opacity="0.48">
              <path clipRule="evenodd" d={svgPathsChat.p13246400} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape" opacity="0.48" />
              <path clipRule="evenodd" d={svgPathsChat.p58c35f0} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_2" opacity="0.48" />
              <path clipRule="evenodd" d={svgPathsChat.p2a3d4100} fill="var(--fill-0, #FF5630)" fillRule="evenodd" id="shape_3" />
              <path clipRule="evenodd" d={svgPathsChat.p365c8900} fill="var(--fill-0, #919EAB)" fillRule="evenodd" id="shape_4" opacity="0.8" />
              <path clipRule="evenodd" d={svgPathsChat.p1b23ba80} fill="var(--fill-0, #22C55E)" fillRule="evenodd" id="shape_5" opacity="0.24" />
              <path clipRule="evenodd" d={svgPathsChat.p25558d00} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="shape_6" opacity="0.8" />
              <path clipRule="evenodd" d={svgPathsChat.p838e580} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_7" opacity="0.48" />
              <path clipRule="evenodd" d={svgPathsChat.pbff15f2} fill="var(--fill-0, #8E33FF)" fillRule="evenodd" id="shape_8" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>
      <div className="absolute inset-[25.83%_23.33%_26.46%_23.33%]" data-name="stack">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 57.2525">
          <g id="stack">
            <path d={svgPathsChat.p34f02f00} fill="url(#paint0_linear_13_1500)" id="shape" />
            <path d={svgPathsChat.p27495c20} fill="url(#paint1_linear_13_1500)" id="shape_2" opacity="0.2" />
            <g id="shape_3">
              <path d={svgPathsChat.p32a14a70} fill="url(#paint2_linear_13_1500)" />
              <path d={svgPathsChat.p15720e80} fill="url(#paint3_linear_13_1500)" />
              <path d={svgPathsChat.p6e59100} fill="url(#paint4_linear_13_1500)" />
            </g>
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_13_1500" x1="0" x2="56.8987" y1="0" y2="63.6048">
              <stop stopColor="#FFD666" />
              <stop offset="1" stopColor="#FFAB00" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_13_1500" x1="0" x2="54.8038" y1="2.0045" y2="50.2613">
              <stop stopColor="#FFAB00" />
              <stop offset="1" stopColor="#B76E00" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_13_1500" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
              <stop stopColor="#FFF5CC" />
              <stop offset="1" stopColor="#FFD666" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_13_1500" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
              <stop stopColor="#FFF5CC" />
              <stop offset="1" stopColor="#FFD666" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_13_1500" x1="15.9514" x2="18.0955" y1="25.5528" y2="37.0872">
              <stop stopColor="#FFF5CC" />
              <stop offset="1" stopColor="#FFD666" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// AI功能組件
function StartAdornment() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="start adornment">
      <div className="absolute inset-[0_-16.67%_-33.33%_-16.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g filter="url(#filter0_d_chat_ai)" id="start-adornment-chat">
            <path d={svgPaths.p2cf2a500} fill="url(#paint0_linear_chat_ai)" id="Union" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32" id="filter0_d_chat_ai" width="32" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chat_ai" x1="16" x2="16" y1="2.41703e-09" y2="24">
              <stop stopColor="#005EB8" />
              <stop offset="1" stopColor="#002A52" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// 聊天列表項目
function ChatListItem({ 
  chat, 
  isSelected, 
  onSelect 
}: { 
  chat: ChatConversation; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  return (
    <div 
      onClick={onSelect}
      className={`flex gap-[16px] items-center px-[20px] py-[12px] w-full cursor-pointer transition-colors ${
        isSelected ? 'bg-[#f0f4ff]' : 'hover:bg-[#f9fafb]'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 size-[48px] rounded-full relative overflow-hidden">
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: chat.avatarBg }} />
        <img alt="" className="absolute inset-0 object-cover rounded-full size-full" src={chat.avatar} />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center w-full">
          <p className="flex-1 min-w-0 truncate font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px]">{chat.name}</p>
          <p className="shrink-0 font-['Public_Sans:Regular',sans-serif] font-normal leading-[18px] text-[#919eab] text-[12px] text-right w-[52px]">{chat.time}</p>
        </div>
        <div className="flex items-center w-full">
          <p className="flex-1 min-w-0 truncate font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] text-[#637381] text-[14px]">{chat.lastMessage}</p>
          {chat.unreadCount > 0 && (
            <div className="bg-[#22c55e] flex h-[20px] items-center justify-center min-w-[20px] px-[6px] rounded-full shrink-0 ml-[8px]">
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[20px] text-[12px] text-center text-white">{chat.unreadCount}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 聊天區域 - 全 flex 佈局
function ChatArea({ initialChatId }: { initialChatId?: string | null }) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);
  const [showChatList, setShowChatList] = useState(true);
  const selectedChat = chatData.find(chat => chat.id === selectedChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  return (
    <div className="flex flex-col bg-white h-full overflow-hidden rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]">
      {/* 頂部搜索欄 - 固定高度 */}
      <div className="h-[92px] shrink-0 flex items-center px-[20px] py-[16px] gap-[16px] border-b border-[rgba(145,158,171,0.2)]">
        {/* Avatar */}
        <div className="shrink-0 size-[48px] rounded-full relative overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-[#fff2b9]" />
          <img alt="" className="absolute inset-0 object-cover rounded-full size-full" src={imgImgAvatar25} />
        </div>
        
        {/* AI 搜尋欄 - 只在中大螢幕顯示 */}
        <div className="hidden sm:flex flex-1 min-w-0">
          <div className="bg-gradient-to-r from-[#ddf8fb] from-[43.75%] h-[46px] rounded-[99px] w-full to-[#5abbf8]">
            <div className="flex items-center h-full px-[14px]">
              <div className="pr-[8px] shrink-0">
                <StartAdornment />
              </div>
              <p className="flex-1 font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[15px] truncate">AI</p>
            </div>
          </div>
        </div>

        {/* 行動版返回按鈕（只在選中對話且小螢幕時顯示） */}
        {selectedChatId && (
          <button
            className="sm:hidden shrink-0 p-[8px] rounded-full hover:bg-[#f4f6f8] transition-colors"
            onClick={() => { setSelectedChatId(null); setShowChatList(true); }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Body: 聊天列表 + 對話區域 */}
      <div className="flex flex-1 min-h-0">
        {/* 左側聊天列表 */}
        <div className={`w-full sm:w-[320px] shrink-0 border-r border-[rgba(145,158,171,0.2)] overflow-y-auto custom-scrollbar py-[20px] ${
          selectedChatId ? 'hidden sm:block' : 'block'
        }`}>
          {chatData.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onSelect={() => {
                setSelectedChatId(chat.id);
                setShowChatList(false);
              }}
            />
          ))}
        </div>

        {/* 右側對話區域 */}
        {selectedChat ? (
          <div className={`flex-1 flex flex-col min-w-0 ${
            selectedChatId ? 'flex' : 'hidden sm:flex'
          }`}>
            {/* 對話對象頂部 */}
            <div className="h-[60px] shrink-0 border-b border-[rgba(145,158,171,0.2)] flex items-center px-[20px] gap-[12px]">
              {/* 行動版返回按鈕 */}
              <button
                className="sm:hidden shrink-0 p-[4px] rounded-full hover:bg-[#f4f6f8] transition-colors mr-[4px]"
                onClick={() => { setSelectedChatId(null); setShowChatList(true); }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="size-[40px] rounded-full overflow-hidden relative shrink-0">
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: selectedChat.avatarBg }} />
                <img alt="" className="absolute inset-0 object-cover rounded-full size-full" src={selectedChat.avatar} />
              </div>
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e]">{selectedChat.name}</p>
            </div>

            {/* 對話訊息區域 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-[20px] py-[20px] flex flex-col gap-[16px]">
              {selectedChat.messages.map((message) => (
                <div key={message.id} className={`flex gap-[12px] ${message.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {message.sender === 'them' && (
                    <div className="size-[40px] rounded-full overflow-hidden shrink-0 relative">
                      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: selectedChat.avatarBg }} />
                      <img alt="" className="absolute inset-0 object-cover rounded-full size-full" src={selectedChat.avatar} />
                    </div>
                  )}
                  <div className={`flex flex-col gap-[4px] max-w-[500px] ${message.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-[16px] py-[10px] rounded-[12px] ${
                      message.sender === 'me'
                        ? 'bg-[#e3f2fd] text-[#1c252e]'
                        : 'bg-white border border-[rgba(145,158,171,0.2)] text-[#1c252e]'
                    }`}>
                      <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] leading-[20px]">{message.text}</p>
                    </div>
                    <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{message.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 輸入框 */}
            <div className="h-[72px] sm:h-[102px] shrink-0 border-t border-[rgba(145,158,171,0.2)] flex items-center px-[20px]">
              <div className="flex items-center gap-[12px] w-full">
                {/* 附件按鈕 */}
                <div className="flex items-center justify-center rounded-full shrink-0 size-[36px] cursor-pointer hover:bg-[#f4f6f8] transition-colors">
                  <div className="overflow-clip relative shrink-0 size-[20px]">
                    <div className="absolute inset-[8.33%]">
                      <div className="absolute inset-0" style={{ "--fill-0": "rgba(99, 115, 129, 1)" } as React.CSSProperties}>
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                          <path d={svgPathsChat.p1f98d180} fill="var(--fill-0, #637381)" id="primary-shape" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 輸入欄位 */}
                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none"
                />
                {/* 發送按鈕 */}
                <div className="flex items-center justify-center rounded-full shrink-0 size-[36px] cursor-pointer hover:bg-[#f4f6f8] transition-colors">
                  <div className="overflow-clip relative shrink-0 size-[20px]">
                    <div className="absolute inset-[8.33%]">
                      <div className="absolute inset-0" style={{ "--fill-0": "rgba(99, 115, 129, 1)" } as React.CSSProperties}>
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6675">
                          <g id="primary-shape">
                            <path d={svgPathsChat.p1e3ed0f0} fill="var(--fill-0, #637381)" />
                            <path clipRule="evenodd" d={svgPathsChat.p1123f980} fill="var(--fill-0, #637381)" fillRule="evenodd" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 空白狀態 */
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center gap-[8px]">
            <IconsEmptyIcChatActive className="relative shrink-0 size-[120px]" />
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[28px] text-[#919eab] text-[18px]">You have raised the bar!</p>
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] text-[#919eab] text-[14px]">Write something awesome...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPageNew({ currentPage, onPageChange, initialChatId, onLogout, userRole }: ChatPageNewProps) {
  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="Chat"
      breadcrumb=""
    >
      {/* 用明確高度容器包裹，確保 ChatArea 在 flex 內容區能正確填滿 */}
      <div className="h-[calc(100vh-124px)] min-h-[500px]">
        <ChatArea initialChatId={initialChatId} />
      </div>
    </ResponsivePageLayout>
  );
}
