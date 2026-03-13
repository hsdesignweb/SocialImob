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
    navigate('/app/input');
  };

  return (
    <div className="space-y-12 pt-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
          Olá, {user?.name?.split(' ')[0] || "Corretor"}
        </h1>
        <p className="text-slate-500 font-medium text-lg md:text-xl">O que vamos vender hoje?</p>
      </motion.div>

      {/* Main Actions */}
      <div className="grid gap-8">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button 
            size="lg" 
            className="w-full h-14 md:h-16 text-lg md:text-xl font-black bg-brand-primary hover:bg-blue-700 transition-all rounded-2xl shadow-xl shadow-brand-primary/20 group"
            onClick={handleNewCampaign}
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 mr-3 group-hover:rotate-90 transition-transform" />
            Divulgar novo imóvel
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative group">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-16 md:h-20 text-base md:text-lg font-black border-none text-white bg-slate-500 rounded-2xl cursor-not-allowed"
              disabled
            >
              <div className="flex items-center gap-4">
                <Sparkles className="w-5 h-5" />
                Gerar imagens
              </div>
            </Button>
            <span className="absolute top-1/2 -translate-y-1/2 right-6 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl tracking-widest border border-slate-100">Em breve</span>
          </div>

          <div className="relative group">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-16 md:h-20 text-base md:text-lg font-black border-none text-white bg-slate-500 rounded-2xl cursor-not-allowed"
              disabled
            >
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5" />
                Página de venda
              </div>
            </Button>
            <span className="absolute top-1/2 -translate-y-1/2 right-6 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl tracking-widest border border-slate-100">Em breve</span>
          </div>
        </div>
      </div>
    </div>
  );
}
