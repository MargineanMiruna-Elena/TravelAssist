export const validateName = (name) => {
    if (!name.trim()) return "validation.name-required";
    if (name.length < 2) return "validation.name-length";
    return "";
};

export const validateEmail = (email) => {
    if (!email.trim()) return "validation.email-required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "validation.email-format";
    return "";
};

export const validatePassword = (password) => {
    if (!password) return "validation.password-required";
    if (password.length < 6) return "validation.password-length";
    return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "validation.confirm-password-required";
    if (confirmPassword && password !== confirmPassword) return "validation.passwords-not-equal";
    return "";
};