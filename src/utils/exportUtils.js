/**
 * Export utilities for formatting survey and sample data
 */

/**
 * Format complete export data for samples and surveys
 */
export const formatExportData = (samples, surveys) => {
  let exportText = generateHeader();
  
  if (samples.length > 0) {
    exportText += formatSamplesExport(samples);
  }
  
  if (surveys.length > 0) {
    exportText += formatSurveysExport(surveys);
  }
  
  exportText += generateFooter(samples.length, surveys.length);
  
  return exportText;
};

/**
 * Generate export header with metadata
 */
const generateHeader = () => {
  const now = new Date();
  return `HYDROGRAPHER'S COMPANION - DATA EXPORT
Generated: ${now.toLocaleString()}
Export Version: 1.0
=====================================

`;
};

/**
 * Format samples data for export
 */
const formatSamplesExport = (samples) => {
  let text = `SAMPLES DATA (${samples.length} samples)
=====================================
Sample_ID,Timestamp,Latitude,Longitude,Altitude,Accuracy,Notes
`;

  samples.forEach(sample => {
    const row = [
      sample.id,
      sample.timestamp,
      sample.latitude.toFixed(6),
      sample.longitude.toFixed(6),
      sample.altitude?.toFixed(1) || '',
      sample.accuracy?.toFixed(1) || '',
      `"${sample.notes.replace(/"/g, '""')}"` // Escape quotes in CSV
    ].join(',');
    
    text += row + '\n';
  });

  return text + '\n';
};

/**
 * Format surveys data for export
 */
const formatSurveysExport = (surveys) => {
  let text = `CROSS-SECTION SURVEYS (${surveys.length} surveys)
=====================================

`;

  surveys.forEach((survey, index) => {
    text += formatSingleSurvey(survey, index + 1);
    text += '\n';
  });

  return text;
};

/**
 * Format a single survey for export
 */
const formatSingleSurvey = (survey, surveyNumber) => {
  let text = `Survey ${surveyNumber}: ${survey.id}
Location: ${survey.latitude.toFixed(6)}, ${survey.longitude.toFixed(6)}
Timestamp: ${survey.timestamp}
Initial Instrument Height: ${survey.instrumentHeight?.toFixed(3) || 'N/A'}m
Width: ${survey.width.toFixed(2)}m, Max Depth: ${survey.maxDepth.toFixed(2)}m, Avg Depth: ${survey.avgDepth.toFixed(2)}m
`;

  // Add change points information
  if (survey.changePoints && survey.changePoints.length > 0) {
    text += `Change Points: ${survey.changePoints.length}\n`;
    survey.changePoints.forEach((cp, index) => {
      text += `  CP${index + 1}: Elev ${cp.elevation.toFixed(3)}m, IH: ${cp.oldInstrumentHeight.toFixed(3)}m → ${cp.newInstrumentHeight.toFixed(3)}m\n`;
    });
  }

  // Add misclose information
  if (survey.misclose !== null && survey.misclose !== undefined) {
    text += `Misclose: ${(survey.misclose * 1000).toFixed(1)}mm (Tolerance: ${(survey.miscloseTolerance * 1000).toFixed(1)}mm)\n`;
    text += `Start Elevation: ${survey.startElevation.toFixed(3)}m, End Elevation: ${survey.endElevation.toFixed(3)}m\n`;
  }

  text += `Notes: ${survey.notes}\n`;
  text += `\nPoint,Distance,Elevation,Backsight,Foresight,Depth,Rise,Fall,Type,Comment,Water_Level\n`;

  // Add survey points
  survey.points.forEach((point, index) => {
    const rise = point.rise !== null && point.rise !== undefined ? point.rise.toFixed(3) : '';
    const fall = point.fall !== null && point.fall !== undefined ? point.fall.toFixed(3) : '';
    const bs = point.backsight !== null && point.backsight !== undefined ? point.backsight.toFixed(3) : '';
    const fs = point.foresight !== null && point.foresight !== undefined ? point.foresight.toFixed(3) : '';
    
    const row = [
      index + 1,
      point.distance.toFixed(2),
      point.elevation.toFixed(3),
      bs,
      fs,
      point.depth?.toFixed(2) || '0.00',
      rise,
      fall,
      point.pointType || 'normal',
      `"${(point.comment || '').replace(/"/g, '""')}"`,
      point.waterLevel?.toFixed(2) || (point.elevation - (point.depth || 0)).toFixed(2)
    ].join(',');
    
    text += row + '\n';
  });

  return text;
};

/**
 * Generate export footer with summary
 */
const generateFooter = (sampleCount, surveyCount) => {
  return `
=====================================
EXPORT SUMMARY
=====================================
Total Samples: ${sampleCount}
Total Surveys: ${surveyCount}
Total Survey Points: ${getTotalPoints()}

Export completed successfully.
`;
};

/**
 * Calculate total points across all surveys
 */
const getTotalPoints = () => {
  // This would need access to surveys data
  // For now, we'll calculate it when called
  return 'N/A';
};

/**
 * Format data for CSV export specifically
 */
export const formatCSVExport = (samples, surveys) => {
  let csv = '';
  
  // Samples CSV
  if (samples.length > 0) {
    csv += 'SAMPLES\n';
    csv += 'Sample_ID,Timestamp,Latitude,Longitude,Altitude,Accuracy,Notes\n';
    
    samples.forEach(sample => {
      csv += [
        sample.id,
        sample.timestamp,
        sample.latitude.toFixed(6),
        sample.longitude.toFixed(6),
        sample.altitude?.toFixed(1) || '',
        sample.accuracy?.toFixed(1) || '',
        `"${sample.notes.replace(/"/g, '""')}"`
      ].join(',') + '\n';
    });
    
    csv += '\n';
  }
  
  // Surveys CSV
  if (surveys.length > 0) {
    csv += 'SURVEY_POINTS\n';
    csv += 'Survey_ID,Point,Distance,Elevation,Backsight,Foresight,Depth,Rise,Fall,Type,Comment,Water_Level,Latitude,Longitude\n';
    
    surveys.forEach(survey => {
      survey.points.forEach((point, index) => {
        csv += [
          survey.id,
          index + 1,
          point.distance.toFixed(2),
          point.elevation.toFixed(3),
          point.backsight?.toFixed(3) || '',
          point.foresight?.toFixed(3) || '',
          point.depth?.toFixed(2) || '0.00',
          point.rise?.toFixed(3) || '',
          point.fall?.toFixed(3) || '',
          point.pointType || 'normal',
          `"${(point.comment || '').replace(/"/g, '""')}"`,
          point.waterLevel?.toFixed(2) || (point.elevation - (point.depth || 0)).toFixed(2),
          survey.latitude.toFixed(6),
          survey.longitude.toFixed(6)
        ].join(',') + '\n';
      });
    });
  }
  
  return csv;
};

/**
 * Format data for email body
 */
export const formatEmailExport = (samples, surveys) => {
  const exportData = formatExportData(samples, surveys);
  
  return {
    subject: `Hydrographic Data Export - ${new Date().toLocaleDateString()}`,
    body: exportData
  };
};

/**
 * Generate summary statistics
 */
export const generateSummaryStats = (samples, surveys) => {
  const totalPoints = surveys.reduce((sum, survey) => sum + survey.points.length, 0);
  const totalChangePoints = surveys.reduce((sum, survey) => sum + (survey.changePoints?.length || 0), 0);
  const averageDepth = surveys.length > 0 
    ? surveys.reduce((sum, survey) => sum + survey.avgDepth, 0) / surveys.length 
    : 0;
  
  return {
    totalSamples: samples.length,
    totalSurveys: surveys.length,
    totalPoints,
    totalChangePoints,
    averageDepth: averageDepth.toFixed(2)
  };
};