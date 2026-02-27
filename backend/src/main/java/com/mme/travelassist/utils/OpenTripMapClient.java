package com.mme.travelassist.utils;

import com.mme.travelassist.dto.trips.OtmDestinationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenTripMapClient {

    private final RestTemplate restTemplate;

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    private static final String RAPIDAPI_HOST = "opentripmap-places-v1.p.rapidapi.com";
    private static final String BASE_URL = "https://opentripmap-places-v1.p.rapidapi.com/en/places/radius";

    private static final int RADIUS_METERS  = 10_000;
    private static final int PLACES_PER_CITY = 100;

    public List<OtmDestinationDTO> getPlacesNearCity(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("radius", RADIUS_METERS)
                .queryParam("lon", lon)
                .queryParam("lat", lat)
                .queryParam("rate", "3h")
                .queryParam("lang", "en")
                .queryParam("format", "json")
                .queryParam("limit", PLACES_PER_CITY)
                .build()
                .toUriString();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-rapidapi-key", rapidApiKey);
            headers.set("x-rapidapi-host", RAPIDAPI_HOST);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<OtmDestinationDTO[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, OtmDestinationDTO[].class
            );

            OtmDestinationDTO[] body = response.getBody();
            return body != null ? Arrays.asList(body) : Collections.emptyList();

        } catch (Exception e) {
            log.error("Eroare la fetcharea locațiilor pentru lat={}, lon={}: {}", lat, lon, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Agregă toate kinds-urile unice din locațiile unui oraș într-un Set<String>.
     * Acesta va fi intrarea în resolveCategories() din DestinationSyncService.
     *
     * Exemplu pentru Paris:
     *   {"historic", "museums", "cultural", "art_galleries", "restaurants", ...}
     */
    public Set<String> getKindsForCity(double lat, double lon) {
        return getPlacesNearCity(lat, lon).stream()
                .filter(p -> p.getKinds() != null && !p.getKinds().isBlank())
                .flatMap(p -> Arrays.stream(p.getKinds().split(",")))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(k -> !k.isBlank())
                .collect(Collectors.toSet());
    }
}
