package com.mme.travelassist.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GooglePlacesClient {

    private final RestTemplate restTemplate;

    @Value("${google.places.api.key}")
    private String apiKey;

    private static final String SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby";

    /**
     * Returnează rating-ul mediu Google pentru un oraș, bazat pe primele 20 de locuri populare.
     * Folosește Places API (New) cu Nearby Search.
     */
    public Double getAverageRatingForCity(double lat, double lon) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("maxResultCount", 20);
        requestBody.put("locationRestriction", Map.of(
                "circle", Map.of(
                        "center", Map.of("latitude", lat, "longitude", lon),
                        "radius", 10000.0
                )
        ));
        // Tipuri generale de locuri turistice
        requestBody.put("includedTypes", List.of(
                "tourist_attraction", "museum", "park", "restaurant", "hotel"
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", apiKey);
        // Specificăm explicit câmpurile dorite - plătești doar ce ceri
        headers.set("X-Goog-FieldMask", "places.rating,places.userRatingCount");

        try {
            ResponseEntity<GoogleNearbyResponse> response = restTemplate.exchange(
                    SEARCH_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    GoogleNearbyResponse.class
            );

            if (response.getBody() == null || response.getBody().getPlaces() == null) {
                log.debug("No places returned from Google for ({}, {})", lat, lon);
                return null;
            }

            // Media ponderată: locurile cu mai multe review-uri contează mai mult
            double weightedSum = 0;
            long totalReviews = 0;

            for (GooglePlace place : response.getBody().getPlaces()) {
                if (place.getRating() == null || place.getUserRatingCount() == null) continue;
                weightedSum += place.getRating() * place.getUserRatingCount();
                totalReviews += place.getUserRatingCount();
            }

            if (totalReviews == 0) return null;

            double weightedAvg = weightedSum / totalReviews;
            // Google returnează deja 1-5, rotunjim la 1 zecimală
            return Math.round(weightedAvg * 10.0) / 10.0;

        } catch (Exception e) {
            log.error("Error calling Google Places for ({}, {}): {}", lat, lon, e.getMessage());
            return null;
        }
    }

    @Data
    private static class GoogleNearbyResponse {
        private List<GooglePlace> places;
    }

    @Data
    private static class GooglePlace {
        private Double rating;
        private Integer userRatingCount;
    }
}
