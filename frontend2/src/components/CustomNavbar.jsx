import React, {useContext} from "react";
import { useTranslation } from "react-i18next";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import LanguageButton from "./LanguageButton";
import Logo from "./Logo.jsx";
import {AuthContext} from "../context/AuthContext.jsx";

export function CustomNavbar() {
    const { t } = useTranslation();
    const { logout } =useContext(AuthContext);

    const navbarOptions = [
        {
            label: t("navbar.dashboard"),
            template: () => (
                <Link to="/dashboard" className="text-md p-3 rounded-lg text-violet-700 hover:text-indigo-700 hover:bg-indigo-50">
                    { t("navbar.dashboard") }
                </Link>
            ),
        },
        {
            label: t("navbar.account"),
            template: () => (
                <Link to="/account" className="text-md p-3 rounded-lg text-violet-700 hover:text-indigo-700 hover:bg-indigo-50">
                    { t("navbar.account") }
                </Link>
            ),
        },
    ];

    const start = (
        <Link to="/dashboard">
            <Logo className="mx-8 text-3xl" />
        </Link>
    );

    const end = (
        <div className="hidden lg:flex items-center gap-1">
            <LanguageButton />
            <Button
                icon="pi pi-sign-out"
                className="!mr-5 !size-9 !rounded-full !text-white !bg-violet-700"
                onClick={logout}
            />
        </div>
    );

    return (
        <>
            <div className="card border border-violet-100 shadow-md shadow-violet-200 sticky z-50 bg-white m-4 rounded-xl">
                <Menubar
                    model={navbarOptions}
                    start={start}
                    end={end}
                    className="!p-0 !bg-none !border-none"
                />
            </div>
        </>
    );
}
