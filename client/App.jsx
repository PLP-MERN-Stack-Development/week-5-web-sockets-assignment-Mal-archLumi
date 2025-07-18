import { useState } from 'react';
import { useSocket } from './src/socket/socket';
import Login from './src/components/Login';
import Chat from './src/components/Chat';
import UserList from './src/components/UserList';
import PrivateChat from './src/components/PrivateChat';
import './App.css';

const App = () => {
  const { 
    isConnected, 
    messages, 
    users, 
    typingUsers, 
    notifications,
    rooms, 
    currentRoom,
    connect, 
    sendMessage, 
    sendPrivateMessage, 
    setTyping, 
    joinRoom,
    setCurrentRoom
  } = useSocket();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showPrivateChat, setShowPrivateChat] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const user = users.find(u => u.id === socket.id);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [isConnected, users]);

  if (!isConnected || !currentUser) {
    return <Login onLogin={connect} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chat App</h1>
        <div className="user-info">
          <span>Hello, {currentUser.username}</span>
          <button onClick={() => setShowPrivateChat(!showPrivateChat)}>
            {showPrivateChat ? 'Show Public Chat' : 'Show Private Chat'}
          </button>
        </div>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <UserList 
            users={users} 
            onPrivateMessage={sendPrivateMessage}
            currentUser={currentUser}
          />
        </div>
        
        <div className="main-content">
          {showPrivateChat ? (
            <PrivateChat
              messages={messages}
              users={users}
              currentUser={currentUser}
              onSendPrivateMessage={sendPrivateMessage}
            />
          ) : (
            <Chat
              messages={messages}
              users={users}
              typingUsers={typingUsers}
              currentRoom={currentRoom}
              rooms={rooms}
              onSendMessage={sendMessage}
              onSetTyping={setTyping}
              onJoinRoom={joinRoom}
            />
          )}
        </div>
      </div>
      
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((note, index) => (
            <div key={index} className="notification">
              {note.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;