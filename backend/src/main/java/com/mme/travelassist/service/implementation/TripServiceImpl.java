package com.mme.travelassist.service.implementation;

import com.mme.travelassist.dto.trips.CreateTripRequest;
import com.mme.travelassist.dto.trips.GeoDbCityDTO;
import com.mme.travelassist.dto.trips.TripPreferencesDTO;
import com.mme.travelassist.exception.trip.DestinationNotFoundException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PoiCache;
import com.mme.travelassist.model.Trip;
import com.mme.travelassist.model.User;
import com.mme.travelassist.model.enums.Category;
import com.mme.travelassist.model.enums.TripStatus;
import com.mme.travelassist.repository.DestinationRepository;
import com.mme.travelassist.repository.PoiCacheRepository;
import com.mme.travelassist.repository.TripRepository;
import com.mme.travelassist.repository.UserRepository;
import com.mme.travelassist.service.DestinationSyncService;
import com.mme.travelassist.service.TripService;
import com.mme.travelassist.utils.GeoDbCitiesClient;
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
    private final PoiApiServiceImpl poiApiService;
    private static final Logger logger = LoggerFactory.getLogger(TripServiceImpl.class);
    private final DestinationSyncService destinationSyncService;
    private final PoiCacheRepository poiCacheRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    @Override
    public Trip createTrip(CreateTripRequest createTripRequest) throws DestinationNotFoundException, UserNotFoundException {

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

        List<PoiCache> attractions = new ArrayList<>();
        for (String poi : createTripRequest.getSelectedAttractions()) {
            Optional<PoiCache> poiCache = poiCacheRepository.findByXid(poi);
            poiCache.ifPresent(attractions::add);
        }

        Set<Category> categorySet = null;
        if (createTripRequest.getInterests() != null && !createTripRequest.getInterests().isEmpty()) {
            categorySet = createTripRequest.getInterests().stream()
                    .map(interest -> Category.valueOf(interest.toUpperCase()))
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
    public List<Trip> getTrips(UUID id) throws UserNotFoundException {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            logger.warn("User with ID {} not found", id);
            throw new UserNotFoundException();
        }

        return tripRepository.getTripByUser(user.get());
    }

    @Override
    public List<Destination> getRecommendations(TripPreferencesDTO preferences) {
        Set<Category> categorySet = null;
        if (preferences.getInterests() != null && !preferences.getInterests().isEmpty()) {
            categorySet = preferences.getInterests().stream()
                    .map(interest -> Category.valueOf(interest.toUpperCase()))
                    .collect(Collectors.toSet());
        }

        Set<Integer> monthSet = (preferences.getSelectedMonths() != null && !preferences.getSelectedMonths().isEmpty())
                ? new HashSet<>(preferences.getSelectedMonths()) : null;

        logger.info("TripService - Fetching destination recommendations");
        List<Destination> destinations = destinationRepository.findByPreferences(monthSet, categorySet);

        if (preferences.getCountry() == null || preferences.getCountry().isEmpty())
            return destinations;

        List<Destination> destinationsByCountry = destinations.stream().filter(destination -> Objects.equals(destination.getCountry(), preferences.getCountry())).toList();

        if (destinationsByCountry.isEmpty())
            return destinations;

        return destinationsByCountry;
    }

    @Override
    public List<PoiCache> getAttractions(Destination destination, List<Category> interests) {
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
    public Destination findOrCreateDestination(String cityName) {
        logger.info("tripService - Searching for destination {} in GeoDB", cityName);
        return destinationSyncService.findOrCreateDestination(cityName);
    }
}
