import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { calculateCityDistance, calculateFare } from '@/utils/distanceCalculator';
import { toast } from 'sonner';

interface SimpleMapProps {
  pickup: string;
  destination: string;
  onRouteSelect: (route: { pickup: string; destination: string; distance: number; fare: number }) => void;
}

const SimpleMap = ({ pickup, destination, onRouteSelect }: SimpleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Dynamically import and initialize Leaflet
    const initMap = async () => {
      try {
        const L = await import('leaflet');
        
        if (mapRef.current && !mapInstance.current) {
          // Default coordinates for major Indian cities
          const getCityCoordinates = (city: string): [number, number] => {
            const coordinates: { [key: string]: [number, number] } = {
              'mumbai': [19.0760, 72.8777],
              'delhi': [28.7041, 77.1025],
              'bangalore': [12.9716, 77.5946],
              'chennai': [13.0827, 80.2707],
              'kolkata': [22.5726, 88.3639],
              'hyderabad': [17.3850, 78.4867],
              'pune': [18.5204, 73.8567],
              'ahmedabad': [23.0225, 72.5714],
              'jaipur': [26.9124, 75.7873],
              'lucknow': [26.8467, 80.9462]
            };
            
            const cityKey = city.toLowerCase().split(',')[0].trim();
            return coordinates[cityKey] || [12.9716, 77.5946];
          };

          const pickupCoords = getCityCoordinates(pickup);
          const destinationCoords = getCityCoordinates(destination);
          
          // Create map
          mapInstance.current = L.map(mapRef.current).setView([12.9716, 77.5946], 6);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstance.current);

          // Add markers if locations are provided
          if (pickup) {
            L.marker(pickupCoords).addTo(mapInstance.current)
              .bindPopup(`<b>Pickup:</b> ${pickup}`);
          }
          
          if (destination) {
            L.marker(destinationCoords).addTo(mapInstance.current)
              .bindPopup(`<b>Destination:</b> ${destination}`);
          }

          // Fit bounds if both locations exist
          if (pickup && destination) {
            const group = new L.FeatureGroup([
              L.marker(pickupCoords),
              L.marker(destinationCoords)
            ]);
            mapInstance.current.fitBounds(group.getBounds().pad(0.1));
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [pickup, destination]);

  const handleConfirmRoute = () => {
    if (pickup && destination) {
      const distance = calculateCityDistance(pickup, destination);
      const fare = calculateFare(distance);
      onRouteSelect({ pickup, destination, distance, fare });
    } else {
      toast.error('Please select both pickup and destination locations');
    }
  };

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="h-[500px] w-full rounded-lg border"
        style={{ zIndex: 1 }}
      />
      
      <div className="p-4 bg-card rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Route Information</h3>
          <Button 
            onClick={handleConfirmRoute}
            size="sm"
            disabled={!pickup || !destination}
          >
            Confirm Route
          </Button>
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Pickup:</span> {pickup || 'Not selected'}</p>
          <p><span className="font-medium">Destination:</span> {destination || 'Not selected'}</p>
          {pickup && destination && (
            <p><span className="font-medium">Estimated Distance:</span> {calculateCityDistance(pickup, destination)}km</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;