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
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Sparkles size={16} color="#7f22fe" />
                <Text style={styles.sectionTitle}>Itinerary</Text>
            </View>
            <Text style={styles.description}>
                Generate a day-by-day itinerary based on your destinations and points of interest.
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={handlePress}
                disabled={loading}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Sparkles size={18} color="white" />
                            <Text style={styles.buttonText}>Generate Itinerary</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 1 },
    description: { fontSize: 14, color: '#888', lineHeight: 20, marginBottom: 16 },
    button: { borderRadius: 16, overflow: 'hidden' },
    gradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16,
    },
    buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});