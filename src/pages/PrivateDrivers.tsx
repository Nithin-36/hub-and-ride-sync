
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Car, MapPin, Star, Phone, Search } from 'lucide-react';

interface MockDriver {
  id: string;
  full_name: string;
  rating: number;
  total_rides: number;
  phone: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_number: string;
  is_available: boolean;
}

// Mock data for demonstration
const mockDrivers: MockDriver[] = [
  {
    id: '1',
    full_name: 'Rajesh Kumar',
    rating: 4.8,
    total_rides: 156,
    phone: '+91-9876543210',
    vehicle_type: 'sedan',
    vehicle_model: 'Honda City',
    vehicle_color: 'White',
    vehicle_number: 'MH-12-AB-1234',
    is_available: true
  },
  {
    id: '2',
    full_name: 'Priya Sharma',
    rating: 4.9,
    total_rides: 203,
    phone: '+91-9876543211',
    vehicle_type: 'suv',
    vehicle_model: 'Toyota Innova',
    vehicle_color: 'Silver',
    vehicle_number: 'DL-07-CD-5678',
    is_available: true
  },
  {
    id: '3',
    full_name: 'Mohammed Ali',
    rating: 4.7,
    total_rides: 89,
    phone: '+91-9876543212',
    vehicle_type: 'hatchback',
    vehicle_model: 'Maruti Swift',
    vehicle_color: 'Red',
    vehicle_number: 'KA-01-EF-9012',
    is_available: false
  }
];

const PrivateDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<MockDriver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<MockDriver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDrivers(mockDrivers);
      setFilteredDrivers(mockDrivers);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(driver =>
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  const handleContactDriver = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading available drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Private Vehicle Drivers</h1>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, vehicle model, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{drivers.length}</div>
              <p className="text-sm text-muted-foreground">Total Drivers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {drivers.filter(d => d.is_available).length}
              </div>
              <p className="text-sm text-muted-foreground">Available Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {drivers.length > 0 ? (drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length).toFixed(1) : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Drivers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{driver.full_name}</CardTitle>
                  <Badge variant={driver.is_available ? "default" : "secondary"}>
                    {driver.is_available ? 'Available' : 'Busy'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{driver.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({driver.total_rides} rides)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {driver.vehicle_color} {driver.vehicle_model}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {driver.vehicle_number}
                  </span>
                </div>
                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={!driver.is_available || !driver.phone}
                    onClick={() => handleContactDriver(driver.phone)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {driver.is_available ? 'Contact Driver' : 'Unavailable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No private drivers are currently registered.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateDrivers;
