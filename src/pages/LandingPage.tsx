import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "motion/react";
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
  TrendingUp,
  Brain,
  Award,
  ChevronDown,
  Clock,
  Check,
  X,
  Instagram,
  MessageCircle,
  Play
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Marcos T.",
      role: "Corretor Autônomo",
      content: "Postei de manhã, tive 15 comentários à tarde e já agendei visitas para o dia seguinte. O resultado foi imediato!",
      avatar: "https://picsum.photos/seed/marcos/100/100"
    },
    {
      name: "Ana Paula R.",
      role: "Gestora Imobiliária",
      content: "Meus clientes acham que contratei uma agência de luxo. Meus conteúdos estão muito mais criativos e meu posicionamento mudou completamente.",
      avatar: "https://picsum.photos/seed/anapaula/100/100"
    },
    {
      name: "Juliano F.",
      role: "Aluno Elite",
      content: "O Hebert só faz produto bom, sou aluno desde o primeiro e-book e o SocialImob superou todas as expectativas.",
      avatar: "https://picsum.photos/seed/juliano/100/100"
    }
  ];

  const faq = [
    {
      q: "O texto não vai ficar robótico?",
      a: "Absolutamente não. Nossa IA foi treinada para replicar a linguagem humana e persuasiva da Engenharia de Vendas."
    },
    {
      q: "Serve para qualquer tipo de imóvel?",
      a: "Sim. De terrenos e lotes populares a coberturas de alto luxo e imóveis comerciais."
    },
    {
      q: "Preciso baixar algum programa?",
      a: "Não. O SocialImob é 100% online. Você acessa pelo celular ou computador de onde estiver."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white overflow-x-hidden selection:bg-brand-primary/30">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-secondary/20">
              S
            </div>
            <span className="text-xl font-black tracking-tighter">SocialImob</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#metodo" className="text-sm font-bold text-white/60 hover:text-brand-primary transition-colors tracking-widest uppercase">O Método</a>
            <a href="#depoimentos" className="text-sm font-bold text-white/60 hover:text-brand-primary transition-colors tracking-widest uppercase">Depoimentos</a>
            <a href="#precos" className="text-sm font-bold text-white/60 hover:text-brand-primary transition-colors tracking-widest uppercase">Preços</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to={isAuthenticated ? "/app" : "/login"} className="hidden md:block text-sm font-black text-white/80 hover:text-brand-primary transition-colors tracking-widest uppercase">
              {isAuthenticated ? "Entrar no App" : "Login"}
            </Link>
            <Button 
              onClick={() => navigate(isAuthenticated ? "/app" : "/register")}
              className="bg-brand-primary hover:bg-brand-primary/80 text-white px-8 rounded-xl font-black tracking-widest text-xs h-12 shadow-lg shadow-brand-primary/20"
            >
              Testar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-secondary/10 blur-[120px] rounded-full translate-y-1/2" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]"
            >
              O jeito mais rápido de transformar seus imóveis em conteúdo de <span className="text-brand-primary">alta conversão</span>.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Transforme as características técnicas do seu imóvel em narrativas que geram desejo e agendam visitas. Tenha a estratégia de marketing de uma grande imobiliária para cada imóvel da sua carteira em menos de 60 segundos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/app" : "/register")}
                className="h-20 px-12 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-2xl font-black text-xl shadow-2xl shadow-brand-primary/30 transition-all hover:scale-105 active:scale-95 group"
              >
                QUERO MEU ESTRATEGISTA DE BOLSO AGORA
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            {/* iPhone Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
              <div className="p-4 pt-10 space-y-4">
                <div className="w-12 h-12 bg-brand-secondary/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-brand-secondary" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                  <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                </div>
                <div className="aspect-[9/16] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/20" />
                </div>
                <div className="h-12 w-full bg-brand-primary rounded-xl" />
              </div>
            </motion.div>

            {/* Floating Icons */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -left-10 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
            >
              <Instagram className="w-8 h-8 text-pink-500" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-40 -right-10 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
            >
              <MessageCircle className="w-8 h-8 text-emerald-500" />
            </motion.div>

            <motion.div 
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-20 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl"
            >
              <TrendingUp className="w-8 h-8 text-brand-secondary" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pain Section */}
      <section className="py-32 px-6 bg-brand-dark/50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Pare de ser ignorado no Instagram</h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Nas redes sociais, você não pode ser apenas descritivo, você precisa ser atrativo. Hoje, o cliente "compra" o seu vídeo antes mesmo de decidir visitar o imóvel. Se o seu conteúdo não gera desejo imediato, você está perdendo dinheiro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Bloqueio Criativo", desc: "A frustração de encarar a tela em branco sem saber como começar um roteiro de Reels.", icon: <Brain className="w-8 h-8" /> },
              { title: "Post \"Fantasma\"", desc: "Legendas técnicas e frias que resultam em zero comentários e zero interessados.", icon: <Users className="w-8 h-8" /> },
              { title: "Falta de Tempo", desc: "O desgaste de tentar equilibrar as visitas, o atendimento e a edição de vídeos.", icon: <Clock className="w-8 h-8" /> }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 space-y-6 hover:bg-white/10 transition-colors">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
                <p className="text-white/60 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-black text-brand-primary italic">
              "O SocialImob nasceu para exterminar a panfletagem digital e devolver o seu tempo para o que realmente importa: o fechamento."
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="metodo" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Do link à campanha completa em segundos</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "A Input", title: "Descreva e Pronto", desc: "Basta descrever os pontos fortes do imóvel ou colar o link do anúncio já publicado.", icon: <Layout className="w-8 h-8" /> },
              { step: "A Inteligência", title: "Método 1/10", desc: "Nossa tecnologia processa as informações aplicando os gatilhos mentais da nossa metodologia exclusiva.", icon: <Brain className="w-8 h-8" /> },
              { step: "A Entrega", title: "Fechamento", desc: "Você recebe instantaneamente um Roteiro de Reels persuasivo, 10 formatos de posts para o feed e os scripts exatos de abordagem para o WhatsApp.", icon: <Rocket className="w-8 h-8" /> }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 space-y-6 relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-secondary rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                  {i + 1}
                </div>
                <div className="w-16 h-16 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <span className="text-brand-secondary font-black tracking-widest text-xs uppercase">{item.step}</span>
                  <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
                </div>
                <p className="text-white/60 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hebert Silva Section */}
      <section className="py-32 px-6 bg-brand-dark/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-brand-primary/10 rounded-[4rem] -rotate-3 blur-2xl" />
            <img 
              src="https://picsum.photos/seed/hebert/800/1000" 
              alt="Hebert Silva" 
              className="relative z-10 rounded-[3.5rem] shadow-2xl border-4 border-white/5 grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-brand-primary font-black tracking-[0.3em] text-xs uppercase">O Selo Hebert Silva</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                Não é apenas tecnologia. É o método de quem já formou 8.000 corretores de elite.
              </h2>
            </div>
            
            <div className="space-y-6 text-lg text-white/60 font-medium leading-relaxed">
              <p>
                O SocialImob não é uma ferramenta de IA genérica. Ela é a automação do cérebro de Hebert Silva, mentor com 19 anos de experiência e criador da metodologia Engenharia de Vendas.
              </p>
              <p>
                Tudo o que os mais de 8.000 alunos aplicam manualmente para dominar o mercado imobiliário e bater metas de VGV, agora está codificado para trabalhar por você 24 horas por dia.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "+8.000 ALUNOS", icon: <Users className="w-6 h-6" /> },
                { label: "AUTOR BIENAL DO LIVRO", icon: <Award className="w-6 h-6" /> },
                { label: "MÉTODOS VALIDADOS", icon: <ShieldCheck className="w-6 h-6" /> }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-brand-primary">{item.icon}</div>
                  <span className="text-[10px] font-black tracking-widest leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Depoimentos</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 space-y-6 relative">
                <div className="flex gap-1 text-brand-primary">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg font-medium text-white/80 italic leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-black tracking-tight">{t.name}</p>
                    <p className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-32 px-6 bg-brand-dark/30">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Por que o SocialImob...</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 px-4 text-left text-sm font-black text-white/40 uppercase tracking-widest">Característica</th>
                  <th className="py-6 px-4 text-center text-sm font-black text-white/40 uppercase tracking-widest">Fazer Sozinho</th>
                  <th className="py-6 px-4 text-center text-sm font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 rounded-t-3xl border-x border-t border-brand-primary/20">SocialImob</th>
                  <th className="py-6 px-4 text-center text-sm font-black text-white/40 uppercase tracking-widest">Agência de Marketing</th>
                </tr>
              </thead>
              <tbody className="text-white/60 font-medium">
                {[
                  { label: "Tempo gasto", a: "3 a 5 horas/dia", b: "60 segundos", c: "Dias de espera" },
                  { label: "Custo Mensal", a: "Stress e cansaço", b: "Menos de um café/dia", c: "R$ 2.500+" },
                  { label: "Estratégia", a: "Amadora", b: "Engenharia de Vendas", c: "Genérica" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-8 px-4 font-black text-white">{row.label}</td>
                    <td className="py-8 px-4 text-center">{row.a}</td>
                    <td className="py-8 px-4 text-center font-black text-brand-primary bg-brand-primary/5 border-x border-brand-primary/20 shadow-[inset_0_0_20px_rgba(197,160,89,0.05)]">{row.b}</td>
                    <td className="py-8 px-4 text-center">{row.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing & Offer */}
      <section id="precos" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Oferta Irresistível</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-12 border border-white/10 shadow-2xl space-y-10">
              <div className="space-y-2">
                <span className="text-brand-primary font-black tracking-[0.3em] text-xs uppercase">Plano Fundador</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter">R$ 97</span>
                  <span className="text-white/40 font-bold">/mês</span>
                </div>
                <p className="text-sm font-bold text-white/40 italic">ou R$ 397 no plano anual</p>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Acesso ilimitado à plataforma",
                  "Metodologia Engenharia de Vendas",
                  "Roteiros de Reels Virais",
                  "Scripts de WhatsApp",
                  "Suporte Prioritário"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/80 font-medium">
                    <Check className="w-5 h-5 text-brand-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => navigate(isAuthenticated ? "/app" : "/register")}
                className="w-full h-20 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-2xl font-black text-xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
              >
                QUERO FUNDADOR
              </Button>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black tracking-tight px-4">Ao garantir sua vaga, você recebe:</h3>
              <div className="grid gap-4">
                {[
                  { title: "Pacote de Artes", desc: "Modelos de imagens editáveis no Canva.", icon: <Layout className="w-6 h-6" /> },
                  { title: "Planner Imobiliário", desc: "365 ideias de conteúdos estratégicos.", icon: <Clock className="w-6 h-6" /> },
                  { title: "Análise de Perfil", desc: "Insights para transformar sua bio.", icon: <Users className="w-6 h-6" /> }
                ].map((bonus, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex gap-6 items-center group hover:bg-white/10 transition-colors">
                    <div className="w-14 h-14 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">
                      {bonus.icon}
                    </div>
                    <div>
                      <h4 className="font-black tracking-tight">{bonus.title}</h4>
                      <p className="text-white/40 text-sm font-medium">{bonus.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-32 px-6 bg-brand-dark/50">
        <div className="max-w-4xl mx-auto text-center space-y-10 p-16 bg-white/5 backdrop-blur-xl rounded-[4rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
          <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-12 h-12 text-brand-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tighter">
              Garantia Incondicional "Engenharia de Vendas"
            </h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed">
              Eu tiro o peso da decisão das suas costas. Se você utilizar a ferramenta e não sentir que tem um estrategista profissional trabalhando para você, eu devolvo 100% do seu investimento. Sem perguntas, sem burocracia. O risco é todo meu.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-brand-secondary">Perguntas Frequentes</h2>
          </div>
          
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                >
                  <span className="text-lg font-black tracking-tight">{item.q}</span>
                  <ChevronDown className={`w-6 h-6 text-white/20 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 text-white/60 font-medium leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 border-t border-white/5 bg-brand-dark">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-10">
          <h2 className="text-4xl font-black tracking-tighter">Pronto para mudar de nível?</h2>
          <Button 
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/app" : "/register")}
            className="h-20 px-16 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-2xl font-black text-xl shadow-2xl shadow-brand-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            QUERO MEU ESTRATEGISTA AGORA
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-center w-full pt-10 border-t border-white/5 gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center text-white font-black text-lg">
                S
              </div>
              <span className="text-lg font-black tracking-tighter">SocialImob</span>
            </div>
            <p className="text-sm font-medium text-white/20">© 2024 SocialImob Pro. Todos os direitos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="text-xs font-bold text-white/20 hover:text-brand-primary tracking-widest uppercase">Termos</a>
              <a href="#" className="text-xs font-bold text-white/20 hover:text-brand-primary tracking-widest uppercase">Privacidade</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
