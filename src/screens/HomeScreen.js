import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Nuevos estados para el menú emergente (Modal)
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAgenda();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAgenda();
    }, []);

    // FUNCIÓN CLAVE PARA LA TESIS: Registrar la decisión del usuario
    const handleDecision = async (action) => {
        if (!selectedBlock) return;

        try {
            const isAccepted = action === 'completada';

            const payload = {
                // El chisme completo para que el algoritmo aprenda en el futuro
                conflict_context: {
                    task_id: selectedBlock.task_id,
                    task_title: selectedBlock.task.title,
                    scheduled_time: selectedBlock.start_time
                },
                ai_suggested_action: "Agendado por Motor CSP",
                user_final_action: isAccepted ? "Completada en el horario sugerido" : "Reprogramada por el usuario",
                is_accepted: isAccepted,
                confidence_score: 0.85 // Valor simulado inicial
            };

            // Mandamos el reporte al backend
            await api.post('/decisions/', payload);

            // Cerramos el menú
            setModalVisible(false);
            setSelectedBlock(null);

            Alert.alert(
                '¡Excelente!',
                isAccepted
                    ? 'Tarea completada. La IA ha tomado nota de tu disciplina.'
                    : 'Registro guardado. La IA aprenderá a no ponerte este tipo de tareas en este horario.'
            );

        } catch (error) {
            console.error("Error guardando la decisión:", error);
            Alert.alert('Error', 'Hubo un problema al registrar tu decisión.');
        }
    };

    const openTaskMenu = (item) => {
        setSelectedBlock(item);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => {
        const startTime = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            // Convertimos la tarjeta en un botón tocable
            <TouchableOpacity style={styles.card} onPress={() => openTaskMenu(item)}>
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
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                />
                <Text style={styles.header}>Tu Agenda para Hoy</Text>
            </View>

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

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateTask')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* EL MODAL DE APRENDIZAJE DE IA */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¿Cómo te fue con esta tarea?</Text>
                        <Text style={styles.modalTaskName}>{selectedBlock?.task?.title}</Text>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.success }]}
                            onPress={() => handleDecision('completada')}
                        >
                            <Text style={styles.modalButtonText}>✅ La completé a tiempo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.danger }]}
                            onPress={() => handleDecision('reprogramar')}
                        >
                            <Text style={styles.modalButtonText}>🔄 Reprogramar (No pude hacerla)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.textLight }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.modalButtonText, { color: colors.textDark }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    headerLogo: { width: 40, height: 40, marginRight: 10 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.textDark },
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
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 5,
    },
    modalTaskName: {
        fontSize: 16,
        color: colors.primary,
        marginBottom: 25,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    modalButton: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalButtonText: {
        color: colors.surface,
        fontWeight: 'bold',
        fontSize: 15,
    }
});