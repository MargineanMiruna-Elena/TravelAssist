package com.mme.travelassist.repository;

import com.mme.travelassist.model.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AttractionRepository extends JpaRepository<Attraction, UUID> {
}
