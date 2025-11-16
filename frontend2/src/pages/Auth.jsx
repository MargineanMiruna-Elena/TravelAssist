import {useState} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTranslation} from "react-i18next";
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {Button} from "primereact/button";
import {FloatLabel} from "primereact/floatlabel";
import Logo from "../components/Logo.jsx";
import LanguageButton from "../components/LanguageButton.jsx";
import {validateConfirmPassword, validateEmail, validateName, validatePassword} from "../utils/formValidators.js";
import {useNavigate} from "react-router-dom";

const Auth = () => {
    const {login, register} = useAuth();
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [backendError, setBackendError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const validateForm = () => {
        const newErrors = {};

        if (!isLogin) {
            newErrors.name = validateName(formData.name);
            newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
        }

        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);

        setErrors(newErrors);

        return !Object.values(newErrors).some((msg) => msg);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setBackendError("");
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(
                    formData.name,
                    formData.email,
                    formData.password
                );
            }

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setBackendError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="w-full">
                <div className="flex justify-center mt-8 py-2">
                    <Logo className="text-5xl" />
                </div>

                <div className="absolute top-2 right-3">
                    <LanguageButton />
                </div>
            </div>

            <div className="max-w-lg mx-auto p-10 rounded-xl shadow-md shadow-violet-200 bg-white">
                <div className="relative flex h-10 mb-8 border border-violet-500 rounded-xl overflow-hidden">
                    <button
                        onClick={() => {
                            setIsLogin(true);
                            setBackendError("");
                        }}
                        className={`w-1/2 text-lg font-bold transition-all z-10 ${
                            isLogin
                                ? "text-white"
                                : "text-violet-700"
                        }`}
                    >
                        { t('auth.login') }
                    </button>

                    <button
                        onClick={() => {
                            setIsLogin(false);
                            setBackendError("");
                        }}
                        className={`w-1/2 text-lg font-bold transition-all z-10 ${
                            !isLogin
                                ? "text-white"
                                : "text-violet-700"
                        }`}
                    >
                        { t('auth.signup') }
                    </button>
                    <div
                        className={`absolute top-0 h-full w-1/2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-400 transition-all duration-500 ease-in-out ${
                            isLogin
                                ? "left-0" : "left-1/2"
                        }`}></div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-9">
                    {!isLogin && (
                        <FloatLabel>
                            <InputText
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                onBlur={() => {
                                    setErrors((prev) => ({ ...prev, name: validateName(formData.name) }));
                                }}
                                className="w-full !rounded-xl !py-2 !bg-white"
                                required={!isLogin}
                                variant="outlined"
                            />
                            <label htmlFor="name">
                                {t('auth.username')}*
                            </label>
                            <small className="text-red-500 float-right">{t(errors.name)}</small>
                        </FloatLabel>

                    )}

                    <FloatLabel>
                        <InputText
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            onBlur={() => {
                                setErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }));
                            }}
                            className="w-full !rounded-xl !py-2 !border !bg-white"
                            required
                        />
                        <label htmlFor="email">
                            {t('auth.email')}*
                        </label>
                        <small className="text-red-500 float-right">{t(errors.email)}</small>
                    </FloatLabel>


                    <FloatLabel>
                        <Password
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            onBlur={() => {
                                setErrors((prev) => ({ ...prev, password: validatePassword(formData.password) }));
                            }}
                            className="w-full"
                            inputClassName="w-full !rounded-xl !py-2 !bg-white"
                            feedback={false}
                            required
                        />
                        <label htmlFor="password">
                            {t('auth.password')}*
                        </label>
                        <small className="text-red-500 float-right">{t(errors.password)}</small>
                    </FloatLabel>

                    {isLogin && (
                        <div className="mt-0 text-end">
                            <a href="#" className="text-sm text-violet-700 hover:underline">
                                {t('auth.forgot-password')}
                            </a>
                        </div>
                    )}

                    {!isLogin && (
                        <FloatLabel>
                            <div className="w-full">
                                <Password
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    onBlur={() => {
                                        setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword) }));
                                    }}
                                    placeholder="Confirm your password"
                                    className="w-full"
                                    inputClassName="w-full !rounded-xl !py-2 !bg-white"
                                    feedback={false}
                                    required={!isLogin}
                                />
                            </div>
                            <label htmlFor="confirmPassword">
                                {t('auth.confirm-password')}*
                            </label>
                            <small className="text-red-500 float-right">{t(errors.confirmPassword)}</small>
                        </FloatLabel>
                    )}

                    {backendError && (
                        <div className="text-red-500">
                            {backendError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        label={isLogin ?  t('auth.login')  :  t('auth.signup') }
                        className="w-full h-10 mt-6 !rounded-xl text-lg font-bold !bg-violet-700"
                    />
                </form>

            </div>

        </div>
    );
};

export default Auth;
