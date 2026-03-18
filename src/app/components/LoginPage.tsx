import { useState } from 'react';
import svgPaths from "@/imports/svg-r41nrf93no";
import imgImage from "@/assets/login-bg.png";
import img02GiantGroupLogoWhite2 from "@/assets/giant-logo-white.png";
import type { UserRole } from '@/app/App';
import { useLanguage, type Language } from './LanguageContext';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onRegisterClick?: () => void;
  onForgotPassword?: () => void;
}

function Image() {
  return (
    <div className="relative rounded-tr-[80px] shrink-0 w-1/2 self-stretch hidden lg:block" data-name="image">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tr-[80px]">
        <div className="absolute inset-0 overflow-hidden rounded-tr-[80px]">
          {/* Full-bleed background image using CSS background for precise control */}
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
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 rounded-tr-[80px]" style={{ backgroundImage: "linear-gradient(210deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.50) 100%)" }} />
      </div>
      <div className="absolute flex h-[906.755px] items-center justify-center left-[41px] top-[27px] w-[290.13px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[90.39deg]">
          <div className="h-[283.992px] w-[904.847px]" data-name="02_Giant Group_Logo_White 1" />
        </div>
      </div>
      <div className="absolute h-[146.257px] left-[127px] top-[407px] w-[466px]" data-name="02_Giant Group_Logo_White 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover opacity-60 pointer-events-none size-full" src={img02GiantGroupLogoWhite2} />
      </div>
    </div>
  );
}

function Stack2({ subtitle }: { subtitle: string }) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-[448px]" data-name="stack">
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

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
}

function TextField({ label, value, onChange, type = "text", placeholder, showPasswordToggle, onTogglePassword, isPasswordVisible }: TextFieldProps) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
        <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center px-[14px] relative size-full">
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap bg-transparent outline-none placeholder:text-[#919eab]"
            />
            <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
              <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
              <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">{label}</p>
            </div>
            {showPasswordToggle && (
              <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px] cursor-pointer hover:bg-gray-100 transition-colors"
                  data-name="✳️ end adornment"
                >
                  <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:eye-closed-bold">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="icons/solid/ic-solar:eye-closed-bold">
                        <path clipRule="evenodd" d={svgPaths.p2349d00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
                      </g>
                    </svg>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthProps {
  onLoginSuccess: (role: UserRole) => void;
  onRegisterClick?: () => void;
  onForgotPassword?: () => void;
}

function Auth({ onLoginSuccess, onRegisterClick, onForgotPassword }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const languageOptions: { value: Language; label: string }[] = [
    { value: '繁中', label: '繁中' },
    { value: '簡中', label: '簡中' },
    { value: 'English', label: 'English' },
  ];

  const handleLogin = () => {
    // Validate credentials
    if (email === 'vendor@vendor.com' && password === '12345') {
      setHasError(false);
      onLoginSuccess('vendor');
    } else if (email === 'g00106917@giant.com' && password === '12345') {
      setHasError(false);
      onLoginSuccess('giant');
    } else {
      setHasError(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[352px]" data-name="Auth">
      <Stack1 title={t('login.title')} subtitle={t('login.subtitle')} />
      <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
        <TextField
          label={t('login.idLabel')}
          value={email}
          onChange={setEmail}
          type="text"
          placeholder={t('login.idPlaceholder')}
        />
        
        <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full">
          <TextField
            label={t('login.passwordLabel')}
            value={password}
            onChange={setPassword}
            type={showPassword ? "text" : "password"}
            placeholder={t('login.passwordPlaceholder')}
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            isPasswordVisible={showPassword}
          />
          {hasError && (
            <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="stack">
              <p className="bg-clip-text flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px relative text-[14px] text-center whitespace-pre-wrap" style={{ backgroundImage: "linear-gradient(176.424deg, rgb(255, 86, 48) 0%, rgb(183, 29, 24) 100%)", WebkitTextFillColor: "transparent" }}>
                {t('login.error')}
              </p>
            </div>
          )}
        </div>

        {/* 語言選擇 Radio */}
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          <p className="font-['Public_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[18px] text-[#637381] text-[13px]">
            {t('login.language')}
          </p>
          <div className="flex gap-[24px] items-center">
            {languageOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-[6px] cursor-pointer"
              >
                <input
                  type="radio"
                  name="login-language"
                  checked={language === opt.value}
                  onChange={() => setLanguage(opt.value)}
                  className="size-[16px] cursor-pointer m-0"
                  style={{ accentColor: '#005eb8' }}
                />
                <span className={`font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal text-[14px] leading-[22px] ${
                  language === opt.value ? 'text-[#1c252e]' : 'text-[#637381]'
                }`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          onKeyPress={handleKeyPress}
          className="bg-[#00559c] h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[#004080] transition-colors"
          data-name="Button"
        >
          <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
            <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
              <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">{t('login.signIn')}</p>
            </div>
          </div>
        </button>

        {/* ── 暫時快速登入（Dev Only）────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('currentUserEmail', 'g00106917@giant.com');
            onLoginSuccess('giant');
          }}
          className="w-full h-[38px] rounded-[8px] border border-dashed border-[#f59e0b] bg-[#fffbeb] hover:bg-[#fef3c7] transition-colors flex items-center justify-center gap-[6px]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.167L8.75 5.25l4.083.583-2.916 2.834.666 4.083L7 10.5l-3.583 2.25.666-4.083L1.167 5.833 5.25 5.25 7 1.167z" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
          <span className="font-['Public_Sans:SemiBold',sans-serif] font-semibold text-[12px] text-[#92400e]">
            快速登入（Dev）g00106917@giant.com
          </span>
        </button>

        <div
          className="h-[21px] min-w-[64px] relative rounded-[8px] shrink-0 w-full"
          data-name="Button"
        >
          <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
            <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[10px] relative size-full">
              <button
                type="button"
                onClick={onRegisterClick}
                className="font-['Roboto:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#637381] hover:text-[#005eb8] transition-colors text-[16px] tracking-[0.15px] cursor-pointer"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {t('login.register')}
              </button>
              <span className="text-[#637381] text-[16px]">|</span>
              <button
                type="button"
                onClick={onForgotPassword}
                className="font-['Roboto:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[24px] relative shrink-0 text-[#637381] hover:text-[#005eb8] transition-colors text-[16px] tracking-[0.15px] cursor-pointer"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {t('login.forgotPassword')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stack({ onLoginSuccess, onRegisterClick, onForgotPassword }: LoginPageProps) {
  return (
    <div className="flex flex-1 min-h-screen flex-col lg:flex-row" data-name="stack">
      <Image />
      <div className="flex flex-1 items-center justify-center py-12 px-8">
        <Auth onLoginSuccess={onLoginSuccess} onRegisterClick={onRegisterClick} onForgotPassword={onForgotPassword} />
      </div>
    </div>
  );
}

export function LoginPage({ onLoginSuccess, onRegisterClick, onForgotPassword }: LoginPageProps) {
  return (
    <div className="bg-white flex min-h-screen" data-name="login">
      <Stack onLoginSuccess={onLoginSuccess} onRegisterClick={onRegisterClick} onForgotPassword={onForgotPassword} />
    </div>
  );
}