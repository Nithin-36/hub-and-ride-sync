import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, Star, Shield, Zap, Target, Brain, CheckCircle } from "lucide-react";

const SmartMatchingSection = () => {
  const matchingFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Advanced algorithms analyze route compatibility, timing, and preferences",
      accuracy: "98%"
    },
    {
      icon: Target,
      title: "Precision Route Matching",
      description: "Smart route optimization matches passengers with drivers on similar paths",
      accuracy: "95%"
    },
    {
      icon: Clock,
      title: "Real-Time Availability",
      description: "Live tracking of driver locations and passenger requests for instant matching",
      accuracy: "99%"
    },
    {
      icon: Shield,
      title: "Safety Verification",
      description: "Verified profiles, background checks, and real-time safety monitoring",
      accuracy: "100%"
    }
  ];

  const liveMatches = [
    {
      passenger: "Priya S.",
      driver: "Rohit K.",
      route: "Koramangala → Electronic City",
      compatibility: 98,
      farePerPerson: 120,
      time: "2 mins ago"
    },
    {
      passenger: "Amit P.",
      driver: "Sneha M.",
      route: "Whitefield → MG Road",
      compatibility: 96,
      farePerPerson: 85,
      time: "5 mins ago"
    },
    {
      passenger: "Kavya R.",
      driver: "Arjun T.",
      route: "HSR Layout → Brigade Road",
      compatibility: 94,
      farePerPerson: 95,
      time: "8 mins ago"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-primary">Smart Matching</span> Technology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our advanced AI ensures accurate passenger-driver matching with 98% success rate and real-time compatibility scoring.
          </p>
        </div>

        {/* Matching Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {matchingFeatures.map((feature, index) => (
            <Card key={index} className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                  {feature.accuracy} Accuracy
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Matching Demo */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Zap className="h-6 w-6 text-primary animate-pulse" />
                Live Matching Results
              </CardTitle>
              <p className="text-muted-foreground">
                See real-time passenger-driver matches happening now across Bangalore
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.map((match, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-semibold text-sm">{match.passenger}</span>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-secondary" />
                          </div>
                          <span className="font-semibold text-sm">{match.driver}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Matched
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Route:</span>
                        <p className="font-medium">{match.route}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Compatibility:</span>
                        <p className="font-medium text-primary">{match.compatibility}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fare/Person:</span>
                        <p className="font-medium text-primary">₹{match.farePerPerson}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Matched:</span>
                        <p className="font-medium">{match.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button className="bg-primary hover:bg-primary/90">
                  <Zap className="h-4 w-4 mr-2" />
                  Try Smart Matching Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <p className="text-muted-foreground">Matching Accuracy</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">&lt;30s</div>
            <p className="text-muted-foreground">Average Match Time</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <p className="text-muted-foreground">Successful Matches</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartMatchingSection;