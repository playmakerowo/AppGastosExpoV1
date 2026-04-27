import { View, Text, Modal, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';

import { crearPeriodo, obtenerPeriodos } from '../db/queries/periodos';
import { obtenerProductosPeriodo, agregarProductoPeriodo } from '../db/queries/producto_periodo';
import { getDB } from '../db/database';
import { formatMes } from '../utils/calculos';

export default function ModalCrearPeriodo({
  visible,
  hogarId,
  mes,
  onClose,
}) {
  const [copiarMesPasado, setCopiarMesPasado] = useState(true);

  function copiarPeriodo(periodoOrigenId, periodoDestinoId) {
    const productos = obtenerProductosPeriodo(periodoOrigenId);

    productos.forEach(p => {
      let precio_unitario = 0;
      if (p.producto_id == 1) {
        precio_unitario = p.precio_unitario;
      }

      agregarProductoPeriodo(
        p.producto_id,
        periodoDestinoId,
        p.cantidad,
        precio_unitario,
        p.monto_esperado
      );
    });

    const db = getDB();
    const cats = db.getAllSync(
      'SELECT * FROM categoria_periodo WHERE periodo_id = ?',
      [periodoOrigenId]
    );

    cats.forEach(c => {
      db.runSync(
        'INSERT OR IGNORE INTO categoria_periodo (categoria_id, periodo_id, monto_esperado) VALUES (?, ?, ?)',
        [c.categoria_id, periodoDestinoId, c.monto_esperado]
      );
    });
  }

  function handleCrear() {
    try {
      const periodos = obtenerPeriodos(hogarId);

      const yaExiste = periodos.find(p => p.mes === mes);
      if (yaExiste) {
        Alert.alert('Ya existe', `Ya hay un periodo para ${formatMes(mes)}`);
        return;
      }

      const nuevoId = crearPeriodo(hogarId, mes);

      if (copiarMesPasado && periodos.length > 0) {
        copiarPeriodo(periodos[0].id, nuevoId);
      }

      Alert.alert('Periodo creado', `Periodo ${(formatMes(mes))} creado`);

      onClose(true); // éxito
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo crear el periodo');
      onClose(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <Text style={styles.titulo}>Crear periodo</Text>

          <Text style={styles.texto}>
            ¿Crear {formatMes(mes)}?
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              Copiar estimados, productos e ingresos del periodo anterior
            </Text>
            <Switch
              value={copiarMesPasado}
              onValueChange={setCopiarMesPasado}
            />
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => onClose(false)} style={styles.cancel}>
              <Text>Cancelar</Text>
            </Pressable>

            <Pressable onPress={handleCrear}>
              <Text>Crear</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#ffffffce',
        borderRadius: 12,
        padding: 20,
    },
    titulo: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    texto: {
        marginBottom: 15,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        gap: 12,
    },
    switchText: {
        fontSize: 14,
        flex: 1,
        flexWrap: 'wrap',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    cancel: {
        marginRight: 20,
    }
});