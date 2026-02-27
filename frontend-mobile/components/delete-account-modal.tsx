import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTranslation } from "react-i18next";
import UserService from "@/services/user-service";
import {useAuth} from "@/hooks/use-auth";

interface Props {
    visible: boolean;
    onClose: () => void;
}

function DeleteAccountModal({ visible, onClose }: Props) {
    const { t } = useTranslation();
    const {logout} = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await UserService.deleteUser();
            await logout();

            setLoading(false);
            onClose();

            router.replace('/auth');
        } catch (err) {
            console.error("Error deleting account:", err);
            setLoading(false);
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            >
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View
                    style={{
                        width: '85%',
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 25,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: 8,
                        }}
                    >
                        {t('delete-account.header')}
                    </Text>

                    <Text
                        style={{
                            fontSize: 15,
                            color: '#6B7280',
                            marginBottom: 20,
                            lineHeight: 20,
                        }}
                    >
                        {t('delete-account.explanation')}
                    </Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 12,
                        }}
                    >
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={loading}
                            style={{
                                height: 40,
                                paddingHorizontal: 20,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minWidth: 90,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#6b7280',
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}
                            >
                                {t('delete-account.no')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={{
                                height: 40,
                                paddingHorizontal: 20,
                                borderRadius: 10,
                                backgroundColor: loading ? '#fca5a5' : '#ef4444',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minWidth: 90,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: '600',
                                    }}
                                >
                                    {t('delete-account.yes')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default DeleteAccountModal;