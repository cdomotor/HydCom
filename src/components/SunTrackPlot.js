import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, G, Line } from 'react-native-svg';
import { styles } from '../styles/AppStyles';
import useSunTracks from '../hooks/useSunTracks';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

// Project spherical coordinates onto the SVG plane with optional device tilt
const polarToCartesian = (radius, azimuth, elevation, pitch = 0, roll = 0) => {
  const az = (azimuth - 90) * Math.PI / 180; // 0 deg at north
  const el = elevation * Math.PI / 180;
  const ph = pitch * Math.PI / 180;
  const rl = roll * Math.PI / 180;

  // Convert to Cartesian unit sphere
  let x = Math.cos(el) * Math.cos(az);
  let y = Math.cos(el) * Math.sin(az);
  let z = Math.sin(el);

  // Apply pitch (rotation around X)
  let y1 = y * Math.cos(ph) - z * Math.sin(ph);
  let z1 = y * Math.sin(ph) + z * Math.cos(ph);

  // Apply roll (rotation around Y)
  let x1 = x * Math.cos(rl) + z1 * Math.sin(rl);
  z = -x * Math.sin(rl) + z1 * Math.cos(rl);
  x = x1;
  y = y1;

  // Perspective projection
  const perspective = 2.5;
  const scale = 1 / (1 - z / perspective);

  return {
    x: radius + radius * x * scale,
    y: radius - radius * y * scale,
  };
};

const buildPath = (radius, points, pitch, roll) => {
  if (!points || points.length === 0) return '';
  return points
    .map((p, i) => {
      const { x, y } = polarToCartesian(radius, p.azimuth, p.elevation, pitch, roll);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
};

const buildFilledRegion = (radius, upper, lower, pitch, roll) => {
  if (!upper || !lower || upper.length === 0 || lower.length === 0) return '';
  const upperPath = upper.map((p, i) => {
    const { x, y } = polarToCartesian(radius, p.azimuth, p.elevation, pitch, roll);
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');
  const lowerPath = [...lower].reverse().map((p) => {
    const { x, y } = polarToCartesian(radius, p.azimuth, p.elevation, pitch, roll);
    return `L${x} ${y}`;
  }).join(' ');
  return `${upperPath} ${lowerPath} Z`;
};

const SunTrackPlot = ({ size = 220 }) => {
  const { tracks, currentSun, location } = useSunTracks();
  const { heading, pitch, roll } = useDeviceOrientation();
  const radius = size / 2;

  const midIdx = 12;
  const optimalAngle =
    tracks.summer[midIdx] && tracks.winter[midIdx]
      ? (tracks.summer[midIdx].elevation + tracks.winter[midIdx].elevation) / 2
      : null;

  return (
    <View style={[styles.section, { alignItems: 'center' }]}>
      <Text style={styles.sectionTitle}>Sun Tracks</Text>
      {!location && <Text>Getting GPS...</Text>}
      {location && (
        <View>
          <Svg width={size} height={size}>
            <G rotation={-heading} origin={`${radius}, ${radius}`}>
            {/* Horizon and guide lines */}
            <Circle cx={radius} cy={radius} r={radius} stroke="#ccc" strokeWidth={1} fill="none" />
            <Circle cx={radius} cy={radius} r={radius / 2} stroke="#eee" strokeWidth={1} fill="none" />
            <Line x1={radius} y1={0} x2={radius} y2={size} stroke="#ddd" />
            <Line x1={0} y1={radius} x2={size} y2={radius} stroke="#ddd" />
            {/* Sky dome between summer and winter tracks */}
            <Path
              d={buildFilledRegion(radius, tracks.summer, tracks.winter, pitch, roll)}
              fill="rgba(135,206,235,0.2)"
              stroke="none"
            />
            {/* Sun tracks */}
            <Path d={buildPath(radius, tracks.summer, pitch, roll)} stroke="#ff8c00" strokeWidth={2} fill="none" />
            <Path d={buildPath(radius, tracks.winter, pitch, roll)} stroke="#1e90ff" strokeWidth={2} fill="none" />
            <Path d={buildPath(radius, tracks.current, pitch, roll)} stroke="#2ecc71" strokeWidth={2} fill="none" />
            {currentSun && (
              (() => {
                const pos = polarToCartesian(
                  radius,
                  currentSun.azimuth,
                  currentSun.elevation,
                  pitch,
                  roll
                );
                return (
                  <>
                    <Circle cx={pos.x} cy={pos.y} r={4} fill="yellow" stroke="black" />
                    <Text
                      style={{ position: 'absolute', left: pos.x - 15, top: pos.y - 10, fontSize: 12 }}
                    >
                      ☀
                    </Text>
                  </>
                );
              })()
            )}
          </G>
        </Svg>
        </View>
      )}
      <Text style={{ marginTop: 5, fontSize: 12 }}>
        Pitch: {pitch.toFixed(1)}° Roll: {roll.toFixed(1)}°
      </Text>
      {optimalAngle !== null && (
        <Text style={{ marginTop: 2, fontSize: 12 }}>
          Optimal Panel Angle: {optimalAngle.toFixed(1)}°
        </Text>
      )}
    </View>
  );
};

export default SunTrackPlot;
