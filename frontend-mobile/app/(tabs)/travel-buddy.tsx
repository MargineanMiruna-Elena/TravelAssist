import React, {useState, useRef, useEffect} from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Send, Plus, X, CheckCircle2, BookmarkPlus} from 'lucide-react-native';
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import Logo from "@/components/logo";
import {ChatService} from '@/services/chat-service';
import {useTranslation} from "react-i18next";
import {Trip} from "@/types/trip/trip";
import TripService from "@/services/trip-service";
import {HistoryDrawer} from "@/components/history-drawer";
import {ContextModal} from "@/components/context-modal";
import {ChatSession} from "@/types/chat/chat-session";
import UserService from "@/services/user-service";
import {Message} from "@/types/chat/message";

const {width} = Dimensions.get('window');

export default function TravelBuddy() {
    const {t} = useTranslation();

    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoadingTrips, setIsLoadingTrips] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedContext, setSelectedContext] = useState<Trip | null>(null);
    const [isContextModalVisible, setIsContextModalVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [rememberedMessages, setRememberedMessages] = useState<Set<string>>(new Set());

    const scrollViewRef = useRef<ScrollView>(null);

    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    useEffect(() => {
        fetchUserTrips();
    }, []);

    const fetchUserTrips = async () => {
        setIsLoadingTrips(true);
        try {
            const data = await TripService.getTripsForUser();
            setTrips(data);
        } catch (error) {
            console.error("Failed to load trips for context:", error);
        } finally {
            setIsLoadingTrips(false);
        }
    };

    const fetchChatHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const user = await UserService.getCurrentUser();
            const data = await ChatService.getHistory(user.id);
            setChatHistory(data);
        } catch (error) {
            console.error("Failed to load chat history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const sendMessage = async () => {
        if (inputText.trim() === '') return;

        const userMessageText = inputText;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: userMessageText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            const chatResponse = await ChatService.sendMessage(
                userMessageText,
                sessionId,
                selectedContext?.id
            );

                if (chatResponse?.sessionId) {
                    setSessionId(chatResponse.sessionId);
                }

                const aiResponse: Message = {
                    id: chatResponse?.messageId ?? Date.now().toString(),
                    text: chatResponse?.aiText ?? 'TravelBuddy encountered an error while processing your message. Please try again later!',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setSessionId(null);
        setSelectedContext(null);
        setIsHistoryVisible(false);
    };

    const loadSession = async (session: ChatSession) => {
        setIsHistoryVisible(false);
        setIsTyping(true);
        try {
            const messages = await ChatService.getMessages(session.sessionId);
            setMessages(messages);
            setSessionId(session.sessionId);

            const alreadyRemembered = new Set(
                messages.filter(m => m.remembered).map(m => m.id)
            );
            setRememberedMessages(alreadyRemembered);

            if (session.tripId) {
                const trip = trips.find(t => t.id === session.tripId);
                setSelectedContext(trip ?? null);
            } else {
                setSelectedContext(null);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleRemember = async (messageId: string) => {
        try {
            await ChatService.rememberMessage(messageId);
            setRememberedMessages(prev => new Set(prev).add(messageId));
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? {...msg, remembered: true} : msg
            ));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <View className="px-5 py-2 flex-row items-center justify-between border-b border-gray-100">
                <Logo name="Buddy" className="text-xl"/>
                <TouchableOpacity
                    onPress={() => {
                        fetchChatHistory();
                        setIsHistoryVisible(true);
                    }}
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
                        <Text className="text-violet-700 font-bold text-xs">Context: {selectedContext.destination}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedContext(null)}>
                        <X size={16} color="#7f22fe"/>
                    </TouchableOpacity>
                </View>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-5 pt-4"
                    contentContainerStyle={{ paddingBottom: 16 }}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-row items-end gap-2 mb-6">
                        <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center">
                            <MaterialCommunityIcons name="robot" size={18} color="#7f22fe"/>
                        </View>
                        <View className="max-w-[85%] px-4 py-3 rounded-2xl bg-violet-100 rounded-bl-none">
                            <Text
                                className="text-[15px] leading-5 text-gray-800">{t('bot.welcome-message')}
                            </Text>
                        </View>
                    </View>
                    {messages.map((msg) => (
                        <View key={msg.id} className={`mb-6 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <View className="flex-row items-end gap-2">
                                {msg.sender === 'ai' && (
                                    <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center">
                                        <MaterialCommunityIcons name="robot" size={18} color="#7f22fe"/>
                                    </View>
                                )}
                                <View className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                    msg.sender === 'user' ? 'bg-violet-600 rounded-br-none' : 'bg-violet-100 rounded-bl-none'
                                }`}>
                                    <Text
                                        className={`text-[15px] leading-5 ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}
                                        numberOfLines={0}
                                        ellipsizeMode="clip"
                                    >
                                        {msg.text}
                                    </Text>
                                    <View
                                        className="flex-row justify-between mt-2"
                                    >
                                        {msg.sender === 'ai' && selectedContext && (
                                            <TouchableOpacity
                                                onPress={() => !rememberedMessages.has(msg.id) && handleRemember(msg.id)}
                                                className="flex-row gap-1 pt-2 bg-violet-100"
                                                disabled={rememberedMessages.has(msg.id)}
                                            >
                                                {msg.remembered ? (
                                                    <View className="flex-row gap-1 pt-2">
                                                        <CheckCircle2 size={14} color="#7f22fe"/>
                                                        <Text className="text-[12px] text-violet-700 font-bold">Remembered</Text>
                                                    </View>
                                                ) : (
                                                    <View className="flex-row gap-1 pt-2">
                                                        <BookmarkPlus size={14} color="#7f22fe"/>
                                                        <Text className="text-[12px] text-violet-700 font-bold">Remember in context</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                        <Text
                                            className={`text-[10px] mt-1 self-end ${msg.sender === 'user' ? 'text-violet-200' : 'text-gray-400'}`}>{msg.timestamp}</Text>
                                    </View>
                                </View>
                            </View>


                        </View>
                    ))}

                    {/* --- TYPING INDICATOR --- */}
                    {isTyping && (
                        <View className="items-start mb-6">
                            <View className="flex-row items-end gap-2">
                                <View className="w-8 h-8 rounded-full bg-violet-100 items-center justify-center mb-1">
                                    <MaterialCommunityIcons name="robot" size={18} color="#7f22fe"/>
                                </View>
                                <View className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex-row gap-1">
                                    <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                          style={{opacity: 0.6}}/>
                                    <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                          style={{opacity: 0.8}}/>
                                    <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"/>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* --- INPUT AREA --- */}
                <View
                    className="px-4 py-3 bg-transparent"
                >
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={() => setIsContextModalVisible(true)}
                                          className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
                            <Plus size={22} color={selectedContext ? "#7f22fe" : "#9ca3af"}/>
                        </TouchableOpacity>
                        <View
                            className="flex-1 flex-row items-center bg-gray-50 rounded-3xl px-4 py-1 border border-gray-200">
                            <TextInput
                                className="flex-1 min-h-[40px] text-gray-800 pt-3"
                                placeholder="Type a message..."
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                placeholderTextColor="gray"
                            />
                            <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()}>
                                <LinearGradient
                                    colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                                    className="w-9 h-9 rounded-full items-center justify-center"
                                >
                                    <Send size={16} color="white"/>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* --- RIGHT HISTORY PANEL (DRAWER) --- */}
            <HistoryDrawer
                isVisible={isHistoryVisible}
                onClose={() => setIsHistoryVisible(false)}
                history={chatHistory}
                isLoading={isLoadingHistory}
                onNewChat={startNewChat}
                onSelectSession={loadSession}
            />

            {/* --- CONTEXT SELECTION MODAL --- */}
            <ContextModal
                isVisible={isContextModalVisible}
                onClose={() => setIsContextModalVisible(false)}
                trips={trips}
                isLoading={isLoadingTrips}
                selectedContextId={selectedContext?.id}
                onSelectContext={(trip: Trip) => {
                    setSelectedContext(trip);
                    setIsContextModalVisible(false);
                }}
                t={t}
            />
        </SafeAreaView>
    );
}