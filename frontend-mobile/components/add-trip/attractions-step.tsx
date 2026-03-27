import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, Linking} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {AttractionsProps} from "@/types/props/add-trip-props";

export default function AttractionsStep({attractions, selectedAttractions, onToggle}: AttractionsProps) {
    const {t} = useTranslation();

    const handleWebsite = (url: string, e: any) => {
        e.stopPropagation();
        Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    };

    return (
        <View className="flex-1">
            <View className="items-center mb-3">
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                    style={{elevation: 6}}
                >
                    <Ionicons name="star" size={40} color="white"/>
                </LinearGradient>
                <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.attractions.title')}</Text>
                <Text className="text-base font-normal text-gray-700 tracking-wide text-center">{t('trip.attractions.subtitle')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {attractions.map((attr) => {
                    const isSelected = selectedAttractions.includes(attr.id);
                    return (
                        <TouchableOpacity
                            key={attr.id}
                            className={`rounded-xl my-1 overflow-hidden shadow-black ${
                                isSelected ? 'border-2 border-violet-700 bg-violet-50' : 'border border-gray-200 bg-white'
                            }`}
                            onPress={() => onToggle(attr.id)}
                            activeOpacity={0.85}
                        >
                            {/* Image */}
                            {attr.imageUrl ? (
                                <Image
                                    source={{uri: attr.imageUrl}}
                                    className="w-full h-36"
                                    resizeMode="cover"
                                />
                            ) : null}

                            <View className="px-3 py-3">
                                {/* Name row + checkmark */}
                                <View className="flex-row items-start justify-between">
                                    <Text className="text-base font-bold text-gray-700 flex-1 mr-6">
                                        {attr.name}
                                    </Text>
                                    {isSelected ? (
                                        <Ionicons name="checkmark-circle" size={26} color="#7f22fe"/>
                                    ) : (
                                        <View className="w-6 h-6 rounded-full border border-gray-300 mt-0.5 mr-1"/>
                                    )}
                                </View>

                                {attr.category ? (
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-sm font-semibold text-gray-700 ml-1 flex-1" numberOfLines={1}>
                                            {attr.category}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Address */}
                                {attr.address ? (
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="location-outline" size={14} color="gray"/>
                                        <Text className="text-xs text-gray-700 ml-1 flex-1" numberOfLines={2}>
                                            {attr.address}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Website */}
                                {attr.website ? (
                                    <TouchableOpacity
                                        className="flex-row items-center mt-1"
                                        onPress={(e) => handleWebsite(attr.website, e)}
                                        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                                    >
                                        <Ionicons name="globe-outline" size={14} color="#7f22fe"/>
                                        <Text className="text-xs text-violet-700 ml-1 underline" numberOfLines={1}>
                                            {attr.website}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}