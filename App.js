import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  sendDefaultPii: true,
  tracesSampleRate: 1.0, // lower to 0.1-0.2 in production
});

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sentry Demo App</Text>
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Trigger Error</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Slow Transaction</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: '700' },
  button: {
    backgroundColor: '#362d59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
