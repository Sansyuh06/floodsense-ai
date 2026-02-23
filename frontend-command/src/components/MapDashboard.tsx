"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io } from 'socket.io-client';
import { AlertTriangle, Activity, Droplets, Layers, Radio, Shield, LogOut } from 'lucide-react';

// Mock GeoJSON for Risk Zones
const riskZonesGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { riskLevel: 'HIGH', name: 'South Delhi Flood Plain' },
            geometry: { type: 'Polygon', coordinates: [[[77.18, 28.52], [77.25, 28.52], [77.25, 28.58], [77.18, 28.58], [77.18, 28.52]]] }
        },
        {
            type: 'Feature',
            properties: { riskLevel: 'MODERATE', name: 'Yamuna East Bank' },
            geometry: { type: 'Polygon', coordinates: [[[77.26, 28.60], [77.32, 28.60], [77.32, 28.66], [77.26, 28.66], [77.26, 28.60]]] }
        },
        {
            type: 'Feature',
            properties: { riskLevel: 'LOW', name: 'West Ridge Corridor' },
            geometry: { type: 'Polygon', coordinates: [[[77.08, 28.64], [77.16, 28.64], [77.16, 28.70], [77.08, 28.70], [77.08, 28.64]]] }
        }
    ]
};

// Simulated sensor data
const mockSensors = [
    { id: 'S1', type: 'RIVER_GAUGE', lat: 28.61, lng: 77.22, value: 204.3 },
    { id: 'S2', type: 'SOIL_MOISTURE', lat: 28.55, lng: 77.20, value: 0.87 },
    { id: 'S3', type: 'RAINFALL', lat: 28.68, lng: 77.12, value: 42.5 },
];

export default function MapDashboard({ onLogout }: { onLogout?: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'terrain'>('dark');
    const [showRiskZones, setShowRiskZones] = useState(true);
    const [ndfrStatus] = useState('ACTIVE');

    const tileStyles: Record<string, string> = {
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        terrain: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    };

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: tileStyles[mapStyle],
            center: [77.2090, 28.6139],
            zoom: 10,
        });

        const m = map.current;

        m.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        m.addControl(new maplibregl.ScaleControl({}), 'bottom-left');

        m.on('load', () => {
            // Risk Zones
            m.addSource('risk-zones', { type: 'geojson', data: riskZonesGeoJSON });
            m.addLayer({
                id: 'risk-fill',
                type: 'fill',
                source: 'risk-zones',
                paint: {
                    'fill-color': [
                        'match', ['get', 'riskLevel'],
                        'HIGH', '#ef4444',
                        'MODERATE', '#f59e0b',
                        'LOW', '#22c55e',
                        '#94a3b8'
                    ],
                    'fill-opacity': 0.45,
                }
            });
            m.addLayer({
                id: 'risk-outline',
                type: 'line',
                source: 'risk-zones',
                paint: {
                    'line-color': [
                        'match', ['get', 'riskLevel'],
                        'HIGH', '#dc2626',
                        'MODERATE', '#d97706',
                        'LOW', '#16a34a',
                        '#64748b'
                    ],
                    'line-width': 2,
                }
            });

            // Sensor Markers
            mockSensors.forEach(sensor => {
                const color = sensor.type === 'RIVER_GAUGE' ? '#3b82f6' : sensor.type === 'RAINFALL' ? '#8b5cf6' : '#10b981';
                new maplibregl.Marker({ color })
                    .setLngLat([sensor.lng, sensor.lat])
                    .setPopup(new maplibregl.Popup().setHTML(
                        `<div style="font-family:monospace;font-size:12px;"><strong>${sensor.id}</strong><br/>Type: ${sensor.type}<br/>Value: ${sensor.value}</div>`
                    ))
                    .addTo(m);
            });

            // Zone click popup
            m.on('click', 'risk-fill', (e) => {
                if (!e.features || e.features.length === 0) return;
                const props = e.features[0].properties;
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<div style="font-family:monospace;font-size:12px;"><strong>${props?.name}</strong><br/>Risk: <span style="color:${props?.riskLevel === 'HIGH' ? 'red' : props?.riskLevel === 'MODERATE' ? 'orange' : 'green'}">${props?.riskLevel}</span></div>`)
                    .addTo(m);
            });

            m.on('mouseenter', 'risk-fill', () => { m.getCanvas().style.cursor = 'pointer'; });
            m.on('mouseleave', 'risk-fill', () => { m.getCanvas().style.cursor = ''; });
        });

        return () => { m.remove(); map.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Toggle risk zone visibility
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        const visibility = showRiskZones ? 'visible' : 'none';
        try {
            if (map.current.getLayer('risk-fill')) {
                map.current.setLayoutProperty('risk-fill', 'visibility', visibility);
            }
            if (map.current.getLayer('risk-outline')) {
                map.current.setLayoutProperty('risk-outline', 'visibility', visibility);
            }
        } catch { /* layers might not be ready yet */ }
    }, [showRiskZones]);

    // WebSocket connection
    useEffect(() => {
        const socket = io('http://localhost:4000');
        socket.emit('subscribe_telemetry', 'D1');
        socket.on('risk_update', (data) => {
            setAlerts(prev => [
                `[${new Date(data.timestamp).toLocaleTimeString()}] Zone ${data.districtId} → ${data.riskLevel} (Score: ${data.riskScore})`,
                ...prev.slice(0, 49)
            ]);
        });
        return () => { socket.disconnect(); };
    }, []);

    // Change map style
    const switchStyle = (style: 'dark' | 'satellite' | 'terrain') => {
        setMapStyle(style);
        if (map.current) {
            map.current.setStyle(tileStyles[style]);
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-900 text-slate-100 font-sans">
            {/* Sidebar */}
            <div className="w-80 bg-slate-800/95 backdrop-blur-md flex flex-col shadow-2xl z-10 border-r border-slate-700/50">
                {/* Header */}
                <div className="p-5 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Droplets className="text-blue-400 w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-wide text-blue-100">FloodSense</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">NDRF Command Station</p>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="p-4">
                    <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 rounded-xl border border-slate-600/30">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> System Status
                            </h2>
                            <div className={`flex items-center gap-1.5 ${ndfrStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-mono font-bold">{ndfrStatus}</span>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                                <div className="text-slate-500">Sensors</div>
                                <div className="font-mono font-bold text-blue-300">{mockSensors.length}</div>
                            </div>
                            <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                                <div className="text-slate-500">Risk Zones</div>
                                <div className="font-mono font-bold text-amber-300">{riskZonesGeoJSON.features.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Style Controls */}
                <div className="px-4 pb-3">
                    <h2 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Map View
                    </h2>
                    <div className="flex gap-1.5">
                        {(['dark', 'satellite', 'terrain'] as const).map(s => (
                            <button key={s} onClick={() => switchStyle(s)}
                                className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${mapStyle === s ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'}`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Risk Toggle */}
                    <button onClick={() => setShowRiskZones(!showRiskZones)}
                        className={`mt-2 w-full text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${showRiskZones ? 'bg-red-600/80 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'}`}>
                        {showRiskZones ? '🔴 Risk Zones: ON' : '⚪ Risk Zones: OFF'}
                    </button>
                </div>

                {/* Live Telemetry */}
                <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
                    <h2 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" /> Live Telemetry
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                <Activity className="w-8 h-8 mb-2 animate-pulse" />
                                <p className="text-xs font-mono">Awaiting stream data...</p>
                            </div>
                        ) : null}
                        {alerts.map((msg, i) => (
                            <div key={i} className="text-[10px] font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-700/40 truncate hover:border-blue-500/30 transition-colors" title={msg}>
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-700/50 space-y-2">
                    {onLogout && (
                        <button onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    )}
                    <p className="text-[9px] text-slate-600 font-mono text-center">FloodSense AI v1.0 • NDRF Operations</p>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <div ref={mapContainer} className="w-full h-full" />

                {/* Legend Overlay */}
                <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-xl">
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Risk Legend</h3>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-red-500"></span>
                            <span className="text-[11px] text-slate-300">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                            <span className="text-[11px] text-slate-300">Moderate Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-green-500"></span>
                            <span className="text-[11px] text-slate-300">Low Risk</span>
                        </div>
                    </div>
                    <hr className="border-slate-700/50 my-2" />
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Sensors</h3>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-[11px] text-slate-300">River Gauge</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span className="text-[11px] text-slate-300">Rainfall</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-[11px] text-slate-300">Soil Moisture</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
