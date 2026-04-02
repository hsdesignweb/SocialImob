import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Loader2, LogOut, Coins, MessageCircle, Target, Sparkles, Home as HomeIcon, Rocket, History, Calendar, Settings, Clock, X, GraduationCap, Camera, Megaphone, Image as ImageIcon, FileText, Users, PanelLeftClose, PanelLeftOpen, AlignLeft } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isLoading } = useAppStore();
  const { user, logout } = useAuth();
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const isPlanner = location.pathname === '/app/planner';

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

  const NavLinks = ({ onClick }: { onClick?: () => void }) => {
    const { setPropertyData, setCampaign, setStrategy } = useAppStore();

    const handleNewCampaign = () => {
      setPropertyData({ description: '' });
      setCampaign(null as any);
      setStrategy(null as any);
      navigate('/app/input');
      onClick?.();
    };

    return (
      <>
        <button 
          onClick={() => { navigate('/app/lessons'); onClick?.(); }}
          className={`w-full text-left py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          title={isSidebarCollapsed ? "Sim Academy" : undefined}
        >
          <GraduationCap className="w-5 h-5 text-brand-secondary shrink-0" />
          {!isSidebarCollapsed && <span>Sim Academy</span>}
        </button>
        <button 
          onClick={() => { navigate('/app/planner'); onClick?.(); }}
          className={`w-full text-left py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          title={isSidebarCollapsed ? "Planner Imobiliário" : undefined}
        >
          <Calendar className="w-5 h-5 text-brand-primary shrink-0" />
          {!isSidebarCollapsed && <span>Planner Imobiliário</span>}
        </button>
        <button 
          onClick={handleNewCampaign}
          className={`w-full text-left py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          title={isSidebarCollapsed ? "Estrategista de Conteúdo" : undefined}
        >
          <Rocket className="w-5 h-5 text-brand-primary shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span>Estrategista de Conteúdo</span>
              <span className="text-[10px] font-black text-brand-secondary uppercase tracking-wider ml-auto">Beta</span>
            </>
          )}
        </button>
        <button 
          onClick={() => { navigate('/app/description-generator'); onClick?.(); }}
          className={`w-full text-left py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          title={isSidebarCollapsed ? "Gerador de Descrições" : undefined}
        >
          <AlignLeft className="w-5 h-5 text-brand-primary shrink-0" />
          {!isSidebarCollapsed && <span>Gerador de Descrições</span>}
        </button>
        <button 
          onClick={() => { navigate('/app/ad-examples'); onClick?.(); }}
          className={`w-full text-left py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          title={isSidebarCollapsed ? "Exemplos de anúncios" : undefined}
        >
          <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
          {!isSidebarCollapsed && <span>Exemplos de anúncios</span>}
        </button>
        <button 
          className={`w-full text-left py-3 text-sm text-slate-400 rounded-xl flex items-center font-bold cursor-not-allowed ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          disabled
          title={isSidebarCollapsed ? "CRM" : undefined}
        >
          <Users className="w-5 h-5 opacity-50 shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span>CRM</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-auto">Em breve</span>
            </>
          )}
        </button>
        <button 
          className={`w-full text-left py-3 text-sm text-slate-400 rounded-xl flex items-center font-bold cursor-not-allowed ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          disabled
          title={isSidebarCollapsed ? "Social Ads" : undefined}
        >
          <Megaphone className="w-5 h-5 opacity-50 shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span>Social Ads</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-auto">Em breve</span>
            </>
          )}
        </button>
        <button 
          className={`w-full text-left py-3 text-sm text-slate-400 rounded-xl flex items-center font-bold cursor-not-allowed ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          disabled
          title={isSidebarCollapsed ? "Fotos Profissionais" : undefined}
        >
          <Camera className="w-5 h-5 opacity-50 shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span>Fotos Profissionais</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-auto">Em breve</span>
            </>
          )}
        </button>
        <button 
          className={`w-full text-left py-3 text-sm text-slate-400 rounded-xl flex items-center font-bold cursor-not-allowed ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
          disabled
          title={isSidebarCollapsed ? "Gerador de carrosséis" : undefined}
        >
          <ImageIcon className="w-5 h-5 opacity-50 shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span>Gerador de carrosséis</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-auto">Em breve</span>
            </>
          )}
        </button>
        {user?.isAdmin && (
          <button 
            onClick={() => { navigate('/app/admin'); onClick?.(); }}
            className={`w-full text-left py-3 text-sm text-brand-primary font-bold hover:bg-slate-50 rounded-xl flex items-center transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
            title={isSidebarCollapsed ? "Painel Administrativo" : undefined}
          >
            <Target className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Painel Administrativo</span>}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-slate-900 flex relative">
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

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-50 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          {!isSidebarCollapsed && (
            <img 
              src="https://hebertsilva.com/wp-content/uploads/2026/03/logo-social-imob.png" 
              alt="SocialImob Logo" 
              className="h-8 object-contain cursor-pointer"
              onClick={() => navigate('/app')}
              referrerPolicy="no-referrer"
            />
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>
        
        <div className={`flex-1 overflow-y-auto py-6 space-y-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <NavLinks />
        </div>

        <div className={`p-4 border-t border-slate-100 space-y-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {user?.status === 'trial' && (
            <button 
              onClick={() => navigate('/payment')}
              className={`w-full text-left py-3 text-sm text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl flex items-center transition-colors font-bold mb-2 shadow-lg shadow-brand-primary/20 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
              title={isSidebarCollapsed ? "Assinar Agora" : undefined}
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Assinar Agora</span>}
            </button>
          )}
          {!isSidebarCollapsed ? (
            <div className="px-4 py-3 mb-2 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          ) : (
            <div className="py-3 mb-2 flex justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase" title={user?.name}>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            </div>
          )}
          <button 
            onClick={() => navigate('/app/store')}
            className={`w-full text-left py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
            title={isSidebarCollapsed ? "Meus Créditos" : undefined}
          >
            <Coins className="w-5 h-5 text-emerald-500 shrink-0" />
            {!isSidebarCollapsed && <span>Meus Créditos</span>}
          </button>
          <button 
            onClick={handleLogout}
            className={`w-full text-left py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl flex items-center transition-colors font-bold ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
            title={isSidebarCollapsed ? "Sair do Sistema" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between md:justify-end">
            
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app')}>
              <img 
                src="https://hebertsilva.com/wp-content/uploads/2026/03/logo-social-imob.png" 
                alt="SocialImob Logo" 
                className="h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-4">
              {isPlanner ? (
                <div className="flex items-center gap-2 md:gap-6">
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('go-to-today'))}
                    className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-50 text-brand-primary rounded-full text-xs md:text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Hoje
                  </button>
                </div>
              ) : !user?.isAdmin && (
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                  <Coins className="w-4 h-4 text-brand-secondary" />
                  <span className="text-xs font-bold text-slate-700">{user?.credits} <span className="hidden sm:inline">créditos</span></span>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <div className="md:hidden relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  {isMenuOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    {user?.status === 'trial' && (
                      <button 
                        onClick={() => { navigate('/payment'); setIsMenuOpen(false); }}
                        className="w-full text-left px-5 py-4 text-sm text-white bg-brand-primary hover:bg-brand-primary/90 flex items-center gap-3 border-b border-slate-100 transition-colors font-bold"
                      >
                        <Sparkles className="w-4 h-4" />
                        Assinar Agora
                      </button>
                    )}
                    <NavLinks onClick={() => setIsMenuOpen(false)} />
                    <button 
                      onClick={() => { navigate('/app/store'); setIsMenuOpen(false); }}
                      className="w-full text-left px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 border-t border-slate-100 transition-colors font-bold"
                    >
                      <Coins className="w-4 h-4 text-emerald-500" />
                      Meus Créditos
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-4 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 border-t border-slate-100 transition-colors font-bold"
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
        <main className="flex-1 w-full p-4 md:p-10 pb-24">
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
        <footer className="w-full p-10 text-center border-t border-slate-100 mt-auto">
          <p className="text-xs text-slate-400 font-bold tracking-widest mb-3">SocialImob - Hebert Silva © 2026</p>
          <a 
            href="mailto:atendimento@arkaconsultoria.com.br" 
            className="text-[10px] font-bold text-brand-secondary hover:text-brand-primary transition-colors tracking-wider"
          >
            Suporte: atendimento@arkaconsultoria.com.br
          </a>
        </footer>
      </div>
    </div>
  );
}
