import { ReactNode } from 'react';

interface BaseOverlayProps {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
  maxHeight?: string;
}

/**
 * 通用 Overlay 組件
 * 提供統一的半透明背景遮罩和白色卡片容器
 * 
 * @param children - overlay 內容
 * @param onClose - 關閉 overlay 的回調函數
 * @param maxWidth - 卡片最大寬度，默認 1000px
 * @param maxHeight - 卡片最大高度，默認 760px
 */
export function BaseOverlay({ 
  children, 
  onClose, 
  maxWidth = '1000px',
  maxHeight = '760px'
}: BaseOverlayProps) {
  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div 
        className="bg-white h-full w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth, maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}