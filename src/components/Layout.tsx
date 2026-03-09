import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Loader2, LogOut, Coins, MessageCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4 p-6 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <motion.p 
            key={loadingPhraseIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-indigo-900 font-medium italic"
          >
            {loadingPhrases[loadingPhraseIndex]}
          </motion.p>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight leading-none">SocialImob</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Beta</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!user?.isAdmin && (
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">{user?.credits} <span className="hidden sm:inline">créditos</span></span>
              </div>
            )}
            
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-100 rounded-full">
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <a 
                    href="mailto:atendimento@arkaconsultoria.com.br"
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Suporte
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-24">
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
      </main>

      {/* Footer Support */}
      <footer className="max-w-md mx-auto w-full p-6 text-center border-t border-slate-100">
        <p className="text-xs text-slate-400 mb-1">SocialImob Pro © 2026</p>
        <a 
          href="mailto:atendimento@arkaconsultoria.com.br" 
          className="text-[10px] font-medium text-indigo-400 hover:text-indigo-600 transition-colors"
        >
          Suporte: atendimento@arkaconsultoria.com.br
        </a>
      </footer>
    </div>
  );
}
