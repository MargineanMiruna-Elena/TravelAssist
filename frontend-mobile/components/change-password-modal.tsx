import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { validateConfirmPassword, validatePassword } from '@/utils/formValidators';
import UserService from '@/services/user-service';
import { Ionicons } from '@expo/vector-icons';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const { t } = useTranslation();
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validare parolă nouă
        const passwordError = validatePassword(passwordData.newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Validare confirmare parolă
        const validationError = validateConfirmPassword(
            passwordData.newPassword,
            passwordData.confirmPassword
        );

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await UserService.changePassword(
                passwordData.oldPassword,
                passwordData.newPassword
            );
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            onClose();
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data.detail);
            } else {
                setError('api-errors.something-wrong');
            }
        } finally {
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
                            marginBottom: 20,
                        }}
                    >
                        {t('change-password.header')}
                    </Text>

                    <View style={{ marginBottom: 16 }}>
                        {/* Old Password */}
                        <View style={{ position: 'relative', marginBottom: 12 }}>
                            <TextInput
                                secureTextEntry={!showPasswords.oldPassword}
                                value={passwordData.oldPassword}
                                onChangeText={(text) => {
                                    setPasswordData({
                                        ...passwordData,
                                        oldPassword: text,
                                    });
                                    if (error) setError('');
                                }}
                                placeholder={t('change-password.old-password')}
                                placeholderTextColor="#9ca3af"
                                style={{
                                    height: 48,
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingRight: 48,
                                    fontSize: 16,
                                    backgroundColor: '#f9fafb',
                                    color: '#111827',
                                }}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setShowPasswords({
                                        ...showPasswords,
                                        oldPassword: !showPasswords.oldPassword,
                                    })
                                }
                                style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 12,
                                }}
                            >
                                <Ionicons
                                    name={showPasswords.oldPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* New Password */}
                        <View style={{ position: 'relative', marginBottom: 12 }}>
                            <TextInput
                                secureTextEntry={!showPasswords.newPassword}
                                value={passwordData.newPassword}
                                onChangeText={(text) => {
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword: text,
                                    });
                                    if (error) setError('');
                                }}
                                placeholder={t('change-password.new-password')}
                                placeholderTextColor="#9ca3af"
                                style={{
                                    height: 48,
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingRight: 48,
                                    fontSize: 16,
                                    backgroundColor: '#f9fafb',
                                    color: '#111827',
                                }}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setShowPasswords({
                                        ...showPasswords,
                                        newPassword: !showPasswords.newPassword,
                                    })
                                }
                                style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 12,
                                }}
                            >
                                <Ionicons
                                    name={showPasswords.newPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <View style={{ position: 'relative' }}>
                            <TextInput
                                secureTextEntry={!showPasswords.confirmPassword}
                                value={passwordData.confirmPassword}
                                onChangeText={(text) => {
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword: text,
                                    });
                                    if (error) setError('');
                                }}
                                placeholder={t('change-password.confirm-password')}
                                placeholderTextColor="#9ca3af"
                                style={{
                                    height: 48,
                                    borderWidth: 1,
                                    borderColor: error ? '#ef4444' : '#d1d5db',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingRight: 48,
                                    fontSize: 16,
                                    backgroundColor: '#f9fafb',
                                    color: '#111827',
                                }}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setShowPasswords({
                                        ...showPasswords,
                                        confirmPassword: !showPasswords.confirmPassword,
                                    })
                                }
                                style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 12,
                                }}
                            >
                                <Ionicons
                                    name={
                                        showPasswords.confirmPassword ? 'eye-off' : 'eye'
                                    }
                                    size={24}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 6 }}>
                            {error ? (
                                <Text
                                    style={{
                                        color: '#ef4444',
                                        fontSize: 14,
                                        textAlign: 'right',
                                        lineHeight: 14,
                                    }}
                                >
                                    {t(error)}
                                </Text>
                            ) : null}
                        </View>
                    </View>

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
                                paddingHorizontal: 16,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#7c3aed',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    color: '#7c3aed',
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}
                            >
                                {t('change-password.cancel')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={{
                                height: 40,
                                paddingHorizontal: 20,
                                borderRadius: 10,
                                backgroundColor: loading ? '#c4b5fd' : '#7c3aed',
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
                                    {t('change-password.save')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ChangePasswordModal;