import React from 'react';
import {View, Text, TouchableOpacity, Modal, Platform} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {DatesProps} from "@/types/props/add-trip-props";
import DateTimePicker from "@react-native-community/datetimepicker";
import {MONTHS} from "@/constants/months";

export default function DatesStep({
                                      dateType,
                                      startDate,
                                      endDate,
                                      selectedMonths,
                                      activePicker,
                                      onDateTypeChange,
                                      onSetActivePicker,
                                      onDateChange,
                                      onToggleMonth
}: DatesProps) {
    const {t} = useTranslation();

    return (
        <View>
            <View className="items-center mb-7">
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="w-20 h-20 rounded-full justify-center items-center mb-5 shadow-violet-700 shadow-xl/20"
                    style={{ elevation: 6 }}
                >
                    <Ionicons name="calendar" size={40} color="white"/>
                </LinearGradient>
                <Text className="text-3xl font-bold text-violet-700 mb-3 text-center">{t('trip.when.title')}</Text>
                <Text className="text-base font-normal text-gray-700 tracking-wide text-center">{t('trip.when.subtitle')}</Text>
            </View>

            <View className="flex-row gap-3 mb-4">
                {['specific', 'flexible'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => onDateTypeChange(type)}
                        className="flex-1"
                    >
                        {dateType === type ? (
                            <LinearGradient
                                colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                                className="items-center p-4 rounded-2xl"
                            >
                                <Text className="text-[15px] font-semibold text-white text-center">{t(`trip.when.${type === 'specific' ? 'period' : 'months'}`)}</Text>
                            </LinearGradient>
                        ) : (
                            <View className="items-center p-4 rounded-2xl bg-white border border-gray-200">
                                <Text className="text-[15px] font-semibold text-gray-700 text-center">{t(`trip.when.${type === 'specific' ? 'period' : 'months'}`)}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {dateType === 'specific' && (
                <View className="gap-3">
                    {(['start', 'end'] as const).map((picker) => (
                        <View key={picker}>
                            <Text className="text-base font-semibold text-violet-700 tracking-wider px-2">{t(`trip.when.${picker === 'start' ? 'departure-date' : 'return-date'}`)}</Text>
                            <TouchableOpacity
                                className="flex-row items-center border border-gray-200 rounded-2xl bg-white p-4"
                                style={{gap: 10}}
                                onPress={() => onSetActivePicker(picker)}
                            >
                                <Ionicons name="calendar-outline" size={18} color="#7f22fe"/>
                                <Text className={`text-base  flex-1 ${
                                    !(picker === 'start' ? startDate : endDate) ? 'text-gray-700' : 'text-violet-700'
                                }`}>
                                    {(picker === 'start' ? startDate : endDate) || t('trip.when.select-date')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <Modal transparent animationType="fade" visible={activePicker !== null} onRequestClose={() => onSetActivePicker(null)}>
                        <TouchableOpacity
                            className="flex-1 bg-black/50 justify-end"
                            activeOpacity={1}
                            onPress={() => onSetActivePicker(null)}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                className="bg-white rounded-t-2xl pb-4 px-4"
                            >
                                <View className="flex-row justify-between items-center p-4 border-b border-b-gray-200">
                                    <Text className="text-base text-violet-700 font-semibold">
                                        {activePicker === 'start' ? t('trip.when.departure-date') : t('trip.when.return-date')}
                                    </Text>
                                    <TouchableOpacity onPress={() => onSetActivePicker(null)}>
                                        <Ionicons name="checkmark-circle-outline" size={32} color="#7f22fe"/>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={
                                        activePicker === 'start'
                                            ? (startDate ? new Date(startDate) : new Date())
                                            : (endDate ? new Date(endDate) : startDate ? new Date(startDate) : new Date())
                                    }
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                                    minimumDate={activePicker === 'end' && startDate ? new Date(startDate) : new Date()}
                                    onChange={(_, date) => {
                                        if (!date || !activePicker) return;
                                        onDateChange(activePicker, date);
                                        if (Platform.OS === 'android') onSetActivePicker(null);
                                    }}
                                    accentColor="#7f22fe"
                                    textColor="#111827"
                                    themeVariant="light"
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                </View>
            )}

            {dateType === 'flexible' && (
                <View className="gap-3">
                    <Text className="text-sm font-semibold text-gray-700">{t('trip.when.preferred-months')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {MONTHS.map((month, idx) => (
                            <TouchableOpacity
                                key={month}
                                onPress={() => onToggleMonth(idx)}
                                className="w-[30%]"
                            >
                                {selectedMonths.includes(idx + 1) ? (
                                    <LinearGradient
                                        colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                                        className="py-3 px-1 rounded-xl items-center"
                                    >
                                        <Text className="text-sm font-semibold text-white">{t(month)}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View className="py-3 px-1 rounded-xl items-center bg-white border border-gray-200">
                                        <Text className="text-sm font-semibold text-gray-700">{t(month)}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}