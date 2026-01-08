
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClassSelector } from './components/ClassSelector';
import { WorkoutDisplay } from './components/WorkoutDisplay';
import { WorkoutHistory } from './components/WorkoutHistory';
import { CycleManager } from './components/CycleManager';
import { AnnualPlanner } from './components/AnnualPlanner';
import { LabAnalytics } from './components/LabAnalytics';
import { ChatAssistant } from './components/ChatAssistant';
import { SettingsModal } from './components/SettingsModal';
import { generateWorkout } from './services/geminiService';
import { GeneratedWorkout, WorkoutRequest, TrainingCycle, AnnualPlan, Equipment, Benchmark } from './types';
import { ShieldCheck, Users, MapPin } from 'lucide-react';

const BORMUJOS_DEFAULT_EQUIPMENT: Equipment[] = [
  { id: 'e1', name: 'Remo Concept2', quantity: 2 },
  { id: 'e2', name: 'Bicicleta Assault (AirBike)', quantity: 1 },
  { id: 'e3', name: 'Air Ski (SkiErg)', quantity: 1 },
  { id: 'e4', name: 'Combas de velocidad', quantity: 12 },
  { id: 'e5', name: 'Set Mancuernas Hex (5-20kg)', quantity: 9 },
  { id: 'e6', name: 'Kettlebells (8-24kg)', quantity: 5 },
  { id: 'e7', name: 'Barras Olímpicas (20kg/15kg)', quantity: 4 },
  { id: 'e8', name: 'Discos Bumper (Pack 300kg)', quantity: 1 },
  { id: 'e9', name: 'Trineo de empuje + Cuerda', quantity: 1 },
  { id: 'e10', name: 'Battle Rope (15m)', quantity: 1 },
  { id: 'e11', name: 'Slamballs (15-30kg)', quantity: 3 },
  { id: 'e12', name: 'Sacos lastrados (10-25kg)', quantity: 4 },
  { id: 'e13', name: 'Cajones Pliométricos 3-en-1', quantity: 2 },
  { id: 'e14', name: 'Jaula de Pared (4 estaciones)', quantity: 1 },
  { id: 'e15', name: 'Bancos de musculación', quantity: 4 },
  { id: 'e16', name: 'TRX / Anillas', quantity: 4 },
  { id: 'e17', name: 'AbMats', quantity: 12 },
  { id: 'e18', name: 'Bandas Elásticas (Kit variado)', quantity: 1 }
];

function App() {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [history, setHistory] = useState<GeneratedWorkout[]>([]);
  const [activeCycle, setActiveCycle] = useState<TrainingCycle | null>(null);
  const [annualPlan, setAnnualPlan] = useState<AnnualPlan | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'planner' | 'annual' | 'lab'>('planner');

  useEffect(() => {
    // Carga inicial desde LocalStorage
    const savedHistory = localStorage.getItem('grit_workouts');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCycle = localStorage.getItem('grit_cycle');
    if (savedCycle) setActiveCycle(JSON.parse(savedCycle));

    const savedAnnual = localStorage.getItem('grit_annual');
    if (savedAnnual) setAnnualPlan(JSON.parse(savedAnnual));

    const savedEquip = localStorage.getItem('grit_equip');
    if (savedEquip) {
      setEquipment(JSON.parse(savedEquip));
    } else {
      setEquipment(BORMUJOS_DEFAULT_EQUIPMENT);
    }

    const savedBench = localStorage.getItem('grit_bench');
    if (savedBench) setBenchmarks(JSON.parse(savedBench));
  }, []);

  // Persistencia de datos en LocalStorage
  useEffect(() => { localStorage.setItem('grit_workouts', JSON.stringify(history)); }, [history]);
  useEffect(() => { 
    if (activeCycle) localStorage.setItem('grit_cycle', JSON.stringify(activeCycle));
    else localStorage.removeItem('grit_cycle');
  }, [activeCycle]);
  useEffect(() => {
    if (annualPlan) localStorage.setItem('grit_annual', JSON.stringify(annualPlan));
    else localStorage.removeItem('grit_annual');
  }, [annualPlan]);
  useEffect(() => { localStorage.setItem('grit_equip', JSON.stringify(equipment)); }, [equipment]);
  useEffect(() => { localStorage.setItem('grit_bench', JSON.stringify(benchmarks)); }, [benchmarks]);

  const handleGenerate = async (baseRequest: WorkoutRequest) => {
    setLoading(true);
    try {
      const fullRequest: WorkoutRequest = {
        ...baseRequest,
        recentHistory: history.slice(0, 5),
        cycleContext: activeCycle,
        annualContext: annualPlan,
        equipmentContext: equipment,
        benchmarksContext: benchmarks
      };

      const markdown = await generateWorkout(fullRequest);
      const requestedDate = baseRequest.date ? new Date(baseRequest.date) : new Date();
      const displayDate = requestedDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      const timestamp = requestedDate.getTime(); 
      
      const newWorkout: GeneratedWorkout = {
        id: `wod-${Date.now()}`,
        markdown,
        type: baseRequest.type,
        date: displayDate,
        timestamp: timestamp
      };
      
      setWorkout(newWorkout);
      const updatedHistory = [newWorkout, ...history].sort((a,b) => b.timestamp - a.timestamp).slice(0, 60);
      setHistory(updatedHistory); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-light font-sans selection:bg-brand-yellow selection:text-brand-black pb-20">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {!workout ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 bg-brand-gray/50 border border-brand-yellow/30 text-brand-yellow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                <ShieldCheck className="w-3 h-3" /> COACH OS v2.5 • LOCAL SECURE
              </div>
              <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter text-white italic leading-tight">
                BORMUJOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-600">FUNCTIONAL LAB</span>
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="inline-flex items-center gap-4 bg-brand-gray/30 border border-brand-gray rounded-full px-4 py-1.5 text-[10px] md:text-xs uppercase tracking-widest text-gray-400 font-bold">
                   <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-brand-yellow" /><span>Lab Aljarafe</span></div>
                   <div className="w-px h-3 bg-gray-700"></div>
                   <div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-brand-yellow" /><span>12 Atletas/clase</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 border-b border-brand-gray/50 pb-px overflow-x-auto custom-scrollbar">
              <button onClick={() => setActiveTab('planner')} className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'planner' ? 'text-brand-yellow' : 'text-gray-500 hover:text-white'}`}>
                Programación
                {activeTab === 'planner' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>}
              </button>
              <button onClick={() => setActiveTab('annual')} className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'annual' ? 'text-brand-yellow' : 'text-gray-500 hover:text-white'}`}>
                Macrociclo
                {activeTab === 'annual' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>}
              </button>
              <button onClick={() => setActiveTab('lab')} className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'lab' ? 'text-brand-yellow' : 'text-gray-500 hover:text-white'}`}>
                Inventario
                {activeTab === 'lab' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>}
              </button>
            </div>
            
            {activeTab === 'annual' && <AnnualPlanner plan={annualPlan} onUpdate={setAnnualPlan} />}
            {activeTab === 'lab' && (
              <LabAnalytics 
                equipment={equipment} 
                benchmarks={benchmarks} 
                history={history}
                onUpdateEquipment={setEquipment}
                onUpdateBenchmarks={setBenchmarks}
              />
            )}
            {activeTab === 'planner' && (
              <>
                <CycleManager activeCycle={activeCycle} onUpdateCycle={setActiveCycle} />
                <ClassSelector onGenerate={handleGenerate} isLoading={loading} />
              </>
            )}
            
            {activeTab === 'planner' && (
              <WorkoutHistory 
                history={history} 
                onSelect={setWorkout} 
                onDelete={(id, e) => { 
                  e.stopPropagation(); 
                  if(confirm('¿Eliminar esta sesión del historial?')) {
                    setHistory(prev => prev.filter(w => w.id !== id)); 
                  }
                }}
              />
            )}
          </div>
        ) : (
          <WorkoutDisplay 
            workout={workout} 
            onReset={() => setWorkout(null)} 
            onUpdate={(id, markdown) => {
              const updatedWorkout = { ...workout, markdown, id };
              if (workout.id === id) setWorkout(updatedWorkout);
              setHistory(prev => prev.map(w => w.id === id ? updatedWorkout : w));
            }}
          />
        )}
      </main>

      <ChatAssistant />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        history={history}
        activeCycle={activeCycle}
        onImport={(h, c) => { setHistory(h); setActiveCycle(c); }}
        onClear={() => { 
          if(confirm('¿ESTÁS SEGURO? Esto borrará permanentemente todos tus WODs e inventario.')) {
            localStorage.clear();
            window.location.reload();
          }
        }}
      />
    </div>
  );
}

export default App;
