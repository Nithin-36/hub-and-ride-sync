
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, HandHeart, CreditCard } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up",
      description: "Create your profile and choose whether you want to be a driver, passenger, or both",
      details: "Quick registration with verification for safety"
    },
    {
      icon: Search,
      title: "Find Matches",
      description: "Our smart algorithm finds the perfect ride matches based on your route and preferences",
      details: "Real-time matching with compatibility scoring"
    },
    {
      icon: HandHeart,
      title: "Connect & Ride",
      description: "Connect with your matches, share ride details, and enjoy your journey together",
      details: "In-app messaging and live tracking"
    },
    {
      icon: CreditCard,
      title: "Pay & Rate",
      description: "Secure payment processing and community rating system for continuous improvement",
      details: "Multiple payment options and fair pricing"
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            How <span className="text-primary">RideShareHub</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. Follow these four easy steps to begin your smart carpooling journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <Card className="relative z-10 p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur border-primary/10">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-3">{step.description}</p>
                <p className="text-sm text-primary font-medium">{step.details}</p>
              </Card>
            </div>
          ))}
        </div>

        {/* Driver vs Passenger */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/30 border-primary/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-primary">Become a Driver</h3>
              <p className="text-muted-foreground">
                Share your ride, earn money, and help reduce traffic congestion
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Earn up to $500/month</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Choose your passengers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Flexible scheduling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Vehicle verification support</span>
              </div>
            </div>
            
            <Button className="w-full">Start Driving</Button>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/20 to-primary/5 border-primary/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-primary">Find a Ride</h3>
              <p className="text-muted-foreground">
                Travel comfortably, save money, and meet like-minded people
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Save up to 70% on travel costs</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Verified driver profiles</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Real-time ride tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Find Rides
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
