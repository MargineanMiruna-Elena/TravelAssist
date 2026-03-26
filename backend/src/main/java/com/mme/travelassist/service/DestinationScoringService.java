package com.mme.travelassist.service;

import com.mme.travelassist.dto.trips.TripPreferencesDTO;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.ScoredDestination;

import java.util.List;

public interface DestinationScoringService {

    List<ScoredDestination> scoreAndRank(List<Destination> candidates, TripPreferencesDTO preferences, String country);
}
