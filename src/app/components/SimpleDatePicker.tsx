import { useState } from 'react';
import datePickerSvg from "@/imports/svg-z6udnuarbn";

interface SimpleDatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  /** Earliest selectable date (YYYY/MM/DD). Days before this are disabled. */
  minDate?: string;
  /** Latest selectable date (YYYY/MM/DD). Days after this are disabled. */
  maxDate?: string;
}

type ViewMode = 'calendar' | 'year' | 'month';

export function SimpleDatePicker({ selectedDate, onDateSelect, minDate, maxDate }: SimpleDatePickerProps) {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const [currentMonth, setCurrentMonth] = useState(new Date(todayYear, todayMonth));
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  // 年度選擇器的起始年（每頁顯示 12 年）
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor(todayYear / 12) * 12);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ─── 解析已選日期 ───
  const parseSelected = () => {
    if (!selectedDate) return null;
    const parts = selectedDate.split('/');
    if (parts.length !== 3) return null;
    return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) };
  };
  const sel = parseSelected();

  // ─── Calendar view helpers ───
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isToday = (day: number) =>
    day === todayDate && currentMonth.getMonth() === todayMonth && currentMonth.getFullYear() === todayYear;

  const isSelected = (day: number) => {
    if (!sel) return false;
    return day === sel.day && currentMonth.getMonth() === sel.month && currentMonth.getFullYear() === sel.year;
  };

  // ─── Parse minDate / maxDate ───
  const parseDateStr = (d?: string) => {
    if (!d) return null;
    const parts = d.split('/');
    if (parts.length !== 3) return null;
    return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) };
  };
  const minDateParsed = parseDateStr(minDate);
  const maxDateParsed = parseDateStr(maxDate);

  const isDayDisabled = (day: number): boolean => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    // 早於 minDate
    if (minDateParsed) {
      if (y < minDateParsed.year) return true;
      if (y === minDateParsed.year && m < minDateParsed.month) return true;
      if (y === minDateParsed.year && m === minDateParsed.month && day < minDateParsed.day) return true;
    }
    // 晚於 maxDate
    if (maxDateParsed) {
      if (y > maxDateParsed.year) return true;
      if (y === maxDateParsed.year && m > maxDateParsed.month) return true;
      if (y === maxDateParsed.year && m === maxDateParsed.month && day > maxDateParsed.day) return true;
    }
    return false;
  };

  // ─── 月份是否整月都在範圍外（用來 disable 月份 grid 中的選項）───
  const isMonthDisabled = (year: number, monthIdx: number): boolean => {
    if (minDateParsed) {
      if (year < minDateParsed.year) return true;
      if (year === minDateParsed.year && monthIdx < minDateParsed.month) return true;
    }
    if (maxDateParsed) {
      if (year > maxDateParsed.year) return true;
      if (year === maxDateParsed.year && monthIdx > maxDateParsed.month) return true;
    }
    return false;
  };

  // ─── 年份是否在範圍外 ───
  const isYearDisabled = (year: number): boolean => {
    if (minDateParsed && year < minDateParsed.year) return true;
    if (maxDateParsed && year > maxDateParsed.year) return true;
    return false;
  };

  // ─── 翻月按鈕是否需要停用 ───
  const isPrevMonthDisabled = (): boolean => {
    if (!minDateParsed) return false;
    const prevYear  = currentMonth.getMonth() === 0 ? currentMonth.getFullYear() - 1 : currentMonth.getFullYear();
    const prevMonth = currentMonth.getMonth() === 0 ? 11 : currentMonth.getMonth() - 1;
    return prevYear < minDateParsed.year || (prevYear === minDateParsed.year && prevMonth < minDateParsed.month);
  };
  const isNextMonthDisabled = (): boolean => {
    if (!maxDateParsed) return false;
    const nextYear  = currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear();
    const nextMonth = currentMonth.getMonth() === 11 ? 0 : currentMonth.getMonth() + 1;
    return nextYear > maxDateParsed.year || (nextYear === maxDateParsed.year && nextMonth > maxDateParsed.month);
  };

  const handleDateSelect = (day: number) => {
    if (isDayDisabled(day)) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    onDateSelect(`${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`);
  };

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled()) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  const handleNextMonth = () => {
    if (isNextMonthDisabled()) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // ─── Year view handlers ───
  const handlePrevYearRange = () => setYearRangeStart(prev => prev - 12);
  const handleNextYearRange = () => setYearRangeStart(prev => prev + 12);
  const handleYearSelect = (year: number) => {
    if (isYearDisabled(year)) return;
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
    setViewMode('month');
  };

  // ─── Month view handlers ───
  const handleMonthSelect = (monthIdx: number) => {
    if (isMonthDisabled(currentMonth.getFullYear(), monthIdx)) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIdx));
    setViewMode('calendar');
  };

  // ─── Header click → 切換視圖 ───
  const handleHeaderClick = () => {
    if (viewMode === 'calendar') {
      setViewMode('year');
      setYearRangeStart(Math.floor(currentMonth.getFullYear() / 12) * 12);
    } else if (viewMode === 'month') {
      setViewMode('year');
      setYearRangeStart(Math.floor(currentMonth.getFullYear() / 12) * 12);
    } else {
      setViewMode('calendar');
    }
  };

  const days = getDaysInMonth(currentMonth);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  // ─── Header 文字 ───
  const headerText =
    viewMode === 'year'
      ? `${yearRangeStart} – ${yearRangeStart + 11}`
      : viewMode === 'month'
        ? `${currentMonth.getFullYear()}`
        : `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  // ─── Prev / Next 按鈕行為 ───
  const handlePrev = viewMode === 'year' ? handlePrevYearRange : viewMode === 'month' ? () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth())) : handlePrevMonth;
  const handleNext = viewMode === 'year' ? handleNextYearRange : viewMode === 'month' ? () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth())) : handleNextMonth;

  // ─── Prev/Next 按鈕在 calendar 視圖下的停用狀態 ───
  const isPrevBtnDisabled = viewMode === 'calendar' && isPrevMonthDisabled();
  const isNextBtnDisabled = viewMode === 'calendar' && isNextMonthDisabled();

  return (
    <div className="absolute z-50 bg-white rounded-[10px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)] w-[280px]">
      {/* Header */}
      <div className="flex h-[48px] items-center pl-[20px] pr-[8px]">
        <div className="flex-1 flex gap-[6px] items-center cursor-pointer" onClick={handleHeaderClick}>
          <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] text-[#1c252e] text-[15px] hover:text-[#005EB8] transition-colors">
            {headerText}
          </p>
          {/* 小三角指示可展開 */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d={viewMode === 'calendar' ? 'M7 10l5 5 5-5' : 'M7 14l5-5 5 5'} stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex gap-[12px]">
          <div
            className={`flex items-center justify-center rounded-[500px] size-[36px] transition-colors ${isPrevBtnDisabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer hover:bg-[rgba(0,0,0,0.04)]'}`}
            onClick={isPrevBtnDisabled ? undefined : handlePrev}
          >
            <div className="relative size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path d={datePickerSvg.paf67180} fill="#637381" />
              </svg>
            </div>
          </div>
          <div
            className={`flex items-center justify-center rounded-[500px] size-[36px] transition-colors ${isNextBtnDisabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer hover:bg-[rgba(0,0,0,0.04)]'}`}
            onClick={isNextBtnDisabled ? undefined : handleNext}
          >
            <div className="relative size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path d={datePickerSvg.p3906a380} fill="#637381" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Year Grid ─── */}
      {viewMode === 'year' && (
        <div className="px-[16px] pb-[16px]">
          <div className="grid grid-cols-3 gap-[4px]">
            {years.map(year => {
              const isCurrentYear = year === todayYear;
              const isActiveYear = year === currentMonth.getFullYear();
              const disabled = isYearDisabled(year);
              return (
                <div
                  key={year}
                  className={`flex items-center justify-center h-[40px] rounded-[8px] transition-colors
                    ${disabled ? 'opacity-25 cursor-not-allowed text-[#1c252e]' :
                      isActiveYear ? 'bg-[#005EB8] text-white cursor-pointer' :
                      isCurrentYear ? 'border border-[#005EB8] text-[#005EB8] cursor-pointer' :
                      'hover:bg-[rgba(145,158,171,0.08)] text-[#1c252e] cursor-pointer'}`}
                  onClick={() => !disabled && handleYearSelect(year)}
                >
                  <p className={`font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px] ${isActiveYear ? 'font-semibold' : ''}`}>
                    {year}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Month Grid ─── */}
      {viewMode === 'month' && (
        <div className="px-[16px] pb-[16px]">
          <div className="grid grid-cols-3 gap-[4px]">
            {monthShortNames.map((name, idx) => {
              const isCurrentMonth = idx === todayMonth && currentMonth.getFullYear() === todayYear;
              const isActiveMonth = idx === currentMonth.getMonth();
              const disabled = isMonthDisabled(currentMonth.getFullYear(), idx);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center h-[40px] rounded-[8px] transition-colors
                    ${disabled ? 'opacity-25 cursor-not-allowed text-[#1c252e]' :
                      isActiveMonth ? 'bg-[#005EB8] text-white cursor-pointer' :
                      isCurrentMonth ? 'border border-[#005EB8] text-[#005EB8] cursor-pointer' :
                      'hover:bg-[rgba(145,158,171,0.08)] text-[#1c252e] cursor-pointer'}`}
                  onClick={() => !disabled && handleMonthSelect(idx)}
                >
                  <p className={`font-['Public_Sans:Regular',sans-serif] text-[13px] leading-[20px] ${isActiveMonth ? 'font-semibold' : ''}`}>
                    {name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Calendar Grid ─── */}
      {viewMode === 'calendar' && (
        <div className="flex flex-col items-center pb-[16px]">
          {/* Weekday headers */}
          <div className="flex gap-[2px] w-[280px] justify-center font-['Public_Sans:Regular',sans-serif] font-normal text-[#637381] text-[11px] text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col h-[32px] justify-center w-[32px]">
                <p className="leading-[16px]">{day}</p>
              </div>
            ))}
          </div>
          {/* Date grid */}
          <div className="flex flex-col gap-[2px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-[2px] justify-center">
                {week.map((day, dayIndex) => {
                  const isTodayDate = day ? isToday(day) : false;
                  const isSelectedDate = day ? isSelected(day) : false;
                  const isDisabled = day ? isDayDisabled(day) : false;
                  return (
                    <div
                      key={dayIndex}
                      className={`flex flex-col justify-center size-[32px] rounded-[500px] ${
                        day && !isDisabled ? 'cursor-pointer hover:bg-[rgba(0,0,0,0.04)]' : ''
                      } ${isSelectedDate && !isDisabled ? 'bg-[#005EB8]' : ''} ${isTodayDate && !isSelectedDate && !isDisabled ? 'border border-[#005EB8]' : ''}`}
                      onClick={() => day && !isDisabled && handleDateSelect(day)}
                    >
                      {day && (
                        <p className={`font-['Public_Sans:Regular',sans-serif] font-normal leading-[20px] text-[13px] text-center ${
                          isDisabled ? 'text-[#c4cdd6]' :
                          isSelectedDate ? 'text-white font-semibold' : isTodayDate ? 'text-[#005EB8] font-semibold' : 'text-[#1c252e]'
                        }`}>
                          {day}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
