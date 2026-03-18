import svgPaths from "@/imports/svg-cj340dtu48";
import svgPathsChat from "@/imports/svg-huvuhonro6";
import { useState, useRef, useEffect } from "react";
import React from "react";

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  messages: Message[];
}

interface ChatOverlayProps {
  chatConversation: ChatConversation;
  onClose: () => void;
}

export function ChatOverlay({ chatConversation, onClose }: ChatOverlayProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滾動到最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatConversation.messages]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} onClick={onClose}>
      <div className="relative bg-white rounded-[16px] shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] w-[1200px] h-[690px] max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* 返回按鈕 */}
        <div className="absolute left-[45px] top-[21px] cursor-pointer hover:opacity-70" onClick={onClose}>
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path clipRule="evenodd" d={svgPaths.p1310fb97} fill="#1D7BF5" fillRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* 標題區 - 顯示人員資訊 */}
        <div className="absolute left-[45px] top-[66.39px] flex items-center gap-[12px]">
          {/* 頭像 */}
          <div className="relative size-[40px] rounded-[500px]">
            <div className="absolute inset-0 rounded-[500px]" style={{ backgroundColor: chatConversation.avatarBg }} />
            <img alt="" className="absolute inset-0 object-cover rounded-[500px] size-full" src={chatConversation.avatar} />
            {/* 在線狀態 */}
            <div className="absolute bg-[#22c55e] bottom-[0px] right-[0px] rounded-[500px] size-[10px]">
              <div className="absolute border border-solid border-white inset-[-1px] rounded-[501px]" />
            </div>
          </div>
          {/* 名稱 */}
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[28px] text-[#1c252e] text-[18px]">
            {chatConversation.name}
          </p>
        </div>

        {/* 聊天內容區域 */}
        <div className="absolute left-[45px] top-[125px] w-[1110px] h-[520px] bg-[#f4f6f8] rounded-[8px] flex flex-col">
          {/* 訊息列表 - 可滾動 */}
          <div className="flex-1 overflow-y-auto px-[30px] py-[20px] flex flex-col gap-[16px]">
            {chatConversation.messages.map((message) => (
              <div key={message.id} className={`flex gap-[12px] ${message.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 對方訊息顯示頭像 */}
                {message.sender === 'them' && (
                  <div className="size-[40px] rounded-full overflow-hidden shrink-0 relative">
                    <div className="absolute inset-0 rounded-[500px]" style={{ backgroundColor: chatConversation.avatarBg }} />
                    <img alt="" className="absolute inset-0 object-cover rounded-[500px] size-full" src={chatConversation.avatar} />
                  </div>
                )}
                
                {/* 訊息內容 */}
                <div className={`flex flex-col gap-[4px] max-w-[500px] ${message.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-[16px] py-[10px] rounded-[12px] ${
                    message.sender === 'me' 
                      ? 'bg-[#e3f2fd] text-[#1c252e]' 
                      : 'bg-white border border-[rgba(145,158,171,0.2)] text-[#1c252e]'
                  }`}>
                    <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] leading-[20px]">{message.text}</p>
                  </div>
                  <p className="font-['Public_Sans:Regular',sans-serif] text-[12px] text-[#919eab]">{message.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 輸入框區域 */}
          <div className="h-[102px] border-t border-[rgba(145,158,171,0.2)] flex items-center px-[30px]">
            <div className="flex items-center gap-[12px] w-full">
              {/* 附件按鈕 */}
              <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] cursor-pointer hover:bg-[#dfe3e8] transition-colors">
                <div className="overflow-clip relative shrink-0 size-[20px]">
                  <div className="absolute inset-[8.33%]">
                    <div className="absolute inset-0" style={{ "--fill-0": "rgba(99, 115, 129, 1)" } as React.CSSProperties}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
                        <path d={svgPathsChat.p1f98d180} fill="var(--fill-0, #637381)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 輸入框 */}
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message"
                className="flex-1 font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] placeholder:text-[#919eab] outline-none bg-transparent"
              />
              
              {/* 發送按鈕 */}
              <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[36px] cursor-pointer hover:bg-[#dfe3e8] transition-colors">
                <div className="overflow-clip relative shrink-0 size-[20px]">
                  <div className="absolute inset-[8.33%]">
                    <div className="absolute inset-0" style={{ "--fill-0": "rgba(99, 115, 129, 1)" } as React.CSSProperties}>
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6675">
                        <g>
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
      </div>
    </div>
  );
}