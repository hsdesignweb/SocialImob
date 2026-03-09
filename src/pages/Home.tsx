import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Rocket, History, Sparkles, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { setPropertyData, setCampaign, setStrategy } = useAppStore();
  const { user } = useAuth();

  const handleNewCampaign = () => {
    // Reset state
    setPropertyData({ description: '' });
    setCampaign(null as any);
    setStrategy(null as any);
    navigate('/input');
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
            SocialImob Pro
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Seja bem vindo ao SocialImob Pro, sua agência de bolso.</h1>
          <p className="text-slate-500 text-sm">Vamos lançar seu próximo imóvel?</p>
        </div>
        
        {!user?.isPaid && !user?.isAdmin && (
          <Button 
            variant="outline" 
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-bold"
            onClick={() => navigate('/payment')}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Assinar agora
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Button 
          size="lg" 
          className="w-full h-20 text-lg shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 flex flex-col items-center justify-center gap-0"
          onClick={handleNewCampaign}
        >
          <Plus className="h-5 w-5 mb-1" />
          <span>Divulgar Imóvel nas Redes Sociais</span>
        </Button>

        <div className="relative group">
          <Button 
            variant="outline"
            size="lg" 
            className="w-full h-20 text-lg border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
            disabled
          >
            Gerar imagens
          </Button>
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">Em breve</span>
        </div>

        <div className="relative group">
          <Button 
            variant="outline"
            size="lg" 
            className="w-full h-20 text-lg border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
            disabled
          >
            Gerar Página de Venda
          </Button>
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">Em breve</span>
        </div>
      </div>
    </div>
  );
}
