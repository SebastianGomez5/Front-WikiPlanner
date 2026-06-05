import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedBlock, setSelectedBlock] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Memoria visual local
    const [handledBlocks, setHandledBlocks] = useState({});

    const fetchAgenda = async () => {
        try {
            const hoy = new Date();
            const inicioDia = new Date(hoy);
            inicioDia.setHours(0, 0, 0, 0);

            const finDia = new Date(hoy);
            finDia.setHours(23, 59, 59, 999);

            const response = await api.get('/time-blocks/agenda', {
                params: { start_date: inicioDia.toISOString(), end_date: finDia.toISOString() }
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

    const handleDecision = async (action) => {
        if (!selectedBlock) return;

        const currentBlockId = selectedBlock.id;
        const isAccepted = action === 'completada';

        try {
            const payload = {
                conflict_context: {
                    task_id: selectedBlock.task_id,
                    task_title: selectedBlock.task.title,
                    scheduled_time: selectedBlock.start_time
                },
                ai_suggested_action: "Agendado por Motor CSP",
                user_final_action: isAccepted ? "Completada en el horario sugerido" : "Reprogramada por el usuario",
                is_accepted: isAccepted,
                confidence_score: 0.85
            };

            await api.post('/decisions/', payload);

            setHandledBlocks(prev => ({
                ...prev,
                [currentBlockId]: action
            }));

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
        // DOBLE CANDADO: Bloquea si la tocaste localmente o si ya viene completada de la BD
        if (!handledBlocks[item.id] && item.task.status !== 'Completada') {
            setSelectedBlock(item);
            setModalVisible(true);
        }
    };

    const renderItem = ({ item }) => {
        const startTime = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Evaluamos si ya está finalizada por la Base de Datos
        const isDbCompleted = item.task.status === 'Completada';
        
        // Si está completada en BD, le clavamos el status 'completada' a la fuerza
        let status = handledBlocks[item.id];
        if (!status && isDbCompleted) {
            status = 'completada';
        }

        let currentCardStyle = styles.card;
        let currentTitleStyle = styles.cardTitle;
        let statusText = item.google_event_id ? '✓ Sincronizado en Google' : 'No sincronizado';

        if (status === 'completada') {
            currentCardStyle = [styles.card, styles.cardCompleted];
            currentTitleStyle = [styles.cardTitle, styles.textCompleted];
            statusText = '✅ Tarea finalizada con éxito';
        } else if (status === 'reprogramar') {
            currentCardStyle = [styles.card, styles.cardRescheduled];
            currentTitleStyle = [styles.cardTitle, styles.textRescheduled];
            statusText = '🔄 Enviada para reprogramar';
        }

        return (
            <TouchableOpacity 
                style={currentCardStyle} 
                onPress={() => openTaskMenu(item)}
                activeOpacity={status ? 1 : 0.7} 
            >
                <View style={styles.timeColumn}>
                    <Text style={[styles.cardTime, status && {color: colors.textLight}]}>{startTime}</Text>
                    <Text style={styles.timeTo}>a</Text>
                    <Text style={[styles.cardTime, status && {color: colors.textLight}]}>{endTime}</Text>
                </View>
                <View style={styles.taskColumn}>
                    <Text style={currentTitleStyle}>{item.task.title}</Text>
                    <Text style={[styles.cardSubtitle, status && {color: colors.textLight}]}>
                        {statusText}
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
                    // Ya no usamos el filtro agresivo, pasamos la agenda completa del día.
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
    cardCompleted: {
        borderLeftColor: colors.success,
        backgroundColor: '#F3F4F6',
        opacity: 0.8,
    },
    cardRescheduled: {
        borderLeftColor: colors.danger,
        backgroundColor: '#F3F4F6',
        opacity: 0.8,
    },
    textCompleted: {
        textDecorationLine: 'line-through',
        color: colors.success,
    },
    textRescheduled: {
        textDecorationLine: 'line-through',
        color: colors.danger,
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