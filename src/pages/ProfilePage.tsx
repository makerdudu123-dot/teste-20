import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Wallet, History, Trophy, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, gold, buyGold, withdrawGold } = useGame();
  const [activeTab, setActiveTab] = useState<'finance' | 'matches'>('finance');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    if (user) {
      // Fetch Transactions
      const fetchTrans = async () => {
        const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        setTransactions(snap.docs.map(doc => doc.data()));
      };
      // Fetch Matches
      const fetchMatches = async () => {
        const q = query(collection(db, 'matches'), where('players', 'array-contains', user.uid), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        setMatches(snap.docs.map(doc => doc.data()));
      };
      fetchTrans();
      fetchMatches();
    }
  }, [user]);

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-10 px-4">
      {/* Header / Info */}
      <div className="bg-stone-900/60 border-2 border-medieval-gold/30 rounded-3xl p-8 mb-8 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Crown size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="w-24 h-24 bg-medieval-gold rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl">
              <span className="text-4xl font-black font-cinzel text-black">{user.username[0].toUpperCase()}</span>
           </div>
           
           <div className="text-center md:text-left flex-1">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="font-cinzel text-3xl font-bold text-white">{user.username}</h1>
                {user.isVip && <span className="px-3 py-1 bg-medieval-gold text-black text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1"><Crown size={12}/> VIP</span>}
              </div>
              <p className="text-stone-500 font-medieval italic uppercase tracking-widest text-sm">{user.email}</p>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center">
                 <span className="text-[10px] text-stone-500 uppercase font-black block mb-1">Vitorias</span>
                 <span className="font-cinzel text-2xl font-bold text-green-500">{user.wins || 0}</span>
              </div>
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center">
                 <span className="text-[10px] text-stone-500 uppercase font-black block mb-1">Derrotas</span>
                 <span className="font-cinzel text-2xl font-bold text-red-500">{user.losses || 0}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Wallet */}
        <div className="space-y-8">
           <div className="bg-black/40 border border-medieval-gold/20 p-8 rounded-3xl medieval-shadow">
              <div className="flex items-center gap-3 mb-6 text-medieval-gold">
                 <Wallet size={24} />
                 <h2 className="font-cinzel text-xl font-bold uppercase tracking-widest">Tesouro Real</h2>
              </div>
              
              <div className="text-center py-6 bg-black/40 rounded-2xl border border-white/5 mb-8">
                 <span className="text-stone-500 text-[10px] uppercase font-black block mb-2">Saldo Atual</span>
                 <span className="font-medieval text-5xl text-yellow-500 font-bold">{gold.toLocaleString()} <span className="text-sm font-sans">G</span></span>
              </div>

              <div className="space-y-4">
                 <input 
                   type="number" 
                   value={amount}
                   onChange={(e) => setAmount(Number(e.target.value))}
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-medieval-gold text-center font-bold"
                 />
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => buyGold(amount)}
                      className="py-3 bg-medieval-gold text-black font-black uppercase text-xs rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                       <TrendingUp size={16}/> Depositar
                    </button>
                    <button 
                      onClick={() => withdrawGold(amount)}
                      disabled={gold < amount}
                      className="py-3 border border-white/10 text-white font-black uppercase text-xs rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       <TrendingDown size={16}/> Sacar
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Histories */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <button 
                onClick={() => setActiveTab('finance')}
                className={`text-xs font-black uppercase tracking-widest py-2 px-4 rounded-xl transition-all ${activeTab === 'finance' ? 'bg-medieval-gold text-black' : 'text-stone-500 hover:text-white'}`}
              >
                Movimentações
              </button>
              <button 
                onClick={() => setActiveTab('matches')}
                className={`text-xs font-black uppercase tracking-widest py-2 px-4 rounded-xl transition-all ${activeTab === 'matches' ? 'bg-medieval-gold text-black' : 'text-stone-500 hover:text-white'}`}
              >
                Batalhas Recentes
              </button>
           </div>

           <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
              {activeTab === 'finance' ? (
                <div className="divide-y divide-white/5">
                   {transactions.length === 0 ? (
                     <div className="p-20 text-center text-stone-600 font-medieval italic">Nenhuma transação registrada nos pergaminhos...</div>
                   ) : (
                     transactions.map((t, idx) => (
                       <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-lg ${t.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {t.type === 'deposit' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                             </div>
                             <div>
                                <h4 className="text-white text-sm font-bold uppercase">{t.type === 'deposit' ? 'Depósito Real' : 'Saque de Tesouro'}</h4>
                                <span className="text-[10px] text-stone-500 uppercase tracking-widest">{t.status}</span>
                             </div>
                          </div>
                          <span className={`font-medieval text-lg font-bold ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                             {t.type === 'deposit' ? '+' : '-'}{t.amount.toLocaleString()} G
                          </span>
                       </div>
                     ))
                   )}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                   {matches.length === 0 ? (
                     <div className="p-20 text-center text-stone-600 font-medieval italic">Nenhum duelo registrado nos pergaminhos...</div>
                   ) : (
                     matches.map((m, idx) => {
                       const isWin = m.winnerId === user.uid;
                       return (
                         <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className={`p-2 rounded-lg ${isWin ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  <Trophy size={18}/>
                               </div>
                               <div>
                                  <h4 className="text-white text-sm font-bold uppercase">{m.gameTitle}</h4>
                                  <span className="text-[10px] text-stone-500 uppercase tracking-widest">{isWin ? 'Vitória' : 'Derrota'}</span>
                               </div>
                            </div>
                            <span className={`font-medieval text-lg font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                               {isWin ? '+' : '-'}{m.bet?.toLocaleString() || 0} G
                            </span>
                         </div>
                       );
                     })
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
