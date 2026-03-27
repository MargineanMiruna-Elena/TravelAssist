package com.mme.travelassist.service.implementation;

import com.mme.travelassist.dto.trips.CreateTripRequest;
import com.mme.travelassist.dto.trips.PoiSearchResult;
import com.mme.travelassist.dto.trips.TripPreferencesDTO;
import com.mme.travelassist.dto.trips.UpdateDatesRequest;
import com.mme.travelassist.exception.trip.DestinationNotFoundException;
import com.mme.travelassist.exception.trip.TripNotFoundException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.*;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.model.enums.TripStatus;
import com.mme.travelassist.repository.DestinationRepository;
import com.mme.travelassist.repository.PointOfInterestRepository;
import com.mme.travelassist.repository.TripRepository;
import com.mme.travelassist.repository.UserRepository;
import com.mme.travelassist.service.DestinationSyncService;
import com.mme.travelassist.service.DestinationScoringService;
import com.mme.travelassist.service.PoiApiService;
import com.mme.travelassist.service.TripService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TripServiceImpl implements TripService {

    private final DestinationRepository destinationRepository;
    private final PoiApiService poiApiService;
    private static final Logger logger = LoggerFactory.getLogger(TripServiceImpl.class);
    private final DestinationSyncService destinationSyncService;
    private final DestinationScoringService destinationScoringService;

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final PointOfInterestRepository pointOfInterestRepository;

    @Override
    public Trip createTrip(CreateTripRequest createTripRequest) throws DestinationNotFoundException, UserNotFoundException {
        logger.warn("tripService - Attempting to create trip.");

        Optional<User> user = userRepository.findById(createTripRequest.getUserId());
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", createTripRequest.getUserId());
            throw new UserNotFoundException();
        }

        Optional<Destination> destination = destinationRepository.findById(createTripRequest.getSelectedDestination());
        if (destination.isEmpty()) {
            logger.warn("Destination with ID {} not found", createTripRequest.getSelectedDestination());
            throw new DestinationNotFoundException();
        }

        List<PointOfInterest> attractions = new ArrayList<>();
        for (UUID poi : createTripRequest.getSelectedAttractions()) {
            Optional<PointOfInterest> poiCache = pointOfInterestRepository.findById(poi);
            poiCache.ifPresent(attractions::add);
        }

        Set<Interest> categorySet = null;
        if (createTripRequest.getInterests() != null && !createTripRequest.getInterests().isEmpty()) {
            categorySet = createTripRequest.getInterests().stream()
                    .map(interest -> Interest.valueOf(interest.toUpperCase()))
                    .collect(Collectors.toSet());
        }

        Set<Integer> monthSet = (createTripRequest.getSelectedMonths() != null && !createTripRequest.getSelectedMonths().isEmpty())
                ? new HashSet<>(createTripRequest.getSelectedMonths()) : null;

        Boolean isFlexibleDate = false;
        if (createTripRequest.getStartDate().isEmpty() && createTripRequest.getEndDate().isEmpty()) {
            isFlexibleDate = true;
        }

        TripStatus status;
        if (isFlexibleDate) {
            status = TripStatus.DRAFT;
        } else if (LocalDate.parse(createTripRequest.getStartDate()).isAfter(LocalDate.now())) {
            status = TripStatus.UPCOMING;
        } else if (LocalDate.parse(createTripRequest.getEndDate()).isAfter(LocalDate.now())) {
            status = TripStatus.STARTED;
        } else {
            status = TripStatus.COMPLETED;
        }

        Trip createTrip;
        if (isFlexibleDate) {
            createTrip = new Trip(
                    user.get(),
                    destination.get(),
                    isFlexibleDate,
                    monthSet,
                    null,
                    null,
                    createTripRequest.getDuration(),
                    categorySet,
                    createTripRequest.getAdditionalNotes(),
                    status,
                    attractions
            );
        } else {
            createTrip = new Trip(
                    user.get(),
                    destination.get(),
                    isFlexibleDate,
                    monthSet,
                    LocalDate.parse(createTripRequest.getStartDate()),
                    LocalDate.parse(createTripRequest.getEndDate()),
                    createTripRequest.getDuration(),
                    categorySet,
                    createTripRequest.getAdditionalNotes(),
                    status,
                    attractions
            );
        }

        tripRepository.save(createTrip);

        return createTrip;
    }

    @Override
    public Trip getTrip(UUID id) throws TripNotFoundException {
        Optional<Trip> trip = tripRepository.findById(id);
        if (trip.isEmpty()) {
            logger.warn("Trip with ID {} not found", id);
            throw new TripNotFoundException();
        }

        return trip.get();
    }

    @Override
    public List<Trip> getTrips(UUID id) throws UserNotFoundException {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", id);
            throw new UserNotFoundException();
        }

        return tripRepository.getTripByUser(user.get());
    }

    @Override
    public Trip updateTripDates(UUID id, UpdateDatesRequest updateDatesRequest) throws TripNotFoundException {
        Optional<Trip> oldTrip = tripRepository.findById(id);
        if (oldTrip.isEmpty()) {
            logger.warn("Trip with ID {} not found", id);
            throw new TripNotFoundException();
        }

        Trip updatedTrip = oldTrip.get();
        updatedTrip.setExactStartDate(LocalDate.parse(updateDatesRequest.getStartDate()));
        updatedTrip.setExactEndDate(LocalDate.parse(updateDatesRequest.getEndDate()));
        updatedTrip.setDurationDays(updateDatesRequest.getDuration());
        updatedTrip.setPreferredMonths(updateDatesRequest.getMonths());
        updatedTrip.setIsFlexibleDate(false);

        if (LocalDate.parse(updateDatesRequest.getStartDate()).isAfter(LocalDate.now())) {
            updatedTrip.setStatus(TripStatus.UPCOMING);
        } else if (LocalDate.parse(updateDatesRequest.getEndDate()).isAfter(LocalDate.now())) {
            updatedTrip.setStatus(TripStatus.STARTED);
        } else {
            updatedTrip.setStatus(TripStatus.COMPLETED);
        }

        return tripRepository.save(updatedTrip);
    }

    @Override
    public void deleteTrip(UUID id) {
        tripRepository.deleteById(id);
    }

    @Override
    public List<Destination> getRecommendations(TripPreferencesDTO preferences) {
        List<Destination> destinations = destinationRepository.findAll();
        String country = preferences.getCountry();

        return destinationScoringService.scoreAndRank(destinations, preferences, country)
                .stream()
                .map(ScoredDestination::destination)
                .toList();
    }

    @Override
    public List<PointOfInterest> getAttractions(Destination destination, List<Interest> interests) {
        return poiApiService.fetchAttractionsByDestination(destination, interests);
    }

    @Override
    public Destination getDestinationById(UUID destinationId) throws DestinationNotFoundException {
        logger.info("tripService - Fetching destination with ID: {}", destinationId);
        Optional<Destination> destination = destinationRepository.findById(destinationId);
        if (destination.isEmpty()) {
            logger.warn("Destination with ID {} not found", destinationId);
            throw new DestinationNotFoundException();
        }
        return destination.get();
    }

    @Override
    public List<Destination> searchDestinationsByName(String name) {
        return destinationRepository
                .findByNameContainingIgnoreCaseOrderByNameAsc(name)
                .stream()
                .limit(8)
                .toList();
    }

    @Override
    public List<String> searchCountriesByName(String name) {
        return destinationRepository
                .findDistinctCountriesByNameContaining(name)
                .stream()
                .limit(8)
                .toList();
    }

    @Override
    public Destination findOrCreateDestination(String cityName, String countryName) {
        logger.info("tripService - Searching for destination {} in GeoDB", cityName);
        return destinationSyncService.findOrCreateDestination(cityName, countryName);
    }

    @Override
    public List<PoiSearchResult> searchPoiByName(String query, double lat, double lng) {
        return poiApiService.search(query, lat, lng);
    }

    @Override
    public List<PointOfInterest> addPoiToTrip(UUID tripId, String xId) throws TripNotFoundException {
        logger.info("tripService - Adding point of interest to trip");
        Trip updatedTrip = tripRepository.findById(tripId)
                .orElseThrow(() -> {
                    logger.warn("Trip with ID {} not found", tripId);
                    return new TripNotFoundException();
                });

        boolean alreadyExists = updatedTrip.getPointsOfInterest().stream().anyMatch(poi -> poi.getXid().equals(xId));

        if (alreadyExists) {
            return updatedTrip.getPointsOfInterest();
        }

        PointOfInterest poi = poiApiService.findPoiOrCreate(updatedTrip, xId);
        List<PointOfInterest> updatedList = new ArrayList<>(updatedTrip.getPointsOfInterest() != null
                ? updatedTrip.getPointsOfInterest() : Collections.emptyList());
        updatedList.add(poi);
        updatedTrip.setPointsOfInterest(updatedList);
        tripRepository.save(updatedTrip);

        return updatedList;
    }

    @Override
    public List<PointOfInterest> deletePoiFromTrip(UUID tripId, UUID id) throws TripNotFoundException {
        logger.info("tripService - Deleting point of interest from trip");
        Trip updatedTrip = tripRepository.findById(tripId)
                .orElseThrow(() -> {
                    logger.warn("Trip with ID {} not found", tripId);
                    return new TripNotFoundException();
                });

        List<PointOfInterest> updatedList = new ArrayList<>(updatedTrip.getPointsOfInterest() != null
                ? updatedTrip.getPointsOfInterest() : Collections.emptyList());
        updatedList.remove(id);
        updatedTrip.setPointsOfInterest(updatedList);
        tripRepository.save(updatedTrip);

        return updatedList;
    }
}
