import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

interface Props {
    onGenerate: () => Promise<void>;
}

export default function TripItinerarySection({ onGenerate }: Props) {
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        setLoading(true);
        try {
            await onGenerate();
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center gap-2">
                <Sparkles size={18} color="#7f22fe" />
                <Text className="text-base font-bold text-black tracking-wider">ITINERARY</Text>
            </View>
            <Text className="text-sm font-normal text-gray-500 w-full self-center my-1">
                Generate a day-by-day itinerary based on your preferences and points of interest.
            </Text>
            <TouchableOpacity
                className="rounded-2xl overflow-hidden mt-2"
                onPress={handlePress}
                disabled={loading}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3"
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <View className="flex-row items-center justify-center gap-1">
                            <Sparkles size={18} color="white" />
                            <Text className="text-base font-bold text-white">Generate Itinerary</Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: { borderRadius: 16, overflow: 'hidden' },
    gradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16,
    },
    buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});