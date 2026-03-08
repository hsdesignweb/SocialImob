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
  const [buyerProfile, setBuyerProfile] = useState(propertyData.buyerProfile || "");
  const [goal, setGoal] = useState(propertyData.goal || "");

  const profiles = [
    "Família com filhos",
    "Investidor",
    "Primeiro imóvel (Jovem/Casal)",
    "Alto Padrão / Luxo",
    "Aposentados"
  ];

  const goals = [
    "Vender rápido (Preço oportunidade)",
    "Gerar Leads qualificados",
    "Posicionamento de marca",
    "Testar mercado"
  ];

  const handleGenerate = async () => {
    if (!buyerProfile || !goal) return;

    // Check credits
    if (!user?.isAdmin && user?.credits !== undefined && user.credits <= 0) {
      setError("Você não possui créditos suficientes. Contate o administrador.");
      return;
    }

    updatePropertyData({ buyerProfile, goal });
    setIsGenerating(true);
    setIsLoading(true);
    setError(null);

    try {
      // Consume credit immediately before generation starts
      const creditConsumed = consumeCredit();
      if (!creditConsumed) {
        // If consumption failed, check if it's because of trial expiration
        if (user?.status === 'trial' && user.credits <= 0) {
           navigate('/payment?reason=trial_ended');
           return;
        }
        throw new Error("Erro ao processar créditos.");
      }
      // Execute everything in parallel to speed up the process
      // We pass the inputs (buyerProfile, goal) directly to content prompts instead of waiting for strategy output
      
      const strategyPrompt = `
        Atue como um estrategista de marketing imobiliário sênior.
        
        Dados do Imóvel:
        ${JSON.stringify(propertyData)}
        
        Perfil Comprador: ${buyerProfile}
        Objetivo: ${goal}
        
        Defina a estratégia de lançamento. Retorne JSON:
        - angle: Ângulo principal de venda (uma frase curta e impactante)
        - persona: Descrição detalhada da persona
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
        }
      };

      // Chunk A: Reel Script
      const reelPrompt = `
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Perfil Comprador: ${buyerProfile}
        Objetivo: ${goal}
        
        Gere um roteiro para Reel de 60s. Retorne JSON:
        - hook: Gancho (3s)
        - body: Desenvolvimento
        - cta: Chamada para ação
        - scenes: Sugestão visual de cenas
      `;
      const reelSchema = {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
          scenes: { type: Type.STRING }
        }
      };

      // Chunk B: Planner with Content (Merged)
      // We merge the derived content ideas directly into the 7-day planner
      const planPrompt = `
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Perfil Comprador: ${buyerProfile}
        Objetivo: ${goal}
        
        Gere um Planner de Conteúdo de 7 dias. Para cada dia, defina um tema específico e escreva o conteúdo (legenda/roteiro).
        
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
              }
            }
          }
        }
      };

      // Chunk C: Messages & Traffic
      const trafficPrompt = `
        Dados do Imóvel: ${JSON.stringify(propertyData)}
        Perfil Comprador: ${buyerProfile}
        Objetivo: ${goal}
        
        Gere:
        1. Mensagens de Funil (Topo, Meio, Fundo) para WhatsApp.
        2. Estratégia de Tráfego (Sugestão de criativos para Topo, Meio, Fundo e Segmentação).
        
        Retorne JSON:
        - funnelMessages: { top, middle, bottom }
        - traffic: { creatives: { top, middle, bottom }, segmentation }
      `;
      const trafficSchema = {
        type: Type.OBJECT,
        properties: {
          funnelMessages: {
            type: Type.OBJECT,
            properties: {
              top: { type: Type.STRING },
              middle: { type: Type.STRING },
              bottom: { type: Type.STRING }
            }
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
                }
              },
              segmentation: { type: Type.STRING }
            }
          }
        }
      };

      // Execute ALL requests in parallel with error handling
      const results = await Promise.allSettled([
        generateJSON(strategyPrompt, strategySchema),
        generateJSON(reelPrompt, reelSchema),
        generateJSON(planPrompt, planSchema),
        generateJSON(trafficPrompt, trafficSchema)
      ]);

      // Helper to get value or default
      const getValue = (result: PromiseSettledResult<any>, fallback: any) => 
        result.status === 'fulfilled' ? result.value : fallback;

      // Check if critical strategy failed
      if (results[0].status === 'rejected') {
        console.error("Strategy generation failed:", results[0].reason);
        throw new Error(`Falha ao gerar estratégia principal: ${results[0].reason?.message || "Erro desconhecido"}`);
      }

      const strategyData = results[0].value;
      const reelData = getValue(results[1], { hook: "Erro ao gerar", body: "Tente regenerar", cta: "...", scenes: "..." });
      const plannerData = getValue(results[2], { planner: [] });
      const trafficData = getValue(results[3], { 
        funnelMessages: { top: "", middle: "", bottom: "" }, 
        traffic: { creatives: { top: "", middle: "", bottom: "" }, segmentation: "" }
      });
      
      setStrategy(strategyData);
      
      // Combine results
      const contentData = {
        reelScript: reelData,
        derivedContent: [], // Deprecated/Merged into planner
        funnelMessages: trafficData.funnelMessages,
        planner: plannerData.planner || [],
        traffic: trafficData.traffic
      };
      
      setCampaign(contentData);

      // Show warning if partial failure
      if (results.some(r => r.status === 'rejected')) {
        setError("Alguns conteúdos não puderam ser gerados completamente, mas entregamos o que foi possível.");
        // Don't return, let it navigate
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
        <h3 className="font-semibold text-slate-900">Quem é o comprador ideal?</h3>
        <div className="grid grid-cols-1 gap-2">
          {profiles.map((p) => (
            <Button
              key={p}
              variant={buyerProfile === p ? "default" : "card"}
              className={buyerProfile === p ? "justify-center" : "justify-start"}
              onClick={() => setBuyerProfile(p)}
            >
              {buyerProfile === p && <CheckCircle2 className="mr-2 h-4 w-4" />}
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Qual o objetivo principal?</h3>
        <div className="grid grid-cols-1 gap-2">
          {goals.map((g) => (
            <Button
              key={g}
              variant={goal === g ? "default" : "card"}
              className={goal === g ? "justify-center" : "justify-start"}
              onClick={() => setGoal(g)}
            >
              {goal === g && <CheckCircle2 className="mr-2 h-4 w-4" />}
              {g}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-24" /> {/* Spacer */}

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
          disabled={!buyerProfile || !goal || isGenerating || (!user?.isAdmin && (user?.credits || 0) <= 0)}
        >
          {isGenerating ? "Criando Campanha..." : "Gerar Campanha"}
          {!isGenerating && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
