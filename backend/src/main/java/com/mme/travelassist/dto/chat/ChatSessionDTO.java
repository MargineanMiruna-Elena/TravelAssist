package com.mme.travelassist.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ChatSessionDTO {
    private UUID sessionId;
    private String title;
    private LocalDateTime createdAt;
    private UUID tripId;
}
