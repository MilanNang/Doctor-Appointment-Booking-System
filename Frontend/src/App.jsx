// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyAuth } from "./services/authService";
import { loginSuccess } from "./Redux/authSlice";
import ToastContainer from "./Componet/ToastContainer";
import { initializeSocket, disconnectSocket } from "./utils/socket";
import AppRoutes from "./Routes/AppRoutes";

function App() {
  const dispatch = useDispatch();

  // Check if user is authenticated on app load (from cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await verifyAuth();
        dispatch(loginSuccess(data));
      } catch (error) {
        console.log("Not authenticated:", error.message);
      }
    };
    checkAuth();

    // 🔴 NEW: Initialize Socket.io connection
    initializeSocket();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
