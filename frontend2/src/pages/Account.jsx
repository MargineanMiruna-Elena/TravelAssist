import React, {useEffect, useState} from 'react';
import {CustomNavbar} from "../components/CustomNavbar.jsx";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Divider} from "primereact/divider";
import {Link} from "react-router-dom";
import {Dropdown} from "primereact/dropdown";
import {InputSwitch} from "primereact/inputswitch";
import {Dialog} from "primereact/dialog";
import {useTranslation} from "react-i18next";
import UserService from "../service/userService.js";
import i18n from "i18next";
import ChangePasswordModal from "../components/ChangePasswordModal.jsx";
import DeleteAccountModal from "../components/DeleteAccountModal.jsx";

function Account() {
    const {t} = useTranslation();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [language, setLanguage] = useState("en");
    const [notifications, setNotifications] = useState(true);
    const [initialData, setInitialData] = useState({ username: "", email: "" });

    const [showChangePassword, setShowChangePassword] = useState(false);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const languages = [
        {label: "English", value: "en"},
        {label: "Română", value: "ro"},
        {label: "Deutsch", value: "de"}
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [userRes, prefRes] = await Promise.all([
                UserService.getUserById(),
                UserService.getUserPreferences()
            ]);

            const userData = userRes.data;
            if (userData) {
                setName(userData.username);
                setEmail(userData.email);
                setInitialData({ username: userData.username, email: userData.email });
            }

            const prefData = prefRes.data;
            if (prefData) {
                setLanguage(prefData.language);
                setNotifications(prefData.notificationsEmail);
            }

            i18n.changeLanguage(prefData.language || "en");

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetToInitial = () => {
        setName(initialData.username);
        setEmail(initialData.email);
        setError("");
    };

    const handleSaveProfile = async () => {
        setError("");

        const updatePayload = {};
        if (name !== initialData.username) updatePayload.username = name;
        if (email !== initialData.email) updatePayload.email = email;

        if (Object.keys(updatePayload).length === 0) {
            setIsEditing(false);
            return;
        }

        try {
            const response = await UserService.patchUser(updatePayload);

            const currentUser = JSON.parse(localStorage.getItem('user'));

            const updatedUser = {
                ...currentUser,
                username: response.data.username || currentUser.username,
                email: response.data.email || currentUser.email,
            };

            setInitialData({
                username: response.data.username || name,
                email: response.data.email || email
            });

            localStorage.setItem('user', JSON.stringify(updatedUser));
            localStorage.setItem('jwt', response.data.jwt);

            setIsEditing(false);
        } catch (err) {
            resetToInitial();

            if (err.response && err.response.data) {
                setError(err.response.data.message || t('api-errors.something-wrong'));
            }
        }
    };

    const handleLanguageChange = async (e) => {
        const newLang = e.value;
        setLanguage(newLang);
        i18n.changeLanguage(newLang);

        try {
            await UserService.patchUserPreferences({language: newLang});
        } catch (error) {
            console.error("Failed to update language", error);
        }
    };

    const handleNotificationChange = async (e) => {
        const newVal = e.value;
        setNotifications(newVal);

        try {
            await UserService.patchUserPreferences({notificationsEmail: newVal});
        } catch (error) {
            console.error("Failed to update notifications", error);
        }
    };

    const header = (
        <div
            className="text-center py-20 rounded-md bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-400 text-white">
            <div
                className="mx-auto mt-5 w-22 h-22 rounded-full bg-white/20 text-white flex items-center justify-center text-5xl">
                {initialData.username?.charAt(0)}
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold">{initialData.username}</h2>
                <p className="opacity-90">{initialData.email}</p>
            </div>
        </div>);

    return (
        <div>
            <CustomNavbar/>
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <Card
                        className="shadow-lg rounded-2xl h-full"
                        header={header}
                    >

                        <div className="text-center space-y-2">

                            <Button
                                label={t('account.log-out')}
                                icon="pi pi-sign-out"
                                outlined
                                className="w-full !text-violet-700"
                            />

                        </div>

                    </Card>

                    <Card className="shadow-lg rounded-2xl md:col-span-2 px-6">
                        <section>
                            <h3 className="text-lg font-semibold mb-4">{t('account.information')}</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                <span className="p-float-label flex-1">
                                    <InputText id="name" value={name} className="w-full !rounded-xl !py-2 !border"
                                               onChange={(e) => setName(e.target.value)} disabled={!isEditing}/>
                                    <label htmlFor="name">{t('account.username')}</label>
                                </span>
                                <span className="p-float-label">
                                    <InputText id="email" value={email} className="w-full !rounded-xl !py-2 !border"
                                               onChange={(e) => setEmail(e.target.value)} disabled={!isEditing}/>
                                    <label htmlFor="email">{t('account.email')}</label>
                                </span>
                            </div>

                            {!isEditing && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full !rounded-xl !py-2 !bg-violet-700 !grid place-items-center gap-2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <span className="flex items-center gap-2">
                                            <i className="pi pi-user-edit"></i>
                                            {t('account.edit-profile')}
                                        </span>
                                    </Button>
                                </div>
                            )}

                            {isEditing && (
                                <div className="mt-4">
                                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                                    <div className="flex gap-2">
                                        <Button
                                            className="w-full !rounded-xl !py-2 !bg-violet-700 !grid place-items-center gap-2"
                                            onClick={handleSaveProfile}
                                        >
                                        <span className="flex items-center gap-2">
                                            <i className="pi pi-save"></i>
                                            {t('account.save')}
                                        </span>
                                        </Button>
                                        <Button
                                            outlined
                                            className="w-full !rounded-xl !py-2 !text-violet-700 !grid place-items-center gap-2"
                                            onClick={() => {
                                                resetToInitial();
                                                setIsEditing(false)
                                            }}
                                        >
                                        <span className="flex items-center gap-2">
                                            <i className="pi pi-times"></i>
                                            {t('account.cancel')}
                                        </span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <Divider/>

                        <section>
                            <h3 className="text-lg font-semibold mb-4">{t('account.security')}</h3>

                            <div
                                className="flex items-center justify-between w-full p-3 rounded-lg cursor-pointer border border-gray-200 hover:bg-violet-50 transition"
                                onClick={() => setShowChangePassword(true) }
                            >

                                <div className="flex items-center gap-3">
                                    <i className="pi pi-lock text-violet-700 !font-bold p-1 text-lg"></i>

                                    <div>
                                        <span>
                                            <b>{t('account.change-password')}</b><br/>
                                            <small className="opacity-60">{t('account.change-password-text')}</small>
                                        </span>
                                    </div>
                                </div>

                                <i className="pi pi-chevron-right text-violet-700 text-lg"></i>
                            </div>
                        </section>

                        <Divider/>

                        <section>
                            <h3 className="text-lg font-semibold mb-4">{t('account.preferences')}</h3>

                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <i className="pi pi-language text-violet-700 !font-bold p-1 text-lg"></i>
                                    <span>
                                        <b>{t('account.language')}</b><br/>
                                        <small className="opacity-60">{t('account.language-text')}</small>
                                    </span>
                                </div>

                                <Dropdown value={language} options={languages} onChange={handleLanguageChange}/>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <i className="pi pi-bell text-violet-700 !font-bold p-1 text-lg"></i>
                                    <span>
                                        <b>{t('account.notifications')}</b><br/>
                                        <small className="opacity-60">{t('account.notifications-text')}</small>
                                    </span>
                                </div>

                                <InputSwitch className="!text-violet-700" checked={notifications}
                                             onChange={handleNotificationChange}/>
                            </div>
                        </section>

                        <Divider/>

                        {/* 4. Danger Zone */}
                        <section>
                            <h3 className="text-lg font-semibold mb-4">{t('account.danger')}</h3>

                            <div className="mt-4">
                                <Button
                                    className="w-full !rounded-xl !py-2 !bg-violet-700 !grid place-items-center gap-2"
                                    onClick={() => setShowDelete(true)}
                                >
                                        <span className="flex items-center gap-2">
                                            <i className="pi pi-trash"></i>
                                            {t('account.delete-account')}
                                        </span>
                                </Button>
                            </div>
                        </section>
                    </Card>
                </div>

                <ChangePasswordModal
                    visible={showChangePassword}
                    onClose={() => setShowChangePassword(false)}
                />
                <DeleteAccountModal
                    visible={showDelete}
                    onClose={() => setShowDelete(false)}/>

            </div>
        </div>
    );
}

export default Account;