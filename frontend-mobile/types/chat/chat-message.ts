export interface ChatMessage {
    messageId: string;
    text: string;
    sender: string;
    timestamp: string;
    sessionId: string;
    remembered?: boolean;
}