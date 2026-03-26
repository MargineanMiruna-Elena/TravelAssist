package com.mme.travelassist.service.implementation;

import com.mme.travelassist.client.FoursquareClient;
import com.mme.travelassist.client.GooglePlacesClient;
import com.mme.travelassist.dto.trips.GeoDbCityDTO;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.service.DestinationSyncService;
import com.mme.travelassist.client.WikipediaImageClient;
import com.mme.travelassist.client.GeoDbCitiesClient;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DestinationSyncServiceImpl implements DestinationSyncService {

    private final GeoDbCitiesClient geoDbCitiesClient;
    private final FoursquareClient foursquareClient;
    private final WikipediaImageClient wikipediaImageClient;
    private final GooglePlacesClient googlePlacesClient;
    private final DestinationRepository destinationRepository;

    @Override
    public Destination findOrCreateDestination(String cityName, String countryName) {
        log.debug("'{}' not found in DB, searching in GeoDB...", cityName);
        GeoDbCityDTO geoCity;

        if (countryName.isEmpty() || countryName == null) {
            geoCity = geoDbCitiesClient.getCityByName(cityName);
        } else {
            geoCity = geoDbCitiesClient.getCityByNameAndCountry(cityName, countryName);
        }

        if (geoCity == null) {
            log.debug("'{}' not found in GeoDB", cityName);
            return null;
        }

        String imageUrl = wikipediaImageClient.getImageUrlForCity(geoCity.getName(), geoCity.getCountry());
        if (imageUrl == null) {
            log.debug("No image on Wikipedia for '{}'", geoCity.getName());
            return null;
        }

        Set<Interest> tags = resolveCategories(foursquareClient.getCityData(
                geoCity.getLatitude(), geoCity.getLongitude()));
        Double averageRating = googlePlacesClient.getAverageRatingForCity(
                geoCity.getLatitude(), geoCity.getLongitude());

        if (tags.isEmpty()) {
            log.debug("No Interest mapped for '{}', fallback CITY_BREAK", geoCity.getName());
            tags.add(Interest.CITY_BREAK);
        }
        Set<Integer> bestMonths = resolveBestMonths(tags);

        Destination destination = buildDestination(geoCity, tags, bestMonths, averageRating);
        destination.setImageUrl(imageUrl);
        destinationRepository.save(destination);
        log.info("New destination saved: '{}' ({})", geoCity.getName(), geoCity.getCountry());

        return destination;
    }

    @Override
    public void syncImages() {
        List<Destination> withoutImage = destinationRepository.findByImageUrlIsNull();
        log.info("Sync images: {} destinations without", withoutImage.size());

        int updated = 0;
        for (Destination dest : withoutImage) {
            String imageUrl = wikipediaImageClient.getImageUrlForCity(dest.getName(), dest.getCountry());
            if (imageUrl == null) {
                log.debug("Skipped '{}' - no image found on Wikipedia", dest.getName());
                continue;
            }
            dest.setImageUrl(imageUrl);
            destinationRepository.save(dest);
            updated++;
            log.debug("Image updated for '{}'", dest.getName());
        }

        log.info("Sync images finished. Updated: {}/{}", updated, withoutImage.size());

    }

    public void syncDestinations() {
        log.info("Start destination sync...");

        List<GeoDbCityDTO> cities = geoDbCitiesClient.getCities();
        log.info("GeoDB: {} retrieved cities", cities.size());

        int saved = 0;
        int skipped = 0;

        for (GeoDbCityDTO city : cities) {
            String cleanedCityName = cleanCityName(city.getName());
            city.setName(cleanedCityName);

            if (destinationRepository.existsByName(cleanedCityName)) {
                skipped++;
                continue;
            }

            Set<Interest> interests = resolveCategories(foursquareClient.getCityData(
                    city.getLatitude(), city.getLongitude()));
            Double averageRating = googlePlacesClient.getAverageRatingForCity(
                    city.getLatitude(), city.getLongitude());

            if (interests.isEmpty()) {
                log.debug("No interest mapped for '{}', fallback CITY_BREAK", city.getName());
                interests.add(Interest.CITY_BREAK);
            }

            Set<Integer> bestMonths = resolveBestMonths(interests);

            String imageUrl = wikipediaImageClient.getImageUrlForCity(city.getName(), city.getCountry());
            if (imageUrl == null) {
                log.debug("Skipped '{}'no image found on Wikipedia", city.getName());
                skipped++;
                continue;
            }

            Destination destination = buildDestination(city, interests, bestMonths, averageRating);
            destination.setImageUrl(imageUrl);
            destinationRepository.save(destination);
            saved++;
            log.debug("Saved: {} ({}) - interests: {}", city.getName(), city.getCountry(), interests);
        }

        log.info("Sync finished. Saved: {}, Skipped (already existed): {}", saved, skipped);
    }

    private Destination buildDestination(GeoDbCityDTO city,
                                         Set<Interest> tags,
                                         Set<Integer> bestMonths,
                                         Double averageRating) {
        Destination dest = new Destination();
        dest.setName(city.getName());
        dest.setCountry(city.getCountry());
        dest.setLatitude(city.getLatitude());
        dest.setLongitude(city.getLongitude());
        dest.setInterests(tags);
        dest.setBestMonths(bestMonths);
        dest.setRecommendedMinDays(resolveMinDays(tags));
        dest.setRecommendedMaxDays(resolveMaxDays(tags));
        dest.setAverageRating(averageRating);
        return dest;
    }

    private Set<Interest> resolveCategories(Set<String> kinds) {
        return kinds.stream()
                .map(Interest::fromKind)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Set<Integer> resolveBestMonths(Set<Interest> tags) {
        return tags.stream()
                .flatMap(tag -> tag.getBestMonths().stream())
                .collect(Collectors.toSet());
    }

    private int resolveMinDays(Set<Interest> tags) {
        return tags.stream()
                .mapToInt(Interest::getMinDays)
                .max()
                .orElse(2);
    }

    private int resolveMaxDays(Set<Interest> tags) {
        return tags.stream()
                .mapToInt(Interest::getMaxDays)
                .max()
                .orElse(7);
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