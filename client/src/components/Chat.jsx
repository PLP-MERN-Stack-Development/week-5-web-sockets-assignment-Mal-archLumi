import { useState, useEffect, useRef } from 'react';
import Message from './Message';

const Chat = ({ 
  messages, 
  users, 
  typingUsers, 
  currentRoom, 
  rooms, 
  onSendMessage, 
  onSetTyping, 
  onJoinRoom 
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, currentRoom);
      setMessage('');
      onSetTyping(false, currentRoom);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{currentRoom}</h2>
        <div className="room-selector">
          <select 
            value={currentRoom} 
            onChange={(e) => onJoinRoom(e.target.value)}
          >
            {rooms.map(room => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
          <button onClick={() => {
            const newRoom = prompt('Enter new room name:');
            if (newRoom && !rooms.includes(newRoom)) {
              onJoinRoom(newRoom);
            }
          }}>
            Create Room
          </button>
        </div>
      </div>
      
      <div className="messages-container">
        {(messages[currentRoom] || []).map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="typing-indicator">
        {typingUsers.length > 0 && (
          <span>
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </span>
        )}
      </div>
      
      <div className="message-input">
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onSetTyping(e.target.value.length > 0, currentRoom);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;