import './App.css';
import {ThemeProvider} from "@material-tailwind/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
      <ThemeProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<LogIn />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;
