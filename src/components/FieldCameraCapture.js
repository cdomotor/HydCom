import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { getCardinalDirection } from '../utils/gpsUtils';

const FieldCameraCapture = ({ visible, onClose }) => {
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [annotatedUri, setAnnotatedUri] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(mediaStatus.status === 'granted');
    })();
  }, []);

  useEffect(() => {
    let subscription = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 1, timeInterval: 1000 },
          loc => setLocation(loc)
        );
      }
    })();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photoData = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: true });
    setPhoto({ uri: photoData.uri, data: captureMeta() });
  };

  const captureMeta = () => {
    if (!location) return null;
    const { latitude, longitude, accuracy, heading } = location.coords;
    return {
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      accuracy: accuracy ? accuracy.toFixed(1) : 'N/A',
      heading: heading !== null && heading !== undefined ? heading.toFixed(0) : 'N/A',
      cardinal: heading !== null && heading !== undefined ? getCardinalDirection(heading) : 'N/A',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
  };

  const saveAnnotated = async () => {
    if (!viewShotRef.current || !hasMediaPermission) return;
    const uri = await viewShotRef.current.capture();
    setAnnotatedUri(uri);
    await MediaLibrary.saveToLibraryAsync(uri);
    reset();
  };

  const reset = () => {
    setPhoto(null);
    setAnnotatedUri(null);
    setNote('');
  };

  if (hasCameraPermission === null) {
    return null;
  }
  if (hasCameraPermission === false) {
    return <Modal visible={visible}><View style={styles.permission}><Text>No access to camera</Text></View></Modal>;
  }

  const meta = photo ? photo.data : captureMeta();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {photo ? (
        <View style={styles.previewContainer}>
          <ViewShot style={styles.flex} ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
            <Image source={{ uri: photo.uri }} style={styles.image} />
            {meta && (
              <>
                <View style={[styles.overlayBox, styles.topLeft]}>
                  <Text style={styles.overlayText}>Lat: {meta.latitude}</Text>
                  <Text style={styles.overlayText}>Lon: {meta.longitude}</Text>
                  <Text style={styles.overlayText}>±{meta.accuracy}m</Text>
                </View>
                <View style={[styles.overlayBox, styles.topRight]}>
                  <Text style={styles.overlayText}>{meta.heading}° {meta.cardinal}</Text>
                </View>
                <View style={[styles.overlayBox, styles.bottomLeft]}>
                  <Text style={styles.noteText}>{meta.note || note}</Text>
                </View>
                <View style={[styles.overlayBox, styles.bottomRight]}>
                  <Text style={styles.overlayText}>{meta.timestamp}</Text>
                </View>
              </>
            )}
          </ViewShot>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={saveAnnotated}>
              <Text style={styles.buttonLabel}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={reset}>
              <Text style={styles.buttonLabel}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} ref={cameraRef} />
          {meta && (
            <>
              <View style={[styles.overlayBox, styles.topLeft]}>
                <Text style={styles.overlayText}>Lat: {meta.latitude}</Text>
                <Text style={styles.overlayText}>Lon: {meta.longitude}</Text>
                <Text style={styles.overlayText}>±{meta.accuracy}m</Text>
              </View>
              <View style={[styles.overlayBox, styles.topRight]}>
                <Text style={styles.overlayText}>{meta.heading}° {meta.cardinal}</Text>
              </View>
            </>
          )}
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note..."
            placeholderTextColor="#ccc"
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <Text style={styles.buttonLabel}>Capture</Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  permission: { flex:1, justifyContent:'center', alignItems:'center' },
  cameraContainer: { flex: 1, justifyContent:'flex-end' },
  camera: { flex: 1 },
  noteInput: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#0f0',
    padding: 8,
    borderRadius: 4,
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonLabel: { color: '#0f0', fontSize: 16 },
  previewContainer: { flex:1, backgroundColor:'#000' },
  image: { flex:1 },
  buttonRow: { flexDirection:'row', justifyContent:'space-around', padding:15 },
  button: { backgroundColor:'#000', padding:10, borderRadius:5 },
  overlayBox: {
    position:'absolute',
    backgroundColor:'rgba(0,0,0,0.6)',
    padding:4,
    borderRadius:4,
  },
  overlayText: { color:'#0f0', fontSize:12 },
  noteText: { color:'#0f0', fontSize:14 },
  topLeft: { top:10, left:10 },
  topRight: { top:10, right:10, alignItems:'flex-end' },
  bottomLeft: { bottom:10, left:10, maxWidth:'70%' },
  bottomRight: { bottom:10, right:10, alignItems:'flex-end' },
});

export default FieldCameraCapture;
