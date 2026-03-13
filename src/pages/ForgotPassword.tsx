import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Ocorreu um erro ao tentar recuperar a senha.');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm mx-auto mb-6">
            S
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Recuperar Senha</h1>
          <p className="text-slate-500 font-medium">
            {isSubmitted 
              ? 'Verifique seu email' 
              : 'Digite seu email para receber as instruções'}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl text-center animate-shake">
              {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-2xl text-sm text-center font-medium">
                Enviamos um link de recuperação para <strong className="font-black">{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </div>

              <Button 
                onClick={() => navigate('/login')} 
                className="w-full h-14 bg-brand-primary hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]"
              >
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Email</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-brand-primary hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
                Enviar Link
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-3 h-3" /> Voltar para o Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
