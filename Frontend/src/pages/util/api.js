import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL // ✅ your backend base URL
});

// 🧠 Optional: add token automatically for logged-in users
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;
