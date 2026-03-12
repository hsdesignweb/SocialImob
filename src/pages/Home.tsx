import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Rocket, History, Sparkles, CreditCard, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";

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
    <div className="space-y-10 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black tracking-widest uppercase border border-brand-primary/20"
          >
            SocialImob Pro
          </motion.span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight uppercase">
            Sua agência de bolso <br/>
            <span className="text-brand-secondary">inteligente.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-lg">
            Transforme qualquer imóvel em uma campanha de marketing de alto padrão em segundos.
          </p>
        </div>
        
        {!user?.isPaid && !user?.isAdmin && (
          <Button 
            variant="outline" 
            className="border-brand-secondary/30 bg-white text-brand-secondary hover:bg-brand-secondary hover:text-white font-black transition-all px-8 h-14 rounded-2xl shadow-sm"
            onClick={() => navigate('/payment')}
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Assinar Plano Boss
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="md:col-span-3"
        >
          <Button 
            size="lg" 
            className="w-full h-32 text-xl font-black shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-blue-700 flex flex-col items-center justify-center gap-2 rounded-[2rem] transition-all"
            onClick={handleNewCampaign}
          >
            <Plus className="h-8 w-8" />
            <span>Divulgar Novo Imóvel</span>
          </Button>
        </motion.div>

        <div className="relative group">
          <Button 
            variant="outline"
            size="lg" 
            className="w-full h-28 text-lg border-slate-100 bg-white text-slate-400 cursor-not-allowed transition-all rounded-[2rem] relative overflow-hidden shadow-sm"
            disabled
          >
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-6 h-6 mb-1 opacity-20" />
              <span className="font-black uppercase text-[10px] tracking-widest opacity-40">Gerar Imagens AI</span>
            </div>
          </Button>
          <span className="absolute top-4 right-4 px-2 py-1 bg-slate-100 text-slate-400 text-[8px] font-black rounded-lg uppercase tracking-widest border border-slate-200">Em breve</span>
        </div>

        <div className="relative group">
          <Button 
            variant="outline"
            size="lg" 
            className="w-full h-28 text-lg border-slate-100 bg-white text-slate-400 cursor-not-allowed transition-all rounded-[2rem] relative overflow-hidden shadow-sm"
            disabled
          >
            <div className="flex flex-col items-center gap-1">
              <FileText className="w-6 h-6 mb-1 opacity-20" />
              <span className="font-black uppercase text-[10px] tracking-widest opacity-40">Página de Venda</span>
            </div>
          </Button>
          <span className="absolute top-4 right-4 px-2 py-1 bg-slate-100 text-slate-400 text-[8px] font-black rounded-lg uppercase tracking-widest border border-slate-200">Em breve</span>
        </div>

        <div className="relative group">
          <Button 
            variant="outline"
            size="lg" 
            className="w-full h-28 text-lg border-slate-100 bg-white text-slate-400 cursor-not-allowed transition-all rounded-[2rem] relative overflow-hidden shadow-sm"
            disabled
          >
            <div className="flex flex-col items-center gap-1">
              <History className="w-6 h-6 mb-1 opacity-20" />
              <span className="font-black uppercase text-[10px] tracking-widest opacity-40">Histórico</span>
            </div>
          </Button>
          <span className="absolute top-4 right-4 px-2 py-1 bg-slate-100 text-slate-400 text-[8px] font-black rounded-lg uppercase tracking-widest border border-slate-200">Em breve</span>
        </div>
      </div>
    </div>
  );
}
