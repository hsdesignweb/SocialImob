import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, CreditCard, ShieldCheck, AlertCircle, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Payment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic_monthly' | 'basic_yearly' | 'pro_monthly' | 'pro_yearly' | 'premium_monthly' | 'premium_yearly'>('pro_yearly');
  const { completePayment, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for payment status in URL query params (returned from Mercado Pago)
    const params = new URLSearchParams(location.search);
    const status = params.get('status'); // approved, pending, failure
    const paymentId = params.get('payment_id');
    const preapprovalId = params.get('preapproval_id');
    const reason = params.get('reason');
    const plan = params.get('plan') || 'monthly';

    if (status === 'approved' && paymentId) {
      handlePaymentSuccess(paymentId);
    } else if (status === 'approved' && preapprovalId) {
      // Handle subscription approval
      handlePaymentSuccess(preapprovalId);
    }

    if (reason === 'suspended') {
      setError("Sua conta foi suspensa pelo administrador.");
    } else if (reason === 'expired') {
      setError("Sua assinatura expirou. Renove para continuar acessando.");
    } else if (reason === 'trial_ended') {
      setError("Seus créditos gratuitos acabaram. Assine para continuar gerando campanhas.");
    } else if (reason === 'pending_payment') {
      setError("Sua conta está aguardando pagamento. Assine para liberar o acesso.");
    }
  }, [location]);

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsLoading(true);
    try {
      // Verify payment with backend
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_id: paymentId })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh user profile to get updated credits and status
        await completePayment(data.plan);
        
        // Send welcome email
        if (user?.email) {
          try {
            await fetch('/api/send-welcome', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name
              })
            });
          } catch (emailErr) {
            console.error("Failed to send welcome email", emailErr);
            // Don't block the user if email fails
          }
        }

        // Clear query params
        navigate('/app', { replace: true });
      } else {
        setError("Pagamento ainda não foi aprovado. Verifique o status no Mercado Pago.");
      }
    } catch (error) {
      console.error("Payment completion failed", error);
      setError("Erro ao confirmar pagamento. Entre em contato com o suporte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('active', true)
        .single();
        
      if (error || !data) {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: data.code, discount: data.discount_percent });
        setCouponCode('');
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setIsApplyingCoupon(false);
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
        body: JSON.stringify({
          user_email: user?.email,
          user_id: user?.id,
          return_url: `/payment?status=approved&plan=${selectedPlan}`,
          coupon_code: appliedCoupon?.code,
          plan: selectedPlan
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
    } catch (error: any) {
      console.error("Payment initiation failed", error);
      setError(error.message || "Erro ao conectar com Mercado Pago. Tente novamente.");
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
          <p className="text-slate-400 font-black tracking-widest text-xs">Processando pagamento...</p>
        </div>
      </div>
    );
  }

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = {
    basic: {
      name: 'PLANO BASIC',
      monthlyPrice: 29.90,
      yearlyPrice: 197.00,
      features: [
        'Acesso completo ao planner',
        'Aulas gratuitas',
        '500 créditos para testar recursos avançados'
      ],
      monthlyId: 'basic_monthly',
      yearlyId: 'basic_yearly'
    },
    pro: {
      name: 'PLANO PRO',
      monthlyPrice: 97.00,
      yearlyPrice: 797.00,
      features: [
        'Acesso completo ao planner',
        'Aulas gratuitas',
        'Análise completa de perfil',
        '10.000 créditos por mês'
      ],
      monthlyId: 'pro_monthly',
      yearlyId: 'pro_yearly'
    },
    premium: {
      name: 'PLANO PREMIUM',
      monthlyPrice: 197.00,
      yearlyPrice: 997.00,
      features: [
        'Acesso completo ao planner',
        'Aulas gratuitas',
        'Análise completa de perfil',
        'Acesso a conteúdos mensais exclusivos ao vivo',
        '50.000 créditos por mês'
      ],
      monthlyId: 'premium_monthly',
      yearlyId: 'premium_yearly'
    }
  };

  const getDiscountedPrice = (price: number) => {
    if (!appliedCoupon) return price;
    return Math.round(price * (1 - appliedCoupon.discount / 100) * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 blur-[80px] rounded-full" />
        
        <div className="bg-slate-50 p-10 text-center border-b border-slate-100 relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            {user?.status === 'suspended' ? 'Conta Suspensa' : 'Escolha seu Plano'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {user?.status === 'suspended' ? 'Sua conta foi suspensa pelo administrador.' : 'Libere seu acesso ao SocialImob Pro'}
          </p>
          
          {user?.status !== 'suspended' && (
            <div className="flex justify-center mt-8">
              <div className="bg-slate-200 p-1 rounded-full flex items-center relative">
                <div 
                  className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-full' : 'translate-x-0'}`}
                />
                <button
                  onClick={() => {
                    setBillingCycle('monthly');
                    if (selectedPlan.includes('yearly')) {
                      setSelectedPlan(selectedPlan.replace('yearly', 'monthly') as any);
                    }
                  }}
                  className={`relative z-10 px-6 py-2 text-sm font-bold transition-colors rounded-full ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => {
                    setBillingCycle('yearly');
                    if (selectedPlan.includes('monthly')) {
                      setSelectedPlan(selectedPlan.replace('monthly', 'yearly') as any);
                    }
                  }}
                  className={`relative z-10 px-6 py-2 text-sm font-bold transition-colors rounded-full flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Anual
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Economize</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 space-y-8 relative z-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl flex items-center gap-3 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {user?.status === 'suspended' ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-slate-600 font-medium">
                Sua conta encontra-se bloqueada no momento. Por favor, entre em contato com o suporte para mais informações.
              </p>
              <Button 
                onClick={() => window.location.href = 'mailto:suporte@socialimob.com'}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Contatar Suporte
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <div 
                  onClick={() => setSelectedPlan(billingCycle === 'monthly' ? plans.basic.monthlyId : plans.basic.yearlyId as any)}
                  className={`cursor-pointer transition-all duration-200 rounded-3xl border-2 p-6 flex flex-col ${
                    selectedPlan.includes('basic')
                      ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="mb-6">
                    <h3 className={`font-black tracking-widest text-sm ${selectedPlan.includes('basic') ? 'text-brand-primary' : 'text-slate-900'}`}>
                      {plans.basic.name}
                    </h3>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        R$ {getDiscountedPrice(billingCycle === 'monthly' ? plans.basic.monthlyPrice : plans.basic.yearlyPrice).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest block mt-1">
                        /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plans.basic.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                        <CheckCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Plan */}
                <div 
                  onClick={() => setSelectedPlan(billingCycle === 'monthly' ? plans.pro.monthlyId : plans.pro.yearlyId as any)}
                  className={`relative cursor-pointer transition-all duration-200 rounded-3xl border-2 p-6 flex flex-col ${
                    selectedPlan.includes('pro')
                      ? 'border-emerald-500 bg-emerald-50/30 shadow-lg shadow-emerald-500/10' 
                      : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                    Mais Popular
                  </div>
                  <div className="mb-6">
                    <h3 className={`font-black tracking-widest text-sm ${selectedPlan.includes('pro') ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {plans.pro.name}
                    </h3>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-emerald-600 tracking-tighter">
                        R$ {getDiscountedPrice(billingCycle === 'monthly' ? plans.pro.monthlyPrice : plans.pro.yearlyPrice).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest block mt-1">
                        /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plans.pro.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium Plan */}
                <div 
                  onClick={() => setSelectedPlan(billingCycle === 'monthly' ? plans.premium.monthlyId : plans.premium.yearlyId as any)}
                  className={`cursor-pointer transition-all duration-200 rounded-3xl border-2 p-6 flex flex-col ${
                    selectedPlan.includes('premium')
                      ? 'border-purple-500 bg-purple-50/30 shadow-lg shadow-purple-500/10' 
                      : 'border-slate-100 bg-slate-50 hover:border-purple-200'
                  }`}
                >
                  <div className="mb-6">
                    <h3 className={`font-black tracking-widest text-sm ${selectedPlan.includes('premium') ? 'text-purple-700' : 'text-slate-900'}`}>
                      {plans.premium.name}
                    </h3>
                    <div className="mt-4">
                      <span className="text-3xl font-black text-purple-600 tracking-tighter">
                        R$ {getDiscountedPrice(billingCycle === 'monthly' ? plans.premium.monthlyPrice : plans.premium.yearlyPrice).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest block mt-1">
                        /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plans.premium.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                        <CheckCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-3 pt-4 max-w-md mx-auto">
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-4">Possui cupom de desconto?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Tag className="h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm font-black tracking-widest transition-all uppercase"
                      disabled={!!appliedCoupon || isApplyingCoupon}
                    />
                  </div>
                  {!appliedCoupon ? (
                    <Button 
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 font-black tracking-widest text-xs"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setAppliedCoupon(null)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl px-6 font-black tracking-widest text-xs"
                    >
                      Remover
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-500 font-bold ml-4">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-emerald-500 font-bold ml-4">Cupom de {appliedCoupon.discount}% aplicado!</p>}
              </div>

          <div className="pt-6 border-t border-slate-100">
            <Button 
              onClick={handlePayment} 
              className="w-full bg-[#009EE3] hover:bg-[#008CC9] h-14 text-white font-black tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              Pagar com Mercado Pago
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-6 flex items-center justify-center gap-2 font-black tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Ambiente 100% seguro • PIX ou Cartão em até 12x
            </p>
          </div>
          </>
          )}

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[10px] font-black tracking-widest text-slate-400 hover:text-brand-primary transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
