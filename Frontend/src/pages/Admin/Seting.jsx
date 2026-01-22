import { useState } from "react";
import { Save } from "lucide-react";
import { useDispatch } from "react-redux";
import { showToast } from "../../Redux/toastSlice";

export default function Settings() {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState({
    siteName: "MediBook",
    emailNotifications: true,
    smsNotifications: false,
    timezone: "Asia/Kolkata",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    const dispatch = useDispatch();
    dispatch(showToast({ message: "✅ Settings saved successfully!", type: "success" }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage system configuration and preferences</p>
        </div>

        <div className="card p-8 space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Timezone
            </label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700">
              Notifications
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
              />
              <span className="text-gray-700">Email Notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 cursor-pointer"
              />
              <span className="text-gray-700">SMS Notifications</span>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="mt-4 px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all flex items-center gap-2 w-full justify-center"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
