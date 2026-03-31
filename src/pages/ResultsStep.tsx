import { useState } from "react";
import { useAppStore } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { 
  Copy, Check, Video, FileText, Target, ArrowLeft,
  Info, Sparkles, Home, Lightbulb, Building, List,
  Camera, Newspaper, Heart, Calendar
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function ResultsStep() {
  const { strategy, propertyData } = useAppStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
          <Info className="w-10 h-10 text-slate-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Nenhuma campanha encontrada</h2>
          <p className="text-slate-400">Parece que você ainda não gerou sua estratégia.</p>
        </div>
        <Button 
          onClick={() => navigate('/app')}
          className="rounded-2xl bg-brand-primary hover:bg-blue-700 px-8 h-12 font-bold"
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

  const formatText = (text: string) => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n');
  };

  const SectionCard = ({ title, icon: Icon, content, id, children }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 p-6 md:p-8 space-y-6 relative group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            {title}
          </h2>
        </div>
        {content && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-brand-primary hover:bg-blue-50 font-bold rounded-full px-3 h-10 flex items-center gap-2"
            onClick={() => copyToClipboard(formatText(content), id)}
          >
            {copiedId === id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden md:inline">Copiar</span>
          </Button>
        )}
      </div>
      
      {content && (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-slate-900 font-medium leading-relaxed text-base whitespace-pre-wrap">
          <ReactMarkdown>{formatText(content)}</ReactMarkdown>
        </div>
      )}
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col overflow-x-hidden pb-20">
      {/* Main Header */}
      <header className="bg-white border-b border-slate-100 p-4 md:p-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/20">
              <Target className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Estratégia de Conteúdo</h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 hidden md:block">Gerado por Inteligência Artificial</p>
            </div>
          </div>

          <Button 
            variant="ghost"
            onClick={() => navigate('/app')}
            className="text-slate-600 hover:text-brand-primary font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <SectionCard 
            title="Introdução / Estratégia de Venda" 
            icon={Target} 
            content={strategy.introducao} 
            id="introducao" 
          />

          <SectionCard title="Conteúdo Principal (Reel)" icon={Video}>
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-brand-primary tracking-widest uppercase mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 5 Ideias de Ganchos
                </h4>
                <div className="space-y-3">
                  {(strategy.conteudoPrincipal?.ganchos || []).map((hook: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                      <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-slate-900 font-bold pt-1 pr-10">{formatText(hook)}</p>
                      <Button 
                        size="sm" variant="ghost" className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={() => copyToClipboard(formatText(hook), `hook-${idx}`)}
                      >
                        {copiedId === `hook-${idx}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-brand-primary tracking-widest uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Estrutura do Reel
                  </h4>
                  <Button 
                    size="sm" variant="ghost" className="h-8 px-3 text-brand-primary hover:bg-blue-50 rounded-full"
                    onClick={() => copyToClipboard(formatText(strategy.conteudoPrincipal?.estruturaReel || ""), 'estruturaReel')}
                  >
                    {copiedId === 'estruturaReel' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar
                  </Button>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                  <ReactMarkdown>{formatText(strategy.conteudoPrincipal?.estruturaReel || "")}</ReactMarkdown>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            title="Conteúdo sobre Diferencial" 
            icon={Sparkles} 
            content={strategy.diferencial} 
            id="diferencial" 
          />

          {strategy.condominio && strategy.condominio.trim() !== "" && (
            <SectionCard 
              title="Sobre o Condomínio" 
              icon={Building} 
              content={strategy.condominio} 
              id="condominio" 
            />
          )}

          <SectionCard 
            title="Conteúdo em Lista" 
            icon={List} 
            content={strategy.lista} 
            id="lista" 
          />

          <SectionCard 
            title="Posicionamento (Tela Verde)" 
            icon={Camera} 
            content={strategy.posicionamento} 
            id="posicionamento" 
          />

          <SectionCard 
            title="Explicação Técnica" 
            icon={Lightbulb} 
            content={strategy.explicacaoTecnica} 
            id="explicacaoTecnica" 
          />

          <SectionCard 
            title="POV (Tour)" 
            icon={Video} 
            content={strategy.pov} 
            id="pov" 
          />

          <SectionCard 
            title="Notícia" 
            icon={Newspaper} 
            content={strategy.noticia} 
            id="noticia" 
          />

          <SectionCard 
            title="Estilo de Vida" 
            icon={Heart} 
            content={strategy.estiloDeVida} 
            id="estiloDeVida" 
          />

          {/* Mini Planner Semanal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 p-6 md:p-8 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-secondary" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
                  Mini Planner Semanal
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Sugestão de distribuição dos conteúdos gerados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { day: "Segunda-feira", title: "Conteúdo Principal (Reel)", type: "Vídeo", icon: Video, color: "bg-blue-50 text-blue-600 border-blue-200" },
                { day: "Terça-feira", title: "Diferencial do Imóvel", type: "Carrossel/Foto", icon: Sparkles, color: "bg-purple-50 text-purple-600 border-purple-200" },
                { day: "Quarta-feira", title: "Conteúdo em Lista", type: "Carrossel", icon: List, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                { day: "Quinta-feira", title: "Explicação Técnica", type: "Vídeo/Foto", icon: Lightbulb, color: "bg-amber-50 text-amber-600 border-amber-200" },
                { day: "Sexta-feira", title: "Estilo de Vida", type: "Vídeo/Foto", icon: Heart, color: "bg-rose-50 text-rose-600 border-rose-200" },
                { day: "Sábado", title: "POV (Tour)", type: "Reel", icon: Camera, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
                { day: "Domingo", title: "Notícia / Curiosidade", type: "Story/Post", icon: Newspaper, color: "bg-orange-50 text-orange-600 border-orange-200" },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${item.color} bg-opacity-50 flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest opacity-70">{item.day}</span>
                    <item.icon className="w-4 h-4 opacity-70" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{item.title}</h4>
                    <span className="inline-block mt-2 px-2 py-1 bg-white/60 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => navigate('/app/planner')}
                className="bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl px-6"
              >
                Ir para o Planner Completo
              </Button>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
