import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Switch
} from 'react-native';

import { mesActual } from '../src/utils/calculos';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { obtenerPeriodos, crearPeriodo } from '../src/db/queries/periodos';
import { obtenerHogares } from '../src/db/queries/hogares';
import { obtenerProductosPeriodo, agregarProductoPeriodo } from '../src/db/queries/producto_periodo';
import { getDB } from '../src/db/database';
import { formatMes } from '../src/utils/calculos';
import ModalCrearPeriodo from '../src/components/CrearPeriodosModal';

import { ImageBackground } from 'react-native';

function copiarPeriodo(periodoOrigenId, periodoDestinoId) {
  const productos = obtenerProductosPeriodo(periodoOrigenId);

  productos.forEach(p => {
    var precio_unitario = 0
    if (p.producto_id == 1) {
      precio_unitario = p.precio_unitario
    }
    agregarProductoPeriodo(
      p.producto_id,
      periodoDestinoId,
      p.cantidad,
      precio_unitario,
      p.monto_esperado
    );
  });

  const db = getDB();
  const cats = db.getAllSync(
    'SELECT * FROM categoria_periodo WHERE periodo_id = ?',
    [periodoOrigenId]
  );

  cats.forEach(c => {
    db.runSync(
      'INSERT OR IGNORE INTO categoria_periodo (categoria_id, periodo_id, monto_esperado) VALUES (?, ?, ?)',
      [c.categoria_id, periodoDestinoId, c.monto_esperado]
    );
  });
}

export default function PeriodoScreen() {
  const router = useRouter();

  const [periodos, setPeriodos] = useState([]);
  const [hogarId, setHogarId] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);

  useEffect(() => {
    const hogares = obtenerHogares();
    if (hogares.length > 0) {
      setHogarId(hogares[0].id);
      setPeriodos(obtenerPeriodos(hogares[0].id));
    }
  }, []);

  function calcularSiguienteMes() {
    if (periodos.length === 0) return null;

    const ultimo = periodos[0].mes;
    const [anio, mes] = ultimo.split('-').map(Number);

    const siguiente = new Date(anio, mes, 1);

    const a = siguiente.getFullYear();
    const m = String(siguiente.getMonth() + 1).padStart(2, '0');

    return `${a}-${m}`;
  }

  function crearNuevoPeriodo() {
    const nuevoMes = calcularSiguienteMes();
    if (!nuevoMes) return;

    const yaExiste = periodos.find(p => p.mes === nuevoMes);
    if (yaExiste) {
      Alert.alert('Ya existe', `Ya hay un periodo para ${formatMes(nuevoMes)}`);
      return;
    }

    setMesSeleccionado(nuevoMes);
    setMostrarModal(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ImageBackground
        source={require('../assets/wallpaper.gif')}
        style={styles.safe}
      >
        <FlatList
          data={periodos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.item} onPress={() => {
              router.push(`/?periodo_id=${item.id}`);
            }}>
              <Text style={styles.mesTexto}>{formatMes(item.mes)}</Text>
              {item.mes === mesActual() && (
                <Text style={styles.badge}>Actual</Text>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay periodos aún</Text>
          }
        />

        <TouchableOpacity style={styles.btnNuevo} onPress={crearNuevoPeriodo}>
          <Text style={styles.btnNuevoText}>
            + Crear {periodos.length > 0 ? formatMes(calcularSiguienteMes()) : 'periodo'}
          </Text>
        </TouchableOpacity>

        <ModalCrearPeriodo
          visible={mostrarModal}
          hogarId={hogarId}
          mes={mesSeleccionado}
          onClose={(creado) => {
            setMostrarModal(false);

            if (creado) {
              setPeriodos(obtenerPeriodos(hogarId));
            }
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7dbdf' },

  lista: { padding: 16 },

  item: {
    backgroundColor: '#ffffffce',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
  },
  switchText: {
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
    maxWidth: 180
  },
  mesTexto: { fontSize: 16, fontWeight: '500' },

  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    fontSize: 12,
  },

  vacio: { textAlign: 'center', marginTop: 40 },

  btnNuevo: {
    margin: 16,
    backgroundColor: '#6365f1d3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnNuevoText: { color: '#fff', fontWeight: '700' },

  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#ffffffce',
    borderRadius: 12,
    padding: 20,
  },

  titulo: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  texto: {
    marginBottom: 15,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },

  cancel: {
    marginRight: 20,
  }
});