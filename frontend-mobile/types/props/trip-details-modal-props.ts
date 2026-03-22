import {Trip} from "@/types/trip/trip";
import {PointOfInterest} from "@/types/trip/point-of-interest";

export interface TripDetailsModalProps {
    trip: Trip | null;
    visible: boolean;
    onClose: () => void;
}

export interface HeaderSectionProps {
    trip: Trip;
    onClose: () => void;
}

export interface DatesSectionProps {
    trip: Trip;
    onUpdate: (updated: Partial<Trip>) => void;
}

export interface POISectionProps {
    pois: PointOfInterest[];
    onAdd: (poi: PointOfInterest) => void;
    onRemove: (id: string) => void;
}