import client from './client';

export const trackEvent = (eventType, data = {}) => {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  client
    .post('/behavior/event', { event_type: eventType, ...data })
    .catch(() => {});
};
