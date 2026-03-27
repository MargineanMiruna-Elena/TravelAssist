import React, {useEffect, useState} from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from "@/components/logo";
import { Calendar } from 'lucide-react-native';
import TripService from "@/services/trip-service";
import {useTranslation} from "react-i18next";
import {formatDateRange} from "@/utils/formatDateRange";
import {Trip} from "@/types/trip/trip";
import TripDetailsModal from "@/components/trip-details/trip-detail-modal";

export default function Dashboard() {
    const {t} = useTranslation();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setIsLoading(true);
        try {
            const data = await TripService.getTripsForUser();
            setTrips(data);
        } catch (error) {
            console.error("Error fetching trips:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDetails = (trip: Trip) => {
        setSelectedTrip(trip);
        setModalVisible(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} className="px-5">
                <View className="my-2">
                    <Logo name="Board" className="text-lg" />
                    <Text className="text-base text-gray-500 mb-2 font-normal">{trips.length} {t('dashboard.destinations')}</Text>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {trips.map((trip) => (
                        <TouchableOpacity
                            key={trip.id}
                            className="w-[48%] h-[240px] rounded-3xl bg-white mb-2 overflow-hidden shadow-xl shadow-black/10"
                            onPress={() => openDetails(trip)}
                            activeOpacity={0.9}
                        >
                            <Image source={{ uri: trip.imageUrl }} className="absolute inset-0 w-full h-full" />

                            <View className="absolute top-3 left-3">
                                <View className="bg-white self-start py-1 px-2 rounded-lg">
                                    <Text className="text-[10px] font-extrabold text-violet-700">{trip.status.toUpperCase()}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                className="absolute left-0 right-0 bottom-0 h-[110] rounded-b-3xl justify-start px-4 py-7"
                                locations={[0.1, 0.6, 0.8]}
                            >
                                <Text className="text-lg text-white font-extrabold tracking-wider">{trip.destination}</Text>
                                <Text className="text-sm text-white font-semibold">{trip.country}</Text>
                                <View className="flex-row items-center gap-1 pt-1">
                                    <Calendar size={14} color="rgba(255,255,255,0.85)" />
                                    <Text className="text-xs text-white font-medium">{formatDateRange(trip.startDate, trip.endDate, trip.preferredMonths)}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TripDetailsModal
                trip={selectedTrip}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    fetchTrips();
                }}
            />
        </SafeAreaView>
    );
}