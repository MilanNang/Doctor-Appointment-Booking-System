import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import API from "../util/api";
import { loginSuccess } from "../../Redux/authSlice";
import { setDoctorProfile } from "../../Redux/doctorSlice";
import { setPatientData } from "../../Redux/patientSlice";
import { showToast } from "../../Redux/toastSlice";

export default function Login() {
  const [loginType, setLoginType] = useState("user"); // "user" or "admin"
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      dispatch(showToast({ message: "Please enter both email and password", type: "warning" }));
      return;
    }

    try {
      const { data } = await API.post("/auth/login", { email, password });

      // For admin login, ensure the account is actually admin
      if (loginType === "admin") {
        if (data.role !== "admin") {
          dispatch(showToast({ message: "This account is not an admin account. Please use the user login.", type: "error" }));
          return;
        }
      } else {
        // For user login, ensure role matches selected role
        if (data.role !== role) {
          dispatch(showToast({ message: `This account is a ${data.role} account. Please select the correct role.`, type: "error" }));
          return;
        }
      }

      // Save user data in Redux
      dispatch(loginSuccess(data));
      dispatch(showToast({ message: "Login successful! Redirecting...", type: "success" }));

      // Navigate based on role
      if (data.role === "doctor") {
        dispatch(setDoctorProfile(data));
        navigate("/doctor");
      } else if (data.role === "patient") {
        dispatch(setPatientData(data));
        navigate("/patient/browse-services");
      } else if (data.role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login failed:", error);
      dispatch(showToast({ message: error.response?.data?.message || "Invalid email or password", type: "error" }));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-50 to-yellow-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-yellow-600 mb-2">
          Appointment App
        </h1>
        <h2 className="text-lg font-semibold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        {/* Login Type Selector */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLoginType("user")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              loginType === "user"
                ? "text-white bg-blue-500"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            User Login
          </button>
          <button
            onClick={() => setLoginType("admin")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              loginType === "admin"
                ? "text-white bg-red-500"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* User Login - Show Role Selector */}
        {loginType === "user" && (
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setRole("doctor")}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                role === "doctor"
                  ? "text-white bg-yellow-500"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                role === "patient"
                  ? "text-white bg-purple-400"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Patient
            </button>
          </div>
        )}

        {/* Admin Login - Show warning */}
        {loginType === "admin" && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-semibold">
              🔒 Admin Access Only - Restricted to administrators
            </p>
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Password */}
        <div className="mb-2 relative">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* Forgot Password - Only for user login */}
        {loginType === "user" && (
          <div className="mb-4 text-right">
            <a href="#" className="text-sm text-yellow-600 hover:underline">
              Forgot password?
            </a>
          </div>
        )}

        <button
          onClick={handleLogin}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            loginType === "admin"
              ? "bg-red-500 hover:bg-red-600"
              : role === "patient"
              ? "bg-purple-400 hover:bg-purple-500"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loginType === "admin"
            ? "Sign In as Admin"
            : `Sign In as ${role === "patient" ? "Patient" : "Doctor"}`}
        </button>

        <div className="mt-6 text-center text-sm text-gray-700 space-y-2">
          {loginType === "user" && (
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-yellow-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          )}
          <p>
            <Link to="/" className="text-purple-500 font-semibold hover:underline">
              Go to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
