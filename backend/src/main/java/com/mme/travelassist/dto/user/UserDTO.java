package com.mme.travelassist.dto.user;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserDTO {

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Username must not be blank")
    @Size(max = 50, message = "Username must be less than 50 characters")
    private String username;

    @Email(message = "Email must be valid")
    @Size(max = 254, message = "Email must be less than 254 characters")
    private String email;

    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String password;
}
