const API_URL = 'http://localhost:8000/api';

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  return data;
};

export const register = async (username: string, password: string) => {
  // First, register the user
  const registerResponse = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const registerData = await registerResponse.json();

  if (!registerResponse.ok) {
    throw new Error(registerData.detail || 'Registration failed');
  }

  // And after registration, immediately login with the same credentials
  try {
    const loginResponse = await login(username, password);
    return loginResponse;
  } catch (err) {
    throw new Error('Registration successful, but login failed');
  }
};

export const sendMessage = async (content: string, token: string) => {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

export const updateMessage = async (id: string, content: string, token: string) => {
  const response = await fetch(`${API_URL}/messages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to update message');
  return response.json();
};

export const deleteMessage = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete message');
  return response.json();
};

export const getMessages = async (token: string) => {
  const response = await fetch(`${API_URL}/messages`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};