const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active rooms and their drawing data
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Send existing drawing data to the new user
    if (rooms.has(roomId)) {
      socket.emit('load-canvas', rooms.get(roomId));
    }
  });

  socket.on('draw', (data) => {
    const { roomId, drawData } = data;
    
    // Store drawing data
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    rooms.get(roomId).push(drawData);
    
    // Broadcast to all users in the room except sender
    socket.to(roomId).emit('draw', drawData);
  });

  socket.on('clear-canvas', (roomId) => {
    rooms.set(roomId, []);
    socket.to(roomId).emit('clear-canvas');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
