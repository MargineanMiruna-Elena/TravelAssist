package com.mme.travelassist.controller;

import com.mme.travelassist.dto.trips.DestinationResponseDTO;
import com.mme.travelassist.dto.trips.PoiCacheResponseDTO;
import com.mme.travelassist.dto.trips.TripPreferencesDTO;
import com.mme.travelassist.exception.trip.DestinationNotFoundException;
import com.mme.travelassist.mapper.PoiMapper;
import com.mme.travelassist.mapper.TripMapper;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PoiCache;
import com.mme.travelassist.model.enums.Category;
import com.mme.travelassist.service.TripService;
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
    private final PoiMapper poiMapper;

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
            System.out.println(d);
            destinationResponseDTOList.add(d);
            System.out.println(d.getName());
        }

        return ResponseEntity.ok(destinationResponseDTOList);
    }

    @PostMapping("/attractions/{destinationId}")
    public ResponseEntity<List<PoiCacheResponseDTO>> getAttractionsByDestination(@PathVariable UUID destinationId, @RequestBody List<Category> interests) throws DestinationNotFoundException {

        Destination destination = tripService.getDestinationById(destinationId);

        List<PoiCache> pois = tripService.getAttractions(destination, interests);
        List<PoiCacheResponseDTO> poisResponse = new ArrayList<>();

        for(PoiCache p : pois) {
            poisResponse.add(poiMapper.poiCacheToPoiCacheResponseDTO(p));
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
    public ResponseEntity<Destination> findOrCreateDestination(@PathVariable String cityName) {
        if (cityName == null || cityName.trim().length() < 2) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(tripService.findOrCreateDestination(cityName));
    }

}
