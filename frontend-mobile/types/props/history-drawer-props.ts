import {ChatSession} from "@/types/chat/chat-session";

export interface HistoryDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    history: ChatSession[];
    isLoading: boolean;
    onNewChat: () => void;
    onSelectSession: (session: ChatSession) => void;
}