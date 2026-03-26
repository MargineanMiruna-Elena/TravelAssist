package com.mme.travelassist.service.implementation;

import com.mme.travelassist.dto.chat.ChatResponse;
import com.mme.travelassist.model.ChatMessage;
import com.mme.travelassist.model.ChatSession;
import com.mme.travelassist.model.Trip;
import com.mme.travelassist.model.User;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.repository.ChatMessageRepository;
import com.mme.travelassist.repository.ChatSessionRepository;
import com.mme.travelassist.repository.TripRepository;
import com.mme.travelassist.repository.UserRepository;
import com.mme.travelassist.service.ChatService;
import jakarta.mail.Message;
import org.springframework.ai.chat.client.ChatClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    @Transactional
    @Override
    public ChatResponse processChat(UUID userId, String message, UUID sessionId, UUID tripId) {
        ChatResponse chatResponse = new ChatResponse();

        ChatSession session;
        if (sessionId != null) {
            session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            if (tripId != null) {
                Trip newTrip = tripRepository.findById(tripId).orElse(null);
                session.setTrip(newTrip);
            } else {
                session.setTrip(null);
            }
            sessionRepository.save(session);
        } else {
            session = createNewSession(userId, tripId, message);
        }

        chatResponse.setSessionId(session.getId());
        saveMessage(session, message, "USER");

        String tripInfo = "";
        if (session.getTrip() != null) {
            tripInfo = "User is planning a trip to " + session.getTrip().getDestination().getName() + ", " + session.getTrip().getDestination().getCountry() +
                    " and has following interest categories: ";
            for(Interest c: session.getTrip().getInterests()) {
                tripInfo = tripInfo + c + " ";
            }
        }

        String finalTripInfo = tripInfo;
        String aiResponse = chatClient.prompt()
                .user(u -> u.text("""
                    TRIP CONTEXT: {tripContext}
                    
                    IMPORTANT SAFETY CHECK: Remember you are Travel Buddy. 
                    If the following user message is NOT about travel, tourism, or local culture, use your standard refusal message.
                    
                    USER MESSAGE: {userMessage}
                    """)
                        .param("tripContext", finalTripInfo)
                        .param("userMessage", message))
                .call()
                .content();

        ChatMessage savedMessage = saveMessage(session, aiResponse, "AI");
        chatResponse.setMessageId(savedMessage.getId());
        chatResponse.setAiText(aiResponse);
        chatResponse.setTimestamp(LocalDateTime.now());

        return chatResponse;
    }

    /**
     * Creates a new session and gives it a title.
     */
    private ChatSession createNewSession(UUID userId, UUID tripId, String firstMessage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession session = new ChatSession();
        session.setUser(user);
        session.setCreatedAt(LocalDateTime.now());

        if (tripId != null) {
            Trip trip = tripRepository.findById(tripId).orElse(null);
            session.setTrip(trip);
            session.setTitle(trip != null ? "Trip to " + trip.getDestination().getName() : "Travel Plan");
        } else {
            String title = firstMessage.length() > 30 ? firstMessage.substring(0, 27) + "..." : firstMessage;
            session.setTitle(title);
        }

        return sessionRepository.save(session);
    }

    /**
     * Helper for message saving.
     */
    private ChatMessage saveMessage(ChatSession session, String text, String sender) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSession(session);
        chatMessage.setText(text);
        chatMessage.setSender(sender);
        chatMessage.setTimestamp(LocalDateTime.now());
        return messageRepository.save(chatMessage);
    }

    @Override
    public List<ChatSession> getUserHistory(UUID userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<ChatMessage> getMessagesBySession(UUID sessionId) {
        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Override
    public void rememberMessage(UUID messageId) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRemembered(true);
        messageRepository.save(message);
    }

    @Override
    public List<ChatMessage> savedMessagesForTrip(Trip trip) {
        List<ChatSession> sessions = sessionRepository.findByTripId(trip.getId());
        List<ChatMessage> savedMessages = new ArrayList<>();

        for (ChatSession cs: sessions) {
            List<ChatMessage> messages = cs.getMessages();

            for (ChatMessage cm: messages) {
                if (cm.isRemembered())
                    savedMessages.add(cm);
            }
        }

        return savedMessages;
    }
}
