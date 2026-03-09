import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CheckCircle2, AlertCircle, Coins } from "lucide-react";
import { generateJSON } from "@/lib/gemini";
import { Type } from "@google/genai";

export default function RefinementStep() {
  const navigate = useNavigate();
  const { propertyData, updatePropertyData, setCampaign, setStrategy, setIsLoading } = useAppStore();
  const { user, consumeCredit } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for selections
  const [buyerProfiles, setBuyerProfiles] = useState<string[]>(
    Array.isArray(propertyData.buyerProfile) ? propertyData.buyerProfile : propertyData.buyerProfile ? [propertyData.buyerProfile] : []
  );
  const [goals, setGoals] = useState<string[]>(
    Array.isArray(propertyData.goal) ? propertyData.goal : propertyData.goal ? [propertyData.goal] : []
  );

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
    if (buyerProfiles.length === 0 || goals.length === 0) return;

    // Check credits
    if (!user?.isAdmin && user?.credits !== undefined && user.credits <= 0) {
      setError("Você não possui créditos suficientes. Contate o administrador.");
      return;
    }

    updatePropertyData({ buyerProfile: buyerProfiles.join(", "), goal: goals.join(", ") });
    setIsGenerating(true);
    setIsLoading(true);
    setError(null);

    try {
      // Consume credit immediately before generation starts
      const creditConsumed = consumeCredit();
      if (!creditConsumed) {
        if (user?.status === 'trial' && user.credits <= 0) {
           navigate('/payment?reason=trial_ended');
           return;
        }
        throw new Error("Erro ao processar créditos.");
      }

      const reinforcementText = `
        REGRAS OBRIGATÓRIAS:
        1. Responda SEMPRE em Português do Brasil (PT-BR).
        2. A estratégia DEVE estar rigorosamente alinhada com os perfis selecionados (${buyerProfiles.join(", ")}) e os objetivos (${goals.join(", ")}).
        3. NÃO use caixa alta (Caps Lock) desnecessária.
        4. NÃO use caracteres especiais ou idiomas estrangeiros (como Chinês).
      `;
      
      const strategyPrompt = `
        Atue como um estrategista de marketing imobiliário sênior.
        ${reinforcementText}

        Dados do Imóvel:
        ${JSON.stringify(propertyData)}
        
        Perfis Compradores: ${buyerProfiles.join(", ")}
        Objetivos: ${goals.join(", ")}
        
        Defina a estratégia de lançamento. Retorne JSON:
        - angle: Ângulo principal de venda (uma frase curta e impactante)
        - persona: Descrição detalhada da persona baseada nos perfis escolhidos
        - approach: Tom de voz e abordagem (ex: Emocional, Técnico, Urgência)
        - narrative: Sugestão de narrativa (storytelling)
        - sequence: Lista de 5 tópicos para sequência de posts
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

      // Chunk A: Reel Script
      const reelPrompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Perfis Compradores: ${buyerProfiles.join(", ")}
        Objetivos: ${goals.join(", ")}
        
        Gere um roteiro para Reel de 60s focado no público-alvo. 
        Retorne JSON:
        - hooks: Lista com EXATAMENTE 5 opções de ganchos virais (3s cada)
        - body: Desenvolvimento completo do roteiro (fala/narração)
        - cta: Chamada para ação impactante
        - scenes: Sugestão visual detalhada de cenas
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

      // Chunk B: Planner with Content (Merged)
      const planPrompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Perfis Compradores: ${buyerProfiles.join(", ")}
        Objetivos: ${goals.join(", ")}
        
        Gere um Planner de Conteúdo de 7 dias. 
        IMPORTANTE: O campo "content" deve conter a LEGENDA COMPLETA E PRONTA PARA USO (incluindo emojis e hashtags), não apenas uma sugestão.
        
        Para o campo "day", use apenas o número (1 a 7).
        Para o campo "title", use o formato "Dia X: [Título]".
        
        Distribuição sugerida:
        - Dia 1: Teaser / Impacto
        - Dia 2: A Região / Localização
        - Dia 3: O Condomínio / Lazer
        - Dia 4: Diferenciais do Imóvel
        - Dia 5: Valorização / Investimento
        - Dia 6: Estilo de Vida / Social
        - Dia 7: Convite / CTA Final
        
        Retorne JSON:
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

      // Chunk C: Messages & Traffic
      const trafficPrompt = `
        ${reinforcementText}
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Perfis Compradores: ${buyerProfiles.join(", ")}
        Objetivos: ${goals.join(", ")}
        
        Gere:
        1. Mensagens de Funil Humanizadas (Abordagem, Follow-up, Encerramento) para WhatsApp.
           - Gere EXATAMENTE 3 opções de mensagens para cada estágio.
           - Abordagem: Focada em iniciar conversa e gerar curiosidade.
           - Follow-up: Focada em manter o interesse e tirar dúvidas.
           - Encerramento: Focada em urgência, FOMO ("não posso perder") e trazer o cliente de volta.
        2. Estratégia de Tráfego (Sugestão de criativos e Segmentação).
        
        Retorne JSON:
        - funnelMessages: { 
            abordagem: [string, string, string], 
            followup: [string, string, string], 
            encerramento: [string, string, string] 
          }
        - traffic: { creatives: { top, middle, bottom }, segmentation }
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
            },
            required: ["abordagem", "followup", "encerramento"]
          },
          traffic: {
            type: Type.OBJECT,
            properties: {
              creatives: {
                type: Type.OBJECT,
                properties: {
                  top: { type: Type.STRING },
                  middle: { type: Type.STRING },
                  bottom: { type: Type.STRING }
                },
                required: ["top", "middle", "bottom"]
              },
              segmentation: { type: Type.STRING }
            },
            required: ["creatives", "segmentation"]
          }
        },
        required: ["funnelMessages", "traffic"]
      };

      // Execute ALL requests in parallel
      const results = await Promise.allSettled([
        generateJSON(strategyPrompt, strategySchema),
        generateJSON(reelPrompt, reelSchema),
        generateJSON(planPrompt, planSchema),
        generateJSON(trafficPrompt, trafficSchema)
      ]);

      const getValue = (result: PromiseSettledResult<any>, fallback: any) => 
        result.status === 'fulfilled' ? result.value : fallback;

      if (results[0].status === 'rejected') {
        throw new Error(`Falha ao gerar estratégia principal: ${results[0].reason?.message || "Erro desconhecido"}`);
      }

      const strategyData = results[0].value;
      const reelData = getValue(results[1], { hooks: ["Erro ao gerar"], body: "Tente regenerar", cta: "...", scenes: "..." });
      const plannerData = getValue(results[2], { planner: [] });
      const trafficData = getValue(results[3], { 
        funnelMessages: { abordagem: [], followup: [], encerramento: [] }, 
        traffic: { creatives: { top: "", middle: "", bottom: "" }, segmentation: "" }
      });
      
      setStrategy(strategyData);
      
      const contentData = {
        reelScript: reelData,
        derivedContent: [],
        funnelMessages: trafficData.funnelMessages,
        planner: plannerData.planner || [],
        traffic: trafficData.traffic
      };
      
      setCampaign(contentData);

      if (results.some(r => r.status === 'rejected')) {
        setError("Alguns conteúdos não puderam ser gerados completamente, mas entregamos o que foi possível.");
      }

      navigate("/results");
    } catch (error: any) {
      console.error("Error generating campaign:", error);
      setError(error.message || "Erro ao gerar campanha. Verifique sua conexão e tente novamente.");
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Definição Estratégica</h2>
        <p className="text-slate-500">Ajude a IA a entender o alvo.</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-semibold text-slate-900">Quem é o comprador ideal?</h3>
          <span className="text-xs text-slate-400">{buyerProfiles.length}/3 selecionados</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {profiles.map((p) => {
            const isSelected = buyerProfiles.includes(p);
            return (
              <Button
                key={p}
                variant={isSelected ? "default" : "card"}
                className={isSelected ? "justify-center" : "justify-start"}
                onClick={() => toggleProfile(p)}
              >
                {isSelected && <CheckCircle2 className="mr-2 h-4 w-4" />}
                {p}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Qual o objetivo principal?</h3>
        <div className="grid grid-cols-1 gap-2">
          {availableGoals.map((g) => {
            const isSelected = goals.includes(g);
            return (
              <Button
                key={g}
                variant={isSelected ? "default" : "card"}
                className={isSelected ? "justify-center" : "justify-start"}
                onClick={() => toggleGoal(g)}
              >
                {isSelected && <CheckCircle2 className="mr-2 h-4 w-4" />}
                {g}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="h-24" />

      <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto space-y-2">
        {!user?.isAdmin && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Coins className="w-3 h-3" />
            Custo desta campanha: <strong>1 crédito</strong>
          </div>
        )}
        <Button 
          size="lg" 
          className="w-full shadow-xl bg-indigo-600 hover:bg-indigo-700" 
          onClick={handleGenerate}
          disabled={buyerProfiles.length === 0 || goals.length === 0 || isGenerating || (!user?.isAdmin && (user?.credits || 0) <= 0)}
        >
          {isGenerating ? "Criando Campanha..." : "Gerar Campanha"}
          {!isGenerating && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
