import { useEffect, useState, useCallback, useRef } from 'react';
import { Host, Button, View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerResumenCategorias } from '../src/db/queries/producto_periodo';
import { obtenerPeriodos, crearPeriodo } from '../src/db/queries/periodos';
import { crearHogar, obtenerHogares } from '../src/db/queries/hogares';
import { seedData } from '../src/utils/seedData';
import { formatCLP, calcularTotales, formatMes, mesActual } from '../src/utils/calculos';
import ResumenItem from '../src/components/ResumenItem';
import Categorias from '../src/components/Categorias';
import { obtenerGastoEsperadoTodasCategorias, obtenerGastoTodasCategorias } from '../src/db/queries/categorias';


export default function HomeScreen() {
  const router = useRouter();
  const [periodos, setPeriodos] = useState([]);
  const [periodoIdx, setPeriodoIdx] = useState(0);
  const [resumen, setResumen] = useState([]);
  const [totales, setTotales] = useState({ totalEsperado: 0, totalReal: 0 });
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEstimado, setTotalEstimado] = useState(0);
  const [totalGastado, setTotalGastado] = useState(0);

  const inicializado = useRef(false);
  const periodoIdxRef = useRef(0);

  useEffect(() => {
    cargarPeriodosInicial();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!inicializado.current) return;
      const hogares = obtenerHogares();
      if (hogares.length === 0) return;
      const lista = obtenerPeriodos(hogares[0].id);
      if (lista.length > 0) {
        setPeriodos(lista);
        const idx = periodoIdxRef.current;
        cargarResumen(lista[idx]?.id ?? lista[0].id);
      }
    }, [])
  );

  async function cargarPeriodosInicial() {
    try {
      let hogares = obtenerHogares();
      let hogarId;
      if (hogares.length === 0) {
        hogarId = crearHogar('Mi Hogar', 'HOGAR01');
      } else {
        hogarId = hogares[0].id;
      }
      let lista = obtenerPeriodos(hogarId);
      if (lista.length === 0) {
        const id = crearPeriodo(hogarId, mesActual());
        seedData(id);
        lista = obtenerPeriodos(hogarId);
      }
      setPeriodos(lista);
      setPeriodoIdx(0);
      periodoIdxRef.current = 0;
      cargarResumen(lista[0].id);
      inicializado.current = true;
    } catch (e) {
      console.error('Error cargando periodos:', e);
    }
  }

  function cargarResumen(periodo_id) {
    const datos = obtenerResumenCategorias(periodo_id);
    const conDatos = datos.filter(d => d.monto_esperado > 0 || d.monto_real == 0);
    setResumen(datos);
    setTotales(calcularTotales(conDatos));

    const ingresos = datos.find(d => d.categoria_id === 1);
    setTotalIngresos(ingresos?.monto_real ?? 0);

    setTotalEstimado(obtenerGastoEsperadoTodasCategorias(periodo_id));
    setTotalGastado(obtenerGastoTodasCategorias(periodo_id));
  }

  function irAnterior() {
    const nuevoIdx = periodoIdx + 1;
    if (nuevoIdx < periodos.length) {
      periodoIdxRef.current = nuevoIdx;
      setPeriodoIdx(nuevoIdx);
      cargarResumen(periodos[nuevoIdx].id);
    }
  }

  function irSiguiente() {
    const nuevoIdx = periodoIdx - 1;
    if (nuevoIdx >= 0) {
      periodoIdxRef.current = nuevoIdx;
      setPeriodoIdx(nuevoIdx);
      cargarResumen(periodos[nuevoIdx].id);
    }
  }

  const periodo = periodos[periodoIdx];

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={irAnterior}
          style={[styles.flecha, periodoIdx >= periodos.length - 1 && styles.flechaDisabled]}
          disabled={periodoIdx >= periodos.length - 1}
        >
          <Text style={styles.flechaTexto}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/periodo')} style={styles.periodoCenter}>
          <Text style={styles.periodoLabel}>Periodo</Text>
          <Text style={styles.periodoNombre}>{formatMes(periodo?.mes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={irSiguiente}
          style={[styles.flecha, periodoIdx <= 0 && styles.flechaDisabled]}
          disabled={periodoIdx <= 0}
        >
          <Text style={styles.flechaTexto}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalesCard}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Estimado</Text>
          <Text style={styles.totalValor}>{formatCLP(totalEstimado)}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Ingresos</Text>
          <Text style={styles.totalValor}>{formatCLP(totalIngresos)}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Gastado</Text>
          <Text style={styles.totalValor}>{formatCLP(totalGastado)}</Text>
        </View>
        <View style={styles.divisor} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Restante</Text>
          <Text style={styles.totalValor}>{formatCLP(totalGastado-totalEstimado)}</Text>
        </View>
      </View>

      <FlatList
        data={resumen}
        keyExtractor={(item) => String(item.categoria_id)}
        renderItem={({ item }) => (
          <ResumenItem
            categoria={item}
            onPress={() => router.push(
              `/categoria/${item.categoria_id}?periodo_id=${periodo?.id}&nombre=${item.categoria}`
            )}
          />

        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View>
            <Text style={styles.vacio}>Sin datos para este Periodo</Text>
          </View>
        }
      />
      <Categorias periodo_id={periodo?.id} onCategoriaAgregada={cargarResumen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d7dbdf' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  flecha: { width: 44, alignItems: 'center', justifyContent: 'center' },
  flechaDisabled: { opacity: 0.3 },
  flechaTexto: { fontSize: 32, color: '#fff', lineHeight: 36 },
  periodoCenter: { flex: 1, alignItems: 'center' },
  periodoLabel: { fontSize: 12, color: '#c7d2fe' },
  periodoNombre: { fontSize: 18, fontWeight: '700', color: '#fff' },
  totalesCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  totalItem: { flex: 1, alignItems: 'center' },
  totalLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  totalValor: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  rojo: { color: '#ef4444' },
  divisor: { width: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
  lista: { paddingHorizontal: 16, paddingBottom: 20 },
  vacio: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 15 },
});