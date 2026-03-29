import React from 'react';
import {
    View, Text, Platform, UIManager,
} from 'react-native';
import { BookOpen } from 'lucide-react-native';
import {NotesSectionProps} from "@/types/props/trip-details-modal-props";
import NoteCard from "@/components/note-card";

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TripNotesSection({ notes }: NotesSectionProps) {
    return (
        <View className="px-5 py-4 border-b border-gray-100">
            <View className="flex-row items-center gap-2">
                <BookOpen size={18} color="#7f22fe" />
                <Text className="text-base font-bold text-black tracking-wider">SAVED MESSAGES</Text>
            </View>

            {notes.length === 0 ? (
                <Text className="text-sm font-normal text-gray-500 w-full self-center p-2 m-1">No saved messages for this trip.</Text>
            ) : (
                notes.map(note => <NoteCard key={note.id} note={note} />)
            )}
        </View>
    );
}