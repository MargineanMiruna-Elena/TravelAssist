import React, { useEffect, useState } from "react";
import i18n from "i18next";
import { View, Text, TouchableOpacity, Modal, Image, FlatList, StyleSheet, Alert } from "react-native";
import { Asset } from "expo-asset";

interface LanguageButtonProps {
    onLanguageChange?: (lang: string) => void;
}

interface LanguageOption {
    code: string;
    name: string;
    flag: any;
}

function LanguageButton({ onLanguageChange }: LanguageButtonProps) {
    const [visible, setVisible] = useState(false);
    const [currentLang, setCurrentLang] = useState(i18n.language.split('-')[0]);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        const loadImages = async () => {
            try {
                await Asset.loadAsync([
                    require("../assets/flags/en.png"),
                    require("../assets/flags/ro.png"),
                    require("../assets/flags/de.png"),
                ]);
                setImagesLoaded(true);
            } catch (e) {
                console.error("Error loading flags", e);
            }
        };
        loadImages();
    }, []);

    useEffect(() => {
        setCurrentLang(i18n.language.split('-')[0]);
    }, [i18n.language]);

    const languages: LanguageOption[] = [
        { code: "en", name: "English", flag: require("../assets/flags/en.png") },
        { code: "ro", name: "Română", flag: require("../assets/flags/ro.png") },
        { code: "de", name: "Deutsch", flag: require("../assets/flags/de.png") },
    ];

    const currentLanguage =
        languages.find((l) => l.code === currentLang) || languages[0];

    const changeLanguage = (lang: string) => {
        setVisible(false);

        i18n.changeLanguage(lang);
        setCurrentLang(lang);

        if (onLanguageChange) {
            onLanguageChange(lang);
        }
    };

    if (!imagesLoaded) return null;

    return (
        <View>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                className="p-1"
                activeOpacity={0.7}
            >
                <Image
                    source={currentLanguage.flag}
                    style={styles.mainFlag}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                    activeOpacity={1}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={languages}
                                keyExtractor={(item) => item.code}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            changeLanguage(item.code);
                                        }}
                                        style={[
                                            styles.itemRow,
                                            currentLang === item.code && styles.activeItemRow
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={item.flag}
                                            style={styles.listFlag}
                                            resizeMode="cover"
                                        />
                                        <Text style={[
                                            styles.itemText,
                                            currentLang === item.code && styles.activeItemText
                                        ]}>
                                            {item.name}
                                        </Text>
                                        {currentLang === item.code && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainFlag: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6'
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: 280,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 22,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6'
    },
    activeItemRow: {
        backgroundColor: '#f5f3ff'
    },
    listFlag: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 16
    },
    itemText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500'
    },
    activeItemText: {
        color: '#7c3aed',
        fontWeight: '700'
    },
    checkmark: {
        marginLeft: 'auto',
        color: '#7c3aed',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default LanguageButton;