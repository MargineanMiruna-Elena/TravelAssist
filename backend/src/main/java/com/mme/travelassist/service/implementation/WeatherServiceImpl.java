package com.mme.travelassist.service.implementation;

import com.mme.travelassist.dto.weather.DayWeather;
import com.mme.travelassist.dto.weather.WeatherResponse;
import com.mme.travelassist.exception.trip.TripNotFoundException;
import com.mme.travelassist.model.Trip;
import com.mme.travelassist.repository.TripRepository;
import com.mme.travelassist.service.WeatherService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class WeatherServiceImpl implements WeatherService {

    private static final int FORECAST_LIMIT_DAYS = 16;
    private static final int HISTORY_START_YEAR = 2015;
    private static final int HISTORY_END_YEAR = 2024;

    private static final String FORECAST_URL =
            "https://api.open-meteo.com/v1/forecast" +
                    "?latitude=%s&longitude=%s" +
                    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max" +
                    "&start_date=%s&end_date=%s&timezone=auto";

    private static final String ARCHIVE_URL =
            "https://archive-api.open-meteo.com/v1/archive" +
                    "?latitude=%s&longitude=%s" +
                    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max" +
                    "&start_date=%s&end_date=%s&timezone=auto";

    private final TripRepository tripRepository;
    private final RestTemplate restTemplate;

    @Override
    public WeatherResponse getWeatherForTrip(UUID tripId) throws TripNotFoundException {
        Trip trip = tripRepository.findById(tripId).orElseThrow(TripNotFoundException::new);

        if (trip.getExactStartDate() == null || trip.getExactEndDate() == null)
            throw new IllegalStateException("Trip does not have exact dates set.");

        double lat = trip.getDestination().getLatitude();
        double lon = trip.getDestination().getLongitude();
        LocalDate start = trip.getExactStartDate();
        LocalDate end = trip.getExactEndDate();
        long daysUntilTrip = ChronoUnit.DAYS.between(LocalDate.now(), start);
        boolean isHistorical = daysUntilTrip > FORECAST_LIMIT_DAYS;

        List<DayWeather> days = isHistorical
                ? fetchHistoricalAverage(lat, lon, start, end)
                : fetchForecast(lat, lon, start, end);

        return new WeatherResponse(days, isHistorical);
    }

    private List<DayWeather> fetchForecast(double lat, double lon, LocalDate start, LocalDate end) {
        String url = String.format(FORECAST_URL, lat, lon, start, end);
        Map<String, Object> body = restTemplate.getForObject(url, Map.class);
        return parseDailyResponse(body, start);
    }

    private List<DayWeather> fetchHistoricalAverage(double lat, double lon, LocalDate start, LocalDate end) {
        List<List<DayWeather>> allYears = new ArrayList<>();
        for (int year = HISTORY_START_YEAR; year <= HISTORY_END_YEAR; year++) {
            LocalDate s = start.withYear(year);
            LocalDate e = end.withYear(year);

            if (s.getMonthValue() == 2 && s.getDayOfMonth() == 29 && !s.isLeapYear()) {
                s = s.withDayOfMonth(28);
                e = e.withDayOfMonth(28);
            }

            try {
                String url = String.format(ARCHIVE_URL, lat, lon, s, e);
                Map<String, Object> body = restTemplate.getForObject(url, Map.class);
                allYears.add(parseDailyResponse(body, s));
            } catch (Exception ex) {
            }
        }

        if (allYears.isEmpty())
            throw new RuntimeException("Could not fetch historical weather data.");

        return buildAverages(allYears, start, end);
    }

    private List<DayWeather> buildAverages(List<List<DayWeather>> allYears, LocalDate start, LocalDate end) {
        int dayCount = (int) ChronoUnit.DAYS.between(start, end) + 1;
        List<DayWeather> result = new ArrayList<>();

        for (int i = 0; i < dayCount; i++) {
            final int idx = i;
            List<DayWeather> dayAcrossYears = allYears.stream()
                    .filter(y -> idx < y.size())
                    .map(y -> y.get(idx))
                    .filter(d -> d != null)
                    .toList();

            if (dayAcrossYears.isEmpty()) continue;

            String date = start.plusDays(i).toString();

            int tempMax = (int) Math.round(
                    dayAcrossYears.stream().mapToInt(DayWeather::getTempMax).average().orElse(0));
            int tempMin = (int) Math.round(
                    dayAcrossYears.stream().mapToInt(DayWeather::getTempMin).average().orElse(0));
            double precip = Math.round(
                    dayAcrossYears.stream().mapToDouble(DayWeather::getPrecipitationSum).average().orElse(0) * 10.0) / 10.0;
            int wind = (int) Math.round(
                    dayAcrossYears.stream().mapToInt(DayWeather::getWindspeedMax).average().orElse(0));

            int weatherCode = dayAcrossYears.stream()
                    .collect(Collectors.groupingBy(DayWeather::getWeatherCode, Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(0);

            result.add(new DayWeather(date, tempMax, tempMin, precip, wind, weatherCode));
        }

        return result;
    }

    private List<DayWeather> parseDailyResponse(Map<String, Object> body, LocalDate refStart) {
        Map<String, Object> daily = (Map<String, Object>) body.get("daily");
        List<String> times       = (List<String>) daily.get("time");
        List<Double> maxTemps    = (List<Double>) daily.get("temperature_2m_max");
        List<Double> minTemps    = (List<Double>) daily.get("temperature_2m_min");
        List<Double> precip      = (List<Double>) daily.get("precipitation_sum");
        List<Double> wind        = (List<Double>) daily.get("windspeed_10m_max");
        List<Integer> codes      = (List<Integer>) daily.get("weathercode");

        List<DayWeather> result = new ArrayList<>();
        for (int i = 0; i < times.size(); i++) {
            result.add(new DayWeather(
                    times.get(i),
                    safeRound(maxTemps, i),
                    safeRound(minTemps, i),
                    safeDouble(precip, i),
                    safeRound(wind, i),
                    safeInt(codes, i)
            ));
        }
        return result;
    }

    private int safeRound(List<Double> list, int i) {
        if (list == null || i >= list.size() || list.get(i) == null) return 0;
        return (int) Math.round(list.get(i));
    }

    private double safeDouble(List<Double> list, int i) {
        if (list == null || i >= list.size() || list.get(i) == null) return 0.0;
        return Math.round(list.get(i) * 10.0) / 10.0;
    }

    private int safeInt(List<Integer> list, int i) {
        if (list == null || i >= list.size() || list.get(i) == null) return 0;
        return list.get(i);
    }
}
