import React, { useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter, useSegments } from "expo-router";
import { AuthContext } from "./AuthContext";
import { login as loginService, register as registerService } from "../services/auth-service";

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const saved = await AsyncStorage.getItem("user");
                if (saved && saved !== "undefined") {
                    setUser(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Failed to load user from AsyncStorage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!user && !inAuthGroup) {
            router.replace('/auth');
        } else if (user && inAuthGroup) {
            router.replace('/dashboard');
        }
    }, [user, segments, isLoading]);

    const login = async (email: string, password: string) => {
        const data = await loginService(email, password);

        if (!data?.token) {
            throw new Error("No token returned from server");
        }

        await AsyncStorage.setItem("jwt", data.token);

        const decoded: any = jwtDecode(data.token);
        const currentUser = {
            id: decoded.id || "",
            email: decoded.sub || "",
            username: decoded.username || "",
            token: data.token
        };

        await AsyncStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
    };

    const register = async (name: string, email: string, password: string) => {
        const data = await registerService(name, email, password);

        if (!data?.token) {
            throw new Error("No token returned from server");
        }

        await AsyncStorage.setItem("jwt", data.token);

        const decoded: any = jwtDecode(data.token);
        const currentUser = {
            id: decoded.id || "",
            email: decoded.sub || "",
            username: decoded.username || name,
            token: data.token
        };

        await AsyncStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
    };

    const logout = async () => {
        await AsyncStorage.removeItem("jwt");
        await AsyncStorage.removeItem("user");
        setUser(null);
        router.replace('/auth');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}