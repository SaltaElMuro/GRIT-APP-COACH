import React, { useState } from 'react';
import { ClassType, WorkoutRequest } from '../types';
import { Dumbbell, Mountain, Timer, Leaf, Sparkles, Loader2, Info, Calendar } from 'lucide-react';

interface ClassSelectorProps {
  onGenerate: (request: WorkoutRequest) => void;
  isLoading: boolean;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ onGenerate, isLoading }) => {
  const [selectedType, setSelectedType] = useState<ClassType | null>(null);
  const [focus, setFocus] = useState('');
  // Default to today in YYYY-MM-DD format for the input
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerate = () => {
    if (selectedType) {
      onGenerate({ 
        type: selectedType, 
        focus,
        date: selectedDate
        // Cycle context is now handled at the App level via CycleManager
      });
    }
  };

  const cards = [
    {
      type: ClassType.HYBRID,
      title: 'Functional Hybrid',
      icon: <Dumbbell className="w-6 h-6" />,
      desc: 'Fuerza + Metabólico. Estructura clásica.',
      color: 'border-blue-500/50 hover:border-blue-500'
    },
    {
      type: ClassType.STRONGMAN,
      title: 'Strongman Focus',
      icon: <Mountain className="w-6 h-6" />,
      desc: 'Objetos pesados, terraza, fuerza bruta.',
      color: 'border-red-500/50 hover:border-red-500'
    },
    {
      type: ClassType.ENDURANCE,
      title: 'Endurance',
      icon: <Timer className="w-6 h-6" />,
      desc: 'Larga duración, cardio y resistencia.',
      color: 'border-brand-yellow/50 hover:border-brand-yellow'
    },
    {
      type: ClassType.PILATES,
      title: 'Pilates / Yoga',
      icon: <Leaf className="w-6 h-6" />,
      desc: 'Control, mat, core y movilidad.',
      color: 'border-green-500/50 hover:border-green-500'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.type}
            onClick={() => setSelectedType(card.type)}
            disabled={isLoading}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-300 text-left group
              ${selectedType === card.type 
                ? `${card.color} bg-brand-gray shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-[1.02]` 
                : 'border-brand-gray bg-brand-black/50 hover:bg-brand-gray/50 text-gray-400 hover:text-white'}
            `}
          >
            <div className={`mb-3 ${selectedType === card.type ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
              {card.icon}
            </div>
            <h3 className="font-display text-xl uppercase tracking-wide mb-1">{card.title}</h3>
            <p className="text-sm font-sans opacity-80">{card.desc}</p>
            
            {selectedType === card.type && (
              <div className="absolute top-4 right-4 text-brand-yellow animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Picker */}
        <div className="md:col-span-1 bg-brand-gray/30 p-4 rounded-xl border border-brand-gray/50">
           <div className="flex items-center gap-2 mb-2">
             <Calendar className="w-4 h-4 text-gray-500" />
             <label className="text-sm text-gray-400 uppercase tracking-wider font-bold">
              Fecha de Ejecución
            </label>
           </div>
           <input 
             type="date"
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="w-full bg-brand-black border border-brand-gray rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors [color-scheme:dark]"
             disabled={isLoading}
           />
        </div>

        {/* Focus Input */}
        <div className="md:col-span-2 bg-brand-gray/30 p-4 rounded-xl border border-brand-gray/50">
          <div className="flex items-center gap-2 mb-2">
             <Info className="w-4 h-4 text-gray-500" />
             <label className="text-sm text-gray-400 uppercase tracking-wider font-bold">
              Detalles Específicos (Opcional)
            </label>
          </div>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Ej: Muchos atletas nuevos, evitar hombros hoy..."
            className="w-full bg-brand-black border border-brand-gray rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!selectedType || isLoading}
        className={`
          w-full py-4 rounded-xl font-display text-xl uppercase tracking-widest transition-all duration-300
          flex items-center justify-center gap-3
          ${!selectedType || isLoading
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-brand-yellow text-brand-black hover:bg-yellow-400 shadow-lg hover:shadow-yellow-500/20'}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Optimizando logística y generando...
          </>
        ) : (
          'Generar Entrenamiento'
        )}
      </button>
    </div>
  );
};
