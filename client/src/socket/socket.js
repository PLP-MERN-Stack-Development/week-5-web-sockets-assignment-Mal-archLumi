// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState({ general: [] });
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rooms, setRooms] = useState(['general']);
  const [currentRoom, setCurrentRoom] = useState('general');

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message, room = currentRoom) => {
    socket.emit('send_message', { message, room });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping, room = currentRoom) => {
    socket.emit('typing', { isTyping, room });
  };

  // Join a room
  const joinRoom = (room) => {
    if (!rooms.includes(room)) {
      setRooms(prev => [...prev, room]);
    }
    socket.emit('join_room', room);
    setCurrentRoom(room);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages(prev => {
        const roomMessages = prev[message.room] || [];
        return {
          ...prev,
          [message.room]: [...roomMessages, message]
        };
      });
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      const room = `private-${message.senderId}-${message.recipientId}`;
      if (!rooms.includes(room)) {
        setRooms(prev => [...prev, room]);
      }
      
      setMessages(prev => {
        const roomMessages = prev[room] || [];
        return {
          ...prev,
          [room]: [...roomMessages, message]
        };
      });
    };

    const onRoomMessages = ({ room, messages }) => {
      setMessages(prev => ({
        ...prev,
        [room]: messages
      }));
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      setMessages(prev => {
        const roomMessages = prev['general'] || [];
        return {
          ...prev,
          general: [
            ...roomMessages,
            {
              id: Date.now(),
              system: true,
              message: `${user.username} joined the chat`,
              timestamp: new Date().toISOString(),
              room: 'general'
            }
          ]
        };
      });
    };

    const onUserLeft = (user) => {
      setMessages(prev => {
        const roomMessages = prev['general'] || [];
        return {
          ...prev,
          general: [
            ...roomMessages,
            {
              id: Date.now(),
              system: true,
              message: `${user.username} left the chat`,
              timestamp: new Date().toISOString(),
              room: 'general'
            }
          ]
        };
      });
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Room events
    const onRoomCreated = (room) => {
      if (!rooms.includes(room)) {
        setRooms(prev => [...prev, room]);
      }
    };

    const onRoomJoined = (room) => {
      setCurrentRoom(room);
    };

    // Notification events
    const onNotification = (notification) => {
      setNotifications(prev => [...prev, notification]);
      
      // Play sound for notification
      if (Notification.permission === 'granted') {
        new Notification(notification.message);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.message);
          }
        });
      }
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('room_messages', onRoomMessages);
    socket.on('notification', onNotification);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('room_messages', onRoomMessages);
      socket.off('notification', onNotification);
    };
  }, [rooms, currentRoom]);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    notifications,
    rooms,
    currentRoom,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    setCurrentRoom,
  };
};

export default socket;