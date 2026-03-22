package com.mme.travelassist.dto.trips;

import com.mme.travelassist.model.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
public class TripResponseDTO {
    private UUID id;
    private String destinationName;
    private String destinationCountry;
    private String destinationImageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private TripStatus status;
}
