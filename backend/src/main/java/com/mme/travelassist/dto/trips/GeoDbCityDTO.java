package com.mme.travelassist.dto.trips;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeoDbCityDTO {
    private String name;
    private String country;
    private String countryCode;
    private Double latitude;
    private Double longitude;
    private Integer population;
}