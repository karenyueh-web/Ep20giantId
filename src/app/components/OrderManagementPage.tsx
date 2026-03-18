import { OrderListWithTabs } from './OrderListWithTabs';
import { ReturnOrderListWithTabs } from './ReturnOrderListWithTabs';
import { ExchangeOrderListWithTabs } from './ExchangeOrderListWithTabs';
import { HistoryOrderListWithTabs } from './HistoryOrderListWithTabs';
import { ForecastOrderListWithTabs } from './ForecastOrderListWithTabs';
import { ScheduleChangeListWithTabs } from './ScheduleChangeListWithTabs';
import type { PageType } from './MainLayout';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface OrderManagementPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: 'vendor' | 'purchaser' | 'giant';
}

const pageInfo: Record<string, { title: string; breadcrumb: string }> = {
  'order-list':             { title: '一般訂單查詢',   breadcrumb: '訂單管理 • 一般訂單查詢' },
  'order-forecast':         { title: '預測訂單查詢',   breadcrumb: '訂單管理 • 預測訂單查詢' },
  'order-exchange':         { title: '換貨(J)單據查詢', breadcrumb: '訂單管理 • 換貨(J)單據查詢' },
  'order-return':           { title: '退貨單據查詢',   breadcrumb: '訂單管理 • 退貨單據查詢' },
  'order-history':          { title: '歷史訂單查詢',   breadcrumb: '訂單管理 • 歷史訂單查詢' },
  'order-schedule-change':  { title: '變更生管排程',   breadcrumb: '訂單管理 • 變更生管排程' },
};

export function OrderManagementPage({ currentPage, onPageChange, onLogout, userRole }: OrderManagementPageProps) {
  const info = pageInfo[currentPage];

  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title={info.title}
      breadcrumb={info.breadcrumb}
    >
      {currentPage === 'order-return'
        ? <ReturnOrderListWithTabs userRole={userRole} />
        : currentPage === 'order-exchange'
          ? <ExchangeOrderListWithTabs userRole={userRole} />
          : currentPage === 'order-history'
            ? <HistoryOrderListWithTabs />
            : currentPage === 'order-forecast'
              ? <ForecastOrderListWithTabs />
              : currentPage === 'order-schedule-change'
                ? <ScheduleChangeListWithTabs userRole={userRole} />
                : <OrderListWithTabs userRole={userRole} />
      }
    </ResponsivePageLayout>
  );
}