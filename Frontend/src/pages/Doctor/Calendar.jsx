import React, { useState, useEffect } from "react";
import API from "../util/api";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../../Redux/toastSlice";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const generateTimes = (interval) => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hour = (h % 12) || 12;
      const ampm = h < 12 ? "am" : "pm";
      const minutes = m.toString().padStart(2, "0");
      times.push(`${hour}:${minutes}${ampm}`);
    }
  }
  return times;
};

const durationOptions = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

// Helpers to parse and format 12-hour times like "9:00am"
const parseTimeToMinutes = (t) => {
  if (!t || typeof t !== "string") return 0;
  const m = t.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const mins = parseInt(m[2], 10);
  const ampm = m[3].toLowerCase();
  if (ampm === "am") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return h * 60 + mins;
};

const minutesToTimeString = (minutes) => {
  const mins = ((minutes % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "pm" : "am";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${m.toString().padStart(2, "0")}${ampm}`;
};

const sortSlots = (slots = []) => {
  return [...slots].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
};

export default function SetAvailability() {
  const { user } = useSelector((state) => state.auth);

  const [availability, setAvailability] = useState({});
  const [durations, setDurations] = useState({});
  const [copyPopup, setCopyPopup] = useState(null);
  const [copySelection, setCopySelection] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data } = await API.get(`/doctors/me`);
        const avail = data.availability || {};
        setAvailability(avail);

        const dur = {};
        days.forEach((d) => (dur[d] = avail[d]?.[0]?.duration || 30));
        setDurations(dur);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvailability();
  }, [user]);

  const handleAddSlot = (day) => {
    const slots = availability[day] || [];
    const defaultDuration = durations[day] || 30;
    let newSlot;
    if (!slots || slots.length === 0) {
      const start = "9:00am";
      const end = minutesToTimeString(parseTimeToMinutes(start) + defaultDuration);
      newSlot = { start, end, duration: defaultDuration };
    } else {
      // append after the latest end time
      const lastEndMinutes = Math.max(...slots.map((s) => parseTimeToMinutes(s.end || s.start)));
      const start = minutesToTimeString(lastEndMinutes);
      const end = minutesToTimeString(lastEndMinutes + defaultDuration);
      newSlot = { start, end, duration: defaultDuration };
    }

    const newSlots = sortSlots([...(slots || []), newSlot]);
    setAvailability({ ...availability, [day]: newSlots });
  };

  const handleChange = (day, index, field, value) => {
    const newSlots = [...(availability[day] || [])];
    newSlots[index][field] = value;
    // ensure chronological order after change
    const ordered = sortSlots(newSlots);
    setAvailability({ ...availability, [day]: ordered });
  };

  const handleRemoveSlot = (day, index) => {
    const newSlots = [...availability[day]];
    newSlots.splice(index, 1);
    setAvailability({ ...availability, [day]: newSlots });
  };

  const handleDurationChange = (day, value) => {
    setDurations({ ...durations, [day]: value });
    const slots = availability[day] || [];
    slots.forEach((s) => (s.duration = value));
    setAvailability({ ...availability, [day]: slots });
  };

  const toggleDaySelection = (day) => {
    setCopySelection((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleApplyCopy = (sourceDay) => {
    const updatedAvailability = { ...availability };
    const updatedDurations = { ...durations };
    copySelection.forEach((targetDay) => {
      updatedAvailability[targetDay] = sortSlots([...(availability[sourceDay] || [])]);
      updatedDurations[targetDay] = durations[sourceDay];
    });
    setAvailability(updatedAvailability);
    setDurations(updatedDurations);
    setCopyPopup(null);
    setCopySelection([]);
  };

  const handleSave = async () => {
    try {
      const payload = {};
      Object.keys(availability).forEach((day) => {
        payload[day] = availability[day].map((slot) => ({
          start: slot.start,
          end: slot.end,
          duration: slot.duration,
        }));
      });

      const { data } = await API.put("/doctors/availability", { availability: payload });
      setAvailability(data.availability);
      dispatch(showToast({ message: "Weekly schedule saved successfully!", type: "success" }));
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: err.response?.data?.message || "Error saving availability", type: "error" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Weekly Schedule</h1>
          <p className="text-gray-600 mt-2">Manage your availability and appointment slots</p>
        </div>

        <div className="card p-8">
          <div className="space-y-6">
            {days.map((day) => {
              const slots = availability[day] || [];
              const interval = durations[day] || 30;
              const timeOptions = generateTimes(interval);

              return (
                <div key={day} className="border border-gray-200 rounded-lg p-6 hover:bg-yellow-50 transition">
                  <div className="flex items-start gap-6">
                    <div className="w-32 font-semibold text-lg text-gray-900 pt-2">{day}</div>
                    <div className="flex-1 space-y-4">
                      {slots.length > 0 ? (
                        slots.map((slot, index) => (
                          <div key={index} className="flex flex-wrap items-center gap-4">
                            {/* ✅ Start Time Dropdown */}
                            <select
                              value={slot.start}
                              onChange={(e) => handleChange(day, index, "start", e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>

                            <span className="text-gray-500 font-medium">–</span>

                            {/* ✅ End Time Dropdown */}
                            <select
                              value={slot.end}
                              onChange={(e) => handleChange(day, index, "end", e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>

                            {index === 0 && (
                              <select
                                value={durations[day]}
                                onChange={(e) => handleDurationChange(day, parseInt(e.target.value))}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              >
                                {durationOptions.map((d) => (
                                  <option key={d.value} value={d.value}>
                                    {d.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button 
                              onClick={() => handleRemoveSlot(day, index)} 
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                            >
                              ✕ Remove
                            </button>

                            {index === 0 && (
                              <button 
                                onClick={() => handleAddSlot(day)} 
                                className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition font-medium"
                              >
                                ＋ Add
                              </button>
                            )}

                            {index === 0 && (
                              <div className="relative">
                                <button
                                  onClick={() => setCopyPopup(copyPopup === day ? null : day)}
                                  className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                                >
                                  ⧉ Copy
                                </button>
                                {copyPopup === day && (
                                  <div className="absolute left-0 top-12 z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-72 p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                      Copy to other days
                                    </h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {days.map((d) => (
                                        <label key={d} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                          <input
                                            type="checkbox"
                                            checked={copySelection.includes(d)}
                                            onChange={() => toggleDaySelection(d)}
                                            className="mr-3 w-4 h-4 rounded border-gray-300"
                                          />
                                          <span className="text-gray-700 font-medium">{d}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => handleApplyCopy(day)}
                                      className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          Unavailable{" "}
                          <button onClick={() => handleAddSlot(day)} className="text-yellow-600 hover:underline font-medium">
                            ＋ Add Slot
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleSave}
            className="w-full mt-8 btn-primary py-3 text-lg font-semibold"
          >
            Save Weekly Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
