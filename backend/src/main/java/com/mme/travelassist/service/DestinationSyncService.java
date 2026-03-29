package com.mme.travelassist.service;

import com.mme.travelassist.model.Destination;

public interface DestinationSyncService {

    Destination findOrCreateDestination(String cityName, String countryName);

    /**
     * Image sync for destinations
     * Flux:
     * 1. Wikidata → listă orașe (nume, țară, coordonate)
     * 2. Pentru fiecare oraș → OTM /places/radius → kinds agregate
     * 3. kinds → Set<Category> + Set<Integer> bestMonths
     * 4. Salvare în baza de date dacă nu există deja
     */
    void syncImages();

    void syncDestinations();
}
