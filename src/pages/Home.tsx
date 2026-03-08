import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Rocket, History, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/context/AppContext";

export default function Home() {
  const navigate = useNavigate();
  const { setPropertyData, setCampaign, setStrategy } = useAppStore();

  const handleNewCampaign = () => {
    // Reset state
    setPropertyData({ description: '' });
    setCampaign(null as any);
    setStrategy(null as any);
    navigate('/input');
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
          SocialImob Pro
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Olá, Corretor</h1>
        <p className="text-slate-500">Vamos lançar seu próximo imóvel?</p>
      </div>

      <Button 
        size="lg" 
        className="w-full h-24 text-xl shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
        onClick={handleNewCampaign}
      >
        <Plus className="mr-2 h-6 w-6" />
        Seu Imóvel
      </Button>

      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">Dicas do Dia</h2>
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-yellow-400 mt-1 shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Vídeos verticais em alta</h3>
                <p className="text-sm text-slate-300">Imóveis com tours rápidos de 15s estão tendo 3x mais engajamento esta semana.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
