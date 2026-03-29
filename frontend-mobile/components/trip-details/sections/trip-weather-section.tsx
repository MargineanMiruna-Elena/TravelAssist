import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, ActivityIndicator} from 'react-native';
import { Droplets, Wind} from 'lucide-react-native';
import {
    Sun, CloudSun, Cloud, CloudFog, CloudDrizzle,
    CloudRain, CloudSnow, Snowflake, CloudLightning, Thermometer
} from 'lucide-react-native';
import {WeatherSectionProps} from "@/types/props/trip-details-modal-props";
import {DayWeather} from "@/types/trip/day-weather";
import TripService from "@/services/trip-service";
import {Ionicons} from "@expo/vector-icons";
import {MaterialCommunityIcons} from '@expo/vector-icons';

const WMO_ICONS: Record<number, string> = {
    0: "weather-sunny", 1: "weather-sunny", 2: "weather-partly-cloudy", 3: "weather-cloudy",
    45: "weather-fog", 48: "weather-fog",
    51: "weather-partly-rainy", 53: "weather-partly-rainy", 55: "weather-rainy", 56: "weather-snowy-rainy", 57: "weather-snowy-rainy",
    61: "weather-rainy", 63: "weather-rainy", 65: "weather-pouring", 66: "weather-snowy-rainy", 67: "weather-snowy-rainy",
    71: "weather-snowy", 73: "weather-snowy", 75: "weather-snowy-heavy", 77: "weather-snowy",
    80: "weather-partly-rainy", 81: "weather-rainy", 82: "weather-pouring", 85: "weather-snowy", 86: "weather-snowy-heavy",
    95: "weather-lightning", 96: "weather-lightning-rainy", 99: "weather-lightning-rainy",
};

export default function TripWeatherSection({trip}: WeatherSectionProps) {
    const hasExactDates = !!trip.startDate && !!trip.endDate;

    const [weather, setWeather] = useState<DayWeather[]>([]);
    const [isHistorical, setIsHistorical] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hasExactDates) return;
        setLoading(true);
        setError(null);
        TripService.getWeather(trip.id)
            .then(res => {
                setWeather(res.days);
                setIsHistorical(res.historical);
            })
            .catch(() => setError('Could not load weather data.'))
            .finally(() => setLoading(false));
    }, [trip.startDate, trip.endDate, trip.pointsOfInterest]);

    const getWeatherIcon = (code: number) => {
        const name = (WMO_ICONS[code] || "weather-cloudy-clock") as React.ComponentProps<typeof MaterialCommunityIcons>['name'];;
        return <MaterialCommunityIcons name={name} size={28} color="#7f22fe" />;
    };

    return (
        <View className="px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center gap-2">
                <CloudSun size={18} color="#7f22fe"/>
                <Text className="text-base font-bold text-black tracking-wider">WEATHER FORECAST</Text>
            </View>

            {!hasExactDates && (
                <View
                    className="flex-row items-start bg-violet-100 rounded-xl p-2 my-1 border border-violet-700"
                    style={{gap: 6}}
                >
                    <Ionicons name="information-circle-outline" size={18} color="#7f22fe"/>
                    <Text className="text-xs leading-4 text-violet-700 flex-1 ">Set exact travel dates to see the weather forecast for your trip.</Text>
                </View>
            )}

            {hasExactDates && loading && (
                <ActivityIndicator color="#7f22fe" className="my-4"/>
            )}

            {hasExactDates && error && (
                <Text className="text-sm font-normal text-red-500">{error}</Text>
            )}

            {hasExactDates && !loading && !error && weather.length > 0 && (
                <>
                    {isHistorical && (
                        <View
                            className="flex-row items-start bg-violet-100 rounded-xl p-2 my-1 border border-violet-700"
                            style={{gap: 8}}
                        >
                            <Ionicons name="information-circle-outline" size={18} color="#7f22fe"/>
                            <Text className="text-xs leading-4 text-violet-700 flex-1 ">Data based on historical climate patterns. Live forecast updates will become available closer to the trip dates.</Text>
                        </View>
                    )}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-2"
                    >
                        {weather.map(day => (
                            <View
                                key={day.date}
                                className="bg-white w-[90px] mr-2 rounded-xl px-2 py-3 items-center border border-gray-300"
                            >
                                <Text className="text-xs font-semibold text-black text-center mb-2">
                                    {new Date(day.date).toLocaleDateString('en-GB', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </Text>
                                <Text className="py-2">{getWeatherIcon(day.weatherCode)}</Text>
                                <View className="flex-row gap-1 mb-2">
                                    <Text className="text-sm text-black font-bold">{day.tempMax}°</Text>
                                    <Text className="text-sm text-gray-500 font-normal">{day.tempMin}°</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Droplets size={12} color="dodgerblue"/>
                                    <Text className="text-xs text-gray-500">{day.precipitationSum}mm</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Wind size={12} color="gray"/>
                                    <Text className="text-xs text-gray-500">{day.windspeedMax}km/h</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );
}