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
import java.util.List;
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

    @Column(nullable = false)
    @NotBlank(message = "City must not be blank")
    private String city;

    @Column(nullable = false)
    @NotBlank(message = "Country must not be blank")
    private String country;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    @NotBlank(message = "Description must not be blank")
    private String description;

    @OneToMany(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DailyPlan> dailyPlans;
}
