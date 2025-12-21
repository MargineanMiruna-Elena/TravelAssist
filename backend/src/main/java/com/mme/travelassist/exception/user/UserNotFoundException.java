package com.mme.travelassist.exception.user;

import com.mme.travelassist.model.enums.ApiErrorMessages;


public class UserNotFoundException extends Exception {
    public UserNotFoundException() {
        super(ApiErrorMessages.USER_NOT_FOUND.getCode());
    }
}