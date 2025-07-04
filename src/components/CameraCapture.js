import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, StyleSheet, Button, Text, Platform } from 'react-native';
import { Camera } from 'expo-camera';

const CameraCapture = ({ visible, onClose, onPhoto }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // Camera API not supported on web
        setHasPermission(false);
        return;
      }
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (onPhoto) onPhoto(photo);
      onClose && onClose();
    }
  };

  if (!visible) return null;

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.center}>
          <Text>Camera not supported on web</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </Modal>
    );
  }

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.center}><Text>Requesting camera permission...</Text></View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.center}>
          <Text>No access to camera</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <Camera
        style={{ flex: 1 }}
        ref={cameraRef}
        type={Camera.Constants.Type.back}
        onCameraReady={() => setCameraReady(true)}
      />
      {!cameraReady && (
        <View style={[styles.center, StyleSheet.absoluteFill]}>
          <Text>Loading camera...</Text>
        </View>
      )}
      <View style={styles.controls}>
        <Button title="Snap" onPress={takePhoto} />
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraCapture;
