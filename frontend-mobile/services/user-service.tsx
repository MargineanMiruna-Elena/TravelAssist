import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserUpdatePayload {
    username?: string;
    email?: string;
}

interface PreferenceUpdatePayload {
    language?: string;
    notificationsEmail?: boolean;
}

const API_URL = "http://192.168.0.249:8080/api/user";

class UserService {

    async getCurrentUser(): Promise<any> {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    async getAuthHeader(): Promise<{ Authorization?: string }> {
        const jwt = await AsyncStorage.getItem('jwt');
        if (jwt) {
            const cleanJwt = jwt.replace(/"/g, '');
            return { Authorization: `Bearer ${cleanJwt}` };
        }
        return {};
    }

    async getUserById(): Promise<any> {
        const user = await this.getCurrentUser();
        if (!user?.id) throw new Error("No user ID found");

        const headers = await this.getAuthHeader();
        return axios.get(`${API_URL}/${user.id}`, { headers });
    }

    async getUserPreferences(): Promise<any> {
        const user = await this.getCurrentUser();
        if (!user?.id) throw new Error("No user ID found");

        const headers = await this.getAuthHeader();
        return axios.get(`${API_URL}/preferences/${user.id}`, { headers });
    }

    async patchUser(updateData: UserUpdatePayload): Promise<any> {
        const user = await this.getCurrentUser();
        if (!user?.id) throw new Error("No user ID found");

        const headers = await this.getAuthHeader();
        return axios.patch(`${API_URL}/${user.id}`, updateData, { headers });
    }

    async patchUserPreferences(updateData: PreferenceUpdatePayload): Promise<any> {
        const user = await this.getCurrentUser();
        if (!user?.id) throw new Error("No user ID found");

        const headers = await this.getAuthHeader();
        return axios.patch(
            `${API_URL}/preferences/${user.id}`,
            {
                language: updateData.language,
                notificationsEmail: updateData.notificationsEmail
            },
            { headers }
        );
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<any> {
        const user = await this.getCurrentUser();
        if (!user?.id) throw new Error("No user ID found");

        const headers = await this.getAuthHeader();
        return axios.patch(
            `${API_URL}/change-password/${user.id}`,
            { oldPassword, newPassword },
            { headers }
        );
    }

    async deleteUser(): Promise<any> {
        const user = await this.getCurrentUser();
        if (!user?.id) throw new Error("No user ID found");

        const headers = await this.getAuthHeader();
        return axios.delete(`${API_URL}/${user.id}`, { headers });
    }
}

export default new UserService();