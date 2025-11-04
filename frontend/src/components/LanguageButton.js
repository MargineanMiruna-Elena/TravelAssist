import {Button, Menu, MenuHandler, MenuItem, MenuList} from "@material-tailwind/react";
import i18n from "i18next";
import React from "react";

function LanguageButton() {
    const languages = [
        { code: "en", name: "English", flag: "assets/flags/en.svg" },
        { code: "ro", name: "Română", flag: "assets/flags/ro.svg" },
        { code: "de", name: "Deutsch", flag: "assets/flags/de.svg" },
    ];

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

    return(
        <Menu>
            <MenuHandler>
                <Button variant="text" size="sm" className="p-1">
                    <img
                        src={currentLanguage.flag}
                        alt={currentLanguage.name}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                </Button>
            </MenuHandler>
            <MenuList>
                {languages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="flex items-center gap-2"
                    >
                        <img
                            src={lang.flag}
                            alt={lang.name}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                        {lang.name}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
}

export default LanguageButton;