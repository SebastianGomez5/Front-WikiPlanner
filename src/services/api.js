import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToLogin } from '../navigation/navigationRef';

const API_URL = 'https://siren-charcoal-existing.ngrok-free.dev/api';

const api = axios.create({
    baseURL: API_URL,
});

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('userToken');
            resetToLogin();
        }

        return Promise.reject(error);
    }
);

export default api;