const Message = ({ message, currentUser }) => {
  const isCurrentUser = message.senderId === currentUser?.id;
  const isSystem = message.system;

  return (
    <div className={`message ${isCurrentUser ? 'current-user' : ''} ${isSystem ? 'system' : ''}`}>
      {!isSystem && !isCurrentUser && (
        <div className="message-sender">{message.sender}</div>
      )}
      <div className="message-content">
        {message.message}
      </div>
      <div className="message-time">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
      {message.isPrivate && (
        <div className="message-private">Private</div>
      )}
    </div>
  );
};

export default Message;