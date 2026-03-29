import React, { useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Modal, Dimensions, StyleSheet, ActivityIndicator
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { X, ChevronRight, MessageSquarePlus } from 'lucide-react-native';
import { HistoryDrawerProps } from "@/types/props/history-drawer-props";

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export const HistoryDrawer = ({ isVisible, onClose, history, isLoading, onNewChat, onSelectSession }: HistoryDrawerProps) => {
    const translateX = useSharedValue(DRAWER_WIDTH);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const diffDays = Math.round((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-EN');
    };

    useEffect(() => {
        if (isVisible) {
            translateX.value = withTiming(0, { duration: 250 });
        } else {
            translateX.value = withTiming(DRAWER_WIDTH, { duration: 200 });
        }
    }, [isVisible]);

    const handleClose = () => {
        translateX.value = withTiming(DRAWER_WIDTH, { duration: 200 });
        setTimeout(onClose, 200);
    };

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [DRAWER_WIDTH, 0], [0, 1]),
    }));

    return (
        <Modal visible={isVisible} transparent animationType="none">
            {/* Backdrop */}
            <Animated.View style={[StyleSheet.absoluteFill, backdropStyle, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} />
            </Animated.View>

            {/* Drawer */}
            <Animated.View style={[styles.drawer, drawerStyle]}>
                <View className="bg-white flex-1 pt-14 px-5 pb-6">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-extrabold text-gray-900">History</Text>
                        <TouchableOpacity onPress={handleClose} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Chat list */}
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {isLoading ? (
                            <ActivityIndicator color="#7f22fe" />
                        ) : history.length === 0 ? (
                            <Text className="text-gray-400 text-center mt-10">No conversations yet</Text>
                        ) : (
                            history.map((session, index) => (
                                <TouchableOpacity
                                    key={session.sessionId ?? `session-${index}`}
                                    onPress={() => onSelectSession(session)}
                                    className="py-3 border-b border-gray-100"
                                >
                                    <Text className="text-gray-800 font-medium">{session.title}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">{formatDate(session.createdAt)}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <TouchableOpacity
                        onPress={onNewChat}
                        className="bg-violet-600 p-4 rounded-2xl items-center mt-2"
                    >
                        <Text className="text-white font-bold text-base">New Chat</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
    },
});