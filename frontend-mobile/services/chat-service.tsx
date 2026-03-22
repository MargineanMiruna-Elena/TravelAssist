import UserService from "@/services/user-service";
import axios from 'axios';
import {ChatResponse} from "@/types/chat/chat-response";
import {ChatSession} from "@/types/chat/chat-session";
import {Message} from "@/types/chat/message";
import {ChatMessage} from "@/types/chat/chat-message";

const API_BASE_URL = 'http://192.168.101.18:8080/api/v1/bot';

export const ChatService = {

    /**
     * Trimite un mesaj către backend-ul Spring Boot folosind POST
     * @param message Textul mesajului
     * @param sessionId ID-ul sesiunii curente (dacă există)
     * @param tripId ID-ul contextului de călătorie (opțional)
     */
    async sendMessage(message: string, sessionId?: string | null, tripId?: string | null): Promise<ChatResponse | undefined> {
        try {
            const headers = await UserService.getAuthHeader();
            const user = await UserService.getCurrentUser();

            const payload = {
                userId: user.id,
                text: message,
                sessionId: sessionId,
                tripId: tripId
            };

            const response = await axios.post<ChatResponse>(
                `${API_BASE_URL}/chat`,
                payload,
                { headers }
            );

            return response.data;
        } catch (error) {
            console.error("ChatService Error:", error);
        }
    },

    async getHistory(userId: string): Promise<ChatSession[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.get<ChatSession[]>(
                `${API_BASE_URL}/history/${userId}`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error("ChatService getHistory Error:", error);
            return [];
        }
    },

    async getMessages(sessionId: string): Promise<Message[]> {
        try {
            const headers = await UserService.getAuthHeader();
            const response = await axios.get<ChatMessage[]>(
                `${API_BASE_URL}/chat/messages/${sessionId}`,
                { headers }
            );
            return response.data.map((msg: ChatMessage) => ({
                id: msg.messageId,
                text: msg.text,
                sender: msg.sender === 'USER' ? 'user' : 'ai',
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                remembered: msg.remembered
            }));
        } catch (error) {
            console.error("ChatService getMessages Error:", error);
            return [];
        }
    },

    async rememberMessage(messageId: string): Promise<void> {
        try {
            const headers = await UserService.getAuthHeader();
            await axios.post(
                `${API_BASE_URL}/message/${messageId}/remember`,
                {},
                { headers }
            );
        } catch (error) {
            console.error("ChatService rememberMessage Error:", error);
        }
    }
};