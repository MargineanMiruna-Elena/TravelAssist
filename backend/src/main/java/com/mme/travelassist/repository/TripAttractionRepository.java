package com.mme.travelassist.repository;

import com.mme.travelassist.model.TripAttraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TripAttractionRepository extends JpaRepository<TripAttraction, UUID> {
}
