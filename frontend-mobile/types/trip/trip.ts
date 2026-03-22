import {PointOfInterest} from "@/types/trip/point-of-interest";

export interface Trip {
    id: string;
    userId: string;
    destination: string;
    country: string;
    latitude: number;
    longitude: number;
    imageUrl: string;
    preferredMonths: number[];
    startDate?: string | null;
    endDate?: string | null;
    durationDays: number;
    interests: string[];
    freeTextPreferences: string;
    status: 'upcoming' | 'completed' | 'draft' | 'started';
    pointsOfInterest: PointOfInterest[];
    notes?: { id: string; text: string }[];
}