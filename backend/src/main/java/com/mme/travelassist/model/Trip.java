package com.mme.travelassist.model;

import com.mme.travelassist.model.enums.Interest;
import com.mme.travelassist.model.enums.TripStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Data
@Table(name = "trips")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User user;

    @ManyToOne
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(nullable = false)
    private Boolean isFlexibleDate;

    @ElementCollection
    private Set<Integer> preferredMonths;

    private LocalDate exactStartDate;
    private LocalDate exactEndDate;

    @Min(value = 1, message = "Trip must last at least 1 day")
    @Max(value = 90, message = "Trip cannot exceed 90 days")
    @Column(nullable = false)
    private Integer durationDays;

    @NotEmpty(message = "Please select at least one interest")
    @ElementCollection(targetClass = Interest.class)
    @Enumerated(EnumType.STRING)
    private Set<Interest> interests;

    @Size(max = 500, message = "Additional preferences text is too long")
    @Column(columnDefinition = "TEXT")
    private String freeTextPreferences;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "trip_pois",
            joinColumns = @JoinColumn(name = "trip_id"),
            inverseJoinColumns = @JoinColumn(name = "poi_id")
    )
    private List<PointOfInterest> pointsOfInterest;

    public Trip(User user, Destination destination, Boolean isFlexibleDate, Set<Integer> monthSet, LocalDate start, LocalDate end, Integer duration, Set<Interest> categorySet, String additionalNotes, TripStatus status, List<PointOfInterest> pois) {
        this.user = user;
        this.destination = destination;
        this.isFlexibleDate = isFlexibleDate;
        this.preferredMonths = monthSet;
        this.exactStartDate = start;
        this.exactEndDate = end;
        this.durationDays = duration;
        this.interests = categorySet;
        this.freeTextPreferences = additionalNotes;
        this.status = status;
        this.pointsOfInterest = pois;
    }
}
