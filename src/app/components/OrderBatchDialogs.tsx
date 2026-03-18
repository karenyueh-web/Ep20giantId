import { useState } from 'react';
import { X, CheckCircle, XCircle, CalendarDays, MessageSquarePlus } from 'lucide-react';
import type { OrderRow } from './AdvancedOrderTable';

// ===== Shared overlay wrapper =====
function DialogOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(145,158,171,0.4)] flex items-center justify-center p-[20px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-[16px] shadow-[-40px_40px_80px_0px_rgba(145,158,171,0.24)] flex flex-col overflow-hidden"
        style={{ maxWidth: '600px', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ===== Shared order list preview =====
function OrderPreviewList({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-[rgba(145,158,171,0.16)] rounded-[8px]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f4f6f8]">
            <th className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">訂單號碼</th>
            <th className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">序號</th>
            <th className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">廠商名稱</th>
            <th className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">料號</th>
            <th className="px-[12px] py-[8px] text-left font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#637381]">預計交期</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-[rgba(145,158,171,0.08)]">
              <td className="px-[12px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{order.orderNo}</td>
              <td className="px-[12px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{order.orderSeq}</td>
              <td className="px-[12px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] truncate max-w-[160px]">{order.vendorName}</td>
              <td className="px-[12px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e] truncate max-w-[140px]">{order.materialNo}</td>
              <td className="px-[12px] py-[8px] font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{order.expectedDelivery}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== 1. Batch Approve Dialog =====
interface BatchApproveDialogProps {
  orders: OrderRow[];
  onConfirm: () => void;
  onClose: () => void;
}

export function BatchApproveDialog({ orders, onConfirm, onClose }: BatchApproveDialogProps) {
  return (
    <DialogOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
        <div className="flex items-center gap-[10px]">
          <CheckCircle size={22} className="text-[#22c55e]" />
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
            批次同意確認
          </p>
        </div>
        <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
          <X size={20} className="text-[#637381]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
          確定要同意以下 <span className="font-semibold text-[#1c252e]">{orders.length}</span> 筆訂單嗎？此操作將把訂單狀態變更為已確認。
        </p>
        <OrderPreviewList orders={orders} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
        <button
          className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
          onClick={onClose}
        >
          取消
        </button>
        <button
          className="h-[36px] px-[16px] rounded-[8px] bg-[#22c55e] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#16a34a]"
          onClick={onConfirm}
        >
          確定同意 ({orders.length})
        </button>
      </div>
    </DialogOverlay>
  );
}

// ===== 2. Batch Reject Dialog =====
interface BatchRejectDialogProps {
  orders: OrderRow[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function BatchRejectDialog({ orders, onConfirm, onClose }: BatchRejectDialogProps) {
  const [reason, setReason] = useState('');

  return (
    <DialogOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
        <div className="flex items-center gap-[10px]">
          <XCircle size={22} className="text-[#ff5630]" />
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
            批次不同意
          </p>
        </div>
        <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
          <X size={20} className="text-[#637381]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
          確定要不同意以下 <span className="font-semibold text-[#1c252e]">{orders.length}</span> 筆訂單嗎？
        </p>
        <OrderPreviewList orders={orders} />
        <div className="flex flex-col gap-[8px] shrink-0">
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381]">
            不同意原因 <span className="text-[#ff5630]">*</span>
          </p>
          <textarea
            className="w-full h-[80px] px-[14px] py-[10px] border border-[rgba(145,158,171,0.32)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] resize-none focus:outline-none focus:border-[#005eb8]"
            placeholder="請輸入不同意的原因..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
        <button
          className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
          onClick={onClose}
        >
          取消
        </button>
        <button
          className="h-[36px] px-[16px] rounded-[8px] bg-[#ff5630] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#e0401d] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onConfirm(reason)}
          disabled={!reason.trim()}
        >
          確定不同意 ({orders.length})
        </button>
      </div>
    </DialogOverlay>
  );
}

// ===== 3. Batch Modify Date Dialog =====
interface BatchModifyDateDialogProps {
  orders: OrderRow[];
  onConfirm: (newDate: string) => void;
  onClose: () => void;
}

export function BatchModifyDateDialog({ orders, onConfirm, onClose }: BatchModifyDateDialogProps) {
  const [newDate, setNewDate] = useState('');

  return (
    <DialogOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
        <div className="flex items-center gap-[10px]">
          <CalendarDays size={22} className="text-[#005eb8]" />
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
            批次修改交期
          </p>
        </div>
        <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
          <X size={20} className="text-[#637381]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
          將以下 <span className="font-semibold text-[#1c252e]">{orders.length}</span> 筆訂單的預計交期統一修改為新日期。
        </p>
        <div className="flex flex-col gap-[8px] shrink-0">
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381]">
            新預計交期 <span className="text-[#ff5630]">*</span>
          </p>
          <input
            type="date"
            className="w-full h-[40px] px-[14px] border border-[rgba(145,158,171,0.32)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] focus:outline-none focus:border-[#005eb8]"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <OrderPreviewList orders={orders} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
        <button
          className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
          onClick={onClose}
        >
          取消
        </button>
        <button
          className="h-[36px] px-[16px] rounded-[8px] bg-[#005eb8] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#004a94] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onConfirm(newDate)}
          disabled={!newDate}
        >
          確定修改 ({orders.length})
        </button>
      </div>
    </DialogOverlay>
  );
}

// ===== 4. Batch Add Remarks Dialog =====
interface BatchAddRemarksDialogProps {
  orders: OrderRow[];
  onConfirm: (remarks: string) => void;
  onClose: () => void;
}

export function BatchAddRemarksDialog({ orders, onConfirm, onClose }: BatchAddRemarksDialogProps) {
  const [remarks, setRemarks] = useState('');

  return (
    <DialogOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[rgba(145,158,171,0.12)] shrink-0">
        <div className="flex items-center gap-[10px]">
          <MessageSquarePlus size={22} className="text-[#8e33ff]" />
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[18px] text-[#1c252e]">
            批次加備註
          </p>
        </div>
        <div className="cursor-pointer hover:bg-[rgba(145,158,171,0.08)] rounded-full p-[4px]" onClick={onClose}>
          <X size={20} className="text-[#637381]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[16px] px-[24px] py-[20px] flex-1 min-h-0">
        <p className="font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#637381]">
          為以下 <span className="font-semibold text-[#1c252e]">{orders.length}</span> 筆訂單統一新增備註。
        </p>
        <div className="flex flex-col gap-[8px] shrink-0">
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#637381]">
            備註內容 <span className="text-[#ff5630]">*</span>
          </p>
          <textarea
            className="w-full h-[80px] px-[14px] py-[10px] border border-[rgba(145,158,171,0.32)] rounded-[8px] font-['Public_Sans:Regular',sans-serif] text-[14px] text-[#1c252e] resize-none focus:outline-none focus:border-[#005eb8]"
            placeholder="請輸入備註內容..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        <OrderPreviewList orders={orders} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.12)] shrink-0">
        <button
          className="h-[36px] px-[16px] rounded-[8px] border border-[rgba(145,158,171,0.32)] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
          onClick={onClose}
        >
          取消
        </button>
        <button
          className="h-[36px] px-[16px] rounded-[8px] bg-[#8e33ff] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-white hover:bg-[#7928ca] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onConfirm(remarks)}
          disabled={!remarks.trim()}
        >
          確定新增 ({orders.length})
        </button>
      </div>
    </DialogOverlay>
  );
}
