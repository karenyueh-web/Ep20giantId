/**
 * MDO 廠商聯絡人 API
 * Endpoint: GET/POST /api/v1/product-master/supplier-contacts
 * Schema 來源: https://mdo.uat.giantgroup.local/api/docs-json (2026-08-14)
 *
 * ⚠️ 注意：以下 EP 前台欄位目前 MDO 尚未支援，暫時保留 localStorage：
 *   - purchaseOrg（採購組織）
 *   - emailEnabled（寄信開關）
 *   - remark（備註）
 * 追蹤文件：src/app/api/supplier/PENDING_MDO_FIELDS.md
 */
import { mdoList, mdoCommand } from '../client';

// ── MDO Contact DTO ────────────────────────────────────────────────────────────
/** GET 回傳結構（MDO 未定義 SupplierContactResponseDto，以 Upsert DTO 推斷） */
export interface MdoSupplierContact {
  id?: string;
  supplierId: string;
  contactName: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  department?: string;    // 部門（近似前台的 role）
  isPrimary?: boolean;    // true = 收件人, false = CC（近似前台的 priority）
  roles?: string[];       // 角色陣列（前台為單選 role）
}

// ── Upsert DTO ────────────────────────────────────────────────────────────────
export interface UpsertSupplierContactBody {
  supplierId: string;    // required - Supplier UUID
  contactName: string;  // required
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  department?: string;
  isPrimary?: boolean;
  roles?: string[];
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * 取得廠商聯絡人列表
 * @param supplierId - Supplier UUID（必填）
 */
export async function fetchSupplierContacts(
  supplierId: string
): Promise<MdoSupplierContact[]> {
  const res = await mdoList<MdoSupplierContact>(
    '/product-master/supplier-contacts',
    { supplierId }
  );
  return res.data;
}

/**
 * 新增或更新廠商聯絡人
 */
export async function upsertSupplierContact(
  body: UpsertSupplierContactBody
): Promise<MdoSupplierContact> {
  return mdoCommand<UpsertSupplierContactBody, MdoSupplierContact>(
    '/product-master/supplier-contacts/commands/upsert',
    body
  );
}
