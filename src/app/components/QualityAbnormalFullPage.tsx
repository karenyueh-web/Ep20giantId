import { QualityAbnormalPage } from './QualityAbnormalPage';
import type { PageType } from './MainLayout';
import { ResponsivePageLayout } from './ResponsivePageLayout';

interface QualityAbnormalFullPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
  userRole?: string;
}

export function QualityAbnormalFullPage({ currentPage, onPageChange, onLogout, userRole }: QualityAbnormalFullPageProps) {
  return (
    <ResponsivePageLayout
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      userRole={userRole}
      title="品質異常單"
      breadcrumb="品保作業 • 品質異常單"
    >
      <QualityAbnormalPage />
    </ResponsivePageLayout>
  );
}