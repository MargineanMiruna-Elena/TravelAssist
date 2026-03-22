import React from 'react';
import {router, Tabs} from 'expo-router';
import {AntDesign, FontAwesome, MaterialCommunityIcons} from '@expo/vector-icons';
import {Platform, View, TouchableOpacity} from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#7f22fe',
                tabBarShowLabel: false,
                tabBarStyle: {
                    width: '100%',
                    alignSelf: "center",
                    height: Platform.OS === 'ios' ? 83 : 68,
                    paddingTop: 10,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                },
                tabBarIconStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="view-dashboard-outline" size={32} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="travel-buddy"
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="robot-confused" size={32} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add-trip-placeholder"
                options={{
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            onPress={() => router.push('/add-trip')}
                            style={[props.style, { justifyContent: 'center', alignItems: 'center' }]}
                            activeOpacity={0.7}
                        >
                            <View style={{
                                backgroundColor: '#7f22fe',
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: Platform.OS === 'ios' ? 15 : 25,
                                elevation: 5,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 3,
                            }}>
                                <AntDesign name="plus" size={32} color="white" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="globe" size={32} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-circle" size={32} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}