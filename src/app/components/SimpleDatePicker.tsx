import { useState } from 'react';
import datePickerSvg from "@/imports/svg-z6udnuarbn";

interface SimpleDatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  /** Earliest selectable date (YYYY/MM/DD). Days before this are disabled. */
  minDate?: string;
}

type ViewMode = 'calendar' | 'year' | 'month';

export function SimpleDatePicker({ selectedDate, onDateSelect, minDate }: SimpleDatePickerProps) {
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

  // ─── Parse minDate ───
  const parseMinDate = () => {
    if (!minDate) return null;
    const parts = minDate.split('/');
    if (parts.length !== 3) return null;
    return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) };
  };
  const minDateParsed = parseMinDate();

  const isDayDisabled = (day: number): boolean => {
    if (!minDateParsed) return false;
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    if (y < minDateParsed.year) return true;
    if (y === minDateParsed.year && m < minDateParsed.month) return true;
    if (y === minDateParsed.year && m === minDateParsed.month && day < minDateParsed.day) return true;
    return false;
  };

  const handleDateSelect = (day: number) => {
    if (isDayDisabled(day)) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    onDateSelect(`${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`);
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  // ─── Year view handlers ───
  const handlePrevYearRange = () => setYearRangeStart(prev => prev - 12);
  const handleNextYearRange = () => setYearRangeStart(prev => prev + 12);
  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
    setViewMode('month');
  };

  // ─── Month view handlers ───
  const handleMonthSelect = (monthIdx: number) => {
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
          <div className="flex items-center justify-center rounded-[500px] size-[36px] cursor-pointer hover:bg-[rgba(0,0,0,0.04)]" onClick={handlePrev}>
            <div className="relative size-[20px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path d={datePickerSvg.paf67180} fill="#637381" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-[500px] size-[36px] cursor-pointer hover:bg-[rgba(0,0,0,0.04)]" onClick={handleNext}>
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
              return (
                <div
                  key={year}
                  className={`flex items-center justify-center h-[40px] rounded-[8px] cursor-pointer transition-colors
                    ${isActiveYear ? 'bg-[#005EB8] text-white' : isCurrentYear ? 'border border-[#005EB8] text-[#005EB8]' : 'hover:bg-[rgba(145,158,171,0.08)] text-[#1c252e]'}`}
                  onClick={() => handleYearSelect(year)}
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
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center h-[40px] rounded-[8px] cursor-pointer transition-colors
                    ${isActiveMonth ? 'bg-[#005EB8] text-white' : isCurrentMonth ? 'border border-[#005EB8] text-[#005EB8]' : 'hover:bg-[rgba(145,158,171,0.08)] text-[#1c252e]'}`}
                  onClick={() => handleMonthSelect(idx)}
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
