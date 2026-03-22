export interface CreateTripPayload {
    userId: string;
    startDate: string;
    endDate: string;
    selectedMonths: number[];
    duration: string;
    interests: string[];
    additionalNotes: string;
    selectedDestination: string;
    selectedAttractions: string[];
}