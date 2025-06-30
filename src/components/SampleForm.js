import React, { useState } from 'react';
import { Modal, ScrollView, Text, View, TextInput, Button, Alert } from 'react-native';
import { styles } from '../styles/AppStyles';

const SampleForm = ({ visible, onClose, onSave, location }) => {
  const [sampleData, setSampleData] = useState({
    id: '',
    notes: ''
  });

  const formatLocation = () => {
    if (!location) return 'GPS location required';
    
    const lat = location.coords.latitude.toFixed(6);
    const lon = location.coords.longitude.toFixed(6);
    const alt = location.coords.altitude ? location.coords.altitude.toFixed(1) : 'N/A';
    const acc = location.coords.accuracy ? location.coords.accuracy.toFixed(1) : 'N/A';
    
    return `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m\nAccuracy: ±${acc}m`;
  };

  const handleSave = () => {
    if (!sampleData.id.trim()) {
      Alert.alert('Error', 'Sample ID is required');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'GPS location is required');
      return;
    }

    onSave(sampleData);
    
    // Reset form
    setSampleData({
      id: '',
      notes: ''
    });
  };

  const handleClose = () => {
    // Reset form on close
    setSampleData({
      id: '',
      notes: ''
    });
    onClose();
  };

  const suggestSampleId = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const suggestedId = `S${dateStr}${timeStr}`;
    
    setSampleData(prev => ({
      ...prev,
      id: suggestedId
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={styles.modalContainer}>
        <Text style={styles.formTitle}>New Sample Collection</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Sample ID:</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              value={sampleData.id}
              onChangeText={(text) => setSampleData(prev => ({ ...prev, id: text }))}
              placeholder="Enter sample bottle ID"
              autoCapitalize="characters"
            />
            <Button 
              title="Suggest ID" 
              onPress={suggestSampleId}
              color="#007bff"
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Field Notes:</Text>
          <TextInput
            style={styles.textArea}
            value={sampleData.notes}
            onChangeText={(text) => setSampleData(prev => ({ ...prev, notes: text }))}
            placeholder="Weather conditions, observations, sampling method..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Collection Guidelines:</Text>
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelineText}>• Rinse bottle 3 times with sample water</Text>
            <Text style={styles.guidelineText}>• Fill bottle completely, minimize air bubbles</Text>
            <Text style={styles.guidelineText}>• Label immediately with waterproof marker</Text>
            <Text style={styles.guidelineText}>• Record exact collection time and conditions</Text>
          </View>
        </View>
        
        <View style={styles.locationBox}>
          <Text style={styles.locationLabel}>GPS Coordinates:</Text>
          <Text style={[
            styles.locationInfo, 
            !location && styles.locationError
          ]}>
            {formatLocation()}
          </Text>
          {!location && (
            <Text style={styles.locationWarning}>
              ⚠️ GPS location required for sample collection
            </Text>
          )}
        </View>
        
        <View style={styles.formButtons}>
          <View style={styles.buttonHalf}>
            <Button 
              title="Save Sample" 
              onPress={handleSave}
              disabled={!location || !sampleData.id.trim()}
            />
          </View>
          <View style={styles.buttonHalf}>
            <Button 
              title="Cancel" 
              onPress={handleClose} 
              color="red" 
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.helpText}>
            💡 Tip: Use the camera app to scan bottle barcodes, then copy/paste the number into the Sample ID field.
          </Text>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default SampleForm;