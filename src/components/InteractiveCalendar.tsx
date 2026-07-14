import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Sparkles } from 'lucide-react';

interface InteractiveCalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onChange: (date: string, time: string) => void;
}

export default function InteractiveCalendar({
  selectedDate,
  selectedTime,
  onChange
}: InteractiveCalendarProps) {
  // Current Date context for navigation
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Days in month calculator
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  // Generate calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); // empty days before 1st of month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  // Helper to format Date key as YYYY-MM-DD
  const formatDateKey = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Helper to check if a day is in the past
  const isPastDay = (day: number) => {
    const dateToCheck = new Date(currentYear, currentMonth, day, 23, 59, 59);
    return dateToCheck < today;
  };

  // Determine slot availability for a selected date
  const getSlotsForDate = (dateString: string | null) => {
    if (!dateString) return [];
    
    // Parse date to generate deterministic but realistic slot availability
    const dayNum = parseInt(dateString.split('-')[2] || '1', 10);
    const isWeekend = new Date(dateString).getDay() % 6 === 0;

    return [
      { time: '08:30 AM', available: dayNum % 5 !== 0, crew: 'Standard Team' },
      { time: '11:30 AM', available: dayNum % 4 !== 0, crew: 'Sanctuary Specialists' },
      { time: '02:30 PM', available: !isWeekend || dayNum % 3 !== 0, crew: 'Gold Standard Crew' },
      { time: '05:00 PM', available: dayNum % 7 !== 0 && !isWeekend, crew: 'Evening Refresh Express' }
    ];
  };

  const activeSlots = getSlotsForDate(selectedDate);

  const handleDayClick = (day: number) => {
    if (isPastDay(day)) return;
    const dateStr = formatDateKey(day);
    
    // Reset time slot when changing dates or select first available slot
    const slots = getSlotsForDate(dateStr);
    const firstAvailable = slots.find(s => s.available);
    onChange(dateStr, firstAvailable ? firstAvailable.time : '');
  };

  return (
    <div className="w-full bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Month Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif text-base font-semibold text-[#5D6B5D]">
              {monthNames[currentMonth]} {currentYear}
            </h4>
            <div className="flex gap-1.5">
              <button
                type="button"
                id="prev-month-btn"
                onClick={handlePrevMonth}
                disabled={currentMonth === today.getMonth() && currentYear === today.getFullYear()}
                className="p-1.5 rounded-lg border border-[#EBE3D5] hover:bg-[#F2EDE4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#8C8273]" />
              </button>
              <button
                type="button"
                id="next-month-btn"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-[#EBE3D5] hover:bg-[#F2EDE4] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-[#8C8273]" />
              </button>
            </div>
          </div>

          {/* Weekdays header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map(d => (
              <span key={d} className="text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-medium">
                {d}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const formatted = formatDateKey(day);
              const isSelected = selectedDate === formatted;
              const disabled = isPastDay(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  id={`calendar-day-${day}`}
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative font-medium transition-all cursor-pointer
                    ${disabled 
                      ? 'text-[#CCCCCC] cursor-not-allowed opacity-40' 
                      : isSelected
                        ? 'bg-[#7C8D7C] text-white shadow-xs font-bold scale-105'
                        : 'text-[#4A4A4A] hover:bg-[#F2EDE4] bg-white border border-[#EBE3D5]'
                    }
                  `}
                >
                  <span>{day}</span>
                  {/* Subtle small dot indicator for selected date */}
                  {isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white animate-pulse" />
                  )}
                  {day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() && !isSelected && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#7C8D7C]" title="Today" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#8C8273]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C8D7C]" />
            <span>Today's Date</span>
            <span className="ml-3 w-1.5 h-1.5 rounded-full bg-white border border-[#EBE3D5]" />
            <span>Available Slot</span>
          </div>
        </div>

        {/* Right Side: Slot Availability Picker */}
        <div className="w-full md:w-56 flex flex-col justify-between pt-2 border-t md:border-t-0 md:border-l border-[#EBE3D5] md:pl-6">
          <div>
            <h5 className="font-serif text-sm font-semibold text-[#5D6B5D] mb-3">
              Available Times
            </h5>
            
            {selectedDate ? (
              <div className="space-y-2">
                {activeSlots.map((slot, sIdx) => {
                  const isSlotSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={`slot-${sIdx}`}
                      type="button"
                      id={`time-slot-${slot.time.replace(' ', '-')}`}
                      disabled={!slot.available}
                      onClick={() => onChange(selectedDate, slot.time)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex justify-between items-center cursor-pointer
                        ${!slot.available
                          ? 'border-[#F2EDE4] bg-[#FAF8F5] text-[#8C8273] cursor-not-allowed opacity-60'
                          : isSlotSelected
                            ? 'border-[#7C8D7C] bg-[#F7F9F7] text-[#5D6B5D] font-semibold'
                            : 'border-[#EBE3D5] bg-white text-[#4A4A4A] hover:border-[#7C8D7C] hover:bg-[#F7F9F7]'
                        }
                      `}
                    >
                      <div>
                        <span className="block font-mono font-medium">{slot.time}</span>
                        <span className="text-[9px] text-[#8C8273] font-sans truncate block max-w-[120px]">
                          {slot.available ? slot.crew : 'Unavailable'}
                        </span>
                      </div>
                      {isSlotSelected && slot.available && (
                        <Check className="w-4 h-4 text-[#7C8D7C] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-[#8C8273] flex flex-col items-center justify-center border border-dashed border-[#EBE3D5] rounded-2xl bg-white">
                <AlertCircle className="w-6 h-6 stroke-1 text-[#8C8273] mb-1.5" />
                <p className="text-xs font-serif italic px-4">
                  Please select a booking date first
                </p>
              </div>
            )}
          </div>

          {selectedDate && selectedTime && (
            <div className="mt-4 bg-[#E9EDEA] border border-[#7C8D7C]/20 p-3 rounded-xl">
              <span className="block text-[8px] font-mono uppercase tracking-widest text-[#8C8273]">Scheduled Appointment</span>
              <p className="text-xs font-serif font-semibold text-[#5D6B5D] mt-1 leading-tight">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[11px] font-mono text-[#7C8D7C] mt-0.5 font-bold">
                at {selectedTime}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
