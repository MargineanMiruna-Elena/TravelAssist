import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import UserService from '@/services/user-service';

let isRedirecting = false;

export function setupAuthInterceptor() {
    axios.interceptors.response.use(
        response => response,
        async error => {
            if (error.response?.status === 401 && !isRedirecting) {
                isRedirecting = true;
                await UserService.logout();
                router.replace('/auth');
                setTimeout(() => { isRedirecting = false; }, 2000);
            }
            return Promise.reject(error);
        }
    );
}