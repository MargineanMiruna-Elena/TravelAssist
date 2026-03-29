import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {DurationProps} from "@/types/props/add-trip-props";

export default function DurationStep({duration, onDurationChange}: DurationProps) {
    const {t} = useTranslation();

    return (
        <View>
            <View className="items-center mb-7">
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                    style={{ elevation: 6 }}
                >
                    <Ionicons name="time" size={40} color="white"/>
                </LinearGradient>
                <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.how-long.title')}</Text>
                <Text className="text-base font-normal text-gray-700 tracking-wide text-center">{t('trip.how-long.subtitle')}</Text>
            </View>

            <View className="gap-3">
                <TextInput
                    placeholder={t('trip.how-long.textbox')}
                    value={duration}
                    onChangeText={onDurationChange}
                    keyboardType="numeric"
                    style={{borderWidth: 1, borderColor: 'lightgray', borderRadius: 16, padding: 16, fontSize: 16, backgroundColor: 'white',}}
                    placeholderTextColor="gray"
                />
                <View className="flex-row flex-wrap gap-2">
                    {[3, 5, 7, 10, 14, 21].map(days => (
                        <TouchableOpacity
                            key={days}
                            onPress={() => onDurationChange(days.toString())}
                            className="w-[30%]"
                        >
                            {duration === days.toString() ? (
                                <LinearGradient
                                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                                    className="px-3 py-4 rounded-xl items-center"
                                >
                                    <Text className="text-[15px] font-semibold text-white">{days} {t('trip.how-long.days')}</Text>
                                </LinearGradient>
                            ) : (
                                <View className="px-3 py-4 rounded-xl items-center bg-white border border-gray-200">
                                    <Text className="text-[15px] font-semibold text-gray-700">{days} {t('trip.how-long.days')}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}