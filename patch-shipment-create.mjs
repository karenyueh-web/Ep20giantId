import { readFileSync, writeFileSync } from 'fs';

const file = './src/app/components/ShipmentCreatePage.tsx';
let src = readFileSync(file, 'utf-8');

// ── 1. 移除 BlockedOrder type + state ─────────────────────────────────
src = src.replace(
  `\n  // 出貨資格預檢：廠商日期未到的錯誤 Modal\n  type BlockedOrder = { docSeqNo: string; materialNo: string; vendorDate: string; earliestDate: string };\n  const [shipmentBlockedOrders, setShipmentBlockedOrders] = useState<BlockedOrder[]>([]);\n`,
  '\n'
);

// ── 2. 在 isEligible 加入最早可開立日條件 ─────────────────────────────
const oldEligible = `    const isEligible = (o: OrderRow) =>
      o.status === 'CK' &&
      !blockedByCorrection.has(o.id) &&
      calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0) > 0;`;

const newEligible = `    // 最早可開立日 = 廠商可交貨日期 − 7 天；今日需 >= 最早可開立日才可出貨
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parseVDate = (s: string) => {
      const [y, m, d] = s.replace(/\\//g, '-').split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const canShipToday = (o: OrderRow) => {
      if (!o.vendorDeliveryDate) return true; // 無廠商答交日 → 不限制
      const earliest = parseVDate(o.vendorDeliveryDate);
      earliest.setDate(earliest.getDate() - 7);
      return today >= earliest;
    };

    const isEligible = (o: OrderRow) =>
      o.status === 'CK' &&
      !blockedByCorrection.has(o.id) &&
      calcUndeliveredQty(o.orderQty ?? 0, o.acceptQty ?? 0, o.inTransitQty ?? 0) > 0 &&
      canShipToday(o);`;

if (!src.includes(oldEligible)) { console.error('isEligible target not found'); process.exit(1); }
src = src.replace(oldEligible, newEligible);

// ── 3. 還原 handleCreateShipment 為簡單版（移除日期預檢邏輯）────────────
const oldFn = `  const handleCreateShipment = () => {
    const selected = filteredOrders.filter(o => selectedOrderIds.has(o.id));
    if (selected.length === 0) {
      showToast('請先勾選要出貨的訂單');
      return;
    }

    // ── 出貨資格預檢：今日 >= 廠商可交貨日 − 7 天 ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseVDate = (s: string) => {
      const [y, m, d] = s.replace(/\\//g, '-').split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const fmtDate = (dt: Date) =>
      \`\${dt.getFullYear()}/\${String(dt.getMonth() + 1).padStart(2, '0')}/\${String(dt.getDate()).padStart(2, '0')}\`;

    const blocked: BlockedOrder[] = [];
    selected.forEach(o => {
      if (!o.vendorDeliveryDate) return;
      const vendorDate = parseVDate(o.vendorDeliveryDate);
      const earliest = new Date(vendorDate);
      earliest.setDate(earliest.getDate() - 7);
      if (today < earliest) {
        blocked.push({
          docSeqNo:     o.docSeqNo || \`\${o.orderNo}-\${o.orderSeq}\`,
          materialNo:   o.materialNo || '',
          vendorDate:   o.vendorDeliveryDate,
          earliestDate: fmtDate(earliest),
        });
      }
    });

    if (blocked.length > 0) {
      setShipmentBlockedOrders(blocked);
      return;
    }

    setDetailOrders(selected);
    setShowDetail(true);
  };`;

const newFn = `  const handleCreateShipment = () => {
    const selected = filteredOrders.filter(o => selectedOrderIds.has(o.id));
    if (selected.length === 0) {
      showToast('請先勾選要出貨的訂單');
      return;
    }
    setDetailOrders(selected);
    setShowDetail(true);
  };`;

if (!src.includes(oldFn)) { console.error('handleCreateShipment target not found'); process.exit(1); }
src = src.replace(oldFn, newFn);

// ── 4. 移除錯誤 Modal JSX ─────────────────────────────────────────────
const oldModal = `      {/* ── 出貨資格錯誤 Modal ─────────────────────────────────────────── */}
      {shipmentBlockedOrders.length > 0 && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(28,37,46,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="bg-white rounded-[16px] shadow-[0px_24px_48px_rgba(0,0,0,0.24)] overflow-hidden"
            style={{ width: 'min(92vw,580px)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="flex items-start gap-[12px] px-[24px] py-[20px] border-b border-[rgba(145,158,171,0.16)] shrink-0">
              <div className="w-[40px] h-[40px] rounded-full bg-[rgba(255,86,48,0.08)] flex items-center justify-center shrink-0 mt-[2px]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="#ff5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#1c252e] leading-[24px]">
                  以下訂單尚未達到可出貨條件
                </h2>
                <p className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#637381] mt-[4px]">
                  出貨日期不能早於「廠商可交貨日」前 7 天，請重新選擇訂單。
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-[24px] py-[16px]">
              <div className="grid mb-[4px]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {['單號序號', '料號', '最早可開立日'].map(h => (
                  <span key={h} className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#919eab] uppercase tracking-wide py-[4px]">{h}</span>
                ))}
              </div>
              {shipmentBlockedOrders.map((o, i) => (
                <div key={i} className="grid border-t border-[rgba(145,158,171,0.12)] py-[10px]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#005eb8]">{o.docSeqNo}</span>
                  <span className="font-['Public_Sans:Regular',sans-serif] text-[13px] text-[#1c252e]">{o.materialNo || '—'}</span>
                  <div className="flex flex-col">
                    <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[13px] text-[#ff5630]">{o.earliestDate}</span>
                    <span className="font-['Public_Sans:Regular',sans-serif] text-[11px] text-[#919eab]">廠商答交 {o.vendorDate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex justify-end px-[24px] py-[16px] border-t border-[rgba(145,158,171,0.16)]">
              <button
                onClick={() => setShipmentBlockedOrders([])}
                className="h-[36px] px-[28px] bg-[#1c252e] hover:bg-[#374151] text-white rounded-[8px] font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] transition-colors"
              >
                重新選擇
              </button>
            </div>
          </div>
        </div>
      )}

      `;

if (!src.includes(oldModal)) { console.error('modal target not found'); process.exit(1); }
src = src.replace(oldModal, '      ');

writeFileSync(file, src, 'utf-8');
console.log('✅ Done: eligibility date check added to isEligible, modal removed');
