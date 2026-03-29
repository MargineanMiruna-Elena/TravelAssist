import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import UserService from "@/services/user-service";

export function useProtectedRoute() {
    const [isChecking, setIsChecking] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const jwt = await AsyncStorage.getItem('jwt');
            const user = await AsyncStorage.getItem('user');
            const isLoggedIn = !!(jwt && user);
            const inAuthGroup = segments[0] === 'auth';

            if (!isLoggedIn && !inAuthGroup) {
                router.replace('/auth');
            } else if (isLoggedIn && inAuthGroup) {
                router.replace('/dashboard');
            }
        } catch {
            await UserService.logout();
            router.replace('/auth');
        } finally {
            setIsChecking(false);
        }
    };

    return { isChecking };
}