// Demo data for presentation purposes
export const createDemoData = () => {
  // Create demo drivers if none exist
  const existingDrivers = JSON.parse(localStorage.getItem('registeredDrivers') || '[]');
  
  if (existingDrivers.length === 0) {
    const demoDrivers = [
      {
        id: 'demo-driver-1',
        name: 'Nithin Sharma',
        phone: '+91 99887 76543',
        vehicle: 'Honda City - KA01AB1234',
        email: 'nithin@example.com'
      },
      {
        id: 'demo-driver-2',
        name: 'Arjun Kumar',
        phone: '+91 88776 65432',
        vehicle: 'Maruti Swift - KA02CD5678',
        email: 'arjun@example.com'
      },
      {
        id: 'demo-driver-3',
        name: 'Priya Singh',
        phone: '+91 77665 54321',
        vehicle: 'Hyundai Verna - MH01EF9012',
        email: 'priya@example.com'
      }
    ];
    
    localStorage.setItem('registeredDrivers', JSON.stringify(demoDrivers));
  }

  // Create demo ride history if none exists
  const existingHistory = JSON.parse(localStorage.getItem('rideHistory') || '[]');
  
  if (existingHistory.length === 0) {
    const demoHistory = [
      {
        id: 'demo-ride-1',
        from: 'Mumbai Central',
        to: 'Pune Station',
        date: '2024-01-20',
        time: '09:00 AM',
        duration: '3h 30m',
        distance: '148 km',
        fare: 592,
        driverName: 'Nithin Sharma',
        rating: 4.8,
        status: 'completed'
      },
      {
        id: 'demo-ride-2',
        from: 'Delhi Railway Station',
        to: 'Jaipur Bus Stand',
        date: '2024-01-15',
        time: '07:30 AM',
        duration: '5h 15m',
        distance: '280 km',
        fare: 1120,
        driverName: 'Arjun Kumar',
        rating: 4.6,
        status: 'completed'
      }
    ];
    
    localStorage.setItem('rideHistory', JSON.stringify(demoHistory));
  }
};

// Popular demo routes for quick selection
export const popularRoutes = [
  { from: 'Mumbai', to: 'Pune', distance: 148, fare: 592 },
  { from: 'Delhi', to: 'Jaipur', distance: 280, fare: 1120 },
  { from: 'Bangalore', to: 'Chennai', distance: 346, fare: 1384 },
  { from: 'Mumbai', to: 'Ahmedabad', distance: 526, fare: 2104 },
  { from: 'Delhi', to: 'Lucknow', distance: 555, fare: 2220 },
  { from: 'Hyderabad', to: 'Bangalore', distance: 574, fare: 2296 }
];

export const getDemoCredentials = () => ({
  passenger: {
    email: 'demo-passenger@example.com',
    password: 'password123',
    name: 'Demo Passenger'
  },
  driver: {
    email: 'demo-driver@example.com',
    password: 'password123',
    name: 'Demo Driver',
    phone: '+91 98765 43210'
  }
});