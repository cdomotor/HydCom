import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sentry from 'sentry-expo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    console.error('Unhandled error:', error, errorInfo);
    Sentry.Native.captureException(error);
    if (this.props.logToFile) {
      try {
        const logFile = FileSystem.documentDirectory + 'error-log.txt';
        const existing = await FileSystem.readAsStringAsync(logFile).catch(() => '');
        const log = `${new Date().toISOString()}\n${error.toString()}\n${JSON.stringify(errorInfo)}\n\n`;
        await FileSystem.writeAsStringAsync(logFile, existing + log, {
          encoding: FileSystem.EncodingType.UTF8
        });
      } catch (fileError) {
        console.error('Failed to write error log:', fileError);
      }
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (__DEV__) {
        return (
          <View style={[styles.container, styles.devOverlay]}>
            <Text style={styles.details}>{this.state.error?.toString()}</Text>
            <Button title="Dismiss" onPress={this.reset} />
          </View>
        );
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>App crashed</Text>
          <Button title="Retry" onPress={this.reset} />
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
  details: { fontSize: 12, color: 'darkred', marginBottom: 10 },
  devOverlay: {
    backgroundColor: 'rgba(255,0,0,0.8)'
  }
});

export default ErrorBoundary;
