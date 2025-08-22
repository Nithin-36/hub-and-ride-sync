import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'passenger' | 'driver';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(false);

  const signUp = async (data: { email: string; password: string; fullName: string; role: 'driver' | 'passenger'; phone?: string; vehicleDetails?: string }) => {
    setLoading(true);
    
    try {
      let requestBody: any = {
        action: 'signup',
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone
      };

      // Add vehicle details for drivers
      if (data.role === 'driver' && data.vehicleDetails) {
        const vehicleParts = data.vehicleDetails.split(' - ');
        requestBody.vehicleModel = vehicleParts[0] || 'Unknown Vehicle';
        requestBody.vehicleNumber = vehicleParts[1] || 'Unknown Number';
        requestBody.licenseNumber = 'DL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      }

      const response = await supabase.functions.invoke('auth', {
        body: requestBody
      });

      if (response.error) {
        setLoading(false);
        return { error: { message: response.error.message } };
      }

      if (response.data.error) {
        setLoading(false);
        return { error: { message: response.data.error } };
      }

      setUser(response.data.user);
      setLoading(false);
      toast.success('Account created successfully!');
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: { message: error.message } };
    }
  };

  const signIn = async (data: { email: string; password: string }) => {
    setLoading(true);
    
    try {
      const response = await supabase.functions.invoke('auth', {
        body: {
          action: 'signin',
          email: data.email,
          password: data.password
        }
      });

      if (response.error) {
        setLoading(false);
        return { error: { message: response.error.message } };
      }

      if (response.data.error) {
        setLoading(false);
        return { error: { message: response.data.error } };
      }

      setUser(response.data.user);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      setLoading(false);
      toast.success('Successfully signed in!');
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast.success('Successfully signed out!');
  };

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};