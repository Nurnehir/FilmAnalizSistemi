import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password });

export const register = (email, username, password) =>
  client.post('/auth/register', { email, username, password });

export const getMe = () => client.get('/auth/me');

export const updateUsername = (username) =>
  client.put('/auth/me', { username });

export const updatePassword = (current_password, new_password) =>
  client.put('/auth/password', { current_password, new_password });

export const updateAvatar = (avatar_url) =>
  client.post('/auth/avatar', { avatar_url });

export const deleteAvatar = () =>
  client.delete('/auth/avatar');

export const getStats = () =>
  client.get('/auth/stats').then((r) => r.data);

export const getTasteProfile = () =>
  client.get('/auth/taste-profile').then((r) => r.data);

export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, new_password) =>
  client.post('/auth/reset-password', { token, new_password }).then((r) => r.data);
