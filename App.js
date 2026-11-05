import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  release: process.env.EXPO_PUBLIC_SENTRY_RELEASE,
  dist: process.env.EXPO_PUBLIC_SENTRY_DIST,
  environment: process.env.EXPO_PUBLIC_SENTRY_ENV ?? 'development',
  sendDefaultPii: false,

  tracesSampler: ({ name, parentSampled }) => {
    if (parentSampled !== undefined) return parentSampled ? 1.0 : 0;
    return __DEV__ ? 1.0 : 0.1; // 10% on prod as a starting point
  },

  ignoreErrors: [
    // 'Demo error: Trigger Error button pressed',
    /^Script error\.?$/,
  ],
});



const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reports a generic handled error to Sentry.
function triggerError() {
  Sentry.captureException(new Error('Demo error: Trigger Error button pressed'));
}

// Emits a ~2.5s transaction with two child spans.
function triggerSlowTransaction() {
  return Sentry.startSpan(
    { name: 'Slow Transaction', op: 'demo.slow' },
    async () => {
      await Sentry.startSpan({ name: 'simulated work 1', op: 'demo.work' }, () =>
        sleep(1000)
      );
      await Sentry.startSpan({ name: 'simulated work 2', op: 'demo.work' }, () =>
        sleep(1500)
      );
    }
  );
}

function App() {
  const [dialog, setDialog] = useState(null);

  const onTriggerError = () => {
    triggerError();
    setDialog({
      title: 'Error sent',
      message: 'Sent a generic error to Sentry: "Demo error: Trigger Error button pressed".',
    });
  };

  const onSlowTransaction = async () => {
    await triggerSlowTransaction();
    setDialog({
      title: 'Slow transaction sent',
      message:
        'Sent a slow transaction (~2.5s, with 2 child spans) to Sentry: "Slow Transaction".',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sentry Demo App</Text>
      <Pressable style={styles.button} onPress={onTriggerError}>
        <Text style={styles.buttonText}>Trigger Error</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onSlowTransaction}>
        <Text style={styles.buttonText}>Slow Transaction</Text>
      </Pressable>
      <Modal
        transparent
        animationType="fade"
        visible={dialog !== null}
        onRequestClose={() => setDialog(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{dialog?.title}</Text>
            <Text style={styles.dialogMessage}>{dialog?.message}</Text>
            <Pressable style={styles.button} onPress={() => setDialog(null)}>
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  dialogTitle: { fontSize: 20, fontWeight: '700' },
  dialogMessage: { fontSize: 16, color: '#333', textAlign: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
