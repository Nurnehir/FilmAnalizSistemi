import client from './client';

export const createSharedList    = (name) => client.post('/shared', { name }).then(r => r.data);
export const getSharedLists      = () => client.get('/shared').then(r => r.data);
export const getSharedListDetail = (id) => client.get(`/shared/${id}`).then(r => r.data);
export const inviteToList        = (listId, userId) => client.post(`/shared/${listId}/invite/${userId}`).then(r => r.data);
export const leaveList           = (listId) => client.delete(`/shared/${listId}/leave`).then(r => r.data);
export const addSharedItem       = (listId, item) => client.post(`/shared/${listId}/items`, item).then(r => r.data);
export const removeSharedItem    = (listId, itemId) => client.delete(`/shared/${listId}/items/${itemId}`).then(r => r.data);
