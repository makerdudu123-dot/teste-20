import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { RotateCw, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

const ROULETTE_NUMBERS = [
  { n: 0, color: 'green' },
  { n: 32, color: 'red' }, { n: 15, color: 'black' }, { n: 19, color: 'red' }, { n: 4, color: 'black' },
  { n: 21, color: 'red' }, { n: 2, color: 'black' }, { n: 25, color: 'red' }, { n: 17, color: 'black' },
  { n: 34, color: 'red' }, { n: 6, color: 'black' }, { n: 27, color: 'red' }, { n: 13, color: 'black' },
  { n: 36, color: 'red' }, { n: 11, color: 'black' }, { n: 30, color: 'red' }, { n: 8, color: 'black' },
  { n: 23, color: 'red' }, { n: 10, color: 'black' }, { n: 5, color: 'red' }, { n: 24, color: 'black' },
  { n: 16, color: 'red' }, { n: 33, color: 'black' }, { n: 1, color: 'red' }, { n: 20, color: 'black' },
  { n: 14, color: 'red' }, { n: 31, color: 'black' }, { n: 9, color: 'red' }, { n: 22, color: 'black' },
  { n: 18, color: 'red' }, { n: 29, color: 'black' }, { n: 7, color: 'red' }, { n: 28, color: 'black' },
  { n: 12, color: 'red' }, { n: 35, color: 'black' }, { n: 3, color: 'red' }, { n: 26, color: 'black' }
];

export default function Roulette() {
  const { gold, addGold, removeGold } = useGame();
  const [bet, setBet] = useState(50);
  const [betOn, setBetOn] = useState<'red' | 'black' | 'green' | number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<typeof ROULETTE_NUMBERS[0] | null>(null);

  const spin = () => {
    if (gold < bet || !betOn) return;
    removeGold(bet);
    setSpinning(true);
    setLastResult(null);

    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = rotation + extraSpins * 360;
    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      // Normalized rotation to find the index
      const normalized = (finalRotation % 360);
      const index = Math.floor(((360 - normalized) / (360 / ROULETTE_NUMBERS.length))) % ROULETTE_NUMBERS.length;
      const result = ROULETTE_NUMBERS[index];
      setLastResult(result);

      // Check win
      let win = 0;
      if (betOn === result.color) {
        win = result.color === 'green' ? bet * 35 : bet * 2;
      } else if (betOn === result.n) {
        win = bet * 35;
      }

      if (win > 0) {
        addGold(win);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-72 md:w-80 md:h-80 mb-12">
        {/* Needle */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 w-1 h-8 bg-medieval-gold shadow-lg" />
        
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="w-full h-full rounded-full border-8 border-medieval-wood shadow-2xl relative overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(circle, #3e2723 0%, #1a120b 100%)' }}
        >
          {ROULETTE_NUMBERS.map((n, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 -ml-[2px] w-[4px] h-1/2 origin-bottom flex items-start justify-center pt-2"
              style={{ transform: `rotate(${(i * 360) / ROULETTE_NUMBERS.length}deg)` }}
            >
              <div className={`w-6 h-8 text-[8px] font-bold flex flex-col items-center rounded-sm ${
                n.color === 'red' ? 'bg-red-700' : n.color === 'black' ? 'bg-stone-900' : 'bg-green-700'
              }`}>
                {n.n}
              </div>
            </div>
          ))}
          {/* Center piece */}
          <div className="absolute inset-[35.5%] bg-medieval-wood rounded-full border-4 border-medieval-gold flex items-center justify-center shadow-inner">
             <div className="w-12 h-12 bg-medieval-gold/10 rounded-full animate-pulse flex items-center justify-center">
                <RotateCw className={`text-medieval-gold ${spinning ? 'animate-spin' : ''}`} size={24} />
             </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-2xl bg-black/20 p-6 rounded-2xl border border-medieval-gold/10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            onClick={() => setBetOn('red')}
            className={`py-3 rounded-lg font-bold border-2 transition-all ${betOn === 'red' ? 'bg-red-700 border-white shadow-lg' : 'bg-red-900/40 border-red-500/30'}`}
          >
            VERMELHO (2x)
          </button>
          <button 
            onClick={() => setBetOn('black')}
            className={`py-3 rounded-lg font-bold border-2 transition-all ${betOn === 'black' ? 'bg-stone-800 border-white shadow-lg' : 'bg-stone-900/40 border-stone-500/30'}`}
          >
            PRETO (2x)
          </button>
          <button 
            onClick={() => setBetOn('green')}
            className={`py-3 rounded-lg font-bold border-2 transition-all ${betOn === 'green' ? 'bg-green-700 border-white shadow-lg' : 'bg-green-900/40 border-green-500/30'}`}
          >
            ZERO (35x)
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
           <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-stone-500 mb-2 block tracking-widest">Valor da Moeda</label>
              <input 
                type="number" 
                value={bet}
                onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                disabled={spinning}
                className="w-full bg-black/40 border border-medieval-gold/20 rounded-lg py-3 px-4 text-medieval-gold font-bold focus:outline-none focus:border-medieval-gold"
              />
           </div>
           <button 
             onClick={spin}
             disabled={spinning || !betOn}
             className="flex-1 py-4 bg-medieval-gold text-black font-black uppercase rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg font-cinzel disabled:opacity-50"
           >
              Girar a Roda
           </button>
        </div>
      </div>

      <AnimatePresence>
        {lastResult && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className={`mt-8 p-6 rounded-full border-4 medieval-shadow ${
               lastResult.color === 'red' ? 'bg-red-700 border-red-400' : 
               lastResult.color === 'black' ? 'bg-stone-900 border-stone-600' : 
               'bg-green-700 border-green-400'
            }`}
          >
            <span className="font-cinzel text-5xl font-black text-white">{lastResult.n}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
