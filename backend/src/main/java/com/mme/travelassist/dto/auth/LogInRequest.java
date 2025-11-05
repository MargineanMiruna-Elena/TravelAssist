package com.mme.travelassist.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LogInRequest {

    @NotBlank
    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must be less than 254 characters")
    private String email;

    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String password;
}
