import client from './client';

export const getGenreStats    = () => client.get('/stats/genres').then(r => r.data);
export const getActivityStats = () => client.get('/stats/activity').then(r => r.data);
export const getRatingStats   = () => client.get('/stats/ratings').then(r => r.data);
export const getStatsSummary  = () => client.get('/stats/summary').then(r => r.data);
