// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-lightblue-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4 flex justify-center">
          <button
            className={`px-4 py-2 ${isLogin ? 'border-b-2 border-lightblue-500 font-bold' : 'text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 ${!isLogin ? 'border-b-2 border-lightblue-500 font-bold' : 'text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
}

export default AuthPage;
