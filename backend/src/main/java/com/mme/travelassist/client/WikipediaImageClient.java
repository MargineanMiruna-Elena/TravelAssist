package com.mme.travelassist.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WikipediaImageClient {

    private final RestTemplate restTemplate;

    private static final String BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

    /**
     * Returnează URL-ul pozei principale din pagina Wikipedia a orașului.
     * Wikipedia folosește de obicei poza cea mai iconică pentru fiecare oraș.
     * Nu necesită API key și are rate limit generos (200 req/sec).
     *
     * Încearcă mai multe variante de titlu de pagină:
     *   1. "{cityName}" (ex: "Paris")
     *   2. "{cityName}, {country}" (ex: "Paris, France")
     *   3. "{cityName} city" (ex: "Paris city")
     */
    public String getImageUrlForCity(String cityName, String country) {
        String imageUrl = fetchFromWikipedia(cityName);

        if (imageUrl == null || isUnsuitable(imageUrl)) {
            imageUrl = fetchFromWikipedia(cityName + ", " + country);
        }
        if (imageUrl == null || isUnsuitable(imageUrl)) {
            imageUrl = fetchFromWikipedia(cityName + " city");
        }
        if (imageUrl == null || isUnsuitable(imageUrl)) {
            imageUrl = fetchFromWikipedia(cityName + " capital");
        }
        if (imageUrl == null || isUnsuitable(imageUrl)) {
            log.debug("No relevant image found for '{}'", cityName);
            return null;
        }
        return imageUrl;
    }

    public String getImageUrlForPoi(String name, String city, String country) {

        String imageUrl = fetchFromWikipedia(name + ", " + city);

        if (imageUrl == null || isUnsuitable(imageUrl)) {
            log.debug("No relevant image found for POI '{}'", name);
            return null;
        }

        return imageUrl;
    }

    /**
     * Returnează true dacă URL-ul imaginii pare a fi un steag.
     * Wikipedia numește steagurile "Flag_of_X" sau conțin "flag" în URL.
     */
    private boolean isUnsuitable(String imageUrl) {
        if (imageUrl == null) return false;
        String lower = imageUrl.toLowerCase();

        if (lower.contains("flag_of") || lower.contains("flag-of")
                || lower.contains("/flag") || lower.contains("coat_of_arms")
                || lower.contains("emblem") || lower.contains("seal_of")
                || lower.contains("seal.svg") || lower.contains("_seal_")
                || lower.contains("state_seal") || lower.contains("great_seal")
                || lower.contains("logo") || lower.contains("coa_")) return true;

        if (lower.contains("_map") || lower.contains("map_of")
                || lower.contains("-map") || lower.contains("location_map")
                || lower.contains("relief_map") || lower.contains("locator_map")) return true;

        if (lower.endsWith(".svg")) return true;

        if (lower.contains("portrait") || lower.contains("_headshot")
                || lower.contains("official_photo")) return true;

        return false;
    }

    /**
     * Wikipedia stochează TIFF-urile cu o versiune JPEG accesibilă prin adăugarea
     * prefixului "lossy-page1-" și sufixului ".jpg" la numele fișierului.
     * Ex: "image.tiff" → "lossy-page1-1200px-image.tiff.jpg"
     * Dacă URL-ul nu e TIFF, îl returnează nemodificat.
     */
    private String convertToJpegIfNeeded(String imageUrl) {
        if (imageUrl == null) return null;
        String lower = imageUrl.toLowerCase();
        if (!lower.contains(".tiff") && !lower.contains(".tif")) return imageUrl;

        String converted = imageUrl.replaceAll(
                "(commons/thumb/[^/]+/[^/]+/)([^/]+\\.tiff?)",
                "$1lossy-page1-1200px-$2.jpg"
        );
        log.debug("TIFF converted to JPEG: {} -> {}", imageUrl, converted);
        return converted;
    }

    @SuppressWarnings("unchecked")
    private String fetchFromWikipedia(String pageTitle) {
        String encodedTitle = pageTitle.trim().replace(" ", "_");

        String url = BASE_URL + encodedTitle;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TravelAssist/1.0 (https://github.com/travelassist)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) return null;

            Map<String, Object> originalImage = (Map<String, Object>) body.get("originalimage");
            if (originalImage != null) {
                String imageUrl = convertToJpegIfNeeded((String) originalImage.get("source"));
                log.debug("Wikipedia image found for '{}': {}", pageTitle, imageUrl);
                return imageUrl;
            }

            Map<String, Object> thumbnail = (Map<String, Object>) body.get("thumbnail");
            if (thumbnail != null) {
                return convertToJpegIfNeeded((String) thumbnail.get("source"));
            }

            return null;

        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            log.debug("No Wikipedia page exists for '{}'", pageTitle);
            return null;
        } catch (Exception e) {
            log.error("Error Wikipedia for '{}': {}", pageTitle, e.getMessage());
            return null;
        }
    }
}