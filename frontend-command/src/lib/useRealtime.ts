"use client";
/**
 * useRealtime — Shared Socket.IO hook for real-time updates between
 * Citizen and NDRF dashboards. Connects to the backend WebSocket.
 *
 * Events emitted by backend:
 *   - sos_alert: new SOS from citizen (includes sos data, assigned team)
 *   - new_report: new citizen report (waterlogging, flood, etc.)
 *   - family_sos: family SOS alert
 *   - sos_update: SOS status changed (acknowledged, resolved)
 *   - report_update: report status changed
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RealtimeEvent {
    type: "sos_alert" | "new_report" | "family_sos" | "sos_update" | "report_update";
    data: any;
    timestamp: Date;
}

export function useRealtime(enabled: boolean = true) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<RealtimeEvent[]>([]);
    const [latestSOS, setLatestSOS] = useState<any>(null);
    const [latestReport, setLatestReport] = useState<any>(null);
    const [sosCount, setSOSCount] = useState(0);
    const [reportCount, setReportCount] = useState(0);

    const clearEvents = useCallback(() => {
        setEvents([]);
        setSOSCount(0);
        setReportCount(0);
    }, []);

    useEffect(() => {
        if(!enabled) return;

        const socket = io(API_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("[WS] Connected to Floody backend:", socket.id);
            setConnected(true);
            // Subscribe to reports feed
            socket.emit("subscribe_reports");
        });

        socket.on("disconnect", () => {
            console.log("[WS] Disconnected");
            setConnected(false);
        });

        // ─── SOS Alert from citizen ───
        socket.on("sos_alert", (data) => {
            console.log("[WS] 🚨 SOS Alert received:", data);
            const event: RealtimeEvent = { type: "sos_alert", data, timestamp: new Date() };
            setEvents((prev) => [event, ...prev].slice(0, 100)); // keep last 100
            setLatestSOS(data);
            setSOSCount((c) => c + 1);
        });

        // ─── New citizen report ───
        socket.on("new_report", (data) => {
            console.log("[WS] 📋 New report received:", data);
            const event: RealtimeEvent = { type: "new_report", data, timestamp: new Date() };
            setEvents((prev) => [event, ...prev].slice(0, 100));
            setLatestReport(data);
            setReportCount((c) => c + 1);
        });

        // ─── Family SOS ───
        socket.on("family_sos", (data) => {
            console.log("[WS] 👨‍👩‍👧 Family SOS received:", data);
            const event: RealtimeEvent = { type: "family_sos", data, timestamp: new Date() };
            setEvents((prev) => [event, ...prev].slice(0, 100));
            setSOSCount((c) => c + 1);
        });

        // ─── SOS status update ───
        socket.on("sos_update", (data) => {
            console.log("[WS] ✅ SOS update:", data);
            const event: RealtimeEvent = { type: "sos_update", data, timestamp: new Date() };
            setEvents((prev) => [event, ...prev].slice(0, 100));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [enabled]);

    return {
        connected,
        events,
        latestSOS,
        latestReport,
        sosCount,
        reportCount,
        clearEvents,
        socket: socketRef.current,
    };
}
