package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.trips.DestinationResponseDTO;
import com.mme.travelassist.dto.trips.PoiCacheResponseDTO;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PoiCache;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PoiMapper {

    /**
     * Converts a PoiCache entity to a PoiCacheResponseDTO.
     *
     * @param poiCache the PoiCache entity to convert
     * @return the converted PoiCacheResponseDTO
     */
    PoiCacheResponseDTO poiCacheToPoiCacheResponseDTO(PoiCache poiCache);

}
