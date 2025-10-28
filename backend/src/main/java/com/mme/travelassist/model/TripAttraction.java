package com.mme.travelassist.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Table(name = "trip_attractions")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TripAttraction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Attraction attraction;

    @Column(nullable = false)
    @NotBlank(message = "VisitPreference must not be blank")
    private String visitPreference;

    @Column(nullable = false)
    private LocalDate plannedDate;
}
