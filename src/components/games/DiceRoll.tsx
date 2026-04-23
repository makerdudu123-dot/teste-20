import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Dices, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DiceRoll() {
  const { gold, addGold, removeGold } = useGame();
  const [bet, setBet] = useState(50);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{p1: number, p2: number} | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const roll = () => {
    // In PvP (Hotseat) mode, both players bet their amount
    // For simplicity, we just simulate a duel.
    setRolling(true);
    setResult(null);
    setWinner(null);
    
    setTimeout(() => {
      const p1 = Math.floor(Math.random() * 6) + 1;
      const p2 = Math.floor(Math.random() * 6) + 1;
      setResult({ p1, p2 });
      setRolling(false);
      
      if (p1 > p2) {
        setWinner('Guerreiro 1');
      } else if (p2 > p1) {
        setWinner('Guerreiro 2');
      } else {
        setWinner('Empate');
      }
      
      if (p1 !== p2) {
        confetti({ 
          particleCount: 100, 
          spread: 70, 
          origin: { y: 0.6 },
          colors: ['#d4af37', '#ffffff']
        });
      }
    }, 1000);
  };

  const getDieVisual = (val: number) => {
    const dots = Array(val).fill(0);
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-12 h-12 p-2">
        {val === 1 && <div className="col-start-2 row-start-2 bg-current rounded-full" />}
        {val === 2 && (
          <>
            <div className="col-start-1 row-start-1 bg-current rounded-full" />
            <div className="col-start-3 row-start-3 bg-current rounded-full" />
          </>
        )}
        {val === 3 && (
          <>
            <div className="col-start-1 row-start-1 bg-current rounded-full" />
            <div className="col-start-2 row-start-2 bg-current rounded-full" />
            <div className="col-start-3 row-start-3 bg-current rounded-full" />
          </>
        )}
        {val === 4 && (
          <>
            <div className="col-start-1 row-start-1 bg-current rounded-full" />
            <div className="col-start-3 row-start-1 bg-current rounded-full" />
            <div className="col-start-1 row-start-3 bg-current rounded-full" />
            <div className="col-start-3 row-start-3 bg-current rounded-full" />
          </>
        )}
        {val === 5 && (
          <>
            <div className="col-start-1 row-start-1 bg-current rounded-full" />
            <div className="col-start-3 row-start-1 bg-current rounded-full" />
            <div className="col-start-2 row-start-2 bg-current rounded-full" />
            <div className="col-start-1 row-start-3 bg-current rounded-full" />
            <div className="col-start-3 row-start-3 bg-current rounded-full" />
          </>
        )}
        {val === 6 && (
          <>
            <div className="col-start-1 row-start-1 bg-current rounded-full" />
            <div className="col-start-3 row-start-1 bg-current rounded-full" />
            <div className="col-start-1 row-start-2 bg-current rounded-full" />
            <div className="col-start-3 row-start-2 bg-current rounded-full" />
            <div className="col-start-1 row-start-3 bg-current rounded-full" />
            <div className="col-start-3 row-start-3 bg-current rounded-full" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 w-full max-w-2xl">
        {/* Player 1 */}
        <div className="flex flex-col items-center">
           <h3 className="font-cinzel text-xl mb-4 text-stone-500 uppercase tracking-widest">Guerreiro 1</h3>
           <motion.div 
             animate={rolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] } : {}}
             transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
             className={`w-32 h-32 bg-white rounded-2xl flex items-center justify-center text-black border-4 ${winner === 'Guerreiro 1' ? 'border-medieval-gold shadow-[0_0_20px_#d4af37]' : 'border-stone-400'}`}
           >
              {result ? getDieVisual(result.p1) : <Dices size={48} className="text-stone-300" />}
           </motion.div>
        </div>

        {/* Player 2 */}
        <div className="flex flex-col items-center">
           <h3 className="font-cinzel text-xl mb-4 text-stone-500 uppercase tracking-widest">Guerreiro 2</h3>
           <motion.div 
             animate={rolling ? { rotate: [0, -90, -180, -270, -360], scale: [1, 1.1, 1] } : {}}
             transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}
             className={`w-32 h-32 bg-white rounded-2xl flex items-center justify-center text-black border-4 ${winner === 'Guerreiro 2' ? 'border-medieval-gold shadow-[0_0_20px_#d4af37]' : 'border-stone-400'}`}
           >
              {result ? getDieVisual(result.p2) : <Dices size={48} className="text-stone-300" />}
           </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h2 className={`font-cinzel text-4xl font-bold ${winner === 'Empate' ? 'text-stone-400' : 'text-medieval-gold'}`}>
              {winner === 'Empate' ? 'EMPATE!' : `${winner.toUpperCase()} VENCEU!`}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={roll}
        disabled={rolling}
        className="px-12 py-4 bg-medieval-gold text-black font-black uppercase rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl font-cinzel group"
      >
        <span className="flex items-center gap-3">
          {rolling ? <RefreshCw className="animate-spin" /> : <Dices />}
          Jogar os Dados
        </span>
      </button>
      
      <p className="mt-8 text-stone-500 text-xs uppercase tracking-widest text-center">Duelo Local (PvP) • Ouro não deduzido por ser duelo entre amigos</p>
    </div>
  );
}
