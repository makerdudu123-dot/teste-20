import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sword, Clover, Castle, ChevronRight, Users, Play } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGame } from '../context/GameContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const categories = [
  {
    id: 'strategy',
    title: 'Estratégia de Guerra',
    description: 'Batalhas táticas entre jogadores. Prove ser o melhor general.',
    icon: Sword,
    color: 'from-blue-900/40 to-indigo-900/40',
    borderColor: 'border-blue-500/50',
    games: ['Batalha Naval', 'Dama', 'Jogo da Velha'],
    type: 'Jogador VS Jogador'
  },
  {
    id: 'luck',
    title: 'A Bengala da Sorte',
    description: 'Onde o destino é decidido pelos deuses nos dados e moedas.',
    icon: Clover,
    color: 'from-emerald-900/40 to-green-900/40',
    borderColor: 'border-emerald-500/50',
    games: ['Jogo de Dados', 'Cara e Coroa'],
    type: 'Jogador VS Jogador'
  },
  {
    id: 'house',
    title: 'A Casa Real',
    description: 'Desafie a Taverna. Risco alto, recompensa real.',
    icon: Castle,
    color: 'from-rose-900/40 to-red-900/40',
    borderColor: 'border-rose-500/50',
    games: ['Roleta', 'Crash', 'Mines'],
    type: 'Jogador VS Casa'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { rooms, stats } = useGame();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto py-10"
    >
      <div className="flex justify-center gap-12 mb-12">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-black mb-1">População do Reino</span>
          <span className="font-cinzel text-2xl text-medieval-gold font-black">{stats?.totalUsers || 0}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-px h-12 bg-medieval-gold/20" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-black mb-1">Guerreiros Online</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-cinzel text-2xl text-white font-black">{stats?.onlineUsers || 0}</span>
          </div>
        </div>
      </div>

      <header className="text-center mb-16 px-4">
        <motion.h1 
          className="font-cinzel text-5xl md:text-7xl font-black mb-4 tracking-tighter"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400">A TAVERNA DO REI</span>
        </motion.h1>
        <p className="font-medieval text-xl text-medieval-gold/80 italic">Onde heróis apostam e lendas são feitas</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/category/${cat.id}`)}
            className={cn(
              "relative group cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br p-8 transition-all duration-500 shadow-medieval",
              cat.color,
              cat.borderColor,
              "hover:border-medieval-gold/50"
            )}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <cat.icon size={120} />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-6 inline-flex p-3 bg-black/40 rounded-xl border border-white/10">
                <cat.icon className="w-8 h-8 text-medieval-gold" />
              </div>

              <h2 className="font-cinzel text-2xl font-bold text-white mb-2 leading-tight">{cat.title}</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-medieval-gold mb-4 inline-block opacity-70">
                {cat.type}
              </span>
              
              <p className="text-stone-400 text-sm mb-8 leading-relaxed">
                {cat.description}
              </p>

              <div className="mt-auto flex flex-wrap gap-2 mb-8">
                {cat.games.map(game => (
                  <span key={game} className="px-2 py-1 bg-black/40 rounded text-[9px] font-bold uppercase tracking-wider text-stone-300 border border-white/5">
                    {game}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-medieval-gold font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                Entrar no Salão <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* NEW SECTION: ACTIVE ROOMS */}
      <section className="mt-20">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-px bg-medieval-gold/20 flex-1" />
           <h3 className="font-cinzel text-2xl font-bold text-medieval-gold flex items-center gap-3">
              <Users className="animate-pulse" /> TODOS OS DUELOS ATIVOS
           </h3>
           <div className="h-px bg-medieval-gold/20 flex-1" />
        </div>

        {rooms.length === 0 ? (
          <p className="text-center text-stone-500 font-medieval italic">Nenhum duelo ocorrendo no reino no momento...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/game/${room.gameId}?room=${room.id}`)}
                className="bg-stone-900/40 border-2 border-medieval-gold/10 p-5 rounded-2xl cursor-pointer group hover:border-medieval-gold/40 transition-all font-cinzel relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-2 bg-medieval-gold/10 rounded-bl-xl border-l border-b border-medieval-gold/20">
                    <span className="text-[10px] font-black text-medieval-gold">{room.bet} G</span>
                 </div>
                 <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block mb-2">{room.gameTitle}</span>
                 <h4 className="text-lg font-black text-white mb-4 uppercase tracking-tighter truncate pr-12">{room.creatorName}</h4>
                 <div className="flex items-center justify-between text-medieval-gold text-[10px] font-black uppercase tracking-widest pt-3 border-t border-white/5">
                    <span className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                       Aguardando
                    </span>
                    <Play size={12} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                 </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
