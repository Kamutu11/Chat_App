import React, { useState, useEffect } from 'react';
import MessageInput from './MessageInput';
import api from '../services/api';
import socket from '../services/socket';
import { getCurrentUser } from '../utils/auth';

function ChatWindow({ activeChat }) {
  const [messages, setMessages] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/messages/${activeChat.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    socket.emit('mark_messages_read', { senderId: activeChat.id });

    const handleReceiveMessage = (msg) => {
      if (
        (msg.sender_id === activeChat.id && msg.receiver_id === currentUser.id) ||
        (msg.sender_id === currentUser.id && msg.receiver_id === activeChat.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleMessagesRead = (data) => {
      if (activeChat.id && data.readerId !== currentUser.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === currentUser.id ? { ...msg, read_status: 1 } : msg
          )
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [activeChat, currentUser]);

  if (!activeChat) {
    return <div className="flex-1 flex items-center justify-center">Select a user to start chatting</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-lightblue-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.sender_id === currentUser.id ? 'bg-lightblue-100 self-end' : 'bg-white self-start'
            }`}
          >
            <div>{msg.content}</div>
            {msg.sender_id === currentUser.id && (
              <div className="text-xs text-gray-600">
                {msg.read_status ? 'Read' : 'Sent'}
              </div>
            )}
          </div>
        ))}
      </div>
      <MessageInput activeChat={activeChat} />
    </div>
  );
}

export default ChatWindow;
