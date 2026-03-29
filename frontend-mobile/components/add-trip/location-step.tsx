import React from 'react';
import {View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {LocationProps} from "@/types/props/add-trip-props";

export default function LocationStep({
                                         location,
                                         country,
                                         isLocationFlexible,
                                         citySuggestions,
                                         countrySuggestions,
                                         activeDropdown,
                                         onLocationChange,
                                         onCountryChange,
                                         onCitySelect,
                                         onCountrySelect,
                                         onToggleFlexible,
                                     }: LocationProps) {
    const { t } = useTranslation();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View>
                    <View className="items-center mb-7">
                        <LinearGradient
                            colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                            className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                            style={{ elevation: 6 }}
                        >
                            <Ionicons name="location" size={40} color="white" />
                        </LinearGradient>
                        <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.where.title')}</Text>
                        <Text className="text-base font-normal text-gray-700 tracking-wide text-center">{t('trip.where.subtitle')}</Text>
                    </View>

                    <View className="gap-4">
                        {/* City Input */}
                        <View className="mb-3 z-50">
                            <Text className="text-base font-semibold text-violet-700 tracking-wider px-2">{t('trip.where.city')}</Text>
                            <TextInput
                                placeholder={t('trip.where.cityPlaceholder')}
                                value={location}
                                onChangeText={onLocationChange}
                                editable={!isLocationFlexible}
                                style={[
                                    {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, fontSize: 16, backgroundColor: 'white'},
                                    isLocationFlexible && {backgroundColor: '#F9FAFB', color: '#9CA3AF'}
                                ]}
                                placeholderTextColor="gray"
                            />
                            {activeDropdown === 'city' && citySuggestions.length > 0 && !isLocationFlexible && (
                                <View style={{
                                    position: 'absolute',
                                    top: 73,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'lightgray',
                                    elevation: 5,
                                    maxHeight: 180,
                                    overflow: 'hidden',
                                }}>
                                    <ScrollView
                                        keyboardShouldPersistTaps="handled"
                                        nestedScrollEnabled={true}
                                    >
                                        {citySuggestions.map((dest) => (
                                            <TouchableOpacity
                                                key={dest.id}
                                                className="flex-row items-center p-2 gap-2"
                                                onPress={() => onCitySelect(dest)}
                                            >
                                                <Ionicons name="location-outline" size={14} color="#7f22fe" />
                                                <Text className="text-sm font-semibold text-black flex-1">{dest.name}</Text>
                                                <Text className="text-xs text-gray-700">{dest.country}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Country Input */}
                        <View className="mb-3 z-40">
                            <Text className="text-base font-semibold text-violet-700 tracking-wider px-2">{t('trip.where.country')}</Text>
                            <TextInput
                                placeholder={t('trip.where.countryPlaceholder')}
                                value={country}
                                onChangeText={onCountryChange}
                                editable={!isLocationFlexible}
                                style={[
                                    {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, fontSize: 16, backgroundColor: 'white'},
                                    isLocationFlexible && {backgroundColor: '#F9FAFB', color: '#9CA3AF'}
                                ]}
                                placeholderTextColor="gray"
                            />
                            {activeDropdown === 'country' && countrySuggestions.length > 0 && !isLocationFlexible && (
                                <View style={{
                                    position: 'absolute',
                                    top: 73,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'lightgray',
                                    elevation: 5,
                                    maxHeight: 180,
                                    overflow: 'hidden',
                                }}>
                                    <ScrollView
                                        keyboardShouldPersistTaps="handled"
                                        nestedScrollEnabled={true}
                                    >
                                        {countrySuggestions.map((c) => (
                                            <TouchableOpacity
                                                key={c}
                                                className="flex-row items-center p-2 gap-2"
                                                onPress={() => onCountrySelect(c)}
                                            >
                                                <Ionicons name="globe-outline" size={14} color="#7f22fe" />
                                                <Text className="text-sm font-semibold text-black flex-1">{c}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={onToggleFlexible}
                            className="flex-row items-center p-3"
                        >
                            <View className={`w-5 h-5 border-2 rounded-md mr-3 justify-center items-center ${
                                isLocationFlexible ? 'bg-violet-700 border-violet-700' : 'border-gray-300'
                            }`}>
                                {isLocationFlexible && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <Text className="text-base text-gray-700 font-normal">{t('trip.where.checkbox')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}