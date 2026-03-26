package com.mme.travelassist.client;

import com.mme.travelassist.dto.trips.FoursquareDestinationDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class FoursquareClient {

    private final RestTemplate restTemplate;

    @Value("${foursquare.service.key.2}")
    private String foursquareApiKey;

    private static final String FSQ_URL = "https://places-api.foursquare.com/places/search";

    /**
     * Returnează lista de obiecte brute de la Foursquare (pentru uz intern).
     */
    public List<FsqPlace> getRawPlaces(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(FSQ_URL)
                .queryParam("ll", lat + "," + lon)
                .queryParam("radius", 10000)
                .queryParam("fields", "name,categories")
                .queryParam("sort", "popularity")
                .queryParam("limit", 50)
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + foursquareApiKey.trim());
        headers.set("X-Places-Api-Version", "2025-06-17");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        try {
            log.debug("Calling Foursquare API: {}", url);
            ResponseEntity<FsqResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), FsqResponse.class);

            if (response.getBody() != null && response.getBody().getResults() != null) {
                return response.getBody().getResults();
            }
        } catch (Exception e) {
            log.error("Error calling Foursquare: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    /**
     * Aceasta este metoda apelată de DestinationSyncService pentru a obține tipurile (kinds).
     */
    public Set<String> getCityData(double lat, double lon) {
        List<FsqPlace> places = getRawPlaces(lat, lon);

        Set<String> kinds = places.stream()
                .filter(p -> p.getCategories() != null)
                .flatMap(p -> p.getCategories().stream())
                .map(cat -> cat.getName().toLowerCase().trim())
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toSet());

        return kinds;
    }

    @Data
    private static class FsqResponse {
        private List<FsqPlace> results;
    }

    @Data
    private static class FsqPlace {
        private String name;
        private List<FsqCategory> categories;
    }

    @Data
    private static class FsqCategory {
        private String name;
    }

}