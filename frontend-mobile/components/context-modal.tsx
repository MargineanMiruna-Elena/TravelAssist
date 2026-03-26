import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { INTERESTS } from "@/constants/interests";
import { formatDateRange } from "@/utils/formatDateRange";
import { ContextModalProps } from "@/types/props/context-modal-props";

export const ContextModal = ({ isVisible, onClose, trips, isLoading, selectedContextId, onSelectContext, t }: ContextModalProps) => {
    return (
        <Modal animationType="fade" transparent visible={isVisible}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View className="flex-row justify-between mb-2 items-center">
                        <Text className="text-xl font-extrabold">{t('bot.context')}</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-sm text-gray-500 mb-6">{t('bot.subtitle')}</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {isLoading ? (
                            <ActivityIndicator color="#7f22fe" className="mt-10" />
                        ) : (
                            trips.map((trip) => (
                                <TouchableOpacity
                                    key={trip.id}
                                    onPress={() => onSelectContext(trip)}
                                    className={`flex-row items-center p-2 mb-3 rounded-2xl border ${selectedContextId === trip.id ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-gray-50'}`}
                                >
                                    <Image source={{ uri: trip.imageUrl }} className="w-24 h-24 rounded-xl mr-6" />
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900">{trip.destination}</Text>
                                        <Text className="text-gray-500 text-sm mb-1">
                                            {formatDateRange(trip.startDate, trip.endDate, trip.preferredMonths)}
                                        </Text>
                                        <View className="flex-row flex-wrap gap-1">
                                            {trip.interests?.map((interestId) => {
                                                const interest = INTERESTS.find(i => i.id === interestId);
                                                return interest ? (
                                                    <Image key={interestId} source={interest.image} className="w-7 h-7 mx-1" resizeMode="contain" />
                                                ) : null;
                                            })}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '80%',
    },
});