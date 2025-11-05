package com.mme.travelassist.exception.auth;

import com.mme.travelassist.model.enums.ApiErrorMessages;

public class InvalidPasswordException extends Exception {
    public InvalidPasswordException() {
        super(ApiErrorMessages.INVALID_PASSWORD.getCode());
    }
}

