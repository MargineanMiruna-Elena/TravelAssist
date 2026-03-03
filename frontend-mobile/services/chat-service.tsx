import UserService from "@/services/user-service";
import axios from 'axios';

const API_BASE_URL = 'http://192.168.101.18:8080/api/v1/bot';

export const ChatService = {
    /**
     * Trimite un mesaj către backend-ul Spring Boot
     * @param message Textul introdus de utilizator
     * @param context Destinația selectată (opțional)
     */
    async sendMessage(message: string, context?: string): Promise<string> {
        try {
            // Construim mesajul final incluzând contextul dacă există
            const fullPrompt = context
                ? `Context călătorie ${context}: ${message}`
                : message;
            const headers = await UserService.getAuthHeader();

            const response = await axios.get<string>(`${API_BASE_URL}/ai/chat?message=${encodeURIComponent(fullPrompt)}`, { headers });
            return response.data;
        } catch (error) {
            console.error("ChatService Error:", error);
            return "Ne pare rău, TravelBuddy are probleme de conexiune. Încearcă din nou.";
        }
    }
};