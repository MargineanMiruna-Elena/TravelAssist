import React, {useState, useRef} from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    SafeAreaView, Image, KeyboardAvoidingView, Platform, Modal, Dimensions, Animated
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Send, Plus, MapPin, X, CheckCircle2, BookmarkPlus, ChevronRight} from 'lucide-react-native';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import Logo from "@/components/logo";
import {BlurView} from "expo-blur";

// --- Tipuri și Date ---
interface Trip {
    id: string;
    destination: string;
    country: string;
    date: string;
    status: 'upcoming' | 'completed';
    image: string;
    description: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    contextId?: string;
}

const TRIPS: Trip[] = [
    {
        id: '1',
        destination: 'Santorini',
        country: 'Greece',
        date: '12 - 18 Oct 2026',
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=500',
        description: 'Explorează străzile albe.'
    },
    {
        id: '2',
        destination: 'Kyoto',
        country: 'Japan',
        date: '05 - 15 Nov 2026',
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500',
        description: 'Grădinile zen de toamnă.'
    }
];

const CHAT_HISTORY = [
    {id: 'h1', title: 'Vacation in Greece', date: 'Yesterday'},
    {id: 'h2', title: 'Japan Itinerary', date: '2 days ago'},
    {id: 'h3', title: 'Flight options Paris', date: 'Last week'},
];

const {width} = Dimensions.get('window');

export default function TravelBuddy() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Bună! Sunt TravelBuddy. Te pot ajuta cu detalii despre Santorini sau Kyoto!",
            sender: 'ai',
            timestamp: '10:00'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedContext, setSelectedContext] = useState<Trip | null>(null);
    const [isContextModalVisible, setIsContextModalVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);

    const sendMessage = () => {
        if (inputText.trim() === '') return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
            contextId: selectedContext?.id
        };
        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: selectedContext
                    ? `I've updated my search for ${selectedContext.destination}. Need tips for Oia?`
                    : "I can help you plan! Try adding a trip as context for better results.",
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* --- HEADER --- */}
            <View className="px-5 py-2 flex-row items-center justify-between border-b border-gray-100">
                <Logo name="Buddy" className="text-xl"/>
                <TouchableOpacity
                    onPress={() => setIsHistoryVisible(true)}
                    className="p-3 bg-violet-100 rounded-full active:bg-violet-200"
                >
                    <Ionicons name="chatbubbles-outline" size={24} color="#7f22fe"/>
                </TouchableOpacity>
            </View>

            {/* --- ACTIVE CONTEXT BAR --- */}
            {selectedContext && (
                <View className="bg-violet-50 px-5 py-2 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                        <CheckCircle2 size={14} color="#7f22fe"/>
                        <Text
                            className="text-violet-700 font-bold text-xs">Context: {selectedContext.destination}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedContext(null)}><X size={16}
                                                                                  color="#7f22fe"/></TouchableOpacity>
                </View>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-5 pt-4"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((msg) => (
                        <View key={msg.id} className={`mb-6 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <View className="flex-row items-end gap-2">
                                {msg.sender === 'ai' && (
                                    <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center mb-1">
                                        <MaterialCommunityIcons name="robot" size={18} color="#7f22fe" />
                                    </View>
                                )}
                                <View className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                    msg.sender === 'user' ? 'bg-violet-600 rounded-tr-none' : 'bg-gray-100 rounded-tl-none'
                                }`}>
                                    <Text className={`text-[15px] leading-5 ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>{msg.text}</Text>
                                    <Text className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>{msg.timestamp}</Text>
                                </View>
                            </View>

                            {/* Buton Remember Context sub mesajele AI */}
                            {msg.sender === 'ai' && !selectedContext && (
                                <TouchableOpacity
                                    onPress={() => setIsContextModalVisible(true)}
                                    className="flex-row items-center gap-1 mt-2 ml-10 border border-violet-200 px-3 py-1.5 rounded-full bg-violet-50/50"
                                >
                                    <BookmarkPlus size={12} color="#7f22fe" />
                                    <Text className="text-[11px] text-violet-700 font-bold">Remember this in context</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* --- INPUT AREA --- */}
                <View
                    className="px-4 py-3 bg-transparent"
                >
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={() => setIsContextModalVisible(true)} className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
                            <Plus size={22} color={selectedContext ? "#7f22fe" : "#9ca3af"} />
                        </TouchableOpacity>
                        <View className="flex-1 flex-row items-center bg-gray-50 rounded-3xl px-4 py-1 border border-gray-200">
                            <TextInput
                                className="flex-1 min-h-[40px] text-gray-800 py-2"
                                placeholder="Mesajul tău..."
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()}>
                                <LinearGradient colors={['#4f39f6', '#7f22fe']} className="w-9 h-9 rounded-full items-center justify-center">
                                    <Send size={16} color="white" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* --- RIGHT HISTORY PANEL (DRAWER) --- */}
            <Modal visible={isHistoryVisible} transparent animationType="fade">
                <View className="flex-1 flex-row">
                    <TouchableOpacity className="flex-1 bg-black/30" onPress={() => setIsHistoryVisible(false)}/>
                    <Animated.View style={{width: width * 0.75}} className="bg-white h-full shadow-2xl p-6 pt-12">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-xl font-extrabold">History</Text>
                            <TouchableOpacity onPress={() => setIsHistoryVisible(false)}><X size={24}
                                                                                            color="black"/></TouchableOpacity>
                        </View>
                        <ScrollView>
                            {CHAT_HISTORY.map(chat => (
                                <TouchableOpacity key={chat.id}
                                                  className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-3">
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900" numberOfLines={1}>{chat.title}</Text>
                                        <Text className="text-gray-400 text-xs">{chat.date}</Text>
                                    </View>
                                    <ChevronRight size={16} color="#9ca3af"/>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity className="mt-auto bg-violet-600 p-4 rounded-2xl items-center">
                            <Text className="text-white font-bold">New Chat</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* --- CONTEXT SELECTION MODAL --- */}
            <Modal animationType="slide" transparent visible={isContextModalVisible}>
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 h-[50%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-extrabold">Select Trip Context</Text>
                            <TouchableOpacity onPress={() => setIsContextModalVisible(false)}
                                              className="p-2 bg-gray-100 rounded-full"><X size={20}
                                                                                          color="black"/></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {TRIPS.map((trip) => (
                                <TouchableOpacity
                                    key={trip.id}
                                    onPress={() => {
                                        setSelectedContext(trip);
                                        setIsContextModalVisible(false);
                                    }}
                                    className={`flex-row items-center p-4 mb-3 rounded-2xl border ${selectedContext?.id === trip.id ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-gray-50'}`}
                                >
                                    <Image source={{uri: trip.image}} className="w-12 h-12 rounded-xl mr-4"/>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900">{trip.destination}</Text>
                                        <Text className="text-gray-500 text-xs">{trip.date}</Text>
                                    </View>
                                    <MapPin size={18} color={selectedContext?.id === trip.id ? "#7f22fe" : "#9ca3af"}/>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}