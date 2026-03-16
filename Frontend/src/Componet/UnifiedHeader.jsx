import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Loader2 } from "lucide-react";
import API from "../pages/util/api";
import { logout } from "../Redux/authSlice";
import {
  appendDismissedNotificationIds,
  buildStatusNotifications,
  getDismissedNotificationIds
} from "../utils/statusNotifications";
import { getInitials } from "../utils/initials";

export default function UnifiedHeader() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const { user } = useSelector((state) => state.auth);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build notifications dynamically from appointment statuses
  useEffect(() => {
    fetchNotifications();
    // Poll for status changes every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      if (!user?.role) return;
      const endpoint = user.role === "doctor" ? "/appointments/doctor" : "/appointments/my";
      const res = await API.get(endpoint);
      const allNotifications = buildStatusNotifications({ appointments: res.data || [], role: user.role }).slice(0, 5);
      const dismissedSet = getDismissedNotificationIds({ userId: user?._id, role: user?.role });
      setNotifications(allNotifications.filter((item) => !dismissedSet.has(item.eventId)));
    } catch (error) {
      console.log("Notifications not available");
    }
  };

  const performClearAll = async () => {
    if (notifications.length === 0) return;

    setIsClearing(true);
    appendDismissedNotificationIds({
      userId: user?._id,
      role: user?.role,
      ids: notifications.map((item) => item.eventId)
    });
    setNotifications([]);
    setIsClearing(false);
  };

  const handleNotificationClick = async (notification) => {
    appendDismissedNotificationIds({
      userId: user?._id,
      role: user?.role,
      ids: [notification.eventId]
    });
    setNotifications((prev) => prev.filter((n) => n.eventId !== notification.eventId));
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm sticky top-0 z-40">
      {/* Left: Welcome message */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome back,{" "}
          <span className="text-yellow-600">{user?.name || "User"}!</span>
        </h1>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800">
                  Notifications
                </h3>
                <div className="flex gap-3">
                  {notifications.length > 0 && (
                    <button
                      onClick={performClearAll}
                      disabled={isClearing}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      {isClearing ? <Loader2 size={12} className="animate-spin" /> : "Clear all"}
                    </button>
                  )}
                  <button
                    onClick={fetchNotifications}
                    className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleNotificationClick(notif)}
                      className="p-4 border-b border-gray-100 cursor-pointer transition bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-900 font-medium">
                            {notif.message || "New notification"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleDateString()
                              : "Just now"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md flex items-center justify-center text-white font-bold text-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-50 transition text-red-600"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

    </header>
  );
}
