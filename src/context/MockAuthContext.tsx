
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'driver' | 'passenger';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: { email: string; password: string; fullName: string; role: 'driver' | 'passenger' }) => Promise<{ error?: any }>;
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

  const signUp = async (data: { email: string; password: string; fullName: string; role: 'driver' | 'passenger' }) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      full_name: data.fullName,
      role: data.role
    };
    
    setUser(newUser);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    setLoading(false);
    return { error: null };
  };

  const signIn = async (data: { email: string; password: string }) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.email === data.email) {
        setUser(parsedUser);
        setLoading(false);
        return { error: null };
      }
    }
    
    setLoading(false);
    return { error: { message: 'User not found. Please sign up first.' } };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
