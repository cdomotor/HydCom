import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../styles/AppStyles';
import { formatExportData } from '../utils/exportUtils';

const DataExport = ({ samples, surveys }) => {
  const hasData = samples.length > 0 || surveys.length > 0;

  const handleExport = () => {
    if (!hasData) {
      Alert.alert('No Data', 'No samples or surveys to export');
      return;
    }

    const exportData = formatExportData(samples, surveys);
    
    // For now, show in alert (in production, this would save to file or send via email)
    const truncatedData = exportData.length > 2000 
      ? exportData.substring(0, 2000) + '\n\n...[Data truncated for preview]\n\nTotal length: ' + exportData.length + ' characters'
      : exportData;

    Alert.alert(
      'Export Data Preview',
      truncatedData,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Copy to Clipboard', 
          onPress: () => {
            // In a real app, you'd use Clipboard.setString(exportData)
            Alert.alert('Info', 'In production, this would copy data to clipboard');
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.exportButton, 
        !hasData && styles.exportButtonDisabled
      ]} 
      onPress={handleExport}
      disabled={!hasData}
    >
      <Text style={styles.exportButtonText}>
        Export Data
      </Text>
      {hasData && (
        <Text style={[styles.exportButtonText, { fontSize: 10, marginTop: 2 }]}>
          {samples.length}S + {surveys.length}XS
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DataExport;