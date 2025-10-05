import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../util/api";

export default function Signup() {
  const [stage, setStage] = useState("signup"); // signup | verify
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await API.post("/auth/register", { name, email, password, role });

      // move to verification stage
      setStage("verify");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await API.post("/auth/verify-email", {
        email,
        code: verificationCode,
      });

      // save user token returned by verification
      localStorage.setItem("user", JSON.stringify(res.data));

      // redirect based on role
      if (role === "doctor") navigate("/doctor");
      else navigate("/patient/browse-services");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  if (stage === "verify") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-50 to-yellow-100">
        <div className="bg-white p-8 rounded-2xl shadow-md w-96">
          <h1 className="text-2xl font-bold text-center text-yellow-600 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Enter the verification code sent to <strong>{email}</strong>
          </p>

          <input
            type="text"
            placeholder="Enter verification code"
            className="w-full mb-4 px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />

          <button
            className="w-full py-3 rounded-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600"
            onClick={handleVerify}
          >
            Verify Email
          </button>
        </div>
      </div>
    );
  }

  // ----------------- Signup Stage -----------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-yellow-50 to-yellow-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-yellow-600 mb-2">
          Appointment App
        </h1>
        <h2 className="text-lg font-semibold text-center text-gray-800 mb-6">
          Create Your Account
        </h2>

        {/* Role Selector */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              role === "doctor" ? "text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
            style={{ backgroundColor: role === "doctor" ? "#eab308" : "transparent" }}
          >
            Doctor
          </button>
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              role === "patient" ? "text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
            style={{ backgroundColor: role === "patient" ? "#C9A3D4" : "transparent" }}
          >
            Patient
          </button>
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-6">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            role === "patient" ? "bg-purple-400 hover:bg-purple-500" : "bg-yellow-500 hover:bg-yellow-700"
          }`}
          onClick={handleSignup}
        >
          Sign Up as {role === "patient" ? "Patient" : "Doctor"}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-yellow-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
