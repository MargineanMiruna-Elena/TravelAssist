import {Trip} from "@/types/trip/trip";
import {PointOfInterest} from "@/types/trip/point-of-interest";
import {Note} from "@/types/trip/notes";
import {SearchResult} from "@/types/trip/search-result";

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
    onAdd: (result: SearchResult) => void;
    onRemove: (id: string) => void;
}

export interface NotesSectionProps {
    notes: Note[];
}

export interface WeatherSectionProps {
    trip: Trip;
}

export interface DeleteSectionProps {
    tripName: string;
    onDelete: () => Promise<void>;
}