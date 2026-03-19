import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { useAppStore } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { FileText, Link as LinkIcon, ArrowRight, CheckCircle2, AlertCircle, Coins, Sparkles, Target, History, Clock } from "lucide-react";
import { generateJSON } from "@/lib/gemini";
import { Type } from "@google/genai";

const fixCase = (text: string) => {
  if (!text) return "";
  
  // Count letters and uppercase letters (including accented ones)
  const allLetters = text.match(/[a-zA-ZÀ-ÿ]/g) || [];
  if (allLetters.length === 0) return text;
  
  const upperLetters = text.match(/[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ]/g) || [];
  const ratio = upperLetters.length / allLetters.length;
  
  // If more than 50% is uppercase, it's likely a capslock issue
  if (ratio > 0.5) {
    const lowered = text.toLowerCase();
    // Capitalize first letter of the string and letters after . ! ?
    return lowered.replace(/(^\s*|[.!?]\s+)([a-zà-ÿ])/g, (match, p1, p2) => {
      return p1 + p2.toUpperCase();
    });
  }
  return text;
};

export default function InputStep() {
  const navigate = useNavigate();
  const { updatePropertyData, setIsLoading, setCampaign, setStrategy, history, addToHistory, loadFromHistory } = useAppStore();
  const { user, consumeCredit } = useAuth();
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [buyerProfiles, setBuyerProfiles] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const profiles = [
    "Família com filhos",
    "Investidor",
    "Primeiro imóvel (Jovem/Casal)",
    "Alto Padrão / Luxo",
    "Aposentados"
  ];

  const availableGoals = [
    "Vender rápido (Preço oportunidade)",
    "Gerar Leads qualificados",
    "Posicionamento de marca",
    "Testar mercado"
  ];

  const toggleProfile = (p: string) => {
    setBuyerProfiles(prev => {
      if (prev.includes(p)) return prev.filter(item => item !== p);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  };

  const toggleGoal = (g: string) => {
    setGoals(prev => {
      if (prev.includes(g)) return prev.filter(item => item !== g);
      return [...prev, g];
    });
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || buyerProfiles.length === 0 || goals.length === 0) return;

    // Check credits
    if (!user?.isAdmin && user?.credits !== undefined && user.credits <= 0) {
      setError("Você não possui créditos suficientes. Contate o administrador.");
      return;
    }

    setIsProcessing(true);
    setIsLoading(true);
    setError(null);

    try {
      // 1. Generate EVERYTHING in exactly ONE single call (Validation + Strategy + Campaign)
      const unifiedPrompt = `
        Atue como um estrategista de marketing imobiliário sênior seguindo a Metodologia SocialImob Pro.
        
        TAREFA INICIAL DE VALIDAÇÃO:
        Analise se o conteúdo fornecido abaixo é REALMENTE sobre um imóvel ou mercado imobiliário.
        Se NÃO for um imóvel, defina "isValidProperty" como false e explique o motivo em "errorMessage".
        Se FOR um imóvel, defina "isValidProperty" como true e complete todas as outras tarefas.

        DADOS DO IMÓVEL (Texto ou Link): "${inputText}"
        PERFIS SELECIONADOS: ${buyerProfiles.join(", ")}
        OBJETIVOS: ${goals.join(", ")}

        TAREFAS DE GERAÇÃO (Apenas se isValidProperty for true):
        1. EXTRAÇÃO: Extraia tipo, localização, preço e características.
        2. ESTRATÉGIA: Defina ângulo de venda, persona, abordagem e narrativa.
        3. REEL: Crie um roteiro viral. Para os ganchos, você DEVE adaptar e usar EXATAMENTE um destes 5 modelos como base: 
           1. "Você não vai acreditar no que eu acabei de encontrar..."
           2. "O segredo para morar bem em [Localização]..."
           3. "Pare de procurar imóvel agora mesmo!"
           4. "O investimento que você estava esperando..."
           5. "Conheça o imóvel dos seus sonhos em 60 segundos."
           Gere 5 variações baseadas nesses modelos, corpo do texto com quebras de linha, CTA e direção de cenas.
        4. PLANNER: Crie um plano de 7 dias com TEXTOS COMPLETOS e humanizados.
        5. TRÁFEGO E FUNIL: Gere 3 mensagens de abordagem, 3 de follow-up e 3 de encerramento. Devem ser textos naturais, sem parecer robótico.
        6. MULTIPLICADOR 10x (Metodologia 1 Ideia → 10 Conteúdos): 
           Objetivo: Transformar uma única ideia central em 10 conteúdos diferentes, mantendo o mesmo tema, mas variando ângulo, narrativa e formato.
           A lógica é NÃO mudar o assunto, apenas mudar a forma de comunicar para que a mensagem seja repetida sem parecer repetitiva.
           Gere EXATAMENTE 10 itens no array "derivedContent10", um para cada formato abaixo:
           - Lista: 5 pontos cruciais ou curiosidades sobre o imóvel.
           - Storytelling: Uma pequena narrativa realista sobre o dia a dia ou a conquista deste imóvel.
           - Posicionamento: Uma opinião forte e profissional sobre por que este imóvel é a melhor escolha.
           - Explicação técnica: Visão de especialista sobre acabamento, localização ou potencial de valorização.
           - Motivacional: Mensagem inspiradora sobre mudança de vida e realização de sonhos.
           - POV (Ponto de Vista): Texto que coloca o leitor na cena (Ex: "POV: Você recebendo os amigos nesse terraço...").
           - Análise: Reflexão estratégica sobre o custo-benefício ou o momento do mercado para este imóvel.
           - Tutorial: Guia prático (Ex: 3 passos para visitar, como garantir essa unidade).
           - Conexão: Foco no lado emocional, bem-estar, família e segurança.
           - Tendência: Por que este imóvel representa o futuro do morar ou investir na região.

        REGRAS CRÍTICAS DE FORMATAÇÃO:
        - Responda SEMPRE em Português do Brasil (PT-BR).
        - NUNCA use CAPSLOCK (exceto em siglas). Use capitalização normal (Sentença ou Título).
        - É PROIBIDO gerar textos inteiros em letras maiúsculas.
        - Use quebras de linha (\n) no corpo do script do Reel e no Planner para legibilidade.
        - Nos GANCHOS do Reel, NÃO use quebras de linha, mantenha em uma única linha.
        - Use negrito (**texto**) para enfatizar pontos cruciais.
        - Linguagem persuasiva, humanizada e estratégica.
      `;

      const unifiedSchema = {
        type: Type.OBJECT,
        properties: {
          isValidProperty: { type: Type.BOOLEAN },
          errorMessage: { type: Type.STRING },
          extractedData: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              location: { type: Type.STRING },
              price: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          strategy: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING },
              persona: { type: Type.STRING },
              approach: { type: Type.STRING },
              narrative: { type: Type.STRING },
              sequence: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          reel: {
            type: Type.OBJECT,
            properties: {
              hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
              scenes: { type: Type.STRING }
            }
          },
          planner: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                title: { type: Type.STRING },
                topic: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          },
          funnelMessages: {
            type: Type.OBJECT,
            properties: {
              abordagem: { type: Type.ARRAY, items: { type: Type.STRING } },
              followup: { type: Type.ARRAY, items: { type: Type.STRING } },
              encerramento: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          traffic: {
            type: Type.OBJECT,
            properties: {
              segmentation: { type: Type.STRING },
              creativeAdvice: { type: Type.STRING }
            }
          },
          derivedContent10: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          }
        },
        required: ["isValidProperty", "extractedData", "strategy", "reel", "planner", "funnelMessages", "derivedContent10", "traffic"]
      };

      const fullResult = await generateJSON(unifiedPrompt, unifiedSchema);

      // 2. Check Validation
      if (!fullResult.isValidProperty) {
        setError(fullResult.errorMessage || "O conteúdo enviado não possui relação com o mercado imobiliário.");
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }

      // 3. Consume credit ONLY after successful validation and generation
      const creditConsumed = consumeCredit();
      if (!creditConsumed) {
        throw new Error("Erro ao processar créditos.");
      }

      // 4. Process and Save Results
      const propertyData = {
        description: inputText,
        ...fullResult.extractedData,
        buyerProfile: buyerProfiles.join(", "),
        goal: goals.join(", ")
      };
      updatePropertyData(propertyData);

      const finalStrategy = {
        angle: fixCase(fullResult.strategy?.angle || ""),
        persona: fixCase(fullResult.strategy?.persona || ""),
        approach: fixCase(fullResult.strategy?.approach || ""),
        narrative: fixCase(fullResult.strategy?.narrative || ""),
        sequence: (fullResult.strategy?.sequence || []).map(fixCase)
      };

      const finalCampaign = {
        reelScript: {
          hooks: (fullResult.reel?.hooks || []).map((h: string) => fixCase(h.replace(/\n/g, " ").trim())),
          body: fixCase(fullResult.reel?.body || ""),
          cta: fixCase(fullResult.reel?.cta || ""),
          scenes: fixCase(fullResult.reel?.scenes || "")
        },
        funnelMessages: {
          abordagem: (fullResult.funnelMessages?.abordagem || []).map(fixCase),
          followup: (fullResult.funnelMessages?.followup || []).map(fixCase),
          encerramento: (fullResult.funnelMessages?.encerramento || []).map(fixCase)
        },
        planner: (fullResult.planner || []).map((p: any) => ({
          ...p,
          title: fixCase(p.title || ""),
          topic: fixCase(p.topic || ""),
          content: fixCase(p.content || "")
        })),
        traffic: fullResult.traffic || { creatives: {}, segmentation: "" },
        executionGuide: { 
          creativeTips: [fixCase(fullResult.traffic?.creativeAdvice || "")], 
          publishingAdvice: "Siga o cronograma de 7 dias.", 
          engagementStrategy: "Responda todos os comentários nos primeiros 30 minutos." 
        },
        derivedContent10: (fullResult.derivedContent10 || []).map((d: any) => ({
          type: fixCase(d.type || ""),
          content: fixCase(d.content || "")
        }))
      };

      setStrategy(finalStrategy);
      setCampaign(finalCampaign);

      // Save to history
      addToHistory({
        propertyData,
        strategy: finalStrategy,
        campaign: finalCampaign
      });

      navigate("/app/results");
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Erro ao gerar campanha.");
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">O que vamos vender?</h2>
        <p className="text-slate-500 font-medium">Você pode descrever seu imóvel ou colar o link do site ou portal</p>
      </div>

      <div className="space-y-8">
        {/* Main Input Area - Now at the top */}
        <div className="relative group">
          <textarea
            className={`w-full h-48 p-6 rounded-xl border-2 ${error ? 'border-red-500/50 bg-red-50' : 'border-slate-100 bg-white'} focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 resize-none text-base transition-all shadow-sm text-slate-900 placeholder:text-slate-400 font-medium relative z-10`}
            placeholder="Ex: Apartamento 3 quartos no Jardins, reformado, vista livre, 2 vagas..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
          />
          <div className="absolute bottom-6 right-6 flex gap-3 z-20">
            <Button variant="outline" size="sm" className="rounded-xl bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm" onClick={() => {
              const url = prompt("Cole o link do imóvel:");
              if (url) setInputText(prev => prev + " " + url);
            }}>
              <LinkIcon className="w-4 h-4 mr-2" /> Link
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm" onClick={() => navigator.clipboard.readText().then(t => setInputText(prev => prev + " " + t))}>
              <FileText className="w-4 h-4 mr-2" /> Colar
            </Button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-red-50 border-2 border-red-100 text-red-600 text-sm rounded-2xl flex items-start gap-4"
          >
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="font-bold">{error}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Buyer Profile Selection */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                <Target className="w-5 h-5 text-brand-primary" /> Comprador Ideal
              </h3>
              <span className="text-[10px] font-black text-slate-400 tracking-widest">{buyerProfiles.length}/3</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {profiles.map((p) => {
                const isSelected = buyerProfiles.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggleProfile(p)}
                    className={`
                      flex items-center gap-4 p-4 rounded-2xl border-2 text-sm font-bold transition-all
                      ${isSelected 
                        ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-brand-primary/30 hover:bg-white"}
                    `}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-white border-white" : "border-slate-300"}`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-brand-primary" />}
                    </div>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goals Selection */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-secondary" /> Principal Objetivo
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {availableGoals.map((g) => {
                const isSelected = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`
                      flex items-center gap-4 p-4 rounded-2xl border-2 text-sm font-bold transition-all
                      ${isSelected 
                        ? "bg-brand-secondary border-brand-secondary text-white shadow-lg shadow-brand-secondary/20" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-brand-secondary/30 hover:bg-white"}
                    `}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-white border-white" : "border-slate-300"}`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-brand-secondary" />}
                    </div>
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          {!user?.isAdmin && (
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 tracking-[0.3em]">
              <Coins className="w-4 h-4 text-brand-secondary" /> Custo: 1 crédito
            </div>
          )}
          <Button 
            size="lg" 
            className="w-full h-14 md:h-16 text-lg md:text-xl font-black bg-brand-primary hover:bg-blue-700 transition-all rounded-2xl shadow-xl shadow-brand-primary/20" 
            onClick={handleGenerate}
            disabled={!inputText.trim() || buyerProfiles.length === 0 || goals.length === 0 || isProcessing || (!user?.isAdmin && (user?.credits || 0) <= 0)}
          >
            {isProcessing ? "Criando Estratégia..." : "Gerar Campanha Agora"}
            {!isProcessing && <ArrowRight className="ml-3 w-6 h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
