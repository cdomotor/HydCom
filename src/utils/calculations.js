/**
 * Survey calculation utilities for hydrographic surveying
 */

/**
 * Calculate elevation from instrument height and sight readings
 */
export const calculateElevation = (instrumentHeight, backsight, foresight) => {
  if (instrumentHeight === null || instrumentHeight === undefined) return null;
  
  if (backsight !== null && backsight !== undefined && !isNaN(backsight)) {
    return instrumentHeight + backsight;
  }
  
  if (foresight !== null && foresight !== undefined && !isNaN(foresight)) {
    return instrumentHeight - foresight;
  }
  
  return null;
};

/**
 * Calculate rise and fall between two elevations
 */
export const calculateRiseFall = (currentElevation, previousElevation) => {
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

/**
 * Calculate misclose for a survey
 */
export const calculateMisclose = (points) => {
  if (points.length < 2) return null;
  
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  
  // Check if we have a closed traverse (similar start/end distances)
  const isClosedTraverse = Math.abs(startPoint.distance - endPoint.distance) < 0.1;
  
  if (isClosedTraverse) {
    return Math.abs(startPoint.elevation - endPoint.elevation);
  }
  
  return null;
};

/**
 * Calculate comprehensive survey statistics
 */
export const calculateSurveyStats = (points) => {
  if (points.length === 0) {
    return {
      width: 0,
      maxDepth: 0,
      avgDepth: 0,
      misclose: null,
      startElevation: null,
      endElevation: null,
      totalRise: 0,
      totalFall: 0,
      pointCount: 0,
    };
  }

  const elevations = points.map(p => p.elevation);
  const depths = points.map(p => p.depth || 0);
  const distances = points.map(p => p.distance);

  const maxDepth = Math.max(...depths);
  const avgDepth = depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  const width = Math.max(...distances) - Math.min(...distances);
  const startElevation = points[0].elevation;
  const endElevation = points[points.length - 1].elevation;
  const misclose = calculateMisclose(points);

  // Calculate total rise and fall
  let totalRise = 0;
  let totalFall = 0;
  
  for (let i = 1; i < points.length; i++) {
    const riseFall = calculateRiseFall(points[i].elevation, points[i - 1].elevation);
    if (riseFall.rise) totalRise += riseFall.rise;
    if (riseFall.fall) totalFall += riseFall.fall;
  }

  return {
    width,
    maxDepth,
    avgDepth,
    misclose,
    startElevation,
    endElevation,
    totalRise,
    totalFall,
    pointCount: points.length,
  };
};

/**
 * Calculate new instrument height for change points
 */
export const calculateNewInstrumentHeight = (pointElevation, backsightReading) => {
  return pointElevation + backsightReading;
};

/**
 * Validate survey point data
 */
export const validateSurveyPoint = (point, instrumentHeight) => {
  const errors = [];
  
  if (isNaN(point.distance) || point.distance < 0) {
    errors.push('Distance must be a positive number');
  }
  
  if (instrumentHeight === null) {
    errors.push('Instrument height must be set');
  }
  
  const hasBacksight = !isNaN(point.backsight) && point.backsight !== null;
  const hasForesight = !isNaN(point.foresight) && point.foresight !== null;
  
  if (!hasBacksight && !hasForesight) {
    errors.push('Either backsight or foresight is required');
  }
  
  if (point.pointType === 'changepoint' && (!hasBacksight || !hasForesight)) {
    errors.push('Change points require both backsight and foresight readings');
  }
  
  if (point.depth < 0) {
    errors.push('Depth cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if misclose is within acceptable tolerance
 */
export const isMiscloseAcceptable = (misclose, tolerance) => {
  if (misclose === null) return true;
  return misclose <= tolerance;
};

/**
 * Calculate water surface elevation
 */
export const calculateWaterLevel = (groundElevation, depth) => {
  return groundElevation - (depth || 0);
};

/**
 * Format elevation for display
 */
export const formatElevation = (elevation, precision = 3) => {
  if (elevation === null || elevation === undefined) return 'N/A';
  return elevation.toFixed(precision);
};

/**
 * Format distance for display
 */
export const formatDistance = (distance, precision = 2) => {
  if (distance === null || distance === undefined) return 'N/A';
  return distance.toFixed(precision);
};