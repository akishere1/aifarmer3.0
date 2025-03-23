/**
 * Location utilities for the marketplace feature
 */

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * 
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

/**
 * Mock geocoding function (in a real app, you would use a geocoding service API)
 * 
 * @param address Address string like "City, State"
 * @returns Object with lat and lng properties
 */
export const geocodeAddress = (address: string): {lat: number, lng: number} => {
  // Mock coordinates for demonstration purposes
  const coordinates: {[key: string]: {lat: number, lng: number}} = {
    "Bengaluru, Karnataka": {lat: 12.9716, lng: 77.5946},
    "Mysuru, Karnataka": {lat: 12.2958, lng: 76.6394},
    "Chennai, Tamil Nadu": {lat: 13.0827, lng: 80.2707},
    "Hosur, Tamil Nadu": {lat: 12.7409, lng: 77.8253},
    "Electronic City, Bengaluru": {lat: 12.8399, lng: 77.6770},
    "Hyderabad, Telangana": {lat: 17.3850, lng: 78.4867},
    "Mumbai, Maharashtra": {lat: 19.0760, lng: 72.8777},
    "Delhi, Delhi": {lat: 28.7041, lng: 77.1025},
    "Kolkata, West Bengal": {lat: 22.5726, lng: 88.3639},
    "Pune, Maharashtra": {lat: 18.5204, lng: 73.8567},
  };
  
  // Return the coordinates for the address if it exists, or default to Bengaluru
  return coordinates[address] || {lat: 12.9716, lng: 77.5946};
};

/**
 * Calculate the distance between two addresses
 * 
 * @param address1 First address
 * @param address2 Second address
 * @returns Distance in kilometers
 */
export const calculateAddressDistance = (address1: string, address2: string): number => {
  const coord1 = geocodeAddress(address1);
  const coord2 = geocodeAddress(address2);
  
  return calculateDistance(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
};

/**
 * Get nearby locations based on a source address and maximum distance
 * 
 * @param sourceAddress Source address
 * @param addresses Array of addresses to check
 * @param maxDistance Maximum distance in kilometers
 * @returns Array of addresses within the specified distance, with their distances
 */
export const getNearbyLocations = (
  sourceAddress: string, 
  addresses: string[], 
  maxDistance: number
): Array<{address: string, distance: number}> => {
  return addresses
    .map(address => ({
      address,
      distance: calculateAddressDistance(sourceAddress, address)
    }))
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}; 