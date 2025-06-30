import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchSubscription = useRef(null);
  const headingSubscription = useRef(null);

  const requestPermission = async () => {
    try {
      console.log('Requesting location permission...');
      
      // For Expo Go, we only need foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        Alert.alert(
          'Permission Denied',
          'Location access is required for GPS coordinates. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.openSettings() }
          ]
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('Permission error:', err);
      setError('Failed to request location permission');
      return false;
    }
  };

  const startWatchingLocation = async () => {
    console.log('useLocation: Starting location watch...');
    
    try {
      // Stop any existing subscriptions
      stopWatching();

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.log('useLocation: No permission granted');
        return;
      }

      // Get initial location first
      console.log('Getting initial location...');
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        console.log('Initial location:', {
          latitude: initialLocation.coords.latitude.toFixed(6),
          longitude: initialLocation.coords.longitude.toFixed(6),
          heading: initialLocation.coords.heading,
        });
        setLocation(initialLocation);
      } catch (err) {
        console.log('Could not get initial location:', err.message);
      }

      // Set up location watching
      console.log('Setting up location watch...');
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 0, // Update on any movement
        },
        (newLocation) => {
          console.log('Location updated:', {
            latitude: newLocation.coords.latitude.toFixed(6),
            longitude: newLocation.coords.longitude.toFixed(6),
            heading: newLocation.coords.heading,
            accuracy: newLocation.coords.accuracy?.toFixed(1),
            altitude: newLocation.coords.altitude?.toFixed(1),
            speed: newLocation.coords.speed?.toFixed(1),
          });
          
          setLocation(newLocation);
          
          // Extract heading if available
          if (newLocation.coords.heading !== null && newLocation.coords.heading !== -1) {
            setHeading(newLocation.coords.heading);
          }
        }
      );

      console.log('Started watching position for compass');

      // Try to set up heading watching (compass)
      try {
        console.log('Attempting to set up heading watch...');
        
        // First, check if we can get a single heading reading
        const testHeading = await Location.getHeadingAsync();
        console.log('Test heading result:', testHeading);
        
        if (testHeading) {
          headingSubscription.current = await Location.watchHeadingAsync((headingData) => {
            console.log('Heading updated:', {
              magHeading: headingData.magHeading?.toFixed(1),
              trueHeading: headingData.trueHeading?.toFixed(1),
              accuracy: headingData.accuracy,
            });
            
            // Use true heading if available, otherwise magnetic
            const currentHeading = headingData.trueHeading !== -1 
              ? headingData.trueHeading 
              : headingData.magHeading;
              
            if (currentHeading !== -1) {
              setHeading(currentHeading);
            }
          });
          console.log('Heading watch started successfully');
        }
      } catch (headingError) {
        console.log('Heading/compass not available:', headingError.message);
        console.log('This is normal - not all devices have magnetometers');
        // Continue without heading - GPS still works
      }

    } catch (err) {
      console.error('Error starting location watch:', err);
      setError('Could not start location tracking: ' + err.message);
      Alert.alert('Error', 'Could not start GPS tracking. Please check your settings.');
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      // Get current position
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 15000,
      });
      
      console.log('Got current location:', {
        latitude: newLocation.coords.latitude.toFixed(6),
        longitude: newLocation.coords.longitude.toFixed(6),
        heading: newLocation.coords.heading,
      });
      
      setLocation(newLocation);

      // Try to get heading separately if not included
      if (newLocation.coords.heading === -1 || newLocation.coords.heading === null) {
        try {
          const headingData = await Location.getHeadingAsync();
          const currentHeading = headingData.trueHeading !== -1 
            ? headingData.trueHeading 
            : headingData.magHeading;
            
          if (currentHeading !== -1) {
            setHeading(currentHeading);
            console.log('Got separate heading:', currentHeading);
          }
        } catch (headingErr) {
          console.log('Could not get heading:', headingErr.message);
        }
      } else {
        setHeading(newLocation.coords.heading);
      }

    } catch (err) {
      console.error('Location error:', err);
      setError('Could not get location: ' + err.message);
      Alert.alert('Error', 'Could not get GPS location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    console.log('Refreshing location...');
    getCurrentLocation();
  };

  const stopWatching = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
      console.log('Stopped location watching');
    }
    if (headingSubscription.current) {
      headingSubscription.current.remove();
      headingSubscription.current = null;
      console.log('Stopped heading watching');
    }
  };

  // Initialize and start watching on mount
  useEffect(() => {
    console.log('useLocation: Initializing...');
    
    // Add a small delay to ensure Expo Go is ready
    const timer = setTimeout(() => {
      startWatchingLocation();
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      console.log('useLocation: Cleaning up...');
      stopWatching();
    };
  }, []);

  // Format location with heading
  const getLocationWithHeading = () => {
    if (!location) return null;
    
    return {
      ...location,
      coords: {
        ...location.coords,
        heading: heading !== null ? heading : location.coords.heading,
      }
    };
  };

  return {
    location: getLocationWithHeading(),
    heading,
    loading,
    error,
    refreshLocation,
    hasLocation: location !== null,
    hasHeading: heading !== null && heading !== -1,
    isWatching: watchSubscription.current !== null,
  };
};

export default useLocation;