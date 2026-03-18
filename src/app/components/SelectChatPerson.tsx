import imgImgAvatar1 from "figma:asset/d7c38e4c2ec5583f5bcb8f33bbcadbadf4ceed61.png";
import imgImgAvatar2 from "figma:asset/ba1f925e57c8f297bb26a2475302e1c715c37494.png";
import imgImgAvatar25 from "figma:asset/32f05a467d0a075d730fcf6e4e2e9902b921e1ea.png";
import { useRef, useEffect } from "react";

interface SelectChatPersonProps {
  onSelect: (personName: string) => void;
  onClose: () => void;
  position: { top: number; right: number };
}

// Chat頁面的人員資料
const chatPersons = [
  {
    id: '1',
    name: '巨大-ann',
    avatar: imgImgAvatar1,
    avatarBg: '#ffdbde',
  },
  {
    id: '2',
    name: '巨大-OOO',
    avatar: imgImgAvatar2,
    avatarBg: '#f6d3bd',
  },
  {
    id: '3',
    name: '巨大-OOO',
    avatar: imgImgAvatar25,
    avatarBg: '#fff2b9',
  }
];

export function SelectChatPerson({ onSelect, onClose, position }: SelectChatPersonProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={popupRef}
      className="fixed z-50 w-[284px] rounded-[6px]" 
      style={{ 
        top: `${position.top}px`, 
        right: `${position.right}px`,
        backgroundImage: "linear-gradient(252.184deg, rgb(233, 247, 250) 3.2822%, rgb(249, 236, 252) 96.894%)",
        height: `${80 * chatPersons.length + 14}px` // 動態高度：80px * 人數 + padding
      }}
    >
      <div className="absolute left-[7px] top-[7px] w-[269px] flex flex-col gap-0">
        {chatPersons.map((person, index) => (
          <div 
            key={person.id}
            className="h-[80px] rounded-[12px] w-full cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => onSelect(person.name)}
            style={{ marginTop: index === 0 ? 0 : '0px' }}
          >
            <div className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[3px_1px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
            <div className="flex items-center h-full px-[20px] py-[12px] gap-[16px]">
              {/* 頭像 */}
              <div className="relative size-[48px] rounded-[500px]">
                <div className="absolute inset-0 rounded-[500px]" style={{ backgroundColor: person.avatarBg }} />
                <img alt="" className="absolute inset-0 object-cover rounded-[500px] size-full" src={person.avatar} />
                {/* 在線狀態 */}
                <div className="absolute bg-[#22c55e] bottom-[2px] right-[2px] rounded-[500px] size-[10px]">
                  <div className="absolute border border-solid border-white inset-[-1px] rounded-[501px]" />
                </div>
              </div>
              {/* 名稱 */}
              <p className="flex-1 font-['Public_Sans:SemiBold','Noto_Sans_JP:Regular',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[14px]">
                <span className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal">{person.name.split('-')[0]}</span>-{person.name.split('-')[1]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}