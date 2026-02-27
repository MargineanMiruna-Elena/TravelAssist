import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosClient = axios.create({
    baseURL: "http://192.168.1.131:8080/api",
    headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use(async (config: any) => {
    const token = await AsyncStorage.getItem("jwt");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;