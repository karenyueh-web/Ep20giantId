/**
 * ActionButtons — 共用操作按鈕元件
 *
 * 設計規範：
 *  - EditButton  : 藍色鉛筆圖示 (#1890FF)，透明背景，hover 淡藍圓圈
 *  - DeleteButton: 紅色垃圾桶圖示 (#FF5630)，透明背景，hover 淡紅圓圈（svgPaths 規範）
 *  - ActionCellButtons: 組合 Edit + Delete，為表格操作欄標準用法
 *
 * 使用範例：
 *   import { ActionCellButtons } from './ActionButtons';
 *   <ActionCellButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteTarget(row)} />
 */

import svgPaths from '../../imports/svg-aomtl6pp5x';

// ─────────────────────────────────────────────────────────────────────────────
// 編輯按鈕（藍色鉛筆，透明背景）
// ─────────────────────────────────────────────────────────────────────────────

interface EditButtonProps {
  onClick: () => void;
  title?: string;
}

export function EditButton({ onClick, title = '編輯' }: EditButtonProps) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center shrink-0 size-[42px] rounded-full hover:bg-[rgba(24,144,255,0.08)] transition-colors"
      title={title}
    >
      {/* Material Design Edit icon — 藍色鉛筆 #1890FF */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          fill="#1890FF"
        />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 刪除按鈕（紅色垃圾桶，與修正單一致，svgPaths 規範）
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteButtonProps {
  onClick: () => void;
  title?: string;
}

export function DeleteButton({ onClick, title = '刪除' }: DeleteButtonProps) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center shrink-0 size-[42px] rounded-full hover:bg-[rgba(255,86,48,0.08)] transition-colors"
      title={title}
    >
      {/* 垃圾桶圖示來自 svg-aomtl6pp5x（p309dd480 = 頂蓋，p2846fa00 = 桶身），紅色 #FF5630 */}
      <svg width="22" height="26" viewBox="0 0 18 20" fill="none">
        <path d={svgPaths.p309dd480} fill="#FF5630" />
        <path clipRule="evenodd" d={svgPaths.p2846fa00} fill="#FF5630" fillRule="evenodd" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 組合：表格操作欄標準配置（Edit + Delete）
// ─────────────────────────────────────────────────────────────────────────────

interface ActionCellButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionCellButtons({ onEdit, onDelete }: ActionCellButtonsProps) {
  return (
    <div className="flex items-center gap-[4px]">
      <EditButton onClick={onEdit} />
      <DeleteButton onClick={onDelete} />
    </div>
  );
}
