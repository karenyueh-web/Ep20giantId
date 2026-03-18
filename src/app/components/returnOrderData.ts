import type { OrderRow } from './AdvancedOrderTable';

// ── 換貨單 Mock Data（Z1JB / Z1JD）────────────────────────────────────────────
export const returnOrderMockData: OrderRow[] = [
  // ── Z1JB（退貨一般品）────────────────────────────────────────────────────
  {
    id: 1001, status: 'NP', vendorName: '速聯國際(00010046)', orderDate: '2025/04/12', expectedDelivery: '2026/03/02',
    orderNo: '500700101', orderSeq: '10', materialNo: '2201-FRM0075-R01', orderQty: 30, acceptQty: 0,
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 30, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0101', docSeqNo: 'R101', specification: 'TCR ADVANCED SL DISC FRAME L CARBON/BLACK 退貨',
    orderType: 'Z1JB', productName: '公路車車架(退貨)'
  },
  {
    id: 1002, status: 'NP', vendorName: '佳承精密(00010045)', orderDate: '2025/04/14', expectedDelivery: '2026/03/02',
    orderNo: '500700102', orderSeq: '20', materialNo: '3301-WHL0045-R02', orderQty: 15, acceptQty: 0,
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 15, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0102', docSeqNo: 'R102', specification: 'SLR 1 42 DISC WHEELSYSTEM REAR 12X142 退貨',
    orderType: 'Z1JB', productName: '輪組後輪(退貨)'
  },
  {
    id: 1003, status: 'NP', vendorName: '久廣精密(00010053)', orderDate: '2025/04/16', expectedDelivery: '2026/03/02',
    orderNo: '500700103', orderSeq: '30', materialNo: '4401-HDL0053-R03', orderQty: 20, acceptQty: 0,
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 20, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0103', docSeqNo: 'R103', specification: 'CONTACT SLR OD2 HANDLEBAR 420MM 退貨',
    orderType: 'Z1JB', productName: '鋁合金把手(退貨)'
  },
  {
    id: 1004, status: 'V', vendorName: '金盛元工業(00010059)', orderDate: '2025/04/05', expectedDelivery: '2026/03/02',
    orderNo: '500700104', orderSeq: '40', materialNo: '5501-BRK0059-R04', orderQty: 50, acceptQty: 8,
    inTransitQty: 12, vendorCode: '00010059', undeliveredQty: 30, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0104', docSeqNo: 'R104', specification: 'SHIMANO BR-R9270 DURA-ACE CALIPER REAR 退貨',
    orderType: 'Z1JB', productName: '碟煞卡鉗(退貨)'
  },
  {
    id: 1005, status: 'V', vendorName: '台灣製造(00010012)', orderDate: '2025/04/07', expectedDelivery: '2026/03/02',
    orderNo: '500700105', orderSeq: '50', materialNo: '6601-CRK0012-R05', orderQty: 25, acceptQty: 5,
    inTransitQty: 8, vendorCode: '00010012', undeliveredQty: 12, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0105', docSeqNo: 'R105', specification: 'SHIMANO FC-R9200 DURA-ACE 52/36T 172.5MM 退貨',
    orderType: 'Z1JB', productName: '牙盤組(退貨)'
  },
  {
    id: 1006, status: 'B', vendorName: '速聯國際(00010046)', orderDate: '2025/03/28', expectedDelivery: '2026/03/02',
    orderNo: '500700106', orderSeq: '60', materialNo: '7701-STM0046-R06', orderQty: 18, acceptQty: 6,
    inTransitQty: 4, vendorCode: '00010046', undeliveredQty: 8, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0106', docSeqNo: 'R106', specification: 'CONTACT SL OD2 STEM 90MM -6DEG 退貨',
    orderType: 'Z1JB', productName: '龍頭(退貨)'
  },
  {
    id: 1007, status: 'CK', vendorName: '佳承精密(00010045)', orderDate: '2025/03/10', expectedDelivery: '2026/03/02',
    orderNo: '500700107', orderSeq: '70', materialNo: '8801-SDP0045-R07', orderQty: 40, acceptQty: 40,
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 0, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0107', docSeqNo: 'R107', specification: 'FLEET SLR SADDLE 143MM CARBON RAIL 退貨',
    orderType: 'Z1JB', productName: '競賽坐墊(退貨)'
  },
  {
    id: 1008, status: 'CL', vendorName: '久廣精密(00010053)', orderDate: '2025/01/15', expectedDelivery: '2026/03/02',
    orderNo: '500700108', orderSeq: '80', materialNo: '9901-TIR0053-R08', orderQty: 80, acceptQty: 80,
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 0, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0108', docSeqNo: 'R108', specification: 'GAVIA FONDO 1 700X32C TUBELESS READY 退貨',
    orderType: 'Z1JB', productName: '旅行車外胎(退貨)'
  },

  // ── Z1JD（退貨瑕疵品）────────────────────────────────────────────────────
  {
    id: 1009, status: 'NP', vendorName: '金盛元工業(00010059)', orderDate: '2025/04/18', expectedDelivery: '2026/03/02',
    orderNo: '500700109', orderSeq: '10', materialNo: '1129-FRM0059-D01', orderQty: 10, acceptQty: 0,
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 10, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0109', docSeqNo: 'D101', specification: 'PROPEL ADVANCED SL FRAME XL 瑕疵品退貨',
    orderType: 'Z1JD', productName: '氣動車架(瑕疵退)'
  },
  {
    id: 1010, status: 'NP', vendorName: '台灣製造(00010012)', orderDate: '2025/04/19', expectedDelivery: '2026/03/02',
    orderNo: '500700110', orderSeq: '20', materialNo: '2201-FRK0012-D02', orderQty: 8, acceptQty: 0,
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 8, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0110', docSeqNo: 'D102', specification: 'DEFY ADVANCED PRO FORK CARBON STEERER 瑕疵品退貨',
    orderType: 'Z1JD', productName: '碳纖維前叉(瑕疵退)'
  },
  {
    id: 1011, status: 'V', vendorName: '速聯國際(00010046)', orderDate: '2025/04/03', expectedDelivery: '2026/03/02',
    orderNo: '500700111', orderSeq: '30', materialNo: '3301-WHL0046-D03', orderQty: 12, acceptQty: 3,
    inTransitQty: 5, vendorCode: '00010046', undeliveredQty: 4, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0111', docSeqNo: 'D103', specification: 'SLR 0 CARBON 50 WHEELSYSTEM FRONT 12X100 瑕疵品退貨',
    orderType: 'Z1JD', productName: '碳纖維輪組前輪(瑕疵退)'
  },
  {
    id: 1012, status: 'B', vendorName: '佳承精密(00010045)', orderDate: '2025/03/22', expectedDelivery: '2026/03/02',
    orderNo: '500700112', orderSeq: '40', materialNo: '4401-DRL0045-D04', orderQty: 22, acceptQty: 7,
    inTransitQty: 6, vendorCode: '00010045', undeliveredQty: 9, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0112', docSeqNo: 'D104', specification: 'SHIMANO RD-M8100 SGS 12-SPEED 瑕疵品退貨',
    orderType: 'Z1JD', productName: '後變速器(瑕疵退)'
  },
  {
    id: 1013, status: 'B', vendorName: '久廣精密(00010053)', orderDate: '2025/03/25', expectedDelivery: '2026/03/02',
    orderNo: '500700113', orderSeq: '50', materialNo: '5501-CHN0053-D05', orderQty: 60, acceptQty: 20,
    inTransitQty: 15, vendorCode: '00010053', undeliveredQty: 25, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0113', docSeqNo: 'D105', specification: 'SHIMANO CN-HG901 11-SPEED CHAIN 瑕疵品退貨',
    orderType: 'Z1JD', productName: '11速鏈條(瑕疵退)'
  },
  {
    id: 1014, status: 'CK', vendorName: '金盛元工業(00010059)', orderDate: '2025/03/08', expectedDelivery: '2026/03/02',
    orderNo: '500700114', orderSeq: '60', materialNo: '6601-PED0059-D06', orderQty: 35, acceptQty: 35,
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 0, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0114', docSeqNo: 'D106', specification: 'PLATFORM PEDAL NYLON CrMo AXLE 瑕疵品退貨',
    orderType: 'Z1JD', productName: '平面踏板(瑕疵退)'
  },
  {
    id: 1015, status: 'CL', vendorName: '台灣製造(00010012)', orderDate: '2025/01/20', expectedDelivery: '2026/03/02',
    orderNo: '500700115', orderSeq: '70', materialNo: '7701-GRP0012-D07', orderQty: 100, acceptQty: 100,
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 0, statisticalDeliveryDate: '2026/03/02',
    gbdOrderNo: 'GBD-RET-2025-0115', docSeqNo: 'D107', specification: 'STRATUS LITE GRIP 130MM BLACK 瑕疵品退貨',
    orderType: 'Z1JD', productName: '握把套(瑕疵退)'
  },
];
