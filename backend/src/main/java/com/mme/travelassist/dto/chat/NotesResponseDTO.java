package com.mme.travelassist.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class NotesResponseDTO {
    private UUID id;
    private String text;
}
