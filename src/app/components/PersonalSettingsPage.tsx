import { EmployeeAccountSettingPage } from './EmployeeAccountSettingPage';
import type { PageType } from './MainLayout';

interface PersonalSettingsPageProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

export function PersonalSettingsPage({ 
  currentPage, 
  onPageChange, 
  onLogout
}: PersonalSettingsPageProps) {
  const currentUserEmail = localStorage.getItem('currentUserEmail') || 'g00106917@giant.com';
  const currentUserAccount = currentUserEmail.split('@')[0].toUpperCase();
  const currentUserName = '李宜瑾-Evelyn Lee';

  return (
    <EmployeeAccountSettingPage 
      currentPage={currentPage}
      onPageChange={onPageChange}
      onLogout={onLogout}
      employeeName={currentUserName}
      employeeAccount={currentUserAccount}
      onBack={() => onPageChange('dashboard')}
    />
  );
}