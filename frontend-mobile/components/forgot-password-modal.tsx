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
import { validateEmail } from '@/utils/formValidators';
import { resetPassward } from '@/services/auth-service';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ visible, onClose }: Props) {
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        try {
            setLoading(true);
            await resetPassward(email);
            setError('');
            onClose();
        } catch (err: any) {
            setError(t('api-errors.something-wrong'));
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
                            marginBottom: 8,
                        }}
                    >
                        {t('forgot-password.header')}
                    </Text>

                    <Text
                        style={{
                            fontSize: 15,
                            color: '#6B7280',
                            marginBottom: 16,
                        }}
                    >
                        {t('forgot-password.explanation')}
                    </Text>

                    <View style={{ marginBottom: 16 }}>
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) setError('');
                            }}
                            onBlur={() => setError(validateEmail(email))}
                            placeholder={t('forgot-password.email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={{
                                height: 48,
                                borderWidth: 1,
                                borderColor: error ? '#ef4444' : '#d1d5db',
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                fontSize: 16,
                                backgroundColor: '#f9fafb',
                                color: '#111827',
                            }}
                        />

                        <View style={{ marginTop: 6 }}>
                            {error ? (
                                <Text style={{
                                    color: '#ef4444',
                                    fontSize: 14,
                                    textAlign: 'right',
                                    lineHeight: 14
                                }}>
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
                                {t('forgot-password.cancel')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={{
                                height: 40,
                                paddingHorizontal: 20,
                                borderRadius: 10,
                                backgroundColor: loading
                                    ? '#c4b5fd'
                                    : '#7c3aed',
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
                                    {t('forgot-password.send')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
