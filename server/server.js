// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = {};
const typingUsers = {};

// Initialize default chat room
messages['general'] = [];

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join default room
  socket.join('general');

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { 
      username, 
      id: socket.id,
      rooms: ['general'],
      status: 'online'
    };
    
    // Notify all users
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    io.to('general').emit('receive_message', {
      id: Date.now(),
      system: true,
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
      room: 'general'
    });
    
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const { room = 'general', message } = messageData;
    const sender = users[socket.id]?.username || 'Anonymous';
    
    const messageObj = {
      id: Date.now(),
      sender,
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      room
    };
    
    // Store message in the appropriate room
    if (!messages[room]) {
      messages[room] = [];
    }
    
    messages[room].push(messageObj);
    
    // Limit stored messages to prevent memory issues
    if (messages[room].length > 100) {
      messages[room].shift();
    }
    
    // Send to all in the room
    io.to(room).emit('receive_message', messageObj);
    
    // Send notification to other rooms if mentioned
    if (message.includes('@')) {
      Object.keys(users).forEach(userId => {
        if (message.includes(`@${users[userId].username}`) && userId !== socket.id) {
          io.to(userId).emit('notification', {
            type: 'mention',
            message: `${sender} mentioned you in ${room}`,
            room
          });
        }
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ isTyping, room = 'general' }) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = { username, room };
      } else {
        delete typingUsers[socket.id];
      }
      
      io.to(room).emit('typing_users', Object.values(typingUsers)
        .filter(user => user.room === room)
        .map(user => user.username));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const sender = users[socket.id]?.username || 'Anonymous';
    const recipient = users[to]?.username || 'Unknown';
    
    const messageData = {
      id: Date.now(),
      sender,
      senderId: socket.id,
      recipient,
      recipientId: to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true
    };
    
    // Send to recipient
    socket.to(to).emit('private_message', messageData);
    // Send back to sender
    socket.emit('private_message', messageData);
    
    // Send notification
    io.to(to).emit('notification', {
      type: 'private',
      message: `New private message from ${sender}`,
      from: socket.id
    });
  });

  // Handle room creation/joining
  socket.on('join_room', (room) => {
    if (!users[socket.id]) return;
    
    if (!messages[room]) {
      messages[room] = [];
      io.emit('room_created', room);
    }
    
    socket.join(room);
    users[socket.id].rooms.push(room);
    
    io.emit('user_list', Object.values(users));
    io.to(socket.id).emit('room_joined', room);
    
    // Send room messages to the user
    if (messages[room]) {
      io.to(socket.id).emit('room_messages', {
        room,
        messages: messages[room]
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      
      // Update status to offline but keep user data
      users[socket.id].status = 'offline';
      users[socket.id].lastSeen = new Date().toISOString();
      
      io.emit('user_left', { username, id: socket.id });
      io.emit('user_list', Object.values(users));
      
      io.to('general').emit('receive_message', {
        id: Date.now(),
        system: true,
        message: `${username} left the chat`,
        timestamp: new Date().toISOString(),
        room: 'general'
      });
      
      console.log(`${username} left the chat`);
    }
    
    delete typingUsers[socket.id];
  });
});

// API routes
app.get('/api/messages/:room', (req, res) => {
  const { room } = req.params;
  res.json(messages[room] || []);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/api/rooms', (req, res) => {
  const rooms = Object.keys(messages);
  res.json(rooms);
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };