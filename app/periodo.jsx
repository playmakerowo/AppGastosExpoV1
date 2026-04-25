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

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { obtenerPeriodos, crearPeriodo } from '../src/db/queries/periodos';
import { obtenerHogares } from '../src/db/queries/hogares';
import { obtenerProductosPeriodo, agregarProductoPeriodo } from '../src/db/queries/producto_periodo';
import { getDB } from '../src/db/database';
import { formatMes } from '../src/utils/calculos';

function copiarPeriodo(periodoOrigenId, periodoDestinoId) {
  const productos = obtenerProductosPeriodo(periodoOrigenId);

  productos.forEach(p => {
    agregarProductoPeriodo(
      p.producto_id,
      periodoDestinoId,
      p.cantidad,
      p.precio_unitario,
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

  const [modalCrearPeriodo, setModalCrearPeriodo] = useState({
    visible: false,
    nuevoMes: null,
  });

  const [copiarMesPasado, setCopiarMesPasado] = useState(true);

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

    setModalCrearPeriodo({
      visible: true,
      nuevoMes,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>

      <FlatList
        data={periodos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.item} onPress={() => {
            router.push(`/?periodo_id=${item.id}`);
          }}>
            <Text style={styles.mesTexto}>{formatMes(item.mes)}</Text>
            {index === 0 && <Text style={styles.badge}>Actual</Text>}
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

      <Modal
        visible={modalCrearPeriodo.visible}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.titulo}>
              Crear periodo
            </Text>

            <Text style={styles.texto}>
              ¿Crear {formatMes(modalCrearPeriodo.nuevoMes || '')}?
            </Text>

            {/* SWITCH */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Copiar mes anterior</Text>

              <Switch
                value={copiarMesPasado}
                onValueChange={setCopiarMesPasado}
              />
            </View>

            {/* BOTONES */}
            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  setModalCrearPeriodo({ visible: false, nuevoMes: null })
                }
                style={styles.cancel}
              >
                <Text>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const nuevoId = crearPeriodo(hogarId, modalCrearPeriodo.nuevoMes);

                  if (copiarMesPasado) {
                    copiarPeriodo(periodos[0].id, nuevoId);
                  }

                  setPeriodos(obtenerPeriodos(hogarId));

                  setModalCrearPeriodo({
                    visible: false,
                    nuevoMes: null
                  });

                  Alert.alert(
                    'OK',
                    `Periodo ${formatMes(modalCrearPeriodo.nuevoMes)} creado`
                  );
                }}
              >
                <Text>Crear</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },

  lista: { padding: 16 },

  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: '#6366f1',
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
    backgroundColor: '#fff',
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

  switchText: {
    fontSize: 14,
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