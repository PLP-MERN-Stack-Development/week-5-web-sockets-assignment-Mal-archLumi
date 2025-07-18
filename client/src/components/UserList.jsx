import { useState } from 'react';

const UserList = ({ users, onPrivateMessage, currentUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');

  const handlePrivateMessage = (user) => {
    if (message.trim() && user.id !== currentUser.id) {
      onPrivateMessage(user.id, message);
      setMessage('');
    }
  };

  return (
    <div className="user-list">
      <h3>Online Users ({users.filter(u => u.status === 'online').length})</h3>
      <ul>
        {users.map(user => (
          <li 
            key={user.id} 
            className={`user ${user.status}`}
            onClick={() => setSelectedUser(user)}
          >
            {user.username} 
            {user.id === currentUser?.id && ' (You)'}
            <span className="status-dot"></span>
          </li>
        ))}
      </ul>
      
      {selectedUser && selectedUser.id !== currentUser?.id && (
        <div className="private-message-form">
          <h4>Message to {selectedUser.username}</h4>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your private message"
          />
          <button onClick={() => handlePrivateMessage(selectedUser)}>
            Send Private Message
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;