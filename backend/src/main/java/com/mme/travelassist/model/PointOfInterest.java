package com.mme.travelassist.model;

import com.mme.travelassist.model.enums.Interest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.*;

@Entity
@Data
@Table(name = "points_of_interest")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String xid;

    @NotBlank(message = "Place name cannot be blank")
    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "poi_interests",
            joinColumns = @JoinColumn(name = "poi_id")
    )
    @Column(name = "interest")
    @Enumerated(EnumType.STRING)
    private Set<Interest> interests = new HashSet<>();

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "category")
    private String category;

    @Column(name = "website")
    private String website;
}
