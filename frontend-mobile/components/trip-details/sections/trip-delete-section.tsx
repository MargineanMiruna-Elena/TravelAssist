import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import {DeleteSectionProps} from "@/types/props/trip-details-modal-props";

export default function TripDeleteSection({ tripName, onDelete }: DeleteSectionProps) {
    const [loading, setLoading] = useState(false);

    const handlePress = () => {
        Alert.alert(
            'Delete Trip',
            `Are you sure you want to delete "${tripName}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await onDelete();
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className="px-5 py-8">
            <TouchableOpacity
                className="py-3 rounded-2xl border border-red-400 bg-red-50"
                onPress={handlePress}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="red" size="small" />
                ) : (
                    <View className="flex-row items-center justify-center gap-1">
                        <Trash2 size={18} color="red" />
                        <Text className="text-base font-bold text-red-500">Delete Trip</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}