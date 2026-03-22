package com.mme.travelassist.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {
    private UUID messageId;
    private String text;
    private String sender;
    private LocalDateTime timestamp;
    private UUID sessionId;
    private boolean remembered;
}
