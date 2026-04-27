import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerCategoriasNoIncluidasPeriodo, unirCategoriaPeriodo } from '../db/queries/categorias';
import NuevaCategoriaModal from './NuevaCategoriaModal';

export default function Categorias({ periodo_id, onCategoriaAgregada }) {
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!modalVisible) return;

    console.log('[Categorias] cargando categorias');

    const lista = obtenerCategoriasNoIncluidasPeriodo(periodo_id);

    console.log('[Categorias] lista:', lista);

    setCategorias(lista);
  }, [modalVisible, periodo_id]);
  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Agregar categoria</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitulo}>Categorías</Text>

            {categorias.length > 0 && (
              <TextInput
                style={styles.buscador}
                placeholder="🔍 Buscar categoría..."
                value={busqueda}
                onChangeText={setBusqueda}
              />
            )}

            <FlatList
              data={categorias.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    try {
                      unirCategoriaPeriodo(item.id, periodo_id);
                      setModalVisible(false);
                      setBusqueda('');
                      onCategoriaAgregada?.(periodo_id);
                    } catch (error) {
                      Alert.alert('Error', 'No se pudo agregar la categoría');
                    }
                  }}
                >
                  <Text>{item.icono} {item.nombre}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.vacio}>Sin categorías para agregar</Text>
              }
            />

            <NuevaCategoriaModal
              onCategoriaCreada={() => {
                const lista = obtenerCategoriasNoIncluidasPeriodo(periodo_id);
                setCategorias(lista);
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
  vacio: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 20,
  },
});