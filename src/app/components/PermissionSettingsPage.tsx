import { ResponsivePageLayout } from './ResponsivePageLayout';
import type { PageType } from './MainLayout';
import { pageConfig } from '@/app/config/pageConfig';
import { CheckboxIcon } from './CheckboxIcon';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RECEIVING_TABS } from '../config/receivingConfig';
import {
  loadRoleSections as storeLoadRoleSections,
  saveRoleSections,
  addRole as storeAddRole,
  roleExists,
  checkGACRoleExists,
  fetchGACRoles,
  type RoleSection as StoreRoleSection,
} from '@/app/config/roleStore';
import {
  getRoleUserCount,
  getUsersByRole,
  getUsersWithoutRole,
  hasUsersWithoutRole,
  clearRoleFromAllUsers,
  loadSyncAlerts,
  saveSyncAlerts,
  clearSyncAlerts,
  type UserRoleRecord,
  type SyncAlert,
} from '@/app/config/userRoleStore';
import { setPendingNavUser } from '@/app/config/pendingNavigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PermissionSettingsPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

interface FeatureNode {
  id: string;
  label: string;
  children?: FeatureNode[];
}

interface RoleItem {
  id: string;
  label: string;
}

interface RoleSection {
  title: string;
  dotColor: string;
  roles: RoleItem[];
}

// ─── Feature Tree Data ───────────────────────────────────────────────────────

const FEATURE_TREE: FeatureNode[] = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    children: [
      { id: 'overview-vendor-review', label: '廠商帳號審核' },
      { id: 'overview-dashboard', label: 'Dashboard' },
      { id: 'overview-announcement', label: '公佈欄' },
      { id: 'overview-chat', label: 'Online Chat' },
      {
        id: 'overview-receiving',
        label: '收料查詢',
        children: [
          {
            id: 'overview-receiving-tabs',
            label: '列表頁 Tab',
            children: RECEIVING_TABS.map(t => ({ id: t.permId, label: t.label })),
          },
        ],
      },
      {
        id: 'overview-schedule',
        label: '排程總表查詢',
        children: [
          {
            id: 'overview-schedule-tabs',
            label: '列表頁 Tab',
            children: [
              { id: 'overview-schedule-tab-all', label: 'ALL(全部)' },
              { id: 'overview-schedule-tab-ck', label: '已確認(CK)' },
              { id: 'overview-schedule-tab-cl', label: '關閉結案(CL)' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'management',
    label: 'MANAGEMENT',
    children: [
      {
        id: 'mgmt-parts',
        label: '零件/索樣',
        children: [
          {
            id: 'mgmt-parts-info',
            label: '零件資訊',
            children: [
              {
                id: 'mgmt-parts-info-list',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-parts-info-list-all', label: 'All' },
                  { id: 'mgmt-parts-info-list-unquoted', label: '未報價' },
                  { id: 'mgmt-parts-info-list-quoted', label: '已報價' },
                ],
              },
              {
                id: 'mgmt-parts-info-detail',
                label: '明細頁 Tab',
                children: [
                  { id: 'mgmt-parts-info-detail-material', label: '物料資訊維護' },
                  { id: 'mgmt-parts-info-detail-component', label: '物料成分設定' },
                ],
              },
            ],
          },
          { id: 'mgmt-parts-print-quote', label: '列印報價單' },
          {
            id: 'mgmt-parts-sample',
            label: '索樣單',
            children: [
              {
                id: 'mgmt-parts-sample-list',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-parts-sample-list-all', label: 'All' },
                  { id: 'mgmt-parts-sample-list-dr', label: '草稿(DR)' },
                  { id: 'mgmt-parts-sample-list-v', label: '廠商確認中(V)' },
                  { id: 'mgmt-parts-sample-list-sc', label: '廠商已回覆(SC)' },
                  { id: 'mgmt-parts-sample-list-cc', label: '取消(CC)' },
                  { id: 'mgmt-parts-sample-list-cl', label: '關閉結案(CL)' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'mgmt-newparts',
        label: '新零件專案',
        children: [
          { id: 'mgmt-newparts-maintain', label: '新零件專案維護' },
          { id: 'mgmt-newparts-settings', label: '專案設定' },
        ],
      },
      {
        id: 'mgmt-order',
        label: '訂單管理',
        children: [
          {
            id: 'mgmt-order-general',
            label: '一般訂單查詢',
            children: [
              {
                id: 'mgmt-order-general-list',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-order-general-list-all', label: 'All' },
                  { id: 'mgmt-order-general-list-np', label: '未處理(NP)' },
                  { id: 'mgmt-order-general-list-v', label: '廠商確認中(V)' },
                  { id: 'mgmt-order-general-list-b', label: '採購確認中(B)' },
                  { id: 'mgmt-order-general-list-ck', label: '訂單已確認(CK)' },
                  { id: 'mgmt-order-general-list-cl', label: '關閉結案(CL)' },
                ],
              },
            ],
          },
          {
            id: 'mgmt-order-exchange',
            label: '換貨(J)單據查詢',
            children: [
              {
                id: 'mgmt-order-exchange-list',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-order-exchange-list-all', label: 'All' },
                  { id: 'mgmt-order-exchange-list-np', label: '未處理(NP)' },
                  { id: 'mgmt-order-exchange-list-v', label: '廠商確認中(V)' },
                  { id: 'mgmt-order-exchange-list-b', label: '採購確認中(B)' },
                  { id: 'mgmt-order-exchange-list-ck', label: '訂單已確認(CK)' },
                  { id: 'mgmt-order-exchange-list-cl', label: '關閉結案(CL)' },
                ],
              },
            ],
          },
          {
            id: 'mgmt-order-return',
            label: '退貨單據查詢',
            children: [
              {
                id: 'mgmt-order-return-list',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-order-return-list-all', label: 'All' },
                  { id: 'mgmt-order-return-list-np', label: '未處理(NP)' },
                  { id: 'mgmt-order-return-list-v', label: '廠商確認中(V)' },
                  { id: 'mgmt-order-return-list-b', label: '採購確認中(B)' },
                  { id: 'mgmt-order-return-list-ck', label: '訂單已確認(CK)' },
                  { id: 'mgmt-order-return-list-cl', label: '關閉結案(CL)' },
                ],
              },
            ],
          },
          { id: 'mgmt-order-forecast', label: '預測訂單查詢' },
          { id: 'mgmt-order-schedule-change', label: '變更生管排程' },
          { id: 'mgmt-order-history', label: '歷史訂單查詢' },
        ],
      },
      {
        id: 'mgmt-correction',
        label: '修正單管理',
        children: [
          { id: 'mgmt-correction-create', label: '建立修正單' },
          {
            id: 'mgmt-correction-list',
            label: '修正單查詢',
            children: [
              {
                id: 'mgmt-correction-list-tabs',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-correction-list-all', label: 'ALL(全部)' },
                  { id: 'mgmt-correction-list-dr', label: '草稿(DR)' },
                  { id: 'mgmt-correction-list-v', label: '廠商確認中(V)' },
                  { id: 'mgmt-correction-list-b', label: '採購確認中(B)' },
                  { id: 'mgmt-correction-list-cp', label: '單據已確認(CP)' },
                  { id: 'mgmt-correction-list-ss', label: '修正通過(SS)' },
                  { id: 'mgmt-correction-list-cl', label: '單據結案(CL)' },
                ],
              },
            ],
          },
          {
            id: 'mgmt-correction-history',
            label: '歷史修正單',
            children: [
              {
                id: 'mgmt-correction-history-tabs',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-correction-history-all', label: 'ALL(全部)' },
                  { id: 'mgmt-correction-history-ck', label: '已確認(CK)' },
                  { id: 'mgmt-correction-history-cl', label: '單據結案(CL)' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'mgmt-shipping',
        label: '出貨單',
        children: [
          { id: 'mgmt-shipping-create', label: '建立出貨單' },
          { id: 'mgmt-shipping-list', label: '出貨單查詢' },
          {
            id: 'mgmt-shipping-packing',
            label: '出貨/裝箱明細',
            children: [
              {
                id: 'mgmt-shipping-packing-detail',
                label: '明細頁 Tab',
                children: [
                  { id: 'mgmt-shipping-packing-detail-ship', label: '出貨明細查詢' },
                  { id: 'mgmt-shipping-packing-detail-box', label: '裝箱明細查詢' },
                ],
              },
            ],
          },
          {
            id: 'mgmt-shipping-print',
            label: '列印單據',
            children: [
              {
                id: 'mgmt-shipping-print-detail',
                label: '明細頁 Tab',
                children: [
                  { id: 'mgmt-shipping-print-detail-warehouse', label: '列印外箱貼紙（倉儲）' },
                  { id: 'mgmt-shipping-print-detail-youth', label: '列印外箱貼紙（幼獅）' },
                  { id: 'mgmt-shipping-print-detail-sub', label: '列印外箱貼紙（下包商）' },
                  { id: 'mgmt-shipping-print-detail-subship', label: '列印出貨單（下包商）' },
                ],
              },
            ],
          },
          { id: 'mgmt-shipping-settings', label: '基本設定' },
        ],
      },
      {
        id: 'mgmt-quality',
        label: '品保作業',
        children: [
          {
            id: 'mgmt-quality-abnormal',
            label: '品質異常單',
            children: [
              {
                id: 'mgmt-quality-abnormal-list',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-quality-abnormal-list-all', label: 'All' },
                  { id: 'mgmt-quality-abnormal-list-v', label: '廠商確認中(V)' },
                  { id: 'mgmt-quality-abnormal-list-g', label: '巨大確認中(G)' },
                  { id: 'mgmt-quality-abnormal-list-ce', label: '取消(CE)' },
                  { id: 'mgmt-quality-abnormal-list-cl', label: '關閉結案(CL)' },
                ],
              },
            ],
          },
          { id: 'mgmt-quality-report', label: '檢驗/測試報告' },
          { id: 'mgmt-quality-hazard', label: '危害物質管理' },
          { id: 'mgmt-quality-other', label: '其他設定' },
        ],
      },
      {
        id: 'mgmt-invoice',
        label: '發票作業',
        children: [
          { id: 'mgmt-invoice-create', label: '開立發票' },
          {
            id: 'mgmt-invoice-list',
            label: '發票查詢',
            children: [
              {
                id: 'mgmt-invoice-list-tabs',
                label: '列表頁 Tab',
                children: [
                  { id: 'mgmt-invoice-list-all', label: 'ALL(全部)' },
                  { id: 'mgmt-invoice-list-dr', label: '草稿(DR)' },
                  { id: 'mgmt-invoice-list-p', label: '資料處理中(P)' },
                  { id: 'mgmt-invoice-list-b', label: '採購確認中(B)' },
                  { id: 'mgmt-invoice-list-s', label: '轉發票成功(S)' },
                  { id: 'mgmt-invoice-list-f', label: '轉發票失敗(F)' },
                  { id: 'mgmt-invoice-list-h', label: '線下處理(H)' },
                ],
              },
            ],
          },
          { id: 'mgmt-invoice-settings', label: '發票設定' },
        ],
      },
      { id: 'mgmt-insurance', label: '產險資料維護' },
      { id: 'mgmt-vendor-eval', label: '廠商評價' },
      {
        id: 'mgmt-esg',
        label: 'ESG',
        children: [
          { id: 'mgmt-esg-material', label: '物料成分總檔' },
          { id: 'mgmt-esg-maintain', label: '材料維護' },
        ],
      },
      {
        id: 'mgmt-ship-tw',
        label: '出貨台灣捷安特',
        children: [
          { id: 'mgmt-ship-tw-order', label: '訂單查詢' },
          { id: 'mgmt-ship-tw-shipping', label: '出貨單查詢' },
          { id: 'mgmt-ship-tw-print', label: '列印外箱貼紙' },
        ],
      },
      {
        id: 'mgmt-account',
        label: '帳號管理',
        children: [
          {
            id: 'mgmt-account-vendor',
            label: '廠商帳號管理',
            children: [
              {
                id: 'mgmt-account-vendor-detail',
                label: '明細頁 Tab',
                children: [
                  { id: 'mgmt-account-vendor-detail-basic', label: '基本資料' },
                  { id: 'mgmt-account-vendor-detail-biz', label: '業務帳號' },
                  { id: 'mgmt-account-vendor-detail-contact', label: '其他聯絡人' },
                ],
              },
            ],
          },
          { id: 'mgmt-account-giant', label: '巨大帳號管理' },
        ],
      },
      {
        id: 'mgmt-system',
        label: '系統設定',
        children: [
          { id: 'mgmt-system-permission', label: pageConfig['permission-settings'].navLabel },
          { id: 'mgmt-system-schedule', label: '排程設定' },
        ],
      },
    ],
  },
];

// ─── Role Data ───────────────────────────────────────────────────────────────

// INITIAL_ROLE_SECTIONS 保留為 fallback，實際資料來自 roleStore
const INITIAL_ROLE_SECTIONS: RoleSection[] = [
  {
    title: '巨大',
    dotColor: '#005eb8',
    roles: [
      { id: 'giant-gtm-purchase',   label: 'GTM採購' },
      { id: 'giant-other-purchase', label: '其它區採購' },
      { id: 'giant-youth-purchase', label: '幼獅採購' },
      { id: 'giant-gtm-warehouse',  label: 'GTM倉儲' },
      { id: 'giant-bulk-purchase',  label: '整採' },
      { id: 'giant-qa',             label: '品保' },
      { id: 'giant-developer',      label: '開發人員' },
      { id: 'giant-gtm-production', label: 'GTM生管' },
      { id: 'giant-finance',        label: '財務' },
      { id: 'giant-it',             label: 'IT' },
    ],
  },
  {
    title: '廠商',
    dotColor: '#22c55e',
    roles: [
      { id: 'vendor-sales',         label: '業務' },
      { id: 'vendor-qa',            label: '品保' },
      { id: 'vendor-subcontractor', label: '下包商' },
      { id: 'vendor-developer',     label: '開發人員' },
    ],
  },
];

const ROLE_ORDER_STORAGE_KEY = 'permission-role-order';

/**
 * 載入角色清單：優先從 roleStore（包含動態新增的角色），
 * 再以 ROLE_ORDER_STORAGE_KEY 排序視同每個 section 的角色順序。
 */
function loadRoleSections(): RoleSection[] {
  // 從 roleStore 取得完整角色序列（含動態新增）
  const basesections = storeLoadRoleSections() as RoleSection[];
  try {
    const stored = localStorage.getItem(ROLE_ORDER_STORAGE_KEY);
    if (stored) {
      const orderMap = JSON.parse(stored) as Record<string, string[]>;
      return basesections.map((section) => {
        const savedOrder = orderMap[section.title];
        if (!savedOrder) return section;
        const sorted = [...section.roles].sort((a, b) => {
          const ai = savedOrder.indexOf(a.id);
          const bi = savedOrder.indexOf(b.id);
          if (ai === -1 && bi === -1) return 0;
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
        return { ...section, roles: sorted };
      });
    }
  } catch { /* ignore */ }
  return basesections;
}

function saveRoleOrder(sections: RoleSection[]) {
  const orderMap: Record<string, string[]> = {};
  sections.forEach((s) => {
    orderMap[s.title] = s.roles.map((r) => r.id);
  });
  localStorage.setItem(ROLE_ORDER_STORAGE_KEY, JSON.stringify(orderMap));
}

// ─── Draggable Role Item ─────────────────────────────────────────────────────

const DRAG_TYPE_ROLE = 'ROLE_ITEM';

interface DragItem {
  roleId: string;
  sectionTitle: string;
  index: number;
}

interface DraggableRoleItemProps {
  role: RoleItem;
  index: number;
  sectionTitle: string;
  isSelected: boolean;
  onSelect: () => void;
  onMoveRole: (sectionTitle: string, fromIndex: number, toIndex: number) => void;
}

function DraggableRoleItem({ role, index, sectionTitle, isSelected, onSelect, onMoveRole }: DraggableRoleItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: DRAG_TYPE_ROLE,
    item: (): DragItem => ({ roleId: role.id, sectionTitle, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE_ROLE,
    canDrop: (item: DragItem) => item.sectionTitle === sectionTitle,
    hover: (item: DragItem) => {
      if (item.sectionTitle !== sectionTitle) return;
      if (item.index === index) return;
      onMoveRole(sectionTitle, item.index, index);
      item.index = index;
    },
    collect: (monitor) => ({ isOver: monitor.isOver() && monitor.canDrop() }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`w-full flex items-center h-[40px] transition-colors group/role ${
        isDragging ? 'opacity-40' : ''
      } ${
        isOver ? 'bg-[rgba(0,94,184,0.04)]' : ''
      } ${
        isSelected
          ? 'bg-[rgba(0,94,184,0.08)] border-l-[3px] border-l-[#005eb8]'
          : 'border-l-[3px] border-l-transparent hover:bg-[rgba(145,158,171,0.06)]'
      }`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      {/* Drag handle */}
      <div
        ref={(node) => { drag(node); }}
        className="shrink-0 w-[24px] flex items-center justify-center opacity-0 group-hover/role:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ml-[4px]"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <circle cx="3.5" cy="2.5" r="1.5" fill="#919eab" />
          <circle cx="8.5" cy="2.5" r="1.5" fill="#919eab" />
          <circle cx="3.5" cy="7.5" r="1.5" fill="#919eab" />
          <circle cx="8.5" cy="7.5" r="1.5" fill="#919eab" />
          <circle cx="3.5" cy="12.5" r="1.5" fill="#919eab" />
          <circle cx="8.5" cy="12.5" r="1.5" fill="#919eab" />
        </svg>
      </div>
      <span
        className={`font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[14px] leading-[22px] ${
          isSelected ? 'text-[#005eb8]' : 'text-[#454f5b]'
        }`}
      >
        {role.label}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Collect all leaf node IDs from a tree */
function collectLeafIds(nodes: FeatureNode[]): string[] {
  const result: string[] = [];
  function walk(node: FeatureNode) {
    if (!node.children || node.children.length === 0) {
      result.push(node.id);
    } else {
      node.children.forEach(walk);
    }
  }
  nodes.forEach(walk);
  return result;
}

/** Collect all descendant leaf IDs of a specific node */
function getDescendantLeafIds(node: FeatureNode): string[] {
  if (!node.children || node.children.length === 0) return [node.id];
  const result: string[] = [];
  node.children.forEach((child) => {
    result.push(...getDescendantLeafIds(child));
  });
  return result;
}

/** Get the check state of a node given checked leaf set */
function getNodeState(
  node: FeatureNode,
  checkedSet: Set<string>
): 'checked' | 'unchecked' | 'indeterminate' {
  if (!node.children || node.children.length === 0) {
    return checkedSet.has(node.id) ? 'checked' : 'unchecked';
  }
  const leafIds = getDescendantLeafIds(node);
  const checkedCount = leafIds.filter((id) => checkedSet.has(id)).length;
  if (checkedCount === 0) return 'unchecked';
  if (checkedCount === leafIds.length) return 'checked';
  return 'indeterminate';
}

// ─── Tree Node Component ─────────────────────────────────────────────────────

interface TreeNodeProps {
  node: FeatureNode;
  depth: number;
  checkedSet: Set<string>;
  expandedSet: Set<string>;
  onToggleCheck: (node: FeatureNode) => void;
  onToggleExpand: (nodeId: string) => void;
}

function TreeNode({
  node,
  depth,
  checkedSet,
  expandedSet,
  onToggleCheck,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedSet.has(node.id);
  const state = getNodeState(node, checkedSet);

  return (
    <div>
      {/* Row */}
      <div
        className="flex items-center h-[36px] hover:bg-[rgba(145,158,171,0.04)] transition-colors rounded-[4px] group"
        style={{ paddingLeft: depth * 24 }}
      >
        {/* Expand/Collapse arrow */}
        <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(node.id)}
              className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] hover:bg-[rgba(145,158,171,0.12)] transition-colors cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="#637381"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Checkbox */}
        <div className="shrink-0 mr-[8px]">
          <CheckboxIcon
            checked={state === 'checked'}
            indeterminate={state === 'indeterminate'}
            onChange={() => onToggleCheck(node)}
          />
        </div>

        {/* Label */}
        <span
          className={`text-[14px] leading-[22px] select-none truncate ${
            depth === 0
              ? "font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[#1c252e]"
              : "font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[#454f5b]"
          }`}
        >
          {node.label}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              checkedSet={checkedSet}
              expandedSet={expandedSet}
              onToggleCheck={onToggleCheck}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PermissionSettingsPage({
  currentPage,
  onPageChange,
  onLogout,
  userRole,
}: PermissionSettingsPageProps) {
  // Selected role
  const [roleSections, setRoleSections] = useState<RoleSection[]>(loadRoleSections);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    () => loadRoleSections()[0].roles[0].id
  );

  // Permission state: leaf node IDs that are checked
  const [checkedSet, setCheckedSet] = useState<Set<string>>(new Set());

  // Expanded nodes
  const [expandedSet, setExpandedSet] = useState<Set<string>>(() => {
    // Default: Level 1 (OVERVIEW, MANAGEMENT) expanded
    return new Set(FEATURE_TREE.map((n) => n.id));
  });

  // Save feedback message
  const [saveMessage, setSaveMessage] = useState<string>('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find selected role label
  const selectedRoleLabel = useMemo(() => {
    for (const section of roleSections) {
      const found = section.roles.find((r) => r.id === selectedRoleId);
      if (found) return found.label;
    }
    return '';
  }, [selectedRoleId, roleSections]);

  // Move role within a section (drag-and-drop)
  const handleMoveRole = useCallback((sectionTitle: string, fromIndex: number, toIndex: number) => {
    setRoleSections((prev) => {
      const next = prev.map((s) => {
        if (s.title !== sectionTitle) return s;
        const roles = [...s.roles];
        const [moved] = roles.splice(fromIndex, 1);
        roles.splice(toIndex, 0, moved);
        return { ...s, roles };
      });
      saveRoleOrder(next);
      return next;
    });
  }, []);

  // ── 新增角色 Dialog state ──────────────────────────────────────────────────
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [addRoleStep, setAddRoleStep] = useState<1 | 2 | 3>(1); // 1=選類型 2=輸入名稱 3=二次確認
  const [addRoleType, setAddRoleType] = useState<'巨大' | '廠商'>('巨大');
  const [addRoleName, setAddRoleName] = useState('');
  const [addRoleLoading, setAddRoleLoading] = useState(false);
  const [addRoleError, setAddRoleError] = useState('');
  const [addRoleGacError, setAddRoleGacError] = useState('');

  const handleAddRoleOpen = () => {
    setAddRoleStep(1);
    setAddRoleType('巨大');
    setAddRoleName('');
    setAddRoleError('');
    setAddRoleGacError('');
    setShowAddRoleDialog(true);
  };

  const handleAddRoleNameChange = (val: string) => {
    setAddRoleName(val);
    setAddRoleError(roleExists(val, addRoleType) ? '此角色名稱在該分類中已存在' : '');
  };

  // 新流程：Step2 確認 → 檢查重複 → 查 GAC → 建立 or 警示
  const handleStep2Confirm = async () => {
    if (!addRoleName.trim() || addRoleError) return;
    setAddRoleLoading(true);
    setAddRoleGacError('');
    // 2. 背景查 GAC
    const ok = await checkGACRoleExists(addRoleName, addRoleType);
    setAddRoleLoading(false);
    if (ok) {
      // 3. GAC 有此角色 → 建立並觸發同步
      const newId = `${addRoleType === '巨大' ? 'giant' : 'vendor'}-${addRoleName}-${Date.now()}`;
      storeAddRole(addRoleType, addRoleName, newId);
      setRoleSections(loadRoleSections());
      setSelectedRoleId(newId);
      setShowAddRoleDialog(false);
      setSaveMessage(`角色「${addRoleName}」已建立`);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveMessage(''), 3000);
      // 觸發同步
      handleSyncGAC();
    } else {
      // 4. GAC 沒有 → 顯示警示頁
      setAddRoleStep(3);
    }
  };


  // ── 角色人數 Modal state ────────────────────────────────────────────────────
  const [roleUserModal, setRoleUserModal] = useState<{ roleId: string; roleLabel: string } | null>(null);
  const [roleModalTab, setRoleModalTab] = useState<'giant' | 'vendor'>('giant');
  const roleModalUsers = roleUserModal ? getUsersByRole(roleUserModal.roleId) : [];


  // ── GAC 同步 Banner state ───────────────────────────────────────────────────
  const [syncAlerts, setSyncAlerts] = useState<SyncAlert[]>(() => loadSyncAlerts());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [noRoleUsersExpanded, setNoRoleUsersExpanded] = useState(false);
  const noRoleUsers = getUsersWithoutRole();
  const canCloseBanner = syncAlerts.length > 0 && !hasUsersWithoutRole();

  const handleSyncGAC = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    const gacRoles = await fetchGACRoles();
    const sections = loadRoleSections();
    const newAlerts: SyncAlert[] = [];
    sections.forEach(section => {
      section.roles.forEach(role => {
        const stillExists = gacRoles.some(
          g => g.name === role.label && g.type === section.title
        );
        if (!stillExists) {
          const affectedUsers = clearRoleFromAllUsers(role.id);
          if (affectedUsers.length > 0) {
            newAlerts.push({
              roleLabel: role.label,
              roleType: section.title,
              affectedCount: affectedUsers.length,
              affectedUsers: affectedUsers.map(u => ({
                userId: u.userId, userName: u.userName,
                account: u.account, type: u.type, companyName: u.companyName
              }))
            });
          }
        }
      });
    });
    if (newAlerts.length > 0) {
      saveSyncAlerts(newAlerts);
      setSyncAlerts(newAlerts);
      setShowAlertModal(true);
    } else {
      setSyncMessage('已同步，無差異');
      setTimeout(() => setSyncMessage(''), 3000);
    }
    setIsSyncing(false);
  };


  const handleCloseBanner = () => {
    if (!canCloseBanner) return;
    clearSyncAlerts();
    setSyncAlerts([]);
    setNoRoleUsersExpanded(false);
  };



  // Load permissions from localStorage when role changes
  useEffect(() => {
    const key = `permission-settings-${selectedRoleId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setCheckedSet(new Set(parsed));
      } else {
        setCheckedSet(new Set());
      }
    } catch {
      setCheckedSet(new Set());
    }
  }, [selectedRoleId]);

  // Toggle check on a node
  const handleToggleCheck = useCallback(
    (node: FeatureNode) => {
      setCheckedSet((prev) => {
        const next = new Set(prev);
        const leafIds = getDescendantLeafIds(node);
        const state = getNodeState(node, prev);

        if (state === 'checked') {
          // Uncheck all descendants
          leafIds.forEach((id) => next.delete(id));
        } else {
          // Check all descendants
          leafIds.forEach((id) => next.add(id));
        }
        return next;
      });
    },
    []
  );

  // Toggle expand
  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Save to localStorage
  const handleSave = useCallback(() => {
    const key = `permission-settings-${selectedRoleId}`;
    const arr = Array.from(checkedSet);
    localStorage.setItem(key, JSON.stringify(arr));
    setSaveMessage('儲存成功');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveMessage(''), 2000);
  }, [selectedRoleId, checkedSet]);

  // Reset from localStorage
  const handleReset = useCallback(() => {
    const key = `permission-settings-${selectedRoleId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setCheckedSet(new Set(parsed));
      } else {
        setCheckedSet(new Set());
      }
    } catch {
      setCheckedSet(new Set());
    }
  }, [selectedRoleId]);

  // All leaf count for header info
  const allLeafIds = useMemo(() => collectLeafIds(FEATURE_TREE), []);
  const checkedCount = checkedSet.size;
  const totalCount = allLeafIds.length;

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title={pageConfig['permission-settings'].title}
      breadcrumb={pageConfig['permission-settings'].breadcrumb}
    >
      {/* Wrapper to fill content area */}
      <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 180px)' }}>

      <DndProvider backend={HTML5Backend}>
      {/* Main card */}
      <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT PANEL: Role Selector (2-column layout) ── */}
        <div className="w-[480px] shrink-0 flex flex-col border-r border-[rgba(145,158,171,0.12)]">
          {/* Header */}
          <div className="shrink-0 h-[56px] flex items-center justify-between px-[20px] border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex items-center gap-[8px]">
              <h3 className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1c252e]">
                角色選擇
              </h3>
              {/* 警示 icon：有問題才顯示 */}
              {(syncAlerts.length > 0 || noRoleUsers.length > 0) && (
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="relative w-[22px] h-[22px] flex items-center justify-center rounded-full bg-[#ff4842] hover:bg-[#d32f2f] transition-colors"
                  title="查看角色警示">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                    <rect x="3.5" y="0" width="3" height="8.5" rx="1.5" fill="white"/>
                    <rect x="3.5" y="11" width="3" height="3" rx="1.5" fill="white"/>
                  </svg>
                  {/* 閃爍動畫圈 */}
                  <span className="absolute inset-0 rounded-full bg-[#ff4842] animate-ping opacity-40" />
                </button>
              )}
            </div>
            {/* 同步 GAC 按鈕 */}
            <button
              onClick={handleSyncGAC}
              disabled={isSyncing}
              className="text-[12px] text-[#004680] hover:text-[#002d5a] font-medium underline disabled:opacity-50"
            >
              {isSyncing ? '同步中…' : '同步 GAC'}
            </button>


          </div>

          {/* Two-column role list */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {roleSections.map((section, sIdx) => (
              <div
                key={section.title}
                className={`flex flex-col flex-1 min-w-0 overflow-hidden ${
                  sIdx > 0 ? 'border-l border-[rgba(145,158,171,0.12)]' : ''
                }`}
              >
                {/* Section header */}
                <div className="shrink-0 flex items-center gap-[8px] px-[16px] pt-[14px] pb-[10px]">
                  <div
                    className="w-[8px] h-[8px] rounded-full shrink-0"
                    style={{ backgroundColor: section.dotColor }}
                  />
                  <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] leading-[20px] text-[#919eab] uppercase tracking-[0.5px]">
                    {section.title}
                  </span>
                </div>

                {/* Scrollable roles */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {section.roles.map((role, rIdx) => {
                    const count = getRoleUserCount(role.id);
                    return (
                      <div key={role.id} className="flex items-center pr-[8px]">
                        <div className="flex-1 min-w-0">
                          <DraggableRoleItem
                            role={role}
                            index={rIdx}
                            sectionTitle={section.title}
                            isSelected={role.id === selectedRoleId}
                            onSelect={() => setSelectedRoleId(role.id)}
                            onMoveRole={handleMoveRole}
                          />
                        </div>
                        {count > 0 && (
                          <button
                            onClick={() => {
                              const users = getUsersByRole(role.id);
                              const hasGiant = users.some(u => u.type === 'giant');
                              setRoleUserModal({ roleId: role.id, roleLabel: role.label });
                              setRoleModalTab(hasGiant ? 'giant' : 'vendor');
                            }}
                            className="shrink-0 min-w-[32px] h-[24px] flex items-center justify-center text-[13px] font-semibold text-[#005eb8] hover:underline hover:bg-[#e8f4fd] rounded-[4px] px-[4px] transition-colors"
                          >
                            {count}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* + 新增角色 按鈕 */}
          <div className="shrink-0 p-[12px] border-t border-[rgba(145,158,171,0.12)]">
            <button
              onClick={handleAddRoleOpen}
              className="w-full flex items-center justify-center gap-[6px] py-[8px] rounded-[8px] text-[13px] font-medium text-[#004680] border border-[#004680] hover:bg-[#e8f4fd] transition-colors"
            >
              <span className="text-[16px] leading-none">+</span>
              新增角色
            </button>
          </div>
        </div>


        {/* ── RIGHT PANEL: Permission Tree ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <div className="shrink-0 h-[56px] flex items-center justify-between px-[24px] border-b border-[rgba(145,158,171,0.12)]">
            <div className="flex items-center gap-[12px] min-w-0">
              <h3 className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1c252e] truncate">
                {selectedRoleLabel} 權限設定
              </h3>
              <span className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[13px] text-[#919eab] shrink-0">
                {checkedCount} / {totalCount}
              </span>
              {/* Save feedback */}
              {saveMessage && (
                <span className="text-[13px] text-[#22c55e] font-medium animate-pulse shrink-0">
                  {saveMessage}
                </span>
              )}
            </div>

            <div className="flex items-center gap-[8px] shrink-0">
              {/* Reset button */}
              <button
                onClick={handleReset}
                className="border border-[rgba(145,158,171,0.32)] text-[#637381] hover:bg-[rgba(145,158,171,0.08)] rounded-[8px] h-[32px] px-[16px] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] leading-none transition-colors cursor-pointer"
              >
                重置
              </button>
              {/* Save button */}
              <button
                onClick={handleSave}
                className="bg-[#1c252e] hover:bg-[#2c3540] text-white rounded-[8px] h-[32px] px-[16px] font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] leading-none transition-colors cursor-pointer"
              >
                儲存
              </button>
            </div>
          </div>

          {/* Tree content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-[16px] py-[8px]">
            {FEATURE_TREE.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                checkedSet={checkedSet}
                expandedSet={expandedSet}
                onToggleCheck={handleToggleCheck}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        </div>
      </div>
      </DndProvider>
      </div>

      {/* ── 新增角色 Dialog ── */}
      {showAddRoleDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] shadow-2xl w-[420px] max-w-[calc(100vw-32px)] p-[32px]">
            {/* Step 1：選擇角色類型 */}
            {addRoleStep === 1 && (
              <>
                <h2 className="font-semibold text-[18px] text-[#1c252e] mb-[8px]">新增角色</h2>
                <p className="text-[14px] text-[#637381] mb-[24px]">請選擇要新增的角色類型</p>
                <div className="flex gap-[12px] mb-[24px]">
                  {(['巨大', '廠商'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setAddRoleType(t)}
                      className={`flex-1 py-[16px] rounded-[12px] border-2 font-semibold text-[15px] transition-colors ${
                        addRoleType === t
                          ? 'border-[#004680] bg-[#e8f4fd] text-[#004680]'
                          : 'border-[#dfe3e8] text-[#637381] hover:bg-[#f4f6f8]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-[12px] justify-end">
                  <button onClick={() => setShowAddRoleDialog(false)} className="px-[20px] py-[8px] rounded-[8px] border border-[#dfe3e8] text-[#637381] text-[14px] hover:bg-[#f4f6f8]">取消</button>
                  <button onClick={() => setAddRoleStep(2)} className="px-[20px] py-[8px] rounded-[8px] bg-[#004680] text-white text-[14px] hover:bg-[#002d5a]">下一步</button>
                </div>
              </>
            )}

            {/* Step 2：輸入角色名稱 */}
            {addRoleStep === 2 && (
              <>
                <h2 className="font-semibold text-[18px] text-[#1c252e] mb-[4px]">新增{addRoleType}角色</h2>
                <p className="text-[13px] text-[#637381] mb-[20px]">輸入角色名稱（同分類中不可重複）</p>
                <div className="mb-[20px]">
                  <label className="block text-[13px] font-medium text-[#1c252e] mb-[6px]">角色名稱</label>
                  <input
                    type="text"
                    value={addRoleName}
                    onChange={e => handleAddRoleNameChange(e.target.value)}
                    placeholder="請輸入角色名稱"
                    className={`w-full px-[12px] py-[10px] rounded-[8px] border text-[14px] outline-none transition-colors ${
                      addRoleError ? 'border-[#ff4842] focus:border-[#ff4842]' : 'border-[#dfe3e8] focus:border-[#004680]'
                    }`}
                    autoFocus
                  />
                  {addRoleError && <p className="text-[12px] text-[#ff4842] mt-[4px]">{addRoleError}</p>}
                  {addRoleGacError && <p className="text-[12px] text-[#ff4842] mt-[4px]">{addRoleGacError}</p>}
                </div>
                <div className="flex gap-[12px] justify-between">
                  <button onClick={() => setAddRoleStep(1)} className="px-[16px] py-[8px] rounded-[8px] border border-[#dfe3e8] text-[#637381] text-[14px] hover:bg-[#f4f6f8]">上一步</button>
                  <div className="flex gap-[8px]">
                    <button onClick={() => setShowAddRoleDialog(false)} className="px-[16px] py-[8px] rounded-[8px] border border-[#dfe3e8] text-[#637381] text-[14px] hover:bg-[#f4f6f8]">取消</button>
                  <button
                      onClick={handleStep2Confirm}
                      disabled={!addRoleName.trim() || !!addRoleError || addRoleLoading}
                      className="px-[20px] py-[8px] rounded-[8px] bg-[#004680] text-white text-[14px] hover:bg-[#002d5a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-[8px]"
                    >
                      {addRoleLoading && <span className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {addRoleLoading ? 'GAC 驗證中…' : '確認'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3：GAC 沒有此角色 — 警示頁 */}
            {addRoleStep === 3 && (
              <>
                <div className="flex items-center gap-[10px] mb-[16px]">
                  <div className="w-[36px] h-[36px] flex items-center justify-center rounded-full bg-[#fff7ed] shrink-0">
                    <span className="text-[20px]">⚠️</span>
                  </div>
                  <h2 className="font-semibold text-[18px] text-[#1c252e]">請至 GAC 增加角色 Attribute</h2>
                </div>
                <p className="text-[14px] text-[#637381] mb-[4px]">您想建立的角色：</p>
                <p className="text-[16px] font-semibold text-[#004680] mb-[16px]">「{addRoleName}」（{addRoleType}）</p>
                <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] p-[16px] mb-[24px]">
                  <p className="text-[13px] font-semibold text-[#9a3412] mb-[6px]">此角色尚未在 GAC 建立 Attribute</p>
                  <p className="text-[13px] text-[#9a3412]">請至 <strong>GAC 系統</strong>建立「{addRoleName}」的 Attribute 後，再回來重新嘗試建立。</p>
                </div>
                <div className="flex gap-[12px] justify-between">
                  <button onClick={() => setAddRoleStep(2)} className="px-[16px] py-[8px] rounded-[8px] border border-[#dfe3e8] text-[#637381] text-[14px] hover:bg-[#f4f6f8]">返回修改</button>
                  <button onClick={() => setShowAddRoleDialog(false)} className="px-[20px] py-[8px] rounded-[8px] bg-[#1c252e] text-white text-[14px] hover:bg-[#2c3540]">了解</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 角色警示 Modal ── */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAlertModal(false)}>
          <div className="bg-white rounded-[16px] shadow-2xl w-[620px] max-w-[calc(100vw-32px)] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[#f0f0f0]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-[#ff4842] shrink-0">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                    <rect x="3.5" y="0" width="3" height="8.5" rx="1.5" fill="white"/>
                    <rect x="3.5" y="11" width="3" height="3" rx="1.5" fill="white"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-[16px] text-[#1c252e]">人員角色提醒</h3>
              </div>
              <button onClick={() => setShowAlertModal(false)} className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f4f6f8] text-[#637381]">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[20px]">

              {/* Section 1: GAC 角色異動 */}
              {syncAlerts.length > 0 && (() => {
                // 從 syncAlerts 彙整所有受影響使用者（去重）
                const allAffected = new Map<string, { userId: string; userName: string; account: string; type: 'giant' | 'vendor'; companyName?: string }>();
                syncAlerts.forEach(alert => {
                  (alert.affectedUsers ?? []).forEach(u => { allAffected.set(u.userId, u); });
                });
                const giantAffected = [...allAffected.values()].filter(u => u.type === 'giant');
                const vendorAffected = [...allAffected.values()].filter(u => u.type === 'vendor');
                // 若舊格式資料沒有 affectedUsers，不顯示空白區塊
                if (allAffected.size === 0) return null;
                return (
                  <div>
                    <p className="text-[13px] font-semibold text-[#1c252e] mb-[4px] whitespace-nowrap">以下角色已在 GAC 移除，受影響使用者的角色已自動清空，請確認角色身分</p>
                    <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] p-[16px] flex flex-col gap-[12px]">
                      {/* 受影響人數摘要（與連結數一致） */}
                      <p className="text-[12px] font-semibold text-[#9a3412]">
                        {giantAffected.length > 0 && `巨大受影響人數：${giantAffected.length}人`}
                        {giantAffected.length > 0 && vendorAffected.length > 0 && '、'}
                        {vendorAffected.length > 0 && `廠商受影響人數：${vendorAffected.length}人`}
                      </p>
                      {giantAffected.length > 0 && (
                        <div className="text-[13px] text-[#9a3412] flex flex-wrap gap-x-[4px] items-baseline">
                          <span className="font-medium shrink-0">巨大：</span>
                          {giantAffected.map((u, i) => (
                            <span key={u.userId}>
                              <button
                                onClick={() => {
                                  setPendingNavUser({ userName: u.userName, account: u.account, type: 'giant' });
                                  setShowAlertModal(false);
                                  onPageChange('giant-account-management');
                                }}
                                className="text-[#005eb8] underline hover:text-[#002d5a] font-medium"
                              >{u.userName}</button>
                              {i < giantAffected.length - 1 && <span className="text-[#9a3412]">、</span>}
                            </span>
                          ))}
                        </div>
                      )}
                      {vendorAffected.length > 0 && (
                        <div className="text-[13px] text-[#9a3412] flex flex-wrap gap-x-[4px] items-baseline">
                          <span className="font-medium shrink-0">廠商：</span>
                          {vendorAffected.map((u, i) => (
                            <span key={u.userId}>
                              <button
                                onClick={() => {
                                  setPendingNavUser({ userName: u.userName, account: u.account, type: 'vendor', companyName: u.companyName });
                                  setShowAlertModal(false);
                                  onPageChange('vendor-account-review');
                                }}
                                className="text-[#005eb8] underline hover:text-[#002d5a] font-medium"
                              >{u.userName}{u.companyName ? ` (${u.companyName})` : ''}</button>
                              {i < vendorAffected.length - 1 && <span className="text-[#9a3412]">、</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                );
              })()}

              {/* Section 2: 未設定角色 */}
              {noRoleUsers.length > 0 && (() => {
                const giantNoRole = noRoleUsers.filter(u => u.type === 'giant');
                const vendorNoRole = noRoleUsers.filter(u => u.type === 'vendor');
                return (
                  <div>
                    <p className="text-[13px] font-semibold text-[#1c252e] mb-[4px]">尚未設定角色的人員帳號</p>
                    <div className="bg-[#fff1f2] border border-[#fecaca] rounded-[10px] p-[16px] flex flex-col gap-[8px]">
                      {giantNoRole.length > 0 && (
                        <div className="text-[13px] text-[#991b1b] flex flex-wrap gap-x-[4px] items-baseline">
                          <span className="font-medium shrink-0">巨大：</span>
                          {giantNoRole.map((u, i) => (
                            <span key={u.userId}>
                              <button
                                onClick={() => {
                                  setPendingNavUser({ userName: u.userName, account: u.account, type: 'giant' });
                                  setShowAlertModal(false);
                                  onPageChange('giant-account-management');
                                }}
                                className="text-[#005eb8] underline hover:text-[#002d5a] font-medium"
                              >{u.userName}</button>
                              {i < giantNoRole.length - 1 && <span className="text-[#991b1b]">、</span>}
                            </span>
                          ))}
                        </div>
                      )}
                      {vendorNoRole.length > 0 && (
                        <div className="text-[13px] text-[#991b1b] flex flex-wrap gap-x-[4px] items-baseline">
                          <span className="font-medium shrink-0">廠商：</span>
                          {vendorNoRole.map((u, i) => (
                            <span key={u.userId}>
                              <button
                                onClick={() => {
                                  setPendingNavUser({ userName: u.userName, account: u.account, type: 'vendor', companyName: u.companyName });
                                  setShowAlertModal(false);
                                  onPageChange('vendor-account-review');
                                }}
                                className="text-[#005eb8] underline hover:text-[#002d5a] font-medium"
                              >{u.userName}{u.companyName ? ` (${u.companyName})` : ''}</button>
                              {i < vendorNoRole.length - 1 && <span className="text-[#991b1b]">、</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Footer */}
            <div className="shrink-0 px-[24px] py-[16px] border-t border-[#f0f0f0] flex justify-end">
              <button onClick={() => setShowAlertModal(false)} className="px-[16px] py-[7px] rounded-[8px] bg-[#1c252e] text-white text-[13px] hover:bg-[#2c3540]">確認</button>
            </div>
          </div>
        </div>
      )}


      {/* ── 角色人數 Modal ── */}
      {roleUserModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setRoleUserModal(null)}>
          <div className="bg-white rounded-[16px] shadow-2xl w-[560px] max-w-[calc(100vw-32px)] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[#f0f0f0]">
              <div>
                <h3 className="font-semibold text-[16px] text-[#1c252e]">{roleUserModal.roleLabel} 角色使用者</h3>
                <p className="text-[13px] text-[#637381]">共 {roleModalUsers.length} 人</p>
              </div>
              <button onClick={() => setRoleUserModal(null)} className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f4f6f8] text-[#637381]">✕</button>
            </div>
            {/* Type Tabs */}
            {(() => {
              const [activeTab, setActiveTab] = [roleModalTab, setRoleModalTab];
              const giantUsers = roleModalUsers.filter(u => u.type === 'giant');
              const vendorUsers = roleModalUsers.filter(u => u.type === 'vendor');
              const tabs: { key: 'giant' | 'vendor'; label: string; count: number }[] = [
                { key: 'giant',  label: '巨大',  count: giantUsers.length },
                { key: 'vendor', label: '廠商',  count: vendorUsers.length },
              ];
              const displayUsers = activeTab === 'giant' ? giantUsers : vendorUsers;
              return (
                <>
                  {/* Tab 切換列 */}
                  <div className="flex border-b border-[#f0f0f0] px-[16px]">
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-[6px] px-[16px] py-[12px] text-[13px] font-medium border-b-2 transition-colors ${
                          activeTab === tab.key
                            ? 'border-[#004680] text-[#004680]'
                            : 'border-transparent text-[#637381] hover:text-[#1c252e]'
                        }`}
                      >
                        {tab.label}
                        <span className={`text-[11px] px-[6px] py-[1px] rounded-full ${
                          activeTab === tab.key ? 'bg-[#e8f4fd] text-[#004680]' : 'bg-[#f4f6f8] text-[#919eab]'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* User list */}
                  <div className="flex-1 overflow-y-auto p-[16px]">
                    {displayUsers.length === 0 ? (
                      <p className="text-center text-[14px] text-[#919eab] py-[32px]">此分類目前無使用者</p>
                    ) : (
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-[#f0f0f0]">
                            <th className="text-left py-[8px] px-[12px] text-[#637381] font-medium">姓名</th>
                            <th className="text-left py-[8px] px-[12px] text-[#637381] font-medium">帳號</th>
                            {activeTab !== 'giant' && <th className="text-left py-[8px] px-[12px] text-[#637381] font-medium">類型</th>}
                            <th className="text-left py-[8px] px-[12px] text-[#637381] font-medium">狀態</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayUsers.map(u => (
                            <tr key={u.userId} className="border-b border-[#f9f9f9] hover:bg-[#f8fafc]">
                              <td className="py-[10px] px-[12px] font-medium text-[#1c252e]">{u.userName}</td>
                              <td className="py-[10px] px-[12px] text-[#637381]">{u.account}</td>
                              {activeTab !== 'giant' && (
                                <td className="py-[10px] px-[12px] text-[#637381]">
                                  {u.type === 'giant' ? '巨大' : `廠商 / ${u.companyName ?? ''}`}
                                </td>
                              )}
                              <td className="py-[10px] px-[12px]">
                                <span className={`inline-flex items-center px-[8px] py-[2px] rounded-full text-[11px] font-medium ${
                                  u.status === 'active' ? 'bg-[#e9fcd4] text-[#229a16]' : 'bg-[#f4f6f8] text-[#919eab]'
                                }`}>
                                  {u.status === 'active' ? '啟用' : '停用'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

    </ResponsivePageLayout>
  );
}
