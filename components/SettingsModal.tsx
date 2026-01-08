
import React from 'react';
import { X, Download, Upload, Trash2, Database, Info } from 'lucide-react';
import { GeneratedWorkout, TrainingCycle } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedWorkout[];
  activeCycle: TrainingCycle | null;
  onImport: (history: GeneratedWorkout[], cycle: TrainingCycle | null) => void;
  onClear: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, history, activeCycle, onImport, onClear 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-brand-black border border-brand-gray w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-8 border-b border-brand-gray bg-brand-gray/10">
          <div>
            <h2 className="font-display text-3xl text-white uppercase tracking-wider">PANEL DEL COACH</h2>
            <p className="text-[10px] text-brand-yellow font-black uppercase tracking-[0.3em]">Gestión de Datos • Bormujos Lab</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-gray/50 hover:bg-brand-black rounded-full text-gray-500 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* ESTADO LOCAL */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-yellow" /> 
                ALMACENAMIENTO LOCAL
              </h3>
            </div>

            <div className="p-6 bg-brand-gray/10 rounded-3xl border border-brand-gray/50 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-yellow text-black rounded-2xl flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-sm text-white font-black uppercase italic">Base de Datos en el Navegador</p>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                     Tus entrenamientos están seguros en este dispositivo. No se envían a servidores externos.
                   </p>
                </div>
              </div>
              <div className="bg-brand-yellow/5 p-4 rounded-xl border border-brand-yellow/10 flex items-start gap-3">
                <Info className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                <p className="text-[9px] text-gray-400 uppercase font-bold leading-relaxed">
                  Recomendación: Haz un backup semanal si usas la app en diferentes navegadores.
                </p>
              </div>
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-brand-gray to-transparent"></div>

          {/* ACCIONES DE DATOS */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => {
              const data = { 
                history, 
                activeCycle, 
                exportDate: new Date().toISOString(),
                equipment: JSON.parse(localStorage.getItem('grit_equip') || '[]'),
                benchmarks: JSON.parse(localStorage.getItem('grit_bench') || '[]')
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `BormujosLab_Export_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }} className="flex flex-col items-center gap-3 p-6 bg-brand-gray/10 border border-brand-gray hover:border-brand-yellow/50 rounded-[2rem] transition-all group">
              <Download className="w-6 h-6 text-brand-yellow group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase text-gray-500 group-hover:text-white">Exportar Backup</span>
            </button>
            <label className="flex flex-col items-center gap-3 p-6 bg-brand-gray/10 border border-brand-gray hover:border-brand-yellow/50 rounded-[2rem] transition-all cursor-pointer group">
              <Upload className="w-6 h-6 text-brand-yellow group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase text-gray-500 group-hover:text-white">Importar Datos</span>
              <input type="file" className="hidden" accept=".json" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (re) => {
                    try {
                      const data = JSON.parse(re.target?.result as string);
                      if (data.history) onImport(data.history, data.activeCycle || null);
                      if (data.equipment) localStorage.setItem('grit_equip', JSON.stringify(data.equipment));
                      if (data.benchmarks) localStorage.setItem('grit_bench', JSON.stringify(data.benchmarks));
                      alert('Datos restaurados correctamente.');
                      window.location.reload();
                    } catch (err) {
                      alert('Error al procesar el archivo.');
                    }
                  };
                  reader.readAsText(file);
                }
              }} />
            </label>
          </div>

          <button 
            onClick={onClear}
            className="w-full p-5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all text-[10px] font-black uppercase flex items-center justify-center gap-3"
          >
            <Trash2 className="w-4 h-4" /> Resetear Todo (Peligro)
          </button>
        </div>

        <div className="p-8 bg-brand-gray/20 text-center border-t border-brand-gray">
           <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em]">BORMUJOS FUNCTIONAL LAB • 2024</p>
        </div>
      </div>
    </div>
  );
};
