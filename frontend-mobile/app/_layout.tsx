import "../i18n/i18n";
import {useEffect} from "react";
import {Slot, useRouter, useSegments} from "expo-router";
import AuthProvider from "@/context/AuthProvider";
import {PaperProvider} from 'react-native-paper';
import {useAuth} from "@/hooks/use-auth";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
    const {user, isLoading} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const firstSegment = segments[0] as string | undefined;
        const inAuthGroup = firstSegment === "auth";

        if (!user && !inAuthGroup) {
            router.replace("/auth" as any);
        } else if (user && inAuthGroup) {
            router.replace("/dashboard" as any);
        }
    }, [user, isLoading, segments]);

    return (
        <>
            <StatusBar style="dark" />
            <Slot />
        </>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <AuthProvider>
                    <RootLayoutNav/>
                </AuthProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}