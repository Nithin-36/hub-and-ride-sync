
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Users, Info } from 'lucide-react';
import { toast } from 'sonner';
import { createDemoData, getDemoCredentials } from '@/utils/demoData';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [role, setRole] = useState<'driver' | 'passenger'>('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  // Initialize demo data on component mount
  useEffect(() => {
    createDemoData();
  }, []);

  const fillDemoCredentials = (type: 'passenger' | 'driver') => {
    const credentials = getDemoCredentials();
    const cred = credentials[type];
    
    setEmail(cred.email);
    setPassword(cred.password);
    setIsLogin(true);
    toast.info(`Demo ${type} credentials filled. Click Sign In to continue.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn({ email, password });
        if (error) {
          setError(error.message || 'Login failed');
          toast.error(error.message || 'Login failed');
        } else {
          toast.success('Successfully signed in!');
          navigate('/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          const errorMsg = 'Full name is required';
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }
        
        if (role === 'driver' && !phone.trim()) {
          const errorMsg = 'Phone number is required for drivers';
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        if (password.length < 6) {
          const errorMsg = 'Password must be at least 6 characters long';
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        const { error } = await signUp({ email, password, fullName, role, phone, vehicleDetails });
        if (error) {
          setError(error.message || 'Signup failed');
          toast.error(error.message || 'Signup failed');
        } else {
          toast.success('Account created successfully!');
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFullName('');
    setPhone('');
    setVehicleDetails('');
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin && role === 'driver'}
                    placeholder="Enter your phone number"
                  />
                </div>

                {role === 'driver' && (
                  <div className="space-y-2">
                    <Label htmlFor="vehicleDetails">Vehicle Details (Optional)</Label>
                    <Input
                      id="vehicleDetails"
                      type="text"
                      value={vehicleDetails}
                      onChange={(e) => setVehicleDetails(e.target.value)}
                      placeholder="e.g., Honda City - KA01AB1234"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Choose your role</Label>
                  <RadioGroup value={role} onValueChange={(value: 'driver' | 'passenger') => setRole(value)}>
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
                        <span>Driver - Offer rides (Phone required)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
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

            {/* Demo Credentials Section */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Info className="h-4 w-4" />
                <span>Demo Credentials (For Presentation)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('passenger')}
                  className="text-xs"
                >
                  Demo Passenger
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('driver')}
                  className="text-xs"
                >
                  Demo Driver
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
