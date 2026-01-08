
import React, { useState } from 'react';
import { TrainingCycle } from '../types';
import { CalendarRange, Plus, ChevronRight, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

interface CycleManagerProps {
  activeCycle: TrainingCycle | null;
  onUpdateCycle: (cycle: TrainingCycle | null) => void;
}

export const CycleManager: React.FC<CycleManagerProps> = ({ activeCycle, onUpdateCycle }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCycle, setNewCycle] = useState<Partial<TrainingCycle>>({
    name: '',
    goal: '',
    totalWeeks: 4,
    currentWeek: 1
  });

  const handleCreate = () => {
    // Validación de seguridad
    if (!newCycle.name?.trim() || !newCycle.goal?.trim()) {
      return;
    }
    
    // Generador de ID compatible
    const safeId = `cycle-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const cycle: TrainingCycle = {
      id: safeId,
      name: newCycle.name.trim(),
      goal: newCycle.goal.trim(),
      totalWeeks: newCycle.totalWeeks || 4,
      currentWeek: 1,
      startDate: new Date().toISOString()
    };
    
    onUpdateCycle(cycle);
    setIsCreating(false);
    setNewCycle({ name: '', goal: '', totalWeeks: 4, currentWeek: 1 });
  };

  const advanceWeek = () => {
    if (!activeCycle) return;
    if (activeCycle.currentWeek < activeCycle.totalWeeks) {
      onUpdateCycle({ ...activeCycle, currentWeek: activeCycle.currentWeek + 1 });
    }
  };

  const previousWeek = () => {
    if (!activeCycle) return;
    if (activeCycle.currentWeek > 1) {
      onUpdateCycle({ ...activeCycle, currentWeek: activeCycle.currentWeek - 1 });
    }
  };

  const deleteCycle = () => {
    if (confirm('¿Estás seguro de cerrar el ciclo actual?')) {
      onUpdateCycle(null);
    }
  };

  const isFormValid = newCycle.name?.trim() && newCycle.goal?.trim();

  if (!activeCycle && !isCreating) {
    return (
      <div className="bg-brand-gray/20 border border-brand-gray/30 rounded-xl p-6 mb-8 text-center animate-in fade-in">
        <CalendarRange className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <h3 className="text-white font-display text-xl uppercase tracking-wide mb-2">Sin Ciclo Activo</h3>
        <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto font-sans">
          Define un objetivo a largo plazo (Mesociclo) para que la IA estructure la progresión de cargas semana a semana.
        </p>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 bg-brand-gray hover:bg-brand-yellow hover:text-brand-black text-white px-5 py-2 rounded-lg transition-all font-bold text-sm uppercase tracking-wide border border-gray-600 hover:border-brand-yellow"
        >
          <Plus className="w-4 h-4" /> Crear Nuevo Ciclo
        </button>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="bg-brand-gray/30 border border-brand-yellow/30 rounded-xl p-6 mb-8 animate-in zoom-in-95 duration-200">
        <h3 className="text-brand-yellow font-display text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Configurar Nuevo Mesociclo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase font-bold">Nombre del Ciclo</label>
            <input
              type="text"
              placeholder="Ej: Bloque de Fuerza Otoño"
              className="w-full bg-brand-black border border-brand-gray rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-colors"
              value={newCycle.name}
              onChange={e => setNewCycle({ ...newCycle, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
             <label className="text-xs text-gray-400 uppercase font-bold">Duración (Semanas)</label>
            <select
              className="w-full bg-brand-black border border-brand-gray rounded-lg p-3 text-white focus:border-brand-yellow outline-none"
              value={newCycle.totalWeeks}
              onChange={e => setNewCycle({ ...newCycle, totalWeeks: Number(e.target.value) })}
            >
              {[2, 3, 4, 5, 6, 8, 12].map(num => (
                <option key={num} value={num}>{num} Semanas</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-1 mb-6">
          <label className="text-xs text-gray-400 uppercase font-bold">Objetivo Principal</label>
          <input
            type="text"
            placeholder="Ej: Aumentar RM en Sentadilla y mejorar capacidad aeróbica"
            className="w-full bg-brand-black border border-brand-gray rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-colors"
            value={newCycle.goal}
            onChange={e => setNewCycle({ ...newCycle, goal: e.target.value })}
          />
        </div>

        {!isFormValid && (
          <div className="flex items-center gap-2 text-red-400 text-[10px] uppercase font-bold mb-4 animate-pulse">
            <AlertCircle className="w-3 h-3" /> Rellena nombre y objetivo para comenzar
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={!isFormValid}
            className={`
              flex-1 font-bold py-3 rounded-lg transition-all uppercase tracking-widest text-sm
              ${isFormValid 
                ? 'bg-brand-yellow text-brand-black hover:bg-yellow-400 shadow-lg shadow-brand-yellow/20' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'}
            `}
          >
            Iniciar Ciclo
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors uppercase font-bold text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Active Cycle View
  const progressPercentage = activeCycle ? (activeCycle.currentWeek / activeCycle.totalWeeks) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-brand-gray/40 to-brand-black border border-brand-yellow/30 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden group">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
         <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-brand-yellow text-brand-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                 Ciclo Activo
               </span>
               <h3 className="text-white font-display text-2xl uppercase tracking-wide">{activeCycle?.name}</h3>
            </div>
            <p className="text-gray-400 text-sm italic border-l-2 border-brand-yellow/50 pl-3 font-sans">
              "{activeCycle?.goal}"
            </p>
         </div>

         <div className="flex items-center gap-4 bg-brand-black/50 p-2 rounded-lg border border-gray-800">
            <button 
              onClick={previousWeek}
              disabled={activeCycle?.currentWeek === 1}
              className="p-2 hover:bg-brand-gray rounded text-gray-400 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            
            <div className="text-center min-w-[100px]">
              <span className="block text-xs text-gray-500 uppercase font-bold">Semana</span>
              <span className="text-3xl font-display text-brand-yellow leading-none">
                {activeCycle?.currentWeek} <span className="text-gray-600 text-lg">/ {activeCycle?.totalWeeks}</span>
              </span>
            </div>

            <button 
              onClick={advanceWeek}
              disabled={activeCycle?.currentWeek === activeCycle?.totalWeeks}
              className="p-2 hover:bg-brand-gray rounded text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
         </div>
       </div>

       {/* Progress Bar */}
       <div className="mt-6">
         <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono uppercase">
            <span>Progreso del Mesociclo</span>
            <span>{Math.round(progressPercentage)}% Completado</span>
         </div>
         <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-yellow shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
         </div>
       </div>

       <button 
          onClick={deleteCycle}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
          title="Eliminar Ciclo"
       >
         <Trash2 className="w-4 h-4" />
       </button>
    </div>
  );
};
