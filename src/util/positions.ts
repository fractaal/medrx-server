export interface Location {
  lat: number;
  lng: number;
}

// Converts degrees to radians:
const degreesToRadians = (deg: number) => deg * (Math.PI / 180);

// Returns distance from two sets of latitude and longitude coordinates in km.
export const getDistance = (locationA: Location, locationB: Location) => {
  const earthRadiusKm = 6371;

  const lat1 = degreesToRadians(locationA.lat);
  const lat2 = degreesToRadians(locationB.lat);
  const lng1 = degreesToRadians(locationA.lng);
  const lng2 = degreesToRadians(locationB.lng);

  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};
