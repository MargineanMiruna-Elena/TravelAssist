package com.mme.travelassist.exceptionHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mme.travelassist.controller.AuthController;
import com.mme.travelassist.exception.auth.InvalidPasswordException;
import com.mme.travelassist.exception.auth.InvalidTokenException;
import com.mme.travelassist.exception.user.DuplicateUserException;
import com.mme.travelassist.exception.user.PasswordApiException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.enums.ApiErrorMessages;
import jakarta.mail.MessagingException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthControllerExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ProblemDetail handleDuplicateUser(DuplicateUserException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(ConstraintViolationException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ApiErrorMessages.CONSTRAINT_VIOLATION.getCode());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ApiErrorMessages.DATA_INTEGRITY_VIOLATION.getCode());
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ProblemDetail handleInvalidPassword(InvalidPasswordException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ProblemDetail handleInvalidToken(InvalidTokenException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(MessagingException.class)
    public ProblemDetail handleMessagingException(MessagingException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.MESSAGING_ERROR.getCode());
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ProblemDetail handleJsonProcessingException(JsonProcessingException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.JSON_PARSE_ERROR.getCode());
    }

    @ExceptionHandler(PasswordApiException.class)
    public ProblemDetail handlePasswordApiException(PasswordApiException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorMessages.PASSWORD_API_ERROR.getCode());
    }
}
