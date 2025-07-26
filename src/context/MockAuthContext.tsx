
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'driver' | 'passenger';
  phone?: string;
  vehicle_details?: string;
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      full_name: data.fullName,
      role: data.role,
      phone: data.phone,
      vehicle_details: data.vehicleDetails
    };
    
    setUser(newUser);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    
    // Store driver info separately for ride matching
    if (data.role === 'driver' && data.phone) {
      const drivers = JSON.parse(localStorage.getItem('registeredDrivers') || '[]');
      drivers.push({
        id: newUser.id,
        name: data.fullName,
        phone: data.phone,
        vehicle: data.vehicleDetails || 'Vehicle details not provided',
        email: data.email
      });
      localStorage.setItem('registeredDrivers', JSON.stringify(drivers));
    }
    
    setLoading(false);
    return { error: null };
  };

  const signIn = async (data: { email: string; password: string }) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Handle demo credentials
    const isDemoPassenger = data.email === 'demo-passenger@example.com' && data.password === 'password123';
    const isDemoDriver = data.email === 'demo-driver@example.com' && data.password === 'password123';
    
    if (isDemoPassenger) {
      const demoUser: User = {
        id: 'demo-passenger-id',
        email: data.email,
        full_name: 'Demo Passenger',
        role: 'passenger'
      };
      setUser(demoUser);
      localStorage.setItem('mockUser', JSON.stringify(demoUser));
      setLoading(false);
      return { error: null };
    }
    
    if (isDemoDriver) {
      const demoUser: User = {
        id: 'demo-driver-id',
        email: data.email,
        full_name: 'Demo Driver',
        role: 'driver',
        phone: '+91 98765 43210',
        vehicle_details: 'Demo Vehicle - KA01DM1234'
      };
      setUser(demoUser);
      localStorage.setItem('mockUser', JSON.stringify(demoUser));
      setLoading(false);
      return { error: null };
    }
    
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
    return { error: { message: 'User not found. Please sign up first or use demo credentials.' } };
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
