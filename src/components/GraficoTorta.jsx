import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { Svg, G, Path } from 'react-native-svg';
import { formatCLP } from '../utils/calculos';
import { obtenerProductosMasComprados } from '../db/queries/producto_periodo';

function GraficoTorta({ datos }) {
    const total = datos.reduce((acc, d) => acc + d.valor, 0);
    if (total === 0) return <Text style={styles.vacio}>Sin datos</Text>;

    const colores = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];
    const MAX_SEGMENTOS = 25;

    let datosAgrupados = [...datos].sort((a, b) => b.valor - a.valor);
    if (datosAgrupados.length > MAX_SEGMENTOS) {
        const top = datosAgrupados.slice(0, MAX_SEGMENTOS - 1);
        const otros = datosAgrupados.slice(MAX_SEGMENTOS - 1);
        const totalOtros = otros.reduce((acc, d) => acc + d.valor, 0);
        datosAgrupados = [...top, { nombre: 'Otros', valor: totalOtros }];
    }

    const cx = 100, cy = 100, r = 80;
    let anguloActual = -Math.PI / 2;
    const segmentos = datosAgrupados.map((d, i) => {
        const porcentaje = d.valor / total;
        const angulo = porcentaje * 2 * Math.PI;
        const x1 = cx + r * Math.cos(anguloActual);
        const y1 = cy + r * Math.sin(anguloActual);
        anguloActual += angulo;
        const x2 = cx + r * Math.cos(anguloActual);
        const y2 = cy + r * Math.sin(anguloActual);
        const largeArc = angulo > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return { path, color: colores[i % colores.length], ...d };
    });

    return (
        <View style={styles.graficoContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
                <G>
                    {segmentos.map((s, i) => (
                        <Path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
                    ))}
                </G>
            </Svg>
            <ScrollView style={styles.leyendaScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.leyenda}>
                    {segmentos.map((s, i) => (
                        <View key={i} style={styles.leyendaItem}>
                            <View style={[styles.leyendaColor, { backgroundColor: s.color }]} />
                            <Text style={styles.leyendaNombre} numberOfLines={1}>{s.nombre}</Text>
                            <Text style={styles.leyendaValor}>{formatCLP(s.valor)}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

function ListaProductos({ datos }) {
    if (!datos || datos.length === 0) {
        return <Text style={styles.vacio}>Sin productos</Text>;
    }

    return (
        <View>
            {[...datos].sort((a, b) => b.valor - a.valor).map((item, index) => (
                <View key={String(index)} style={styles.productoItem}>
                    <Text style={styles.productoRank}>#{index + 1}</Text>
                    <Text style={styles.productoNombre} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={styles.productoCantidad}>x{item.valor}</Text>
                </View>
            ))}
        </View>
    );
}

export default function ReportesModal({ datos, periodo_id }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [filtro, setFiltro] = useState('gastos');

    const datosFiltrados = datos?.filter(d => d.nombre !== 'Ingresos') ?? [];
    const datosProductos = modalVisible ? obtenerProductosMasComprados(periodo_id) : [];

    return (
        <View>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>📊 Resumen de gastos</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.container}>

                        <TouchableOpacity
                            style={styles.dragBarContainer}
                            onPress={() => setModalVisible(false)}
                        >
                            <View style={styles.dragBar} />
                        </TouchableOpacity>

                        <Text style={styles.titulo}>Resumen del periodo</Text>

                        <View style={styles.filtros}>
                            {['gastos', 'productos'].map(f => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filtroBtn, filtro === f && styles.filtroActivo]}
                                    onPress={() => setFiltro(f)}
                                >
                                    <Text style={[styles.filtroTexto, filtro === f && styles.filtroTextoActivo]}>
                                        {f === 'gastos' ? 'Gastos' : 'Productos'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {filtro === 'gastos'
                            ? <GraficoTorta datos={datosFiltrados} />
                            : <GraficoTorta datos={datosProductos} />
                        }

                        {filtro === 'productos' && (
                            <ScrollView style={styles.listaScroll} showsVerticalScrollIndicator={false}>
                                <ListaProductos datos={datosProductos} />
                            </ScrollView>
                        )}

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#6366f1',
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
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: '85%',
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    dragBarContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    filtros: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    filtroBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    filtroActivo: {
        backgroundColor: '#6366f1',
    },
    filtroTexto: {
        fontSize: 13,
        color: '#64748b',
    },
    filtroTextoActivo: {
        color: '#fff',
        fontWeight: '600',
    },
    graficoContainer: {
        alignItems: 'center',
        gap: 16,
        paddingBottom: 12,
    },
    leyenda: {
        width: '100%',
        gap: 8,
    },
    leyendaScroll: {
        maxHeight: 150,
        width: '100%',
    },
    leyendaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    leyendaColor: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    leyendaNombre: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
    },
    leyendaValor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    listaScroll: {
        maxHeight: 200,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginTop: 8,
    },
    productoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 8,
    },
    productoRank: {
        fontSize: 13,
        color: '#94a3b8',
        width: 28,
    },
    productoNombre: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
    },
    productoCantidad: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366f1',
    },
    vacio: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 15,
    },
});