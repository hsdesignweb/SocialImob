import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Copy, Check, Video, FileText, MessageCircle, Calendar, 
  Target, ArrowRight, ChevronRight, BookOpen, Lightbulb, 
  Info, Sparkles, Home, Plus, LayoutDashboard,
  Zap, Shield, Star, Users, TrendingUp, Share2
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { id: "strategy", label: "Estratégia", icon: Target, description: "O plano mestre para sua venda" },
  { id: "reel", label: "Roteiro Reel", icon: Video, description: "Script viral para redes sociais" },
  { id: "planner", label: "Cronograma", icon: Calendar, description: "Seus próximos 7 dias" },
  { id: "content10", label: "10 Ideias", icon: Lightbulb, description: "Multiplicação de conteúdo" },
  { id: "messages", label: "Scripts Zap", icon: MessageCircle, description: "Fechamento no WhatsApp" },
  { id: "bonus", label: "Dicas Pro", icon: Sparkles, description: "Segredos de performance" },
];

export default function ResultsStep() {
  const { campaign, strategy, propertyData } = useAppStore();
  const [activeSection, setActiveSection] = useState("strategy");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

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
          onClick={() => navigate('/')}
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
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
              <Target className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sua Estratégia</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden md:block">Gerado por Inteligência Artificial</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-10 md:h-12 px-4 md:px-6 font-bold shadow-sm text-sm"
              onClick={() => navigate('/')}
            >
              <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Novo Imóvel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Editorial Style */}
      <nav className="bg-white border-b border-slate-100 sticky top-[73px] md:top-[89px] z-20 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-8 py-0 h-16">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 h-full px-1 border-b-2 transition-all shrink-0 text-sm font-black uppercase tracking-widest
                  ${isActive 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-slate-400 hover:text-slate-600"}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-slate-300"}`} />
                {section.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Content Scrollable Area */}
        <div className="p-4 md:p-8 lg:p-12">
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20">
                        {(() => {
                          const Icon = SECTIONS.find(s => s.id === activeSection)?.icon || Target;
                          return <Icon className="w-6 h-6 text-brand-primary" />;
                        })()}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        {SECTIONS.find(s => s.id === activeSection)?.label}
                      </h2>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">
                      {SECTIONS.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                </div>

                {/* Section Content */}
                <div className="space-y-8">
                  {activeSection === "strategy" && (
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                          <CardContent className="p-10 space-y-12">
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-brand-secondary" />
                                <h4 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em]">Ângulo de Venda Principal</h4>
                              </div>
                              <p className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                                {strategy.angle}
                              </p>
                            </div>

                            <div className="h-px bg-slate-100" />

                            <div className="grid md:grid-cols-2 gap-12">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <Users className="w-4 h-4 text-brand-primary" />
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Persona Alvo</h4>
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed">{strategy.persona}</p>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <TrendingUp className="w-4 h-4 text-brand-primary" />
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Abordagem Sugerida</h4>
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed">{strategy.approach}</p>
                              </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-brand-primary" />
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Narrativa de Venda</h4>
                              </div>
                              <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
                                "{strategy.narrative}"
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-brand-primary/5 rounded-2xl p-8 border border-brand-primary/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sparkles className="w-24 h-24 text-brand-primary" />
                          </div>
                          <h3 className="text-slate-900 font-black text-xl mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-brand-primary" /> Dica Estratégica
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium relative z-10">
                            Focamos no perfil <strong>{propertyData.buyerProfile}</strong> para maximizar seu ROI. 
                            Use a narrativa sugerida em todos os seus pontos de contato para criar uma marca forte.
                          </p>
                        </div>

                        <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                          <CardContent className="p-8 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Dados do Ativo</h4>
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                  <Home className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</p>
                                  <p className="text-slate-900 font-bold">{propertyData.type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                  <Target className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                                  <p className="text-slate-900 font-bold">{propertyData.location}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeSection === "reel" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                        <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                              <Video className="w-6 h-6 text-brand-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Roteiro Viral</CardTitle>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-brand-primary hover:bg-blue-50 font-bold rounded-xl"
                            onClick={() => copyToClipboard(campaign.reelScript.body, 'reel')}
                          >
                            {copiedId === 'reel' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copiar
                          </Button>
                        </CardHeader>
                        <CardContent className="p-10 space-y-12">
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em]">Ganchos de Atenção (Primeiros 3s)</h4>
                            <div className="grid gap-4">
                              {campaign.reelScript.hooks.map((hook, hIdx) => (
                                <div key={hIdx} className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 group relative hover:bg-white transition-all">
                                  <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-brand-primary/20">
                                    {hIdx + 1}
                                  </div>
                                  <p className="text-slate-900 font-bold text-xl leading-tight pr-12 break-words">{hook}</p>
                                  <Button 
                                    size="sm" variant="ghost" className="absolute top-1/2 -translate-y-1/2 right-6 h-12 w-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                    onClick={() => copyToClipboard(hook, `hook-${hIdx}`)}
                                  >
                                    {copiedId === `hook-${hIdx}` ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="h-px bg-slate-100" />

                          <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <h4 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em]">O Script</h4>
                              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed italic text-xl relative break-words">
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-black">“</div>
                                "{campaign.reelScript.body}"
                              </div>
                            </div>
                            <div className="space-y-10">
                              <div>
                                <h4 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em] mb-4">CTA de Alto Impacto</h4>
                                <p className="text-brand-primary text-3xl font-black tracking-tighter leading-none break-words">{campaign.reelScript.cta}</p>
                              </div>
                              <div className="bg-brand-primary/5 p-8 rounded-2xl border border-brand-primary/10">
                                <h4 className="text-slate-900 font-black text-sm mb-4 flex items-center gap-2">
                                  <Video className="w-4 h-4 text-brand-primary" /> Direção de Cenas
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">{campaign.reelScript.scenes}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeSection === "planner" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="space-y-6">
                        {plannerDays.map((day, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 group">
                              <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center group-hover:bg-white transition-colors">
                                <div className="flex items-center gap-6">
                                  <div className="w-20 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                                    DIA {day.day || idx + 1}
                                  </div>
                                  <span className="font-black text-slate-900 text-2xl tracking-tighter">{day.title || `Dia ${idx + 1}`}</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-12 w-12 p-0 text-slate-400 hover:text-brand-primary rounded-xl"
                                  onClick={() => copyToClipboard(day.content || "", `day-${idx}`)}
                                >
                                  {copiedId === `day-${idx}` ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                                </Button>
                              </div>
                              <CardContent className="p-10 space-y-6">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-brand-secondary" />
                                  <span className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em]">{day.topic || "Foco Estratégico"}</span>
                                </div>
                                <div className="text-slate-600 font-medium leading-relaxed text-xl prose max-w-none break-words overflow-hidden">
                                  <ReactMarkdown>{day.content || "Conteúdo não gerado."}</ReactMarkdown>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSection === "content10" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <div className="bg-brand-primary/5 p-10 rounded-2xl border border-brand-primary/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-5">
                          <Lightbulb className="w-64 h-64 text-brand-primary" />
                        </div>
                        <div className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-brand-primary/40">
                          <Lightbulb className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-slate-900 font-black text-2xl mb-2 tracking-tight">Metodologia 1 → 10</h3>
                          <p className="text-slate-600 font-medium text-lg">Multiplicamos sua ideia central em 10 formatos diferentes para dominar o algoritmo.</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-6">
                        {(campaign.derivedContent10 || []).map((item, iIdx) => (
                          <motion.div
                            key={iIdx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: iIdx * 0.05 }}
                            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 group relative hover:bg-slate-50 transition-all"
                          >
                            <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-secondary" />
                                <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">
                                  {item.type}
                                </span>
                              </div>
                              <Button 
                                size="sm" variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-brand-primary rounded-xl"
                                onClick={() => copyToClipboard(item.content, `content10-${iIdx}`)}
                              >
                                {copiedId === `content10-${iIdx}` ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                              </Button>
                            </div>
                            <p className="text-slate-900 font-bold text-xl leading-relaxed pr-8 break-words">{item.content}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSection === "messages" && (
                    <div className="max-w-4xl mx-auto space-y-16">
                      {[
                        { id: 'abordagem', label: 'Fase 1: Atração', color: 'brand-primary', desc: 'Primeiro contato e despertar de interesse' },
                        { id: 'followup', label: 'Fase 2: Nutrição', color: 'brand-secondary', desc: 'Quebra de objeções e manutenção do desejo' },
                        { id: 'encerramento', label: 'Fase 3: Conversão', color: 'emerald-600', desc: 'Fechamento e agendamento de visita' }
                      ].map((stage) => (
                        <div key={stage.id} className="space-y-8">
                          <div className="flex items-center gap-6 px-4">
                            <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100`}>
                              <MessageCircle className={`w-7 h-7 text-brand-primary`} />
                            </div>
                            <div>
                              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{stage.label}</h3>
                              <p className="text-slate-500 font-medium">{stage.desc}</p>
                            </div>
                          </div>
                          <div className="grid gap-6">
                            {(campaign.funnelMessages[stage.id as keyof typeof campaign.funnelMessages] || []).map((msg: string, mIdx: number) => (
                              <div key={mIdx} className="bg-white p-10 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative group hover:bg-slate-50 transition-all">
                                <Button 
                                  size="sm" variant="ghost" className="absolute top-8 right-8 h-12 w-12 p-0 text-slate-400 hover:text-brand-primary rounded-xl"
                                  onClick={() => copyToClipboard(msg, `msg-${stage.id}-${mIdx}`)}
                                >
                                  {copiedId === `msg-${stage.id}-${mIdx}` ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                                </Button>
                                <p className="text-slate-700 font-medium text-xl leading-relaxed pr-16 italic break-words">
                                  "{msg}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection === "bonus" && (
                    <div className="max-w-4xl mx-auto space-y-12">
                      <div className="bg-brand-secondary/5 p-10 rounded-2xl border border-brand-secondary/10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 bg-brand-secondary rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-brand-secondary/40">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-slate-900 font-black text-2xl mb-2 tracking-tight uppercase">Segredos Estratégicos</h3>
                          <p className="text-slate-600 font-medium text-lg">Domine o algoritmo e transforme seguidores em compradores reais.</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                          <CardContent className="p-10 space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-brand-primary" />
                              </div>
                              <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm">O Desafio do Instagram</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Venda sem Vender</p>
                                <p className="text-slate-500 font-medium leading-relaxed">O maior erro é transformar seu perfil em um classificado. O Instagram é uma rede de atenção. Primeiro você atrai pelo estilo de vida, depois apresenta a solução (o imóvel).</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">O Algoritmo Imobiliário</p>
                                <p className="text-slate-500 font-medium leading-relaxed">O algoritmo prioriza RETENÇÃO. Vídeos curtos com ganchos fortes nos primeiros 3 segundos são a chave para o Reels entregar seu imóvel para quem ainda não te segue.</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                          <CardContent className="p-10 space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-brand-secondary/5 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-brand-secondary" />
                              </div>
                              <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm">Acelere seus Resultados</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Consistência Estratégica</p>
                                <p className="text-slate-500 font-medium leading-relaxed">Não adianta postar muito sem estratégia. Use o Planner gerado aqui para manter uma narrativa que conduz o lead do desejo até o agendamento da visita.</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Pitch de Especialista</p>
                                <p className="text-slate-500 font-medium leading-relaxed italic">"Marketing imobiliário de alto nível não é sorte, é método. Se você quer escalar suas vendas com estratégias personalizadas como esta, vamos conversar sobre como posso levar seu posicionamento para o próximo nível."</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
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
