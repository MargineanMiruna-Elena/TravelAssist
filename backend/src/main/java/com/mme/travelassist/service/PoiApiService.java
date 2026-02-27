package com.mme.travelassist.service;

import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PoiCache;
import com.mme.travelassist.model.enums.Category;

import java.util.List;

public interface PoiApiService {

    /**
     * Fetches top 20 most popular attractions by destination
     * @param destination attractions from maximum 10 km radius around the destination coordinates are fetched
     * @return a list of points of interest that are also saved to the database
     */
    List<PoiCache> fetchAttractionsByDestination(Destination destination, List<Category> interests);
}
