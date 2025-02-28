import React, { useState } from 'react';
import api from '../services/api';

function FileUpload({ setFileUrl }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/uploads', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setFileUrl(res.data.fileUrl);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2">
      <input type="file" onChange={handleFileChange} />
      {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
    </div>
  );
}

export default FileUpload;