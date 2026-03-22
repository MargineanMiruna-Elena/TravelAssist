export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    contextId?: string;
    remembered?: boolean;
}