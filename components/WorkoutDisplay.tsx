
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedWorkout } from '../types';
import { 
  Copy, RefreshCw, CheckCircle2, Edit3, Save, Share2, Monitor, X, 
  Maximize2, Minimize2, Timer as TimerIcon, Trophy, ClipboardList, 
  Mic, MicOff, Image as ImageIcon, Loader2, Sparkles, Activity
} from 'lucide-react';
import { TimerWidget } from './TimerWidget';
import { generateSessionImage } from '../services/geminiService';

interface WorkoutDisplayProps {
  workout: GeneratedWorkout;
  onReset: () => void;
  onUpdate: (id: string, newMarkdown: string) => void;
}

export const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ workout, onReset, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(workout.markdown);
  const [copied, setCopied] = useState(false);
  const [isTVMode, setIsTVMode] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionPoster, setSessionPoster] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [coachNotes, setCoachNotes] = useState(() => {
    return localStorage.getItem(`notes_${workout.id}`) || '';
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setEditedContent(workout.markdown);
    setCoachNotes(localStorage.getItem(`notes_${workout.id}`) || '');
    setSessionPoster(null);
  }, [workout.id]);

  useEffect(() => {
    localStorage.setItem(`notes_${workout.id}`, coachNotes);
  }, [coachNotes, workout.id]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta dictado por voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setCoachNotes(prev => prev + (prev ? '\n' : '') + finalTranscript);
      }
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleGeneratePoster = async () => {
    setIsGeneratingImage(true);
    const url = await generateSessionImage(workout.markdown);
    if (url) setSessionPoster(url);
    setIsGeneratingImage(false);
  };

  const handleWhatsAppCopy = () => {
    const text = workout.markdown.replace(/\*\*/g, '').replace(/^#\s+(.+)/gm, '⚡ *$1*').replace(/^##\s+(.+)/gm, '\n🏆 *$1*');
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
    const notesText = coachNotes ? `\n\n📝 *RESULTADOS:*\n${coachNotes}` : '';
    navigator.clipboard.writeText(`💀 *GRIT WOD - ${today.toUpperCase()}*\n${text}${notesText}\n\n📲 *#GritTraining*`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isTVMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050505] text-white p-8 overflow-hidden flex flex-col font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-yellow/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-yellow/5 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="relative z-10 flex justify-between items-end mb-10 border-b-2 border-brand-yellow pb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-2">
               <span className="bg-brand-yellow text-brand-black px-3 py-1 text-sm font-black uppercase tracking-[0.3em] italic">GRIT LIVE</span>
               <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
               </div>
            </div>
            <h1 className="font-display text-[8rem] text-white uppercase tracking-tighter leading-[0.8]">
              GRIT <span className="text-brand-yellow">ENGINE</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6 mb-2">
            <button onClick={() => setShowTimer(!showTimer)} className={`flex items-center gap-3 px-8 py-4 rounded-xl border-2 text-3xl font-display transition-all ${showTimer ? 'bg-brand-yellow text-brand-black border-brand-yellow shadow-[0_0_30px_rgba(255,215,0,0.3)]' : 'border-white/10 hover:bg-white/5'}`}>
              <TimerIcon className="w-10 h-10" /> TIMER
            </button>
            <button onClick={() => setIsTVMode(false)} className="p-5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
              <Minimize2 className="w-12 h-12" />
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex gap-12 min-h-0 overflow-hidden">
          <div className={`overflow-y-auto custom-scrollbar pr-8 pb-32 ${showTimer ? 'w-[60%]' : 'w-full'}`}>
             <div className="prose prose-invert prose-2xl max-w-none 
                prose-headings:text-brand-yellow prose-headings:font-display prose-headings:text-7xl prose-headings:mt-12 prose-headings:mb-6
                prose-strong:text-white prose-li:text-gray-200 prose-p:text-gray-400 prose-blockquote:border-l-8 prose-blockquote:border-brand-yellow 
                prose-blockquote:bg-white/5 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-3xl">
                <ReactMarkdown>{workout.markdown}</ReactMarkdown>
             </div>
          </div>
          
          {showTimer && (
            <div className="w-[40%] flex flex-col items-center pt-4 pl-8">
              <div className="w-full scale-125 origin-top transform-gpu">
                <TimerWidget />
              </div>
              
              {sessionPoster && (
                <div className="mt-12 w-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                   <img src={sessionPoster} alt="WOD Poster" className="w-full h-auto object-cover opacity-80" />
                </div>
              )}

              {coachNotes && (
                <div className="mt-12 w-full bg-brand-yellow/5 border-2 border-brand-yellow/20 p-8 rounded-3xl backdrop-blur-md">
                  <h3 className="flex items-center gap-3 text-brand-yellow font-display text-4xl uppercase mb-6">
                    <Trophy className="w-8 h-8" /> GRIT Leaderboard
                  </h3>
                  <p className="text-gray-300 text-2xl font-mono whitespace-pre-wrap leading-relaxed">{coachNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="font-display text-3xl text-white uppercase leading-none">
            Protocolo <span className="text-brand-yellow">GRIT</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">GRIT ENGINE v2.0</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <button onClick={() => { onUpdate(workout.id, editedContent); setIsEditing(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-all"><Save className="w-4 h-4" /> Guardar</button>
          ) : (
            <>
              <button 
                onClick={handleGeneratePoster} 
                disabled={isGeneratingImage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gray hover:bg-brand-yellow hover:text-brand-black text-white border border-gray-700 transition-all disabled:opacity-50"
              >
                {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                <span className="hidden sm:inline">AI Poster</span>
              </button>
              <button onClick={() => setIsTVMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gray hover:bg-brand-yellow hover:text-brand-black text-white border border-gray-700 transition-all"><Monitor className="w-4 h-4" /> <span className="hidden sm:inline">TV Mode</span></button>
              <button onClick={() => setShowTimer(!showTimer)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${showTimer ? 'bg-brand-yellow text-brand-black border-brand-yellow' : 'bg-brand-gray text-white border-gray-700'}`}><TimerIcon className="w-4 h-4" /> <span className="hidden sm:inline">Timer</span></button>
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg bg-brand-gray text-gray-400 hover:text-white border border-gray-700"><Edit3 className="w-5 h-5" /></button>
              <button onClick={handleWhatsAppCopy} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-500 border border-green-600/30 hover:bg-green-600 hover:text-white transition-all"><Share2 className="w-4 h-4" /> Share</button>
              <button onClick={onReset} className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white"><X className="w-5 h-5" /></button>
            </>
          )}
        </div>
      </div>

      {showTimer && <div className="animate-in slide-in-from-top-4 fade-in"><TimerWidget /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-gray/40 border border-brand-gray rounded-xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          {isEditing ? (
            <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="flex-1 w-full bg-brand-black/50 text-gray-300 font-mono text-sm p-6 rounded-lg focus:outline-none resize-none custom-scrollbar" />
          ) : (
            <div className="p-6 md:p-8">
              {sessionPoster && (
                <div className="mb-8 rounded-xl overflow-hidden border border-brand-yellow/20 shadow-lg animate-in zoom-in-95">
                  <img src={sessionPoster} alt="Session Poster" className="w-full h-auto object-cover max-h-[300px]" />
                </div>
              )}
              <div className="prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:text-brand-yellow prose-strong:text-brand-yellow prose-li:text-gray-300 prose-blockquote:border-l-4 prose-blockquote:border-brand-yellow prose-blockquote:bg-brand-yellow/5 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg max-w-none">
                <ReactMarkdown>{workout.markdown}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-brand-black border border-brand-gray rounded-xl p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="flex items-center gap-2 font-display text-xl text-white uppercase">
                 <ClipboardList className="w-5 h-5 text-brand-yellow" /> Registro GRIT
               </h3>
               <button 
                 onClick={toggleListening}
                 className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-gray text-gray-400 hover:text-brand-yellow'}`}
                 title={isListening ? "Detener dictado" : "Iniciar dictado por voz"}
               >
                 {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
               </button>
             </div>
             
             <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Resultados o notas de la sesión..."
              className="w-full bg-brand-gray/30 border border-brand-gray rounded-xl p-4 text-sm text-gray-300 focus:border-brand-yellow outline-none min-h-[200px] transition-colors resize-none"
             />
             
             {isListening && (
               <div className="mt-2 flex items-center gap-2 text-[10px] text-brand-yellow uppercase font-black tracking-widest animate-pulse">
                 <Sparkles className="w-3 h-3" /> Escuchando...
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
