package com.mme.travelassist.dto.user;

import lombok.Data;

import java.util.UUID;

@Data
public class UserPreferencesResponseDTO {
    private UUID id;
    private String language;
    private Boolean notificationsEmail;
}
