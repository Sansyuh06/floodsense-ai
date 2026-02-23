"use client";

import React, { useState } from "react";
import {
    Phone, User, MapPin, Building, ChevronRight,
    Shield, Locate, BadgeCheck, Users, Siren
} from "lucide-react";

export type UserRole = "citizen" | "authority";

interface AuthFormProps {
    onLogin: (role: UserRole) => void;
}

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const NDRF_BATTALIONS = [
    "1 NDRF Bn, Guwahati", "2 NDRF Bn, Kolkata", "3 NDRF Bn, Mundali",
    "4 NDRF Bn, Arakkonam", "5 NDRF Bn, Pune", "6 NDRF Bn, Vadodara",
    "7 NDRF Bn, Bhatinda", "8 NDRF Bn, Ghaziabad", "9 NDRF Bn, Patna",
    "10 NDRF Bn, Vijayawada", "11 NDRF Bn, Varanasi", "12 NDRF Bn, Itanagar",
    "13 NDRF Bn, Srinagar", "14 NDRF Bn, Dhanbad", "15 NDRF Bn, Thrissur", "16 NDRF Bn, Lucknow",
];

export default function AuthPage({ onLogin }: AuthFormProps) {
    const [role, setRole] = useState<UserRole | null>(null);
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [phone, setPhone] = useState("");
    const [fullName, setFullName] = useState("");
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    const [battalion, setBattalion] = useState("");
    const [rank, setRank] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [gpsGranted, setGpsGranted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequestGPS = () => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setGpsGranted(true),
                () => alert("GPS permission denied. Please enable location services."),
            );
        } else {
            setGpsGranted(true);
        }
    };

    const handleSendOtp = () => {
        if(phone.length < 10) return;
        setOtpSent(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!role) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin(role);
        }, 1200);
    };

    // Indian Government Header Bar
    const GovHeader = () => (
        <div className="w-full">
            {/* Tricolor strip */}
            <div className="flex h-1.5">
                <div className="flex-1" style={{ backgroundColor: '#FF9933' }}></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1" style={{ backgroundColor: '#138808' }}></div>
            </div>
            {/* Main header */}
            <div className="bg-[#1a237e] text-white px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                            🏛️
                        </div>
                        <div>
                            <h1 className="text-sm md:text-base font-bold tracking-wide">FloodSense AI</h1>
                            <p className="text-[10px] md:text-xs text-blue-200 tracking-wide">National Disaster Response Force · Ministry of Home Affairs</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[10px] text-blue-200">
                        <span>भारत सरकार</span>
                        <span className="text-white/30">|</span>
                        <span>Government of India</span>
                    </div>
                </div>
            </div>
            {/* Sub-nav */}
            <div className="bg-[#283593] text-white/80 px-4 py-1.5 text-[10px] tracking-wide">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <span>AI-Enabled Real-Time Flash Flood Forecasting & Alert System</span>
                    <span className="hidden sm:inline">🔒 Secured Portal</span>
                </div>
            </div>
        </div>
    );

    // Role selection screen
    if(!role) {
        return (
            <div className="min-h-screen w-full flex flex-col bg-[#f5f5f0]">
                <GovHeader />

                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl">
                        {/* Notice */}
                        <div className="bg-[#fff3cd] border border-[#ffc107] rounded px-4 py-3 mb-6 text-sm text-[#856404]">
                            <strong>Notice:</strong> This portal is for flood risk monitoring and disaster response. Select your role to proceed.
                        </div>

                        {/* Role Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Citizen Card */}
                            <button
                                onClick={() => setRole("citizen")}
                                className="group bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-[#1a237e] hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-[#1a237e]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800 mb-1">Citizen Portal</h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Receive flood alerts, view evacuation routes, and access multilingual warnings.
                                </p>
                                <div className="flex items-center text-[#1a237e] text-sm font-semibold group-hover:gap-2 transition-all">
                                    Continue <ChevronRight className="w-4 h-4" />
                                </div>
                            </button>

                            {/* NDRF Card */}
                            <button
                                onClick={() => setRole("authority")}
                                className="group bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-[#b71c1c] hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center mb-4">
                                    <Siren className="w-6 h-6 text-[#b71c1c]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800 mb-1">NDRF / Authority</h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Command Dashboard with live sensors, resource deployment, and incident control.
                                </p>
                                <div className="flex items-center text-[#b71c1c] text-sm font-semibold group-hover:gap-2 transition-all">
                                    Continue <ChevronRight className="w-4 h-4" />
                                </div>
                            </button>
                        </div>

                        {/* Footer info */}
                        <div className="mt-6 text-center text-xs text-gray-400">
                            <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
                            Data secured as per Government of India IT Guidelines &middot; NIC Certified
                        </div>
                    </div>
                </div>

                {/* Gov footer */}
                <div className="bg-[#1a237e] text-white/60 px-4 py-3 text-[10px] text-center">
                    © 2024 FloodSense AI &middot; National Disaster Response Force &middot; Ministry of Home Affairs, Government of India
                </div>
            </div>
        );
    }

    const isCitizen = role === "citizen";
    const accentColor = isCitizen ? "#1a237e" : "#b71c1c";

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#f5f5f0]">
            <GovHeader />

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">

                    {/* Back link */}
                    <button onClick={() => { setRole(null); setOtpSent(false); setOtp(""); }}
                        className="text-sm text-[#1a237e] hover:underline mb-4 flex items-center gap-1">
                        ← Change Role
                    </button>

                    {/* Auth Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

                        {/* Card header */}
                        <div className="px-6 py-4 border-b border-gray-100" style={{ backgroundColor: accentColor + '0a' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
                                    {isCitizen ? <Users className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800">{isCitizen ? "Citizen Portal" : "NDRF / Authority Portal"}</h2>
                                    <p className="text-xs text-gray-500">{mode === "login" ? "Login to your account" : "Create new account"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Login / SignUp Tabs */}
                            <div className="flex border border-gray-200 rounded mb-5 overflow-hidden">
                                <button onClick={() => { setMode("login"); setOtpSent(false); }}
                                    className="flex-1 py-2 text-sm font-semibold transition-all"
                                    style={mode === "login" ? { backgroundColor: accentColor, color: "white" } : { color: "#6b7280" }}>
                                    Login
                                </button>
                                <button onClick={() => { setMode("signup"); setOtpSent(false); }}
                                    className="flex-1 py-2 text-sm font-semibold transition-all"
                                    style={mode === "signup" ? { backgroundColor: accentColor, color: "white" } : { color: "#6b7280" }}>
                                    Sign Up
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                {mode === "signup" && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" placeholder="Enter your full name" value={fullName}
                                                onChange={e => setFullName(e.target.value)} required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1a237e]" />
                                        </div>
                                    </div>
                                )}

                                {/* NDRF fields */}
                                {mode === "signup" && !isCitizen && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Service ID *</label>
                                                <div className="relative">
                                                    <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input type="text" placeholder="NDRF-XXXX" value={serviceId}
                                                        onChange={e => setServiceId(e.target.value)} required
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#b71c1c]" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Rank *</label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input type="text" placeholder="e.g. Inspector" value={rank}
                                                        onChange={e => setRank(e.target.value)} required
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#b71c1c]" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Battalion *</label>
                                            <select value={battalion} onChange={e => setBattalion(e.target.value)} required
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#b71c1c]">
                                                <option value="">Select Battalion</option>
                                                {NDRF_BATTALIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number *</label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600 font-medium">+91</div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="tel" placeholder="10-digit mobile number" maxLength={10} value={phone}
                                                onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1a237e]" />
                                        </div>
                                    </div>
                                </div>

                                {/* State & District */}
                                {mode === "signup" && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">State *</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <select value={state} onChange={e => setState(e.target.value)} required
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1a237e]">
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">District *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="text" placeholder="District" value={district}
                                                    onChange={e => setDistrict(e.target.value)} required
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1a237e]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* GPS */}
                                {mode === "signup" && (
                                    <button type="button" onClick={handleRequestGPS}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium border transition-all ${gpsGranted ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-300 text-gray-600 hover:border-[#1a237e]"}`}>
                                        <Locate className="w-4 h-4" />
                                        {gpsGranted ? "✓ GPS Location Captured" : "Grant GPS Permission"}
                                    </button>
                                )}

                                {/* OTP Flow */}
                                {!otpSent ? (
                                    <button type="button" onClick={handleSendOtp} disabled={phone.length < 10}
                                        className="w-full py-2.5 rounded text-sm font-bold text-white transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        style={phone.length >= 10 ? { backgroundColor: accentColor } : undefined}>
                                        Send OTP
                                    </button>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Enter OTP</label>
                                            <div className="flex gap-2 justify-center">
                                                {[0, 1, 2, 3, 4, 5].map(i => (
                                                    <input key={i} type="text" maxLength={1} value={otp[i] || ""}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/\D/g, "");
                                                            const newOtp = otp.split(""); newOtp[i] = val; setOtp(newOtp.join(""));
                                                            if(val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                                                        }}
                                                        className="w-10 h-11 text-center text-lg font-bold border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1a237e]" />
                                                ))}
                                            </div>
                                            <p className="text-center text-xs text-gray-500 mt-2">
                                                OTP sent to +91 {phone} &middot; <button type="button" onClick={handleSendOtp} className="text-[#1a237e] font-semibold hover:underline">Resend</button>
                                            </p>
                                        </div>

                                        <button type="submit" disabled={otp.length < 6 || loading}
                                            className="w-full py-2.5 rounded text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                            style={{ backgroundColor: accentColor }}>
                                            {loading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {mode === "login" ? "Login" : "Create Account"}
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-gray-400 mt-4">
                        By continuing, you agree to FloodSense AI&apos;s Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>

            {/* Gov footer */}
            <div className="bg-[#1a237e] text-white/60 px-4 py-3 text-[10px] text-center">
                © 2024 FloodSense AI &middot; National Disaster Response Force &middot; Ministry of Home Affairs, Government of India
            </div>
        </div>
    );
}
