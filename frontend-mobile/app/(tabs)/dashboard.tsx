import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    SafeAreaView, Image, Modal, Dimensions, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from "@/components/logo";
import { Plus, Calendar, MapPin, X, Clock, Map } from 'lucide-react-native';


const TRIPS : Trip[] = [
    {
        id: '1',
        destination: 'Santorini',
        country: 'Greece',
        date: '12 - 18 Oct 2026',
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=500',
        description: 'Explorează străzile albe și bucură-te de cele mai frumoase apusuri din Oia.'
    },
    {
        id: '2',
        destination: 'Kyoto',
        country: 'Japan',
        date: '05 - 15 Nov 2026',
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500',
        description: 'Vizită la templele budiste și grădinile zen în plin sezon de toamnă.'
    },
    {
        id: '3',
        destination: 'Taormina',
        country: 'Italy',
        date: '29 Jun - 3 Jul 2025',
        status: 'completed',
        image: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSI9pUHhWwW4xm7p5VzYGP_kE5_Z4T4ffu4Ysgj8DoQKs_35feUF6FzZqewz9tkNd9POEaIilCJjWmQKUT6stzHcZM&s=19',
        description: 'Vizită la templele budiste și grădinile zen în plin sezon de toamnă.'
    }
];

interface Trip {
    id: string;
    destination: string;
    country: string;
    date: string;
    status: 'upcoming' | 'completed';
    image: string;
    description: string;
}

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openDetails = (trip: Trip) => {
        setSelectedTrip(trip);
        setModalVisible(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} className="px-5">
                <View className="my-2">
                    <Logo name="Board" className="text-lg" />
                    <Text className="text-base text-gray-500 mb-2 font-normal">{TRIPS.length} curated destinations</Text>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {TRIPS.map((trip) => (
                        <TouchableOpacity
                            key={trip.id}
                            style={styles.card}
                            onPress={() => openDetails(trip)}
                            activeOpacity={0.9}
                        >
                            <Image source={{ uri: trip.image }} style={styles.cardImage} />

                            <View className="absolute top-3 left-3">
                                <View className="bg-white self-start py-1 px-2 rounded-lg">
                                    <Text className="text-[10px] font-extrabold text-violet-700">{trip.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                className="absolute left-0 right-0 bottom-0 h-[110] rounded-b-3xl justify-start px-4 py-7"
                                locations={[0.1, 0.6, 0.8]}
                            >
                                <Text className="text-lg text-white font-extrabold tracking-wider">{trip.destination}</Text>
                                <Text className="text-sm text-white font-semibold">{trip.country}</Text>
                                <View className="flex-row items-center gap-1 pt-1">
                                    <Calendar size={14} color="rgba(255,255,255,0.85)" />
                                    <Text className="text-xs text-white font-medium">{trip.date}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedTrip && (
                            <>
                                <Image source={{ uri: selectedTrip.image }} style={styles.modalImage} />
                                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <X color="white" size={24} />
                                </TouchableOpacity>

                                <View style={styles.modalBody}>
                                    <Text style={styles.modalTitle}>{selectedTrip.destination}</Text>
                                    <View style={styles.detailRow}>
                                        <Clock color="#7f22fe" size={18} />
                                        <Text style={styles.detailText}>{selectedTrip.date}</Text>
                                    </View>
                                    <Text style={styles.descriptionText}>{selectedTrip.description}</Text>

                                    <TouchableOpacity style={styles.actionButton}>
                                        <LinearGradient colors={['#4f39f6', '#7f22fe']} style={styles.fullGradient}>
                                            <Text style={styles.actionButtonText}>View Full Itinerary</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    card: {
        width: '48%', height: 240, borderRadius: 24,
        backgroundColor: '#FFF', marginBottom: 16, overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 }
        })
    },
    cardImage: { ...StyleSheet.absoluteFillObject },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: height * 0.85, overflow: 'hidden' },
    modalImage: { width: '100%', height: 300 },
    closeButton: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
    modalBody: { padding: 24 },
    modalTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 },
    detailText: { fontSize: 16, color: '#444', fontWeight: '600' },
    descriptionText: { fontSize: 16, color: '#666', lineHeight: 24, marginTop: 20 },
    actionButton: { marginTop: 30, borderRadius: 16, overflow: 'hidden' },
    fullGradient: { paddingVertical: 16, alignItems: 'center' },
    actionButtonText: { color: 'white', fontWeight: '700', fontSize: 16 }
});