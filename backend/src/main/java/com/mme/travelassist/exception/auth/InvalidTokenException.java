package com.mme.travelassist.exception.auth;

import com.mme.travelassist.model.enums.ApiErrorMessages;

public class InvalidTokenException extends Exception {
    public InvalidTokenException() {
        super(ApiErrorMessages.INVALID_TOKEN.getCode());
    }
}
