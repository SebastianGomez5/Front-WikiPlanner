import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/color';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Datos del usuario (Nombre y correo)
    const [userData, setUserData] = useState({ name: '', email: '' });

    // Estados para la contraseña
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    // Estados para la jornada
    const [workStart, setWorkStart] = useState(new Date());
    const [workEnd, setWorkEnd] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerType, setPickerType] = useState('start');

    const parseTimeFromBackend = (timeString) => {
        if (!timeString) return new Date();
        const [hours, minutes] = timeString.split(':');
        const d = new Date();
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return d;
    };

    const formatTimeToBackend = (dateObj) => {
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}:00`;
    };

    // Traemos los datos de perfil y preferencias al mismo tiempo
    const fetchProfileData = async () => {
        try {
            // 1. Pedimos los datos personales
            const userResponse = await api.get('/users/me');
            setUserData(userResponse.data);

            // 2. Pedimos las preferencias de horario
            const settingsResponse = await api.get('/settings/');
            if (settingsResponse.data) {
                setWorkStart(parseTimeFromBackend(settingsResponse.data.work_start_time));
                setWorkEnd(parseTimeFromBackend(settingsResponse.data.work_end_time));
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            Alert.alert('Error', 'No se pudieron cargar tus datos completos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfileData();
        });
        return unsubscribe;
    }, [navigation]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const payload = {
                work_start_time: formatTimeToBackend(workStart),
                work_end_time: formatTimeToBackend(workEnd),
                current_mode: "Normal"
            };

            await api.put('/settings/', payload);
            Alert.alert('¡Gloria a Dios!', 'Tus preferencias han sido actualizadas.');
        } catch (error) {
            console.error('Error guardando preferencias:', error);
            Alert.alert('Error', 'No se pudieron guardar tus preferencias.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Aviso', 'Por favor llena ambos campos.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Aviso', 'La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setSavingPassword(true);
        try {
            await api.put('/users/me/password', {
                current_password: currentPassword,
                new_password: newPassword
            });

            Alert.alert('¡Éxito!', 'Tu contraseña ha sido actualizada correctamente.');
            setPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'La contraseña actual es incorrecta o hubo un problema.');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    const onChangeTime = (event, selectedDate) => {
        setShowPicker(Platform.OS === 'ios');
        if (event.type === 'dismissed') return;
        if (selectedDate) {
            pickerType === 'start' ? setWorkStart(selectedDate) : setWorkEnd(selectedDate);
        }
    };

    const openPicker = (type) => {
        setPickerType(type);
        setShowPicker(true);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Tu Perfil</Text>

            {/* TARJETA DE IDENTIFICACIÓN */}
            <View style={styles.profileCard}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</Text>
                </View>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>

                <TouchableOpacity style={styles.passwordChangeBtn} onPress={() => setPasswordModalVisible(true)}>
                    <Text style={styles.passwordChangeText}>Cambiar Contraseña</Text>
                </TouchableOpacity>
            </View>

            {/* TARJETA DE HORARIOS */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Configuración de Jornada</Text>
                <Text style={styles.cardSubtitle}>
                    La IA usará estos límites para saber a qué hora puede empezar a agendarte tareas y a qué hora debe dejarte descansar.
                </Text>

                <Text style={styles.label}>Inicio de tu jornada</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => openPicker('start')}>
                    <Text style={styles.timeText}>{workStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Fin de tu jornada</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => openPicker('end')}>
                    <Text style={styles.timeText}>{workEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={pickerType === 'start' ? workStart : workEnd}
                        mode="time"
                        display="default"
                        onChange={onChangeTime}
                    />
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings} disabled={saving}>
                    {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveButtonText}>Guardar Preferencias</Text>}
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            {/* MODAL PARA CAMBIAR CONTRASEÑA */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cambiar Contraseña</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña actual"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Nueva contraseña"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={savingPassword}>
                            {savingPassword ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setPasswordModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Espaciado al final para el scroll */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.textDark, marginBottom: 20 },
    profileCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 15, elevation: 3, marginBottom: 20, alignItems: 'center' },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    avatarText: { fontSize: 35, color: colors.surface, fontWeight: 'bold' },
    userName: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginBottom: 5 },
    userEmail: { fontSize: 14, color: colors.textLight, marginBottom: 20 },
    passwordChangeBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: colors.secondary },
    passwordChangeText: { color: colors.secondary, fontWeight: 'bold', fontSize: 13 },
    card: { backgroundColor: colors.surface, padding: 20, borderRadius: 15, elevation: 3, marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 5 },
    cardSubtitle: { fontSize: 13, color: colors.textLight, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
    timeButton: { backgroundColor: colors.background, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', marginBottom: 15 },
    timeText: { fontSize: 16, color: colors.primary, fontWeight: 'bold' },
    saveButton: { backgroundColor: colors.secondary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, width: '100%' },
    saveButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
    logoutButton: { padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.danger, marginBottom: 20 },
    logoutButtonText: { color: colors.danger, fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.surface, borderRadius: 20, padding: 25, elevation: 5, width: '100%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: colors.background, borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', color: colors.textDark },
    cancelButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    cancelButtonText: { color: colors.textLight, fontWeight: 'bold', fontSize: 16 }
});