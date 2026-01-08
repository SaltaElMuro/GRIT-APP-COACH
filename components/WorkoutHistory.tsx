import React, { useState } from 'react';
import { GeneratedWorkout } from '../types';
import { Clock, ChevronRight, Trash2, CalendarDays, List } from 'lucide-react';
import { CalendarView } from './CalendarView';

interface WorkoutHistoryProps {
  history: GeneratedWorkout[];
  onSelect: (workout: GeneratedWorkout) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ history, onSelect, onDelete }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  if (history.length === 0) return null;

  return (
    <div className="mt-12 border-t border-brand-gray/30 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Sesiones Guardadas
        </h3>
        
        {/* View Toggle */}
        <div className="flex bg-brand-gray/30 p-1 rounded-lg border border-brand-gray/50">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-brand-gray text-brand-yellow shadow-sm' : 'text-gray-500 hover:text-white'}`}
            title="Vista Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md transition-all ${view === 'calendar' ? 'bg-brand-gray text-brand-yellow shadow-sm' : 'text-gray-500 hover:text-white'}`}
            title="Vista Calendario"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView history={history} onSelect={onSelect} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative bg-brand-gray/20 border border-brand-gray/30 hover:border-brand-yellow/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-brand-gray/40"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-brand-yellow px-2 py-1 bg-brand-yellow/10 rounded">
                  {item.date}
                </span>
                <button
                  onClick={(e) => onDelete(item.id, e)}
                  className="text-gray-600 hover:text-red-400 p-1 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-display text-lg text-white mb-1 group-hover:text-brand-yellow transition-colors">
                {item.type}
              </h4>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <span>Ver detalles</span>
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};