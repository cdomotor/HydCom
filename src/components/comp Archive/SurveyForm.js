import React, { useState } from 'react';
import { 
  Modal, 
  ScrollView, 
  Text, 
  View, 
  TextInput, 
  Button, 
  Alert, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import { styles } from '../styles/AppStyles';
import { 
  calculateElevation, 
  calculateRiseFall, 
  calculateSurveyStats,
  calculateNewInstrumentHeight,
  validateSurveyPoint,
  formatElevation 
} from '../utils/calculations';

const SurveyForm = ({ visible, onClose, onSave, location }) => {
  const [surveyData, setSurveyData] = useState({
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
    pointType: 'backsight'
  });

  const [editingPointIndex, setEditingPointIndex] = useState(null);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const formatLocation = () => {
    if (!location) return 'GPS location required';
    
    const lat = location.coords.latitude.toFixed(6);
    const lon = location.coords.longitude.toFixed(6);
    const alt = location.coords.altitude ? location.coords.altitude.toFixed(1) : 'N/A';
    const acc = location.coords.accuracy ? location.coords.accuracy.toFixed(1) : 'N/A';
    
    return `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m\nAccuracy: ±${acc}m`;
  };

  const getCurrentInstrumentHeight = () => {
    const changePoints = surveyData.changePoints;
    if (changePoints.length > 0) {
      return changePoints[changePoints.length - 1].newInstrumentHeight;
    }
    return surveyData.instrumentHeight;
  };

  const getPreviewElevationAndRiseFall = () => {
    const backsight = parseFloat(newPoint.backsight);
    const foresight = parseFloat(newPoint.foresight);
    const currentIH = getCurrentInstrumentHeight();
    
    if (currentIH === null) return null;
    
    let elevation = null;
    if (!isNaN(backsight) && newPoint.backsight !== '') {
      elevation = currentIH + backsight;
    } else if (!isNaN(foresight) && newPoint.foresight !== '') {
      elevation = currentIH - foresight;
    }
    
    if (elevation === null) return null;
    
    const lastPoint = surveyData.points.length > 0 
      ? surveyData.points[surveyData.points.length - 1] 
      : null;
    
    const riseFall = lastPoint ? calculateRiseFall(elevation, lastPoint.elevation) : null;
    
    const startElevation = surveyData.points.length > 0 ? surveyData.points[0].elevation : null;
    const totalFromStart = startElevation ? elevation - startElevation : null;
    
    return { elevation, riseFall, totalFromStart, startElevation };
  };

  const setInstrumentHeight = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Enter Instrument Height',
        'Height in meters (e.g., 1.540)',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Set', 
            onPress: (value) => {
              const height = parseFloat(value);
              if (!isNaN(height) && height > 0) {
                setSurveyData(prev => ({
                  ...prev,
                  instrumentHeight: height
                }));
              } else {
                Alert.alert('Invalid Input', 'Please enter a valid height in meters');
              }
            }
          }
        ],
        'plain-text',
        surveyData.instrumentHeight?.toString() || ''
      );
    } else {
      Alert.alert(
        'Set Instrument Height (IH)',
        'Instrument Height is the height of your level/theodolite above the datum.\n\nCurrent value: ' + (surveyData.instrumentHeight || 'Not set'),
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Set to 1.5m', 
            onPress: () => setSurveyData(prev => ({ ...prev, instrumentHeight: 1.5 }))
          },
          { 
            text: 'Set to 1.65m', 
            onPress: () => setSurveyData(prev => ({ ...prev, instrumentHeight: 1.65 }))
          },
          { 
            text: 'Set to 1.8m', 
            onPress: () => setSurveyData(prev => ({ ...prev, instrumentHeight: 1.8 }))
          }
        ]
      );
    }
  };

  const setMiscloseTolerance = () => {
    if (Platform.OS === 'ios') {
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
                setSurveyData(prev => ({
                  ...prev,
                  miscloseTolerance: toleranceMm / 1000
                }));
              } else {
                Alert.alert('Invalid Input', 'Please enter a valid tolerance in millimeters');
              }
            }
          }
        ],
        'plain-text',
        (surveyData.miscloseTolerance * 1000).toString()
      );
    } else {
      Alert.alert(
        'Set Misclose Tolerance',
        'Select tolerance for the survey\nCurrent: ' + (surveyData.miscloseTolerance * 1000) + 'mm',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '5mm (Precise)', 
            onPress: () => setSurveyData(prev => ({ ...prev, miscloseTolerance: 0.005 }))
          },
          { 
            text: '10mm (Standard)', 
            onPress: () => setSurveyData(prev => ({ ...prev, miscloseTolerance: 0.010 }))
          },
          { 
            text: '20mm (Rough)', 
            onPress: () => setSurveyData(prev => ({ ...prev, miscloseTolerance: 0.020 }))
          }
        ]
      );
    }
  };

  const addSurveyPoint = () => {
    const distance = parseFloat(newPoint.distance);
    const backsight = newPoint.backsight ? parseFloat(newPoint.backsight) : null;
    const foresight = newPoint.foresight ? parseFloat(newPoint.foresight) : null;
    const depth = parseFloat(newPoint.depth || '0');
    const comment = newPoint.comment.trim();

    const validation = validateSurveyPoint(
      { ...newPoint, distance, backsight, foresight, depth },
      getCurrentInstrumentHeight()
    );

    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    const currentIH = getCurrentInstrumentHeight();
    const elevation = calculateElevation(currentIH, backsight, foresight);
    
    if (elevation === null) {
      Alert.alert('Error', 'Could not calculate elevation');
      return;
    }

    const previousElevation = surveyData.points.length > 0 
      ? surveyData.points[surveyData.points.length - 1].elevation 
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

    let updatedPoints;
    let updatedChangePoints = [...surveyData.changePoints];

    if (editingPointIndex !== null) {
      updatedPoints = [...surveyData.points];
      updatedPoints[editingPointIndex] = point;
      setEditingPointIndex(null);
    } else {
      updatedPoints = [...surveyData.points, point];
    }

    if (newPoint.pointType === 'changepoint' && editingPointIndex === null) {
      if (backsight === null || foresight === null) {
        Alert.alert('Error', 'Change points require both backsight and foresight readings');
        return;
      }
      
      const newInstrumentHeight = calculateNewInstrumentHeight(elevation, backsight);
      
      const changePoint = {
        pointIndex: updatedPoints.length - 1,
        elevation: elevation,
        backsight: backsight,
        foresight: foresight,
        oldInstrumentHeight: currentIH,
        newInstrumentHeight: newInstrumentHeight,
        distance: distance,
        comment: comment
      };
      
      updatedChangePoints.push(changePoint);
    }

    const stats = calculateSurveyStats(updatedPoints);

    setSurveyData(prev => ({
      ...prev,
      points: updatedPoints,
      changePoints: updatedChangePoints,
      ...stats
    }));

    setNewPoint({
      distance: '',
      backsight: '',
      foresight: '',
      depth: '',
      comment: '',
      pointType: surveyData.points.length === 0 ? 'backsight' : 'intermediate'
    });

    if (stats.misclose !== null && stats.misclose > surveyData.miscloseTolerance) {
      Alert.alert(
        'Misclose Warning',
        `Misclose: ${(stats.misclose * 1000).toFixed(1)}mm\nTolerance: ${(surveyData.miscloseTolerance * 1000).toFixed(1)}mm\n\nThis exceeds the acceptable tolerance.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const removeLastPoint = () => {
    if (surveyData.points.length === 0) return;
    
    const lastPointIndex = surveyData.points.length - 1;
    const wasChangePoint = surveyData.changePoints.some(cp => cp.pointIndex === lastPointIndex);
    
    let updatedChangePoints = surveyData.changePoints;
    if (wasChangePoint) {
      updatedChangePoints = surveyData.changePoints.filter(cp => cp.pointIndex !== lastPointIndex);
    }
    
    const updatedPoints = surveyData.points.slice(0, -1);
    const stats = calculateSurveyStats(updatedPoints);

    setSurveyData(prev => ({
      ...prev,
      points: updatedPoints,
      changePoints: updatedChangePoints,
      ...stats
    }));
  };

  const handleSave = async () => {
    if (!surveyData.id.trim()) {
      Alert.alert('Error', 'Survey ID is required');
      return;
    }

    if (surveyData.points.length < 2) {
      Alert.alert('Error', 'At least 2 survey points are required');
      return;
    }

    const success = await onSave(surveyData);
    if (success !== false) {
      handleClose();
    }
  };

  const handleClose = () => {
    setSurveyData({
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
      pointType: 'backsight'
    });
    setEditingPointIndex(null);
    setShowWorkflow(false);
    onClose();
  };

  const getMiscloseStatus = () => {
    if (surveyData.misclose === null) return null;
    
    const isWithinTolerance = surveyData.misclose <= surveyData.miscloseTolerance;
    return {
      value: surveyData.misclose,
      status: isWithinTolerance ? 'good' : 'warning',
      color: isWithinTolerance ? '#28a745' : '#dc3545'
    };
  };

  const preview = getPreviewElevationAndRiseFall();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={styles.modalContainer}>
        <Text style={styles.formTitle}>Cross-Section Survey</Text>
        
        {/* Survey ID */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Survey ID:</Text>
          <TextInput
            style={styles.input}
            value={surveyData.id}
            onChangeText={(text) => setSurveyData(prev => ({ ...prev, id: text }))}
            placeholder="e.g., XS-001, Station-A-CS1"
            autoCapitalize="characters"
          />
        </View>

        {/* Survey Workflow Guide */}
        <View style={styles.workflowGuide}>
          <TouchableOpacity 
            style={styles.workflowHeader}
            onPress={() => setShowWorkflow(!showWorkflow)}
          >
            <Text style={styles.workflowTitle}>📋 Survey Workflow Guide</Text>
            <Text style={styles.workflowToggle}>{showWorkflow ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          
          {showWorkflow && (
            <View style={styles.workflowContent}>
              <Text style={styles.workflowStep}>
                <Text style={styles.stepNumber}>1.</Text> <Text style={styles.stepTitle}>Setup & Backsight:</Text> Set instrument height, then take Backsight reading on known benchmark
              </Text>
              <Text style={styles.workflowStep}>
                <Text style={styles.stepNumber}>2.</Text> <Text style={styles.stepTitle}>Intermediate Readings:</Text> Take Intermediate readings on all cross-section points (most of your work)
              </Text>
              <Text style={styles.workflowStep}>
                <Text style={styles.stepNumber}>3.</Text> <Text style={styles.stepTitle}>Change points (if needed):</Text> If instrument must move, take Foresight + new Backsight
              </Text>
              <Text style={styles.workflowStep}>
                <Text style={styles.stepNumber}>4.</Text> <Text style={styles.stepTitle}>Close Survey:</Text> Finish with Foresight reading back to original benchmark
              </Text>
              <View style={styles.workflowNote}>
                <Text style={styles.noteTitle}>🎯 For Misclose Calculation:</Text>
                <Text style={styles.noteText}>
                  End your survey by shooting back to the starting benchmark. The difference between start and end elevations gives you the misclose.
                </Text>
              </View>
              <View style={styles.workflowReminder}>
                <Text style={styles.reminderText}>
                  💡 Remember: "Begin on a Backsight, and Finish on a Foresight"
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Survey Statistics */}
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
          <Text style={styles.statsText}>
            Instrument Height: {formatElevation(getCurrentInstrumentHeight()) || 'Not Set'}m
          </Text>
          <Text style={styles.statsText}>Points: {surveyData.points.length}</Text>
          <Text style={styles.statsText}>Change Points: {surveyData.changePoints.length}</Text>
          <Text style={styles.statsText}>Width: {surveyData.width.toFixed(2)}m</Text>
          <Text style={styles.statsText}>Max Depth: {surveyData.maxDepth.toFixed(2)}m</Text>
          <Text style={styles.statsText}>Avg Depth: {surveyData.avgDepth.toFixed(2)}m</Text>
          {surveyData.misclose !== null && (
            <View style={styles.miscloseContainer}>
              <Text style={[styles.miscloseText, { color: getMiscloseStatus().color }]}>
                Misclose: {(surveyData.misclose * 1000).toFixed(1)}mm
              </Text>
              <Text style={styles.toleranceText}>
                Tolerance: {(surveyData.miscloseTolerance * 1000).toFixed(1)}mm
              </Text>
              <Text style={styles.elevationText}>
                Start: {formatElevation(surveyData.startElevation)}m | End: {formatElevation(surveyData.endElevation)}m
              </Text>
            </View>
          )}
        </View>

        {/* Point Entry Section */}
        <View style={styles.pointEntry}>
          <Text style={styles.label}>Add Survey Point:</Text>
          
          {/* Point Type Selection */}
          <View style={styles.pointTypeContainer}>
            <Text style={styles.pointLabel}>Point Type:</Text>
            <View style={styles.pointTypeButtons}>
              <TouchableOpacity 
                style={[styles.typeButton, newPoint.pointType === 'backsight' && styles.typeButtonActive]}
                onPress={() => setNewPoint(prev => ({ ...prev, pointType: 'backsight' }))}
              >
                <Text style={[styles.typeButtonText, newPoint.pointType === 'backsight' && styles.typeButtonTextActive]}>
                  Backsight
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, newPoint.pointType === 'intermediate' && styles.typeButtonActive]}
                onPress={() => setNewPoint(prev => ({ ...prev, pointType: 'intermediate' }))}
              >
                <Text style={[styles.typeButtonText, newPoint.pointType === 'intermediate' && styles.typeButtonTextActive]}>
                  Intermediate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, newPoint.pointType === 'foresight' && styles.typeButtonActive]}
                onPress={() => setNewPoint(prev => ({ ...prev, pointType: 'foresight' }))}
              >
                <Text style={[styles.typeButtonText, newPoint.pointType === 'foresight' && styles.typeButtonTextActive]}>
                  Foresight
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, newPoint.pointType === 'changepoint' && styles.typeButtonActive]}
                onPress={() => setNewPoint(prev => ({ ...prev, pointType: 'changepoint' }))}
              >
                <Text style={[styles.typeButtonText, newPoint.pointType === 'changepoint' && styles.typeButtonTextActive]}>
                  Change Point
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Survey Tips */}
          <View style={styles.surveyingTip}>
            <Text style={styles.tipTitle}>💡 Surveying Workflow:</Text>
            <Text style={styles.tipText}>
              "Begin on a Backsight, and Finish on a Foresight"
            </Text>
            <Text style={styles.tipDetails}>
              • <Text style={{fontWeight: 'bold'}}>Backsight (BS)</Text>: First reading on known point{'\n'}
              • <Text style={{fontWeight: 'bold'}}>Intermediate (IS)</Text>: Readings on unknown points{'\n'}
              • <Text style={{fontWeight: 'bold'}}>Foresight (FS)</Text>: Final reading before moving{'\n'}
              • <Text style={{fontWeight: 'bold'}}>Change point</Text>: FS + BS combined
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Distance (m):</Text>
              <TextInput
                style={styles.input}
                value={newPoint.distance}
                onChangeText={(text) => setNewPoint(prev => ({ ...prev, distance: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>
                Backsight (m): {newPoint.pointType === 'foresight' && '(optional)'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  newPoint.pointType === 'foresight' && styles.inputDisabled
                ]}
                value={newPoint.backsight}
                onChangeText={(text) => setNewPoint(prev => ({ ...prev, backsight: text }))}
                placeholder="0.000"
                keyboardType="numeric"
                editable={newPoint.pointType !== 'foresight'}
              />
            </View>
            
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>
                Foresight (m): {newPoint.pointType === 'backsight' && '(optional)'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  newPoint.pointType === 'backsight' && styles.inputDisabled
                ]}
                value={newPoint.foresight}
                onChangeText={(text) => setNewPoint(prev => ({ ...prev, foresight: text }))}
                placeholder="0.000"
                keyboardType="numeric"
                editable={newPoint.pointType !== 'backsight'}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Water Depth (m):</Text>
              <TextInput
                style={styles.input}
                value={newPoint.depth}
                onChangeText={(text) => setNewPoint(prev => ({ ...prev, depth: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputFull}>
              <Text style={styles.inputLabel}>Comment:</Text>
              <TextInput
                style={styles.input}
                value={newPoint.comment}
                onChangeText={(text) => setNewPoint(prev => ({ ...prev, comment: text }))}
                placeholder="e.g., Left bank, Rock outcrop, etc."
              />
            </View>
          </View>

          {/* Preview Elevation */}
          {preview && (
            <View style={styles.elevationPreview}>
              <Text style={styles.previewTitle}>Preview Elevation:</Text>
              <Text style={styles.previewElevation}>
                {formatElevation(preview.elevation)}m
              </Text>
              {preview.riseFall && (
                <View style={styles.riseFallPreview}>
                  {preview.riseFall.rise !== null && (
                    <Text style={[styles.previewText, styles.riseText]}>
                      ↑ Rise: {preview.riseFall.rise.toFixed(3)}m
                    </Text>
                  )}
                  {preview.riseFall.fall !== null && (
                    <Text style={[styles.previewText, styles.fallText]}>
                      ↓ Fall: {preview.riseFall.fall.toFixed(3)}m
                    </Text>
                  )}
                  <Text style={styles.previewText}>
                    {preview.totalFromStart >= 0 ? '+' : ''}{preview.totalFromStart.toFixed(3)}m from first point
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.pointButtons}>
            <View style={styles.buttonThird}>
              <Button 
                title={editingPointIndex !== null ? "Update" : "Add"} 
                onPress={addSurveyPoint}
                disabled={!getCurrentInstrumentHeight()}
              />
            </View>
            <View style={styles.buttonThird}>
              <Button 
                title="Remove Last" 
                onPress={removeLastPoint}
                disabled={surveyData.points.length === 0}
                color="orange"
              />
            </View>
            {editingPointIndex !== null && (
              <View style={styles.buttonThird}>
                <Button 
                  title="Cancel Edit" 
                  onPress={() => {
                    setEditingPointIndex(null);
                    setNewPoint({
                      distance: '',
                      backsight: '',
                      foresight: '',
                      depth: '',
                      comment: '',
                      pointType: 'intermediate'
                    });
                  }}
                  color="gray"
                />
              </View>
            )}
          </View>
        </View>

        {/* Survey Points List */}
        {surveyData.points.length > 0 && (
          <View style={styles.pointsList}>
            <Text style={styles.label}>Survey Points:</Text>
            {surveyData.points.map((point, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.pointItem}
                onPress={() => {
                  setNewPoint({
                    distance: point.distance.toString(),
                    backsight: point.backsight ? point.backsight.toString() : '',
                    foresight: point.foresight ? point.foresight.toString() : '',
                    depth: point.depth ? point.depth.toString() : '',
                    comment: point.comment || '',
                    pointType: point.pointType || 'intermediate'
                  });
                  setEditingPointIndex(index);
                }}
              >
                <Text style={styles.pointItemText}>
                  #{index + 1}: {point.distance}m @ {formatElevation(point.elevation)}m
                  {point.pointType === 'changepoint' && ' [CP]'}
                </Text>
                <Text style={styles.pointItemDetails}>
                  {point.backsight && `BS: ${formatElevation(point.backsight)}m`}
                  {point.backsight && point.foresight && ' | '}
                  {point.foresight && `FS: ${formatElevation(point.foresight)}m`}
                  {point.depth > 0 && ` | Depth: ${point.depth.toFixed(2)}m`}
                </Text>
                {point.comment && (
                  <Text style={styles.pointItemComment}>"{point.comment}"</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Change Points Summary */}
        {surveyData.changePoints.length > 0 && (
          <View style={styles.changePointsSummary}>
            <Text style={styles.label}>Change Points Summary:</Text>
            {surveyData.changePoints.map((cp, index) => (
              <View key={index} style={styles.changePointSummaryItem}>
                <Text style={styles.changePointSummaryText}>
                  CP{index + 1}: {cp.distance}m @ {formatElevation(cp.elevation)}m
                </Text>
                <Text style={styles.changePointSummaryDetails}>
                  IH: {formatElevation(cp.oldInstrumentHeight)}m → {formatElevation(cp.newInstrumentHeight)}m
                </Text>
                <Text style={styles.changePointSummaryDetails}>
                  BS: {formatElevation(cp.backsight)}m | FS: {formatElevation(cp.foresight)}m
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Survey Notes */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Survey Notes:</Text>
          <TextInput
            style={styles.textArea}
            value={surveyData.notes}
            onChangeText={(text) => setSurveyData(prev => ({ ...prev, notes: text }))}
            placeholder="Flow conditions, weather, equipment used..."
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* GPS Location */}
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
              ⚠️ GPS location required for survey
            </Text>
          )}
        </View>
        
        {/* Form Actions */}
        <View style={styles.formButtons}>
          <View style={styles.buttonHalf}>
            <Button 
              title="Save Survey" 
              onPress={handleSave}
              disabled={!location || !surveyData.id.trim() || surveyData.points.length < 2}
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
            💡 Tip: Set instrument height first, then add points with either backsight OR foresight (both for change points).
          </Text>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default SurveyForm;