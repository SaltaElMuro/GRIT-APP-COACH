import React, { useState } from 'react';
import { GeneratedWorkout } from '../types';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';

interface CalendarViewProps {
  history: GeneratedWorkout[];
  onSelect: (workout: GeneratedWorkout) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ history, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Sunday, 1 = Monday, etc. Adjust so Monday is 0 for our grid
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Generate blank cells for days before the 1st
  const blanks = Array(firstDay).fill(null);
  
  // Generate days array
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to check if a workout exists on a specific day
  const getWorkoutsForDay = (day: number) => {
    return history.filter(workout => {
      const wDate = new Date(workout.timestamp);
      return (
        wDate.getDate() === day &&
        wDate.getMonth() === currentDate.getMonth() &&
        wDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-brand-gray/20 border border-brand-gray/30 rounded-xl p-4 md:p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-2xl uppercase tracking-wide text-white capitalize">
          {monthName}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-brand-gray rounded-lg transition-colors text-white border border-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-brand-gray rounded-lg transition-colors text-white border border-gray-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-bold py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square"></div>
        ))}

        {days.map((day) => {
          const workouts = getWorkoutsForDay(day);
          const hasWorkout = workouts.length > 0;
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`
                relative aspect-square rounded-lg border flex flex-col items-center justify-start pt-2 cursor-pointer transition-all
                ${today ? 'border-brand-yellow/50 bg-brand-yellow/10' : 'border-gray-800 bg-brand-black/40 hover:bg-brand-gray/40'}
                ${hasWorkout ? 'hover:border-brand-yellow' : ''}
              `}
              onClick={() => hasWorkout && onSelect(workouts[0])}
            >
              <span className={`text-xs md:text-sm font-mono ${today ? 'text-brand-yellow font-bold' : 'text-gray-400'}`}>
                {day}
              </span>
              
              {hasWorkout && (
                <div className="mt-1 md:mt-2 flex flex-col gap-1 items-center">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-brand-yellow shadow-[0_0_5px_rgba(255,215,0,0.6)]"></div>
                  <span className="hidden md:block text-[8px] text-gray-400 uppercase tracking-tighter truncate w-full px-1 text-center">
                    {workouts[0].type.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};