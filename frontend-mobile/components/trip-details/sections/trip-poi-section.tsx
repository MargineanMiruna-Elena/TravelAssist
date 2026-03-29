import React, {useRef, useState} from 'react';
import {
    View, Text, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Linking,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import { MapPin, Trash2, Search, Plus } from 'lucide-react-native';
import {POISectionProps} from "@/types/props/trip-details-modal-props";
import {Ionicons} from "@expo/vector-icons";
import {SearchResult} from "@/types/trip/search-result";
import TripService from "@/services/trip-service";

export default function TripPOISection({ pois, onAdd, onRemove }: POISectionProps) {
    const mapRef = useRef<MapView>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: pois[0]?.latitude ?? 48.8566,
        longitude: pois[0]?.longitude ?? 2.3522,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const handleMarkerPress = (latitude: number, longitude: number) => {
        mapRef.current?.animateToRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);
    };

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await TripService.searchPlaces(query, mapRegion);
            setResults(res);
        } catch {
            Alert.alert('Search failed', 'Could not search places. Try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = (result: SearchResult) => {
        setResults([]);
        setQuery('');
        try {
            onAdd(result);
            setMapRegion(r => ({ ...r, latitude: result.latitude, longitude: result.longitude }));
        } catch {
            Alert.alert('Error', 'Could not add point of interest.');
        }
    };

    const handleQueryChange = (text: string) => {
        setQuery(text);
        if (!text.trim()) setResults([]);
    };

    const handleWebsite = (url: string, e: any) => {
        e.stopPropagation();
        Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    };

    return (
        <View className="px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center gap-2">
                <MapPin size={18} color="#7f22fe" />
                <Text className="text-base font-bold text-black tracking-wider">POINTS OF INTEREST</Text>
            </View>

            {pois.length === 0 ? (
                <Text className="text-sm font-normal text-gray-500 w-full self-center p-2 m-1">No points of interest added yet.</Text>
            ) : (
                pois.map(poi => (
                    <View
                        key={poi.id}
                        className="flex-row items-center py-3 border-b border-gray-100 gap-1"
                    >
                        <View className="w-1 h-full bg-violet-400 rounded-full mr-2" />
                        <View className="flex-1 mr-2">
                            <Text className="text-sm font-bold text-black tracking-wide">{poi.name}</Text>
                            <Text className="text-[13px] font-semibold text-gray-700 flex-1 py-1" numberOfLines={1}>{poi.category}</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="location-outline" size={14} color="gray"/>
                                <Text className="text-xs text-gray-700 tracking-wide ml-1" numberOfLines={2}>{poi.address}</Text>
                            </View>
                            {poi.website ? (
                                <TouchableOpacity
                                    className="flex-row items-center mt-1"
                                    onPress={(e) => handleWebsite(poi.website, e)}
                                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                                >
                                    <Ionicons name="globe-outline" size={14} color="#7f22fe"/>
                                    <Text className="text-xs text-violet-700 ml-1 underline" numberOfLines={1}>
                                        {poi.website}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <TouchableOpacity
                            onPress={() => onRemove(poi.id)}
                            className="p-2"
                        >
                            <Trash2 size={16} color="red" />
                        </TouchableOpacity>
                    </View>
                ))
            )}

            <View className="rounded-xl overflow-hidden h-[250] my-2">
                <MapView
                    ref={mapRef}
                    className="flex-1"
                    provider={PROVIDER_GOOGLE}
                    initialRegion={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                >
                    {pois.map(poi => (
                        <Marker
                            key={poi.id}
                            coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                            title={poi.name}
                            onPress={() => handleMarkerPress(poi.latitude, poi.longitude)}
                        />
                    ))}
                    {results.map(r => (
                        <Marker
                            key={r.id}
                            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                            title={r.name}
                            pinColor="#7f22fe"
                            onPress={() => handleMarkerPress(r.latitude, r.longitude)}
                        />
                    ))}
                </MapView>
            </View>

            <View className="flex-row gap-2">
                <TextInput
                    className="flex-1 text-gray-600 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200"
                    placeholder="Search a place…"
                    placeholderTextColor="#99a1af"
                    value={query}
                    onChangeText={handleQueryChange}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity
                    className="bg-violet-700 rounded-xl items-center justify-center p-3"
                    onPress={handleSearch}
                >
                    {searching ? <ActivityIndicator size="small" color="white" /> : <Search size={18} color="white" />}
                </TouchableOpacity>
            </View>

            {results.length > 0 && (
                <View className="mt-2 rounded-xl overflow-hidden border border-gray-200">
                    {results.map(r => (
                        <TouchableOpacity
                            key={r.id}
                            className="flex-row items-center justify-between px-4 py-3 border-b border-b-gray-200 bg-white"
                            onPress={() => handleAdd(r)}
                        >
                            <View className="flex-1 mr-3">
                                <Text className="text-sm font-bold text-black tracking-wide">{r.name}</Text>
                                <Text className="text-xs text-gray-500 tracking-wide" numberOfLines={1}>{r.address}</Text>
                            </View>
                            <Plus size={18} color="#7f22fe" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}