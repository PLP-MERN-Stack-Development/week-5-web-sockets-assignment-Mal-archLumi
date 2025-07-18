import { useState } from 'react';
import { useSocket } from '../socket/socket';

const Login = () => {
  const [username, setUsername] = useState('');
  const { connect } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome to Chat App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
};

export default Login;