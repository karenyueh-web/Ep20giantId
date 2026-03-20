import { CorrectionListWithTabs } from './CorrectionListWithTabs';
import type { UserRole } from '@/app/App';

interface HistoryCorrectionListPageProps {
  userRole: UserRole;
}

export function HistoryCorrectionListPage({ userRole }: HistoryCorrectionListPageProps) {
  return <CorrectionListWithTabs userRole={userRole} historyMode={true} />;
}
