export const VALIDATION_KEYS = {
    REQUIRED: "validation.required",
    EMAIL_INVALID: "validation.email.invalid",
    PASSWORD_MIN_LENGTH: "validation.password.minLength",
};

/**
 * Functie pură pentru a returna cheia de traducere
 * @param {string} name - Numele campului
 * @param {string} value - Valoarea campului
 * @returns {{ key: string, params: object } | null} Cheia si parametrii, sau null daca e valid
 */
export const getValidationKey = (name, value) => {
    if (name === "name") {
        if (!value) {
            return { key: VALIDATION_KEYS.REQUIRED, params: { field: 'Numele' } };
        }
    }

    if (name === "email") {
        if (!value) {
            return { key: VALIDATION_KEYS.REQUIRED, params: { field: 'Email-ul' } };
        }
        if (!/\S+@\S+\.\S+/.test(value)) {
            return { key: VALIDATION_KEYS.EMAIL_INVALID, params: {} };
        }
    }

    if (name === "password") {
        if (value.length < 8) {
            return { key: VALIDATION_KEYS.PASSWORD_MIN_LENGTH, params: { min: 8 } };
        }
    }

    return null;
};