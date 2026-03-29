package com.mme.travelassist.service;

import com.mme.travelassist.dto.weather.WeatherResponse;
import com.mme.travelassist.exception.trip.TripNotFoundException;

import java.util.UUID;

public interface WeatherService {

    WeatherResponse getWeatherForTrip(UUID tripId) throws TripNotFoundException;
}
