export interface LocationProps {
    location: string;
    country: string;
    isLocationFlexible: boolean;
    isCountryAutoFilled: boolean;
    citySuggestions: any[];
    countrySuggestions: string[];
    activeDropdown: 'city' | 'country' | null;
    onLocationChange: (text: string) => void;
    onCountryChange: (text: string) => void;
    onCitySelect: (dest: any) => void;
    onCountrySelect: (country: string) => void;
    onToggleFlexible: () => void;
}

export interface DatesProps {
    dateType: string;
    startDate: string;
    endDate: string;
    selectedMonths: number[];
    activePicker: 'start' | 'end' | null;
    onDateTypeChange: (type: string) => void;
    onSetActivePicker: (picker: 'start' | 'end' | null) => void;
    onDateChange: (picker: 'start' | 'end', date: Date) => void;
    onToggleMonth: (idx: number) => void;
    calculateSelectedMonths: (start: string, end: string) => number[];
}

export interface DurationProps {
    duration: string;
    onDurationChange: (val: string) => void;
}

export interface InterestsProps {
    interests: string[];
    onToggle: (id: string) => void;
}

export interface PreferencesProps {
    additionalNotes: string;
    location: string;
    country: string;
    dateType: string;
    startDate: string;
    endDate: string;
    selectedMonths: number[];
    duration: string | number | null;
    interests: string[];
    onNotesChange: (val: string) => void;
}

export interface DestinationsProps {
    destinations: any[];
    selectedDestination: string;
    fallbackMessage: string | null;
    onSelect: (dest: any) => void;
}

export interface AttractionsProps  {
    attractions: any[];
    selectedAttractions: string[];
    onToggle: (id: string) => void;
}