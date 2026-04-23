import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CATEGORIES, GAMES } from '../constants';
import { ChevronLeft, Play } from 'lucide-react';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const category = CATEGORIES[id as keyof typeof CATEGORIES];

  if (!category) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto py-10"
    >
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-stone-400 hover:text-medieval-gold transition-colors mb-8 uppercase text-xs font-bold tracking-widest"
      >
        <ChevronLeft size={16} /> Voltar para a Taverna
      </button>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-4 bg-medieval-gold/10 rounded-2xl border border-medieval-gold/30">
          <category.icon className="w-12 h-12 text-medieval-gold" />
        </div>
        <div>
          <h1 className="font-cinzel text-4xl font-bold text-white tracking-widest uppercase">{category.title}</h1>
          <p className="text-stone-500 font-medieval">Escolha seu desafio, nobre guerreiro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.games.map((gameId, idx) => {
          const game = GAMES[gameId as keyof typeof GAMES];
          return (
              <motion.div
                key={gameId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => {
                  if (game.type === 'PvP') {
                    navigate(`/lobby/${gameId}`);
                  } else {
                    navigate(`/game/${gameId}`);
                  }
                }}
                className="bg-medieval-wood/20 border border-medieval-gold/20 rounded-xl p-6 cursor-pointer group hover:border-medieval-gold/50 transition-all medieval-shadow"
              >
                <h3 className="font-cinzel text-xl font-bold mb-2 group-hover:text-medieval-gold transition-colors">{game.title}</h3>
                <p className="text-stone-400 text-sm mb-6 h-12 line-clamp-2">{game.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-black/30 px-2 py-1 rounded">
                    {game.type}
                  </span>
                  <div className="flex items-center gap-2 text-medieval-gold text-xs font-bold uppercase group-hover:gap-3 transition-all">
                    Entrar <Play size={10} fill="currentColor" />
                  </div>
                </div>
              </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
