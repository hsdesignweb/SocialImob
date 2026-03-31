import { Button } from "@/components/ui/Button";
import { Plus, Rocket, History, Sparkles, CreditCard, FileText, Calendar, Image as ImageIcon, Camera, Megaphone, GraduationCap, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

const motivationalQuotes = [
  "Vender imóveis não é obra do acaso, é aplicar a verdadeira engenharia de vendas em cada atendimento.",
  "O sucesso na corretagem exige o olho do dono: atenção máxima desde a captação até a assinatura do contrato.",
  "Eleve a jornada de compra do seu cliente para o próximo nível e ele nunca mais esquecerá do seu nome.",
  "O mercado nunca esfria para quem tem a estratégia certa para atrair e aquecer os leads todos os dias.",
  "Não existe atalho para o sucesso, mas existe método para fechar mais negócios de forma previsível.",
  "Construa uma engenharia de receita sólida e veja a sua imobiliária prosperar em qualquer cenário econômico.",
  "Um corretor de alta performance domina a sua região atuando sempre com o olho do dono.",
  "Ajudar famílias a encontrar seu lar ideal é elevar a própria profissão para o próximo nível.",
  "Sorte é o que acontece quando a preparação encontra a oportunidade de uma visita agendada.",
  "O fechamento do mês é apenas o reflexo da engenharia de receita que você aplica na segunda-feira de manhã.",
  "Seja um exterminador de objeções: conheça o imóvel, o mercado e o seu cliente melhor do que ninguém.",
  "Antecipe as dúvidas e seja o exterminador das inseguranças na hora da decisão de compra.",
  "O atalho mais rápido para a venda é a confiança construída nos cinco primeiros minutos de conversa.",
  "Conhecimento de mercado é o único atalho seguro para bater todas as metas do trimestre.",
  "Elimine as barreiras do fechamento agindo como um verdadeiro exterminador de problemas.",
  "Transforme a complexidade de um financiamento em uma engenharia de vendas simples e clara para o comprador.",
  "A melhor engenharia de vendas não começa falando do imóvel, mas praticando a escuta ativa.",
  "O \"não\" de hoje é apenas o cliente pedindo mais informações para o \"sim\" de amanhã.",
  "Não espere o cliente perfeito cruzar a porta; crie a oportunidade perfeita com a carteira que você tem.",
  "Cada lead aquecido no WhatsApp é um passo mais perto da entrega das chaves.",
  "O cuidado com cada etapa do funil deve ter a precisão e o olho do dono.",
  "Não foque apenas em fechar uma venda, foque em abrir um relacionamento de longo prazo.",
  "A corretagem de excelência é baseada na transparência: entregue valor antes de pedir o fechamento.",
  "Sua maior comissão não cai na conta hoje, ela vem na próxima indicação de um cliente satisfeito.",
  "Imóveis são tijolos e concreto; lares são sonhos e memórias. Nós vendemos os dois.",
  "Quem domina a arte de aquecer leads nunca fica com a agenda de visitas vazia.",
  "O foco contínuo na jornada do cliente é o que constrói uma engenharia de receita previsível e escalável.",
  "Marketing imobiliário eficiente é aquele que não apenas atrai curiosos, mas educa e converte compradores.",
  "Cada visita a um imóvel é a chance de apresentar um novo roteiro de vida para o cliente.",
  "Leve a gestão da sua carteira de imóveis para o próximo nível com um atendimento absolutamente impecável."
];

export default function Home() {
  const navigate = useNavigate();
  const { setPropertyData, setCampaign, setStrategy } = useAppStore();
  const { user } = useAuth();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Pick a random quote on mount
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

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
        <p className="text-slate-500 font-medium text-lg md:text-xl">Como sua agência pode te ajudar hoje?</p>
      </motion.div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Button 1: Sim Academy */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-24 text-lg font-black border-2 border-brand-secondary/20 text-slate-900 bg-white hover:bg-brand-secondary/5 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 group"
            onClick={() => navigate('/app/lessons')}
          >
            <GraduationCap className="w-6 h-6 text-brand-secondary group-hover:scale-110 transition-transform" />
            Sim Academy
          </Button>
        </motion.div>

        {/* Button 2: Plannerimob */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-24 text-lg font-black border-2 border-brand-primary/20 text-slate-900 bg-white hover:bg-brand-primary/5 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 group"
            onClick={() => navigate('/app/planner')}
          >
            <Calendar className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform" />
            Plannerimob
          </Button>
        </motion.div>

        {/* Button 3: Estrategista de Conteúdo */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="lg" 
            className="w-full h-24 text-lg font-black bg-brand-primary hover:bg-blue-700 transition-all rounded-2xl shadow-xl shadow-brand-primary/20 flex flex-col items-center justify-center gap-2 group"
            onClick={handleNewCampaign}
          >
            <Rocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            Estrategista de Conteúdo
          </Button>
        </motion.div>

        {/* Button 4: SocialAds (Em breve) */}
        <div className="relative group">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-24 text-lg font-black border-none text-slate-400 bg-slate-100 rounded-2xl cursor-not-allowed flex flex-col items-center justify-center gap-2"
            disabled
          >
            <Megaphone className="w-6 h-6 opacity-50" />
            SocialAds
          </Button>
          <span className="absolute top-3 right-3 px-2 py-1 bg-white text-slate-400 text-[9px] font-black rounded-lg tracking-widest border border-slate-200 shadow-sm uppercase">Em breve</span>
        </div>

        {/* Button 5: Fotos profissionais (Em breve) */}
        <div className="relative group">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-24 text-lg font-black border-none text-slate-400 bg-slate-100 rounded-2xl cursor-not-allowed flex flex-col items-center justify-center gap-2"
            disabled
          >
            <Camera className="w-6 h-6 opacity-50" />
            Fotos profissionais
          </Button>
          <span className="absolute top-3 right-3 px-2 py-1 bg-white text-slate-400 text-[9px] font-black rounded-lg tracking-widest border border-slate-200 shadow-sm uppercase">Em breve</span>
        </div>

        {/* Button 6: Artes para Carrosseis (Em breve) */}
        <div className="relative group">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-24 text-lg font-black border-none text-slate-400 bg-slate-100 rounded-2xl cursor-not-allowed flex flex-col items-center justify-center gap-2"
            disabled
          >
            <ImageIcon className="w-6 h-6 opacity-50" />
            Artes para Carrosseis
          </Button>
          <span className="absolute top-3 right-3 px-2 py-1 bg-white text-slate-400 text-[9px] font-black rounded-lg tracking-widest border border-slate-200 shadow-sm uppercase">Em breve</span>
        </div>

        {/* Button 7: Gerador de Campanhas (Em breve) */}
        <div className="relative group">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-24 text-lg font-black border-none text-slate-400 bg-slate-100 rounded-2xl cursor-not-allowed flex flex-col items-center justify-center gap-2"
            disabled
          >
            <Sparkles className="w-6 h-6 opacity-50" />
            Gerador de Campanhas
          </Button>
          <span className="absolute top-3 right-3 px-2 py-1 bg-white text-slate-400 text-[9px] font-black rounded-lg tracking-widest border border-slate-200 shadow-sm uppercase">Em breve</span>
        </div>

      </div>

      {/* Motivational Quote */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-16 max-w-3xl mx-auto text-center"
      >
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] bg-gradient-to-b from-slate-50 to-white border border-slate-100 shadow-sm">
          <Quote className="w-8 h-8 text-brand-primary/20" />
          <p className="text-lg md:text-xl font-medium text-slate-600 italic leading-relaxed">
            "{quote}"
          </p>
        </div>
      </motion.div>
    </div>
  );
}
