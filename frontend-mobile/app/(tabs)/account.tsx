import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput} from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
import {useTranslation} from "react-i18next";
import {FontAwesome, FontAwesome6, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import {useRouter} from "expo-router";
import i18n from "i18next";
import UserService from "@/services/user-service";
import {useAuth} from "@/hooks/use-auth";
import {validateName, validateEmail} from "@/utils/formValidators";

import ChangePasswordModal from "@/components/change-password-modal";
import DeleteAccountModal from "@/components/delete-account-modal";
import LanguageButton from "@/components/language-button";

const Account = () => {
    const {t} = useTranslation();
    const router = useRouter();
    const {logout} = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [language, setLanguage] = useState("en");
    const [notifications, setNotifications] = useState(true);
    const [initialData, setInitialData] = useState({username: "", email: ""});
    const [formErrors, setFormErrors] = useState<any>({});

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

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

            if (userRes.data) {
                const {username, email: userEmail} = userRes.data;
                setName(username);
                setEmail(userEmail);
                setInitialData({username, email: userEmail});
            }

            if (prefRes.data) {
                setLanguage(prefRes.data.language);
                setNotifications(prefRes.data.notificationsEmail);
                i18n.changeLanguage(prefRes.data.language || "en");
            }
        } catch (err) {
            console.error("Error loading account data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            t('account.logout-confirm-title'),
            t('account.logout-confirm-msg'),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('account.log-out'),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/auth');
                    }
                }
            ]
        );
    };

    const handleSaveProfile = async () => {
        setError("");

        const nameError = validateName(name);
        const emailError = validateEmail(email);

        if (nameError || emailError) {
            setFormErrors({
                name: nameError,
                email: emailError
            });
            return;
        }

        const updatePayload: any = {};
        if (name !== initialData.username) updatePayload.username = name;
        if (email !== initialData.email) updatePayload.email = email;

        if (Object.keys(updatePayload).length === 0) {
            setIsEditing(false);
            setFormErrors({});
            return;
        }

        setLoading(true);
        try {
            const response = await UserService.patchUser(updatePayload);

            const newUsername = response.data.username || name;
            const newEmail = response.data.email || email;

            setInitialData({
                username: newUsername,
                email: newEmail
            });

            setIsEditing(false);
            setFormErrors({});

            Alert.alert(t('common.success'), t('account.profile-updated'));
        } catch (err: any) {
            setError(err.response?.data?.message || t('api-errors.something-wrong'));
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = async (newValue: boolean) => {
        setNotifications(newValue);
        try {
            await UserService.patchUserPreferences({notificationsEmail: newValue});
        } catch (error) {
            console.error("Failed to update notifications", error);
        }
    };

    const handleLanguageChange = async (newLang: string) => {
        setLanguage(newLang);

        try {
            await UserService.patchUserPreferences({language: newLang});
        } catch (error) {
            console.error("Failed to update language on server:", error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#7f22fe"/>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    className="pt-16 pb-12 items-center rounded-b-[30px]"
                >
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="absolute top-8 right-6 p-2 bg-white/20 rounded-full"
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="logout" size={22} color="white"/>
                    </TouchableOpacity>
                    <View
                        className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-2 border-white/30 overflow-hidden">
                        <Text
                            className="text-white text-5xl font-bold text-center"
                            style={{
                                includeFontPadding: false,
                                textAlignVertical: 'center',
                                lineHeight: 88,
                            }}
                        >
                            {initialData.username?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text className="text-white text-2xl font-bold mt-4">{initialData.username}</Text>
                    <Text className="text-white/80 text-lg">{initialData.email}</Text>
                </LinearGradient>

                <View className="px-4 -mt-6">
                    <View className="bg-white p-6 rounded-[30px] shadow-sm mb-2 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <MaterialCommunityIcons name="account-circle" size={24} color="#7f22fe"/>
                            <Text className="text-lg font-bold text-gray-800 ml-2">{t('account.information')}</Text>
                        </View>

                        <View style={{minHeight: 60}}>
                            <TextInput
                                label={t('account.username')}
                                value={name}
                                onChangeText={setName}
                                onBlur={() => setFormErrors((prev: any) => ({...prev, name: validateName(name)}))}
                                disabled={!isEditing}
                                mode="outlined"
                                error={!!formErrors.name}
                                outlineColor="#766f64"
                                textColor="#766f64"
                                activeOutlineColor="#7f22fe"
                                theme={{
                                    colors: {
                                        primary: '#7f22fe',
                                        error: '#ef4444',
                                        onSurfaceVariant: '#766f64',
                                        onSurface: '#766f64',
                                        onSurfaceDisabled: '#766f64'
                                    },
                                    roundness: 12,
                                }}
                                style={{backgroundColor: 'white'}}
                                contentStyle={{paddingHorizontal: 15}}
                            />
                            <View style={{marginTop: 4}}>
                                {formErrors.name ? (
                                    <Text style={{color: '#ef4444', fontSize: 13, textAlign: 'right'}}>
                                        {t(formErrors.name)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <View style={{minHeight: 80, marginTop: 4}}>
                            <TextInput
                                label={t('account.email')}
                                value={email}
                                onChangeText={setEmail}
                                onBlur={() => setFormErrors((prev: any) => ({...prev, email: validateEmail(email)}))}
                                disabled={!isEditing}
                                mode="outlined"
                                error={!!formErrors.email}
                                outlineColor="#766f64"
                                textColor="#766f64"
                                activeOutlineColor="#7f22fe"
                                theme={{
                                    colors: {
                                        primary: '#7f22fe',
                                        error: '#ef4444',
                                        onSurfaceVariant: '#766f64',
                                        onSurface: '#766f64',
                                        onSurfaceDisabled: '#766f64'
                                    },
                                    roundness: 12,
                                }}
                                style={{backgroundColor: 'white'}}
                                contentStyle={{paddingHorizontal: 15}}
                            />
                            <View style={{marginTop: 4}}>
                                {formErrors.email ? (
                                    <Text style={{color: '#ef4444', fontSize: 13, textAlign: 'right'}}>
                                        {t(formErrors.email)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <View style={{minHeight: 15}}>
                            {(isEditing && error) ? (
                                <Text
                                    style={{
                                        color: '#ef4444',
                                        fontSize: 14,
                                        textAlign: 'left',
                                        lineHeight: 14
                                    }}
                                >
                                    {error}
                                </Text>
                            ) : null}
                        </View>

                        {!isEditing ? (
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                className="bg-violet-700 h-11 rounded-2xl flex-row justify-center items-center shadow-md mt-2"
                            >
                                <MaterialCommunityIcons name="account-edit" size={20} color="white"/>
                                <Text className="text-white font-bold ml-2 text-base">{t('account.edit-profile')}</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row space-x-3 mt-2">
                                <TouchableOpacity
                                    onPress={handleSaveProfile}
                                    className="flex-1 flex-row bg-violet-700 h-11 rounded-2xl items-center justify-center shadow-md"
                                >
                                    <FontAwesome name="save" size={20} color="white"/>
                                    <Text className="text-white font-bold text-base ml-1">{t('account.save')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEditing(false);
                                        setName(initialData.username);
                                        setEmail(initialData.email);
                                        setFormErrors({});
                                        setError("");
                                    }}
                                    className="flex-1 flex-row border border-violet-700 h-11 rounded-2xl items-center justify-center"
                                >
                                    <MaterialIcons name="cancel" size={20} color="#7f22fe"/>
                                    <Text
                                        className="text-violet-700 font-bold text-base ml-1">{t('account.cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View className="bg-white p-6 rounded-[30px] shadow-sm mb-2 border border-gray-100">
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#7f22fe"/>
                            <Text className="text-lg font-bold text-gray-800 ml-2">{t('account.security')}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowChangePassword(true)}
                            className="flex-row items-center justify-between p-2 border border-gray-200 rounded-xl"
                            activeOpacity={0.5}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="bg-violet-50 p-3 rounded-2xl">
                                    <MaterialCommunityIcons name="key" size={22} color="#7f22fe"/>
                                </View>
                                <View className="ml-2 flex-1">
                                    <Text
                                        className="font-bold text-gray-800 text-base">{t('account.change-password')}</Text>
                                    <Text
                                        className="text-gray-400 text-xs mt-1">{t('account.change-password-text')}</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#7f22fe"/>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white p-6 rounded-[30px] shadow-sm mb-2 border border-gray-100">
                        <View className="flex-row items-center mb-2">
                            <FontAwesome6 name="sliders" size={22} color="#7f22fe"/>
                            <Text className="text-lg font-bold text-gray-800 ml-2">{t('account.preferences')}</Text>
                        </View>

                        <View className="flex-row items-center justify-between py-2 w-full">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View className="bg-violet-50 p-3 rounded-2xl">
                                    <MaterialCommunityIcons name="translate" size={22} color="#7f22fe"/>
                                </View>

                                <View className="ml-2 flex-1">
                                    <Text className="font-bold text-gray-800 text-base" numberOfLines={1}>
                                        {t('account.language')}
                                    </Text>
                                    <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
                                        {t('account.language-text')}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-shrink-0">
                                <LanguageButton onLanguageChange={handleLanguageChange}/>
                            </View>
                        </View>

                        <View className="h-[1px] bg-gray-200 w-full my-2"/>

                        <View className="flex-row items-center justify-between py-2 w-full">
                            <View className="flex-row items-center flex-1 mr-4">
                                <View className="bg-violet-50 p-3 rounded-2xl">
                                    <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#7f22fe"/>
                                </View>

                                <View className="ml-2 flex-1">
                                    <Text
                                        className="font-bold text-gray-800 text-base"
                                        numberOfLines={1}
                                    >
                                        {t('account.notifications')}
                                    </Text>
                                    <Text
                                        className="text-gray-400 text-xs mt-1"
                                        numberOfLines={2}
                                    >
                                        {t('account.notifications-text')}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-shrink-0">
                                <Switch
                                    value={notifications}
                                    onValueChange={handleNotificationChange}
                                    trackColor={{
                                        false: "#D1D5DB",
                                        true: "#C4B5FD"
                                    }}
                                    thumbColor={notifications ? "#7F22FE" : "#FFFFFF"}
                                    ios_backgroundColor="#D1D5DB"
                                    style={Platform.OS === 'android' ? { transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] } : {}}
                                />
                            </View>
                        </View>
                    </View>

                    <View className="bg-white p-6 rounded-[30px] shadow-sm mb-2 border border-gray-100">
                        <View className="flex-row items-center mb-2">
                            <FontAwesome name="exclamation-triangle" size={22} color="#7f22fe"/>
                            <Text className="text-lg font-bold text-gray-800 ml-2">{t('account.danger')}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowDelete(true)}
                            className="bg-red-50/50 p-2 rounded-2xl border border-red-100 flex-row items-center justify-center"
                            activeOpacity={0.6}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444"/>
                            <Text className="text-red-500 font-bold ml-2 text-base">{t('account.delete-account')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modale */}
                <ChangePasswordModal
                    visible={showChangePassword}
                    onClose={() => setShowChangePassword(false)}
                />
                <DeleteAccountModal
                    visible={showDelete}
                    onClose={() => setShowDelete(false)}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default Account;