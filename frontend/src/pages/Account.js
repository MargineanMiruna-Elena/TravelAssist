import {StickyNavbar} from "../components/StickyNavbar";
import {
    Button,
    Card,
    CardBody,
    CardHeader, Input,
    Typography
} from "@material-tailwind/react";
import {
    ArrowRightStartOnRectangleIcon, CheckIcon,
    EnvelopeIcon,
    KeyIcon, LockClosedIcon, PencilIcon,
    UserCircleIcon, XMarkIcon
} from "@heroicons/react/16/solid";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function Account() {
    const [user, setUser] = useState({});
    const [form, setForm] = useState({name: "", email: "", currentPassword: "", newPassword: "", confirmPassword: ""});
    const [errors, setErrors] = useState({name: "", email: "", backend: "", currentPassword: "", newPassword: "", confirmPassword: ""});
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setForm(parsedUser);
        }
    }, []);

    const validateField = (name, value) => {
        let message = "";

        if (name === "name" && !value) {
            message = "Name is required.";
        }

        if (name === "email") {
            if (!value) message = "Email is required."; else if (!/\S+@\S+\.\S+/.test(value)) message = "Invalid email address.";
        }

        setErrors((prev) => ({...prev, [name]: message}));
        return !message;
    };

    const backendErrorMessage = (data, res) => {
        let message;
        switch (data.status || res.status) {
            case 400:
                message = "Bad request. Please check your input.";
                break;
            case 401:
                message = "Unauthorized. Please log in again.";
                break;
            case 404:
                message = "User not found.";
                break;
            case 500:
                message = "Internal server error. Try again later.";
                break;
            default:
                message = data.message || data.error || "An unexpected error occurred.";
        }
        setErrors((prev) => ({...prev, backend: message}));
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: ""}));
    };

    const handleEditToggle = async (e) => {
        e.preventDefault();

        if (isEditing) {
            const isNameValid = validateField("name", form.name);
            const isEmailValid = validateField("email", form.email);

            if (!isNameValid || !isEmailValid) return;
        }
    }

    const handleCancel = () => {
        setIsEditing(false);
        setErrors({name: "", email: "", backend: ""});
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login", {replace: true});
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
    };

    function handleForgotPassword() {

    }

    return (
        <div>
            <StickyNavbar/>
            <main className="w-full max-w-7xl mx-auto mt-6 px-2">
                <Typography
                    variant="h3"
                    className="mb-6 ml-2 font-bold text-4xl font-black leading-tight tracking-tight min-w-72 text-gray-900"
                >
                    Account
                </Typography>

                <div className="grid md:grid-cols-2 gap-4">

                    <Card className="w-full max-w-2xl mx-auto shadow-md">
                        <CardHeader
                            floated={false}
                            shadow={false}
                            className="bg-transparent px-4 pt-4 pb-2"
                        >
                            <Typography variant="h5" color="blue-gray">
                                Personal Information
                            </Typography>
                            <Typography variant="small" color="gray">
                                View and manage your profile details
                            </Typography>
                        </CardHeader>

                        <CardBody className="space-y-1 px-6 pb-6">
                            <div>
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="flex items-center gap-2 mb-1"
                                >
                                    <UserCircleIcon className="h-5 w-5 text-pink-600"/>
                                    Name
                                </Typography>
                                <Input
                                    name="name"
                                    id="name"
                                    crossOrigin={undefined}
                                    labelProps={{className: "hidden"}}
                                    value={form.name}
                                    onChange={handleChange}
                                    onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                    disabled={!isEditing}
                                    className={`border ${
                                        !isEditing ? "bg-gray-100 text-gray-500" : "border-pink-600"
                                    }`}
                                />
                                <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                    {errors.name || " "}
                                </Typography>
                            </div>

                            <div>
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="flex items-center gap-2 mb-1"
                                >
                                    <EnvelopeIcon className="h-5 w-5 text-pink-600"/>
                                    Email
                                </Typography>
                                <Input
                                    name="email"
                                    id="email"
                                    crossOrigin={undefined}
                                    labelProps={{className: "hidden"}}
                                    value={form.email}
                                    onChange={handleChange}
                                    onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                    disabled={!isEditing}
                                    className={`border ${
                                        !isEditing ? "bg-gray-100 text-gray-500" : "border-pink-600"
                                    }`}

                                />
                                <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                    {errors.email || " "}
                                </Typography>
                            </div>

                            <Typography className="text-sm h-5 ml-2 text-pink-600">
                                {errors.backend || " "}
                            </Typography>

                            <div className="flex gap-4 pt-7">
                                {isEditing ? (<>
                                    <Button
                                        fullWidth
                                        color="green"
                                        variant="filled"
                                        className="flex items-center justify-center gap-2"
                                        onClick={handleEditToggle}
                                    >
                                        <CheckIcon className="h-5 w-5"/>
                                        Save
                                    </Button>
                                    <Button
                                        fullWidth
                                        color="red"
                                        variant="outlined"
                                        className="flex items-center justify-center gap-2"
                                        onClick={handleCancel}
                                    >
                                        <XMarkIcon className="h-5 w-5"/>
                                        Cancel
                                    </Button>
                                </>) : (<>
                                    <Button
                                        fullWidth
                                        color="black"
                                        variant="filled"
                                        className="flex items-center justify-center gap-2"
                                        onClick={handleEditToggle}
                                    >
                                        <PencilIcon className="h-5 w-5"/>
                                        Edit Profile
                                    </Button>
                                </>)}
                            </div>

                            <Button onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-pink-600">
                                <ArrowRightStartOnRectangleIcon className="h-5 w-5"/>
                                Log out
                            </Button>
                        </CardBody>
                    </Card>
                    <Card className="w-full max-w-2xl mx-auto shadow-md">
                        <CardHeader
                            floated={false}
                            shadow={false}
                            className="bg-transparent px-4 pt-4 pb-2"
                        >
                            <Typography variant="h5" color="blue-gray">
                                Change Password
                            </Typography>
                            <Typography variant="small" color="gray">
                                Update your password
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleChangePassword}>
                                <div>
                                    <div className="flex flex-row justify-between">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="flex items-center gap-2 mb-1"
                                        >
                                            <KeyIcon className="h-5 w-5 text-pink-600"/>
                                            Current Password
                                        </Typography>
                                        <Typography
                                            onClick={handleForgotPassword}
                                            className="text-sm hover:underline cursor-pointer"
                                        >
                                            Forgot password?
                                        </Typography>
                                    </div>
                                    <Input
                                        name="currentPassword"
                                        id="currentPassword"
                                        type="password"
                                        crossOrigin={undefined}
                                        labelProps={{className: "hidden"}}
                                        value={form.currentPassword}
                                        onChange={handleChange}
                                        onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                        className="border-pink-600"
                                    />
                                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                        {errors.currentPassword || " "}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="flex items-center gap-2 mb-1"
                                    >
                                        <KeyIcon className="h-5 w-5 text-pink-600"/>
                                        New Password
                                    </Typography>
                                    <Input
                                        name="newPassword"
                                        id="newPassword"
                                        type="password"
                                        crossOrigin={undefined}
                                        labelProps={{className: "hidden"}}
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                        className="border-pink-600"
                                    />
                                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                        {errors.currentPassword || " "}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="flex items-center gap-2 mb-1"
                                    >
                                        <KeyIcon className="h-5 w-5 text-pink-600"/>
                                        Confirm Password
                                    </Typography>
                                    <Input
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        type="password"
                                        crossOrigin={undefined}
                                        labelProps={{className: "hidden"}}
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={(e) => isEditing && validateField(e.target.name, e.target.value)}
                                        className="border-pink-600"
                                    />
                                    <Typography className="text-sm h-5 mt-1 ml-2 text-pink-600">
                                        {errors.currentPassword || " "}
                                    </Typography>
                                </div>

                                <Typography className="text-sm h-5 ml-2 text-pink-600">
                                    {errors.backend || " "}
                                </Typography>

                                <Button type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-pink-600">
                                    <LockClosedIcon className="h-5 w-5"/>
                                    Update Password
                                </Button>

                            </form>
                        </CardBody>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default Account;