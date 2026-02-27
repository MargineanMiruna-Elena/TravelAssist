import axiosClient from "../api/axios-client";

export const login = async (email: string, password: string): Promise<any> => {
    const response = await axiosClient.post("/auth/log-in", {
        email,
        password,
    });

    return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<any> => {
    const response = await axiosClient.post("/auth/register", {
        username,
        email,
        password
    });

    return response.data;
};

export const resetPassward = async (email: string): Promise<any> => {
    const response = await axiosClient.post("/auth/reset-password", {
        email
    });

    return response.data;
};