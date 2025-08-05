import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, Star, Phone, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MatchedPassenger {
  id: string;
  name: string;
  pickup: string;
  destination: string;
  time: string;
  compatibility: number;
  distance?: number;
  fare?: number;
}

interface LocationState {
  passenger: MatchedPassenger;
  routeInfo: {
    distance: number;
    fare: number;
  };
  passengers?: number;
}

const RideConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>("");

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.passenger) {
      navigate("/offer-ride");
      return;
    }
    
    // Generate unique OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtp(generatedOtp);
    toast.success(`Match confirmed! OTP: ${generatedOtp}`);
  }, [state, navigate]);

  if (!state?.passenger) {
    return null;
  }

  const { passenger, routeInfo, passengers = 4 } = state;

  const handleStartRide = () => {
    toast.success("Ride started successfully!");
    navigate("/ride-tracking", { 
      state: { 
        passenger, 
        routeInfo, 
        otp,
        status: "in_progress" 
      } 
    });
  };

  const handleContactPassenger = () => {
    toast.info("Contacting passenger...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/offer-ride")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Ride Confirmed</h1>
        </div>

        {/* OTP Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-primary">Verification OTP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold tracking-widest text-primary bg-background rounded-lg py-4 px-6 border-2 border-primary/20">
                {otp}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Share this OTP with the passenger for verification
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Passenger Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Passenger Details</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {passenger.compatibility}% Match
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {passenger.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{passenger.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>4.8 rating</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Journey Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium">{passenger.pickup}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{passenger.destination}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Departure Time</p>
                  <p className="font-medium">{passenger.time}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Fare Information */}
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Fare</span>
                <span className="text-lg font-bold text-primary">₹{routeInfo.fare}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Distance: {routeInfo.distance} km • {routeInfo.distance <= 50 ? '₹4/km' : '₹4/km up to 50km, ₹9/km after'}
              </p>
              {passengers > 1 && (
                <div className="mt-2 pt-2 border-t border-secondary/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Per Passenger ({passengers} total):</span>
                    <span className="font-semibold text-green-600">₹{Math.round(routeInfo.fare / passengers)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={handleContactPassenger}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button 
            variant="outline" 
            onClick={handleContactPassenger}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
        </div>

        {/* Start Ride Button */}
        <Button 
          onClick={handleStartRide}
          className="w-full h-12 text-lg font-semibold"
        >
          Start Ride
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>Make sure the passenger provides the correct OTP before starting the ride</p>
        </div>
      </div>
    </div>
  );
};

export default RideConfirmation;