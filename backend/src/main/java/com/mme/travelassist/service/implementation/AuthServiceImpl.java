package com.mme.travelassist.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mme.travelassist.security.JwtUtils;
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
import com.mme.travelassist.repository.UserRepository;
import com.mme.travelassist.service.AuthService;
import com.mme.travelassist.service.MailService;
import com.mme.travelassist.service.RandomPasswordGeneratorService;
import io.jsonwebtoken.JwtException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final MailService mailService;
    private final RandomPasswordGeneratorService randomPasswordGenerator;

    @Override
    public LogInResponse logIn(LogInRequest logInRequest) throws UserNotFoundException, InvalidPasswordException {
        log.info("Loging in user with email: {}", logInRequest.getEmail());

        User user = userRepository.findByEmail(logInRequest.getEmail())
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(logInRequest.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", user.getEmail());
            throw new InvalidPasswordException();
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getUsername());
        log.info("JWT generated for user: {}", user.getEmail());

        return new LogInResponse(token);
    }

    @Override
    public LogInResponse register(UserDTO userDTO) throws DuplicateUserException, JsonProcessingException, PasswordApiException {
        log.info("Registering new user: {}", userDTO.getEmail());

        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new DuplicateUserException();
        }

        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        String token = jwtUtils.generateToken(user.getEmail(), user.getUsername());
        log.info("JWT generated for new user: {}", user.getEmail());

        return new LogInResponse(token);
    }


    @Override
    public void resetPassword(ResetPasswordRequest resetPasswordRequest) throws MessagingException, UserNotFoundException, JsonProcessingException, PasswordApiException {
        log.info("Resetting password for email: {}", resetPasswordRequest.getEmail());
        User user = userRepository.findByEmail(resetPasswordRequest.getEmail())
                .orElseThrow(UserNotFoundException::new);
        String newPassword = randomPasswordGenerator.generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset successfully for email: {}", user.getEmail());
        mailService.sendGeneratedPasswordEmail(user.getEmail(), newPassword);
    }

    @Override
    public String getEmailFromToken(String token) throws InvalidTokenException {
        try {
            return jwtUtils.extractEmail(token);
        } catch (JwtException e) {
            log.error("Error extracting email from JWT: {}", e.getMessage());
            throw new InvalidTokenException();
        }
    }
}
