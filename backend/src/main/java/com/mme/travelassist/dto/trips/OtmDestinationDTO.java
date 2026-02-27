package com.mme.travelassist.dto.trips;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OtmDestinationDTO {
    private String xid;
    private String name;
    private String kinds;
    private String rate;

    private PointDto point;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PointDto {
        private double lat;
        private double lon;
    }
}
