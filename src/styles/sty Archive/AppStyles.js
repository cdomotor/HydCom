import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Main Container Styles
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  
  // Title Styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  
  // Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
    color: '#2c3e50',
  },
  
  formSection: {
    marginBottom: 20,
  },
  
  // Label Styles
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#34495e',
  },
  
  pointLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  
  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  
  // Button Styles
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
    width: '48%',
  },
  
  buttonThird: {
    width: '32%',
  },
  
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  
  // Survey Form Specific Styles
  workflowGuide: {
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#d1e9f3',
  },
  
  workflowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  workflowToggle: {
    fontSize: 14,
    color: '#666',
  },
  
  workflowContent: {
    padding: 15,
  },
  
  workflowStep: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  
  stepNumber: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  
  stepTitle: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  workflowNote: {
    backgroundColor: '#ffeaa7',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  
  noteTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  
  noteText: {
    fontSize: 14,
    color: '#555',
  },
  
  workflowReminder: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  
  reminderText: {
    fontSize: 14,
    color: '#27ae60',
    fontStyle: 'italic',
  },
  
  // Survey Statistics
  surveyStats: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  headerButtons: {
    flexDirection: 'row',
  },
  
  toleranceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498db',
    borderRadius: 5,
    marginLeft: 5,
  },
  
  toleranceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  
  statsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  
  miscloseContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  
  miscloseText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  
  toleranceText: {
    fontSize: 14,
    color: '#666',
  },
  
  elevationText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },
  
  // Point Entry Styles
  pointEntry: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  pointTypeContainer: {
    marginBottom: 15,
  },
  
  pointTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    marginRight: 8,
    marginBottom: 8,
  },
  
  typeButtonActive: {
    backgroundColor: '#3498db',
  },
  
  typeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  typeButtonTextActive: {
    color: '#fff',
  },
  
  // Surveying Tips
  surveyingTip: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2e7d32',
  },
  
  tipText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#1b5e20',
  },
  
  tipDetails: {
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
  },
  
  // Input Row Styles
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  
  inputHalf: {
    width: '48%',
  },
  
  inputFull: {
    width: '100%',
  },
  
  // Preview Styles
  elevationPreview: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#b8daff',
  },
  
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#004085',
  },
  
  previewElevation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004085',
    marginBottom: 5,
  },
  
  riseFallPreview: {
    marginTop: 8,
  },
  
  previewText: {
    fontSize: 13,
    marginBottom: 3,
  },
  
  riseText: {
    color: '#28a745',
    fontWeight: '500',
  },
  
  fallText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  
  // Point Buttons
  pointButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  
  // Points List
  pointsList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  pointItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  
  pointItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 3,
  },
  
  pointItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  
  pointItemComment: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 3,
  },
  
  // Change Points Summary
  changePointsSummary: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  
  changePointSummaryItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffd93d',
  },
  
  changePointSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 3,
  },
  
  changePointSummaryDetails: {
    fontSize: 12,
    color: '#856404',
  },
  
  // Location Box
  locationBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  
  locationInfo: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  
  locationError: {
    color: '#dc3545',
  },
  
  locationWarning: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  // Help Text
  helpText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // GPS Status Styles
  gpsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  gpsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  
  statusGood: {
    backgroundColor: '#27ae60',
  },
  
  statusModerate: {
    backgroundColor: '#f39c12',
  },
  
  statusPoor: {
    backgroundColor: '#e74c3c',
  },
  
  gpsDetails: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  
  gpsAccuracy: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  
  // Sample Form Specific
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  suggestButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  
  suggestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  
  sampleTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  
  sampleTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  
  sampleTypeButtonActive: {
    backgroundColor: '#3498db',
  },
  
  sampleTypeText: {
    fontSize: 14,
    color: '#666',
  },
  
  sampleTypeTextActive: {
    color: '#fff',
  },
  
  // Summary Styles
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2c3e50',
  },
  
  // Additional Button Styles
  addButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  removeButton: {
    backgroundColor: '#e67e22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Quick Comment Styles
  quickComments: {
    marginTop: 10,
  },
  
  quickCommentsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  
  quickButtonsGrid: {
    flexDirection: 'column',
  },
  
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  quickButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  quickButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
  },
  
  doubleButton: {
    flex: 1,
    backgroundColor: '#d5dbdb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  // Comment Section Styles
  commentSection: {
    marginBottom: 15,
  },
  
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  
  clearButtonText: {
    color: '#e74c3c',
    fontSize: 12,
  },
  
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  
  // Field Hint Styles
  fieldHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  
  // Visualization Styles
  visualizationContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  svgContainer: {
    marginTop: 10,
  },
  
  svgBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    minHeight: 200,
  },
  
  chartContainer: {
    flex: 1,
  },
  
  chartArea: {
    flexDirection: 'row',
    height: 180,
  },
  
  yAxisLabels: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  
  axisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  
  plotArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  
  groundSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#8b4513',
  },
  
  waterIndicator: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
  },
  
  waterText: {
    color: '#3498db',
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // Input Mode Styles
  inputModeContainer: {
    marginBottom: 15,
  },
  
  inputModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  inputModeHint: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  // Disabled Input Styles
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  
  // Level Text Style
  levelText: {
    color: '#3498db',
    fontWeight: '500',
  },
  
  // Preview Subtitle
  previewSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
});