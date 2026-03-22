import {Trip} from "@/types/trip/trip";

export interface ContextModalProps {
    isVisible: boolean;
    onClose: () => void;
    trips: Trip[];
    isLoading: boolean;
    selectedContextId?: string;
    onSelectContext: (trip: Trip) => void;
    t: any;
}