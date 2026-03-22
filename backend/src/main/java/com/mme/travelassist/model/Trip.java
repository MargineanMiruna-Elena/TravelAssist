package com.mme.travelassist.model;

import com.mme.travelassist.model.enums.Category;
import com.mme.travelassist.model.enums.TripStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
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
    private boolean isFlexibleDate;

    @ElementCollection
    private Set<Integer> preferredMonths;

    private LocalDate exactStartDate;
    private LocalDate exactEndDate;

    @Min(value = 1, message = "Trip must last at least 1 day")
    @Max(value = 90, message = "Trip cannot exceed 90 days")
    @Column(nullable = false)
    private Integer durationDays;

    @NotEmpty(message = "Please select at least one interest")
    @ElementCollection(targetClass = Category.class)
    @Enumerated(EnumType.STRING)
    private Set<Category> interests;

    @Size(max = 500, message = "Additional preferences text is too long")
    @Column(columnDefinition = "TEXT")
    private String freeTextPreferences;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status;
}
