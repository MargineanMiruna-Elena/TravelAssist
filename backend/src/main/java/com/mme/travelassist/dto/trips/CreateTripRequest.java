package com.mme.travelassist.dto.trips;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateTripRequest {
    private UUID userId;
    private String startDate;
    private String endDate;
    private List<Integer> selectedMonths;
    private Integer duration;
    private List<String> interests;
    private String additionalNotes;
    private UUID selectedDestination;
    private List<UUID> selectedAttractions;
}
