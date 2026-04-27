import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { crearProducto } from '../db/queries/productos';

export default function NuevoProductoModal({ categoria_id, onProductoCreado }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');

  function guardar() {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    try {
      crearProducto(nombre.trim(), categoria_id);
      setNombre('');
      setModalVisible(false);
      onProductoCreado?.();
    } catch (e) {
      Alert.alert('Error', 'No se pudo crear el producto');
    }
  }

  function cancelar() {
    setNombre('');
    setModalVisible(false);
  }

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Nuevo producto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>

            <Text style={styles.titulo}>Nuevo producto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={nombre}
              onChangeText={setNombre}
              autoFocus
            />

            <TouchableOpacity style={styles.btnConfirmar} onPress={guardar}>
              <Text style={styles.btnConfirmarText}>Crear</Text>
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
    backgroundColor: '#6365f1d3',
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
    backgroundColor: '#0e0e0e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '100%',
    color: '#ffffff',
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
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#222122',
  },
  btnCerrarText: {
    color: '#ffffff',
    fontSize: 15,
  },
});