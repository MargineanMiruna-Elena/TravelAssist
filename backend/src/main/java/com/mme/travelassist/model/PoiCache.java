package com.mme.travelassist.model;

import com.mme.travelassist.model.enums.Category;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "poi_caches")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PoiCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private String rawDataJson;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "poi_categories",
            joinColumns = @JoinColumn(name = "poi_id")
    )
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private Set<Category> categories = new HashSet<>();
}
