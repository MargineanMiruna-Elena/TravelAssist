import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Alert,
} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import { MapPin, Trash2, Search, Plus } from 'lucide-react-native';
import {POISectionProps} from "@/types/props/trip-details-modal-props";

interface SearchResult {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

async function searchPlaces(query: string, region: Region): Promise<SearchResult[]> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&viewbox=${region.longitude - 0.5},${region.latitude + 0.5},${region.longitude + 0.5},${region.latitude - 0.5}&bounded=0`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.name || item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
    }));
}

export default function TripPOISection({ pois, onAdd, onRemove }: POISectionProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [mapRegion, setMapRegion] = useState<Region>({
        latitude: pois[0]?.latitude ?? 48.8566,
        longitude: pois[0]?.longitude ?? 2.3522,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await searchPlaces(query, mapRegion);
            setResults(res);
        } catch {
            Alert.alert('Search failed', 'Could not search places. Try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = (result: SearchResult) => {
        const alreadyAdded = pois.some(p => p.id === result.id);
        if (alreadyAdded) return;
        onAdd(result);
        setResults([]);
        setQuery('');
        setMapRegion(r => ({ ...r, latitude: result.latitude, longitude: result.longitude }));
    };

    const handleQueryChange = (text: string) => {
        setQuery(text);
        if (!text.trim()) setResults([]);
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
                        <View className="w-2 h-2 bg-violet-700 rounded-full mr-2" />
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-black tracking-wide">{poi.name}</Text>
                            <Text className="text-xs text-gray-500 tracking-wide" numberOfLines={1}>{poi.address}</Text>
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

            <View className="rounded-xl overflow-hidden h-[200] my-2">
                <MapView
                    className="flex-1"
                    provider="google"
                    initialRegion={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                >
                    {pois.map(poi => (
                        <Marker
                            key={poi.id}
                            coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                            title={poi.name}
                        />
                    ))}
                    {results.map(r => (
                        <Marker
                            key={r.id}
                            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                            title={r.name}
                            pinColor="#7f22fe"
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