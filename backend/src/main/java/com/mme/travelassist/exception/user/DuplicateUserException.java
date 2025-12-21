package com.mme.travelassist.exception.user;

import com.mme.travelassist.model.enums.ApiErrorMessages;

public class DuplicateUserException extends Exception {
    public DuplicateUserException() {
        super(ApiErrorMessages.DUPLICATE_USER.getCode());
    }
}
