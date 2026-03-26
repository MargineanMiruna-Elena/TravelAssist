package com.mme.travelassist.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private UUID sessionId;
    private UUID messageId;
    private String aiText;
    private LocalDateTime timestamp;
}
