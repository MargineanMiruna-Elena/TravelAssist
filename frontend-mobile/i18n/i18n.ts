import i18n, { LanguageDetectorModule } from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import ro from "./locales/ro.json";
import de from "./locales/de.json";

const languageDetector: LanguageDetectorModule = {
    type: 'languageDetector',
    detect: () => {
        const locales = Localization.getLocales();
        return locales[0]?.languageCode || "en";
    },
    init: () => {},
    cacheUserLanguage: () => {},
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources: {
            en: { translation: en },
            ro: { translation: ro },
            de: { translation: de },
        },
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;