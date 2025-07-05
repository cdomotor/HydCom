import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { encryptString, decryptString } from '../utils/cryptoUtils';

const DATA_FILE = FileSystem.documentDirectory + 'samples.enc';

const useSamples = () => {
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const info = await FileSystem.getInfoAsync(DATA_FILE);
        if (info.exists) {
          const encrypted = await FileSystem.readAsStringAsync(DATA_FILE);
          const json = JSON.parse(decryptString(encrypted));
          setSamples(json);
        }
      } catch (e) {
        console.log('Failed to load samples', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        const encrypted = encryptString(JSON.stringify(samples));
        await FileSystem.writeAsStringAsync(DATA_FILE, encrypted);
      } catch (e) {
        console.log('Failed to save samples', e);
      }
    };
    save();
  }, [samples]);

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