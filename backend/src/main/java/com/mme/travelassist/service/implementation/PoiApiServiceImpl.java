package com.mme.travelassist.service.implementation;

import com.mme.travelassist.client.WikipediaImageClient;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PointOfInterest;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.repository.PointOfInterestRepository;
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

import java.util.*;

@Service
@RequiredArgsConstructor
public class PoiApiServiceImpl implements PoiApiService {

    @Value("${foursquare.service.key.3}")
    private String foursquareApiKey;

    private final WikipediaImageClient wikipediaImageClient;
    private final PointOfInterestRepository pointOfInterestRepository;
    private final RestTemplate restTemplate;

    private static final Logger logger = LoggerFactory.getLogger(PoiApiServiceImpl.class);
    private static final String FSQ_URL = "https://places-api.foursquare.com/places/search";
    private static final int TOTAL_LIMIT = 30;

    private static final Map<Interest, String> CATEGORY_MAP = Map.ofEntries(
            Map.entry(Interest.CULTURE,         "4bf58dd8d48988d137941735,4bf58dd8d48988d136941735,4bf58dd8d48988d1e2931735,4bf58dd8d48988d181941735,52e81612bcbc57f1066b79ee,4bf58dd8d48988d131941735,52e81612bcbc57f1066b7a14"),
            Map.entry(Interest.BEACH,           "52e81612bcbc57f1066b7a28,56aa371be4b08b9a8d573544,4bf58dd8d48988d1e2941735,56aa371be4b08b9a8d573560"),
            Map.entry(Interest.NATURE,          "52e81612bcbc57f1066b7a22,4bf58dd8d48988d15a941735,4bf58dd8d48988d159941735,4bf58dd8d48988d161941735,4eb1d4d54b900d56c88a45fc,4bf58dd8d48988d163941735,4eb1d4dd4b900d56c88a45fd,50328a4b91d4c4b30a586d6b,5032848691d4c4b30a586d61,56aa371be4b08b9a8d573560"),
            Map.entry(Interest.NIGHTLIFE,       "4bf58dd8d48988d17c941735,4bf58dd8d48988d116941735,4bf58dd8d48988d11f941735,4d4b7105d754a06376d81259"),
            Map.entry(Interest.GASTRONOMY,      "4d4b7105d754a06374d81259,5f2c407c5b4c177b9a6dc536,5744ccdfe4b0c0459246b4e2"),
            Map.entry(Interest.HISTORY,         "4deefb944765f83613cdba6e,5642206c498e4bfca532186c,4bf58dd8d48988d12d941735,4bf58dd8d48988d190941735,50aaa49e4b90af0d42d5de11,52e81612bcbc57f1066b7a14"),
            Map.entry(Interest.SHOPPING,        "4bf58dd8d48988d1f6941735,4bf58dd8d48988d1fd941735,4bf58dd8d48988d104951735,63be6904847c3692a84b9bb8"),
            Map.entry(Interest.ADVENTURE,       "4bf58dd8d48988d182941735,4fceea171983d5d06c3e9823,4bf58dd8d48988d1e1931735,63be6904847c3692a84b9b21,4bf58dd8d48988d184941735,4bf58dd8d48988d193941735,4e4c9077bd41f78e849722f9,5744ccdfe4b0c0459246b4c1,55077a22498e5e9248869ba2,63be6904847c3692a84b9c24"),
            Map.entry(Interest.FAMILY_FRIENDLY, "4bf58dd8d48988d182941735,4fceea171983d5d06c3e9823,4bf58dd8d48988d1e1931735,63be6904847c3692a84b9b21,52e81612bcbc57f1066b79e7,4bf58dd8d48988d192941735,4bf58dd8d48988d1e3931735,4bf58dd8d48988d193941735,4bf58dd8d48988d17b941735,4bf58dd8d48988d163941735,4bf58dd8d48988d1e7941735"),
            Map.entry(Interest.CITY_BREAK,      "4bf58dd8d48988d1df941735,56aa371be4b08b9a8d573562,50aaa49e4b90af0d42d5de11,56aa371be4b08b9a8d573547,4bf58dd8d48988d15a941735,4deefb944765f83613cdba6e,4bf58dd8d48988d161941735,4bf58dd8d48988d15d941735,5642206c498e4bfca532186c,4bf58dd8d48988d12d941735,52e81612bcbc57f1066b7a14,4bf58dd8d48988d163941735,52e81612bcbc57f1066b7a25,4bf58dd8d48988d164941735,4eb1d4dd4b900d56c88a45fd,4bf58dd8d48988d165941735,4bf58dd8d48988d166941735")
    );

    @Override
    @Transactional
    public List<PointOfInterest> fetchAttractionsByDestination(Destination destination,
                                                               List<Interest> userInterests) {
        if (userInterests == null || userInterests.isEmpty()) {
            userInterests = List.of(Interest.CULTURE, Interest.CITY_BREAK);
        }

        int slotPerCategory = TOTAL_LIMIT / userInterests.size();
        logger.info("Destination: {}, Interests: {}, Slot/interest: {}",
                destination.getName(), userInterests, slotPerCategory);

        List<PointOfInterest> finalResult = new ArrayList<>();
        Set<UUID> addedIds = new HashSet<>();

        for (Interest interest : userInterests) {

            List<PointOfInterest> inDb = pointOfInterestRepository.findByDestinationAndCategory(destination, interest);
            logger.info("DB: {} POIs with category {} for {}", inDb.size(), interest, destination.getName());

            if (inDb.size() < slotPerCategory) {
                logger.info("Missing {} POIs for {}. Fetch API...", slotPerCategory - inDb.size(), interest);
                fetchAndSave(destination, interest, slotPerCategory);
                inDb = pointOfInterestRepository.findByDestinationAndCategory(destination, interest);
                logger.info("After fetch: {} POIs with category {} in DB", inDb.size(), interest, destination.getName());
            }

            int added = 0;
            inDb.sort(Comparator.comparingInt((PointOfInterest poi) -> {
                boolean hasImage = poi.getImageUrl() != null && !poi.getImageUrl().isBlank();
                boolean hasWebsite = poi.getWebsite() != null && !poi.getWebsite().isBlank();
                if (hasImage && hasWebsite) return 0;
                if (hasWebsite) return 1;
                return 2;
            }));
            for (PointOfInterest poi : inDb) {
                if (added >= slotPerCategory) break;
                if (addedIds.contains(poi.getId())) continue;
                finalResult.add(poi);
                addedIds.add(poi.getId());
                added++;
            }
        }

        logger.info("Total retrieved: {} POIs for {}", finalResult.size(), destination.getName());
        return finalResult;
    }

    private void fetchAndSave(Destination destination, Interest interest, int limit) {
        String fsqIds = CATEGORY_MAP.get(interest);
        int saved = 0;

        if (fsqIds == null) {
            logger.warn("No FSQ mapping for interest {}", interest);
            return;
        }

        List<FsqPlace> apiResults = callNewFsqApi(destination, fsqIds, limit + 10);
        logger.info("API returned {} results for {}", apiResults.size(), interest);

        for (FsqPlace place : apiResults) {
            if (saved >= limit) break;
            if (place.getFsq_place_id() == null || place.getName() == null) continue;

            if (isFastFood(place)) {
                logger.debug("Skipped fast food: {}", place.getName());
                continue;
            }

            if (place.getLocation().getFormatted_address() == null || place.getLocation().getFormatted_address().isEmpty()) {
                logger.debug("Skipped for no address: {}", place.getName());
                continue;
            }

            try {
                PointOfInterest poi = pointOfInterestRepository.findByXid(place.getFsq_place_id())
                        .orElseGet(() -> {
                            PointOfInterest p = new PointOfInterest();
                            p.setXid(place.getFsq_place_id());
                            p.setName(place.getName());
                            p.setDestination(destination);
                            p.setLatitude(place.getLatitude() != null ? place.getLatitude() : 0.0);
                            p.setLongitude(place.getLongitude() != null ? place.getLongitude() : 0.0);
                            p.setAddress(place.getLocation() != null ? place.getLocation().getFormatted_address() : "N/A");
                            p.setInterests(new HashSet<>());
                            p.setImageUrl(
                                    wikipediaImageClient.getImageUrlForPoi(
                                            place.getName(),
                                            destination.getName(),
                                            destination.getCountry()
                                    )
                            );
                            p.setCategory(extractCategory(place));
                            p.setWebsite(place.getWebsite());
                            return p;
                        });

                poi.getInterests().add(interest);
                pointOfInterestRepository.save(poi);

            } catch (Exception e) {
                logger.error("Error saving POI '{}': {}", place.getName(), e.getMessage());
            }
        }
    }

    private List<FsqPlace> callNewFsqApi(Destination dest, String categories, int limit) {
        String url = UriComponentsBuilder.fromHttpUrl(FSQ_URL)
                .queryParam("ll", dest.getLatitude() + "," + dest.getLongitude())
                .queryParam("fsq_category_ids", categories)
                .queryParam("radius", 10000)
                .queryParam("fields", "fsq_place_id,name,categories,latitude,longitude,location,website")
                .queryParam("sort", "popularity")
                .queryParam("limit", limit)
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + foursquareApiKey.trim());
        headers.set("X-Places-Api-Version", "2025-06-17");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        try {
            logger.info("API call for categories {}: {}", categories, url);
            ResponseEntity<FsqResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), FsqResponse.class);

            if (response.getBody() != null && response.getBody().getResults() != null) {
                return response.getBody().getResults();
            }
        } catch (Exception e) {
            logger.error("Error calling Foursquare: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    private String extractCategory(FsqPlace place) {
        if (place.getCategories() == null || place.getCategories().isEmpty()) return "";

        return place.getCategories().get(0).getName();
    }

    private boolean isFastFood(FsqPlace place) {
        if (place.getCategories() == null) return false;

        return place.getCategories().stream()
                .map(c -> c.getName().toLowerCase())
                .anyMatch(name -> name.contains("fast food"));
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
        private String website;

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