import React, { useEffect, useState } from "react";
import API from "../util/api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Redux/authSlice";
import { showToast } from "../../Redux/toastSlice";

export default function PatientProfile() {
  const dispatch = useDispatch();
  const auth = JSON.parse(localStorage.getItem("auth")) || {};
  const user = auth.user || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // try to refresh user info
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/verify");
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        // ignore — user may not be logged in here
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, email };
      if (password) payload.password = password;

      const { data } = await API.put("/auth/profile", payload);

      // Update redux + localStorage with returned user + token
      dispatch(loginSuccess(data));
      dispatch(showToast({ message: "Profile updated", type: "success" }));
      setPassword("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed";
      dispatch(showToast({ message: msg, type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h2>
          <p className="text-gray-600 mb-8">Update your personal information and password</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
