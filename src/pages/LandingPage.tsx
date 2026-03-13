import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { 
  Rocket, 
  CheckCircle, 
  Sparkles, 
  Target, 
  Zap, 
  ArrowRight, 
  MessageSquare, 
  Layout, 
  ShieldCheck,
  Star,
  Users,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="w-6 h-6 text-brand-primary" />,
      title: "Estratégia de Venda",
      description: "Ângulos de venda e personas definidas por IA para cada imóvel."
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-primary" />,
      title: "Roteiros de Reels",
      description: "Roteiros virais com ganchos magnéticos e CTAs persuasivas."
    },
    {
      icon: <Layout className="w-6 h-6 text-brand-primary" />,
      title: "Planner de 7 Dias",
      description: "Planejamento completo de conteúdo para uma semana inteira."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-brand-primary" />,
      title: "Funil de WhatsApp",
      description: "Scripts de abordagem, follow-up e fechamento humanizados."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-brand-primary" />,
      title: "Multiplicador 10x",
      description: "Uma única ideia transformada em 10 formatos de conteúdo diferentes."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-primary" />,
      title: "Validação Inteligente",
      description: "Nossa IA analisa se o imóvel é real e relevante antes de gerar."
    }
  ];

  const testimonials = [
    {
      name: "Ricardo Silva",
      role: "Corretor de Luxo",
      content: "O SocialImob Pro mudou meu jogo. Agora gasto 5 minutos para planejar o marketing de uma mansão.",
      avatar: "https://picsum.photos/seed/ricardo/100/100"
    },
    {
      name: "Ana Paula",
      role: "Imobiliária Prime",
      content: "A metodologia 1 ideia -> 10 conteúdos é genial. Minhas redes sociais nunca estiveram tão ativas.",
      avatar: "https://picsum.photos/seed/ana/100/100"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20">
              S
            </div>
            <span className="text-xl font-black tracking-tighter">SocialImob <span className="text-brand-primary">Pro</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors tracking-widest">Recursos</a>
            <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors tracking-widest">Preço</a>
            <Link to={isAuthenticated ? "/app" : "/login"} className="text-sm font-black text-slate-900 hover:text-brand-primary transition-colors tracking-widest">
              {isAuthenticated ? "Entrar no App" : "Login"}
            </Link>
            <Button 
              onClick={() => navigate("/register")}
              className="bg-brand-primary hover:bg-blue-700 text-white px-8 rounded-full font-black tracking-widest text-xs h-12"
            >
              Começar agora
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/login")}
            >
              <Users className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] max-w-5xl mx-auto"
          >
            Venda imóveis com <span className="text-brand-primary">estratégia</span> de cinema.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Transforme um simples link ou descrição em uma campanha completa de marketing imobiliário em segundos. Reels, Planners, Funis e muito mais.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8"
          >
            <Button 
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/app" : "/register")}
              className="w-full md:w-auto h-16 px-12 bg-brand-primary hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-brand-primary/30 transition-all hover:scale-105 active:scale-95 group"
            >
              {isAuthenticated ? "Voltar ao painel" : "Quero vender mais"}
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm font-bold text-slate-400 tracking-widest">
              Assinatura mensal • R$ 97/mês
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Metodologia SocialImob Pro</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Tudo o que você precisa para dominar o mercado imobiliário digital em um só lugar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-brand-primary/30 transition-all group"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-primary/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Junte-se a centenas de <span className="text-brand-primary">corretores elite</span>.
            </h2>
            <div className="space-y-8">
              {testimonials.map((t, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100" referrerPolicy="no-referrer" />
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-lg font-medium text-slate-600 italic">"{t.content}"</p>
                    <div>
                      <p className="font-black text-slate-900 tracking-widest text-xs">{t.name}</p>
                      <p className="text-[10px] font-bold text-brand-primary tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-brand-primary rounded-[3rem] rotate-3 absolute inset-0 opacity-10" />
            <div className="aspect-square bg-white border border-slate-100 rounded-[3rem] relative z-10 p-12 flex flex-col justify-center items-center text-center space-y-8 shadow-2xl">
              <div className="w-24 h-24 bg-brand-primary/10 rounded-3xl flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-brand-primary" />
              </div>
              <div className="space-y-2">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">+500k</span>
                <p className="text-slate-500 font-black tracking-widest text-xs">Campanhas geradas</p>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="space-y-2">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">98%</span>
                <p className="text-slate-500 font-black tracking-widest text-xs">Taxa de satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-brand-primary">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="p-12 md:p-16 flex-1 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-brand-primary tracking-[0.3em]">Plano Profissional</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Acesso ilimitado</h2>
            </div>
            <ul className="space-y-4">
              {[
                "100 Créditos de geração por mês",
                "Metodologia 1 Ideia -> 10 Conteúdos",
                "Roteiros de Reels Virais",
                "Funis de WhatsApp Completos",
                "Planner Semanal Estratégico",
                "Suporte Prioritário"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-600 font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 p-12 md:p-16 md:w-80 flex flex-col justify-center items-center text-center border-l border-slate-100">
            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-400 tracking-widest">Apenas</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-black text-slate-900">R$</span>
                <span className="text-7xl font-black text-slate-900 tracking-tighter">97</span>
              </div>
              <span className="text-sm font-bold text-slate-400 tracking-widest">/mês</span>
            </div>
            <Button 
              onClick={() => navigate(isAuthenticated ? "/app" : "/register")}
              className="w-full mt-10 h-16 bg-brand-primary hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
            >
              {isAuthenticated ? "Acessar painel" : "Assinar agora"}
            </Button>
            <p className="mt-6 text-[10px] font-black text-slate-400 tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Pagamento seguro
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span className="text-lg font-black tracking-tighter">SocialImob <span className="text-brand-primary">Pro</span></span>
          </div>
          <p className="text-sm font-medium text-slate-400">© 2024 SocialImob Pro. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-brand-primary tracking-widest">Termos</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-brand-primary tracking-widest">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
