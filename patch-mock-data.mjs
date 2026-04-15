import { readFileSync, writeFileSync } from 'fs';

const file = './src/app/components/AdvancedOrderTable.tsx';
let src = readFileSync(file, 'utf-8');

// ── 修復1：把 id:23 那筆壞掉的 internalNote 行修好 ─────────────
const badLine = `    internalNote: '', materialP  // ── CK 出貨測試資料（日期卡控驗證，基準日 = 2026/04/15）─────────────────`;
const goodLine = `    internalNote: '', materialPOContent: '',\n    gbdOrderNo: 'GBD-2025-002108', statisticalDeliveryDate: '2025/04/18',\n  },\n  // ── CK 出貨測試資料（日期卡控驗證，基準日 = 2026/04/15）─────────────────`;

if (!src.includes(badLine)) { console.error('badLine not found'); process.exit(1); }
src = src.replace(badLine, goodLine);

// ── 修復2：移除那行殘留的垃圾 "}, DISC WHEELSYSTEM FRONT 12X100'" ─
const garbageLine = `  }, DISC WHEELSYSTEM FRONT 12X100',\n    expectedDelivery: '2026/05/15', deliveryQty: 150,\n    inTransitQty: 20, undeliveredQty: 130, lineItemNote: '1470000', agreedDate: '2026/04/25',\n    internalNote: '', materialPOContent: 'HIGH VALUE',\n    gbdOrderNo: 'GBD-2026-003002', statisticalDeliveryDate: '2026/05/15', storageLocationCode: '2110',\n  },\n  {\n    id: 29, status: 'CK', vendorDeliveryDate: '2026/05/20',\n    orderNo: '400651003', orderDate: '2026/04/05', orderType: 'Z2QB',\n    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '30', docSeqNo: '400651003030',\n    purchaser: '陳俊宏', orderQty: 300, acceptQty: 100, comparePrice: '48', unit: 'PCS', currency: 'TWD',\n    leadtime: 7, vendorCode: '00010059', vendorName: '金盛元工業(00010059)',\n    materialNo: '8801-TIR0203-P03', customerBrand: 'G03', vendorMaterialNo: 'GAVIA-CRS2-700X28C',\n    productName: '公路車外胎', specification: 'GAVIA COURSE 2 700X28C TUBELESS READY BLACK',\n    expectedDelivery: '2026/05/20', deliveryQty: 300,\n    inTransitQty: 0, undeliveredQty: 200, lineItemNote: '9600', agreedDate: '2026/04/28',\n    internalNote: '', materialPOContent: '',\n    gbdOrderNo: 'GBD-2026-003003', statisticalDeliveryDate: '2026/05/20', storageLocationCode: '2020',\n  },\n  {\n    id: 30, status: 'CK', vendorDeliveryDate: '2026/05/25',\n    orderNo: '400651004', orderDate: '2026/04/07', orderType: 'Z2QB',\n    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '40', docSeqNo: '400651004040',\n    purchaser: '吳佳慧', orderQty: 80, acceptQty: 30, comparePrice: '6500', unit: 'PCS', currency: 'TWD',\n    leadtime: 10, vendorCode: '00010053', vendorName: '久廣精密(00010053)',\n    materialNo: '8801-SFT0204-P04', customerBrand: 'G04', vendorMaterialNo: 'ST-R9270-DA-DI2-L',\n    productName: '電子變速把手(左)', specification: 'SHIMANO ST-R9270 DURA-ACE DI2 STI LEVER LEFT',\n    expectedDelivery: '2026/05/25', deliveryQty: 80,\n    inTransitQty: 10, undeliveredQty: 40, lineItemNote: '260000', agreedDate: '2026/05/02',\n    internalNote: '電子組件，注意靜電', materialPOContent: 'HANDLE WITH CARE',\n    gbdOrderNo: 'GBD-2026-003004', statisticalDeliveryDate: '2026/05/25', storageLocationCode: '2130',\n  },\n  {\n    id: 31, status: 'CK', vendorDeliveryDate: '2026/06/01',\n    orderNo: '400651005', orderDate: '2026/04/10', orderType: 'Z2HB',\n    company: '巨大機械', purchaseOrg: '台灣廠生產採購組織', orderSeq: '50', docSeqNo: '400651005050',\n    purchaser: '張建國', orderQty: 500, acceptQty: 200, comparePrice: '28', unit: 'PCS', currency: 'TWD',\n    leadtime: 5, vendorCode: '00010012', vendorName: '台灣製造(00010012)',\n    materialNo: '1101-PED0205-P05', customerBrand: 'G05', vendorMaterialNo: 'PLAT-PED-AL-BODY',\n    productName: '鋁合金踏板', specification: 'PLATFORM PEDAL ALUMINUM ALLOY BODY CR-MO AXLE 9/16"',\n    expectedDelivery: '2026/06/01', deliveryQty: 500,\n    inTransitQty: 50, undeliveredQty: 250, lineItemNote: '7000', agreedDate: '2026/05/10',\n    internalNote: '', materialPOContent: 'CONTRACT ORDER',\n    gbdOrderNo: 'GBD-2026-003005', statisticalDeliveryDate: '2026/06/01', storageLocationCode: '2320',\n  },\n];`;

if (!src.includes(garbageLine)) { console.error('garbageLine not found'); process.exit(1); }
src = src.replace(garbageLine, `];\n`);

writeFileSync(file, src, 'utf-8');
console.log('✅ AdvancedOrderTable.tsx mock data fixed');

// 簡單驗證
const ids = [...src.matchAll(/id: (\d+), status: 'CK'/g)].map(m => m[1]);
console.log('CK order ids now:', ids.join(', '));
