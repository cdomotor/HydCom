import React from 'react';
import { View, Text } from 'react-native';
import { compassStyles } from '../styles/CompassStyles';
import { getMagneticDeclination, getCardinalDirection } from '../utils/gpsUtils';

const VisualCompass = ({ location, size = 120 }) => {
  const hasHeading = location && 
                   location.coords && 
                   location.coords.heading !== null && 
                   location.coords.heading !== undefined;

  const heading = hasHeading ? location.coords.heading : 0;
  const declination = location ? getMagneticDeclination(location.coords.latitude, location.coords.longitude) : 0;
  const trueHeading = (heading + declination + 360) % 360;

  // Calculate needle rotation (we want the needle to point where we're heading)
  const needleRotation = heading;
  
  // Calculate compass rose rotation (we want north to stay at top relative to device orientation)
  const roseRotation = -heading; // Rotate compass rose opposite to heading

  return (
    <View style={[compassStyles.compassContainer, { alignItems: 'center' }]}>
      <Text style={compassStyles.compassTitle}>🧭 Visual Compass</Text>
      
      <View style={[compassStyles.compassRose, { width: size, height: size }]}>
        {/* Compass Rose Background */}
        <View 
          style={[
            compassStyles.compassRoseInner, 
            { 
              width: size, 
              height: size,
              transform: [{ rotate: `${roseRotation}deg` }]
            }
          ]}
        >
          {/* North Marker */}
          <View style={[compassStyles.compassMarker, compassStyles.northMarker, { top: 5 }]}>
            <Text style={compassStyles.compassCardinal}>N</Text>
          </View>
          
          {/* East Marker */}
          <View style={[compassStyles.compassMarker, compassStyles.eastMarker, { right: 5, top: '45%' }]}>
            <Text style={compassStyles.compassCardinal}>E</Text>
          </View>
          
          {/* South Marker */}
          <View style={[compassStyles.compassMarker, compassStyles.southMarker, { bottom: 5 }]}>
            <Text style={compassStyles.compassCardinal}>S</Text>
          </View>
          
          {/* West Marker */}
          <View style={[compassStyles.compassMarker, compassStyles.westMarker, { left: 5, top: '45%' }]}>
            <Text style={compassStyles.compassCardinal}>W</Text>
          </View>

          {/* Degree Markings */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => (
            <View
              key={degree}
              style={[
                compassStyles.degreeMark,
                {
                  transform: [
                    { rotate: `${degree}deg` },
                    { translateY: -size/2 + 15 }
                  ]
                }
              ]}
            />
          ))}
        </View>
        
        {/* Center Dot */}
        <View style={compassStyles.compassCenter} />
        
        {/* Needle */}
        <View 
          style={[
            compassStyles.compassNeedle, 
            { 
              transform: [{ rotate: `${needleRotation}deg` }]
            }
          ]}
        >
          {/* North end of needle (red) */}
          <View style={compassStyles.needleNorth} />
          {/* South end of needle (white) */}
          <View style={compassStyles.needleSouth} />
        </View>
      </View>

      {/* Digital Readout */}
      <View style={compassStyles.compassReadout}>
        <Text style={compassStyles.compassHeading}>
          {hasHeading ? `${heading.toFixed(0)}°` : '---°'}
        </Text>
        <Text style={compassStyles.compassDirection}>
          {hasHeading ? getCardinalDirection(heading) : 'N/A'}
        </Text>
        <Text style={compassStyles.compassTrue}>
          True: {hasHeading ? `${trueHeading.toFixed(0)}°` : '---°'}
        </Text>
      </View>
      
      {!hasHeading && (
        <Text style={compassStyles.compassWarning}>
          ⚠️ Move device to activate compass
        </Text>
      )}
    </View>
  );
};

export default VisualCompass;