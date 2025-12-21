package com.mme.travelassist.exception.user;

import com.mme.travelassist.model.enums.ApiErrorMessages;

public class PasswordApiException extends Exception {
    public PasswordApiException() {
        super(ApiErrorMessages.PASSWORD_API_ERROR.getCode());
    }
}

