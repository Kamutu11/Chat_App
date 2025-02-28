import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import { isAuthenticated } from './utils/auth';

function App() {
  return (
    <div className="min-h-screen bg-lightblue-50">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/chat" element={isAuthenticated() ? <ChatPage /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/chat" : "/auth"} />} />
      </Routes>
    </div>
  );
}

export default App;
