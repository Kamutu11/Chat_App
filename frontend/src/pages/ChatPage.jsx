import React, { useState } from 'react';
import Header from '../components/Header';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import GroupList from '../components/GroupList';
import GroupChatWindow from '../components/GroupChatWindow';

function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [view, setView] = useState('direct');

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="w-1/4 border-r border-gray-300 p-4 bg-white">
          <div className="mb-4 flex justify-around">
            <button
              className={`px-2 py-1 ${view === 'direct' ? 'bg-lightblue-200 rounded' : 'text-gray-500'}`}
              onClick={() => setView('direct')}
            >
              Direct
            </button>
            <button
              className={`px-2 py-1 ${view === 'group' ? 'bg-lightblue-200 rounded' : 'text-gray-500'}`}
              onClick={() => setView('group')}
            >
              Groups
            </button>
          </div>
          {view === 'direct' ? (
            <ChatList activeChat={activeChat} setActiveChat={setActiveChat} />
          ) : (
            <GroupList activeGroup={activeGroup} setActiveGroup={setActiveGroup} />
          )}
        </div>
        <div className="flex-1">
          {view === 'direct' ? (
            <ChatWindow activeChat={activeChat} />
          ) : (
            <GroupChatWindow activeGroup={activeGroup} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
