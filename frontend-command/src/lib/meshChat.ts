/**
 * FloodMesh — Web-based mesh messaging for disaster communication.
 * Uses BroadcastChannel API for multi-tab mesh + localStorage persistence.
 * Protocol mirrors the Android FloodMesh BLE/WiFi mesh.
 */

export interface MeshMessage {
    id: string;
    senderId: string;
    senderName: string;
    channelId: string;
    ttl: number;
    hops: number;
    via: string[];
    type: "TEXT" | "SOS" | "ALERT" | "LOCATION" | "ACK";
    payload: string;
    timestamp: number;
}

export interface MeshPeer {
    nodeId: string;
    nickname: string;
    lastSeen: number;
    transport: "broadcast" | "webrtc" | "wifi";
    signal: number;
}

export interface MeshState {
    nodeId: string;
    nickname: string;
    isActive: boolean;
    peerCount: number;
    messagesRelayed: number;
}

const STORAGE_KEY = "floodmesh_messages";
const PEERS_KEY = "floodmesh_peers";
const NODE_KEY = "floodmesh_node";
const MAX_TTL = 7;
const CHANNEL_GLOBAL = "floodmesh-global";
const BROADCAST_ID = "*";

// Generate short node ID
function genNodeId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "FM-";
    for(let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

function genMsgId(): string {
    return Math.random().toString(36).slice(2, 14);
}

// Get or create node identity
export function getNodeIdentity(): { nodeId: string; nickname: string } {
    if(typeof window === "undefined") return { nodeId: "FM-SRV", nickname: "Server" };
    try {
        const stored = localStorage.getItem(NODE_KEY);
        if(stored) return JSON.parse(stored);
    } catch { }
    const identity = { nodeId: genNodeId(), nickname: `User-${Math.floor(Math.random() * 9000 + 1000)}` };
    try { localStorage.setItem(NODE_KEY, JSON.stringify(identity)); } catch { }
    return identity;
}

export function setNickname(name: string) {
    const identity = getNodeIdentity();
    identity.nickname = name;
    try { localStorage.setItem(NODE_KEY, JSON.stringify(identity)); } catch { }
}

// Message storage
export function getMessages(channelId: string = CHANNEL_GLOBAL): MeshMessage[] {
    if(typeof window === "undefined") return [];
    try {
        const all: MeshMessage[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return all.filter(m => m.channelId === channelId).sort((a, b) => a.timestamp - b.timestamp);
    } catch { return []; }
}

function saveMessage(msg: MeshMessage) {
    try {
        const all: MeshMessage[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if(all.find(m => m.id === msg.id)) return; // dedup
        all.push(msg);
        // Keep last 200
        if(all.length > 200) all.splice(0, all.length - 200);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch { }
}

// Seen message IDs for dedup
const seenIds = new Set<string>();

// BroadcastChannel for multi-tab mesh
let channel: BroadcastChannel | null = null;
let onMessageCallback: ((msg: MeshMessage) => void) | null = null;

export function startMesh(onMessage: (msg: MeshMessage) => void): MeshState {
    const { nodeId, nickname } = getNodeIdentity();
    onMessageCallback = onMessage;

    if(typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("floodmesh");
        channel.onmessage = (event) => {
            const msg: MeshMessage = event.data;
            if(seenIds.has(msg.id)) return;
            seenIds.add(msg.id);

            // Relay if TTL > 0
            if(msg.ttl > 0 && !msg.via.includes(nodeId)) {
                const relayed = { ...msg, ttl: msg.ttl - 1, hops: msg.hops + 1, via: [...msg.via, nodeId] };
                channel?.postMessage(relayed);
            }

            saveMessage(msg);
            onMessage(msg);
        };

        // Announce presence
        const announce: MeshMessage = {
            id: genMsgId(),
            senderId: nodeId,
            senderName: nickname,
            channelId: CHANNEL_GLOBAL,
            ttl: 1,
            hops: 0,
            via: [nodeId],
            type: "ACK",
            payload: JSON.stringify({ event: "join", nodeId, nickname }),
            timestamp: Date.now(),
        };
        channel.postMessage(announce);
    }

    // Load any existing real messages from storage
    const existing = getMessages();
    existing.forEach(m => onMessage(m));

    return { nodeId, nickname, isActive: true, peerCount: 0, messagesRelayed: 0 };
}

export function sendMeshMessage(
    payload: string,
    type: MeshMessage["type"] = "TEXT",
    channelId: string = CHANNEL_GLOBAL
): MeshMessage {
    const { nodeId, nickname } = getNodeIdentity();
    const msg: MeshMessage = {
        id: genMsgId(),
        senderId: nodeId,
        senderName: nickname,
        channelId,
        ttl: MAX_TTL,
        hops: 0,
        via: [nodeId],
        type,
        payload,
        timestamp: Date.now(),
    };
    seenIds.add(msg.id);
    saveMessage(msg);
    channel?.postMessage(msg);
    onMessageCallback?.(msg);
    return msg;
}

export function sendSOS(location: string): MeshMessage {
    return sendMeshMessage(`🚨 SOS — Need immediate help! Location: ${location}`, "SOS");
}

export function stopMesh() {
    channel?.close();
    channel = null;
    onMessageCallback = null;
}
