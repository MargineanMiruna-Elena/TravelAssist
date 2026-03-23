package com.mme.travelassist.dto.trips;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PoiForUserResponseDTO {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
}
