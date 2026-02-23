"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'FloodSense Core API' });
});
app.post('/auth/signup', (req, res) => {
    const { phone, fullName, state, district } = req.body;
    // Mock JWT Generation
    const token = Buffer.from(phone + Date.now()).toString('base64');
    res.json({ status: 'success', token, user: { phone, fullName, state, district, role: 'CITIZEN' } });
});
app.post('/auth/login', (req, res) => {
    const { phone } = req.body;
    const token = Buffer.from(phone + Date.now()).toString('base64');
    res.json({ status: 'success', token, user: { phone, role: 'CITIZEN' } });
});
app.post('/risk/calculate', (req, res) => {
    const { districtId, rainfall, soilMoisture, elevation } = req.body;
    const riskScore = (rainfall * 0.8) + (soilMoisture * 0.4) - (elevation * 0.1);
    const riskLevel = riskScore > 5.0 ? 'HIGH' : riskScore > 2.0 ? 'MODERATE' : 'LOW';
    // Emitting the new risk data to connected dashboard/mesh nodes
    io.to(`district_${districtId}`).emit('risk_update', { districtId, riskScore, riskLevel, timestamp: new Date() });
    res.json({ status: 'calculated', riskScore, riskLevel });
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Real-time telemetry room subscriptions
    socket.on('subscribe_telemetry', (districtId) => {
        socket.join(`district_${districtId}`);
        console.log(`Socket ${socket.id} joined district_${districtId}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`FloodSense API Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map