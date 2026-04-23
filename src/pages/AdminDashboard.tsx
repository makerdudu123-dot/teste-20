import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Shield, Users, Wallet, TrendingUp, Settings, Check, X, Search, Edit2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';

export default function AdminDashboard() {
  const { stats, updateStats, updateTransactionStatus, updateUserGoldAdmin, isAdmin } = useGame();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'trans'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempGold, setTempGold] = useState(0);

  const [pvpFee, setPvpFee] = useState(stats?.pvpFee || 10);
  const [pvhFee, setPvhFee] = useState(stats?.pvhFee || 10);

  useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        // Fetch Users
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
        setUsers(usersSnap.docs.map(doc => doc.data()));

        // Fetch Transactions
        const transSnap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50)));
        setTransactions(transSnap.docs.map(doc => doc.data()));
      };
      fetchData();
    }
  }, [isAdmin]);

  if (!isAdmin) return <div className="text-center py-20 font-cinzel text-red-500">Acesso Restrito ao Conselho do Trono</div>;

  const handleUpdateFees = () => {
    updateStats({ pvpFee, pvhFee });
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto py-10 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
         <div className="flex items-center gap-4">
            <div className="p-4 bg-medieval-gold/10 rounded-2xl border border-medieval-gold/30">
               <Shield size={32} className="text-medieval-gold" />
            </div>
            <div>
               <h1 className="font-cinzel text-4xl font-black text-white tracking-widest uppercase">Salão do Trono</h1>
               <p className="text-stone-500 font-medieval italic uppercase tracking-widest text-xs">Governança e Tesouraria do Reino</p>
            </div>
         </div>

         <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'stats', label: 'Visão Geral', icon: TrendingUp },
              { id: 'users', label: 'Cidadãos', icon: Users },
              { id: 'trans', label: 'Pedidos', icon: Wallet },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-medieval-gold text-black' : 'text-stone-500 hover:text-white'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
         </div>
      </header>

      {activeTab === 'stats' && (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Ouro em Circulação', val: stats?.totalGoldInCirculation || 0, color: 'text-amber-500', unit: 'G' },
                { label: 'Lucro da Casa', val: stats?.houseProfit || 0, color: 'text-green-500', unit: 'G' },
                { label: 'Total de Cidadãos', val: stats?.totalUsers || 0, color: 'text-blue-500', unit: '' },
                { label: 'Guerreiros Online', val: stats?.onlineUsers || 0, color: 'text-medieval-gold', unit: '' },
              ].map((s, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 p-8 rounded-3xl medieval-shadow">
                   <span className="text-[10px] text-stone-500 uppercase font-black block mb-2">{s.label}</span>
                   <span className={`font-cinzel text-3xl font-bold ${s.color}`}>{s.val.toLocaleString()} <span className="text-sm font-sans">{s.unit}</span></span>
                </div>
              ))}
           </div>

           <div className="bg-stone-900/60 border-2 border-medieval-gold/30 rounded-3xl p-10 medieval-shadow">
              <div className="flex items-center gap-3 mb-8 text-medieval-gold">
                 <Settings size={24} />
                 <h2 className="font-cinzel text-xl font-bold uppercase tracking-widest">Leis de Tributação</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest">Tributo PvP (%) - 90% p/ ganhador</label>
                    <input 
                      type="number" 
                      value={pvpFee} 
                      onChange={(e) => setPvpFee(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-medieval-gold font-bold"
                    />
                    <p className="text-[10px] text-stone-600 italic">"Atualmente o ganhador recebe {100 - pvpFee}% do pote."</p>
                 </div>
                 <div className="space-y-4">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest">Tributo Casa (PvH) (%)</label>
                    <input 
                      type="number" 
                      value={pvhFee}
                      onChange={(e) => setPvhFee(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-medieval-gold font-bold"
                    />
                 </div>
              </div>

              <button 
                onClick={handleUpdateFees}
                className="mt-10 px-8 py-3 bg-medieval-gold text-black font-black uppercase text-xs rounded-xl hover:scale-105 transition-all"
              >
                 Decretar Novas Leis
              </button>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
              <input 
                placeholder="Procurar cidadão por nome ou pergaminho eletrônico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-medieval-gold"
              />
           </div>

           <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-stone-500">
                       <th className="p-6">Guerreiro</th>
                       <th className="p-6">Tesouro</th>
                       <th className="p-6">Status</th>
                       <th className="p-6">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-all">
                         <td className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-medieval-gold rounded-full flex items-center justify-center font-black text-black">{u.username[0].toUpperCase()}</div>
                               <div>
                                  <h4 className="text-white font-bold">{u.username}</h4>
                                  <span className="text-[10px] text-stone-600 uppercase tracking-widest">{u.email}</span>
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            {editingUser === u.uid ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={tempGold}
                                  onChange={(e) => setTempGold(Number(e.target.value))}
                                  className="w-24 bg-black/40 border border-medieval-gold/30 rounded-lg px-2 py-1 text-white text-sm"
                                />
                                <button onClick={() => { updateUserGoldAdmin(u.uid, tempGold); setEditingUser(null); }} className="text-green-500"><Save size={18}/></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-medieval text-xl text-yellow-500 font-bold">{u.gold.toLocaleString()} G</span>
                                <button onClick={() => { setEditingUser(u.uid); setTempGold(u.gold); }} className="text-stone-700 hover:text-white transition-colors"><Edit2 size={14}/></button>
                              </div>
                            )}
                         </td>
                         <td className="p-6 text-[10px] uppercase font-black">
                            {u.isVip ? <span className="text-medieval-gold">Nobre VIP</span> : <span className="text-stone-600">Plebeu</span>}
                         </td>
                         <td className="p-6">
                            <button className="text-xs text-red-500 font-black uppercase hover:underline">Banir</button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'trans' && (
        <div className="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-stone-500">
                    <th className="p-6">Guerreiro</th>
                    <th className="p-6">Tipo</th>
                    <th className="p-6">Valor</th>
                    <th className="p-6">Data</th>
                    <th className="p-6 text-right">Decisão</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {transactions.map((t, idx) => (
                   <tr key={idx} className="hover:bg-white/5 transition-all">
                      <td className="p-6 font-bold text-white uppercase text-xs">{t.userId.substring(0, 8)}...</td>
                      <td className="p-6">
                         <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${t.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t.type === 'deposit' ? 'Depósito' : 'Saque'}
                         </span>
                      </td>
                      <td className="p-6 font-medieval text-lg font-bold text-white">{t.amount.toLocaleString()} G</td>
                      <td className="p-6 text-stone-500 text-[10px] uppercase font-bold">{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Recent'}</td>
                      <td className="p-6 text-right flex justify-end gap-3">
                         {t.status === 'pending' ? (
                           <>
                              <button onClick={() => updateTransactionStatus(t.id, 'completed')} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"><Check size={18}/></button>
                              <button onClick={() => updateTransactionStatus(t.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"><X size={18}/></button>
                           </>
                         ) : (
                           <span className="text-[10px] uppercase font-black opacity-40">{t.status}</span>
                         )}
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </motion.div>
  );
}
