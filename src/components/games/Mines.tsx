import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Diamond, Bomb, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

const GRID_SIZE = 25;

export default function Mines() {
  const { gold, addGold, removeGold, recordMatch, user } = useGame();
  const [bet, setBet] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const startGame = () => {
    if (gold < bet) return;
    removeGold(bet);
    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!newMines.includes(pos)) newMines.push(pos);
    }
    setMines(newMines);
    setRevealed([]);
    setGameActive(true);
    setGameOver(false);
    setMultiplier(1);
  };

  const calculateMultiplier = (revealedCount: number) => {
    // Basic approximate multiplier formula
    let mult = 1;
    for (let i = 0; i < revealedCount; i++) {
      mult *= (GRID_SIZE - i) / (GRID_SIZE - mineCount - i);
    }
    return Math.round(mult * 100) / 100;
  };

  const handleCellClick = (idx: number) => {
    if (!gameActive || revealed.includes(idx) || gameOver) return;

    if (mines.includes(idx)) {
      setGameOver(true);
      setGameActive(false);
      recordMatch({
        players: [user?.uid || 'anonymous'],
        gameTitle: 'Minas do Rei',
        winnerId: 'house',
        bet: -bet
      });
      return;
    }

    const nextRevealed = [...revealed, idx];
    setRevealed(nextRevealed);
    setMultiplier(calculateMultiplier(nextRevealed.length));
    
    if (nextRevealed.length === GRID_SIZE - mineCount) {
      cashOut();
    }
  };

  const cashOut = () => {
    if (!gameActive || gameOver) return;
    let win = Math.floor(bet * multiplier);
    
    // VIP Bonus: 100% more profit
    if (user?.isVip) {
      const profit = win - bet;
      win = bet + (profit * 2);
    }

    addGold(win);
    recordMatch({
      players: [user?.uid || 'anonymous'],
      gameTitle: 'Minas do Rei',
      winnerId: user?.uid || 'anonymous',
      bet: win
    });
    setGameActive(false);
    setGameOver(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center p-4">
      {/* Controls */}
      <div className="w-full md:w-64 space-y-6 bg-black/20 p-6 rounded-2xl border border-medieval-gold/20">
        <div>
          <label className="text-[10px] font-bold uppercase text-stone-500 mb-2 block">Aposta em Ouro</label>
          <input 
            type="number" 
            value={bet}
            onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
            disabled={gameActive}
            className="w-full bg-black/40 border border-medieval-gold/30 rounded-lg py-2 px-3 text-medieval-gold font-bold focus:outline-none focus:border-medieval-gold"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-stone-500 mb-2 block">Número de Armadilhas ({mineCount})</label>
          <input 
            type="range" 
            min="1" 
            max="24" 
            value={mineCount}
            onChange={(e) => setMineCount(parseInt(e.target.value))}
            disabled={gameActive}
            className="w-full accent-medieval-gold"
          />
        </div>

        {!gameActive ? (
          <button 
            onClick={startGame}
            className="w-full py-3 bg-medieval-gold text-black font-black uppercase rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-widest"
          >
            Iniciar Busca
          </button>
        ) : (
          <button 
            onClick={cashOut}
            className="w-full py-3 bg-stone-100 text-black font-black uppercase rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-widest"
          >
            Retirar: {(bet * multiplier).toLocaleString()}
          </button>
        )}

        {gameActive && (
          <div className="text-center py-2 animate-pulse">
            <span className="text-medieval-gold font-medieval text-xl">{multiplier}x</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 md:gap-3 bg-stone-900/50 p-4 rounded-3xl border-4 border-medieval-wood/40 medieval-shadow">
        {Array(GRID_SIZE).fill(0).map((_, idx) => {
          const isRevealed = revealed.includes(idx);
          const isMine = mines.includes(idx);
          const isGameOverMine = gameOver && isMine;

          return (
            <motion.button
              key={idx}
              whileHover={!isRevealed && !gameOver ? { scale: 1.05 } : {}}
              whileTap={!isRevealed && !gameOver ? { scale: 0.95 } : {}}
              onClick={() => handleCellClick(idx)}
              disabled={gameOver || (revealed.includes(idx) && !gameOver)}
              className={cn(
                "w-12 h-12 md:w-16 md:h-16 rounded-lg transition-all flex items-center justify-center border-2",
                !isRevealed && !gameOver ? "bg-black/40 border-medieval-gold/20 hover:border-medieval-gold/50" : "",
                isRevealed && !isMine ? "bg-green-600/20 border-green-500/50" : "",
                isGameOverMine ? "bg-red-600/40 border-red-500/50" : "",
                gameOver && isMine && !revealed.includes(idx) ? "opacity-50" : ""
              )}
            >
              <AnimatePresence>
                {isRevealed && !isMine && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                    <Diamond className="w-6 h-6 text-green-400" />
                  </motion.div>
                )}
                {isGameOverMine && (
                  <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }}>
                    <Bomb className="w-6 h-6 text-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
