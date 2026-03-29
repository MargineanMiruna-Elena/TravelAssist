package com.mme.travelassist.dto.trips;

import lombok.Data;

import java.util.UUID;

@Data
public class PointOfInterestResponse {
    private UUID id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String category;
    private String imageUrl;
    private String website;
}
