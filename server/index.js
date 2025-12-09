import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const PORT = process.env.SOCKET_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!JWT_SECRET) {
    console.error("JWT_SECRET is required");
    process.exit(1);
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store active connections
const activeUsers = new Map(); // userId -> socketId
const ticketRooms = new Map(); // ticketId -> Set of socketIds

// Active users endpoint
app.get("/api/active-users/:ticketId", (req, res) => {
    const { ticketId } = req.params;
    const room = io.sockets.adapter.rooms.get(`ticket:${ticketId}`);

    if (!room) {
        return res.json({ users: [] });
    }

    const userIds = new Set();
    for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.data.userId) {
            userIds.add(socket.data.userId);
        }
    }

    res.json({ users: Array.from(userIds) });
});

// Send notification endpoint
app.post("/api/send-notification", (req, res) => {
    const { recipientId, notification } = req.body;

    if (!recipientId || !notification) {
        return res.status(400).json({ error: "Missing recipientId or notification" });
    }

    const socketId = activeUsers.get(recipientId);
    if (socketId) {
        io.to(socketId).emit("new-notification", notification);
        console.log(`Notification sent to user ${recipientId}`);
        return res.json({ success: true, delivered: true });
    }

    console.log(`Notification saved but user ${recipientId} not connected`);
    res.json({ success: true, delivered: false });
});

// Authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Authentication required"));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string" || !decoded.id) {
            return next(new Error("Invalid token"));
        }

        socket.data.userId = decoded.id;
        socket.data.role = decoded.role || "user";
        next();
    } catch (error) {
        next(new Error("Invalid token"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const userRole = socket.data.role;

    console.log(`User connected: ${userId} (${userRole})`);

    // Store user connection
    activeUsers.set(userId, socket.id);

    // Join ticket room
    socket.on("join-ticket", (ticketId) => {
        socket.join(`ticket:${ticketId}`);

        if (!ticketRooms.has(ticketId)) {
            ticketRooms.set(ticketId, new Set());
        }
        ticketRooms.get(ticketId).add(socket.id);

        console.log(`User ${userId} joined ticket:${ticketId}`);
    });

    // Leave ticket room
    socket.on("leave-ticket", (ticketId) => {
        socket.leave(`ticket:${ticketId}`);

        if (ticketRooms.has(ticketId)) {
            ticketRooms.get(ticketId).delete(socket.id);
        }

        console.log(`User ${userId} left ticket:${ticketId}`);
    });

    // New message
    socket.on("send-message", (data) => {
        const { ticketId, message } = data;

        // Broadcast to all users in the ticket room except sender
        socket.to(`ticket:${ticketId}`).emit("new-message", {
            ticketId,
            message
        });

        console.log(`Message sent in ticket:${ticketId}`);
    });

    // Typing indicator
    socket.on("typing", (data) => {
        const { ticketId, isTyping } = data;

        console.log(`User ${userId} typing in ticket:${ticketId} - isTyping: ${isTyping}`);

        socket.to(`ticket:${ticketId}`).emit("user-typing", {
            ticketId,
            userId,
            isTyping
        });
    });

    // Ticket status update
    socket.on("ticket-updated", (data) => {
        const { ticketId, updates } = data;

        socket.to(`ticket:${ticketId}`).emit("ticket-status-changed", {
            ticketId,
            updates
        });
    });

    // Disconnect
    socket.on("disconnect", () => {
        activeUsers.delete(userId);

        // Remove from all ticket rooms
        for (const [ticketId, sockets] of ticketRooms.entries()) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                ticketRooms.delete(ticketId);
            }
        }

        console.log(`User disconnected: ${userId}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
    console.log(`CORS origin: ${CORS_ORIGIN}`);
});
