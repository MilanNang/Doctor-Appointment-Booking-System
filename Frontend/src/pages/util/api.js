import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL // ✅ your backend base URL
});

// 🧠 Optional: add token automatically for logged-in users
API.interceptors.request.use((req) => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  if (auth?.token) {
    req.headers.Authorization = `Bearer ${auth.token}`;
  }
  return req;
});

export default API;
