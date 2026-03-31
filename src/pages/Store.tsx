import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loader2, CreditCard, ShieldCheck, ShoppingCart, Sparkles, CheckCircle } from 'lucide-react';

export default function Store() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, completePayment } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const pkg = params.get('package');
    const paymentId = params.get('payment_id');

    const verifyPayment = async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payment_id: id })
        });

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const data = await response.json();
        if (data.success) {
          await completePayment(data.plan);
          setSuccess('Pagamento aprovado! Seus créditos foram adicionados com sucesso.');
        } else {
          setError('Pagamento ainda não foi aprovado. Verifique o status no Mercado Pago.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Erro ao confirmar pagamento. Mas não se preocupe, se foi aprovado seus créditos entrarão em breve.');
      } finally {
        setIsLoading(false);
        navigate('/app/store', { replace: true });
      }
    };

    if (paymentId && status === 'approved') {
      verifyPayment(paymentId);
    } else if (status === 'approved') {
      setSuccess('Pagamento aprovado! Seus créditos serão adicionados em instantes.');
      navigate('/app/store', { replace: true });
    } else if (status === 'failure') {
      setError('Ocorreu um erro no pagamento. Tente novamente.');
      navigate('/app/store', { replace: true });
    }
  }, [location, navigate]);

  const handlePurchase = async (packageId: string, price: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call our backend to create a preference for credits
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user?.email,
          user_id: user?.id,
          return_url: `/app/store?status=approved&package=${packageId}`,
          plan: packageId, // Reusing the plan field for package ID
          is_credits: true,
          price: price
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao iniciar pagamento');
      }

      const data = await response.json();
      
      if (data.init_point) {
        // Redirect to Mercado Pago Checkout
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não gerado');
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      setError("Erro ao conectar com Mercado Pago. Tente novamente.");
      setIsLoading(false);
    }
  };

  const creditPackages = [
    {
      id: 'credits_10',
      title: 'Kit Básico',
      credits: 10,
      price: 29.90,
      popular: false,
    },
    {
      id: 'credits_50',
      title: 'Kit Profissional',
      credits: 50,
      price: 97.00,
      popular: true,
      savings: 'Economize 35%'
    },
    {
      id: 'credits_150',
      title: 'Kit Agência',
      credits: 150,
      price: 197.00,
      popular: false,
      savings: 'Economize 56%'
    }
  ];

  return (
    <div className="space-y-10 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Loja de Créditos</h1>
          <p className="text-slate-500 font-medium">Adquira mais créditos para impulsionar suas campanhas.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Seu Saldo</p>
            <p className="text-xl font-black text-slate-900 leading-none">{user?.credits || 0} <span className="text-sm text-slate-500 font-medium">créditos</span></p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl flex items-center gap-3 font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm p-4 rounded-2xl flex items-center gap-3 font-bold">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {creditPackages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`relative bg-white rounded-[2.5rem] border-2 p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
              pkg.popular 
                ? 'border-brand-primary shadow-2xl shadow-brand-primary/20' 
                : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:border-slate-200'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-1 shadow-lg shadow-brand-primary/30">
                <Sparkles className="w-3 h-3" />
                Mais Escolhido
              </div>
            )}
            
            <div className="text-center mb-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{pkg.title}</h3>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{pkg.credits}</span>
                <span className="text-sm font-bold text-slate-400 flex flex-col items-start leading-tight">
                  <span>créditos</span>
                </span>
              </div>
              {pkg.savings && (
                <p className="text-xs font-bold text-emerald-500 mt-2 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                  {pkg.savings}
                </p>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="text-center mb-6">
                <span className="text-sm font-black text-slate-400">R$</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter ml-1">
                  {pkg.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <Button 
                onClick={() => handlePurchase(pkg.id, pkg.price)}
                disabled={isLoading}
                className={`w-full h-14 font-black tracking-widest rounded-2xl transition-all active:scale-[0.98] ${
                  pkg.popular
                    ? 'bg-brand-primary hover:bg-blue-700 text-white shadow-lg shadow-brand-primary/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Comprar Agora
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-2 font-black tracking-widest uppercase">
          <ShieldCheck className="w-4 h-4" />
          Pagamento seguro via Mercado Pago • Liberação imediata
        </p>
      </div>
    </div>
  );
}
