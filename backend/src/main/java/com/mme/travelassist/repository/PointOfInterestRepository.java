package com.mme.travelassist.repository;

import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PointOfInterest;
import com.mme.travelassist.model.enums.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PointOfInterestRepository extends JpaRepository<PointOfInterest, UUID> {
    List<PointOfInterest> findByDestination(Destination destination);
    Optional<PointOfInterest> findByXid(String xid);
    boolean existsByXid(String xid);

    @Query("""
        SELECT DISTINCT p FROM PointOfInterest p
        JOIN p.interests c
        WHERE p.destination = :destination
          AND c = :interest
        ORDER BY p.id ASC
        """)
    List<PointOfInterest> findByDestinationAndCategory(
            @Param("destination") Destination destination,
            @Param("interest") Interest interest
    );
}
