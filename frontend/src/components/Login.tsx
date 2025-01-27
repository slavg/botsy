import React, { useState } from 'react';
import * as api from '../services/api';
import Register from './Register';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.login(username, password);
      onLogin(response.token);
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleRegistrationSuccess = (token: string) => {
    onLogin(token);
  };

  if (isRegistering) {
    return (
      <Register
        onLogin={handleRegistrationSuccess}
        switchToLogin={() => setIsRegistering(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold text-[#ad81ff]">Sign in</h2>

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
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ad81ff] hover:bg-[#9564e0]"
          >
            Sign in
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="text-sm text-[#ad81ff] hover:text-[#9564e0] underline"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;