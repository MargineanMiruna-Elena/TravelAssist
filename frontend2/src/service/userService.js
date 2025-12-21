import axios from 'axios';

const API_URL = "http://localhost:8080/api/user";

class UserService {

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    getAuthHeader() {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
            return { Authorization: 'Bearer ' + jwt };
        }
        return {};
    }

    getUserById() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return Promise.reject("No user ID found");

        return axios.get(`${API_URL}/${user.id}`, { headers: this.getAuthHeader() });
    }

    getUserPreferences() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return Promise.reject("No user ID found");

        return axios.get(`${API_URL}/preferences/${user.id}`, { headers: this.getAuthHeader() });
    }

    patchUser(updateData) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return Promise.reject("No user ID found");

        return axios.patch(`${API_URL}/${user.id}`, updateData, { headers: this.getAuthHeader() });
    }

    patchUserPreferences(updateData) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return Promise.reject("No user ID found");

        return axios.patch(
            `${API_URL}/preferences/${user.id}`,
            {
                language: updateData.language,
                notificationsEmail: updateData.notificationsEmail
            },
            { headers: this.getAuthHeader() }
        );
    }

    changePassword(oldPassword, newPassword) {
        const user = this.getCurrentUser();
        if (!user || !user.id) return Promise.reject("No user ID found");

        return axios.patch(`${API_URL}/change-password/${user.id}`, {oldPassword, newPassword}, {headers: this.getAuthHeader()});
    }

    deleteUser() {
        const user = this.getCurrentUser();
        if (!user || !user.id) return Promise.reject("No user ID found");

        return axios.delete(`${API_URL}/${user.id}`, { headers: this.getAuthHeader() });
    }
}

export default new UserService();