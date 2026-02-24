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
    email TEXT,
    state TEXT,
    district TEXT,
    homeLat REAL,
    homeLon REAL,
    role TEXT DEFAULT 'CITIZEN',
    ndrfBattalion TEXT,
    familyId TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    familyId TEXT NOT NULL,
    userId TEXT,
    memberName TEXT NOT NULL,
    memberPhone TEXT NOT NULL,
    relation TEXT DEFAULT 'OTHER',
    specialNeeds TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sos_alerts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    familyId TEXT,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    category TEXT DEFAULT 'FLOOD',
    message TEXT,
    status TEXT DEFAULT 'ACTIVE',
    assignedNdrfTeam TEXT,
    resolvedAt TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS relief_camps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    capacity INTEGER DEFAULT 100,
    currentOccupancy INTEGER DEFAULT 0,
    facilities TEXT,
    isActive INTEGER DEFAULT 1,
    createdBy TEXT,
    contactPhone TEXT,
    address TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (createdBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS flooded_segments (
    id TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    radius REAL DEFAULT 0.5,
    severity TEXT DEFAULT 'MODERATE',
    reportId TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now'))
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
    assignedVolunteerId TEXT,
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

// Ensure uploads directory
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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
app.use(express.json({ limit: '10mb' }));
// Serve uploaded photos
app.use('/uploads', express.static(UPLOADS_DIR));

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

// Haversine distance (km)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// NDRF team assignment based on state/region
function assignNdrfTeam(lat: number, lon: number, state?: string): string {
    const teams: Record<string, string> = {
        'Tamil Nadu': '4 NDRF Bn, Arakkonam', 'Kerala': '4 NDRF Bn, Arakkonam',
        'Andhra Pradesh': '10 NDRF Bn, Vijayawada', 'Telangana': '10 NDRF Bn, Vijayawada',
        'Karnataka': '5 NDRF Bn, Pune', 'Maharashtra': '5 NDRF Bn, Pune',
        'Gujarat': '6 NDRF Bn, Vadodara', 'Rajasthan': '6 NDRF Bn, Vadodara',
        'West Bengal': '2 NDRF Bn, Kolkata', 'Odisha': '3 NDRF Bn, Mundali',
        'Bihar': '9 NDRF Bn, Patna', 'Jharkhand': '9 NDRF Bn, Patna',
        'Uttar Pradesh': '8 NDRF Bn, Ghaziabad', 'Delhi': '8 NDRF Bn, Ghaziabad',
        'Punjab': '7 NDRF Bn, Bhatinda', 'Haryana': '7 NDRF Bn, Bhatinda',
        'Assam': '1 NDRF Bn, Guwahati', 'Arunachal Pradesh': '12 NDRF Bn, Itanagar',
    };
    if(state && teams[state]) return teams[state];
    // Fallback: assign by lat/lon region
    if(lat < 15) return '4 NDRF Bn, Arakkonam';
    if(lat < 20) return '10 NDRF Bn, Vijayawada';
    if(lat < 25) return '5 NDRF Bn, Pune';
    return '8 NDRF Bn, Ghaziabad';
}

// Notify family members (stub — would use SMS/push in production)
function notifyFamilyMembers(familyId: string, message: string, senderName: string) {
    const members = db.prepare('SELECT * FROM family_members WHERE familyId = ?').all(familyId) as any[];
    console.log(`[FAMILY SOS] Notifying ${members.length} members of family ${familyId}: ${message}`);
    // In production: send SMS via Fast2SMS to each member's phone
    for(const m of members) {
        console.log(`  → ${m.memberName} (${m.memberPhone}): "${senderName} sent SOS: ${message}"`);
    }
    return members;
}

// In-memory OTP store
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// ─── Health ─────────────────────────────────────────
app.get('/health', (_req, res) => {
    const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    res.json({
        status: 'ok',
        service: 'Floody Core API v3.0',
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
    const { phone, otp, fullName, state, district, role, email, homeLat, homeLon, ndrfBattalion, familyMembers } = req.body;
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
    const familyId = uuid();
    if(!user) {
        const id = uuid();
        db.prepare('INSERT INTO users (id, phone, fullName, email, state, district, role, homeLat, homeLon, ndrfBattalion, familyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
            id, cleanPhone, fullName || null, email || null, state || null, district || null, role || 'CITIZEN',
            homeLat || null, homeLon || null, ndrfBattalion || null, familyId
        );
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } else {
        db.prepare('UPDATE users SET fullName = COALESCE(?, fullName), email = COALESCE(?, email), state = COALESCE(?, state), district = COALESCE(?, district), homeLat = COALESCE(?, homeLat), homeLon = COALESCE(?, homeLon), ndrfBattalion = COALESCE(?, ndrfBattalion), familyId = COALESCE(familyId, ?), updatedAt = datetime("now") WHERE phone = ?').run(
            fullName || null, email || null, state || null, district || null, homeLat || null, homeLon || null, ndrfBattalion || null, familyId, cleanPhone
        );
        user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    }

    // Add family members if provided
    if(Array.isArray(familyMembers) && familyMembers.length > 0) {
        const fId = user.familyId || familyId;
        const insert = db.prepare('INSERT OR IGNORE INTO family_members (id, familyId, memberName, memberPhone, relation, specialNeeds) VALUES (?, ?, ?, ?, ?, ?)');
        for(const fm of familyMembers) {
            if(fm.name && fm.phone) {
                insert.run(uuid(), fId, fm.name, fm.phone.replace(/\D/g, '').slice(-10), fm.relation || 'OTHER', fm.specialNeeds || null);
            }
        }
    }

    const token = generateToken(user.id, cleanPhone, user.role);
    const family = db.prepare('SELECT * FROM family_members WHERE familyId = ?').all(user.familyId || familyId);
    res.json({ status: 'success', message: 'OTP verified', token, user, familyMembers: family });
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
// ─── SOS / PANIC BUTTON ─────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/sos', authMiddleware, (req: any, res) => {
    const { lat, lon, category, message } = req.body;
    if(!validateLatLon(lat, lon)) return res.status(400).json({ status: 'error', message: 'Valid lat/lon required.' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId) as any;
    const team = assignNdrfTeam(lat, lon, user?.state);
    const id = uuid();

    db.prepare('INSERT INTO sos_alerts (id, userId, familyId, lat, lon, category, message, assignedNdrfTeam) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, req.user.userId, user?.familyId || null, lat, lon, category || 'FLOOD', message || 'EMERGENCY SOS', team
    );

    const sos = db.prepare('SELECT s.*, u.fullName, u.phone FROM sos_alerts s JOIN users u ON s.userId = u.id WHERE s.id = ?').get(id);

    // Broadcast to NDRF team via WebSocket
    io.emit('sos_alert', { sos, assignedTeam: team, timestamp: new Date() });

    // If user has family, notify them
    if(user?.familyId) {
        notifyFamilyMembers(user.familyId, message || 'EMERGENCY SOS', user.fullName || user.phone);
    }

    res.status(201).json({ status: 'success', sos, assignedTeam: team });
});

app.get('/api/sos', (req, res) => {
    const { status: filterStatus, team, limit: lim } = req.query;
    const limit = Math.min(100, parseInt(lim as string) || 50);
    let query = 'SELECT s.*, u.fullName, u.phone FROM sos_alerts s JOIN users u ON s.userId = u.id WHERE 1=1';
    const params: any[] = [];
    if(filterStatus) { query += ' AND s.status = ?'; params.push(filterStatus); }
    if(team) { query += ' AND s.assignedNdrfTeam = ?'; params.push(team); }
    query += ' ORDER BY s.createdAt DESC LIMIT ?';
    params.push(limit);
    const alerts = db.prepare(query).all(...params);
    res.json({ status: 'success', alerts });
});

app.patch('/api/sos/:id', authMiddleware, (req: any, res) => {
    const { status: newStatus } = req.body;
    if(!['ACTIVE', 'RESPONDING', 'RESOLVED'].includes(newStatus)) return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    const resolved = newStatus === 'RESOLVED' ? ", resolvedAt = datetime('now')" : '';
    db.prepare(`UPDATE sos_alerts SET status = ?${resolved} WHERE id = ?`).run(newStatus, req.params.id);
    const sos = db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(req.params.id);
    io.emit('sos_update', { sos });
    res.json({ status: 'success', sos });
});

// ═══════════════════════════════════════════════════
// ─── RELIEF CAMPS ───────────────────────────────────
// ═══════════════════════════════════════════════════

app.post('/api/camps', authMiddleware, (req: any, res) => {
    if(req.user.role !== 'NDRF' && req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'NDRF/Authority access required.' });
    const { name, lat, lon, capacity, facilities, contactPhone, address } = req.body;
    if(!name || !validateLatLon(lat, lon)) return res.status(400).json({ status: 'error', message: 'name, lat, lon required.' });

    const id = uuid();
    db.prepare('INSERT INTO relief_camps (id, name, lat, lon, capacity, facilities, createdBy, contactPhone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, name, lat, lon, capacity || 100, facilities || null, req.user.userId, contactPhone || null, address || null
    );
    res.status(201).json({ status: 'success', camp: db.prepare('SELECT * FROM relief_camps WHERE id = ?').get(id) });
});

app.get('/api/camps', (req, res) => {
    const userLat = parseFloat(req.query.lat as string);
    const userLon = parseFloat(req.query.lon as string);
    const camps = db.prepare('SELECT * FROM relief_camps WHERE isActive = 1 ORDER BY updatedAt DESC').all() as any[];

    // If user location provided, sort by distance and add distance field
    if(!isNaN(userLat) && !isNaN(userLon)) {
        const withDist = camps.map(c => ({
            ...c,
            distance_km: Math.round(haversine(userLat, userLon, c.lat, c.lon) * 100) / 100,
            available_spots: c.capacity - c.currentOccupancy,
        }));
        withDist.sort((a, b) => a.distance_km - b.distance_km);
        return res.json({ status: 'success', camps: withDist });
    }
    res.json({ status: 'success', camps });
});

app.patch('/api/camps/:id', authMiddleware, (req: any, res) => {
    if(req.user.role !== 'NDRF' && req.user.role !== 'AUTHORITY') return res.status(403).json({ status: 'error', message: 'NDRF/Authority access required.' });
    const { name, capacity, currentOccupancy, facilities, isActive, contactPhone, address } = req.body;
    db.prepare('UPDATE relief_camps SET name = COALESCE(?, name), capacity = COALESCE(?, capacity), currentOccupancy = COALESCE(?, currentOccupancy), facilities = COALESCE(?, facilities), isActive = COALESCE(?, isActive), contactPhone = COALESCE(?, contactPhone), address = COALESCE(?, address), updatedAt = datetime("now") WHERE id = ?').run(
        name || null, capacity || null, currentOccupancy ?? null, facilities || null, isActive ?? null, contactPhone || null, address || null, req.params.id
    );
    res.json({ status: 'success', camp: db.prepare('SELECT * FROM relief_camps WHERE id = ?').get(req.params.id) });
});

// ═══════════════════════════════════════════════════
// ─── FAMILY ─────────────────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/family/:familyId', authMiddleware, (req: any, res) => {
    const members = db.prepare('SELECT * FROM family_members WHERE familyId = ?').all(req.params.familyId);
    res.json({ status: 'success', members });
});

app.post('/api/family/members', authMiddleware, (req: any, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId) as any;
    if(!user?.familyId) return res.status(400).json({ status: 'error', message: 'No family ID. Complete signup first.' });
    const { name, phone, relation, specialNeeds } = req.body;
    if(!name || !phone) return res.status(400).json({ status: 'error', message: 'name and phone required.' });
    const id = uuid();
    db.prepare('INSERT INTO family_members (id, familyId, memberName, memberPhone, relation, specialNeeds) VALUES (?, ?, ?, ?, ?, ?)').run(
        id, user.familyId, name, phone.replace(/\D/g, '').slice(-10), relation || 'OTHER', specialNeeds || null
    );
    res.status(201).json({ status: 'success', member: db.prepare('SELECT * FROM family_members WHERE id = ?').get(id) });
});

app.post('/api/family-sos', authMiddleware, (req: any, res) => {
    const { message, lat, lon } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId) as any;
    if(!user?.familyId) return res.status(400).json({ status: 'error', message: 'No family registered.' });

    // Create SOS entry
    const sosId = uuid();
    db.prepare('INSERT INTO sos_alerts (id, userId, familyId, lat, lon, category, message, assignedNdrfTeam) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        sosId, user.id, user.familyId, lat || user.homeLat || 0, lon || user.homeLon || 0, 'FAMILY_SOS', message || 'Family SOS Alert', assignNdrfTeam(lat || 0, lon || 0, user.state)
    );

    // Notify all family members
    const members = notifyFamilyMembers(user.familyId, message || 'Family SOS Alert', user.fullName || user.phone);

    io.emit('family_sos', { userId: user.id, familyId: user.familyId, message, members: members.length, timestamp: new Date() });
    res.json({ status: 'success', notified: members.length, sosId });
});

// ═══════════════════════════════════════════════════
// ─── SAFE ROUTE TO CAMP ─────────────────────────────
// ═══════════════════════════════════════════════════

app.get('/api/routes', (req, res) => {
    const fromLat = parseFloat(req.query.fromLat as string);
    const fromLon = parseFloat(req.query.fromLon as string);
    const toCampId = req.query.toCampId as string;

    if(isNaN(fromLat) || isNaN(fromLon)) return res.status(400).json({ status: 'error', message: 'fromLat, fromLon required.' });

    // Get destination camp
    let destLat: number, destLon: number, campName: string;
    if(toCampId) {
        const camp = db.prepare('SELECT * FROM relief_camps WHERE id = ? AND isActive = 1').get(toCampId) as any;
        if(!camp) return res.status(404).json({ status: 'error', message: 'Camp not found.' });
        destLat = camp.lat; destLon = camp.lon; campName = camp.name;
    } else {
        // Find nearest active camp
        const camps = db.prepare('SELECT * FROM relief_camps WHERE isActive = 1').all() as any[];
        if(camps.length === 0) return res.status(404).json({ status: 'error', message: 'No active camps.' });
        camps.sort((a, b) => haversine(fromLat, fromLon, a.lat, a.lon) - haversine(fromLat, fromLon, b.lat, b.lon));
        destLat = camps[0].lat; destLon = camps[0].lon; campName = camps[0].name;
    }

    const distance = haversine(fromLat, fromLon, destLat, destLon);

    // Check for flooded segments + reports along route
    const floodedSegments = db.prepare('SELECT * FROM flooded_segments WHERE isActive = 1').all() as any[];
    const floodReports = db.prepare("SELECT * FROM citizen_reports WHERE reportType IN ('FLOOD', 'ROAD_BLOCK') AND status != 'RESOLVED' AND createdAt > datetime('now', '-24 hours')").all() as any[];

    // Calculate route risk score (0-10)
    let riskScore = 0;
    let floodedNearRoute = 0;
    const allHazards = [
        ...floodedSegments.map(s => ({ lat: s.lat, lon: s.lon, severity: s.severity })),
        ...floodReports.map(r => ({ lat: r.lat, lon: r.lon, severity: r.severity }))
    ];

    // Check each hazard for proximity to the direct route
    for(const h of allHazards) {
        const distToStart = haversine(fromLat, fromLon, h.lat, h.lon);
        const distToEnd = haversine(destLat, destLon, h.lat, h.lon);
        // If hazard is near the route corridor (within 2km of either endpoint or midpoint)
        if(distToStart < 2 || distToEnd < 2 || distToStart + distToEnd < distance * 1.5) {
            floodedNearRoute++;
            riskScore += h.severity === 'SEVERE' ? 3 : h.severity === 'HIGH' ? 2 : 1;
        }
    }
    riskScore = Math.min(10, riskScore);

    // Generate route polyline (direct path with intermediate points)
    const steps = 10;
    const coordinates = Array.from({ length: steps + 1 }, (_, i) => ([
        fromLat + (destLat - fromLat) * (i / steps),
        fromLon + (destLon - fromLon) * (i / steps)
    ]));

    const eta = Math.round(distance / 30 * 60); // ~30km/h average speed

    res.json({
        status: 'success',
        route: {
            from: { lat: fromLat, lon: fromLon },
            to: { lat: destLat, lon: destLon, name: campName },
            distance_km: Math.round(distance * 100) / 100,
            eta_minutes: eta,
            risk_score: riskScore,
            risk_level: riskScore > 7 ? 'HIGH' : riskScore > 4 ? 'MODERATE' : 'LOW',
            flooded_segments_nearby: floodedNearRoute,
            coordinates,
            warning: riskScore > 5 ? 'Route passes through reported flood zones. Consider alternative transport.' : null,
        }
    });
});

// ═══════════════════════════════════════════════════
// ─── CITIZEN REPORTS (enhanced with photo base64) ──
// ═══════════════════════════════════════════════════

app.post('/api/reports', authMiddleware, (req: any, res) => {
    const { reportType, description, lat, lon, photoBase64, photoUrl, severity } = req.body;
    if(!reportType || !description) return res.status(400).json({ status: 'error', message: 'reportType and description required.' });
    if(!validateLatLon(lat, lon)) return res.status(400).json({ status: 'error', message: 'Valid lat/lon required.' });
    const validTypes = ['FLOOD', 'DRAIN_BLOCK', 'ROAD_BLOCK', 'RESCUE_NEEDED', 'DAM_OVERFLOW', 'LANDSLIDE', 'WATERLOGGING', 'OTHER'];
    if(!validTypes.includes(reportType)) return res.status(400).json({ status: 'error', message: `Invalid type. Use: ${validTypes.join(', ')}` });

    // Handle base64 photo upload
    let savedPhotoUrl = photoUrl || null;
    if(photoBase64) {
        try {
            const matches = photoBase64.match(/^data:image\/(\w+);base64,(.+)$/);
            if(matches) {
                const ext = matches[1];
                const data = Buffer.from(matches[2], 'base64');
                const fileName = `${uuid()}.${ext}`;
                fs.writeFileSync(path.join(UPLOADS_DIR, fileName), data);
                savedPhotoUrl = `/uploads/${fileName}`;
            }
        } catch(e) { console.error('[UPLOAD]', e); }
    }

    const id = uuid();
    db.prepare('INSERT INTO citizen_reports (id, userId, reportType, description, lat, lon, photoUrl, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.user.userId, reportType, description, lat, lon, savedPhotoUrl, severity || 'MODERATE');

    // Auto-create flooded segment from FLOOD/WATERLOGGING reports
    if(['FLOOD', 'WATERLOGGING', 'ROAD_BLOCK'].includes(reportType)) {
        db.prepare('INSERT INTO flooded_segments (id, lat, lon, severity, reportId) VALUES (?, ?, ?, ?, ?)').run(uuid(), lat, lon, severity || 'MODERATE', id);
    }

    const report = db.prepare('SELECT cr.*, u.fullName FROM citizen_reports cr JOIN users u ON cr.userId = u.id WHERE cr.id = ?').get(id);
    io.emit('new_report', { report, timestamp: new Date() });
    res.status(201).json({ status: 'success', report });
});

app.get('/api/reports', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const reportType = req.query.type as string;

    let where = 'WHERE 1=1';
    const params: any[] = [];
    if(status) { where += ' AND cr.status = ?'; params.push(status); }
    if(reportType) { where += ' AND cr.reportType = ?'; params.push(reportType); }

    const reports = db.prepare(`SELECT cr.*, u.fullName, u.phone as reporterPhone, u.district as userDistrict FROM citizen_reports cr LEFT JOIN users u ON cr.userId = u.id ${where} ORDER BY cr.createdAt DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    const total = (db.prepare(`SELECT COUNT(*) as c FROM citizen_reports cr ${where}`).get(...params) as any).c;
    res.json({ status: 'success', reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

app.post('/api/reports/:id/upvote', authMiddleware, (req: any, res) => {
    const result = db.prepare('UPDATE citizen_reports SET upvotes = upvotes + 1 WHERE id = ?').run(req.params.id);
    if(result.changes === 0) return res.status(404).json({ status: 'error', message: 'Report not found.' });
    const report = db.prepare('SELECT upvotes FROM citizen_reports WHERE id = ?').get(req.params.id) as any;
    res.json({ status: 'success', upvotes: report.upvotes });
});

app.patch('/api/reports/:id', authMiddleware, (req: any, res) => {
    const { status: newStatus, assignedVolunteerId } = req.body;
    if(newStatus && !['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].includes(newStatus)) return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    db.prepare('UPDATE citizen_reports SET status = COALESCE(?, status), assignedVolunteerId = COALESCE(?, assignedVolunteerId), updatedAt = datetime("now") WHERE id = ?').run(newStatus || null, assignedVolunteerId || null, req.params.id);

    // If resolved, deactivate related flooded segment
    if(newStatus === 'RESOLVED') {
        db.prepare('UPDATE flooded_segments SET isActive = 0 WHERE reportId = ?').run(req.params.id);
    }

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
    console.log(`╔══════════════════════════════════════════════╗`);
    console.log(`║  Floody API Server v4.0                      ║`);
    console.log(`║  Port: ${String(PORT).padEnd(38)}║`);
    console.log(`║  Database: SQLite (data/floodsense.db)       ║`);
    console.log(`║  Features: SOS, Camps, Family, Reports,      ║`);
    console.log(`║            Routes, Analytics, Telemetry       ║`);
    console.log(`║  Auth: JWT (7-day tokens)                    ║`);
    console.log(`║  Rate Limit: 200/15min global                ║`);
    console.log(`╚══════════════════════════════════════════════╝`);
});

// Graceful shutdown
process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });
