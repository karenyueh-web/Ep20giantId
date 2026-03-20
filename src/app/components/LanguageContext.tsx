import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = '繁中' | '簡中' | 'English';

// ===== 翻譯字典 =====
const translations: Record<string, Record<Language, string>> = {
  // ---- 共用 ----
  'common.confirm': {
    '繁中': '確認',
    '簡中': '确认',
    'English': 'Confirm',
  },
  'common.cancel': {
    '繁中': '取消',
    '簡中': '取消',
    'English': 'Cancel',
  },
  'common.passwordMismatch': {
    '繁中': '密碼不一致，請重新確認',
    '簡中': '密码不一致，请重新确认',
    'English': 'Passwords do not match, please re-confirm',
  },

  // ---- 登入頁 ----
  'login.title': {
    '繁中': '巨大線上供應商作業平台',
    '簡中': '巨大线上供应商作业平台',
    'English': 'Giant Group Online Vendor Operation Platform',
  },
  'login.subtitle': {
    '繁中': 'Welcome to Giant Group vendor online\noperation platform',
    '簡中': 'Welcome to Giant Group vendor online\noperation platform',
    'English': 'Welcome to Giant Group vendor online\noperation platform',
  },
  'login.idLabel': {
    '繁中': '帳號',
    '簡中': '账号',
    'English': 'ID',
  },
  'login.passwordLabel': {
    '繁中': '密碼',
    '簡中': '密码',
    'English': 'Password',
  },
  'login.idPlaceholder': {
    '繁中': '請輸入帳號',
    '簡中': '请输入账号',
    'English': 'demo@minimals.cc',
  },
  'login.passwordPlaceholder': {
    '繁中': '請輸入密碼',
    '簡中': '请输入密码',
    'English': '6+ characters',
  },
  'login.signIn': {
    '繁中': '登入',
    '簡中': '登录',
    'English': 'Sign in',
  },
  'login.register': {
    '繁中': '我要註冊',
    '簡中': '我要注册',
    'English': 'Register',
  },
  'login.forgotPassword': {
    '繁中': '忘記密碼',
    '簡中': '忘记密码',
    'English': 'Forgot Password',
  },
  'login.error': {
    '繁中': '帳號或密碼錯誤，請重新輸入。',
    '簡中': '账号或密码错误，请重新输入。',
    'English': 'Incorrect ID or password, please re-enter.',
  },
  'login.language': {
    '繁中': '語言',
    '簡中': '语言',
    'English': 'Language',
  },

  // ---- 註冊頁 ----
  'register.inputInfo': {
    '繁中': '請輸入下申請資訊',
    '簡中': '请输入以下申请信息',
    'English': 'Please enter the following application information',
  },
  'register.backToLogin': {
    '繁中': '返回登入',
    '簡中': '返回登录',
    'English': 'Back to Login',
  },
  'register.nameLabel': {
    '繁中': '姓名',
    '簡中': '姓名',
    'English': 'Name',
  },
  'register.namePlaceholder': {
    '繁中': '五佰',
    '簡中': '五佰',
    'English': 'Your name',
  },
  'register.companyLabel': {
    '繁中': '請選擇公司',
    '簡中': '请选择公司',
    'English': 'Select Company',
  },
  'register.companyPlaceholder': {
    '繁中': '請選擇廠商公司',
    '簡中': '请选择厂商公司',
    'English': 'Select vendor company',
  },
  'register.other': {
    '繁中': '其他',
    '簡中': '其他',
    'English': 'Other',
  },
  'register.otherCompanyLabel': {
    '繁中': '其他公司名稱',
    '簡中': '其他公司名称',
    'English': 'Other Company Name',
  },
  'register.otherCompanyPlaceholder': {
    '繁中': '請輸入公司名稱',
    '簡中': '请输入公司名称',
    'English': 'Enter company name',
  },
  'register.roleLabel': {
    '繁中': '申請角色',
    '簡中': '申请角色',
    'English': 'Apply Role',
  },
  'register.role.sales': {
    '繁中': '業務',
    '簡中': '业务',
    'English': 'Sales',
  },
  'register.role.qa': {
    '繁中': '品保',
    '簡中': '品保',
    'English': 'QA',
  },
  'register.role.dev': {
    '繁中': '開發',
    '簡中': '开发',
    'English': 'Development',
  },
  'register.role.subcontractor': {
    '繁中': '下包商',
    '簡中': '下包商',
    'English': 'Subcontractor',
  },
  'register.giantContactLabel': {
    '繁中': '巨大窗口',
    '簡中': '巨大窗口',
    'English': 'Giant Contact',
  },
  'register.giantContactPlaceholder': {
    '繁中': '請選擇窗口姓名',
    '簡中': '请选择窗口姓名',
    'English': 'Select contact name',
  },
  'register.emailLabel': {
    '繁中': 'email(視同帳號)',
    '簡中': 'email(视同账号)',
    'English': 'Email (as account ID)',
  },
  'register.passwordLabel': {
    '繁中': '密碼',
    '簡中': '密码',
    'English': 'Password',
  },
  'register.confirmPasswordLabel': {
    '繁中': '確認密碼',
    '簡中': '确认密码',
    'English': 'Confirm Password',
  },
  'register.passwordPlaceholder': {
    '繁中': '請輸入密碼（6碼以上）',
    '簡中': '请输入密码（6码以上）',
    'English': '6+ characters',
  },
  'register.createAccount': {
    '繁中': '建立帳號',
    '簡中': '创建账号',
    'English': 'Create account',
  },
  'register.alertTitle': {
    '繁中': '欄位必填提醒',
    '簡中': '字段必填提醒',
    'English': 'Required Fields Reminder',
  },
  'register.alertMessage': {
    '繁中': '請填寫所有必填欄位後再進行註冊。未填寫的欄位已標示為紅框。',
    '簡中': '请填写所有必填字段后再进行注册。未填写的字段已标示为红框。',
    'English': 'Please fill in all required fields before registering. Unfilled fields are highlighted in red.',
  },

  // ---- 忘記密碼頁 ----
  // Frame 1: 輸入 email
  'forgot.title': {
    '繁中': 'Forgot your password?',
    '簡中': 'Forgot your password?',
    'English': 'Forgot your password?',
  },
  'forgot.enterEmailDesc': {
    '繁中': '請輸入您的帳號email，我們將寄重置流程至您的信箱',
    '簡中': '请输入您的账号email，我们将寄重置流程至您的信箱',
    'English': 'Enter your account email and we will send you a password reset link.',
  },
  'forgot.emailLabel': {
    '繁中': 'Email address',
    '簡中': 'Email address',
    'English': 'Email address',
  },
  'forgot.sendRequest': {
    '繁中': '送出請求',
    '簡中': '发送请求',
    'English': 'Send request',
  },
  'forgot.returnToSignIn': {
    '繁中': '返回登入',
    '簡中': '返回登录',
    'English': 'Return to sign in',
  },
  'forgot.errorEmpty': {
    '繁中': '請輸入 email',
    '簡中': '请输入 email',
    'English': 'Please enter email',
  },
  'forgot.errorInvalid': {
    '繁中': '請輸入有效的 email 格式',
    '簡中': '请输入有效的 email 格式',
    'English': 'Please enter a valid email format',
  },

  // Frame 2: 寄信成功
  'forgot.checkEmail': {
    '繁中': 'Please check your email!',
    '簡中': 'Please check your email!',
    'English': 'Please check your email!',
  },
  'forgot.emailSentDesc': {
    '繁中': '寄送成功，請至email收信',
    '簡中': '发送成功，请至email收信',
    'English': 'Email sent successfully, please check your inbox.',
  },
  'forgot.dontHaveMail': {
    '繁中': "Don't have a mail? ",
    '簡中': "没收到邮件？",
    'English': "Don't have a mail? ",
  },
  'forgot.resendMail': {
    '繁中': '重新寄送',
    '簡中': '重新发送',
    'English': 'Resend mail',
  },
  'forgot.simulateResetLink': {
    '繁中': '模擬：點擊信件中的重置密碼連結',
    '簡中': '模拟：点击邮件中的重置密码链接',
    'English': 'Simulate: Click the reset password link in email',
  },

  // Frame 3: 重置密碼
  'forgot.resetTitle': {
    '繁中': 'Please reset password',
    '簡中': 'Please reset password',
    'English': 'Please reset password',
  },
  'forgot.resetDesc': {
    '繁中': '請重置密碼',
    '簡中': '请重置密码',
    'English': 'Please reset your password',
  },
  'forgot.passwordLabel': {
    '繁中': '密碼',
    '簡中': '密码',
    'English': 'Password',
  },
  'forgot.confirmPasswordLabel': {
    '繁中': '確認新密碼',
    '簡中': '确认新密码',
    'English': 'Confirm New Password',
  },
  'forgot.updatePassword': {
    '繁中': '更新密碼',
    '簡中': '更新密码',
    'English': 'Update password',
  },
  'forgot.successTitle': {
    '繁中': '密碼重置成功',
    '簡中': '密码重置成功',
    'English': 'Password Reset Successful',
  },
  'forgot.successMessage': {
    '繁中': '您的密碼已成功更新，請使用新密碼重新登入。',
    '簡中': '您的密码已成功更新，请使用新密码重新登录。',
    'English': 'Your password has been updated. Please sign in with your new password.',
  },
  'forgot.backToLogin': {
    '繁中': '返回登入',
    '簡中': '返回登录',
    'English': 'Back to Login',
  },

  // 查無帳號
  'forgot.noAccountTitle': {
    '繁中': '查無此帳號',
    '簡中': '查无此账号',
    'English': 'Account Not Found',
  },
  'forgot.noAccountMessage': {
    '繁中': '此 email 尚未註冊帳號，請前往註冊頁面建立新帳號。',
    '簡中': '此 email 尚未注册账号，请前往注册页面创建新账号。',
    'English': 'This email is not registered. Please go to the registration page to create a new account.',
  },
  'forgot.goToRegister': {
    '繁中': '前往註冊',
    '簡中': '前往注册',
    'English': 'Go to Register',
  },
};

// ===== Context =====
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: '繁中',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language');
      if (saved === '繁中' || saved === '簡中' || saved === 'English') {
        return saved;
      }
    } catch (e) { /* ignore */ }
    return '繁中';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch (e) { /* ignore */ }
  };

  const t = useCallback((key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] ?? entry['繁中'] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
