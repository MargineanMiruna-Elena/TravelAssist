package com.mme.travelassist.service;

import com.mme.travelassist.dto.trips.CreateTripRequest;
import com.mme.travelassist.dto.trips.PoiSearchResult;
import com.mme.travelassist.dto.trips.TripPreferencesDTO;
import com.mme.travelassist.dto.trips.UpdateDatesRequest;
import com.mme.travelassist.exception.trip.DestinationNotFoundException;
import com.mme.travelassist.exception.trip.TripNotFoundException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PointOfInterest;
import com.mme.travelassist.model.Trip;
import com.mme.travelassist.model.enums.Interest;

import java.util.List;
import java.util.UUID;

public interface TripService {

    Trip createTrip(CreateTripRequest createTripRequest) throws DestinationNotFoundException, UserNotFoundException;

    Trip getTrip(UUID id) throws TripNotFoundException;

    List<Trip> getTrips(UUID id) throws UserNotFoundException;

    Trip updateTripDates(UUID id, UpdateDatesRequest updateDatesRequest) throws TripNotFoundException;

    void deleteTrip(UUID id);

    /**
     * Retrieves all destinations that match with the trip description
     * @param preferences the trip details and preferences given by the user
     * @return a list of destinations that match the preferences
     */
    List<Destination> getRecommendations(TripPreferencesDTO preferences);

    /**
     * Retrieves all attractions within the destination city
     * @param destination the destination chosen by the user
     * @return a list of attractions that are in the destination city
     */
    List<PointOfInterest> getAttractions(Destination destination, List<Interest> interests);

    /**
     * Retrieves destination by destination id
     * @param destinationId the unique identifier of the destination
     * @return the destination that matches the id
     * @throws DestinationNotFoundException if the destination with the id doesn't exist
     */
    Destination getDestinationById(UUID destinationId) throws DestinationNotFoundException;

    /**
     * Retrieves destinations by destination name
     * @param name the name of the destination
     * @return a list of destinations that match the name
     */
    List<Destination> searchDestinationsByName(String name);

    List<String> searchCountriesByName(String name);

    Destination findOrCreateDestination(String cityName, String countryName);

    List<PoiSearchResult> searchPoiByName(String query, double lat, double lng);

    List<PointOfInterest> addPoiToTrip(UUID tripId, String xId) throws TripNotFoundException;

    List<PointOfInterest> deletePoiFromTrip(UUID tripId, UUID id) throws TripNotFoundException;

}
