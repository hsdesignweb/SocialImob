import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/context/AppContext";
import { Mic, FileText, Link as LinkIcon, Upload, ArrowRight, StopCircle, X } from "lucide-react";
import { generateJSON } from "@/lib/gemini";
import { Type } from "@google/genai";

export default function InputStep() {
  const navigate = useNavigate();
  const { updatePropertyData, setIsLoading } = useAppStore();
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaData, setMediaData] = useState<{ mimeType: string; data: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setMediaData({
            mimeType: "audio/webm",
            data: base64data.split(",")[1],
          });
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setMediaData({
        mimeType: file.type,
        data: base64data.split(",")[1],
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    if (!inputText.trim() && !mediaData) return;

    setIsProcessing(true);
    setIsLoading(true);

    try {
      const prompt = `
        Analise o conteúdo fornecido (texto, áudio ou imagem/PDF) sobre um imóvel e extraia as informações principais.
        ${inputText ? `Texto complementar: "${inputText}"` : ""}
        
        Retorne um JSON com:
        - type: Tipo do imóvel (Casa, Apartamento, Terreno, etc)
        - location: Localização aproximada (Bairro, Cidade)
        - price: Valor (se houver)
        - features: Lista de características principais
        - missingInfo: Lista de informações cruciais que estão faltando para uma boa venda
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          location: { type: Type.STRING },
          price: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      };

      const parts = mediaData ? [{ inlineData: mediaData }] : [];
      const extractedData = await generateJSON(prompt, schema, undefined, parts);

      updatePropertyData({
        description: inputText || "Conteúdo multimídia enviado",
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
        <p className="text-slate-500">Descreva, grave um áudio ou envie um arquivo.</p>
      </div>

      <div className="relative">
        <textarea
          className="w-full h-48 p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none text-base"
          placeholder="Ex: Apartamento 3 quartos no Jardins, reformado, vista livre, 2 vagas..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          {isRecording ? (
            <button 
              onClick={stopRecording}
              className="p-2 bg-red-100 rounded-full hover:bg-red-200 text-red-600 animate-pulse"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={startRecording}
              className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {mediaData && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-700">
          <span className="truncate max-w-[200px]">Arquivo anexado ({mediaData.mimeType})</span>
          <button onClick={() => setMediaData(null)} className="p-1 hover:bg-indigo-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <label className="cursor-pointer">
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <div className="flex flex-col h-20 gap-1 items-center justify-center text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors">
            <Upload className="w-5 h-5 mb-1" />
            PDF/Foto
          </div>
        </label>
        
        <Button variant="outline" className="flex flex-col h-20 gap-1 items-center justify-center text-xs" disabled>
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
          disabled={(!inputText.trim() && !mediaData) || isProcessing || isRecording}
        >
          {isProcessing ? "Analisando..." : "Continuar"}
          {!isProcessing && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}
