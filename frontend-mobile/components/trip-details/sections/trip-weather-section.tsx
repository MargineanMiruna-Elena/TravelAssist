import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CloudSun, Droplets, Wind, Info } from 'lucide-react-native';
import {WeatherSectionProps} from "@/types/props/trip-details-modal-props";
import {DayWeather} from "@/types/trip/day-weather";

const WMO_ICONS: Record<number, string> = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '❄️',
    80: '🌦️', 81: '🌧️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
};

function weatherIcon(code: number): string {
    return WMO_ICONS[code] ?? '🌡️';
}

async function fetchWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
): Promise<DayWeather[]> {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max` +
        `&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    return data.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        precipitationSum: data.daily.precipitation_sum[i],
        windspeedMax: Math.round(data.daily.windspeed_10m_max[i]),
        weatherCode: data.daily.weathercode[i],
    }));
}

export default function TripWeatherSection({ trip }: WeatherSectionProps) {
    const hasExactDates = !!trip.startDate && !!trip.endDate;
    const hasPOI = trip.pointsOfInterest && trip.pointsOfInterest.length > 0;

    const [weather, setWeather] = useState<DayWeather[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hasExactDates || !hasPOI) return;
        const poi = trip.pointsOfInterest![0];
        setLoading(true);
        fetchWeather(poi.latitude, poi.longitude, trip.startDate!, trip.endDate!)
            .then(setWeather)
            .catch(() => setError('Could not load weather data.'))
            .finally(() => setLoading(false));
    }, [trip.startDate, trip.endDate, trip.pointsOfInterest]);

    return (
        <View className="px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center gap-2">
                <CloudSun size={18} color="#7f22fe" />
                <Text className="text-base font-bold text-black tracking-wider">WEATHER FORECAST</Text>
            </View>

            {!hasExactDates && (
                <View className="flex-row items-start justify-start gap-1 bg-blue-50 rounded-xl border border-blue-700 p-2 mt-2">
                    <Info size={16} color="blue" />
                    <Text className="text-sm font-normal text-blue-700">
                        Set exact travel dates to see weather predictions for your trip.
                    </Text>
                </View>
            )}

            {hasExactDates && loading && (
                <ActivityIndicator color="#7f22fe" className="my-4" />
            )}

            {hasExactDates && error && (
                <Text className="text-sm font-normal text-red-500">{error}</Text>
            )}

            {hasExactDates && !loading && !error && weather.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                >
                    {weather.map(day => (
                        <View
                            key={day.date}
                            className="bg-white w-[90px] mr-2 rounded-xl px-2 py-3 items-center border border-gray-300"
                        >
                            <Text className="text-xs font-semibold text-black text-center mb-2">
                                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            <Text className="text-4xl mb-2">{weatherIcon(day.weatherCode)}</Text>
                            <View className="flex-row gap-1 mb-2">
                                <Text className="text-sm text-black font-bold">{day.tempMax}°</Text>
                                <Text className="text-sm text-gray-500 font-normal">{day.tempMin}°</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Droplets size={12} color="dodgerblue" />
                                <Text className="text-xs text-gray-500">{day.precipitationSum}mm</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Wind size={12} color="gray" />
                                <Text className="text-xs text-gray-500">{day.windspeedMax}km/h</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}