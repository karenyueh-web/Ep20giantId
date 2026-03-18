import type { OrderRow } from './AdvancedOrderTable';

// ── 換貨(J)單 Mock Data（Z1JB / Z1JD）───────────────────────────────────────
export const exchangeOrderMockData: OrderRow[] = [
  // ── NP（未處理）──────────────────────────────────────────────────────────
  {
    id: 2001, status: 'NP', vendorName: '速聯國際(00010046)', orderDate: '2025/04/12', expectedDelivery: '2025/05/20',
    orderNo: '500700101', orderSeq: '10', materialNo: '2201-FRM0075-J01', orderQty: 30, acceptQty: 0,
    comparePrice: '2890', currency: 'TWD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 30, statisticalDeliveryDate: '2025/05/20',
    gbdOrderNo: 'GBD-EXC-2025-0101', docSeqNo: 'R101', specification: 'TCR ADVANCED SL DISC FRAME L CARBON/BLACK 換貨',
    orderType: 'Z1JB', productName: '公路車車架(換貨)'
  },
  {
    id: 2002, status: 'NP', vendorName: '佳承精密(00010045)', orderDate: '2025/04/14', expectedDelivery: '2025/05/22',
    orderNo: '500700102', orderSeq: '20', materialNo: '3301-WHL0045-J02', orderQty: 15, acceptQty: 0,
    comparePrice: '8800', currency: 'TWD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 15, statisticalDeliveryDate: '2025/05/22',
    gbdOrderNo: 'GBD-EXC-2025-0102', docSeqNo: 'R102', specification: 'SLR 1 42 DISC WHEELSYSTEM REAR 12X142 換貨',
    orderType: 'Z1JB', productName: '輪組後輪(換貨)'
  },
  {
    id: 2003, status: 'NP', vendorName: '久廣精密(00010053)', orderDate: '2025/04/16', expectedDelivery: '2025/05/25',
    orderNo: '500700103', orderSeq: '30', materialNo: '4401-HDL0053-J03', orderQty: 20, acceptQty: 0,
    comparePrice: '980', currency: 'TWD', unit: 'EA',
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 20, statisticalDeliveryDate: '2025/05/25',
    gbdOrderNo: 'GBD-EXC-2025-0103', docSeqNo: 'R103', specification: 'CONTACT SLR OD2 HANDLEBAR 420MM 換貨',
    orderType: 'Z1JB', productName: '鋁合金把手(換貨)'
  },
  {
    id: 2004, status: 'NP', vendorName: '金盛元工業(00010059)', orderDate: '2025/04/18', expectedDelivery: '2025/05/28',
    orderNo: '500700104', orderSeq: '40', materialNo: '5501-BRK0059-J04', orderQty: 10, acceptQty: 0,
    comparePrice: '4200', currency: 'TWD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 10, statisticalDeliveryDate: '2025/05/28',
    gbdOrderNo: 'GBD-EXC-2025-0104', docSeqNo: 'R104', specification: 'SHIMANO BR-R9270 DURA-ACE CALIPER REAR 換貨',
    orderType: 'Z1JB', productName: '碟煞卡鉗(換貨)'
  },
  {
    id: 2005, status: 'NP', vendorName: '台灣製造(00010012)', orderDate: '2025/04/20', expectedDelivery: '2025/05/30',
    orderNo: '500700105', orderSeq: '50', materialNo: '6601-CRK0012-J05', orderQty: 8, acceptQty: 0,
    comparePrice: '6900', currency: 'TWD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 8, statisticalDeliveryDate: '2025/05/30',
    gbdOrderNo: 'GBD-EXC-2025-0105', docSeqNo: 'R105', specification: 'SHIMANO FC-R9200 DURA-ACE 52/36T 172.5MM 換貨',
    orderType: 'Z1JB', productName: '牙盤組(換貨)'
  },

  // ── V（廠商確認中）──────────────────────────────────────────────────────
  {
    id: 2006, status: 'V', vendorName: '速聯國際(00010046)', orderDate: '2025/04/05', expectedDelivery: '2025/05/15',
    orderNo: '500700106', orderSeq: '10', materialNo: '7701-STM0046-J06', orderQty: 12, acceptQty: 0,
    comparePrice: '1200', currency: 'TWD', unit: 'EA',
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 12, statisticalDeliveryDate: '2025/05/15',
    gbdOrderNo: 'GBD-EXC-2025-0106', docSeqNo: 'R106', specification: 'CONTACT SL OD2 STEM 90MM -6DEG 換貨',
    orderType: 'Z1JB', productName: '龍頭(換貨)'
  },
  {
    id: 2007, status: 'V', vendorName: '佳承精密(00010045)', orderDate: '2025/04/06', expectedDelivery: '2025/05/16',
    orderNo: '500700107', orderSeq: '20', materialNo: '8801-SDP0045-J07', orderQty: 6, acceptQty: 0,
    comparePrice: '5100', currency: 'TWD', unit: 'EA',
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 6, statisticalDeliveryDate: '2025/05/16',
    gbdOrderNo: 'GBD-EXC-2025-0107', docSeqNo: 'R107', specification: 'FLEET SLR SADDLE 143MM CARBON RAIL 換貨',
    orderType: 'Z1JD', productName: '競賽坐墊(瑕疵換)'
  },
  {
    id: 2008, status: 'V', vendorName: '久廣精密(00010053)', orderDate: '2025/04/08', expectedDelivery: '2025/05/18',
    orderNo: '500700108', orderSeq: '30', materialNo: '9901-TIR0053-J08', orderQty: 25, acceptQty: 0,
    comparePrice: '450', currency: 'TWD', unit: 'EA',
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 25, statisticalDeliveryDate: '2025/05/18',
    gbdOrderNo: 'GBD-EXC-2025-0108', docSeqNo: 'R108', specification: 'GAVIA FONDO 1 700X32C TUBELESS READY 換貨',
    orderType: 'Z1JB', productName: '旅行車外胎(換貨)'
  },

  // ── B（採購確認中）──────────────────────────────────────────────────────
  {
    id: 2009, status: 'B', vendorName: '金盛元工業(00010059)', orderDate: '2025/03/22', expectedDelivery: '2025/05/02',
    orderNo: '500700109', orderSeq: '10', materialNo: '1129-FRM0059-J09', orderQty: 5, acceptQty: 5,
    comparePrice: '3500', currency: 'TWD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 0, statisticalDeliveryDate: '2025/05/02',
    gbdOrderNo: 'GBD-EXC-2025-0109', docSeqNo: 'R109', specification: 'PROPEL ADVANCED SL FRAME XL 換貨',
    orderType: 'Z1JD', productName: '氣動車架(瑕疵換)'
  },
  {
    id: 2010, status: 'B', vendorName: '台灣製造(00010012)', orderDate: '2025/03/25', expectedDelivery: '2025/05/05',
    orderNo: '500700110', orderSeq: '20', materialNo: '2201-FRK0012-J10', orderQty: 3, acceptQty: 3,
    comparePrice: '480', currency: 'TWD', unit: 'PC',
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 0, statisticalDeliveryDate: '2025/05/05',
    gbdOrderNo: 'GBD-EXC-2025-0110', docSeqNo: 'R110', specification: 'DEFY ADVANCED PRO FORK CARBON STEERER 換貨',
    orderType: 'Z1JB', productName: '碳纖維前叉(換貨)'
  },
  {
    id: 2011, status: 'B', vendorName: '速聯國際(00010046)', orderDate: '2025/03/28', expectedDelivery: '2025/05/08',
    orderNo: '500700111', orderSeq: '30', materialNo: '3301-WHL0046-J11', orderQty: 4, acceptQty: 4,
    comparePrice: '8800', currency: 'USD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010046', undeliveredQty: 0, statisticalDeliveryDate: '2025/05/08',
    gbdOrderNo: 'GBD-EXC-2025-0111', docSeqNo: 'R111', specification: 'SLR 0 CARBON 50 WHEELSYSTEM FRONT 12X100 換貨',
    orderType: 'Z1JD', productName: '碳纖維輪組前輪(瑕疵換)'
  },

  // ── CK（訂單已確認）─────────────────────────────────────────────────────
  {
    id: 2012, status: 'CK', vendorName: '佳承精密(00010045)', orderDate: '2025/03/10', expectedDelivery: '2025/04/20',
    orderNo: '500700112', orderSeq: '10', materialNo: '4401-DRL0045-J12', orderQty: 6, acceptQty: 6,
    comparePrice: '380', currency: 'TWD', unit: 'PCS',
    inTransitQty: 0, vendorCode: '00010045', undeliveredQty: 0, statisticalDeliveryDate: '2025/04/20',
    gbdOrderNo: 'GBD-EXC-2025-0112', docSeqNo: 'R112', specification: 'SHIMANO RD-M8100 SGS 12-SPEED 換貨',
    orderType: 'Z1JB', productName: '後變速器(換貨)'
  },
  {
    id: 2013, status: 'CK', vendorName: '久廣精密(00010053)', orderDate: '2025/03/12', expectedDelivery: '2025/04/22',
    orderNo: '500700113', orderSeq: '20', materialNo: '5501-CHN0053-J13', orderQty: 30, acceptQty: 30,
    comparePrice: '85', currency: 'TWD', unit: 'PCS',
    inTransitQty: 0, vendorCode: '00010053', undeliveredQty: 0, statisticalDeliveryDate: '2025/04/22',
    gbdOrderNo: 'GBD-EXC-2025-0113', docSeqNo: 'R113', specification: 'SHIMANO CN-HG901 11-SPEED CHAIN 換貨',
    orderType: 'Z1JD', productName: '11速鏈條(瑕疵換)'
  },

  // ── CL（關閉結案）───────────────────────────────────────────────────────
  {
    id: 2014, status: 'CL', vendorName: '金盛元工業(00010059)', orderDate: '2025/02/05', expectedDelivery: '2025/03/15',
    orderNo: '500700114', orderSeq: '60', materialNo: '6601-PED0059-J14', orderQty: 10, acceptQty: 10,
    comparePrice: '120', currency: 'TWD', unit: 'PR',
    inTransitQty: 0, vendorCode: '00010059', undeliveredQty: 0, statisticalDeliveryDate: '2025/03/15',
    gbdOrderNo: 'GBD-EXC-2025-0114', docSeqNo: 'R114', specification: 'PLATFORM PEDAL NYLON CrMo AXLE 換貨',
    orderType: 'Z1JB', productName: '平面踏板(換貨)'
  },
  {
    id: 2015, status: 'CL', vendorName: '台灣製造(00010012)', orderDate: '2025/01/20', expectedDelivery: '2025/03/01',
    orderNo: '500700115', orderSeq: '10', materialNo: '7701-FRM0012-J15', orderQty: 2, acceptQty: 2,
    comparePrice: '1500', currency: 'TWD', unit: 'SET',
    inTransitQty: 0, vendorCode: '00010012', undeliveredQty: 0, statisticalDeliveryDate: '2025/03/01',
    gbdOrderNo: 'GBD-EXC-2025-0115', docSeqNo: 'R115', specification: 'ESCAPE 3 FRAME M CHARCOAL 換貨',
    orderType: 'Z1JB', productName: '都會車架(換貨)'
  },
];
