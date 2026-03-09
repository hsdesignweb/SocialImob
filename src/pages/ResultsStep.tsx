import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Copy, Check, Video, FileText, MessageCircle, Calendar, Target, ArrowRight, ChevronRight, BookOpen, Lightbulb, Info, Download, FileDown, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";

const SECTIONS = [
  { id: "strategy", label: "Estratégia", icon: Target },
  { id: "reel", label: "Reel", icon: Video },
  { id: "planner", label: "Cronograma", icon: Calendar },
  { id: "content10", label: "10 Ideias", icon: Lightbulb },
  { id: "traffic", label: "Tráfego", icon: Target },
  { id: "messages", label: "Mensagens", icon: MessageCircle },
  { id: "bonus", label: "Bônus", icon: Sparkles },
  { id: "pdf", label: "PDF Beta", icon: FileDown },
];

export default function ResultsStep() {
  const { campaign, strategy, propertyData } = useAppStore();
  const [activeSection, setActiveSection] = useState("strategy");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!campaign || !strategy) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-slate-500">Nenhuma campanha gerada.</p>
        <Button onClick={() => window.history.back()}>Voltar</Button>
      </div>
    );
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    const checkPage = (height: number) => {
      if (y + height > 280) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    const addTitle = (text: string, size = 16) => {
      checkPage(15);
      doc.setFontSize(size);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(text, margin, y);
      y += 10;
    };

    const addSubtitle = (text: string, size = 12) => {
      checkPage(10);
      doc.setFontSize(size);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(text, margin, y);
      y += 7;
    };

    const addBody = (text: string, size = 10) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105); // slate-600
      const lines = doc.splitTextToSize(text, 160); // Reduced width to ensure no overflow
      lines.forEach((line: string) => {
        checkPage(5);
        doc.text(line, margin, y);
        y += 5;
      });
      y += 5;
    };

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("SocialImob Pro", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Relatório de Campanha Estratégica", margin, y);
    y += 15;

    // Estratégia
    addTitle("1. Estratégia");
    addSubtitle("Ângulo de Venda");
    addBody(strategy.angle);
    addSubtitle("Público-alvo");
    addBody(strategy.persona);
    addSubtitle("Narrativa");
    addBody(strategy.narrative);

    // Reel
    addTitle("2. Roteiro de Reel");
    addSubtitle("Ganchos Sugeridos");
    campaign.reelScript.hooks.forEach((h, i) => addBody(`${i + 1}. ${h}`));
    addSubtitle("Corpo do Roteiro");
    addBody(campaign.reelScript.body);
    addSubtitle("Chamada para Ação (CTA)");
    addBody(campaign.reelScript.cta);

    // Planner
    addTitle("3. Cronograma Semanal");
    plannerDays.forEach((day, i) => {
      addSubtitle(`Dia ${day.day || i + 1}: ${day.title}`);
      addBody(day.content);
    });

    // 1 Idea -> 10 Contents
    addTitle("4. Metodologia 1 Ideia -> 10 Conteúdos");
    (campaign.derivedContent10 || []).forEach((item) => {
      addSubtitle(item.type);
      addBody(item.content);
    });

    doc.save(`SocialImob-Campanha-${propertyData.location || 'Imovel'}.pdf`);
  };

  const nextSection = () => {
    const idx = SECTIONS.findIndex(s => s.id === activeSection);
    if (idx < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[idx + 1].id);
    }
  };

  // Safe access to planner data
  const plannerDays = Array.isArray(campaign.planner) ? campaign.planner : [];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header with Grid Navigation */}
      <div className="sticky top-0 z-10 bg-slate-50 pt-2 pb-4 -mx-4 px-4 border-b border-slate-200/50 backdrop-blur-sm bg-slate-50/90">
        <div className="space-y-1 mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Sua Campanha</h2>
          <p className="text-slate-500 text-xs">Pronta para lançamento.</p>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-xs font-medium transition-all
                  ${isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 py-4 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "strategy" && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700">
                  <p>
                    <strong>Por que essa estratégia?</strong><br/>
                    Como você escolheu <u>{propertyData.buyerProfile}</u> com objetivo de <u>{propertyData.goal}</u>, 
                    desenvolvemos uma abordagem <strong>{strategy.approach}</strong> totalmente alinhada às suas escolhas.
                  </p>
                </div>

                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Ângulo de Venda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-indigo-800 leading-relaxed">{strategy.angle}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Público-alvo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">{strategy.persona}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Narrativa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">{strategy.narrative}</p>
                  </CardContent>
                </Card>

                <Button className="w-full mt-4" onClick={nextSection}>
                  Próximo: Reel <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {activeSection === "reel" && (
              <div className="space-y-4">
                <Card className="border-l-4 border-l-pink-500 overflow-hidden">
                  <div className="bg-pink-50 p-3 border-b border-pink-100 flex justify-between items-center">
                    <span className="font-bold text-pink-700 flex items-center gap-2">
                      <Video className="w-4 h-4" /> Roteiro Principal
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-pink-700 hover:bg-pink-100"
                      onClick={() => copyToClipboard(
                        `Ganchos:\n${campaign.reelScript.hooks.join("\n")}\n\nRoteiro:\n${campaign.reelScript.body}\n\nCTA:\n${campaign.reelScript.cta}`, 
                        'reel'
                      )}
                    >
                      {copiedId === 'reel' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 block">Escolha um Gancho Viral (3s)</span>
                      <div className="space-y-2">
                        {campaign.reelScript.hooks.map((hook, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group relative">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {hIdx + 1}
                            </span>
                            <p className="text-sm text-slate-700 leading-tight pr-8">{hook}</p>
                            <Button 
                              size="sm" variant="ghost" className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(hook, `hook-${hIdx}`)}
                            >
                              {copiedId === `hook-${hIdx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Corpo do Roteiro</span>
                      <p className="text-sm text-slate-700 whitespace-pre-line mt-1 leading-relaxed">{campaign.reelScript.body}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">CTA</span>
                      <p className="text-sm font-bold text-indigo-600 mt-1">{campaign.reelScript.cta}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-500 italic border border-slate-100">
                      🎥 <strong>Sugestão de Cenas:</strong> {campaign.reelScript.scenes}
                    </div>
                  </CardContent>
                </Card>
                <Button className="w-full mt-4" onClick={nextSection}>
                  Próximo: Planner <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {activeSection === "planner" && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4">
                  <p>
                    <strong>Cronograma de Conteúdo:</strong><br/>
                    Um conteúdo estratégico para cada dia da semana, cobrindo Região, Condomínio, Diferenciais e mais.
                  </p>
                </div>
                
                {plannerDays.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    Não foi possível carregar o cronograma. Tente gerar novamente.
                  </div>
                ) : (
                  plannerDays.map((day, idx) => (
                    <Card key={idx} className="overflow-hidden border-slate-200">
                      <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-12 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold px-2">
                            Dia {day.day || idx + 1}
                          </span>
                          <span className="font-semibold text-slate-700 text-sm">{day.title || `Dia ${idx + 1}`}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(day.content || "", `day-${idx}`)}
                        >
                          {copiedId === `day-${idx}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </Button>
                      </div>
                      <CardContent className="pt-4 space-y-2">
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{day.topic || "Conteúdo"}</div>
                        <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                          <ReactMarkdown>{day.content || "Conteúdo não gerado."}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                <Button className="w-full mt-4" onClick={nextSection}>
                  Próximo: 10 Ideias <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {activeSection === "content10" && (
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-800">
                  <h3 className="font-bold flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4" /> Metodologia 1 Ideia → 10 Conteúdos
                  </h3>
                  <p>Transformamos o seu imóvel em 10 abordagens diferentes para você nunca ficar sem o que postar.</p>
                </div>
                
                <div className="space-y-4">
                  {(campaign.derivedContent10 || []).map((item, iIdx) => (
                    <Card key={iIdx} className="border-slate-200 group relative">
                      <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">{item.type}</span>
                        <Button 
                          size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(item.content, `content10-${iIdx}`)}
                        >
                          {copiedId === `content10-${iIdx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </Button>
                      </div>
                      <CardContent className="pt-3">
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{item.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button className="w-full mt-4" onClick={nextSection}>
                  Próximo: Tráfego <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {activeSection === "traffic" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Segmentação de Público</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{campaign.traffic.segmentation}</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Sugestão de Criativos</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">Topo de Funil</span>
                      <p className="text-sm text-slate-800 leading-relaxed">{campaign.traffic.creatives.top}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-600 uppercase mb-1 block">Meio de Funil</span>
                      <p className="text-sm text-slate-800 leading-relaxed">{campaign.traffic.creatives.middle}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <span className="text-[10px] font-bold text-green-600 uppercase mb-1 block">Fundo de Funil</span>
                      <p className="text-sm text-slate-800 leading-relaxed">{campaign.traffic.creatives.bottom}</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={nextSection}>
                  Próximo: Mensagens <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {activeSection === "messages" && (
              <div className="space-y-8 pb-8">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-800">
                  <p>
                    <strong>Mensagens Humanizadas:</strong><br/>
                    Gere conexão real com seus leads usando estas abordagens focadas no indivíduo.
                  </p>
                </div>

                {[
                  { id: 'abordagem', label: 'Abordagem (Interesse)', color: 'blue', icon: MessageCircle },
                  { id: 'followup', label: 'Follow-up (Consideração)', color: 'amber', icon: MessageCircle },
                  { id: 'encerramento', label: 'Encerramento (Decisão/FOMO)', color: 'green', icon: MessageCircle }
                ].map((stage) => (
                  <div key={stage.id} className="space-y-4">
                    <h3 className={`text-lg font-bold text-slate-900 flex items-center gap-2`}>
                      <stage.icon className={`w-5 h-5 text-${stage.color}-500`} /> {stage.label}
                    </h3>
                    <div className="space-y-3">
                      {(campaign.funnelMessages[stage.id as keyof typeof campaign.funnelMessages] || []).map((msg: string, mIdx: number) => (
                        <div key={mIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                          <Button 
                            size="sm" variant="ghost" className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(msg, `msg-${stage.id}-${mIdx}`)}
                          >
                            {copiedId === `msg-${stage.id}-${mIdx}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                          </Button>
                          <p className="text-sm text-slate-700 whitespace-pre-line pr-6">{msg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === "bonus" && (
              <div className="space-y-6 pb-8">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-800">
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> 
                    <strong>Bônus: Dicas de Conteúdo SocialImob</strong>
                  </p>
                  <p className="mt-1 text-xs">Aprenda como extrair o máximo de resultado desta campanha seguindo nossa metodologia.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Video className="w-4 h-4 text-amber-500" /> Formatos em Alta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-slate-700"><strong>Reels Curtos:</strong> Vídeos de 15 a 30 segundos com cortes rápidos são os que mais entregam hoje.</p>
                      <p className="text-sm text-slate-700"><strong>Carrosséis:</strong> Use para mostrar detalhes técnicos e fotos estáticas de alta qualidade.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" /> Como Filmar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-slate-700"><strong>Sempre na Vertical:</strong> Grave tudo em 9:16. O preenchimento total da tela gera mais imersão.</p>
                      <p className="text-sm text-slate-700"><strong>Luz Natural:</strong> Prefira filmar durante o dia com as janelas abertas para valorizar os ambientes.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" /> Dica de Edição (Chroma Key)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-slate-700"><strong>Não está no imóvel?</strong> Use o efeito "Chroma Key" ou "Remover Fundo" em editores gratuitos como o CapCut.</p>
                      <p className="text-sm text-slate-700">Coloque uma foto bonita do imóvel ao fundo e você falando na frente. É uma forma excelente de humanizar o anúncio mesmo à distância.</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-emerald-500" /> Dicas Criativas Extras
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(campaign.executionGuide?.creativeTips || []).map((tip, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-3 text-sm text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {tIdx + 1}
                        </div>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "pdf" && (
              <div className="space-y-6 py-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileDown className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Baixar Relatório Completo</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    Compilamos toda a sua estratégia, roteiros e planner em um único arquivo PDF profissional.
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full max-w-xs mx-auto shadow-xl bg-indigo-600 hover:bg-indigo-700"
                  onClick={generatePDF}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Gerar PDF Agora
                </Button>

                <div className="pt-8 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Ideal para apresentar ao proprietário ou manter como guia de consulta rápida.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
