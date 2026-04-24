import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerProductos } from '../db/queries/productos';
import { agregarProductoPeriodo } from '../db/queries/producto_periodo';
import NuevoProductoModal from './NuevoProductoModal';
import Toast from 'react-native-toast-message';

export default function ProductosModal({ categoria_id, periodo_id, onProductoAgregado }) {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const lista = obtenerProductos(categoria_id);
    setProductos(lista);
    console.log("[obtenerProductos] categoria", categoria_id, " Al periodo", periodo_id, " Lista productos", lista)
  }, []);

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Agregar producto</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitulo}>Productos</Text>

            <FlatList
              data={productos}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    try {
                      agregarProductoPeriodo(item.id, parseInt(periodo_id), 1, 0, 0);
                      setModalVisible(false);
                      onProductoAgregado?.();
                    } catch (error) {
                      setModalVisible(false);
                      setTimeout(() => {
                        Toast.show({ type: 'error', text1: item.nombre +' ya agregado previamente' });
                      }, 300);
                    }
                  }}
                >
                  <Text>{item.nombre}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.vacio}>Sin productos</Text>
              }
            />

            <NuevoProductoModal
              categoria_id={categoria_id}
              onProductoCreado={() => {
                const lista = obtenerProductos(categoria_id);
                setProductos(lista);
              }}
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
