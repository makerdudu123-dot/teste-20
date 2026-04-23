import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Castle, TrendingUp, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Crash() {
  const { gold, addGold, removeGold } = useGame();
  const [bet, setBet] = useState(20);
  const [multiplier, setMultiplier] = useState(1);
  const [status, setStatus] = useState<'idle' | 'running' | 'crashed'>('idle');
  const [crashPoint, setCrashPoint] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    if (gold < bet) return;
    removeGold(bet);
    
    // Generate crash point (house edge built in)
    const random = Math.random();
    // Weighted crash points: crash early more often
    const newCrashPoint = Math.max(1, 1 / (1 - random * 0.98));
    setCrashPoint(newCrashPoint);
    
    setStatus('running');
    setMultiplier(1);
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Multiplier formula: grows exponentially
      const currentMult = Math.pow(1.08, elapsed * 10);
      
      if (currentMult >= newCrashPoint) {
        setStatus('crashed');
        setMultiplier(newCrashPoint);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
      }
      
      setMultiplier(currentMult);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (status !== 'running') return;
    const win = Math.floor(bet * multiplier);
    addGold(win);
    setStatus('idle'); // Technically "won", but we stop the visual for the player
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl h-80 relative bg-black/40 rounded-3xl border border-medieval-gold/30 overflow-hidden mb-8">
        {/* Background Grid/Stars effect */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Graph/Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status === 'crashed' ? (
              <motion.div 
                key="crashed"
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-center"
              >
                <AlertTriangle size={80} className="text-red-600 mx-auto mb-4" />
                <h2 className="font-cinzel text-5xl font-black text-red-600">QUEDA DO CASTELO!</h2>
                <p className="text-stone-400 font-medieval text-xl mt-2">O castelo ruiu em {multiplier.toFixed(2)}x</p>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                className="text-center"
              >
                <div className="relative">
                  <motion.div
                    animate={status === 'running' ? { y: [0, -10, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Castle size={100} className={status === 'running' ? "text-medieval-gold" : "text-stone-700"} />
                  </motion.div>
                  {status === 'running' && (
                     <motion.div 
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                     >
                        <TrendingUp className="text-green-500 w-8 h-8" />
                     </motion.div>
                  )}
                </div>
                <div className="mt-8">
                   <span className={`font-cinzel text-7xl font-black tabular-nums ${status === 'running' ? 'text-white' : 'text-stone-700'}`}>
                    {multiplier.toFixed(2)}x
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center w-full max-w-xl">
        <div className="flex-1 w-full">
           <label className="text-[10px] font-bold uppercase text-stone-500 mb-2 block tracking-widest text-center">Aposta de Ouro</label>
           <input 
              type="number" 
              value={bet}
              onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
              disabled={status === 'running'}
              className="w-full bg-black/60 border-2 border-medieval-gold/30 rounded-2xl py-4 px-6 text-2xl text-medieval-gold font-cinzel text-center focus:outline-none focus:border-medieval-gold transition-all"
            />
        </div>

        <div className="flex-1 w-full">
          {status !== 'running' ? (
            <button 
              onClick={startGame}
              className="w-full py-5 bg-medieval-gold text-black font-black uppercase rounded-2xl shadow-xl hover:scale-[1.05] active:scale-95 transition-all text-xl tracking-tighter font-cinzel"
            >
              Iniciar Ascensão
            </button>
          ) : (
            <button 
              onClick={cashOut}
              className="w-full py-5 bg-white text-black font-black uppercase rounded-2xl shadow-xl hover:scale-[1.05] active:scale-95 transition-all text-xl tracking-tighter font-cinzel border-4 border-medieval-gold"
            >
              RETIRAR: {(bet * multiplier).toFixed(0)}
            </button>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-stone-500 text-xs italic font-medieval">Retire-se antes que o castelo caia sobre sua cabeça!</p>
    </div>
  );
}
