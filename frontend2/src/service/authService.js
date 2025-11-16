import axiosClient from "../api/axiosClient";

export const login = async (email, password) => {
    const response = await axiosClient.post("/auth/log-in", {
        email,
        password,
    });

    return response.data;
};

export const register = async (email, password, name) => {
    const response = await axiosClient.post("/auth/register", {
        email,
        password,
        name,
    });

    return response.data;
};
