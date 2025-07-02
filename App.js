import React, { useState } from 'react';
import { ScrollView, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Components
import GPSStatus from './src/components/GPSStatus';
import SampleForm from './src/components/SampleForm';
import SurveyForm from './src/components/SurveyForm';
import DataExport from './src/components/DataExport';

// Hooks
import useLocation from './src/hooks/useLocation';
import useSamples from './src/hooks/useSamples';
import useSurveys from './src/hooks/useSurveys';

// Styles
import { styles } from './src/styles/AppStyles';

export default function App() {
  // UI State
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);

  // Custom Hooks
  const { 
    location, 
    refreshLocation, 
    watchingPosition, 
    toggleWatching 
  } = useLocation();
  const { samples, addSample } = useSamples();
  const { surveys, addSurvey } = useSurveys();

  // Event Handlers
  const handleSampleSave = (sampleData) => {
    addSample(sampleData, location);
    setShowSampleForm(false);
  };

  const handleSurveySave = (surveyData) => {
    addSurvey(surveyData, location);
    setShowSurveyForm(false);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.title}>Hydrographer's Companion</Text>
      
      {/* GPS Status Component with Live Compass */}
      <GPSStatus 
        location={location} 
        onRefresh={refreshLocation}
        watchingPosition={watchingPosition}
        toggleWatching={toggleWatching}
      />

      {/* Operations Panel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Field Operations</Text>
        <View style={styles.buttonGrid}>
          <View style={styles.buttonQuarter}>
            <Button
              title="Cross-Section"
              onPress={() => setShowSurveyForm(true)}
            />
          </View>
          <View style={styles.buttonQuarter}>
            <Button
              title="New Sample"
              onPress={() => setShowSampleForm(true)}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export & Backup</Text>
        <DataExport samples={samples} surveys={surveys} />
      </View>

      {/* Recent Data Summary */}
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
              <Text style={[styles.dataDetails, { 
                color: survey.misclose <= survey.miscloseTolerance ? '#28a745' : '#dc3545' 
              }]}>
                Misclose: {(survey.misclose * 1000).toFixed(1)}mm
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Modals */}
      <SampleForm
        visible={showSampleForm}
        onClose={() => setShowSampleForm(false)}
        onSave={handleSampleSave}
        location={location}
      />

      <SurveyForm
        visible={showSurveyForm}
        onClose={() => setShowSurveyForm(false)}
        onSave={handleSurveySave}
        location={location}
      />
    </ScrollView>
  );
}
