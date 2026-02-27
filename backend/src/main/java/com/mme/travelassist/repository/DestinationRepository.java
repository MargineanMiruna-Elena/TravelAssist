package com.mme.travelassist.repository;

import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface DestinationRepository extends JpaRepository<Destination, UUID> {
    Optional<Destination> findByNameIgnoreCase(String name);
    List<Destination> findByNameContainingIgnoreCaseOrderByNameAsc(String name);
    Boolean existsByLocalName(String localName);
    List<Destination> findByImageUrlIsNull();

    @Query("SELECT DISTINCT d FROM Destination d " +
            "LEFT JOIN d.bestMonths m " +
            "LEFT JOIN d.tags t " +
            "WHERE ((:months) IS NULL OR m IN :months) " +
            "AND ((:tags) IS NULL OR t IN :tags)")
    List<Destination> findByPreferences(
            @Param("months") Collection<Integer> months,
            @Param("tags") Collection<Category> tags
    );

    @Query("SELECT DISTINCT d.country FROM Destination d WHERE LOWER(d.country) LIKE LOWER(CONCAT('%', :country, '%')) ORDER BY d.country ASC")
    List<String> findDistinctCountriesByNameContaining(@Param("country") String country);
}
