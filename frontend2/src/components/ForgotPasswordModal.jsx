import React, {useState} from 'react';
import {validateEmail} from "../utils/formValidators.js";
import {resetPassward} from "../service/authService.js";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dialog} from "primereact/dialog";
import {useTranslation} from "react-i18next";

function ForgotPasswordModal({visible, onClose}) {
    const {t} = useTranslation();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        if (validateEmail(email) !== "") {
            setLoading(false);
            return;
        }

        try {
            await resetPassward(email);
            setError("");
            onClose();
        } catch (err) {
            if (err.response) {
                setError(t(err.response.data.detail))
            } else {
                setError(t('api-errors.something-wrong'));
            }
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div className="flex justify-center gap-3 mt-3">
            <Button
                outlined
                label={t('forgot-password.cancel')}
                className="h-10 !rounded-xl text-lg font-bold !text-violet-700"
                onClick={onClose}
            />
            <Button
                label={t('forgot-password.send')}
                loading={loading}
                onClick={handleSubmit}
                className="h-10 !rounded-xl text-lg font-bold !bg-violet-700"
            />
        </div>
    );

    return (
        <Dialog
            header={t('forgot-password.header')}
            visible={visible}
            style={{width: "28rem"}}
            modal
            draggable={false}
            onHide={onClose}
            footer={footer}
        >
            <small className="mb-2 text-gray-500">
                {t('forgot-password.explanation')}
            </small>
            <div className="relative w-full">
                <InputText
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setError(validateEmail(email))}
                    className="w-full !rounded-xl !py-2 !border !bg-white"
                    placeholder={t('forgot-password.email')}
                    required
                />

                <small className="absolute text-red-500 mt-1 top-full left-0">{t(error)}</small>
            </div>
        </Dialog>
    );
}

export default ForgotPasswordModal;