import axiosClient from "../api/axiosClient";

export const login = async (email, password) => {
    const response = await axiosClient.post("/auth/log-in", {
        email,
        password,
    });

    return response.data;
};

export const register = async (username, email, password) => {
    const response = await axiosClient.post("/auth/register", {
        username,
        email,
        password
    });

    return response.data;
};

export const resetPassward = async (email) => {
    const response = await axiosClient.post("/auth/reset-password", {
        email
    });

    return response.data;
}
