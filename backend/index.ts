import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';

dotenv.config();

// ─── Database Setup ─────────────────────────────────
const DB_PATH = path.resolve(__dirname, 'data', 'floodsense.db');
// Ensure data directory exists
import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    fullName TEXT,
    state TEXT,
    district TEXT,
    role TEXT DEFAULT 'CITIZEN',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'LOW',
    alertType TEXT DEFAULT 'GENERAL',
    lat REAL,
    lon REAL,
    isDelivered INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS citizen_reports (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    reportType TEXT NOT NULL,
    description TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    photoUrl TEXT,
    severity TEXT DEFAULT 'MODERATE',
    status TEXT DEFAULT 'PENDING',
    upvotes INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS prediction_logs (
    id TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    riskLevel TEXT NOT NULL,
    riskScore REAL NOT NULL,
    probability REAL DEFAULT 0,
    model TEXT DEFAULT 'xgboost',
    weather TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS risk_zones (
    id TEXT PRIMARY KEY,
    zoneName TEXT NOT NULL,
    riskLevel TEXT DEFAULT 'LOW',
    centroidLat REAL NOT NULL,
    centroidLng REAL NOT NULL,
    geoJsonData TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id TEXT PRIMARY KEY,
    sensorId TEXT NOT NULL,
    sensorType TEXT NOT NULL,
    readingValue REAL NOT NULL,
    lat REAL DEFAULT 0,
    lng REAL DEFAULT 0,
    recordedAt TEXT DEFAULT (datetime('now'))
  );
`);

console.log(`[DB] SQLite ready at ${DB_PATH}`);

// ─── App Setup ──────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const AI_CORTEX_URL = process.env.AI_CORTEX_URL || 'http://localhost:8000';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'floodsense-ai-secret-2026';
const PORT = process.env.PORT || 4000;

// ─── Security Middleware ────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { status: 'error', message: 'Too many requests. Try again in 15 minutes.' } });
const otpLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 5, message: { status: 'error', message: 'Too many OTP requests. Wait 5 minutes.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { status: 'error', message: 'Too many auth attempts.' } });
app.use(globalLimiter);

// ─── Helpers ────────────────────────────────────────
const uuid = () => crypto.randomUUID();

function generateToken(userId: string, phone: string, role: string): string {
    return jwt.sign({ userId, phone, role }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): { userId: string; phone: string; role: string } | null {
    try { return jwt.verify(token, JWT_SECRET) as any; } catch { return null; }
}

function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }
    const decoded = verifyToken(authHeader.slice(7));
    if(!decoded) return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    req.user = decoded;
    next();
}

function validateLatLon(lat: any, lon: any): boolean {
    return typeof lat === 'number' && typeof lon === 'number' && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function validatePhone(phone: string): boolean {
    return /^\d{10,15}$/.test((phone || '').replace(/\D/g, ''));
}

// In-memory OTP store
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// ─── Health ─────────────────────────────────────────
app.get('/health', (_req, res) => {
    const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    res.json({
        status: 'ok',
        service: 'FloodSense Core API v3.0',
        ai_cortex: AI_CORTEX_URL,
        database: 'sqlite-connected',
        users: userCount,
        sms: FAST2SMS_API_KEY ? 'configured' : 'demo-mode',
        uptime: Math.floor(process.uptime()) + 's',
    });
});

// ═══════════════════════════════════════════════════
// ─── AUTHENTICATION ─────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/auth/send-otp', otpLimiter, async (req, res) => {
    const { phone } = req.body;
    if(!phone || !validatePhone(phone)) {
        return res.status(400).json({ status: 'error', message: 'Invalid phone number.' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });

    // Clean expired
    for(const [key, val] of otpStore.entries()) {
        if(val.expiresAt < Date.now()) otpStore.delete(key);
    }

    if(!FAST2SMS_API_KEY) {
        console.log(`[OTP] Demo: ${cleanPhone} → ${otp}`);
        return res.json({ status: 'success', message: 'OTP generated (demo mode)', demo_otp: otp });
    }

    try {
        const smsResp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { 'authorization': FAST2SMS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: cleanPhone, flash: 0 }),
        });
        const smsData: any = await smsResp.json();
        if(smsData.return === true) return res.json({ status: 'success', message: `OTP sent to +91 ${cleanPhone}` });
        return res.json({ status: 'success', message: 'SMS failed', demo_otp: otp });
    } catch {
        return res.json({ status: 'success', message: 'SMS error', demo_otp: otp });
    }
});

app.post('/auth/verify-otp', authLimiter, (req, res) => {
    const { phone, otp, fullName, state, district, role } = req.body;
    if(!phone || !otp) return res.status(400).json({ status: 'error', message: 'Phone and OTP required.' });

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(cleanPhone);

    if(!stored) return res.status(400).json({ status: 'error', message: 'No OTP found.' });
    if(stored.expiresAt < Date.now()) { otpStore.delete(cleanPhone); return res.status(400).json({ status: 'error', message: 'OTP expired.' }); }
    if(stored.attempts >= 3) { otpStore.delete(cleanPhone); return res.status(400).json({ status: 'error', message: 'Too many attempts.' }); }
    if(stored.otp !== otp) { stored.attempts++; return res.status(400).json({ status: 'error', message: 'Invalid OTP.' }); }

    otpStore.delete(cleanPhone);

    // Upsert user
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone) as any;
    if(!user) {
        const id = uuid();
        db.prepare('INSERT INTO users (id, phone, fullName, state, district, role) VALUES (?, ?, ?, ?, ?, ?)').run(id, cleanPhone, fullName || null, state || null, district || null, role || 'CITIZEN');
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } else if(fullName || state || district) {
        db.prepare('UPDATE users SET fullName = COALESCE(?, fullName), state = COALESCE(?, state), district = COALESCE(?, district), updatedAt = datetime("now") WHERE phone = ?').run(fullName || null, state || null, district || null, cleanPhone);
        user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    }

    const token = generateToken(user.id, cleanPhone, user.role);
    res.json({ status: 'success', message: 'OTP verified', token, user });
});

app.get('/auth/me', authMiddleware, (req: any, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    if(!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
    const reports = db.prepare('SELECT * FROM citizen_reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 10').all(req.user.userId);
    const alerts = db.prepare('SELECT * FROM alerts WHERE userId = ? ORDER BY createdAt DESC LIMIT 10').all(req.user.userId);
    res.json({ status: 'success', user, reports, alerts });
});

// Legacy auth (backward compat)
app.post('/auth/signup', (req, res) => {
    const { phone, fullName, state, district } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if(!cleanPhone) return res.status(400).json({ status: 'error', message: 'Phone required.' });
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone) as any;
    if(!user) {
        const id = uuid();
        db.prepare('INSERT INTO users (id, phone, fullName, state, district) VALUES (?, ?, ?, ?, ?)').run(id, cleanPhone, fullName, state, district);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    const token = generateToken(user.id, cleanPhone, user.role);
    res.json({ status: 'success', token, user });
});

app.post('/auth/login', (req, res) => {
    const { phone } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if(!cleanPhone) return res.status(400).json({ status: 'error', message: 'Phone required.' });
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone) as any;
    if(!user) {
        const id = uuid();
        db.prepare('INSERT INTO users (id, phone) VALUES (?, ?)').run(id, cleanPhone);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    const token = generateToken(user.id, cleanPhone, user.role);
    res.json({ status: 'success', token, user });
});

// ═══════════════════════════════════════════════════
// ─── RISK PREDICTION ────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/risk/calculate', async (req, res) => {
    const { lat, lon, districtId, district_name, state_name, rainfall } = req.body;
    const predLat = typeof lat === 'number' ? lat : 28.61;
    const predLon = typeof lon === 'number' ? lon : 77.22;

    if(!validateLatLon(predLat, predLon)) return res.status(400).json({ status: 'error', message: 'Invalid lat/lon.' });

    try {
        const response = await fetch(`${AI_CORTEX_URL}/predict`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: predLat, lon: predLon, district_name: district_name || districtId, state_name }),
        });
        if(!response.ok) throw new Error(`AI Cortex ${response.status}`);
        const data: any = await response.json();

        // Log prediction
        try {
            db.prepare('INSERT INTO prediction_logs (id, lat, lon, riskLevel, riskScore, probability, model, weather) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
                uuid(), predLat, predLon, data.risk.risk_level, data.risk.risk_score, data.risk.probability, data.risk.model || 'xgboost', JSON.stringify(data.weather || {})
            );
        } catch { }

        if(districtId) io.to(`district_${districtId}`).emit('risk_update', { districtId, ...data.risk, timestamp: new Date() });

        res.json({ status: 'calculated', riskScore: data.risk.risk_score, riskLevel: data.risk.risk_level, probability: data.risk.probability, contributing_factors: data.risk.contributing_factors, recommendation: data.risk.recommendation, weather: data.weather, discharge: data.discharge, alerts: data.alerts, model: data.risk.model });
    } catch(error: any) {
        console.error('[RISK]', error.message);
        try {
            const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${predLat}&longitude=${predLon}&current=precipitation,rain,temperature_2m&timezone=Asia/Kolkata`);
            const wd: any = await resp.json();
            const rain = wd.current?.precipitation || 0;
            const score = Math.min(10, rain * 0.5 + (rainfall || 0) * 0.3);
            const level = score > 7 ? 'HIGH' : score > 4 ? 'MODERATE' : 'LOW';
            res.json({ status: 'calculated', riskScore: Math.round(score * 10) / 10, riskLevel: level, weather: { precipitation: rain, temperature: wd.current?.temperature_2m }, source: 'fallback' });
        } catch { res.status(500).json({ status: 'error', message: 'All services unavailable.' }); }
    }
});

// ═══════════════════════════════════════════════════
// ─── CITIZEN REPORTS ────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/reports', authMiddleware, (req: any, res) => {
    const { reportType, description, lat, lon, photoUrl, severity } = req.body;
    if(!reportType || !description) return res.status(400).json({ status: 'error', message: 'reportType and description required.' });
    if(!validateLatLon(lat, lon)) return res.status(400).json({ status: 'error', message: 'Valid lat/lon required.' });
    const validTypes = ['FLOOD', 'DRAIN_BLOCK', 'ROAD_BLOCK', 'RESCUE_NEEDED', 'DAM_OVERFLOW', 'LANDSLIDE', 'OTHER'];
    if(!validTypes.includes(reportType)) return res.status(400).json({ status: 'error', message: `Invalid type. Use: ${validTypes.join(', ')}` });

    const id = uuid();
    db.prepare('INSERT INTO citizen_reports (id, userId, reportType, description, lat, lon, photoUrl, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.user.userId, reportType, description, lat, lon, photoUrl || null, severity || 'MODERATE');
    const report = db.prepare('SELECT * FROM citizen_reports WHERE id = ?').get(id);
    io.emit('new_report', { report, timestamp: new Date() });
    res.status(201).json({ status: 'success', report });
});

app.get('/api/reports', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    const where = status ? 'WHERE cr.status = ?' : '';
    const params = status ? [status] : [];

    const reports = db.prepare(`SELECT cr.*, u.fullName, u.district as userDistrict FROM citizen_reports cr LEFT JOIN users u ON cr.userId = u.id ${where} ORDER BY cr.createdAt DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    const total = (db.prepare(`SELECT COUNT(*) as c FROM citizen_reports ${status ? 'WHERE status = ?' : ''}`).get(...params) as any).c;
    res.json({ status: 'success', reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

app.post('/api/reports/:id/upvote', authMiddleware, (req: any, res) => {
    const result = db.prepare('UPDATE citizen_reports SET upvotes = upvotes + 1 WHERE id = ?').run(req.params.id);
    if(result.changes === 0) return res.status(404).json({ status: 'error', message: 'Report not found.' });
    const report = db.prepare('SELECT upvotes FROM citizen_reports WHERE id = ?').get(req.params.id) as any;
    res.json({ status: 'success', upvotes: report.upvotes });
});

app.patch('/api/reports/:id/status', authMiddleware, (req: any, res) => {
    if(req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'Authority access required.' });
    const { status: newStatus } = req.body;
    if(!['PENDING', 'ACKNOWLEDGED', 'RESOLVED'].includes(newStatus)) return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    const result = db.prepare('UPDATE citizen_reports SET status = ?, updatedAt = datetime("now") WHERE id = ?').run(newStatus, req.params.id);
    if(result.changes === 0) return res.status(404).json({ status: 'error', message: 'Report not found.' });
    const report = db.prepare('SELECT * FROM citizen_reports WHERE id = ?').get(req.params.id);
    io.emit('report_status_update', { report });
    res.json({ status: 'success', report });
});

// ═══════════════════════════════════════════════════
// ─── ALERTS ─────────────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/alerts', authMiddleware, (req: any, res) => {
    if(req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'Authority access required.' });
    const { message, severity, alertType, lat, lon } = req.body;
    if(!message || !severity) return res.status(400).json({ status: 'error', message: 'message and severity required.' });

    const users = db.prepare('SELECT id FROM users').all() as any[];
    const insert = db.prepare('INSERT INTO alerts (id, userId, message, severity, alertType, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const tx = db.transaction(() => {
        for(const u of users) insert.run(uuid(), u.id, message, severity, alertType || 'BROADCAST', lat || null, lon || null);
    });
    tx();
    io.emit('new_alert', { message, severity, alertType, broadcast: true, timestamp: new Date() });
    res.status(201).json({ status: 'success', count: users.length });
});

app.get('/api/alerts/:lat/:lon', async (req, res) => {
    try {
        const response = await fetch(`${AI_CORTEX_URL}/alerts?lat=${req.params.lat}&lon=${req.params.lon}`);
        const data: any = await response.json();
        res.json(data);
    } catch { res.json({ status: 'success', alerts: [{ severity: 'LOW', title: 'Service temporarily unavailable' }] }); }
});

app.get('/api/my-alerts', authMiddleware, (req: any, res) => {
    const alerts = db.prepare('SELECT * FROM alerts WHERE userId = ? ORDER BY createdAt DESC LIMIT 50').all(req.user.userId);
    res.json({ status: 'success', alerts });
});

// ═══════════════════════════════════════════════════
// ─── WEATHER & DISCHARGE ────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/weather/:lat/:lon', async (req, res) => {
    try {
        const response = await fetch(`${AI_CORTEX_URL}/weather?lat=${req.params.lat}&lon=${req.params.lon}`);
        res.json(await response.json());
    } catch {
        try {
            const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${req.params.lat}&longitude=${req.params.lon}&current=precipitation,temperature_2m,relative_humidity_2m&timezone=Asia/Kolkata`);
            const data: any = await resp.json();
            res.json({ status: 'success', data: data.current, source: 'direct' });
        } catch(e: any) { res.status(500).json({ status: 'error', message: e.message }); }
    }
});

app.get('/api/discharge/:lat/:lon', async (req, res) => {
    try {
        const response = await fetch(`${AI_CORTEX_URL}/discharge?lat=${req.params.lat}&lon=${req.params.lon}`);
        res.json(await response.json());
    } catch(e: any) { res.status(500).json({ status: 'error', message: e.message }); }
});

// ═══════════════════════════════════════════════════
// ─── ANALYTICS ──────────────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/analytics/predictions', (req, res) => {
    const days = Math.min(30, parseInt(req.query.days as string) || 7);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const predictions = db.prepare('SELECT * FROM prediction_logs WHERE createdAt >= ? ORDER BY createdAt DESC LIMIT 500').all(since);
    const stats = db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN riskLevel='SEVERE' THEN 1 ELSE 0 END) as severe, SUM(CASE WHEN riskLevel='HIGH' THEN 1 ELSE 0 END) as high, SUM(CASE WHEN riskLevel='MODERATE' THEN 1 ELSE 0 END) as moderate, AVG(riskScore) as avgScore FROM prediction_logs WHERE createdAt >= ?`).get(since) as any;

    res.json({ status: 'success', period: `${days}d`, stats: { total: stats.total, severe: stats.severe, high: stats.high, moderate: stats.moderate, low: stats.total - stats.severe - stats.high - stats.moderate, avgRiskScore: Math.round((stats.avgScore || 0) * 100) / 100 }, predictions: predictions.slice(0, 100) });
});

app.get('/api/analytics/reports', (_req, res) => {
    const stats = db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='ACKNOWLEDGED' THEN 1 ELSE 0 END) as acknowledged, SUM(CASE WHEN status='RESOLVED' THEN 1 ELSE 0 END) as resolved FROM citizen_reports`).get() as any;
    const byType = db.prepare('SELECT reportType, COUNT(*) as count FROM citizen_reports GROUP BY reportType').all();
    res.json({ status: 'success', stats: { ...stats, byType } });
});

app.get('/api/analytics/users', (_req, res) => {
    const stats = db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN role='CITIZEN' THEN 1 ELSE 0 END) as citizens, SUM(CASE WHEN role='AUTHORITY' THEN 1 ELSE 0 END) as authorities FROM users`).get();
    res.json({ status: 'success', stats });
});

// ═══════════════════════════════════════════════════
// ─── ZONES ──────────────────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/zones', (_req, res) => {
    const zones = db.prepare('SELECT * FROM risk_zones ORDER BY updatedAt DESC').all();
    res.json({ status: 'success', zones });
});

app.post('/api/zones', authMiddleware, (req: any, res) => {
    if(req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'Authority access required.' });
    const { zoneName, riskLevel, centroidLat, centroidLng, geoJsonData } = req.body;
    if(!zoneName || centroidLat == null || centroidLng == null) return res.status(400).json({ status: 'error', message: 'zoneName, centroidLat, centroidLng required.' });
    const id = uuid();
    db.prepare('INSERT INTO risk_zones (id, zoneName, riskLevel, centroidLat, centroidLng, geoJsonData) VALUES (?, ?, ?, ?, ?, ?)').run(id, zoneName, riskLevel || 'LOW', centroidLat, centroidLng, geoJsonData || null);
    res.status(201).json({ status: 'success', zone: db.prepare('SELECT * FROM risk_zones WHERE id = ?').get(id) });
});

// ═══════════════════════════════════════════════════
// ─── TELEMETRY ──────────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/telemetry', (req, res) => {
    const { sensorId, sensorType, readingValue, lat, lng } = req.body;
    if(!sensorId || !sensorType || readingValue == null) return res.status(400).json({ status: 'error', message: 'sensorId, sensorType, readingValue required.' });
    const id = uuid();
    db.prepare('INSERT INTO telemetry (id, sensorId, sensorType, readingValue, lat, lng) VALUES (?, ?, ?, ?, ?, ?)').run(id, sensorId, sensorType, readingValue, lat || 0, lng || 0);
    const entry = db.prepare('SELECT * FROM telemetry WHERE id = ?').get(id);
    io.emit('telemetry_update', { telemetry: entry });
    res.status(201).json({ status: 'success', telemetry: entry });
});

app.get('/api/telemetry', (req, res) => {
    const sensorType = req.query.type as string;
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const readings = sensorType
        ? db.prepare('SELECT * FROM telemetry WHERE sensorType = ? ORDER BY recordedAt DESC LIMIT ?').all(sensorType, limit)
        : db.prepare('SELECT * FROM telemetry ORDER BY recordedAt DESC LIMIT ?').all(limit);
    res.json({ status: 'success', readings });
});

// ═══════════════════════════════════════════════════
// ─── BULK PREDICT ───────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/predict/bulk', async (req, res) => {
    const { locations } = req.body;
    if(!Array.isArray(locations) || locations.length > 50) return res.status(400).json({ status: 'error', message: 'Provide 1-50 locations.' });
    try {
        const response = await fetch(`${AI_CORTEX_URL}/predict/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locations }) });
        res.json(await response.json());
    } catch(e: any) { res.status(500).json({ status: 'error', message: e.message }); }
});

// ═══════════════════════════════════════════════════
// ─── SOCKET.IO ──────────────────────────────────────
// ═══════════════════════════════════════════════════

io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);
    socket.on('subscribe_telemetry', (districtId) => { socket.join(`district_${districtId}`); });
    socket.on('subscribe_reports', () => { socket.join('reports_feed'); });
    socket.on('disconnect', () => { console.log(`[WS] Disconnected: ${socket.id}`); });
});

// ─── Error Handler ──────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[ERROR]', err.stack || err.message);
    res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal server error.' });
});

// ─── Start ──────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`╔══════════════════════════════════════════╗`);
    console.log(`║  FloodSense API Server v3.0              ║`);
    console.log(`║  Port: ${String(PORT).padEnd(33)}║`);
    console.log(`║  AI Cortex: ${AI_CORTEX_URL.slice(0, 28).padEnd(28)}║`);
    console.log(`║  Database: SQLite (data/floodsense.db)   ║`);
    console.log(`║  SMS: ${(FAST2SMS_API_KEY ? 'Fast2SMS ✓' : 'Demo Mode').padEnd(34)}║`);
    console.log(`║  Auth: JWT (7-day tokens)                ║`);
    console.log(`║  Rate Limit: 200/15min global            ║`);
    console.log(`╚══════════════════════════════════════════╝`);
});

// Graceful shutdown
process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });
