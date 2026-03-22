package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.trips.CreateTripResponse;
import com.mme.travelassist.dto.trips.DestinationResponseDTO;
import com.mme.travelassist.dto.trips.TripResponseDTO;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.Trip;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TripMapper {

    /**
     * Converts a Destination entity to a DestinationResponseDTO.
     *
     * @param destination the Destination entity to convert
     * @return the converted DestinationResponseDTO
     */
    DestinationResponseDTO destinationToDestinationResponseDTO(Destination destination);

    CreateTripResponse tripToCreateTripResponse(Trip trip);
}
