package com.mme.travelassist.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.mme.travelassist.exception.user.PasswordApiException;

public interface RandomPasswordGeneratorService {

    /**
     * Generates a random password with the specified length using an external API.
     *
     * @param length the length of the password to generate
     * @return a randomly generated password as a String
     * @throws JsonProcessingException if there is an error processing the JSON response
     * @throws PasswordApiException    if there is an error calling the password generation API
     */
    String generateRandomPassword(int length) throws JsonProcessingException, PasswordApiException;

    /**
     * Generates a random password with a default length of 12 characters using an external API.
     *
     * @return a randomly generated password as a String
     * @throws JsonProcessingException if there is an error processing the JSON response
     * @throws PasswordApiException    if there is an error calling the password generation API
     */
    String generateRandomPassword() throws JsonProcessingException, PasswordApiException;
}
