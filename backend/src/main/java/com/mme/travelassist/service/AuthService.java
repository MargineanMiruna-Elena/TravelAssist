package com.mme.travelassist.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mme.travelassist.dto.auth.LogInRequest;
import com.mme.travelassist.dto.auth.LogInResponse;
import com.mme.travelassist.dto.auth.ResetPasswordRequest;
import com.mme.travelassist.dto.user.UserDTO;
import com.mme.travelassist.exception.auth.InvalidPasswordException;
import com.mme.travelassist.exception.auth.InvalidTokenException;
import com.mme.travelassist.exception.user.DuplicateUserException;
import com.mme.travelassist.exception.user.PasswordApiException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.User;
import jakarta.mail.MessagingException;

public interface AuthService {

    /**
     * Logs in a user with the provided credentials.
     *
     * @param logInRequest the log-in request containing email and password
     * @return LogInResponse containing the JWT token
     * @throws UserNotFoundException if the user is not found
     * @throws InvalidPasswordException if the provided password is incorrect
     */
    LogInResponse logIn(LogInRequest logInRequest) throws UserNotFoundException, InvalidPasswordException;

    /**
     * Registers a new user with the provided user details.
     *
     * @param userDTO the user details for registration
     * @return LogInResponse containing the JWT token
     * @throws DuplicateUserException if a user with the same username or email already exists
     * @throws JsonProcessingException if there is an error processing JSON data for the password
     * @throws PasswordApiException if there is an error calling the password generation API
     */
    LogInResponse register(UserDTO userDTO) throws DuplicateUserException, JsonProcessingException, PasswordApiException;

    /**
     * Initiates the password reset process for a user.
     * This method generates a new password and sends it to the user's email.
     * @param resetPasswordRequest the request containing the user's email
     * @throws UserNotFoundException if the user with the provided email does not exist
     * @throws JsonProcessingException if there is an error processing JSON data for the password
     * @throws PasswordApiException if there is an error calling the password generation API
     */
    void resetPassword(ResetPasswordRequest resetPasswordRequest) throws UserNotFoundException, JsonProcessingException, PasswordApiException, MessagingException;

    /**
     * Extracts the email from the provided JWT token.
     *
     * @param token the JWT token from which to extract the email
     * @return the email extracted from the token
     * @throws InvalidTokenException if the token has a missing email claim
     */
    String getEmailFromToken(String token) throws InvalidTokenException;
}
