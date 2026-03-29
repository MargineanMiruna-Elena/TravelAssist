package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.chat.ChatMessageDTO;
import com.mme.travelassist.dto.chat.ChatSessionDTO;
import com.mme.travelassist.model.ChatMessage;
import com.mme.travelassist.model.ChatSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    /**
     * Converts a ChatSession entity to a ChatSessionDTO.
     *
     * @param chatSession the ChatSession entity to convert
     * @return the converted ChatSessionDTO
     */
    @Mapping(source = "id", target = "sessionId")
    @Mapping(source = "trip.id", target = "tripId")
    ChatSessionDTO chatSessionToChatSessionDTO(ChatSession chatSession);

    /**
     * Converts a ChatMessage entity to a ChatMessageDTO.
     *
     * @param chatMessage the ChatMessage entity to convert
     * @return the converted ChatMessageDTO
     */
    @Mapping(source = "id", target = "messageId")
    @Mapping(source = "session.id", target = "sessionId")
    ChatMessageDTO chatMessageToChatMessageDTO(ChatMessage chatMessage);
}
