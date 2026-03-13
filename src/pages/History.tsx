import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/context/AppContext";
import { motion } from "motion/react";
import { History as HistoryIcon, Clock, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function History() {
  const navigate = useNavigate();
  const { history, loadFromHistory, setHistory } = useAppStore();

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('socialimob_history');
  };

  return (
    <div className="space-y-8 pt-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full text-slate-500 hover:bg-slate-100"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <HistoryIcon className="w-8 h-8 text-brand-primary" /> Histórico
            </h2>
            <p className="text-slate-500 font-medium">Suas últimas 3 campanhas geradas</p>
          </div>
        </div>

        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-400 hover:text-red-600 hover:bg-red-50 font-bold"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Limpar tudo
          </Button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => {
                  loadFromHistory(item);
                  navigate("/app/results");
                }}
                className="w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-brand-primary transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-secondary tracking-widest mb-4 relative z-10">
                  <Clock className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleDateString('pt-BR')} às {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div className="space-y-4 relative z-10">
                  <h3 className="text-xl font-black text-slate-900 line-clamp-2 group-hover:text-brand-primary transition-colors leading-tight">
                    {item.propertyData.type || "Imóvel"} em {item.propertyData.location || "Localização não informada"}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.propertyData.buyerProfile?.split(',').slice(0, 2).map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-50 text-slate-400 text-[8px] font-black rounded-lg tracking-widest border border-slate-100">
                        {p.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center text-brand-primary font-black text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver Estratégia <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center space-y-6 shadow-xl shadow-slate-200/50">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <HistoryIcon className="w-12 h-12 text-slate-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nenhuma campanha encontrada</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
              As campanhas que você gerar aparecerão aqui para consulta rápida.
            </p>
          </div>
          <Button 
            className="bg-brand-primary hover:bg-blue-700 text-white font-black px-8 h-12 rounded-2xl"
            onClick={() => navigate('/app/input')}
          >
            Começar agora
          </Button>
        </div>
      )}
    </div>
  );
}
