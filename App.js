import React from 'react';
import { ErrorUtils } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import MainNavigator from './src/navigation/MainNavigator';
import * as Sentry from 'sentry-expo';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: true,
    debug: true
  });
} else {
  console.warn('Missing EXPO_PUBLIC_SENTRY_DSN environment variable');
}

if (!process.env.EXPO_PUBLIC_SOME_KEY) {
  console.warn('Missing EXPO_PUBLIC_SOME_KEY environment variable');
}

const originalWarn = console.warn;
console.warn = (...args) => {
  originalWarn(...args);
  Sentry.Native.captureMessage('[warn] ' + args.join(' '));
};

const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
  Sentry.Native.captureException(new Error(args.join(' ')));
};

const defaultHandler =
  ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
if (ErrorUtils.setGlobalHandler) {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (defaultHandler) defaultHandler(error, isFatal);
    Sentry.Native.captureException(error);
  });
}

export default function App() {
  return (
    <ErrorBoundary logToFile>
      <StatusBar style="auto" />
      <MainNavigator />
    </ErrorBoundary>
  );
}
