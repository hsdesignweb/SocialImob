import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Loader2, LogOut, Coins, MessageCircle, Target, Sparkles, Home as HomeIcon, Rocket, History, Calendar, Settings, Clock } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoading } = useAppStore();
  const { user, logout } = useAuth();
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [completedPosts, setCompletedPosts] = useState(0);

  const isPlanner = location.pathname === '/app/planner';

  // Fetch planner stats if on planner page
  useEffect(() => {
    if (isPlanner) {
      const fetchStats = async () => {
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('completed', 1);
        setCompletedPosts(count || 0);
      };
      fetchStats();

      const channel = supabase
        .channel('planner_stats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchStats();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isPlanner]);

  const loadingPhrases = [
    "Vender imóveis não é obra do acaso, é aplicar a verdadeira engenharia de vendas em cada atendimento.",
    "O sucesso na corretagem exige o olho do dono: atenção máxima desde a captação até a assinatura do contrato.",
    "Eleve a jornada de compra do seu cliente para o próximo nível e ele nunca mais esquecerá do seu nome.",
    "O mercado nunca esfria para quem tem a estratégia certa para atrair e aquecer os leads todos os dias.",
    "Não existe atalho para o sucesso, mas existe método para fechar mais negócios de forma previsível.",
    "Construa uma engenharia de receita sólida e veja a sua imobiliária prosperar em qualquer cenário econômico.",
    "Um corretor de alta performance domina a sua região atuando sempre com o olho do dono.",
    "Ajudar famílias a encontrar seu lar ideal é elevar a própria profissão para o próximo nível.",
    "Sorte é o que acontece quando a preparação encontra a oportunidade de uma visita agendada.",
    "O fechamento do mês é apenas o reflexo da engenharia de receita que você aplica na segunda-feira de manhã.",
    "Seja um exterminador de objeções: conheça o imóvel, o mercado e o seu cliente melhor do que ninguém.",
    "Antecipe as dúvidas e seja o exterminador das inseguranças na hora da decisão de compra.",
    "O atalho mais rápido para a venda é a confiança construída nos cinco primeiros minutos de conversa.",
    "Conhecimento de mercado é o único atalho seguro para bater todas as metas do trimestre.",
    "Elimine as barreiras do fechamento agindo como um verdadeiro exterminador de problemas.",
    "Transforme a complexidade de um financiamento em uma engenharia de vendas simples e clara para o comprador.",
    "A melhor engenharia de vendas não começa falando do imóvel, mas praticando a escuta ativa.",
    "O \"não\" de hoje é apenas o cliente pedindo mais informações para o \"sim\" de amanhã.",
    "Não espere o cliente perfeito cruzar a porta; crie a oportunidade perfeita com a carteira que você tem.",
    "Cada lead aquecido no WhatsApp é um passo mais perto da entrega das chaves.",
    "O cuidado com cada etapa do funil deve ter a precisão e o olho do dono.",
    "Não foque apenas em fechar uma venda, foque em abrir um relacionamento de longo prazo.",
    "A corretagem de excelência é baseada na transparência: entregue valor antes de pedir o fechamento.",
    "Sua maior comissão não cai na conta hoje, ela vem na próxima indicação de um cliente satisfeito.",
    "Imóveis são tijolos e concreto; lares são sonhos e memórias. Nós vendemos os dois.",
    "Quem domina a arte de aquecer leads nunca fica com a agenda de visitas vazia.",
    "O foco contínuo na jornada do cliente é o que constrói uma engenharia de receita previsível e escalável.",
    "Marketing imobiliário eficiente é aquele que não apenas atrai curiosos, mas educa e converte compradores.",
    "Cada visita a um imóvel é a chance de apresentar um novo roteiro de vida para o cliente.",
    "Leve a gestão da sua carteira de imóveis para o próximo nível com um atendimento absolutamente impecável."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 4000);
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
          
          <div className="space-y-6 max-w-lg">
            <motion.p 
              key={loadingPhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white font-black text-xl md:text-2xl leading-tight tracking-tight"
            >
              "{loadingPhrases[loadingPhraseIndex]}"
            </motion.p>
            
            <div className="flex flex-col items-center gap-3">
              <div className="h-1 w-24 bg-brand-secondary/30 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full bg-brand-secondary"
                />
              </div>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.3em]">Lapidando sua estratégia de alta performance</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app')}>
            <div className={`w-12 h-12 ${isPlanner ? 'bg-brand-primary' : 'bg-brand-primary'} rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-primary/20`}>
              {isPlanner ? <Calendar className="w-6 h-6" /> : 'S'}
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter leading-none text-slate-900">
                {isPlanner ? 'Planner ' : 'SocialImob'}
                {isPlanner && <span className="text-brand-primary">Imobiliário</span>}
              </span>
              <span className="text-[10px] font-black text-brand-secondary tracking-[0.2em]">{user?.name || "Corretor"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isPlanner ? (
              <div className="flex items-center gap-2 md:gap-6">
                {user?.isAdmin && (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-planner-panel'))}
                    className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors"
                  >
                    <Settings className="w-4 h-4 text-brand-primary" />
                    Painel
                  </button>
                )}
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('go-to-today'))}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-50 text-brand-primary rounded-full text-xs md:text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Hoje
                </button>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso Anual</span>
                  <span className="text-sm font-black text-slate-900">{completedPosts} / 725 Posts</span>
                </div>
              </div>
            ) : !user?.isAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
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
                  <button 
                    onClick={() => { navigate('/app'); setIsMenuOpen(false); }}
                    className="w-full text-left px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <Rocket className="w-4 h-4 text-brand-primary" />
                    Gerador de Campanhas
                  </button>
                  <button 
                    onClick={() => { navigate('/app/history'); setIsMenuOpen(false); }}
                    className="w-full text-left px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    Campanhas Geradas
                  </button>
                  <button 
                    onClick={() => { navigate('/app/planner'); setIsMenuOpen(false); }}
                    className="w-full text-left px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    Planner Imobiliário
                  </button>
                  {user?.isAdmin && (
                    <button 
                      onClick={() => { navigate('/app/admin'); setIsMenuOpen(false); }}
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
        <div className={isPlanner ? "w-full" : "max-w-4xl mx-auto"}>
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
        <p className="text-xs text-slate-400 font-bold tracking-widest mb-3">SocialImob - Hebert Silva © 2026</p>
        <a 
          href="mailto:atendimento@arkaconsultoria.com.br" 
          className="text-[10px] font-bold text-brand-secondary hover:text-brand-primary transition-colors tracking-wider"
        >
          Suporte: atendimento@arkaconsultoria.com.br
        </a>
      </footer>
    </div>
  );
}
