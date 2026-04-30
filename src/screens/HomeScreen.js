import React, { useState, useEffect, useCallback } from 'react';
// IMPORTANTE: Agregamos TouchableOpacity a la lista de importaciones
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

// MODIFICACIÓN 1: Recibimos { navigation } como parámetro
export default function HomeScreen({ navigation }) {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAgenda = async () => {
        try {
            const hoy = new Date();
            const inicioDia = new Date(hoy);
            inicioDia.setHours(0, 0, 0, 0);

            const finDia = new Date(hoy);
            finDia.setHours(23, 59, 59, 999);

            const startIso = inicioDia.toISOString();
            const endIso = finDia.toISOString();

            const response = await api.get('/time-blocks/agenda', {
                params: { start_date: startIso, end_date: endIso }
            });

            setAgenda(response.data);
        } catch (error) {
            console.error('Error cargando la agenda:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Ejecutamos fetchAgenda cuando la pantalla se enfoca para que siempre esté actualizada
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAgenda();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAgenda();
    }, []);

    const renderItem = ({ item }) => {
        const startTime = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={styles.card}>
                <View style={styles.timeColumn}>
                    <Text style={styles.cardTime}>{startTime}</Text>
                    <Text style={styles.timeTo}>a</Text>
                    <Text style={styles.cardTime}>{endTime}</Text>
                </View>
                <View style={styles.taskColumn}>
                    <Text style={styles.cardTitle}>{item.task.title}</Text>
                    <Text style={styles.cardSubtitle}>
                        {item.google_event_id ? '✓ Sincronizado en Google' : 'No sincronizado'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tu Agenda para Hoy</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={agenda}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No tienes tareas agendadas para hoy. ¡Aprovecha para descansar o crear nuevas!</Text>
                    }
                />
            )}

            {/* MODIFICACIÓN 2: El botón flotante (FAB - Floating Action Button) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateTask')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.textDark, marginBottom: 20 },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 6,
        borderLeftColor: colors.secondary,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    timeColumn: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        paddingRight: 10,
        marginRight: 10,
    },
    taskColumn: { flex: 1, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    cardSubtitle: { fontSize: 12, color: colors.textLight, marginTop: 4 },
    cardTime: { fontSize: 13, fontWeight: 'bold', color: colors.textDark },
    timeTo: { fontSize: 10, color: colors.textLight },
    emptyText: { textAlign: 'center', color: colors.textLight, marginTop: 50, fontSize: 16, fontStyle: 'italic' },

    // MODIFICACIÓN 3: Los estilos para que el botón se vea redondo y abajo a la derecha
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    fabText: {
        color: colors.surface,
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: -2,
    }
});