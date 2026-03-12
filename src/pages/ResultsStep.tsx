import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Copy, Check, Video, FileText, MessageCircle, Calendar, 
  Target, ArrowRight, ChevronRight, BookOpen, Lightbulb, 
  Info, Download, FileDown, Sparkles, Home, Plus, LayoutDashboard,
  Zap, Shield, Star, Users, TrendingUp, Share2
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { id: "strategy", label: "Estratégia", icon: Target, description: "O plano mestre para sua venda" },
  { id: "reel", label: "Roteiro Reel", icon: Video, description: "Script viral para redes sociais" },
  { id: "planner", label: "Cronograma", icon: Calendar, description: "Seus próximos 7 dias" },
  { id: "content10", label: "10 Ideias", icon: Lightbulb, description: "Multiplicação de conteúdo" },
  { id: "messages", label: "Scripts Zap", icon: MessageCircle, description: "Fechamento no WhatsApp" },
  { id: "bonus", label: "Dicas Boss", icon: Sparkles, description: "Segredos de performance" },
  { id: "pdf", label: "Exportar", icon: FileDown, description: "Baixar material completo" },
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

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    const checkPage = (height: number) => {
      if (y + height > pageHeight - 20) {
        doc.addPage("landscape");
        y = 20;
        addHeader();
        return true;
      }
      return false;
    };

    const addHeader = () => {
      // Background for header
      doc.setFillColor(10, 10, 10); // Dark background
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Accent line
      doc.setFillColor(79, 70, 229); // brand-primary
      doc.rect(0, 34, pageWidth, 1, 'F');
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("PAINEL BOSS", margin, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text("ESTRATÉGIA DE ALTO IMPACTO IMOBILIÁRIO", margin, 29);
      
      y = 50;
    };

    const addFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text(
          `SocialImob Pro - Painel Boss AI - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    };

    const addSectionTitle = (text: string) => {
      checkPage(25);
      doc.setFillColor(20, 20, 20);
      doc.rect(margin - 5, y - 8, contentWidth + 10, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(text.toUpperCase(), margin, y);
      y += 15;
    };

    const addSubtitle = (text: string) => {
      checkPage(10);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(text, margin, y);
      y += 7;
    };

    const addBody = (text: string, isItalic = false) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", isItalic ? "italic" : "normal");
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        checkPage(6);
        doc.text(line, margin, y);
        y += 6;
      });
      y += 4;
    };

    // Start Generation
    addHeader();

    // 1. Resumo
    addSectionTitle("Resumo do Ativo");
    addSubtitle("Localização:");
    addBody(propertyData.location || "Não informada");
    addSubtitle("Tipo:");
    addBody(propertyData.type || "Não informado");
    addSubtitle("Diferenciais:");
    addBody(Array.isArray(propertyData.features) ? propertyData.features.join(", ") : "Não informados");
    y += 10;

    // 2. Estratégia
    addSectionTitle("Planejamento Estratégico");
    addSubtitle("Ângulo de Venda Principal:");
    addBody(strategy.angle);
    addSubtitle("Persona Alvo:");
    addBody(strategy.persona);
    addSubtitle("Narrativa de Venda:");
    addBody(strategy.narrative);
    y += 10;

    // 3. Reel
    addSectionTitle("Roteiro Viral (Reel/TikTok)");
    addSubtitle("Ganchos Sugeridos:");
    campaign.reelScript.hooks.forEach((h, i) => addBody(`${i + 1}. "${h}"`));
    addSubtitle("Script Completo:");
    addBody(campaign.reelScript.body);
    addSubtitle("CTA (Chamada para Ação):");
    addBody(campaign.reelScript.cta);
    addSubtitle("Direção de Arte / Cenas:");
    addBody(campaign.reelScript.scenes, true);
    y += 10;

    // 4. Planner
    addSectionTitle("Cronograma de 7 Dias");
    const plannerDays = Array.isArray(campaign.planner) ? campaign.planner : [];
    plannerDays.forEach((day, i) => {
      checkPage(30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`DIA ${day.day || i + 1}: ${day.title}`, margin, y);
      y += 7;
      addBody(day.content.replace(/[*#]/g, ''));
      y += 5;
    });

    // 5. Mensagens
    addSectionTitle("Scripts de Conversão (WhatsApp)");
    addSubtitle("Abordagem:");
    campaign.funnelMessages.abordagem.forEach((m: string) => addBody(`• ${m}`));
    addSubtitle("Follow-up:");
    campaign.funnelMessages.followup.forEach((m: string) => addBody(`• ${m}`));
    addSubtitle("Fechamento:");
    campaign.funnelMessages.encerramento.forEach((m: string) => addBody(`• ${m}`));

    addFooter();
    doc.save(`BOSS-ESTRATEGIA-${propertyData.location?.substring(0, 15) || 'CAMPANHA'}.pdf`);
  };

  const plannerDays = Array.isArray(campaign.planner) ? campaign.planner : [];

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-brand-bg overflow-hidden">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-100 p-8 overflow-y-auto shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">PAINEL BOSS</h1>
        </div>

        <nav className="space-y-2 flex-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group
                  ${isActive 
                    ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand-primary"}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                  ${isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-white"}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm tracking-tight leading-none mb-1">{section.label}</p>
                  <p className={`text-[10px] font-medium opacity-60 ${isActive ? "text-white" : "text-slate-400"}`}>
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-12 font-bold shadow-sm"
            onClick={() => navigate('/')}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Imóvel
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-primary" />
            <span className="font-black text-slate-900 tracking-tighter uppercase">PAINEL BOSS</span>
          </div>
          <Button 
            size="sm"
            className="rounded-xl bg-brand-primary h-10 px-4 font-bold shadow-lg shadow-brand-primary/20"
            onClick={generatePDF}
          >
            <Download className="w-4 h-4" />
          </Button>
        </header>

        {/* Mobile Section Tabs */}
        <div className="lg:hidden flex overflow-x-auto bg-white/80 backdrop-blur-xl border-b border-slate-100 p-2 gap-2 no-scrollbar z-10">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-xs font-black transition-all
                  ${isActive ? "bg-brand-primary text-white" : "text-slate-500 bg-slate-100"}
                `}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
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
                  
                  <div className="hidden md:flex gap-3">
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-14 px-8 font-bold shadow-sm"
                      onClick={() => navigate('/')}
                    >
                      <Plus className="w-5 h-5 mr-2" /> Novo
                    </Button>
                    <Button 
                      className="rounded-xl bg-brand-primary hover:bg-blue-600 text-white shadow-xl shadow-brand-primary/20 h-14 px-8 font-bold"
                      onClick={generatePDF}
                    >
                      <Download className="w-5 h-5 mr-2" /> PDF
                    </Button>
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
                            <Shield className="w-5 h-5 text-brand-primary" /> Dica do Boss
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
                                  <p className="text-slate-900 font-bold text-xl leading-tight pr-12">{hook}</p>
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
                              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed italic text-xl relative">
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-black">“</div>
                                "{campaign.reelScript.body}"
                              </div>
                            </div>
                            <div className="space-y-10">
                              <div>
                                <h4 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em] mb-4">CTA de Alto Impacto</h4>
                                <p className="text-brand-primary text-3xl font-black tracking-tighter leading-none">{campaign.reelScript.cta}</p>
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
                                <div className="text-slate-600 font-medium leading-relaxed text-xl prose max-w-none">
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
                            <p className="text-slate-900 font-bold text-xl leading-relaxed pr-8">{item.content}</p>
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
                                <p className="text-slate-700 font-medium text-xl leading-relaxed pr-16 italic">
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
                          <h3 className="text-slate-900 font-black text-2xl mb-2 tracking-tight uppercase">Segredos do Boss</h3>
                          <p className="text-slate-600 font-medium text-lg">Dicas exclusivas para escalar seus resultados e converter mais leads.</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                          <CardContent className="p-10 space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center">
                                <Video className="w-6 h-6 text-brand-primary" />
                              </div>
                              <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm">Alta Performance em Vídeo</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Cortes Dinâmicos</p>
                                <p className="text-slate-500 font-medium leading-relaxed">Grave cenas curtas (2-3s) e mude o ângulo constantemente para manter a retenção.</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Legendas Chamativas</p>
                                <p className="text-slate-500 font-medium leading-relaxed">Use legendas grandes no centro da tela para os ganchos iniciais.</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
                          <CardContent className="p-10 space-y-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-brand-secondary/5 flex items-center justify-center">
                                <Share2 className="w-6 h-6 text-brand-secondary" />
                              </div>
                              <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm">Distribuição Inteligente</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Horários de Pico</p>
                                <p className="text-slate-500 font-medium leading-relaxed">Poste entre 18h e 20h nos dias de semana para maior alcance orgânico.</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-slate-900 font-black text-lg">Interação Imediata</p>
                                <p className="text-slate-500 font-medium leading-relaxed">Responda todos os comentários nos primeiros 30 minutos após a postagem.</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {activeSection === "pdf" && (
                    <div className="max-w-2xl mx-auto py-20 text-center space-y-12">
                      <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-40 h-40 bg-brand-primary/5 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-brand-primary/10 relative"
                      >
                        <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full" />
                        <FileDown className="w-20 h-20 text-brand-primary relative z-10" />
                      </motion.div>
                      
                      <div className="space-y-4">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Relatório Boss</h3>
                        <p className="text-slate-500 font-medium text-xl max-w-md mx-auto">
                          Sua estratégia completa, roteiros e cronograma prontos para apresentação ou execução imediata.
                        </p>
                      </div>
                      
                      <Button 
                        size="lg" 
                        className="w-full h-24 text-2xl font-black shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-blue-700 rounded-[2.5rem] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={generatePDF}
                      >
                        <Download className="w-8 h-8 mr-4" />
                        GERAR PDF AGORA
                      </Button>

                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        Versão 2.0 • Alta Resolução
                      </p>
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
