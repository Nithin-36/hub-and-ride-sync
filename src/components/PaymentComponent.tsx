import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Users, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentComponentProps {
  fare: number;
  passengers: number;
  pickup: string;
  destination: string;
  distance: number;
  duration: string;
  onPaymentSuccess?: () => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  fare,
  passengers,
  pickup,
  destination,
  distance,
  duration,
  onPaymentSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const perPersonFare = Math.round(fare / passengers);
  const platformFee = Math.round(fare * 0.05); // 5% platform fee
  const totalAmount = fare + platformFee;
  const perPersonTotal = Math.round(totalAmount / passengers);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      setPaymentStatus('success');
      toast.success('Payment successful! Ride booked.');
      onPaymentSuccess?.();
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-muted-foreground">Your ride has been booked</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Booking Confirmed
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trip Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">From:</span>
            <span className="font-medium">{pickup}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium">{destination}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Distance:</span>
            <span className="font-medium">{distance} km</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{duration}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Passengers:</span>
            <span className="font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              {passengers}
            </span>
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Base Fare (₹4/km)</span>
            <span>₹{fare}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform Fee (5%)</span>
            <span>₹{platformFee}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              {totalAmount}
            </span>
          </div>
        </div>

        <Separator />

        {/* Per Person Cost */}
        <div className="bg-primary/10 rounded-lg p-4 space-y-2">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Cost Per Person</p>
            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
              <IndianRupee className="h-5 w-5" />
              {perPersonTotal}
            </p>
            <p className="text-xs text-muted-foreground">
              Including platform fee
            </p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Card'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              UPI
            </Button>
          </div>
        </div>

        {paymentStatus === 'failed' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">Payment failed. Please try again.</p>
          </div>
        )}

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentComponent;