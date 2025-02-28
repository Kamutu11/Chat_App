import React, { useState, useEffect } from 'react';
import api from '../services/api';

function GroupList({ activeGroup, setActiveGroup }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/groups/all', { headers: { Authorization: `Bearer ${token}` } });
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await api.post('/groups', { name: newGroupName, memberIds: [] }, { headers: { Authorization: `Bearer ${token}` } });
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/groups/${groupId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchGroups();
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/groups/${groupId}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (activeGroup && activeGroup.id === groupId) setActiveGroup(null);
      fetchGroups();
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  };

  return (
    <div>
      <h2 className="font-bold mb-4">Groups</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <button
          onClick={handleCreateGroup}
          className="w-full bg-lightblue-500 text-white p-2 rounded hover:bg-lightblue-600"
        >
          Create Group
        </button>
      </div>
      <ul>
        {groups.map((group) => (
          <li
            key={group.id}
            onClick={() => setActiveGroup(group)}
            className={`p-2 rounded cursor-pointer ${
              activeGroup && activeGroup.id === group.id ? 'bg-lightblue-200' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{group.name}</span>
              <div>
                {group.isMember ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveGroup(group.id);
                    }}
                    className="text-sm text-red-600"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGroup(group.id);
                    }}
                    className="text-sm text-green-600"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupList;
