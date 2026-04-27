import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerProductos } from '../db/queries/productos';
import { agregarProductoPeriodo } from '../db/queries/producto_periodo';
import NuevoProductoModal from './NuevoProductoModal';
import Toast from 'react-native-toast-message';

export default function ProductosModal({ categoria_id, periodo_id, onProductoAgregado }) {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const lista = obtenerProductos(categoria_id);
    setProductos(lista);
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

            <TextInput
              style={styles.buscador}
              placeholder="🔍 Buscar producto..."
              value={busqueda}
              onChangeText={setBusqueda}
            />

            <FlatList
              data={productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    try {
                      agregarProductoPeriodo(item.id, parseInt(periodo_id), 1, 0, 0);
                      setModalVisible(false);
                      setBusqueda('');
                      onProductoAgregado?.();
                    } catch (error) {
                      setModalVisible(false);
                      setBusqueda('');
                      setTimeout(() => {
                        Toast.show({ type: 'error', text1: item.nombre + ' ya agregado previamente' });
                      }, 300);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>{item.nombre}</Text>
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
              onPress={() => {
                setBusqueda('');
                setModalVisible(false);
              }}
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
    backgroundColor: '#2b2929',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff'
  },
  buscador: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  item: {
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color: '#fff',
    backgroundColor: '#504c4cb7',
    borderRadius: 10,
    marginTop: 2
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
  vacio: {
    textAlign: 'center',
    color: '#ffffff',
    padding: 20,
  },
});