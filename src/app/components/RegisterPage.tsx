import { useState } from 'react';
import svgPaths from "@/imports/svg-9lma1oefe7";
import svgPathsLogin from "@/imports/svg-r41nrf93no";
import imgImage from "@/assets/login-bg.png";
import img02GiantGroupLogoWhite2 from "@/assets/giant-logo-white.png";
import { DropdownSelect } from './DropdownSelect';
import { useLanguage } from './LanguageContext';

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
  onBackToLogin?: () => void;
}

function Image() {
  return (
    <div className="relative rounded-tr-[80px] shrink-0 w-2/5 self-stretch hidden lg:block" data-name="image">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tr-[80px]">
        <div className="absolute inset-0 overflow-hidden rounded-tr-[80px]">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${imgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: '68% 38%',
            }}
          />
        </div>
        <div className="absolute inset-0 rounded-tr-[80px]" style={{ backgroundImage: "linear-gradient(210deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.50) 100%)" }} />
      </div>
      <div className="absolute h-[146.257px] left-[127px] top-[407px] w-[466px]" data-name="02_Giant Group_Logo_White 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover opacity-60 pointer-events-none size-full" src={img02GiantGroupLogoWhite2} />
      </div>
    </div>
  );
}

function Stack2({ subtitle }: { subtitle: string }) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[352px]" data-name="stack">
      <p className="w-full font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic text-[#535862] text-[16px] text-center px-4">
        {subtitle.split('\n').map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}
      </p>
    </div>
  );
}

function Head({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="head">
      <p className="font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[38px] not-italic relative shrink-0 text-[#1c252e] text-[30px] text-center w-full">{title}</p>
      <Stack2 subtitle={subtitle} />
    </div>
  );
}

function Stack1({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="stack">
      <Head title={title} subtitle={subtitle} />
    </div>
  );
}

// TextField組件
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  error?: boolean;
  helperText?: string;
}

function TextField({ label, value, onChange, type = "text", placeholder, error = false, helperText }: TextFieldProps) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
        <div aria-hidden="true" className={`absolute border ${error ? 'border-red-500 border-2' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`} />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] relative size-full">
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-[1_0_0] font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap bg-transparent outline-none placeholder:text-[#919eab]"
            />
            <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
              <p className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 ${error ? 'text-red-500' : 'text-[#637381]'} text-[12px]`}>{label}</p>
            </div>
          </div>
        </div>
      </div>
      {helperText && (
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-red-500 mt-[4px] ml-[14px]">{helperText}</p>
      )}
    </div>
  );
}

// Password Field with Eye Icon
function PasswordField({ label, value, onChange, placeholder, error = false, helperText }: TextFieldProps & { helperText?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <div className={`h-[54px] relative rounded-[8px] shrink-0 w-full`} data-name="wrap">
        <div aria-hidden="true" className={`absolute border ${error ? 'border-red-500 border-2' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`} />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] relative size-full">
            <input
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap bg-transparent outline-none placeholder:text-[#919eab]"
            />
            <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
              <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 ${error ? 'text-red-500' : 'text-[#637381]'} text-[12px]`}>{label}</p>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px] cursor-pointer hover:bg-gray-100 transition-colors"
                data-name="✳️ end adornment"
              >
                <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:eye-closed-bold">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g id="icons/solid/ic-solar:eye-closed-bold">
                      <path clipRule="evenodd" d={svgPathsLogin.p2349d00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
                    </g>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {helperText && (
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-red-500 mt-[4px] ml-[14px]">{helperText}</p>
      )}
    </div>
  );
}

// 巨大窗口選項 mock data
const giantContactOptions = [
  { value: '王大明', label: '王大明' },
  { value: '林小華', label: '林小華' },
  { value: '陳志偉', label: '陳志偉' },
  { value: '張美玲', label: '張美玲' },
  { value: '李建宏', label: '李建宏' },
  { value: '黃雅琪', label: '黃雅琪' },
  { value: '劉家豪', label: '劉家豪' },
  { value: '吳淑芬', label: '吳淑芬' },
  { value: '蔡宗翰', label: '蔡宗翰' },
  { value: '許惠婷', label: '許惠婷' },
];

// 廠商公司選項 mock data
const companyOptions = [
  { value: '__other__', label: '其他' },
  { value: '台灣精密工業股份有限公司', label: '台灣精密工業股份有限公司' },
  { value: '大華金屬製造有限公司', label: '大華金屬製造有限公司' },
  { value: '聯合電子科技股份有限公司', label: '聯合電子科技股份有限公司' },
  { value: '永豐機械工業有限公司', label: '永豐機械工業有限公司' },
  { value: '正新橡膠工業股份有限公司', label: '正新橡膠工業股份有限公司' },
  { value: '建大工業股份有限公司', label: '建大工業股份有限公司' },
  { value: '桂盟企業股份有限公司', label: '桂盟企業股份有限公司' },
  { value: '維格車業股份有限公司', label: '維格車業股份有限公司' },
  { value: '日馳企業股份有限公司', label: '日馳企業股份有限公司' },
  { value: '利奇機械工業股份有限公司', label: '利奇機械工業股份有限公司' },
  { value: '鋐光實業股份有限公司', label: '鋐光實業股份有限公司' },
  { value: '彥豪金屬工業股份有限公司', label: '彥豪金屬工業股份有限公司' },
];

// 角色選擇器 (Dropdown with chips)
function RoleSelector({ selectedRoles, onRolesChange, error = false, roleLabel, roleNames }: { selectedRoles: string[]; onRolesChange: (roles: string[]) => void; error?: boolean; roleLabel: string; roleNames: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      onRolesChange(selectedRoles.filter(r => r !== role));
    } else {
      onRolesChange([...selectedRoles, role]);
    }
  };

  const removeRole = (role: string) => {
    onRolesChange(selectedRoles.filter(r => r !== role));
  };

  return (
    <div className="h-[54px] relative shrink-0 w-full" data-name="stack">
      <div className="absolute content-stretch flex h-[54px] items-center left-0 px-[14px] rounded-[8px] top-0 w-full cursor-pointer" data-name="wrap" onClick={() => setIsOpen(!isOpen)}>
        <div aria-hidden="true" className={`absolute border ${error ? 'border-red-500 border-2' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`} />
        <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
          <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
          <p className={`font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[12px] relative shrink-0 ${error ? 'text-red-500' : 'text-[#637381]'} text-[12px]`}>{roleLabel}</p>
        </div>
        <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
          <div className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px]" data-name="end adornment">
            <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-eva:arrow-ios-downward-fill">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <g id="icons/solid/ic-eva:arrow-ios-downward-fill">
                  <path d={svgPaths.p3a1c00f0} fill="var(--fill-0, #637381)" id="primary-shape" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {selectedRoles.length > 0 && (
        <div className="absolute content-stretch flex gap-[9px] items-center left-[14px] top-[14px] pointer-events-none">
          {selectedRoles.map(role => (
            <div key={role} className="bg-[rgba(0,94,184,0.08)] content-stretch flex h-[24px] items-center pl-[3px] pr-[5px] relative rounded-[8px] shrink-0" data-name="Chip">
              <div className="content-stretch flex items-start mr-[-2px] px-[5px] relative shrink-0" data-name="label container">
                <p className="font-['Public_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[18px] relative shrink-0 text-[#1c252e] text-[18px] text-center">{role}</p>
              </div>
              <div className="mr-[-2px] relative shrink-0 size-[20px] pointer-events-auto cursor-pointer" data-name="action" onClick={(e) => { e.stopPropagation(); removeRole(role); }}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <g opacity="0.48">
                    <path clipRule="evenodd" d={svgPaths.p9f8dc70} fill="var(--fill-0, #1C252E)" fillRule="evenodd" id="primary-shape" />
                  </g>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white rounded-[8px] shadow-lg border border-[rgba(145,158,171,0.16)] z-[101] overflow-hidden">
            {roleNames.map(role => (
              <div
                key={role}
                className={`px-[12px] py-[8px] cursor-pointer hover:bg-[#f4f6f8] transition-colors ${selectedRoles.includes(role) ? 'bg-[rgba(0,94,184,0.08)]' : ''}`}
                onClick={() => toggleRole(role)}
              >
                <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[14px] text-[#1c252e]">{role}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface AuthProps {
  onRegisterSuccess?: () => void;
  onBackToLogin?: () => void;
}

function Auth({ onRegisterSuccess, onBackToLogin }: AuthProps) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [giantContact, setGiantContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useLanguage();
  
  // 錯誤狀態
  const [errors, setErrors] = useState({
    name: false,
    companyName: false,
    customCompanyName: false,
    roles: false,
    giantContact: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // 密碼不一致錯誤
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  
  // 提醒對話框狀態
  const [showAlert, setShowAlert] = useState(false);

  // 判斷是否選擇「其他」
  const isOtherSelected = companyName === '__other__';

  // 取得最終公司名稱
  const getFinalCompanyName = () => {
    return isOtherSelected ? customCompanyName : companyName;
  };

  const handleRegister = () => {
    // 重置錯誤狀態
    const newErrors = {
      name: name.trim() === '',
      companyName: companyName.trim() === '',
      customCompanyName: isOtherSelected && customCompanyName.trim() === '',
      roles: selectedRoles.length === 0,
      giantContact: giantContact.trim() === '',
      email: email.trim() === '',
      password: password.trim() === '',
      confirmPassword: confirmPassword.trim() === ''
    };
    
    setErrors(newErrors);
    
    // 檢查是否有任何欄位未填寫
    const hasError = Object.values(newErrors).some(error => error);
    
    if (hasError) {
      // 顯示提醒對話框
      setShowAlert(true);
      return;
    }
    
    // 檢查密碼是否一致
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setErrors(prev => ({ ...prev, confirmPassword: true }));
      return;
    }

    setPasswordMismatch(false);
    
    // 所有欄位都已填寫，進行註冊
    const finalCompanyName = getFinalCompanyName();
    console.log('Register:', { name, companyName: finalCompanyName, selectedRoles, email, password });
    if (onRegisterSuccess) {
      onRegisterSuccess();
    }
  };

  return (
    <>
      <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[352px]" data-name="Auth">
        <Stack1 title={t('login.title')} subtitle={t('login.subtitle')} />
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
          <div className="min-w-[64px] relative shrink-0 w-full flex items-center" data-name="header">
            <p className="font-['Roboto:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[24px] text-[#637381] text-[16px] tracking-[0.15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {t('register.inputInfo')}
            </p>
          </div>

          <TextField
            label={t('register.nameLabel')}
            value={name}
            onChange={setName}
            placeholder={t('register.namePlaceholder')}
            error={errors.name}
          />
          
          <DropdownSelect
            label={t('register.companyLabel')}
            value={companyName}
            onChange={setCompanyName}
            options={companyOptions.map(opt => opt.value === '__other__' ? { ...opt, label: t('register.other') } : opt)}
            placeholder={t('register.companyPlaceholder')}
            error={errors.companyName}
            searchable
          />

          {isOtherSelected && (
            <TextField
              label={t('register.otherCompanyLabel')}
              value={customCompanyName}
              onChange={setCustomCompanyName}
              placeholder={t('register.otherCompanyPlaceholder')}
              error={errors.customCompanyName}
            />
          )}

          <RoleSelector
            selectedRoles={selectedRoles}
            onRolesChange={setSelectedRoles}
            error={errors.roles}
            roleLabel={t('register.roleLabel')}
            roleNames={[t('register.role.sales'), t('register.role.qa'), t('register.role.dev'), t('register.role.subcontractor')]}
          />

          <DropdownSelect
            label={t('register.giantContactLabel')}
            value={giantContact}
            onChange={setGiantContact}
            options={giantContactOptions}
            placeholder={t('register.giantContactPlaceholder')}
            error={errors.giantContact}
            searchable
          />

          <TextField
            label={t('register.emailLabel')}
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="demo@minimals.cc"
            error={errors.email}
          />

          <PasswordField
            label={t('register.passwordLabel')}
            value={password}
            onChange={setPassword}
            placeholder={t('register.passwordPlaceholder')}
            error={errors.password}
          />

          <PasswordField
            label={t('register.confirmPasswordLabel')}
            value={confirmPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              if (passwordMismatch) {
                setPasswordMismatch(false);
                setErrors(prev => ({ ...prev, confirmPassword: false }));
              }
            }}
            placeholder={t('register.passwordPlaceholder')}
            error={errors.confirmPassword || passwordMismatch}
            helperText={passwordMismatch ? t('common.passwordMismatch') : ''}
          />

          <button
            type="button"
            onClick={handleRegister}
            className="bg-black h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[#333] transition-colors"
            data-name="Button"
          >
            <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">{t('register.createAccount')}</p>
              </div>
            </div>
          </button>

          {/* 返回登入 - 與忘記密碼頁面一致的樣式 */}
          <button
            type="button"
            onClick={onBackToLogin}
            className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <div className="relative shrink-0 size-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path d="M10.354 3.354a.5.5 0 0 0-.708-.708L5 7.293a1 1 0 0 0 0 1.414l4.646 4.647a.5.5 0 0 0 .708-.708L6.207 8l4.147-4.646z" fill="#1C252E" />
              </svg>
            </div>
            <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{t('register.backToLogin')}</p>
          </button>
        </div>
      </div>

      {/* 自定義提醒對話框 */}
      {showAlert && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
            onClick={() => setShowAlert(false)}
          >
            {/* 對話框內容 */}
            <div 
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[20px] text-[#1c252e] mb-2">
                {t('register.alertTitle')}
              </h2>
              <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] mb-6">
                {t('register.alertMessage')}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAlert(false)}
                  className="bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold px-6 py-2 rounded-md transition-colors"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function RegisterPage({ onRegisterSuccess, onBackToLogin }: RegisterPageProps) {
  return (
    <div className="bg-white flex min-h-screen" data-name="login-註冊">
      <div className="flex flex-1 min-h-screen flex-col lg:flex-row" data-name="stack">
        <Image />
        <div className="flex flex-1 items-center justify-center py-12 px-8">
          <Auth onRegisterSuccess={onRegisterSuccess} onBackToLogin={onBackToLogin} />
        </div>
      </div>
    </div>
  );
}