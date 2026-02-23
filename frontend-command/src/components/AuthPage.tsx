"use client";

import React, { useState } from "react";
import {
    Droplets, Phone, User, MapPin, Building, ChevronRight,
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setGpsGranted(true),
                () => alert("GPS permission denied. Please enable location services."),
            );
        } else {
            setGpsGranted(true);
        }
    };

    const handleSendOtp = () => {
        if (phone.length < 10) return;
        setOtpSent(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin(role);
        }, 1200);
    };

    // Role selection screen
    if (!role) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_20%_50%,rgba(56,189,248,0.08),transparent_50%)]" />
                    <div className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_80%_50%,rgba(99,102,241,0.06),transparent_50%)]" />
                </div>

                <div className="relative z-10 w-full max-w-2xl px-6">
                    {/* Top Branding */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 mb-6">
                            <Droplets className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                            Flood<span className="text-blue-400">Sense</span> AI
                        </h1>
                        <p className="text-slate-400 text-base">AI-Enabled Real-Time Flash Flood Forecasting Platform</p>
                    </div>

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Citizen Card */}
                        <button
                            onClick={() => setRole("citizen")}
                            className="group relative bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-8 text-left transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
                                    <Users className="w-7 h-7 text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Citizen</h2>
                                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                                    Receive real-time flood alerts, evacuation routes, and multilingual warnings for your location.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Alerts", "Evacuation", "Shelters"].map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/15">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </button>

                        {/* NDRF / Authority Card */}
                        <button
                            onClick={() => setRole("authority")}
                            className="group relative bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-8 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:bg-amber-500/20 transition-colors">
                                    <Siren className="w-7 h-7 text-amber-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">NDRF / Authority</h2>
                                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                                    Access the full Command Dashboard with live sensors, resource deployment, and incident control.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Command", "Deploy", "Analytics"].map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/15">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-600 mt-8">
                        <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
                        Secured &amp; encrypted for disaster response operations
                    </p>
                </div>
            </div>
        );
    }

    const isCitizen = role === "citizen";
    const accentColor = isCitizen ? "blue" : "amber";

    return (
        <div className="min-h-screen w-full flex bg-slate-950 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_20%_50%,rgba(${isCitizen ? "56,189,248" : "245,158,11"},0.08),transparent_50%)]`} />
                <div className={`absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_80%_50%,rgba(${isCitizen ? "99,102,241" : "202,138,4"},0.06),transparent_50%)]`} />
            </div>

            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
                <div className="max-w-lg text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${isCitizen ? "from-blue-500/20 to-cyan-500/10 border-blue-500/20" : "from-amber-500/20 to-orange-500/10 border-amber-500/20"} border mb-8`}>
                        {isCitizen
                            ? <Droplets className="w-12 h-12 text-blue-400" />
                            : <Siren className="w-12 h-12 text-amber-400" />
                        }
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                        Flood<span className={isCitizen ? "text-blue-400" : "text-amber-400"}>Sense</span> AI
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed mb-2">
                        {isCitizen
                            ? "Stay safe with AI-powered flood alerts, evacuation routing, and real-time risk monitoring."
                            : "NDRF Command Station — Full tactical disaster intelligence and resource deployment."
                        }
                    </p>
                    <button onClick={() => { setRole(null); setOtpSent(false); setOtp(""); }}
                        className="mt-6 text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors">
                        ← Switch Role
                    </button>

                    {/* Feature badges */}
                    <div className="grid grid-cols-2 gap-3 mt-8 text-left">
                        {(isCitizen
                            ? [
                                { icon: "📱", text: "Multilingual Alerts" },
                                { icon: "🗺️", text: "Evacuation Routing" },
                                { icon: "📡", text: "Mesh Network Fallback" },
                                { icon: "🏠", text: "Nearest Shelter Finder" },
                            ]
                            : [
                                { icon: "🛰️", text: "Live Sensor Dashboard" },
                                { icon: "📊", text: "Risk Heatmaps" },
                                { icon: "🚁", text: "Resource Deployment" },
                                { icon: "⚡", text: "Incident Command" },
                            ]
                        ).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.05]">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-sm text-slate-300">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile header */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="inline-flex items-center gap-3 mb-2">
                            <div className={`p-2.5 rounded-xl border ${isCitizen ? "bg-blue-500/20 border-blue-500/20" : "bg-amber-500/20 border-amber-500/20"}`}>
                                {isCitizen ? <Droplets className="w-7 h-7 text-blue-400" /> : <Siren className="w-7 h-7 text-amber-400" />}
                            </div>
                            <h1 className="text-3xl font-bold text-white">
                                Flood<span className={isCitizen ? "text-blue-400" : "text-amber-400"}>Sense</span>
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500">{isCitizen ? "Citizen Portal" : "NDRF Command Portal"}</p>
                        <button onClick={() => { setRole(null); setOtpSent(false); setOtp(""); }}
                            className="mt-2 text-xs text-slate-600 hover:text-slate-400 underline underline-offset-4 transition-colors">
                            ← Switch Role
                        </button>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl shadow-black/20 p-8">
                        {/* Role badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 ${isCitizen ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                            {isCitizen ? <Users className="w-3.5 h-3.5" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                            {isCitizen ? "Citizen" : "NDRF / Authority"}
                        </div>

                        {/* Login / SignUp Tabs */}
                        <div className="flex bg-slate-800/60 rounded-xl p-1 mb-6">
                            <button onClick={() => { setMode("login"); setOtpSent(false); }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${mode === "login" ? `bg-${accentColor}-600 text-white shadow-lg shadow-${accentColor}-600/20` : "text-slate-400 hover:text-slate-300"}`}
                                style={mode === "login" ? { backgroundColor: isCitizen ? "#2563eb" : "#d97706" } : {}}
                            >
                                Login
                            </button>
                            <button onClick={() => { setMode("signup"); setOtpSent(false); }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${mode === "signup" ? `bg-${accentColor}-600 text-white shadow-lg shadow-${accentColor}-600/20` : "text-slate-400 hover:text-slate-300"}`}
                                style={mode === "signup" ? { backgroundColor: isCitizen ? "#2563eb" : "#d97706" } : {}}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name (Signup) */}
                            {mode === "signup" && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type="text" placeholder="Enter your full name" value={fullName}
                                            onChange={e => setFullName(e.target.value)} required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" />
                                    </div>
                                </div>
                            )}

                            {/* NDRF-specific fields (Signup) */}
                            {mode === "signup" && !isCitizen && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Service ID</label>
                                            <div className="relative">
                                                <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input type="text" placeholder="NDRF-XXXX" value={serviceId}
                                                    onChange={e => setServiceId(e.target.value)} required
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rank</label>
                                            <div className="relative">
                                                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input type="text" placeholder="e.g. Inspector" value={rank}
                                                    onChange={e => setRank(e.target.value)} required
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Battalion</label>
                                        <select value={battalion} onChange={e => setBattalion(e.target.value)} required
                                            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none">
                                            <option value="" className="bg-slate-800">Select Battalion</option>
                                            {NDRF_BATTALIONS.map(b => <option key={b} value={b} className="bg-slate-800">{b}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Mobile Number */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mobile Number</label>
                                <div className="relative flex gap-2">
                                    <div className="flex items-center px-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-400">+91</div>
                                    <div className="relative flex-1">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type="tel" placeholder="10-digit mobile" maxLength={10} value={phone}
                                            onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* State & District (Signup) */}
                            {mode === "signup" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">State</label>
                                        <div className="relative">
                                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <select value={state} onChange={e => setState(e.target.value)} required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option value="" className="bg-slate-800">Select State</option>
                                                {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">District</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input type="text" placeholder="District" value={district}
                                                onChange={e => setDistrict(e.target.value)} required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GPS Permission (Signup) */}
                            {mode === "signup" && (
                                <button type="button" onClick={handleRequestGPS}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${gpsGranted ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:border-blue-500/30 hover:text-blue-300"}`}>
                                    <Locate className="w-4 h-4" />
                                    {gpsGranted ? "✓ GPS Location Captured" : "Grant GPS Permission"}
                                </button>
                            )}

                            {/* OTP Flow */}
                            {!otpSent ? (
                                <button type="button" onClick={handleSendOtp} disabled={phone.length < 10}
                                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none"
                                    style={{
                                        background: phone.length >= 10
                                            ? (isCitizen ? "linear-gradient(to right, #2563eb, #3b82f6)" : "linear-gradient(to right, #d97706, #f59e0b)")
                                            : undefined,
                                    }}>
                                    Send OTP
                                </button>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Enter OTP</label>
                                        <div className="flex gap-2 justify-center">
                                            {[0, 1, 2, 3, 4, 5].map(i => (
                                                <input key={i} type="text" maxLength={1} value={otp[i] || ""}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        const newOtp = otp.split(""); newOtp[i] = val; setOtp(newOtp.join(""));
                                                        if (val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                                                    }}
                                                    className={`w-11 h-12 text-center text-lg font-mono bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 transition-all ${isCitizen ? "focus:border-blue-500/50 focus:ring-blue-500/20" : "focus:border-amber-500/50 focus:ring-amber-500/20"}`} />
                                            ))}
                                        </div>
                                        <p className="text-center text-xs text-slate-600 mt-1">
                                            OTP sent to +91 {phone} · <button type="button" onClick={handleSendOtp} className="text-blue-500 hover:underline">Resend</button>
                                        </p>
                                    </div>

                                    <button type="submit" disabled={otp.length < 6 || loading}
                                        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
                                        style={{ background: isCitizen ? "linear-gradient(to right, #2563eb, #06b6d4)" : "linear-gradient(to right, #d97706, #ea580c)" }}>
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

                    <p className="text-center text-xs text-slate-600 mt-6">
                        By continuing, you agree to FloodSense AI&apos;s Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
