import React from 'react';
import { View, Text, Button } from 'react-native';
import { styles } from '../styles/AppStyles';
import { getMagneticDeclination } from '../utils/gpsUtils';
import VisualCompass from './VisualCompass';

const GPSStatus = ({ location, onRefresh, watchingPosition, toggleWatching }) => {
  const formatLocation = () => {
    if (!location) return 'Getting GPS...';
    
    const lat = location.coords.latitude.toFixed(6);
    const lon = location.coords.longitude.toFixed(6);
    const alt = location.coords.altitude ? location.coords.altitude.toFixed(1) : 'N/A';
    const acc = location.coords.accuracy ? location.coords.accuracy.toFixed(1) : 'N/A';
    
    return `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m\nAccuracy: ±${acc}m`;
  };

  const formatCompass = () => {
    if (!location || location.coords.heading === null || location.coords.heading === undefined) {
      return 'Heading: N/A';
    }
    
    const heading = location.coords.heading;
    const magneticDeclination = getMagneticDeclination(
      location.coords.latitude, 
      location.coords.longitude
    );
    const trueHeading = (heading + magneticDeclination + 360) % 360;
    
    // Convert heading to cardinal direction
    const getCardinalDirection = (degrees) => {
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                         'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const index = Math.round(degrees / 22.5) % 16;
      return directions[index];
    };

    return `Magnetic: ${heading.toFixed(0)}° ${getCardinalDirection(heading)}\nTrue: ${trueHeading.toFixed(0)}° ${getCardinalDirection(trueHeading)}\nDeclination: ${magneticDeclination.toFixed(1)}°`;
  };

  const getAccuracyStatus = () => {
    if (!location || !location.coords.accuracy) return 'unknown';
    
    const accuracy = location.coords.accuracy;
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'good';
    if (accuracy <= 20) return 'fair';
    return 'poor';
  };

  const getAccuracyColor = () => {
    const status = getAccuracyStatus();
    switch (status) {
      case 'excellent': return '#28a745';
      case 'good': return '#28a745';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCompassIndicator = () => {
    if (!location || location.coords.heading === null || location.coords.heading === undefined) {
      return '🧭';
    }
    
    const heading = location.coords.heading;
    // Simple compass needle representation
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>GPS & Location</Text>
      
      {/* GPS Coordinates */}
      <View style={[styles.locationText, { borderLeftColor: getAccuracyColor(), borderLeftWidth: 4 }]}>
        <Text style={styles.locationCoordinates}>{formatLocation()}</Text>
        {location && (
          <Text style={[styles.accuracyStatus, { color: getAccuracyColor() }]}>
            Status: {getAccuracyStatus().toUpperCase()}
            {watchingPosition && ' • LIVE'}
          </Text>
        )}
      </View>

      {/* Visual Compass */}
      <VisualCompass location={location} size={100} />

      {/* Digital Compass Display */}
      <View style={[styles.compassContainer]}>
        <View style={styles.compassHeader}>
          <Text style={styles.compassTitle}>
            {getCompassIndicator()} Digital Compass
          </Text>
        </View>
        <Text style={styles.compassReadings}>{formatCompass()}</Text>
        {location && location.coords.heading !== null && location.coords.heading !== undefined && (
          <Text style={styles.compassNote}>
            💡 Live tracking: {watchingPosition ? 'ON' : 'OFF'}
          </Text>
        )}
        {(!location || location.coords.heading === null || location.coords.heading === undefined) && (
          <Text style={styles.compassWarning}>
            ⚠️ Compass requires device movement
          </Text>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonGrid}>
        <View style={styles.buttonHalf}>
          <Button title="Refresh GPS" onPress={onRefresh} />
        </View>
        <View style={styles.buttonHalf}>
          <Button 
            title={watchingPosition ? "Stop Live" : "Start Live"} 
            onPress={toggleWatching}
            color={watchingPosition ? "#dc3545" : "#28a745"}
          />
        </View>
      </View>
    </View>
  );
};

export default GPSStatus;