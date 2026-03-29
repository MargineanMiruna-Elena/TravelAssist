package com.mme.travelassist.service;

import com.mme.travelassist.dto.trips.PoiSearchResult;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PointOfInterest;
import com.mme.travelassist.model.Trip;
import com.mme.travelassist.model.enums.Interest;

import java.util.List;

public interface PoiApiService {

    /**
     * Fetches top 20 most popular attractions by destination
     * @param destination attractions from maximum 10 km radius around the destination coordinates are fetched
     * @return a list of points of interest that are also saved to the database
     */
    List<PointOfInterest> fetchAttractionsByDestination(Destination destination, List<Interest> interests);

    List<PoiSearchResult> search(String query, double lat, double lng);

    PointOfInterest findPoiOrCreate(Trip trip, String xId);
}
