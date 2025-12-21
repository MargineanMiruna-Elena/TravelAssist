import React, {useState} from 'react';
import UserService from "../service/userService.js";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dialog} from "primereact/dialog";
import {useTranslation} from "react-i18next";
import {validateConfirmPassword} from "../utils/formValidators.js";

function ChangePasswordModal({visible, onClose}) {
    const {t} = useTranslation();
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const validationError = validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword);

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError("");

        try {
            await UserService.changePassword(passwordData.oldPassword, passwordData.newPassword);
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            onClose();
        } catch (err) {
            if (err.response) {
                setError(err.response.data.detail);
            } else {
                setError('api-errors.something-wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div className="flex justify-center gap-3 mt-3">
            <Button
                outlined
                label={t('change-password.cancel')}
                className="h-10 !rounded-xl text-lg font-bold !text-violet-700"
                onClick={onClose}
            />
            <Button
                label={t('change-password.save')}
                loading={loading}
                onClick={handleSubmit}
                className="h-10 !rounded-xl text-lg font-bold !bg-violet-700"
            />
        </div>
    );

    return (
        <Dialog
            header={t('change-password.header')}
            visible={visible}
            style={{width: "28rem"}}
            modal
            draggable={false}
            onHide={onClose}
            footer={footer}
        >
            <div className="relative w-full">
                <InputText
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value})}
                    className="w-full !rounded-xl !py-2 !border !bg-white !mb-2"
                    placeholder={t('change-password.old-password')}
                    required
                />

                <InputText
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value})}
                    className="w-full !rounded-xl !py-2 !border !bg-white !mb-2"
                    placeholder={t('change-password.new-password')}
                    required
                />

                <InputText
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value})}
                    className="w-full !rounded-xl !py-2 !border !bg-white !mb-2"
                    placeholder={t('change-password.confirm-password')}
                    required
                />

                <small className="absolute text-red-500 mt-1 top-full left-0">{t(error)}</small>
            </div>
        </Dialog>
    );
}

export default ChangePasswordModal;