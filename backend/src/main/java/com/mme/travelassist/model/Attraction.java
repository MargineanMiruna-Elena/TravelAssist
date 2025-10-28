package com.mme.travelassist.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "attractions")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    @NotBlank(message = "Name must not be blank")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "City must not be blank")
    private String city;

    @Column(nullable = false)
    @NotBlank(message = "Country must not be blank")
    private String country;

    @Column(nullable = false)
    @NotBlank(message = "Address must not be blank")
    private String address;

    @Column(nullable = false)
    @NotBlank(message = "Category must not be blank")
    private String category;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double durationToVisit;

    @Column(nullable = false)
    private LocalTime openingTime;

    @Column(nullable = false)
    private LocalTime closingTime;

    @Column(nullable = false)
    private int crowdedness;

    @Column(nullable = false)
    @NotBlank(message = "WeatherSuitable must not be blank")
    private String weatherSuitable;

    @Column(nullable = false)
    @NotBlank(message = "Description must not be blank")
    private String description;
}
