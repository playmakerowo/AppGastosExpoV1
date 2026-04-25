import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { obtenerCategorias, unirCategoriaPeriodo } from '../db/queries/categorias';
import { obtenerResumenCategorias } from '../db/queries/producto_periodo';
import SelectorCantidadModal from './SelectorCantidadModal';

export default function EditarPresupuestos({ periodo_id }) {
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const datos = obtenerResumenCategorias(periodo_id);
  console.log('[EditarPresupuestos] Categorias:', datos);
  

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
              renderItem={({ item }) => (
                <View
                  style={styles.item}
                  onPress={() => {console.log("Editar presupuesto: ", item.categoria)}}
                >
                  <Text>{item.icono} {item.categoria}</Text>
                  <Text>
                    <SelectorCantidadModal value={item.monto_esperado}/>/
                    <SelectorCantidadModal value={item.monto_real}/>
                  </Text>
                </View>
              )}
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