import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';

interface Props {
    tripName: string;
    onDelete: () => Promise<void>;
}

export default function TripDeleteSection({ tripName, onDelete }: Props) {
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
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading} activeOpacity={0.8}>
                {loading ? (
                    <ActivityIndicator color="#e53e3e" size="small" />
                ) : (
                    <>
                        <Trash2 size={18} color="#e53e3e" />
                        <Text style={styles.buttonText}>Delete Trip</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, paddingVertical: 24 },
    button: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 14, borderRadius: 16,
        borderWidth: 1.5, borderColor: '#fecaca', backgroundColor: '#fff5f5',
    },
    buttonText: { fontSize: 15, fontWeight: '700', color: '#e53e3e' },
});