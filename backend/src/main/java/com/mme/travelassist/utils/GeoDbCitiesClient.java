package com.mme.travelassist.utils;

import com.mme.travelassist.dto.trips.GeoDbCityDTO;
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
    private static final String BASE_URL      = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";
    private static final int    PAGE_SIZE     = 10;

    // ─────────────────────────────────────────────────────────────────────────
    // Țări cu quota mai mare — destinații turistice de top la nivel mondial.
    // Restul țărilor primesc automat quota 1.
    // ─────────────────────────────────────────────────────────────────────────
    private static final Map<String, Integer> HIGH_QUOTA_COUNTRIES = new HashMap<>();

    static {
        HIGH_QUOTA_COUNTRIES.put("FR", 8);   // Franța - cel mai vizitat stat din lume
        HIGH_QUOTA_COUNTRIES.put("IT", 10);  // Italia - Roma, Milano, Veneția, Florența...
        HIGH_QUOTA_COUNTRIES.put("ES", 8);   // Spania - Barcelona, Madrid, Sevilla...
        HIGH_QUOTA_COUNTRIES.put("US", 10);  // SUA - New York, LA, Miami, Las Vegas...
        HIGH_QUOTA_COUNTRIES.put("CN", 5);   // China - Beijing, Shanghai, Xi'an...
        HIGH_QUOTA_COUNTRIES.put("GB", 6);   // Marea Britanie - Londra, Edinburgh...
        HIGH_QUOTA_COUNTRIES.put("DE", 6);   // Germania - Berlin, München, Hamburg...
        HIGH_QUOTA_COUNTRIES.put("JP", 8);   // Japonia - Tokyo, Osaka, Kyoto...
        HIGH_QUOTA_COUNTRIES.put("TH", 6);   // Thailanda - Bangkok, Chiang Mai, Phuket
        HIGH_QUOTA_COUNTRIES.put("TR", 6);   // Turcia - Istanbul, Ankara, Antalya...
        HIGH_QUOTA_COUNTRIES.put("GR", 5);   // Grecia - Atena, Thessaloniki, insulele
        HIGH_QUOTA_COUNTRIES.put("PT", 4);   // Portugalia - Lisabona, Porto, Faro
        HIGH_QUOTA_COUNTRIES.put("MX", 5);   // Mexic - Mexico City, Cancun, Oaxaca
        HIGH_QUOTA_COUNTRIES.put("IN", 6);   // India - Mumbai, Delhi, Jaipur, Goa
        HIGH_QUOTA_COUNTRIES.put("AU", 5);   // Australia - Sydney, Melbourne, Brisbane
        HIGH_QUOTA_COUNTRIES.put("BR", 5);   // Brazilia - Rio, São Paulo, Salvador
        HIGH_QUOTA_COUNTRIES.put("CA", 5);   // Canada - Toronto, Vancouver, Montreal
        HIGH_QUOTA_COUNTRIES.put("AT", 4);   // Austria - Viena, Salzburg, Innsbruck
        HIGH_QUOTA_COUNTRIES.put("NL", 4);   // Olanda - Amsterdam, Rotterdam, Haga
        HIGH_QUOTA_COUNTRIES.put("CH", 4);   // Elveția - Zürich, Geneva, Berna
        HIGH_QUOTA_COUNTRIES.put("ID", 4);   // Indonezia - Jakarta, Bali, Yogyakarta
        HIGH_QUOTA_COUNTRIES.put("VN", 4);   // Vietnam - Ho Chi Minh, Hanoi, Da Nang
        HIGH_QUOTA_COUNTRIES.put("MA", 4);   // Maroc - Marrakech, Casablanca, Fes
        HIGH_QUOTA_COUNTRIES.put("EG", 4);   // Egipt - Cairo, Alexandria, Luxor
        HIGH_QUOTA_COUNTRIES.put("AE", 3);   // UAE - Dubai, Abu Dhabi
        HIGH_QUOTA_COUNTRIES.put("ZA", 3);   // Africa de Sud - Cape Town, Johannesburg
        HIGH_QUOTA_COUNTRIES.put("HR", 3);   // Croația - Zagreb, Split, Dubrovnik
        HIGH_QUOTA_COUNTRIES.put("CZ", 3);   // Cehia - Praga, Brno, Ostrava
        HIGH_QUOTA_COUNTRIES.put("HU", 3);   // Ungaria - Budapesta, Debrecen
        HIGH_QUOTA_COUNTRIES.put("PL", 4);   // Polonia - Varșovia, Cracovia, Gdansk
        HIGH_QUOTA_COUNTRIES.put("RO", 3);   // România - București, Cluj, Brașov
        HIGH_QUOTA_COUNTRIES.put("MY", 3);   // Malaysia - Kuala Lumpur, Penang, Langkawi
        HIGH_QUOTA_COUNTRIES.put("SG", 2);   // Singapore
        HIGH_QUOTA_COUNTRIES.put("AR", 3);   // Argentina - Buenos Aires, Córdoba
        HIGH_QUOTA_COUNTRIES.put("PE", 3);   // Peru - Lima, Cusco, Arequipa
        HIGH_QUOTA_COUNTRIES.put("CO", 3);   // Columbia - Bogotá, Medellín, Cartagena
        HIGH_QUOTA_COUNTRIES.put("IL", 3);   // Israel - Tel Aviv, Ierusalim, Haifa
        HIGH_QUOTA_COUNTRIES.put("NZ", 3);   // Noua Zeelandă - Auckland, Wellington
        HIGH_QUOTA_COUNTRIES.put("KR", 4);   // Coreea de Sud - Seoul, Busan, Incheon
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Toate celelalte țări din lume — primesc quota 1 (cel mai mare oraș).
    // ISO 3166-1 alpha-2 codes.
    // ─────────────────────────────────────────────────────────────────────────
    private static final List<String> ALL_OTHER_COUNTRIES = List.of(
            "AF","AL","DZ","AD","AO","AG","AM","AZ","BS","BH","BD","BB","BY","BZ","BJ",
            "BT","BO","BA","BW","BN","BF","BI","CV","KH","CM","CF","TD","CL","KM","CG",
            "CD","CR","CI","CU","CY","DK","DJ","DM","DO","EC","SV","GQ","ER","EE","SZ",
            "ET","FJ","FI","GA","GM","GE","GH","GD","GT","GN","GW","GY","HT","HN","IS",
            "IQ","IE","JM","JO","KZ","KE","KI","KW","KG","LA","LV","LB","LS","LR","LY",
            "LI","LT","LU","MG","MW","MV","ML","MT","MH","MR","MU","FM","MD","MC","MN",
            "ME","MZ","MM","NA","NR","NP","NI","NE","NG","MK","NO","OM","PK","PW","PA",
            "PG","PY","PH","QA","RU","RW","KN","LC","VC","WS","SM","ST","SA","SN","RS",
            "SC","SL","SK","SI","SB","SO","SS","LK","SD","SR","SE","SY","TW","TJ","TZ",
            "TL","TG","TO","TT","TN","TM","TV","UG","UA","UY","UZ","VU","VA","VE","YE",
            "ZM","ZW","FI","SE","NO","DK","BE","IE","LU"
    );

    public GeoDbCityDTO getCityByName(String cityName) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("namePrefix", cityName)
                .queryParam("types",      "CITY")
                .queryParam("sort",       "-population")
                .queryParam("limit",      5)
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

            List<GeoDbCityDTO> results = parseBody(response.getBody());

            String normalizedInput = normalize(cityName);

            // Caută match exact după normalizare (ignoră diacritice și majuscule)
            return results.stream()
                    .filter(c -> c.getName() != null)
                    .filter(c -> normalize(c.getName()).equalsIgnoreCase(normalizedInput))
                    .findFirst()
                    .orElse(results.isEmpty() ? null : results.get(0));

        } catch (Exception e) {
            log.error("Eroare GeoDB getCityByName pentru '{}': {}", cityName, e.getMessage());
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

        // 1. Țări cu quota mare
        for (Map.Entry<String, Integer> entry : HIGH_QUOTA_COUNTRIES.entrySet()) {
            allCities.addAll(fetchWithDelay(entry.getKey(), entry.getValue()));
        }

        // 2. Restul țărilor — câte 1 oraș
        for (String countryCode : ALL_OTHER_COUNTRIES) {
            if (!HIGH_QUOTA_COUNTRIES.containsKey(countryCode)) {
                allCities.addAll(fetchWithDelay(countryCode, 1));
            }
        }

        log.info("GeoDB: {} orașe primite total", allCities.size());
        return allCities;
    }

    private List<GeoDbCityDTO> fetchWithDelay(String countryCode, int quota) {
        List<GeoDbCityDTO> result = fetchCitiesForCountry(countryCode, quota);
        log.debug("GeoDB: {} / {} orașe pentru {}", result.size(), quota, countryCode);
        try { Thread.sleep(1900); } catch (InterruptedException ignored) {}
        return result;
    }

    private List<GeoDbCityDTO> fetchCitiesForCountry(String countryCode, int limit) {
        // Cerem mai mult decât quota ca să avem de unde alege după filtrare
        int requestLimit = Math.min(limit * 3, PAGE_SIZE);
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("countryIds", countryCode)
                .queryParam("types",      "CITY")
                .queryParam("sort",       "-population")
                .queryParam("limit",      requestLimit)
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
            // Returnează cel mult `limit` orașe valide după filtrare
            return parsed.size() > limit ? parsed.subList(0, limit) : parsed;

        } catch (Exception e) {
            log.error("Eroare GeoDB pentru {}: {}", countryCode, e.getMessage());
            return Collections.emptyList();
        }
    }

    private static final List<String> SUBDIVISION_PATTERNS = List.of(
            "sector", "district", "borough", "arrondissement", "raion",
            "okrug", "oblast", "prefecture", "ward", "commune",
            "township", "subdivision", "quarter", "zone",
            "agglomeration", "urban area", "greater area", "province", "county", "canton"
    );

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

    private static final Set<String> KNOWN_SUBURBS = Set.of(
            "queens", "brooklyn", "manhattan", "bronx", "staten island",
            "harlem", "the bronx",
            "westminster", "lambeth", "southwark", "hackney", "lewisham",
            "neuilly-sur-seine", "boulogne-billancourt", "saint-denis",
            "east los angeles", "north las vegas", "east new york", "favoriten"
    );

    private boolean isKnownSuburb(String cityName) {
        boolean result = KNOWN_SUBURBS.contains(cityName.toLowerCase());
        if (result) log.debug("Exclus ca suburb cunoscut: '{}'", cityName);
        return result;
    }

    private boolean isSubdivision(String cityName) {
        String lower = cityName.toLowerCase();
        for (String pattern : SUBDIVISION_PATTERNS) {
            if (lower.contains(pattern)) {
                log.debug("Exclus ca subdiviziune: '{}'", cityName);
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
                .replaceAll("(?i)\s+national capital region$", "")
                .replaceAll("(?i)-capital region$", "")
                .replaceAll("(?i)\s+capital region$", "")
                .replaceAll("(?i)\s+region$", "")
                .trim();
        if (!cleaned.equals(cityName)) {
            log.debug("Nume curat: '{}' -> '{}'", cityName, cleaned);
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