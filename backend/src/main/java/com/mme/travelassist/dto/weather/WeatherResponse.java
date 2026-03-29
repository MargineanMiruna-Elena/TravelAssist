package com.mme.travelassist.dto.weather;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class WeatherResponse {
    private List<DayWeather> days;
    private boolean isHistorical;
}
