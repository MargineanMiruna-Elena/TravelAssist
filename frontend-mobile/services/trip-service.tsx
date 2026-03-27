import axios from 'axios';
import UserService from "@/services/user-service";
import {CreateTripPayload} from "@/types/trip/create-trip-payload";
import {CreatedTrip} from "@/types/trip/created-trip";
import {Trip} from "@/types/trip/trip";
import {PointOfInterest} from "@/types/trip/point-of-interest";
import {SearchResult} from "@/types/trip/search-result";

export interface TripPreferencesPayload {
    interests: string[];
    selectedMonths: number[];
    duration: string | number | null;
    additionalNotes: string;
    country?: string | null;
}

export interface DestinationResponse {
    id: string;
    name: string;
    localName: string;
    country: string;
    bestMonths: number[];
    tags: string[];
    imageUrl: string;
}

export interface AttractionResponse {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
    imageUrl: string;
    website: string;
}

const API_URL = "http://192.168.101.18:8080/api/trips";

class TripService {
    async createTrip(payload: CreateTripPayload): Promise<CreatedTrip> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.post<CreatedTrip>(`${API_URL}/create`, payload, { headers });
            return response.data;
        } catch (error) {
            console.error("Error creating new trip:", error);
            throw error;
        }
    }

    async getTrip(id: string): Promise<Trip> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.get<Trip>(`${API_URL}/trip/${id}`, { headers });
            return response.data;
        } catch (error) {
            console.error("Error fetching trip:", error);
            throw error;
        }
    }

    async getTripsForUser(): Promise<Trip[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const user = await UserService.getCurrentUser();
            const response = await axios.get<Trip[]>(`${API_URL}/all-trips/${user.id}`, { headers });
            return response.data;
        } catch (error) {
            console.error("Error fetching user's trips:", error);
            throw error;
        }
    }

    async getRecommendedDestinations(payload: TripPreferencesPayload): Promise<DestinationResponse[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.post<DestinationResponse[]>(`${API_URL}/recommend-destinations`, payload, { headers });
            return response.data;
        } catch (error) {
            console.error("Error fetching recommended destinations:", error);
            throw error;
        }
    }

    async getAttractionsForDestination(destinationId: string, interests: string[]): Promise<AttractionResponse[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.post<AttractionResponse[]>(
                `${API_URL}/attractions/${destinationId}`,
                interests,
                { headers }
            );
            return response.data;
        } catch (error: any) {
            console.error("Error fetching attractions:", error);
            throw error;
        }
    }

    async searchDestination(text: string): Promise<DestinationResponse[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const res = await axios.get<DestinationResponse[]>(
                `${API_URL}/destinations/suggestions/${encodeURIComponent(text)}`,
                { headers }
            );
            return res.data;
        } catch (error: any) {
            console.error("Error fetching destination suggestions:", error);
            throw error;
        }
    }

    async searchCountry(text: string): Promise<string[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const res = await axios.get<string[]>(
                `${API_URL}/countries/suggestions/${encodeURIComponent(text)}`,
                { headers }
            );
            return res.data;
        } catch (error: any) {
            console.error("Error fetching country suggestions:", error);
            throw error;
        }
    }

    async findOrCreateDestination(cityName: string, country: string): Promise<DestinationResponse> {
        try {
            const headers = await UserService.getAuthHeader();
            const res = await axios.get<DestinationResponse>(
                `${API_URL}/destinations/search/${encodeURIComponent(cityName)}`, { headers, params: { country: country }}
            );
            return res.data;
        } catch (error: any) {
            console.error("Error finding or creating destination:", error);
            throw error;
        }
    }

    async searchPlaces(query: string, region: { latitude: number, longitude: number }): Promise<SearchResult[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const url = `${API_URL}/search` +
                `?query=${encodeURIComponent(query)}` +
                `&lat=${region.latitude}` +
                `&lng=${region.longitude}`;
            const res = await axios.get<SearchResult[]>(url, { headers });
            return res.data;
        } catch (error: any) {
            console.error("Error searching for points of interest:", error);
            throw error;
        }
    }

    async addPoiToTrip(tripId: string, xId: string): Promise<PointOfInterest[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.post<PointOfInterest[]>(`${API_URL}/${tripId}/add-poi/${xId}`, {}, { headers });
            return response.data;
        } catch (error: any) {
            console.error("Error adding point of interest to trip:", error);
            throw error;
        }
    }

    async deletePoiFromTrip(tripId: string, id: string): Promise<PointOfInterest[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.delete<PointOfInterest[]>(`${API_URL}/${tripId}/delete-poi/${id}`, { headers });
            return response.data;
        } catch (error: any) {
            console.error("Error deleting point of interest from trip:", error);
            throw error;
        }
    }

    async updateTripDates(id: string, dates: { startDate: string, endDate: string, duration: number, months: number[]}): Promise<Trip> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.post<Trip>(
                `${API_URL}/update-dates/${id}`,
                dates,
                { headers }
            );
            return response.data;
        } catch (error: any) {
            console.error("Error updating dates:", error);
            throw error;
        }
    }

    async deleteTrip(id: string) {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.delete<void>(`${API_URL}/delete/${id}`, { headers });
            return response.data;
        } catch (error: any) {
            console.error("Error deleting trip:", error);
            throw error;
        }
    }
}

export default new TripService();