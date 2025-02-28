import React, { useState, useEffect } from 'react';
import GroupMessageInput from './GroupMessageInput';
import api from '../services/api';
import socket from '../services/socket';
import { getCurrentUser } from '../utils/auth';

function GroupChatWindow({ activeGroup }) {
  const [messages, setMessages] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!activeGroup || !currentUser) return;

    const fetchGroupMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/groups/${activeGroup.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Error fetching group messages:', err);
      }
    };

    fetchGroupMessages();

    socket.emit('join_group', activeGroup.id);

    const handleReceiveGroupMessage = (msg) => {
      if (msg.group_id === activeGroup.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_group_message', handleReceiveGroupMessage);
    return () => {
      socket.off('receive_group_message', handleReceiveGroupMessage);
    };
  }, [activeGroup, currentUser]);

  if (!activeGroup) {
    return <div className="flex-1 flex items-center justify-center">Select a group to start chatting</div>;
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
            {msg.type === 'file' && msg.file_url ? (
              <a
                href={msg.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-blue-600 underline"
              >
                Download File
              </a>
            ) : (
              <div>{msg.content}</div>
            )}
          </div>
        ))}
      </div>
      <GroupMessageInput activeGroup={activeGroup} />
    </div>
  );
}

export default GroupChatWindow;
