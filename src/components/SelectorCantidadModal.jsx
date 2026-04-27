import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { formatCLP } from '../utils/calculos';

export default function SelectorCantidadModal({ value, onChange, esDinero, pasos }) {

  useEffect(() => {
    const val = value ?? 0;
    setCantidad(val);
    setcantidadOriginal(val);
  }, [value]);

  const pasosDefault = [
    { valor: -10, texto: '-10' },
    { valor: -1, texto: '-1' },
    { valor: 1, texto: '+1' },
    { valor: 10, texto: '+10' },
  ];

  const listaPasos = pasos ?? pasosDefault;
  const fila1 = listaPasos.slice(0, 4);
  const fila2 = listaPasos.slice(4, 8);
  const [modalVisible, setModalVisible] = useState(false);
  const [cantidadOriginal, setcantidadOriginal] = useState(value ?? 0);
  const [cantidad, setCantidad] = useState(value ?? 0);

  function ajustar(delta) {
    setCantidad(prev => Math.max(0, prev + delta));
  }

  function validar(cantidad) {
    if (cantidad < 0) {
      Alert.alert('Cantidad negativa', `La cantidad no puede ser negativa: ${cantidad}`);
      return false
    }
    return true
  }

  function confirmar() {
    if (!validar(cantidad)) return;
    onChange?.(cantidad);
    setcantidadOriginal(cantidad);
    setModalVisible(false);
  }

  function cancelar() {
    setCantidad(cantidadOriginal);
    setModalVisible(false);
  }

  function formatearMiles(valor) {
    if (!valor) return '';
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  return (
    <View style={{ alignSelf: 'stretch' }}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <TextInput
          style={styles.input}
          value={formatCLP(cantidad, esDinero)}
          keyboardType="numeric"
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>

            <Text style={styles.titulo}>Seleccione cantidad</Text>

            <TextInput
              style={styles.valorActual}
              value={formatearMiles(cantidad)}
              keyboardType="numeric"
              onChangeText={(v) => {
                const limpio = v.replace(/\./g, '');
                if (!isNaN(limpio)) {
                  setCantidad(parseInt(limpio) || 0);
                }
              }}
              selectTextOnFocus
            />

            <View style={styles.fila}>
              {fila1.map((p) => (
                <TouchableOpacity key={p.texto} style={styles.btn} onPress={() => ajustar(p.valor)}>
                  <Text style={styles.btnText}>{p.texto}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {fila2.length > 0 && (
              <View style={styles.fila}>
                {fila2.map((p) => (
                  <TouchableOpacity key={p.texto} style={styles.btn} onPress={() => ajustar(p.valor)}>
                    <Text style={styles.btnText}>{p.texto}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.btnConfirmar} onPress={confirmar}>
              <Text style={styles.btnConfirmarText}>Confirmar</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#302e2ed2',
    color: '#ffffff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#252525',
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
  valorActual: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6366f1',
  },
  fila: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    backgroundColor: '#6365f1d3',
    paddingVertical: 14,
    paddingHorizontal: 12,
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
    backgroundColor: '#3c3d3cf1',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnCerrarText: {
    color: '#ffffff',
    fontSize: 15,
  },
});