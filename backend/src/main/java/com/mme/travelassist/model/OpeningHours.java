package com.mme.travelassist.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "poi_opening_hours")
public class OpeningHours {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "poi_id")
    private PointOfInterest poi;

    private int dayOfWeek;
    private LocalTime openTime;
    private LocalTime closeTime;
}
