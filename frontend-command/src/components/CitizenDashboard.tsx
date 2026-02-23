"use client";

import React, { useState, useEffect } from "react";
import {
    AlertTriangle, MapPin, Bell, Navigation, Globe, Phone,
    ChevronRight, Shield, LogOut, ArrowLeft,
    Siren, BarChart3, Users, Loader2
} from "lucide-react";
import { STATES_DATA, getHighRiskDistricts, getStateRiskSummary, type StateData, type DistrictData } from "@/data/statesData";
import { fetchRiskPrediction, type RiskPrediction, type FloodAlert } from "@/lib/api";

type View = "home" | "evacuate" | "shelters" | "sos" | "alert-family" | "state-analysis" | "district-detail";

export default function CitizenDashboard({ onLogout }: { onLogout: () => void }) {
    const [view, setView] = useState<View>("home");
    const [language, setLanguage] = useState("English");
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [selectedState, setSelectedState] = useState<StateData | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<(DistrictData & { stateName?: string }) | null>(null);
    const [sosSent, setSosSent] = useState(false);
    const [familyAlerted, setFamilyAlerted] = useState(false);
    const [liveRisk, setLiveRisk] = useState<RiskPrediction | null>(null);
    const [liveAlerts, setLiveAlerts] = useState<FloodAlert[]>([]);
    const [loadingRisk, setLoadingRisk] = useState(true);

    useEffect(() => {
        async function loadRisk() {
            try {
                const data = await fetchRiskPrediction(28.6139, 77.2090, "Delhi", "Delhi");
                setLiveRisk(data);
                if(data.alerts) setLiveAlerts(data.alerts);
            } catch(e) {
                console.error("Failed to fetch live risk:", e);
            } finally {
                setLoadingRisk(false);
            }
        }
        loadRisk();
        const interval = setInterval(loadRisk, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const languages = [
        "English", "हिन्दी", "বাংলা", "తెలుగు", "தமிழ்", "मराठी",
        "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "অসমীয়া", "ଓଡ଼ିଆ",
    ];
    const highRiskDistricts = getHighRiskDistricts().slice(0, 5);

    const alertItems = liveAlerts.length > 0
        ? liveAlerts.map(a => ({
            severity: a.severity,
            time: new Date(a.timestamp).toLocaleTimeString(),
            msg: a.message,
        }))
        : [
            { severity: "LOW" as const, time: "Now", msg: "No active alerts. All parameters within safe range." },
        ];

    const severityBadge = (sev: string) => {
        if(sev === "SEVERE" || sev === "HIGH") return "bg-red-100 text-red-800 border-red-200";
        if(sev === "MODERATE") return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-green-100 text-green-800 border-green-200";
    };

    // ─── GOV HEADER ───
    const GovHeader = ({ title, showBack }: { title?: string; showBack?: boolean }) => (
        <div className="w-full">
            <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
            <div className="bg-[#1a237e] text-white px-4 py-2.5">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showBack && (
                            <button onClick={() => setView("home")} className="text-white/70 hover:text-white mr-1">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <span className="text-2xl">🏛️</span>
                        <div>
                            <h1 className="text-sm font-bold">{title || "FloodSense AI"}</h1>
                            <p className="text-[9px] text-blue-200">NDRF · Ministry of Home Affairs</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-1 rounded">
                                <Globe className="w-3 h-3" /> {language}
                            </button>
                            {showLangMenu && (
                                <div className="absolute right-0 mt-1 w-36 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">
                                    {languages.map(lang => (
                                        <button key={lang} onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${language === lang ? "text-[#1a237e] font-bold bg-blue-50" : "text-gray-700"}`}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onLogout} className="text-[10px] bg-white/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-white/20">
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── EVACUATE VIEW ───
    if(view === "evacuate") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title="Evacuation Route" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h2 className="text-base font-bold text-gray-800 mb-1">🧭 Nearest Safe Route</h2>
                        <p className="text-sm text-gray-500 mb-4">Safest evacuation route avoiding all flood-prone roads.</p>
                        <div className="space-y-2">
                            {[
                                { step: 1, dir: "Head North on NH-44", dist: "1.2 km", safe: true },
                                { step: 2, dir: "Turn Right onto Elevated Flyover", dist: "0.8 km", safe: true },
                                { step: 3, dir: "⚠️ Avoid Main Street (Flooded)", dist: "—", safe: false },
                                { step: 4, dir: "Continue to Relief Camp #3", dist: "2.1 km", safe: true },
                            ].map(r => (
                                <div key={r.step} className={`flex items-center gap-3 p-3 rounded border ${r.safe ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${r.safe ? "bg-[#1a237e]" : "bg-red-500"}`}>{r.step}</div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${r.safe ? "text-gray-800" : "text-red-700"}`}>{r.dir}</p>
                                        <p className="text-[10px] text-gray-400">{r.dist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-800 font-semibold">🏕️ Destination: Relief Camp #3</p>
                        <p className="text-xs text-green-600 mt-1">Capacity: 500 · Distance: 4.1 km · ETA: 25 min on foot</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SHELTERS VIEW ───
    if(view === "shelters") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title="Nearby Shelters" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    {[
                        { name: "Relief Camp #3 - Govt School", dist: "2.1 km", cap: "500", avail: "187", status: "Open" },
                        { name: "Community Hall - Block A", dist: "3.4 km", cap: "300", avail: "92", status: "Open" },
                        { name: "Stadium Emergency Shelter", dist: "5.8 km", cap: "1200", avail: "640", status: "Open" },
                        { name: "Temple Complex Shelter", dist: "1.8 km", cap: "150", avail: "0", status: "Full" },
                    ].map((s, i) => (
                        <div key={i} className={`bg-white border rounded-lg p-4 ${s.status === "Full" ? "border-red-200 opacity-60" : "border-gray-200"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-gray-800">{s.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${s.status === "Full" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>{s.status}</span>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500">
                                <span>📍 {s.dist}</span><span>👥 {s.avail}/{s.cap} available</span>
                            </div>
                            {s.status !== "Full" && (
                                <button onClick={() => setView("evacuate")} className="mt-3 w-full text-xs font-bold bg-[#1a237e] text-white py-2 rounded hover:bg-[#283593] transition-colors">
                                    Navigate Here →
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ─── SOS VIEW ───
    if(view === "sos") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title="Emergency SOS" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
                    {!sosSent ? (
                        <div className="text-center space-y-5">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 border-2 border-red-300">
                                <Siren className="w-12 h-12 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-red-800">Send Emergency SOS</h2>
                            <p className="text-sm text-gray-600 max-w-xs mx-auto">This will alert NDRF rescue teams with your GPS coordinates and personal details.</p>
                            <button onClick={() => setSosSent(true)}
                                className="w-full py-3 bg-red-600 text-white rounded-lg text-base font-bold hover:bg-red-700 transition-colors">
                                🚨 SEND SOS ALERT
                            </button>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-left space-y-2">
                                <p className="text-xs text-gray-500 font-bold uppercase">Direct Helplines:</p>
                                {[
                                    { name: "NDRF Helpline", num: "011-24363260" },
                                    { name: "Disaster Mgmt", num: "1078" },
                                    { name: "Emergency", num: "112" },
                                ].map(h => (
                                    <a key={h.num} href={`tel:${h.num}`}
                                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-2.5 hover:border-[#1a237e] transition-colors">
                                        <span className="text-sm text-gray-700">{h.name}</span>
                                        <span className="text-sm font-mono text-[#1a237e] flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {h.num}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-300">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-green-800">SOS Alert Sent ✓</h2>
                            <p className="text-sm text-gray-600">NDRF has been notified. Rescue team ETA: ~15 minutes.</p>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-left text-xs text-gray-600 space-y-1">
                                <p>Alert ID: <span className="font-mono text-gray-800">SOS-2026-{Math.floor(Math.random() * 9000 + 1000)}</span></p>
                                <p>Location: <span className="font-mono text-gray-800">28.6139°N, 77.2090°E</span></p>
                                <p>Status: <span className="text-green-600 font-bold">Acknowledged</span></p>
                            </div>
                            <button onClick={() => { setSosSent(false); setView("home"); }}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#283593] transition-colors">
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── ALERT FAMILY VIEW ───
    if(view === "alert-family") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title="Alert Family" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {!familyAlerted ? (
                        <>
                            <p className="text-sm text-gray-600">Send your safety status and location to emergency contacts via SMS.</p>
                            <div className="space-y-2">
                                {[
                                    { name: "Mom", phone: "+91 98765 XXXXX" },
                                    { name: "Dad", phone: "+91 98764 XXXXX" },
                                    { name: "Brother", phone: "+91 87654 XXXXX" },
                                ].map((c, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Users className="w-4 h-4 text-[#1a237e]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                                                <p className="text-[10px] text-gray-400">{c.phone}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">✓ Registered</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setFamilyAlerted(true)}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#283593] transition-colors">
                                📩 Send Safety Alert to All
                            </button>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 border border-green-300">
                                <Shield className="w-7 h-7 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-green-800">Family Alerted ✓</h2>
                            <p className="text-sm text-gray-600">Safety status and GPS coordinates sent to 3 contacts.</p>
                            <button onClick={() => { setFamilyAlerted(false); setView("home"); }}
                                className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#283593] transition-colors">
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── STATE ANALYSIS VIEW ───
    if(view === "state-analysis") {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title="State-wise Analysis" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    <div className="bg-[#fff3cd] border border-[#ffc107] rounded px-3 py-2 text-xs text-[#856404]">
                        <strong>Note:</strong> Risk levels based on real-time Open-Meteo weather data and AI analysis.
                    </div>
                    {STATES_DATA.map((st) => {
                        const summary = getStateRiskSummary(st);
                        return (
                            <button key={st.name} onClick={() => { setSelectedState(st); }}
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-[#1a237e] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">{st.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{st.districts.length} districts monitored</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right text-[10px]">
                                            {summary.highCount > 0 && <span className="block text-red-600 font-bold">{summary.highCount} High Risk</span>}
                                            {summary.moderateCount > 0 && <span className="block text-yellow-600">{summary.moderateCount} Moderate</span>}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── DISTRICT DETAIL VIEW ───
    if(view === "district-detail" && selectedDistrict) {
        return (
            <div className="min-h-screen bg-[#f5f5f0]">
                <GovHeader title={selectedDistrict.name} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    <div className={`border rounded-lg p-4 ${selectedDistrict.riskLevel === "HIGH" ? "bg-red-50 border-red-200" : selectedDistrict.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${severityBadge(selectedDistrict.riskLevel)}`}>{selectedDistrict.riskLevel} RISK</span>
                        <h2 className="text-lg font-bold text-gray-800 mt-2">{selectedDistrict.name}</h2>
                        <p className="text-xs text-gray-500">{selectedDistrict.stateName}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Current Conditions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Rainfall (24h)", value: `${liveRisk?.weather?.rainfall_24h || selectedDistrict.rainfall}mm`, icon: "🌧️" },
                                { label: "Temperature", value: `${liveRisk?.weather?.temperature || 28}°C`, icon: "🌡️" },
                                { label: "Soil Moisture", value: `${((liveRisk?.weather?.soil_moisture || 0.3) * 100).toFixed(0)}%`, icon: "🏔️" },
                                { label: "River Discharge", value: `${liveRisk?.discharge?.current_discharge?.toFixed(1) || 0} m³/s`, icon: "🏞️" },
                            ].map((m, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3">
                                    <p className="text-[10px] text-gray-400">{m.icon} {m.label}</p>
                                    <p className="text-sm font-bold text-gray-800 mt-0.5">{m.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Recommendation</h3>
                        <p className="text-sm text-gray-700">{liveRisk?.recommendation || "No immediate flood risk. Continue routine monitoring."}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── HOME VIEW ───
    return (
        <div className="min-h-screen bg-[#f5f5f0]">
            <GovHeader />

            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

                {/* Risk Status Card */}
                {loadingRisk ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-[#1a237e] animate-spin" />
                        <span className="text-sm text-gray-500">Fetching live flood risk data...</span>
                    </div>
                ) : (
                    <div className={`border rounded-lg p-5 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-300" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${severityBadge(liveRisk?.riskLevel || "LOW")}`}>
                                {liveRisk?.riskLevel || "LOW"} RISK
                            </span>
                            <span className="text-[10px] text-gray-500">📡 Live · Open-Meteo</span>
                        </div>
                        <h2 className={`text-lg font-bold ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "text-red-800" : liveRisk?.riskLevel === "MODERATE" ? "text-yellow-800" : "text-green-800"}`}>
                            {liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "🚨 High Risk Zone" : liveRisk?.riskLevel === "MODERATE" ? "⚠️ Elevated Risk" : "✅ Normal Conditions"}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Flood probability: <strong>{((liveRisk?.probability || 0) * 100).toFixed(0)}%</strong> · Score: {liveRisk?.riskScore || 0}/10</p>

                        {liveRisk?.weather && (
                            <div className="grid grid-cols-3 gap-2 mt-3">
                                <div className="bg-white/80 border border-gray-200 rounded p-2 text-center">
                                    <p className="text-[9px] text-gray-400">Rain 24h</p>
                                    <p className="text-sm font-bold text-gray-800">{liveRisk.weather.rainfall_24h}mm</p>
                                </div>
                                <div className="bg-white/80 border border-gray-200 rounded p-2 text-center">
                                    <p className="text-[9px] text-gray-400">Temp</p>
                                    <p className="text-sm font-bold text-gray-800">{liveRisk.weather.temperature}°C</p>
                                </div>
                                <div className="bg-white/80 border border-gray-200 rounded p-2 text-center">
                                    <p className="text-[9px] text-gray-400">Soil Moist</p>
                                    <p className="text-sm font-bold text-gray-800">{((liveRisk.weather.soil_moisture || 0) * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { icon: <Navigation className="w-4 h-4" />, label: "Evacuation Route", view: "evacuate" as View, color: "#1a237e" },
                            { icon: <MapPin className="w-4 h-4" />, label: "Nearby Shelters", view: "shelters" as View, color: "#1a237e" },
                            { icon: <Siren className="w-4 h-4" />, label: "Send SOS", view: "sos" as View, color: "#b71c1c" },
                            { icon: <Bell className="w-4 h-4" />, label: "Alert Family", view: "alert-family" as View, color: "#1a237e" },
                        ].map((item, i) => (
                            <button key={i} onClick={() => setView(item.view)}
                                className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-left hover:border-[#1a237e] transition-all group">
                                <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>
                                    {item.icon}
                                </div>
                                <span className="text-xs font-semibold text-gray-700 group-hover:text-[#1a237e]">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Active Alerts</h3>
                        <span className="text-[10px] text-gray-400">Auto-refreshed</span>
                    </div>
                    <div className="space-y-2">
                        {alertItems.map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityBadge(a.severity)}`}>{a.severity}</span>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-700">{a.msg}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* State Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> State-wise Analysis</h3>
                        <button onClick={() => setView("state-analysis")} className="text-[10px] font-bold text-[#1a237e] hover:underline">View All →</button>
                    </div>
                    <div className="space-y-1.5">
                        {highRiskDistricts.map((d, i) => (
                            <button key={i} onClick={() => { setSelectedDistrict(d as any); setView("district-detail"); }}
                                className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded px-3 py-2 text-left hover:border-[#1a237e] transition-colors">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                                    <p className="text-[10px] text-gray-400">{(d as any).stateName}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityBadge(d.riskLevel)}`}>{d.riskLevel}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-gray-400 py-2">
                    © 2024 FloodSense AI · National Disaster Response Force · Govt. of India
                </div>
            </div>
        </div>
    );
}
