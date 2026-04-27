import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { formatCLP } from '../utils/calculos';
import SelectorCantidadModal from './SelectorCantidadModal';
import Toast from 'react-native-toast-message';
import { eliminarProductoPeriodo } from '../db/queries/producto_periodo';

export default function ProductoRow({ producto, periodo_id, onChange, onDelete }) {
  const { nombre, cantidad, precio_unitario } = producto;
  const montoReal = (parseInt(cantidad) || 0) * (parseInt(precio_unitario) || 0);
  console.log("[PRODUCTOROW] producto: ", producto)

  function confirmarEliminacion() {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que quieres eliminar "${nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: EliminarProducto, // 🔥 ejecuta tu función real
        },
      ],
      { cancelable: true }
    );
  }

  function EliminarProducto() {
    try {
      var result = eliminarProductoPeriodo(producto.id, producto.producto_id, periodo_id);
      if (result > 0) {
        Toast.show({ type: 'success', text1: 'Se removio el produto ' + nombre });

        onDelete(producto);

        return
      }
      Toast.show({ type: 'error', text1: 'No se pudo remover el producto' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No se pudo remover el producto' });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.nombre} numberOfLines={1}>{nombre}</Text>
      <View style={styles.inputs}>
        <View style={styles.campo}>
          <Text style={styles.label}>Cant.</Text>
          <SelectorCantidadModal
            value={producto.cantidad}
            onChange={(cantidad) => onChange({ ...producto, cantidad: cantidad })}
            esDinero={false}
          />
        </View>
        <Text style={styles.mult}>×</Text>
        <View style={styles.campo}>
          <Text style={styles.label}>Precio</Text>
          <SelectorCantidadModal
            value={precio_unitario}
            pasos={[
              { valor: -10000, texto: '-10k' },
              { valor: -1000, texto: '-1k' },
              { valor: 1000, texto: '+1k' },
              { valor: 10000, texto: '+10k' },

              { valor: -1000000, texto: '-1M' },
              { valor: -100000, texto: '-100k' },
              { valor: 100000, texto: '+100k' },
              { valor: 1000000, texto: '+1M' },
            ]}
            onChange={(cantidad) => onChange({ ...producto, precio_unitario: cantidad })}
          />
        </View>
        <View style={styles.total}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.totalValor}>{formatCLP(montoReal)}</Text>
        </View>
        <TouchableOpacity onPress={confirmarEliminacion} style={styles.btnEliminar}>
          <Text style={styles.btnEliminarTexto}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffffce',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campo: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#030303',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 4,
    width: 150,
    textAlign: 'center',
    fontSize: 14,
    color: '#1e293b',
  },
  inputCantidad: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 4,

    width: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#1e293b',
  },
  mult: {
    fontSize: 16,
    color: '#030303',
    marginTop: 12,
  },
  total: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  btnEliminar: {
    paddingLeft: 4,
    paddingRight: 4,
    backgroundColor: '#e6e3e3',
    borderRadius: 4,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEliminarTexto: {
    color: '#fa0000',
    fontSize: 19,
    fontWeight: '700',
  },
});
