import React, { useEffect, useState } from 'react';
import api from '../services/api';

function ChatList({ activeChat, setActiveChat }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="font-bold mb-4">Direct Chats</h2>
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => setActiveChat(user)}
            className={`p-2 rounded cursor-pointer ${activeChat?.id === user.id ? 'bg-lightblue-200' : 'hover:bg-gray-100'}`}
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;
