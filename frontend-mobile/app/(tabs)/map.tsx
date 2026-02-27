import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    Dimensions, Platform, Image
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChevronLeft, MapPin, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// Datele pentru hartă (coordonate aproximative pentru locațiile tale)
const TRIPS_MARKERS = [
    { id: '1', destination: 'Santorini', lat: 36.3932, lng: 25.4615, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=100' },
    { id: '2', destination: 'Kyoto', lat: 35.0116, lng: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=100' },
    { id: '3', destination: 'Taormina', lat: 37.8516, lng: 15.2853, image: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSI9pUHhWwW4xm7p5VzYGP_kE5_Z4T4ffu4Ysgj8DoQKs_35feUF6FzZqewz9tkNd9POEaIilCJjWmQKUT6stzHcZM&s=19' },
];

type RootStackParamList = {
    MapExplorer: undefined;
    Dashboard: undefined;
};

// Stil pentru a ascunde tot ce nu este marcat de tine
const mapStyle = [
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    // Poți adăuga și un ton mai minimalist hărții
    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] }
];

export default function MapExplorer({ navigation }: NativeStackScreenProps<RootStackParamList, 'MapExplorer'>) {
    const [activeTrip, setActiveTrip] = useState(TRIPS_MARKERS[0]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header suprapus */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <ChevronLeft color="#1A1A1A" size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Trip Explorer</Text>
                    <Text style={styles.headerSubtitle}>{TRIPS_MARKERS.length} locations marked</Text>
                </View>
            </View>

            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                customMapStyle={mapStyle} // Aici se întâmplă magia
                initialRegion={{
                    latitude: 20,
                    longitude: 0,
                    latitudeDelta: 100,
                    longitudeDelta: 100,
                }}
            >
                {TRIPS_MARKERS.map((trip) => (
                    <Marker
                        key={trip.id}
                        coordinate={{ latitude: trip.lat, longitude: trip.lng }}
                        onPress={() => setActiveTrip(trip)}
                    >
                        <View style={[
                            styles.customMarker,
                            activeTrip?.id === trip.id && styles.activeMarker
                        ]}>
                            <Image source={{ uri: trip.image }} style={styles.markerImage} />
                            <View style={styles.markerArrow} />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Card info jos (Floating UI) */}
            <View style={styles.bottomCardContainer}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'white']}
                    style={styles.infoCard}
                >
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.destTitle}>{activeTrip.destination}</Text>
                            <View style={styles.locationRow}>
                                <MapPin size={14} color="#7f22fe" />
                                <Text style={styles.locationText}>Saved Location</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.navButton}>
                            <Navigation color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    map: { width: width, height: height },
    header: {
        position: 'absolute', top: 60, left: 20, right: 20, zIndex: 10,
        flexDirection: 'row', alignItems: 'center'
    },
    backButton: {
        backgroundColor: 'white', padding: 12, borderRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 5
    },
    headerTitleContainer: { marginLeft: 15 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 13, color: '#666', fontWeight: '500' },

    // Stil Marker Personalizat
    customMarker: {
        width: 50, height: 50, borderRadius: 25, borderWidth: 3,
        borderColor: 'white', backgroundColor: '#7f22fe',
        justifyContent: 'center', alignItems: 'center', elevation: 10
    },
    activeMarker: { borderColor: '#7f22fe', transform: [{ scale: 1.2 }] },
    markerImage: { width: 44, height: 44, borderRadius: 22 },
    markerArrow: {
        width: 0, height: 0, backgroundColor: 'transparent',
        borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6,
        borderTopWidth: 8, borderLeftColor: 'transparent',
        borderRightColor: 'transparent', borderTopColor: 'white',
        position: 'absolute', bottom: -10
    },

    bottomCardContainer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    infoCard: {
        padding: 20, borderRadius: 28, shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15,
        shadowRadius: 20, elevation: 10
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    destTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    locationText: { color: '#7f22fe', fontWeight: '600', fontSize: 14 },
    navButton: {
        backgroundColor: '#7f22fe', padding: 15, borderRadius: 20,
        shadowColor: '#7f22fe', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8
    }
});