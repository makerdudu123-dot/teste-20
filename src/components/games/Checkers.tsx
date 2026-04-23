import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Trash2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

type Piece = {
  id: string;
  player: 1 | 2;
  row: number;
  col: number;
  isKing: boolean;
};

export default function Checkers() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<{row: number, col: number, jump?: string}[]>([]);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const initGame = () => {
    const initialPieces: Piece[] = [];
    // Player 1 (Bottom, White/Gold)
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 !== 0) {
          initialPieces.push({ id: `p1-${r}-${c}`, player: 1, row: r, col: c, isKing: false });
        }
      }
    }
    // Player 2 (Top, Dark/Red)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 !== 0) {
          initialPieces.push({ id: `p2-${r}-${c}`, player: 2, row: r, col: c, isKing: false });
        }
      }
    }
    setPieces(initialPieces);
    setTurn(1);
    setSelectedPieceId(null);
    setValidMoves([]);
    setWinner(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  const getValidMoves = (piece: Piece) => {
    const moves: {row: number, col: number, jump?: string}[] = [];
    const directions = piece.player === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    if (piece.isKing) {
      directions.push(...(piece.player === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]));
    }

    directions.forEach(([dr, dc]) => {
      const nr = piece.row + dr;
      const nc = piece.col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = pieces.find(p => p.row === nr && p.col === nc);
        if (!target) {
          moves.push({ row: nr, col: nc });
        } else if (target.player !== piece.player) {
          const jr = nr + dr;
          const jc = nc + dc;
          if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8) {
            const jumpTarget = pieces.find(p => p.row === jr && p.col === jc);
            if (!jumpTarget) {
              moves.push({ row: jr, col: jc, jump: target.id });
            }
          }
        }
      }
    });

    return moves;
  };

  const selectPiece = (piece: Piece) => {
    if (piece.player !== turn || winner) return;
    setSelectedPieceId(piece.id);
    setValidMoves(getValidMoves(piece));
  };

  const movePiece = (row: number, col: number, jumpId?: string) => {
    if (!selectedPieceId) return;
    
    setPieces(prev => {
      let next = prev.filter(p => p.id !== jumpId);
      next = next.map(p => {
        if (p.id === selectedPieceId) {
          const isKing = p.isKing || (p.player === 1 && row === 0) || (p.player === 2 && row === 7);
          return { ...p, row, col, isKing };
        }
        return p;
      });
      return next;
    });

    // Simple win check
    const otherPlayer = turn === 1 ? 2 : 1;
    // Check if other player will have any pieces left (actual check in next frame/effect is better)
    
    setSelectedPieceId(null);
    setValidMoves([]);
    setTurn(otherPlayer);
  };

  useEffect(() => {
    if (pieces.length > 0) {
      const p1Alive = pieces.some(p => p.player === 1);
      const p2Alive = pieces.some(p => p.player === 2);
      if (!p1Alive) { setWinner(2); confetti({ origin: { y: 0.6 } }); }
      else if (!p2Alive) { setWinner(1); confetti({ origin: { y: 0.6 } }); }
    }
  }, [pieces]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="font-cinzel text-xl text-medieval-gold uppercase tracking-widest">
          {winner ? `Jogador ${winner} Venceu!` : `Vez do Jogador ${turn}`}
        </h2>
      </div>

      <div className="relative bg-medieval-wood p-2 rounded-xl border-4 border-black medieval-shadow">
        <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] md:w-[480px] md:h-[480px]">
          {Array(64).fill(0).map((_, i) => {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isDark = (r + c) % 2 !== 0;
            const move = validMoves.find(m => m.row === r && m.col === c);
            const piece = pieces.find(p => p.row === r && p.col === c);

            return (
              <div 
                key={i} 
                onClick={() => move && movePiece(r, c, move.jump)}
                className={`relative flex items-center justify-center border-black/10 transition-colors ${isDark ? 'bg-stone-800' : 'bg-stone-300'}`}
              >
                {move && (
                  <div className="absolute inset-0 bg-green-500/30 cursor-pointer animate-pulse border-2 border-green-400" />
                )}
                
                {piece && (
                  <motion.div
                    layoutId={piece.id}
                    onClick={(e) => { e.stopPropagation(); selectPiece(piece); }}
                    className={`w-3/4 h-3/4 rounded-full border-2 cursor-pointer medieval-shadow flex items-center justify-center ${
                      piece.player === 1 ? 'bg-medieval-gold border-yellow-200' : 'bg-red-900 border-red-700'
                    } ${selectedPieceId === piece.id ? 'ring-4 ring-white border-white scale-110' : ''}`}
                  >
                    {piece.isKing && <span className="text-white text-[10px] md:text-sm font-black">👑</span>}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button 
        onClick={initGame}
        className="mt-8 flex items-center gap-2 px-6 py-2 bg-medieval-wood border border-medieval-gold/30 text-medieval-gold font-bold rounded-lg hover:bg-medieval-gold/10 transition-all"
      >
        <RotateCcw size={16} /> Reiniciar Batalha
      </button>

      <p className="mt-4 text-[10px] uppercase text-stone-500 tracking-tighter">PvP Local (Hotseat) • Capture pulando as peças inimigas</p>
    </div>
  );
}
