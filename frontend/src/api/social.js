import client from './client';

export const followUser            = (userId) => client.post(`/social/follow/${userId}`).then(r => r.data);
export const unfollowUser          = (userId) => client.delete(`/social/follow/${userId}`).then(r => r.data);
export const getFollowing          = () => client.get('/social/following').then(r => r.data);
export const getFollowers          = () => client.get('/social/followers').then(r => r.data);
export const getFollowerCount      = () => client.get('/social/follower-count').then(r => r.data);
export const getNotificationsCount = (since) =>
  client.get('/social/notifications/count', { params: since ? { since } : {} }).then(r => r.data);
export const searchUsers      = (q) => client.get('/social/search', { params: { q } }).then(r => r.data);
export const getUserProfile   = (username) => client.get(`/social/users/${username}`).then(r => r.data);
export const getUserWatchlist = (username) => client.get(`/social/users/${username}/watchlist`).then(r => r.data);
