import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const INITIAL_DELTA = 0.01; // roughly zoom level 15

const LocationMap = ({ location }) => {
  if (!location) {
    return <Text style={styles.loadingText}>Waiting for location...</Text>;
  }

  const { latitude, longitude } = location.coords ? location.coords : location;
  const [region, setRegion] = useState({
    latitude,
    longitude,
    latitudeDelta: INITIAL_DELTA,
    longitudeDelta: INITIAL_DELTA,
  });

  useEffect(() => {
    setRegion({
      latitude,
      longitude,
      latitudeDelta: INITIAL_DELTA,
      longitudeDelta: INITIAL_DELTA,
    });
  }, [latitude, longitude]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
});

export default LocationMap;
