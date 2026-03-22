import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Note {
    id: string;
    text: string;
}

interface Props {
    notes: Note[];
}

function NoteCard({ note }: { note: Note }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = note.text.length > 120;

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(prev => !prev);
    };

    return (
        <View style={styles.card}>
            <Text
                style={styles.noteText}
                numberOfLines={expanded ? undefined : 3}
            >
                {note.text}
            </Text>
            {isLong && (
                <TouchableOpacity style={styles.expandBtn} onPress={toggle} activeOpacity={0.7}>
                    {expanded ? (
                        <>
                            <ChevronUp size={14} color="#7f22fe" />
                            <Text style={styles.expandText}>Show less</Text>
                        </>
                    ) : (
                        <>
                            <ChevronDown size={14} color="#7f22fe" />
                            <Text style={styles.expandText}>Read more</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function TripNotesSection({ notes }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <BookOpen size={16} color="#7f22fe" />
                <Text style={styles.sectionTitle}>Remembered Messages</Text>
            </View>

            {notes.length === 0 ? (
                <Text style={styles.emptyText}>No remembered messages for this trip.</Text>
            ) : (
                notes.map(note => <NoteCard key={note.id} note={note} />)
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptyText: {
        fontSize: 14,
        color: '#bbb',
    },
    card: {
        backgroundColor: '#fafafa',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#efefef',
    },
    noteText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    expandText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#7f22fe',
    },
});