import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Coins, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HeadsOrTails() {
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'CARA' | 'COROA' | null>(null);

  const flipCoin = () => {
    setFlipping(true);
    setResult(null);
    
    setTimeout(() => {
      const isHeads = Math.random() > 0.5;
      setResult(isHeads ? 'CARA' : 'COROA');
      setFlipping(false);
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff']
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48 mb-12 prespective-[1000px]">
        <motion.div
          animate={flipping ? { 
            rotateY: [0, 720, 1440, 2160],
            y: [0, -150, 0],
            scale: [1, 1.2, 1]
          } : { rotateY: result === 'COROA' ? 180 : 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative"
        >
          {/* Face 1: Cara */}
          <div className="absolute inset-0 bg-medieval-gold rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)] backface-hidden">
             <div className="text-center">
                <Coins size={64} className="text-yellow-100 mx-auto" />
                <span className="font-cinzel font-black text-black text-2xl">CARA</span>
             </div>
          </div>
          {/* Face 2: Coroa */}
          <div className="absolute inset-0 bg-yellow-600 rounded-full border-4 border-yellow-800 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)] backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
             <div className="text-center">
                <div className="w-16 h-16 border-4 border-yellow-200 rounded-full mx-auto mb-1 flex items-center justify-center">
                   <div className="w-8 h-8 bg-yellow-200 rounded-full" />
                </div>
                <span className="font-cinzel font-black text-yellow-100 text-2xl tracking-tighter">COROA</span>
             </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <h2 className="font-cinzel text-5xl font-black text-medieval-gold border-b-4 border-medieval-gold/30 pb-2">
              {result}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={flipCoin}
        disabled={flipping}
        className="px-12 py-4 bg-medieval-gold text-black font-black uppercase rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl font-cinzel flex items-center gap-3"
      >
        {flipping ? <RotateCw className="animate-spin" /> : <Coins />}
        Lançar Moeda
      </button>

      <div className="mt-12 grid grid-cols-2 gap-8 text-center text-stone-500 font-medieval">
        <div>
          <p className="text-xs uppercase opacity-70 mb-1 tracking-widest">Jogador 1 Escolhe</p>
          <div className="p-2 border border-stone-700 rounded-lg">Cara</div>
        </div>
        <div>
          <p className="text-xs uppercase opacity-70 mb-1 tracking-widest">Jogador 2 Escolhe</p>
          <div className="p-2 border border-stone-700 rounded-lg">Coroa</div>
        </div>
      </div>
    </div>
  );
}
