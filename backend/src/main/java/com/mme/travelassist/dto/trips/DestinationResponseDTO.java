package com.mme.travelassist.dto.trips;

import com.mme.travelassist.model.enums.Category;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class DestinationResponseDTO {
    private UUID id;
    private String name;
    private String localName;
    private String country;
    private Set<Integer> bestMonths;
    private Set<Category> tags;
    private String imageUrl;
}
