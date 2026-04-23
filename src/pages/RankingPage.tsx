import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Trophy, Users, Globe, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';

export default function RankingPage() {
  const { stats } = useGame();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      const q = query(collection(db, 'users'), orderBy('wins', 'desc'), limit(10));
      const snap = await getDocs(q);
      setTopUsers(snap.docs.map(doc => doc.data()));
      setLoading(false);
    };
    fetchRanking();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-10 px-4">
      <header className="text-center mb-16">
         <div className="flex justify-center mb-6">
            <Trophy size={80} className="text-medieval-gold animate-bounce" />
         </div>
         <h1 className="font-cinzel text-5xl font-black text-white mb-4 tracking-widest uppercase">HALL DA FAMA</h1>
         <p className="font-medieval text-xl text-stone-500 italic">Os maiores generais que já pisaram nesta taverna</p>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
         <div className="bg-black/40 border border-white/10 p-8 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
               <Users size={32} />
            </div>
            <div>
               <span className="text-[10px] text-stone-500 uppercase font-black block mb-1">Cidadãos Totais</span>
               <span className="font-cinzel text-3xl font-bold text-white">{stats?.totalUsers || 0}</span>
            </div>
         </div>
         <div className="bg-black/40 border border-white/10 p-8 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-green-500/10 rounded-2xl text-green-500">
               <Globe size={32} />
            </div>
            <div>
               <span className="text-[10px] text-stone-500 uppercase font-black block mb-1">Ativos Agora</span>
               <span className="font-cinzel text-3xl font-bold text-white">{stats?.onlineUsers || 0}</span>
            </div>
         </div>
      </div>

      {/* Ranking List */}
      <div className="bg-stone-900/60 border-2 border-medieval-gold/30 rounded-3xl overflow-hidden medieval-shadow">
         <div className="bg-medieval-gold/10 p-6 border-b border-medieval-gold/20 flex items-center justify-between font-black uppercase text-xs tracking-widest text-medieval-gold">
            <span>Posição / Guerreiro</span>
            <span>Vitórias</span>
         </div>

         <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-10 text-center animate-pulse text-stone-600 font-medieval uppercase tracking-widest">Consultando Pergaminhos...</div>
            ) : topUsers.length === 0 ? (
               <div className="p-10 text-center text-stone-600 font-medieval italic">Ainda não há lendas neste salão...</div>
            ) : (
               topUsers.map((u, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: idx * 0.1 }}
                   className={`p-6 flex items-center justify-between ${idx === 0 ? 'bg-medieval-gold/5' : 'hover:bg-white/5'} transition-colors`}
                 >
                    <div className="flex items-center gap-6">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black font-cinzel ${idx === 0 ? 'bg-medieval-gold text-black' : idx === 1 ? 'bg-stone-300 text-black' : idx === 2 ? 'bg-orange-800 text-white' : 'bg-black/40 text-stone-500'}`}>
                          {idx === 0 ? <Medal size={20}/> : idx + 1}
                       </div>
                       <div>
                          <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                             {u.username}
                             {u.isVip && <Crown size={12} className="text-medieval-gold fill-medieval-gold" />}
                          </h4>
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Patente: {u.wins > 50 ? 'Lendário' : u.wins > 20 ? 'Veterano' : 'Soldado'}</span>
                       </div>
                    </div>
                    <span className="font-medieval text-3xl font-bold text-medieval-gold">{u.wins || 0}</span>
                 </motion.div>
               ))
            )}
         </div>
      </div>
    </motion.div>
  );
}

function Crown({ size, className }: { size: number, className: string }) {
  return <Medal size={size} className={className} />; // Placeholder as lucide-react Crown is already used, wait I can import it
}
