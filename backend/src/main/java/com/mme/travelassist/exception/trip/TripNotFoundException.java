package com.mme.travelassist.exception.trip;

import com.mme.travelassist.model.enums.ApiErrorMessages;

public class TripNotFoundException extends Exception {
    public TripNotFoundException() {
        super(ApiErrorMessages.TRIP_NOT_FOUND.getCode());
    }
}
