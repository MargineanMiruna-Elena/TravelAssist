import React, { useRef } from "react";
import i18n from "i18next";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

function LanguageButton() {
    const op = useRef(null);

    const languages = [
        { code: "en", name: "English", flag: "flags/en.svg" },
        { code: "ro", name: "Română", flag: "flags/ro.svg" },
        { code: "de", name: "Deutsch", flag: "flags/de.svg" },
    ];

    const currentLanguage =
        languages.find((l) => l.code === i18n.language) || languages[0];

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        op.current.hide();
    };

    return (
        <>
            <Button
                onClick={(e) => op.current.toggle(e)}
                text
                className="language-button"
            >
                <img
                    src={currentLanguage.flag}
                    alt={currentLanguage.name}
                    className="size-8 rounded-full object-cover"
                />
            </Button>

            <OverlayPanel
                ref={op}
                dismissable
                className="!p-0"
            >
                <div className="flex flex-col">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        >
                            <img
                                src={lang.flag}
                                alt={lang.name}
                                className="size-6 rounded-full object-cover"
                            />
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            </OverlayPanel>
        </>
    );
}

export default LanguageButton;
