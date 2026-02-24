// Shared citizen reports store — accessible by both citizen and authority dashboards
// Uses in-memory store + localStorage for persistence

export interface CitizenReport {
    id: string;
    type: "waterlogging" | "drainage_blocked" | "road_flooded" | "embankment_breach" | "other";
    description: string;
    photoUrl?: string;
    lat: number;
    lon: number;
    district: string;
    state: string;
    severity: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
    status: "submitted" | "acknowledged" | "investigating" | "resolved";
    submittedAt: string;
    submittedBy: string; // phone number or "anonymous"
    upvotes: number;
}

// SIM-based GPS location (mobile tower triangulation simulation)
export interface SimLocation {
    lat: number;
    lon: number;
    accuracy_m: number; // meters
    method: "gps" | "cell_tower" | "wifi" | "ip";
    tower_id?: string;
    signal_strength?: number; // dBm
    timestamp: string;
}

const STORAGE_KEY = "floody_citizen_reports";
const LOCATION_KEY = "floody_user_location";

// ─── Reports ───

function loadReports(): CitizenReport[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : getDefaultReports();
    } catch {
        return getDefaultReports();
    }
}

function saveReports(reports: CitizenReport[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)); } catch { }
}

function getDefaultReports(): CitizenReport[] {
    return [
        {
            id: "RPT-2401", type: "waterlogging", description: "Heavy waterlogging near Pragati Maidan underpass, water ~3 feet deep. Vehicles stranded.",
            lat: 28.6180, lon: 77.2494, district: "East Delhi", state: "Delhi", severity: "HIGH",
            status: "acknowledged", submittedAt: new Date(Date.now() - 25 * 60000).toISOString(), submittedBy: "+91 98765XXXXX", upvotes: 12,
        },
        {
            id: "RPT-2402", type: "drainage_blocked", description: "Storm drain blocked by construction debris near Sector 62, Noida. Water overflowing onto road.",
            lat: 28.6278, lon: 77.3649, district: "East Delhi", state: "Delhi", severity: "MODERATE",
            status: "investigating", submittedAt: new Date(Date.now() - 45 * 60000).toISOString(), submittedBy: "+91 87654XXXXX", upvotes: 7,
        },
        {
            id: "RPT-2403", type: "road_flooded", description: "NH-44 near Moolchand flyover completely submerged. Traffic diverted. Please avoid this route.",
            lat: 28.5700, lon: 77.2340, district: "Central Delhi", state: "Delhi", severity: "HIGH",
            status: "acknowledged", submittedAt: new Date(Date.now() - 60 * 60000).toISOString(), submittedBy: "+91 99988XXXXX", upvotes: 23,
        },
        {
            id: "RPT-2404", type: "embankment_breach", description: "Minor breach observed in Yamuna embankment near Wazirabad barrage. Water seeping through.",
            lat: 28.7200, lon: 77.2300, district: "East Delhi", state: "Delhi", severity: "SEVERE",
            status: "investigating", submittedAt: new Date(Date.now() - 10 * 60000).toISOString(), submittedBy: "+91 77665XXXXX", upvotes: 31,
        },
        {
            id: "RPT-2405", type: "waterlogging", description: "Waist-high water in Patna railway station area. Pumps not working. People stuck.",
            lat: 25.6100, lon: 85.1400, district: "Patna", state: "Bihar", severity: "SEVERE",
            status: "submitted", submittedAt: new Date(Date.now() - 5 * 60000).toISOString(), submittedBy: "+91 66554XXXXX", upvotes: 45,
        },
        {
            id: "RPT-2406", type: "road_flooded", description: "Main road to Kamrup relief camp is flooded. Only boats can pass.",
            lat: 26.1400, lon: 91.7400, district: "Kamrup", state: "Assam", severity: "HIGH",
            status: "acknowledged", submittedAt: new Date(Date.now() - 35 * 60000).toISOString(), submittedBy: "+91 55443XXXXX", upvotes: 18,
        },
        {
            id: "RPT-2407", type: "drainage_blocked", description: "Multiple drains overflowing in Wayanad Chungam area due to landslide debris.",
            lat: 11.6900, lon: 76.0800, district: "Wayanad", state: "Kerala", severity: "HIGH",
            status: "submitted", submittedAt: new Date(Date.now() - 15 * 60000).toISOString(), submittedBy: "+91 44332XXXXX", upvotes: 9,
        },
        {
            id: "RPT-2408", type: "waterlogging", description: "Chennai OMR road near Thoraipakkam signal completely waterlogged. Traffic standstill.",
            lat: 12.9400, lon: 80.2300, district: "Chennai", state: "Tamil Nadu", severity: "MODERATE",
            status: "acknowledged", submittedAt: new Date(Date.now() - 50 * 60000).toISOString(), submittedBy: "+91 33221XXXXX", upvotes: 15,
        },
    ];
}

let _reports: CitizenReport[] | null = null;

export function getReports(): CitizenReport[] {
    if(!_reports) _reports = loadReports();
    return _reports;
}

export function addReport(report: Omit<CitizenReport, "id" | "status" | "submittedAt" | "upvotes">): CitizenReport {
    const newReport: CitizenReport = {
        ...report,
        id: `RPT-${Math.floor(Math.random() * 9000 + 1000)}`,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        upvotes: 0,
    };
    const reports = getReports();
    reports.unshift(newReport);
    _reports = reports;
    saveReports(reports);
    return newReport;
}

export function updateReportStatus(id: string, status: CitizenReport["status"]): void {
    const reports = getReports();
    const r = reports.find(r => r.id === id);
    if(r) { r.status = status; saveReports(reports); }
}

export function getReportsByLocation(state?: string, district?: string): CitizenReport[] {
    const reports = getReports();
    if(!state && !district) return reports;
    return reports.filter(r => {
        if(state && r.state !== state) return false;
        if(district && r.district !== district) return false;
        return true;
    });
}

export function getReportStats() {
    const reports = getReports();
    return {
        total: reports.length,
        severe: reports.filter(r => r.severity === "SEVERE").length,
        high: reports.filter(r => r.severity === "HIGH").length,
        pending: reports.filter(r => r.status === "submitted").length,
        investigating: reports.filter(r => r.status === "investigating").length,
        resolved: reports.filter(r => r.status === "resolved").length,
    };
}

// ─── SIM-Based GPS ───

export function getSimLocation(): Promise<SimLocation> {
    return new Promise((resolve) => {
        // Try real GPS first
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc: SimLocation = {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        accuracy_m: pos.coords.accuracy,
                        method: pos.coords.accuracy < 50 ? "gps" : pos.coords.accuracy < 500 ? "wifi" : "cell_tower",
                        tower_id: `TWR-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`,
                        signal_strength: -(Math.floor(Math.random() * 40 + 50)),
                        timestamp: new Date().toISOString(),
                    };
                    try { localStorage.setItem(LOCATION_KEY, JSON.stringify(loc)); } catch { }
                    resolve(loc);
                },
                () => {
                    // GPS failed — simulate cell tower triangulation
                    resolve(simulateCellTower());
                },
                { timeout: 5000, enableHighAccuracy: false }
            );
        } else {
            resolve(simulateCellTower());
        }
    });
}

function simulateCellTower(): SimLocation {
    // Try cached
    try {
        const cached = localStorage.getItem(LOCATION_KEY);
        if(cached) {
            const loc = JSON.parse(cached);
            return { ...loc, method: "cell_tower", accuracy_m: 800, timestamp: new Date().toISOString() };
        }
    } catch { }
    // Default: Delhi
    return {
        lat: 28.6139 + (Math.random() - 0.5) * 0.02,
        lon: 77.2090 + (Math.random() - 0.5) * 0.02,
        accuracy_m: 1200,
        method: "cell_tower",
        tower_id: `TWR-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`,
        signal_strength: -(Math.floor(Math.random() * 30 + 60)),
        timestamp: new Date().toISOString(),
    };
}

export function getNearestTowers(lat: number, lon: number): Array<{ id: string; lat: number; lon: number; signal: number; distance_km: number }> {
    const towers: Array<{ id: string; lat: number; lon: number; signal: number; distance_km: number }> = [];
    for(let i = 0; i < 3; i++) {
        const tLat = lat + (Math.random() - 0.5) * 0.03;
        const tLon = lon + (Math.random() - 0.5) * 0.03;
        const dist = Math.sqrt((tLat - lat) ** 2 + (tLon - lon) ** 2) * 111;
        towers.push({
            id: `TWR-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`,
            lat: tLat, lon: tLon,
            signal: -(Math.floor(Math.random() * 30 + 50)),
            distance_km: Math.round(dist * 100) / 100,
        });
    }
    return towers.sort((a, b) => a.distance_km - b.distance_km);
}
