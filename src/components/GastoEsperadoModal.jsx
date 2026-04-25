import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerGastoEsperado } from '../db/queries/categorias';
import { actualizarMontoEsperadoCategoria } from '../db/queries/categorias';
import Toast from 'react-native-toast-message';

export default function GastoEsperadoModal({ categoria_id, periodo_id, onActualizado }) {
  const [gastoEsperado, setGastoEsperado] = useState('0');
  const [modalVisible, setModalVisible] = useState(false);
  const [cantidadOriginal, setcantidadOriginal] = useState(gastoEsperado ?? 0);

  useEffect(() => {
    const montoEstimado = obtenerGastoEsperado(categoria_id, periodo_id);
    setGastoEsperado(String(montoEstimado));
    setcantidadOriginal(String(montoEstimado));
  }, []);

  function ajustar(delta) {
    setGastoEsperado(prev => String(Math.max(0, (parseInt(prev) || 0) + delta)));
  }

  function cancelar() {
    setGastoEsperado(cantidadOriginal);
    setModalVisible(false);
  }

  function guardar() {
    try {
      actualizarMontoEsperadoCategoria(categoria_id, periodo_id, parseInt(gastoEsperado) || 0);
      setGastoEsperado(String(gastoEsperado));
      onActualizado?.();
      Toast.show({ type: 'success', text1: 'Cambios guardados' });
      setModalVisible(false);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No se pudo guardar' });
    }

  }

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Modificar Presupuesto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>

            <Text style={styles.titulo}>Gasto estimado</Text>

            <TextInput
              style={styles.valorActual}
              value={gastoEsperado}
              keyboardType="numeric"
              onChangeText={(v) => setGastoEsperado(v.replace(/[^0-9]/g, ''))}
              selectTextOnFocus
            />

            <View style={styles.fila}>
              <TouchableOpacity style={styles.btn} onPress={() => ajustar(-100000)}>
                <Text style={styles.btnText}>-100k</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={() => ajustar(-10000)}>
                <Text style={styles.btnText}>-10k</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={() => ajustar(10000)}>
                <Text style={styles.btnText}>+10k</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={() => ajustar(100000)}>
                <Text style={styles.btnText}>+100k</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnConfirmar} onPress={guardar}>
              <Text style={styles.btnConfirmarText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCerrar} onPress={cancelar}>
              <Text style={styles.btnCerrarText}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  valorActual: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6366f1',
    textAlign: 'center',
    width: '100%',
  },
  fila: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnConfirmar: {
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnConfirmarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnCerrar: {
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  btnCerrarText: {
    color: '#94a3b8',
    fontSize: 15,
  },
});