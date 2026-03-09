import axios from 'axios';

const api = axios.create({
  baseURL: 'https://major-proj-backend-production.up.railway.app',
});

export default api;
