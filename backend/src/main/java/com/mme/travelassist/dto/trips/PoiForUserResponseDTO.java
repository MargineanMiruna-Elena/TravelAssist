package com.mme.travelassist.dto.trips;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class PoiForUserResponseDTO {
    private UUID id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String category;
    private String website;
}
