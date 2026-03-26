package com.mme.travelassist.model;

import com.mme.travelassist.model.enums.Interest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Set;
import java.util.UUID;

@Entity
@Data
@Table(name = "destinations")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "City name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Country name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @NotEmpty(message = "Destination must have at least one tag")
    @ElementCollection(targetClass = Interest.class)
    @Enumerated(EnumType.STRING)
    private Set<Interest> interests;

    @NotEmpty(message = "Best months for visiting must be specified")
    @ElementCollection
    private Set<Integer> bestMonths;

    @Column
    private Integer recommendedMinDays;

    @Column
    private Integer recommendedMaxDays;

    @Column
    private Double averageRating;

    @Column(length=1000)
    private String imageUrl;
}
