import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated
} from "react-native";
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import {
    validateConfirmPassword,
    validateEmail,
    validateName,
    validatePassword
} from "@/utils/formValidators";

import Logo from "@/components/logo";
import LanguageButton from "@/components/language-button";
import ForgotPasswordModal from "@/components/forgot-password-modal";

const Auth = () => {
    const { login, register } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [backendError, setBackendError] = useState("");
    const [forgotVisible, setForgotVisible] = useState(false);

    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirmPassword: false
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [slideAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isLogin ? 0 : 1,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();
    }, [isLogin]);

    const validateForm = () => {
        const newErrors: any = {};

        if (!isLogin) {
            newErrors.name = validateName(formData.name);
            newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
        }

        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);

        setErrors(newErrors);
        return !Object.values(newErrors).some((msg) => msg);
    };

    const handleSubmit = async () => {
        setBackendError("");
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }
            router.replace("/dashboard");
        } catch (err: any) {
            if (err.response) {
                setBackendError(t(err.response.data.detail));
            } else {
                setBackendError(t("api-errors.something-wrong"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-gray-50"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">

                <View className="items-center mt-12 mb-6 relative">
                    <Logo className="text-6xl"/>
                </View>

                <View className="relative flex-row h-12 mb-4 border border-violet-500 rounded-xl overflow-hidden bg-white">
                    <TouchableOpacity
                        onPress={() => { setIsLogin(true); setBackendError(""); }}
                        className="flex-1 justify-center items-center z-20"
                    >
                        <Text className={`font-bold text-lg ${isLogin ? "text-white" : "text-violet-700"}`}>
                            {t('auth.login')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { setIsLogin(false); setBackendError(""); }}
                        className="flex-1 justify-center items-center z-20"
                    >
                        <Text className={`font-bold text-lg ${!isLogin ? "text-white" : "text-violet-700"}`}>
                            {t('auth.signup')}
                        </Text>
                    </TouchableOpacity>

                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            height: '100%',
                            width: '50%',
                            borderRadius: 8,
                            left: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '50%']
                            })
                        }}
                    >
                        <LinearGradient
                            colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        />
                    </Animated.View>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">

                    {!isLogin && (
                        <View style={{ minHeight: 80 }}>
                            <TextInput
                                label={`${t('auth.username')}*`}
                                value={formData.name}
                                onChangeText={(val) => setFormData({...formData, name: val})}
                                onBlur={() => setErrors((prev: any) => ({ ...prev, name: validateName(formData.name) }))}
                                mode="outlined"
                                multiline={false}
                                error={!!errors.name}
                                outlineColor="#766f64"
                                textColor="#766f64"
                                activeOutlineColor="#7f22fe"
                                theme={{
                                    colors: {
                                        primary: '#7f22fe',
                                        error: '#ef4444',
                                        onSurfaceVariant: '#766f64',
                                        onSurface: '#766f64'
                                    },
                                    roundness: 12,
                                }}
                                style={{ backgroundColor: 'white'}}
                                contentStyle={{
                                    paddingHorizontal: 15,
                                }}
                            />
                            <View style={{ minHeight: 15, marginTop: 6 }}>
                                {errors.name ? (
                                    <Text style={{
                                        color: '#ef4444',
                                        fontSize: 14,
                                        textAlign: 'right',
                                        lineHeight: 14
                                    }}>
                                        {t(errors.name)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    )}

                    <View style={{ minHeight: 80 }}>
                        <TextInput
                            label={`${t('auth.email')}*`}
                            value={formData.email}
                            onChangeText={(val) => setFormData({...formData, email: val})}
                            onBlur={() => setErrors((prev: any) => ({ ...prev, email: validateEmail(formData.email) }))}
                            mode="outlined"
                            multiline={false}
                            numberOfLines={1}
                            error={!!errors.email}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            outlineColor="#766f64"
                            textColor="#766f64"
                            activeOutlineColor="#7f22fe"
                            theme={{
                                colors: {
                                    primary: '#7f22fe',
                                    error: '#ef4444',
                                    onSurfaceVariant: '#766f64',
                                    onSurface: '#766f64'
                                },
                                roundness: 12,
                            }}
                            style={{ backgroundColor: 'white' }}
                            contentStyle={{
                                paddingHorizontal: 15,
                            }}
                        />
                        <View style={{ minHeight: 15, marginTop: 6 }}>
                            {errors.email ? (
                                <Text style={{
                                    color: '#ef4444',
                                    fontSize: 14,
                                    textAlign: 'right',
                                    lineHeight: 14
                                }}>
                                    {t(errors.email)}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View style={{ minHeight: 80 }}>
                        <TextInput
                            label={`${t('auth.password')}*`}
                            value={formData.password}
                            onChangeText={(val) => setFormData({...formData, password: val})}
                            onBlur={() => setErrors((prev: any) => ({ ...prev, password: validatePassword(formData.password) }))}
                            mode="outlined"
                            multiline={false}
                            error={!!errors.password}
                            secureTextEntry={!showPasswords.password}
                            outlineColor="#766f64"
                            textColor="#766f64"
                            activeOutlineColor="#7f22fe"
                            theme={{
                                colors: {
                                    primary: '#7f22fe',
                                    error: '#ef4444',
                                    onSurfaceVariant: '#766f64',
                                    onSurface: '#766f64'
                                },
                                roundness: 12,
                            }}
                            style={{ backgroundColor: 'white' }}
                            contentStyle={{
                                paddingHorizontal: 15,
                            }}
                            right={
                                <TextInput.Icon
                                    icon={() => (
                                        <Ionicons
                                            name={showPasswords.password ? 'eye-off' : 'eye'}
                                            size={24}
                                            color="#766f64"
                                        />
                                    )}
                                    onPress={() => setShowPasswords({
                                        ...showPasswords,
                                        password: !showPasswords.password
                                    })}
                                />
                            }
                        />
                        <View style={{ minHeight: 30, marginTop: 6 }}>
                            {errors.password ? (
                                <Text style={{
                                    color: '#ef4444',
                                    fontSize: 14,
                                    textAlign: 'right',
                                    lineHeight: 14
                                }}>
                                    {t(errors.password)}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    {isLogin && (
                        <TouchableOpacity onPress={() => setForgotVisible(true)} className="mb-6 items-end">
                            <Text className="text-violet-700 text-base font-semibold">{t('auth.forgot-password')}</Text>
                        </TouchableOpacity>
                    )}

                    {!isLogin && (
                        <View style={{ minHeight: 80 }}>
                            <TextInput
                                label={`${t('auth.confirm-password')}*`}
                                value={formData.confirmPassword}
                                onChangeText={(val) => setFormData({...formData, confirmPassword: val})}
                                onBlur={() => setErrors((prev: any) => ({ ...prev, confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword) }))}
                                mode="outlined"
                                multiline={false}
                                error={!!errors.confirmPassword}
                                secureTextEntry={!showPasswords.confirmPassword}
                                outlineColor="#766f64"
                                textColor="#766f64"
                                activeOutlineColor="#7f22fe"
                                theme={{
                                    colors: {
                                        primary: '#7f22fe',
                                        error: '#ef4444',
                                        onSurfaceVariant: '#766f64',
                                        onSurface: '#766f64'
                                    },
                                    roundness: 12,
                                }}
                                style={{ backgroundColor: 'white' }}
                                contentStyle={{
                                    paddingHorizontal: 15,
                                }}
                                right={
                                    <TextInput.Icon
                                        icon={() => (
                                            <Ionicons
                                                name={showPasswords.confirmPassword ? 'eye-off' : 'eye'}
                                                size={24}
                                                color="#766f64"
                                            />
                                        )}
                                        onPress={() => setShowPasswords({
                                            ...showPasswords,
                                            confirmPassword: !showPasswords.confirmPassword
                                        })}
                                    />
                                }
                            />
                            <View style={{ minHeight: 22, marginTop: 6 }}>
                                {errors.confirmPassword ? (
                                    <Text style={{
                                        color: '#ef4444',
                                        fontSize: 14,
                                        textAlign: 'right',
                                        lineHeight: 14
                                    }}>
                                        {t(errors.confirmPassword)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    )}

                    <View style={{ minHeight: 24, marginBottom: 12 }}>
                        {backendError ? (
                            <Text
                                style={{
                                    color: '#ef4444',
                                    fontSize: 14,
                                    textAlign: 'left',
                                    lineHeight: 14
                                }}
                            >
                                {backendError}
                            </Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`w-full h-11 rounded-xl items-center justify-center shadow-md bg-violet-700 ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                {isLogin ? t('auth.login') : t('auth.signup')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View className="mt-10 items-center">
                    <LanguageButton />
                </View>
            </ScrollView>

            <ForgotPasswordModal
                visible={forgotVisible}
                onClose={() => setForgotVisible(false)}
            />
        </KeyboardAvoidingView>
    );
};

export default Auth;