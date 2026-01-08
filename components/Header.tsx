
import React from 'react';
import { Zap, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-50 bg-brand-black border-b border-brand-gray/50 shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start leading-none select-none">
            <div className="flex items-center">
              <span className="font-display font-bold text-6xl text-white tracking-tighter italic mr-1 uppercase">GRIT</span>
              <Zap className="w-8 h-8 text-brand-yellow fill-brand-yellow drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
            </div>
            
            <div className="font-sans font-black text-[10px] text-gray-400 italic tracking-[0.25em] -mt-1 ml-1 uppercase">
              FUNCTIONAL <span className="text-brand-yellow">TRAINING</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase font-black">BORMUJOS LAB OS v2.5</p>
                <span className="flex items-center gap-1 text-[9px] bg-brand-gray text-brand-yellow px-2 py-0.5 rounded-full border border-brand-gray font-black">
                  LOCAL SECURE
                </span>
              </div>
           </div>
           
           {onOpenSettings && (
             <button 
               onClick={onOpenSettings}
               className="p-2.5 text-gray-400 hover:text-brand-yellow hover:bg-brand-gray rounded-xl transition-all border border-transparent hover:border-brand-gray/50"
             >
               <Settings className="w-6 h-6" />
             </button>
           )}
        </div>
      </div>
    </header>
  );
};
