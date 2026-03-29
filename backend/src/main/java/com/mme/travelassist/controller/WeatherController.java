package com.mme.travelassist.controller;

import com.mme.travelassist.dto.weather.WeatherResponse;
import com.mme.travelassist.exception.trip.TripNotFoundException;
import com.mme.travelassist.service.WeatherService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@AllArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/{tripId}/weather")
    public ResponseEntity<WeatherResponse> getWeather(@PathVariable UUID tripId) throws TripNotFoundException {
        return ResponseEntity.ok(weatherService.getWeatherForTrip(tripId));
    }
}
