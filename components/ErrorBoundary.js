import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Sentry from 'sentry-expo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error:', error, errorInfo);
    Sentry.Native.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>🚨 App Error</Text>
          <Text style={styles.message}>Something went wrong.</Text>
          <Text style={styles.details}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  message: { fontSize: 16, color: 'gray', marginBottom: 10 },
  details: { fontSize: 12, color: 'darkred' }
});

export default ErrorBoundary;
