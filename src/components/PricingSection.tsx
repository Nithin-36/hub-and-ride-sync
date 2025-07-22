import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, MapPin, Clock, DollarSign, Calculator, Car } from "lucide-react";

const PricingSection = () => {
  const [passengers, setPassengers] = useState(2);
  const [totalFare] = useState(200);
  
  const farePerPassenger = Math.round(totalFare / passengers);

  const pricingPlans = [
    {
      title: "Basic Ride",
      price: "₹15",
      period: "per km",
      description: "Standard ride-sharing experience",
      features: [
        "Shared rides with verified passengers",
        "Basic route optimization",
        "Standard customer support",
        "Safe & secure payment",
      ],
      popular: false,
    },
    {
      title: "Premium Ride",
      price: "₹25",
      period: "per km",
      description: "Enhanced comfort and priority service",
      features: [
        "Priority matching with premium drivers",
        "Luxury vehicle options",
        "Real-time ride tracking",
        "24/7 premium support",
        "Split fare among passengers",
        "Direct driver contact",
      ],
      popular: true,
    },
    {
      title: "Private Driver",
      price: "₹40",
      period: "per km",
      description: "Exclusive private driver service",
      features: [
        "Dedicated private driver",
        "No ride sharing",
        "Premium vehicle guarantee",
        "Personalized service",
        "Advanced booking options",
        "VIP customer support",
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Simple & <span className="text-primary">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect ride option for your needs with our competitive and transparent pricing structure.
          </p>
        </div>

        {/* Split Fare Feature Highlight */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Users className="h-6 w-6 text-primary" />
                Split Fare Among Passengers
              </CardTitle>
              <p className="text-muted-foreground">
                Share rides, share costs - automatically split fares when multiple passengers are matched
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-card rounded-lg p-6 border">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">Number of Passengers:</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((num) => (
                          <Button
                            key={num}
                            variant={passengers === num ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPassengers(num)}
                            className="w-10 h-10"
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Fare:</span>
                        <span className="font-semibold">₹{totalFare}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Passengers:</span>
                        <span className="font-semibold">{passengers}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Fare per Passenger:</span>
                        <span>₹{farePerPassenger}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                      <Calculator className="h-5 w-5" />
                      <span className="font-semibold">Auto-calculated in booking</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Split fare is automatically enabled when multiple passengers share a ride
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl mb-2">{plan.title}</CardTitle>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-6 ${plan.popular ? '' : 'variant="outline"'}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Dynamic Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Fair pricing based on distance, time, and demand
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">No Hidden Fees</h3>
            <p className="text-sm text-muted-foreground">
              Transparent pricing with no surprise charges
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Multiple Payment</h3>
            <p className="text-sm text-muted-foreground">
              Cash, card, UPI - pay however you prefer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;