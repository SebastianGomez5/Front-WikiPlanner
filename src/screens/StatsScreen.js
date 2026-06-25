import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

// Componente de barra de progreso reutilizable
const ProgressBar = ({ value, color, max = 100 }) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <View style={barStyles.track}>
            <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
    );
};

const barStyles = StyleSheet.create({
    track: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', marginTop: 6 },
    fill: { height: '100%', borderRadius: 5 }
});

// Componente de tarjeta de KPI individual
const KpiCard = ({ label, value, unit = '%', color, description, extra }) => (
    <View style={styles.kpiCard}>
        <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={[styles.kpiValue, { color }]}>{value}{unit}</Text>
        </View>
        <ProgressBar value={value} color={color} />
        <Text style={styles.kpiDescription}>{description}</Text>
        {extra && <Text style={styles.kpiExtra}>{extra}</Text>}
    </View>
);

export default function StatsScreen({ navigation }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchKPIs = async () => {
        try {
            const response = await api.get('/kpi/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Error cargando KPIs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchKPIs);
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchKPIs();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Calculando métricas...</Text>
            </View>
        );
    }

    const { resumen, kpis, tendencia_semanal } = data || {};

    // Color dinámico según el valor del KPI
    const colorFor = (value, inverse = false) => {
        if (inverse) {
            return value <= 10 ? '#10B981' : value <= 30 ? '#F59E0B' : '#EF4444';
        }
        return value >= 75 ? '#10B981' : value >= 40 ? '#F59E0B' : '#EF4444';
    };

    // Altura máxima de las barras del gráfico de tendencia
    const maxTrend = Math.max(...(tendencia_semanal || []).map(s => s.tasa_aceptacion), 1);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
            {/* Header */}
            <Text style={styles.header}>Métricas de la IA</Text>
            <Text style={styles.subheader}>
                Aquí puedes ver qué tan bien está aprendiendo el sistema tus hábitos.
            </Text>

            {/* Resumen numérico */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{resumen?.total_tareas ?? 0}</Text>
                    <Text style={styles.summaryLabel}>Tareas{'\n'}totales</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{resumen?.tareas_completadas ?? 0}</Text>
                    <Text style={styles.summaryLabel}>Completadas</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{resumen?.total_decisiones ?? 0}</Text>
                    <Text style={styles.summaryLabel}>Decisiones{'\n'}registradas</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{resumen?.confianza_promedio_ia ?? 0}</Text>
                    <Text style={styles.summaryLabel}>Confianza{'\n'}promedio IA</Text>
                </View>
            </View>

            {/* KPIs principales */}
            <Text style={styles.sectionTitle}>Indicadores Clave (KPIs)</Text>

            <KpiCard
                label="Tasa de Cobertura"
                value={kpis?.cobertura ?? 0}
                color={colorFor(kpis?.cobertura)}
                description="Porcentaje de tus tareas que la IA logra agendar en el día."
                extra={kpis?.cobertura >= 85 ? "✅ Meta alcanzada (≥85%)" : `⚠️ Meta: 85% — faltan ${(85 - (kpis?.cobertura ?? 0)).toFixed(1)}%`}
            />

            <KpiCard
                label="Tasa de Completado"
                value={kpis?.completado ?? 0}
                color={colorFor(kpis?.completado)}
                description="De las tareas agendadas, cuántas realmente completaste."
                extra={kpis?.completado >= 70 ? "✅ Meta alcanzada (≥70%)" : `⚠️ Meta: 70% — faltan ${(70 - (kpis?.completado ?? 0)).toFixed(1)}%`}
            />

            <KpiCard
                label="Tasa de Aceptación"
                value={kpis?.aceptacion ?? 0}
                color={colorFor(kpis?.aceptacion)}
                description="Porcentaje de sugerencias de la IA que aceptaste sin modificar. Si sube con el tiempo, la IA está aprendiendo tus hábitos."
                extra={kpis?.aceptacion >= 75 ? "✅ Meta alcanzada (≥75%)" : `⚠️ Meta: 75% — faltan ${(75 - (kpis?.aceptacion ?? 0)).toFixed(1)}%`}
            />

            <KpiCard
                label="Rechazo Repetido"
                value={kpis?.rechazo_repetido ?? 0}
                color={colorFor(kpis?.rechazo_repetido, true)}
                description="Porcentaje de veces que la IA repitió un error ya conocido. Debe tender a 0% a medida que aprende."
                extra={kpis?.rechazo_repetido <= 5 ? "✅ Meta alcanzada (≤5%)" : `⚠️ Meta: ≤5% — aún en ${kpis?.rechazo_repetido}%`}
            />

            {/* Gráfico de tendencia semanal */}
            <Text style={styles.sectionTitle}>Tendencia de Aprendizaje</Text>
            <View style={styles.trendCard}>
                <Text style={styles.trendSubtitle}>
                    Tasa de aceptación semana a semana. Si la línea sube, la IA mejora.
                </Text>

                <View style={styles.chartArea}>
                    {(tendencia_semanal || []).map((semana, index) => (
                        <View key={index} style={styles.barGroup}>
                            <Text style={styles.barValue}>
                                {semana.tasa_aceptacion > 0 ? `${semana.tasa_aceptacion}%` : '-'}
                            </Text>
                            <View style={styles.barWrapper}>
                                <View style={[
                                    styles.bar,
                                    {
                                        height: semana.tasa_aceptacion > 0
                                            ? Math.max((semana.tasa_aceptacion / maxTrend) * 120, 8)
                                            : 4,
                                        backgroundColor: semana.tasa_aceptacion > 0
                                            ? colorFor(semana.tasa_aceptacion)
                                            : '#E5E7EB'
                                    }
                                ]} />
                            </View>
                            <Text style={styles.barLabel}>{semana.semana}</Text>
                            <Text style={styles.barDecisions}>
                                {semana.total_decisiones > 0 ? `${semana.total_decisiones} dec.` : 'sin datos'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Línea de referencia de la meta */}
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Verde ≥75% (meta)</Text>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B', marginLeft: 12 }]} />
                    <Text style={styles.legendText}>Amarillo ≥40%</Text>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444', marginLeft: 12 }]} />
                    <Text style={styles.legendText}>Rojo &lt;40%</Text>
                </View>
            </View>

            {/* Nota académica */}
            <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>💡 ¿Cómo interpretar esto?</Text>
                <Text style={styles.noteText}>
                    La <Text style={{ fontWeight: 'bold' }}>Tasa de Aceptación creciente</Text> semana a semana es la evidencia principal de que el sistema aprende tus hábitos. Cada vez que rechazas una sugerencia, la IA penaliza esa franja horaria para futuras agendas.
                </Text>
                <Text style={[styles.noteText, { marginTop: 8 }]}>
                    La <Text style={{ fontWeight: 'bold' }}>Confianza promedio</Text> refleja qué tan seguros están los slots sugeridos según la función de penalización del motor CSP.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    loadingText: { marginTop: 12, color: colors.textLight, fontSize: 14 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
    subheader: { fontSize: 13, color: colors.textLight, marginBottom: 20, lineHeight: 18 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 12, marginTop: 8 },

    // Resumen numérico
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    summaryItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: 'center', marginHorizontal: 3, elevation: 2 },
    summaryNum: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
    summaryLabel: { fontSize: 10, color: colors.textLight, textAlign: 'center', marginTop: 4, lineHeight: 13 },

    // KPI cards
    kpiCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
    kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    kpiLabel: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, flex: 1 },
    kpiValue: { fontSize: 22, fontWeight: 'bold' },
    kpiDescription: { fontSize: 12, color: colors.textLight, marginTop: 8, lineHeight: 17 },
    kpiExtra: { fontSize: 12, fontWeight: '600', marginTop: 6 },

    // Gráfico de tendencia
    trendCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
    trendSubtitle: { fontSize: 12, color: colors.textLight, marginBottom: 16, lineHeight: 17 },
    chartArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, paddingBottom: 8 },
    barGroup: { alignItems: 'center', flex: 1 },
    barValue: { fontSize: 11, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
    barWrapper: { width: 36, justifyContent: 'flex-end', height: 120 },
    bar: { width: '100%', borderRadius: 4 },
    barLabel: { fontSize: 12, fontWeight: 'bold', color: colors.textDark, marginTop: 6 },
    barDecisions: { fontSize: 9, color: colors.textLight, marginTop: 2, textAlign: 'center' },
    legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, flexWrap: 'wrap' },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, color: colors.textLight, marginLeft: 4 },

    // Nota académica
    noteCard: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: colors.primary },
    noteTitle: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
    noteText: { fontSize: 12, color: colors.textDark, lineHeight: 18 },
});