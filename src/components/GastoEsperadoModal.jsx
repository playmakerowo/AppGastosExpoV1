import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerGastoEsperado } from '../db/queries/categorias';
import { actualizarMontoEsperadoCategoria } from '../db/queries/categorias';

export default function GastoEsperadoModal({ categoria_id, periodo_id, onActualizado }) {
  const [gastoEsperado, setGastoEsperado] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const montoEstimado = obtenerGastoEsperado(categoria_id, periodo_id);
    setGastoEsperado(montoEstimado);
  }, []);

  function guardar() {
    try {
      actualizarMontoEsperadoCategoria(categoria_id, periodo_id, parseInt(gastoEsperado) || 0);
      setModalVisible(false);
      onActualizado?.();
      Alert.alert('✓', 'Gasto estimado actualizado');
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  }

  return (
<View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Modificar Gasto estimado</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitulo}>Gasto estimado</Text>

            <TextInput
              style={styles.input}
              placeholder="$100.000"
              value={String(gastoEsperado)}
              onChangeText={(val) => setGastoEsperado(val)}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={guardar}
            >
              <Text style={styles.buttonText}>Actualizar gasto estimado</Text>
            </TouchableOpacity>

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

function crearNuevogastoEsperado() {
  Alert.alert(
    'Crear Nuevo gastoEsperado',
    `¿Crear nueva gastoEsperado?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Crear'
      },
    ]
  );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
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
    backgroundColor: '#6366f1',
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
});
