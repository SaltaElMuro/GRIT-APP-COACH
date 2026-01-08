
import React, { useState } from 'react';
import { Equipment, Benchmark, GeneratedWorkout } from '../types';
import { Database, Dumbbell, BarChart3, Plus, Trash2, ShieldCheck, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LabAnalyticsProps {
  equipment: Equipment[];
  benchmarks: Benchmark[];
  history: GeneratedWorkout[];
  onUpdateEquipment: (items: Equipment[]) => void;
  onUpdateBenchmarks: (items: Benchmark[]) => void;
}

export const LabAnalytics: React.FC<LabAnalyticsProps> = ({ 
  equipment, benchmarks, history, onUpdateEquipment, onUpdateBenchmarks 
}) => {
  const [newEquip, setNewEquip] = useState({ name: '', quantity: 1 });
  const [isAddingBenchmark, setIsAddingBenchmark] = useState(false);
  const [newBench, setNewBench] = useState<Partial<Benchmark>>({
    name: '',
    category: 'Lift',
    description: ''
  });

  const addEquipment = () => {
    if (!newEquip.name) return;
    onUpdateEquipment([...equipment, { id: crypto.randomUUID(), ...newEquip }]);
    setNewEquip({ name: '', quantity: 1 });
  };

  const addBenchmark = () => {
    if (!newBench.name || !newBench.description) return;
    onUpdateBenchmarks([...benchmarks, { 
      id: crypto.randomUUID(), 
      name: newBench.name, 
      category: newBench.category as any, 
      description: newBench.description 
    }]);
    setIsAddingBenchmark(false);
    setNewBench({ name: '', category: 'Lift', description: '' });
  };

  // Análisis de Logística: ¿Podemos absorber 12 personas?
  const totalUnits = equipment.reduce((sum, item) => sum + item.quantity, 0);
  const isLogisticsHealthy = equipment.some(e => e.quantity >= 3) || totalUnits > 15;

  // Calcular distribución de tipos de clase
  const typeDistribution = history.reduce((acc: any, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dashboard de Distribución */}
      <div className="bg-brand-gray/20 border border-brand-gray/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-brand-yellow" />
          <h3 className="text-white font-display text-xl uppercase tracking-wider">Métricas de Programación</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(typeDistribution).map(([type, count]: [any, any]) => (
            <div key={type} className="bg-brand-black p-4 rounded-xl border border-brand-gray/50">
              <span className="text-[9px] text-gray-500 uppercase font-black block mb-1 truncate">{type}</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-display text-white">{count}</span>
                <span className="text-[10px] text-brand-yellow mb-1 font-bold">WODS</span>
              </div>
            </div>
          ))}
          {Object.keys(typeDistribution).length === 0 && (
            <div className="col-span-full py-4 text-center text-gray-600 text-xs font-mono uppercase">Esperando datos de sesiones...</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gestión de Inventario */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-5 h-5 text-brand-yellow" />
              <h3 className="text-white font-display text-xl uppercase">Inventario de Material</h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{equipment.length} ÍTEMS</span>
          </div>
          
          <div className="bg-brand-black border border-brand-gray rounded-xl p-4 space-y-4">
            <div className="flex gap-2">
              <input 
                placeholder="Nombre (ej: Kettlebell 24kg)" 
                className="flex-1 bg-brand-gray/30 border border-brand-gray rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-yellow"
                value={newEquip.name}
                onChange={e => setNewEquip({...newEquip, name: e.target.value})}
              />
              <input 
                type="number" 
                className="w-16 bg-brand-gray/30 border border-brand-gray rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-yellow"
                value={newEquip.quantity}
                onChange={e => setNewEquip({...newEquip, quantity: parseInt(e.target.value) || 0})}
              />
              <button onClick={addEquipment} className="bg-brand-yellow text-brand-black p-2 rounded-lg hover:bg-yellow-400 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {equipment.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-brand-gray/10 rounded-lg border border-brand-gray/30 group">
                  <span className="text-sm text-gray-300 font-medium">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-brand-yellow font-bold">x{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateEquipment(equipment.filter(e => e.id !== item.id))}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {equipment.length === 0 && <p className="text-center py-4 text-gray-600 text-xs italic">Inventario vacío</p>}
            </div>
          </div>
        </div>

        {/* Benchmarks / Estándares */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-brand-yellow" />
            <h3 className="text-white font-display text-xl uppercase">Benchmarks del Lab</h3>
          </div>
          
          <div className="bg-brand-black border border-brand-gray rounded-xl p-4 space-y-4">
            {isAddingBenchmark ? (
              <div className="space-y-3 animate-in zoom-in-95">
                <input 
                  placeholder="Nombre del Benchmark (ej: Fran, Murph, 1RM Squat)" 
                  className="w-full bg-brand-gray/30 border border-brand-gray rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-yellow"
                  value={newBench.name}
                  onChange={e => setNewBench({...newBench, name: e.target.value})}
                />
                <div className="flex gap-2">
                  {(['Girl', 'Hero', 'Lift', 'Custom'] as const).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setNewBench({...newBench, category: cat})}
                      className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase tracking-tighter transition-all ${newBench.category === cat ? 'bg-brand-yellow text-brand-black' : 'bg-brand-gray/50 text-gray-500'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <textarea 
                  placeholder="Descripción técnica o requerimientos..." 
                  className="w-full h-20 bg-brand-gray/30 border border-brand-gray rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-yellow resize-none"
                  value={newBench.description}
                  onChange={e => setNewBench({...newBench, description: e.target.value})}
                />
                <div className="flex gap-2">
                  <button onClick={addBenchmark} className="flex-1 bg-brand-yellow text-brand-black font-bold py-2 rounded-lg text-xs uppercase">Guardar Estándar</button>
                  <button onClick={() => setIsAddingBenchmark(false)} className="px-4 py-2 border border-brand-gray rounded-lg text-xs text-gray-500 uppercase">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                  {benchmarks.map(b => (
                    <div key={b.id} className="p-3 bg-brand-gray/20 border border-brand-gray rounded-xl group relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-brand-yellow text-[9px] font-black uppercase tracking-widest">{b.category}</span>
                        <button onClick={() => onUpdateBenchmarks(benchmarks.filter(x => x.id !== b.id))} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-white font-bold text-sm">{b.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{b.description}</p>
                    </div>
                  ))}
                  {benchmarks.length === 0 && <p className="text-gray-500 text-xs italic text-center py-4">No hay estándares definidos aún.</p>}
                </div>
                <button 
                  onClick={() => setIsAddingBenchmark(true)}
                  className="w-full py-3 border border-dashed border-brand-gray rounded-xl text-[10px] text-gray-500 hover:text-brand-yellow hover:border-brand-yellow transition-all uppercase font-black tracking-widest"
                >
                  + Añadir Estándar Técnico
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logistics Checker Footer */}
      <div className={`p-6 rounded-2xl border flex items-start gap-4 transition-all ${isLogisticsHealthy ? 'bg-green-500/5 border-green-500/20' : 'bg-brand-yellow/5 border-brand-yellow/20'}`}>
        {isLogisticsHealthy ? (
          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-brand-yellow shrink-0" />
        )}
        <div>
          <h4 className={`font-bold text-sm uppercase mb-1 ${isLogisticsHealthy ? 'text-green-500' : 'text-brand-yellow'}`}>
            {isLogisticsHealthy ? 'Logística Optimizada para 12 Personas' : 'Atención: Limitación de Material'}
          </h4>
          <p className="text-xs text-gray-400">
            {isLogisticsHealthy 
              ? 'El inventario actual permite rotaciones fluidas en 3 estaciones sin tiempos muertos significativos.' 
              : 'Detectamos falta de duplicidad en materiales clave. La IA priorizará WODs de "AMRAP por estaciones" para asegurar el flujo de los 12 atletas.'}
          </p>
        </div>
      </div>
    </div>
  );
};
