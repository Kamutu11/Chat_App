import React, { useState } from 'react';
import api from '../services/api';

function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      window.location.reload();
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message|| 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Password (min 6 characters)"
        value={form.password}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button type="submit" className="w-full bg-lightblue-500 text-white p-2 rounded hover:bg-lightblue-600">
        Register
      </button>
    </form>
  );
}

export default Register;
