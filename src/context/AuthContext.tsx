import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  credits: number;
  isPaid?: boolean;
  subscriptionDate?: string; // ISO string
  status?: 'active' | 'suspended' | 'pending_payment' | 'trial';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; status?: string; isPaid?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  completePayment: () => Promise<void>;
  logout: () => Promise<void>;
  consumeCredit: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback or handle error
      }

      if (data) {
        const userEmail = data.email || email;
        const userData: User = {
          id: data.id,
          email: userEmail,
          name: data.name || '',
          isAdmin: data.is_admin || (userEmail === 'hebert.ss@gmail.com'),
          credits: data.credits,
          isPaid: data.is_paid,
          subscriptionDate: data.subscription_date,
          status: data.status,
        };
        checkSubscriptionStatus(userData);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async (userData: User) => {
    // Logic similar to before, but we might want to update the DB if status changes
    // For now, just set local state. In a real app, we'd use a DB trigger or Edge Function for expiration.
    
    if (userData.isAdmin || userData.status === 'trial') {
      setUser(userData);
      return;
    }

    if (userData.isPaid && userData.subscriptionDate) {
      const now = new Date();
      const subDate = new Date(userData.subscriptionDate);
      const diffTime = Math.abs(now.getTime() - subDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        // Subscription expired
        const updatedUser = { ...userData, status: 'suspended' as const };
        setUser(updatedUser);
        
        // Update in DB
        await supabase.from('profiles').update({ status: 'suspended' }).eq('id', userData.id);
        return;
      }
    }
    
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    // Fetch profile immediately to determine redirection
    if (data.user) {
       const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
       
       if (profile) {
           return { 
               success: true, 
               status: profile.status,
               isPaid: profile.is_paid 
           };
       }
    }
    
    return { success: true };
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const completePayment = async () => {
    if (!user) return;
    
    const updates = {
      is_paid: true,
      credits: 100,
      subscription_date: new Date().toISOString(),
      status: 'active'
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...updates, isPaid: true, subscriptionDate: updates.subscription_date, status: 'active' });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const consumeCredit = async (): Promise<boolean> => {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (user.status !== 'active' && user.status !== 'trial') return false;

    if (user.credits > 0) {
      const newCredits = user.credits - 1;
      
      // Optimistic update
      setUser({ ...user, credits: newCredits });

      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);
      
      if (error) {
        // Revert if failed
        setUser({ ...user, credits: user.credits });
        return false;
      }
      
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      login, 
      register,
      resetPassword,
      updatePassword,
      completePayment,
      logout, 
      consumeCredit,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
