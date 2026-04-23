import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDB } from '../src/db/database';
import { seedCategorias } from '../src/utils/seedData';

export default function RootLayout() {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDB();
        seedCategorias();
      } catch (e) {
        console.error('Error inicializando DB:', e);
      } finally {
        setListo(true);
      }
    }
    setup();
  }, []);

  if (!listo) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mi Presupuesto' }} />
      <Stack.Screen name="periodo" options={{ title: 'Periodos' }} />
      <Stack.Screen name="categoria/[id]" options={{ title: 'Detalle' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
