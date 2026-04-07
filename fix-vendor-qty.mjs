import fs from 'fs';
const file = 'src/app/components/CorrectionDetailPage.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Add purchaserAdjustedTotal after totalNewQty
c = c.replace(
  `const totalNewQty = useMemo(() => form.deliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0), [form.deliveryRows]);\r\n  const isDeleteOrder`,
  `const totalNewQty = useMemo(() => form.deliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0), [form.deliveryRows]);\r\n  // 採購設定的新交貨量合計（V 狀態 form 唯讀，totalNewQty 即為採購目標）\r\n  const purchaserAdjustedTotal = totalNewQty;\r\n  const isDeleteOrder`
);

// 2. Period input: add split+V check
c = c.replace(
  `if (disagreeType !== 'adjustSchedule') return;\r\n                            setDisagreeAdjustPeriod`,
  `if (disagreeType !== 'adjustSchedule') return;\r\n                            if (isSplitMode && effectiveStatusCode === 'V') return; // 拆單V狀態：廠商不可改期數\r\n                            setDisagreeAdjustPeriod`
);

// 3. Period input: disable for split+V (first occurrence only - period input, not reason input)
// Target the specific disabled attribute right before placeholder="請輸入期數"
c = c.replace(
  `disabled={disagreeType !== 'adjustSchedule'}\r\n                          placeholder="請輸入期數"`,
  `disabled={disagreeType !== 'adjustSchedule' || (isSplitMode && effectiveStatusCode === 'V')}\r\n                          placeholder="請輸入期數"`
);

// 4. Hide trash for split+V
c = c.replace(
  `{(isSplitMode ? idx >= 2 : (idx !== 0 && !isDeleted)) && (`,
  `{(isSplitMode ? (effectiveStatusCode !== 'V' && idx >= 2) : (idx !== 0 && !isDeleted)) && (`
);

// 5. Replace display validation variables (18-space indent version)
c = c.replace(
  `                  const dTotalNewQty = disagreeDeliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);\r\n                  const dMinRequired = (order.acceptQty ?? 0) + (order.inTransitQty ?? 0);\r\n                  const dBelowMin = dMinRequired > 0 && dTotalNewQty < dMinRequired;\r\n                  const dAboveMax = dTotalNewQty > (order.orderQty ?? 0);`,
  `                  const dTotalNewQty = disagreeDeliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);\r\n                  const dNotMatchPurchaser = dTotalNewQty !== purchaserAdjustedTotal;`
);

// 6. Replace display validation JSX - replace dMinRequired/dBelowMin/dAboveMax blocks with dNotMatchPurchaser
c = c.replace(
  /\{dMinRequired > 0 && \(\r\n.*?<\/div>\r\n\s*\)\}\r\n\s*\{dHasZeroQty && dMinRequired === 0 && \(\r\n.*?<\/div>\r\n\s*\)\}\r\n\s*\{dAboveMax && \(\r\n.*?<\/div>\r\n\s*\)\}/s,
  `<div className={\`px-[45px] py-[9px] border-t border-[rgba(145,158,171,0.1)] flex items-center gap-[16px] flex-wrap \${dNotMatchPurchaser || dHasZeroQty ? 'bg-[rgba(255,86,48,0.04)]' : 'bg-[rgba(145,158,171,0.03)]'}\`}>\r\n                          <p className="font-['Public_Sans:Regular',sans-serif] font-normal text-[12px] text-[#637381] leading-[18px] shrink-0">\r\n                            新交貨量合計：\r\n                            <strong className={dNotMatchPurchaser ? 'text-[#ff5630]' : 'text-[#118d57]'}>{dTotalNewQty}</strong>\r\n                            　｜　採購設定目標量：<strong>{purchaserAdjustedTotal}</strong>\r\n                          </p>\r\n                          {dNotMatchPurchaser && (\r\n                            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">\r\n                              ⚠ 新交貨量合計須等於採購設定目標量（{purchaserAdjustedTotal}），提交已鎖定\r\n                            </p>\r\n                          )}\r\n                          {dHasZeroQty && (\r\n                            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#ff5630] leading-[18px] shrink-0">\r\n                              ⚠ 新交貨量不可填 0，如需刪除請使用刪單功能\r\n                            </p>\r\n                          )}\r\n                        </div>`
);

// 7. Replace canSubmit validation variables (16-space indent version)
c = c.replace(
  `                const dTotalNewQty = disagreeDeliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);\r\n                const dMinRequired = (order.acceptQty ?? 0) + (order.inTransitQty ?? 0);\r\n                const dBelowMin = dMinRequired > 0 && dTotalNewQty < dMinRequired;\r\n                const dSplitTooFew = isSplitMode && disagreeDeliveryRows.filter(r => !r.deleted).length < 2;\r\n                const dAboveMax = dTotalNewQty > (order.orderQty ?? 0);`,
  `                const dTotalNewQty = disagreeDeliveryRows.filter(r => !r.deleted).reduce((s, r) => s + (parseFloat(r.newQty) || 0), 0);\r\n                const dNotMatchPurchaser = dTotalNewQty !== purchaserAdjustedTotal;\r\n                const dSplitTooFew = isSplitMode && disagreeDeliveryRows.filter(r => !r.deleted).length < 2;`
);

// 8. Replace canSubmit condition
c = c.replace(
  `&& !dBelowMin && !dAboveMax && !dHasZeroQty && !dHasPastDate && !dSplitTooFew;`,
  `&& !dNotMatchPurchaser && !dHasZeroQty && !dHasPastDate && !dSplitTooFew;`
);

// 9. History log: add purchaserAdjustedTotal info
c = c.replace(
  `reason = parts.join('；');\r\n                          }\r\n                          setShowDisagreeForm(false);`,
  `reason = parts.length > 0 ? \`[採購目標量：\${purchaserAdjustedTotal}] \` + parts.join('；') : '';\r\n                          }\r\n                          setShowDisagreeForm(false);`
);

fs.writeFileSync(file, c, 'utf8');
console.log('All replacements done.');

// Verify key changes exist
const verify = fs.readFileSync(file, 'utf8');
const checks = [
  'purchaserAdjustedTotal',
  'dNotMatchPurchaser',
  "effectiveStatusCode !== 'V' && idx >= 2",
  "isSplitMode && effectiveStatusCode === 'V') return;",
  "採購設定目標量",
];
checks.forEach(k => {
  const found = verify.includes(k);
  console.log(`  ${found ? '✅' : '❌'} ${k}`);
});
