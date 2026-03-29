import React, { useState, useEffect } from 'react';
import {Modal, View, ScrollView, StyleSheet, Dimensions, Alert} from 'react-native';
import { Trip } from '@/types/trip/trip';
import { PointOfInterest } from '@/types/trip/point-of-interest';
import { TripDetailsModalProps } from '@/types/props/trip-details-modal-props';
import TripService from '@/services/trip-service';

import TripHeaderSection from "@/components/trip-details/sections/trip-header-section";
import TripDatesSection from "@/components/trip-details/sections/trip-dates-section";
import TripPOISection from "@/components/trip-details/sections/trip-poi-section";
import TripNotesSection from "@/components/trip-details/sections/trip-notes-section";
import TripWeatherSection from "@/components/trip-details/sections/trip-weather-section";
import TripItinerarySection from "@/components/trip-details/sections/trip-itinerary-section";
import TripDeleteSection from "@/components/trip-details/sections/trip-delete-section";
import {SearchResult} from "@/types/trip/search-result";

const { height } = Dimensions.get('window');

export default function TripDetailsModal({ trip, visible, onClose }: TripDetailsModalProps) {
    const [localTrip, setLocalTrip] = useState<Trip | null>(trip);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && trip?.id) {
            setLoading(true);
            TripService.getTrip(trip.id)
                .then(setLocalTrip)
                .catch(() => setLocalTrip(trip))
                .finally(() => setLoading(false));
        }
    }, [visible, trip?.id]);

    if (!localTrip || loading) return null;

    const updateLocal = (patch: Partial<Trip>) => {
        setLocalTrip(prev => prev ? { ...prev, ...patch } : prev);
    };

    const handleAddPOI = async (result: SearchResult) => {
        const previousPois = localTrip.pointsOfInterest ?? [];

        try {
            const updatedFromBackend = await TripService.addPoiToTrip(localTrip.id, result.id);
            updateLocal({ pointsOfInterest: updatedFromBackend });
        } catch (error: any) {
            updateLocal({ pointsOfInterest: previousPois });
        }
    };

    const handleRemovePOI = async (id: string) => {
        const updated = (localTrip.pointsOfInterest ?? []).filter(p => p.id !== id);
        updateLocal({ pointsOfInterest: updated });
        try {
            await TripService.deletePoiFromTrip(localTrip.id, id);
        } catch {
            updateLocal({ pointsOfInterest: localTrip.pointsOfInterest ?? [] });
        }
    };

    const handleGenerateItinerary = async () => {
        // TODO: navigate to itinerary screen or call generation service
        await new Promise(r => setTimeout(r, 1500));
    };

    const handleDelete = async () => {
        await TripService.deleteTrip(localTrip.id);
        onClose();
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TripHeaderSection trip={localTrip} onClose={onClose} />
                        <TripDatesSection trip={localTrip} onUpdate={updateLocal} />
                        <TripPOISection
                            pois={localTrip.pointsOfInterest ?? []}
                            onAdd={handleAddPOI}
                            onRemove={handleRemovePOI}
                        />
                        <TripNotesSection notes={localTrip.notes ?? []} />
                        <TripWeatherSection trip={localTrip} />
                        <TripItinerarySection onGenerate={handleGenerateItinerary} />
                        <TripDeleteSection tripName={localTrip.destination} onDelete={handleDelete} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.92,
        overflow: 'hidden',
    },
});