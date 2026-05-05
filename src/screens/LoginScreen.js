import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/color';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);
        try {
            // FastAPI usa OAuth2, por lo que requiere los datos en formato "Formulario URL Encoded"
            // y la variable del correo debe llamarse 'username' estrictamente.
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await api.post('/auth/login', params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // Si Dios quiere y todo sale bien, guardamos el token
            const token = response.data.access_token;
            await AsyncStorage.setItem('userToken', token);

            // Pasamos a la aplicación principal
            navigation.replace('MainTabs');

        } catch (error) {
            console.error(error);
            Alert.alert('Acceso Denegado', 'Credenciales incorrectas o servidor apagado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.card}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.subtitle}>Concéntrate en ser productivo, no en estar ocupado</Text>

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
                    placeholder="Contraseña"
                    placeholderTextColor={colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.surface} />
                    ) : (
                        <Text style={styles.buttonText}>Ingresar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// ... Mantén los mismos estilos (styles) que ya tenías en la versión anterior ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: colors.surface, padding: 30, borderRadius: 15, elevation: 5 },
    logo: { width: 180, height: 180, alignSelf: 'center', marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 5 },
    subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 30 },
    input: { backgroundColor: colors.background, borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', color: colors.textDark },
    button: { backgroundColor: colors.secondary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
});