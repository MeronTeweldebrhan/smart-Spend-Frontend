import axios from "axios";

const backendClient = axios.create({
  baseURL:`${import.meta.env.VITE_API_URL}/api`,
});

// Add token before each request
backendClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("Stoken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default backendClient;
