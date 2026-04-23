import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import confetti from 'canvas-confetti';
import { X, Circle, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function TicTacToe() {
  const { recordMatch, user, rooms, updateRoomData } = useGame();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  
  const currentRoom = rooms.find(r => r.id === roomId);
  
  // Board state derived from Firestore if in a room
  const board = currentRoom?.gameData?.board || Array(9).fill(null);
  const isXNext = currentRoom?.gameData?.isXNext ?? true;
  const [winner, setWinner] = useState<string | null>(null);

  const isCreator = currentRoom?.creatorId === user?.uid;
  const isGuest = currentRoom?.guestId === user?.uid;
  const mySymbol = isCreator ? 'X' : (isGuest ? 'O' : null);
  const isMyTurn = (isXNext && mySymbol === 'X') || (!isXNext && mySymbol === 'O');

  const calculateWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every(sq => sq) ? 'Empate' : null;
  };

  const handleClick = async (i: number) => {
    if (winner || board[i] || !roomId || !isMyTurn) return;
    
    const nextBoard = [...board];
    nextBoard[i] = isXNext ? 'X' : 'O';
    
    await updateRoomData(roomId, {
      board: nextBoard,
      isXNext: !isXNext
    });
  };

  useEffect(() => {
    const result = calculateWinner(board);
    if (result && !winner) {
      setWinner(result);
      if (result !== 'Empate') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#ffffff', '#8b6b1b']
        });

        // Only the winner records the match to avoid double recording
        const winnerId = result === 'X' ? currentRoom?.creatorId : currentRoom?.guestId;
        if (user?.uid === winnerId) {
          recordMatch({
            id: roomId || Math.random().toString(36).substr(2, 9),
            players: [currentRoom?.creatorId || '', currentRoom?.guestId || ''],
            gameTitle: 'Jogo da Velha',
            winnerId: winnerId || 'anonymous',
            bet: currentRoom?.bet || 0,
            createdAt: new Date()
          });
        }
      } else if (isCreator) {
        // Only creator records draws
         recordMatch({
          id: roomId || Math.random().toString(36).substr(2, 9),
          players: [currentRoom?.creatorId || '', currentRoom?.guestId || ''],
          gameTitle: 'Jogo da Velha',
          winnerId: 'draw',
          bet: currentRoom?.bet || 0,
          createdAt: new Date()
        });
      }
    }
  }, [board, currentRoom]);

  const reset = async () => {
    if (!roomId || !isCreator) return;
    await updateRoomData(roomId, {
      board: Array(9).fill(null),
      isXNext: true
    });
    setWinner(null);
  };

  useEffect(() => {
     if (currentRoom?.gameData?.board === undefined && isCreator && roomId) {
        // Init board
        updateRoomData(roomId, {
          board: Array(9).fill(null),
          isXNext: true
        });
     }
  }, [roomId, isCreator]);

  useEffect(() => {
    // Reset winner if board is cleared
    if (board.every((s: any) => s === null)) {
      setWinner(null);
    }
  }, [board]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="flex items-center gap-4 mb-4 justify-center">
           <div className={`px-4 py-2 rounded-xl border ${mySymbol === 'X' ? 'border-medieval-gold bg-medieval-gold/10' : 'border-white/10'}`}>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">Simbold: X</p>
              <p className="text-white font-bold">{currentRoom?.creatorName}</p>
           </div>
           <div className="text-medieval-gold font-cinzel text-xl">VS</div>
           <div className={`px-4 py-2 rounded-xl border ${mySymbol === 'O' ? 'border-medieval-gold bg-medieval-gold/10' : 'border-white/10'}`}>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">Simbold: O</p>
              <p className="text-white font-bold">{currentRoom?.guestId ? 'Desafiante' : 'Aguardando...'}</p>
           </div>
        </div>

        <h2 className="font-medieval text-2xl text-stone-300 mb-2">
          {winner ? (winner === 'Empate' ? 'Empate!' : `Vencedor: ${winner}`) : (
            isMyTurn ? "Sua vez de lutar!" : "Aguarde o golpe do adversário..."
          )}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {board.map((val: string | null, idx: number) => (
          <motion.button
            key={idx}
            whileHover={{ scale: val || !isMyTurn ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(idx)}
            className={`w-24 h-24 bg-white/5 border-2 rounded-xl flex items-center justify-center text-4xl transition-colors ${
               val ? 'border-stone-800' : (isMyTurn ? 'border-medieval-gold/40 hover:border-medieval-gold' : 'border-white/5 opacity-50 cursor-not-allowed')
            }`}
          >
            <AnimatePresence>
              {val === 'X' && (
                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
                  <X className="w-12 h-12 text-medieval-gold" />
                </motion.div>
              )}
              {val === 'O' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Circle className="w-10 h-10 text-stone-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {winner && isCreator && (
        <button 
          onClick={reset}
          className="mt-12 flex items-center gap-2 px-6 py-2 bg-medieval-gold text-black font-bold rounded-lg hover:scale-105 transition-transform"
        >
          <RotateCcw size={18} /> Novo Duelo
        </button>
      )}
    </div>
  );
}
