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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recuperar Senha</h1>
          <p className="text-slate-500">
            {isSubmitted 
              ? 'Verifique seu email' 
              : 'Digite seu email para receber as instruções'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center">
              Enviamos um link de recuperação para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e spam.
            </div>

            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Voltar para o Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Enviar Link
            </Button>
            
            <div className="text-center">
              <Link to="/login" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
