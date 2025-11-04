import React, { useState } from 'react';
import {Button, Input, Typography} from "@material-tailwind/react";
import { Link } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!username || !email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // Add authentication logic here
    };

    return (

        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <Typography variant="h3" className="my-8 text-center">
                Register
            </Typography>
            <form onSubmit={handleSubmit}>
                <div className="mb-8 w-full">
                    <Input
                        type="text"
                        label="Username"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-8 w-full">
                    <Input
                        type="email"
                        label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-8 w-full">
                    <Input
                        type="password"
                        label="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-8 w-full">
                    <Input
                        type="password"
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button className="mt-8" fullWidth>
                    sign up
                </Button>
                <Typography color="gray" className="mt-4 text-center font-normal">
                    Already have an account?{" "}
                    <Link to="/" className="font-medium text-gray-900">
                        Log in.
                    </Link>
                </Typography>
            </form>
        </div>
    );
}

export default Register;