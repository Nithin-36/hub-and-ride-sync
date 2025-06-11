
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Route, 
  Clock, 
  CreditCard, 
  Users, 
  MapPin,
  Smartphone,
  Star
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Gale-Shapley Algorithm",
      description: "Advanced matching system that pairs riders and drivers based on optimal compatibility",
      badge: "Core Technology"
    },
    {
      icon: Route,
      title: "Enhanced Dijkstra's Algorithm",
      description: "Optimized route calculation considering real-time traffic, distance, and user preferences",
      badge: "Route Optimization"
    },
    {
      icon: MapPin,
      title: "Real-Time Traffic Data",
      description: "Integration with Google Maps API for live traffic updates and dynamic route adjustments",
      badge: "Live Data"
    },
    {
      icon: Users,
      title: "4-Person Maximum",
      description: "Comfortable rides with a maximum of 4 passengers ensuring personal space and safety",
      badge: "Comfort"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Multiple payment methods with secure processing and automatic fare splitting",
      badge: "Payment"
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Live location sharing and ETA updates for both drivers and passengers",
      badge: "Tracking"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Responsive design that works perfectly on all devices and screen sizes",
      badge: "Mobile"
    },
    {
      icon: Star,
      title: "Rating System",
      description: "Community-driven rating system ensuring quality and safety for all users",
      badge: "Community"
    }
  ];

  return (
    <section id="features" className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Powered by <span className="text-primary">Advanced Technology</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge algorithms with user-friendly design to deliver 
            the most efficient and enjoyable carpooling experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur border-primary/10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Algorithm Highlight */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-accent/50 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Why Our Algorithms Make the Difference
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-primary">Gale-Shapley Algorithm:</strong> Originally designed for 
                  stable matching problems, we've optimized it for carpooling to ensure both drivers 
                  and passengers get their preferred matches.
                </p>
                <p>
                  <strong className="text-primary">Enhanced Dijkstra's:</strong> We've improved the classic 
                  shortest path algorithm to consider real-world factors like traffic patterns, 
                  road conditions, and user preferences.
                </p>
              </div>
            </div>
            
            <div className="bg-card/50 backdrop-blur rounded-xl p-6 border border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Matching Accuracy</span>
                  <span className="text-primary font-bold">98.5%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '98.5%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Route Optimization</span>
                  <span className="text-primary font-bold">94.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '94.2%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Satisfaction</span>
                  <span className="text-primary font-bold">96.7%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '96.7%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
