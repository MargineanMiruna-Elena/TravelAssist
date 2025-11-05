package com.mme.travelassist.dto.user;

import lombok.Data;

import java.util.UUID;

@Data
public class UserResponseDTO {
    private UUID id;
    private String username;
    private String email;
    private String password;
}
