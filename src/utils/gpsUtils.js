// Add these functions to your existing gpsUtils.js file:

/**
 * Calculate magnetic declination (basic implementation for Australia)
 */
export const getMagneticDeclination = (latitude, longitude, year = new Date().getFullYear()) => {
  // Basic calculation for Australia - for production, use NOAA World Magnetic Model
  // This is a simplified approximation
  const baseDeclination = 10; // Approximate for eastern Australia
  const latitudeAdjustment = (latitude + 25) * 0.1;
  const longitudeAdjustment = (longitude - 145) * 0.05;
  
  return baseDeclination + latitudeAdjustment + longitudeAdjustment;
};

/**
 * Convert compass heading to cardinal direction
 */
export const getCardinalDirection = (degrees) => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

/**
 * Convert magnetic heading to true heading
 */
export const magneticToTrue = (magneticHeading, declination) => {
  return (magneticHeading + declination + 360) % 360;
};

/**
 * Convert true heading to magnetic heading
 */
export const trueToMagnetic = (trueHeading, declination) => {
  return (trueHeading - declination + 360) % 360;
};

/**
 * Get compass needle emoji for heading
 */
export const getCompassEmoji = (heading) => {
  if (heading === null || heading === undefined) return '🧭';
  
  if (heading >= 337.5 || heading < 22.5) return '⬆️'; // N
  if (heading >= 22.5 && heading < 67.5) return '↗️';   // NE
  if (heading >= 67.5 && heading < 112.5) return '➡️';  // E
  if (heading >= 112.5 && heading < 157.5) return '↘️'; // SE
  if (heading >= 157.5 && heading < 202.5) return '⬇️'; // S
  if (heading >= 202.5 && heading < 247.5) return '↙️'; // SW
  if (heading >= 247.5 && heading < 292.5) return '⬅️'; // W
  if (heading >= 292.5 && heading < 337.5) return '↖️'; // NW
  return '🧭';
};

/**
 * Check if compass is available and calibrated
 */
export const isCompassAvailable = (location) => {
  return location &&
         location.coords &&
         location.coords.heading !== null &&
         location.coords.heading !== undefined;
};

/**
 * Attempt to fetch geoid offset to convert WGS84 altitude to AHD.
 * Returns 0 on failure.
 */
export const fetchGeoidOffset = async (latitude, longitude) => {
  try {
    const url = `https://ausgeoid.ga.gov.au/gda2020?latitude=${latitude}&longitude=${longitude}&output=json`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && typeof data.geoidHeight === 'number') {
      return data.geoidHeight;
    }
  } catch (err) {
    console.warn('Failed to fetch geoid offset', err.message);
  }
  return 0;
};

/**
 * Convert ellipsoidal altitude to approximate AHD elevation.
 */
export const convertToAhd = async (latitude, longitude, altitude) => {
  const offset = await fetchGeoidOffset(latitude, longitude);
  return altitude - offset;
};