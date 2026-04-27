import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useState } from 'react';
import { crearCategoria } from '../db/queries/categorias';

const EMOJIS = [
  '🛒','🍔','🚗','🏠','💊','📚','👗','🎮','✈️','🐾',
  '💡','📱','🎵','🏋️','🍷','☕','🧹','💈','🎁','💰',
  '🏦','📊','🧾','🔧','🌿','🎓','👶','🐶','🐱','🏖️',
];

export default function NuevaCategoriaModal({ onCategoriaCreada }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('📦');

  function guardar() {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    try {
      crearCategoria(nombre.trim(), icono);
      setNombre('');
      setIcono('📦');
      setModalVisible(false);
      onCategoriaCreada?.();
    } catch (e) {
      Alert.alert('Error', 'No se pudo crear la categoría');
    }
  }

  function cancelar() {
    setNombre('');
    setIcono('📦');
    setModalVisible(false);
  }

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Nueva categoría</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>

            <Text style={styles.titulo}>Nueva categoría</Text>

            <View style={styles.iconoPreview}>
              <Text style={styles.iconoGrande}>{icono}</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              value={nombre}
              onChangeText={setNombre}
              autoFocus
            />

            <Text style={styles.label}>Selecciona un ícono</Text>
            <FlatList
              data={EMOJIS}
              keyExtractor={(item) => item}
              numColumns={6}
              style={styles.emojiGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.emojiBtn, icono === item && styles.emojiSeleccionado]}
                  onPress={() => setIcono(item)}
                >
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    maxHeight: '85%',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  iconoPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoGrande: {
    fontSize: 36,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '100%',
    color: '#0f172a',
  },
  label: {
    fontSize: 13,
    color: '#0a0a0a',
    alignSelf: 'flex-start',
  },
  emojiGrid: {
    width: '100%',
    maxHeight: 200,
  },
  emojiBtn: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  emojiSeleccionado: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  emoji: {
    fontSize: 24,
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
    color: '#000000',
    fontSize: 15,
  },
});