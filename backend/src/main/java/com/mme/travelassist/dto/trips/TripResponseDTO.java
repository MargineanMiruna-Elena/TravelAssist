package com.mme.travelassist.dto.trips;

import com.mme.travelassist.dto.chat.NotesResponseDTO;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.model.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
public class TripResponseDTO {
    private UUID id;
    private UUID userId;
    private String destination;
    private String country;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private Set<Integer> preferredMonths;
    private LocalDate startDate;
    private LocalDate endDate;
    private int durationDays;
    private Set<Interest> interests;
    private String freeTextPreferences;
    private TripStatus status;
    private List<PoiForUserResponseDTO> pointsOfInterest;
    private List<NotesResponseDTO> notes;
}
