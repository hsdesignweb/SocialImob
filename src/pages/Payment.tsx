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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-600 font-medium">Processando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">
            {user?.status === 'suspended' ? 'Renovar Assinatura' : 
             user?.status === 'trial' ? 'Assine o SocialImob Pro' : 'Finalize sua Assinatura'}
          </h1>
          <p className="text-indigo-100">
            {user?.status === 'suspended' ? 'Reative seu acesso ao SocialImob Pro' : 
             user?.status === 'trial' ? 'Desbloqueie acesso ilimitado e recursos PRO' : 'Libere seu acesso ao SocialImob Pro'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900">Plano Mensal</h3>
                <p className="text-sm text-slate-500">100 Créditos / mês</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900">R$ 97</span>
                <span className="text-xs text-slate-500 block">/mês</span>
              </div>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                Geração de campanhas ilimitada (até 100 créditos)
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                Inteligência Artificial avançada (Gemini 2.0)
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                Suporte prioritário
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button 
              onClick={handlePayment} 
              className="w-full bg-[#009EE3] hover:bg-[#008CC9] h-12 text-lg shadow-lg shadow-blue-500/20 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Pagar com Mercado Pago
            </Button>
            <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Ambiente seguro
            </p>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto"
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
