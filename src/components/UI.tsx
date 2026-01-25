import { useStore } from '../store/useStore';
import { Maximize, Minimize } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const UI = () => {
  const { 
    isFullscreen, toggleFullscreen,
    handPresent, gesture
  } = useStore();

  const getGestureLabel = () => {
    if (!handPresent) return "No Hand Detected";
    switch (gesture) {
      case 'open': return "Open Hand (Random)";
      case 'closed': return "Fist (Saturn)";
      case 'victory': return "V Sign (Message)";
      case 'pointing': return "Pointing (Love)";
      default: return "Detecting...";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-40 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">HEHEHE<span className="text-cyan-400">:D</span></h1>
          <p className="text-white/60 text-xs md:text-sm">Cobain gerakin tangan nyaa :D</p>
        </div>
        
        <button 
          onClick={toggleFullscreen}
          className="p-3 md:p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full backdrop-blur-md transition-all text-white touch-manipulation"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 mt-[env(safe-area-inset-top)]">
        <div className={cn("w-2 h-2 rounded-full", handPresent ? "bg-green-500 animate-pulse" : "bg-red-500")} />
        <span className="text-[10px] md:text-xs text-white/80 font-mono uppercase whitespace-nowrap">
          {getGestureLabel()}
        </span>
      </div>
      
      {/* Instructions Overlay (Optional, subtle) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-50 text-[10px] text-white/60 hidden md:block">
        <p>Open Hand • Fist • V Sign • Pointing</p>
      </div>
    </div>
  );
};
