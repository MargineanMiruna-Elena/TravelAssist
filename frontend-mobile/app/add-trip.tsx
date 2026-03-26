import React, {useRef, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import TripService from "@/services/trip-service";
import UserService from "@/services/user-service";
import {useRouter} from "expo-router";;
import LocationStep from "@/components/add-trip/location-step";
import DatesStep from "@/components/add-trip/dates-step";
import DurationStep from "@/components/add-trip/duration-step";
import InterestsStep from "@/components/add-trip/interests-step";
import PreferencesStep from "@/components/add-trip/preferences-step";
import DestinationsStep from "@/components/add-trip/destinations-step";
import AttractionsStep from "@/components/add-trip/attractions-step";

export default function AddTrip() {
    const {t} = useTranslation();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

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
                return tripData.selectedAttractions.length === 0;
            default:
                return false;
        }
    })();

    const calculateDuration = () => {
        if (tripData.dateType === 'specific' && tripData.startDate && tripData.endDate) {
            const start = new Date(tripData.startDate);
            const end = new Date(tripData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays || 1;
        }
        return tripData.duration || null;
    };

    const calculateSelectedMonths = (): number[] => {
        if (!tripData.startDate || !tripData.endDate) return tripData.selectedMonths;
        const startDate = new Date(tripData.startDate);
        const endDate = new Date(tripData.endDate);
        const months = new Set<number>();

        let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (current <= endDate) {
            months.add(current.getMonth() + 1);
            current.setMonth(current.getMonth() + 1);
        }
        return Array.from(months);
    };

    const handleNext = async () => {
        const months = (tripData.startDate && tripData.endDate) ? calculateSelectedMonths() : tripData.selectedMonths;
        const duration = (tripData.startDate && tripData.endDate) ? calculateDuration() : tripData.duration;

        const isPreferencesStep = (() => {
            let actualStep = currentStep;
            if (tripData.dateType === 'specific' && actualStep >= 2) actualStep += 1;
            if (!showSuggested && actualStep === 5) actualStep += 1;
            return actualStep === 4;
        })();

        const isDestinationsStep = (() => {
            let actualStep = currentStep;
            if (tripData.dateType === 'specific' && actualStep >= 2) actualStep += 1;
            if (!showSuggested && actualStep === 5) actualStep += 1;
            return actualStep === 5;
        })();

        if (isPreferencesStep) {
            setIsLoading(true);
            try {
                if (tripData.startDate && tripData.endDate) {
                    updateTripData('selectedMonths', months);
                    updateTripData('duration', duration);
                }

                if (tripData.isLocationFlexible) {

                    setShowSuggestedFallback(true);
                    setFallbackMessage(null);
                    const destinations = await TripService.getRecommendedDestinations({
                        interests: tripData.interests,
                        selectedMonths: months,
                        duration: duration,
                        additionalNotes: tripData.additionalNotes,
                        country: null,
                    });
                    setSuggestedDestinations(destinations);
                    setCurrentStep(currentStep + 1);
                    return;
                }

                if (tripData.selectedDestination) {
                    const attractions = await TripService.getAttractionsForDestination(tripData.selectedDestination, tripData.interests);
                    setSuggestedAttractions(attractions);
                    setCurrentStep(currentStep + 1);
                    return;
                }

                if (!tripData.location.trim() && tripData.country.trim()) {
                    setShowSuggestedFallback(true);
                    const fallbackCountry = tripData.country.trim();
                    const destinations = await TripService.getRecommendedDestinations({
                        interests: tripData.interests,
                        selectedMonths: months,
                        duration: duration,
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
                        const created = await TripService.findOrCreateDestination(tripData.location.trim(), tripData.country.trim());
                        if (created) {
                            updateTripData('selectedDestination', created.id);
                            const attractions = await TripService.getAttractionsForDestination(created.id, tripData.interests);
                            setSuggestedAttractions(attractions);
                            setCurrentStep(currentStep + 1);
                            return;
                        }
                    } catch (e) {
                    }
                }

                setShowSuggestedFallback(true);
                const fallbackCountry = tripData.country.trim();
                setFallbackMessage(
                    tripData.location.trim()
                        ? fallbackCountry
                            ? ` ${t("trip.fallback.location-not-found")} "${tripData.location.trim()}". ${t("trip.fallback.country-destinations")} ${fallbackCountry}.`
                            : `${t("trip.fallback.location-not-found")} "${tripData.location.trim()}". ${t("trip.fallback.other-suggestions")}`
                        : null
                );

                const destinations = await TripService.getRecommendedDestinations({
                    interests: tripData.interests,
                    selectedMonths: months,
                    duration: duration,
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

        if (isDestinationsStep && showSuggested) {
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

    const handleLocationChange = (text: string) => {
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
                } catch {
                    setCitySuggestions([]);
                    setActiveDropdown(null);
                }
            }, 400);
        } else {
            setCitySuggestions([]);
            setActiveDropdown(null);
        }
    };

    const handleCountryChange = (text: string) => {
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
                } catch {
                    setCountrySuggestions([]);
                    setActiveDropdown(null);
                }
            }, 400);
        } else {
            setCountrySuggestions([]);
            setActiveDropdown(null);
        }
    };

    const handleCitySelect = (dest: any) => {
        updateTripData('location', dest.name);
        updateTripData('country', dest.country);
        updateTripData('selectedDestination', dest.id);
        updateTripData('isCountryAutoFilled', true);
        setCitySuggestions([]);
        setActiveDropdown(null);
        setFallbackMessage(null);
        setShowSuggestedFallback(false);
    };

    const handleCountrySelect = (country: string) => {
        updateTripData('country', country);
        setCountrySuggestions([]);
        setActiveDropdown(null);
    };

    const handleToggleFlexible = () => {
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
    };

    const handleDateChange = (picker: 'start' | 'end', date: Date) => {
        const iso = date.toISOString().split('T')[0];
        if (picker === 'start') {
            const newEndDate = (tripData.endDate && new Date(tripData.endDate) < date) ? '' : tripData.endDate;
            setTripData(prev => ({
                ...prev,
                startDate: iso,
                endDate: newEndDate,
            }));
            setTripData(prev => ({
                ...prev,
                selectedMonths: newEndDate ? calculateSelectedMonths() : []
            }));
        } else {
            setTripData(prev => ({
                ...prev,
                endDate: iso,
            }));
            setTripData(prev => ({
                ...prev,
                selectedMonths: tripData.startDate ? calculateSelectedMonths() : []
            }));
        }
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
                    <LocationStep
                        location={tripData.location}
                        country={tripData.country}
                        isLocationFlexible={tripData.isLocationFlexible}
                        isCountryAutoFilled={tripData.isCountryAutoFilled}
                        citySuggestions={citySuggestions}
                        countrySuggestions={countrySuggestions}
                        activeDropdown={activeDropdown}
                        onLocationChange={handleLocationChange}
                        onCountryChange={handleCountryChange}
                        onCitySelect={handleCitySelect}
                        onCountrySelect={handleCountrySelect}
                        onToggleFlexible={handleToggleFlexible}
                    />
                );

            case 1:
                return (
                    <DatesStep
                        dateType={tripData.dateType}
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                        selectedMonths={tripData.selectedMonths}
                        activePicker={activePicker}
                        onDateTypeChange={(type) => updateTripData('dateType', type)}
                        onSetActivePicker={setActivePicker}
                        onDateChange={handleDateChange}
                        onToggleMonth={toggleMonth}
                        calculateSelectedMonths={calculateSelectedMonths}
                    />
                );

            case 2:
                return (
                    <DurationStep
                        duration={tripData.duration}
                        onDurationChange={(val) => updateTripData('duration', val)}
                    />
                );

            case 3:
                return (
                    <InterestsStep
                        interests={tripData.interests}
                        onToggle={toggleInterest}
                    />
                );

            case 4: {
                return (
                    <PreferencesStep
                        additionalNotes={tripData.additionalNotes}
                        location={tripData.location}
                        country={tripData.country}
                        dateType={tripData.dateType}
                        startDate={tripData.startDate}
                        endDate={tripData.endDate}
                        selectedMonths={calculateSelectedMonths()}
                        duration={calculateDuration()}
                        interests={tripData.interests}
                        onNotesChange={(val) => updateTripData('additionalNotes', val)}
                    />
                );
            }

            case 5:
                return (
                    <DestinationsStep
                        destinations={suggestedDestinations}
                        selectedDestination={tripData.selectedDestination}
                        fallbackMessage={fallbackMessage}
                        onSelect={(dest) => {
                            updateTripData('selectedDestination', dest.id);
                            updateTripData('location', dest.name);
                        }}
                    />
                );

            case 6:
                return (
                    <AttractionsStep
                        attractions={suggestedAttractions}
                        selectedAttractions={tripData.selectedAttractions}
                        onToggle={toggleAttractions}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-1 bg-violet-50 p-5 pb-14">
                <View className="flex-1 bg-white rounded-2xl p-6 shadow-md" style={{ elevation: 5 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        className="grow-1 pb-3"
                    >
                        {renderStep()}
                    </ScrollView>

                    <View className="flex-row justify-between mt-0 pt-3 border-t border-t-gray-200">
                        <TouchableOpacity
                            onPress={handleBack}
                            disabled={currentStep === 0}
                            className={`flex-row items-center px-4 py-2 rounded-xl bg-gray-100 ${
                                currentStep === 0 ? 'opacity-50' : 'opacity-100'
                            }`}
                            style={{gap: 8}}
                        >
                            <Ionicons name="chevron-back" size={20} color="#374151"/>
                            <Text className="text-base font-semibold text-gray-700 tracking-wide">{t('trip.buttons.prev')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNext} disabled={isNextDisabled || isLoading}>
                            <LinearGradient
                                colors={['#4f39f6', '#7f22fe', '#51a2ff']}
                                className={`flex-row items-center px-5 py-2 rounded-xl ${
                                    isNextDisabled || isLoading ? 'opacity-50' : 'opacity-100'
                                }`}
                                style={{gap: 8}}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white"/>
                                ) : (
                                    <>
                                        <Text className="text-base font-semibold text-white tracking-wide">
                                            {currentStep === totalSteps - 1 ? t('trip.buttons.finish') : t('trip.buttons.next')}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={20} color="white"/>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="absolute bottom-3 left-0 right-0 items-center">
                <View className="flex-row items-center bg-white rounded-3xl py-2 px-4 shadow-md" style={{ gap: 12, elevation: 5 }}>
                    {[...Array(totalSteps)].map((_, idx) => (
                        <View
                            key={idx}
                            className={`rounded-full ${
                                idx === currentStep ? 'w-4 h-4 bg-violet-700' : (
                                    idx < currentStep ? 'w-3 h-3 bg-violet-400' : 'w-3 h-3 bg-gray-200'
                                )
                            }`}
                        />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}