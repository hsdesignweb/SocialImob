import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Copy, Check, Video, FileText, MessageCircle, Calendar, 
  Target, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, BookOpen, Lightbulb, 
  Info, Sparkles, Home, Plus, LayoutDashboard,
  Zap, Shield, Star, Share2
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { id: "strategy", label: "Estratégia", icon: Target, description: "O plano mestre para sua venda" },
  { id: "reel", label: "Reel", icon: Video, description: "Script viral para redes sociais" },
  { id: "planner", label: "Conteúdos", icon: Calendar, description: "Dicas de como falar sobre seu imóvel" },
  { id: "content10", label: "Multiplicador de Formato", icon: Lightbulb, description: "Transformando 1 em 10" },
  { id: "messages", label: "Abordagens", icon: MessageCircle, description: "Abordar, Acompanhar, Encerrar" },
];

export default function ResultsStep() {
  const { campaign, strategy, propertyData } = useAppStore();
  const [activeSection, setActiveSection] = useState("strategy");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);

  const handlePrevSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    const prevIndex = (currentIndex - 1 + SECTIONS.length) % SECTIONS.length;
    setActiveSection(SECTIONS[prevIndex].id);
  };

  const handleNextSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    const nextIndex = (currentIndex + 1) % SECTIONS.length;
    setActiveSection(SECTIONS[nextIndex].id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!campaign || !strategy) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 px-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Info className="w-10 h-10 text-slate-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Nenhuma campanha encontrada</h2>
          <p className="text-slate-400">Parece que você ainda não gerou sua estratégia Boss.</p>
        </div>
        <Button 
          onClick={() => navigate('/app')}
          className="rounded-2xl bg-brand-primary hover:bg-indigo-600 px-8 h-12 font-bold"
        >
          Começar Agora
        </Button>
      </div>
    );
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const plannerDays = Array.isArray(campaign.planner) ? campaign.planner : [];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col overflow-x-hidden">
      {/* Main Header */}
      <header className="bg-white border-b border-slate-100 p-4 md:p-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/20">
              <Target className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Sua Estratégia</h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 hidden md:block">Gerado por Inteligência Artificial</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => navigate('/app')}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors shadow-sm"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Dropdown Style with Arrows */}
      <nav className="bg-white border-b border-slate-100 sticky top-[73px] md:top-[89px] z-40 px-4 py-3" ref={navRef}>
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button
            onClick={handlePrevSection}
            className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-all shrink-0"
            title="Seção Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 relative">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                  {(() => {
                    const Icon = SECTIONS.find(s => s.id === activeSection)?.icon || Target;
                    return <Icon className="w-4 h-4" />;
                  })()}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none mb-1">Seção Atual</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">
                    {SECTIONS.find(s => s.id === activeSection)?.label}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isNavOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isNavOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden z-50 p-2"
                >
                  <div className="grid grid-cols-1 gap-1">
                    {SECTIONS.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            setIsNavOpen(false);
                          }}
                          className={`
                            flex items-center gap-4 p-4 rounded-2xl transition-all text-left group
                            ${isActive 
                              ? "bg-brand-primary text-white" 
                              : "hover:bg-slate-50 text-slate-600"}
                          `}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-primary'}`} />
                          </div>
                          <div>
                            <p className={`text-xs font-black tracking-widest ${isActive ? 'text-white' : 'text-slate-900'}`}>
                              {section.label}
                            </p>
                            <p className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                              {section.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleNextSection}
            className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-all shrink-0"
            title="Próxima Seção"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Content Scrollable Area */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Section Header */}
                <div className="mb-4">
                  <p className="text-xs font-black text-slate-400 tracking-widest mb-1">
                    {SECTIONS.find(s => s.id === activeSection)?.description}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                    {SECTIONS.find(s => s.id === activeSection)?.label}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="space-y-6">
                  {activeSection === "strategy" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 md:p-10 space-y-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <Target className="w-8 h-8 text-brand-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                              Estratégia de Venda
                            </h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mt-1">O plano mestre para sua venda</p>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                          <p className="text-slate-700 font-medium text-lg md:text-xl leading-relaxed">
                            Você enviou um <span className="font-bold text-brand-primary">{propertyData.type}</span> localizado em <span className="font-bold text-brand-primary">{propertyData.location}</span> e no valor de <span className="font-bold text-brand-primary">{propertyData.price}</span>.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-brand-secondary" />
                            <h4 className="text-xs font-black text-brand-secondary tracking-widest">Ângulo de Venda Principal</h4>
                          </div>
                          <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                            {strategy.angle}
                          </p>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-brand-primary" />
                            <h4 className="text-xs font-black text-slate-400 tracking-widest">Narrativa de Venda</h4>
                          </div>
                          <p className="text-slate-700 font-medium leading-relaxed italic text-lg md:text-xl">
                            "{strategy.narrative}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}



                  {activeSection === "reel" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 md:p-10 space-y-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Video className="w-8 h-8 text-brand-primary" />
                            </div>
                            <div>
                              <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                                Roteiro Viral
                              </h2>
                              <p className="text-slate-500 font-medium text-sm md:text-base mt-1">Script viral para redes sociais</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-brand-primary hover:bg-blue-50 font-bold rounded-full px-4 h-10 flex items-center gap-2"
                            onClick={() => copyToClipboard(campaign.reelScript?.body || "", 'reel')}
                          >
                            {copiedId === 'reel' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Copiar
                          </Button>
                        </div>

                        <div className="space-y-8">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-brand-secondary" />
                            <h4 className="text-xs font-black text-brand-secondary tracking-widest">Ganchos de Atenção (Primeiros 3s)</h4>
                          </div>
                          <div className="space-y-4">
                            {(campaign.reelScript?.hooks || []).length > 0 ? (
                              (campaign.reelScript?.hooks || []).map((hook, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-4 md:gap-6 group relative">
                                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm md:text-lg font-black shrink-0 shadow-lg shadow-brand-primary/20">
                                    {hIdx + 1}
                                  </div>
                                  <div className="pt-1 flex-1">
                                    <p className="text-slate-700 font-bold text-base md:text-xl leading-snug pr-10">{hook}</p>
                                  </div>
                                  <Button 
                                    size="sm" variant="ghost" className="absolute top-0 right-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                    onClick={() => copyToClipboard(hook, `hook-${hIdx}`)}
                                  >
                                    {copiedId === `hook-${hIdx}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 italic">Nenhum gancho gerado.</p>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-brand-secondary" />
                              <h4 className="text-xs font-black text-brand-secondary tracking-widest">O Script</h4>
                            </div>
                            <div className="bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 text-slate-700 font-medium leading-relaxed italic text-lg md:text-xl relative whitespace-pre-wrap min-h-[150px]">
                              "{campaign.reelScript?.body || "Script não gerado."}"
                            </div>
                          </div>
                          <div className="space-y-8">
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <Zap className="w-4 h-4 text-brand-secondary" />
                                <h4 className="text-xs font-black text-brand-secondary tracking-widest">CTA de Alto Impacto</h4>
                              </div>
                              <p className="text-brand-primary text-xl md:text-2xl font-black tracking-tighter leading-tight">{campaign.reelScript?.cta || "CTA não gerada."}</p>
                            </div>
                            <div className="bg-brand-primary/5 p-6 md:p-8 rounded-[2rem] border border-brand-primary/10">
                              <h4 className="text-slate-900 font-black text-xs mb-3 flex items-center gap-2 tracking-widest">
                                <Video className="w-4 h-4 text-brand-primary" /> Direção de Cenas
                              </h4>
                              <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">{campaign.reelScript?.scenes || "Direção não gerada."}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "planner" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 md:p-10 space-y-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <Calendar className="w-8 h-8 text-brand-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                              Planner de Conteúdo
                            </h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mt-1">Sua semana de autoridade no mercado imobiliário</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                          <p className="text-slate-700 font-medium text-lg">
                            Foque em entregar a dica de como falar sobre o tema, ao invés de apenas entregar o conteúdo pronto. Isso gera autoridade e conexão.
                          </p>
                        </div>

                        <div className="space-y-8">
                          {plannerDays.map((day, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm group"
                            >
                              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center group-hover:bg-white transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-black tracking-widest">
                                    DIA {day.day || idx + 1}
                                  </div>
                                  <span className="text-xl font-black text-slate-900 tracking-tighter">{day.title || `Dia ${idx + 1}`}</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-10 w-10 p-0 text-slate-400 hover:text-brand-primary rounded-full"
                                  onClick={() => copyToClipboard(day.content || "", `day-${idx}`)}
                                >
                                  {copiedId === `day-${idx}` ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                </Button>
                              </div>
                              <div className="p-8 space-y-4">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-brand-secondary" />
                                  <span className="text-xs font-black text-brand-secondary tracking-widest">Dica de abordagem: {day.topic || "Foco Estratégico"}</span>
                                </div>
                                <div className="text-slate-700 font-medium leading-relaxed text-lg prose max-w-none">
                                  <ReactMarkdown>{day.content || "Conteúdo não gerado."}</ReactMarkdown>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "content10" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 md:p-10 space-y-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-8 h-8 text-brand-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                              Multiplicador 10x
                            </h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mt-1">1 Ideia transformada em 10 conteúdos</p>
                          </div>
                        </div>

                        <div className="bg-brand-primary/5 p-8 rounded-[2rem] border border-brand-primary/10">
                          <p className="text-slate-700 font-medium text-lg">
                            Vamos transformar seu anúncio em 10 formatos de conteúdo para dominar o algoritmo.
                          </p>
                        </div>
                        
                        <div className="grid gap-6">
                          {(campaign.derivedContent10 || []).map((item, iIdx) => (
                            <motion.div
                              key={iIdx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: iIdx * 0.05 }}
                              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group relative hover:bg-slate-50 transition-all"
                            >
                              <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-brand-secondary" />
                                  <span className="text-xs font-black text-brand-secondary tracking-widest">
                                    {item.type}
                                  </span>
                                </div>
                                <Button 
                                  size="sm" variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-brand-primary rounded-full"
                                  onClick={() => copyToClipboard(item.content, `content10-${iIdx}`)}
                                >
                                  {copiedId === `content10-${iIdx}` ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                </Button>
                              </div>
                              <p className="text-slate-700 font-medium text-lg leading-relaxed pr-8 whitespace-pre-wrap">{item.content}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "messages" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 md:p-10 space-y-12">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-8 h-8 text-brand-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                              Abordagens de Funil
                            </h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mt-1">Scripts persuasivos para cada etapa da venda</p>
                          </div>
                        </div>

                        {[
                          { id: 'abordagem', label: 'Abordar', color: 'brand-primary', desc: 'Primeiro contato e despertar de interesse' },
                          { id: 'followup', label: 'Acompanhar', color: 'brand-secondary', desc: 'Quebra de objeções e manutenção do desejo' },
                          { id: 'encerramento', label: 'Encerrar', color: 'emerald-600', desc: 'Fechamento e agendamento de visita' }
                        ].map((stage) => (
                          <div key={stage.id} className="space-y-8">
                            <div className="flex items-center gap-5 px-4">
                              <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm`}>
                                <MessageCircle className={`w-6 h-6 text-brand-primary`} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stage.label}</h3>
                                <p className="text-slate-500 text-sm font-medium">{stage.desc}</p>
                              </div>
                            </div>
                            <div className="grid gap-6">
                              {(campaign.funnelMessages[stage.id as keyof typeof campaign.funnelMessages] || []).map((msg: string, mIdx: number) => (
                                <div key={mIdx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:bg-slate-50 transition-all">
                                  <Button 
                                    size="sm" variant="ghost" className="absolute top-6 right-6 h-10 w-10 p-0 text-slate-400 hover:text-brand-primary rounded-full"
                                    onClick={() => copyToClipboard(msg, `msg-${stage.id}-${mIdx}`)}
                                  >
                                    {copiedId === `msg-${stage.id}-${mIdx}` ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                  </Button>
                                  <p className="text-slate-700 font-medium text-lg leading-relaxed pr-16 italic whitespace-pre-wrap">
                                    "{msg}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons at the bottom */}
                  <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <Button
                      variant="ghost"
                      onClick={handlePrevSection}
                      className="w-full md:w-auto rounded-2xl h-14 px-8 font-bold text-slate-500 hover:text-brand-primary"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" /> Seção Anterior
                    </Button>
                    
                    <Button
                      onClick={handleNextSection}
                      className="w-full md:w-auto rounded-2xl h-14 px-8 font-bold bg-brand-primary hover:bg-blue-700 shadow-lg shadow-brand-primary/20"
                    >
                      {activeSection === SECTIONS[SECTIONS.length - 1].id ? "Voltar ao Início" : "Próxima Seção"}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {activeSection === "bonus" && (
                    <div className="max-w-4xl mx-auto space-y-12">
                      {/* Bonus section removed as per user request for structured results */}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
