import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Pencil, Check, X } from 'lucide-react-native';
import TripService from '@/services/trip-service';
import {DatesSectionProps} from "@/types/props/trip-details-modal-props";
import {formatDateRange} from "@/utils/formatDateRange";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";

type PickerTarget = 'start' | 'end' | null;

const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getInOneWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(0, 0, 0, 0);
    return d;
};

export default function TripDatesSection({ trip, onUpdate }: DatesSectionProps) {
    const hasExactDates = !!trip.startDate && !!trip.endDate;

    const [editing, setEditing] = useState(false);
    const [startDate, setStartDate] = useState<Date>(
        trip.startDate ? new Date(trip.startDate) : getTomorrow()
    );
    const [endDate, setEndDate] = useState<Date>(
        trip.endDate ? new Date(trip.endDate) : getInOneWeek()
    );
    const [activePicker, setActivePicker] = useState<PickerTarget>(null);
    const [saving, setSaving] = useState(false);


    const fmt = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays || 1;

    };

    const calculateSelectedMonths = (startDate: string, endDate: string): number[] => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = new Set<number>();

        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        while (current <= end) {
            months.add(current.getMonth() + 1);
            current.setMonth(current.getMonth() + 1);
        }
        return Array.from(months);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                duration: calculateDuration(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
                months: calculateSelectedMonths(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
            };
            const updatedDatesTrip = await TripService.updateTripDates(trip.id, payload);
            onUpdate(updatedDatesTrip);
            setEditing(false);
        } catch (e) {
            console.error('Failed to update dates:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setStartDate(trip.startDate ? new Date(trip.startDate) : new Date());
        setEndDate(trip.endDate ? new Date(trip.endDate) : new Date());
        setEditing(false);
    };

    const handleChange = (_: any, d?: Date) => {
        if (Platform.OS === 'android') setActivePicker(null);
        if (!d) return;
        if (activePicker === 'start') setStartDate(d);
        if (activePicker === 'end') setEndDate(d);
    };

    const togglePicker = (target: PickerTarget) => {
        setActivePicker(prev => (prev === target ? null : target));
    };

    return (
        <View className="px-5 py-4 border-b border-gray-100" >
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-2">
                    <Calendar size={18} color="#7f22fe" />
                    <Text className="text-base font-bold text-black tracking-wider">DATES</Text>
                </View>
                {!editing && (
                    <TouchableOpacity
                        onPress={() => setEditing(true)}
                        className="flex-row px-3 py-2 bg-violet-100 rounded-lg"
                    >
                        <Pencil size={15} color="#7f22fe" />
                        <Text className="text-xs text-violet-700 font-semibold ml-1">Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            {!editing ? (
                <View className="flex-row items-center">
                    {hasExactDates ? (
                        <>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">START</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">{fmt(new Date(trip.startDate!))}</Text>
                            </View>
                            <View className="w-px h-9 bg-gray-300"/>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">END</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">{fmt(new Date(trip.endDate!))}</Text>
                            </View>
                            <View className="w-px h-9 bg-gray-300"/>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">DURATION</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">
                                    {trip.durationDays} days
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">MONTHS</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">
                                    {formatDateRange(trip.startDate, trip.endDate, trip.preferredMonths)}
                                </Text>
                            </View>
                            <View className="w-px h-9 bg-gray-300"/>
                            <View className="flex-1 items-center">
                                <Text className="text-xs font-semibold text-gray-500 tracking-wider">DURATION</Text>
                                <Text className="text-sm font-bold text-black pt-1 tracking-wide">
                                    {trip.durationDays} days
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            ) : (
                <View className="gap-2">
                    <TouchableOpacity
                        className="flex-row justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 mb-2"
                        onPress={() => togglePicker('start')}
                    >
                        <Text className="text-xs font-semibold text-gray-500 tracking-wider">START DATE</Text>
                        <Text className="text-sm font-bold text-violet-700 tracking-wide">{fmt(startDate)}</Text>
                    </TouchableOpacity>
                    {activePicker === 'start' && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleChange}
                            minimumDate={new Date()}
                            maximumDate={endDate}
                            themeVariant="light"
                        />
                    )}

                    <TouchableOpacity
                        className="flex-row justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 mb-2"
                        onPress={() => togglePicker('end')}
                    >
                        <Text className="text-xs font-semibold text-gray-500 tracking-wider">END DATE</Text>
                        <Text className="text-sm font-bold text-violet-700 tracking-wide">{fmt(endDate)}</Text>
                    </TouchableOpacity>
                    {activePicker === 'end' && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleChange}
                            minimumDate={startDate}
                            accentColor="#7f22fe"
                            themeVariant="light"
                        />
                    )}

                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity
                            onPress={handleSave}
                            className="flex-1 flex-row bg-violet-700 rounded-2xl items-center justify-center shadow-md"
                        >
                            <FontAwesome name="save" size={16} color="white"/>
                            <Text className="text-white font-bold text-sm ml-1">Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="flex-1 flex-row border border-violet-700 h-11 rounded-2xl items-center justify-center"
                        >
                            <MaterialIcons name="cancel" size={16} color="#7f22fe"/>
                            <Text
                                className="text-violet-700 font-bold text-sm ml-1">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}