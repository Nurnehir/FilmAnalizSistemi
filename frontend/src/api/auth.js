import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password });

export const register = (email, username, password) =>
  client.post('/auth/register', { email, username, password });

export const getMe = () => client.get('/auth/me');
