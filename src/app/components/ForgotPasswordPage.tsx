import { useState } from 'react';
import svgPathsFrame1 from "@/imports/svg-blfjb9is82";
import svgPathsFrame2 from "@/imports/svg-zhfmxhjy4a";
import svgPathsFrame3 from "@/imports/svg-0q8h3xf1oa";
import imgImage from "figma:asset/6f8230115b97ee933b04f1cc5c36c2fd194238ac.png";
import img02GiantGroupLogoWhite2 from "figma:asset/589083efc8d155f4aeebb5d7f1ec82f6c63c7b5b.png";
import { useLanguage } from './LanguageContext';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onGoToRegister: () => void;
}

// Mock registered accounts
const registeredEmails = [
  'vendor@vendor.com',
  'g00106917@giant.com',
  'test@giant.com',
  'admin@giant.com',
];

type ForgotPasswordStep = 'enter-email' | 'email-sent' | 'reset-password';

// ===== Shared Components =====

function ImageSection() {
  return (
    <div className="h-[1024px] relative rounded-tr-[80px] shrink-0 w-[720px] hidden lg:block" data-name="image">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tr-[80px]">
        <div className="absolute inset-0 overflow-hidden rounded-tr-[80px]">
          <img alt="" className="absolute h-full left-[-236.64%] max-w-none top-0 w-[426.67%]" src={imgImage} />
        </div>
        <div className="absolute inset-0 rounded-tr-[80px]" style={{ backgroundImage: "linear-gradient(238.464deg, rgba(255, 255, 255, 0.45) 8.3009%, rgba(0, 0, 0, 0.45) 42.876%)" }} />
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

function PageTitle() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="stack">
      <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="head">
        <p className="font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[38px] not-italic relative shrink-0 text-[#1c252e] text-[30px] text-center w-full">{t('login.title')}</p>
        <div className="content-stretch flex items-center relative shrink-0 w-[352px]" data-name="stack">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px not-italic relative text-[#535862] text-[16px] text-center whitespace-pre-wrap">{t('login.subtitle')}</p>
        </div>
      </div>
    </div>
  );
}

function BackArrowIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icons/solid/ic-eva:arrow-ios-back-fill">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icons/solid/ic-eva:arrow-ios-back-fill">
          <path d={svgPathsFrame1.p36867980} fill="var(--fill-0, #1C252E)" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

function ReturnToSignIn({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
      data-name="stack"
    >
      <BackArrowIcon />
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#1c252e] text-[14px]">{t('forgot.returnToSignIn')}</p>
    </button>
  );
}

// ===== Frame 1: Enter Email =====

function PasswordIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[96px]" data-name="icons/other/ic-password">
      <div className="absolute inset-[8.33%_27.61%_56.3%_27.83%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42.7813 33.9535">
          <path d={svgPathsFrame1.p1a84e780} fill="var(--fill-0, #FFD666)" id="color" />
        </svg>
      </div>
      <div className="absolute inset-[8.33%_27.61%_56.3%_27.83%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
      <div className="absolute inset-[41.25%_17.48%_8.33%_17.71%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62.2169 48.4046">
          <path clipRule="evenodd" d={svgPathsFrame1.p832c140} fill="var(--fill-0, #005EB8)" fillRule="evenodd" id="color" />
        </svg>
      </div>
      <div className="absolute inset-[41.25%_17.48%_8.33%_17.71%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
      <div className="absolute inset-[49.51%_39.53%_16.62%_39.76%]" data-name="color">
        <div className="absolute inset-[0_0_0_0.42%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.796 32.5204">
            <path clipRule="evenodd" d={svgPathsFrame1.pb105e80} fill="var(--fill-0, white)" fillRule="evenodd" id="color" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function EnterEmailFrame({ 
  email, 
  setEmail, 
  onSendRequest, 
  onBackToLogin,
  error 
}: { 
  email: string; 
  setEmail: (v: string) => void; 
  onSendRequest: () => void; 
  onBackToLogin: () => void;
  error: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[352px]" data-name="Auth">
      <PageTitle />
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="content">
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0 w-full" data-name="head">
          <PasswordIcon />
          <div className="content-stretch flex flex-col gap-[12px] items-center overflow-clip relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="stack">
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#1c252e] text-[20px] w-full">{t('forgot.title')}</p>
            <p className="font-['Roboto:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[24px] max-w-[380px] relative shrink-0 text-[#637381] text-[16px] tracking-[0.15px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
              {t('forgot.enterEmailDesc')}
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
            {/* Email Input */}
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
              <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
                <div aria-hidden="true" className={`absolute border ${error ? 'border-red-500 border-2' : 'border-[rgba(145,158,171,0.2)]'} border-solid inset-0 pointer-events-none rounded-[8px]`} />
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center px-[14px] relative size-full">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      onKeyDown={(e) => { if (e.key === 'Enter') onSendRequest(); }}
                      className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[15px] text-ellipsis whitespace-nowrap bg-transparent outline-none placeholder:text-[#919eab]"
                    />
                    <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                      <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                      <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 ${error ? 'text-red-500' : 'text-[#637381]'} text-[12px]`}>{t('forgot.emailLabel')}</p>
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[12px] text-red-500 mt-[4px] ml-[14px]">{error}</p>
              )}
            </div>

            {/* Send Request Button */}
            <button
              type="button"
              onClick={onSendRequest}
              className="bg-[#1c252e] h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[#333] transition-colors"
              data-name="Button"
            >
              <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
                  <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">{t('forgot.sendRequest')}</p>
                </div>
              </div>
            </button>

            <ReturnToSignIn onClick={onBackToLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Frame 2: Email Sent =====

function EmailInboxIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[96px]" data-name="icons/other/ic-email-inbox">
      {/* Envelope body */}
      <div className="absolute inset-[8.33%_16.67%_37.5%_16.67%]" data-name="color">
        <div className="absolute inset-[-7.69%_-18.75%_-23.08%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 68">
            <g filter="url(#filter0_di_email_inbox)" id="color">
              <path clipRule="evenodd" d={svgPathsFrame2.p307f7b80} fill="var(--fill-0, #FFD666)" fillRule="evenodd" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="68" id="filter0_di_email_inbox" width="80" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="4" dy="4" />
                <feGaussianBlur stdDeviation="4" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.717647 0 0 0 0 0.431373 0 0 0 0 0 0 0 0 0.16 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="-1" dy="-1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.717647 0 0 0 0 0.431373 0 0 0 0 0 0 0 0 0.48 0" />
                <feBlend in2="shape" mode="normal" result="effect2_innerShadow" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      {/* Lines */}
      <div className="absolute inset-[20.83%_33.33%_58.33%_29.17%]" data-name="vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 20">
          <g id="vector">
            <g id="color">
              <path d={svgPathsFrame2.p10b18500} fill="var(--fill-0, #B76E00)" />
              <path d={svgPathsFrame2.p31ca6180} fill="var(--fill-0, #B76E00)" />
            </g>
          </g>
        </svg>
      </div>
      {/* Envelope flap */}
      <div className="absolute inset-[26.05%_6.25%_8.33%_6.25%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 62.996">
          <path d={svgPathsFrame2.p367c5600} fill="var(--fill-0, #005EB8)" id="color" />
        </svg>
      </div>
      <div className="absolute inset-[26.05%_6.25%_8.33%_6.25%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
    </div>
  );
}

function EmailSentFrame({
  email,
  onResend,
  onBackToLogin,
}: {
  email: string;
  onResend: () => void;
  onBackToLogin: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[420px]" data-name="Auth">
      <PageTitle />
      <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
        {/* Head with icon and text */}
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0 w-full" data-name="head">
          <EmailInboxIcon />
          <div className="content-stretch flex flex-col gap-[12px] items-center overflow-clip relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="stack">
            <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#1c252e] text-[20px] w-full">{t('forgot.checkEmail')}</p>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] max-w-[380px] relative shrink-0 text-[#637381] text-[14px] w-full">
              {t('forgot.emailSentDesc')}
            </p>
            <p className="font-['Public_Sans:Regular',sans-serif] font-normal leading-[22px] max-w-[380px] relative shrink-0 text-[#1c252e] text-[14px] w-full">
              {email}
            </p>
          </div>
        </div>

        {/* Divider line */}
        <div className="w-full border-t border-dashed border-[rgba(145,158,171,0.2)]" />

        {/* Actions */}
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-end max-w-[420px] relative rounded-[16px] shrink-0 w-[400px]" data-name="Auth/Form/UpdatePassword">
          <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
            <div className="content-stretch flex gap-[4px] items-start leading-[22px] relative shrink-0 text-[14px]" data-name="stack">
              <p className="font-['Public_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#1c252e]">{t('forgot.dontHaveMail')}</p>
              <button
                type="button"
                onClick={onResend}
                className="font-['Public_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#005eb8] cursor-pointer hover:underline"
              >
                {t('forgot.resendMail')}
              </button>
            </div>
            <ReturnToSignIn onClick={onBackToLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Frame 3: Reset Password =====

function EmailSentIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[96px]" data-name="icons/other/ic-email-sent">
      <div className="absolute inset-[16.59%_16.06%_6.52%_29.38%]" data-name="vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52.3707 73.8216">
          <path d={svgPathsFrame3.p1ee49980} fill="var(--fill-0, #00559C)" id="vector" />
        </svg>
      </div>
      <div className="absolute inset-[6.82%_6.26%_6.52%_9.59%]" data-name="color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80.7869 83.2024">
          <g id="color">
            <path d={svgPathsFrame3.p6712500} fill="var(--fill-0, #005EB8)" />
            <path d={svgPathsFrame3.p82ca00} fill="var(--fill-0, #005EB8)" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-[6.82%_6.26%_6.52%_9.59%] mix-blend-overlay" data-name="overlay">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="overlay" style={{ mixBlendMode: "overlay" }} />
        </svg>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: boolean;
  helperText?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
      <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
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
            {label && (
              <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                <p className={`font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 ${error ? 'text-red-500' : 'text-[#637381]'} text-[12px]`}>{label}</p>
              </div>
            )}
            <div className="-translate-y-1/2 absolute content-stretch flex h-[40px] items-center justify-center right-0 top-1/2" data-name="end adornment">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="content-stretch flex items-center justify-center relative rounded-[500px] shrink-0 size-[40px] cursor-pointer hover:bg-gray-100 transition-colors"
                data-name="end adornment"
              >
                <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-solar:eye-closed-bold">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g id="icons/solid/ic-solar:eye-closed-bold">
                      <path clipRule="evenodd" d={svgPathsFrame3.p2349d00} fill="var(--fill-0, #637381)" fillRule="evenodd" id="primary-shape" />
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

function ResetPasswordFrame({
  email,
  onBackToLogin,
}: {
  email: string;
  onBackToLogin: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: false, confirmPassword: false });
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { t } = useLanguage();

  const handleUpdatePassword = () => {
    const newErrors = {
      password: password.trim() === '',
      confirmPassword: confirmPassword.trim() === '',
    };
    setErrors(newErrors);

    if (newErrors.password || newErrors.confirmPassword) return;

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setErrors(prev => ({ ...prev, confirmPassword: true }));
      return;
    }

    setPasswordMismatch(false);
    // Show success dialog
    setShowSuccessDialog(true);
  };

  return (
    <>
      <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[420px] relative rounded-[16px] shrink-0 w-[420px]" data-name="Auth">
        <PageTitle />
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="content">
          <div className="content-stretch flex flex-col gap-[40px] items-center justify-end max-w-[420px] relative rounded-[16px] shrink-0 w-[400px]" data-name="Auth/Form/UpdatePassword">
            {/* Head */}
            <div className="content-stretch flex flex-col gap-[24px] items-center justify-end relative shrink-0 w-full" data-name="head">
              <EmailSentIcon />
              <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 text-center w-full whitespace-pre-wrap" data-name="stack">
                <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#1c252e] text-[20px] w-full">{t('forgot.resetTitle')}</p>
                <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal leading-[22px] max-w-[380px] relative shrink-0 text-[#637381] text-[14px] w-full">{t('forgot.resetDesc')}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="content">
              {/* Email (read-only) */}
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="TextField">
                <div className="h-[54px] relative rounded-[8px] shrink-0 w-full" data-name="wrap">
                  <div aria-hidden="true" className="absolute border border-[rgba(145,158,171,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
                  <div className="flex flex-row items-center size-full">
                    <div className="content-stretch flex items-center px-[14px] relative size-full">
                      <p className="flex-[1_0_0] font-['Public_Sans:Regular',sans-serif] font-normal leading-[24px] min-h-px min-w-px overflow-hidden relative text-[#1c252e] text-[16px] text-ellipsis whitespace-nowrap">{email}</p>
                      <div className="absolute content-stretch flex items-center left-[14px] px-[2px] top-[-5px]" data-name="label focus">
                        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" data-name="mask label" />
                        <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[12px] relative shrink-0 text-[#637381] text-[12px]">{t('forgot.emailLabel')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <PasswordInput
                label={t('forgot.passwordLabel')}
                value={password}
                onChange={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors(prev => ({ ...prev, password: false }));
                }}
                placeholder={t('forgot.passwordLabel')}
                error={errors.password}
              />

              {/* Confirm New Password */}
              <PasswordInput
                label={t('forgot.confirmPasswordLabel')}
                value={confirmPassword}
                onChange={(val) => {
                  setConfirmPassword(val);
                  if (passwordMismatch) {
                    setPasswordMismatch(false);
                    setErrors(prev => ({ ...prev, confirmPassword: false }));
                  }
                }}
                placeholder={t('forgot.confirmPasswordLabel')}
                error={errors.confirmPassword || passwordMismatch}
                helperText={passwordMismatch ? t('common.passwordMismatch') : ''}
              />

              {/* Update Password Button */}
              <button
                type="button"
                onClick={handleUpdatePassword}
                className="bg-[#1c252e] h-[48px] min-w-[64px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[#333] transition-colors"
                data-name="Button"
              >
                <div className="flex flex-row items-center justify-center min-w-[inherit] size-full">
                  <div className="content-stretch flex gap-[8px] items-center justify-center min-w-[inherit] px-[16px] relative size-full">
                    <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[26px] relative shrink-0 text-[15px] text-white">{t('forgot.updatePassword')}</p>
                  </div>
                </div>
              </button>

              <ReturnToSignIn onClick={onBackToLogin} />
            </div>
          </div>
        </div>
      </div>

      {/* Success dialog */}
      {showSuccessDialog && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
          onClick={() => {
            setShowSuccessDialog(false);
            onBackToLogin();
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[20px] text-[#1c252e] mb-2">
              {t('forgot.successTitle')}
            </h2>
            <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] mb-6">
              {t('forgot.successMessage')}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  onBackToLogin();
                }}
                className="bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
              >
                {t('forgot.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== No Account Alert Dialog =====

function NoAccountAlert({
  onGoToRegister,
  onClose,
}: {
  onGoToRegister: () => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-['Public_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[20px] text-[#1c252e] mb-2">
          {t('forgot.noAccountTitle')}
        </h2>
        <p className="font-['Public_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] text-[14px] text-[#637381] mb-6">
          {t('forgot.noAccountMessage')}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-[rgba(145,158,171,0.32)] text-[#1c252e] font-['Public_Sans:SemiBold',sans-serif] font-semibold px-6 py-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onGoToRegister}
            className="bg-[#005eb8] hover:bg-[#004a94] text-white font-['Public_Sans:SemiBold',sans-serif] font-semibold px-6 py-2 rounded-md transition-colors cursor-pointer"
          >
            {t('forgot.goToRegister')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Main Component =====

export function ForgotPasswordPage({ onBackToLogin, onGoToRegister }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<ForgotPasswordStep>('enter-email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showNoAccountAlert, setShowNoAccountAlert] = useState(false);
  const { t } = useLanguage();

  const handleSendRequest = () => {
    // Validate email
    if (email.trim() === '') {
      setEmailError(t('forgot.errorEmpty'));
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('forgot.errorInvalid'));
      return;
    }

    setEmailError('');

    // Check if email is registered
    if (registeredEmails.includes(email.toLowerCase())) {
      // Email found - go to email sent frame
      setStep('email-sent');
    } else {
      // Email not found - show alert
      setShowNoAccountAlert(true);
    }
  };

  const handleResendMail = () => {
    // Simulate resend
    console.log('Resending password reset email to:', email);
  };

  // Simulate clicking reset link from email
  const handleSimulateResetLink = () => {
    setStep('reset-password');
  };

  const renderContent = () => {
    switch (step) {
      case 'enter-email':
        return (
          <EnterEmailFrame
            email={email}
            setEmail={(val) => {
              setEmail(val);
              if (emailError) setEmailError('');
            }}
            onSendRequest={handleSendRequest}
            onBackToLogin={onBackToLogin}
            error={emailError}
          />
        );
      case 'email-sent':
        return (
          <EmailSentFrame
            email={email}
            onResend={handleResendMail}
            onBackToLogin={onBackToLogin}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordFrame
            email={email}
            onBackToLogin={onBackToLogin}
          />
        );
    }
  };

  return (
    <div className="bg-white content-stretch flex items-center relative size-full min-h-screen" data-name="login-forgot-password">
      <div className="content-stretch flex flex-[1_0_0] gap-0 lg:gap-[165px] h-full items-center min-h-px min-w-px relative flex-col lg:flex-row" data-name="stack">
        <ImageSection />
        <div className="flex flex-col items-center gap-4">
          {renderContent()}
          {/* Demo: simulate clicking reset link (only in email-sent step) */}
          {step === 'email-sent' && (
            <button
              type="button"
              onClick={handleSimulateResetLink}
              className="mt-4 px-4 py-2 border border-dashed border-[#005eb8] text-[#005eb8] rounded-md text-[13px] cursor-pointer hover:bg-[#f0f7ff] transition-colors font-['Public_Sans:Medium',sans-serif]"
            >
              {t('forgot.simulateResetLink')}
            </button>
          )}
        </div>
      </div>

      {/* No account alert */}
      {showNoAccountAlert && (
        <NoAccountAlert
          onGoToRegister={onGoToRegister}
          onClose={() => setShowNoAccountAlert(false)}
        />
      )}
    </div>
  );
}