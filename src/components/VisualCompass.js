import React from 'react';
import { View, Text } from 'react-native';
import { compassStyles } from '../styles/CompassStyles';

const VisualCompass = ({ location, size = 120 }) => {
  const hasHeading = location && 
                   location.coords && 
                   location.coords.heading !== null && 
                   location.coords.heading !== undefined;

  const heading = hasHeading ? location.coords.heading : 0;

  // Rotate the compass rose based solely on the magnetic heading
  const roseRotation = heading;

  return (
    <View style={[compassStyles.compassContainer, { alignItems: 'center' }]}>
      <View style={[compassStyles.compassRose, { width: size, height: size }]}>
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
          {/* Degree Markings and Cardinal Labels */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => {
            const cardinal = {0: 'N', 90: 'E', 180: 'S', 270: 'W'}[degree];
            const baseStyle = {
              position: 'absolute',
              left: size / 2,
              top: size / 2,
              transform: [
                { translateX: -size / 2 },
                { translateY: -size / 2 },
                { rotate: `${degree}deg` },
                { translateY: -size / 2 + 20 },
              ],
            };
            if (cardinal) {
              return (
                <Text
                  key={degree}
                  style={[baseStyle, compassStyles.cardinalLabel, { transform: [...baseStyle.transform, { rotate: `${-degree}deg` }] }]}
                >
                  {cardinal}
                </Text>
              );
            }
            return (
              <View
                key={degree}
                style={[baseStyle, compassStyles.degreeMark]}
              />
            );
          })}
        </View>

        {/* Center Dot */}
        <View style={compassStyles.compassCenter} />
      </View>

      {!hasHeading && (
        <View style={compassStyles.compassReadout}>
          <Text style={compassStyles.compassWarning}>
            ⚠️ Move device to activate compass
          </Text>
        </View>
      )}
    </View>
  );
};

export default VisualCompass;
