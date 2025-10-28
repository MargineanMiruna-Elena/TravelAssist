package com.mme.travelassist.repository;

import com.mme.travelassist.model.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DailyPlanRepository extends JpaRepository<DailyPlan, UUID> {
}
