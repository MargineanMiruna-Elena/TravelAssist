package com.mme.travelassist.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /**
     * Generate JWT with user ID, email, and username as claims
     */
    public String generateToken(UUID id, String email, String username) {
        log.debug("Generating JWT for user: {} ({}, ID: {})", username, email, id);
        return Jwts.builder()
                .setSubject(email)
                .claim("username", username)
                .claim("id", id.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract email from JWT (subject)
     */
    public String extractEmail(String token) {
        try {
            return parseClaims(token).getSubject();
        } catch (JwtException e) {
            log.error("Failed to extract email from JWT: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Extract username from JWT
     */
    public String extractUsername(String token) {
        try {
            return parseClaims(token).get("username", String.class);
        } catch (JwtException e) {
            log.error("Failed to extract username from JWT: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Extract User ID from JWT
     */
    public UUID extractUserId(String token) {
        try {
            String idStr = parseClaims(token).get("id", String.class);
            return UUID.fromString(idStr);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Failed to extract user ID from JWT: {}", e.getMessage());
            throw e;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("Empty or null JWT: {}", e.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}