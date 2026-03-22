package com.mme.travelassist.service.implementation;

import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PoiCache;
import com.mme.travelassist.model.enums.Category;
import com.mme.travelassist.repository.PoiCacheRepository;
import com.mme.travelassist.service.PoiApiService;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PoiApiServiceImpl implements PoiApiService {

    @Value("${foursquare.service.key}")
    private String foursquareApiKey;

    private final PoiCacheRepository poiCacheRepository;
    private final RestTemplate restTemplate;

    private static final Logger logger = LoggerFactory.getLogger(PoiApiServiceImpl.class);
    private static final String FSQ_URL = "https://places-api.foursquare.com/places/search";
    private static final int TOTAL_LIMIT = 30;

    private static final Map<Category, String> CATEGORY_MAP = Map.ofEntries(
            Map.entry(Category.CULTURE,         "4bf58dd8d48988d1e2931735,4bf58dd8d48988d181941735,52e81612bcbc57f1066b79ee,4bf58dd8d48988d131941735,52e81612bcbc57f1066b7a14"),
            Map.entry(Category.BEACH,           "52e81612bcbc57f1066b7a28,56aa371be4b08b9a8d573544,4bf58dd8d48988d1e2941735,56aa371be4b08b9a8d573560"),
            Map.entry(Category.NATURE,          "52e81612bcbc57f1066b7a22,4bf58dd8d48988d15a941735,4bf58dd8d48988d159941735,4bf58dd8d48988d161941735,4eb1d4d54b900d56c88a45fc,4bf58dd8d48988d163941735,4eb1d4dd4b900d56c88a45fd,50328a4b91d4c4b30a586d6b,5032848691d4c4b30a586d61,56aa371be4b08b9a8d573560"),
            Map.entry(Category.NIGHTLIFE,       "4bf58dd8d48988d17c941735,4bf58dd8d48988d116941735,4bf58dd8d48988d11f941735,4d4b7105d754a06376d81259"),
            Map.entry(Category.GASTRONOMY,      "63be6904847c3692a84b9bb5"),
            Map.entry(Category.HISTORY,         "4deefb944765f83613cdba6e,5642206c498e4bfca532186c,4bf58dd8d48988d12d941735,4bf58dd8d48988d190941735"),
            Map.entry(Category.SHOPPING,        "4d4b7105d754a06378d81259"),
            Map.entry(Category.ADVENTURE,       "4bf58dd8d48988d182941735,4fceea171983d5d06c3e9823,4bf58dd8d48988d1e1931735,63be6904847c3692a84b9b21,4bf58dd8d48988d184941735,4bf58dd8d48988d193941735,4e4c9077bd41f78e849722f9,5744ccdfe4b0c0459246b4c1,55077a22498e5e9248869ba2,63be6904847c3692a84b9c24"),
            Map.entry(Category.FAMILY_FRIENDLY, "4bf58dd8d48988d182941735,4fceea171983d5d06c3e9823,4bf58dd8d48988d1e1931735,63be6904847c3692a84b9b21,52e81612bcbc57f1066b79e7,4bf58dd8d48988d192941735,4bf58dd8d48988d1e3931735,4bf58dd8d48988d193941735,4bf58dd8d48988d17b941735,4bf58dd8d48988d163941735"),
            Map.entry(Category.CITY_BREAK,      "4bf58dd8d48988d1df941735,56aa371be4b08b9a8d573562,50aaa49e4b90af0d42d5de11,56aa371be4b08b9a8d573547,4bf58dd8d48988d15a941735,4deefb944765f83613cdba6e,4bf58dd8d48988d161941735,4bf58dd8d48988d15d941735,5642206c498e4bfca532186c,4bf58dd8d48988d12d941735,52e81612bcbc57f1066b7a14,4bf58dd8d48988d163941735,52e81612bcbc57f1066b7a25,4bf58dd8d48988d164941735,4eb1d4dd4b900d56c88a45fd,4bf58dd8d48988d165941735,4bf58dd8d48988d166941735")
    );

    @Override
    @Transactional
    public List<PoiCache> fetchAttractionsByDestination(Destination destination,
                                                        List<Category> userInterests) {
        if (userInterests == null || userInterests.isEmpty()) {
            userInterests = List.of(Category.CULTURE, Category.CITY_BREAK);
        }

        int slotPerCategory = TOTAL_LIMIT / userInterests.size();
        logger.info("Destinație: {}, Categorii: {}, Slot/categorie: {}",
                destination.getName(), userInterests, slotPerCategory);

        List<PoiCache> finalResult = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();

        for (Category category : userInterests) {

            // Câte POI-uri există deja în DB cu acest tag exact
            List<PoiCache> inDb = poiCacheRepository.findByDestinationAndCategory(destination, category);
            logger.info("DB: {} POI-uri cu tag {} pentru {}", inDb.size(), category, destination.getName());

            // Dacă nu avem destule, fetch de la API
            if (inDb.size() < slotPerCategory) {
                logger.info("Lipsesc {} POI-uri pentru {}. Fetch API...",
                        slotPerCategory - inDb.size(), category);
                fetchAndSave(destination, category, slotPerCategory);
                inDb = poiCacheRepository.findByDestinationAndCategory(destination, category);
                logger.info("După fetch: {} POI-uri cu tag {} în DB", inDb.size(), category, destination.getName());
            }

            // Adăugăm în rezultat fără duplicate până la slot
            int added = 0;
            for (PoiCache poi : inDb) {
                if (added >= slotPerCategory) break;
                if (addedIds.contains(poi.getId())) continue;
                finalResult.add(poi);
                addedIds.add(poi.getId());
                added++;
            }
        }

        logger.info("Total returnat: {} POI-uri pentru {}", finalResult.size(), destination.getName());
        return finalResult;
    }

    private void fetchAndSave(Destination destination, Category category, int limit) {
        String fsqIds = CATEGORY_MAP.get(category);
        if (fsqIds == null) {
            logger.warn("Nicio mapare FSQ pentru categoria {}", category);
            return;
        }

        // Cerem mai multe ca să avem rezervă după filtrare
        List<FsqPlace> apiResults = callNewFsqApi(destination, fsqIds, Math.min(Math.max(limit * 2, 40), 50));
        logger.info("API a returnat {} rezultate pentru {}", apiResults.size(), category);

        for (FsqPlace place : apiResults) {
            if (place.getFsq_place_id() == null || place.getName() == null) continue;

            try {
                PoiCache poi = poiCacheRepository.findByXid(place.getFsq_place_id())
                        .orElseGet(() -> {
                            PoiCache p = new PoiCache();
                            p.setXid(place.getFsq_place_id());
                            p.setName(place.getName());
                            p.setDestination(destination);
                            p.setLatitude(place.getLatitude() != null ? place.getLatitude() : 0.0);
                            p.setLongitude(place.getLongitude() != null ? place.getLongitude() : 0.0);
                            p.setRawDataJson(
                                    place.getLocation() != null
                                            && place.getLocation().getFormatted_address() != null
                                            && !place.getLocation().getFormatted_address().isBlank()
                                            ? place.getLocation().getFormatted_address()
                                            : "N/A"
                            );
                            p.setCategories(new HashSet<>());
                            return p;
                        });

                // Adăugăm DOAR tagul categoriei pentru care am făcut fetch
                poi.getCategories().add(category);
                poi.setLastUpdated(LocalDateTime.now());
                poiCacheRepository.save(poi);

            } catch (Exception e) {
                logger.error("Eroare la salvarea POI '{}': {}", place.getName(), e.getMessage());
            }
        }
    }

    // Exact aceeași metodă care funcționa, cu limit parametrizat
    private List<FsqPlace> callNewFsqApi(Destination dest, String categories, int limit) {
        String url = UriComponentsBuilder.fromHttpUrl(FSQ_URL)
                .queryParam("ll", dest.getLatitude() + "," + dest.getLongitude())
                .queryParam("fsq_category_ids", categories)
                .queryParam("radius", 10000)
                .queryParam("fields", "fsq_place_id,name,categories,latitude,longitude,location")
                .queryParam("sort", "popularity")
                .queryParam("limit", limit)
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + foursquareApiKey.trim());
        headers.set("X-Places-Api-Version", "2025-06-17");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        try {
            logger.info("Apel API pentru categorii {}: {}", categories, url);
            ResponseEntity<FsqResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), FsqResponse.class);

            if (response.getBody() != null && response.getBody().getResults() != null) {
                return response.getBody().getResults();
            }
        } catch (Exception e) {
            logger.error("Eroare la apelul Foursquare: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    @Data
    public static class FsqResponse {
        private List<FsqPlace> results;
    }

    @Data
    public static class FsqPlace {
        private String fsq_place_id;
        private String name;
        private List<FsqCategory> categories;
        private Double latitude;
        private Double longitude;
        private FsqLocation location;

        @Data
        public static class FsqCategory {
            private Integer id;
            private String name;
        }

        @Data
        public static class FsqLocation {
            private String formatted_address;
        }
    }
}