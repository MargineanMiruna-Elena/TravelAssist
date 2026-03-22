import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { LinearGradient } from "expo-linear-gradient";
import {HeaderSectionProps} from "@/types/props/trip-details-modal-props";

export default function TripHeaderSection({ trip, onClose }: HeaderSectionProps) {
    return (
        <TouchableOpacity
            key={trip.id}
            className="bg-white mb-2 overflow-hidden shadow-xl shadow-black/10"
            activeOpacity={0.9}
        >
            <Image source={{ uri: trip.imageUrl }} style={{width: '100%', height: 220}} />
            <TouchableOpacity className="absolute top-4 right-4 bg-black/50 rounded-full p-2" onPress={onClose}>
                <X color="white" size={22} />
            </TouchableOpacity>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                className="absolute left-0 right-0 bottom-0 justify-start px-4 py-7"
                locations={[0.1, 0.6, 0.8]}
            >
                <View className="bg-white self-start py-1 px-2 rounded-lg mb-2">
                    <Text className="text-[10px] font-extrabold text-violet-700">{trip.status.toUpperCase()}</Text>
                </View>
                <Text className="text-3xl text-white font-extrabold tracking-wider">{trip.destination}</Text>
                <Text className="text-base text-white font-semibold">{trip.country}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}