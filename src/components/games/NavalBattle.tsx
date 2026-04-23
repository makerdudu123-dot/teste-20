import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Crosshair, Target, Ghost } from 'lucide-react';
import confetti from 'canvas-confetti';

const GRID_SIZE = 7;
const SHIPS = [3, 2, 2]; // ship lengths

export default function NavalBattle() {
  const [board1, setBoard1] = useState<number[][]>([]); // Player 1 ship positions
  const [board2, setBoard2] = useState<number[][]>([]); // Player 2 ship positions
  const [hits1, setHits1] = useState<string[]>([]); // Where P1 fired on P2
  const [hits2, setHits2] = useState<string[]>([]); // Where P2 fired on P1
  const [gameStage, setGameStage] = useState<'setup1' | 'setup2' | 'battle'>('setup1');
  const [turn, setTurn] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const initEmptyBoard = () => Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

  const placeRandomShips = () => {
    const board = initEmptyBoard();
    SHIPS.forEach(len => {
      let placed = false;
      while (!placed) {
        const horiz = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (horiz ? GRID_SIZE : GRID_SIZE - len + 1));
        const c = Math.floor(Math.random() * (horiz ? GRID_SIZE - len + 1 : GRID_SIZE));
        
        let possible = true;
        for (let i = 0; i < len; i++) {
          if (board[horiz ? r : r + i][horiz ? c + i : c] === 1) possible = false;
        }

        if (possible) {
          for (let i = 0; i < len; i++) {
            board[horiz ? r : r + i][horiz ? c + i : c] = 1;
          }
          placed = true;
        }
      }
    });
    return board;
  };

  useEffect(() => {
    setBoard1(placeRandomShips());
    setBoard2(placeRandomShips());
  }, []);

  const handleFire = (r: number, c: number) => {
    if (winner || gameStage !== 'battle') return;
    const key = `${r},${c}`;
    
    if (turn === 1) {
      if (hits1.includes(key)) return;
      const newHits = [...hits1, key];
      setHits1(newHits);
      
      const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);
      const hitCount = newHits.filter(k => {
        const [row, col] = k.split(',').map(Number);
        return board2[row][col] === 1;
      }).length;

      if (hitCount === totalShipCells) {
        setWinner(1);
        confetti({ origin: { y: 0.6 } });
      } else {
        setTurn(2);
      }
    } else {
      if (hits2.includes(key)) return;
      const newHits = [...hits2, key];
      setHits2(newHits);

      const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);
      const hitCount = newHits.filter(k => {
        const [row, col] = k.split(',').map(Number);
        return board1[row][col] === 1;
      }).length;

      if (hitCount === totalShipCells) {
        setWinner(2);
        confetti({ origin: { y: 0.6 } });
      } else {
        setTurn(1);
      }
    }
  };

  const renderBoard = (isEnemyBoard: boolean) => {
    const currentHits = turn === 1 ? (isEnemyBoard ? hits1 : hits2) : (isEnemyBoard ? hits2 : hits1);
    const targetBoard = turn === 1 ? (isEnemyBoard ? board2 : board1) : (isEnemyBoard ? board1 : board2);

    return (
      <div className="grid grid-cols-7 gap-1 bg-blue-900/20 p-2 rounded-lg border-2 border-medieval-gold/20">
        {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          const key = `${r},${c}`;
          const isHit = currentHits.includes(key);
          const isShip = targetBoard[r][c] === 1;

          return (
            <div 
              key={i} 
              onClick={() => isEnemyBoard && handleFire(r, c)}
              className={`w-10 h-10 md:w-14 md:h-14 border border-blue-500/20 flex items-center justify-center transition-all cursor-crosshair rounded ${
                isHit ? (isShip ? 'bg-red-500/40 border-red-500' : 'bg-white/10 border-white/20') : 'hover:bg-blue-400/20'
              }`}
            >
              {isHit ? (
                isShip ? <Target className="text-red-500" /> : <Ghost className="text-stone-500 opacity-20" />
              ) : (
                !isEnemyBoard && isShip && <Anchor className="text-blue-500 opacity-40" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="font-cinzel text-xl text-medieval-gold tracking-[0.2em] mb-2 uppercase">
          {winner ? (winner === 1 ? 'Vitória do Almirante 1' : 'Vitória do Almirante 2') : `Vez do Almirante ${turn}`}
        </h2>
        <div className="px-4 py-1 bg-medieval-wood/40 border border-medieval-gold/30 rounded inline-block text-[10px] text-stone-400 font-bold uppercase">
          {gameStage === 'battle' ? 'Modo de Combate' : 'Posicionando Frotas'}
        </div>
      </div>

      {gameStage === 'setup1' || gameStage === 'setup2' ? (
        <div className="text-center">
           <p className="font-medieval text-stone-300 mb-8 italic text-lg capitalize">O Almirante {gameStage === 'setup1' ? '1' : '2'} está preparando os galeões...</p>
           <button 
             onClick={() => setGameStage(gameStage === 'setup1' ? 'setup2' : 'battle')}
             className="px-8 py-3 bg-medieval-gold text-black font-black uppercase rounded shadow-lg hover:scale-105 transition-all"
           >
             CONFIRMAR POSIÇÕES
           </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex flex-col items-center">
             <span className="text-[10px] uppercase font-bold text-red-500 mb-2 tracking-[0.3em]">Costa Inimiga</span>
             {renderBoard(true)}
          </div>
          <div className="flex flex-col items-center grayscale opacity-60">
             <span className="text-[10px] uppercase font-bold text-blue-400 mb-2 tracking-[0.3em]">Seu Porto</span>
             {renderBoard(false)}
          </div>
        </div>
      )}

      <button 
        onClick={() => {
           setBoard1(placeRandomShips()); 
           setBoard2(placeRandomShips());
           setHits1([]);
           setHits2([]);
           setWinner(null);
           setGameStage('battle');
           setTurn(1);
        }}
        className="mt-12 flex items-center gap-2 px-6 py-2 bg-stone-900 border border-stone-700 text-stone-500 font-bold rounded hover:bg-stone-800 transition-all text-xs"
      >
        REDEFINIR FROTAS
      </button>
      
      <p className="mt-4 text-[10px] uppercase text-stone-600 tracking-widest">Duelo de Canhões entre Jogadores • Navios posicionados secretamente pela coroa</p>
    </div>
  );
}
