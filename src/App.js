import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Navbar from "./components/Navbar";
import UserProfile from "./pages/UserProfile";
import AdminProfile from "./pages/AdminProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Default route → Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Profiles */}
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/admin-profile" element={<AdminProfile />} />

        {/* Login explicitly available */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
