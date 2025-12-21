export const validateNameRequired = (value, fieldName) => {
    if (!value) {
        return `${fieldName} este obligatoriu.`;
    }
    return "";
};

export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!email)
    return emailRegex.test(email);
};

export const isPasswordStrong = (password) =>
    return password.length >= 8;
};