package com.mme.travelassist.dto.trips;

import lombok.Data;

import java.util.List;

@Data
public class TripPreferencesDTO {
    private List<String> interests;
    private List<Integer> selectedMonths;
    private int duration;
    private String additionalNotes;
    private String country;
}
