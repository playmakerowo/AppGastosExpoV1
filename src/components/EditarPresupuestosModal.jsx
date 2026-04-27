import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerCategorias, actualizarMontoEsperadoCategoria } from '../db/queries/categorias';
import { obtenerResumenCategorias } from '../db/queries/producto_periodo';
import SelectorCantidadModal from './SelectorCantidadModal';
import Toast from 'react-native-toast-message';
import { formatCLP } from '../utils/calculos';

export default function EditarPresupuestos({ periodo_id, onActualizado }) {
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const datos = obtenerResumenCategorias(periodo_id);
  console.log('[EditarPresupuestos] Categorias:', datos);


  useEffect(() => {
    const lista = obtenerCategorias();
    setCategorias(lista);
  }, []);

  function guardarMontoEsperado(categoria_id, val) {
    try {
      actualizarMontoEsperadoCategoria(categoria_id, periodo_id, parseInt(val) || 0);
      onActualizado?.();
      Toast.show({ type: 'success', text1: 'Presupuesto actualizado' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No se pudo guardar' });
    }
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Editar presupuestos</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitulo}>Editar presupuestos</Text>

            <FlatList
              data={datos}
              keyExtractor={(item) => String(item.categoria_id)}
              renderItem={({ item }) => {
                const esIngreso = item.categoria_id === 1;

                return (
                  <View style={styles.item}>
                    <Text style={styles.categoriaNombre}>{item.icono} {item.categoria}</Text>
                    <View style={styles.filaCampos}>
                      <View style={styles.campo}>
                        <Text style={[styles.campoLabel,
                        !esIngreso && item.monto_real > item.monto_esperado && styles.rojo,
                        esIngreso && item.monto_real < item.monto_esperado && styles.rojo
                        ]}>
                          {esIngreso ? 'Ingresos esperados' : 'Presupuesto'}
                        </Text>
                        <SelectorCantidadModal
                          value={item.monto_esperado}
                          esDinero={true}
                          pasos={[
                            { valor: -10000, texto: '-10k' },
                            { valor: -1000, texto: '-1k' },
                            { valor: 1000, texto: '+1k' },
                            { valor: 10000, texto: '+10k' },

                            { valor: -1000000, texto: '-1M' },
                            { valor: -100000, texto: '-100k' },
                            { valor: 100000, texto: '+100k' },
                            { valor: 1000000, texto: '+1M' },
                          ]}
                          onChange={(val) => guardarMontoEsperado(item.categoria_id, val)}
                        />
                      </View>
                      <View style={styles.campo}>
                        <Text style={[styles.campoLabel,
                        !esIngreso && item.monto_real > item.monto_esperado && styles.rojo,
                        esIngreso && item.monto_real < item.monto_esperado && styles.rojo
                        ]}>
                          {esIngreso ? 'Ingresos actuales' : 'Gasto actual'}
                        </Text>
                        <Text style={styles.montoReal}>{formatCLP(item.monto_real)}</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.vacio}>Sin categorías</Text>
              }
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  montoReal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 10,
    textAlign: 'center',
  },
  rojo: {
    color: '#ef4444',
    fontWeight: '700',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  button: {
    backgroundColor: '#6365f1d3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 5,
  },

  buttonSecondary: {
    backgroundColor: '#94a3b8',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  filaCampos: {
    flexDirection: 'row',
    gap: 12,
  },
  campo: {
    flex: 1,
  },
  campoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
});