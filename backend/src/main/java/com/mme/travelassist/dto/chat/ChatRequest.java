package com.mme.travelassist.dto.chat;

import lombok.Data;

import java.util.UUID;

@Data
public class ChatRequest {
    private UUID userId;
    private String text;
    private UUID sessionId;
    private UUID tripId;
}
