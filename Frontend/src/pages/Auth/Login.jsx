import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle Login Button Click
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      // 🔹 Later: Replace with real API call using Axios
      // const { data } = await axios.post("/api/users/login", { email, password, role });
      // localStorage.setItem("token", data.token);
      // localStorage.setItem("user", JSON.stringify(data.user));

      // 🔹 Demo Logic (no backend)
      localStorage.setItem(
        "user",
        JSON.stringify({ email, role, token: "demo-token" })
      );

      // Redirect by role
      if (role === "doctor") navigate("/doctor");
      else navigate("/patient");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-50 to-yellow-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        {/* App Title */}
        <h1 className="text-2xl font-bold text-center text-yellow-600 mb-2">
          Appointment App
        </h1>
        <h2 className="text-lg font-semibold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        {/* Role Selector */}
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

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
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
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
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

        {/* Forgot Password */}
        <div className="mb-4 text-right">
          <a href="#" className="text-sm text-yellow-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            role === "patient"
              ? "bg-purple-400 hover:bg-purple-500"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          Sign In as {role === "patient" ? "Patient" : "Doctor"}
        </button>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-700 space-y-2">
          <p>
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-yellow-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
          <p>
            <Link
              to="/"
              className="text-purple-500 font-semibold hover:underline"
            >
              Go to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
