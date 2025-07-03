import React from 'react';
import { View, Text, Platform } from 'react-native';

// Use web Victory package when running in a web environment
const Victory = Platform.OS === 'web' ? require('victory') : require('victory-native');
const {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} = Victory;
import { styles } from '../styles/AppStyles';

const CrossSectionChart = ({ points = [] }) => {
  if (!points || points.length < 2) {
    return <Text>Need at least 2 points</Text>;
  }

  let valid = [];
  try {
    // Coerce numeric strings to numbers and filter out invalid values
    valid = points
      .map((p) => ({
        distance: typeof p.distance === 'string' ? parseFloat(p.distance) : p.distance,
        elevation: typeof p.elevation === 'string' ? parseFloat(p.elevation) : p.elevation,
        waterLevel: typeof p.waterLevel === 'string' ? parseFloat(p.waterLevel) : p.waterLevel,
      }))
      .filter(
        (p) =>
          typeof p.distance === 'number' && !isNaN(p.distance) &&
          typeof p.elevation === 'number' && !isNaN(p.elevation) &&
          typeof p.waterLevel === 'number' && !isNaN(p.waterLevel)
      );
    // Remove duplicate distance entries which can cause rendering errors
    valid = valid.filter(
      (p, idx, arr) =>
        arr.findIndex((q) => q.distance === p.distance) === idx
    );
  } catch (e) {
    return <Text>Invalid survey data</Text>;
  }

  if (valid.length < 2) {
    return <Text>Insufficient valid points</Text>;
  }

  let sorted = [];
  let elevationData = [];
  let waterLevelData = [];
  try {
    // Sort points by distance
    sorted = [...valid].sort((a, b) => a.distance - b.distance);

    // Prepare datasets
    elevationData = sorted.map((p) => ({ x: p.distance, y: p.elevation }));
    waterLevelData = sorted.map((p) => ({ x: p.distance, y: p.waterLevel }));
  } catch (err) {
    return <Text>Unable to render chart</Text>;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📉 Cross Section Profile</Text>
      <VictoryChart
        height={300}
        theme={VictoryTheme.material}
        domainPadding={{ x: 20, y: 20 }}
      >
        <VictoryAxis label="Distance (m)" />
        <VictoryAxis dependentAxis label="Elevation (m)" />

        {/* Ground Elevation Line */}
        <VictoryLine
          data={elevationData}
          style={{ data: { stroke: "#2c3e50", strokeWidth: 2 } }}
        />

        {/* Water Surface Line */}
        <VictoryLine
          data={waterLevelData}
          style={{ data: { stroke: "#3498db", strokeDasharray: "5,5" } }}
        />

        {/* Points */}
        <VictoryScatter
          data={elevationData}
          size={3}
          style={{ data: { fill: "#2c3e50" } }}
        />
      </VictoryChart>
    </View>
  );
};

export default CrossSectionChart;
