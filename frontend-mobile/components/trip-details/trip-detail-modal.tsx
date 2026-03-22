import React, { useState, useEffect } from 'react';
import { Modal, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
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

const { height } = Dimensions.get('window');

export default function TripDetailsModal({ trip, visible, onClose }: TripDetailsModalProps) {
    const [localTrip, setLocalTrip] = useState<Trip | null>(trip);

    useEffect(() => {
        setLocalTrip(trip);
    }, [trip]);

    if (!localTrip) return null;

    const updateLocal = (patch: Partial<Trip>) => {
        setLocalTrip(prev => prev ? { ...prev, ...patch } : prev);
    };

    const handleAddPOI = async (poi: PointOfInterest) => {
        const updated = [...(localTrip.pointsOfInterest ?? []), poi];
        updateLocal({ pointsOfInterest: updated });
        try {
            await TripService.updateTrip(localTrip.id, { pointsOfInterest: updated });
        } catch {
            updateLocal({ pointsOfInterest: localTrip.pointsOfInterest ?? [] });
        }
    };

    const handleRemovePOI = async (id: string) => {
        const updated = (localTrip.pointsOfInterest ?? []).filter(p => p.id !== id);
        updateLocal({ pointsOfInterest: updated });
        try {
            await TripService.updateTrip(localTrip.id, { pointsOfInterest: updated });
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