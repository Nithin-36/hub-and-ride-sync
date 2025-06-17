
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole, SignUpData, SignInData } from '@/types/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error?: any }>;
  signIn: (data: SignInData) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, {
          userId: session?.user?.id,
          email: session?.user?.email,
          userMetadata: session?.user?.user_metadata
        });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        console.log('Initial session:', {
          userId: session?.user?.id,
          email: session?.user?.email,
          userMetadata: session?.user?.user_metadata
        });
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, fullName, role }: SignUpData) => {
    console.log('Attempting signup for:', { email, role, fullName });
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      console.log('Signup response:', { 
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session ? { access_token: data.session.access_token.substring(0, 20) + '...' } : null,
        error: error ? { message: error.message, status: error.status } : null
      });

      if (error) {
        console.error('Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        let errorMessage = error.message || 'Failed to create account';
        
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message?.includes('Password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message?.includes('Email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message?.includes('Database error')) {
          errorMessage = 'Database configuration issue. Please contact support.';
        }
        
        toast.error(errorMessage);
        return { error };
      }

      if (data.user && !data.session) {
        console.log('User created, waiting for email confirmation');
        toast.success('Account created successfully! Please check your email to verify your account.');
      } else if (data.user && data.session) {
        console.log('User created and signed in automatically');
        toast.success('Account created and signed in successfully!');
      }

      return { error: null };
    } catch (err: any) {
      console.error('Unexpected signup error:', err);
      toast.error('An unexpected error occurred during signup');
      return { error: err };
    }
  };

  const signIn = async ({ email, password }: SignInData) => {
    console.log('Attempting signin for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Signin response:', { 
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session ? { access_token: data.session.access_token.substring(0, 20) + '...' } : null,
        error: error ? { message: error.message, status: error.status } : null
      });

      if (error) {
        console.error('Signin error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        let errorMessage = error.message || 'Failed to sign in';
        
        // Handle specific error cases
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        }
        
        toast.error(errorMessage);
        return { error };
      }

      console.log('Successfully signed in');
      toast.success('Successfully signed in!');
      return { error: null };
    } catch (err: any) {
      console.error('Unexpected signin error:', err);
      toast.error('An unexpected error occurred during signin');
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('Attempting to sign out');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
        toast.error('Failed to sign out');
      } else {
        console.log('Successfully signed out');
        toast.success('Successfully signed out');
      }
    } catch (err: any) {
      console.error('Unexpected signout error:', err);
      toast.error('An unexpected error occurred during signout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
