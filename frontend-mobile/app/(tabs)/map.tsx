import React, {useRef, useState} from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    Dimensions, Image
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Navigation } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Logo from "@/components/logo";

const { width, height } = Dimensions.get('window');

const TRIPS_MARKERS = [
    { id: '1', destination: 'Santorini', lat: 36.3932, lng: 25.4615, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=100' },
    { id: '2', destination: 'Kyoto', lat: 35.0116, lng: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=100' },
    { id: '3', destination: 'Taormina', lat: 37.8516, lng: 15.2853, image: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSI9pUHhWwW4xm7p5VzYGP_kE5_Z4T4ffu4Ysgj8DoQKs_35feUF6FzZqewz9tkNd9POEaIilCJjWmQKUT6stzHcZM&s=19' },
];

type RootStackParamList = {
    MapExplorer: undefined;
    Dashboard: undefined;
};

export default function MapExplorer({ navigation }: NativeStackScreenProps<RootStackParamList, 'MapExplorer'>) {
    const [activeTrip, setActiveTrip] = useState(TRIPS_MARKERS[0]);
    const mapRef = useRef<MapView>(null);

    const handleZoomToMarker = () => {
        mapRef.current?.animateToRegion({
            latitude: activeTrip.lat,
            longitude: activeTrip.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        }, 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="absolute top-[67px] left-5 z-10">
                <Logo name="Map" className="text-lg" />
            </View>

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
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
                            <Image source={{ uri: trip.image }} className="w-11 h-11 rounded-full" />
                            <View style={[
                                styles.markerArrow,
                                activeTrip?.id === trip.id && styles.activeArrow
                            ]} />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Card info jos (Floating UI) */}
            <View className="absolute bottom-6 left-5 right-5">
                <View className="bg-white py-4 px-6 shadow-md rounded-3xl">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-xl font-extrabold text-black">{activeTrip.destination}</Text>
                            <View className="flex-row items-center gap-1">
                                <MapPin size={14} color="#7f22fe" />
                                <Text className="text-xs text-violet-600 font-medium">[{activeTrip.lat},{activeTrip.lng}]</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="bg-violet-600 p-4 rounded-2xl shadow-md shadow-violet-600/40"
                            onPress={handleZoomToMarker}
                        >
                            <Navigation color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    map: { width: width, height: height },

    customMarker: {
        width: 50, height: 50, borderRadius: 25, borderWidth: 3,
        borderColor: 'white', backgroundColor: '#7f22fe',
        justifyContent: 'center', alignItems: 'center', elevation: 10,
    },
    activeMarker: { borderColor: '#7f22fe',
        width: 55,
        height: 55,
        borderRadius: 30,
        elevation: 20,
    },
    markerArrow: {
        width: 0, height: 0, backgroundColor: 'transparent',
        borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6,
        borderTopWidth: 8, borderLeftColor: 'transparent',
        borderRightColor: 'transparent', borderTopColor: 'white',
        position: 'absolute', bottom: -10
    },
    activeArrow: {
        borderTopColor: '#7f22fe',
    },

});