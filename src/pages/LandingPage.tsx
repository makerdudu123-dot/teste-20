import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sword, Castle, Scroll } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useGame();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mb-8"
      >
        <div className="p-6 bg-medieval-gold/10 inline-block rounded-full border-2 border-medieval-gold/40 medieval-shadow mb-6">
          <Castle size={80} className="text-medieval-gold animate-pulse" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-cinzel text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-500 mb-6"
      >
        A TABERNA DO REI
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-medieval text-xl md:text-2xl text-medieval-gold/80 italic mb-12 max-w-2xl"
      >
        "A Espada da Sorte te chama, nobre viajante. Os dados estão lançados e o trono aguarda o mais ousado."
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <button 
          onClick={() => navigate('/auth')}
          className="group relative px-12 py-5 bg-medieval-gold text-black font-black uppercase text-xl rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all font-cinzel overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
             <Sword className="group-hover:rotate-12 transition-transform" />
             ENTRAR NA TABERNA
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
        </button>

        <button 
          onClick={() => navigate('/dashboard')}
          className="px-12 py-5 border-2 border-medieval-gold/30 text-medieval-gold font-black uppercase text-xl rounded-2xl hover:bg-medieval-gold/10 transition-all font-cinzel"
        >
          VER SALÕES
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-24 flex items-center gap-8 text-stone-500 text-xs font-bold uppercase tracking-[0.3em]"
      >
         <div className="flex items-center gap-2"><Scroll size={14}/> REGISTROS HISTÓRICOS</div>
         <div className="w-1 h-1 bg-stone-700 rounded-full"/>
         <div className="flex items-center gap-2">HONRA E TRADIÇÃO</div>
      </motion.div>
    </div>
  );
}
