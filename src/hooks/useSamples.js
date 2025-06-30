import { useState } from 'react';
import { Alert } from 'react-native';

const useSamples = () => {
  const [samples, setSamples] = useState([]);

  const addSample = (sampleData, location) => {
    if (!location) {
      Alert.alert('Error', 'GPS location required');
      return false;
    }

    if (!sampleData.id.trim()) {
      Alert.alert('Error', 'Sample ID required');
      return false;
    }

    const newSample = {
      id: sampleData.id.trim(),
      notes: sampleData.notes.trim(),
      timestamp: new Date().toLocaleString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      dateCreated: new Date().toISOString(),
    };

    setSamples(prev => [...prev, newSample]);
    Alert.alert('Success', `Sample ${newSample.id} saved!`);
    return true;
  };

  const removeSample = (index) => {
    setSamples(prev => prev.filter((_, i) => i !== index));
  };

  const updateSample = (index, updatedData) => {
    setSamples(prev => prev.map((sample, i) => 
      i === index ? { ...sample, ...updatedData } : sample
    ));
  };

  const getSampleById = (id) => {
    return samples.find(sample => sample.id === id);
  };

  const getSamplesByDate = (date) => {
    return samples.filter(sample => 
      sample.dateCreated.startsWith(date)
    );
  };

  const clearAllSamples = () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to delete all samples? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => setSamples([])
        }
      ]
    );
  };

  return {
    samples,
    addSample,
    removeSample,
    updateSample,
    getSampleById,
    getSamplesByDate,
    clearAllSamples,
    sampleCount: samples.length,
  };
};

export default useSamples;