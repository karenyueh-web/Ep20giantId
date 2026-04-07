import fs from 'fs';

// === Fix 1: CorrectionDetailPage.tsx ===
const f1 = 'src/app/components/CorrectionDetailPage.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

// 1a. 提交廠商確認時的備註加入採購目標量
c1 = c1.replace(
  `recordHistory(order.id, '修正單提交廠商確認', buildChangeSummary());`,
  `recordHistory(order.id, '修正單提交廠商確認', \`[採購目標量：\${totalNewQty}] \` + buildChangeSummary());`
);

// 1b. 刪單提交也加上
c1 = c1.replace(
  `recordHistory(order.id, '修正單提交廠商-執行刪單', buildChangeSummary());`,
  `recordHistory(order.id, '修正單提交廠商-執行刪單', \`[採購目標量：\${totalNewQty}] \` + buildChangeSummary());`
);

// 1c. 移除 disagree reason 裡的 [採購目標量] 前綴（還原為原本的 parts.join）
c1 = c1.replace(
  "reason = parts.length > 0 ? `[採購目標量：${purchaserAdjustedTotal}] ` + parts.join('；') : '';",
  "reason = parts.join('；');"
);

fs.writeFileSync(f1, c1, 'utf8');
console.log('CorrectionDetailPage.tsx updated');

// === Fix 2: CorrectionListWithTabs.tsx ===
const f2 = 'src/app/components/CorrectionListWithTabs.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

// 2a. 移除 "— 狀態 V → B"
c2 = c2.replace(
  "event: `廠商調整修正單 — 狀態 ${row.correctionStatus} → ${newStatus}`,",
  "event: '廠商調整修正單',"
);

fs.writeFileSync(f2, c2, 'utf8');
console.log('CorrectionListWithTabs.tsx updated');

// Verify
const v1 = fs.readFileSync(f1, 'utf8');
const v2 = fs.readFileSync(f2, 'utf8');
console.log('  ' + (v1.includes("[採購目標量：${totalNewQty}]") ? '✅' : '❌') + ' 提交廠商確認備註含採購目標量');
console.log('  ' + (!v1.includes("[採購目標量：${purchaserAdjustedTotal}]") ? '✅' : '❌') + ' disagree reason 已移除採購目標量');
console.log('  ' + (v2.includes("event: '廠商調整修正單',") ? '✅' : '❌') + ' 事項已移除狀態轉換');
console.log('  ' + (!v2.includes('— 狀態 ${row.correctionStatus}') ? '✅' : '❌') + ' 確認無殘留狀態轉換文字');
