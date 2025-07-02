import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, G, Line } from 'react-native-svg';
import { styles } from '../styles/AppStyles';
import useSunTracks from '../hooks/useSunTracks';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const polarToCartesian = (radius, azimuth, elevation) => {
  const r = radius * (1 - Math.max(elevation, -90) / 90);
  const angle = (azimuth - 90) * Math.PI / 180; // 0 deg at north
  return {
    x: radius + r * Math.cos(angle),
    y: radius + r * Math.sin(angle),
  };
};

const buildPath = (radius, points) => {
  if (!points || points.length === 0) return '';
  return points
    .map((p, i) => {
      const { x, y } = polarToCartesian(radius, p.azimuth, p.elevation);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
};

const SunTrackPlot = ({ size = 220 }) => {
  const { tracks, currentSun, location } = useSunTracks();
  const { heading, pitch, roll } = useDeviceOrientation();
  const radius = size / 2;

  return (
    <View style={[styles.section, { alignItems: 'center' }]}>
      <Text style={styles.sectionTitle}>Sun Tracks</Text>
      {!location && <Text>Getting GPS...</Text>}
      {location && (
        <View
          style={{
            transform: [
              { perspective: 600 },
              { rotateX: `${pitch}deg` },
              { rotateY: `${roll}deg` },
            ],
          }}
        >
          <Svg width={size} height={size}>
            <G rotation={-heading} origin={`${radius}, ${radius}`}>
            {/* Horizon and guide lines */}
            <Circle cx={radius} cy={radius} r={radius} stroke="#ccc" strokeWidth={1} fill="none" />
            <Circle cx={radius} cy={radius} r={radius / 2} stroke="#eee" strokeWidth={1} fill="none" />
            <Line x1={radius} y1={0} x2={radius} y2={size} stroke="#ddd" />
            <Line x1={0} y1={radius} x2={size} y2={radius} stroke="#ddd" />
            {/* Sun tracks */}
            <Path d={buildPath(radius, tracks.summer)} stroke="#ff8c00" strokeWidth={2} fill="none" />
            <Path d={buildPath(radius, tracks.winter)} stroke="#1e90ff" strokeWidth={2} fill="none" />
            <Path d={buildPath(radius, tracks.current)} stroke="#2ecc71" strokeWidth={2} fill="none" />
            {currentSun && (
              <>
                <Circle
                  cx={polarToCartesian(radius, currentSun.azimuth, currentSun.elevation).x}
                  cy={polarToCartesian(radius, currentSun.azimuth, currentSun.elevation).y}
                  r={4}
                  fill="yellow"
                  stroke="black"
                />
                <Text
                  style={{ position: 'absolute', left: radius - 15, top: radius - 10, fontSize: 12 }}
                >
                  ☀
                </Text>
              </>
            )}
          </G>
        </Svg>
        </View>
      )}
      <Text style={{ marginTop: 5, fontSize: 12 }}>
        Pitch: {pitch.toFixed(1)}° Roll: {roll.toFixed(1)}°
      </Text>
    </View>
  );
};

export default SunTrackPlot;
