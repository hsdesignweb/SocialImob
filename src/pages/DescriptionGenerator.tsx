import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Sparkles, AlertCircle, Copy, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { generateContent } from '@/lib/gemini';

type Destination = 'portal' | 'whatsapp' | 'trafego' | 'legenda';

const DESTINATIONS: { id: Destination; label: string; description: string }[] = [
  { id: 'portal', label: 'Portal Imobiliário', description: 'Descrição completa e otimizada para SEO (Zap, Viva Real, etc).' },
  { id: 'whatsapp', label: 'WhatsApp', description: 'Mensagem persuasiva, direta e com gatilhos mentais.' },
  { id: 'trafego', label: 'Tráfego Pago', description: 'Copy focada em conversão para anúncios (Facebook/Instagram Ads).' },
  { id: 'legenda', label: 'Legenda (Redes Sociais)', description: 'Texto engajador para Instagram, Facebook ou TikTok.' },
];

const COST_PER_GENERATION = 10;

export default function DescriptionGenerator() {
  const { user, consumeCredit } = useAuth();
  const [formData, setFormData] = useState({
    propertyType: '',
    location: '',
    area: '',
    bedrooms: '',
    parking: '',
    price: '',
    differentials: '',
    additionalDetails: ''
  });
  const [destination, setDestination] = useState<Destination>('portal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildPropertyInfo = () => {
    const parts = [];
    if (formData.propertyType) parts.push(`Tipo de Imóvel: ${formData.propertyType}`);
    if (formData.location) parts.push(`Localização/Bairro: ${formData.location}`);
    if (formData.area) parts.push(`Metragem: ${formData.area}`);
    if (formData.bedrooms) parts.push(`Quartos/Suítes: ${formData.bedrooms}`);
    if (formData.parking) parts.push(`Vagas: ${formData.parking}`);
    if (formData.price) parts.push(`Valor: ${formData.price}`);
    if (formData.differentials) parts.push(`Diferenciais/Lazer: ${formData.differentials}`);
    if (formData.additionalDetails) parts.push(`Detalhes Adicionais: ${formData.additionalDetails}`);
    return parts.join('\n');
  };

  const handleGenerate = async () => {
    const propertyInfo = buildPropertyInfo();
    
    if (!propertyInfo.trim()) {
      setError('Por favor, preencha pelo menos uma informação sobre o imóvel.');
      return;
    }

    if (!user?.isAdmin && (user?.credits || 0) < COST_PER_GENERATION) {
      setError(`Você precisa de ${COST_PER_GENERATION} créditos para gerar uma descrição.`);
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedDescription('');

    try {
      // Consume credits first
      if (!user?.isAdmin) {
        const success = await consumeCredit(COST_PER_GENERATION);
        if (!success) {
          throw new Error('Falha ao consumir créditos. Tente novamente.');
        }
      }

      const systemInstruction = `Você é um copywriter especialista em mercado imobiliário de alto padrão. Seu objetivo é criar textos persuasivos que vendem imóveis.`;
      
      let formatInstruction = '';
      switch (destination) {
        case 'portal':
          formatInstruction = 'Crie uma descrição completa e detalhada para portais imobiliários (como Zap, Viva Real). Use bullet points para características, destaque os diferenciais, inclua uma chamada para ação (CTA) clara e otimize para SEO com palavras-chave relevantes.';
          break;
        case 'whatsapp':
          formatInstruction = 'Crie uma mensagem persuasiva e direta para enviar pelo WhatsApp. Use emojis com moderação, crie senso de urgência ou exclusividade, e termine com uma pergunta aberta para incentivar a resposta do cliente.';
          break;
        case 'trafego':
          formatInstruction = 'Crie uma copy focada em conversão para anúncios de tráfego pago (Facebook/Instagram Ads). Use o framework AIDA (Atenção, Interesse, Desejo, Ação). A copy deve ser impactante, focar nos benefícios (não apenas características) e ter um CTA forte.';
          break;
        case 'legenda':
          formatInstruction = 'Crie uma legenda engajadora para redes sociais (Instagram/Facebook). Use um gancho forte na primeira linha, conte uma breve história ou destaque o estilo de vida que o imóvel proporciona, use emojis e inclua hashtags relevantes no final.';
          break;
      }

      const prompt = `Com base nas informações abaixo, ${formatInstruction}\n\nINFORMAÇÕES DO IMÓVEL:\n${propertyInfo}`;

      const result = await generateContent(prompt, systemInstruction);
      setGeneratedDescription(result);

    } catch (err: any) {
      console.error('Error generating description:', err);
      setError(err.message || 'Ocorreu um erro ao gerar a descrição. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerador de Descrições</h1>
          <p className="text-slate-500">Crie copys persuasivas para diferentes canais em segundos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Detalhes do Imóvel</label>
              <p className="text-xs text-slate-500 mb-4">Preencha apenas o que for relevante. A IA usará essas informações para criar a copy.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Imóvel</label>
                  <input
                    type="text"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    placeholder="Ex: Apartamento, Casa, Sítio..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Localização / Bairro</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Vila Nova Conceição, SP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Metragem</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Ex: 120m²"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quartos e Suítes</label>
                  <input
                    type="text"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="Ex: 3 quartos, 1 suíte"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vagas de Garagem</label>
                  <input
                    type="text"
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    placeholder="Ex: 2 vagas cobertas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor do Imóvel</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Ex: R$ 850.000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Principais Diferenciais / Lazer</label>
                  <textarea
                    name="differentials"
                    value={formData.differentials}
                    onChange={handleChange}
                    placeholder="Ex: Varanda gourmet, piscina aquecida, vista livre, recém-reformado..."
                    className="w-full h-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detalhes Adicionais</label>
                  <textarea
                    name="additionalDetails"
                    value={formData.additionalDetails}
                    onChange={handleChange}
                    placeholder="Cole aqui qualquer outra informação extra (condomínio, IPTU, etc)."
                    className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Onde você vai usar essa descrição?</label>
              <div className="space-y-3">
                {DESTINATIONS.map((dest) => (
                  <label
                    key={dest.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      destination === dest.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="destination"
                      value={dest.id}
                      checked={destination === dest.id}
                      onChange={(e) => setDestination(e.target.value as Destination)}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div>
                      <p className={`font-bold text-sm ${destination === dest.id ? 'text-brand-primary' : 'text-slate-900'}`}>
                        {dest.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{dest.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !buildPropertyInfo().trim()}
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Descrição...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Descrição ({COST_PER_GENERATION} créditos)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Resultado</h2>
              {generatedDescription && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-y-auto min-h-[400px]">
              {generatedDescription ? (
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                  {generatedDescription}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p className="text-sm text-center max-w-[250px]">
                    Preencha os detalhes e clique em gerar para ver a mágica acontecer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
