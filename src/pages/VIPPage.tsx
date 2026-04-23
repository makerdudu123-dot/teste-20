import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Crown, Zap, ShieldCheck, Gem, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VIPPage() {
  const { user, gold, buyVip } = useGame();

  const handleBuyVip = async () => {
    if (gold < 5000) return;
    await buyVip();
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  };

  const benefits = [
    { icon: Zap, title: "100% de Ganho", desc: "Suas vitórias valem o dobro do ouro apostado!" },
    { icon: ShieldCheck, title: "Proteção Real", desc: "Prioridade suporte e saques relâmpago." },
    { icon: Gem, title: "Símbolo de Nobreza", desc: "Coroa exclusiva ao lado da sua alcunha." },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-16 px-4">
      <header className="text-center mb-16">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
           transition={{ duration: 5, repeat: Infinity }}
           className="inline-block p-6 bg-medieval-gold/10 rounded-full border-2 border-medieval-gold mb-6"
         >
            <Crown size={64} className="text-medieval-gold" />
         </motion.div>
         <h1 className="font-cinzel text-5xl font-black text-white mb-4 tracking-tighter uppercase">Ascenda à Nobreza</h1>
         <p className="font-medieval text-xl text-stone-500 italic max-w-2xl mx-auto">
           "Torne-se um VIP e desfrute de privilégios dignos de um monarca em nossa Taverna."
         </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
         {benefits.map((b, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.2 }}
             className="bg-black/40 border border-white/5 p-8 rounded-3xl text-center hover:border-medieval-gold/30 transition-all"
           >
              <b.icon size={32} className="text-medieval-gold mx-auto mb-4" />
              <h3 className="font-cinzel text-lg font-bold text-white mb-2">{b.title}</h3>
              <p className="text-xs text-stone-500 font-medieval leading-relaxed uppercase tracking-tighter">{b.desc}</p>
           </motion.div>
         ))}
      </div>

      <div className="bg-stone-900 border-2 border-medieval-gold/40 rounded-[3rem] p-12 text-center medieval-shadow relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="font-cinzel text-3xl font-bold text-white mb-2">PLANO DE ASCENSÃO</h2>
            <div className="mb-8">
               <span className="text-5xl font-black text-medieval-gold font-medieval">5.000 <span className="text-xl font-sans">G</span></span>
               <p className="text-stone-500 text-xs uppercase tracking-widest mt-2">Investimento Único e Eterno</p>
            </div>

            {user?.isVip ? (
              <div className="flex items-center justify-center gap-3 text-green-500 font-black font-cinzel text-xl uppercase tracking-widest">
                 <CheckCircle2 size={24} /> Você já é um Nobre
              </div>
            ) : (
              <button 
                onClick={handleBuyVip}
                disabled={gold < 5000}
                className="px-12 py-5 bg-medieval-gold text-black font-black uppercase text-xl rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all font-cinzel disabled:opacity-50 disabled:grayscale"
              >
                Tornar-se VIP Agora
              </button>
            )}

            {gold < 5000 && !user?.isVip && (
               <p className="mt-4 text-red-500/70 text-xs font-bold uppercase tracking-widest">Saldo insuficiente no seu tesouro</p>
            )}
         </div>

         <div className="absolute -bottom-20 -left-20 opacity-10 blur-xl">
            <Gem size={300} className="text-medieval-gold" />
         </div>
      </div>
    </motion.div>
  );
}
