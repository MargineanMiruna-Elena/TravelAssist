package com.mme.travelassist.dto.trips;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PoiSearchResult {
    private String id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private String website;
}
