import React from 'react';
import { ActiveView } from '../types';
import { 
  ArrowLeft, LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onNewRequest?: () => void;
  onNewProject?: () => void;
  onResetData?: () => void;
  requestCount: number;
  projectCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-800 text-white shadow-2xl no-print">
      <div className="max-w-[99%] mx-auto px-4 sm:px-8 py-4 sm:py-5 min-h-[100px] flex items-center justify-between">
        
        {/* Brand & Identity (Expanded 2x) */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-4 group text-left transition-transform active:scale-98"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-2xl sm:text-3xl font-heading shadow-xl shadow-amber-500/25 group-hover:scale-105 transition-all">
              LC
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black font-heading tracking-tight text-white flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                <span>LUMENCRAFT</span>
                <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-400/30">
                  SYSTEM HUB
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono tracking-widest mt-0.5">
                ENGINEERING & SERVICE MANAGEMENT PLATFORM
              </div>
            </div>
          </button>

          {/* Navigation Area: Hidden on Home page; Shown on other subpages */}
          {activeView !== 'home' && (
            <nav className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveView('home')}
                className="px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md font-extrabold active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-slate-950" />
                <span>← กลับหน้าหลัก (Home)</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Executive Status Indicator */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-800">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
          <div className="text-left font-mono">
            <div className="text-xs font-bold text-emerald-400">ENTERPRISE SYSTEM READY</div>
            <div className="text-[10px] text-slate-400">LUMENCRAFT THAILAND</div>
          </div>
        </div>

      </div>
    </header>
  );
};
