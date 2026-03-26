import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import { Image } from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {DestinationsProps} from "@/types/props/add-trip-props";

export default function DestinationsStep({destinations, selectedDestination, fallbackMessage, onSelect}: DestinationsProps) {
    const {t} = useTranslation();
    const [loading, setLoading] = React.useState(true);

    return (
        <View>
            <View className="items-center mb-3">
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                    style={{ elevation: 6 }}
                >
                    <Ionicons name="map" size={40} color="white"/>
                </LinearGradient>
                <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.destinations.title')}</Text>
                <Text className="text-base font-normal text-gray-700 tracking-wide text-center">{t('trip.destinations.subtitle')}</Text>
            </View>
            {fallbackMessage && (
                <View
                    className="flex-row items-start bg-violet-100 rounded-xl p-2 mb-2 border border-violet-700"
                    style={{gap: 8}}
                >
                    <Ionicons name="information-circle-outline" size={18} color="#7f22fe"/>
                    <Text className="text-xs leading-4 text-violet-700 flex-1 ">{fallbackMessage}</Text>
                </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
                {destinations.map((dest) => (
                    <TouchableOpacity
                        key={dest.id}
                        className={`flex-row items-center rounded-xl my-1 bg-white overflow-hidden shadow-black ${
                            selectedDestination === dest.id ? 'border-2 border-violet-700' : 'border border-gray-200'
                        }`}
                        onPress={() => onSelect(dest)}
                    >
                        <View style={{ width: 100, height: 80 }}>
                            {loading && (
                                <View
                                    style={{ width: 100, height: 80, position: 'absolute' }}
                                    className="bg-gray-50 justify-center items-center"
                                >
                                    <ActivityIndicator size="small" color="#7f22fe" />
                                </View>
                            )}
                            <Image
                                source={{ uri: dest.imageUrl }}
                                style={{ width: 100, height: 80 }}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={300}
                                onDisplay={() => setLoading(false)}
                            />
                        </View>
                        <View className="flex-1 px-3">
                            <Text className="text-base font-bold text-gray-700 tracking-wide">{dest.name}</Text>
                            <Text className="text-sm font-normal text-gray-700 tracking-wide">{dest.country}</Text>
                        </View>
                        {selectedDestination === dest.id &&
                            <Ionicons name="checkmark-circle" size={24} color="#7f22fe" style={{marginRight: 12}}/>}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}