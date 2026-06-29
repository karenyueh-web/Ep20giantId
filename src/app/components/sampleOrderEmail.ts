// ── 索樣單 Email 通知樣板 ───────────────────────────────────────────────────
// 此檔案只負責「產生信件內容物件」，不負責實際發送。
// 實際發送由後端 EP 統一帳號（noreply@ep.giant-bicycles.com）執行。

import type { SampleOrderRecord } from './sampleOrderData';
import { SAMPLE_TYPE_OPTIONS } from './sampleOrderData';

// ── 系統 URL（Mock 用） ─────────────────────────────────────────────────────
const SYSTEM_URL_VENDOR   = 'https://ep.giant-bicycles.com/supplier';
const SYSTEM_URL_INTERNAL = 'https://ep.giant-bicycles.com/internal';

// ── 型別 ─────────────────────────────────────────────────────────────────────

export interface EmailPayload {
  /** 信件編號（1 / 2 / 3 / 4） */
  emailNo: 1 | 2 | 3 | 4;
  /** 觸發動作說明 */
  trigger: string;
  /** 收件人類型 */
  recipientType: '廠商業務' | '整合採購';
  /** 收件人查詢說明（mock 用文字） */
  recipientQuery: string;
  /** 主旨（中） */
  subjectZh: string;
  /** 主旨（英） */
  subjectEn: string;
  /** 信件內容（HTML 字串，供預覽用） */
  bodyHtml: string;
  /** 信件內容（純文字，供紀錄用） */
  bodyText: string;
}

// ── 共用工具 ─────────────────────────────────────────────────────────────────

function getSampleTypeLabel(type: string): string {
  return SAMPLE_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;
}

function isOverdue(vendorShipDate?: string, demandDate?: string): boolean {
  if (!vendorShipDate || !demandDate) return false;
  return vendorShipDate > demandDate;
}

function tableRowHtml(label: string, value: string, redText = false): string {
  const color = redText ? '#ff5630' : '#1c252e';
  return `
    <tr>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#637381;width:140px;vertical-align:top">${label}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;color:${color};font-weight:${redText ? 600 : 400}">${value}</td>
    </tr>`;
}

function infoBlockHtml(rows: { label: string; value: string }[]): string {
  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
    ${rows.map(r => tableRowHtml(r.label, r.value || '—')).join('')}
  </table>`;
}

function vendorReplyTableHtml(order: SampleOrderRecord): string {
  const overdue = isOverdue(order.vendorShipDate, order.demandDate);
  const shipDateVal = order.vendorShipDate
    ? (overdue
      ? `<span style="color:#ff5630;font-weight:600">${order.vendorShipDate}</span>`
      : order.vendorShipDate)
    : '—';

  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;color:#637381;font-weight:600;width:140px">欄位 / Field</th>
        <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;color:#637381;font-weight:600">廠商填寫內容 / Vendor Input</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#637381;vertical-align:top">樣品達交日<br>Sample Delivery Date</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb">${shipDateVal}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#637381;vertical-align:top">廠商日產能<br>Vendor Daily Capacity</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1c252e">${order.vendorDailyCapacity ?? '—'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#637381;vertical-align:top">首批可供貨日<br>First Batch Available</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1c252e">${order.availableDate ?? '—'}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#637381;vertical-align:top">實際送樣日<br>Actual Shipment Date</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1c252e">${order.actualShipDate ?? '—'}</td>
      </tr>
    </tbody>
  </table>`;
}

const DIVIDER_HTML = `
  <div style="border-top:1px solid #e5e7eb;margin:24px 0;padding-top:16px;color:#919eab;font-size:12px;text-align:center">
    ════════════════════════════════════════
  </div>`;

const FOOTER_PURCHASING_ZH = `
  <p style="color:#919eab;font-size:12px;margin-top:24px">
    巨大集團 整合採購系統 自動通知<br>
    此封電子郵件由 EP 系統自動發送，請勿直接回覆。
  </p>`;

const FOOTER_PURCHASING_EN = `
  <p style="color:#919eab;font-size:12px;margin-top:8px">
    Giant Group – EP System Automated Notification<br>
    This email was sent automatically. Please do not reply directly.
  </p>`;

const FOOTER_VENDOR_ZH = `
  <p style="color:#919eab;font-size:12px;margin-top:24px">
    巨大集團 整合採購部 敬上<br>
    此封電子郵件由 EP 系統自動發送，請勿直接回覆。
  </p>`;

const FOOTER_VENDOR_EN = `
  <p style="color:#919eab;font-size:12px;margin-top:8px">
    Giant Group – Integrated Purchasing Dept.<br>
    This email was sent automatically by the EP system. Please do not reply directly.
  </p>`;

// ── 信件一：DR → V（通知廠商業務填寫索樣單）─────────────────────────────────

export function buildEmail1(order: SampleOrderRecord, createdByEmail: string): EmailPayload {
  const subjectZh = `【巨大】索樣單通知 - ${order.orderNo} 請填寫樣品資訊`;
  const subjectEn = `[Giant] Sample Request Notification - ${order.orderNo} Please Fill In Sample Information`;
  const sampleTypeLabel = getSampleTypeLabel(order.sampleType);

  const infoRows = [
    { label: '索樣單號', value: order.orderNo },
    { label: '料號',     value: order.material },
    { label: '規格描述', value: order.longDescription },
    { label: '採購組織', value: order.purchaseOrg },
    { label: '工廠',     value: order.plant },
    { label: '索樣類型', value: sampleTypeLabel },
    { label: '重新索樣', value: order.resample ? '是' : '否' },
    { label: '樣品需求日', value: order.demandDate },
    { label: '需求數量', value: order.demandQty != null ? String(order.demandQty) : '—' },
    { label: '開立人員', value: order.createdBy },
    { label: '開立時間', value: order.createdAt },
  ];

  const bodyHtml = `
<div style="font-family:'Noto Sans TC','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1c252e">
  <div style="background:#00559c;padding:16px 24px;border-radius:8px 8px 0 0">
    <p style="color:white;font-size:16px;font-weight:600;margin:0">【巨大】索樣單通知</p>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">${order.orderNo}</p>
  </div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="font-size:15px;margin:0 0 8px">親愛的 <strong>${order.vendorName}</strong> 夥伴，您好：</p>
    <p style="color:#637381;font-size:14px;margin:0 0 16px">
      我方已正式開立以下索樣單，煩請您登入 EP（<a href="${SYSTEM_URL_VENDOR}" style="color:#00559c">${SYSTEM_URL_VENDOR}</a>）填寫相關樣品資訊，謝謝。
    </p>

    ${infoBlockHtml(infoRows)}

    <p style="color:#637381;font-size:13px;margin-top:16px">
      若有任何問題，請聯繫開立人員 <strong>${order.createdBy}</strong>（<a href="mailto:${createdByEmail}" style="color:#00559c">${createdByEmail}</a>）。
    </p>

    ${FOOTER_VENDOR_ZH}
    ${DIVIDER_HTML}

    <p style="font-size:15px;margin:0 0 8px">Dear <strong>${order.vendorName}</strong>,</p>
    <p style="color:#637381;font-size:14px;margin:0 0 16px">
      A sample request has been formally issued. Please log in to EP（<a href="${SYSTEM_URL_VENDOR}" style="color:#00559c">${SYSTEM_URL_VENDOR}</a>）and fill in the required sample information at your earliest convenience.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      <thead><tr style="background:#f3f4f6">
        <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;color:#637381;font-weight:600;width:140px">Field</th>
        <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;color:#637381;font-weight:600">Information</th>
      </tr></thead>
      <tbody>
        ${[
          ['Sample Request No.', order.orderNo],
          ['Part No.',           order.material],
          ['Description',        order.longDescription],
          ['Purchase Org.',      order.purchaseOrg],
          ['Plant',              order.plant],
          ['Sample Type',        sampleTypeLabel],
          ['Re-sample',          order.resample ? 'Yes' : 'No'],
          ['Required Date',      order.demandDate],
          ['Required Qty',       order.demandQty != null ? String(order.demandQty) : '—'],
          ['Created By',         order.createdBy],
          ['Created At',         order.createdAt],
        ].map(([l, v]) => `<tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#637381">${l}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1c252e">${v}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p style="color:#637381;font-size:13px;margin-top:16px">
      If you have any questions, please contact <strong>${order.createdBy}</strong> (<a href="mailto:${createdByEmail}" style="color:#00559c">${createdByEmail}</a>).
    </p>
    ${FOOTER_VENDOR_EN}
  </div>
</div>`;

  const bodyText = [
    subjectZh,
    '',
    `親愛的 ${order.vendorName} 夥伴，您好：`,
    `我方已正式開立以下索樣單，煩請您登入 EP（${SYSTEM_URL_VENDOR}）填寫相關樣品資訊，謝謝。`,
    '',
    ...infoRows.map(r => `  ${r.label}：${r.value}`),
    '',
    `若有任何問題，請聯繫開立人員 ${order.createdBy}（${createdByEmail}）。`,
    '',
    '════════════════════════════════════════',
    '',
    `Dear ${order.vendorName},`,
    `A sample request has been formally issued. Please log in to EP (${SYSTEM_URL_VENDOR}).`,
  ].join('\n');

  return {
    emailNo: 1,
    trigger: 'DR → V（正式開立索樣單）',
    recipientType: '廠商業務',
    recipientQuery: `廠商業務帳號：vendorCode=${order.vendorCode}，篩選 role='業務' AND status='active'`,
    subjectZh,
    subjectEn,
    bodyHtml,
    bodyText,
  };
}

// ── 信件二：V → SC 首次（通知整合採購確認廠商回覆）─────────────────────────

export function buildEmail2(order: SampleOrderRecord): EmailPayload {
  const subjectZh = `【EP】廠商已回覆索樣單 - ${order.orderNo}`;
  const subjectEn = `[Giant] Sample Request - Vendor Replied - ${order.orderNo} Please Review`;
  const overdue = isOverdue(order.vendorShipDate, order.demandDate);

  const bodyHtml = `
<div style="font-family:'Noto Sans TC','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1c252e">
  <div style="background:#118d57;padding:16px 24px;border-radius:8px 8px 0 0">
    <p style="color:white;font-size:16px;font-weight:600;margin:0">【EP】廠商已回覆索樣單</p>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">${order.orderNo}</p>
  </div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="font-size:15px;margin:0 0 8px"><strong>${order.createdBy}</strong> 您好：</p>
    <p style="color:#637381;font-size:14px;margin:0 0 16px">
      以下索樣單廠商已完成回覆，請您登入系統（<a href="${SYSTEM_URL_INTERNAL}" style="color:#00559c">${SYSTEM_URL_INTERNAL}</a>）確認廠商填寫的資料。
    </p>

    ${infoBlockHtml([
      { label: '索樣單號', value: order.orderNo },
      { label: '廠商',     value: `${order.vendorName} (${order.vendorCode})` },
      { label: '料號',     value: order.material },
      { label: '規格描述', value: order.longDescription },
      { label: '樣品需求日', value: order.demandDate },
      { label: '需求數量', value: order.demandQty != null ? String(order.demandQty) : '—' },
    ])}

    <p style="font-size:14px;font-weight:600;color:#1c252e;margin:20px 0 4px">【廠商回覆資料】</p>
    ${vendorReplyTableHtml(order)}
    ${overdue ? `<p style="color:#ff5630;font-size:13px;margin-top:4px">⚠ 樣品達交日已超過樣品需求日（${order.demandDate}）</p>` : ''}

    ${FOOTER_PURCHASING_ZH}
    ${DIVIDER_HTML}

    <p style="font-size:15px;margin:0 0 8px">Dear <strong>${order.createdBy}</strong>,</p>
    <p style="color:#637381;font-size:14px;margin:0 0 16px">
      The vendor has completed the sample request reply. Please log in to the system (<a href="${SYSTEM_URL_INTERNAL}" style="color:#00559c">${SYSTEM_URL_INTERNAL}</a>) to review the submitted information.
    </p>
    ${vendorReplyTableHtml(order)}
    ${overdue ? `<p style="color:#ff5630;font-size:13px;margin-top:4px">⚠ Sample Delivery Date exceeds the Required Date (${order.demandDate}).</p>` : ''}
    ${FOOTER_PURCHASING_EN}
  </div>
</div>`;

  return {
    emailNo: 2,
    trigger: 'V → SC（廠商首次回覆）',
    recipientType: '整合採購',
    recipientQuery: `開立人員 AD 帳號：createdBy='${order.createdBy}'`,
    subjectZh,
    subjectEn,
    bodyHtml,
    bodyText: `${subjectZh}\n\n${order.createdBy} 您好：\n以下索樣單廠商已完成回覆。\n索樣單號：${order.orderNo}`,
  };
}

// ── 信件三：SC → V（通知廠商補齊資料）───────────────────────────────────────

export function buildEmail3(
  order: SampleOrderRecord,
  missingFields: string[],
  createdByEmail: string,
): EmailPayload {
  const subjectZh = `【巨大】索樣單資料補充通知 - ${order.orderNo} 請補齊缺少欄位`;
  const subjectEn = `[Giant] Sample Request - Additional Info Required - ${order.orderNo}`;

  // 必填欄位標記（樣品達交日、廠商日產能 為必填）
  const REQUIRED = ['樣品達交日', '廠商日產能'];
  const missingItemsHtml = missingFields.map(f =>
    `<li style="margin:4px 0;color:#ff5630;font-size:14px">
      ${f}${REQUIRED.includes(f) ? ' <span style="background:#ff5630;color:white;font-size:11px;padding:1px 6px;border-radius:4px;margin-left:6px">必填</span>' : ''}
    </li>`
  ).join('');

  const bodyHtml = `
<div style="font-family:'Noto Sans TC','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1c252e">
  <div style="background:#b76e00;padding:16px 24px;border-radius:8px 8px 0 0">
    <p style="color:white;font-size:16px;font-weight:600;margin:0">【巨大】索樣單資料補充通知</p>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">${order.orderNo}</p>
  </div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="font-size:15px;margin:0 0 8px">親愛的 <strong>${order.vendorName}</strong> 夥伴，您好：</p>
    <p style="color:#637381;font-size:14px;margin:0 0 16px">
      以下索樣單仍有欄位資料不齊全，煩請您盡快登入系統（<a href="${SYSTEM_URL_VENDOR}" style="color:#00559c">${SYSTEM_URL_VENDOR}</a>）補齊，謝謝。
    </p>

    ${infoBlockHtml([
      { label: '索樣單號',  value: order.orderNo },
      { label: '料號',      value: order.material },
      { label: '規格描述',  value: order.longDescription },
      { label: '樣品需求日', value: order.demandDate },
      { label: '退回時間',  value: order.updatedAt },
    ])}

    <p style="font-size:14px;font-weight:600;color:#1c252e;margin:20px 0 8px">【尚未填寫欄位（請補齊）】</p>
    <p style="color:#637381;font-size:13px;margin:0 0 8px">以下欄位依實際缺少項目列出：</p>
    <ul style="margin:0;padding-left:20px">
      ${missingItemsHtml}
    </ul>

    <p style="color:#637381;font-size:13px;margin-top:20px">
      若有任何問題，請聯繫 <strong>${order.createdBy}</strong>（<a href="mailto:${createdByEmail}" style="color:#00559c">${createdByEmail}</a>）。
    </p>

    ${FOOTER_VENDOR_ZH}
    ${DIVIDER_HTML}

    <p style="font-size:15px;margin:0 0 8px">Dear <strong>${order.vendorName}</strong>,</p>
    <p style="color:#637381;font-size:14px;margin:0 0 16px">
      The following sample request still has incomplete information. Please log in to the system (<a href="${SYSTEM_URL_VENDOR}" style="color:#00559c">${SYSTEM_URL_VENDOR}</a>) and fill in the missing fields as soon as possible.
    </p>
    ${infoBlockHtml([
      { label: 'Sample Request No.', value: order.orderNo },
      { label: 'Part No.',           value: order.material },
      { label: 'Description',        value: order.longDescription },
      { label: 'Required Date',      value: order.demandDate },
      { label: 'Returned At',        value: order.updatedAt },
    ])}
    <p style="font-size:14px;font-weight:600;color:#1c252e;margin:20px 0 8px">[Missing Fields (Please Complete)]</p>
    <ul style="margin:0;padding-left:20px">
      ${missingFields.map(f => {
        const isReq = REQUIRED.includes(f);
        const enMap: Record<string, string> = {
          '樣品達交日': 'Sample Delivery Date',
          '廠商日產能': 'Vendor Daily Capacity',
          '實際送樣日': 'Actual Shipment Date',
          '首批可供貨日': 'First Batch Available Date',
        };
        return `<li style="margin:4px 0;color:#ff5630;font-size:14px">
          ${enMap[f] ?? f}${isReq ? ' <span style="background:#ff5630;color:white;font-size:11px;padding:1px 6px;border-radius:4px;margin-left:6px">Required</span>' : ''}
        </li>`;
      }).join('')}
    </ul>
    <p style="color:#637381;font-size:13px;margin-top:20px">
      If you have any questions, please contact <strong>${order.createdBy}</strong> (<a href="mailto:${createdByEmail}" style="color:#00559c">${createdByEmail}</a>).
    </p>
    ${FOOTER_VENDOR_EN}
  </div>
</div>`;

  return {
    emailNo: 3,
    trigger: 'SC → V（退回廠商補齊資料）',
    recipientType: '廠商業務',
    recipientQuery: `廠商業務帳號：vendorCode=${order.vendorCode}，篩選 role='業務' AND status='active'`,
    subjectZh,
    subjectEn,
    bodyHtml,
    bodyText: `${subjectZh}\n\n親愛的 ${order.vendorName} 夥伴，您好：\n以下索樣單仍有欄位資料不齊全。\n索樣單號：${order.orderNo}\n缺少欄位：${missingFields.join('、')}`,
  };
}

// ── 信件四：V → SC 補填後（再次通知整合採購）────────────────────────────────

export function buildEmail4(order: SampleOrderRecord): EmailPayload {
  const subjectZh = `【EP】廠商已補填索樣單資料 - ${order.orderNo}`;
  const subjectEn = `[Giant] Sample Request - Vendor Re-submitted - ${order.orderNo} Please Review`;
  const overdue = isOverdue(order.vendorShipDate, order.demandDate);

  const bodyHtml = `
<div style="font-family:'Noto Sans TC','Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1c252e">
  <div style="background:#0065a9;padding:16px 24px;border-radius:8px 8px 0 0">
    <p style="color:white;font-size:16px;font-weight:600;margin:0">【EP】廠商已補填索樣單資料</p>
    <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:4px 0 0">${order.orderNo}</p>
  </div>
  <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="font-size:15px;margin:0 0 8px"><strong>${order.createdBy}</strong> 您好：</p>
    <p style="color:#637381;font-size:14px;margin:0 0 4px">
      廠商已完成補填索樣單資料（<a href="${SYSTEM_URL_INTERNAL}" style="color:#00559c">${SYSTEM_URL_INTERNAL}</a>）
    </p>

    ${infoBlockHtml([
      { label: '索樣單號', value: order.orderNo },
      { label: '廠商',     value: `${order.vendorName} (${order.vendorCode})` },
      { label: '料號',     value: order.material },
      { label: '規格描述', value: order.longDescription },
      { label: '樣品需求日', value: order.demandDate },
      { label: '需求數量', value: order.demandQty != null ? String(order.demandQty) : '—' },
    ])}

    <p style="font-size:14px;font-weight:600;color:#1c252e;margin:20px 0 4px">【廠商回覆資料（補填後）】</p>
    ${vendorReplyTableHtml(order)}
    ${overdue ? `<p style="color:#ff5630;font-size:13px;margin-top:4px">⚠ 樣品達交日已超過樣品需求日（${order.demandDate}）</p>` : ''}

    ${FOOTER_PURCHASING_ZH}
    ${DIVIDER_HTML}

    <p style="font-size:15px;margin:0 0 8px">Dear <strong>${order.createdBy}</strong>,</p>
    <p style="color:#637381;font-size:14px;margin:0 0 4px">
      The vendor has completed the supplementary submission (<a href="${SYSTEM_URL_INTERNAL}" style="color:#00559c">${SYSTEM_URL_INTERNAL}</a>).
    </p>
    ${vendorReplyTableHtml(order)}
    ${overdue ? `<p style="color:#ff5630;font-size:13px;margin-top:4px">⚠ Sample Delivery Date exceeds the Required Date (${order.demandDate}).</p>` : ''}
    ${FOOTER_PURCHASING_EN}
  </div>
</div>`;

  return {
    emailNo: 4,
    trigger: 'V → SC（廠商補填後再次回覆）',
    recipientType: '整合採購',
    recipientQuery: `開立人員 AD 帳號：createdBy='${order.createdBy}'`,
    subjectZh,
    subjectEn,
    bodyHtml,
    bodyText: `${subjectZh}\n\n${order.createdBy} 您好：\n廠商已完成補填索樣單資料。\n索樣單號：${order.orderNo}`,
  };
}
