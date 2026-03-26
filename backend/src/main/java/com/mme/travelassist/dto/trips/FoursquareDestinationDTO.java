package com.mme.travelassist.dto.trips;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class FoursquareDestinationDTO {
    private String xid;
    private String name;
    private List<String> categoryNames = new ArrayList<>();

    private String rate;

    private PointDto point;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PointDto {
        private double lat;
        private double lon;
    }
}
