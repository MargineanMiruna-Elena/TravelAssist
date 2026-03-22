import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CloudSun, Thermometer, Droplets, Wind, Info } from 'lucide-react-native';
import { Trip } from '@/types/trip/trip';

interface Props {
    trip: Trip;
}

interface DayWeather {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    windspeedMax: number;
    weatherCode: number;
}

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

export default function TripWeatherSection({ trip }: Props) {
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
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <CloudSun size={16} color="#7f22fe" />
                <Text style={styles.sectionTitle}>Weather Forecast</Text>
            </View>

            {!hasExactDates && (
                <View style={styles.hintBox}>
                    <Info size={15} color="#f59e0b" />
                    <Text style={styles.hintText}>
                        Set exact travel dates to see weather predictions for your trip.
                    </Text>
                </View>
            )}

            {hasExactDates && !hasPOI && (
                <View style={styles.hintBox}>
                    <Info size={15} color="#f59e0b" />
                    <Text style={styles.hintText}>
                        Add at least one point of interest to load weather for that location.
                    </Text>
                </View>
            )}

            {hasExactDates && hasPOI && loading && (
                <ActivityIndicator color="#7f22fe" style={{ marginVertical: 16 }} />
            )}

            {hasExactDates && hasPOI && error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {hasExactDates && hasPOI && !loading && !error && weather.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
                    {weather.map(day => (
                        <View key={day.date} style={styles.dayCard}>
                            <Text style={styles.dayDate}>
                                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            <Text style={styles.icon}>{weatherIcon(day.weatherCode)}</Text>
                            <View style={styles.tempRow}>
                                <Text style={styles.tempMax}>{day.tempMax}°</Text>
                                <Text style={styles.tempMin}>{day.tempMin}°</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Droplets size={11} color="#60a5fa" />
                                <Text style={styles.metaText}>{day.precipitationSum}mm</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Wind size={11} color="#94a3b8" />
                                <Text style={styles.metaText}>{day.windspeedMax}km/h</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 1 },

    hintBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: '#fffbeb', borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: '#fde68a',
    },
    hintText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 },
    errorText: { fontSize: 13, color: '#e53e3e', textAlign: 'center' },

    scroll: { marginTop: 4 },
    dayCard: {
        width: 88, marginRight: 10,
        backgroundColor: '#fafafa', borderRadius: 16,
        padding: 12, alignItems: 'center',
        borderWidth: 1, borderColor: '#efefef',
    },
    dayDate: { fontSize: 10, fontWeight: '600', color: '#999', textAlign: 'center', marginBottom: 8 },
    icon: { fontSize: 26, marginBottom: 8 },
    tempRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    tempMax: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
    tempMin: { fontSize: 15, fontWeight: '400', color: '#aaa' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    metaText: { fontSize: 11, color: '#888' },
});