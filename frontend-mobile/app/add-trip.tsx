import React, {useRef, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Image, Modal, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import TripService from "@/services/trip-service";
import DateTimePicker from '@react-native-community/datetimepicker';
import UserService from "@/services/user-service";
import {useRouter} from "expo-router";


export default function AddTrip() {
    const {t} = useTranslation();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const INTERESTS = [
        {id: 'BEACH', label: t('trip.beach'), image: require('@/assets/interests/beach.png')},
        {id: 'CULTURE', label: t('trip.culture'), image: require('@/assets/interests/museum.png')},
        {id: 'CITY_BREAK', label: t('trip.city-break'), image: require('@/assets/interests/city-break.png')},
        {id: 'NATURE', label: t('trip.nature'), image: require('@/assets/interests/nature.png')},
        {id: 'NIGHTLIFE', label: t('trip.nightlife'), image: require('@/assets/interests/nightlife.png')},
        {id: 'GASTRONOMY', label: t('trip.gastronomy'), image: require('@/assets/interests/gastronomy.png')},
        {id: 'ADVENTURE', label: t('trip.adventure'), image: require('@/assets/interests/adventure.png')},
        {id: 'HISTORY', label: t('trip.history'), image: require('@/assets/interests/history.png')},
        {id: 'SHOPPING', label: t('trip.shopping'), image: require('@/assets/interests/shopping.png')},
        {id: 'FAMILY_FRIENDLY', label: t('trip.family-friendly'), image: require('@/assets/interests/family-friendly.png')}
    ];

    const MONTHS = [
        t('trip.jan'), t('trip.feb'), t('trip.mar'), t('trip.apr'), t('trip.may'), t('trip.jun'),
        t('trip.jul'), t('trip.aug'), t('trip.sep'), t('trip.oct'), t('trip.nov'), t('trip.dec')
    ];

    const [tripData, setTripData] = useState<{
        location: string;
        country: string;
        isLocationFlexible: boolean;
        isCountryAutoFilled: boolean;
        dateType: string;
        startDate: string;
        endDate: string;
        selectedMonths: number[];
        duration: string;
        interests: string[];
        additionalNotes: string;
        selectedDestination: string;
        selectedAttractions: string[];
    }>({
        location: '',
        country: '',
        isLocationFlexible: false,
        isCountryAutoFilled: false,
        dateType: '',
        startDate: '',
        endDate: '',
        selectedMonths: [],
        duration: '',
        interests: [],
        additionalNotes: '',
        selectedDestination: '',
        selectedAttractions: []
    });

    // ── Dropdown state ──────────────────────────────────────────────────────────
    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<'city' | 'country' | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const countrySearchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [suggestedDestinations, setSuggestedDestinations] = useState<any[]>([]);
    const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
    const [showSuggestedFallback, setShowSuggestedFallback] = useState(false);
    const [suggestedAttractions, setSuggestedAttractions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

    const showHowLong = tripData.dateType === 'flexible';
    const showSuggested = tripData.isLocationFlexible || showSuggestedFallback;

    const totalSteps = 5 + (showHowLong ? 1 : 0) + (showSuggested ? 1 : 0);

    const isNextDisabled = (() => {
        let actualStep = currentStep;
        if (tripData.dateType === 'specific' && actualStep >= 2) actualStep += 1;
        if (!showSuggested && actualStep === 5) actualStep += 1;

        switch (actualStep) {
            case 0:
                return tripData.location.trim() === '' && tripData.country.trim() === '' && !tripData.isLocationFlexible;
            case 1:
                if (!tripData.dateType) return true;
                if (tripData.dateType === 'specific') return !tripData.startDate || !tripData.endDate;
                if (tripData.dateType === 'flexible') return tripData.selectedMonths.length === 0;
                return false;
            case 2:
                return !tripData.duration || tripData.duration.trim() === '';
            case 3:
                return tripData.interests.length === 0;
            case 4:
                return false;
            case 5:
                return !tripData.selectedDestination;
            case 6:
                return false;
            default:
                return false;
        }
    })();

    const calculateDuration = () => {
        if (tripData.dateType === 'specific' && tripData.startDate && tripData.endDate) {
            const start = new Date(tripData.startDate);
            const end = new Date(tripData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays || 1;
        }
        return tripData.duration || null;
    };

    const calculateSelectedMonths = (start: string, end: string): number[] => {
        if (!start || !end) return [];
        const startDate = new Date(start);
        const endDate = new Date(end);
        const months = new Set<number>();

        // Folosim un loop care merge de la luna de start la cea de final
        let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (current <= endDate) {
            months.add(current.getMonth() + 1); // +1 pentru a avea 1-12
            current.setMonth(current.getMonth() + 1);
        }
        return Array.from(months);
    };

    const handleNext = async () => {
        if (currentStep === 4) {
            setIsLoading(true);
            try {
                if (tripData.startDate && tripData.endDate) {
                    updateTripData('selectedMonths', calculateSelectedMonths(tripData.startDate, tripData.endDate));
                }

                // Cazul 1: userul a ales din dropdown → destinație deja în DB, mergem direct la atracții
                if (tripData.selectedDestination) {
                    const attractions = await TripService.getAttractionsForDestination(tripData.selectedDestination, tripData.interests);
                    setSuggestedAttractions(attractions);
                    setCurrentStep(currentStep + 1);
                    return;
                }

                // Cazul 1.5: userul a completat doar țara → tratează ca flexibil
                if (!tripData.location.trim() && tripData.country.trim()) {
                    setShowSuggestedFallback(true);
                    const fallbackCountry = tripData.country.trim();
                    const destinations = await TripService.getRecommendedDestinations({
                        interests: tripData.interests,
                        selectedMonths: tripData.selectedMonths,
                        duration: calculateDuration(),
                        additionalNotes: tripData.additionalNotes,
                        country: fallbackCountry,
                    });

                    const allFromCountry = destinations.length > 0 &&
                        destinations.every((d: any) =>
                            d.country.toLowerCase() === fallbackCountry.toLowerCase()
                        );

                    setFallbackMessage(
                        allFromCountry
                            ? `${t("trip.fallback.country-destinations")} ${fallbackCountry}`
                            : `${t("trip.fallback.not-found")} "${fallbackCountry}". ${t("trip.fallback.other-suggestions")}`
                    );
                    setSuggestedDestinations(destinations);
                    setCurrentStep(currentStep + 1);
                    return;
                }

                // Cazul 2: userul a scris manual un oraș
                if (tripData.location.trim()) {
                    const found = await TripService.searchDestination(tripData.location.trim());
                    const match = found.find((d: any) =>
                        d.name.toLowerCase() === tripData.location.trim().toLowerCase() &&
                        (!tripData.country || d.country.toLowerCase() === tripData.country.trim().toLowerCase())
                    );

                    if (match) {
                        updateTripData('selectedDestination', match.id);
                        const attractions = await TripService.getAttractionsForDestination(match.id, tripData.interests);
                        setSuggestedAttractions(attractions);
                        setCurrentStep(currentStep + 1);
                        return;
                    }

                    try {
                        const created = await TripService.findOrCreateDestination(tripData.location.trim());
                        if (created) {
                            updateTripData('selectedDestination', created.id);
                            const attractions = await TripService.getAttractionsForDestination(created.id, tripData.interests);
                            setSuggestedAttractions(attractions);
                            setCurrentStep(currentStep + 1);
                            return;
                        }
                    } catch (e) {
                        // Nu a găsit în GeoDB → fallback la recomandări
                    }
                }

                // Cazul 3: fallback → recomandă destinații din țara respectivă
                setShowSuggestedFallback(true);
                const fallbackCountry = tripData.country.trim();
                setFallbackMessage(
                    tripData.location.trim()
                        ? fallbackCountry
                            ? ` ${t("trip.fallback.location-not-found")} "${tripData.location.trim()}"+ ${t("trip.fallback.country-destinations")} ${fallbackCountry}:`
                            : `"${tripData.location.trim()}" ${t("trip.fallback.location-not-found")} ${t("trip.fallback.other-suggestions")}`
                        : null
                );
                const destinations = await TripService.getRecommendedDestinations({
                    interests: tripData.interests,
                    selectedMonths: tripData.selectedMonths,
                    duration: calculateDuration(),
                    additionalNotes: tripData.additionalNotes,
                    country: tripData.country.trim() || null,
                });
                setSuggestedDestinations(destinations);
                setCurrentStep(currentStep + 1);
            } catch (error) {
                alert("Couldn't fetch destinations. Try again.");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (currentStep === 5 && showSuggested) {
            setIsLoading(true);
            try {
                const attractions = await TripService.getAttractionsForDestination(tripData.selectedDestination, tripData.interests);
                setSuggestedAttractions(attractions);
                setCurrentStep(currentStep + 1);
            } catch (error) {
                alert("Couldn't fetch the attractions. Try again.");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            console.log('Final Trip Data:', tripData);

            const user = await UserService.getCurrentUser();
            if (!user?.id) throw new Error("No user ID found");

            const newTrip = await TripService.createTrip({
                userId: user.id,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                selectedMonths: tripData.selectedMonths,
                duration: tripData.duration,
                interests: tripData.interests,
                additionalNotes: tripData.additionalNotes,
                selectedDestination: tripData.selectedDestination,
                selectedAttractions: tripData.selectedAttractions
            });
            console.log('New Trip Data:', newTrip);
            router.replace('/(tabs)/dashboard');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const updateTripData = (key: keyof typeof tripData, value: any) => {
        setTripData(prev => ({...prev, [key]: value}));
    };

    const toggleInterest = (interestId: string) => {
        setTripData(prev => ({
            ...prev,
            interests: prev.interests.includes(interestId)
                ? prev.interests.filter(id => id !== interestId)
                : [...prev.interests, interestId]
        }));
    };

    const toggleMonth = (monthIndex: number) => {
        const humanMonth = monthIndex + 1;
        setTripData(prev => ({
            ...prev,
            selectedMonths: prev.selectedMonths.includes(humanMonth)
                ? prev.selectedMonths.filter(m => m !== humanMonth)
                : [...prev.selectedMonths, humanMonth]
        }));
    };

    const toggleAttractions = (attractionId: string) => {
        setTripData(prev => ({
            ...prev,
            selectedAttractions: prev.selectedAttractions.includes(attractionId)
                ? prev.selectedAttractions.filter(id => id !== attractionId)
                : [...prev.selectedAttractions, attractionId]
        }));
    };

    const renderStep = () => {
        let actualStep = currentStep;

        if (tripData.dateType === 'specific' && actualStep >= 2) {
            actualStep += 1;
        }

        if (!showSuggested && actualStep === 5) {
            actualStep += 1;
        }

        switch (actualStep) {
            case 0:
                return (
                    <View>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="location" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.where.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.where.subtitle')}</Text>
                        </View>

                        <View style={styles.inputContainer}>

                            {/* ── Câmp oraș ── */}
                            <View style={[styles.fieldWrapper, {zIndex: 999}]}>
                                <Text style={styles.fieldLabel}>{t('trip.where.city')}</Text>
                                <TextInput
                                    placeholder={t('trip.where.cityPlaceholder')}
                                    value={tripData.location}
                                    onChangeText={(text) => {
                                        updateTripData('location', text);
                                        updateTripData('selectedDestination', '');

                                        if (tripData.isCountryAutoFilled) {
                                            updateTripData('country', '');
                                            updateTripData('isCountryAutoFilled', false);
                                            setCountrySuggestions([]);
                                        }

                                        if (activeDropdown === 'country') setActiveDropdown(null);

                                        clearTimeout(searchTimeout.current);
                                        if (text.length >= 2) {
                                            searchTimeout.current = setTimeout(async () => {
                                                try {
                                                    const data = await TripService.searchDestination(text);
                                                    setCitySuggestions(data);
                                                    setActiveDropdown(data.length > 0 ? 'city' : null);
                                                } catch (e) {
                                                    setCitySuggestions([]);
                                                    setActiveDropdown(null);
                                                }
                                            }, 400);
                                        } else {
                                            setCitySuggestions([]);
                                            setActiveDropdown(null);
                                        }
                                    }}
                                    editable={!tripData.isLocationFlexible}
                                    style={[styles.input, tripData.isLocationFlexible && styles.inputDisabled]}
                                    placeholderTextColor="#9CA3AF"
                                />

                                {activeDropdown === 'city' && citySuggestions.length > 0 && !tripData.isLocationFlexible && (
                                    <View style={styles.suggestionsDropdown}>
                                        {citySuggestions.map((dest) => (
                                            <TouchableOpacity
                                                key={dest.id}
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    updateTripData('location', dest.name);
                                                    updateTripData('country', dest.country);
                                                    updateTripData('selectedDestination', dest.id);
                                                    updateTripData('isCountryAutoFilled', true);
                                                    setCitySuggestions([]);
                                                    setActiveDropdown(null);
                                                    setFallbackMessage(null);
                                                    setShowSuggestedFallback(false);
                                                }}
                                            >
                                                <Ionicons name="location-outline" size={14} color="#7f22fe"/>
                                                <Text style={styles.suggestionItemText}>{dest.name}</Text>
                                                <Text style={styles.suggestionItemCountry}>{dest.country}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* ── Câmp țară ── */}
                            <View style={[styles.fieldWrapper, {zIndex: 998}]}>
                                <Text style={styles.fieldLabel}>{t('trip.where.country')}</Text>
                                <TextInput
                                    placeholder={t('trip.where.countryPlaceholder')}
                                    value={tripData.country}
                                    onChangeText={(text) => {
                                        updateTripData('country', text);
                                        updateTripData('isCountryAutoFilled', false);

                                        if (tripData.selectedDestination) {
                                            updateTripData('location', '');
                                            updateTripData('selectedDestination', '');
                                            setCitySuggestions([]);
                                        }

                                        if (activeDropdown === 'city') setActiveDropdown(null);

                                        clearTimeout(countrySearchTimeout.current);
                                        if (text.length >= 2) {
                                            countrySearchTimeout.current = setTimeout(async () => {
                                                try {
                                                    const data = await TripService.searchCountry(text);
                                                    setCountrySuggestions(data);
                                                    setActiveDropdown(data.length > 0 ? 'country' : null);
                                                } catch (e) {
                                                    setCountrySuggestions([]);
                                                    setActiveDropdown(null);
                                                }
                                            }, 400);
                                        } else {
                                            setCountrySuggestions([]);
                                            setActiveDropdown(null);
                                        }
                                    }}
                                    editable={!tripData.isLocationFlexible}
                                    style={[styles.input, tripData.isLocationFlexible && styles.inputDisabled]}
                                    placeholderTextColor="#9CA3AF"
                                />

                                {activeDropdown === 'country' && countrySuggestions.length > 0 && !tripData.isLocationFlexible && (
                                    <View style={styles.suggestionsDropdown}>
                                        {countrySuggestions.map((country) => (
                                            <TouchableOpacity
                                                key={country}
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    updateTripData('country', country);
                                                    setCountrySuggestions([]);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <Ionicons name="globe-outline" size={14} color="#7f22fe"/>
                                                <Text style={styles.suggestionItemText}>{country}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* ── Checkbox "Sunt flexibil" ── */}
                            <TouchableOpacity
                                onPress={() => {
                                    const newVal = !tripData.isLocationFlexible;
                                    updateTripData('isLocationFlexible', newVal);
                                    if (newVal) {
                                        updateTripData('location', '');
                                        updateTripData('country', '');
                                        updateTripData('selectedDestination', '');
                                        updateTripData('isCountryAutoFilled', false);
                                        setCitySuggestions([]);
                                        setCountrySuggestions([]);
                                        setActiveDropdown(null);
                                    }
                                }}
                                style={styles.checkboxContainer}
                            >
                                <View style={[styles.checkbox, tripData.isLocationFlexible && styles.checkboxChecked]}>
                                    {tripData.isLocationFlexible &&
                                        <Ionicons name="checkmark" size={16} color="white"/>}
                                </View>
                                <Text style={styles.checkboxLabel}>{t('trip.where.checkbox')}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                );

            case 1:
                return (
                    <View>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="calendar" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.when.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.when.subtitle')}</Text>
                        </View>

                        <View style={styles.dateTypeContainer}>
                            <TouchableOpacity
                                onPress={() => updateTripData('dateType', 'specific')}
                                style={styles.dateTypeButtonContainer}
                            >
                                {tripData.dateType === 'specific' ? (
                                    <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.dateTypeButton}>
                                        <Text style={styles.dateTypeButtonTextActive}>{t('trip.when.period')}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.dateTypeButton, styles.dateTypeButtonInactive]}>
                                        <Text style={styles.dateTypeButtonText}>{t('trip.when.period')}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => updateTripData('dateType', 'flexible')}
                                style={styles.dateTypeButtonContainer}
                            >
                                {tripData.dateType === 'flexible' ? (
                                    <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.dateTypeButton}>
                                        <Text style={styles.dateTypeButtonTextActive}>{t('trip.when.months')}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.dateTypeButton, styles.dateTypeButtonInactive]}>
                                        <Text style={styles.dateTypeButtonText}>{t('trip.when.months')}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {tripData.dateType === 'specific' && (
                            <View style={styles.dateInputsContainer}>

                                {/* ── Departure date ── */}
                                <View style={styles.dateInputWrapper}>
                                    <Text style={styles.label}>{t('trip.when.departure-date')}</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setActivePicker('start')}
                                    >
                                        <Ionicons name="calendar-outline" size={18} color="#7f22fe"/>
                                        <Text style={[styles.dateButtonText, !tripData.startDate && styles.dateButtonPlaceholder]}>
                                            {tripData.startDate || t('trip.when.select-date')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* ── Return date ── */}
                                <View style={styles.dateInputWrapper}>
                                    <Text style={styles.label}>{t('trip.when.return-date')}</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setActivePicker('end')}
                                    >
                                        <Ionicons name="calendar-outline" size={18} color="#7f22fe"/>
                                        <Text style={[styles.dateButtonText, !tripData.endDate && styles.dateButtonPlaceholder]}>
                                            {tripData.endDate || t('trip.when.select-date')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* ── Modal cu DatePicker ── */}
                                <Modal
                                    transparent
                                    animationType="fade"
                                    visible={activePicker !== null}
                                    onRequestClose={() => setActivePicker(null)}
                                >
                                    <TouchableOpacity
                                        style={styles.modalOverlay}
                                        activeOpacity={1}
                                        onPress={() => setActivePicker(null)}
                                    >
                                        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                                            <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>
                                                    {activePicker === 'start' ? t('trip.when.departure-date') : t('trip.when.return-date')}
                                                </Text>
                                                <TouchableOpacity onPress={() => setActivePicker(null)}>
                                                    <Text style={styles.modalDone}>✓</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <DateTimePicker
                                                value={
                                                    activePicker === 'start'
                                                        ? (tripData.startDate ? new Date(tripData.startDate) : new Date())
                                                        : (tripData.endDate ? new Date(tripData.endDate) : tripData.startDate ? new Date(tripData.startDate) : new Date())
                                                }
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                                                minimumDate={
                                                    activePicker === 'end' && tripData.startDate
                                                        ? new Date(tripData.startDate)
                                                        : new Date()
                                                }
                                                onChange={(_, date) => {
                                                    if (!date) return;
                                                    const iso = date.toISOString().split('T')[0];

                                                    if (activePicker === 'start') {
                                                        const newEndDate = (tripData.endDate && new Date(tripData.endDate) < date) ? '' : tripData.endDate;

                                                        const newMonths = newEndDate ? calculateSelectedMonths(iso, newEndDate) : [];

                                                        setTripData(prev => ({
                                                            ...prev,
                                                            startDate: iso,
                                                            endDate: newEndDate,
                                                            selectedMonths: newMonths
                                                        }));
                                                    } else {
                                                        const newMonths = tripData.startDate ? calculateSelectedMonths(tripData.startDate, iso) : [];

                                                        setTripData(prev => ({
                                                            ...prev,
                                                            endDate: iso,
                                                            selectedMonths: newMonths
                                                        }));
                                                    }

                                                    if (Platform.OS === 'android') setActivePicker(null);
                                                }}
                                                accentColor="#7f22fe"
                                                textColor="#111827"
                                                themeVariant="light"
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </Modal>
                            </View>
                        )}

                        {tripData.dateType === 'flexible' && (
                            <View style={styles.monthsContainer}>
                                <Text style={styles.label}>{t('trip.when.preferred-months')}</Text>
                                <View style={styles.monthsGrid}>
                                    {MONTHS.map((month, idx) => (
                                        <TouchableOpacity
                                            key={month}
                                            onPress={() => toggleMonth(idx)}
                                            style={styles.monthButtonContainer}
                                        >
                                            {tripData.selectedMonths.includes(idx + 1) ? (
                                                <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.monthButton}>
                                                    <Text style={styles.monthButtonTextActive}>{month}</Text>
                                                </LinearGradient>
                                            ) : (
                                                <View style={[styles.monthButton, styles.monthButtonInactive]}>
                                                    <Text style={styles.monthButtonText}>{month}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 2:
                return (
                    <View>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="time" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.how-long.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.how-long.subtitle')}</Text>
                        </View>

                        <View style={styles.durationContainer}>
                            <TextInput
                                placeholder={t('trip.how-long.textbox')}
                                value={tripData.duration}
                                onChangeText={(text) => updateTripData('duration', text)}
                                keyboardType="numeric"
                                style={styles.input}
                                placeholderTextColor="#9CA3AF"
                            />

                            <View style={styles.durationGrid}>
                                {[3, 5, 7, 10, 14, 21].map(days => (
                                    <TouchableOpacity
                                        key={days}
                                        onPress={() => updateTripData('duration', days.toString())}
                                        style={styles.durationButtonContainer}
                                    >
                                        {tripData.duration === days.toString() ? (
                                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.durationButton}>
                                                <Text style={styles.durationButtonTextActive}>{days} {t('trip.how-long.days')}</Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={[styles.durationButton, styles.durationButtonInactive]}>
                                                <Text style={styles.durationButtonText}>{days} {t('trip.how-long.days')}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="heart" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.interests.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.interests.subtitle')}</Text>
                        </View>

                        <View style={styles.interestsGrid}>
                            {INTERESTS.map(interest => (
                                <TouchableOpacity
                                    key={interest.id}
                                    onPress={() => toggleInterest(interest.id)}
                                    style={styles.interestButtonContainer}
                                >
                                    {tripData.interests.includes(interest.id) ? (
                                        <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.interestButton}>
                                            <Image source={interest.image} style={styles.interestImage} resizeMode="contain"/>
                                            <Text style={styles.interestTextActive}>{interest.label}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={[styles.interestButton, styles.interestButtonInactive]}>
                                            <Image source={interest.image} style={styles.interestImage} resizeMode="contain"/>
                                            <Text style={styles.interestText}>{interest.label}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 4: {
                const dur = calculateDuration();
                const summaryDestination = tripData.location || t('trip.preferences.flexible');
                const summaryPeriod = tripData.dateType === 'specific'
                    ? (tripData.startDate && tripData.endDate ? `${tripData.startDate} - ${tripData.endDate}` : t('trip.preferences.unconfigured'))
                    : (tripData.selectedMonths.length > 0 ? tripData.selectedMonths.map(m => MONTHS[m-1]).join(', ') : t('trip.preferences.flexible'));
                const summaryDuration = dur
                    ? `${dur} ${dur === 1 ? t('trip.preferences.day') : t('trip.how-long.days')}`
                    : t('trip.preferences.unconfigured');
                const summaryInterests = tripData.interests.length > 0
                    ? tripData.interests.map(id => INTERESTS.find(i => i.id === id)?.label).join(', ')
                    : t('trip.preferences.not-selected');

                return (
                    <View>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="document-text" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.preferences.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.preferences.subtitle')}</Text>
                        </View>

                        <TextInput
                            placeholder={t('trip.preferences.example')}
                            value={tripData.additionalNotes}
                            onChangeText={(text) => updateTripData('additionalNotes', text)}
                            multiline
                            numberOfLines={8}
                            style={styles.textArea}
                            placeholderTextColor="#9CA3AF"
                            textAlignVertical="top"
                        />

                        <LinearGradient colors={['#F3E8FF', '#DBEAFE']} style={styles.summaryContainer}>
                            <Text style={styles.summaryTitle}>{t('trip.preferences.summary')}</Text>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>{t('trip.preferences.destination')}</Text>
                                    <Text>{summaryDestination}</Text>
                                </Text>
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>{t('trip.preferences.period')}</Text>
                                    <Text>{summaryPeriod}</Text>
                                </Text>
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>{t('trip.preferences.duration')}</Text>
                                    <Text>{summaryDuration}</Text>
                                </Text>
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>{t('trip.preferences.interests')}</Text>
                                    <Text>{summaryInterests}</Text>
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                );
            }

            case 5:
                return (
                    <View>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="map" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.destinations.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.destinations.subtitle')}</Text>
                        </View>
                        {fallbackMessage && (
                            <View style={styles.fallbackBanner}>
                                <Ionicons name="information-circle-outline" size={18} color="#7f22fe"/>
                                <Text style={styles.fallbackBannerText}>{fallbackMessage}</Text>
                            </View>
                        )}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {suggestedDestinations.map((dest) => (
                                <TouchableOpacity
                                    key={dest.id}
                                    style={[styles.suggestionCard, tripData.selectedDestination === dest.id && styles.activeCard]}
                                    onPress={() => {
                                        updateTripData('selectedDestination', dest.id);
                                        updateTripData('location', dest.name);
                                    }}
                                >
                                    <Image source={{uri: dest.imageUrl}} style={styles.suggestionImage}/>
                                    <View style={styles.suggestionInfo}>
                                        <Text style={styles.suggestionText}>{dest.name}</Text>
                                        <Text style={styles.suggestionCountry}>{dest.country}</Text>
                                    </View>
                                    {tripData.selectedDestination === dest.id &&
                                        <Ionicons name="checkmark-circle" size={24} color="#7f22fe" style={styles.checkIcon}/>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                );

            case 6:
                return (
                    <View style={{ flex: 1 }}>
                        <View style={styles.headerContainer}>
                            <LinearGradient colors={['#7f22fe', '#51a2ff']} style={styles.iconCircle}>
                                <Ionicons name="star" size={40} color="white"/>
                            </LinearGradient>
                            <Text style={styles.title}>{t('trip.attractions.title')}</Text>
                            <Text style={styles.subtitle}>{t('trip.attractions.subtitle')}</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {suggestedAttractions.map((attr) => (
                                <TouchableOpacity
                                    key={attr.xid}
                                    style={[
                                        styles.attractionListItem,
                                        tripData.selectedAttractions.includes(attr.xid) && styles.activeAttractionCard
                                    ]}
                                    onPress={() => toggleAttractions(attr.xid)}
                                >
                                    <View style={styles.suggestionAttractionInfo}>
                                        <Text style={styles.suggestionAttractionText}>{attr.name}</Text>
                                    </View>

                                    {tripData.selectedAttractions.includes(attr.xid) ? (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color="#7f22fe"
                                            style={styles.checkAttractionIcon}
                                        />
                                    ) : (
                                        <View style={styles.circlePlaceholder} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {renderStep()}
                    </ScrollView>

                    <View style={styles.navigation}>
                        <TouchableOpacity
                            onPress={handleBack}
                            disabled={currentStep === 0}
                            style={[styles.navButton, styles.backButton, currentStep === 0 && styles.navButtonDisabled]}
                        >
                            <Ionicons name="chevron-back" size={20} color="#374151"/>
                            <Text style={styles.navButtonText}>{t('trip.buttons.prev')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNext} disabled={isNextDisabled}>
                            <LinearGradient
                                colors={['#7f22fe', '#51a2ff']}
                                style={[styles.nextButton, isNextDisabled && styles.navButtonDisabled]}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentStep === totalSteps - 1 ? t('trip.buttons.finish') : t('trip.buttons.next')}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color="white"/>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.stepIndicator}>
                <View style={styles.stepIndicatorContainer}>
                    {[...Array(totalSteps)].map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.stepDot,
                                idx === currentStep && styles.stepDotActive,
                                idx < currentStep && styles.stepDotPassed
                            ]}
                        />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 20,
        paddingBottom: 60,
    },
    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 5,
    },
    stepIndicator: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#7f22fe',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#7f22fe',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    inputContainer: {
        gap: 16,
    },
    fieldWrapper: {
        marginBottom: 4,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
        marginLeft: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        backgroundColor: 'white',
    },
    inputDisabled: {
        backgroundColor: '#F9FAFB',
        color: '#9CA3AF',
    },
    suggestionsDropdown: {
        position: 'absolute',
        top: 78,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 8,
    },
    suggestionItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
        flex: 1,
    },
    suggestionItemCountry: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#7f22fe',
        borderColor: '#7f22fe',
    },
    checkboxLabel: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    dateTypeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    dateTypeButtonContainer: {
        flex: 1,
    },
    dateTypeButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    dateTypeButtonInactive: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateTypeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    dateTypeButtonTextActive: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
    dateInputsContainer: {
        gap: 16,
    },
    dateInputWrapper: {
        gap: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'white',
        gap: 10,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#111827',
        flex: 1,
    },
    dateButtonPlaceholder: {
        color: '#9CA3AF',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    monthsContainer: {
        gap: 16,
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    monthButtonContainer: {
        width: '30%',
    },
    monthButton: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    monthButtonInactive: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    monthButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    monthButtonTextActive: {
        fontSize: 13,
        fontWeight: '500',
        color: 'white',
    },
    durationContainer: {
        gap: 20,
    },
    durationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    durationButtonContainer: {
        width: '30%',
    },
    durationButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    durationButtonInactive: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    durationButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    durationButtonTextActive: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    interestButtonContainer: {
        width: '48%',
    },
    interestButton: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    interestButtonInactive: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    interestImage: {
        width: 32,
        height: 32,
    },
    interestText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
    },
    interestTextActive: {
        fontSize: 13,
        fontWeight: '500',
        color: 'white',
        flex: 1,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        minHeight: 150,
        backgroundColor: 'white',
    },
    summaryContainer: {
        borderRadius: 16,
        padding: 20,
        marginTop: 18,
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7f22fe',
        marginBottom: 12,
    },
    summaryContent: {
        gap: 10,
    },
    summaryText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    summaryLabel: {
        fontWeight: '600',
        color: '#7f22fe',
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginVertical: 6,
        marginHorizontal: 4,
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    activeCard: {
        borderWidth: 2,
        borderColor: '#7f22fe',
    },
    suggestionImage: {
        width: 100,
        height: 80,
    },
    suggestionInfo: {
        flex: 1,
        paddingHorizontal: 12,
    },
    suggestionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    suggestionCountry: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    checkIcon: {
        marginRight: 12,
    },
    attractionCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 4,
    },
    fallbackBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E6D7FF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#7f22fe',
    },
    fallbackBannerText: {
        fontSize: 13,
        color: '#7f22fe',
        flex: 1,
        lineHeight: 18,
    },
    attractionName: {fontSize: 14, fontWeight: 'bold'},
    attractionCategory: {fontSize: 12, color: '#6B7280'},
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    backButton: {
        backgroundColor: '#F3F4F6',
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    nextButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D1D5DB',
    },
    stepDotActive: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#7f22fe',
    },
    stepDotPassed: {
        backgroundColor: '#A78BFA',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 32,
        paddingHorizontal: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f22fe',
    },
    modalDone: {
        fontSize: 20,
        color: '#7f22fe',
        fontWeight: 'bold',
        paddingHorizontal: 8,
    },
    attractionListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginVertical: 6,
        marginHorizontal: 4,
        paddingVertical: 20, // Spațiu generos pe verticală pentru că nu avem imagine
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    activeAttractionCard: {
        borderColor: '#7f22fe',
        backgroundColor: '#F5F0FF',
        borderWidth: 2,
    },
    suggestionAttractionInfo: {
        flex: 1,
    },
    suggestionAttractionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    checkAttractionIcon: {
        marginLeft: 10,
    },
    circlePlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        marginLeft: 10,
    },
});