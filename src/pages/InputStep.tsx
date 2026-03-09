import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/context/AppContext";
import { FileText, Link as LinkIcon, ArrowRight } from "lucide-react";
import { generateJSON } from "@/lib/gemini";
import { Type } from "@google/genai";

export default function InputStep() {
  const navigate = useNavigate();
  const { updatePropertyData, setIsLoading } = useAppStore();
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `
        Analise o conteúdo fornecido (texto ou LINK) sobre um imóvel e extraia as informações principais.
        
        REGRA CRUCIAL:
        Verifique se o conteúdo é REALMENTE sobre um imóvel (casa, apartamento, terreno, etc) para venda ou aluguel.
        Se o conteúdo NÃO for sobre um imóvel (ex: notícias genéricas, outros produtos, texto aleatório, ou algo que não tenha relação com o mercado imobiliário), defina a propriedade "isValidProperty" como FALSE.
        
        Se houver um link, acesse o conteúdo para garantir que as informações são reais e precisas.
        ${inputText ? `Conteúdo fornecido: "${inputText}"` : ""}
        
        Retorne um JSON com:
        - isValidProperty: boolean (TRUE se for imóvel, FALSE caso contrário)
        - type: Tipo do imóvel (Casa, Apartamento, Terreno, etc)
        - location: Localização aproximada (Bairro, Cidade)
        - price: Valor (se houver)
        - features: Lista de características principais
        - missingInfo: Lista de informações cruciais que estão faltando para uma boa venda
        - errorMessage: String (Se isValidProperty for FALSE, explique educadamente por que o conteúdo não é válido para o sistema SocialImob Pro)
      `;

      const schema = {
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

      const extractedData = await generateJSON(prompt, schema);

      if (!extractedData.isValidProperty) {
        setError(extractedData.errorMessage || "O conteúdo enviado não possui relação com o mercado imobiliário. Por favor, forneça informações de um imóvel para prosseguir.");
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }

      updatePropertyData({
        description: inputText,
        ...extractedData
      });

      navigate("/refinement");
    } catch (error) {
      console.error("Error extracting data:", error);
      updatePropertyData({ description: inputText || "Erro na análise automática." });
      navigate("/refinement");
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">O que vamos vender?</h2>
        <p className="text-slate-500">Descreva o imóvel ou cole um link.</p>
      </div>

      <div className="relative">
        <textarea
          className={`w-full h-48 p-4 rounded-2xl border ${error ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none text-base transition-all`}
          placeholder="Ex: Apartamento 3 quartos no Jardins, reformado, vista livre, 2 vagas..."
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (error) setError(null);
          }}
        />
        {error && (
          <div className="mt-2 p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
            <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 font-bold">!</div>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex flex-col h-20 gap-1 items-center justify-center text-xs" onClick={() => {
          const url = prompt("Cole o link do imóvel:");
          if (url) setInputText(prev => prev + " " + url);
        }}>
          <LinkIcon className="w-5 h-5 mb-1" />
          Link
        </Button>
        <Button variant="outline" className="flex flex-col h-20 gap-1 items-center justify-center text-xs" onClick={() => navigator.clipboard.readText().then(t => setInputText(prev => prev + " " + t))}>
          <FileText className="w-5 h-5 mb-1" />
          Colar
        </Button>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto">
        <Button 
          size="lg" 
          className="w-full shadow-xl" 
          onClick={handleNext}
          disabled={!inputText.trim() || isProcessing}
        >
          {isProcessing ? "Analisando..." : "Continuar"}
          {!isProcessing && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
