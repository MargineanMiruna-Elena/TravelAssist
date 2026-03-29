package com.mme.travelassist.controller;

import com.mme.travelassist.dto.chat.NotesResponseDTO;
import com.mme.travelassist.dto.trips.*;
import com.mme.travelassist.exception.trip.DestinationNotFoundException;
import com.mme.travelassist.exception.trip.TripNotFoundException;
import com.mme.travelassist.exception.user.UserNotFoundException;
import com.mme.travelassist.mapper.PointOfInterestMapper;
import com.mme.travelassist.mapper.TripMapper;
import com.mme.travelassist.model.ChatMessage;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PointOfInterest;
import com.mme.travelassist.model.Trip;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.service.ChatService;
import com.mme.travelassist.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
class TripController {

    private final TripService tripService;
    private final TripMapper tripMapper;
    private final ChatService chatService;
    private final PointOfInterestMapper pointOfInterestMapper;

    @PostMapping("/create")
    public ResponseEntity<CreateTripResponse> createTrip(@RequestBody CreateTripRequest createTripRequest) throws UserNotFoundException, DestinationNotFoundException {
        Trip trip = tripService.createTrip(createTripRequest);
        CreateTripResponse tripResponse = tripMapper.tripToCreateTripResponse(trip);
        return ResponseEntity.ok(tripResponse);
    }

    @GetMapping("/trip/{id}")
    public ResponseEntity<TripResponseDTO> getTrip(@PathVariable UUID id) throws TripNotFoundException {
        Trip trip = tripService.getTrip(id);
        TripResponseDTO tripResponseDTO = convert(trip);

        return ResponseEntity.ok(tripResponseDTO);
    }

    @GetMapping("/all-trips/{id}")
    public ResponseEntity<List<TripResponseDTO>> getTripsForUser(@PathVariable UUID id) throws UserNotFoundException {
        List<Trip> trips = tripService.getTrips(id);
        List<TripResponseDTO> tripsResponse = new ArrayList<>();

        for (Trip t: trips) {
            TripResponseDTO tripResponseDTO = convert(t);
            tripsResponse.add(tripResponseDTO);
        }
        return ResponseEntity.ok(tripsResponse);
    }

    @PostMapping("/update-dates/{id}")
    public ResponseEntity<TripResponseDTO> updateTripDates(@PathVariable UUID id, @Valid @RequestBody UpdateDatesRequest updateDatesRequest) throws TripNotFoundException {
        Trip trip = tripService.updateTripDates(id, updateDatesRequest);
        TripResponseDTO tripResponseDTO = convert(trip);

        return ResponseEntity.ok(tripResponseDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable UUID id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves a list of recommended destinations that match the user preferences
     * @param preferences the trip details and preferences given by the user
     * @return ResponseEntity containing a list of DestinationResponseDTO
     */
    @PostMapping("/recommend-destinations")
    public ResponseEntity<List<DestinationResponseDTO>> getDestinationRecommendations(@RequestBody TripPreferencesDTO preferences) {

        List<Destination> destinationList = tripService.getRecommendations(preferences);
        List<DestinationResponseDTO> destinationResponseDTOList = new ArrayList<>();

        for (Destination dest : destinationList) {
            DestinationResponseDTO d = tripMapper.destinationToDestinationResponseDTO(dest);
            destinationResponseDTOList.add(d);
        }

        return ResponseEntity.ok(destinationResponseDTOList);
    }

    @PostMapping("/attractions/{destinationId}")
    public ResponseEntity<List<PointOfInterestResponse>> getAttractionsByDestination(@PathVariable UUID destinationId, @RequestBody List<Interest> interests) throws DestinationNotFoundException {

        Destination destination = tripService.getDestinationById(destinationId);

        List<PointOfInterest> pois = tripService.getAttractions(destination, interests);
        List<PointOfInterestResponse> poisResponse = new ArrayList<>();

        for(PointOfInterest p : pois) {
            PointOfInterestResponse poir = pointOfInterestMapper.pointOfInterestToPointOfInterestResponse(p);
            poisResponse.add(poir);
        }

        return ResponseEntity.ok(poisResponse);
    }

    @GetMapping("/destinations/suggestions/{name}")
    public ResponseEntity<List<DestinationResponseDTO>> getDestinationSuggestions(@PathVariable String name) {
        if (name == null || name.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }

        List<Destination> suggestions = tripService.searchDestinationsByName(name.trim());
        List<DestinationResponseDTO> result = suggestions.stream()
                .map(tripMapper::destinationToDestinationResponseDTO)
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/countries/suggestions/{name}")
    public ResponseEntity<List<String>> getCountrySuggestions(@PathVariable String name) {
        if (name == null || name.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(tripService.searchCountriesByName(name.trim()));
    }

    @GetMapping("/destinations/search/{cityName}")
    public ResponseEntity<Destination> findOrCreateDestination(
            @PathVariable String cityName,
            @RequestParam String country
    ) {
        if (cityName == null || cityName.trim().length() < 2) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(tripService.findOrCreateDestination(cityName, country));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PoiSearchResult>> search(@RequestParam String query, @RequestParam double lat, @RequestParam double lng) {
        List<PoiSearchResult> results = tripService.searchPoiByName(query, lat, lng);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/{tripId}/add-poi/{xId}")
    public ResponseEntity<List<PoiForUserResponseDTO>> addPoiToTrip(@PathVariable UUID tripId, @PathVariable String xId) throws TripNotFoundException {
        List<PointOfInterest> updatedPoiList = tripService.addPoiToTrip(tripId, xId);
        List<PoiForUserResponseDTO> poiResponse = new ArrayList<>();
        for(PointOfInterest p: updatedPoiList) {
            poiResponse.add(
                    new PoiForUserResponseDTO(
                            p.getId(),
                            p.getName(),
                            p.getAddress(),
                            p.getLatitude(),
                            p.getLongitude(),
                            p.getCategory(),
                            p.getWebsite()
                    )
            );
        }

        return ResponseEntity.ok(poiResponse);
    }

    @DeleteMapping("/{tripId}/delete-poi/{id}")
    public ResponseEntity<List<PoiForUserResponseDTO>> deletePoiFromTrip(@PathVariable UUID tripId, @PathVariable UUID id) throws TripNotFoundException {
        List<PointOfInterest> updatedPoiList = tripService.deletePoiFromTrip(tripId, id);
        List<PoiForUserResponseDTO> poiResponse = new ArrayList<>();
        for(PointOfInterest p: updatedPoiList) {
            poiResponse.add(
                    new PoiForUserResponseDTO(
                            p.getId(),
                            p.getName(),
                            p.getAddress(),
                            p.getLatitude(),
                            p.getLongitude(),
                            p.getCategory(),
                            p.getWebsite()
                    )
            );
        }

        return ResponseEntity.ok(poiResponse);
    }

    private TripResponseDTO convert(Trip trip) {
        List<PoiForUserResponseDTO> poiResponse = new ArrayList<>();
        for(PointOfInterest p: trip.getPointsOfInterest()) {
            poiResponse.add(
                    new PoiForUserResponseDTO(
                            p.getId(),
                            p.getName(),
                            p.getAddress(),
                            p.getLatitude(),
                            p.getLongitude(),
                            p.getCategory(),
                            p.getWebsite()
                    )
            );
        }

        List<ChatMessage> savedMessages = chatService.savedMessagesForTrip(trip);
        List<NotesResponseDTO> notes = new ArrayList<>();
        for(ChatMessage cm: savedMessages) {
            notes.add(
                    new NotesResponseDTO (
                            cm.getId(),
                            cm.getText()
                    )
            );
        }

        TripResponseDTO trd = new TripResponseDTO(
                trip.getId(),
                trip.getUser().getId(),
                trip.getDestination().getName(),
                trip.getDestination().getCountry(),
                trip.getDestination().getLatitude(),
                trip.getDestination().getLongitude(),
                trip.getDestination().getImageUrl(),
                trip.getPreferredMonths(),
                trip.getExactStartDate(),
                trip.getExactEndDate(),
                trip.getDurationDays(),
                trip.getInterests(),
                trip.getFreeTextPreferences(),
                trip.getStatus(),
                poiResponse,
                notes
        );

        return trd;
    }
}
