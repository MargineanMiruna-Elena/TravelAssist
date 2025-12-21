import React, { useState } from 'react';
import {Button, Input, Typography} from "@material-tailwind/react";
import { Link } from 'react-router-dom';

function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // Add authentication logic here
    };

    return (

        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            <Typography variant="h3" className="my-8 text-center">
                Log in
            </Typography>
            <form onSubmit={handleSubmit}>
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
                <Button className="mt-8" fullWidth>
                    log in
                </Button>
                <Typography color="gray" className="mt-4 text-center font-normal">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium text-gray-900">
                        Sign up.
                    </Link>
                </Typography>
            </form>
        </div>
    );
}

export default LogIn;