import React, { useState } from 'react';
import socket from '../services/socket';
import FileUpload from './FileUpload';

function GroupMessageInput({ activeGroup }) {
  const [message, setMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleSend = () => {
    if (!message.trim() && !fileUrl) return;

    const messageType = fileUrl && !message.trim() ? 'file' : 'text';

    socket.emit('send_group_message', {
      groupId: activeGroup.id,
      content: message,
      type: messageType,
      file_url: fileUrl || null
    });

    setMessage('');
    setFileUrl('');
  };

  return (
    <div className="p-4 border-t border-gray-300 bg-white flex flex-col">
      <div className="flex mb-2">
        <input
          type="text"
          placeholder="Type your group message..."
          className="flex-1 p-2 border border-gray-300 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-lightblue-500 text-white px-4 py-2 rounded hover:bg-lightblue-600"
        >
          Send
        </button>
      </div>
      <FileUpload setFileUrl={setFileUrl} />
      {fileUrl && <div className="text-sm text-green-600">File attached</div>}
    </div>
  );
}

export default GroupMessageInput;
