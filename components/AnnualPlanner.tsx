
import React, { useState } from 'react';
import { AnnualPlan, AnnualPhase } from '../types';
import { Calendar, Target, TrendingUp, ChevronDown, ChevronUp, Save, Trash2, Map, Activity } from 'lucide-react';

interface AnnualPlannerProps {
  plan: AnnualPlan | null;
  onUpdate: (plan: AnnualPlan | null) => void;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const INTENSITY_LEVELS = {
  'Low': 25,
  'Medium': 50,
  'High': 75,
  'Peak': 100
};

export const AnnualPlanner: React.FC<AnnualPlannerProps> = ({ plan, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const createPlan = () => {
    const newPlan: AnnualPlan = {
      id: crypto.randomUUID(),
      year: new Date().getFullYear(),
      name: `Macrociclo GRIT ${new Date().getFullYear()}`,
      phases: MONTHS.map(m => ({
        month: m,
        goal: 'Mantenimiento General',
        intensity: 'Medium',
        focus: 'Equilibrado'
      }))
    };
    onUpdate(newPlan);
    setIsExpanded(true);
  };

  const updatePhase = (index: number, updates: Partial<AnnualPhase>) => {
    if (!plan) return;
    const newPhases = [...plan.phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    onUpdate({ ...plan, phases: newPhases });
  };

  if (!plan) {
    return (
      <div className="bg-brand-gray/20 border border-brand-gray/30 rounded-xl p-8 mb-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map className="w-8 h-8 text-brand-yellow" />
          </div>
          <h3 className="text-white font-display text-3xl uppercase mb-3">Planificación Maestra GRIT</h3>
          <p className="text-gray-400 text-sm mb-6">
            Sincroniza la programación diaria con los picos de forma anual.
          </p>
          <button 
            onClick={createPlan}
            className="w-full bg-brand-yellow text-brand-black px-6 py-4 rounded-xl font-black uppercase text-lg hover:bg-yellow-400 transition-all shadow-xl shadow-brand-yellow/10"
          >
            Configurar Macrociclo {new Date().getFullYear()}
          </button>
        </div>
      </div>
    );
  }

  const currentMonthIdx = new Date().getMonth();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-brand-gray/40 border border-brand-gray rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-brand-yellow" />
          <h3 className="text-white font-display text-xl uppercase tracking-widest">Distribución de Carga GRIT</h3>
        </div>
        
        <div className="flex items-end justify-between h-32 gap-1 px-2">
          {plan.phases.map((phase, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center group relative">
              <div 
                className={`w-full rounded-t-sm transition-all duration-500 ease-out ${idx === currentMonthIdx ? 'bg-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-gray-700 group-hover:bg-gray-600'}`}
                style={{ height: `${INTENSITY_LEVELS[phase.intensity]}%` }}
              ></div>
              <span className={`text-[8px] font-bold mt-2 uppercase ${idx === currentMonthIdx ? 'text-brand-yellow' : 'text-gray-600'}`}>
                {phase.month.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-black border border-brand-yellow/20 rounded-2xl overflow-hidden shadow-2xl">
        <div 
          className="p-6 flex justify-between items-center cursor-pointer hover:bg-brand-gray/20 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-yellow text-brand-black rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-display text-2xl uppercase tracking-wider">{plan.name}</h3>
              <p className="text-xs text-gray-500 font-mono uppercase">Master Structure</p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="text-brand-yellow" /> : <ChevronDown className="text-brand-yellow" />}
        </div>

        {isExpanded && (
          <div className="p-6 border-t border-brand-gray/50 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.phases.map((phase, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border transition-all ${idx === currentMonthIdx ? 'border-brand-yellow bg-brand-yellow/5 ring-1 ring-brand-yellow/20' : 'border-brand-gray bg-brand-gray/20'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm font-black uppercase tracking-tighter ${idx === currentMonthIdx ? 'text-brand-yellow' : 'text-gray-400'}`}>
                      {phase.month}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-black block mb-1.5 tracking-widest">Objetivo Master</label>
                      <select 
                        value={phase.goal}
                        onChange={(e) => updatePhase(idx, { goal: e.target.value })}
                        className="w-full bg-brand-black border border-brand-gray rounded-xl p-2.5 text-xs text-white focus:border-brand-yellow outline-none transition-all"
                      >
                        <option value="Hipertrofia">Hipertrofia</option>
                        <option value="Fuerza Máxima">Fuerza Máxima</option>
                        <option value="Potencia">Potencia</option>
                        <option value="Capacidad Aeróbica">Capacidad Aeróbica</option>
                        <option value="Competición">Competición</option>
                        <option value="Descarga">Descarga</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
