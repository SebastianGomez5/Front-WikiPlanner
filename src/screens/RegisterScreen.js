import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, ScrollView
} from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Datos incompletos', 'Por favor llena todos los campos.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/register', {
                name,
                email,
                password
            });

            Alert.alert(
                '¡Cuenta creada!',
                'Tu cuenta fue registrada exitosamente. Ahora puedes iniciar sesión.',
                [{ text: 'Ir a Login', onPress: () => navigation.navigate('Login') }]
            );

        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.detail || 'No se pudo crear la cuenta. Intenta de nuevo.';
            Alert.alert('Error', mensaje);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View style={styles.card}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Crea tu cuenta</Text>
                    <Text style={styles.subtitle}>Empieza a organizar tu tiempo con IA</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        placeholderTextColor={colors.textLight}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor={colors.textLight}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        placeholderTextColor={colors.textLight}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar contraseña"
                        placeholderTextColor={colors.textLight}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.surface} />
                        ) : (
                            <Text style={styles.buttonText}>Crear cuenta</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary, padding: 20 },
    card: { backgroundColor: colors.surface, padding: 30, borderRadius: 15, elevation: 5 },
    logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 5 },
    subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 25 },
    input: { backgroundColor: colors.background, borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', color: colors.textDark },
    button: { backgroundColor: colors.secondary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
    loginLink: { textAlign: 'center', color: colors.primary, marginTop: 20, fontSize: 13, fontWeight: '600' },
});
