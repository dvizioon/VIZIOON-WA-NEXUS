
import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://147.93.132.124:7123',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
