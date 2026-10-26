import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Wind, 
  Droplets, 
  RotateCw, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Unlock, 
  Lightbulb, 
  Flame, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';

export type WashCycleId = 'ozone' | 'steam' | 'silk' | 'eco' | 'turbo';

interface WashingMachineSimulatorProps {
  onBookCycle?: (cycleId: WashCycleId, cycleName: string) => void;
  defaultCycle?: WashCycleId;
}

interface CycleDetails {
  id: WashCycleId;
  name: string;
  shortName: string;
  icon: string;
  temp: string;
  rpm: number;
  timeMins: number;
  benefit: string;
  color: string;
  accentBg: string;
  glowColor: string;
  dialAngle: number; // Knob rotation angle
  phase: string;
}

const WASH_CYCLES: Record<WashCycleId, CycleDetails> = {
  ozone: {
    id: 'ozone',
    name: 'Sanitized Ozone Eco-Wash',
    shortName: 'Ozone Wash',
    icon: '🫧',
    temp: '30°C Cold Shield',
    rpm: 800,
    timeMins: 38,
    benefit: 'Eliminates 99.9% viruses & bacteria with zero dye bleeding',
    color: 'text-cyan-400',
    accentBg: 'from-cyan-500/20 to-sky-500/30',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    dialAngle: -45,
    phase: 'OZONE STERILIZATION',
  },
  steam: {
    id: 'steam',
    name: 'European 3D Steam Spa',
    shortName: 'Steam Spa',
    icon: '💨',
    temp: '140°C Pure Steam',
    rpm: 600,
    timeMins: 45,
    benefit: 'Deep fiber relaxation, sanitizes woolens & removes micro-wrinkles',
    color: 'text-amber-400',
    accentBg: 'from-amber-500/20 to-orange-500/30',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    dialAngle: 0,
    phase: 'THERMAL FIBER SOAK',
  },
  silk: {
    id: 'silk',
    name: 'Bridal Silk & Zari Roll-Wash',
    shortName: 'Silk & Zari',
    icon: '🥻',
    temp: '25°C Zero Shrink',
    rpm: 200,
    timeMins: 28,
    benefit: 'Delicate roll motion preserves real gold zari & delicate silks',
    color: 'text-rose-400',
    accentBg: 'from-rose-500/20 to-pink-500/30',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    dialAngle: 45,
    phase: 'GENTLE SILK CUSHION',
  },
  eco: {
    id: 'eco',
    name: 'Organic Daily RO Clean',
    shortName: 'Daily Clean',
    icon: '🌿',
    temp: '40°C Bio Enzyme',
    rpm: 1200,
    timeMins: 52,
    benefit: 'Crisp everyday cotton wash with 5-stage RO demineralized water',
    color: 'text-emerald-400',
    accentBg: 'from-emerald-500/20 to-teal-500/30',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    dialAngle: 90,
    phase: 'HYPER-EXTRACT SPIN',
  },
  turbo: {
    id: 'turbo',
    name: 'Speed Turbo 15m Express',
    shortName: 'Turbo 15m',
    icon: '⚡',
    temp: '30°C Instant Fresh',
    rpm: 1400,
    timeMins: 15,
    benefit: 'Rapid freshening for light loads with high-speed foam spray',
    color: 'text-sky-300',
    accentBg: 'from-blue-500/20 to-indigo-500/30',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    dialAngle: 135,
    phase: 'SUPER-JET RINSE',
  },
};

export const WashingMachineSimulator: React.FC<WashingMachineSimulatorProps> = ({
  onBookCycle,
  defaultCycle = 'ozone',
}) => {
  const [activeCycleId, setActiveCycleId] = useState<WashCycleId>(defaultCycle);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false);
  const [drumLight, setDrumLight] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(38 * 60);

  const activeCycle = WASH_CYCLES[activeCycleId];

  // Timer countdown simulation
  useEffect(() => {
    setSecondsRemaining(activeCycle.timeMins * 60);
  }, [activeCycleId]);

  useEffect(() => {
    if (!isRunning || isDoorOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : activeCycle.timeMins * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isDoorOpen, activeCycle.timeMins]);

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleDoor = () => {
    if (isDoorOpen) {
      setIsDoorOpen(false);
    } else {
      setIsDoorOpen(true);
      setIsRunning(false); // Safety interlock stops drum
    }
  };

  const handleCycleSelect = (id: WashCycleId) => {
    setActiveCycleId(id);
    if (!isDoorOpen) {
      setIsRunning(true);
    }
  };

  return (
    <div className="w-full select-none">
      {/* ========================================================
          FRONT-LOAD WASHING MACHINE APPLIANCE CASING
      ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-3 sm:p-5 border-2 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.15)] text-slate-100 overflow-hidden">
        
        {/* Machine Top Brand Plate & Safety Interlock Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/90 text-[11px] font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="font-extrabold tracking-wider text-slate-200">
              SMART-INVERTER <span className="text-sky-400">PRO AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <button
              type="button"
              onClick={() => setDrumLight(!drumLight)}
              className={`px-2 py-0.5 rounded-md flex items-center space-x-1 border transition-all ${
                drumLight 
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle Interior Drum Light"
            >
              <Lightbulb className="w-3 h-3" />
              <span className="hidden sm:inline">Drum Light</span>
            </button>

            <span className={`px-2 py-0.5 rounded-md font-bold flex items-center space-x-1 border ${
              isDoorOpen 
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            }`}>
              {isDoorOpen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{isDoorOpen ? 'DOOR OPEN' : 'LOCKED'}</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            TOP DASHBOARD / CONTROL CONSOLE
            [Detergent Drawer] | [Rotary Dial] | [Digital OLED Display]
        ======================================================== */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3 py-3 items-center">
          
          {/* 1. Detergent Pull-Out Drawer (Interactive) */}
          <div className="col-span-3">
            <div 
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="group cursor-pointer rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 p-2 sm:p-2.5 shadow-inner hover:border-sky-500/50 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono">
                <span className="font-bold text-slate-300 truncate">DOSING TRAY</span>
                <Droplets className="w-3 h-3 text-sky-400 shrink-0" />
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full mt-1.5 overflow-hidden flex">
                <div className="h-full bg-sky-400 w-2/5" title="Bio-Enzyme Detergent" />
                <div className="h-full bg-pink-400 w-2/5" title="Fabric Softener" />
                <div className="h-full bg-emerald-400 w-1/5" title="Ozone Booster" />
              </div>
              <div className="mt-1 text-[8px] text-slate-500 text-center uppercase tracking-wider group-hover:text-sky-300 font-mono transition-colors">
                {drawerOpen ? '▲ Close Tray' : '▼ Click Tray'}
              </div>

              {/* Drawer slide-out popover */}
              {drawerOpen && (
                <div className="absolute inset-0 bg-slate-900/95 z-20 p-1.5 flex flex-col justify-between text-[8px] font-mono animate-fadeIn border border-sky-400/40 rounded-xl">
                  <div className="text-sky-300 font-bold">Auto-Dosing Active</div>
                  <div className="space-y-0.5 text-slate-300">
                    <div>• 🫧 Bio Enzymes: 95%</div>
                    <div>• 🌸 French Softener: 88%</div>
                  </div>
                  <div className="text-[7px] text-emerald-400">Demineralized RO Ready</div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Center Rotary Dial Knob (Clickable & Rotates!) */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Dial Tick Ring */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-slate-700/80 bg-slate-950 flex items-center justify-center shadow-inner">
                {/* 3D Metal Rotary Knob */}
                <button
                  type="button"
                  onClick={() => {
                    // Cycle to next program on click
                    const keys = Object.keys(WASH_CYCLES) as WashCycleId[];
                    const nextIndex = (keys.indexOf(activeCycleId) + 1) % keys.length;
                    handleCycleSelect(keys[nextIndex]);
                  }}
                  style={{
                    transform: `rotate(${activeCycle.dialAngle}deg)`,
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-slate-800 via-slate-600 to-slate-800 border-2 border-slate-400/60 shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform"
                  title="Click to rotate cycle dial"
                >
                  {/* Dial Center Cap with circular knurl */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-600 flex items-center justify-center">
                    <RotateCw className="w-3 h-3 text-slate-400" />
                  </div>
                  {/* Dial Notch Indicator */}
                  <div className="absolute top-1 w-1.5 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                </button>
              </div>
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-1 font-bold truncate">
              DIAL: <span className="text-cyan-300">{activeCycle.shortName}</span>
            </div>
          </div>

          {/* 3. Right Digital Smart Display */}
          <div className="col-span-5">
            <div className="rounded-xl bg-slate-950/95 border border-cyan-500/30 p-2 sm:p-2.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_0_15px_rgba(6,182,212,0.1)] flex flex-col justify-between">
              {/* Display Header */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800/80 pb-1">
                <span className="text-cyan-400 font-bold flex items-center space-x-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>AI CARE</span>
                </span>
                <span className="text-[8px] bg-sky-950 px-1 rounded text-sky-300 font-mono border border-sky-800">
                  {activeCycle.rpm} RPM
                </span>
              </div>

              {/* Time Remaining Big Digital Numbers */}
              <div className="flex items-center justify-between my-1">
                <div className="font-mono font-black text-xl sm:text-2xl tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                  {formatTime(secondsRemaining)}
                </div>
                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={isDoorOpen}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                    isDoorOpen
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                      : isRunning
                      ? 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] active:scale-90'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse active:scale-90'
                  }`}
                  title={isRunning ? 'Pause Wash' : 'Start Wash'}
                >
                  {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                <span className="text-amber-300 truncate max-w-[90px]">{activeCycle.temp.split(' ')[0]}</span>
                <span className="font-bold text-emerald-400 truncate">{activeCycle.phase.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            THE GIANT FRONT-LOAD PORTHOLE DOOR
            Chrome Bezel + Convex Glass + Realistic Clothes Tumbling
        ======================================================== */}
        <div className="relative py-2 sm:py-3 flex items-center justify-center">
          
          {/* Door Frame Wrapper (With 3D open angle transition) */}
          <div 
            style={{
              perspective: '1000px',
            }}
            className="relative"
          >
            {/* Outer Machine Recess Shadow */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-slate-950 p-2 sm:p-2.5 shadow-[inset_0_10px_25px_rgba(0,0,0,0.9),0_5px_15px_rgba(0,0,0,0.6)] border-4 border-slate-800/80 relative flex items-center justify-center">
              
              {/* Thick Chrome Door Bezel */}
              <div 
                style={{
                  transformOrigin: 'left center',
                  transform: isDoorOpen ? 'rotateY(-55deg) scale(0.97)' : 'rotateY(0deg) scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isDoorOpen 
                    ? '-15px 10px 30px rgba(0,0,0,0.8)' 
                    : '0 10px 30px rgba(0,0,0,0.7)',
                }}
                className="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-slate-400 via-slate-700 to-slate-900 p-2 sm:p-2.5 relative flex items-center justify-center border-2 border-slate-300/40 z-20 group"
              >
                {/* Sculpted Chrome Door Handle (Click to toggle door) */}
                <button
                  type="button"
                  onClick={handleToggleDoor}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-14 rounded-r-xl bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border border-slate-500/60 shadow-[3px_0_10px_rgba(0,0,0,0.7)] cursor-pointer hover:brightness-110 active:scale-95 transition-all z-30 flex items-center justify-center"
                  title={isDoorOpen ? 'Click to Close Door' : 'Click to Open Door'}
                >
                  <div className="w-1 h-6 bg-slate-600 rounded-full" />
                </button>

                {/* Tinted Convex Glass Portal */}
                <div className={`w-full h-full rounded-full relative overflow-hidden border border-cyan-400/30 transition-colors ${
                  drumLight ? 'bg-sky-950/70' : 'bg-slate-950/90'
                }`}>
                  
                  {/* Warm Drum Interior Illumination when light is ON */}
                  {drumLight && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-12 bg-amber-200/25 blur-lg rounded-full pointer-events-none z-10" />
                  )}

                  {/* Glass Reflection Arc (Realistic Curvature Shine) */}
                  <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none z-20 transform -rotate-12" />

                  {/* ==============================================
                      INTERIOR ROTATING STAINLESS STEEL DRUM
                  ============================================== */}
                  <div 
                    className={`w-full h-full rounded-full relative flex items-center justify-center ${
                      isRunning && !isDoorOpen 
                        ? activeCycle.rpm > 1000 
                          ? 'animate-wm-drum-fast' 
                          : 'animate-wm-drum-slow'
                        : ''
                    }`}
                  >
                    {/* Perforated Drum Pattern Holes */}
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-slate-500/30 opacity-60" />
                    <div className="absolute inset-6 rounded-full border border-dotted border-cyan-400/20 opacity-40" />

                    {/* 3 Drum Baffle Lifters (Stainless steel wash paddles at 120deg) */}
                    <div className="absolute w-3 h-10 bg-gradient-to-b from-slate-500 to-slate-700 rounded-sm top-1 shadow-md opacity-80" />
                    <div className="absolute w-3 h-10 bg-gradient-to-b from-slate-500 to-slate-700 rounded-sm bottom-3 left-6 rotate-[120deg] shadow-md opacity-80" />
                    <div className="absolute w-3 h-10 bg-gradient-to-b from-slate-500 to-slate-700 rounded-sm bottom-3 right-6 rotate-[-120deg] shadow-md opacity-80" />
                  </div>

                  {/* ==============================================
                      CLOTHES TUMBLING INSIDE THE DRUM
                  ============================================== */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {/* Item 1: Royal Blue Oxford Shirt */}
                    <div 
                      className={`absolute w-12 h-10 rounded-lg bg-gradient-to-tr from-sky-600 via-blue-500 to-sky-400 shadow-md border border-sky-300/40 flex items-center justify-center ${
                        isRunning && !isDoorOpen ? 'animate-wm-clothes-1' : 'translate-y-12 rotate-12'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white/90">👕</span>
                    </div>

                    {/* Item 2: Rose Gold Bridal Silk */}
                    <div 
                      className={`absolute w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-300 shadow-md border border-pink-200/40 flex items-center justify-center ${
                        isRunning && !isDoorOpen ? 'animate-wm-clothes-2' : 'translate-x-8 translate-y-10 -rotate-45'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white/90">🥻</span>
                    </div>

                    {/* Item 3: Indigo Denim Fabric */}
                    <div 
                      className={`absolute w-14 h-8 rounded-md bg-gradient-to-r from-indigo-800 to-slate-800 shadow-lg border border-indigo-400/30 flex items-center justify-center ${
                        isRunning && !isDoorOpen ? 'animate-wm-clothes-3' : '-translate-x-8 translate-y-12 rotate-6'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-indigo-200">👖</span>
                    </div>

                    {/* Item 4: Crisp White Egyptian Cotton Towel */}
                    <div 
                      className={`absolute w-9 h-9 rounded-md bg-gradient-to-br from-white to-slate-200 shadow-md flex items-center justify-center ${
                        isRunning && !isDoorOpen ? 'animate-wm-clothes-1' : 'translate-y-8 rotate-45'
                      }`}
                    >
                      <span className="text-[9px]">🫧</span>
                    </div>
                  </div>

                  {/* ==============================================
                      WATER LEVEL & FOAM SUDS AT THE BOTTOM
                  ============================================== */}
                  {activeCycleId !== 'steam' && (
                    <div 
                      className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-600/50 via-sky-500/30 to-transparent backdrop-blur-xs pointer-events-none z-10 ${
                        isRunning && !isDoorOpen ? 'animate-wm-water' : ''
                      }`}
                    >
                      {/* Bubbly Foam Crest */}
                      <div className="absolute top-0 inset-x-0 flex justify-around text-white/70 text-xs">
                        <span className={isRunning ? 'animate-wm-bubble' : ''}>🫧</span>
                        <span className={isRunning ? 'animate-wm-bubble [animation-delay:0.4s]' : ''}>🫧</span>
                        <span className={isRunning ? 'animate-wm-bubble [animation-delay:0.8s]' : ''}>🫧</span>
                        <span className={isRunning ? 'animate-wm-bubble [animation-delay:1.2s]' : ''}>🫧</span>
                        <span className={isRunning ? 'animate-wm-bubble [animation-delay:0.2s]' : ''}>🫧</span>
                      </div>
                    </div>
                  )}

                  {/* Steam Cloud Mist Overlay for Steam Spa */}
                  {activeCycleId === 'steam' && isRunning && !isDoorOpen && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-orange-400/15 to-transparent pointer-events-none z-10 animate-wm-steam flex items-center justify-center">
                      <div className="text-3xl filter blur-xs opacity-75">💨</div>
                    </div>
                  )}

                  {/* Ozone Active Aura */}
                  {activeCycleId === 'ozone' && isRunning && !isDoorOpen && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full border border-cyan-400/40 animate-ping opacity-25" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MACHINE BOTTOM PLINTH (Filter flap & Stabilizers)
        ======================================================== */}
        <div className="pt-2 pb-1 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-bold">{activeCycle.name}</span>
          </div>
          {/* Drain Filter Coin Cap */}
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {activeCycle.temp}
            </span>
            <div 
              className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 shadow-inner flex items-center justify-center"
              title="Service Drain Filter"
            >
              <div className="w-2 h-0.5 bg-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CYCLE SELECTOR PRESET BUTTONS (Ozone, Steam, Silk, RO)
      ======================================================== */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
          <span>Select Fabric Wash Cycle to Test:</span>
          <span className="text-sky-700 font-black flex items-center space-x-1">
            <span>Click to switch</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {(Object.values(WASH_CYCLES)).map((cycle) => {
            const isSelected = activeCycleId === cycle.id;
            return (
              <button
                key={cycle.id}
                type="button"
                onClick={() => handleCycleSelect(cycle.id)}
                className={`p-1.5 sm:p-2 rounded-xl text-center border transition-all relative ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md scale-[1.03] z-10'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className="text-base sm:text-lg">{cycle.icon}</div>
                <div className="text-[10px] font-extrabold mt-0.5 truncate">{cycle.shortName}</div>
                <div className={`text-[8px] font-mono mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                  {cycle.rpm} RPM
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Benefit Description Banner */}
      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700 flex items-start space-x-2 text-xs">
        <div className="w-5 h-5 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 text-[11px] flex items-center space-x-1">
            <span>{activeCycle.name}</span>
            <span className="text-[9px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">
              100% Zero Fabric Damage
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight mt-0.5 truncate sm:whitespace-normal">
            {activeCycle.benefit}
          </p>
        </div>
      </div>

      {/* Direct Booking CTA with Selected Cycle */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onBookCycle?.(activeCycleId, activeCycle.name)}
          className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold rounded-2xl shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 text-xs sm:text-sm transition-all active:scale-[0.99] group"
        >
          <span className="text-base">{activeCycle.icon}</span>
          <span>Book Pickup with {activeCycle.shortName}</span>
          <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
