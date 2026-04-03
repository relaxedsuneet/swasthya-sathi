import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const verifyClaim = (claim, conversationId) => 
  API.post('/verify', { claim, conversationId });

export const getHistory = () => API.get('/conversations');

export const getConversationDetails = (id) => API.get(`/conversations/${id}/checks`);