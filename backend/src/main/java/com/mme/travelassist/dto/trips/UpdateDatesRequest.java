package com.mme.travelassist.dto.trips;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateDatesRequest {
    private String startDate;
    private String endDate;
    private Integer duration;
    private Set<Integer> months;
}
