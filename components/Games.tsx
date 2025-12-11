import React, { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';

export interface GameProps {
  userBalance: number;
  onPlay: (bet: number, winAmount: number) => void;
}

// 4. Daily Roulette (Updated 13 Segments & Rigged)
interface RouletteProps {
  userBalance: number;
  spinChances: number;
  onSpinStart: (cost: number) => void;
  onSpinEnd: (win: number) => void;
  onWatchAd?: () => void;
  onAlert: (message: string) => void; // Custom Alert Handler
}

export const DailyRoulette: React.FC<RouletteProps> = ({ userBalance, spinChances, onSpinStart, onSpinEnd, onWatchAd, onAlert }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // 13 Segments requested
  const SECTORS = [
    { label: 'KUPON 50%', value: 0, color: '#db2777', text: 'Kupon' }, // Pink
    { label: 'Rp 10', value: 10, color: '#facc15', text: 'Rp 10' },      // Yellow
    { label: 'Rp 20', value: 20, color: '#3b82f6', text: 'Rp 20' },      // Blue
    { label: 'Rp 30', value: 30, color: '#ef4444', text: 'Rp 30' },      // Red
    { label: 'Rp 50', value: 50, color: '#a855f7', text: 'Rp 50' },      // Purple
    { label: 'Rp 100', value: 100, color: '#22c55e', text: 'Rp 100' },   // Green
    { label: 'Rp 150', value: 150, color: '#f97316', text: 'Rp 150' },   // Orange
    { label: 'Rp 500', value: 500, color: '#06b6d4', text: 'Rp 500' },   // Cyan
    { label: 'Rp 750', value: 750, color: '#6366f1', text: 'Rp 750' },   // Indigo
    { label: 'Rp 1000', value: 1000, color: '#ec4899', text: 'Rp 1K' },  // Pink-ish
    { label: 'Rp 3000', value: 3000, color: '#14b8a6', text: 'Rp 3K' },  // Teal
    { label: 'Rp 5000', value: 5000, color: '#84cc16', text: 'Rp 5K' },  // Lime
    { label: 'ZONK', value: 0, color: '#1f2937', text: 'ZONK' },      // Dark Gray
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    if (spinChances <= 0) {
        onAlert("Anda tidak memiliki tiket Spin! Lakukan Topup minimal Rp 10.000 atau Nonton Iklan.");
        return;
    }

    setIsSpinning(true);
    onSpinStart(0); // 0 cost, logic handled by parent (decrement spinChances)
    
    // --- RIGGING LOGIC ---
    // Pastikan spin selalu berhenti di ZONK atau nilai paling kecil (10).
    const possibleTargets = SECTORS.filter(s => s.text === 'ZONK' || s.value === 10);
    const winSector = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    const winIndex = SECTORS.indexOf(winSector);
    // ---------------------

    // Calculate angles for 13 sectors
    const sectorAngle = 360 / SECTORS.length;
    
    // CSS rotation starts at 12 o'clock if we correct it. 
    // The conic gradient draws clockwise from 0deg (Top).
    // Sector 0 is 0 - 27.69 deg. Center is 13.84 deg.
    // To land Sector X at Top (0 deg), we need to rotate the WHEEL counter-clockwise by center angle of Sector X.
    // Or rotate Clockwise by (360 - CenterAngle).
    
    const winningSectorCenterAngle = (winIndex * sectorAngle) + (sectorAngle / 2);
    const extraSpins = 360 * 5; // 5 full spins
    const targetRotation = (360 - winningSectorCenterAngle); 
    
    // Smooth transition accumulation
    const currentRotMod = rotation % 360;
    const distance = (targetRotation - currentRotMod + 360) % 360;
    const newRotation = rotation + extraSpins + distance;

    setRotation(newRotation);

    setTimeout(() => {
        setIsSpinning(false);
        onSpinEnd(winSector.value);
        if (winSector.value > 0) onAlert(`Selamat! Anda mendapatkan ${winSector.label}`);
        else onAlert("ZONK! Coba lagi.");
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 relative">
        
        {/* WHEEL CONTAINER WRAPPER */}
        <div className="relative">
            {/* STAND NECK (Behind Wheel) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[180px] w-24 h-32 bg-gradient-to-b from-gray-800 to-black z-0 clip-trapezoid"></div>

            {/* MAIN WHEEL */}
            <div className="relative w-[280px] h-[280px] z-10 sm:w-[300px] sm:h-[300px]">
                {/* POINTER */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30 w-8 h-10 filter drop-shadow-lg">
                    <div className="w-full h-full bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 clip-triangle-down border-t-2 border-white/50"></div>
                </div>

                {/* OUTER RIM (Black with lights) */}
                <div className="w-full h-full rounded-full bg-[#1a1a1a] border-4 border-[#333] shadow-2xl relative flex items-center justify-center p-3">
                    {/* LIGHTS (Dots around the rim) */}
                    {[...Array(13)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_5px_gold] animate-pulse"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${i * (360/13)}deg) translate(132px) rotate(-${i * (360/13)}deg)`, // Adjusted translate for smaller size
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}

                    {/* SPINNING WHEEL */}
                    <div 
                        className="w-full h-full rounded-full overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-yellow-600"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                        }}
                    >
                        {/* SECTORS BACKGROUND */}
                        <div 
                            className="w-full h-full rounded-full"
                            style={{
                                background: `conic-gradient(
                                    ${SECTORS.map((s, i) => `${s.color} ${i * (100/SECTORS.length)}% ${(i+1) * (100/SECTORS.length)}%`).join(', ')}
                                )`
                            }}
                        ></div>
                        
                        {/* LABELS & DIVIDERS */}
                        {SECTORS.map((sector, idx) => {
                            const angle = 360 / SECTORS.length;
                            const rotate = idx * angle + (angle / 2); // Center of sector
                            return (
                                <div 
                                    key={idx}
                                    className="absolute top-0 left-1/2 h-1/2 w-0 flex justify-center origin-bottom pt-2 z-20"
                                    style={{ transform: `translateX(-50%) rotate(${rotate}deg)` }}
                                >
                                    <div className="absolute top-0 h-full w-[1px] bg-black/20 origin-bottom" style={{ transform: `rotate(-${angle/2}deg)`}}></div>
                                    <span 
                                        className="text-white font-black text-[9px] tracking-wider drop-shadow-[0_2px_1px_rgba(0,0,0,0.9)]" 
                                        style={{ 
                                            writingMode: 'vertical-rl', 
                                            textOrientation: 'mixed', 
                                            transform: 'rotate(180deg)',
                                            marginTop: '15px',
                                            textShadow: '0 0 2px black, 0 0 4px black' 
                                        }}
                                    >
                                        {sector.text}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    
                    {/* CENTER KNOB */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-xl border-4 border-yellow-200 z-30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 border-2 border-yellow-300 shadow-inner"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* STAND BASE (Trapezoid Reflection/Shadow) */}
         <div className="relative -mt-6 z-10">
             <div className="w-32 h-10 bg-gradient-to-b from-[#333] to-[#111] clip-trapezoid shadow-2xl mx-auto border-t border-gray-600"></div>
             <div className="w-48 h-3 bg-[#000] rounded-full mx-auto -mt-1 opacity-50 blur-md"></div>
         </div>

         <div className="flex flex-col gap-2 w-full max-w-[280px] mt-4">
            <button 
                onClick={handleSpin} 
                disabled={isSpinning}
                className="bg-gradient-to-b from-yellow-400 to-orange-600 text-white border-b-4 border-orange-800 py-3 rounded-full font-black text-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-1 transition disabled:grayscale disabled:scale-100"
            >
                {isSpinning ? 'SPINNING...' : `SPIN (${spinChances})`}
            </button>
            
            {onWatchAd && (
                <button 
                    onClick={onWatchAd}
                    disabled={isSpinning}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg border-b-2 border-blue-800 active:border-b-0 active:translate-y-0.5 transition"
                >
                    <PlayCircle size={14} /> Nonton Iklan (+1 Spin)
                </button>
            )}
         </div>
    </div>
  );
};