import React, { useState } from 'react';
import socket from '../services/socket';

function MessageInput({ activeChat }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit('send_message', {
      receiverId: activeChat.id,
      content: message,
      type: 'text'
    });
    setMessage('');
  };

  return (
    <div className="p-4 border-t border-gray-300 bg-white flex">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 p-2 border border-gray-300 rounded"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-lightblue-500 text-white px-4 py-2 rounded hover:bg-lightblue-600"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
