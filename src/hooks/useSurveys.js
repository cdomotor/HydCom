import { useState } from 'react';
import { Alert } from 'react-native';
import { 
  calculateSurveyStats, 
  calculateElevation, 
  calculateRiseFall,
  validateSurveyPoint,
  calculateNewInstrumentHeight 
} from '../utils/calculations';

const useSurveys = () => {
  const [surveys, setSurveys] = useState([]);

  const addSurvey = (surveyData, location) => {
    if (!location) {
      Alert.alert('Error', 'GPS location required');
      return false;
    }

    if (!surveyData.id.trim()) {
      Alert.alert('Error', 'Survey ID required');
      return false;
    }

    if (surveyData.points.length < 2) {
      Alert.alert('Error', 'At least 2 survey points required');
      return false;
    }

    // Final misclose check
    if (surveyData.misclose !== null && surveyData.misclose > surveyData.miscloseTolerance) {
      return new Promise((resolve) => {
        Alert.alert(
          'Misclose Warning',
          `Final misclose: ${(surveyData.misclose * 1000).toFixed(1)}mm exceeds tolerance of ${(surveyData.miscloseTolerance * 1000).toFixed(1)}mm.\n\nDo you want to save anyway?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Save Anyway', onPress: () => {
              completeSave(surveyData, location);
              resolve(true);
            }}
          ]
        );
      });
    }

    completeSave(surveyData, location);
    return true;
  };

  const completeSave = (surveyData, location) => {
    const newSurvey = {
      ...surveyData,
      id: surveyData.id.trim(),
      notes: surveyData.notes.trim(),
      timestamp: new Date().toLocaleString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      dateCreated: new Date().toISOString(),
    };

    setSurveys(prev => [...prev, newSurvey]);
    
    let message = `Survey ${newSurvey.id} saved with ${newSurvey.points.length} points!`;
    if (newSurvey.changePoints.length > 0) {
      message += `\n${newSurvey.changePoints.length} change points used.`;
    }
    if (newSurvey.misclose !== null) {
      message += `\nMisclose: ${(newSurvey.misclose * 1000).toFixed(1)}mm`;
    }
    
    Alert.alert('Success', message);
  };

  const removeSurvey = (index) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this survey?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setSurveys(prev => prev.filter((_, i) => i !== index))
        }
      ]
    );
  };

  const updateSurvey = (index, updatedData) => {
    setSurveys(prev => prev.map((survey, i) => 
      i === index ? { ...survey, ...updatedData } : survey
    ));
  };

  const getSurveyById = (id) => {
    return surveys.find(survey => survey.id === id);
  };

  const getSurveysByDate = (date) => {
    return surveys.filter(survey => 
      survey.dateCreated.startsWith(date)
    );
  };

  const clearAllSurveys = () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to delete all surveys? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => setSurveys([])
        }
      ]
    );
  };

  const getSurveyStatistics = () => {
    if (surveys.length === 0) {
      return {
        totalSurveys: 0,
        totalPoints: 0,
        totalChangePoints: 0,
        averageWidth: 0,
        averageDepth: 0,
      };
    }

    const totalPoints = surveys.reduce((sum, survey) => sum + survey.points.length, 0);
    const totalChangePoints = surveys.reduce((sum, survey) => sum + (survey.changePoints?.length || 0), 0);
    const averageWidth = surveys.reduce((sum, survey) => sum + survey.width, 0) / surveys.length;
    const averageDepth = surveys.reduce((sum, survey) => sum + survey.avgDepth, 0) / surveys.length;

    return {
      totalSurveys: surveys.length,
      totalPoints,
      totalChangePoints,
      averageWidth: averageWidth.toFixed(2),
      averageDepth: averageDepth.toFixed(2),
    };
  };

  return {
    surveys,
    addSurvey,
    removeSurvey,
    updateSurvey,
    getSurveyById,
    getSurveysByDate,
    clearAllSurveys,
    getSurveyStatistics,
    surveyCount: surveys.length,
  };
};

export default useSurveys;