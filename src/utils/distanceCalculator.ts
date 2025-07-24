// Utility function to calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance);
};

// Indian intercity locations with coordinates
export const indianCities = {
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  'surat': { lat: 21.1702, lng: 72.8311, name: 'Surat' },
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  'kanpur': { lat: 26.4499, lng: 80.3319, name: 'Kanpur' },
  'nagpur': { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
  'patna': { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  'indore': { lat: 22.7196, lng: 75.8577, name: 'Indore' },
  'thane': { lat: 19.2183, lng: 72.9781, name: 'Thane' },
  'bhopal': { lat: 23.2599, lng: 77.4126, name: 'Bhopal' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam' },
  'vadodara': { lat: 22.3072, lng: 73.1812, name: 'Vadodara' },
  'firozabad': { lat: 27.1592, lng: 78.3957, name: 'Firozabad' }
};

// Calculate distance between two city names
export const calculateCityDistance = (fromCity: string, toCity: string): number => {
  const from = findCity(fromCity);
  const to = findCity(toCity);
  
  if (!from || !to) {
    return 0;
  }
  
  return calculateDistance(from.lat, from.lng, to.lat, to.lng);
};

// Find city by name (case insensitive, partial match)
export const findCity = (cityName: string) => {
  const normalizedName = cityName.toLowerCase().trim();
  
  // Direct match
  if (indianCities[normalizedName as keyof typeof indianCities]) {
    return indianCities[normalizedName as keyof typeof indianCities];
  }
  
  // Partial match
  const cityKeys = Object.keys(indianCities);
  const partialMatch = cityKeys.find(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  );
  
  if (partialMatch) {
    return indianCities[partialMatch as keyof typeof indianCities];
  }
  
  return null;
};

// Calculate fare based on distance (₹4 per km)
export const calculateFare = (distance: number): number => {
  return distance * 4;
};

// Get popular intercity routes
export const getPopularRoutes = () => [
  { from: 'Mumbai', to: 'Pune', distance: calculateCityDistance('Mumbai', 'Pune') },
  { from: 'Delhi', to: 'Jaipur', distance: calculateCityDistance('Delhi', 'Jaipur') },
  { from: 'Bangalore', to: 'Chennai', distance: calculateCityDistance('Bangalore', 'Chennai') },
  { from: 'Mumbai', to: 'Ahmedabad', distance: calculateCityDistance('Mumbai', 'Ahmedabad') },
  { from: 'Delhi', to: 'Lucknow', distance: calculateCityDistance('Delhi', 'Lucknow') },
  { from: 'Hyderabad', to: 'Bangalore', distance: calculateCityDistance('Hyderabad', 'Bangalore') }
].map(route => ({
  ...route,
  fare: calculateFare(route.distance),
  duration: `${Math.round(route.distance / 60)} hours` // Approximate driving time
}));