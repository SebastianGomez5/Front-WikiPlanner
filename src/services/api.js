import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.20.28:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Este "Interceptor" es nuestro guardia de seguridad automático.
// Antes de que cualquier petición salga del celular, le pega el Token JWT.
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;