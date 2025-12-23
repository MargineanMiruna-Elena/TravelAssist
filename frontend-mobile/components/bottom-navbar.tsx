// import React, {useEffect, useState} from "react";
// import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
// import { Home, User, MapPin, MessageCircle } from "lucide-react-native";
//
// export function BottomNavbar() {
//     const [activeTab, setActiveTab] = useState("dashboard");
//
//     useEffect(() => {
//         console.log("BottomNavbar mounted");
//     }, []);
//
//     const navItems = [
//         { id: "dashboard", label: "Dashboard", icon: Home },
//         { id: "account", label: "Account", icon: User },
//         { id: "map", label: "Map", icon: MapPin },
//         { id: "localbuddy", label: "LocalBuddy", icon: MessageCircle },
//     ];
//
//     return (
//         <View style={styles.container}>npm install lucide-react-native
//             <View style={styles.navbar}>
//                 {navItems.map((item) => {
//                     const Icon = item.icon;
//                     const isActive = activeTab === item.id;
//
//                     return (
//                         <TouchableOpacity
//                             key={item.id}
//                             onPress={() => setActiveTab(item.id)}
//                             style={[
//                                 styles.navButton,
//                                 isActive && styles.navButtonActive,
//                             ]}
//                         >
//                             <Icon
//                                 size={24}
//                                 color={isActive ? "#fff" : "#6d28d9"}
//                             />
//                             <Text
//                                 style={[
//                                     styles.navLabel,
//                                     isActive && styles.navLabelActive,
//                                 ]}
//                             >
//                                 {item.label}
//                             </Text>
//                         </TouchableOpacity>
//                     );
//                 })}
//             </View>
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     container: {
//         position: "absolute",
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: "#fff",
//     },
//     navbar: {
//         flexDirection: "row",
//         justifyContent: "space-around",
//         alignItems: "center",
//         paddingVertical: 12,
//         paddingBottom: 20,
//         borderTopWidth: 1,
//         borderTopColor: "#ede9fe",
//         shadowColor: "#7c3aed",
//         shadowOffset: { width: 0, height: -2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 5,
//     },
//     navButton: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 10,
//         marginHorizontal: 4,
//     },
//     navButtonActive: {
//         backgroundColor: "#7c3aed",
//     },
//     navLabel: {
//         fontSize: 11,
//         marginTop: 4,
//         color: "#6d28d9",
//         fontWeight: "500",
//     },
//     navLabelActive: {
//         color: "#fff",
//     },
// });