package com.mme.travelassist.dto.weather;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DayWeather {
    private String date;
    private int tempMax;
    private int tempMin;
    private double PrecipitationSum;
    private int windspeedMax;
    private int weatherCode;
}
