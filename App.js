import React from 'react';
import { StatusBar } from 'expo-status-bar';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <ErrorBoundary logToFile>
      <StatusBar style="auto" />
      <MainNavigator />
    </ErrorBoundary>
  );
}
