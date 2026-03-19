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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
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

    if (status === 'approved' || preapprovalId) {
      handlePaymentSuccess(plan);
    }

    if (reason === 'suspended') {
      setError("Sua assinatura expirou. Renove para continuar acessando.");
    } else if (reason === 'trial_ended') {
      setError("Seus créditos gratuitos acabaram. Assine para continuar gerando campanhas.");
    }
  }, [location]);

  const handlePaymentSuccess = async (plan: string) => {
    setIsLoading(true);
    try {
      await completePayment(plan);
      
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
          <p className="text-slate-400 font-black tracking-widest text-xs">Processando pagamento...</p>
        </div>
      </div>
    );
  }

  const monthlyPrice = 97;
  const yearlyPrice = 698.40;
  
  const getDiscountedPrice = (price: number) => {
    if (!appliedCoupon) return price;
    return Math.round(price * (1 - appliedCoupon.discount / 100) * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 blur-[80px] rounded-full" />
        
        <div className="bg-slate-50 p-10 text-center border-b border-slate-100 relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            {user?.status === 'suspended' ? 'Renovar Assinatura' : 'Escolha seu Plano'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {user?.status === 'suspended' ? 'Reative seu acesso ao SocialImob Pro' : 'Libere seu acesso ao SocialImob Pro'}
          </p>
        </div>

        <div className="p-8 space-y-8 relative z-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl flex items-center gap-3 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Yearly Plan (Highlighted) */}
            <div 
              onClick={() => setSelectedPlan('yearly')}
              className={`relative cursor-pointer transition-all duration-200 rounded-3xl border-2 p-6 ${
                selectedPlan === 'yearly' 
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-lg shadow-emerald-500/10' 
                  : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
              }`}
            >
              <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Economize 40%
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-black tracking-widest text-sm ${selectedPlan === 'yearly' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    PLANO ANUAL
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Acesso por 1 ano inteiro</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">
                    Simulação: 12x de R$ {(getDiscountedPrice(yearlyPrice) * 1.15 / 12).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="text-right">
                  {appliedCoupon ? (
                    <>
                      <span className="text-sm font-black text-slate-400 line-through block">R$ {yearlyPrice.toFixed(2).replace('.', ',')}</span>
                      <span className="text-3xl font-black text-emerald-600 tracking-tighter">
                        R$ {getDiscountedPrice(yearlyPrice).toFixed(2).replace('.', ',')}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-emerald-600 tracking-tighter">R$ 58,20</span>
                  )}
                  <span className="text-[10px] font-black text-slate-400 tracking-widest block">
                    {appliedCoupon ? 'à vista ou parcelado' : '/mês (faturado R$ 698,40)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Plan */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`cursor-pointer transition-all duration-200 rounded-3xl border-2 p-6 ${
                selectedPlan === 'monthly' 
                  ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-black tracking-widest text-sm ${selectedPlan === 'monthly' ? 'text-brand-primary' : 'text-slate-900'}`}>
                    PLANO MENSAL
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Acesso por 30 dias</p>
                </div>
                <div className="text-right">
                  {appliedCoupon ? (
                    <>
                      <span className="text-sm font-black text-slate-400 line-through block">R$ {monthlyPrice}</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        R$ {getDiscountedPrice(monthlyPrice).toFixed(2).replace('.', ',')}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">R$ 97</span>
                  )}
                  <span className="text-[10px] font-black text-slate-400 tracking-widest block">/mês</span>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="space-y-3 pt-4">
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
    </div>
  );
}
