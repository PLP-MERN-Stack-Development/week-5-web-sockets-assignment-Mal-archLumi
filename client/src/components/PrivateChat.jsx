import { useState, useEffect, useRef } from 'react';
import Message from './Message';

const PrivateChat = ({ messages, users, currentUser, onSendPrivateMessage }) => {
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && selectedUserId) {
      onSendPrivateMessage(selectedUserId, message);
      setMessage('');
    }
  };

  const getPrivateMessages = (userId) => {
    const room = `private-${currentUser.id}-${userId}`;
    return messages[room] || [];
  };

  return (
    <div className="private-chat">
      <h3>Private Chats</h3>
      <div className="private-users">
        {users
          .filter(user => user.id !== currentUser?.id)
          .map(user => (
            <button
              key={user.id}
              className={selectedUserId === user.id ? 'active' : ''}
              onClick={() => setSelectedUserId(user.id)}
            >
              {user.username}
            </button>
          ))}
      </div>
      
      {selectedUserId && (
        <div className="private-chat-window">
          <div className="messages-container">
            {getPrivateMessages(selectedUserId).map(msg => (
              <Message 
                key={msg.id} 
                message={msg} 
                currentUser={currentUser} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="message-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;