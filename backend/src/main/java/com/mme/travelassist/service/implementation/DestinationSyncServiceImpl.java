package com.mme.travelassist.service.implementation;

import com.mme.travelassist.dto.trips.GeoDbCityDTO;
import com.mme.travelassist.service.DestinationSyncService;
import com.mme.travelassist.utils.OpenTripMapClient;
import com.mme.travelassist.utils.WikipediaImageClient;
import com.mme.travelassist.utils.GeoDbCitiesClient;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.enums.Category;
import com.mme.travelassist.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DestinationSyncServiceImpl implements DestinationSyncService {

    private final GeoDbCitiesClient geoDbCitiesClient;
    private final OpenTripMapClient openTripMapClient;
    private final DestinationRepository destinationRepository;
    private final WikipediaImageClient wikipediaImageClient;

    private static final Map<String, Category> KIND_TO_CATEGORY = new HashMap<>();

    static {
        // BEACH
        KIND_TO_CATEGORY.put("beaches", Category.BEACH);
        KIND_TO_CATEGORY.put("water_parks", Category.BEACH);
        KIND_TO_CATEGORY.put("dive_sites", Category.BEACH);

        // NATURE
        KIND_TO_CATEGORY.put("natural", Category.NATURE);
        KIND_TO_CATEGORY.put("nature_reserves", Category.NATURE);
        KIND_TO_CATEGORY.put("national_parks", Category.NATURE);
        KIND_TO_CATEGORY.put("geological_formations", Category.NATURE);
        KIND_TO_CATEGORY.put("waterfalls", Category.NATURE);
        KIND_TO_CATEGORY.put("caves", Category.NATURE);
        KIND_TO_CATEGORY.put("forests", Category.NATURE);
        KIND_TO_CATEGORY.put("lakes", Category.NATURE);
        KIND_TO_CATEGORY.put("rivers", Category.NATURE);
        KIND_TO_CATEGORY.put("islands", Category.NATURE);
        KIND_TO_CATEGORY.put("volcanoes", Category.NATURE);
        KIND_TO_CATEGORY.put("glaciers", Category.NATURE);

        // ADVENTURE
        KIND_TO_CATEGORY.put("amusements", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("sport", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("water_sports", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("mountaineering", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("climbing", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("paragliding", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("bungee_jumping", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("off_road", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("hiking", Category.ADVENTURE);
        KIND_TO_CATEGORY.put("ski_sport", Category.ADVENTURE);

        // HISTORY
        KIND_TO_CATEGORY.put("historic", Category.HISTORY);
        KIND_TO_CATEGORY.put("archaeology", Category.HISTORY);
        KIND_TO_CATEGORY.put("fortifications", Category.HISTORY);
        KIND_TO_CATEGORY.put("castles", Category.HISTORY);
        KIND_TO_CATEGORY.put("ruins", Category.HISTORY);
        KIND_TO_CATEGORY.put("battlefields", Category.HISTORY);
        KIND_TO_CATEGORY.put("monuments", Category.HISTORY);
        KIND_TO_CATEGORY.put("memorials", Category.HISTORY);
        KIND_TO_CATEGORY.put("palaces", Category.HISTORY);

        // CULTURE
        KIND_TO_CATEGORY.put("cultural", Category.CULTURE);
        KIND_TO_CATEGORY.put("museums", Category.CULTURE);
        KIND_TO_CATEGORY.put("theatres_and_entertainments", Category.CULTURE);
        KIND_TO_CATEGORY.put("art_galleries", Category.CULTURE);
        KIND_TO_CATEGORY.put("music", Category.CULTURE);
        KIND_TO_CATEGORY.put("opera", Category.CULTURE);
        KIND_TO_CATEGORY.put("religion", Category.CULTURE);
        KIND_TO_CATEGORY.put("churches", Category.CULTURE);
        KIND_TO_CATEGORY.put("temples", Category.CULTURE);
        KIND_TO_CATEGORY.put("mosques", Category.CULTURE);
        KIND_TO_CATEGORY.put("festivals", Category.CULTURE);
        KIND_TO_CATEGORY.put("architecture", Category.CULTURE);

        // CITY_BREAK
        KIND_TO_CATEGORY.put("urban_environment", Category.CITY_BREAK);
        KIND_TO_CATEGORY.put("interesting_places", Category.CITY_BREAK);
        KIND_TO_CATEGORY.put("public_spaces", Category.CITY_BREAK);
        KIND_TO_CATEGORY.put("viewpoints", Category.CITY_BREAK);

        // SHOPPING
        KIND_TO_CATEGORY.put("shops", Category.SHOPPING);
        KIND_TO_CATEGORY.put("markets", Category.SHOPPING);
        KIND_TO_CATEGORY.put("malls", Category.SHOPPING);
        KIND_TO_CATEGORY.put("department_stores", Category.SHOPPING);

        // GASTRONOMY
        KIND_TO_CATEGORY.put("foods", Category.GASTRONOMY);
        KIND_TO_CATEGORY.put("restaurants", Category.GASTRONOMY);
        KIND_TO_CATEGORY.put("cafes", Category.GASTRONOMY);
        KIND_TO_CATEGORY.put("street_food", Category.GASTRONOMY);
        KIND_TO_CATEGORY.put("breweries", Category.GASTRONOMY);
        KIND_TO_CATEGORY.put("wineries", Category.GASTRONOMY);

        // NIGHTLIFE
        KIND_TO_CATEGORY.put("nightlife", Category.NIGHTLIFE);
        KIND_TO_CATEGORY.put("bars", Category.NIGHTLIFE);
        KIND_TO_CATEGORY.put("clubs", Category.NIGHTLIFE);
        KIND_TO_CATEGORY.put("casinos", Category.NIGHTLIFE);

        // FAMILY_FRIENDLY
        KIND_TO_CATEGORY.put("zoos", Category.FAMILY_FRIENDLY);
        KIND_TO_CATEGORY.put("aquariums", Category.FAMILY_FRIENDLY);
        KIND_TO_CATEGORY.put("theme_parks", Category.FAMILY_FRIENDLY);
        KIND_TO_CATEGORY.put("playgrounds", Category.FAMILY_FRIENDLY);
        KIND_TO_CATEGORY.put("children_museums", Category.FAMILY_FRIENDLY);
        KIND_TO_CATEGORY.put("circuses", Category.FAMILY_FRIENDLY);
    }

    private static final Map<Category, Set<Integer>> CATEGORY_BEST_MONTHS = new EnumMap<>(Category.class);

    static {
        CATEGORY_BEST_MONTHS.put(Category.BEACH, Set.of(6, 7, 8));
        CATEGORY_BEST_MONTHS.put(Category.NATURE, Set.of(4, 5, 6, 9, 10));
        CATEGORY_BEST_MONTHS.put(Category.ADVENTURE, Set.of(5, 6, 7, 8, 9));
        CATEGORY_BEST_MONTHS.put(Category.HISTORY, Set.of(3, 4, 5, 9, 10, 11));
        CATEGORY_BEST_MONTHS.put(Category.CULTURE, Set.of(3, 4, 5, 9, 10, 11));
        CATEGORY_BEST_MONTHS.put(Category.CITY_BREAK, Set.of(3, 4, 5, 9, 10));
        CATEGORY_BEST_MONTHS.put(Category.SHOPPING, Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));
        CATEGORY_BEST_MONTHS.put(Category.GASTRONOMY, Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));
        CATEGORY_BEST_MONTHS.put(Category.NIGHTLIFE, Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));
        CATEGORY_BEST_MONTHS.put(Category.FAMILY_FRIENDLY, Set.of(6, 7, 8, 12));
    }

    @Override
    public Destination findOrCreateDestination(String cityName) {
        log.debug("'{}' nu există în DB, caut în GeoDB...", cityName);
        GeoDbCityDTO geoCity = geoDbCitiesClient.getCityByName(cityName);
        if (geoCity == null) {
            log.debug("'{}' nu a fost găsit în GeoDB", cityName);
            return null;
        }

        // 3. Fetchează imagine din Wikipedia
        String imageUrl = wikipediaImageClient.getImageUrlForCity(geoCity.getName(), geoCity.getCountry());
        if (imageUrl == null) {
            log.debug("Nicio imagine Wikipedia pentru '{}'", geoCity.getName());
            return null;
        }

        // 4. Determină categorii și luni exact ca în syncDestinations
        Set<String> kinds = openTripMapClient.getKindsForCity(geoCity.getLatitude(), geoCity.getLongitude());
        Set<Category> tags = resolveCategories(kinds);
        if (tags.isEmpty()) {
            log.debug("Niciun kind mapat pentru '{}', fallback CITY_BREAK", geoCity.getName());
            tags.add(Category.CITY_BREAK);
        }
        Set<Integer> bestMonths = resolveBestMonths(tags);

        // 5. Salvează în DB
        Destination destination = buildDestination(geoCity, tags, bestMonths);
        destination.setImageUrl(imageUrl);
        destinationRepository.save(destination);
        log.info("Destinație nouă salvată: '{}' ({})", geoCity.getName(), geoCity.getCountry());

        return destination;
    }

    @Override
    public void syncImages() {
        List<Destination> withoutImage = destinationRepository.findByImageUrlIsNull();
        log.info("Sync imagini: {} destinații fără imagine", withoutImage.size());

        int updated = 0;
        for (Destination dest : withoutImage) {
            String imageUrl = wikipediaImageClient.getImageUrlForCity(dest.getName(), dest.getCountry());
            if (imageUrl == null) {
                log.debug("Sărit '{}' — nicio imagine Wikipedia găsită", dest.getName());
                continue;
            }
            dest.setImageUrl(imageUrl);
            destinationRepository.save(dest);
            updated++;
            log.debug("Imagine actualizată pentru '{}'", dest.getName());
        }

        log.info("Sync imagini finalizat. Actualizate: {}/{}", updated, withoutImage.size());

    }

    public void syncDestinations() {
        log.info("Începe sincronizarea destinațiilor...");

        List<GeoDbCityDTO> cities = geoDbCitiesClient.getCities();
        log.info("GeoDB: {} orașe primite", cities.size());

        int saved = 0;
        int skipped = 0;

        for (GeoDbCityDTO city : cities) {
            String cleanedCityName = cleanCityName(city.getName());
            city.setName(cleanedCityName);

            if (destinationRepository.existsByLocalName(cleanedCityName)) {
                skipped++;
                continue;
            }

            Set<String> kinds = openTripMapClient.getKindsForCity(city.getLatitude(), city.getLongitude());

            Set<Category> tags = resolveCategories(kinds);
            if (tags.isEmpty()) {
                log.debug("Niciun kind mapat pentru '{}', fallback CITY_BREAK", city.getName());
                tags.add(Category.CITY_BREAK);
            }

            Set<Integer> bestMonths = resolveBestMonths(tags);

            String imageUrl = wikipediaImageClient.getImageUrlForCity(city.getName(), city.getCountry());
            if (imageUrl == null) {
                log.debug("Sărit '{}' — nicio pagină Wikipedia găsită", city.getName());
                skipped++;
                continue;
            }

            Destination destination = buildDestination(city, tags, bestMonths);
            destination.setImageUrl(imageUrl);
            destinationRepository.save(destination);
            saved++;
            log.debug("Salvat: {} ({}) — tags: {}", city.getName(), city.getCountry(), tags);
        }

        log.info("Sincronizare finalizată. Salvate: {}, Sărite (deja existente): {}", saved, skipped);
    }

    private Destination buildDestination(GeoDbCityDTO city,
                                         Set<Category> tags,
                                         Set<Integer> bestMonths) {
        Destination dest = new Destination();
        dest.setLocalName(city.getName());
        dest.setName(city.getName());
        dest.setCountry(city.getCountry());
        dest.setLatitude(city.getLatitude());
        dest.setLongitude(city.getLongitude());
        dest.setTags(tags);
        dest.setBestMonths(bestMonths);
        return dest;
    }

    private Set<Category> resolveCategories(Set<String> kinds) {
        Set<Category> result = new HashSet<>();
        for (String kind : kinds) {
            Category cat = KIND_TO_CATEGORY.get(kind);
            if (cat != null) result.add(cat);
        }
        return result;
    }

    private Set<Integer> resolveBestMonths(Set<Category> tags) {
        Set<Integer> months = new HashSet<>();
        for (Category tag : tags) {
            Set<Integer> m = CATEGORY_BEST_MONTHS.get(tag);
            if (m != null) months.addAll(m);
        }
        return months;
    }

    private String cleanCityName(String cityName) {
        return cityName
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
    }
}