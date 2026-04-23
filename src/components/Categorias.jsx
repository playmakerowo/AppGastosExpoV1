import { View, Text, StyleSheet, TouchableOpacity, FlatList, Button, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerCategorias } from '../db/queries/categorias';
import { unirCategoriaPeriodo } from '../db/queries/categorias';

export default function Categorias({ periodo_id, onCategoriaAgregada }) {
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const lista = obtenerCategorias();
    setCategorias(lista);
  }, []);

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

            <FlatList
              data={categorias}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    console.log("agregar categoria:"+item.nombre+" Periodo:"+periodo_id);
                    
                    unirCategoriaPeriodo(item.id, periodo_id);
                    setModalVisible(false);

                    if (onCategoriaAgregada) {
                      onCategoriaAgregada(periodo_id);
                    }
                  }}
                >
                  <Text>{item.nombre}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.vacio}>Sin categorías</Text>
              }
            />

            <TouchableOpacity
              style={styles.button}
              onPress={crearNuevaCategoria}
            >
              <Text style={styles.buttonText}>Nueva categoria</Text>
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

function crearNuevaCategoria() {
  Alert.alert(
    'Crear categoria',
    `¿Crear nueva categoria?`,
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
