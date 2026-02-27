import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const Logo = ({ name = "", className = "", style = {} }) => {
    const getSizeFromClassName = (className: string | string[]) => {
        const sizeMap = {
            'text-sm': 14,
            'text-base': 16,
            'text-lg': 18,
            'text-xl': 20,
            'text-2xl': 24,
            'text-3xl': 30,
            'text-4xl': 36,
            'text-5xl': 48,
            'text-6xl': 60,
        };

        for (const [key, value] of Object.entries(sizeMap)) {
            if (className.includes(key)) {
                return value;
            }
        }
        return 48;
    };

    const fontSize = getSizeFromClassName(className);
    const gradientHeight = fontSize * 1.8;

    return (
        <View style={[styles.container, style]}>
            <MaskedView
                style={{ height: gradientHeight }}
                maskElement={
                    <View style={{ height: gradientHeight, justifyContent: 'center' }}>
                        <Text style={[styles.travelText, { fontSize }]}>Travel</Text>
                    </View>
                }
            >
                <LinearGradient
                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, { height: gradientHeight }]}
                >
                    <Text style={[styles.travelText, { fontSize, opacity: 0 }]}>
                        Travel
                    </Text>
                </LinearGradient>
            </MaskedView>

            <Text style={[styles.assistText, { fontSize, marginLeft: fontSize * 0.2 }]}>
                {name}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    travelText: {
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    gradient: {
        justifyContent: 'center',
    },
    assistText: {
        fontWeight: '300',
        fontStyle: 'italic',
        color: '#7f22fe',
    },
});

export default Logo;