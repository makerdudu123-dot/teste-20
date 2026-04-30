import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GAMES } from '../constants';
import { ChevronLeft, XCircle, Users } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { useGame } from '../context/GameContext';

// Lazy load games to keep chunks small
const TicTacToe = lazy(() => import('../components/games/TicTacToe'));
const DiceRoll = lazy(() => import('../components/games/DiceRoll'));
const HeadsOrTails = lazy(() => import('../components/games/HeadsOrTails'));
const Roulette = lazy(() => import('../components/games/Roulette'));
const Crash = lazy(() => import('../components/games/Crash'));
const Mines = lazy(() => import('../components/games/Mines'));
const Checkers = lazy(() => import('../components/games/Checkers'));
const NavalBattle = lazy(() => import('../components/games/NavalBattle'));

const GameComponents: Record<string, any> = {
  'jogo-da-velha': TicTacToe,
  'dados': DiceRoll,
  'cara-coroa': HeadsOrTails,
  'roleta': Roulette,
  'crash': Crash,
  'mines': Mines,
  'dama': Checkers,
  'batalha-naval': NavalBattle,
};

export default function GamePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const navigate = useNavigate();
  const { rooms, user, deleteRoom, startGame, loading: authLoading } = useGame();
  
  const game = GAMES[id as keyof typeof GAMES];
  const Component = GameComponents[id as string];

  const currentRoom = rooms.find(r => r.id === roomId);
  
  if (game.type === 'PvP' && !currentRoom && !authLoading) {
    return (
      <div className="text-white text-center py-20 flex flex-col items-center gap-4">
        <h2 className="font-cinzel text-2xl text-medieval-gold">Sala não encontrada</h2>
        <p className="font-medieval text-stone-400">Esta sala pode ter sido fechada ou o duelo expirado.</p>
        <button onClick={() => navigate('/category/duelos')} className="px-6 py-2 bg-medieval-gold text-black rounded-lg font-bold">Voltar aos Duelos</button>
      </div>
    );
  }

  useEffect(() => {
     if (!authLoading && !user) {
        navigate('/auth');
     }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return (
    <div className="flex items-center justify-center min-h-[500px] text-medieval-gold">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-medieval-gold/20 border-t-medieval-gold rounded-full animate-spin" />
        <p className="font-cinzel text-xl uppercase tracking-widest animate-pulse">Invocando Guerreiro...</p>
      </div>
    </div>
  );

  if (!game || !Component) return <div className="text-white text-center py-20">Jogo não encontrado</div>;

  const isWaiting = game.type === 'PvP' && currentRoom && (currentRoom.status === 'waiting' || currentRoom.status === 'ready');
  const isReady = currentRoom?.status === 'ready';
  const isCreator = currentRoom?.creatorId === user?.uid;
  const isGuest = currentRoom?.guestId === user?.uid;

  const handleCloseRoom = async () => {
    if (currentRoom) {
      await deleteRoom(currentRoom.id);
      navigate(`/lobby/${game.id}`);
    }
  };

  const handleStartGame = async () => {
    if (currentRoom && isCreator) {
      await startGame(currentRoom.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-6"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(`/category/${game.category}`)}
          className="flex items-center gap-2 text-stone-400 hover:text-medieval-gold transition-colors uppercase text-xs font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {isWaiting && isCreator && (
          <button 
            onClick={handleCloseRoom}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors uppercase text-xs font-bold tracking-widest border border-red-500/20 px-4 py-2 rounded-xl bg-red-900/10"
          >
            <XCircle size={16} /> Cancelar Duelo e Sair
          </button>
        )}

        <div className="text-right">
          <h1 className="font-cinzel text-2xl font-bold text-medieval-gold">{game.title}</h1>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest">{game.type}</p>
        </div>
      </div>

      <div className="bg-black/40 border-2 border-medieval-gold/30 rounded-3xl p-8 min-h-[500px] relative overflow-hidden medieval-shadow flex flex-col">
         <AnimatePresence mode="wait">
            {isWaiting ? (
             <motion.div 
               key="waiting"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20"
             >
               <div className="relative">
                 <div className="w-24 h-24 border-4 border-medieval-gold/20 border-t-medieval-gold rounded-full animate-spin" />
                 <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-medieval-gold animate-pulse" />
               </div>
               
               <div>
                  <h2 className="font-cinzel text-3xl font-bold text-medieval-gold mb-2 uppercase tracking-tighter">
                    {isReady ? (isCreator ? "Oponente Encontrado!" : "Conectado ao Duelo!") : "Aguardando Oponente"}
                  </h2>
                  <p className="font-medieval text-stone-400 text-lg max-w-sm mx-auto leading-relaxed italic">
                     {isCreator 
                       ? (isReady ? "Um bravo guerreiro aceitou seu desafio. Deseja iniciar o combate?" : "Seu desafio foi lançado ao reino. Aguarde um guerreiro digno aceitá-lo...") 
                       : (isReady ? `Você está pronto! Aguarde ${currentRoom?.creatorName} soar as trombetas da guerra...` : "Desafiando mestre da sala... Prepare seu espírito!")}
                  </p>
               </div>

               {isReady && isCreator && (
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleStartGame}
                   className="px-10 py-4 bg-medieval-gold text-black font-black uppercase tracking-widest rounded-xl shadow-medieval hover:bg-yellow-400 transition-colors"
                 >
                   Iniciar Partida
                 </motion.button>
               )}

               <div className="flex gap-4">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="w-2 h-2 bg-medieval-gold rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
               </div>
             </motion.div>
           ) : (
             <motion.div 
               key="game"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex-1"
             >
               <Suspense fallback={<div className="flex items-center justify-center h-full text-medieval-gold animate-pulse font-medieval">Carregando Campo de Batalha...</div>}>
                  <Component />
               </Suspense>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}
