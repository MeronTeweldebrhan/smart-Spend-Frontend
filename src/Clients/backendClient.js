import axios from 'axios';

export const backendClient = axios.create({
  baseURL: 'http://localhost:3000/api',
});