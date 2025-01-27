import React, { useState } from 'react';
import * as api from '../services/api';

interface RegisterProps {
  onLogin: (token: string) => void;
  switchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin, switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (username.length < 4) {
      setError('Username must be at least 4 characters long');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await api.register(username, password);

      setUsername('');
      setPassword('');

      // Directly call onLogin with the token
      onLogin(response.token);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('username')) {
          setError('Username is already taken');
        } else if (err.message.toLowerCase().includes('password')) {
          setError('Password does not meet requirements');
        } else {
          setError(err.message || 'Registration failed');
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold text-[#ad81ff]">Register</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-[#ad81ff] focus:border-[#ad81ff]"
              required
              minLength={4}
              maxLength={128}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-[#ad81ff] focus:border-[#ad81ff]"
              required
              minLength={8}
              maxLength={128}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ad81ff] hover:bg-[#9564e0]"
          >
            Register
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-sm text-[#ad81ff] hover:text-[#9564e0] underline"
            >
              Already have an account? Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;