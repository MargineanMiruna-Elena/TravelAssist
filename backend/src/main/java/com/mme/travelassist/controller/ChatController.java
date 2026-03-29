package com.mme.travelassist.controller;

import com.mme.travelassist.dto.chat.ChatMessageDTO;
import com.mme.travelassist.dto.chat.ChatRequest;
import com.mme.travelassist.dto.chat.ChatResponse;
import com.mme.travelassist.dto.chat.ChatSessionDTO;
import com.mme.travelassist.mapper.ChatMapper;
import com.mme.travelassist.model.ChatMessage;
import com.mme.travelassist.model.ChatSession;
import com.mme.travelassist.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/v1/bot")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;

    @PostMapping("/chat")
    public ChatResponse generate(@RequestBody ChatRequest request) {
        return chatService.processChat(
                request.getUserId(),
                request.getText(),
                request.getSessionId(),
                request.getTripId()
        );
    }

    @GetMapping("/history/{userId}")
    public List<ChatSessionDTO> getHistory(@PathVariable UUID userId) {
        List<ChatSession> chatSessionsOfUser = chatService.getUserHistory(userId);
        List<ChatSessionDTO> chatSessionDTOList = new ArrayList<>();

        for(ChatSession cs: chatSessionsOfUser) {
            chatSessionDTOList.add(chatMapper.chatSessionToChatSessionDTO(cs));
        }

        return chatSessionDTOList;
    }

    @GetMapping("/chat/messages/{sessionId}")
    public List<ChatMessageDTO> getMessagesForChatSession(@PathVariable UUID sessionId) {
        List<ChatMessage> chatMessagesOfSession = chatService.getMessagesBySession(sessionId);
        List<ChatMessageDTO> chatMessagesDTOList = new ArrayList<>();

        for(ChatMessage cm: chatMessagesOfSession) {
            chatMessagesDTOList.add(chatMapper.chatMessageToChatMessageDTO(cm));
        }

        return chatMessagesDTOList;
    }

    @PostMapping("/message/{messageId}/remember")
    public ResponseEntity<Void> rememberMessage(@PathVariable UUID messageId) {
        chatService.rememberMessage(messageId);
        return ResponseEntity.ok().build();
    }
}