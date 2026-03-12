import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Loader2, LogOut, Coins, MessageCircle, Target, Sparkles, Home as HomeIcon, Rocket, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoading } = useAppStore();
  const { user, logout } = useAuth();
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const loadingPhrases = [
    "Criando sua campanha estratégica...",
    "Analisando o perfil dos compradores ideais...",
    "Otimizando sua narrativa de vendas...",
    "Preparando seu planner semanal...",
    "Humanizando suas mensagens de WhatsApp...",
    "Quase pronto! O sucesso começa com estratégia."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, loadingPhrases.length]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-slate-900 flex flex-col relative">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/98 backdrop-blur-2xl flex items-center justify-center flex-col gap-8 p-6 text-center">
          <div className="relative">
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-brand-primary to-indigo-900 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] mb-4 relative z-10"
            >
              <Rocket className="w-16 h-16 text-white" />
            </motion.div>
            
            {/* Mascot Glow Effect */}
            <div className="absolute inset-0 bg-brand-primary/20 blur-[60px] rounded-full animate-pulse" />
            
            {/* Spinning Ring */}
            <div className="absolute -inset-6 border-2 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute -inset-10 border border-white/5 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

            <div className="absolute -bottom-4 -right-4 bg-brand-secondary text-white p-3 rounded-2xl shadow-2xl z-20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="text-brand-secondary font-black text-[10px] uppercase tracking-[0.4em]">Boss AI Processando</span>
              <div className="h-1 w-12 bg-brand-secondary rounded-full" />
            </div>
            
            <motion.p 
              key={loadingPhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white font-black text-2xl leading-tight tracking-tighter"
            >
              {loadingPhrases[loadingPhraseIndex]}
            </motion.p>
            
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Sua estratégia de luxo está sendo lapidada</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-primary/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter leading-none text-slate-900 uppercase">SocialImob</span>
              <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em]">Hebert Silva</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!user?.isAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                <Coins className="w-4 h-4 text-brand-secondary" />
                <span className="text-xs font-bold text-slate-700">{user?.credits} <span className="hidden sm:inline">créditos</span></span>
              </div>
            )}
            
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <a 
                    href="mailto:atendimento@arkaconsultoria.com.br"
                    className="w-full text-left px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    Suporte Técnico
                  </a>
                  <button 
                    onClick={() => { navigate('/history'); setIsMenuOpen(false); }}
                    className="w-full text-left px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    Histórico de Campanhas
                  </button>
                  {user?.isAdmin && (
                    <button 
                      onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                      className="w-full text-left px-5 py-4 text-sm text-brand-primary font-bold hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      Painel Boss
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-4 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 border-t border-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair do Sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-10 pb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Support */}
      <footer className="max-w-6xl mx-auto w-full p-10 text-center border-t border-slate-100">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">SocialImob - Hebert Silva © 2026</p>
        <a 
          href="mailto:atendimento@arkaconsultoria.com.br" 
          className="text-[10px] font-bold text-brand-secondary hover:text-brand-primary transition-colors uppercase tracking-wider"
        >
          Suporte: atendimento@arkaconsultoria.com.br
        </a>
      </footer>
    </div>
  );
}
