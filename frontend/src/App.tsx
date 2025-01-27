import React, { useState } from 'react';
import Login from './components/Login';
import ChatWidget from './components/ChatWidget';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    // Ensure the token is set and stored
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    // Clear token from local storage and state
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center">
          <h1 className="text-3xl font-bold text-[#ad81ff]">Welcome to Botsy</h1>
        </div>
      </header>

      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <button
            onClick={handleLogout}
            className="fixed top-4 right-4 px-3 py-1 bg-[#ad81ff] hover:bg-[#9564e0] text-white rounded-full text-sm"
          >
            Logout
          </button>
          <div className="fixed bottom-4 right-4">
            <ChatWidget />
          </div>
        </>
      )}
    </div>
  );
};

export default App;