
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationSearchProps {
  placeholder?: string;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  value?: string;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder = "Search for a location",
  onLocationSelect,
  value = '',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!window.google?.maps?.places || !inputRef.current) {
      console.log('Google Places API not available yet');
      return;
    }

    console.log('Initializing Google Places Autocomplete');

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'IN' }, // Restrict to India
    });

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      console.log('Place selected:', place);
      
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || '';
        
        console.log('Location selected:', { lat, lng, address });
        setInputValue(address);
        onLocationSelect({ lat, lng, address });
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationSelect]);

  return (
    <div className={`relative ${className}`}>
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default LocationSearch;
