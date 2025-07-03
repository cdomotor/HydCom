# Hydrographer's Companion App - Expo Development Guide

## Pre-Requirements Check

Before starting, ensure you have:
- **Windows PC** (any version from Windows 10+)
- **iPhone** with iOS 13.0 or later
- **Internet connection** for initial setup
- **2-3 hours** for complete setup

## Phase 1: Environment Setup (30 minutes)

### Step 1: Install Node.js
1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (Long Term Support)
3. Run the installer with default settings
4. Open **Command Prompt** and verify installation:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers like `v20.x.x` and `9.x.x`

### Step 2: Install Expo CLI
1. In Command Prompt, run:
   ```bash
   npm install -g @expo/cli
   ```
2. Verify installation:
   ```bash
   expo --version
   ```

### Step 3: Create Your Project
1. Navigate to where you want your project (e.g., Desktop):
   ```bash
   cd Desktop
   ```
2. Create your app:
   ```bash
   npx create-expo-app HydrographerCompanion --template blank
   ```
3. Navigate into your project:
   ```bash
   cd HydrographerCompanion
   ```

### Step 4: Install Expo Go on iPhone
1. Open **App Store** on your iPhone
2. Search for "**Expo Go**"
3. Install the free Expo Go app
4. Open it and create a free account (or sign in)

## Phase 2: First Test (15 minutes)

### Step 5: Run Your First App
1. In Command Prompt (in your project folder):
   ```bash
   npx expo start
   ```
2. A QR code will appear in your terminal
3. On your iPhone:
   - Open **Expo Go** app
   - Tap "**Scan QR Code**"
   - Point camera at the QR code on your computer screen
4. Your app should load on your iPhone showing "Open up App.js to start working on your app!"

**🎉 Congratulations! You're now developing iOS apps on Windows!**

## Phase 3: Add Core Features (2-3 hours)

### Step 6: Install Required Packages
Stop your current app (Ctrl+C in Command Prompt), then install packages:
```bash
expo install expo-location expo-camera expo-barcode-scanner expo-sqlite expo-file-system expo-media-library
```

### Step 7: Update App.js - Basic Structure
Replace the contents of `App.js` with this starter code:

```javascript
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const refreshLocation = async () => {
    let newLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation(newLocation);
  };

  let text = 'Waiting for location...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude.toFixed(6)}\nLon: ${location.coords.longitude.toFixed(6)}\nAlt: ${location.coords.altitude?.toFixed(1) || 'N/A'}m\nAccuracy: ${location.coords.accuracy?.toFixed(1) || 'N/A'}m`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hydrographer's Companion</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Location</Text>
        <Text style={styles.locationText}>{text}</Text>
        <Button title="Refresh Location" onPress={refreshLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'monospace',
  },
});
```

### Step 8: Test GPS Functionality
1. Save the file
2. Run: `npx expo start`
3. Scan QR code with Expo Go
4. **Grant location permissions** when prompted
5. You should see your current GPS coordinates!

### Step 9: Add Barcode Scanner
Create a new file called `BarcodeScanner.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function BarcodeScanner({ onBarcodeScan, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert(
      'Barcode Scanned!',
      `Type: ${type}\nData: ${data}`,
      [
        { text: 'Scan Another', onPress: () => setScanned(false) },
        { text: 'Use This ID', onPress: () => { onBarcodeScan(data); onClose(); } }
      ]
    );
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.instruction}>Point camera at barcode</Text>
        <Button title="Cancel" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
});
```

### Step 10: Update App.js with Sample Collection
Replace `App.js` with this enhanced version:

```javascript
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView, TextInput, Modal } from 'react-native';
import * as Location from 'expo-location';
import BarcodeScanner from './BarcodeScanner';

export default function App() {
  const [location, setLocation] = useState(null);
  const [samples, setSamples] = useState([]);
  const [currentSample, setCurrentSample] = useState({ id: '', notes: '' });
  const [showScanner, setShowScanner] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location access is required for GPS coordinates');
        return;
      }
      await refreshLocation();
    })();
  }, []);

  const refreshLocation = async () => {
    try {
      let newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(newLocation);
    } catch (error) {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const startSampleCollection = () => {
    setIsCollecting(true);
    setCurrentSample({ id: '', notes: '' });
    refreshLocation();
  };

  const handleBarcodeScan = (data) => {
    setCurrentSample({ ...currentSample, id: data });
  };

  const saveSample = () => {
    if (!currentSample.id.trim()) {
      Alert.alert('Error', 'Please enter or scan a sample ID');
      return;
    }
    
    if (!location) {
      Alert.alert('Error', 'GPS location required');
      return;
    }

    const newSample = {
      id: currentSample.id,
      notes: currentSample.notes,
      timestamp: new Date().toISOString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
    };

    setSamples([...samples, newSample]);
    setIsCollecting(false);
    Alert.alert('Success', `Sample ${currentSample.id} saved!`);
  };

  const exportSamples = () => {
    if (samples.length === 0) {
      Alert.alert('No Data', 'No samples to export');
      return;
    }

    let exportText = 'Sample_ID,Timestamp,Latitude,Longitude,Altitude,Accuracy,Notes\n';
    samples.forEach(sample => {
      exportText += `${sample.id},${sample.timestamp},${sample.latitude},${sample.longitude},${sample.altitude || ''},${sample.accuracy || ''},${sample.notes}\n`;
    });

    // For now, just show in alert (later we'll add file export)
    Alert.alert('Export Data', exportText.substring(0, 500) + '...');
  };

  const formatLocation = () => {
    if (!location) return 'Getting GPS...';
    return `Lat: ${location.coords.latitude.toFixed(6)}\nLon: ${location.coords.longitude.toFixed(6)}\nAlt: ${location.coords.altitude?.toFixed(1) || 'N/A'}m\nAccuracy: ±${location.coords.accuracy?.toFixed(1) || 'N/A'}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hydrographer's Companion</Text>
      
      {/* GPS Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Location</Text>
        <Text style={styles.locationText}>{formatLocation()}</Text>
        <Button title="Refresh GPS" onPress={refreshLocation} />
      </View>

      {/* Sample Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sample Collection</Text>
        {!isCollecting ? (
          <Button title="Start New Sample" onPress={startSampleCollection} />
        ) : (
          <View>
            <Text style={styles.label}>Sample ID:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={currentSample.id}
                onChangeText={(text) => setCurrentSample({ ...currentSample, id: text })}
                placeholder="Enter or scan ID"
              />
              <Button title="Scan" onPress={() => setShowScanner(true)} />
            </View>
            
            <Text style={styles.label}>Notes:</Text>
            <TextInput
              style={styles.textArea}
              value={currentSample.notes}
              onChangeText={(text) => setCurrentSample({ ...currentSample, notes: text })}
              placeholder="Field notes, conditions, etc."
              multiline
            />
            
            <View style={styles.buttonRow}>
              <Button title="Save Sample" onPress={saveSample} />
              <Button title="Cancel" onPress={() => setIsCollecting(false)} color="red" />
            </View>
          </View>
        )}
      </View>

      {/* Samples List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collected Samples ({samples.length})</Text>
        {samples.map((sample, index) => (
          <View key={index} style={styles.sampleItem}>
            <Text style={styles.sampleId}>{sample.id}</Text>
            <Text style={styles.sampleDetails}>
              {new Date(sample.timestamp).toLocaleString()}
            </Text>
            <Text style={styles.sampleDetails}>
              {sample.latitude.toFixed(6)}, {sample.longitude.toFixed(6)}
            </Text>
          </View>
        ))}
        {samples.length > 0 && <Button title="Export Data" onPress={exportSamples} />}
      </View>

      {/* Barcode Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <BarcodeScanner 
          onBarcodeScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
  },
  locationText: {
    fontSize: 14,
    marginBottom: 15,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  sampleItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sampleId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sampleDetails: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
});
```

## Phase 4: Test Your App (30 minutes)

### Step 11: Full App Test
1. Save all files
2. Run: `npx expo start`
3. Test on your iPhone:
   - ✅ GPS coordinates should display
   - ✅ "Start New Sample" should work
   - ✅ Barcode scanner should open camera
   - ✅ Manual ID entry should work
   - ✅ Save sample should add to list
   - ✅ Export should show data preview

### Step 12: Test with Real Barcode
1. Find any barcode (product, book, etc.)
2. Tap "Scan" in your app
3. Grant camera permission
4. Point camera at barcode
5. Should recognize and fill in ID automatically

## What You've Built

**Congratulations!** You now have a working prototype with:
- ✅ Real-time GPS coordinates
- ✅ Barcode scanning
- ✅ Sample ID collection
- ✅ GPS coordinates saved with each sample
- ✅ Notes field
- ✅ Basic export functionality
- ✅ All running on your iPhone!

## Next Steps

**This Weekend**: Test in the field, take notes on what you need
**Next Week**: Add camera functionality, database storage, file export
**Following Week**: Add survey tools, improve UI

## Troubleshooting

**QR Code won't scan?**
- Make sure iPhone and computer are on same WiFi
- Try running: `npx expo start --tunnel`

**Location not working?**
- Check iPhone Settings > Privacy > Location Services > Expo Go > Always

**Barcode scanner black screen?**
- Grant camera permission in iPhone Settings > Expo Go > Camera
- If the screen stays blank, reinstall the camera module and restart Expo:

  ```bash
  expo install expo-camera
  npx expo start -c
  ```

**App crashes?**
- Check Command Prompt for error messages
- Most issues are typos in code

## Development Tips

**Live Reload**: Changes to your code automatically appear on your iPhone
**Debugging**: Shake your iPhone to open debug menu
**Logs**: Check Command Prompt for error messages
**Backup**: Copy your project folder regularly

Ready to test your first field hydrography app? The beauty of Expo is you can make changes on your Windows PC and instantly see them on your iPhone!