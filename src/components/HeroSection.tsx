
import { Button } from "@/components/ui/button";
import { Car, Users, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Smart Carpooling for
            <span className="text-primary"> Modern Cities</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with reliable drivers and passengers in your area. Save money, reduce traffic, and make new friends while commuting.
          </p>
          
          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Find a Ride */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                 onClick={() => navigate('/auth')}>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Ride</h3>
              <p className="text-muted-foreground mb-4">
                Book affordable rides with verified drivers in your area
              </p>
              <Button className="w-full">
                Get Started
              </Button>
            </div>

            {/* Become a Driver */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/auth')}>
              <div className="bg-secondary/10 p-3 rounded-lg w-fit mx-auto mb-4">
                <Car className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Become a Driver</h3>
              <p className="text-muted-foreground mb-4">
                Earn money by sharing rides with passengers on your route
              </p>
              <Button variant="outline" className="w-full">
                Start Driving
              </Button>
            </div>

            {/* Private Vehicle Drivers */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/private-drivers')}>
              <div className="bg-accent/10 p-3 rounded-lg w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private Drivers</h3>
              <p className="text-muted-foreground mb-4">
                Find available drivers with private vehicles for dedicated rides
              </p>
              <Button variant="secondary" className="w-full">
                View Drivers
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Join as Passenger
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Register as Driver
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
