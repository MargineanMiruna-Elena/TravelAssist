import React, {useState} from 'react';
import UserService from "../service/userService.js";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {useTranslation} from "react-i18next";

function DeleteAccountModal({visible, onClose}) {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        setLoading(true);

        try {
            UserService.deleteUser();
            localStorage.removeItem('user');
            localStorage.removeItem('jwt');
            setLoading(false);
            onClose();
            window.location.href = "/login";
        } catch (err) {
            console.error(err);
        }
    };

    const footer = (
        <div className="flex justify-center gap-3 mt-3">
            <Button
                outlined
                label={t('delete-account.no')}
                className="h-10 !rounded-xl text-lg font-bold !text-violet-700"
                onClick={onClose}
            />
            <Button
                label={t('delete-account.yes')}
                loading={loading}
                onClick={handleSubmit}
                className="h-10 !rounded-xl text-lg font-bold !bg-violet-700"
            />
        </div>
    );

    return (
        <Dialog
            header={t('delete-account.header')}
            visible={visible}
            style={{width: "28rem"}}
            modal
            draggable={false}
            onHide={onClose}
            footer={footer}
        >
            <small className="mb-2 text-gray-500">
                {t('delete-account.explanation')}
            </small>
        </Dialog>
    );
}

export default DeleteAccountModal;