import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { GAMES } from '../constants';
import { ChevronLeft, Plus, Users, Shield, Play, XCircle } from 'lucide-react';

export default function LobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createRoom, getRoomsByGame, user, joinRoom, deleteRoom } = useGame();
  
  const game = GAMES[id as keyof typeof GAMES];
  if (!game) return null;

  const activeRooms = getRoomsByGame(id as string);
  const myRoom = activeRooms.find(r => r.creatorId === user?.uid && r.status === 'waiting');
  const [betAmount, setBetAmount] = useState(100);

  const handleCreateRoom = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const roomId = await createRoom(game.id, game.title, betAmount);
      navigate(`/game/${game.id}?room=${roomId}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      await joinRoom(roomId);
      navigate(`/game/${game.id}?room=${roomId}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-10"
    >
      <button 
        onClick={() => navigate(`/category/${game.category.toLowerCase()}`)}
        className="flex items-center gap-2 text-stone-400 hover:text-medieval-gold transition-colors mb-8 uppercase text-xs font-bold tracking-widest"
      >
        <ChevronLeft size={16} /> Ver Outros Jogos
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-black/40 p-8 rounded-3xl border border-medieval-gold/20">
        <div>
          <h1 className="font-cinzel text-4xl font-bold text-white tracking-widest uppercase">{game.title}</h1>
          <p className="text-stone-500 font-medieval italic">Salão de Espera para Duelos PvP</p>
        </div>
        
        {myRoom ? (
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-medieval-gold font-bold text-xs uppercase animate-pulse">Aguardando Desafiante...</p>
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1">Aposta: {myRoom.bet} G</p>
             </div>
             <button 
               onClick={() => deleteRoom(myRoom.id)}
               className="p-4 bg-red-900/20 text-red-500 rounded-xl border border-red-500/30 hover:bg-red-900/40 transition-all flex items-center gap-2 font-bold text-xs uppercase"
             >
                <XCircle size={18} /> Cancelar
             </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 px-6 py-3 bg-black/60 rounded-2xl border border-white/10 shadow-inner">
               <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Pote do Duelo:</span>
               <div className="flex items-center gap-2">
                 <input 
                   type="number" 
                   value={betAmount}
                   onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                   className="w-24 bg-transparent border-none text-medieval-gold font-black focus:outline-none text-right font-cinzel text-xl"
                 />
                 <span className="text-medieval-gold font-black font-cinzel">G</span>
               </div>
            </div>
            <button 
              onClick={handleCreateRoom}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-medieval-gold text-black font-black uppercase rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-cinzel text-sm"
            >
              <Plus size={20} /> CRIAR SALA DE DUELO
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="font-cinzel text-lg text-medieval-gold flex items-center gap-2 border-b border-medieval-gold/20 pb-4">
          <Users size={18} /> SALAS ATIVAS NO REINO
        </h3>

        {activeRooms.filter(r => r.status === 'waiting').length === 0 ? (
          <div className="p-12 text-center bg-black/20 rounded-3xl border-2 border-dashed border-medieval-gold/10">
             <Shield className="w-12 h-12 text-stone-700 mx-auto mb-4" />
             <p className="font-medieval text-stone-500">Nenhum guerreiro aguardando no momento...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRooms.filter(r => r.status === 'waiting').map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-stone-900/60 border border-medieval-gold/20 p-6 rounded-2xl flex items-center justify-between group hover:border-medieval-gold/50 transition-all"
              >
                <div className="flex-1">
                   <span className="text-[10px] font-bold text-medieval-gold uppercase tracking-widest block mb-1">Mestre da Sala</span>
                   <h4 className="font-cinzel text-xl font-bold text-white group-hover:text-medieval-gold transition-all">{room.creatorName}</h4>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Sala Aberta</span>
                      </div>
                      <div className="text-[10px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded font-black uppercase tracking-widest">
                         Pote: {room.bet} G
                      </div>
                   </div>
                </div>
                
                {room.creatorId === user?.uid ? (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-stone-500">
                     <Users size={20} />
                  </div>
                ) : (
                  <button 
                    onClick={() => handleJoinRoom(room.id)}
                    className="p-4 bg-medieval-gold/10 rounded-xl border border-medieval-gold/30 hover:bg-medieval-gold text-medieval-gold hover:text-black transition-all"
                  >
                    <Play size={20} fill="currentColor" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 p-8 bg-black/40 rounded-3xl border border-medieval-gold/10 flex items-center gap-6">
          <div className="p-4 bg-medieval-gold/10 rounded-full border border-medieval-gold/20">
             <Shield size={32} className="text-medieval-gold" />
          </div>
          <div>
            <h4 className="font-cinzel text-lg font-bold text-white mb-1">REGRAS DE HONRA</h4>
            <p className="text-xs text-stone-500 leading-relaxed uppercase tracking-tighter max-w-lg">
               Cada duelo é sagrado. O jogador que abandonar o campo de batalha será banido dos salões reais e perderá todo o seu ouro acumulado. Jogue com honra.
            </p>
          </div>
      </div>
    </motion.div>
  );
}
