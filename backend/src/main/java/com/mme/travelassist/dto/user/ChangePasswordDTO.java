package com.mme.travelassist.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDTO {

    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String oldPassword;

    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String newPassword;
}
