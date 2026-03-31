import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ChevronDown, FileText } from 'lucide-react';
import { adExamples, adCategories } from '@/data/adExamples';

export default function AdExamples() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const filteredAds = selectedCategory 
    ? adExamples.filter(ad => ad.category === selectedCategory)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Exemplos de Anúncios</h1>
          <p className="text-slate-500 mt-1">Selecione o tipo de imóvel para ver os anúncios prontos.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <label htmlFor="category-select" className="block text-sm font-bold text-slate-700 mb-3">
          Qual tipo de imóvel você quer anunciar?
        </label>
        <div className="relative">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium cursor-pointer"
          >
            <option value="" disabled>Selecione uma categoria...</option>
            {adCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-slate-900 leading-tight">{ad.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 whitespace-nowrap">
                    {ad.category}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                  {ad.content}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => handleCopy(ad.content, ad.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    copiedId === ad.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-primary hover:text-brand-primary shadow-sm'
                  }`}
                >
                  {copiedId === ad.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Texto
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma categoria selecionada</h3>
          <p className="text-slate-500">Escolha um tipo de imóvel acima para ver os exemplos de anúncios.</p>
        </div>
      )}
    </div>
  );
}
