package com.mme.travelassist.repository;

import com.mme.travelassist.model.Destination;
import com.mme.travelassist.model.PoiCache;
import com.mme.travelassist.model.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface PoiCacheRepository extends JpaRepository<PoiCache, UUID> {
    List<PoiCache> findByDestination(Destination destination);
    Optional<PoiCache> findByXid(String xid);
    boolean existsByXid(String xid);

    @Query("""
        SELECT DISTINCT p FROM PoiCache p
        JOIN p.categories c
        WHERE p.destination = :destination
          AND c = :category
        ORDER BY p.id ASC
        """)
    List<PoiCache> findByDestinationAndCategory(
            @Param("destination") Destination destination,
            @Param("category") Category category
    );

//    @Query("""
//            SELECT DISTINCT p FROM PoiCache p
//            JOIN p.categories c
//            WHERE p.destination = :destination
//              AND c IN :categories
//            """)
//    List<PoiCache> findByDestinationAndCategoriesIn(
//            @Param("destination") Destination destination,
//            @Param("categories") Set<Category> categories
//    );
//
//    @Query("""
//            SELECT DISTINCT c FROM PoiCache p
//            JOIN p.categories c
//            WHERE p.destination = :destination
//            """)
//    Set<Category> findCoveredCategoriesByDestination(
//            @Param("destination") Destination destination
//    );
//
//    @Query("""
//        SELECT DISTINCT p FROM PoiCache p
//        JOIN p.categories c
//        WHERE p.destination = :destination
//          AND c = :category
//        ORDER BY p.id ASC
//        """)
//    List<PoiCache> findByDestinationAndCategory(
//            @Param("destination") Destination destination,
//            @Param("category") Category category
//    );
}
