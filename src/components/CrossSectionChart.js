import React from 'react';
import { View, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory-native';
import { styles } from '../styles/AppStyles';

const CrossSectionChart = ({ points = [] }) => {
  if (!points || points.length === 0) return <Text>No survey data</Text>;

  // Sort points by distance
  const sorted = [...points].sort((a, b) => a.distance - b.distance);

  // Prepare datasets
  const elevationData = sorted.map(p => ({ x: p.distance, y: p.elevation }));
  const waterLevelData = sorted.map(p => ({ x: p.distance, y: p.waterLevel }));

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
