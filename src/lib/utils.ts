import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateAuthError(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('password should be at least 6 characters')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (msg.includes('user already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (msg.includes('email not confirmed')) {
    return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  }
  if (msg.includes('user not found')) {
    return 'Usuário não encontrado.';
  }
  if (msg.includes('security reasons')) {
    return 'Por motivos de segurança, aguarde alguns minutos antes de tentar novamente.';
  }
  if (msg.includes('valid password')) {
    return 'Por favor, insira uma senha válida.';
  }
  if (msg.includes('rate limit exceeded')) {
    return 'Muitas tentativas. Tente novamente mais tarde.';
  }
  
  // Return original message if no translation found, or a generic one
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
