package com.mme.travelassist.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserPreferencesDTO {
    @Size(min = 2, max = 2)
    private String language;

    private Boolean notificationsEmail;
}
