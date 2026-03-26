package com.mme.travelassist.scheduler;

import com.mme.travelassist.service.DestinationSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DestinationSyncScheduler {

    private final DestinationSyncService destinationSyncService;

    /**
     * Runs on the first day of every month at 03:00 AM.
     */
    @Scheduled(cron = "0 0 3 1 * *")
    public void scheduleMonthlySync() {
        log.info("Starts monthly sync of destinations...");
        try {
            destinationSyncService.syncDestinations();
            log.info("monthly sync finished successfully.");
        } catch (Exception e) {
            log.error("Error while monthly syncing: {}", e.getMessage());
        }
    }
}