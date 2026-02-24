/**
 * Floody API Client — connects frontend to real backend endpoints.
 * All data is from real APIs (Open-Meteo, NDMA) via the AI Cortex.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const AI_CORTEX_BASE = process.env.NEXT_PUBLIC_AI_CORTEX_URL || 'http://localhost:8000';

// ─── Types ──────────────────────────────────────────

export interface RiskPrediction {
    riskScore: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    probability: number;
    contributing_factors: Array<{
        factor: string;
        value: string;
        impact: string;
    }>;
    recommendation: string;
    weather: WeatherData;
    discharge: DischargeData;
    alerts: FloodAlert[];
    model: string;
}

export interface WeatherData {
    lat: number;
    lon: number;
    temperature: number;
    humidity: number;
    current_precipitation: number;
    current_rain: number;
    wind_speed: number;
    weather_code: number;
    rainfall_24h: number;
    rainfall_7d: number;
    soil_moisture: number;
    daily_precipitation: number[];
    daily_dates: string[];
    source: string;
    timestamp: string;
}

export interface DischargeData {
    lat: number;
    lon: number;
    current_discharge: number;
    max_discharge_7d: number;
    avg_discharge_7d: number;
    discharge_trend: number[];
    dates: string[];
    source: string;
}

export interface FloodAlert {
    id: string;
    type: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    title: string;
    message: string;
    recommendation: string;
    lat: number;
    lon: number;
    source: string;
    timestamp: string;
}

export interface BulkRiskResult {
    lat: number;
    lon: number;
    district?: string;
    state?: string;
    risk_level: string;
    risk_score: number;
    probability: number;
    rainfall_24h: number;
    error?: string;
}

// ─── API Calls ──────────────────────────────────────

/**
 * Fetch real flood risk prediction for a location.
 * Goes through: Backend → AI Cortex → Open-Meteo + ML Model
 */
export async function fetchRiskPrediction(
    lat: number,
    lon: number,
    districtName?: string,
    stateName?: string
): Promise<RiskPrediction> {
    // Try backend first
    try {
        const resp = await fetch(`${API_BASE}/risk/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat, lon,
                district_name: districtName,
                state_name: stateName,
            }),
        });
        if(resp.ok) {
            return await resp.json();
        }
    } catch(e) {
        console.warn('Backend unavailable, trying AI Cortex directly');
    }

    // Fallback: call AI Cortex directly
    try {
        const resp = await fetch(`${AI_CORTEX_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat, lon,
                district_name: districtName,
                state_name: stateName,
            }),
        });
        if(resp.ok) {
            const data = await resp.json();
            return {
                riskScore: data.risk.risk_score,
                riskLevel: data.risk.risk_level,
                probability: data.risk.probability,
                contributing_factors: data.risk.contributing_factors,
                recommendation: data.risk.recommendation,
                weather: data.weather,
                discharge: data.discharge,
                alerts: data.alerts,
                model: data.risk.model,
            };
        }
    } catch(e) {
        console.warn('AI Cortex unavailable, using direct Open-Meteo');
    }

    // Last resort: direct Open-Meteo call from frontend
    const weather = await fetchWeatherDirect(lat, lon);
    const rainfall = weather.rainfall_24h;
    const score = Math.min(10, rainfall * 0.15 + weather.soil_moisture * 4);
    return {
        riskScore: Math.round(score * 10) / 10,
        riskLevel: score > 7 ? 'HIGH' : score > 4 ? 'MODERATE' : 'LOW',
        probability: Math.min(1, score / 10),
        contributing_factors: [{ factor: 'Rainfall', value: `${rainfall}mm`, impact: rainfall > 50 ? 'HIGH' : 'MODERATE' }],
        recommendation: score > 7 ? 'High risk. Monitor closely.' : 'Normal conditions.',
        weather,
        discharge: { lat, lon, current_discharge: 0, max_discharge_7d: 0, avg_discharge_7d: 0, discharge_trend: [], dates: [], source: 'unavailable' },
        alerts: [],
        model: 'frontend-fallback',
    };
}

/**
 * Fetch weather directly from Open-Meteo (no backend needed).
 */
export async function fetchWeatherDirect(lat: number, lon: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation,soil_moisture_0_to_1cm&daily=precipitation_sum&timezone=Asia/Kolkata&past_days=7&forecast_days=3`;
    const resp = await fetch(url);
    const data = await resp.json();

    const current = data.current || {};
    const hourly = data.hourly || {};
    const daily = data.daily || {};
    const precip = hourly.precipitation || [];
    const soilArr = hourly.soil_moisture_0_to_1cm || [];

    const total = precip.length;
    const nowIdx = total - 72;
    const past24 = precip.slice(Math.max(0, nowIdx - 24), nowIdx);
    const past7d = precip.slice(Math.max(0, nowIdx - 168), nowIdx);

    const validSoil = soilArr.filter((s: number | null) => s !== null);

    return {
        lat, lon,
        temperature: current.temperature_2m || 0,
        humidity: current.relative_humidity_2m || 0,
        current_precipitation: current.precipitation || 0,
        current_rain: current.rain || 0,
        wind_speed: current.wind_speed_10m || 0,
        weather_code: current.weather_code || 0,
        rainfall_24h: Math.round(past24.reduce((s: number, v: number) => s + (v || 0), 0) * 10) / 10,
        rainfall_7d: Math.round(past7d.reduce((s: number, v: number) => s + (v || 0), 0) * 10) / 10,
        soil_moisture: validSoil.length > 0 ? validSoil[validSoil.length - 1] : 0,
        daily_precipitation: daily.precipitation_sum || [],
        daily_dates: daily.time || [],
        source: 'Open-Meteo (direct)',
        timestamp: new Date().toISOString(),
    };
}

/**
 * Fetch weather via backend proxy.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
        const resp = await fetch(`${API_BASE}/api/weather/${lat}/${lon}`);
        const json = await resp.json();
        return json.data || json;
    } catch {
        return fetchWeatherDirect(lat, lon);
    }
}

/**
 * Fetch alerts for a location.
 */
export async function fetchAlerts(lat: number, lon: number): Promise<FloodAlert[]> {
    try {
        const resp = await fetch(`${API_BASE}/api/alerts/${lat}/${lon}`);
        const json = await resp.json();
        return json.alerts || [];
    } catch {
        return [];
    }
}

/**
 * Bulk predict risk for multiple locations (used by map).
 */
export async function fetchBulkRisk(
    locations: Array<{ lat: number; lon: number; district_name?: string; state_name?: string }>
): Promise<BulkRiskResult[]> {
    try {
        const resp = await fetch(`${API_BASE}/api/predict/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locations }),
        });
        const json = await resp.json();
        return json.results || [];
    } catch {
        return [];
    }
}

// ─── Auth Helper ────────────────────────────────────
function authHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

// ─── SOS / Panic Button ────────────────────────────
export async function createSOS(lat: number, lon: number, category?: string, message?: string) {
    const resp = await fetch(`${API_BASE}/api/sos`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ lat, lon, category: category || 'FLOOD', message: message || 'EMERGENCY SOS' }),
    });
    return resp.json();
}

export async function fetchSOSAlerts(status?: string, team?: string) {
    const params = new URLSearchParams();
    if(status) params.set('status', status);
    if(team) params.set('team', team);
    const resp = await fetch(`${API_BASE}/api/sos?${params}`, { headers: authHeaders() });
    return resp.json();
}

export async function updateSOSStatus(id: string, status: 'ACTIVE' | 'RESPONDING' | 'RESOLVED') {
    const resp = await fetch(`${API_BASE}/api/sos/${id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    return resp.json();
}

// ─── Relief Camps ──────────────────────────────────
export async function createCamp(data: { name: string; lat: number; lon: number; capacity?: number; facilities?: string; contactPhone?: string; address?: string }) {
    const resp = await fetch(`${API_BASE}/api/camps`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return resp.json();
}

export async function fetchCamps(lat?: number, lon?: number) {
    const params = new URLSearchParams();
    if(lat !== undefined) params.set('lat', String(lat));
    if(lon !== undefined) params.set('lon', String(lon));
    const resp = await fetch(`${API_BASE}/api/camps?${params}`);
    return resp.json();
}

export async function updateCamp(id: string, data: Record<string, any>) {
    const resp = await fetch(`${API_BASE}/api/camps/${id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return resp.json();
}

// ─── Reports with Photo Upload ─────────────────────
export async function createReport(data: { reportType: string; description: string; lat: number; lon: number; photoBase64?: string; severity?: string }) {
    const resp = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return resp.json();
}

export async function fetchReports(opts?: { status?: string; type?: string; page?: number }) {
    const params = new URLSearchParams();
    if(opts?.status) params.set('status', opts.status);
    if(opts?.type) params.set('type', opts.type);
    if(opts?.page) params.set('page', String(opts.page));
    const resp = await fetch(`${API_BASE}/api/reports?${params}`);
    return resp.json();
}

export async function updateReport(id: string, data: { status?: string; assignedVolunteerId?: string }) {
    const resp = await fetch(`${API_BASE}/api/reports/${id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return resp.json();
}

// ─── Family ────────────────────────────────────────
export async function fetchFamily(familyId: string) {
    const resp = await fetch(`${API_BASE}/api/family/${familyId}`, { headers: authHeaders() });
    return resp.json();
}

export async function addFamilyMember(data: { name: string; phone: string; relation?: string; specialNeeds?: string }) {
    const resp = await fetch(`${API_BASE}/api/family/members`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return resp.json();
}

export async function sendFamilySOS(message?: string, lat?: number, lon?: number) {
    const resp = await fetch(`${API_BASE}/api/family-sos`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ message: message || 'Family SOS Alert', lat, lon }),
    });
    return resp.json();
}

// ─── Safe Route ────────────────────────────────────
export interface RouteResult {
    from: { lat: number; lon: number };
    to: { lat: number; lon: number; name: string };
    distance_km: number;
    eta_minutes: number;
    risk_score: number;
    risk_level: string;
    flooded_segments_nearby: number;
    coordinates: number[][];
    warning: string | null;
}

export async function fetchSafeRoute(fromLat: number, fromLon: number, toCampId?: string): Promise<RouteResult | null> {
    const params = new URLSearchParams({ fromLat: String(fromLat), fromLon: String(fromLon) });
    if(toCampId) params.set('toCampId', toCampId);
    try {
        const resp = await fetch(`${API_BASE}/api/routes?${params}`);
        const json = await resp.json();
        return json.route || null;
    } catch { return null; }
}
