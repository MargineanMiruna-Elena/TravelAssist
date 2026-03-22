package com.mme.travelassist.controller;

import com.mme.travelassist.service.implementation.DestinationSyncServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/sync")
@RequiredArgsConstructor
public class DestinationSyncController {

    private final DestinationSyncServiceImpl destinationSyncService;

    @PostMapping("/destinations")
    public ResponseEntity<String> syncDestinations() {
        destinationSyncService.syncDestinations();
        return ResponseEntity.ok("Sync finalizat. Verifică logurile pentru detalii.");
    }

    @PostMapping("/images")
    public ResponseEntity<String> syncImages() {
        destinationSyncService.syncImages();
        return ResponseEntity.ok("Sync imagini finalizat. Verifică logurile pentru detalii.");
    }
}