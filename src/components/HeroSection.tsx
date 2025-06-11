
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car, Users, MapPin, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/30 to-background" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Smart <span className="text-primary">Carpooling</span> for the Modern World
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Connect with fellow travelers using our advanced Gale-Shapley matching algorithm. 
                Save money, reduce emissions, and make new friends on every journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
                Find a Ride
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
                Become a Driver
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Rides Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 animate-float">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Smart Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Our Gale-Shapley algorithm finds the perfect ride match based on route, time, and preferences.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Optimized Routes</h3>
                  <p className="text-sm text-muted-foreground">
                    Enhanced Dijkstra's algorithm with real-time traffic data ensures the fastest routes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Max 4 Passengers</h3>
                  <p className="text-sm text-muted-foreground">
                    Comfortable rides with a maximum of 4 passengers for a pleasant journey experience.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Integrated payment system with multiple options for seamless transactions.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
