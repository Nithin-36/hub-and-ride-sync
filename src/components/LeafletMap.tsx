import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { calculateCityDistance, calculateFare } from '@/utils/distanceCalculator';

// Fix for default markers in Leaflet - using simple approach
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LeafletMapProps {
  pickup: string;
  destination: string;
  onRouteSelect: (route: { pickup: string; destination: string; distance: number; fare: number }) => void;
}

const LeafletMap = ({ pickup, destination, onRouteSelect }: LeafletMapProps) => {
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
    return coordinates[cityKey] || [12.9716, 77.5946]; // Default to Bangalore
  };

  const pickupCoords = getCityCoordinates(pickup);
  const destinationCoords = getCityCoordinates(destination);
  
  // Center map between pickup and destination
  const centerLat = (pickupCoords[0] + destinationCoords[0]) / 2;
  const centerLng = (pickupCoords[1] + destinationCoords[1]) / 2;

  const handleConfirmRoute = () => {
    if (pickup && destination) {
      const distance = calculateCityDistance(pickup, destination);
      const fare = calculateFare(distance);
      onRouteSelect({ pickup, destination, distance, fare });
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {pickup && (
            <Marker position={pickupCoords} icon={icon}>
              <Popup>
                <div className="text-center">
                  <strong>Pickup Location</strong><br />
                  <span className="text-sm">{pickup}</span>
                </div>
              </Popup>
            </Marker>
          )}
          
          {destination && (
            <Marker position={destinationCoords} icon={icon}>
              <Popup>
                <div className="text-center">
                  <strong>Destination</strong><br />
                  <span className="text-sm">{destination}</span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      <div className="p-4 bg-card rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Route Information</h3>
          <Button 
            onClick={handleConfirmRoute}
            size="sm"
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

export default LeafletMap;