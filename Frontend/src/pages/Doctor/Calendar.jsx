import React, { useState, useEffect } from "react";
import API from "../util/api";
import { useSelector } from "react-redux";

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
    setAvailability({
      ...availability,
      [day]: [...slots, { start: "9:00am", end: "5:00pm", duration: durations[day] }],
    });
  };

  const handleChange = (day, index, field, value) => {
    const newSlots = [...availability[day]];
    newSlots[index][field] = value;
    setAvailability({ ...availability, [day]: newSlots });
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
      updatedAvailability[targetDay] = [...availability[sourceDay]];
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
      alert("Availability saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving availability");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Set Weekly Availability</h1>
        <div className="space-y-5">
          {days.map((day) => {
            const slots = availability[day] || [];
            const interval = durations[day] || 30;
            const timeOptions = generateTimes(interval);

            return (
              <div key={day} className="flex items-start bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition">
                <div className="w-28 text-gray-700 font-semibold text-lg">{day}</div>
                <div className="flex-1 space-y-3">
                  {slots.length > 0 ? (
                    slots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-4 text-base">
                        {/* ✅ Start Time Dropdown */}
                        <select
                          value={slot.start}
                          onChange={(e) => handleChange(day, index, "start", e.target.value)}
                          className="border rounded-lg px-2 h-10 text-base w-36 focus:ring-2 focus:ring-blue-400"
                        >
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>

                        <span className="text-gray-500">–</span>

                        {/* ✅ End Time Dropdown */}
                        <select
                          value={slot.end}
                          onChange={(e) => handleChange(day, index, "end", e.target.value)}
                          className="border rounded-lg px-2 h-10 text-base w-36 focus:ring-2 focus:ring-blue-400"
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
                            className="border rounded-lg px-2 h-10 text-base w-28 focus:ring-2 focus:ring-blue-400"
                          >
                            {durationOptions.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        )}

                        <button onClick={() => handleRemoveSlot(day, index)} className="text-red-500 hover:text-red-700 text-xl">
                          ✕
                        </button>
                        {index === 0 && (
                          <button onClick={() => handleAddSlot(day)} className="text-green-500 hover:text-green-700 text-xl">
                            ＋
                          </button>
                        )}
                        {index === 0 && (
                          <div className="relative">
                            <button
                              onClick={() => setCopyPopup(copyPopup === day ? null : day)}
                              className="ml-2 text-blue-500 hover:text-blue-700 text-xl"
                            >
                              ⧉
                            </button>
                            {copyPopup === day && (
                              <div className="absolute left-8 top-0 z-10 bg-white border rounded-xl shadow-lg w-60 p-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                  COPY TIMES TO…
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {days.map((d) => (
                                    <label key={d} className="flex items-center text-base cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={copySelection.includes(d)}
                                        onChange={() => toggleDaySelection(d)}
                                        className="mr-2"
                                      />
                                      {d}
                                    </label>
                                  ))}
                                </div>
                                <button
                                  onClick={() => handleApplyCopy(day)}
                                  className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white text-base font-semibold py-2 rounded-lg transition"
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
                    <p className="text-base text-gray-400">
                      Unavailable{" "}
                      <button onClick={() => handleAddSlot(day)} className="text-blue-500 hover:underline ml-2">
                        ＋ Add
                      </button>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={handleSave}
          className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold"
        >
          Save Weekly Schedule
        </button>
      </div>
    </div>
  );
}
