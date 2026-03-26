package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.trips.PointOfInterestResponse;

import com.mme.travelassist.model.PointOfInterest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PointOfInterestMapper {

    /**
     * Converts a PointOfInterest entity to a PointOfInterestResponse.
     *
     * @param pointOfInterest the PointOfInterest entity to convert
     * @return the converted PointOfInterestResponse
     */
    @Mapping(source = "address", target = "address")
    @Mapping(source = "category", target = "category")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "website", target = "website")
    @Mapping(source = "id", target = "id")
    PointOfInterestResponse pointOfInterestToPointOfInterestResponse(PointOfInterest pointOfInterest);
}
