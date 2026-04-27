import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { initDB } from '../src/db/database';
import { seedCategorias } from '../src/utils/seedData';
import { verificarPeriodoActual } from '../src/utils/calculos';
import { formatMes } from '../src/utils/calculos';
import ModalCrearPeriodo from '../src/components/CrearPeriodosModal';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const [listo, setListo] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesDetectado, setMesDetectado] = useState(null);
  const router = useRouter();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  async function programarRecordatorio() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      // Verificar si ya hay notificaciones programadas
      const programadas = await Notifications.getAllScheduledNotificationsAsync();
      if (programadas.length > 0) return; // 👈 ya existe, no hacer nada

      // Notificación inmediata al instalar
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Control de Gastos',
          body: '¡Bienvenido! Comienza a registrar tus gastos.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        },
      });

      // Notificación semanal
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Control de Gastos',
          body: '¿Tienes compras pendientes por registrar?',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60 * 60 * 24 * 7,
          repeats: true,
        },
      });

    } catch (e) {
      console.log('Notificaciones no disponibles en este entorno');
    }
  }

  useEffect(() => {
    async function setup() {
      try {
        await initDB();
        seedCategorias();
        await programarRecordatorio();
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
