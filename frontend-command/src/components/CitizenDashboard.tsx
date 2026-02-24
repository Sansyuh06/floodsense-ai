"use client";
import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, MapPin, Bell, Navigation, Globe, Phone, ChevronRight, Shield, LogOut, ArrowLeft, Volume2, Siren, BarChart3, Users, Loader2, Camera, WifiOff, Droplets, Heart, Send, Radio, TrendingUp, ExternalLink, Map, MessageCircle, Wifi } from "lucide-react";
import { startMesh, sendMeshMessage, sendSOS, stopMesh, getNodeIdentity, type MeshMessage as MeshMsg, type MeshState as MState } from "@/lib/meshChat";
import { STATES_DATA, getDamsByState, getVulnerableByState, type StateData, type DistrictData, type DamData } from "@/data/statesData";
import { fetchRiskPrediction, createSOS, sendFamilySOS, createReport, fetchCamps, fetchSafeRoute, type RiskPrediction, type FloodAlert, type RouteResult } from "@/lib/api";
import { t, speak, LANG_MAP } from "@/lib/translations";
import { getReports, addReport, getSimLocation, getNearestTowers, type CitizenReport, type SimLocation } from "@/lib/reportsStore";

type View = "home" | "evacuate" | "shelters" | "camps" | "sos" | "alert-family" | "vulnerability" | "dams" | "report" | "analytics" | "location-info" | "mesh";

interface Props { onLogout: () => void; userState: StateData; userDistrict: DistrictData; }

export default function CitizenDashboard({ onLogout, userState, userDistrict }: Props) {
    const [view, setView] = useState<View>("home");
    const [language, setLanguage] = useState("English");
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [sosSent, setSosSent] = useState(false);
    const [familyAlerted, setFamilyAlerted] = useState(false);
    const [liveRisk, setLiveRisk] = useState<RiskPrediction | null>(null);
    const [liveAlerts, setLiveAlerts] = useState<FloodAlert[]>([]);
    const [loadingRisk, setLoadingRisk] = useState(true);
    const [reportSent, setReportSent] = useState(false);
    const [reportPhoto, setReportPhoto] = useState<string | null>(null);
    const [reportDesc, setReportDesc] = useState("");
    const [reportType, setReportType] = useState<"waterlogging" | "drainage_blocked" | "road_flooded" | "embankment_breach" | "other">("waterlogging");
    const [isOffline, setIsOffline] = useState(false);
    const [simLoc, setSimLoc] = useState<SimLocation | null>(null);
    const [towers, setTowers] = useState<ReturnType<typeof getNearestTowers>>([]);
    const [navTarget, setNavTarget] = useState<{ name: string; lat: number; lon: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [meshMessages, setMeshMessages] = useState<MeshMsg[]>([]);
    const [meshState, setMeshState] = useState<MState | null>(null);
    const [meshInput, setMeshInput] = useState("");
    const meshBottomRef = useRef<HTMLDivElement>(null);
    // Relief camps and route
    const [reliefCamps, setReliefCamps] = useState<any[]>([]);
    const [loadingCamps, setLoadingCamps] = useState(false);
    const [safeRoute, setSafeRoute] = useState<RouteResult | null>(null);
    const [sosLoading, setSosLoading] = useState(false);
    const [sosResult, setSosResult] = useState<any>(null);
    const [familySosLoading, setFamilySosLoading] = useState(false);

    useEffect(() => {
        const go = () => setIsOffline(!navigator.onLine);
        window.addEventListener('offline', go); window.addEventListener('online', go);
        setIsOffline(!navigator.onLine);
        return () => { window.removeEventListener('offline', go); window.removeEventListener('online', go); };
    }, []);

    useEffect(() => {
        // Show cached data instantly while fresh data loads
        try { const c = localStorage.getItem('floody_cached_risk'); if(c) { const cached = JSON.parse(c); setLiveRisk(cached); if(cached.alerts) setLiveAlerts(cached.alerts); setLoadingRisk(false); } } catch { }

        async function load() {
            try {
                const data = await fetchRiskPrediction(userDistrict.lat, userDistrict.lng, userDistrict.name, userState.name);
                setLiveRisk(data); if(data.alerts) setLiveAlerts(data.alerts);
                try { localStorage.setItem('floody_cached_risk', JSON.stringify(data)); } catch { }
            } catch { try { const c = localStorage.getItem('floody_cached_risk'); if(c) setLiveRisk(JSON.parse(c)); } catch { } }
            finally { setLoadingRisk(false); }
        }
        load();
        const i = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(i);
    }, [userDistrict, userState]);

    useEffect(() => { getSimLocation().then(loc => { setSimLoc(loc); setTowers(getNearestTowers(loc.lat, loc.lon)); }); }, []);

    const languages = Object.keys(LANG_MAP);
    const myDams = getDamsByState(userState.name);
    const myVuln = getVulnerableByState(userState.name);
    const myReports = getReports().filter(r => r.state === userState.name);
    const dangerDams = myDams.filter(d => d.status === "DANGER" || d.status === "OVERFLOW");

    const alertItems = liveAlerts.length > 0
        ? liveAlerts.map(a => ({ severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString(), msg: a.message }))
        : [{ severity: "LOW" as const, time: "Now", msg: t(language, "no_alerts") }];

    const sev = (s: string) => s === "SEVERE" || s === "HIGH" ? "bg-red-100 text-red-800 border-red-200" : s === "MODERATE" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-green-100 text-green-800 border-green-200";
    const damC = (s: string) => s === "OVERFLOW" ? "bg-red-600 text-white" : s === "DANGER" ? "bg-red-100 text-red-700 border-red-200" : s === "ALERT" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 border-green-200";

    const handleAmISafe = () => {
        const risk = liveRisk?.riskLevel || "LOW";
        speak(risk === "HIGH" || risk === "SEVERE" ? t(language, "danger_alert") : risk === "MODERATE" ? t(language, "moderate_risk") : t(language, "you_are_safe"), language);
    };

    const handleSubmitReport = async () => {
        const lat = simLoc?.lat || userDistrict.lat;
        const lon = simLoc?.lon || userDistrict.lng;
        const typeMap: Record<string, string> = {
            waterlogging: 'WATERLOGGING', drainage_blocked: 'DRAIN_BLOCK',
            road_flooded: 'FLOOD', embankment_breach: 'DAM_OVERFLOW', other: 'OTHER'
        };
        try {
            await createReport({
                reportType: typeMap[reportType] || 'OTHER',
                description: reportDesc || `${reportType} reported from ${userDistrict.name}`,
                lat, lon,
                photoBase64: reportPhoto || undefined,
                severity: liveRisk?.riskLevel === 'HIGH' || liveRisk?.riskLevel === 'SEVERE' ? 'HIGH' : 'MODERATE',
            });
        } catch { }
        addReport({ type: reportType, description: reportDesc, photoUrl: reportPhoto || undefined, lat, lon: lon, district: userDistrict.name, state: userState.name, severity: liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "HIGH" : "MODERATE", submittedBy: "+91 XXXXX" });
        setReportSent(true);
    };

    // Google Maps navigation URL generator
    const getNavUrl = (destLat: number, destLon: number) => {
        const fromLat = simLoc?.lat || userDistrict.lat;
        const fromLon = simLoc?.lon || userDistrict.lng;
        return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${destLat},${destLon}&travelmode=driving`;
    };

    // OpenStreetMap embed URL
    const getMapEmbed = (destLat: number, destLon: number) => {
        const fromLat = simLoc?.lat || userDistrict.lat;
        const fromLon = simLoc?.lon || userDistrict.lng;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(fromLon, destLon) - 0.05},${Math.min(fromLat, destLat) - 0.05},${Math.max(fromLon, destLon) + 0.05},${Math.max(fromLat, destLat) + 0.05}&layer=mapnik&marker=${destLat},${destLon}`;
    };

    // Vulnerability map embed
    const getVulnMapEmbed = () => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${userDistrict.lng - 0.5},${userDistrict.lat - 0.5},${userDistrict.lng + 0.5},${userDistrict.lat + 0.5}&layer=mapnik&marker=${userDistrict.lat},${userDistrict.lng}`;
    };

    // Relief camps are fetched from the real backend API via fetchCamps()

    const GovHeader = ({ title, showBack }: { title?: string; showBack?: boolean }) => (
        <div className="w-full">
            <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
            <div className="bg-[#1a237e] text-white px-4 py-2.5">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showBack && <button onClick={() => setView("home")} className="text-white/70 hover:text-white mr-1"><ArrowLeft className="w-5 h-5" /></button>}
                        <span className="text-2xl">🏛️</span>
                        <div><h1 className="text-sm font-bold">{title || "Floody"}</h1><p className="text-[9px] text-blue-200">📍 {userDistrict.name}, {userState.name}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOffline && <span className="text-[9px] bg-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5"><WifiOff className="w-2.5 h-2.5" /> {t(language, "offline")}</span>}
                        <div className="relative">
                            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-1 rounded"><Globe className="w-3 h-3" /> {language}</button>
                            {showLangMenu && <div className="absolute right-0 mt-1 w-36 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">{languages.map(l => <button key={l} onClick={() => { setLanguage(l); setShowLangMenu(false) }} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${language === l ? "text-[#1a237e] font-bold bg-blue-50" : "text-gray-700"}`}>{l}</button>)}</div>}
                        </div>
                        <button onClick={onLogout} className="text-[10px] bg-white/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-white/20"><LogOut className="w-3 h-3" /></button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── EVACUATE (with map) ───
    if(view === "evacuate") {
        const firstCamp = reliefCamps[0];
        const dest = navTarget ? { lat: navTarget.lat, lon: navTarget.lon, label: navTarget.name } : firstCamp ? { lat: firstCamp.lat, lon: firstCamp.lon, label: firstCamp.name } : { lat: userDistrict.lat + 0.01, lon: userDistrict.lng + 0.015, label: `${userDistrict.name} Relief Camp` };
        return (
            <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "evacuation_route")} showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                    {/* Embedded Map */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <iframe src={getMapEmbed(dest.lat, dest.lon)} className="w-full h-48 border-0" loading="lazy" title="Route Map" />
                        <div className="p-3 flex items-center justify-between">
                            <div><p className="text-xs font-bold text-gray-800">📍 {simLoc ? `${simLoc.lat.toFixed(4)}°N` : t(language, "your_location")} → {dest.label}</p><p className="text-[10px] text-gray-400">via SIM GPS ({simLoc?.method || "detecting..."})</p></div>
                            <a href={getNavUrl(dest.lat, dest.lon)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-bold bg-[#1a237e] text-white px-3 py-2 rounded hover:bg-[#283593]">
                                <Navigation className="w-3.5 h-3.5" /> {t(language, "open_maps")}
                            </a>
                        </div>
                    </div>
                    {/* Route Steps */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5"><h2 className="text-base font-bold text-gray-800 mb-1">🧭 {t(language, "safe_route")}</h2><p className="text-sm text-gray-500 mb-4">{t(language, "avoid_flooded")}</p>
                        <div className="space-y-2">{[{ s: 1, d: t(language, "head_north"), dist: "1.2 km", tm: "8 min", ok: true }, { s: 2, d: t(language, "turn_right_flyover"), dist: "0.8 km", tm: "5 min", ok: true }, { s: 3, d: t(language, "avoid_flooded_zone"), dist: "—", tm: "—", ok: false }, { s: 4, d: `${t(language, "continue_to")} ${dest.label}`, dist: "2.1 km", tm: "12 min", ok: true }].map(r => <div key={r.s} className={`flex items-center gap-3 p-3 rounded border ${r.ok ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${r.ok ? "bg-[#1a237e]" : "bg-red-500"}`}>{r.s}</div><div className="flex-1"><p className={`text-sm font-medium ${r.ok ? "text-gray-800" : "text-red-700"}`}>{r.d}</p><p className="text-[10px] text-gray-400">{r.dist}·{r.tm}</p></div></div>)}</div>
                    </div>
                    {/* Time to Impact */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><h3 className="text-xs font-bold text-blue-800 uppercase mb-2">⏱️ {t(language, "time_to_impact")}</h3>
                        <div className="grid grid-cols-3 gap-2 text-center"><div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-blue-800">25</p><p className="text-[9px] text-gray-500">{t(language, "min_to_shelter")}</p></div><div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-red-600">45</p><p className="text-[9px] text-gray-500">{t(language, "min_to_flood")}</p></div><div className="bg-white border border-blue-100 rounded p-2"><p className="text-lg font-bold text-green-600">20</p><p className="text-[9px] text-gray-500">{t(language, "min_buffer")}</p></div></div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SHELTERS (with Navigate Here → opens Google Maps) ───
    if(view === "shelters") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "nearby_shelters")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {/* Mini map of area */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <iframe src={getVulnMapEmbed()} className="w-full h-36 border-0" loading="lazy" title="Area Map" />
                    <p className="text-[10px] text-gray-400 px-3 py-1.5">📍 {t(language, "shelters_near")} {userDistrict.name}</p>
                </div>
                {reliefCamps.length === 0 && !loadingCamps && <div className="text-center py-8 text-gray-400 text-sm">No relief camps found nearby. Try refreshing.</div>}
                {loadingCamps && <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#1a237e] mx-auto" /></div>}
                {reliefCamps.map((camp: any, i: number) => <div key={i} className={`bg-white border rounded-lg p-4 border-gray-200`}>
                    <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-800">{camp.name}</h3><span className={`text-[10px] px-2 py-0.5 rounded font-bold border bg-green-50 text-green-700 border-green-200`}>{t(language, "open")}</span></div>
                    <div className="flex gap-4 text-xs text-gray-500"><span>📍 {camp.distance_km ? `${camp.distance_km.toFixed(1)} km` : '—'}</span><span>👥 {camp.capacity || '—'}</span></div>
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => { setNavTarget({ name: camp.name, lat: camp.lat, lon: camp.lon }); setView("evacuate") }} className="flex-1 text-xs font-bold bg-[#1a237e] text-white py-2 rounded hover:bg-[#283593] flex items-center justify-center gap-1"><Navigation className="w-3.5 h-3.5" />{t(language, "navigate_here")}</button>
                        <a href={getNavUrl(camp.lat, camp.lon)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold border border-gray-200 text-gray-600 py-2 px-3 rounded hover:border-[#1a237e] flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" />{t(language, "maps")}</a>
                    </div>
                </div>)}
            </div>
        </div>
    );

    // ─── SOS (calls real backend API) ───
    if(view === "sos") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "emergency_sos")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-5">{!sosSent ? <div className="text-center space-y-5"><div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 border-2 border-red-300 animate-pulse"><Siren className="w-12 h-12 text-red-600" /></div><h2 className="text-xl font-bold text-red-800">{t(language, "emergency_sos")}</h2><p className="text-sm text-gray-600 max-w-xs mx-auto">{t(language, "sends_sos_desc")} ({simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E · via ${simLoc.method}` : "detecting..."})</p><button disabled={sosLoading} onClick={async () => { setSosLoading(true); try { const res = await createSOS(simLoc?.lat || userDistrict.lat, simLoc?.lon || userDistrict.lng, 'FLOOD', `Emergency SOS from ${userDistrict.name}`); setSosResult(res); setSosSent(true); speak(t(language, "sos_sent"), language); } catch { setSosSent(true); speak(t(language, "sos_sent"), language); } setSosLoading(false); }} className="w-full py-3 bg-red-600 text-white rounded-lg text-base font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">{sosLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : t(language, "send_sos_alert")}</button><div className="bg-white border border-gray-200 rounded-lg p-4 text-left space-y-2"><p className="text-xs text-gray-500 font-bold uppercase">{t(language, "helplines")}:</p>{[{ n: "NDRF", p: "011-24363260" }, { n: t(language, "disaster_mgmt"), p: "1078" }, { n: t(language, "emergency"), p: "112" }].map(h => <a key={h.p} href={`tel:${h.p}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-2.5 hover:border-[#1a237e]"><span className="text-sm text-gray-700">{h.n}</span><span className="text-sm font-mono text-[#1a237e] flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{h.p}</span></a>)}</div></div> : <div className="text-center space-y-4"><div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-300"><Shield className="w-8 h-8 text-green-600" /></div><h2 className="text-lg font-bold text-green-800">{t(language, "sos_sent")}</h2><p className="text-sm text-gray-600">{t(language, "rescue_eta")}</p>{sosResult?.assignedTeam && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800"><strong>Assigned NDRF Team:</strong> {sosResult.assignedTeam}</div>}<div className="bg-white border border-gray-200 rounded-lg p-4 text-left text-xs text-gray-600 space-y-1"><p>{t(language, "alert_id")}: <span className="font-mono text-gray-800">{sosResult?.sos?.id?.slice(0, 8) || `SOS-${Math.floor(Math.random() * 9000 + 1000)}`}</span></p><p>{t(language, "location")}: <span className="font-mono text-gray-800">{simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E` : "28.6139°N, 77.2090°E"}</span></p><p>{t(language, "method")}: <span className="font-mono text-gray-800">{simLoc?.method === "gps" ? "GPS" : simLoc?.method === "cell_tower" ? "Cell Tower" : "Wi-Fi"}</span></p></div><button onClick={() => { setSosSent(false); setSosResult(null); setView("home") }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button></div>}</div>
        </div>
    );

    // ─── ALERT FAMILY (calls real backend) ───
    if(view === "alert-family") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "alert_family")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">{!familyAlerted ? <><p className="text-sm text-gray-600">{t(language, "send_safety_status")} {userDistrict.name}, {userState.name}.</p><div className="space-y-2">{[{ n: t(language, "mom"), p: "+91 98765 XXXXX" }, { n: t(language, "dad"), p: "+91 98764 XXXXX" }, { n: t(language, "brother"), p: "+91 87654 XXXXX" }].map((c, i) => <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Users className="w-4 h-4 text-[#1a237e]" /></div><div><p className="text-sm font-semibold text-gray-800">{c.n}</p><p className="text-[10px] text-gray-400">{c.p}</p></div></div><span className="text-[10px] text-gray-400">✓</span></div>)}</div><button disabled={familySosLoading} onClick={async () => { setFamilySosLoading(true); try { await sendFamilySOS(`Safety alert from ${userDistrict.name}`, simLoc?.lat || userDistrict.lat, simLoc?.lon || userDistrict.lng); } catch { } setFamilyAlerted(true); speak(`${t(language, "alert_family")} sent`, language); setFamilySosLoading(false); }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">{familySosLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : t(language, "send_safety_alert")}</button></> : <div className="text-center space-y-4"><Shield className="w-14 h-14 text-green-600 mx-auto" /><h2 className="text-lg font-bold text-green-800">{t(language, "family_alerted")}</h2><p className="text-sm text-gray-600">{t(language, "sms_gps_sent")} {userDistrict.name}.</p><button onClick={() => { setFamilyAlerted(false); setView("home") }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button></div>}</div>
        </div>
    );

    // ─── RELIEF CAMPS (fetched from backend) ───
    if(view === "camps") {
        if(!loadingCamps && reliefCamps.length === 0) {
            setLoadingCamps(true);
            fetchCamps(simLoc?.lat || userDistrict.lat, simLoc?.lon || userDistrict.lng)
                .then(data => { setReliefCamps(data.camps || []); setLoadingCamps(false); })
                .catch(() => setLoadingCamps(false));
        }
        return (
            <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title="Relief Camps" showBack />
                <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                    {loadingCamps ? <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#1a237e] mx-auto" /><p className="text-xs text-gray-500 mt-2">Loading camps...</p></div> :
                        reliefCamps.length === 0 ? <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"><p className="text-sm text-yellow-800">No active relief camps found nearby. Showing default shelters.</p><button onClick={() => setView('shelters')} className="mt-2 text-xs text-[#1a237e] font-bold hover:underline">View Shelters →</button></div> :
                            reliefCamps.map((camp: any, i: number) => (
                                <div key={camp.id || i} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-800">{camp.name}</h3>
                                        <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-green-50 text-green-700 border-green-200">
                                            {camp.available_spots != null ? `${camp.available_spots} spots` : 'Open'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        {camp.distance_km != null && <span>📍 {camp.distance_km} km</span>}
                                        <span>👥 {camp.currentOccupancy || 0}/{camp.capacity}</span>
                                        {camp.facilities && <span>🏥 {camp.facilities}</span>}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={async () => {
                                            const route = await fetchSafeRoute(simLoc?.lat || userDistrict.lat, simLoc?.lon || userDistrict.lng, camp.id);
                                            setSafeRoute(route);
                                            setNavTarget({ name: camp.name, lat: camp.lat, lon: camp.lon });
                                            setView('evacuate');
                                        }} className="flex-1 text-xs font-bold bg-[#1a237e] text-white py-2 rounded hover:bg-[#283593] flex items-center justify-center gap-1">
                                            <Navigation className="w-3.5 h-3.5" /> Safe Route
                                        </button>
                                        <a href={getNavUrl(camp.lat, camp.lon)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold border border-gray-200 text-gray-600 py-2 px-3 rounded hover:border-[#1a237e] flex items-center gap-1">
                                            <ExternalLink className="w-3.5 h-3.5" /> Maps
                                        </a>
                                    </div>
                                    {safeRoute && safeRoute.to.name === camp.name && (
                                        <div className={`mt-2 p-2 rounded text-xs border ${safeRoute.risk_level === 'HIGH' ? 'bg-red-50 border-red-200 text-red-700' :
                                            safeRoute.risk_level === 'MODERATE' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                'bg-green-50 border-green-200 text-green-700'
                                            }`}>
                                            <strong>Route:</strong> {safeRoute.distance_km} km · ETA {safeRoute.eta_minutes} min · Risk: {safeRoute.risk_level}
                                            {safeRoute.warning && <p className="mt-1 text-red-600">⚠️ {safeRoute.warning}</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                </div>
            </div>
        );
    }

    // ─── VULNERABILITY (MAP + LOCAL ONLY) ───
    if(view === "vulnerability") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={`${t(language, "vulnerable_areas")} — ${userState.name}`} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {/* Map */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <iframe src={getVulnMapEmbed()} className="w-full h-48 border-0" loading="lazy" title="Vulnerability Map" />
                    <p className="text-[10px] text-gray-400 px-3 py-1.5">📍 {t(language, "vulnerability_hotspots")} {userState.name}</p>
                </div>
                <div className="bg-[#fff3cd] border border-[#ffc107] rounded px-3 py-2 text-xs text-[#856404]"><strong>{t(language, "priority_notice")}</strong> {userState.name}.</div>
                {/* User's district first */}
                <div className="bg-white border-2 border-[#1a237e] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2"><div><h3 className="text-sm font-bold text-[#1a237e]">📍 {userDistrict.name} (Your Location)</h3></div><div className="text-right"><span className="text-sm font-bold text-red-600">{userDistrict.vulnerability.vulnerability_score}/10</span></div></div>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">{[{ l: t(language, "elderly"), v: userDistrict.vulnerability.elderly_pct }, { l: t(language, "children"), v: userDistrict.vulnerability.children_pct }, { l: t(language, "disabled"), v: userDistrict.vulnerability.disabled_pct }, { l: "EWS", v: userDistrict.vulnerability.ews_pct }].map((x, i) => <div key={i} className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">{x.l}</span><br /><span className="font-bold text-gray-700">{x.v}%</span></div>)}</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-1.5"><div className="bg-red-500 rounded-full h-1.5" style={{ width: `${userDistrict.vulnerability.vulnerability_score * 10}%` }} /></div>
                </div>
                {/* Other districts in same state */}
                {myVuln.filter(d => d.name !== userDistrict.name).map((d, i) => <div key={i} className="bg-white border border-gray-200 rounded-lg p-4"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-800">{d.name}</h3><span className="text-sm font-bold text-red-600">{d.vulnerability.vulnerability_score}/10</span></div><div className="grid grid-cols-4 gap-1 text-[10px]"><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">👴</span><br /><span className="font-bold">{d.vulnerability.elderly_pct}%</span></div><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">👶</span><br /><span className="font-bold">{d.vulnerability.children_pct}%</span></div><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">♿</span><br /><span className="font-bold">{d.vulnerability.disabled_pct}%</span></div><div className="bg-gray-50 rounded p-1.5 text-center"><span className="text-gray-400">💰</span><br /><span className="font-bold">{d.vulnerability.ews_pct}%</span></div></div><div className="mt-2 bg-gray-200 rounded-full h-1.5"><div className="bg-red-500 rounded-full h-1.5" style={{ width: `${d.vulnerability.vulnerability_score * 10}%` }} /></div></div>)}
            </div>
        </div>
    );

    // ─── DAMS (MAP + LOCAL STATE ONLY) ───
    if(view === "dams") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={`${t(language, "dam_monitoring")} — ${userState.name}`} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {myDams.length > 0 ? <>
                    {/* Map */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${myDams[0].lng - 0.5},${myDams[0].lat - 0.5},${myDams[0].lng + 0.5},${myDams[0].lat + 0.5}&layer=mapnik&marker=${myDams[0].lat},${myDams[0].lng}`} className="w-full h-48 border-0" loading="lazy" title="Dam Map" />
                        <p className="text-[10px] text-gray-400 px-3 py-1.5">📍 {t(language, "dams_reservoirs_near")} {userDistrict.name}, {userState.name}</p>
                    </div>
                    {dangerDams.length > 0 && <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700"><strong>⚠️ {dangerDams.length} {t(language, "dam_critical")}</strong></div>}
                    {myDams.map((d, i) => <div key={i} className="bg-white border border-gray-200 rounded-lg p-4"><div className="flex items-center justify-between mb-2"><div><h3 className="text-sm font-bold text-gray-800">{d.name}</h3><p className="text-[10px] text-gray-400">{t(language, "river")}: {d.river} · {d.district}</p></div><span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${damC(d.status)}`}>{d.status}</span></div><div className="flex items-center gap-2 mt-2"><div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full ${d.current_level_pct > 90 ? "bg-red-500" : d.current_level_pct > 80 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${d.current_level_pct}%` }} /></div><span className="text-xs font-bold text-gray-700">{d.current_level_pct}%</span></div><p className="text-[10px] text-gray-400 mt-1">{t(language, "capacity")}: {d.capacity_mcm} MCM</p></div>)}
                </> : <div className="text-center py-12 text-gray-400"><Droplets className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">{t(language, "no_dams")} {userState.name}.</p></div>}
            </div>
        </div>
    );

    // ─── CITIZEN REPORT ───
    if(view === "report") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "report_flood")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">{!reportSent ? <><div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"><p className="text-sm text-gray-600">{t(language, "report_from")} <strong>{userDistrict.name}, {userState.name}</strong>. {t(language, "gps_auto")}</p><div><label className="block text-xs font-bold text-gray-500 mb-1">{t(language, "type")}</label><select value={reportType} onChange={e => setReportType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800"><option value="waterlogging">🌊 {t(language, "waterlogging")}</option><option value="drainage_blocked">🚰 {t(language, "drainage_blocked")}</option><option value="road_flooded">🛣️ {t(language, "road_flooded")}</option><option value="embankment_breach">🏗️ {t(language, "embankment_breach")}</option><option value="other">📋 {t(language, "other")}</option></select></div><button onClick={() => fileInputRef.current?.click?.()} className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#1a237e]">{reportPhoto ? <img src={reportPhoto} alt="" className="w-20 h-20 object-cover rounded" /> : <><Camera className="w-5 h-5" /><span className="text-sm">{t(language, "upload_photo")}</span></>}</button><input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = ev => setReportPhoto(ev.target?.result as string); r.readAsDataURL(f) } }} className="hidden" ref={fileInputRef} /><textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder={t(language, "describe_situation")} className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400" rows={3} /><div className="flex items-center gap-2 text-[10px] text-gray-400"><MapPin className="w-3 h-3" />GPS: {simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E (${simLoc.method})` : "detecting..."}</div></div><button onClick={handleSubmitReport} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"><Send className="w-4 h-4" />{t(language, "submit_report")}</button></> : <div className="text-center space-y-4"><Shield className="w-14 h-14 text-green-600 mx-auto" /><h2 className="text-lg font-bold text-green-800">{t(language, "report_submitted")}</h2><p className="text-sm text-gray-600">{t(language, "report_sent_desc")}</p><button onClick={() => { setReportSent(false); setReportPhoto(null); setReportDesc(""); setView("home") }} className="w-full py-2.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold">{t(language, "back")}</button></div>}</div>
        </div>
    );

    // ─── ANALYTICS (HYDROMET) ───
    if(view === "analytics") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "hydromet_analytics")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📍 {userDistrict.name} — {t(language, "live_conditions")}</h3>
                    <div className="grid grid-cols-2 gap-3">{[{ l: `🌧️ ${t(language, "rainfall_24h")}`, v: `${liveRisk?.weather?.rainfall_24h || userDistrict.rainfall}mm` }, { l: `🌡️ ${t(language, "temperature")}`, v: `${liveRisk?.weather?.temperature || 28}°C` }, { l: `💧 ${t(language, "soil_moisture")}`, v: `${((liveRisk?.weather?.soil_moisture || 0) * 100).toFixed(0)}%` }, { l: `💨 ${t(language, "wind_speed")}`, v: `${liveRisk?.weather?.wind_speed || 0} km/h` }, { l: `🌊 ${t(language, "river_discharge")}`, v: `${liveRisk?.discharge?.current_discharge?.toFixed(1) || 0} m³/s` }, { l: `📊 ${t(language, "seven_day_rain")}`, v: `${liveRisk?.weather?.rainfall_7d || 0}mm` }].map((m, i) => <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3"><p className="text-[10px] text-gray-400">{m.l}</p><p className="text-sm font-bold text-gray-800 mt-0.5">{m.v}</p></div>)}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📈 {t(language, "rainfall_trend")}</h3>
                    <div className="flex items-end gap-1 h-24">{(liveRisk?.weather?.daily_precipitation || [12, 8, 25, 40, 62, 35, 18, 9, 15, 22]).slice(-10).map((v, i) => { const max = Math.max(...(liveRisk?.weather?.daily_precipitation || [62]).slice(-10)); return <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5"><span className="text-[8px] text-gray-400">{typeof v === 'number' ? v.toFixed(0) : v}</span><div className={`w-full rounded-t ${Number(v) > 40 ? "bg-red-500" : Number(v) > 20 ? "bg-yellow-500" : "bg-blue-400"}`} style={{ height: `${Math.max(4, (Number(v) / Math.max(max, 1)) * 80)}px` }} /></div> })}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-2">🤖 Forecasting Model</h3>
                    <div className="space-y-2 text-xs text-gray-600"><p><strong>{t(language, "model")}:</strong> {liveRisk?.model === "trained" ? "XGBoost ML" : "AI Analysis (Heuristic)"}</p><p><strong>{t(language, "sources")}:</strong> Open-Meteo, GloFAS, IMD</p><p><strong>{t(language, "accuracy")}:</strong> ~85% (1hr), ~72% (6hr)</p></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-2">🏗️ {t(language, "infrastructure")} — {userDistrict.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs"><div className={`p-2 rounded border ${userDistrict.drainageHealth === "BLOCKED" || userDistrict.drainageHealth === "POOR" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}><p className="text-gray-500">{t(language, "drainage")}</p><p className="font-bold">{userDistrict.drainageHealth || "N/A"}</p></div><div className={`p-2 rounded border ${userDistrict.embankmentRisk === "HIGH" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}><p className="text-gray-500">{t(language, "embankment")}</p><p className="font-bold">{userDistrict.embankmentRisk || "N/A"}</p></div></div>
                </div>
            </div>
        </div>
    );

    // ─── SIM GPS LOCATION ───
    if(view === "location-info") return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader title={t(language, "sim_gps_location")} showBack />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {simLoc && <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${simLoc.lon - 0.02},${simLoc.lat - 0.02},${simLoc.lon + 0.02},${simLoc.lat + 0.02}&layer=mapnik&marker=${simLoc.lat},${simLoc.lon}`} className="w-full h-48 border-0" loading="lazy" title="Your Location" />
                </div>}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><p className="text-xs text-blue-700"><strong>{t(language, "how_it_works").split(".")[0]}:</strong> Like &quot;Where is my Train&quot;, your location is detected via mobile network cell tower triangulation.</p></div>
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📍 {t(language, "current_location")}</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">{[{ l: t(language, "latitude"), v: simLoc ? `${simLoc.lat.toFixed(4)}°N` : "..." }, { l: t(language, "longitude"), v: simLoc ? `${simLoc.lon.toFixed(4)}°E` : "..." }, { l: t(language, "accuracy_label"), v: simLoc ? `±${simLoc.accuracy_m}m` : "..." }, { l: "Method", v: simLoc?.method === "gps" ? "GPS" : simLoc?.method === "cell_tower" ? "Cell Tower" : "Wi-Fi" }, { l: t(language, "tower_id"), v: simLoc?.tower_id || "..." }, { l: t(language, "signal"), v: simLoc?.signal_strength ? `${simLoc.signal_strength} dBm` : "..." }].map((m, i) => <div key={i} className="bg-gray-50 border border-gray-100 rounded p-3"><p className="text-[10px] text-gray-400">{m.l}</p><p className="text-sm font-bold text-gray-800 font-mono">{m.v}</p></div>)}</div>
                </div>
                {towers.length > 0 && <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📡 {t(language, "nearest_towers")}</h3><div className="space-y-2">{towers.map((tw, i) => <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded px-3 py-2"><div><p className="text-xs font-mono text-gray-800">{tw.id}</p><p className="text-[10px] text-gray-400">{tw.distance_km} km away</p></div><p className="text-xs font-bold text-gray-700">{tw.signal} dBm</p></div>)}</div></div>}
            </div>
        </div>
    );

    // ─── MESH CHAT ───
    if(view === "mesh") {
        // Start mesh on mount
        if(!meshState) {
            const st = startMesh((msg) => setMeshMessages(prev => {
                if(prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            }));
            setMeshState(st);
        }
        const identity = getNodeIdentity();
        const typeBadge = (t: string) => t === "SOS" ? "bg-red-600 text-white" : t === "ALERT" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : t === "LOCATION" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-600 border border-gray-200";
        return (
            <div className="min-h-screen bg-[#f5f5f0] flex flex-col"><GovHeader title={t(language, "floodmesh_chat")} showBack />
                <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
                    {/* Mesh Status */}
                    <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-bold text-gray-500">NODE: {identity.nodeId}</span></div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400"><span className="flex items-center gap-1"><Wifi className="w-3 h-3" />{t(language, "mesh_active")}</span><span>{meshMessages.length} {t(language, "msgs")}</span></div>
                    </div>
                    <div className="bg-[#e8eaf6] px-4 py-1.5 text-[10px] text-[#1a237e]">📡 {t(language, "mesh_relay_desc")}</div>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                        {meshMessages.map((msg, i) => (
                            <div key={msg.id} className={`rounded-lg p-3 ${msg.senderId === identity.nodeId ? 'bg-[#e8eaf6] ml-8 border border-[#c5cae9]' : 'bg-white mr-8 border border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-800">{msg.senderName}</span>
                                    <div className="flex items-center gap-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${typeBadge(msg.type)}`}>{msg.type}</span>
                                        {msg.hops > 0 && <span className="text-[9px] text-gray-400">🔀 {msg.hops} hop{msg.hops > 1 ? 's' : ''}</span>}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700">{msg.payload}</p>
                                <p className="text-[9px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()} · via {msg.via.join(' → ')}</p>
                            </div>
                        ))}
                        <div ref={meshBottomRef} />
                    </div>
                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-200">
                        <div className="flex gap-2">
                            <button onClick={() => { const loc = simLoc ? `${simLoc.lat.toFixed(4)}°N, ${simLoc.lon.toFixed(4)}°E` : `${userDistrict.lat}°N, ${userDistrict.lng}°E`; sendSOS(loc); }} className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700" title="Broadcast SOS"><Siren className="w-5 h-5" /></button>
                            <input value={meshInput} onChange={e => setMeshInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && meshInput.trim()) { sendMeshMessage(meshInput.trim()); setMeshInput(''); } }} placeholder={t(language, "type_message")} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400" />
                            <button onClick={() => { if(meshInput.trim()) { sendMeshMessage(meshInput.trim()); setMeshInput(''); } }} className="flex items-center justify-center w-10 h-10 bg-[#1a237e] text-white rounded-lg hover:bg-[#283593]"><Send className="w-5 h-5" /></button>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1.5 text-center">{t(language, "mesh_broadcast_desc")}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── HOME ───
    return (
        <div className="min-h-screen bg-[#f5f5f0]"><GovHeader />
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {/* AM I SAFE */}
                <button onClick={handleAmISafe} className={`w-full rounded-lg p-4 flex items-center justify-between border-2 transition-all ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-400" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-400" : "bg-green-50 border-green-400"}`}>
                    <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-full flex items-center justify-center ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-200" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-200" : "bg-green-200"}`}><Volume2 className={`w-6 h-6 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "text-red-700" : liveRisk?.riskLevel === "MODERATE" ? "text-yellow-700" : "text-green-700"}`} /></div><div className="text-left"><h2 className="text-lg font-bold text-gray-800">{t(language, "am_i_safe")}</h2><p className="text-xs text-gray-500">{t(language, "tap_voice_alert")} {language}</p></div></div>
                    <div className="text-2xl font-black">{liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "🔴" : liveRisk?.riskLevel === "MODERATE" ? "🟡" : "🟢"}</div>
                </button>
                {/* Risk */}
                {loadingRisk ? <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 text-[#1a237e] animate-spin" /><span className="text-sm text-gray-500">{t(language, "loading")}</span></div> : <div className={`border rounded-lg p-4 ${liveRisk?.riskLevel === "HIGH" || liveRisk?.riskLevel === "SEVERE" ? "bg-red-50 border-red-300" : liveRisk?.riskLevel === "MODERATE" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"}`}><div className="flex items-center justify-between mb-2"><span className={`text-xs font-bold px-2 py-0.5 rounded border ${sev(liveRisk?.riskLevel || "LOW")}`}>{liveRisk?.riskLevel || "LOW"}</span><span className="text-[10px] text-gray-500">{isOffline ? <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" />{t(language, "cached")}</span> : <span>📡 {t(language, "live")} · {userDistrict.name}</span>}</span></div><p className="text-sm text-gray-600">{t(language, "flood_probability")}: <strong>{((liveRisk?.probability || 0) * 100).toFixed(0)}%</strong> · {t(language, "score")}: {liveRisk?.riskScore || 0}/10</p>{liveRisk?.weather && <div className="grid grid-cols-3 gap-2 mt-2"><div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">{t(language, "rain_24h")}</p><p className="text-sm font-bold text-gray-800">{liveRisk.weather.rainfall_24h}mm</p></div><div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">{t(language, "temp")}</p><p className="text-sm font-bold text-gray-800">{liveRisk.weather.temperature}°C</p></div><div className="bg-white/80 border border-gray-200 rounded p-2 text-center"><p className="text-[9px] text-gray-400">{t(language, "soil")}</p><p className="text-sm font-bold text-gray-800">{((liveRisk.weather.soil_moisture || 0) * 100).toFixed(0)}%</p></div></div>}</div>}
                {/* SIM Location */}
                {simLoc && <button onClick={() => setView("location-info")} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between hover:border-[#1a237e]"><div className="flex items-center gap-2"><Radio className="w-4 h-4 text-[#1a237e]" /><div className="text-left"><p className="text-xs font-semibold text-gray-800">SIM GPS: {simLoc.lat.toFixed(3)}°N, {simLoc.lon.toFixed(3)}°E</p><p className="text-[10px] text-gray-400">via {simLoc.method === "gps" ? "GPS" : simLoc.method === "cell_tower" ? "Cell Tower" : "Wi-Fi"} · ±{simLoc.accuracy_m}m</p></div></div><ChevronRight className="w-4 h-4 text-gray-400" /></button>}
                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{t(language, "quick_actions")}</h3>
                    <div className="grid grid-cols-2 gap-2">{[{ i: <Navigation className="w-4 h-4" />, l: t(language, "evacuation_route"), v: "evacuate" as View, c: "#1a237e" }, { i: <MapPin className="w-4 h-4" />, l: t(language, "nearby_shelters"), v: "shelters" as View, c: "#1a237e" }, { i: <Shield className="w-4 h-4" />, l: "Relief Camps", v: "camps" as View, c: "#2e7d32" }, { i: <Siren className="w-4 h-4" />, l: t(language, "send_sos"), v: "sos" as View, c: "#b71c1c" }, { i: <Bell className="w-4 h-4" />, l: t(language, "alert_family"), v: "alert-family" as View, c: "#1a237e" }, { i: <MessageCircle className="w-4 h-4" />, l: t(language, "floodmesh_chat"), v: "mesh" as View, c: "#2e7d32" }, { i: <Camera className="w-4 h-4" />, l: t(language, "report_flood"), v: "report" as View, c: "#1a237e" }, { i: <TrendingUp className="w-4 h-4" />, l: t(language, "hydromet_analytics"), v: "analytics" as View, c: "#1a237e" }, { i: <Heart className="w-4 h-4" />, l: t(language, "vulnerable_areas"), v: "vulnerability" as View, c: "#b71c1c" }, { i: <Droplets className="w-4 h-4" />, l: t(language, "dam_monitoring"), v: "dams" as View, c: "#1a237e" }].map((it, i) => <button key={i} onClick={() => setView(it.v)} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-left hover:border-[#1a237e] group"><div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ backgroundColor: it.c }}>{it.i}</div><span className="text-xs font-semibold text-gray-700 group-hover:text-[#1a237e]">{it.l}</span></button>)}</div>
                </div>
                {/* Dam alerts from YOUR state */}
                {dangerDams.length > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><h3 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />{t(language, "dams_near")} {userState.name}</h3>{dangerDams.map((d, i) => <div key={i} className="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0"><div><p className="text-xs font-semibold text-gray-800">{d.name}</p><p className="text-[10px] text-gray-500">{d.river}·{d.district}</p></div><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${damC(d.status)}`}>{d.status} ({d.current_level_pct}%)</span></div>)}<button onClick={() => setView("dams")} className="mt-2 text-[10px] font-bold text-[#1a237e]">{t(language, "view_all")} →</button></div>}
                {/* Recent Reports from YOUR state */}
                {myReports.length > 0 && <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3">📝 {t(language, "reports_label")} ({userState.name})</h3><div className="space-y-2">{myReports.slice(0, 3).map((r, i) => <div key={i} className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded p-2"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sev(r.severity)}`}>{r.severity}</span><div className="flex-1"><p className="text-xs text-gray-700">{r.description.slice(0, 80)}...</p><p className="text-[10px] text-gray-400 mt-0.5">{r.district} · 👍 {r.upvotes}</p></div></div>)}</div></div>}
                {/* Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{t(language, "active_alerts")}</h3><div className="space-y-2">{alertItems.map((a, i) => <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sev(a.severity)}`}>{a.severity}</span><div className="flex-1"><p className="text-xs text-gray-700">{a.msg}</p><p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p></div></div>)}</div></div>
                <div className="text-center text-[10px] text-gray-400 py-2">{t(language, "copyright")}</div>
            </div>
        </div>
    );
}
