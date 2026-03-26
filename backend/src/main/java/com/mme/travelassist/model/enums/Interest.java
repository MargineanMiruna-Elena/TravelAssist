package com.mme.travelassist.model.enums;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;

public enum Interest {

    BEACH(Set.of(6, 7, 8), 5, 14,
            "beach", "bathing area", "bay", "waterfall"),

    NATURE(Set.of(4, 5, 6, 9, 10), 3, 10,
            "botanical garden", "garden", "hiking trail", "lake", "mountain", "park", "river", "rock climbing spot", "volcano", "waterfall"),

    ADVENTURE(Set.of(5, 6, 7, 8, 9), 4, 12,
            "amusement park", "aquarium", "arcade", "carnival", "stadium", "water park", "bike rental", "boat rental", "cruise", "hot air balloon"),

    HISTORY(Set.of(3, 4, 5, 9, 10, 11), 2, 7,
            "historic and protected site", "history museum", "castle", "ruin", "monument", "memorial site", "palace"),

    CULTURE(Set.of(3, 4, 5, 9, 10, 11), 2, 6,
            "art gallery", "museum", "opera house", "theater", "street art", "spiritual center", "palace"),

    CITY_BREAK(Set.of(3, 4, 5, 9, 10), 2, 5,
            "bridge", "canal", "castle", "fountain", "garden", "historic and protected site", "lake", "lighthouse", "memorial site", "monument", "palace", "park", "plaza", "river", "scenic lookout", "sculpture garden"),

    SHOPPING(Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), 2, 5,
            "marketplace", "shopping mall", "department store", "boutique"),

    GASTRONOMY(Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), 2, 5,
            "restaurant", "gelato shop", "pastry shop"),

    NIGHTLIFE(Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), 2, 4,
            "nightlife spot", "bar", "night club", "casino"),

    FAMILY_FRIENDLY(Set.of(6, 7, 8, 12), 4, 10,
            "amusement park", "aquarium", "arcade", "carnival", "circus", "planetarium", "pool hall", "water park", "zoo", "park", "playground");

    private final Set<Integer> bestMonths;
    private final int minDays;
    private final int maxDays;
    private final Set<String> keywords;

    Interest(Set<Integer> bestMonths, int minDays, int maxDays, String... keywords) {
        this.bestMonths = Collections.unmodifiableSet(bestMonths);
        this.minDays = minDays;
        this.maxDays = maxDays;
        this.keywords = Set.of(keywords);
    }

    public Set<Integer> getBestMonths() { return bestMonths; }
    public int getMinDays() { return minDays; }
    public int getMaxDays() { return maxDays; }

    public static Interest fromKind(String kind) {
        if (kind == null || kind.isBlank()) return null;

        String normalizedKind = kind.toLowerCase();

        return Arrays.stream(values())
                .filter(interest -> interest.keywords.stream()
                        .anyMatch(normalizedKind::contains))
                .findFirst()
                .orElse(null);
    }
}