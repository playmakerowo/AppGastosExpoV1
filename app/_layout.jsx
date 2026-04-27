import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { initDB } from '../src/db/database';
import { seedCategorias } from '../src/utils/seedData';
import { verificarPeriodoActual } from '../src/utils/calculos';
import { formatMes } from '../src/utils/calculos';
import ModalCrearPeriodo from '../src/components/CrearPeriodosModal';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const [listo, setListo] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesDetectado, setMesDetectado] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function setup() {
      try {
        await initDB();
        seedCategorias();
        const hogarId = 1;
        setTimeout(() => {
          const estado = verificarPeriodoActual(hogarId);

          if (estado.estado === 'faltante') {
            Alert.alert(
              'Periodo desactualizado',
              `No existe un periodo para el mes actual: ${formatMes(estado.actual)}`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Crear',
                  onPress: () => {
                    setMesDetectado(estado.actual);
                    setMostrarModal(true);
                  }
                }
              ]
            );
          }
        }, 3000);

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
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#121472' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Mi Presupuesto' }} />
        <Stack.Screen name="periodo" options={{ title: 'Periodos' }} />
        <Stack.Screen name="categoria/[id]" options={{ title: 'Detalle' }} />
      </Stack>

      <ModalCrearPeriodo
        visible={mostrarModal}
        hogarId={1}
        mes={mesDetectado}
        onClose={(creado) => {
          setMostrarModal(false);

          if (creado) {
            router.replace('/');
          }
        }}
      />
    </>
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
