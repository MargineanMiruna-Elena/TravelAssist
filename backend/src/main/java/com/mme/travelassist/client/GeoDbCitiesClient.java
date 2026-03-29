package com.mme.travelassist.client;

import com.mme.travelassist.dto.trips.GeoDbCityDTO;
import com.mme.travelassist.model.enums.CountryCode;
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

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeoDbCitiesClient {

    private final RestTemplate restTemplate;

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    private static final String RAPIDAPI_HOST = "wft-geo-db.p.rapidapi.com";
    private static final String BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";
    private static final int PAGE_SIZE = 10;

    private static final List<String> SUBDIVISION_PATTERNS = List.of(
            "sector", "district", "borough", "arrondissement", "raion",
            "okrug", "oblast", "prefecture", "ward", "commune",
            "township", "subdivision", "quarter", "zone", "governorate",
            "agglomeration", "urban area", "greater area", "province", "county", "canton", "region"
    );

    private static final Set<String> KNOWN_SUBURBS = Set.of(
            "queens", "brooklyn", "manhattan", "bronx", "staten island",
            "harlem", "the bronx",
            "westminster", "lambeth", "southwark", "hackney", "lewisham",
            "neuilly-sur-seine", "boulogne-billancourt", "saint-denis",
            "east los angeles", "north las vegas", "east new york", "favoriten"
    );

    public GeoDbCityDTO getCityByName(String cityName) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("namePrefix", cityName)
                .queryParam("types", "CITY")
                .queryParam("sort", "-population")
                .queryParam("limit", 5)
                .build()
                .toUriString();

        return getCity(url, cityName);
    }

    public GeoDbCityDTO getCityByNameAndCountry(String cityName, String countryName) {
        String country = CountryCode.fromName(countryName).getCode();
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("namePrefix", cityName)
                .queryParam("countryIds", country)
                .queryParam("types", "CITY")
                .queryParam("sort", "-population")
                .queryParam("limit", 5)
                .build()
                .toUriString();

        return getCity(url, cityName);
    }

    private GeoDbCityDTO getCity(String url, String cityName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-rapidapi-key",  rapidApiKey);
            headers.set("x-rapidapi-host", RAPIDAPI_HOST);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
            );

            List<GeoDbCityDTO> results = parseBody(response.getBody());

            String normalizedInput = normalize(cityName);

            return results.stream()
                    .filter(c -> c.getName() != null)
                    .filter(c -> normalize(c.getName()).equalsIgnoreCase(normalizedInput))
                    .findFirst()
                    .orElse(results.isEmpty() ? null : results.get(0));

        } catch (Exception e) {
            log.error("Error GeoDB getCityByName for '{}': {}", cityName, e.getMessage());
            return null;
        }
    }

    /**
     * Normalizează un string eliminând diacriticele.
     * Ex: "Iași" -> "Iasi", "Cluj-Napoca" -> "Cluj-Napoca", "Ñoño" -> "Nono"
     */
    private String normalize(String input) {
        if (input == null) return "";
        return java.text.Normalizer
                .normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    /**
     * Returnează orașe turistice echilibrate:
     * - țările din HIGH_QUOTA_COUNTRIES primesc numărul configurat de orașe
     * - toate celelalte țări primesc 1 oraș (cel mai mare)
     */
    public List<GeoDbCityDTO> getCities() {
        List<GeoDbCityDTO> allCities = new ArrayList<>();

        for (CountryCode country : CountryCode.values()) {
            allCities.addAll(fetchWithDelay(country.getCode(), country.getQuota()));
        }

        log.info("GeoDB: {} total cities retrieved from API", allCities.size());
        return allCities;
    }

    private List<GeoDbCityDTO> fetchWithDelay(String countryCode, int quota) {
        List<GeoDbCityDTO> result = fetchCitiesForCountry(countryCode, quota);
        log.debug("GeoDB: {} / {} cities for {}", result.size(), quota, countryCode);
        try { Thread.sleep(1900); } catch (InterruptedException ignored) {}
        return result;
    }

    private List<GeoDbCityDTO> fetchCitiesForCountry(String countryCode, int limit) {
        int requestLimit = Math.min(limit * 3, PAGE_SIZE);
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("countryIds", countryCode)
                .queryParam("types", "CITY")
                .queryParam("sort", "-population")
                .queryParam("limit", requestLimit)
                .build()
                .toUriString();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-rapidapi-key",  rapidApiKey);
            headers.set("x-rapidapi-host", RAPIDAPI_HOST);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class
            );

            List<GeoDbCityDTO> parsed = parseBody(response.getBody());
            return parsed.size() > limit ? parsed.subList(0, limit) : parsed;

        } catch (Exception e) {
            log.error("Error GeoDB for {}: {}", countryCode, e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private List<GeoDbCityDTO> parseBody(Map<String, Object> body) {
        List<GeoDbCityDTO> cities = new ArrayList<>();
        if (body == null) return cities;

        List<Map<String, Object>> data = (List<Map<String, Object>>) body.get("data");
        if (data == null) return cities;

        for (Map<String, Object> item : data) {
            GeoDbCityDTO dto = new GeoDbCityDTO();
            dto.setName((String) item.get("city"));
            dto.setCountry((String) item.get("country"));
            dto.setCountryCode((String) item.get("countryCode"));
            dto.setLatitude(toDouble(item.get("latitude")));
            dto.setLongitude(toDouble(item.get("longitude")));
            dto.setPopulation((Integer) item.get("population"));

            if (dto.getName() != null
                    && dto.getLatitude() != null
                    && dto.getLongitude() != null
                    && !isSubdivision(dto.getName())
                    && !isKnownSuburb(dto.getName())) {
                dto.setName(cleanCityName(dto.getName()));
                cities.add(dto);
            }
        }
        return cities;
    }

    private boolean isKnownSuburb(String cityName) {
        boolean result = KNOWN_SUBURBS.contains(cityName.toLowerCase());
        if (result) log.debug("Excluded as known suburb: '{}'", cityName);
        return result;
    }

    private boolean isSubdivision(String cityName) {
        String lower = cityName.toLowerCase();
        for (String pattern : SUBDIVISION_PATTERNS) {
            if (lower.contains(pattern)) {
                log.debug("Excluded as subdivision: '{}'", cityName);
                return true;
            }
        }
        return false;
    }

    /**
     * Curăță numele orașului de prefixe/sufixe adăugate de GeoDB.
     * Ex: "Metropolitan area of Florence" -> "Florence"
     *     "Madrid city"                   -> "Madrid"
     *     "Greater London"                -> "London"
     */
    private String cleanCityName(String cityName) {
        String cleaned = cityName
                .replaceAll("(?i)^west\s+", "")
                .replaceAll("(?i)^east\s+", "")
                .replaceAll("(?i)^north\s+", "")
                .replaceAll("(?i)^south\s+", "")
                .replaceAll("(?i)\s+national capital region$", "")
                .replaceAll("(?i)^metropolitan city of\s+", "")
                .replaceAll("(?i)\s+metropolitan city$", "")
                .replaceAll("(?i)^metropolitan area of\s+", "")
                .replaceAll("(?i)\s+metropolitan area$", "")
                .replaceAll("(?i)^urban agglomeration of\s+", "")
                .replaceAll("(?i)^agglomeration of\s+", "")
                .replaceAll("(?i)^city of\s+", "")
                .replaceAll("(?i)^greater\s+", "")
                .replaceAll("(?i)\s+capital city$", "")
                .replaceAll("(?i)\s+city$", "")
                .replaceAll("(?i)\s+municipality$", "")
                .replaceAll("(?i)\s+metropolitan$", "")
                .replaceAll("(?i)-capital region$", "")
                .replaceAll("(?i)\s+capital region$", "")
                .replaceAll("(?i)\s+region$", "")
                .trim();
        if (!cleaned.equals(cityName)) {
            log.debug("Clean name: '{}' -> '{}'", cityName, cleaned);
        }
        return cleaned;
    }

    private Double toDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Double d) return d;
        if (value instanceof Integer i) return i.doubleValue();
        if (value instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(value.toString()); }
        catch (Exception e) { return null; }
    }
}