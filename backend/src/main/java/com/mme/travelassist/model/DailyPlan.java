package com.mme.travelassist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Table(name = "daily_plan")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class DailyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Trip trip;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private Double totalTime;

    @OneToMany(mappedBy = "tripAttraction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripAttraction> tripAttractions;
}
