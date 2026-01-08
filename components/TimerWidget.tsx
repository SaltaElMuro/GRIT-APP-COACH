
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Watch, Volume2, VolumeX, Layers, Zap } from 'lucide-react';

type TimerMode = 'stopwatch' | 'countdown' | 'emom' | 'tabata';

export const TimerWidget: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [time, setTime] = useState(0); 
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0); 
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [isFlashActive, setIsFlashActive] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const unlockAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playBeep = (freq = 1000, duration = 0.2, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    unlockAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.1);
    } catch (e) {}
  };

  const triggerVisualFeedback = (color: 'yellow' | 'red' = 'yellow') => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => {
          let next = prev;

          if (mode === 'stopwatch') {
            next = prev + 1;
          } else {
            next = prev - 1;

            // Beep and Flash logic
            if (next >= 1 && next <= 3) {
              playBeep(880, 0.15);
              triggerVisualFeedback('yellow');
            }
            
            if (next === 0) {
              playBeep(1320, 0.8, 'square');
              triggerVisualFeedback('red');

              // EMOM / TABATA Round Handling
              if (mode === 'emom' || mode === 'tabata') {
                if (round < totalRounds) {
                  setRound(r => r + 1);
                  return mode === 'emom' ? 60 : 20; // Example Tabata work
                } else {
                  setIsActive(false);
                  return 0;
                }
              }
            }
          }

          if (next < 0) {
            setIsActive(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, mode, round, totalRounds]);

  const toggleTimer = () => {
    unlockAudio();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setRound(1);
    if (mode === 'emom') setTime(60);
    else if (mode === 'tabata') setTime(20);
    else setTime(mode === 'countdown' ? initialTime : 0);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`transition-colors duration-200 rounded-xl p-4 border ${isFlashActive ? 'bg-brand-yellow/30 border-brand-yellow' : 'bg-brand-black border-brand-gray'} shadow-2xl w-full max-w-md mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xl text-white uppercase tracking-widest flex items-center gap-2">
          {mode === 'emom' ? <Zap className="w-4 h-4 text-brand-yellow" /> : <Timer className="w-4 h-4" />}
          {mode} { (mode === 'emom' || mode === 'tabata') && `R: ${round}/${totalRounds}`}
        </h3>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-2 rounded-full ${soundEnabled ? 'text-brand-yellow bg-brand-yellow/10' : 'text-gray-500 bg-gray-800'}`}>
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-brand-gray/30 p-1 rounded-lg">
        {(['stopwatch', 'countdown', 'emom'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setIsActive(false); setTime(m === 'emom' ? 60 : 0); setRound(1); }}
            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all ${mode === m ? 'bg-brand-yellow text-brand-black' : 'text-gray-500'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="bg-black/40 rounded-xl p-6 mb-4 border border-brand-gray/50 text-center">
        <span className={`font-mono text-7xl md:text-8xl font-bold tracking-tighter tabular-nums ${isActive ? 'text-white' : 'text-gray-600'}`}>
          {formatTime(time)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={toggleTimer} className={`py-4 rounded-lg font-bold text-xl uppercase ${isActive ? 'bg-brand-gray text-white' : 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/20'}`}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer} className="py-4 rounded-lg bg-red-600/10 text-red-500 border border-red-600/30 hover:bg-red-600 hover:text-white font-bold text-xl uppercase">
          Reset
        </button>
      </div>

      {mode === 'emom' && (
        <div className="flex items-center justify-between bg-brand-gray/20 p-3 rounded-lg border border-brand-gray/50">
          <span className="text-xs text-gray-400 font-bold uppercase">Rondas Totales:</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setTotalRounds(Math.max(1, totalRounds - 1))} className="w-8 h-8 rounded bg-brand-gray flex items-center justify-center">-</button>
            <span className="font-display text-xl text-brand-yellow">{totalRounds}</span>
            <button onClick={() => setTotalRounds(totalRounds + 1)} className="w-8 h-8 rounded bg-brand-gray flex items-center justify-center">+</button>
          </div>
        </div>
      )}
    </div>
  );
};
