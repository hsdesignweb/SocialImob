import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, CreditCard, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Payment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { completePayment, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for payment status in URL query params (returned from Mercado Pago)
    const params = new URLSearchParams(location.search);
    const status = params.get('status'); // approved, pending, failure
    const paymentId = params.get('payment_id');
    const reason = params.get('reason');

    if (status === 'approved' && paymentId) {
      handlePaymentSuccess();
    }

    if (reason === 'suspended') {
      setError("Sua assinatura expirou. Renove para continuar acessando.");
    } else if (reason === 'trial_ended') {
      setError("Seus créditos gratuitos acabaram. Assine para continuar gerando campanhas.");
    }
  }, [location]);

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    try {
      await completePayment();
      // Clear query params
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Payment completion failed", error);
      setError("Erro ao confirmar pagamento. Entre em contato com o suporte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call our backend to create a preference
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full" />
            <Loader2 className="w-16 h-16 animate-spin text-brand-primary mx-auto relative z-10" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Processando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 blur-[80px] rounded-full" />
        
        <div className="bg-slate-50 p-10 text-center border-b border-slate-100 relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            {user?.status === 'suspended' ? 'Renovar Assinatura' : 
             user?.status === 'trial' ? 'Acesso Pro' : 'Finalize sua Assinatura'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {user?.status === 'suspended' ? 'Reative seu acesso ao SocialImob Pro' : 
             user?.status === 'trial' ? 'Desbloqueie acesso ilimitado e recursos PRO' : 'Libere seu acesso ao SocialImob Pro'}
          </p>
        </div>

        <div className="p-10 space-y-8 relative z-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl flex items-center gap-3 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Plano Mensal</h3>
                <p className="text-xs text-slate-500 font-medium">100 Créditos / mês</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">R$ 97</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">/mês</span>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                </div>
                Geração de campanhas ilimitada
              </li>
              <li className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                </div>
                Inteligência Artificial avançada
              </li>
              <li className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                </div>
                Suporte prioritário
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Button 
              onClick={handlePayment} 
              className="w-full bg-[#009EE3] hover:bg-[#008CC9] h-14 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Pagar com Mercado Pago
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-6 flex items-center justify-center gap-2 font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Ambiente 100% seguro
            </p>
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" /> Voltar para o Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
