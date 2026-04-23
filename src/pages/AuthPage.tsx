import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Scroll, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const { loginWithGoogle, user, loading } = useGame();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-stone-900/80 border-2 border-medieval-gold/30 rounded-3xl p-8 medieval-shadow relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-medieval-gold to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-medieval-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-medieval-gold/30">
            <Scroll className="text-medieval-gold" />
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white mb-2">REGISTRO DE ALMAS</h1>
          <p className="text-stone-500 font-medieval italic">Use sua identidade Real para entrar.</p>
        </div>

        <div className="space-y-6">
          <p className="text-stone-400 text-sm text-center font-medieval">
            A taverna agora exige uma conexão segura via Google para proteger seus tesouros.
          </p>
          
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-black uppercase rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-cinzel text-lg disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94L5.84 14.1z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          <div className="flex items-start gap-3 p-4 bg-medieval-gold/5 rounded-xl border border-medieval-gold/10">
            <ShieldCheck className="text-medieval-gold w-5 h-5 shrink-0" />
            <p className="text-[10px] text-stone-400 leading-relaxed uppercase tracking-tighter">
              Ao entrar, você jura honrar as leis da Taverna. Seus dados estão sob a proteção da Coroa e criptografia celestial.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-stone-600 uppercase tracking-widest font-bold">
          Sincronizado com o Olimpo Digital
        </p>
      </motion.div>
    </div>
  );
}
