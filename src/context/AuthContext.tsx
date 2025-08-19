import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: { email: string; password: string; fullName: string; role: 'driver' | 'passenger'; phone?: string; vehicleDetails?: string }) => Promise<{ error?: any }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error?: any }>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (data: { email: string; password: string; fullName: string; role: 'driver' | 'passenger'; phone?: string; vehicleDetails?: string }) => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName,
            role: data.role,
            phone: data.phone,
            vehicle_details: data.vehicleDetails
          }
        }
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      // Create driver profile if user is a driver
      if (data.role === 'driver' && authData.user && data.phone && data.vehicleDetails) {
        const vehicleParts = data.vehicleDetails.split(' - ');
        const vehicleModel = vehicleParts[0] || 'Unknown Vehicle';
        const vehicleNumber = vehicleParts[1] || 'Unknown Number';
        
        const { error: driverError } = await supabase
          .from('driver_profiles')
          .insert({
            id: authData.user.id,
            license_number: 'DL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            vehicle_type: 'car',
            vehicle_model: vehicleModel,
            vehicle_color: 'White',
            vehicle_number: vehicleNumber,
            is_verified: false,
            is_available: true
          });
        
        if (driverError) {
          console.error('Error creating driver profile:', driverError);
        }
      }

      setLoading(false);
      toast.success('Account created successfully! Please check your email to verify your account.');
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: { message: error.message } };
    }
  };

  const signIn = async (data: { email: string; password: string }) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!');
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};