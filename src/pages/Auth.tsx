
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Users } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Form submitted:', { 
      isLogin, 
      email, 
      role: !isLogin ? role : 'N/A', 
      fullName: !isLogin ? fullName : 'N/A' 
    });

    try {
      if (isLogin) {
        console.log('Attempting login...');
        const { error } = await signIn({ email, password });
        if (error) {
          console.error('Login failed:', error);
          setError(error.message || 'Login failed');
        } else {
          console.log('Login successful, navigating to dashboard');
          navigate('/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          const errorMsg = 'Full name is required';
          console.error('Validation error:', errorMsg);
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        if (password.length < 6) {
          const errorMsg = 'Password must be at least 6 characters long';
          console.error('Validation error:', errorMsg);
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        console.log('Attempting signup...');
        const { error } = await signUp({ email, password, fullName, role });
        if (error) {
          console.error('Signup failed:', error);
          setError(error.message || 'Signup failed');
        } else {
          console.log('Signup successful');
          // Don't navigate immediately for signup, let user verify email first
        }
      }
    } catch (error: any) {
      console.error('Unexpected error during authentication:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    console.log('Toggling form from', isLogin ? 'login' : 'signup', 'to', !isLogin ? 'login' : 'signup');
    setIsLogin(!isLogin);
    setError('');
    setFullName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">RideShareHub</h1>
            </div>
          </div>
          <CardTitle>{isLogin ? 'Welcome Back' : 'Join RideShareHub'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <Label>Choose your role</Label>
                <RadioGroup value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="passenger" id="passenger" />
                    <Label htmlFor="passenger" className="flex items-center space-x-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      <span>Passenger - Find rides</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="driver" id="driver" />
                    <Label htmlFor="driver" className="flex items-center space-x-2 cursor-pointer">
                      <Car className="h-4 w-4" />
                      <span>Driver - Offer rides</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={toggleForm}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
