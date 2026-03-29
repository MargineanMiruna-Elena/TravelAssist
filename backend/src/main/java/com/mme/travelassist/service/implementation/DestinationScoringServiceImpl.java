package com.mme.travelassist.service.implementation;

import com.mme.travelassist.dto.trips.TripPreferencesDTO;
import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.ScoredDestination;
import com.mme.travelassist.model.enums.Continent;
import com.mme.travelassist.model.enums.CountryCode;
import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.service.DestinationScoringService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
public class DestinationScoringServiceImpl implements DestinationScoringService {

    @Override
    public List<ScoredDestination> scoreAndRank(
            List<Destination> candidates,
            TripPreferencesDTO preferences,
            String country) {

        boolean isCountryFiltered = country != null && !country.isBlank();

        // 1. Calculăm scorurile pentru toți candidații
        List<ScoredDestination> allScored = candidates.stream()
                .filter(dest -> !isCountryFiltered || dest.getCountry().equalsIgnoreCase(country.trim()))
                .map(dest -> new ScoredDestination(dest, computeScore(dest, preferences)))
                .sorted(Comparator.comparingDouble(ScoredDestination::score).reversed())
                .toList();

        if (allScored.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Dacă avem filtrare pe țară, returnăm pur și simplu top 20
        if (isCountryFiltered) {
            return allScored.stream().limit(20).toList();
        }

        // 3. Grupăm toate destinațiile pe continente
        Map<Continent, List<ScoredDestination>> byContinent = allScored.stream()
                .collect(Collectors.groupingBy(sd -> getContinentForDestination(sd.destination())));

        // 4. Definim cotele dorite
        Map<Continent, Integer> quotas = Map.of(
                Continent.EUROPE, 6,
                Continent.NORTH_AMERICA, 4,
                Continent.SOUTH_AMERICA, 3,
                Continent.ASIA, 3,
                Continent.AFRICA, 3,
                Continent.OCEANIA, 1
        );

        List<ScoredDestination> finalSelection = new ArrayList<>();

        // 5. Extragem cota pentru fiecare continent
        quotas.forEach((continent, limit) -> {
            List<ScoredDestination> continentList = byContinent.getOrDefault(continent, Collections.emptyList());
            finalSelection.addAll(continentList.stream().limit(limit).toList());
        });

        // 6. Fallback: Dacă nu am adunat destule (ex: nu sunt destule în Africa),
        // completăm cu cele mai bune rămase care nu sunt deja în listă
        if (finalSelection.size() < 20) {
            Set<UUID> alreadyIncluded = finalSelection.stream()
                    .map(sd -> sd.destination().getId())
                    .collect(Collectors.toSet());

            List<ScoredDestination> fillers = allScored.stream()
                    .filter(sd -> !alreadyIncluded.contains(sd.destination().getId()))
                    .limit(20 - finalSelection.size())
                    .toList();

            finalSelection.addAll(fillers);
        }

        // 7. Sortăm lista finală după scor pentru o afișare omogenă
        return finalSelection.stream()
                .sorted(Comparator.comparingDouble(ScoredDestination::score).reversed())
                .toList();
    }

    private double computeScore(Destination dest, TripPreferencesDTO preferences) {
        double interestScore = computeInterestMatch(dest, preferences);   // 0-1
        double seasonScore = computeSeasonMatch(dest, preferences);     // 0-1
        double durationScore = computeDurationFit(dest, preferences);     // 0-1
        double popularityScore = dest.getAverageRating() != null
                ? normalize(dest.getAverageRating(), 1, 5) : 0.5;
        double countryBoost = computeCountryBoost(dest, preferences);    // 0 sau 1

        return 0.40 * interestScore
                + 0.25 * seasonScore
                + 0.20 * durationScore
                + 0.10 * popularityScore
                + 0.05 * countryBoost;
    }

    // --- Interest Match ---
    // Câte interese ale userului sunt acoperite de destinație (Jaccard similarity)
    private double computeInterestMatch(Destination dest, TripPreferencesDTO prefs) {
        if (prefs.getInterests() == null || prefs.getInterests().isEmpty()) return 0.5;

        Set<Interest> userInterests = prefs.getInterests().stream()
                .map(i -> Interest.valueOf(i.toUpperCase()))
                .collect(Collectors.toSet());

        Set<Interest> destInterests = dest.getInterests(); // ce tipuri de activități oferă destinația

        long intersection = userInterests.stream()
                .filter(destInterests::contains)
                .count();

        long union = Stream.concat(userInterests.stream(), destInterests.stream())
                .distinct()
                .count();

        return union == 0 ? 0 : (double) intersection / union;
    }

    // --- Season Match ---
    // Lunile preferate de user se potrivesc cu lunile recomandate ale destinației?
    private double computeSeasonMatch(Destination dest, TripPreferencesDTO prefs) {
        if (prefs.getSelectedMonths() == null || prefs.getSelectedMonths().isEmpty()) return 0.5;

        Set<Integer> userMonths = new HashSet<>(prefs.getSelectedMonths());
        Set<Integer> bestMonths = dest.getBestMonths(); // ex: [6,7,8] pentru destinații de vară

        long overlap = userMonths.stream()
                .filter(bestMonths::contains)
                .count();

        return (double) overlap / userMonths.size();
    }

    // --- Duration Fit ---
    // Durata dorită de user față de durata medie recomandată a destinației
    private double computeDurationFit(Destination dest, TripPreferencesDTO prefs) {
        if (dest.getRecommendedMinDays() == null) return 0.5;

        int userDays = prefs.getDuration();
        int minDays = dest.getRecommendedMinDays();
        int maxDays = dest.getRecommendedMaxDays();

        if (userDays >= minDays && userDays <= maxDays) return 1.0;

        int distance = userDays < minDays
                ? minDays - userDays
                : userDays - maxDays;

        // Penalizare proporțională — scade cu 0.1 per zi de diferență, minim 0
        return Math.max(0.0, 1.0 - (distance * 0.1));
    }

    // --- Country Boost ---
    private double computeCountryBoost(Destination dest, TripPreferencesDTO prefs) {
        if (prefs.getCountry() == null || prefs.getCountry().isEmpty()) return 0.5;
        return dest.getCountry().equalsIgnoreCase(prefs.getCountry()) ? 1.0 : 0.0;
    }

    private double normalize(double value, double min, double max) {
        if (max == min) return 0.5;
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }

    private Continent getContinentForDestination(Destination dest) {
        CountryCode countryCode = CountryCode.fromName(dest.getCountry());
        return countryCode != null ? countryCode.getContinent() : null;
    }
}

