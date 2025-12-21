package com.mme.travelassist.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mme.travelassist.exception.user.PasswordApiException;
import com.mme.travelassist.service.RandomPasswordGeneratorService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RandomPasswordGeneratorServiceImpl implements RandomPasswordGeneratorService {

    @Value("${password.generator.api.url}")
    private String apiUrl;

    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(RandomPasswordGeneratorServiceImpl.class);

    @PostConstruct
    void init() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
        logger.info("RandomPasswordGeneratorService initialized with API URL: {}", apiUrl);
    }

    @Override
    public String generateRandomPassword(int length) throws JsonProcessingException, PasswordApiException {
        String url = apiUrl.replace("{}", String.valueOf(length));
        logger.info("Generating random password with length: {}", length);

        String response = null;
        try {
            response = restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            logger.error("Error while calling password generator API: {}", e.getMessage());
            throw new PasswordApiException();
        }

        logger.info("Received response from password generator API.");

        JsonNode root = objectMapper.readTree(response);
        if(!root.has("password") || root.get("password").isNull()) {
            throw new PasswordApiException();
        }

        return root.get("password").asText();
    }

    @Override
    public String generateRandomPassword() throws JsonProcessingException, PasswordApiException {
        return generateRandomPassword(12);
    }
}
