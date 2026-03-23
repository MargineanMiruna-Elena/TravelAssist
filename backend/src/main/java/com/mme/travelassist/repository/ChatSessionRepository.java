package com.mme.travelassist.repository;

import com.mme.travelassist.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<ChatSession> findByTripId(UUID sessionId);
}
