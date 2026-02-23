"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io } from 'socket.io-client';
import { AlertTriangle, Activity, Layers, Radio, Shield, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { fetchRiskPrediction, fetchBulkRisk, type BulkRiskResult } from '@/lib/api';
import { STATES_DATA } from '@/data/statesData';

const MONITORING_POINTS = STATES_DATA.flatMap(state =>
    state.districts.map(d => ({
        name: d.name,
        state: state.name,
        lat: state.lat + (Math.random() - 0.5) * 2,
        lon: state.lng + (Math.random() - 0.5) * 2,
    }))
);

export default function MapDashboard({ onLogout }: { onLogout?: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('light');
    const [showRiskZones, setShowRiskZones] = useState(true);
    const [sensorCount, setSensorCount] = useState(0);
    const [zoneCount, setZoneCount] = useState(0);
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [riskData, setRiskData] = useState<BulkRiskResult[]>([]);

    const tileStyles: Record<string, string> = {
        light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    };

    const loadBulkRisk = useCallback(async () => {
        setLoadingBulk(true);
        try {
            const locations = MONITORING_POINTS.slice(0, 30).map(p => ({
                lat: p.lat, lon: p.lon,
                district_name: p.name, state_name: p.state,
            }));
            const results = await fetchBulkRisk(locations);
            setRiskData(results);
            setSensorCount(results.length);
            setZoneCount(results.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'SEVERE').length);
            results.forEach(r => {
                if(r.risk_level === 'HIGH' || r.risk_level === 'SEVERE') {
                    setAlerts(prev => [
                        `[${new Date().toLocaleTimeString()}] ${r.district}, ${r.state} → ${r.risk_level} (${r.risk_score})`,
                        ...prev.slice(0, 49)
                    ]);
                }
            });
        } catch(e) {
            console.error('Bulk risk fetch failed:', e);
        } finally {
            setLoadingBulk(false);
        }
    }, []);

    useEffect(() => {
        if(!mapContainer.current || map.current) return;
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: tileStyles[mapStyle],
            center: [82.5, 23.0],
            zoom: 5,
        });
        const m = map.current;
        m.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        m.addControl(new maplibregl.ScaleControl({}), 'bottom-left');

        m.on('click', async (e) => {
            const { lat, lng } = e.lngLat;
            const popup = new maplibregl.Popup({ maxWidth: '300px' })
                .setLngLat(e.lngLat)
                .setHTML(`<div style="font-family:system-ui;font-size:12px;color:#4b5563;padding:6px;"><div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border:2px solid #1a237e;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>Analysing ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E...</div><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div>`)
                .addTo(m);
            try {
                const data = await fetchRiskPrediction(lat, lng);
                const riskColor = data.riskLevel === 'HIGH' || data.riskLevel === 'SEVERE' ? '#dc2626' : data.riskLevel === 'MODERATE' ? '#d97706' : '#16a34a';
                popup.setHTML(`
                    <div style="font-family:system-ui;font-size:12px;min-width:220px;">
                        <div style="background:${riskColor}15;border:1px solid ${riskColor}30;border-radius:4px;padding:8px;margin-bottom:6px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <strong style="color:${riskColor};font-size:13px;">${data.riskLevel} RISK</strong>
                                <span style="color:${riskColor};font-size:14px;font-weight:bold;">${data.riskScore}/10</span>
                            </div>
                            <div style="color:#6b7280;font-size:10px;margin-top:3px;">Flood probability: ${((data.probability || 0) * 100).toFixed(0)}%</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;">
                                <div style="color:#9ca3af;font-size:9px;">RAIN 24H</div>
                                <div style="color:#1f2937;font-weight:bold;font-size:12px;">${data.weather?.rainfall_24h || 0}mm</div>
                            </div>
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;">
                                <div style="color:#9ca3af;font-size:9px;">TEMP</div>
                                <div style="color:#1f2937;font-weight:bold;font-size:12px;">${data.weather?.temperature || 0}°C</div>
                            </div>
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;">
                                <div style="color:#9ca3af;font-size:9px;">SOIL MOIST</div>
                                <div style="color:#1f2937;font-weight:bold;font-size:12px;">${((data.weather?.soil_moisture || 0) * 100).toFixed(0)}%</div>
                            </div>
                            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px;text-align:center;">
                                <div style="color:#9ca3af;font-size:9px;">DISCHARGE</div>
                                <div style="color:#1f2937;font-weight:bold;font-size:12px;">${data.discharge?.current_discharge?.toFixed(1) || 0} m³/s</div>
                            </div>
                        </div>
                        <div style="color:#9ca3af;font-size:9px;margin-top:5px;text-align:right;">
                            📡 ${data.model === 'trained' ? 'ML Model' : 'AI Analysis'} · ${data.weather?.source || 'Open-Meteo'}
                        </div>
                    </div>
                `);
                setAlerts(prev => [`[${new Date().toLocaleTimeString()}] ${lat.toFixed(2)},${lng.toFixed(2)} → ${data.riskLevel} (${data.riskScore})`, ...prev.slice(0, 49)]);
            } catch {
                popup.setHTML(`<div style="font-family:system-ui;font-size:12px;color:#dc2626;padding:8px;">⚠️ Failed to fetch data</div>`);
            }
        });

        return () => { m.remove(); map.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded() || riskData.length === 0) return;
        const m = map.current;
        try {
            if(m.getLayer('risk-markers-circle')) m.removeLayer('risk-markers-circle');
            if(m.getLayer('risk-markers-label')) m.removeLayer('risk-markers-label');
            if(m.getSource('risk-markers')) m.removeSource('risk-markers');
        } catch { /* ignore */ }
        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: riskData.filter(r => !r.error).map(r => ({
                type: 'Feature' as const,
                properties: { risk_level: r.risk_level, risk_score: r.risk_score, name: r.district || '' },
                geometry: { type: 'Point' as const, coordinates: [r.lon, r.lat] }
            }))
        };
        m.addSource('risk-markers', { type: 'geojson', data: geojson });
        m.addLayer({
            id: 'risk-markers-circle', type: 'circle', source: 'risk-markers',
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['get', 'risk_score'], 0, 6, 5, 10, 10, 18],
                'circle-color': ['match', ['get', 'risk_level'], 'SEVERE', '#dc2626', 'HIGH', '#ef4444', 'MODERATE', '#d97706', '#16a34a'],
                'circle-opacity': 0.7,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-stroke-opacity': 0.9,
            }
        });
        m.addLayer({
            id: 'risk-markers-label', type: 'symbol', source: 'risk-markers',
            layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-offset': [0, 1.8], 'text-anchor': 'top' },
            paint: { 'text-color': '#374151', 'text-halo-color': '#ffffff', 'text-halo-width': 1 }
        });
    }, [riskData]);

    useEffect(() => {
        loadBulkRisk();
        const interval = setInterval(loadBulkRisk, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadBulkRisk]);

    useEffect(() => {
        if(!map.current || !map.current.isStyleLoaded()) return;
        const v = showRiskZones ? 'visible' : 'none';
        try {
            if(map.current.getLayer('risk-markers-circle')) map.current.setLayoutProperty('risk-markers-circle', 'visibility', v);
            if(map.current.getLayer('risk-markers-label')) map.current.setLayoutProperty('risk-markers-label', 'visibility', v);
        } catch { /* not ready */ }
    }, [showRiskZones]);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
        socket.emit('subscribe_telemetry', 'ALL');
        socket.on('risk_update', (data) => {
            setAlerts(prev => [`[${new Date(data.timestamp).toLocaleTimeString()}] ${data.districtId} → ${data.riskLevel} (${data.riskScore})`, ...prev.slice(0, 49)]);
        });
        return () => { socket.disconnect(); };
    }, []);

    const switchStyle = (style: 'light' | 'dark' | 'satellite') => {
        setMapStyle(style);
        if(map.current) {
            map.current.setStyle(tileStyles[style]);
            map.current.once('style.load', () => { if(riskData.length > 0) setRiskData([...riskData]); });
        }
    };

    return (
        <div className="flex h-screen w-full bg-white font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-white flex flex-col border-r border-gray-200 z-10">
                {/* Header */}
                <div className="border-b border-gray-200">
                    <div className="flex h-1"><div className="flex-1" style={{ backgroundColor: '#FF9933' }} /><div className="flex-1 bg-white" /><div className="flex-1" style={{ backgroundColor: '#138808' }} /></div>
                    <div className="bg-[#1a237e] text-white px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">🏛️</span>
                            <div>
                                <h1 className="text-sm font-bold">FloodSense AI</h1>
                                <p className="text-[9px] text-blue-200">NDRF Command Station</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="p-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Shield className="w-3 h-3" /> System Status
                            </h2>
                            <div className="flex items-center gap-1 text-green-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <span className="text-[10px] font-bold">ACTIVE</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-white border border-gray-100 rounded p-2 text-center">
                                <div className="text-gray-400 text-[9px]">Monitoring</div>
                                <div className="font-bold text-[#1a237e]">{sensorCount || '...'}</div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded p-2 text-center">
                                <div className="text-gray-400 text-[9px]">High Risk</div>
                                <div className="font-bold text-red-600">{zoneCount || '0'}</div>
                            </div>
                        </div>
                        <button onClick={loadBulkRisk} disabled={loadingBulk}
                            className="mt-2 w-full text-[10px] font-bold py-1.5 rounded bg-[#1a237e] text-white hover:bg-[#283593] transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                            {loadingBulk ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            {loadingBulk ? 'Analysing...' : 'Refresh Live Data'}
                        </button>
                    </div>
                </div>

                {/* Map Controls */}
                <div className="px-3 pb-2">
                    <h2 className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Map View
                    </h2>
                    <div className="flex gap-1">
                        {(['light', 'dark', 'satellite'] as const).map(s => (
                            <button key={s} onClick={() => switchStyle(s)}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded border transition-all capitalize ${mapStyle === s ? 'bg-[#1a237e] text-white border-[#1a237e]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a237e]'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowRiskZones(!showRiskZones)}
                        className={`mt-1.5 w-full text-[10px] font-bold py-1.5 rounded border transition-all ${showRiskZones ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {showRiskZones ? '🔴 Risk Markers: ON' : '⚪ Risk Markers: OFF'}
                    </button>
                </div>

                {/* Telemetry Feed */}
                <div className="flex-1 overflow-hidden flex flex-col px-3 pb-3">
                    <h2 className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-red-500" /> Live Telemetry
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                <Activity className="w-6 h-6 mb-2" />
                                <p className="text-[10px]">Click map or wait for data...</p>
                            </div>
                        ) : null}
                        {alerts.map((msg, i) => (
                            <div key={i} className="text-[10px] font-mono bg-gray-50 border border-gray-100 p-1.5 rounded truncate" title={msg}>
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-gray-200 space-y-1.5">
                    {onLogout && (
                        <button onClick={onLogout}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-50 transition-colors">
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    )}
                    <p className="text-[8px] text-gray-400 text-center">FloodSense AI v2.0 · NDRF · Govt. of India</p>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <div ref={mapContainer} className="w-full h-full" />
                {loadingBulk && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center gap-2 z-20">
                        <Loader2 className="w-4 h-4 text-[#1a237e] animate-spin" />
                        <span className="text-xs text-gray-600">Fetching live weather data...</span>
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Risk Legend (Live)</h3>
                    <div className="space-y-1">
                        {[
                            { color: '#ef4444', label: 'High / Severe Risk' },
                            { color: '#d97706', label: 'Moderate Risk' },
                            { color: '#16a34a', label: 'Low Risk' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                                <span className="text-[11px] text-gray-600">{l.label}</span>
                            </div>
                        ))}
                    </div>
                    <hr className="my-2 border-gray-100" />
                    <div className="text-[9px] text-gray-400 space-y-0.5">
                        <p>📡 Source: Open-Meteo API</p>
                        <p>🖱️ Click for prediction</p>
                        <p>🔄 Auto-refresh: 10 min</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
