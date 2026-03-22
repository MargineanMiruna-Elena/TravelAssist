package com.mme.travelassist.repository;

import com.mme.travelassist.model.Trip;
import com.mme.travelassist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> getTripByUser(User user);
}
