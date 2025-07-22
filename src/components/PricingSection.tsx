import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, MapPin, Clock, DollarSign, Calculator, Route } from "lucide-react";

const PricingSection = () => {
  const [passengers, setPassengers] = useState(2);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const intercityRoutes = [
    {
      from: "Bangalore",
      to: "Mumbai",
      distance: 984,
      pricePerKm: 8,
      duration: "14-16 hours"
    },
    {
      from: "Delhi",
      to: "Mumbai",
      distance: 1424,
      pricePerKm: 8,
      duration: "20-22 hours"
    },
    {
      from: "Chennai",
      to: "Bangalore",
      distance: 346,
      pricePerKm: 8,
      duration: "5-6 hours"
    },
    {
      from: "Pune",
      to: "Mumbai",
      distance: 149,
      pricePerKm: 8,
      duration: "3-4 hours"
    },
    {
      from: "Hyderabad",
      to: "Bangalore",
      distance: 569,
      pricePerKm: 8,
      duration: "8-10 hours"
    },
    {
      from: "Kolkata",
      to: "Delhi",
      distance: 1472,
      pricePerKm: 8,
      duration: "21-23 hours"
    }
  ];

  const selectedRoute = intercityRoutes[selectedRouteIndex];
  const totalFare = selectedRoute.distance * selectedRoute.pricePerKm;
  const farePerPassenger = Math.round(totalFare / passengers);

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Intercity <span className="text-primary">Travel Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent intercity ride-sharing pricing at ₹8 per km. Share rides, share costs!
          </p>
        </div>

        {/* Route Selection */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Route className="h-6 w-6 text-primary" />
                Select Your Route
              </CardTitle>
              <p className="text-muted-foreground">
                Choose your intercity destination and see instant pricing
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {intercityRoutes.map((route, index) => (
                  <Button
                    key={index}
                    variant={selectedRouteIndex === index ? "default" : "outline"}
                    onClick={() => setSelectedRouteIndex(index)}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <div className="font-semibold">{route.from} → {route.to}</div>
                    <div className="text-sm opacity-80">{route.distance} km • {route.duration}</div>
                  </Button>
                ))}
              </div>
              
              <div className="bg-card rounded-lg p-6 border">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedRoute.from} to {selectedRoute.to}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedRoute.distance} km</span>
                    <span>•</span>
                    <span>{selectedRoute.duration}</span>
                    <span>•</span>
                    <span>₹{selectedRoute.pricePerKm}/km</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    ₹{totalFare}
                  </div>
                  <p className="text-sm text-muted-foreground">Base fare for the route</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Split Fare Feature */}
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
                        <span className="text-sm">Route:</span>
                        <span className="font-semibold">{selectedRoute.from} → {selectedRoute.to}</span>
                      </div>
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

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Distance-Based Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Fair pricing at ₹8 per km for all intercity routes
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