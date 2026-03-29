import {Note} from "@/types/trip/notes";
import React, {useState} from "react";
import {LayoutAnimation, Text, TouchableOpacity, View} from "react-native";
import {ChevronDown, ChevronUp} from "lucide-react-native";

export default function NoteCard({ note }: { note: Note }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = note.text.length > 120;

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(prev => !prev);
    };

    return (
        <View className="bg-white rounded-xl p-3 mt-2 border border-gray-200">
            <Text
                className="text-sm text-gray-700"
                numberOfLines={expanded ? undefined : 3}
            >
                {note.text}
            </Text>
            {isLong && (
                <TouchableOpacity
                    onPress={toggle}
                    activeOpacity={0.7}
                >
                    {expanded ? (
                        <View className="flex-row items-center gap-1 mt-2 self-start">
                            <ChevronUp size={14} color="#7f22fe" />
                            <Text className="text-xs font-semibold text-violet-700">Show less</Text>
                        </View>
                    ) : (
                        <View className="flex-row items-center gap-1 mt-2 self-start">
                            <ChevronDown size={14} color="#7f22fe" />
                            <Text className="text-xs font-semibold text-violet-700">Read more</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}