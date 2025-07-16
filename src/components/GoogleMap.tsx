import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GoogleMapProps {
  pickup?: { lat: number; lng: number; address?: string };
  destination?: { lat: number; lng: number; address?: string };
  currentLocation?: { lat: number; lng: number };
  height?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  showDirections?: boolean;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  pickup,
  destination,
  currentLocation,
  height = '400px',
  onLocationSelect,
  showDirections = false,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [error, setError] = useState('');

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) return;

    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        console.log('Google Maps API already loaded');
        setIsApiLoaded(true);
        return;
      }

      console.log('Loading Google Maps API with key:', apiKey.substring(0, 10) + '...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        setIsApiLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setError('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isApiLoaded || !mapRef.current || !window.google?.maps) return;

    console.log('Initializing Google Map');
    const defaultCenter = pickup || destination || { lat: 28.6139, lng: 77.2090 }; // Delhi default

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: defaultCenter,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#4F46E5',
        strokeWeight: 4,
      },
    });

    directionsRendererRef.current.setMap(map);

    // Add click listener for location selection
    if (onLocationSelect) {
      map.addListener('click', async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          console.log('Map clicked at:', lat, lng);
          
          // Reverse geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          try {
            const response = await new Promise<{ results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus }>((resolve) => {
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                resolve({ results: results || [], status });
              });
            });
            
            const address = response.results[0]?.formatted_address || `${lat}, ${lng}`;
            console.log('Geocoded address:', address);
            onLocationSelect({ lat, lng, address });
          } catch (error) {
            console.error('Geocoding error:', error);
            onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
          }
        }
      });
    }
  }, [isApiLoaded, onLocationSelect]);

  // Add markers and directions
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    console.log('Adding markers and directions', { pickup, destination, currentLocation });
    const map = mapInstanceRef.current;

    // Add pickup marker
    if (pickup) {
      console.log('Adding pickup marker at:', pickup);
      new window.google.maps.Marker({
        position: pickup,
        map,
        title: 'Pickup Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#10B981"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });
    }

    // Add destination marker
    if (destination) {
      console.log('Adding destination marker at:', destination);
      new window.google.maps.Marker({
        position: destination,
        map,
        title: 'Destination',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#EF4444"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });
    }

    // Add current location marker (for driver tracking)
    if (currentLocation) {
      console.log('Adding current location marker at:', currentLocation);
      new window.google.maps.Marker({
        position: currentLocation,
        map,
        title: 'Current Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });
    }

    // Show directions if both pickup and destination are available
    if (showDirections && pickup && destination && directionsServiceRef.current && directionsRendererRef.current) {
      console.log('Calculating directions from pickup to destination');
      directionsServiceRef.current.route(
        {
          origin: pickup,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          console.log('Directions result:', status);
          if (status === 'OK' && result && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    }

    // Fit bounds to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    if (pickup) bounds.extend(pickup);
    if (destination) bounds.extend(destination);
    if (currentLocation) bounds.extend(currentLocation);
    
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [pickup, destination, currentLocation, showDirections, isApiLoaded]);

  if (!apiKey) {
    return (
      <div className={`${className} p-6 border border-dashed border-gray-300 rounded-lg`} style={{ height }}>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Google Maps API Key Required</h3>
          <p className="text-sm text-muted-foreground">
            Please enter your Google Maps API key to enable map functionality.
          </p>
          <div className="max-w-md mx-auto space-y-2">
            <Input
              type="password"
              placeholder="Enter Google Maps API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ height }}>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isApiLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted rounded-lg`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default GoogleMap;
