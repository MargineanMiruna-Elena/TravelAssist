import React from 'react';
import {View, Text, TextInput, Image} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {INTERESTS} from '@/constants/interests';
import {PreferencesProps} from "@/types/props/add-trip-props";
import {formatDateRange} from "@/utils/formatDateRange";
import {parseLocalDate} from "@/utils/dateUtils";

export default function PreferencesStep({
                                            additionalNotes,
                                            location,
                                            country,
                                            dateType,
                                            startDate,
                                            endDate,
                                            selectedMonths,
                                            duration,
                                            interests,
                                            onNotesChange,
}: PreferencesProps) {
    const {t} = useTranslation();

    const fmt = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const summaryDestination = location ? location + ", " + country : '';

    return (
        <View>
            <View className="items-center mb-3">
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                    style={{ elevation: 6 }}
                >
                    <Ionicons name="document-text" size={40} color="white"/>
                </LinearGradient>
                <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.preferences.title')}</Text>
                <Text className="text-sm font-normal text-gray-700 tracking-wide text-center">{t('trip.preferences.subtitle')}</Text>
            </View>

            <TextInput
                placeholder={t('trip.preferences.example')}
                value={additionalNotes}
                onChangeText={onNotesChange}
                multiline
                numberOfLines={8}
                className="border border-gray-200 rounded-xl p-3 text-sm text-gray-700 min-h-[140px] bg-white"
                placeholderTextColor="gray"
                textAlignVertical="top"
            />

            <View className="rounded-xl p-4 mt-2 border border-gray-200">
                <Text className="text-lg font-bold text-violet-700 tracking-wider mb-1">{t('trip.preferences.summary')}</Text>
                <View className="gap-3">
                    {summaryDestination === '' ? (
                        <Text className="text-xs font-semibold text-gray-500 tracking-wider">GOING SOMEWHERE FLEXIBLE</Text>
                    ) : (
                        <View>
                            <Text className="text-xs font-semibold text-gray-500 tracking-wider">{t('trip.preferences.destination')}</Text>
                            <Text className="text-lg font-bold tracking-wider text-black px-2">{summaryDestination}</Text>
                        </View>
                    )}

                    <View className="flex-row items-center">
                    {dateType === 'specific' ? (
                        <>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">START</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide text-center">{fmt(parseLocalDate(startDate!))}</Text>
                            </View>
                            <View className="w-px h-9 bg-gray-300"/>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">END</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide text-center">{fmt(parseLocalDate(endDate!))}</Text>
                            </View>
                            <View className="w-px h-9 bg-gray-300"/>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">DURATION</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">
                                    {duration} days
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">MONTHS</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide text-center">
                                    {formatDateRange(startDate, endDate, selectedMonths)}
                                </Text>
                            </View>
                            <View className="w-px h-9 bg-gray-300"/>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">DURATION</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">
                                    {duration} days
                                </Text>
                            </View>
                        </>
                    )}
                    </View>
                    <View className="flex-row flex-wrap items-center gap-1">
                        <Text className="text-xs font-semibold text-gray-500 tracking-wider mr-2">INTERESTS</Text>
                        {interests?.map((interestId) => {
                            const interest = INTERESTS.find(i => i.id === interestId);
                            return interest ? (
                                <Image key={interestId} source={interest.image} className="w-7 h-7 mx-1" resizeMode="contain" />
                            ) : null;
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
}