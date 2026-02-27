package com.mme.travelassist.dto.trips;

import lombok.Data;

@Data
public class PoiCacheResponseDTO {
    private String xid;
    private String name;
    private Double latitude;
    private Double longitude;
}
