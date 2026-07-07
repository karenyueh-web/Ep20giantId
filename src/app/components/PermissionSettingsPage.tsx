import { ResponsivePageLayout } from './ResponsivePageLayout';
import type { PageType } from './MainLayout';
import { CheckboxIcon } from './CheckboxIcon';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
            children: [
              { id: 'overview-receiving-tab-shipped', label: '已出貨未收料' },
              { id: 'overview-receiving-tab-unshipped', label: '應出貨未出貨' },
              { id: 'overview-receiving-tab-outsource', label: '委外加工單狀況' },
            ],
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
          { id: 'mgmt-system-permission', label: '權限設定' },
          { id: 'mgmt-system-schedule', label: '排程設定' },
        ],
      },
    ],
  },
];

// ─── Role Data ───────────────────────────────────────────────────────────────

const INITIAL_ROLE_SECTIONS: RoleSection[] = [
  {
    title: '巨大',
    dotColor: '#005eb8',
    roles: [
      { id: 'giant-gtm-purchase', label: 'GTM採購' },
      { id: 'giant-other-purchase', label: '其它區採購' },
      { id: 'giant-youth-purchase', label: '幼獅採購' },
      { id: 'giant-gtm-warehouse', label: 'GTM倉儲' },
      { id: 'giant-bulk-purchase', label: '整採' },
      { id: 'giant-qa', label: '品保' },
      { id: 'giant-developer', label: '開發人員' },
      { id: 'giant-gtm-production', label: 'GTM生管' },
      { id: 'giant-finance', label: '財務' },
      { id: 'giant-it', label: 'IT' },
    ],
  },
  {
    title: '廠商',
    dotColor: '#22c55e',
    roles: [
      { id: 'vendor-sales', label: '業務' },
      { id: 'vendor-qa', label: '品保' },
      { id: 'vendor-subcontractor', label: '下包商' },
      { id: 'vendor-developer', label: '開發人員' },
    ],
  },
];

const ROLE_ORDER_STORAGE_KEY = 'permission-role-order';

function loadRoleSections(): RoleSection[] {
  try {
    const stored = localStorage.getItem(ROLE_ORDER_STORAGE_KEY);
    if (stored) {
      const orderMap = JSON.parse(stored) as Record<string, string[]>;
      return INITIAL_ROLE_SECTIONS.map((section) => {
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
  return INITIAL_ROLE_SECTIONS;
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
      title="權限設定"
      breadcrumb="系統設定 • 權限設定"
    >
      {/* Wrapper to fill content area */}
      <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 180px)' }}>
      <DndProvider backend={HTML5Backend}>
      {/* Main card */}
      <div className="bg-white rounded-[16px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT PANEL: Role Selector ── */}
        <div className="w-[280px] shrink-0 flex flex-col border-r border-[rgba(145,158,171,0.12)]">
          {/* Header */}
          <div className="shrink-0 h-[56px] flex items-center px-[20px] border-b border-[rgba(145,158,171,0.12)]">
            <h3 className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1c252e]">
              角色選擇
            </h3>
          </div>

          {/* Role list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {roleSections.map((section, sIdx) => (
              <div key={section.title}>
                {/* Section divider (between sections) */}
                {sIdx > 0 && (
                  <div className="mx-[16px] border-t border-[rgba(145,158,171,0.12)]" />
                )}

                {/* Section header */}
                <div className="flex items-center gap-[8px] px-[20px] pt-[16px] pb-[8px]">
                  <div
                    className="w-[8px] h-[8px] rounded-full shrink-0"
                    style={{ backgroundColor: section.dotColor }}
                  />
                  <span className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[13px] leading-[20px] text-[#919eab] uppercase tracking-[0.5px]">
                    {section.title}
                  </span>
                </div>

                {/* Draggable Roles */}
                {section.roles.map((role, rIdx) => (
                  <DraggableRoleItem
                    key={role.id}
                    role={role}
                    index={rIdx}
                    sectionTitle={section.title}
                    isSelected={role.id === selectedRoleId}
                    onSelect={() => setSelectedRoleId(role.id)}
                    onMoveRole={handleMoveRole}
                  />
                ))}
              </div>
            ))}
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
    </ResponsivePageLayout>
  );
}
