import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { initDB } from '../src/db/database';
import { seedCategorias } from '../src/utils/seedData';
import { verificarPeriodoActual } from '../src/utils/calculos';
import { formatMes } from '../src/utils/calculos';

export default function RootLayout() {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDB();
        seedCategorias();

        // 👇 AQUÍ VA TU LÓGICA
        const hogarId = 1; // ajusta esto según tu app
        const estado = verificarPeriodoActual(hogarId);

        if (estado.estado === 'ok') {
          Alert.alert('Correcto', `Ya hay un periodo para el mes actual: ${formatMes(estado.actual)}`);
        }

        if (estado.estado === 'desactualizado') {
          Alert.alert('Periodo desactualizado', `No existe un periodo para el mes actual: ${formatMes(estado.actual)}`);
        }

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
