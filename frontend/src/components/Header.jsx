import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/auth');
  };

  return (
    <header className="bg-lightblue-500 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Messaging App</h1>
      <button onClick={handleLogout} className="bg-white text-lightblue-500 px-3 py-1 rounded hover:bg-gray-100">
        Logout
      </button>
    </header>
  );
}

export default Header;
