package com.mme.travelassist.exception.trip;

import com.mme.travelassist.model.enums.ApiErrorMessages;

public class DestinationNotFoundException extends Exception {
    public DestinationNotFoundException() {
        super(ApiErrorMessages.DESTINATION_NOT_FOUND.getCode());
    }
}
