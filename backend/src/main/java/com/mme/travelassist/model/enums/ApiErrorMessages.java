package com.mme.travelassist.model.enums;

import lombok.Getter;

@Getter
public enum ApiErrorMessages {
    INVALID_AIRPORT_DETAILS("api-errors.invalid-airport-details"),
    GENERIC_SERVER_ERROR("api-errors.generic-server-error"),
    SERVER_INTERRUPT_ERROR("api-errors.server-interrupt-error"),
    USER_NOT_FOUND("api-errors.user-not-found"),
    INVALID_PASSWORD("api-errors.invalid-password"),
    DUPLICATE_USER("api-errors.duplicate-user"),
    MESSAGING_ERROR("api-errors.messaging-error"),
    INVALID_TOKEN("api-errors.invalid-token"),
    JSON_PARSE_ERROR("api-errors.json-parse-error"),
    PASSWORD_API_ERROR("api-errors.password-api-error"),
    PDF_GENERATION_ERROR("api-errors.pdf-generation-error"),
    CASE_NOT_FOUND("api-errors.case-not-found"),
    CASE_VALIDATION_ERROR("api-errors.case-validation-error"),
    DATA_INTEGRITY_VIOLATION("api-errors.data-integrity-violation"),
    ILLEGAL_ARGUMENT("api-errors.illegal-argument-"),
    USER_VALIDATION_ERROR("api-errors.user-validation-error"),
    CONSTRAINT_VIOLATION("api-errors.constraint-violation"),
    RESERVATION_NOT_FOUND("api-errors.reservation-not-found"),
    DOCUMENT_NOT_FOUND("api-errors.document-not-found"),
    FORBIDDEN("api-errors.forbidden"),
    UNAUTHORIZED("api-errors.unauthorized");

    private final String code;

    ApiErrorMessages(String code) {
        this.code = code;
    }
}
