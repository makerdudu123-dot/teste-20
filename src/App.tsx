/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Clover, Castle, Coins, User, Medal, Crown, Shield } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import GamePage from './pages/GamePage';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import ProfilePage from './pages/ProfilePage';
import VIPPage from './pages/VIPPage';
import RankingPage from './pages/RankingPage';
import AdminDashboard from './pages/AdminDashboard';
import GlobalChat from './components/GlobalChat';

function Navbar() {
  const { gold, user, logout, loading, isAdmin } = useGame();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-stone-950/90 backdrop-blur-xl border-b-2 border-medieval-gold/30">
      <div className="absolute inset-0 bg-medieval-gold/5 pointer-events-none" />
      <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group relative z-10">
        <div className="p-2 bg-medieval-gold/10 rounded-lg border border-medieval-gold/50 group-hover:bg-medieval-gold/20 transition-all">
          <Castle className="w-6 h-6 text-medieval-gold" />
        </div>
        <div className="flex flex-col">
          <span className="font-cinzel text-xl font-black tracking-[0.2em] text-medieval-gold hidden sm:block uppercase">A TAVERNA DO REI</span>
          <span className="text-[8px] text-stone-500 font-black uppercase tracking-[0.3em] hidden sm:block">Medieval Casino Arena</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4 text-[10px] font-black uppercase tracking-widest text-stone-500">
          {isAdmin && (
            <Link to="/admin" className="text-medieval-gold hover:text-white transition-colors flex items-center gap-1" title="Salão do Trono">
              <Shield size={16} className="md:hidden" />
              <span className="hidden md:block">Salão do Trono</span>
            </Link>
          )}
          <Link to="/ranking" className="hover:text-medieval-gold transition-colors flex items-center gap-1" title="Ranking">
            <Medal size={16} className="md:hidden" />
            <span className="hidden md:block">Ranking</span>
          </Link>
          <Link to="/vip" className="hover:text-medieval-gold transition-colors flex items-center gap-1" title="VIP">
            <Crown size={16} className="md:hidden" />
            <span className="hidden md:block">VIP</span>
            <Crown size={12} className="hidden md:block" />
          </Link>
        </div>
        
        {loading ? (
          <div className="w-24 h-8 bg-white/5 animate-pulse rounded-lg" />
        ) : user ? (
          <>
            <Link to="/profile" className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg hover:border-medieval-gold/30 transition-all">
               <div className="w-6 h-6 bg-medieval-gold rounded-full flex items-center justify-center text-[10px] text-black font-black font-cinzel">
                  {user.username?.[0]?.toUpperCase() || 'U'}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 hidden md:block">{user.username}</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-medieval-wood/40 border border-medieval-gold/30 rounded-full medieval-shadow">
              <Coins className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="font-medieval text-lg text-yellow-500">{gold.toLocaleString()} <span className="text-xs font-sans">OURO</span></span>
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-900/20 rounded-full transition-colors text-red-500"
              title="Sair da Taverna"
            >
               <User className="w-5 h-5 rotate-180 scale-x-[-1]" />
            </button>
          </>
        ) : (
          <Link to="/auth" className="px-6 py-2 bg-medieval-gold text-black font-bold rounded-lg hover:scale-105 transition-all text-xs uppercase tracking-widest">
             Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}

function Atmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-radial-[circle_at_50%_50%] from-transparent via-transparent to-black/60" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-900/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen pt-24 relative bg-[#0a0806] selection:bg-medieval-gold selection:text-black">
           <Atmosphere />
          <div className="fixed inset-0 texture-overlay pointer-events-none z-0" />
          <Navbar />
          
          <main className="container mx-auto px-4 pb-20 relative z-10">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/vip" element={<VIPPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/lobby/:id" element={<LobbyPage />} />
                <Route path="/game/:id" element={<GamePage />} />
              </Routes>
            </AnimatePresence>
          </main>
          
          <GlobalChat />

          <footer className="fixed bottom-0 left-0 right-0 py-3 text-center bg-black/80 backdrop-blur-md border-t border-medieval-gold/20 text-[10px] uppercase tracking-[0.3em] font-cinzel text-stone-600 z-50">
            Reino Govervado pela Coroa • Bebam com Moderação • © 2026
          </footer>
        </div>
      </Router>
    </GameProvider>
  );
}
