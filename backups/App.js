import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Modal, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [samples, setSamples] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [currentSample, setCurrentSample] = useState({ id: '', notes: '' });
  const [currentSurvey, setCurrentSurvey] = useState({
    id: '',
    notes: '',
    points: [],
    width: 0,
    maxDepth: 0,
    avgDepth: 0,
    startElevation: null,
    endElevation: null,
    misclose: null,
    miscloseTolerance: 0.01,
    instrumentHeight: null,
    changePoints: []
  });
  const [newPoint, setNewPoint] = useState({ 
    distance: '', 
    backsight: '', 
    foresight: '', 
    depth: '', 
    comment: '',
    pointType: 'normal' // 'normal', 'changepoint', 'benchmark'
  });

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location access is required');
      return;
    }
    refreshLocation();
  };

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
    setCurrentSample({ id: '', notes: '' });
    setShowSampleForm(true);
  };

  const startSurvey = () => {
    setCurrentSurvey({
      id: '',
      notes: '',
      points: [],
      width: 0,
      maxDepth: 0,
      avgDepth: 0,
      startElevation: null,
      endElevation: null,
      misclose: null,
      miscloseTolerance: 0.01,
      instrumentHeight: null,
      changePoints: []
    });
    setNewPoint({ 
      distance: '', 
      backsight: '', 
      foresight: '', 
      depth: '', 
      comment: '',
      pointType: 'normal'
    });
    setShowSurveyForm(true);
  };

  const calculateElevation = (instrumentHeight, backsight, foresight) => {
    if (instrumentHeight === null || instrumentHeight === undefined) return null;
    if (backsight !== null && backsight !== undefined && !isNaN(backsight)) {
      return instrumentHeight + backsight;
    }
    if (foresight !== null && foresight !== undefined && !isNaN(foresight)) {
      return instrumentHeight - foresight;
    }
    return null;
  };

  const getCurrentInstrumentHeight = () => {
    // Find the last change point or use initial instrument height
    const changePoints = currentSurvey.changePoints;
    if (changePoints.length > 0) {
      return changePoints[changePoints.length - 1].newInstrumentHeight;
    }
    return currentSurvey.instrumentHeight;
  };

  const calculateRiseFall = (currentElevation, previousElevation) => {
    if (previousElevation === null || previousElevation === undefined) {
      return { rise: null, fall: null, difference: null };
    }
    
    const difference = currentElevation - previousElevation;
    
    if (difference > 0) {
      return { rise: difference, fall: null, difference: difference };
    } else if (difference < 0) {
      return { rise: null, fall: Math.abs(difference), difference: difference };
    } else {
      return { rise: 0, fall: 0, difference: 0 };
    }
  };

  const getPreviewElevationAndRiseFall = () => {
    const backsight = parseFloat(newPoint.backsight);
    const foresight = parseFloat(newPoint.foresight);
    const currentIH = getCurrentInstrumentHeight();
    
    if (currentIH === null) return null;
    
    let elevation = null;
    if (!isNaN(backsight)) {
      elevation = currentIH + backsight;
    } else if (!isNaN(foresight)) {
      elevation = currentIH - foresight;
    }
    
    if (elevation === null) return null;
    
    // Calculate rise/fall from previous point
    const lastPoint = currentSurvey.points.length > 0 
      ? currentSurvey.points[currentSurvey.points.length - 1] 
      : null;
    
    const riseFall = lastPoint ? calculateRiseFall(elevation, lastPoint.elevation) : null;
    
    return { elevation, riseFall };
  };

  const calculateMisclose = (points) => {
    if (points.length < 2) return null;
    
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    
    // Check if we have a closed traverse (similar start/end distances)
    const isClosedTraverse = Math.abs(startPoint.distance - endPoint.distance) < 0.1;
    
    if (isClosedTraverse) {
      return Math.abs(startPoint.elevation - endPoint.elevation);
    } else {
      return null;
    }
  };

  const calculateSurveyStats = (points) => {
    if (points.length === 0) {
      return {
        width: 0,
        maxDepth: 0,
        avgDepth: 0,
        misclose: null,
        startElevation: null,
        endElevation: null
      };
    }

    const maxDepth = Math.max(...points.map(p => p.depth || 0));
    const avgDepth = points.reduce((sum, p) => sum + (p.depth || 0), 0) / points.length;
    const width = Math.max(...points.map(p => p.distance)) - Math.min(...points.map(p => p.distance));
    const startElevation = points[0].elevation;
    const endElevation = points[points.length - 1].elevation;
    const misclose = calculateMisclose(points);

    return {
      width,
      maxDepth,
      avgDepth,
      misclose,
      startElevation,
      endElevation
    };
  };

  const addSurveyPoint = () => {
    const distance = parseFloat(newPoint.distance);
    const backsight = newPoint.backsight ? parseFloat(newPoint.backsight) : null;
    const foresight = newPoint.foresight ? parseFloat(newPoint.foresight) : null;
    const depth = parseFloat(newPoint.depth || '0');
    const comment = newPoint.comment.trim();

    if (isNaN(distance)) {
      Alert.alert('Error', 'Distance is required');
      return;
    }

    // Check if we have instrument height set
    const currentIH = getCurrentInstrumentHeight();
    if (currentIH === null) {
      Alert.alert('Error', 'Please set instrument height first');
      return;
    }

    // Must have either backsight or foresight
    if (backsight === null && foresight === null) {
      Alert.alert('Error', 'Either backsight or foresight is required');
      return;
    }

    // Calculate elevation
    const elevation = calculateElevation(currentIH, backsight, foresight);
    
    if (elevation === null) {
      Alert.alert('Error', 'Could not calculate elevation');
      return;
    }

    // Calculate rise/fall for this point
    const previousElevation = currentSurvey.points.length > 0 
      ? currentSurvey.points[currentSurvey.points.length - 1].elevation 
      : null;
    
    const riseFall = calculateRiseFall(elevation, previousElevation);

    const point = {
      distance: distance,
      elevation: elevation,
      backsight: backsight,
      foresight: foresight,
      depth: depth,
      comment: comment,
      pointType: newPoint.pointType,
      waterLevel: elevation - depth,
      rise: riseFall.rise,
      fall: riseFall.fall,
      difference: riseFall.difference,
      instrumentHeight: currentIH
    };

    // Handle change point
    if (newPoint.pointType === 'changepoint') {
      if (backsight === null || foresight === null) {
        Alert.alert('Error', 'Change points require both backsight and foresight readings');
        return;
      }
      
      // Calculate new instrument height
      const newInstrumentHeight = elevation + backsight;
      
      const changePoint = {
        pointIndex: currentSurvey.points.length,
        elevation: elevation,
        backsight: backsight,
        foresight: foresight,
        oldInstrumentHeight: currentIH,
        newInstrumentHeight: newInstrumentHeight,
        distance: distance,
        comment: comment
      };
      
      setCurrentSurvey(prev => ({
        ...prev,
        changePoints: [...prev.changePoints, changePoint]
      }));
    }

    const updatedPoints = [...currentSurvey.points, point];
    const stats = calculateSurveyStats(updatedPoints);

    setCurrentSurvey({
      ...currentSurvey,
      points: updatedPoints,
      ...stats
    });

    setNewPoint({ 
      distance: '', 
      backsight: '', 
      foresight: '', 
      depth: '', 
      comment: '',
      pointType: 'normal'
    });

    // Check misclose tolerance if we have a misclose value
    if (stats.misclose !== null && stats.misclose > currentSurvey.miscloseTolerance) {
      Alert.alert(
        'Misclose Warning',
        `Misclose: ${(stats.misclose * 1000).toFixed(1)}mm\nTolerance: ${(currentSurvey.miscloseTolerance * 1000).toFixed(1)}mm\n\nThis exceeds the acceptable tolerance. Consider re-measuring.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const removeLastPoint = () => {
    if (currentSurvey.points.length === 0) return;
    
    // Check if last point was a change point
    const lastPointIndex = currentSurvey.points.length - 1;
    const wasChangePoint = currentSurvey.changePoints.some(cp => cp.pointIndex === lastPointIndex);
    
    if (wasChangePoint) {
      // Remove the change point as well
      setCurrentSurvey(prev => ({
        ...prev,
        changePoints: prev.changePoints.filter(cp => cp.pointIndex !== lastPointIndex)
      }));
    }
    
    const updatedPoints = currentSurvey.points.slice(0, -1);
    const stats = calculateSurveyStats(updatedPoints);

    setCurrentSurvey({
      ...currentSurvey,
      points: updatedPoints,
      ...stats
    });
  };

  const setInstrumentHeight = () => {
    Alert.prompt(
      'Set Instrument Height',
      'Enter instrument height in meters',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set', 
          onPress: (value) => {
            const height = parseFloat(value);
            if (!isNaN(height) && height > 0) {
              setCurrentSurvey({
                ...currentSurvey,
                instrumentHeight: height
              });
            }
          }
        }
      ],
      'plain-text',
      currentSurvey.instrumentHeight?.toString() || ''
    );
  };

  const setMiscloseTolerance = () => {
    Alert.prompt(
      'Set Misclose Tolerance',
      'Enter tolerance in millimeters (default: 10mm)',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set', 
          onPress: (value) => {
            const toleranceMm = parseFloat(value);
            if (!isNaN(toleranceMm) && toleranceMm > 0) {
              setCurrentSurvey({
                ...currentSurvey,
                miscloseTolerance: toleranceMm / 1000
              });
            }
          }
        }
      ],
      'plain-text',
      (currentSurvey.miscloseTolerance * 1000).toString()
    );
  };

  const saveSample = () => {
    if (!location) {
      Alert.alert('Error', 'GPS location required');
      return;
    }

    if (!currentSample.id.trim()) {
      Alert.alert('Error', 'Sample ID required');
      return;
    }

    const newSample = {
      id: currentSample.id.trim(),
      notes: currentSample.notes.trim(),
      timestamp: new Date().toLocaleString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
    };

    setSamples([...samples, newSample]);
    setShowSampleForm(false);
    setCurrentSample({ id: '', notes: '' });
    Alert.alert('Success', `Sample ${newSample.id} saved!`);
  };

  const saveSurvey = () => {
    if (!location) {
      Alert.alert('Error', 'GPS location required');
      return;
    }

    if (!currentSurvey.id.trim()) {
      Alert.alert('Error', 'Survey ID required');
      return;
    }

    if (currentSurvey.points.length < 2) {
      Alert.alert('Error', 'At least 2 survey points required');
      return;
    }

    // Final misclose check
    if (currentSurvey.misclose !== null && currentSurvey.misclose > currentSurvey.miscloseTolerance) {
      Alert.alert(
        'Misclose Warning',
        `Final misclose: ${(currentSurvey.misclose * 1000).toFixed(1)}mm exceeds tolerance of ${(currentSurvey.miscloseTolerance * 1000).toFixed(1)}mm.\n\nDo you want to save anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => completeSaveSurvey() }
        ]
      );
      return;
    }

    completeSaveSurvey();
  };

  const completeSaveSurvey = () => {
    const newSurvey = {
      ...currentSurvey,
      id: currentSurvey.id.trim(),
      notes: currentSurvey.notes.trim(),
      timestamp: new Date().toLocaleString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
    };

    setSurveys([...surveys, newSurvey]);
    setShowSurveyForm(false);
    
    let message = `Survey ${newSurvey.id} saved with ${newSurvey.points.length} points!`;
    if (newSurvey.changePoints.length > 0) {
      message += `\n${newSurvey.changePoints.length} change points used.`;
    }
    if (newSurvey.misclose !== null) {
      message += `\nMisclose: ${(newSurvey.misclose * 1000).toFixed(1)}mm`;
    }
    
    Alert.alert('Success', message);
  };

  const exportData = () => {
    if (samples.length === 0 && surveys.length === 0) {
      Alert.alert('No Data', 'No samples or surveys to export');
      return;
    }

    let exportText = '=== SAMPLES ===\n';
    exportText += 'Sample_ID,Timestamp,Latitude,Longitude,Altitude,Accuracy,Notes\n';
    samples.forEach(sample => {
      exportText += `${sample.id},${sample.timestamp},${sample.latitude},${sample.longitude},${sample.altitude || ''},${sample.accuracy || ''},${sample.notes}\n`;
    });

    exportText += '\n=== CROSS-SECTION SURVEYS ===\n';
    surveys.forEach(survey => {
      exportText += `\nSurvey: ${survey.id}\n`;
      exportText += `Location: ${survey.latitude.toFixed(6)}, ${survey.longitude.toFixed(6)}\n`;
      exportText += `Timestamp: ${survey.timestamp}\n`;
      exportText += `Initial Instrument Height: ${survey.instrumentHeight?.toFixed(3) || 'N/A'}m\n`;
      exportText += `Width: ${survey.width.toFixed(2)}m, Max Depth: ${survey.maxDepth.toFixed(2)}m, Avg Depth: ${survey.avgDepth.toFixed(2)}m\n`;
      
      if (survey.changePoints.length > 0) {
        exportText += `Change Points: ${survey.changePoints.length}\n`;
        survey.changePoints.forEach((cp, index) => {
          exportText += `  CP${index + 1}: Elev ${cp.elevation.toFixed(3)}m, IH: ${cp.oldInstrumentHeight.toFixed(3)}m → ${cp.newInstrumentHeight.toFixed(3)}m\n`;
        });
      }
      
      if (survey.misclose !== null) {
        exportText += `Misclose: ${(survey.misclose * 1000).toFixed(1)}mm (Tolerance: ${(survey.miscloseTolerance * 1000).toFixed(1)}mm)\n`;
        exportText += `Start Elevation: ${survey.startElevation.toFixed(3)}m, End Elevation: ${survey.endElevation.toFixed(3)}m\n`;
      }
      exportText += `Notes: ${survey.notes}\n`;
      exportText += 'Point,Distance,Elevation,Backsight,Foresight,Depth,Rise,Fall,Type,Comment,Water_Level\n';
      survey.points.forEach((point, index) => {
        const rise = point.rise !== null ? point.rise.toFixed(3) : '';
        const fall = point.fall !== null ? point.fall.toFixed(3) : '';
        const bs = point.backsight !== null ? point.backsight.toFixed(3) : '';
        const fs = point.foresight !== null ? point.foresight.toFixed(3) : '';
        exportText += `${index + 1},${point.distance},${point.elevation.toFixed(3)},${bs},${fs},${point.depth},${rise},${fall},${point.pointType},${point.comment},${point.waterLevel.toFixed(2)}\n`;
      });
    });

    Alert.alert('Export Data', exportText.substring(0, 2000) + (exportText.length > 2000 ? '...[truncated]' : ''));
  };

  const formatLocation = () => {
    if (!location) return 'Getting GPS...';
    const lat = location.coords.latitude.toFixed(6);
    const lon = location.coords.longitude.toFixed(6);
    const alt = location.coords.altitude ? location.coords.altitude.toFixed(1) : 'N/A';
    const acc = location.coords.accuracy ? location.coords.accuracy.toFixed(1) : 'N/A';
    
    return `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m\nAccuracy: ±${acc}m`;
  };

  const getMiscloseStatus = () => {
    if (currentSurvey.misclose === null) return null;
    
    const isWithinTolerance = currentSurvey.misclose <= currentSurvey.miscloseTolerance;
    return {
      value: currentSurvey.misclose,
      status: isWithinTolerance ? 'good' : 'warning',
      color: isWithinTolerance ? '#28a745' : '#dc3545'
    };
  };

  const preview = getPreviewElevationAndRiseFall();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hydrographer's Companion</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Location</Text>
        <Text style={styles.locationText}>{formatLocation()}</Text>
        <Button title="Refresh GPS" onPress={refreshLocation} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Field Operations</Text>
        <View style={styles.buttonGrid}>
          <View style={styles.buttonQuarter}>
            <Button title="New Sample" onPress={startSampleCollection} />
          </View>
          <View style={styles.buttonQuarter}>
            <Button title="Cross-Section" onPress={startSurvey} />
          </View>
          <View style={styles.buttonQuarter}>
            <Button title="Export Data" onPress={exportData} disabled={samples.length === 0 && surveys.length === 0} />
          </View>
          <View style={styles.buttonQuarter}>
            <Button title="Refresh GPS" onPress={refreshLocation} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Samples ({samples.length})</Text>
        {samples.slice(-3).map((sample, index) => (
          <View key={index} style={styles.dataItem}>
            <Text style={styles.dataId}>{sample.id}</Text>
            <Text style={styles.dataDetails}>{sample.timestamp}</Text>
            <Text style={styles.dataDetails}>
              {sample.latitude.toFixed(6)}, {sample.longitude.toFixed(6)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Surveys ({surveys.length})</Text>
        {surveys.slice(-3).map((survey, index) => (
          <View key={index} style={styles.dataItem}>
            <Text style={styles.dataId}>{survey.id}</Text>
            <Text style={styles.dataDetails}>{survey.timestamp}</Text>
            <Text style={styles.dataDetails}>
              {survey.points.length} points, {survey.changePoints.length} change points
            </Text>
            <Text style={styles.dataDetails}>
              Width: {survey.width.toFixed(1)}m, Max Depth: {survey.maxDepth.toFixed(1)}m
            </Text>
            {survey.misclose !== null && (
              <Text style={[styles.dataDetails, { color: survey.misclose <= survey.miscloseTolerance ? '#28a745' : '#dc3545' }]}>
                Misclose: {(survey.misclose * 1000).toFixed(1)}mm
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Sample Form Modal */}
      <Modal visible={showSampleForm} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.formTitle}>New Sample Collection</Text>
          
          <Text style={styles.label}>Sample ID:</Text>
          <TextInput
            style={styles.input}
            value={currentSample.id}
            onChangeText={(text) => setCurrentSample({...currentSample, id: text})}
            placeholder="Enter sample bottle ID"
            autoCapitalize="characters"
          />
          
          <Text style={styles.label}>Field Notes:</Text>
          <TextInput
            style={styles.textArea}
            value={currentSample.notes}
            onChangeText={(text) => setCurrentSample({...currentSample, notes: text})}
            placeholder="Weather, conditions, observations..."
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.locationBox}>
            <Text style={styles.locationLabel}>GPS Coordinates:</Text>
            <Text style={styles.locationInfo}>{formatLocation()}</Text>
          </View>
          
          <View style={styles.formButtons}>
            <View style={styles.buttonHalf}>
              <Button title="Save Sample" onPress={saveSample} />
            </View>
            <View style={styles.buttonHalf}>
              <Button title="Cancel" onPress={() => setShowSampleForm(false)} color="red" />
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Survey Form Modal */}
      <Modal visible={showSurveyForm} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.formTitle}>Cross-Section Survey</Text>
          
          <Text style={styles.label}>Survey ID:</Text>
          <TextInput
            style={styles.input}
            value={currentSurvey.id}
            onChangeText={(text) => setCurrentSurvey({...currentSurvey, id: text})}
            placeholder="e.g., XS-001, Station-A-CS1"
            autoCapitalize="characters"
          />

          <View style={styles.surveyStats}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Survey Statistics</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={setInstrumentHeight} style={styles.toleranceButton}>
                  <Text style={styles.toleranceButtonText}>Set IH</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={setMiscloseTolerance} style={styles.toleranceButton}>
                  <Text style={styles.toleranceButtonText}>Tolerance</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.statsText}>Instrument Height: {getCurrentInstrumentHeight()?.toFixed(3) || 'Not Set'}m</Text>
            <Text style={styles.statsText}>Points: {currentSurvey.points.length}</Text>
            <Text style={styles.statsText}>Change Points: {currentSurvey.changePoints.length}</Text>
            <Text style={styles.statsText}>Width: {currentSurvey.width.toFixed(2)}m</Text>
            <Text style={styles.statsText}>Max Depth: {currentSurvey.maxDepth.toFixed(2)}m</Text>
            <Text style={styles.statsText}>Avg Depth: {currentSurvey.avgDepth.toFixed(2)}m</Text>
            {currentSurvey.misclose !== null && (
              <View style={styles.miscloseContainer}>
                <Text style={[styles.miscloseText, { color: getMiscloseStatus().color }]}>
                  Misclose: {(currentSurvey.misclose * 1000).toFixed(1)}mm
                </Text>
                <Text style={styles.toleranceText}>
                  Tolerance: {(currentSurvey.miscloseTolerance * 1000).toFixed(1)}mm
                </Text>
                <Text style={styles.elevationText}>
                  Start: {currentSurvey.startElevation?.toFixed(3)}m | End: {currentSurvey.endElevation?.toFixed(3)}m
                </Text>
              </View>
            )}
          </View>

          <View style={styles.pointEntry}>
            <Text style={styles.label}>Add Survey Point:</Text>
            
            {/* Point Type Selection */}
            <View style={styles.pointTypeContainer}>
              <Text style={styles.pointLabel}>Point Type:</Text>
              <View style={styles.pointTypeButtons}>
                <TouchableOpacity 
                  style={[styles.typeButton, newPoint.pointType === 'normal' && styles.typeButtonActive]}
                  onPress={() => setNewPoint({...newPoint, pointType: 'normal'})}
                >
                  <Text style={[styles.typeButtonText, newPoint.pointType === 'normal' && styles.typeButtonTextActive]}>Normal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, newPoint.pointType === 'changepoint' && styles.typeButtonActive]}
                  onPress={() => setNewPoint({...newPoint, pointType: 'changepoint'})}
                >
                  <Text style={[styles.typeButtonText, newPoint.pointType === 'changepoint' && styles.typeButtonTextActive]}>Change Point</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, newPoint.pointType === 'benchmark' && styles.typeButtonActive]}
                  onPress={() => setNewPoint({...newPoint, pointType: 'benchmark'})}
                >
                  <Text style={[styles.typeButtonText, newPoint.pointType === 'benchmark' && styles.typeButtonTextActive]}>Benchmark</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Real-time Elevation and Rise/Fall Preview */}
            {preview && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Preview:</Text>
                <Text style={styles.previewElevation}>Elevation: {preview.elevation.toFixed(3)}m</Text>
                {preview.riseFall && preview.riseFall.rise !== null && preview.riseFall.rise > 0 && (
                  <Text style={styles.riseText}>Rise: {preview.riseFall.rise.toFixed(3)}m ↗</Text>
                )}
                {preview.riseFall && preview.riseFall.fall !== null && preview.riseFall.fall > 0 && (
                  <Text style={styles.fallText}>Fall: {preview.riseFall.fall.toFixed(3)}m ↘</Text>
                )}
                {preview.riseFall && preview.riseFall.difference === 0 && (
                  <Text style={styles.levelText}>Level: 0.000m →</Text>
                )}
              </View>
            )}

            <View style={styles.pointInputGrid}>
              <View style={styles.pointInputHalf}>
                <Text style={styles.pointLabel}>Distance (m)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newPoint.distance}
                  onChangeText={(text) => setNewPoint({...newPoint, distance: text})}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.pointInputHalf}><Text style={styles.pointLabel}>Backsight (m)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newPoint.backsight}
                  onChangeText={(text) => setNewPoint({...newPoint, backsight: text})}
                  placeholder="1.500"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.pointInputGrid}>
              <View style={styles.pointInputHalf}>
                <Text style={styles.pointLabel}>Foresight (m)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newPoint.foresight}
                  onChangeText={(text) => setNewPoint({...newPoint, foresight: text})}
                  placeholder="2.100"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.pointInputHalf}>
                <Text style={styles.pointLabel}>Depth (m)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newPoint.depth}
                  onChangeText={(text) => setNewPoint({...newPoint, depth: text})}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.pointLabel}>Comment</Text>
              <TextInput
                style={styles.commentInput}
                value={newPoint.comment}
                onChangeText={(text) => setNewPoint({...newPoint, comment: text})}
                placeholder="LB, RB, TOB, CP1, etc."
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.quickComments}>
              <Text style={styles.quickCommentsLabel}>Quick Comments:</Text>
              <View style={styles.quickButtonsRow}>
                <TouchableOpacity 
                  style={styles.quickButton} 
                  onPress={() => setNewPoint({...newPoint, comment: 'LB'})}
                >
                  <Text style={styles.quickButtonText}>LB</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickButton} 
                  onPress={() => setNewPoint({...newPoint, comment: 'RB'})}
                >
                  <Text style={styles.quickButtonText}>RB</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickButton} 
                  onPress={() => setNewPoint({...newPoint, comment: 'TOB'})}
                >
                  <Text style={styles.quickButtonText}>TOB</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickButton} 
                  onPress={() => setNewPoint({...newPoint, comment: 'WE'})}
                >
                  <Text style={styles.quickButtonText}>WE</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pointButtons}>
              <TouchableOpacity style={styles.addButton} onPress={addSurveyPoint}>
                <Text style={styles.addButtonText}>Add Point</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeButton} onPress={removeLastPoint}>
                <Text style={styles.removeButtonText}>Remove Last</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pointsList}>
            <Text style={styles.label}>Survey Points ({currentSurvey.points.length}):</Text>
            {currentSurvey.points.map((point, index) => (
              <View key={index} style={[styles.pointItem, point.pointType === 'changepoint' && styles.changePointItem]}>
                <Text style={styles.pointText}>
                  {index + 1}. {point.distance}m @ {point.elevation.toFixed(3)}m
                </Text>
                <Text style={styles.pointSightings}>
                  BS: {point.backsight?.toFixed(3) || 'N/A'} | FS: {point.foresight?.toFixed(3) || 'N/A'} | Depth: {point.depth}m
                </Text>
                {point.comment && (
                  <Text style={styles.pointComment}>   Comment: {point.comment}</Text>
                )}
                {point.pointType === 'changepoint' && (
                  <Text style={styles.changePointText}>   🔄 CHANGE POINT</Text>
                )}
                {point.rise !== null && point.rise > 0 && (
                  <Text style={styles.pointRiseFall}>   Rise: {point.rise.toFixed(3)}m ↗</Text>
                )}
                {point.fall !== null && point.fall > 0 && (
                  <Text style={styles.pointRiseFall}>   Fall: {point.fall.toFixed(3)}m ↘</Text>
                )}
                {point.difference === 0 && index > 0 && (
                  <Text style={styles.pointRiseFall}>   Level: 0.000m →</Text>
                )}
              </View>
            ))}
          </View>

          {/* Change Points Summary */}
          {currentSurvey.changePoints.length > 0 && (
            <View style={styles.changePointsSummary}>
              <Text style={styles.label}>Change Points Summary:</Text>
              {currentSurvey.changePoints.map((cp, index) => (
                <View key={index} style={styles.changePointSummaryItem}>
                  <Text style={styles.changePointSummaryText}>
                    CP{index + 1}: {cp.distance}m @ {cp.elevation.toFixed(3)}m
                  </Text>
                  <Text style={styles.changePointSummaryDetails}>
                    IH: {cp.oldInstrumentHeight.toFixed(3)}m → {cp.newInstrumentHeight.toFixed(3)}m
                  </Text>
                  <Text style={styles.changePointSummaryDetails}>
                    BS: {cp.backsight.toFixed(3)}m | FS: {cp.foresight.toFixed(3)}m
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.label}>Survey Notes:</Text>
          <TextInput
            style={styles.textArea}
            value={currentSurvey.notes}
            onChangeText={(text) => setCurrentSurvey({...currentSurvey, notes: text})}
            placeholder="Flow conditions, weather, equipment used..."
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.locationBox}>
            <Text style={styles.locationLabel}>GPS Coordinates:</Text>
            <Text style={styles.locationInfo}>{formatLocation()}</Text>
          </View>
          
          <View style={styles.formButtons}>
            <View style={styles.buttonHalf}>
              <Button title="Save Survey" onPress={saveSurvey} />
            </View>
            <View style={styles.buttonHalf}>
              <Button title="Cancel" onPress={() => setShowSurveyForm(false)} color="red" />
            </View>
          </View>
        </ScrollView>
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
    marginBottom: 20,
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonQuarter: {
    width: '48%',
    marginBottom: 10,
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 5,
  },
  dataItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dataId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  dataDetails: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  locationBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#495057',
  },
  locationInfo: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6c757d',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  surveyStats: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  toleranceButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    marginLeft: 5,
  },
  toleranceButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 2,
  },
  miscloseContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  miscloseText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  toleranceText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  elevationText: {
    fontSize: 11,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  pointEntry: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  pointTypeContainer: {
    marginBottom: 15,
  },
  pointTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
  },
  typeButtonText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  previewContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#856404',
  },
  previewElevation: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 3,
  },
  riseText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  fallText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  pointInputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pointInputHalf: {
    flex: 1,
    marginHorizontal: 3,
  },
  pointLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    color: '#495057',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 8,
    borderRadius: 3,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 8,
    borderRadius: 3,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  quickComments: {
    marginBottom: 15,
  },
  quickCommentsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
  },
  quickButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  removeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pointsList: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pointItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  changePointItem: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 3,
    marginVertical: 2,
  },
  pointText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
    fontWeight: 'bold',
  },
  pointSightings: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#6c757d',
    marginTop: 2,
  },
  pointComment: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#007bff',
    marginTop: 2,
  },
  changePointText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fd7e14',
    marginTop: 2,
  },
  pointRiseFall: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#28a745',
    marginTop: 2,
  },
  changePointsSummary: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  changePointSummaryItem: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 3,
    marginBottom: 8,
  },
  changePointSummaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#495057',
  },
  changePointSummaryDetails: {
    fontSize: 11,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
});