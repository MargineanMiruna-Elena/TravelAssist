package com.mme.travelassist.repository;

import com.mme.travelassist.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
}
