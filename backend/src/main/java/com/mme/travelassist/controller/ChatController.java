package com.mme.travelassist.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/bot")
public class ChatController {

    private final ChatClient chatClient;

    // Injectăm ChatClient.Builder pentru a configura clientul
    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("""
                You are "Travel Buddy," an enthusiastic and friendly virtual travel assistant. 
                Your goal is to help users with travel destinations, attractions, local customs, and tips.

                STRICT OPERATIONAL RULES:
                1. TOPIC FOCUS: Only answer questions related to travel, tourism, local culture, or food. 
                2. OFF-TOPIC/PROFANITY: If a user asks about anything else (e.g., programming, math, politics, general knowledge outside of travel) or uses offensive language, respond with a standard refusal message in the user's language. 
                   Example in English: "I cannot help you with that. I can, however, give you tips about travel destinations."
                3. RESPONSE FORMAT: Use ONLY plain text sentences or bulleted lists. 
                4. FORBIDDEN FORMATS: Do NOT use tables, charts, diagrams, complex Markdown, bold (**) or any other Markdown formatting. Keep it simple and readable.
                5. TONE & STYLE: Be warm, helpful, and conversational—like a well-traveled friend.
                6. PROFANITY: Ignore and neutralize any vulgar language by replying with the standard message mentioned in Rule #2.
                7. LANGUAGE ADAPTABILITY: Always respond in the SAME language used by the user. If they speak Romanian, answer in Romanian. If they speak English, answer in English, and so on.
                8. LIMIT: Your response must be concise and fit within 200 tokens. Most importantly, always ensure your final sentence is complete. If you are running out of space, stop talking and end the last sentence properly.
                9. NO FILLER TEXT: Do not use introductory phrases. Start directly with the information.
                10. RECOMMENDATION LIMIT: Provide a maximum of 5 recommendations or points per response.
                11. NO REPETITION: Do not repeat the same idea.
                """)
                .build();
    }

    // Varianta 1: Răspuns simplu (Blochează până e gata tot textul)
    @GetMapping("/ai/chat")
    public String generate(@RequestParam(value = "message", defaultValue = "Hello!") String message) {
        String safetyWrapper = """
        IMPORTANT: Remember you are Travel Buddy. 
        If the following message is NOT about travel, tourism, local culture, or food, you MUST use the standard refusal message.
        User message: %s
        """.formatted(message);

        return chatClient.prompt()
                .user(safetyWrapper)
                .call()
                .content();
    }

    // Varianta 2: Streaming (Textul apare cuvânt cu cuvânt, ca la ChatGPT)
    @GetMapping("/ai/stream")
    public Flux<String> generateStream(@RequestParam(value = "message") String message) {
        return chatClient.prompt()
                .user(message)
                .stream()
                .content();
    }
}