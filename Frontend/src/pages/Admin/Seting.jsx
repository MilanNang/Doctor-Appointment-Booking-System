import { useState } from "react";
import { Save } from "lucide-react";

export default function Settings() {
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
    alert("✅ Settings saved successfully!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6 max-w-2xl">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-slate-600">
            Site Name
          </label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-600">
            Default Timezone
          </label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">
            Notifications
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>Email Notifications</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="smsNotifications"
              checked={settings.smsNotifications}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>SMS Notifications</span>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
