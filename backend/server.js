const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store recent messages in memory (a real app would use a DB or Redis)
let messages = [];

// Store active user count
let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers++;
    console.log(`User connected: ${socket.id} | Total: ${activeUsers}`);

    // Broadcast user count update
    io.emit('users:count', activeUsers);

    // Send history to the new user
    socket.emit('chat:history', messages);

    socket.on('chat:message', (payload) => {
        // Validate payload (basic security)
        if (!payload.text || !payload.user) return;

        const newMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            user: payload.user, // { name, avatar }
            senderSocketId: socket.id, // Track exact connection ID
            text: payload.text,
            timestamp: new Date().toISOString(),
            sentiment: 'neutral' // Placeholder for future AI analysis
        };

        // Keep history manageable
        messages.push(newMessage);
        if (messages.length > 100) messages.shift();

        // Broadcast to all
        io.emit('chat:message', newMessage);
    });

    socket.on('disconnect', () => {
        activeUsers = Math.max(0, activeUsers - 1);
        console.log(`User disconnected: ${socket.id} | Total: ${activeUsers}`);
        io.emit('users:count', activeUsers);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`
  🚀 Service Ready
  -----------------------------------------
  📡 WebSocket Server: http://localhost:${PORT}
  -----------------------------------------
  `);
});
