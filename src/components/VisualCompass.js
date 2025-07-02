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
            if (cardinal) {
              return (
                <Text
                  key={degree}
                  style={[
                    compassStyles.cardinalLabel,
                    {
                      transform: [
                        { rotate: `${degree}deg` },
                        { translateY: -size/2 + 20 },
                        { rotate: `${-degree}deg` }
                      ]
                    }
                  ]}
                >
                  {cardinal}
                </Text>
              );
            }
            return (
              <View
                key={degree}
                style={[
                  compassStyles.degreeMark,
                  {
                    transform: [
                      { rotate: `${degree}deg` },
                      { translateY: -size/2 + 20 }
                    ]
                  }
                ]}
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
