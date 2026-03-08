import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Start with false to prevent flash
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const refreshAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error: any) {
      console.error('Auth refresh error:', error);
      setSession(null);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Only run once on mount
    if (initialized) return;
    
    setLoading(true);
    
    // If the URL contains a recovery hash, mark recovery mode early.
    // (Some environments provide access_token but an empty refresh_token; event may not fire.)
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      if (type === 'recovery' && accessToken) {
        sessionStorage.setItem('passwordRecoveryMode', 'true');
        sessionStorage.setItem('passwordRecoveryAccessToken', accessToken);
      }
    } catch {
      // ignore
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle password recovery event - store flag in sessionStorage
        if (event === 'PASSWORD_RECOVERY') {
          sessionStorage.setItem('passwordRecoveryMode', 'true');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // Clear recovery mode on sign out
          sessionStorage.removeItem('passwordRecoveryMode');
          sessionStorage.removeItem('passwordRecoveryAccessToken');
        }
      }
    );

    // THEN check for existing session
    refreshAuth().finally(() => {
      setLoading(false);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [initialized]);

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};