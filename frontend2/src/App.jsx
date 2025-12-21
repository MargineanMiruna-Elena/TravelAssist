import './App.css'
import Auth from "./pages/Auth.jsx";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Account from "./pages/Account.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import {useAuth} from "./hooks/useAuth.js";
import AuthProvider from "./context/AuthProvider.jsx";

function AppRoutes() {
    const {user} = useAuth();
    const isLoggedIn = !!user;

    return (
        <Routes>
            <Route
                path="/auth"
                element={isLoggedIn ? <Navigate to="/dashboard"/> : <Auth/>}
            />
            <Route
                path="/account"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Account/>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Dashboard/>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/auth"}/>}/>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes/>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
