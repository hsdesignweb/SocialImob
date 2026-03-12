import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { useAppStore } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { FileText, Link as LinkIcon, ArrowRight, CheckCircle2, AlertCircle, Coins, Sparkles, Target } from "lucide-react";
import { generateJSON } from "@/lib/gemini";
import { Type } from "@google/genai";

export default function InputStep() {
  const navigate = useNavigate();
  const { updatePropertyData, setIsLoading, setCampaign, setStrategy } = useAppStore();
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
      // 1. Extract property data first
      const extractPrompt = `
        Analise o conteúdo fornecido (texto ou LINK) sobre um imóvel e extraia as informações principais.
        Verifique se o conteúdo é REALMENTE sobre um imóvel.
        Conteúdo fornecido: "${inputText}"
        
        Retorne um JSON com:
        - isValidProperty: boolean
        - type: Tipo do imóvel
        - location: Localização aproximada
        - price: Valor
        - features: Lista de características principais
        - missingInfo: Lista de informações cruciais faltando
        - errorMessage: String (se inválido)
      `;

      const extractSchema = {
        type: Type.OBJECT,
        properties: {
          isValidProperty: { type: Type.BOOLEAN },
          type: { type: Type.STRING },
          location: { type: Type.STRING },
          price: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
          errorMessage: { type: Type.STRING }
        },
        required: ["isValidProperty"]
      };

      const extractedData = await generateJSON(extractPrompt, extractSchema);

      if (!extractedData.isValidProperty) {
        setError(extractedData.errorMessage || "O conteúdo enviado não possui relação com o mercado imobiliário.");
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }

      // 2. Consume credit
      const creditConsumed = consumeCredit();
      if (!creditConsumed) {
        if (user?.status === 'trial' && user.credits <= 0) {
           navigate('/payment?reason=trial_ended');
           return;
        }
        throw new Error("Erro ao processar créditos.");
      }

      // 3. Generate Strategy and Campaign
      const propertyData = {
        description: inputText,
        ...extractedData,
        buyerProfile: buyerProfiles.join(", "),
        goal: goals.join(", ")
      };
      updatePropertyData(propertyData);

      const reinforcementText = `
        REGRAS OBRIGATÓRIAS (Metodologia SocialImob Pro):
        1. Responda SEMPRE em Português do Brasil (PT-BR).
        2. A estratégia DEVE estar rigorosamente alinhada com os perfis selecionados (${buyerProfiles.join(", ")}) e os objetivos (${goals.join(", ")}).
        3. Premissa Social: As pessoas estão nas redes para entretenimento, informação ou conexão.
        4. Linguagem: Persuasiva, humanizada e direta.
      `;

      const strategyPrompt = `
        Atue como um estrategista de marketing imobiliário sênior seguindo a Metodologia SocialImob.
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Defina a estratégia de lançamento. Retorne JSON:
        - angle, persona, approach, narrative, sequence (array)
      `;

      const strategySchema = {
        type: Type.OBJECT,
        properties: {
          angle: { type: Type.STRING },
          persona: { type: Type.STRING },
          approach: { type: Type.STRING },
          narrative: { type: Type.STRING },
          sequence: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["angle", "persona", "approach", "narrative", "sequence"]
      };

      const reelPrompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Gere um roteiro para Reel de 60s. Retorne JSON:
        - hooks (5 opções), body, cta, scenes
      `;
      const reelSchema = {
        type: Type.OBJECT,
        properties: {
          hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
          scenes: { type: Type.STRING }
        },
        required: ["hooks", "body", "cta", "scenes"]
      };

      const planPrompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Gere um Planner de Conteúdo de 7 dias. Retorne JSON:
        - planner: Lista de 7 dias (day, title, topic, content)
      `;
      const planSchema = {
        type: Type.OBJECT,
        properties: {
          planner: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                title: { type: Type.STRING },
                topic: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["day", "title", "topic", "content"]
            }
          }
        },
        required: ["planner"]
      };

      const trafficPrompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Gere Mensagens de Funil e Estratégia de Tráfego. Retorne JSON:
        - funnelMessages: { abordagem, followup, encerramento }, traffic, executionGuide
      `;
      const trafficSchema = {
        type: Type.OBJECT,
        properties: {
          funnelMessages: {
            type: Type.OBJECT,
            properties: {
              abordagem: { type: Type.ARRAY, items: { type: Type.STRING } },
              followup: { type: Type.ARRAY, items: { type: Type.STRING } },
              encerramento: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          traffic: { type: Type.OBJECT, properties: { creatives: { type: Type.OBJECT }, segmentation: { type: Type.STRING } } },
          executionGuide: { type: Type.OBJECT, properties: { creativeTips: { type: Type.ARRAY, items: { type: Type.STRING } }, publishingAdvice: { type: Type.STRING }, engagementStrategy: { type: Type.STRING } } }
        }
      };

      const content10Prompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Aplique a metodologia "1 ideia → 10 conteúdos". Retorne JSON:
        - derivedContent10: Lista de 10 objetos (type, content)
      `;
      const content10Schema = {
        type: Type.OBJECT,
        properties: {
          derivedContent10: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, content: { type: Type.STRING } } } }
        }
      };

      const results = await Promise.allSettled([
        generateJSON(strategyPrompt, strategySchema),
        generateJSON(reelPrompt, reelSchema),
        generateJSON(planPrompt, planSchema),
        generateJSON(trafficPrompt, trafficSchema),
        generateJSON(content10Prompt, content10Schema)
      ]);

      const getValue = (result: PromiseSettledResult<any>, fallback: any) => 
        result.status === 'fulfilled' ? result.value : fallback;

      if (results[0].status === 'rejected') throw new Error("Falha na estratégia principal.");

      setStrategy(results[0].value);
      setCampaign({
        reelScript: getValue(results[1], { hooks: [], body: "", cta: "", scenes: "" }),
        derivedContent: [],
        funnelMessages: getValue(results[3], { funnelMessages: { abordagem: [], followup: [], encerramento: [] } }).funnelMessages,
        planner: getValue(results[2], { planner: [] }).planner,
        traffic: getValue(results[3], { traffic: { creatives: {}, segmentation: "" } }).traffic,
        executionGuide: getValue(results[3], { executionGuide: { creativeTips: [], publishingAdvice: "", engagementStrategy: "" } }).executionGuide,
        derivedContent10: getValue(results[4], { derivedContent10: [] }).derivedContent10
      });

      navigate("/results");
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
        <p className="text-slate-500 font-medium">Descreva o imóvel ou cole um link para começar.</p>
      </div>

      <div className="space-y-8">
        {/* Main Input Area - Now at the top */}
        <div className="relative group">
          <div className="absolute inset-0 bg-brand-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <textarea
            className={`w-full h-48 p-8 rounded-3xl border-2 ${error ? 'border-red-500/50 bg-red-50' : 'border-slate-100 bg-white'} focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 resize-none text-lg transition-all shadow-xl shadow-slate-200/50 text-slate-900 placeholder:text-slate-400 font-medium relative z-10`}
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
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
                <Target className="w-6 h-6 text-brand-primary" /> Quem é o comprador?
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{buyerProfiles.length}/3</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {profiles.map((p) => {
                const isSelected = buyerProfiles.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggleProfile(p)}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 text-sm font-bold transition-all
                      ${isSelected 
                        ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]" 
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
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-brand-secondary" /> Qual o objetivo?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {availableGoals.map((g) => {
                const isSelected = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 text-sm font-bold transition-all
                      ${isSelected 
                        ? "bg-brand-secondary border-brand-secondary text-white shadow-lg shadow-brand-secondary/20 scale-[1.02]" 
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
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <Coins className="w-4 h-4 text-brand-secondary" /> Custo: 1 crédito
            </div>
          )}
          <Button 
            size="lg" 
            className="w-full h-16 text-xl font-black shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-blue-700 transition-all rounded-2xl" 
            onClick={handleGenerate}
            disabled={!inputText.trim() || buyerProfiles.length === 0 || goals.length === 0 || isProcessing || (!user?.isAdmin && (user?.credits || 0) <= 0)}
          >
            {isProcessing ? "Criando Estratégia..." : "Gerar Campanha Agora"}
            {!isProcessing && <ArrowRight className="ml-3 w-7 h-7" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
