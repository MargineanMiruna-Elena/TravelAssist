package com.mme.travelassist.service;

import com.mme.travelassist.dto.chat.ChatResponse;
import com.mme.travelassist.model.ChatMessage;
import com.mme.travelassist.model.ChatSession;

import java.util.List;
import java.util.UUID;

public interface ChatService {

    ChatResponse processChat(UUID userId, String message, UUID sessionId, UUID tripId);

    List<ChatSession> getUserHistory(UUID userId);

    List<ChatMessage> getMessagesBySession(UUID sessionId);

    void rememberMessage(UUID messageId);
}
