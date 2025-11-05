package com.mme.travelassist.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mme.travelassist.dto.auth.LogInRequest;
import com.mme.travelassist.dto.auth.LogInResponse;
import com.mme.travelassist.dto.auth.ResetPasswordRequest;
import com.mme.travelassist.dto.user.UserDTO;
import com.mme.travelassist.dto.user.UserResponseDTO;
import com.mme.travelassist.exception.auth.InvalidPasswordException;
import com.mme.travelassist.exception.user.DuplicateUserException;
import com.mme.travelassist.exception.user.PasswordApiException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.mapper.UserMapper;
import com.mme.travelassist.model.User;
import com.mme.travelassist.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;


    /**
     * Handles user log-in requests.
     *
     * @param logInRequest the log-in request containing email and password
     * @return a response entity containing the sign-in response
     * @throws UserNotFoundException if the user is not found
     * @throws InvalidPasswordException if the password is invalid
     */
    @PostMapping("/log-in")
    public ResponseEntity<LogInResponse> logIn(@RequestBody LogInRequest logInRequest) throws UserNotFoundException, InvalidPasswordException {
        return ResponseEntity.ok(authService.logIn(logInRequest));
    }

    /**
     * Handles user registration requests.
     *
     * @param userToRegister the user data transfer object containing registration details
     * @return a response entity containing the registered user's response DTO
     * @throws DuplicateUserException if a user with the same email already exists
     * @throws JsonProcessingException if there is an error processing JSON data
     * @throws PasswordApiException if there is an error with the password API
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserDTO userToRegister) throws DuplicateUserException, JsonProcessingException, PasswordApiException {
        User newUser = authService.register(userToRegister);
        UserResponseDTO userResponse = userMapper.userToUserResponseDTO(newUser);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Handles password reset requests.
     *
     * @param request the reset password request containing the user's email
     * @return a response entity indicating the success of the operation
     * @throws UserNotFoundException if the user is not found
     * @throws JsonProcessingException if there is an error processing JSON data
     * @throws PasswordApiException if there is an error with the password API
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) throws UserNotFoundException, JsonProcessingException, PasswordApiException {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
