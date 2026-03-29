import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {INTERESTS} from '@/constants/interests';
import {InterestsProps} from "@/types/props/add-trip-props";

export default function InterestsStep({interests, onToggle}: InterestsProps) {
    const {t} = useTranslation();

    return (
        <View>
            <View className="items-center mb-5">
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                    style={{ elevation: 6 }}
                >
                    <Ionicons name="heart" size={40} color="white"/>
                </LinearGradient>
                <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.interests.title')}</Text>
                <Text className="text-base font-normal text-gray-700 tracking-wide text-center">{t('trip.interests.subtitle')}</Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
                {INTERESTS.map(interest => (
                    <TouchableOpacity
                        key={interest.id}
                        onPress={() => onToggle(interest.id)}
                        className="w-[46%]"
                    >
                        {interests.includes(interest.id) ? (
                            <LinearGradient
                                colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                                className="px-2 py-3 rounded-xl flex-row items-center"
                                style={{gap: 8}}
                            >
                                <Image
                                    source={interest.image}
                                    style={{width: 32, height: 32}}
                                    resizeMode="contain"
                                />
                                <Text
                                    className="text-sm font-semibold text-white flex-1"
                                    style={{ flexShrink: 1 }}
                                >
                                    {t(interest.labelKey)}
                                </Text>
                            </LinearGradient>
                        ) : (
                            <View className="px-2 py-3 rounded-xl flex-row items-center bg-white border border-gray-200" style={{gap: 8}}>
                                <Image
                                    source={interest.image}
                                    style={{width: 32, height: 32}}
                                    resizeMode="contain"/>
                                <Text
                                    className="text-sm font-semibold text-gray-700 flex-1"
                                    style={{ flexShrink: 1 }}
                                >
                                    {t(interest.labelKey)}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}